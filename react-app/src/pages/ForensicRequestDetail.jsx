import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDisplayDateTime } from '../utils/datetime';
import { hasAnyRole, hasRole, isForensicAdmin } from '../utils/permissions';
import { useAuth } from '../contexts/AuthContext';

const STATUS_META = {
  submitted:    { label: 'Pending AD Review',    sub: 'Received in Lab',     color: '#e5a100', bg: '#fef3c7', icon: '⏳' },
  assigned:     { label: 'Assigned to FO',       sub: 'Allocated to Officer',color: '#2563eb', bg: '#dbeafe', icon: '👤' },
  in_progress:  { label: 'Lab Examination',      sub: 'Analysis in Progress',color: '#7c3aed', bg: '#ede9fe', icon: '🔬' },
  report_ready: { label: 'Report Ready',         sub: 'Awaiting EO Handover',color: '#059669', bg: '#d1fae5', icon: '✅' },
  handed_over:  { label: 'Handed Over to EO',    sub: 'Custody Completed',   color: '#64748b', bg: '#f1f5f9', icon: '📤' },
};

export default function ForensicRequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [row, setRow] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [assignPriority, setAssignPriority] = useState('normal');
  const [remarks, setRemarks] = useState('');
  const [handoverRemarks, setHandoverRemarks] = useState('');

  // FO findings state
  const [findings, setFindings] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [reportFile, setReportFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const isAdmin = isForensicAdmin(user);
  const isAd    = hasAnyRole(user, ['ad_forensic', 'admin_forensic']);
  const isDesk  = hasAnyRole(user, ['desk_forensic', 'admin_forensic', 'ad_forensic']);
  const isFo    = hasRole(user, 'forensic_team') || hasRole(user, 'admin_forensic');

  const load = () => {
    setLoading(true);
    setErr('');
    api.get(`/forensic/requests/${id}`)
      .then(r => {
        const d = r.data.data;
        setRow(d);
        setFindings(d.findings || '');
        setLabNotes(d.lab_notes || '');
        setAssignPriority(d.priority || 'normal');
        if (d.report_code && d.status === 'in_progress') {
          setMsg(`Report code generated: ${d.report_code}. Enquiry Officer can collect physical report with this code.`);
        }
      })
      .catch(e => setErr(e.response?.data?.message || 'Failed to load request details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (isAd) {
      api.get('/forensic/team-officers')
        .then(r => setOfficers(r.data.data || []))
        .catch(() => {});
    }
  }, [isAd]);

  const assign = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await api.post(`/forensic/requests/${id}/assign`, {
        assigned_to: Number(assignedTo),
        remarks: remarks || undefined,
        priority: assignPriority || 'normal',
      });
      setRow(r.data.data);
      setMsg(r.data.message);
    } catch (e) {
      setErr(e.response?.data?.message || 'Assignment failed');
    } finally {
      setBusy(false);
    }
  };

  const saveFindings = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const fd = new FormData();
      if (findings) fd.append('findings', findings);
      if (labNotes) fd.append('lab_notes', labNotes);
      if (reportFile) fd.append('report_file', reportFile);

      const r = await api.post(`/forensic/requests/${id}/findings`, fd);
      setRow(r.data.data);
      setMsg(r.data.message);
      setReportFile(null);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save findings');
    } finally {
      setBusy(false);
    }
  };

  const markReady = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const fd = new FormData();
      if (findings) fd.append('findings', findings);
      if (labNotes) fd.append('lab_notes', labNotes);
      if (reportFile) fd.append('report_file', reportFile);

      const r = await api.post(`/forensic/requests/${id}/mark-ready`, fd);
      setRow(r.data.data);
      setMsg(r.data.message);
      setReportFile(null);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to mark report ready');
    } finally {
      setBusy(false);
    }
  };

  const handOver = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await api.post(`/forensic/requests/${id}/hand-over`, {
        handover_remarks: handoverRemarks || undefined,
      });
      setRow(r.data.data);
      setMsg(r.data.message);
    } catch (e) {
      setErr(e.response?.data?.message || 'Handover failed');
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="page-content"><LoadingSkeleton type="form" /></div>;
  if (err && !row) return <div className="page-content"><div style={{ color: '#e53e3e', padding: 30, textAlign: 'center' }}>⚠️ {err}</div></div>;
  if (!row) return null;

  const canAssign = isAd && (row.status === 'submitted' || isAdmin) && row.destination === 'forensic';
  const canWorkFindings = isFo && ['assigned', 'in_progress', 'report_ready'].includes(row.status)
    && ((Number(row.assigned_to) === Number(user?.id)) || isAdmin);
  const canMarkReady = isFo && ['assigned', 'in_progress'].includes(row.status)
    && ((Number(row.assigned_to) === Number(user?.id)) || isAdmin);
  const canHandOver = isDesk && row.status === 'report_ready';

  const sm = STATUS_META[row.status] || { label: row.status, color: '#64748b', bg: '#f1f5f9' };
  const circleName = row.submitter?.circle?.name || row.enquiry?.complaint?.circle?.name || 'Headquarters / Main';
  const zoneName = row.enquiry?.complaint?.zone?.name || 'NCCIA';
  const caseRef = row.enquiry?.enquiry_number
    ? `Enquiry #${row.enquiry.enquiry_number}`
    : (row.caseFile?.fir_no ? `FIR #${row.caseFile.fir_no}` : 'Direct Case Seizure');

  const accusedList = row.enquiry?.accused_persons || [];
  const complainantName = row.enquiry?.complaint?.complainant_name;

  return (
    <div className="page-content" id="forensicPrintArea">

      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-title-group">
          <div className="page-label">
            <Link to="/forensic/requests" style={{ color: 'inherit', textDecoration: 'none' }}>
              ← Forensic Seizure Register
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{row.request_no}</h1>
            <span style={{
              fontSize: 12, fontWeight: 700, background: sm.bg, color: sm.color,
              padding: '4px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span>{sm.icon}</span> {sm.label}
            </span>
            {row.priority === 'urgent' && (
              <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 6, fontWeight: 800 }}>
                ⚡ URGENT PRIORITY
              </span>
            )}
          </div>
          <p className="page-subtitle">
            Seizure Evidence Provenance &amp; Forensic Chain of Custody Record
          </p>
          <div className="title-underline"></div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Lab Slip
          </button>
          <Link to="/forensic" className="btn btn-outline">
            Dashboard
          </Link>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', marginBottom: 16, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', borderRadius: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✅ {msg}</span>
          <button type="button" onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {err && (
        <div style={{ padding: '12px 18px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {err}</span>
          <button type="button" onClick={() => setErr('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* ── Report Code Highlight Banner ── */}
      {row.report_code && (
        <div style={{
          padding: '18px 24px', marginBottom: 20, borderRadius: 14,
          background: 'linear-gradient(135deg, #065f46 0%, #0081a7 100%)', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
          boxShadow: '0 8px 24px rgba(6,95,70,0.22)',
        }}>
          <div>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>
              Official Forensic Report Tracking Code
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 1.5, marginTop: 2, fontFamily: 'monospace' }}>
              {row.report_code}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
              Enquiry Officer presents this code at Forensic Desk for physical report collection.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#a7f3d0' }}>
              {row.status === 'handed_over' ? 'Handed to EO' : row.status === 'report_ready' ? 'Ready for Handover' : 'In Analysis'}
            </div>
          </div>
        </div>
      )}

      {/* ── Provenance Cards: Kis Nay Kiya & Kahan Say Bheja ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>

        {/* Card 1: Kis Nay Seize Kiya (Seizing Officer) */}
        <div className="card">
          <div className="card-header" style={{ padding: '12px 18px', background: '#f8fafc' }}>
            <div className="card-title" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
              <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              Kis nay Seize kiya (Seizing Officer)
            </div>
            <span style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
              Officer Profile
            </span>
          </div>

          <div className="card-body" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #0097a7, #015C94)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800,
              }}>
                {(row.submitter?.name || 'EO')[0]}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  {row.submitter?.name || 'Enquiry Officer'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {row.submitter?.designation || 'Investigation / Enquiry Officer'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Circle / Station</span>
                <strong style={{ color: '#0f172a' }}>{circleName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Zone</span>
                <strong style={{ color: '#0f172a' }}>{zoneName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Email</span>
                <span style={{ color: '#334155' }}>{row.submitter?.email || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Seizure Submitted</span>
                <strong style={{ color: '#0f172a' }}>{row.created_at ? formatDisplayDateTime(row.created_at) : '—'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Kahan Say Bheja (Origin & Case Reference) */}
        <div className="card">
          <div className="card-header" style={{ padding: '12px 18px', background: '#f8fafc' }}>
            <div className="card-title" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
              <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              Kahan say Bheja (Case &amp; Origin Provenance)
            </div>
            <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
              {caseRef}
            </span>
          </div>

          <div className="card-body" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 12 }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Case Reference</span>
                <strong style={{ color: '#015C94', fontSize: 13 }}>{caseRef}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Complainant Name</span>
                <strong style={{ color: '#0f172a' }}>{complainantName || 'Direct Field Seizure'}</strong>
              </div>
            </div>

            {accusedList.length > 0 && (
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: 11.5, marginBottom: 10 }}>
                <span style={{ color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600 }}>Accused Persons Linked:</span>
                {accusedList.map((acc, idx) => (
                  <div key={idx} style={{ color: '#1e293b' }}>
                    • <strong>{acc.name}</strong> {acc.cnic ? `(CNIC: ${acc.cnic})` : ''} {acc.mobile ? `· 📞 ${acc.mobile}` : ''}
                  </div>
                ))}
              </div>
            )}

            {row.attachment_path && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={`/storage/${row.attachment_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  View Attached Seizure Memo / Recovery Memo
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Officer Note / Dispatch Memo ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ padding: '12px 18px' }}>
          <div className="card-title" style={{ fontSize: 13.5, fontWeight: 700 }}>
            <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            Seizure Officer Dispatch Memo &amp; Examination Request
          </div>
        </div>
        <div className="card-body" style={{ padding: '14px 18px' }}>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 13.5, lineHeight: 1.6, color: '#1e293b' }}>
            {row.note || 'No special dispatch memo notes provided.'}
          </div>
        </div>
      </div>

      {/* ── Seized Evidence Inventory Table ("Kya Saman Seize Hua") ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ padding: '14px 18px', background: '#f8fafc' }}>
          <div className="card-title" style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
            <div className="card-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></div>
            Seized Evidence Items &amp; Digital Devices Inventory ({row.items?.length || 0} items)
          </div>
          <span style={{ fontSize: 11, background: '#015C94', color: '#fff', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>
            Physical Vault Items
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', minWidth: 750 }}>
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Category</th>
                  <th style={{ width: 180 }}>Make / Model</th>
                  <th style={{ width: 170 }}>IMEI 1 / IMEI 2</th>
                  <th style={{ width: 140 }}>Serial Number</th>
                  <th style={{ width: 60 }}>Qty</th>
                  <th>Condition / Seized From / Description</th>
                </tr>
              </thead>
              <tbody>
                {(row.items || []).map((it, i) => (
                  <tr key={it.id || i}>
                    <td>
                      <span style={{
                        fontSize: 11.5, fontWeight: 700, background: '#f1f5f9', color: '#334155',
                        padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        {it.item_type === 'phone' ? '📱 Mobile' : it.item_type === 'laptop' ? '💻 Laptop' : it.item_type === 'sim' ? '📶 SIM' : it.item_type === 'storage' ? '💽 Storage' : `📦 ${it.item_type}`}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: 13 }}>{it.make_model || '—'}</strong>
                      {it.storage_capacity && <div style={{ fontSize: 11, color: '#64748b' }}>Cap: {it.storage_capacity}</div>}
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                      {it.imei ? <div>IMEI1: <strong>{it.imei}</strong></div> : '—'}
                      {it.imei2 && <div style={{ color: '#64748b' }}>IMEI2: {it.imei2}</div>}
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>
                      {it.serial_no || '—'}
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>
                      {it.quantity || 1}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {it.condition && (
                        <span style={{ fontSize: 10.5, background: '#e2e8f0', color: '#1e293b', padding: '1px 6px', borderRadius: 4, marginRight: 6, fontWeight: 600 }}>
                          {it.condition}
                        </span>
                      )}
                      {it.seized_from && (
                        <span style={{ fontSize: 10.5, color: '#0097a7', marginRight: 6 }}>
                          From: {it.seized_from}
                        </span>
                      )}
                      <div style={{ color: '#475569', marginTop: 2 }}>{it.description || '—'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Chain of Custody & Laboratory Timeline ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ padding: '12px 18px' }}>
          <div className="card-title" style={{ fontSize: 13.5, fontWeight: 700 }}>
            <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
            Forensic Chain of Custody Audit Trail
          </div>
        </div>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div style={{ borderLeft: '3px solid #0097a7', paddingLeft: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>1. Seized &amp; Dispatched</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{row.submitter?.name || 'EO'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{row.created_at ? formatDisplayDateTime(row.created_at) : '—'}</div>
            </div>

            <div style={{ borderLeft: `3px solid ${row.assigned_at ? '#2563eb' : '#cbd5e1'}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>2. AD Review &amp; Assignment</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: row.assigned_at ? '#0f172a' : '#94a3b8' }}>
                {row.assignee?.name ? `FO: ${row.assignee.name}` : 'Pending Assignment'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{row.assigned_at ? formatDisplayDateTime(row.assigned_at) : '—'}</div>
            </div>

            <div style={{ borderLeft: `3px solid ${row.opened_at ? '#7c3aed' : '#cbd5e1'}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>3. Evidence Extraction</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: row.opened_at ? '#0f172a' : '#94a3b8' }}>
                {row.opened_at ? 'Analysis Active' : 'Waiting for FO'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{row.opened_at ? formatDisplayDateTime(row.opened_at) : '—'}</div>
            </div>

            <div style={{ borderLeft: `3px solid ${row.report_ready_at ? '#059669' : '#cbd5e1'}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>4. Lab Report Finalized</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: row.report_ready_at ? '#059669' : '#94a3b8' }}>
                {row.report_ready_at ? `Code: ${row.report_code}` : 'Pending Report'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{row.report_ready_at ? formatDisplayDateTime(row.report_ready_at) : '—'}</div>
            </div>

            <div style={{ borderLeft: `3px solid ${row.handed_over_at ? '#64748b' : '#cbd5e1'}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>5. Handed Over to EO</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: row.handed_over_at ? '#0f172a' : '#94a3b8' }}>
                {row.handed_over_at ? (row.handedTo?.name || 'Enquiry Officer') : 'In Lab Custody'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{row.handed_over_at ? formatDisplayDateTime(row.handed_over_at) : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Forensic Findings & Lab Reports Display ── */}
      {(row.findings || row.lab_notes || row.report_attachment_path) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header" style={{ padding: '12px 18px', background: '#f0fdf4' }}>
            <div className="card-title" style={{ fontSize: 13.5, fontWeight: 700, color: '#166534' }}>
              <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
              Forensic Officer Examination Findings &amp; Lab Artifacts
            </div>
          </div>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            {row.findings && (
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Recovered Artifacts &amp; Analysis Summary:
                </span>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {row.findings}
                </div>
              </div>
            )}

            {row.lab_notes && (
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Internal Lab / Tool Notes:
                </span>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12.5, lineHeight: 1.5, color: '#475569', whiteSpace: 'pre-wrap' }}>
                  {row.lab_notes}
                </div>
              </div>
            )}

            {row.report_attachment_path && (
              <div>
                <a
                  href={`/storage/${row.report_attachment_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download Signed Lab Report PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Action Box 1: AD Assign FO ── */}
      {canAssign && (
        <div className="card" style={{ marginBottom: 20, border: '1.5px solid #bfdbfe' }}>
          <div className="card-header" style={{ background: '#eff6ff' }}>
            <div className="card-title" style={{ color: '#1e40af' }}>AD Action: Assign Forensic Officer &amp; Scope</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
              <div className="cf-field">
                <label className="cf-label required">Select Forensic Officer</label>
                <select className="cf-input" value={assignedTo} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">— Select FO —</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.designation || 'Examiner'})</option>
                  ))}
                </select>
              </div>

              <div className="cf-field">
                <label className="cf-label">Priority Level</label>
                <select className="cf-input" value={assignPriority} onChange={e => setAssignPriority(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">⚡ Urgent (Court / High Sensitivity)</option>
                </select>
              </div>
            </div>

            <div className="cf-field" style={{ marginBottom: 14 }}>
              <label className="cf-label">Directives &amp; Examination Instructions</label>
              <input
                className="cf-input"
                placeholder="e.g. Please perform physical extraction of WhatsApp chats, CDRs, and deleted media..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            <button type="button" className="btn btn-primary" disabled={busy || !assignedTo} onClick={assign}>
              {busy ? 'Assigning…' : 'Assign & Notify Forensic Officer'}
            </button>
          </div>
        </div>
      )}

      {/* ── Action Box 2: FO Findings & Examination Workbench ── */}
      {canWorkFindings && (
        <div className="card" style={{ marginBottom: 20, border: '1.5px solid #ddd6fe' }}>
          <div className="card-header" style={{ background: '#f5f3ff' }}>
            <div className="card-title" style={{ color: '#6d28d9' }}>Forensic Examiner Workbench: Findings &amp; Report Submission</div>
          </div>
          <div className="card-body">
            <div className="cf-field" style={{ marginBottom: 12 }}>
              <label className="cf-label">Forensic Examination Findings</label>
              <textarea
                className="cf-input"
                rows={4}
                placeholder="Enter extraction results, device hash values, chat logs, call records, financial forensics summary..."
                value={findings}
                onChange={e => setFindings(e.target.value)}
              />
            </div>

            <div className="cf-field" style={{ marginBottom: 12 }}>
              <label className="cf-label">Internal Lab Notes &amp; Tool Logs</label>
              <textarea
                className="cf-input"
                rows={2}
                placeholder="Tools used (UFED, Oxygen, Magnet AXIOM, EnCase, FTK Imager), write blockers..."
                value={labNotes}
                onChange={e => setLabNotes(e.target.value)}
              />
            </div>

            <div className="cf-field" style={{ marginBottom: 16 }}>
              <label className="cf-label">Upload Lab Report PDF / Archive</label>
              <input
                type="file"
                className="cf-input"
                accept=".pdf,.doc,.docx,.zip"
                onChange={e => setReportFile(e.target.files?.[0] || null)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline" disabled={busy} onClick={saveFindings}>
                {busy ? 'Saving…' : 'Save Findings Draft'}
              </button>
              {canMarkReady && (
                <button type="button" className="btn btn-primary" style={{ background: '#059669' }} disabled={busy} onClick={markReady}>
                  {busy ? 'Processing…' : 'Mark Report Ready → Notify Desk Officer'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Action Box 3: Desk Officer Handover ── */}
      {canHandOver && (
        <div className="card" style={{ marginBottom: 20, border: '1.5px solid #a7f3d0' }}>
          <div className="card-header" style={{ background: '#ecfdf5' }}>
            <div className="card-title" style={{ color: '#065f46' }}>Desk Officer: Physical Report &amp; Evidence Handover</div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: '#334155', marginBottom: 10 }}>
              Confirm that the physical signed lab report and sealed evidence bag have been handed over to Enquiry Officer. EO report code is <strong>{row.report_code}</strong>.
            </p>
            <div className="cf-field" style={{ marginBottom: 14 }}>
              <label className="cf-label">Handover Remarks</label>
              <input
                className="cf-input"
                placeholder="e.g. Handed over physical sealed packet to EO with signature on register."
                value={handoverRemarks}
                onChange={e => setHandoverRemarks(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-primary" style={{ background: '#059669' }} disabled={busy} onClick={handOver}>
              {busy ? 'Confirming…' : 'Confirm Custody Handover to EO'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
