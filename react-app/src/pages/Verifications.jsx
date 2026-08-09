import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SearchableSelect from '../components/SearchableSelect';
import { canAssignVerification, hasRole as userHasRole } from '../utils/permissions';

const RECOMMENDATION_OPTIONS = [
  { value: 'enquiry_registration', label: 'Enquiry Registration' },
  { value: 'closure', label: 'Closure' },
  { value: 'merge', label: 'Merge with Another Complaint' },
  { value: 'transfer', label: 'Transfer to Other Circle/Dept' },
];

const CLOSURE_REASONS = [
  { value: 'non_pursuance', label: 'Non-Pursuance by Complainant' },
  { value: 'irrelevant', label: 'Irrelevant' },
  { value: 'invalid', label: 'Invalid' },
  { value: 'lack_of_evidence', label: 'Lack of Evidence' },
];

export default function Verifications() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, approved: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Bulk selection + bulk close
  const [selected, setSelected] = useState([]);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');

  const hasRole = (roleName) => userHasRole(user, roleName);
  const canBulk = hasRole('admin') || hasRole('circle_incharge');
  const canAssign = canAssignVerification(user);
  const canDelete = hasRole('admin');

  // Submit Report modal
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submitForm, setSubmitForm] = useState({ report_text: '', recommendation: '', closure_reason: '', merge_complaint_id: '', transfer_department: '', transfer_circle_id: '' });
  const [submitSaving, setSubmitSaving] = useState(false);

  // Review/Approve modal
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ decision: 'agree', recommendation: '', closure_reason: '', merge_complaint_id: '', transfer_department: '', transfer_circle_id: '', remarks: '' });
  const [reviewSaving, setReviewSaving] = useState(false);

  // Change Officer modal
  const [changeOfficerTarget, setChangeOfficerTarget] = useState(null);
  const [changeOfficerForm, setChangeOfficerForm] = useState({ verification_officer_id: '' });
  const [changeOfficerSaving, setChangeOfficerSaving] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [circles, setCircles] = useState([]);

  // Direct Message / WhatsApp modal
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgForm, setMsgForm] = useState({ appeared_at: '', complainant_message: '', message_via: 'whatsapp' });
  const [msgSaving, setMsgSaving] = useState(false);

  const openMessageModal = (v) => {
    const tracking = v.complaint?.tracking_no || ('#' + (v.complaint_id || v.id));
    const officer = v.officer?.name || user?.name || 'Verification Officer';
    const appear = v.appeared_at ? String(v.appeared_at).slice(0, 16) : '';
    const defaultMsg = v.complainant_message || (
      `Assalam-o-Alaikum. Aap ki complaint number ${tracking} ke mutaliq verification ke liye aap ko ${officer} ke samnay ${appear || '[date/time]'} par pesh hona hai. Baraye meherbani waqt par hazir hon. — NCCIA / CCRC`
    );
    setMsgTarget(v);
    setMsgForm({
      appeared_at: appear,
      complainant_message: defaultMsg,
      message_via: v.message_via || 'whatsapp',
    });
  };

  const handleSendMessage = async () => {
    if (!msgTarget) return;
    setMsgSaving(true);
    try {
      const r = await api.post(`/verifications/${msgTarget.id}/notify-complainant`, msgForm);
      const wa = r.data?.complainant_notify?.whatsapp_url;
      if (wa) window.open(wa, '_blank');
      else alert(r.data?.message || 'Message saved, but WhatsApp link unavailable (phone missing).');
      setMsgTarget(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send message');
    } finally {
      setMsgSaving(false);
    }
  };

  const fetchData = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    api.get('/verifications' + (qs ? `?${qs}` : '')).then(r => {
      const page = r.data;
      setList((page && page.data) ? page.data : []);
      setSelected([]);
    }).finally(() => setLoading(false));
    api.get('/verifications/stats').then(r => setStats(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/verifications/${deleteTarget.id}`);
    setList(list.filter(v => v.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ── Bulk close ──
  const handleBulkClose = async () => {
    if (!selected.length) return;
    try {
      await api.post('/verifications/bulk-close', { ids: selected, closure_reason: closeReason || null });
      fetchData();
      setSelected([]);
      setCloseModalOpen(false);
      setCloseReason('');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to close verifications');
    }
  };

  const selectedAll = canBulk && list.length > 0 && list.every(v => selected.includes(v.id));
  const selectedSome = canBulk && selected.length > 0 && selected.length < list.length;

  // ── Submit Report ──
  const openSubmitModal = (v) => {
    api.get('/lookup/circles').then(r => setCircles(r.data || [])).catch(() => {});
    setSubmitTarget(v);
    setSubmitForm({
      report_text: v.report_text || '',
      recommendation: v.recommendation || '',
      closure_reason: v.closure_reason || '',
      merge_complaint_id: v.merge_complaint_id || '',
      transfer_department: v.transfer_department || '',
      transfer_circle_id: v.transfer_circle_id || '',
    });
  };

  const handleSubmitReport = async () => {
    if (!submitTarget) return;
    setSubmitSaving(true);
    try {
      await api.post(`/verifications/${submitTarget.id}/submit-report`, submitForm);
      fetchData();
      setSubmitTarget(null);
      alert('Report Circle Incharge ko submit ho gayi. Woh ab Approve / Review kar sakte hain.');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitSaving(false);
    }
  };

  const canSubmitToCi = (v) =>
    ['assigned', 'in_progress', 'sent_back'].includes(v.status)
    && (String(user?.id) === String(v.verification_officer_id) || hasRole('admin') || hasRole('verification_officer'));

  // ── Review/Approve ──
  const openReviewModal = (v) => {
    api.get('/lookup/circles').then(r => setCircles(r.data || [])).catch(() => {});
    setReviewTarget(v);
    setReviewForm({
      decision: 'agree',
      recommendation: v.recommendation || '',
      closure_reason: v.closure_reason || '',
      merge_complaint_id: v.merge_complaint_id || '',
      transfer_department: v.transfer_department || '',
      transfer_circle_id: v.transfer_circle_id || '',
      remarks: '',
    });
  };

  const handleReview = async () => {
    if (!reviewTarget) return;
    setReviewSaving(true);
    try {
      await api.post(`/verifications/${reviewTarget.id}/approve`, reviewForm);
      fetchData();
      setReviewTarget(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to process review');
    } finally {
      setReviewSaving(false);
    }
  };

  // ── Change Officer ──
  const openChangeOfficerModal = (v) => {
    api.get('/lookup/verification-officers').then(r => {
      const all = r.data.data || r.data;
      setOfficers(Array.isArray(all) ? all : []);
    }).catch(() => {});
    setChangeOfficerTarget(v);
    setChangeOfficerForm({ verification_officer_id: '' });
  };

  const handleChangeOfficer = async () => {
    if (!changeOfficerTarget || !changeOfficerForm.verification_officer_id) return;
    setChangeOfficerSaving(true);
    try {
      await api.post(`/verifications/${changeOfficerTarget.id}/change-officer`, changeOfficerForm);
      fetchData();
      setChangeOfficerTarget(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to change officer');
    } finally {
      setChangeOfficerSaving(false);
    }
  };

  const filteredList = list.filter(v => {
    const matchesSearch = !search || 
      v.complaint?.tracking_no?.toLowerCase().includes(search.toLowerCase()) ||
      v.complaint?.complainant_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="page-content"><LoadingSkeleton type="table" columns={8} rows={10} /></div>;

  const statusColors = {
    pending_assignment: 'badge-pending',
    assigned: 'badge-active',
    in_progress: 'badge-info',
    submitted: 'badge-pending',
    approved: 'badge-finalized',
    sent_back: 'badge-urgent',
    closed: 'badge-closed',
  };

  const priorityDotCount = (type) => {
    if (type === 'critical') return 3;
    if (type === 'high') return 2;
    return 1;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label">Complaints</div>
          <h1 className="page-title">Verifications</h1>
          <p className="page-subtitle">Manage complaint verifications &nbsp;·&nbsp; CCRC-LHR</p>
          <div className="title-underline"></div>
        </div>
        {canAssign && (
          <div className="page-actions">
            <Link to="/verifications/create" className="btn btn-primary btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Assign New
            </Link>
          </div>
        )}
      </div>

      <div className="tab-nav" style={{display:'flex',gap:'2px',marginBottom:'16px',padding:'4px',background:'#f3f0f0',borderRadius:'8px'}}>
        <Link to="/verifications" className="tab-nav-item active" style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:600,color:'#015C94',background:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Verifications
        </Link>
        <Link to="/verifications/reports" className="tab-nav-item" style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:600,color:'#6c757d',background:'transparent'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Reports
        </Link>
      </div>

      <div className="mini-stats-row" style={{marginBottom:'20px'}}>
        <div className="mini-stat"><div className="mini-stat-value">{stats.total}</div><div className="mini-stat-label">Total Verifications</div></div>
        <div className="mini-stat"><div className="mini-stat-value">{stats.pending}</div><div className="mini-stat-label">Pending Assignment</div></div>
        <div className="mini-stat"><div className="mini-stat-value">{stats.progress}</div><div className="mini-stat-label">In Progress</div></div>
        <div className="mini-stat"><div className="mini-stat-value">{stats.approved}</div><div className="mini-stat-label">Completed</div></div>
      </div>

        <div className="filters-bar" style={{display:'flex',gap:'12px',alignItems:'center',padding:'12px 16px',background:'#fff',borderRadius:'8px',marginBottom:'16px',flexWrap:'wrap',boxShadow:'0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(1,92,148,0.1)',border:'1px solid rgba(1,92,148,0.15)'}}>
          <span className="filter-label" style={{fontSize:'12px',fontWeight:700,color:'#2b2b2b',textTransform:'uppercase',letterSpacing:'0.5px'}}>Filter</span>
          <input type="text" id="searchInput" className="filter-select" placeholder="Search by Case ID or complainant name..." style={{height:'34px',padding:'0 12px',width:'260px',border:'1.5px solid #264078',borderRadius:'8px',fontSize:'13px'}} value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" id="statusFilter" style={{height:'34px',padding:'0 12px',border:'1.5px solid #264078',borderRadius:'8px',fontSize:'13px',background:'#fff',color:'#2b2b2b',minWidth:'180px'}} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending_assignment">Pending Assignment</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="sent_back">Sent Back</option>
            <option value="closed">Closed</option>
          </select>
          <div className="filter-spacer" style={{flex:1}}></div>
        </div>

        {canBulk && selected.length > 0 && (
          <div className="bulk-action-bar" style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',background:'#fff',border:'1px solid #e5e5e5',borderRadius:'8px',marginBottom:'12px',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
            <span style={{fontSize:'13px',fontWeight:600,color:'#2b2b2b'}}>{selected.length} selected</span>
            <button className="btn btn-sm" onClick={() => { setCloseReason(''); setCloseModalOpen(true); }} style={{background:'rgba(229,62,62,0.12)',color:'#e53e3e',border:'none',borderRadius:'6px',height:'32px',padding:'0 12px',cursor:'pointer',fontSize:'12px',fontWeight:600}}>Close</button>
            <button className="btn btn-sm" onClick={() => setSelected([])} style={{background:'#f3f4f6',color:'#374151',border:'1px solid #d1d5db',borderRadius:'6px',height:'32px',padding:'0 12px',cursor:'pointer',fontSize:'12px',fontWeight:600}}>Clear</button>
          </div>
        )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
            Verification Records
          </div>
          <div className="section-actions">
            <span style={{fontSize:'11.5px',color:'#6c757d'}}>Total: <strong style={{color:'#2b2b2b'}}>{list.length}</strong></span>
          </div>
        </div>
        <div className="card-body" style={{padding:0}}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {canBulk && <th style={{width:40}}><input type="checkbox" className="cf-input" checked={selectedAll} ref={el => el && (el.indeterminate = selectedSome)} onChange={e => setSelected(e.target.checked ? list.map(v => v.id) : [])} /></th>}
                  <th>#</th>
                  <th>Case ID</th>
                  <th>Complainant</th>
                  <th>Assigned Officer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Date</th>
                  <th style={{textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((v, i) => (
                  <tr key={v.id}>
                    {canBulk && <td><input type="checkbox" className="cf-input" checked={selected.includes(v.id)} onChange={e => { const s = new Set(selected); e.target.checked ? s.add(v.id) : s.delete(v.id); setSelected([...s]); }} /></td>}
                    <td>{i + 1}</td>
                    <td><span className="table-id">#{v.tracking_no || v.id}</span></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(38,64,120,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:600,color:'#2B2B2B'}}>
                          {(v.complaint?.complainant_name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0,2).join('').toUpperCase() || '?'}
                        </div>
                        <span style={{fontSize:'13px',fontWeight:500}}>{v.complaint?.complainant_name}</span>
                      </div>
                    </td>
                    <td>{v.officer?.name || '-'}</td>
                    <td>
                      <div className="priority-dots">
                        {[0,1,2].map(dot => (
                          <div key={dot} className={`priority-dot${dot < priorityDotCount(v.priority_type) ? ' filled ' + (v.priority_type || 'regular') : ''}`}></div>
                        ))}
                      </div>
                    </td>
                    <td><span className={`badge ${statusColors[v.status] || 'badge-pending'}`}>{v.status?.replace('_', ' ')}</span></td>
                    <td><span style={{fontSize:'12px',color:'#6c757d'}}>{v.assigned_at ? new Date(v.assigned_at).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : '-'}</span></td>
                    <td style={{textAlign:'center'}}>
                      <div style={{display:'flex',gap:'6px',justifyContent:'center',flexWrap:'wrap'}}>
                        <Link to={`/verifications/${v.id}/edit`} className="btn btn-outline btn-sm btn-icon" title="Edit">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </Link>

                        <button
                          type="button"
                          onClick={() => openMessageModal(v)}
                          className="btn btn-sm"
                          style={{background:'#25D366',color:'#fff',border:'none',borderRadius:'8px',height:'36px',display:'inline-flex',alignItems:'center',gap:'5px',padding:'0 10px',cursor:'pointer',fontSize:'12px',fontWeight:600}}
                          title="Message Complainant via WhatsApp"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          Message
                        </button>

                        {canSubmitToCi(v) && String(user?.id) === String(v.verification_officer_id) && (
                          <button
                            type="button"
                            onClick={() => openSubmitModal(v)}
                            className="btn btn-sm"
                            style={{background:'#015C94',color:'#fff',border:'none',borderRadius:'8px',height:'36px',display:'inline-flex',alignItems:'center',gap:'5px',padding:'0 12px',cursor:'pointer',fontSize:'12px',fontWeight:700,boxShadow:'0 2px 6px rgba(1,92,148,0.35)'}}
                            title="Submit report to Circle Incharge"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            Submit to CI
                          </button>
                        )}

                        {v.status === 'submitted' && (hasRole('circle_incharge') || hasRole('admin')) && (
                          <button onClick={() => openReviewModal(v)} className="btn btn-sm" style={{background:'rgba(56,161,105,0.12)',color:'#38a169',border:'none',borderRadius:'8px',height:'36px',display:'inline-flex',alignItems:'center',gap:'5px',padding:'0 10px',cursor:'pointer',fontSize:'12px',fontWeight:600}} title="Review">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            Review
                          </button>
                        )}

                        {(hasRole('admin') || hasRole('circle_incharge')) && (
                          <button onClick={() => openChangeOfficerModal(v)} className="btn btn-sm" style={{background:'rgba(214,158,46,0.12)',color:'#d69e2e',border:'none',borderRadius:'8px',height:'36px',display:'inline-flex',alignItems:'center',gap:'5px',padding:'0 10px',cursor:'pointer',fontSize:'12px',fontWeight:600}} title="Change Officer">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                            Change
                          </button>
                        )}

                        {canDelete && (
                          <button onClick={() => setDeleteTarget(v)} className="btn btn-sm" style={{background:'rgba(229,62,62,0.15)',color:'#e53e3e',border:'none',borderRadius:'8px',width:'36px',height:'36px',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Delete">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredList.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'24px',color:'#6c757d'}}>No verifications found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Verification"
        message={`Delete verification #${deleteTarget?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Submit Report Modal ── */}
      {submitTarget && (
        <div className="modal-overlay" onClick={() => setSubmitTarget(null)}>
          <div className="modal-container" style={{maxWidth:'640px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit to Circle Incharge</h3>
              <button className="modal-close" onClick={() => setSubmitTarget(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{maxHeight:'70vh',overflowY:'auto'}}>
              <p style={{marginBottom:12,fontSize:13,color:'#334155',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'10px 12px'}}>
                Yeh report <strong>aap ke Circle Incharge</strong> ko jayegi (same circle). Submit ke baad status = Submitted ho jayega.
              </p>
              <div className="cf-group">
                <label className="cf-label">Report Text <span className="required">*</span></label>
                <textarea className="cf-input" rows="5" value={submitForm.report_text} onChange={e => setSubmitForm({...submitForm, report_text: e.target.value})} placeholder="Detailed verification report..." required />
              </div>
              <div className="cf-group">
                <label className="cf-label">Recommendation <span className="required">*</span></label>
                <select className="cf-input" value={submitForm.recommendation} onChange={e => setSubmitForm({...submitForm, recommendation: e.target.value, closure_reason: '', merge_complaint_id: '', transfer_department: '', transfer_circle_id: ''})} required>
                  <option value="">Select recommendation...</option>
                  {RECOMMENDATION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {submitForm.recommendation === 'closure' && (
                <div className="cf-group">
                  <label className="cf-label">Closure Reason <span className="required">*</span></label>
                  <select className="cf-input" value={submitForm.closure_reason} onChange={e => setSubmitForm({...submitForm, closure_reason: e.target.value})} required>
                    <option value="">Select closure reason...</option>
                    {CLOSURE_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {submitForm.recommendation === 'merge' && (
                <div className="cf-group">
                  <label className="cf-label">Merge with Complaint <span className="required">*</span></label>
                  <SearchableSelect
                    value={submitForm.merge_complaint_id}
                    onChange={v => setSubmitForm({...submitForm, merge_complaint_id: v})}
                    options={list.filter(x => x.complaint?.tracking_no).map(x => x.complaint)}
                    placeholder="Select complaint..."
                    valueKey="id"
                    formatLabel={o => '#' + o.tracking_no + ' - ' + o.complainant_name}
                  />
                </div>
              )}

              {submitForm.recommendation === 'transfer' && (
                <>
                  <div className="cf-group">
                    <label className="cf-label">Department Name <span className="required">*</span></label>
                    <input className="cf-input" value={submitForm.transfer_department} onChange={e => setSubmitForm({...submitForm, transfer_department: e.target.value})} placeholder="e.g. Home Department" required />
                  </div>
                  <div className="cf-group">
                    <label className="cf-label">Circle</label>
                    <SearchableSelect
                      value={submitForm.transfer_circle_id}
                      onChange={v => setSubmitForm({...submitForm, transfer_circle_id: v})}
                      options={circles}
                      placeholder="Select circle..."
                      valueKey="id"
                      formatLabel={o => o.name}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSubmitTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitReport} disabled={submitSaving || !submitForm.recommendation || !submitForm.report_text} style={{background:'#015C94',fontWeight:700}}>
                {submitSaving ? 'Submitting...' : 'Submit to Circle Incharge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review/Approve Modal ── */}
      {reviewTarget && (
        <div className="modal-overlay" onClick={() => setReviewTarget(null)}>
          <div className="modal-container" style={{maxWidth:'640px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Verification Report</h3>
              <button className="modal-close" onClick={() => setReviewTarget(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{maxHeight:'70vh',overflowY:'auto'}}>
              <div className="cf-group">
                <label className="cf-label">Officer's Report</label>
                <div style={{padding:'10px 14px',background:'#f9f9f9',borderRadius:'8px',fontSize:'13px',color:'#333',whiteSpace:'pre-wrap',border:'1px solid #e5e5e5'}}>{reviewTarget.report_text || 'No report text provided'}</div>
              </div>
              <div className="cf-group">
                <label className="cf-label">Officer's Recommendation</label>
                <div style={{padding:'10px 14px',background:'#f9f9f9',borderRadius:'8px',fontSize:'13px',color:'#333',border:'1px solid #e5e5e5'}}>
                  {RECOMMENDATION_OPTIONS.find(o => o.value === reviewTarget.recommendation)?.label || reviewTarget.recommendation || 'Not specified'}
                </div>
              </div>

              <hr style={{margin:'16px 0',border:'none',borderTop:'1px solid #e5e5e5'}} />

              <div className="cf-group">
                <label className="cf-label">Your Decision <span className="required">*</span></label>
                <select className="cf-input" value={reviewForm.decision} onChange={e => setReviewForm({...reviewForm, decision: e.target.value})} required>
                  <option value="agree">Agree — Approve & Move Forward</option>
                  <option value="review">Review — Send Back to Officer</option>
                </select>
              </div>
              <div className="cf-group">
                <label className="cf-label">Final Recommendation <span className="required">*</span></label>
                <select className="cf-input" value={reviewForm.recommendation} onChange={e => setReviewForm({...reviewForm, recommendation: e.target.value, closure_reason: '', merge_complaint_id: '', transfer_department: '', transfer_circle_id: ''})} required>
                  <option value="">Select recommendation...</option>
                  {RECOMMENDATION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {reviewForm.recommendation === 'closure' && (
                <div className="cf-group">
                  <label className="cf-label">Closure Reason <span className="required">*</span></label>
                  <select className="cf-input" value={reviewForm.closure_reason} onChange={e => setReviewForm({...reviewForm, closure_reason: e.target.value})} required>
                    <option value="">Select closure reason...</option>
                    {CLOSURE_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {reviewForm.recommendation === 'merge' && (
                <div className="cf-group">
                  <label className="cf-label">Merge with Complaint <span className="required">*</span></label>
                  <SearchableSelect
                    value={reviewForm.merge_complaint_id}
                    onChange={v => setReviewForm({...reviewForm, merge_complaint_id: v})}
                    options={list.filter(x => x.complaint?.tracking_no).map(x => x.complaint)}
                    placeholder="Select complaint..."
                    valueKey="id"
                    formatLabel={o => '#' + o.tracking_no + ' - ' + o.complainant_name}
                  />
                </div>
              )}

              {reviewForm.recommendation === 'transfer' && (
                <>
                  <div className="cf-group">
                    <label className="cf-label">Department Name <span className="required">*</span></label>
                    <input className="cf-input" value={reviewForm.transfer_department} onChange={e => setReviewForm({...reviewForm, transfer_department: e.target.value})} placeholder="e.g. Home Department" required />
                  </div>
                  <div className="cf-group">
                    <label className="cf-label">Circle</label>
                    <SearchableSelect
                      value={reviewForm.transfer_circle_id}
                      onChange={v => setReviewForm({...reviewForm, transfer_circle_id: v})}
                      options={circles}
                      placeholder="Select circle..."
                      valueKey="id"
                      formatLabel={o => o.name}
                    />
                  </div>
                </>
              )}

              <div className="cf-group">
                <label className="cf-label">Remarks</label>
                <textarea className="cf-input" rows="3" value={reviewForm.remarks} onChange={e => setReviewForm({...reviewForm, remarks: e.target.value})} placeholder="Any additional remarks or instructions..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setReviewTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReview} disabled={reviewSaving || !reviewForm.decision || !reviewForm.recommendation}>
                {reviewSaving ? 'Processing...' : (reviewForm.decision === 'agree' ? 'Approve' : 'Send Back')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Close Modal ── */}
      {closeModalOpen && (
        <div className="modal-overlay" onClick={() => setCloseModalOpen(false)}>
          <div className="modal-container" style={{maxWidth:'480px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Close Selected Verifications</h3>
              <button className="modal-close" onClick={() => setCloseModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom:'12px',fontSize:'13px',color:'#555'}}>
                Close {selected.length} verification(s)? Mark the closure reason below.
              </p>
              <div className="cf-group">
                <label className="cf-label">Closure Reason (optional)</label>
                <select className="cf-input" value={closeReason} onChange={e => setCloseReason(e.target.value)}>
                  <option value="">— No reason —</option>
                  {CLOSURE_REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCloseModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBulkClose} style={{background:'#e53e3e',color:'#fff'}}>Close Verifications</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Officer Modal ── */}
      {changeOfficerTarget && (
        <div className="modal-overlay" onClick={() => setChangeOfficerTarget(null)}>
          <div className="modal-container" style={{maxWidth:'480px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Verification Officer</h3>
              <button className="modal-close" onClick={() => setChangeOfficerTarget(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom:'12px',fontSize:'13px',color:'#666'}}>
                Current officer: <strong>{changeOfficerTarget.officer?.name || 'N/A'}</strong>
              </p>
              <div className="cf-group">
                <label className="cf-label">New Officer <span className="required">*</span></label>
                <SearchableSelect
                  value={changeOfficerForm.verification_officer_id}
                  onChange={v => setChangeOfficerForm({verification_officer_id: v})}
                  options={officers}
                  placeholder="Select officer..."
                  valueKey="id"
                  formatLabel={o => o.name + (o.designation ? ' (' + o.designation + ')' : '')}
                />
              </div>
              <p style={{marginTop:'8px',fontSize:'12px',color:'#d69e2e'}}>
                Note: Changing the officer will reset the verification status to "Assigned" and clear all report data.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setChangeOfficerTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleChangeOfficer} disabled={changeOfficerSaving || !changeOfficerForm.verification_officer_id}>
                {changeOfficerSaving ? 'Changing...' : 'Change Officer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Message Complainant Modal ── */}
      {msgTarget && (
        <div className="modal-overlay" onClick={() => setMsgTarget(null)}>
          <div className="modal-container" style={{maxWidth:'560px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message Complainant</h3>
              <button className="modal-close" onClick={() => setMsgTarget(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom:12, fontSize:13, color:'#555'}}>
                Complaint <strong>#{msgTarget.complaint?.tracking_no || msgTarget.complaint_id}</strong>
                {msgTarget.complaint?.contact_no ? ` · ${msgTarget.complaint.contact_country_code || '+92'}${msgTarget.complaint.contact_no}` : ' · Phone missing'}
              </p>
              <div className="cf-group">
                <label className="cf-label">Appear By (Date &amp; Time)</label>
                <input type="datetime-local" className="cf-input" value={msgForm.appeared_at} onChange={e => setMsgForm(f => ({...f, appeared_at: e.target.value}))} />
              </div>
              <div className="cf-group">
                <label className="cf-label">Message</label>
                <textarea className="cf-input cf-textarea" rows={4} value={msgForm.complainant_message} onChange={e => setMsgForm(f => ({...f, complainant_message: e.target.value}))} />
              </div>
              <div className="cf-group">
                <label className="cf-label">Channel</label>
                <select className="cf-input" value={msgForm.message_via} onChange={e => setMsgForm(f => ({...f, message_via: e.target.value}))}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Phone</option>
                  <option value="in_app">Record Only</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setMsgTarget(null)}>Cancel</button>
              <button className="btn btn-primary" style={{background:'#25D366', border:'none'}} onClick={handleSendMessage} disabled={msgSaving}>
                {msgSaving ? 'Sending…' : 'Send via WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
