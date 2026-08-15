import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { isForensicAdmin, hasRole, hasAnyRole } from '../utils/permissions';
import { formatDisplayDateTime } from '../utils/datetime';

const ROLE_LABELS = {
  admin_forensic: 'Admin – Forensic Lab',
  ad_forensic:    'Assistant Director (AD) Forensic',
  desk_forensic:  'Forensic Desk & Custody Officer',
  forensic_team:  'Forensic Examiner / Officer',
};

const STATUS_META = {
  submitted:    { label: 'Pending Review',    sub: 'Received from EO',       color: '#e5a100', bg: '#fef3c7', icon: '⏳', stage: 1 },
  assigned:     { label: 'Assigned to FO',    sub: 'Assigned by AD',         color: '#2563eb', bg: '#dbeafe', icon: '👤', stage: 2 },
  in_progress:  { label: 'Lab Examination',   sub: 'Analysis & Extraction',  color: '#7c3aed', bg: '#ede9fe', icon: '🔬', stage: 3 },
  report_ready: { label: 'Report Ready',      sub: 'Awaiting Desk Handover', color: '#059669', bg: '#d1fae5', icon: '✅', stage: 4 },
  handed_over:  { label: 'Handed Over',       sub: 'Delivered to EO',        color: '#64748b', bg: '#f1f5f9', icon: '📤', stage: 5 },
};

const PIPELINE_STEPS = [
  { key: 'submitted',    label: 'Pending AD Review',    desc: 'New seizures from EO' },
  { key: 'assigned',     label: 'Assigned to FO',       desc: 'Allocated to examiner' },
  { key: 'in_progress',  label: 'Lab Analysis',         desc: 'Evidence extraction' },
  { key: 'report_ready', label: 'Report Ready',         desc: 'Desk handover queue' },
  { key: 'handed_over',  label: 'Handed Over',          desc: 'Custody completed' },
];

export default function ForensicDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reqStats, setReqStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('all'); // all, submitted, assigned, in_progress, report_ready, handed_over, urgent, my_queue
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');
  const [teamOfficers, setTeamOfficers] = useState([]);

  // Quick Action Modals
  const [assignModalReq, setAssignModalReq] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assignPriority, setAssignPriority] = useState('normal');

  const [handoverModalReq, setHandoverModalReq] = useState(null);
  const [handoverRemarks, setHandoverRemarks] = useState('');

  const [findingsModalReq, setFindingsModalReq] = useState(null);
  const [examFindings, setExamFindings] = useState('');
  const [examLabNotes, setExamLabNotes] = useState('');
  const [examReportFile, setExamReportFile] = useState(null);

  const [actionBusy, setActionBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');

  const isAdmin = isForensicAdmin(user);
  const isAd    = hasAnyRole(user, ['ad_forensic', 'admin_forensic']);
  const isFo    = hasRole(user, 'forensic_team');
  const isDesk  = hasRole(user, 'desk_forensic');

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/forensic/stats').catch(() => ({ data: {} })),
      api.get('/forensic/request-stats').catch(() => ({ data: null })),
      api.get('/forensic/requests', { params: { per_page: 50 } }).catch(() => ({ data: { data: { data: [] } } })),
      isAd ? api.get('/forensic/team-officers').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([u, r, rq, to]) => {
        setStats(u.data);
        setReqStats(r.data);
        setRequests(rq.data?.data?.data || rq.data?.data || []);
        if (to?.data?.data) {
          setTeamOfficers(to.data.data);
        }
      })
      .catch(e => setError(e.response?.data?.message || e.message || 'Failed to load forensic dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const role = user?.roles?.[0]?.name || user?.role || 'admin_forensic';
  const roleLabel = ROLE_LABELS[role] || role.replace(/_/g, ' ');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Tab filter
      if (activeTab === 'urgent') {
        if (r.priority !== 'urgent' && r.priority !== 'high') return false;
      } else if (activeTab === 'my_queue') {
        if (Number(r.assigned_to) !== Number(user?.id)) return false;
      } else if (activeTab !== 'all') {
        if (r.status !== activeTab) return false;
      }

      // Circle filter
      if (selectedCircle) {
        const cName = r.submitter?.circle?.name || r.enquiry?.complaint?.circle?.name || '';
        if (cName !== selectedCircle) return false;
      }

      // Search query filter (matches request_no, report_code, note, enquiry_number, fir_no, submitter name, items make_model/imei/serial)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchReqNo = r.request_no?.toLowerCase().includes(q);
        const matchCode = r.report_code?.toLowerCase().includes(q);
        const matchNote = r.note?.toLowerCase().includes(q);
        const matchEnquiry = r.enquiry?.enquiry_number?.toLowerCase().includes(q);
        const matchFir = r.case_file?.fir_no?.toLowerCase().includes(q);
        const matchSubmitter = r.submitter?.name?.toLowerCase().includes(q);
        const matchAccused = (r.enquiry?.accused_persons || []).some(a => a.name?.toLowerCase().includes(q));
        const matchItems = (r.items || []).some(it =>
          (it.make_model && it.make_model.toLowerCase().includes(q)) ||
          (it.imei && it.imei.toLowerCase().includes(q)) ||
          (it.serial_no && it.serial_no.toLowerCase().includes(q)) ||
          (it.item_type && it.item_type.toLowerCase().includes(q))
        );
        return matchReqNo || matchCode || matchNote || matchEnquiry || matchFir || matchSubmitter || matchAccused || matchItems;
      }

      return true;
    });
  }, [requests, activeTab, selectedCircle, searchQuery, user?.id]);

  // Total summary
  const totalRequests = reqStats
    ? (reqStats.submitted || 0) + (reqStats.assigned || 0) + (reqStats.in_progress || 0) + (reqStats.report_ready || 0) + (reqStats.handed_over || 0)
    : requests.length;

  const totalDevices = reqStats?.total_devices || requests.reduce((acc, r) => acc + (r.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0), 0);

  // Circles list
  const circlesList = useMemo(() => {
    if (reqStats?.by_circle) return Object.keys(reqStats.by_circle);
    const set = new Set();
    requests.forEach(r => {
      const c = r.submitter?.circle?.name || r.enquiry?.complaint?.circle?.name;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [reqStats, requests]);

  // Handle Quick Actions
  const handleAssignSubmit = async () => {
    if (!assignModalReq || !assigneeId) return;
    setActionBusy(true);
    setActionErr('');
    setActionMsg('');
    try {
      const res = await api.post(`/forensic/requests/${assignModalReq.id}/assign`, {
        assigned_to: Number(assigneeId),
        remarks: assignRemarks || undefined,
        priority: assignPriority || 'normal',
      });
      setActionMsg(res.data?.message || 'Assigned successfully.');
      setAssignModalReq(null);
      setAssigneeId('');
      setAssignRemarks('');
      loadData();
    } catch (e) {
      setActionErr(e.response?.data?.message || 'Assignment failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleFindingsSubmit = async (markReady = false) => {
    if (!findingsModalReq) return;
    setActionBusy(true);
    setActionErr('');
    setActionMsg('');
    try {
      const fd = new FormData();
      if (examFindings) fd.append('findings', examFindings);
      if (examLabNotes) fd.append('lab_notes', examLabNotes);
      if (examReportFile) fd.append('report_file', examReportFile);

      const endpoint = markReady
        ? `/forensic/requests/${findingsModalReq.id}/mark-ready`
        : `/forensic/requests/${findingsModalReq.id}/findings`;

      const res = await api.post(endpoint, fd);
      setActionMsg(res.data?.message || 'Updated successfully.');
      setFindingsModalReq(null);
      setExamFindings('');
      setExamLabNotes('');
      setExamReportFile(null);
      loadData();
    } catch (e) {
      setActionErr(e.response?.data?.message || 'Failed to save findings');
    } finally {
      setActionBusy(false);
    }
  };

  const handleHandoverSubmit = async () => {
    if (!handoverModalReq) return;
    setActionBusy(true);
    setActionErr('');
    setActionMsg('');
    try {
      const res = await api.post(`/forensic/requests/${handoverModalReq.id}/hand-over`, {
        handover_remarks: handoverRemarks || undefined,
      });
      setActionMsg(res.data?.message || 'Handover confirmed.');
      setHandoverModalReq(null);
      setHandoverRemarks('');
      loadData();
    } catch (e) {
      setActionErr(e.response?.data?.message || 'Handover failed');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <LoadingSkeleton type="stats" rows={8} />
        <LoadingSkeleton type="table" rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div style={{ padding: 40, textAlign: 'center', color: '#e53e3e', fontSize: 14 }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">

      {/* ── Page Header & Quick Search ── */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-title-group">
          <div className="page-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
            NCCIA Digital Forensic Lab &amp; Evidence Custody
          </div>
          <h1 className="page-title">Forensic Evidence Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp; Complete Chain of Custody &amp; Seizure Provenance Tracker
          </p>
          <div className="title-underline"></div>
        </div>

        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={loadData} title="Refresh Lab Data">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Refresh
          </button>
          <Link to="/forensic/requests" className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
            Seizure Register
          </Link>
          {isAdmin && (
            <Link to="/forensic/users" className="btn btn-outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Forensic Team
            </Link>
          )}
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '12px 18px', marginBottom: 16, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', borderRadius: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✅ {actionMsg}</span>
          <button type="button" onClick={() => setActionMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {actionErr && (
        <div style={{ padding: '12px 18px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {actionErr}</span>
          <button type="button" onClick={() => setActionErr('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* ── Hero Welcome & Provenance Highlights ── */}
      <div style={{
        background: 'linear-gradient(135deg, #07172c 0%, #084c61 45%, #0081a7 100%)',
        color: '#fff', borderRadius: 16, padding: '22px 26px', marginBottom: 20,
        boxShadow: '0 10px 30px rgba(0,129,167,0.22)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700 }}>
                {roleLabel} · {user?.name || 'Officer'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2, marginBottom: 4 }}>
                Digital Forensic Examination &amp; Seizure Vault
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, maxWidth: 620, lineHeight: 1.4 }}>
                Track what Enquiry Officers seize in the field, analyze digital evidence (Mobiles, Laptops, Storage), generate forensic reports, and ensure an unbroken chain of custody.
              </div>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>{totalRequests}</div>
              <div style={{ fontSize: 10.5, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.8 }}>Seizure Memos</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#4ade80' }}>{totalDevices}</div>
              <div style={{ fontSize: 10.5, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.8 }}>Devices / Items</div>
            </div>
            {reqStats?.urgent_count > 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.25)', padding: '10px 18px', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fca5a5' }}>{reqStats.urgent_count}</div>
                <div style={{ fontSize: 10.5, color: '#fee2e2', textTransform: 'uppercase', letterSpacing: 0.8 }}>⚡ Urgent Priority</div>
              </div>
            )}
            {isFo && (
              <div style={{ background: 'rgba(168, 85, 247, 0.25)', padding: '10px 18px', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#e9d5ff' }}>{reqStats?.my_assigned || 0}</div>
                <div style={{ fontSize: 10.5, color: '#f3e8ff', textTransform: 'uppercase', letterSpacing: 0.8 }}>My Assigned Queue</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Interactive 5-Stage Pipeline KPI Cards ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            🔬 Forensic Examination Pipeline &amp; Chain of Custody Stages
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Click stage card to filter requests</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {PIPELINE_STEPS.map(({ key, label, desc }) => {
            const meta = STATUS_META[key] || {};
            const count = reqStats ? (reqStats[key] || 0) : requests.filter(r => r.status === key).length;
            const pct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
            const isActive = activeTab === key;

            return (
              <div
                key={key}
                onClick={() => setActiveTab(isActive ? 'all' : key)}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: isActive ? `2.5px solid ${meta.color}` : '1px solid #e2e8f0',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  boxShadow: isActive ? `0 6px 20px ${meta.color}25` : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: meta.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {meta.icon}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color,
                    borderRadius: 20, padding: '2px 8px',
                  }}>
                    {pct}%
                  </span>
                </div>

                <div style={{ fontSize: 28, fontWeight: 800, color: meta.color, lineHeight: 1.1, marginBottom: 2 }}>
                  {count}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  {label}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, marginBottom: 10 }}>
                  {desc}
                </div>

                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: 4, width: `${pct}%`, background: meta.color, borderRadius: 4 }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Devices Breakdown & Origin Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 22 }}>

        {/* Seized Device Inventory Breakdown */}
        <div className="card">
          <div className="card-header" style={{ padding: '14px 18px' }}>
            <div className="card-title" style={{ fontSize: 14, fontWeight: 700 }}>
              <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></div>
              Seized Devices &amp; Evidence Categories
            </div>
            <span style={{ fontSize: 11.5, color: '#015C94', fontWeight: 600 }}>
              Total: {totalDevices} Units Seized
            </span>
          </div>

          <div className="card-body" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 4 }}>
                  <span>📱</span> Mobile Phones
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {reqStats?.devices_by_type?.phone || 0}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Smartphones &amp; IMEIs</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 4 }}>
                  <span>💻</span> Laptops &amp; PCs
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {reqStats?.devices_by_type?.laptop || 0}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Computers &amp; Servers</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 4 }}>
                  <span>💽</span> Hard Drives / SSDs
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {reqStats?.devices_by_type?.storage || 0}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>External Storage &amp; Drives</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 4 }}>
                  <span>📶</span> SIMs &amp; Flash Drives
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {reqStats?.devices_by_type?.sim || 0}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>USBs &amp; Cellular Cards</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 4 }}>
                  <span>📄</span> Documents &amp; Reports
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {reqStats?.devices_by_type?.documents || 0}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Seizure memos &amp; slips</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 4 }}>
                  <span>📦</span> Other Items
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {reqStats?.devices_by_type?.other || 0}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Misc. Hardware &amp; Paraphernalia</div>
              </div>
            </div>

            <div style={{ fontSize: 11.5, color: '#64748b', background: '#f1f5f9', padding: '8px 12px', borderRadius: 8 }}>
              💡 All seized devices are sealed with evidence tags upon arrival. Forensic Officers record device serials and IMEIs during acquisition.
            </div>
          </div>
        </div>

        {/* Origin by Circle / Field Office */}
        <div className="card">
          <div className="card-header" style={{ padding: '14px 18px' }}>
            <div className="card-title" style={{ fontSize: 14, fontWeight: 700 }}>
              <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              Seizures by Circle (Origin)
            </div>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Incoming Field Stations</span>
          </div>

          <div className="card-body" style={{ padding: '14px 18px' }}>
            {reqStats?.by_circle && Object.keys(reqStats.by_circle).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(reqStats.by_circle).slice(0, 5).map(([cName, count]) => {
                  const cPct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
                  return (
                    <div key={cName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: '#1e293b', fontWeight: 600 }}>{cName}</span>
                        <span style={{ color: '#015C94', fontWeight: 700 }}>{count} requests ({cPct}%)</span>
                      </div>
                      <div style={{ height: 5, background: '#f1f5f9', borderRadius: 4 }}>
                        <div style={{ height: 5, width: `${cPct}%`, background: 'linear-gradient(90deg, #0097a7, #015C94)', borderRadius: 4 }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>
                🏢 Seizures received across NCCIA Circles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Seizure Provenance & Requests Ledger ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ padding: '14px 18px', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="card-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Seizure Evidence Ledger &amp; Provenance</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Complete origin, seizing officer, device details &amp; forensic status</div>
            </div>
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="cf-input"
              style={{ minWidth: 240, height: 34, fontSize: 12 }}
              placeholder="🔍 Search IMEI, Serial, Enquiry #, Officer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            {circlesList.length > 0 && (
              <select
                className="cf-input"
                style={{ width: 'auto', height: 34, fontSize: 12 }}
                value={selectedCircle}
                onChange={e => setSelectedCircle(e.target.value)}
              >
                <option value="">All Circles</option>
                {circlesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {[
            { key: 'all',          label: `All (${requests.length})` },
            { key: 'submitted',    label: `Pending Review (${reqStats?.submitted || 0})` },
            { key: 'assigned',     label: `Assigned FO (${reqStats?.assigned || 0})` },
            { key: 'in_progress',  label: `In Analysis (${reqStats?.in_progress || 0})` },
            { key: 'report_ready', label: `Report Ready (${reqStats?.report_ready || 0})` },
            { key: 'handed_over',  label: `Handed Over (${reqStats?.handed_over || 0})` },
            ...(reqStats?.urgent_count > 0 ? [{ key: 'urgent', label: `⚡ Urgent (${reqStats.urgent_count})` }] : []),
            ...(isFo ? [{ key: 'my_queue', label: `👤 My Assignments (${reqStats?.my_assigned || 0})` }] : []),
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#015C94' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#475569',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Body */}
        <div className="card-body" style={{ padding: 0 }}>
          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No seizure requests match your criteria</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Try clearing search queries or switching filter tabs.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ width: 140 }}>Request / Priority</th>
                    <th style={{ width: 180 }}>Kis nay Seize kiya (Officer)</th>
                    <th style={{ width: 180 }}>Kahan say Bheja (Origin)</th>
                    <th>Seized Items &amp; Devices</th>
                    <th style={{ width: 150 }}>Forensic Status / FO</th>
                    <th style={{ width: 120 }}>Date Seized</th>
                    <th style={{ width: 120, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(r => {
                    const sm = STATUS_META[r.status] || { label: r.status, color: '#64748b', bg: '#f1f5f9' };
                    const items = r.items || [];
                    const itemCount = items.reduce((s, it) => s + (it.quantity || 1), 0);
                    const circleName = r.submitter?.circle?.name || r.enquiry?.complaint?.circle?.name || 'NCCIA Circle';
                    const caseRef = r.enquiry?.enquiry_number ? `Enquiry ${r.enquiry.enquiry_number}` : (r.case_file?.fir_no ? `FIR ${r.case_file.fir_no}` : 'Case Seizure');

                    return (
                      <tr key={r.id} style={{ transition: 'background 0.15s' }}>
                        {/* Request No & Priority */}
                        <td>
                          <div style={{ fontWeight: 800, color: '#015C94', fontSize: 13 }}>
                            {r.request_no}
                          </div>
                          {r.priority === 'urgent' && (
                            <span style={{ fontSize: 10, background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                              ⚡ URGENT
                            </span>
                          )}
                          {r.priority === 'high' && (
                            <span style={{ fontSize: 10, background: '#ffedd5', color: '#c2410c', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                              🔥 HIGH
                            </span>
                          )}
                        </td>

                        {/* Kis nay Seize kiya */}
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                            {r.submitter?.name || 'Enquiry Officer'}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {r.submitter?.designation || 'EO / IO'} · {circleName}
                          </div>
                        </td>

                        {/* Kahan say Bheja */}
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 12.5 }}>
                            {caseRef}
                          </div>
                          {r.enquiry?.complaint?.complainant_name && (
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              Comp: {r.enquiry.complaint.complainant_name}
                            </div>
                          )}
                          <div style={{ fontSize: 10.5, color: '#0097a7', fontWeight: 600 }}>
                            📍 {circleName}
                          </div>
                        </td>

                        {/* Seized Items & Devices */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 6 }}>
                              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                            </span>
                            {items.slice(0, 2).map((it, idx) => (
                              <span key={idx} style={{ fontSize: 11, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: 4, color: '#334155' }}>
                                {it.item_type === 'phone' ? '📱' : it.item_type === 'laptop' ? '💻' : '📦'} {it.make_model || it.item_type}
                                {it.imei ? ` (${it.imei.slice(-6)})` : ''}
                              </span>
                            ))}
                            {items.length > 2 && (
                              <span style={{ fontSize: 10, color: '#64748b' }}>+{items.length - 2} more</span>
                            )}
                          </div>
                          {r.note && (
                            <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
                              {r.note}
                            </div>
                          )}
                        </td>

                        {/* Forensic Status / Assigned FO / Code */}
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 700, background: sm.bg, color: sm.color,
                            padding: '3px 8px', borderRadius: 20, marginBottom: 3,
                          }}>
                            <span>{sm.icon}</span> {sm.label}
                          </span>
                          {r.assignee?.name && (
                            <div style={{ fontSize: 11, color: '#475569' }}>
                              FO: <strong>{r.assignee.name.split(' ')[0]}</strong>
                            </div>
                          )}
                          {r.report_code && (
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: 0.5 }}>
                              Code: {r.report_code}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ fontSize: 11.5, color: '#64748b' }}>
                          {r.created_at ? formatDisplayDateTime(r.created_at) : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <Link to={`/forensic/requests/${r.id}`} className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: 11 }}>
                              Open
                            </Link>

                            {/* Quick AD Assign */}
                            {isAd && r.status === 'submitted' && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11, background: '#2563eb' }}
                                onClick={() => {
                                  setAssignModalReq(r);
                                  setAssigneeId('');
                                  setAssignRemarks('');
                                  setAssignPriority(r.priority || 'normal');
                                }}
                              >
                                Assign
                              </button>
                            )}

                            {/* Quick FO Work / Findings */}
                            {isFo && ['assigned', 'in_progress'].includes(r.status) && (Number(r.assigned_to) === Number(user?.id) || isAdmin) && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11, background: '#7c3aed' }}
                                onClick={() => {
                                  setFindingsModalReq(r);
                                  setExamFindings(r.findings || '');
                                  setExamLabNotes(r.lab_notes || '');
                                }}
                              >
                                Report
                              </button>
                            )}

                            {/* Quick Desk Handover */}
                            {isDesk && r.status === 'report_ready' && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: 11, background: '#059669' }}
                                onClick={() => {
                                  setHandoverModalReq(r);
                                  setHandoverRemarks('');
                                }}
                              >
                                Handover
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: AD Assign Forensic Officer ── */}
      {assignModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 500, width: '100%', padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Assign Evidence to Forensic Officer
                </h2>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Request: <strong>{assignModalReq.request_no}</strong> · {assignModalReq.items?.length || 0} items
                </div>
              </div>
              <button type="button" onClick={() => setAssignModalReq(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="cf-field">
                <label className="cf-label required">Select Forensic Examiner / Officer</label>
                <select className="cf-input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">— Select Forensic Officer —</option>
                  {teamOfficers.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.designation || 'Examiner'})</option>
                  ))}
                </select>
              </div>

              <div className="cf-field">
                <label className="cf-label">Examination Priority</label>
                <select className="cf-input" value={assignPriority} onChange={e => setAssignPriority(e.target.value)}>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">⚡ Urgent Priority (Court / Sensitive)</option>
                </select>
              </div>

              <div className="cf-field">
                <label className="cf-label">AD Directives &amp; Examination Scope</label>
                <textarea
                  className="cf-input"
                  rows={3}
                  placeholder="e.g. Please perform physical extraction of WhatsApp chats, CDRs, and deleted media..."
                  value={assignRemarks}
                  onChange={e => setAssignRemarks(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="button" className="btn btn-outline" onClick={() => setAssignModalReq(null)} disabled={actionBusy}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAssignSubmit} disabled={actionBusy || !assigneeId}>
                {actionBusy ? 'Assigning…' : 'Confirm Assignment & Notify FO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: FO Examination Findings & Report Ready ── */}
      {findingsModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 620, width: '100%', padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Forensic Examination Findings &amp; Report
                </h2>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Evidence: <strong>{findingsModalReq.request_no}</strong> {findingsModalReq.report_code ? `· Code: ${findingsModalReq.report_code}` : ''}
                </div>
              </div>
              <button type="button" onClick={() => setFindingsModalReq(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="cf-field">
                <label className="cf-label">Key Forensic Findings &amp; Artifacts Recovered</label>
                <textarea
                  className="cf-input"
                  rows={4}
                  placeholder="Record extraction summary, hashes (MD5/SHA256), recovered chats, location data, or forensic conclusions..."
                  value={examFindings}
                  onChange={e => setExamFindings(e.target.value)}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Internal Lab Notes &amp; Tool Logs</label>
                <textarea
                  className="cf-input"
                  rows={2}
                  placeholder="Tools used (e.g. Cellebrite UFED, Magnet AXIOM, EnCase, FTK), write-blockers used..."
                  value={examLabNotes}
                  onChange={e => setExamLabNotes(e.target.value)}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Upload Lab Report PDF / Evidence Archive (Optional)</label>
                <input
                  type="file"
                  className="cf-input"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={e => setExamReportFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => setFindingsModalReq(null)} disabled={actionBusy}>Cancel</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => handleFindingsSubmit(false)} disabled={actionBusy}>
                  {actionBusy ? 'Saving…' : 'Save Findings Draft'}
                </button>
                <button type="button" className="btn btn-primary" style={{ background: '#059669' }} onClick={() => handleFindingsSubmit(true)} disabled={actionBusy}>
                  {actionBusy ? 'Processing…' : 'Mark Report Ready → Notify Desk'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Desk Handover to EO ── */}
      {handoverModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Confirm Handover to Enquiry Officer
                </h2>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Report Code: <strong style={{ color: '#059669' }}>{handoverModalReq.report_code}</strong>
                </div>
              </div>
              <button type="button" onClick={() => setHandoverModalReq(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 12.5, lineHeight: 1.5 }}>
              <div><strong>Recipient Officer:</strong> {handoverModalReq.submitter?.name || 'Enquiry Officer'}</div>
              <div><strong>Source Case:</strong> {handoverModalReq.enquiry?.enquiry_number ? `Enquiry ${handoverModalReq.enquiry.enquiry_number}` : (handoverModalReq.case_file?.fir_no ? `FIR ${handoverModalReq.case_file.fir_no}` : 'Case')}</div>
              <div><strong>Items:</strong> {handoverModalReq.items?.length || 0} Devices / Evidence Packs</div>
            </div>

            <div className="cf-field">
              <label className="cf-label">Handover Remarks &amp; Physical Seal Verification</label>
              <input
                className="cf-input"
                placeholder="e.g. Physical report and intact sealed evidence bag handed over to EO."
                value={handoverRemarks}
                onChange={e => setHandoverRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="button" className="btn btn-outline" onClick={() => setHandoverModalReq(null)} disabled={actionBusy}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ background: '#059669' }} onClick={handleHandoverSubmit} disabled={actionBusy}>
                {actionBusy ? 'Confirming…' : 'Confirm Custody Handover'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
