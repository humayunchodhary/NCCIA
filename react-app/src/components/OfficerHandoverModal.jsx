import { useState, useEffect } from 'react';
import api from '../api';

export default function OfficerHandoverModal({ officer, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [actionType, setActionType] = useState('transfer'); // 'transfer' | 'suspend' | 'reassign' | 'reinstate'
  const [sameRoleOnly, setSameRoleOnly] = useState(true);
  const [targetOfficerId, setTargetOfficerId] = useState('');
  const [newCircleId, setNewCircleId] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen && officer?.id) {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      setTargetOfficerId('');
      setNewCircleId('');
      setOrderNo('');
      setReason('');
      setSameRoleOnly(true);

      // Default action based on officer status
      if (officer.status === 'suspended') {
        setActionType('reinstate');
      } else {
        setActionType('transfer');
      }

      api.get(`/officers/${officer.id}/caseload`)
        .then(res => {
          setData(res.data);
          // Prefer same-role officer if available
          const officersList = res.data.eligible_officers || [];
          const sameRoleList = officersList.filter(o => o.is_same_role);
          if (sameRoleList.length > 0) {
            setSameRoleOnly(true);
            setTargetOfficerId(String(sameRoleList[0].id));
          } else if (officersList.length > 0) {
            // If no same role officer exists in circle, fall back to all roles
            setSameRoleOnly(false);
            setTargetOfficerId(String(officersList[0].id));
          }
        })
        .catch(err => {
          setError(err.response?.data?.message || err.message || 'Failed to load officer caseload.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, officer]);

  if (!isOpen || !officer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide the official reason or order justification.');
      return;
    }

    const hasActiveCases = (data?.counts?.total_active || 0) > 0;
    if (hasActiveCases && actionType !== 'reinstate' && !targetOfficerId) {
      setError('Please select a replacement officer to receive the active cases and files.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        action_type: actionType,
        target_officer_id: targetOfficerId ? Number(targetOfficerId) : null,
        new_circle_id: newCircleId ? Number(newCircleId) : null,
        order_no: orderNo.trim() || null,
        reason: reason.trim(),
      };

      const res = await api.post(`/officers/${officer.id}/handover`, payload);
      setSuccessMsg(res.data.message || 'Handover executed successfully.');

      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to execute handover.');
    } finally {
      setSubmitting(false);
    }
  };

  const counts = data?.counts || { verifications: 0, enquiries: 0, cases: 0, total_active: 0 };
  const eligibleOfficers = data?.eligible_officers || [];
  const circles = data?.circles || [];

  const officerRoleLabel = officer.role
    ? officer.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : (officer.designation || 'Officer');

  const sameRoleOfficers = eligibleOfficers.filter(o => o.is_same_role);
  const otherRoleOfficers = eligibleOfficers.filter(o => !o.is_same_role);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 16
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 680,
        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#013658', color: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🔄</span>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Officer Lifecycle &amp; Caseload Handover Protocol
              </h2>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>
              Safe transfer, suspension &amp; workload reassignment with full legal history preservation
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              <div>Retrieving officer caseload and active files...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Error Alert */}
              {error && (
                <div style={{
                  padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5',
                  borderRadius: 8, color: '#991b1b', fontSize: 13, marginBottom: 16, fontWeight: 600
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div style={{
                  padding: '10px 14px', background: '#dcfce7', border: '1px solid #86efac',
                  borderRadius: 8, color: '#166534', fontSize: 13, marginBottom: 16, fontWeight: 700
                }}>
                  ✓ {successMsg}
                </div>
              )}

              {/* Officer Card */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '14px 18px', marginBottom: 18, display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: '#015C94',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 16
                  }}>
                    {officer.name ? officer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'OF'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>
                      {officer.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {officer.designation || officer.role} • <strong>{officer.circle_name || 'Circle'}</strong>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{officer.email}</div>
                  </div>
                </div>

                <div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 800,
                    background: officer.status === 'suspended' ? '#fee2e2' : '#dcfce7',
                    color: officer.status === 'suspended' ? '#b91c1c' : '#15803d'
                  }}>
                    ● {officer.status === 'suspended' ? 'Suspended' : 'Active Duty'}
                  </span>
                </div>
              </div>

              {/* Active Caseload Cards */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                  Current Active Caseload (Files to be Safely Handed Over)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{counts.verifications}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#15803d' }}>Verifications</div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>{counts.enquiries}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#d97706' }}>Enquiries</div>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8' }}>{counts.cases}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#2563eb' }}>FIR Cases</div>
                  </div>
                  <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#6d28d9' }}>{counts.total_active}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed' }}>Total Active Files</div>
                  </div>
                </div>
              </div>

              {/* Action Selection Tabs */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Select Lifecycle Action:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActionType('transfer')}
                    style={{
                      padding: '8px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid',
                      borderColor: actionType === 'transfer' ? '#015C94' : '#cbd5e1',
                      background: actionType === 'transfer' ? '#e0f2fe' : '#fff',
                      color: actionType === 'transfer' ? '#0369a1' : '#475569'
                    }}
                  >
                    🔄 Transfer Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('suspend')}
                    style={{
                      padding: '8px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid',
                      borderColor: actionType === 'suspend' ? '#dc2626' : '#cbd5e1',
                      background: actionType === 'suspend' ? '#fee2e2' : '#fff',
                      color: actionType === 'suspend' ? '#b91c1c' : '#475569'
                    }}
                  >
                    ⛔ Suspend Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('reassign')}
                    style={{
                      padding: '8px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid',
                      borderColor: actionType === 'reassign' ? '#f59e0b' : '#cbd5e1',
                      background: actionType === 'reassign' ? '#fef3c7' : '#fff',
                      color: actionType === 'reassign' ? '#b45309' : '#475569'
                    }}
                  >
                    👥 Relieve Workload
                  </button>
                  {officer.status === 'suspended' && (
                    <button
                      type="button"
                      onClick={() => setActionType('reinstate')}
                      style={{
                        padding: '8px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                        cursor: 'pointer', border: '1px solid',
                        borderColor: actionType === 'reinstate' ? '#16a34a' : '#cbd5e1',
                        background: actionType === 'reinstate' ? '#dcfce7' : '#fff',
                        color: actionType === 'reinstate' ? '#15803d' : '#475569'
                      }}
                    >
                      ✅ Reinstate to Duty
                    </button>
                  )}
                </div>
              </div>

              {/* Action Description Alert */}
              <div style={{
                background: actionType === 'suspend' ? '#fff1f2' : (actionType === 'transfer' ? '#f0f9ff' : '#fefce8'),
                border: '1px solid',
                borderColor: actionType === 'suspend' ? '#fecdd3' : (actionType === 'transfer' ? '#bae6fd' : '#fef08a'),
                borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12.5,
                color: actionType === 'suspend' ? '#9f1239' : (actionType === 'transfer' ? '#0369a1' : '#854d0e')
              }}>
                {actionType === 'transfer' && (
                  <div>
                    <strong>🔄 Transfer Protocol:</strong> Officer will be moved to the new circle. Their current active files in {officer.circle_name || 'this circle'} will be handed over to the selected replacement officer with an immutable handover snapshot.
                  </div>
                )}
                {actionType === 'suspend' && (
                  <div>
                    <strong>⛔ Suspension Protocol:</strong> Officer login access will be immediately blocked to prevent tampering. All active files in {officer.circle_name || 'this circle'} will immediately transfer to the replacement officer.
                  </div>
                )}
                {actionType === 'reassign' && (
                  <div>
                    <strong>👥 Workload Handover:</strong> Officer remains active, but their currently pending files are handed over to another officer to balance caseloads or accommodate leave.
                  </div>
                )}
                {actionType === 'reinstate' && (
                  <div>
                    <strong>✅ Reinstatement:</strong> Officer's suspension is revoked and account restored to Active status.
                  </div>
                )}
              </div>

              {/* Destination Circle (Only for Transfer) */}
              {actionType === 'transfer' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    New Circle Posting:
                  </label>
                  <select
                    className="filter-select"
                    value={newCircleId}
                    onChange={e => setNewCircleId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  >
                    <option value="">— Select Target Circle —</option>
                    {circles.filter(c => String(c.id) !== String(officer.circle_id)).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.code ? `(${c.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Replacement Officer */}
              {actionType !== 'reinstate' && counts.total_active > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', margin: 0 }}>
                      Select Replacement Officer in {officer.circle_name || 'this Circle'}: <span style={{ color: '#dc2626' }}>*</span>
                    </label>

                    {/* Role Filter Tabs (Same Role vs All Roles) */}
                    <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: 6, padding: 2 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSameRoleOnly(true);
                          if (sameRoleOfficers.length > 0 && !sameRoleOfficers.some(o => String(o.id) === targetOfficerId)) {
                            setTargetOfficerId(String(sameRoleOfficers[0].id));
                          }
                        }}
                        style={{
                          padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                          background: sameRoleOnly ? '#015C94' : 'transparent',
                          color: sameRoleOnly ? '#fff' : '#475569',
                          transition: 'all 0.15s'
                        }}
                      >
                        🎯 Same Role Only ({officerRoleLabel}) {sameRoleOfficers.length > 0 ? `(${sameRoleOfficers.length})` : ''}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSameRoleOnly(false)}
                        style={{
                          padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                          background: !sameRoleOnly ? '#015C94' : 'transparent',
                          color: !sameRoleOnly ? '#fff' : '#475569',
                          transition: 'all 0.15s'
                        }}
                      >
                        🌐 All Roles ({eligibleOfficers.length})
                      </button>
                    </div>
                  </div>

                  {sameRoleOnly && sameRoleOfficers.length === 0 ? (
                    <div style={{
                      padding: '10px 12px', background: '#fffbeb', border: '1px solid #fef3c7',
                      borderRadius: 8, fontSize: 12, color: '#b45309', marginBottom: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
                    }}>
                      <span>⚠️ No other <strong>{officerRoleLabel}</strong> found in {officer.circle_name || 'this Circle'}.</span>
                      <button
                        type="button"
                        onClick={() => setSameRoleOnly(false)}
                        style={{
                          background: '#b45309', color: '#fff', border: 'none', padding: '4px 10px',
                          borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0
                        }}
                      >
                        Show All Roles (Incharge / Others)
                      </button>
                    </div>
                  ) : null}

                  <select
                    className="filter-select"
                    value={targetOfficerId}
                    onChange={e => setTargetOfficerId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
                  >
                    <option value="">— Select Officer to Take Over Active Files —</option>
                    {sameRoleOnly ? (
                      sameRoleOfficers.map(off => (
                        <option key={off.id} value={off.id}>
                          ⭐ {off.name} ({off.designation || off.role_label}) — Same Role ({officerRoleLabel})
                        </option>
                      ))
                    ) : (
                      <>
                        {sameRoleOfficers.length > 0 && (
                          <optgroup label={`★ Recommended (Same Role: ${officerRoleLabel})`}>
                            {sameRoleOfficers.map(off => (
                              <option key={off.id} value={off.id}>
                                ⭐ {off.name} ({off.designation || off.role_label})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {otherRoleOfficers.length > 0 && (
                          <optgroup label="Other Officers in Circle (Circle Incharge / Cross-Role Handover)">
                            {otherRoleOfficers.map(off => (
                              <option key={off.id} value={off.id}>
                                {off.name} ({off.designation || off.role_label})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    )}
                  </select>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {sameRoleOnly
                      ? `🔒 Showing only ${officerRoleLabel}s. To allow handover to Circle Incharge or other officers, click "All Roles".`
                      : `ℹ️ Showing all active officers in ${officer.circle_name || 'this circle'}. (Same role officers marked with ⭐).`}
                  </div>
                </div>
              )}

              {/* Order Number & Official Reason */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Order / Ref No (Optional):
                  </label>
                  <input
                    type="text"
                    className="filter-input"
                    value={orderNo}
                    onChange={e => setOrderNo(e.target.value)}
                    placeholder="e.g. NCCIA/HQ/2026/89"
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Official Reason / Remarks: <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="filter-input"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Transferred vide order / Suspended pending inquiry"
                    required
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12.5 }}
                  />
                </div>
              </div>

              {/* Law Enforcement Historical Integrity Notice */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '10px 14px', marginBottom: 20, fontSize: 11.5, color: '#475569', lineHeight: 1.5
              }}>
                ⚖️ <strong>Legal Record Guarantee:</strong> All past case diaries, evidence collection entries, seizures, and CFR recommendations previously completed by <strong>{officer.name}</strong> remain permanently locked under their name in the chain of custody. Only open/pending steps transfer to the replacement officer.
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  style={{
                    padding: '8px 18px', background: '#f1f5f9', color: '#334155',
                    border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 22px', border: 'none', borderRadius: 6,
                    fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                    color: '#fff',
                    background: actionType === 'suspend' ? '#dc2626' : (actionType === 'transfer' ? '#015C94' : '#16a34a'),
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  {submitting ? 'Executing Protocol...' : `Confirm & Execute ${actionType.toUpperCase()}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
