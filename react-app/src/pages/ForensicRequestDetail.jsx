import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDisplayDateTime } from '../utils/datetime';
import { hasAnyRole, hasRole } from '../utils/permissions';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABEL = {
  submitted: 'Pending AD review',
  assigned: 'Assigned to FO',
  in_progress: 'FO working',
  report_ready: 'Report ready — Desk',
  handed_over: 'Handed over to EO',
};

export default function ForensicRequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [row, setRow] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [handoverRemarks, setHandoverRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const isAd = hasAnyRole(user, ['ad_forensic', 'admin_forensic']);
  const isDesk = hasAnyRole(user, ['desk_forensic', 'admin_forensic', 'ad_forensic']);
  const isFo = hasRole(user, 'forensic_team') || hasRole(user, 'admin_forensic');

  const load = () => {
    setLoading(true);
    setErr('');
    api.get(`/forensic/requests/${id}`)
      .then(r => {
        const d = r.data.data;
        setRow(d);
        if (d.report_code && d.status === 'in_progress') {
          setMsg(`Report code generated: ${d.report_code}. EO will collect physical report with this code.`);
        }
      })
      .catch(e => setErr(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

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
      });
      setRow(r.data.data);
      setMsg(r.data.message);
    } catch (e) {
      setErr(e.response?.data?.message || 'Assign failed');
    } finally {
      setBusy(false);
    }
  };

  const markReady = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await api.post(`/forensic/requests/${id}/mark-ready`);
      setRow(r.data.data);
      setMsg(r.data.message);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed');
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

  if (loading) return <div className="page-content"><LoadingSkeleton type="form" /></div>;
  if (err && !row) return <div className="page-content"><div style={{ color: '#e53e3e' }}>{err}</div></div>;
  if (!row) return null;

  const canAssign = isAd && row.status === 'submitted' && row.destination === 'forensic';
  const canMarkReady = isFo && ['assigned', 'in_progress'].includes(row.status)
    && ((Number(row.assigned_to) === Number(user?.id)) || hasRole(user, 'admin_forensic'));
  const canHandOver = isDesk && row.status === 'report_ready';

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label"><Link to="/forensic/requests" style={{ color: 'inherit' }}>← Requests</Link></div>
          <h1 className="page-title">{row.request_no}</h1>
          <p className="page-subtitle">{STATUS_LABEL[row.status] || row.status}</p>
          <div className="title-underline"></div>
        </div>
      </div>

      {msg && <div style={{ padding: 12, marginBottom: 14, background: '#e6f7ef', color: '#0d7a4f', borderRadius: 8, fontWeight: 600 }}>{msg}</div>}
      {err && <div style={{ padding: 12, marginBottom: 14, background: '#fde8e8', color: '#e53e3e', borderRadius: 8 }}>{err}</div>}

      {row.report_code && (
        <div style={{
          padding: '18px 22px', marginBottom: 16, borderRadius: 12,
          background: 'linear-gradient(135deg,#0097a7,#015C94)', color: '#fff',
        }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Auto-generated report code</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>{row.report_code}</div>
          <div style={{ fontSize: 12, marginTop: 6, opacity: 0.9 }}>EO collects physical report by hand using this code</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, fontSize: 13 }}>
            <div><div style={{ color: '#64748b', fontSize: 11 }}>Submitted by</div><strong>{row.submitter?.name || '—'}</strong></div>
            <div><div style={{ color: '#64748b', fontSize: 11 }}>Enquiry</div><strong>{row.enquiry?.enquiry_number || '—'}</strong></div>
            <div><div style={{ color: '#64748b', fontSize: 11 }}>Destination</div><strong>{row.destination}</strong></div>
            <div><div style={{ color: '#64748b', fontSize: 11 }}>FO</div><strong>{row.assignee?.name || '—'}</strong></div>
            <div><div style={{ color: '#64748b', fontSize: 11 }}>Submitted at</div><strong>{row.created_at ? formatDisplayDateTime(row.created_at) : '—'}</strong></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Concerned officer note</div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5 }}>{row.note}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Seized items</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Type</th><th>Make / Model</th><th>IMEI</th><th>Serial</th><th>Qty</th><th>Description</th>
              </tr>
            </thead>
            <tbody>
              {(row.items || []).map(it => (
                <tr key={it.id}>
                  <td>{it.item_type}</td>
                  <td>{it.make_model || '—'}</td>
                  <td>{it.imei || '—'}</td>
                  <td>{it.serial_no || '—'}</td>
                  <td>{it.quantity}</td>
                  <td>{it.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canAssign && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">AD — Assign Forensic Officer</div></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="cf-field">
                <label className="cf-label">Forensic Officer</label>
                <select className="cf-input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                  <option value="">— Select FO —</option>
                  {officers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="cf-field">
                <label className="cf-label">Remarks (optional)</label>
                <input className="cf-input" value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            </div>
            <button type="button" className="btn btn-primary" disabled={busy || !assignedTo} onClick={assign}>
              Assign &amp; notify FO
            </button>
          </div>
        </div>
      )}

      {canMarkReady && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">FO — Mark physical report ready</div></div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              When the lab report is ready in the room, mark ready. Desk officer will be notified to collect and hand to EO.
            </p>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={markReady}>
              Mark report ready → notify Desk
            </button>
          </div>
        </div>
      )}

      {canHandOver && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">Desk — Hand over to EO (by hand)</div></div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              Collect report from lab room. When EO comes, hand over and confirm below. EO is notified with code <strong>{row.report_code}</strong>.
            </p>
            <div className="cf-field" style={{ marginBottom: 12 }}>
              <label className="cf-label">Handover remarks</label>
              <input className="cf-input" value={handoverRemarks} onChange={e => setHandoverRemarks(e.target.value)} placeholder="Optional" />
            </div>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={handOver}>
              Confirm handed to EO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
