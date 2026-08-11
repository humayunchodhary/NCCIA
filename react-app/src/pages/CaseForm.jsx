import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { useAutoRefresh } from '../utils/useAutoRefresh';

const CASE_STATUS = [
  { value: 'registered', name: 'Registered (Moharrar)' },
  { value: 'assigned', name: 'Assigned to IO' },
  { value: 'in_progress', name: 'In Progress (IO Investigating)' },
  { value: 'cfr_submitted', name: 'CFR Submitted' },
  { value: 'legal_review_dd', name: 'Legal Review - DD Legal' },
  { value: 'legal_review_ad', name: 'Legal Review - AD Legal' },
  { value: 'legal_review_dg', name: 'Legal Review - DG Legal' },
  { value: 'approved', name: 'Approved' },
  { value: 'closed', name: 'Closed' },
  { value: 'transferred', name: 'Transferred' },
  { value: 'merged', name: 'Merged' },
  { value: 'challan_submitted', name: 'Challan U/S 173 CrPC Submitted' },
];

const ACTIVITY_TYPES = [
  { value: 'dac_request', name: 'DAC Request' },
  { value: 'mobile_record', name: 'Mobile Record Obtained' },
  { value: 'bank_record', name: 'Bank Record Obtained' },
  { value: 'notice', name: 'Notice Issued' },
  { value: 'diary', name: 'Diary Maintained' },
  { value: 'seizure', name: 'Seizure Made' },
  { value: 'forensic_report', name: 'Forensic Report' },
  { value: 'recovery', name: 'Recovery Effected' },
  { value: 'raid', name: 'Raid Conducted' },
];

const RECOMMENDATIONS = [
  { value: 'transfer', name: 'Transfer' },
  { value: 'merge', name: 'Merge' },
  { value: 'challan_submission', name: 'Challan U/S 173 CrPC' },
];

const LEGAL_ROLES = ['dd_legal', 'ad_legal', 'dg_legal', 'additional_director'];
const LEGAL_DECISIONS = ['agree', 'disagree', 'review'];

const initialForm = {
  enquiry_id: '',
  fir_no: '',
  investigation_officer_id: '',
  status: 'registered',
  recommendation: '',
  transfer_department: '',
  transfer_circle: '',
  merge_complaint_id: '',
  activities: [],
  arrests: [],
  legal_opinions: [],
  approvals: [],
};

export default function CaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [enquiries, setEnquiries] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [legalOfficers, setLegalOfficers] = useState([]);
  const [circles, setCircles] = useState([]);
  const [circleIncharges, setCircleIncharges] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    api.get('/enquiries?status=registered,assigned,in_progress,cfr_submitted,approved,closed').then(r => { const d = r.data.data || r.data; setEnquiries((Array.isArray(d) ? d : []).map(e => ({ value: e.id, name: '#' + (e.enquiry_number || e.id) + ' — ' + (e.complaint?.tracking_no || e.complaint_id || 'N/A') }))); }).catch(() => {});
    api.get('/lookup/investigation-officers').then(r => { const d = r.data.data || r.data; setOfficers((Array.isArray(d) ? d : []).map(o => ({ value: o.id, name: o.name + (o.designation ? ' (' + o.designation + ')' : '') }))); }).catch(() => {});
    api.get('/lookup/legal-officers').then(r => setLegalOfficers(r.data.data || r.data)).catch(() => {});
    api.get('/lookup/circles').then(r => setCircles(r.data.data || r.data)).catch(() => {});
    api.get('/lookup/circle-incharges').then(r => { const d = r.data.data || r.data; setCircleIncharges(Array.isArray(d) ? d : []); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/cases/${id}`).then(r => {
        const d = r.data.data || r.data;
        setForm({
          enquiry_id: d.enquiry_id || d.enquiry?.id || '',
          fir_no: d.fir_no || '',
          investigation_officer_id: d.investigation_officer_id || '',
          status: d.status || 'registered',
          recommendation: d.recommendation || '',
          transfer_department: d.transfer_department || '',
          transfer_circle: d.transfer_circle || '',
          merge_complaint_id: d.merge_complaint_id || '',
          activities: (d.activities || []).map(a => ({
            id: a.id,
            type: a.type || '',
            description: a.description || '',
            activity_date: a.activity_date ? String(a.activity_date).slice(0, 10) : '',
            attachment: null,
          })),
          arrests: (d.arrests || []).map(a => ({
            id: a.id,
            accused_name: a.accused_name || '',
            cnic: a.cnic || '',
            arrest_date: a.arrest_date ? String(a.arrest_date).slice(0, 10) : '',
            remand_details: a.remand_details || '',
          })),
          legal_opinions: (d.legal_opinions || []).map(lo => ({
            id: lo.id,
            role: lo.role || '',
            opinion_text: lo.opinion_text || '',
            decision: lo.decision || '',
            created_by: lo.created_by || '',
          })),
          approvals: (d.approvals || []).map(ap => ({
            id: ap.id,
            circle_incharge_id: ap.circle_incharge_id || '',
            decision: ap.decision || '',
            remarks: ap.remarks || '',
          })),
        });
      }).catch(() => navigate('/cases'));
    }
  }, [id, navigate]);

  const reloadCase = () => {
    if (!id) return;
    api.get(`/cases/${id}`).then(r => {
      const d = r.data.data || r.data;
      setForm(f => ({
        ...f,
        enquiry_id: d.enquiry_id || d.enquiry?.id || f.enquiry_id,
        fir_no: d.fir_no || f.fir_no,
        investigation_officer_id: d.investigation_officer_id || '',
        status: d.status || f.status,
        recommendation: d.recommendation || '',
        transfer_department: d.transfer_department || '',
        transfer_circle: d.transfer_circle || '',
        merge_complaint_id: d.merge_complaint_id || '',
        activities: (d.activities || []).map(a => ({
          id: a.id,
          type: a.type || '',
          description: a.description || '',
          activity_date: a.activity_date ? String(a.activity_date).slice(0, 10) : '',
          attachment: null,
        })),
        arrests: (d.arrests || []).map(a => ({
          id: a.id,
          accused_name: a.accused_name || '',
          cnic: a.cnic || '',
          arrest_date: a.arrest_date ? String(a.arrest_date).slice(0, 10) : '',
          remand_details: a.remand_details || '',
        })),
        legal_opinions: (d.legal_opinions || []).map(lo => ({
          id: lo.id,
          role: lo.role || '',
          opinion_text: lo.opinion_text || '',
          decision: lo.decision || '',
          created_by: lo.created_by || '',
        })),
        approvals: (d.approvals || []).map(ap => ({
          id: ap.id,
          circle_incharge_id: ap.circle_incharge_id || '',
          decision: ap.decision || '',
          remarks: ap.remarks || '',
        })),
      }));
    }).catch(() => {});
  };

  useAutoRefresh(() => reloadCase(), [id], 30000);

  const setF = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Activities
  const addActivity = () => setForm(f => ({ ...f, activities: [...f.activities, { type: '', description: '', activity_date: new Date().toISOString().split('T')[0], attachment: null }] }));
  const removeActivity = (i) => setForm(f => ({ ...f, activities: f.activities.filter((_, idx) => idx !== i) }));
  const updateActivity = (i, field, value) => setForm(f => ({ ...f, activities: f.activities.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));
  const updateActivityFile = (i, file) => setForm(f => ({ ...f, activities: f.activities.map((a, idx) => idx === i ? { ...a, attachment: file } : a) }));

  // Arrests
  const addArrest = () => setForm(f => ({ ...f, arrests: [...f.arrests, { accused_name: '', cnic: '', arrest_date: new Date().toISOString().split('T')[0], remand_details: '' }] }));
  const removeArrest = (i) => setForm(f => ({ ...f, arrests: f.arrests.filter((_, idx) => idx !== i) }));
  const updateArrest = (i, field, value) => setForm(f => ({ ...f, arrests: f.arrests.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));

  // Legal Opinions
  const addLegalOpinion = () => setForm(f => ({ ...f, legal_opinions: [...f.legal_opinions, { role: '', opinion_text: '', decision: '', created_by: user?.id }] }));
  const removeLegalOpinion = (i) => setForm(f => ({ ...f, legal_opinions: f.legal_opinions.filter((_, idx) => idx !== i) }));
  const updateLegalOpinion = (i, field, value) => setForm(f => ({ ...f, legal_opinions: f.legal_opinions.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));

  // Approvals
  const addApproval = () => setForm(f => ({ ...f, approvals: [...f.approvals, { circle_incharge_id: '', decision: '', remarks: '' }] }));
  const removeApproval = (i) => setForm(f => ({ ...f, approvals: f.approvals.filter((_, idx) => idx !== i) }));
  const updateApproval = (i, field, value) => setForm(f => ({ ...f, approvals: f.approvals.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));

  const buildPayload = () => ({
    enquiry_id: form.enquiry_id || undefined,
    fir_no: form.fir_no || undefined,
    investigation_officer_id: form.investigation_officer_id || undefined,
    status: form.status,
    recommendation: form.recommendation || undefined,
    transfer_department: form.transfer_department || undefined,
    transfer_circle: form.transfer_circle || undefined,
    merge_complaint_id: form.merge_complaint_id || undefined,
    activities: form.activities
      .filter(a => a.type)
      .map(a => ({
        id: a.id,
        type: a.type,
        description: a.description,
        activity_date: a.activity_date,
      })),
    arrests: form.arrests.filter(a => a.accused_name),
    legal_opinions: form.legal_opinions.filter(lo => lo.role),
    approvals: form.approvals.filter(ap => ap.decision),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setServerError('');
    try {
      const payload = buildPayload();
      if (id) {
        await api.put(`/cases/${id}`, payload);
      } else {
        await api.post('/cases', payload);
      }
      navigate('/cases');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
        setServerError('Please fix the highlighted fields below.');
      } else {
        setServerError(res?.message || 'Error saving case. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, field, opts = {}) => {
    const { type = 'text', placeholder = '', required = false, options = null, rows = null, readOnly = false } = opts;
    const fieldErr = errors[field];
    return (
      <div className="cf-field">
        <label className={`cf-label${required ? ' required' : ''}`}>{label}</label>
        {readOnly ? (
          <div className="cf-input" style={{ padding: '9px 14px', background: '#f5f5f5', color: '#555', borderRadius: 'var(--border-radius-sm)', fontSize: 13, border: fieldErr ? '1.5px solid #e53e3e' : '1.5px solid var(--border)' }}>
            {form[field] || '-'}
          </div>
        ) : options ? (
          <select className="cf-input" value={form[field]} onChange={setF(field)} required={required} style={fieldErr ? { borderColor: '#e53e3e' } : {}}>
            <option value="">Select {label}</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
          </select>
        ) : rows ? (
          <textarea className="cf-input" value={form[field]} onChange={setF(field)} placeholder={placeholder} rows={rows} required={required} style={fieldErr ? { borderColor: '#e53e3e' } : {}} />
        ) : (
          <input type={type} className="cf-input" value={form[field]} onChange={setF(field)} placeholder={placeholder} required={required} style={fieldErr ? { borderColor: '#e53e3e' } : {}} />
        )}
        {fieldErr && <div className="cf-error">{fieldErr}</div>}
      </div>
    );
  };

  return (
    <div className="page-content" style={{ margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div className="page-header">
          <div className="page-title-group">
            <h1 className="page-title">{id ? 'Edit Case/FIR' : 'New Case/FIR'}</h1>
            <p className="page-subtitle">{id ? 'Update case details' : 'Register a new case/FIR'}</p>
            <div className="title-underline"></div>
          </div>
        </div>

        <div className="cf-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '4px' }}>
          {['details', 'activities', 'arrests', 'legal', 'approvals', 'outcome'].map(tab => (
            <button type="button" className={`cf-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', border: 'none', background: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? '#fff' : '#666', borderRadius: '8px 8px 0 0', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              {tab === 'details' && 'Details'}
              {tab === 'activities' && 'Activities'}
              {tab === 'arrests' && 'Arrests'}
              {tab === 'legal' && 'Legal Opinions'}
              {tab === 'approvals' && 'Approvals'}
              {tab === 'outcome' && 'Outcome'}
            </button>
          ))}
        </div>

        {serverError && (
          <div className="cf-alert cf-alert-error" style={{ marginBottom: 20 }}>{serverError}
            {Object.keys(errors).length > 0 && <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>{Object.entries(errors).map(([k, v]) => <li key={k}><strong>{k}:</strong> {Array.isArray(v) ? v.join(', ') : v}</li>)}</ul>}
          </div>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <>
            <div className="cf-section">
              <div className="cf-section-header">
                <div className="cf-section-icon" style={{ background: '#015C94' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div><div className="cf-section-title">Case Reference</div><div className="cf-section-sub">Link to enquiry, auto-generate FIR number</div></div>
                <div className="cf-section-badge">STEP 1</div>
              </div>
              <div className="cf-body">
                <div className="cf-row-3">
                  {renderField('Enquiry', 'enquiry_id', { required: true, options: enquiries })}
                  {renderField('FIR Number', 'fir_no', { placeholder: 'Auto-generated or manual' })}
                  {renderField('Status', 'status', { options: CASE_STATUS, required: true })}
                </div>
              </div>
            </div>

            <div className="cf-section">
              <div className="cf-section-header">
                <div className="cf-section-icon" style={{ background: '#2B2B2B' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div><div className="cf-section-title">Assignment</div><div className="cf-section-sub">Moharrar assigns Investigation Officer</div></div>
                <div className="cf-section-badge">STEP 2</div>
              </div>
              <div className="cf-body">
                <div className="cf-row-3">
                  {renderField('Investigation Officer', 'investigation_officer_id', { required: true, options: officers })}
                  {renderField('Recommendation', 'recommendation', { options: RECOMMENDATIONS })}
                </div>
                <div className="cf-row-2">
                  {renderField('Transfer Department', 'transfer_department')}
                  {renderField('Transfer Circle', 'transfer_circle', { options: circles })}
                </div>
                {renderField('Merge Complaint ID', 'merge_complaint_id', { placeholder: 'Complaint ID to merge with' })}
              </div>
            </div>
          </>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === 'activities' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#264078' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <div><div className="cf-section-title">Investigation Activities</div><div className="cf-section-sub">DAC, Mobile/Bank Records, Notices, Diaries, Seizures, Forensic, Recoveries, Raids</div></div>
              <div className="cf-section-badge">STEP 3</div>
            </div>
            <div className="cf-body">
              <button type="button" className="btn btn-outline btn-sm" onClick={addActivity} style={{ marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Activity
              </button>
              {form.activities.map((a, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Activity Type</label>
                      <select className="cf-input" value={a.type} onChange={e => updateActivity(i, 'type', e.target.value)}>
                        <option value="">— Select Type —</option>
                        {ACTIVITY_TYPES.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Date</label>
                      <input type="date" className="cf-input" value={a.activity_date} onChange={e => updateActivity(i, 'activity_date', e.target.value)} />
                    </div>
                    <div className="cf-field"><label className="cf-label">Attachment</label>
                      <input type="file" className="cf-input" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => updateActivityFile(i, e.target.files[0])} />
                    </div>
                    <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeActivity(i)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div className="cf-field"><label className="cf-label">Description</label>
                    <textarea className="cf-input" rows={3} value={a.description} onChange={e => updateActivity(i, 'description', e.target.value)} placeholder="Describe the activity…" style={{ width: '100%' }}></textarea>
                  </div>
                </div>
              ))}
              {form.activities.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No activities added yet. Click "Add Activity" to start.</p>}
            </div>
          </div>
        )}

        {/* ARRESTS TAB */}
        {activeTab === 'arrests' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#015C94' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div><div className="cf-section-title">Arrests</div><div className="cf-section-sub">Record arrests with accused details and remand information</div></div>
              <div className="cf-section-badge">STEP 4</div>
            </div>
            <div className="cf-body">
              <button type="button" className="btn btn-outline btn-sm" onClick={addArrest} style={{ marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Arrest
              </button>
              {form.arrests.map((a, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label required">Accused Name</label>
                      <input type="text" className="cf-input" value={a.accused_name} onChange={e => updateArrest(i, 'accused_name', e.target.value)} placeholder="Accused name" required />
                    </div>
                    <div className="cf-field"><label className="cf-label required">CNIC</label>
                      <input type="text" className="cf-input font-mono" value={a.cnic} onChange={e => {let v=e.target.value.replace(/\D/g,'').slice(0,13);if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5);if(v.length>13)v=v.slice(0,13)+'-'+v.slice(13);updateArrest(i,'cnic',v);}} maxLength={15} placeholder="00000-0000000-0" required />
                    </div>
                    <div className="cf-field"><label className="cf-label required">Arrest Date</label>
                      <input type="date" className="cf-input" value={a.arrest_date} onChange={e => updateArrest(i, 'arrest_date', e.target.value)} required />
                    </div>
                    <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeArrest(i)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div className="cf-field"><label className="cf-label">Remand Details</label>
                    <textarea className="cf-input" rows={2} value={a.remand_details} onChange={e => updateArrest(i, 'remand_details', e.target.value)} placeholder="Remand details, court orders, etc." style={{ width: '100%' }}></textarea>
                  </div>
                </div>
              ))}
              {form.arrests.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No arrests recorded yet.</p>}
            </div>
          </div>
        )}

        {/* LEGAL OPINIONS TAB */}
        {activeTab === 'legal' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#015C94' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div><div className="cf-section-title">Legal Opinion Chain</div><div className="cf-section-sub">DD Legal → AD Legal → Additional Director → DG Legal</div></div>
              <div className="cf-section-badge">STEP 5</div>
            </div>
            <div className="cf-body">
              <button type="button" className="btn btn-outline btn-sm" onClick={addLegalOpinion} style={{ marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Legal Opinion
              </button>
              {form.legal_opinions.map((lo, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Role</label>
                      <select className="cf-input" value={lo.role} onChange={e => updateLegalOpinion(i, 'role', e.target.value)}>
                        <option value="">— Select Role —</option>
                        {LEGAL_ROLES.map(r => <option key={r} value={r}>{r.toUpperCase().replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Decision</label>
                      <select className="cf-input" value={lo.decision} onChange={e => updateLegalOpinion(i, 'decision', e.target.value)}>
                        <option value="">— Select —</option>
                        {LEGAL_DECISIONS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Officer</label>
                      <select className="cf-input" value={lo.created_by} onChange={e => updateLegalOpinion(i, 'created_by', e.target.value)}>
                        <option value="">— Select Officer —</option>
                        {legalOfficers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.designation})</option>)}
                      </select>
                    </div>
                    <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeLegalOpinion(i)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div className="cf-field"><label className="cf-label">Opinion Text</label>
                    <textarea className="cf-input" rows={3} value={lo.opinion_text} onChange={e => updateLegalOpinion(i, 'opinion_text', e.target.value)} placeholder="Enter legal opinion…" style={{ width: '100%' }}></textarea>
                  </div>
                </div>
              ))}
              {form.legal_opinions.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No legal opinions added yet.</p>}
            </div>
          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#2B2B2B' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div><div className="cf-section-title">Circle Incharge Approvals</div><div className="cf-section-sub">Approval chain for case finalization</div></div>
              <div className="cf-section-badge">STEP 6</div>
            </div>
            <div className="cf-body">
              <button type="button" className="btn btn-outline btn-sm" onClick={addApproval} style={{ marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Approval
              </button>
              {form.approvals.map((ap, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Circle Incharge</label>
                      <select className="cf-input" value={ap.circle_incharge_id} onChange={e => updateApproval(i, 'circle_incharge_id', e.target.value)}>
                        <option value="">— Select —</option>
                        {circleIncharges.map(o => <option key={o.id} value={o.id}>{o.name}{o.designation ? ' (' + o.designation + ')' : ''}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Decision</label>
                      <select className="cf-input" value={ap.decision} onChange={e => updateApproval(i, 'decision', e.target.value)}>
                        <option value="">— Select —</option>
                        <option value="agree">Agree</option>
                        <option value="review">Review</option>
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Remarks</label>
                      <input type="text" className="cf-input" value={ap.remarks} onChange={e => updateApproval(i, 'remarks', e.target.value)} placeholder="Remarks" />
                    </div>
                    <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeApproval(i)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              {form.approvals.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No approvals added yet.</p>}
            </div>
          </div>
        )}

        {/* OUTCOME TAB */}
        {activeTab === 'outcome' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#015C94' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div><div className="cf-section-title">Final Outcome</div><div className="cf-section-sub">Challan U/S 173 CrPC / Transfer / Merge / Closure</div></div>
              <div className="cf-section-badge">STEP 7</div>
            </div>
            <div className="cf-body">
              <div className="cf-row-3">
                {renderField('Recommendation', 'recommendation', { options: RECOMMENDATIONS, required: true })}
              </div>
              <div className="cf-row-2">
                {renderField('Transfer Department', 'transfer_department')}
                {renderField('Transfer Circle', 'transfer_circle', { options: circles })}
              </div>
              {renderField('Merge Complaint ID', 'merge_complaint_id', { placeholder: 'Complaint ID to merge with' })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <Link to="/cases" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: '#015C94', color: '#fff', padding: '12px 24px', fontWeight: 600, fontSize: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
            {saving ? 'Saving...' : (id ? 'Update Case' : 'Register Case/FIR')}
          </button>
        </div>
      </form>
    </div>
  );
}