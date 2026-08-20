import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SearchableSelect from '../components/SearchableSelect';
import WorkflowProgress, { enquiryProgress } from '../components/WorkflowProgress';
import CaseChatModal from '../components/CaseChatModal';
import { canRegisterCaseFromEnquiry, enquiryReadyForCaseRegistration, canCreateEnquiry } from '../utils/permissions';
import { useAutoRefresh } from '../utils/useAutoRefresh';

const STATUS_COLORS = {
  registered: 'badge-pending',
  assigned: 'badge-active',
  in_progress: 'badge-info',
  cfr_submitted: 'badge-pending',
  approved: 'badge-finalized',
  closed: 'badge-urgent',
  transferred: 'badge-warning',
  converted_to_case: 'badge-finalized',
  referred_court: 'badge-urgent',
};

const STATUS_LABELS = {
  registered: 'Registered',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  cfr_submitted: 'CFR Submitted',
  approved: 'Approved',
  closed: 'Closed',
  transferred: 'Transferred',
  converted_to_case: 'Converted to Case',
  referred_court: 'Referred to Court',
};

export default function Enquiries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, approved: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Assign modal
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignOfficerId, setAssignOfficerId] = useState('');
  const [officers, setOfficers] = useState([]);
  const [assignSaving, setAssignSaving] = useState(false);

  // CFR modal
  const [cfrTarget, setCfrTarget] = useState(null);
  const [cfrForm, setCfrForm] = useState({ cfr_summary: '', recommendation: '' });
  const [cfrSaving, setCfrSaving] = useState(false);

  // Approve modal
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveForm, setApproveForm] = useState({ decision: 'agree', recommendation: '', closure_reason: '', merge_complaint_id: '', transfer_department: '', transfer_circle: '', remarks: '' });
  const [circles, setCircles] = useState([]);
  const [approveSaving, setApproveSaving] = useState(false);

  // Change Officer modal
  const [changeTarget, setChangeTarget] = useState(null);
  const [changeOfficerId, setChangeOfficerId] = useState('');
  const [changeSaving, setChangeSaving] = useState(false);

  // Case Chat Modal
  const [chatTarget, setChatTarget] = useState(null);

  // Register Case modal
  const [registerTarget, setRegisterTarget] = useState(null);
  const [registerForm, setRegisterForm] = useState({ investigation_officer_id: '', remarks: '' });
  const [ioOfficers, setIoOfficers] = useState([]);
  const [registerSaving, setRegisterSaving] = useState(false);

  const hasRole = (roleName) => user?.roles?.some(r => r.name === roleName);
  const canRegisterCase = canRegisterCaseFromEnquiry(user);

  const fetchData = useCallback((p = page) => {
    setLoading(true);
    const params = { page: p };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/enquiries', { params }).then(r => {
      const d = r.data.data || r.data;
      if (Array.isArray(d)) setList(d);
      else if (d?.data) { setList(d.data); setLastPage(d.last_page || 1); setPage(d.current_page || 1); }
      else setList([]);
    }).finally(() => setLoading(false));
    api.get('/enquiries/stats').then(r => setStats(r.data)).catch(() => {});
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useAutoRefresh(() => fetchData(page), [page, search, statusFilter], 30000);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/enquiries/${deleteTarget.id}`);
    setList(list.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const loadOfficers = () => {
    api.get('/lookup/enquiry-officers').then(r => {
      const all = r.data.data || r.data;
      setOfficers(Array.isArray(all) ? all : []);
    }).catch(() => {});
  };

  // ── Assign ──
  const openAssign = (e) => {
    loadOfficers();
    setAssignTarget(e);
    setAssignOfficerId('');
  };
  const handleAssign = async () => {
    if (!assignTarget || !assignOfficerId) return;
    setAssignSaving(true);
    try {
      await api.post(`/enquiries/${assignTarget.id}/assign`, { enquiry_officer_id: assignOfficerId });
      fetchData();
      setAssignTarget(null);
    } catch (e) { alert(e.response?.data?.message || 'Assignment failed'); }
    finally { setAssignSaving(false); }
  };

  // ── Submit CFR ──
  const openCfr = (e) => {
    setCfrTarget(e);
    setCfrForm({ cfr_summary: '', recommendation: '' });
  };
  const handleCfr = async () => {
    if (!cfrTarget) return;
    setCfrSaving(true);
    try {
      await api.post(`/enquiries/${cfrTarget.id}/submit-cfr`, cfrForm);
      fetchData();
      setCfrTarget(null);
    } catch (e) { alert(e.response?.data?.message || 'CFR submission failed'); }
    finally { setCfrSaving(false); }
  };

  // ── Approve/Review ──
  const openApprove = (e) => {
    api.get('/lookup/circles').then(r => setCircles(r.data || [])).catch(() => {});
    setApproveTarget(e);
    setApproveForm({ decision: 'agree', recommendation: e.recommendation || '', closure_reason: '', merge_complaint_id: '', transfer_department: '', transfer_circle: '', remarks: '' });
  };
  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproveSaving(true);
    try {
      await api.post(`/enquiries/${approveTarget.id}/approve`, approveForm);
      fetchData();
      setApproveTarget(null);
    } catch (e) { alert(e.response?.data?.message || 'Approval failed'); }
    finally { setApproveSaving(false); }
  };

  // ── Change Officer ──
  const openChange = (e) => {
    loadOfficers();
    setChangeTarget(e);
    setChangeOfficerId('');
  };
  const handleChange = async () => {
    if (!changeTarget || !changeOfficerId) return;
    setChangeSaving(true);
    try {
      await api.post(`/enquiries/${changeTarget.id}/change-officer`, { enquiry_officer_id: changeOfficerId });
      fetchData();
      setChangeTarget(null);
    } catch (e) { alert(e.response?.data?.message || 'Change failed'); }
    finally { setChangeSaving(false); }
  };

  // ── Register Case ──
  const openRegisterCase = (e) => {
    api.get('/lookup/investigation-officers').then(r => {
      const all = r.data.data || r.data;
      setIoOfficers(Array.isArray(all) ? all : []);
    }).catch(() => {});
    setRegisterTarget(e);
    setRegisterForm({ investigation_officer_id: '', remarks: '' });
  };

  const handleRegisterCase = async () => {
    if (!registerTarget) return;
    setRegisterSaving(true);
    try {
      const res = await api.post(`/enquiries/${registerTarget.id}/register-case`, {
        investigation_officer_id: registerForm.investigation_officer_id || undefined,
        remarks: registerForm.remarks || undefined,
      });
      const caseFile = res.data?.data?.case_file;
      fetchData();
      setRegisterTarget(null);
      if (caseFile?.id) {
        navigate(`/cases/${caseFile.id}/edit`);
      } else {
        alert(res.data?.message || 'Case registered successfully');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Case registration failed');
    } finally {
      setRegisterSaving(false);
    }
  };

  const filteredList = list;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Enquiries</h1>
          <p className="page-subtitle">Manage enquiry records</p>
          <div className="title-underline"></div>
        </div>
        <div className="page-actions">
          {canCreateEnquiry(user) && (
            <Link to="/enquiries/create" className="btn btn-primary btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg> New Enquiry
            </Link>
          )}
        </div>
      </div>

      <div className="mini-stats-row" style={{marginBottom:20}}>
        <div className="mini-stat"><div className="mini-stat-value">{stats.total}</div><div className="mini-stat-label">Total Enquiries</div></div>
        <div className="mini-stat"><div className="mini-stat-value">{stats.pending}</div><div className="mini-stat-label">Registered</div></div>
        <div className="mini-stat"><div className="mini-stat-value">{stats.progress}</div><div className="mini-stat-label">In Progress</div></div>
        <div className="mini-stat"><div className="mini-stat-value">{stats.approved}</div><div className="mini-stat-label">Approved</div></div>
      </div>

      <div className="filters-bar" style={{display:'flex',gap:12,alignItems:'center',padding:'12px 16px',background:'#fff',borderRadius:8,marginBottom:16,flexWrap:'wrap',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid rgba(1,92,148,0.15)'}}>
        <span className="filter-label" style={{fontSize:12,fontWeight:700,color:'#2b2b2b',textTransform:'uppercase',letterSpacing:'0.5px'}}>Filter</span>
        <input type="text" className="filter-select" placeholder="Search by complaint name or ID..." style={{height:34,padding:'0 12px',width:260,border:'1.5px solid #264078',borderRadius:8,fontSize:13}} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" style={{height:34,padding:'0 12px',border:'1.5px solid #264078',borderRadius:8,fontSize:13,background:'#fff',minWidth:160}} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? <LoadingSkeleton type="table" columns={6} rows={8} /> : (
        <div className="card">
          <div className="card-body" style={{padding:0}}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Complaint</th><th>Status</th><th>Progress</th><th>Enquiry Officer</th><th>Created</th><th style={{textAlign:'center'}}>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredList.map((e, i) => (
                    <tr key={e.id}>
                      <td><span className="table-id">#{e.enquiry_number || e.id}</span></td>
                      <td><span style={{fontSize:13,fontWeight:500}}>{e.complaint?.complainant_name || e.direct_info?.complainant_name || e.complaint_id}</span><br /><span style={{fontSize:11,color:'#6c757d'}}>{e.complaint?.tracking_no || e.direct_info?.reference_no || ''}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={`badge ${STATUS_COLORS[e.status] || 'badge-pending'}`}>{STATUS_LABELS[e.status] || e.status?.replace('_', ' ')}</span>
                          {(e.has_unserved_notice || e.status === 'referred_court') && (
                            <span title="Summon non-appearance / unserved" style={{ fontSize: 16, lineHeight: 1 }}>⭐</span>
                          )}
                          {e.notice_count > 0 && (
                            <span className="badge badge-info" style={{ fontSize: 11 }}>{e.notice_count} summon{e.notice_count > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ minWidth: 180 }}>
                        <WorkflowProgress
                          percent={enquiryProgress(e.status).percent}
                          stage={enquiryProgress(e.status).stage}
                          compact
                        />
                      </td>
                      <td>{e.officer?.name || '-'}</td>
                      <td><span style={{fontSize:12,color:'#6c757d'}}>{new Date(e.created_at).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'})}</span></td>
                      <td style={{textAlign:'center'}}>
                        <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
                          <button
                            type="button"
                            onClick={() => setChatTarget(e)}
                            className="btn btn-sm"
                            style={{background:'rgba(1,92,148,0.12)',color:'#015C94',border:'none',borderRadius:8,width:36,height:36,display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14}}
                            title="Case Discussion & Team Chat"
                          >
                            💬
                          </button>

                          <Link to={`/enquiries/${e.id}/edit`} className="btn btn-outline btn-sm btn-icon" title="Edit">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </Link>

                          {(['registered'].includes(e.status)) && (hasRole('admin') || hasRole('circle_incharge')) && (
                            <button onClick={() => openAssign(e)} className="btn btn-sm" style={{background:'rgba(1,92,148,0.12)',color:'#015C94',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600}} title="Assign Officer">
                              Assign
                            </button>
                          )}

                          {(['assigned','in_progress'].includes(e.status)) && user?.id === e.enquiry_officer_id && (
                            <button onClick={() => openCfr(e)} className="btn btn-sm" style={{background:'rgba(56,161,105,0.12)',color:'#38a169',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600}} title="Submit CFR">
                              Submit CFR
                            </button>
                          )}

                          {e.status === 'cfr_submitted' && (hasRole('admin') || hasRole('circle_incharge')) && (
                            <button onClick={() => openApprove(e)} className="btn btn-sm" style={{background:'rgba(214,158,46,0.12)',color:'#d69e2e',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600}} title="Review">
                              Review
                            </button>
                          )}

                          {canRegisterCase && enquiryReadyForCaseRegistration(e) && (
                            <button onClick={() => openRegisterCase(e)} className="btn btn-sm" style={{background:'rgba(1,92,148,0.18)',color:'#015C94',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:700}} title="Register Case/FIR">
                              Register Case
                            </button>
                          )}

                          {e.case_file_id || e.case_file?.id ? (
                            <Link to={`/cases/${e.case_file_id || e.case_file.id}/edit`} className="btn btn-sm" style={{background:'rgba(56,161,105,0.12)',color:'#38a169',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600,textDecoration:'none'}} title="View registered case">
                              View Case
                            </Link>
                          ) : null}

                          {(hasRole('admin') || hasRole('circle_incharge')) && (
                            <button onClick={() => openChange(e)} className="btn btn-sm" style={{background:'rgba(128,90,213,0.12)',color:'#805ad5',border:'none',borderRadius:8,height:36,display:'inline-flex',alignItems:'center',gap:5,padding:'0 10px',cursor:'pointer',fontSize:12,fontWeight:600}} title="Change Officer">
                              Change
                            </button>
                          )}

                          <button onClick={() => setDeleteTarget(e)} className="btn btn-sm" style={{background:'rgba(229,62,62,0.15)',color:'#e53e3e',border:'none',borderRadius:8,width:36,height:36,display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Delete">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:24,color:'#6c757d'}}>No enquiries found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          {lastPage > 1 && (
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,padding:'12px 16px',borderTop:'1px solid #f0f0f0'}}>
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #dee2e6',background: page <= 1 ? '#f8f9fa' : '#fff',color: page <= 1 ? '#adb5bd' : '#495057',cursor: page <= 1 ? 'default' : 'pointer',fontSize:13}}>Prev</button>
              <span style={{fontSize:13,color:'#6c757d'}}>Page {page} of {lastPage}</span>
              <button disabled={page >= lastPage} onClick={() => setPage(p => Math.min(lastPage, p + 1))} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #dee2e6',background: page >= lastPage ? '#f8f9fa' : '#fff',color: page >= lastPage ? '#adb5bd' : '#495057',cursor: page >= lastPage ? 'default' : 'pointer',fontSize:13}}>Next</button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} title="Delete Enquiry" message={`Delete enquiry #${deleteTarget?.id}?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* ── Assign Modal ── */}
      {assignTarget && (
        <div className="modal-overlay" onClick={() => setAssignTarget(null)}>
          <div className="modal-container" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Assign Enquiry Officer</h3><button className="modal-close" onClick={() => setAssignTarget(null)}>&times;</button></div>
            <div className="modal-body">
              <p style={{marginBottom:12,fontSize:13,color:'#666'}}>Enquiry: <strong>#{assignTarget.enquiry_number || assignTarget.id}</strong></p>
              <div className="cf-group">
                <label className="cf-label">Enquiry Officer <span className="required">*</span></label>
                <SearchableSelect value={assignOfficerId} onChange={setAssignOfficerId} options={officers} placeholder="Select officer..." valueKey="id" formatLabel={o => o.name + (o.designation ? ' (' + o.designation + ')' : '')} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setAssignTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={assignSaving || !assignOfficerId}>{assignSaving ? 'Assigning...' : 'Assign'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit CFR Modal ── */}
      {cfrTarget && (
        <div className="modal-overlay" onClick={() => setCfrTarget(null)}>
          <div className="modal-container" style={{maxWidth:540}} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Submit CFR</h3><button className="modal-close" onClick={() => setCfrTarget(null)}>&times;</button></div>
            <div className="modal-body">
              <div className="cf-group">
                <label className="cf-label">CFR Summary <span className="required">*</span></label>
                <textarea className="cf-input" rows={5} value={cfrForm.cfr_summary} onChange={e => setCfrForm({...cfrForm, cfr_summary: e.target.value})} placeholder="Detailed findings summary..." required />
              </div>
              <div className="cf-group">
                <label className="cf-label">Recommendation <span className="required">*</span></label>
                <select className="cf-input" value={cfrForm.recommendation} onChange={e => setCfrForm({...cfrForm, recommendation: e.target.value})} required>
                  <option value="">Select recommendation...</option>
                  <option value="closure">Closure</option>
                  <option value="transfer">Transfer</option>
                  <option value="convert_to_case">Convert to Case</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCfrTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCfr} disabled={cfrSaving || !cfrForm.cfr_summary || !cfrForm.recommendation}>{cfrSaving ? 'Submitting...' : 'Submit CFR'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve/Review Modal ── */}
      {approveTarget && (
        <div className="modal-overlay" onClick={() => setApproveTarget(null)}>
          <div className="modal-container" style={{maxWidth:640}} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Review Enquiry</h3><button className="modal-close" onClick={() => setApproveTarget(null)}>&times;</button></div>
            <div className="modal-body" style={{maxHeight:'70vh',overflowY:'auto'}}>
              {approveTarget.cfr_summary && (
                <div className="cf-group">
                  <label className="cf-label">Officer's CFR Summary</label>
                  <div style={{padding:'10px 14px',background:'#f9f9f9',borderRadius:8,fontSize:13,color:'#333',whiteSpace:'pre-wrap',border:'1px solid #e5e5e5'}}>{approveTarget.cfr_summary}</div>
                </div>
              )}
              <div className="cf-group">
                <label className="cf-label">Decision <span className="required">*</span></label>
                <select className="cf-input" value={approveForm.decision} onChange={e => setApproveForm({...approveForm, decision: e.target.value})} required>
                  <option value="agree">Agree — Approve & Move Forward</option>
                  <option value="review">Review — Send Back to Officer</option>
                </select>
              </div>
              <div className="cf-group">
                <label className="cf-label">Final Recommendation <span className="required">*</span></label>
                <select className="cf-input" value={approveForm.recommendation} onChange={e => setApproveForm({...approveForm, recommendation: e.target.value, closure_reason: '', merge_complaint_id: '', transfer_department: '', transfer_circle: ''})} required>
                  <option value="">Select recommendation...</option>
                  <option value="closure">Closure</option>
                  <option value="merge">Merge</option>
                  <option value="transfer">Transfer</option>
                  <option value="convert_to_case">Case Registration</option>
                </select>
              </div>
              {approveForm.recommendation === 'closure' && (
                <div className="cf-group">
                  <label className="cf-label">Closure Reason <span className="required">*</span></label>
                  <select className="cf-input" value={approveForm.closure_reason} onChange={e => setApproveForm({...approveForm, closure_reason: e.target.value})} required>
                    <option value="">Select reason...</option>
                    <option value="non_pursuance">Non-Pursuance by Complainant</option>
                    <option value="irrelevant">Irrelevant</option>
                    <option value="invalid">Invalid</option>
                    <option value="lack_of_evidence">Lack of Evidence</option>
                    <option value="compromise">Compromise (Parties Settled)</option>
                  </select>
                </div>
              )}
              {approveForm.recommendation === 'merge' && (
                <div className="cf-group">
                  <label className="cf-label">Merge with Complaint ID</label>
                  <input className="cf-input" value={approveForm.merge_complaint_id} onChange={e => setApproveForm({...approveForm, merge_complaint_id: e.target.value})} placeholder="Enter complaint ID" />
                </div>
              )}
              {approveForm.recommendation === 'transfer' && (
                <>
                  <div className="cf-group">
                    <label className="cf-label">Department Name</label>
                    <input className="cf-input" value={approveForm.transfer_department} onChange={e => setApproveForm({...approveForm, transfer_department: e.target.value})} placeholder="e.g. NCCIA, Police" />
                  </div>
                  <div className="cf-group">
                    <label className="cf-label">Circle</label>
                    <select className="cf-input" value={approveForm.transfer_circle} onChange={e => setApproveForm({...approveForm, transfer_circle: e.target.value})}>
                      <option value="">Select circle...</option>
                      {circles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="cf-group">
                <label className="cf-label">Remarks</label>
                <textarea className="cf-input" rows={3} value={approveForm.remarks} onChange={e => setApproveForm({...approveForm, remarks: e.target.value})} placeholder="Any additional remarks..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setApproveTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApprove} disabled={approveSaving || !approveForm.decision || !approveForm.recommendation}>
                {approveSaving ? 'Processing...' : (approveForm.decision === 'agree' ? 'Approve' : 'Send Back')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Register Case Modal ── */}
      {registerTarget && (
        <div className="modal-overlay" onClick={() => setRegisterTarget(null)}>
          <div className="modal-container" style={{maxWidth:540}} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Register Case / FIR</h3><button className="modal-close" onClick={() => setRegisterTarget(null)}>&times;</button></div>
            <div className="modal-body">
              <p style={{marginBottom:12,fontSize:13,color:'#666'}}>
                Enquiry <strong>#{registerTarget.enquiry_number || registerTarget.id}</strong> ko case/FIR mein convert karein. FIR number auto generate hoga.
              </p>
              {registerTarget.cfr_summary && (
                <div className="cf-group">
                  <label className="cf-label">CFR Summary</label>
                  <div style={{padding:'10px 14px',background:'#f9f9f9',borderRadius:8,fontSize:13,color:'#333',whiteSpace:'pre-wrap',border:'1px solid #e5e5e5',maxHeight:120,overflowY:'auto'}}>{registerTarget.cfr_summary}</div>
                </div>
              )}
              <div className="cf-group">
                <label className="cf-label">Investigation Officer (optional)</label>
                <SearchableSelect value={registerForm.investigation_officer_id} onChange={v => setRegisterForm({...registerForm, investigation_officer_id: v})} options={ioOfficers} placeholder="Select IO..." valueKey="id" formatLabel={o => o.name + (o.designation ? ' (' + o.designation + ')' : '')} />
              </div>
              <div className="cf-group">
                <label className="cf-label">Remarks</label>
                <textarea className="cf-input" rows={3} value={registerForm.remarks} onChange={e => setRegisterForm({...registerForm, remarks: e.target.value})} placeholder="Optional remarks for case registration..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setRegisterTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRegisterCase} disabled={registerSaving}>
                {registerSaving ? 'Registering...' : 'Register Case / FIR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Officer Modal ── */}
      {changeTarget && (
        <div className="modal-overlay" onClick={() => setChangeTarget(null)}>
          <div className="modal-container" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Change Enquiry Officer</h3><button className="modal-close" onClick={() => setChangeTarget(null)}>&times;</button></div>
            <div className="modal-body">
              <p style={{marginBottom:12,fontSize:13,color:'#666'}}>Current officer: <strong>{changeTarget.officer?.name || 'N/A'}</strong></p>
              <div className="cf-group">
                <label className="cf-label">New Officer <span className="required">*</span></label>
                <SearchableSelect value={changeOfficerId} onChange={setChangeOfficerId} options={officers} placeholder="Select officer..." valueKey="id" formatLabel={o => o.name + (o.designation ? ' (' + o.designation + ')' : '')} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setChangeTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleChange} disabled={changeSaving || !changeOfficerId}>{changeSaving ? 'Changing...' : 'Change Officer'}</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Case Chat Modal ── */}
      <CaseChatModal
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
        type="enquiry"
        id={chatTarget?.id}
        caseNumber={chatTarget?.enquiry_number || (chatTarget?.id ? `ENQ-${chatTarget.id}` : '')}
        title={chatTarget?.complaint?.complainant_name || chatTarget?.direct_info?.complainant_name || ''}
        officers={chatTarget?.officer ? [{ name: chatTarget.officer.name, role_label: 'Enquiry Officer' }] : []}
      />
    </div>
  );
}
