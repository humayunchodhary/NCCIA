import { useState, useEffect } from 'react';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Circles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', zone_id: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = () => {
    api.get('/circles').then(r => setList(r.data.data || r.data)).finally(() => setLoading(false));
    api.get('/lookup/zones').then(r => setZones(r.data || [])).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ name: '', code: '', zone_id: '' }); setEditItem(null); setShowForm(false); };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name || '', code: item.code || '', zone_id: item.zone_id || '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/circles/${editItem.id}`, form);
      } else {
        await api.post('/circles', form);
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save circle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/circles/${deleteTarget.id}`);
    setList(list.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  if (loading) return <div className="page-content"><LoadingSkeleton type="table" columns={4} rows={8} /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Circles</h1>
          <p className="page-subtitle">Manage all circles</p>
          <div className="title-underline"></div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg> Add Circle
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Code</th><th>Zone</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {list.map((c, i) => (
                  <tr key={c.id}>
                    <td><span className="table-id">#{c.id}</span></td>
                    <td><span style={{fontSize:'13px',fontWeight:500}}>{c.name}</span></td>
                    <td><span className="badge badge-active">{c.code}</span></td>
                    <td>{c.zone?.name || '-'}</td>
                    <td>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={() => openEdit(c)} className="btn btn-outline btn-sm btn-icon" title="Edit">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="btn btn-sm" style={{background:'rgba(229,62,62,0.15)',color:'#e53e3e',border:'none',borderRadius:'8px',width:'36px',height:'36px',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Delete">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'24px',color:'#6c757d'}}>No circles found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',padding:20}} onClick={resetForm}>
          <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0'}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:600}}>{editItem ? 'Edit Circle' : 'Add Circle'}</h3>
            </div>
            <form onSubmit={handleSave} style={{padding:'16px 24px 24px'}}>
              <div className="cf-field">
                <label className="cf-label required">Circle Name</label>
                <input className="cf-input" type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div className="cf-field">
                <label className="cf-label required">Code</label>
                <input className="cf-input" type="text" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} placeholder="e.g. LHR" required maxLength={10} />
              </div>
              <div className="cf-field">
                <label className="cf-label">Zone</label>
                <select className="cf-input" value={form.zone_id} onChange={e => setForm(f => ({...f, zone_id: e.target.value}))}>
                  <option value="">— None —</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.code})</option>)}
                </select>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
                <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Circle"
        message={`Delete circle ${deleteTarget?.name} (${deleteTarget?.code})?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
