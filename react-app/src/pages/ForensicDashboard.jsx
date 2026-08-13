import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { isForensicAdmin } from '../utils/permissions';

const ROLE_LABELS = {
  admin_forensic: 'Admin Forensic',
  ad_forensic: 'AD Forensic',
  desk_forensic: 'Desk Forensic',
  forensic_team: 'Forensic Team',
};

export default function ForensicDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = isForensicAdmin(user);

  useEffect(() => {
    api.get('/forensic/stats')
      .then(r => setStats(r.data))
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
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>NCCIA Digital Forensic Laboratory — isolated forensic workspace</div>
          </div>
        </div>
        {isAdmin && (
          <Link to="/forensic/users" className="btn" style={{ background: '#fff', color: '#015C94', fontWeight: 700, whiteSpace: 'nowrap' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: 'middle' }}><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            Manage Forensic Users
          </Link>
        )}
      </div>

      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: 'rgba(0,188,212,0.14)', color: '#0097a7' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div className="stat-label">Total Forensic Users</div>
              <div className="stat-value">{stats?.total_users ?? 0}</div>
            </div>
          </div>
        </div>
        {(Object.entries(byRole) || []).map(([key, count]) => (
          <div className="stat-card" key={key}>
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: 'rgba(0,188,212,0.14)', color: '#0097a7' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
              </div>
              <div>
                <div className="stat-label">{ROLE_LABELS[key] || key.replace(/_/g, ' ')}</div>
                <div className="stat-value">{count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon" style={{ background: 'rgba(0,188,212,0.14)', color: '#0097a7' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            Forensic Modules
          </div>
        </div>
        <div className="card-body">
          <div style={{ padding: '28px 24px', textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🔬</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#2b2b2b' }}>Forensic case module coming soon</div>
            <div style={{ fontSize: 13, marginTop: 6, maxWidth: 460, margin: '8px auto 0', lineHeight: 1.6 }}>
              The forensic case, evidence and lab-analysis module is under development.
              {isAdmin ? ' For now you can create forensic users and issue their login credentials.' : ' Contact the Forensic Admin if you need access.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
