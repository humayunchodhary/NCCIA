import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function UserManual() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/user-manuals').then(r => setManuals(r.data.data || r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><LoadingSkeleton type="table" columns={4} rows={8} /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">User Manuals</h1>
          <p className="page-subtitle">Guides & documentation for system users</p>
          <div className="title-underline"></div>
        </div>
        <div className="page-actions">
          <Link to="/user-manuals/create" className="btn btn-primary btn-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg> Add Manual
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Title</th><th>Audience</th><th>Version</th><th>Updated</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {manuals.map((m, i) => (
                  <tr key={m.id}>
                    <td><span className="table-id">#{m.id}</span></td>
                    <td><span style={{fontSize:'13px',fontWeight:500}}>{m.title}</span></td>
                    <td><span className="badge badge-secondary">{m.audience}</span></td>
                    <td>v{m.version}</td>
                    <td>{m.updated_at ? new Date(m.updated_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <div style={{display:'flex',gap:'6px'}}>
                        <Link to={`/user-manuals/${m.id}/edit`} className="btn btn-outline btn-sm btn-icon" title="Edit">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {manuals.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',padding:'24px',color:'#6c757d'}}>No manuals added yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}