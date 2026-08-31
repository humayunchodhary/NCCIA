import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { canCompileAdminReports } from '../utils/adminReports';
import { REPORT_STATUS_LABELS } from '../utils/adminReports';

export default function DsrReports() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dsr-reports').then(r => {
      setList(r.data.data || r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label">Administration</div>
          <h1 className="page-title">Daily Situation Report (DSR)</h1>
          <p className="page-subtitle">ADA compile → Circle Incharge review → Islamabad HQ</p>
          <div className="title-underline"></div>
        </div>
        {canCompileAdminReports(user) && (
          <div className="page-actions">
            <Link to="/dsr-reports/create" className="btn btn-primary">+ New DSR</Link>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Unit</th>
              <th>Circle</th>
              <th>Status</th>
              <th>Compiled By</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No DSR reports yet</td></tr>
            )}
            {list.map(row => (
              <tr key={row.id}>
                <td>{row.report_date}</td>
                <td>{row.unit_name}</td>
                <td>{row.circle?.name || '—'}</td>
                <td><span className="badge">{REPORT_STATUS_LABELS[row.status] || row.status}</span></td>
                <td>{row.compiler?.name || '—'}</td>
                <td><Link to={`/dsr-reports/${row.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
