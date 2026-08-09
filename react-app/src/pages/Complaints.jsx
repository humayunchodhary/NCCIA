import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProgressBar from '../components/ProgressBar';
import { openPrintWindow } from '../utils/print';
import { useAuth } from '../contexts/AuthContext';
import { canAssignVerification, canCreateComplaint, hasRole } from '../utils/permissions';

const CLOSURE_REASON_LABELS = {
  non_pursuance: 'Non-Pursuance',
  irrelevant: 'Irrelevant',
  invalid: 'Invalid',
  lack_of_evidence: 'Lack of Evidence',
};

const STATUS_COLORS = {
  complete: 'badge-finalized',
  incomplete: 'badge-pending',
  closed: 'badge-urgent',
  merged: 'badge-merge',
  transferred: 'badge-warning',
  enquiry_registered: 'badge-active',
};

const STATUS_LABELS = {
  complete: 'Complete',
  incomplete: 'Incomplete',
  closed: 'Closed',
  merged: 'Merged',
  transferred: 'Transferred',
  enquiry_registered: 'Enquiry Registered',
};

const ENQ_STATUS_COLORS = {
  registered: 'badge-pending',
  assigned: 'badge-active',
  in_progress: 'badge-info',
  cfr_submitted: 'badge-pending',
  approved: 'badge-finalized',
  closed: 'badge-urgent',
};

export default function Complaints() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [offenceMap, setOffenceMap] = useState({});
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignForm, setAssignForm] = useState({ verification_officer_id: '', priority_type: 'normal' });
  const [officers, setOfficers] = useState([]);

  // Assign VO for operator is on Complete Registration form only
  const canAssign = canAssignVerification(user) && !hasRole(user, 'operator');
  const canCreate = canCreateComplaint(user);
  const canDelete = hasRole(user, 'admin');
  const canEdit = canCreate || hasRole(user, 'circle_incharge') || hasRole(user, 'admin');

  useEffect(() => {
    api.get('/complaints').then(r => setList(r.data.data || r.data)).finally(() => setLoading(false));
    api.get('/offence-types').then(r => {
      const d = r.data.data || r.data;
      const arr = Array.isArray(d) ? d : (d.data || []);
      setOffenceMap(Object.fromEntries(arr.map(o => [o.value, o.name])));
    }).catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/complaints/${deleteTarget.id}`);
    setList(list.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const printSlip = async (c) => {
    try {
      const r = await api.get(`/complaints/${c.id}/slip`);
      openPrintWindow(r.data.html);
    } catch (e) {
      alert(e.response?.data?.message || 'Could not generate slip.');
    }
  };

  // ── Direct Assign ──
  const openDirectAssign = (complaint) => {
    setAssignTarget(complaint);
    setAssignForm({ verification_officer_id: '', priority_type: 'normal' });
    api.get('/lookup/verification-officers').then(r => {
      const all = r.data.data || r.data;
      setOfficers(Array.isArray(all) ? all : []);
    }).catch(() => {});
  };

  const handleDirectAssign = async () => {
    if (!assignTarget) return;
    try {
      await api.post(`/complaints/${assignTarget.id}/direct-assign`, assignForm);
      setAssignTarget(null);
      setAssignForm({ verification_officer_id: '', priority_type: 'normal' });
      // Refresh list
      api.get('/complaints').then(r => setList(r.data.data || r.data)).finally(() => setOfficers([]));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to assign verification');
    }
  };

  if (loading) return <div className="complaint-page"><LoadingSkeleton type="table" columns={8} rows={10} /></div>;

  return (
    <div className="complaint-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">All registered complaints</p>
          <div className="title-underline"></div>
        </div>
        {canCreate && (
          <div className="page-actions">
            <Link to="/complaints/create" className="btn btn-primary btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg> New Complaint
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Complainant</th><th>CNIC</th><th>Offence Type</th><th>Status</th><th>Progress</th><th>Enquiry</th><th>Outcome</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {list.map((c, i) => (
                  <tr key={c.id}>
                    <td><span className="table-id">#{c.tracking_no || c.id}</span></td>
                    <td><span style={{fontSize:'13px',fontWeight:500}}>{c.complainant_name}</span></td>
                    <td>{c.cnic}</td>
                    <td>{offenceMap[c.offence_type] || c.offence_type}</td>
                    <td><span className={`badge ${STATUS_COLORS[c.final_status || c.status] || 'badge-pending'}`}>{STATUS_LABELS[c.final_status || c.status] || c.status}</span></td>
                    <td style={{ minWidth: 150 }}>
                      <ProgressBar value={c.progress_percent} showLabel />
                      <div style={{ fontSize: 11, color: '#6c757d', marginTop: 4 }}>{c.progress_stage}</div>
                    </td>
                    <td>
                      {c.enquiry ? (
                        <div style={{display:'flex',flexDirection:'column',gap:'4px',alignItems:'flex-start'}}>
                          <Link to="/enquiries" style={{fontSize:'13px',fontWeight:600,color:'#015C94'}}>#{c.enquiry.enquiry_number || c.enquiry.id}</Link>
                          <span className={`badge ${ENQ_STATUS_COLORS[c.enquiry.status] || 'badge-pending'}`}>{c.enquiry.status?.replace('_', ' ')}</span>
                        </div>
                      ) : (
                        <span style={{color:'#999'}}>—</span>
                      )}
                    </td>
                    <td style={{fontSize:'12px',maxWidth:'200px'}}>
                      {c.final_status === 'closed' && CLOSURE_REASON_LABELS[c.closure_reason] && (
                        <span style={{color:'#e53e3e'}}>{CLOSURE_REASON_LABELS[c.closure_reason]}</span>
                      )}
                      {c.final_status === 'merged' && c.merged_with_id && (
                        <span style={{color:'#6c757d'}}>Merged #{c.merged_with_id}</span>
                      )}
                      {c.final_status === 'transferred' && (
                        <span style={{color:'#d69e2e'}}>{c.transfer_to_department || 'Transferred'}</span>
                      )}
                      {c.final_status === 'enquiry_registered' && c.enquiry_id && (
                        <span style={{color:'#38a169'}}>Enquiry #{c.enquiry_id}</span>
                      )}
                      {!c.final_status && <span style={{color:'#999'}}>—</span>}
                    </td>
                    <td><span style={{fontSize:'12px',color:'#6c757d'}}>{new Date(c.created_at).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'})}</span></td>
<td>
                       <div style={{display:'flex',gap:'6px'}}>
                         {canAssign && !c.verification && (
                           <button onClick={() => openDirectAssign(c)} className="btn btn-sm" style={{background:'rgba(1,92,148,0.12)',color:'#015C94',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600}} title="Assign Verification Officer">
                             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                             Assign
                           </button>
                         )}
                         {canEdit && (
                           <Link to={`/complaints/${c.id}/edit`} className="btn btn-outline btn-sm btn-icon" title="Edit">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </Link>
                         )}
                         {c.tracking_no && canCreate && (
                           <button
                             type="button"
                             onClick={async () => {
                               try {
                                 const r = await api.post(`/complaints/${c.id}/notify-complainant`);
                                 const wa = r.data?.complainant_notify?.whatsapp_url;
                                 if (wa) window.open(wa, '_blank');
                                 else alert('Phone missing — WhatsApp message nahi ban saka.');
                               } catch (e) {
                                 alert(e.response?.data?.message || 'Notify failed');
                               }
                             }}
                             className="btn btn-sm"
                             style={{background:'#25D366',color:'#fff',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600}}
                             title="Send registration WhatsApp to complainant"
                           >
                             Message
                           </button>
                         )}
                        <button onClick={() => printSlip(c)} className="btn btn-sm" style={{background:'rgba(56,161,105,0.12)',color:'#38a169',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600}} title="Print 80mm Slip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          Print Slip
                        </button>
                        {canDelete && (
                          <button onClick={() => setDeleteTarget(c)} className="btn btn-sm" style={{background:'rgba(229,62,62,0.15)',color:'#e53e3e',border:'none',borderRadius:'8px',width:'36px',height:'36px',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Delete">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={10} style={{textAlign:'center',padding:'24px',color:'#6c757d'}}>No complaints found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Complaint"
        message={`Delete complaint #${deleteTarget?.tracking_no || deleteTarget?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Direct Assign Modal ── */}
      {assignTarget && (
        <div className="modal-overlay" onClick={() => setAssignTarget(null)}>
          <div className="modal-container" style={{maxWidth:'480px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Direct Assign Verification Officer</h3>
              <button className="modal-close" onClick={() => setAssignTarget(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom:'12px',fontSize:'13px',color:'#555'}}>
                Assign a verification officer for complaint <strong>#{assignTarget.tracking_no || assignTarget.id}</strong>.
              </p>
              <div className="cf-group">
                <label className="cf-label">Verification Officer <span className="required">*</span></label>
                <select className="cf-input" value={assignForm.verification_officer_id} onChange={e => setAssignForm({...assignForm, verification_officer_id: e.target.value})} required>
                  <option value="">Select Officer</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.name}{o.designation ? ' (' + o.designation + ')' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="cf-group">
                <label className="cf-label">Priority <span className="required">*</span></label>
                <select className="cf-input" value={assignForm.priority_type} onChange={e => setAssignForm({...assignForm, priority_type: e.target.value})} required>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setAssignTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDirectAssign} disabled={!assignForm.verification_officer_id}>Assign Officer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
