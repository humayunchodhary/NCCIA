import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function InvestigationOfficers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [grantTarget, setGrantTarget] = useState(null);
  const [grantForm, setGrantForm] = useState({ email: '', otp: '' });
  const [grantResult, setGrantResult] = useState(null);
  const [grantStep, setGrantStep] = useState('email'); // 'email' | 'otp' | 'done'
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const fetchData = useCallback((p = page) => {
    setLoading(true);
    api.get('/investigation-officers', { params: { page: p } }).then(r => {
      const d = r.data.data || r.data;
      if (Array.isArray(d)) {
        setList(d);
      } else if (d?.data) {
        setList(d.data);
        setLastPage(d.last_page || 1);
        setPage(d.current_page || 1);
      } else {
        setList([]);
      }
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/investigation-officers/${deleteTarget.id}`);
      setList(list.filter(o => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete officer');
    }
  };

  const openGrant = (officer) => {
    setGrantTarget(officer);
    setGrantForm({ email: officer.email || `${officer.badge_no?.toLowerCase?.() || 'io'}@nccia.gov.pk`, otp: '' });
    setGrantResult(null);
    setGrantStep('email');
    setOtpError('');
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await api.post(`/investigation-officers/${revokeTarget.id}/revoke-access`);
      setList(list.map(o => o.id === revokeTarget.id ? { ...o, user_id: null } : o));
      setRevokeTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove access');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetting(true);
    setResetResult(null);
    try {
      const payload = {};
      if (resetPassword) payload.password = resetPassword;
      const r = await api.post(`/investigation-officers/${resetTarget.id}/reset-password`, payload);
      setResetResult({ success: true, ...r.data });
    } catch (err) {
      setResetResult({ success: false, message: err.response?.data?.message || 'Failed to reset password' });
    } finally {
      setResetting(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError('');
    try {
      await api.post(`/investigation-officers/${grantTarget.id}/send-otp`, { email: grantForm.email });
      setGrantStep('otp');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const r = await api.post(`/investigation-officers/${grantTarget.id}/verify-otp`, {
        email: grantForm.email,
        otp: grantForm.otp,
      });
      setGrantResult({ success: true, ...r.data });
      setGrantStep('done');
      fetchData();
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const closeGrant = () => {
    setGrantTarget(null);
    setGrantResult(null);
    setGrantStep('email');
    setOtpError('');
  };

  if (loading) return <div className="page-content"><LoadingSkeleton type="table" columns={7} rows={8} /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Investigation Officers</h1>
          <p className="page-subtitle">Manage IO records &amp; portal access</p>
          <div className="title-underline"></div>
        </div>
        <div className="page-actions">
          <Link to="/investigation-officers/create" className="btn btn-primary btn-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg> Add IO
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Badge No</th><th>Name</th><th>Designation</th><th>Status</th><th>Portal Access</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {list.map((o, i) => (
                  <tr key={o.id}>
                    <td><span className="table-id">#{o.id}</span></td>
                    <td>{o.badge_no}</td>
                    <td><span style={{fontSize:'13px',fontWeight:500}}>{o.name}</span></td>
                    <td>{o.designation || '-'}</td>
                    <td><span className={`badge ${o.status === 'active' ? 'badge-finalized' : 'badge-closed'}`}>{o.status}</span></td>
                    <td>
                      {o.user_id ? (
                        <button onClick={() => setRevokeTarget(o)} className="btn btn-sm" style={{fontSize:11,padding:'4px 10px',background:'rgba(229,62,62,0.12)',color:'#e53e3e',border:'1px solid rgba(229,62,62,0.3)',borderRadius:6,cursor:'pointer'}}>
                          Remove Access
                        </button>
                      ) : (
                        <button onClick={() => openGrant(o)} className="btn btn-outline btn-sm" style={{fontSize:11,padding:'4px 10px'}}>
                          Grant Access
                        </button>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:'6px'}}>
                        {o.user_id && (
                          <button onClick={() => { setResetTarget(o); setResetPassword(''); setResetResult(null); }} className="btn btn-sm" title="Reset Password" style={{fontSize:11,padding:'4px 10px',background:'rgba(245,158,11,0.15)',color:'#d97706',border:'1px solid rgba(245,158,11,0.3)',borderRadius:6,cursor:'pointer'}}>
                            Reset Pwd
                          </button>
                        )}
                        <Link to={`/investigation-officers/${o.id}/edit`} className="btn btn-outline btn-sm btn-icon" title="Edit">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </Link>
                        <button onClick={() => setDeleteTarget(o)} className="btn btn-sm" style={{background:'rgba(229,62,62,0.15)',color:'#e53e3e',border:'none',borderRadius:'8px',width:'36px',height:'36px',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} title="Delete">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'24px',color:'#6c757d'}}>No officers found</td></tr>}
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Officer"
        message={`Delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!revokeTarget}
        title="Remove Portal Access"
        message={`Remove portal access for ${revokeTarget?.name}? They will no longer be able to sign in.`}
        confirmLabel="Remove Access"
        variant="danger"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />

      {grantTarget && grantStep !== 'done' && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',padding:20}} onClick={closeGrant}>
          <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0'}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:600}}>Grant Portal Access</h3>
              <p style={{margin:'4px 0 0',fontSize:13,color:'#6c757d'}}>{grantTarget.name} ({grantTarget.badge_no})</p>
            </div>

            {grantStep === 'email' && (
              <div style={{padding:'16px 24px 24px'}}>
                {otpError && (
                  <div style={{background:'rgba(229,62,62,0.1)',border:'1px solid #e53e3e',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#e53e3e'}}>{otpError}</div>
                )}
                <div className="cf-field">
                  <label className="cf-label required">Email (Login ID)</label>
                  <input className="cf-input" type="email" value={grantForm.email} onChange={e => setGrantForm({...grantForm, email: e.target.value})} required />
                </div>
                <div style={{display:'flex',gap:10,marginTop:8}}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleSendOtp} disabled={sendingOtp || !grantForm.email}>
                    {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeGrant}>Cancel</button>
                </div>
              </div>
            )}

            {grantStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} style={{padding:'16px 24px 24px'}}>
                {otpError && (
                  <div style={{background:'rgba(229,62,62,0.1)',border:'1px solid #e53e3e',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#e53e3e'}}>{otpError}</div>
                )}
                <div style={{background:'#f0f7ff',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#015C94'}}>
                  OTP sent to <strong>{grantForm.email}</strong>
                </div>
                <div className="cf-field">
                  <label className="cf-label required">Enter OTP</label>
                  <input
                    className="cf-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={grantForm.otp}
                    onChange={e => setGrantForm({...grantForm, otp: e.target.value.replace(/\D/g, '')})}
                    placeholder="6-digit OTP"
                    required
                    autoFocus
                    style={{fontSize:20,letterSpacing:8,textAlign:'center',fontWeight:700,fontFamily:'monospace'}}
                  />
                </div>
                <div style={{display:'flex',gap:10,marginTop:8}}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={verifyingOtp || grantForm.otp.length !== 6}>
                    {verifyingOtp ? 'Verifying...' : 'Verify & Grant Access'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleSendOtp} disabled={sendingOtp}>
                    Resend OTP
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={closeGrant}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {grantStep === 'done' && grantResult?.success && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',padding:20}} onClick={closeGrant}>
          <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0',textAlign:'center'}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(56,161,105,0.15)',color:'#38a169',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:24}}>✓</div>
              <h3 style={{margin:0,fontSize:15,fontWeight:600,color:'#38a169'}}>Access Granted!</h3>
            </div>
            <div style={{padding:'20px 24px'}}>
              <div style={{background:'#f8f9fa',borderRadius:8,padding:16}}>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:'#6c757d',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:2}}>Login Email</div>
                  <div style={{fontSize:15,fontWeight:600,color:'#2b2b2b'}}>{grantResult.user?.email}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:'#6c757d',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:2}}>Password</div>
                  <div style={{fontSize:15,fontWeight:600,color:'#2b2b2b',fontFamily:'monospace'}}>{grantResult.password}</div>
                </div>
              </div>
              <p style={{fontSize:12,color:'#6c757d',margin:'12px 0 0',textAlign:'center'}}>Share these credentials securely with the officer.</p>
            </div>
            <div style={{padding:'0 24px 20px',textAlign:'center'}}>
              <button className="btn btn-primary btn-sm" onClick={closeGrant}>Done</button>
            </div>
          </div>
        </div>
      )}

      {resetResult?.success && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',padding:20}} onClick={() => { setResetTarget(null); setResetResult(null); }}>
          <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0',textAlign:'center'}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(245,158,11,0.15)',color:'#d97706',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:24}}>⟳</div>
              <h3 style={{margin:0,fontSize:15,fontWeight:600,color:'#d97706'}}>Password Reset!</h3>
            </div>
            <div style={{padding:'20px 24px'}}>
              <div style={{background:'#f8f9fa',borderRadius:8,padding:16}}>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:'#6c757d',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:2}}>Login Email</div>
                  <div style={{fontSize:15,fontWeight:600,color:'#2b2b2b'}}>{resetResult.email}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:'#6c757d',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:2}}>New Password</div>
                  <div style={{fontSize:15,fontWeight:600,color:'#2b2b2b',fontFamily:'monospace'}}>{resetResult.password}</div>
                </div>
              </div>
              <p style={{fontSize:12,color:'#6c757d',margin:'12px 0 0',textAlign:'center'}}>Share this new password with the officer. All existing sessions have been terminated.</p>
            </div>
            <div style={{padding:'0 24px 20px',textAlign:'center'}}>
              <button className="btn btn-primary btn-sm" onClick={() => { setResetTarget(null); setResetResult(null); }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {resetTarget && !resetResult && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',padding:20}} onClick={() => { setResetTarget(null); setResetResult(null); }}>
          <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',padding:'24px'}} onClick={e => e.stopPropagation()}>
            <h3 style={{margin:'0 0 8px',fontSize:15,fontWeight:600}}>Reset Password</h3>
            <p style={{fontSize:13,color:'#6c757d',margin:'0 0 16px'}}>Set new password for <strong>{resetTarget?.name}</strong> ({resetTarget?.badge_no}). All active sessions will be terminated.</p>
            {resetResult && !resetResult.success && (
              <div style={{background:'rgba(229,62,62,0.1)',border:'1px solid #e53e3e',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#e53e3e'}}>{resetResult.message}</div>
            )}
            <div className="cf-field" style={{marginBottom:16}}>
              <label className="cf-label required">New Password</label>
              <input className="cf-input" type="text" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Type new password (min 6 chars)" minLength={6} />
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn btn-outline btn-sm" onClick={() => { setResetTarget(null); setResetResult(null); }}>Cancel</button>
              <button className="btn btn-sm" onClick={handleResetPassword} disabled={resetting || resetPassword.length < 6} style={{background:'#d97706',color:'#fff',border:'none',padding:'8px 16px',borderRadius:6,cursor:resetting||resetPassword.length<6?'not-allowed':'pointer',fontWeight:600,fontSize:13}}>
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
