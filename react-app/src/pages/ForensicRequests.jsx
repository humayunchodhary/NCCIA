import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDisplayDateTime } from '../utils/datetime';
import { hasAnyRole, hasRole } from '../utils/permissions';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABEL = {
  submitted: 'Pending AD',
  assigned: 'Assigned',
  in_progress: 'In progress',
  report_ready: 'Report ready',
  handed_over: 'Handed over',
};

export default function ForensicRequests() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const isAd = hasAnyRole(user, ['ad_forensic', 'admin_forensic']);
  const isDesk = hasRole(user, 'desk_forensic');
  const isFo = hasRole(user, 'forensic_team');

  const load = () => {
    setLoading(true);
    setError('');
    const params = {};
    if (status) params.status = status;
    api.get('/forensic/requests', { params })
      .then(r => setRows(r.data.data?.data || r.data.data || []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const title = isDesk
    ? 'Desk — Ready / Handed reports'
    : isFo && !isAd
      ? 'My forensic assignments'
      : 'Forensic seize requests';

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label">Forensic Lab</div>
          <h1 className="page-title">{title}</h1>
          <div className="title-underline"></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="cf-input" style={{ maxWidth: 220 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button type="button" className="btn btn-outline btn-sm" onClick={load}>Refresh</button>
      </div>

      {loading && <LoadingSkeleton type="table" rows={6} />}
      {error && <div style={{ color: '#e53e3e', marginBottom: 12 }}>{error}</div>}

      {!loading && !error && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Enquiry / Case</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>FO / Code</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: '#888' }}>No requests</td></tr>
                )}
                {rows.map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.request_no}</strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{r.submitter?.name}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {r.enquiry?.enquiry_number || (r.case_file?.fir_no ? `FIR ${r.case_file.fir_no}` : '—')}
                    </td>
                    <td>{r.items?.length || 0}</td>
                    <td><span style={{ fontWeight: 600, color: '#015C94' }}>{STATUS_LABEL[r.status] || r.status}</span></td>
                    <td style={{ fontSize: 12 }}>
                      {r.assignee?.name || '—'}
                      {r.report_code && <div style={{ fontWeight: 700, color: '#0d7a4f' }}>{r.report_code}</div>}
                    </td>
                    <td style={{ fontSize: 12 }}>{r.created_at ? formatDisplayDateTime(r.created_at) : '—'}</td>
                    <td>
                      <Link to={`/forensic/requests/${r.id}`} className="btn btn-outline btn-sm">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
