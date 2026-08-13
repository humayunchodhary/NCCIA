import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { isForensicAdmin, hasRole } from '../utils/permissions';

const ROLE_LABELS = {
  admin_forensic: 'Admin Forensic',
  ad_forensic: 'AD Forensic',
  desk_forensic: 'Desk Forensic',
  forensic_team: 'Forensic Team',
};

export default function ForensicDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reqStats, setReqStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = isForensicAdmin(user);
  const isFo = hasRole(user, 'forensic_team');

  useEffect(() => {
    Promise.all([
      api.get('/forensic/stats'),
      api.get('/forensic/request-stats').catch(() => ({ data: null })),
    ])
      .then(([u, r]) => {
        setStats(u.data);
        setReqStats(r.data);
      })
      .catch(e => setError(e.response?.data?.message || e.message || 'Failed to load forensic dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const role = user?.roles?.[0]?.name || user?.role || 'admin_forensic';
  const roleLabel = ROLE_LABELS[role] || role.replace(/_/g, ' ');

  if (loading) return <div className="page-content"><LoadingSkeleton type="stats" rows={8} /></div>;
  if (error) return <div className="page-content"><div style={{ padding: 40, textAlign: 'center', color: '#e53e3e', fontSize: 14 }}>{error}</div></div>;

  const byRole = stats?.by_role || {};

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label">Forensic Lab</div>
          <h1 className="page-title">Forensic Dashboard</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="title-underline"></div>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg,#0097a7,#015C94)',
        color: '#fff', borderRadius: 14, padding: '24px 28px', marginBottom: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.16)',
            border: '2px solid rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Welcome, <strong>{user?.name?.split(' ')[0] || 'Officer'}</strong></div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Forensic {roleLabel}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Seize → AD review → FO report code → Desk → EO by hand</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/forensic/requests" className="btn" style={{ background: '#fff', color: '#015C94', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Seize Requests
          </Link>
          {isAdmin && (
            <Link to="/forensic/users" className="btn" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.5)' }}>
              Manage Users
            </Link>
          )}
        </div>
      </div>

      {reqStats && (
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 22 }}>
          {[
            ['Pending AD', reqStats.submitted, '/forensic/requests?status=submitted'],
            ['Assigned', reqStats.assigned],
            ['In progress', reqStats.in_progress],
            ['Report ready', reqStats.report_ready],
            ['Handed over', reqStats.handed_over],
            ...(isFo ? [['My queue', reqStats.my_assigned]] : []),
          ].map(([label, value, to]) => (
            <div className="stat-card teal" key={label}>
              <div className="stat-value">{value ?? 0}</div>
              <div className="stat-label">{label}</div>
              {to && <Link to={to} style={{ fontSize: 11, color: '#015C94' }}>Open →</Link>}
            </div>
          ))}
        </div>
      )}

      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        <div className="stat-card teal">
          <div className="stat-value">{stats?.total_users ?? 0}</div>
          <div className="stat-label">Total Forensic Users</div>
        </div>
        {(Object.entries(byRole) || []).map(([key, count]) => (
          <div className="stat-card teal" key={key}>
            <div className="stat-value">{count}</div>
            <div className="stat-label">{ROLE_LABELS[key] || key.replace(/_/g, ' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
