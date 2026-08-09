import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import SearchableSelect from '../components/SearchableSelect';

const ENQUIRY_STATUS = [
  { value: 'registered', name: 'Registered (Reader Branch)' },
  { value: 'assigned', name: 'Assigned to IO' },
  { value: 'in_progress', name: 'In Progress (IO Conducting Enquiry)' },
  { value: 'cfr_submitted', name: 'CFR Submitted' },
  { value: 'legal_review_dd', name: 'Legal Review - DD Legal' },
  { value: 'legal_review_ad', name: 'Legal Review - AD Legal' },
  { value: 'legal_review_dg', name: 'Legal Review - DG Legal' },
  { value: 'approved', name: 'Approved' },
  { value: 'closed', name: 'Closed' },
  { value: 'transferred', name: 'Transferred' },
  { value: 'converted_to_case', name: 'Converted to Case' },
  { value: 'referred_court', name: 'Referred to Court' },
];

const LEGAL_ROLES = ['dd_legal', 'ad_legal', 'additional_director'];
const LEGAL_DECISIONS = ['agree', 'disagree', 'review'];

const ACTIVITY_TYPES = [
  { value: 'dac_request', name: 'DAC (Departmental Accounts Committee)' },
  { value: 'bank_record', name: 'Bank Enquiry' },
  { value: 'search_seize', name: 'Search Operation' },
  { value: 'notices', name: 'Notice Issued' },
  { value: 'diaries', name: 'Diary Entry' },
  { value: 'seizures', name: 'Seizure Memo' },
  { value: 'recoveries', name: 'Recovery' },
  { value: 'cfr', name: 'CFR (Challan/Final Report)' },
  { value: 'other', name: 'Other' },
];

const RECOMMENDATIONS = [
  { value: 'closure', name: 'Closure' },
  { value: 'transfer', name: 'Transfer' },
  { value: 'convert_to_case', name: 'Convert to Case' },
];

const CLOSURE_REASONS = [
  { value: 'non_pursuance', name: 'Non-Pursuance by Complainant' },
  { value: 'irrelevant', name: 'Irrelevant' },
  { value: 'invalid', name: 'Invalid' },
  { value: 'lack_of_evidence', name: 'Lack of Evidence' },
  { value: 'compromise', name: 'Compromise (Parties Settled)' },
];

const NOTICE_VIA_OPTIONS = [
  { value: 'whatsapp', name: 'WhatsApp' },
  { value: 'sms', name: 'SMS' },
  { value: 'email', name: 'Email' },
  { value: 'phone', name: 'Phone' },
  { value: 'fax', name: 'Fax' },
  { value: 'postal', name: 'Postal' },
  { value: 'call', name: 'Call' },
];

const PERSON_TYPE_OPTIONS = [
  { value: 'complainant', name: 'Complainant' },
  { value: 'accused', name: 'Accused' },
  { value: 'witness', name: 'Witness' },
];

const NOTICE_STATUS_OPTIONS = [
  { value: 'issued', name: 'Issued' },
  { value: 'served', name: 'Served / Appeared' },
  { value: 'unserved', name: 'Unserved' },
  { value: 'non_appearance', name: 'Non-Appearance' },
];

const NOTICE_TYPE_OPTIONS = [
  { value: 'Summon', name: 'Summon' },
  { value: 'Warning', name: 'Warning' },
  { value: 'Final Notice', name: 'Final Notice' },
  { value: 'Show Cause', name: 'Show Cause' },
  { value: 'Other', name: 'Other' },
];

const initialForm = {
  complaint_id: '',
  tracking_no: '',
  enquiry_number: '',
  status: 'registered',
  enquiry_officer_id: '',
  recommendation: '',
  closure_reason: '',
  transfer_department: '',
  transfer_circle: '',
  merge_complaint_id: '',
  activities: [],
  legal_opinions: [],
  approvals: [],
  witnesses: [],
  notices: [],
  technical_report: '',
  forensic_report: '',
};

export default function EnquiryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [legalOfficers, setLegalOfficers] = useState([]);
  const [circles, setCircles] = useState([]);
  const [circleIncharges, setCircleIncharges] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [technicalFile, setTechnicalFile] = useState(null);
  const [forensicFile, setForensicFile] = useState(null);
  const [technicalReportUrl, setTechnicalReportUrl] = useState('');
  const [forensicReportUrl, setForensicReportUrl] = useState('');

  const roleNames = user?.roles?.map?.(r => r.name) || [user?.role].filter(Boolean);
  const isPrivileged = roleNames.some(r => ['admin', 'circle_incharge'].includes(r));

  const officerName = officers.find(o => String(o.value) === String(form.enquiry_officer_id))?.name || '';
  const recName = RECOMMENDATIONS.find(o => o.value === form.recommendation)?.name || '';
  const closureName = CLOSURE_REASONS.find(o => o.value === form.closure_reason)?.name || '';
  const transferCircleName = circles.find(c => String(c.id) === String(form.transfer_circle) || c.name === form.transfer_circle)?.name || '';

  useEffect(() => {
    api.get('/complaints?status=complete').then(r => setComplaints(r.data.data || r.data)).catch(() => {});
    api.get('/lookup/enquiry-officers').then(r => { const d = r.data.data || r.data; setOfficers((Array.isArray(d) ? d : []).map(o => ({ value: o.id, name: o.name + (o.designation ? ' (' + o.designation + ')' : '') }))); }).catch(() => {});
    api.get('/lookup/legal-officers').then(r => setLegalOfficers(r.data.data || r.data)).catch(() => {});
    api.get('/lookup/circles').then(r => setCircles(r.data.data || r.data)).catch(() => {});
    api.get('/lookup/circle-incharges').then(r => { const d = r.data.data || r.data; setCircleIncharges(Array.isArray(d) ? d : []); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/enquiries/${id}`).then(r => {
        const d = r.data.data || r.data;
        if (d.technical_report_attachment) setTechnicalReportUrl(d.technical_report_attachment);
        if (d.forensic_report_attachment) setForensicReportUrl(d.forensic_report_attachment);
        const toDate = (v) => (v ? String(v).slice(0, 10) : '');
        setForm(f => ({
          ...f,
          complaint_id: d.complaint_id || d.complaint?.id || '',
          tracking_no: d.complaint?.tracking_no || d.tracking_no || '',
          enquiry_number: d.enquiry_number || '',
          status: d.status || 'registered',
          enquiry_officer_id: d.enquiry_officer_id || '',
          recommendation: d.recommendation || '',
          closure_reason: d.closure_reason || '',
          transfer_department: d.transfer_department || '',
          transfer_circle: d.transfer_circle || '',
          merge_complaint_id: d.merge_complaint?.tracking_no || d.merge_complaint_id || '',
          cfr_summary: d.cfr_summary || '',
          technical_report: d.technical_report || '',
          forensic_report: d.forensic_report || '',
          activities: (d.activities || []).map(a => ({
            id: a.id,
            type: a.type || '',
            description: a.description || '',
            activity_date: toDate(a.activity_date),
            attachment_path: a.attachment_path || '',
          })),
          witnesses: (d.witnesses || []).map(w => ({
            id: w.id,
            name: w.name || '',
            cnic: w.cnic || '',
            nationality: w.nationality || '',
            passport: w.passport || '',
            address: w.address || '',
            attachment: w.attachment || '',
          })),
          notices: (d.notices || []).map(n => ({
            id: n.id,
            notice_number: n.notice_number || '',
            notice_type: n.notice_type || '',
            receiver_name: n.receiver_name || '',
            person_type: n.person_type || '',
            notice_via: n.notice_via || '',
            notice_date: toDate(n.notice_date),
            address: n.address || '',
            phone: n.phone || '',
            description: n.description || '',
            status: n.status || 'issued',
          })),
          legal_opinions: (d.legal_opinions || []).map(lo => ({
            id: lo.id,
            role: lo.role || '',
            opinion_text: lo.opinion_text || '',
            decision: lo.decision || '',
          })),
          approvals: (d.approvals || []).map(ap => ({
            id: ap.id,
            circle_incharge_id: ap.circle_incharge_id || '',
            decision: ap.decision || 'agree',
            remarks: ap.remarks || '',
          })),
        }));
      }).catch(() => navigate('/enquiries'));
    }
  }, [id, navigate]);

  const handleTrackingChange = (e) => {
    const tracking = e.target.value;
    setForm(f => ({ ...f, tracking_no: tracking }));
    const comp = complaints.find(c => c.tracking_no === tracking);
    if (comp) {
      setForm(f => ({ ...f, complaint_id: comp.id }));
    }
  };

  const setF = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setFNum = (field) => (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (field === 'cnic') {
      if (val.length > 5) val = val.slice(0,5) + '-' + val.slice(5);
      if (val.length > 13) val = val.slice(0,13) + '-' + val.slice(13);
    }
    setForm(f => ({ ...f, [field]: val }));
  };

  // Activities
  const addActivity = () => setForm(f => ({ ...f, activities: [...f.activities, { type: '', description: '', activity_date: new Date().toISOString().split('T')[0], attachment: null }] }));
  const removeActivity = (i) => setForm(f => ({ ...f, activities: f.activities.filter((_, idx) => idx !== i) }));
  const updateActivity = (i, field, value) => setForm(f => ({ ...f, activities: f.activities.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));
  const updateActivityFile = (i, file) => setForm(f => ({ ...f, activities: f.activities.map((a, idx) => idx === i ? { ...a, attachment: file } : a) }));

  // Legal Opinions
  const addLegalOpinion = () => setForm(f => ({ ...f, legal_opinions: [...f.legal_opinions, { role: '', opinion_text: '', decision: '', created_by: user?.id }] }));
  const removeLegalOpinion = (i) => setForm(f => ({ ...f, legal_opinions: f.legal_opinions.filter((_, idx) => idx !== i) }));
  const updateLegalOpinion = (i, field, value) => setForm(f => ({ ...f, legal_opinions: f.legal_opinions.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));

  // Approvals
  const addApproval = () => setForm(f => ({ ...f, approvals: [...f.approvals, { circle_incharge_id: '', decision: '', remarks: '' }] }));
  const removeApproval = (i) => setForm(f => ({ ...f, approvals: f.approvals.filter((_, idx) => idx !== i) }));
  const updateApproval = (i, field, value) => setForm(f => ({ ...f, approvals: f.approvals.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));

  // Witnesses
  const addWitness = () => setForm(f => ({ ...f, witnesses: [...f.witnesses, { name: '', cnic: '', nationality: '', passport: '', address: '', attachment: null }] }));
  const removeWitness = (i) => setForm(f => ({ ...f, witnesses: f.witnesses.filter((_, idx) => idx !== i) }));
  const updateWitness = (i, field, value) => setForm(f => ({ ...f, witnesses: f.witnesses.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));
  const updateWitnessFile = (i, file) => setForm(f => ({ ...f, witnesses: f.witnesses.map((a, idx) => idx === i ? { ...a, attachment: file } : a) }));

  // Notices
  const addNotice = () => setForm(f => ({ ...f, notices: [...f.notices, { notice_number: '', notice_type: '', receiver_name: '', person_type: '', notice_via: '', notice_date: new Date().toISOString().split('T')[0], address: '', phone: '', description: '', status: 'issued' }] }));
  const removeNotice = (i) => setForm(f => ({ ...f, notices: f.notices.filter((_, idx) => idx !== i) }));
  const updateNotice = (i, field, value) => setForm(f => ({ ...f, notices: f.notices.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));

  const printNotice = async (n) => {
    if (!id) { alert('Save the enquiry first, then you can print notices.'); return; }
    if (!n.id) { alert('Save the enquiry first, then you can print notices.'); return; }
    try {
      const r = await api.get(`/enquiries/${id}/notice-print`, { params: { notice_id: n.id } });
      const { openPrintWindow } = await import('../utils/print');
      openPrintWindow(r.data.html);
    } catch (e) {
      alert(e.response?.data?.message || 'Could not print notice.');
    }
  };

  const nonAppearanceCount = form.notices.filter(n => n.status === 'non_appearance').length;
  const referredToCourt = nonAppearanceCount >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setServerError('');
    try {
      const fd = new FormData();

      const serializeArr = (items, fileFieldName) => {
        const clean = items.map(it => {
          const o = { ...it };
          if (o.attachment instanceof File) {
            fd.append(fileFieldName + '[]', o.attachment);
            delete o.attachment;
          } else if (o.attachment && typeof o.attachment === 'string') {
            o.attachment_path = o.attachment_path || o.attachment;
            delete o.attachment;
          }
          return o;
        });
        return JSON.stringify(clean);
      };

      const scalarKeys = [
        'complaint_id', 'tracking_no', 'enquiry_number', 'status', 'enquiry_officer_id',
        'recommendation', 'closure_reason', 'transfer_department', 'transfer_circle',
        'merge_complaint_id', 'cfr_summary', 'technical_report', 'forensic_report',
      ];
      scalarKeys.forEach((k) => {
        const v = form[k];
        if (v !== null && v !== undefined && v !== '') fd.append(k, v);
      });

      fd.append('activities', serializeArr(form.activities || [], 'activity_attachments'));
      fd.append('witnesses', serializeArr(form.witnesses || [], 'witness_attachments'));
      fd.append('notices', JSON.stringify(form.notices || []));
      fd.append('legal_opinions', JSON.stringify(form.legal_opinions || []));
      fd.append('approvals', JSON.stringify(form.approvals || []));

      if (technicalFile) fd.append('technical_report_attachment', technicalFile);
      if (forensicFile) fd.append('forensic_report_attachment', forensicFile);

      // PHP does not populate multipart on real PUT — use method spoofing
      if (id) {
        fd.append('_method', 'PUT');
        await api.post(`/enquiries/${id}`, fd);
      } else {
        await api.post('/enquiries', fd);
      }
      navigate('/enquiries');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
        setServerError('Please fix the highlighted fields below.');
      } else {
        setServerError(res?.message || 'Error saving enquiry. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, field, opts = {}) => {
    const { type = 'text', placeholder = '', required = false, options = null, rows = null, readOnly = false, icon = null } = opts;
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
        {icon && <span className="cf-input-icon">{icon}</span>}
        {fieldErr && <div className="cf-error">{fieldErr}</div>}
      </div>
    );
  };

  return (
    <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div className="page-header">
          <div className="page-title-group">
            <h1 className="page-title">{id ? 'Edit Enquiry' : 'New Enquiry'}</h1>
            <p className="page-subtitle">{id ? 'Update enquiry details' : 'Register a new enquiry'}</p>
            <div className="title-underline"></div>
          </div>
        </div>

        <div className="cf-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '4px' }}>
          {['details', 'witnesses', 'notices', 'reports', 'activities', 'legal', 'approvals', 'outcome'].map(tab => (
            <button key={tab} type="button" className={`cf-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ padding: '10px 16px', border: 'none', background: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? '#fff' : '#666', borderRadius: '8px 8px 0 0', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              {tab === 'details' && '📋 Details'}
              {tab === 'witnesses' && `🧑‍⚖️ Witnesses${form.witnesses?.length ? ` (${form.witnesses.length})` : ''}`}
              {tab === 'notices' && `🔔 Notices${nonAppearanceCount ? ` ⭐` : ''}${form.notices?.length ? ` (${form.notices.length})` : ''}`}
              {tab === 'reports' && '🧪 Reports'}
              {tab === 'activities' && '📝 Activities'}
              {tab === 'legal' && '⚖️ Legal Opinions'}
              {tab === 'approvals' && '✅ Approvals'}
              {tab === 'outcome' && '🎯 Outcome'}
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div><div className="cf-section-title">Complaint Reference</div><div className="cf-section-sub">Link to complaint with tracking number</div></div>
                <div className="cf-section-badge">STEP 1</div>
              </div>
              <div className="cf-body">
                <div className="cf-row-3">
                  <div className="cf-field">
                    <label className="cf-label required">Tracking No.</label>
                    <div className="cf-input-wrap">
                      <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
                      <select className="cf-input cf-select" value={form.tracking_no} onChange={handleTrackingChange} required>
                        <option value="">— Select Tracking No. —</option>
                        {complaints.map(c => <option key={c.id} value={c.tracking_no}>{c.tracking_no} — {c.complainant_name}</option>)}
                      </select>
                    </div>
                    <input type="hidden" name="complaint_id" value={form.complaint_id} />
                    <span className="cf-hint">Auto-fills from complaint record</span>
                  </div>
                  {renderField('Enquiry Number', 'enquiry_number', { placeholder: 'Manual entry (optional)' })}
                  {renderField('Status', 'status', { options: ENQUIRY_STATUS, required: true })}
                </div>
              </div>
            </div>

            <div className="cf-section">
              <div className="cf-section-header">
                <div className="cf-section-icon" style={{ background: '#2B2B2B' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div><div className="cf-section-title">Assignment</div><div className="cf-section-sub">Circle Incharge assigns Enquiry Officer</div></div>
                <div className="cf-section-badge">STEP 2</div>
              </div>
              <div className="cf-body">
                {!isPrivileged && (
                  <div style={{ padding: '10px 14px', marginBottom: 16, background: '#eef4f8', border: '1px solid #c5d9e8', borderRadius: 8, fontSize: 13, color: '#2b5d7f' }}>
                    🔒 This section is read-only. Only Circle Incharge / Admin can assign or change the Enquiry Officer.
                  </div>
                )}
                {isPrivileged ? (
                  <>
                    <div className="cf-row-3">
                      {renderField('Enquiry Officer', 'enquiry_officer_id', { required: true, options: officers })}
                      {renderField('Recommendation', 'recommendation', { options: RECOMMENDATIONS })}
                      {renderField('Closure Reason', 'closure_reason', { options: CLOSURE_REASONS })}
                    </div>
                    <div className="cf-row-2">
                      {renderField('Transfer Department', 'transfer_department')}
                      {renderField('Transfer Circle', 'transfer_circle', { options: circles.map(c => ({ value: c.name, name: c.name })) })}
                    </div>
                    {renderField('Merge Complaint ID', 'merge_complaint_id', { placeholder: 'Complaint ID to merge with' })}
                  </>
                ) : (
                  <div className="cf-row-3">
                    <div className="cf-field">
                      <label className="cf-label">Enquiry Officer</label>
                      <div style={{ padding: '9px 14px', background: '#f5f5f5', color: '#555', borderRadius: 'var(--border-radius-sm)', fontSize: 13, border: '1.5px solid var(--border)' }}>{officerName || 'Not assigned'}</div>
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Recommendation</label>
                      <div style={{ padding: '9px 14px', background: '#f5f5f5', color: '#555', borderRadius: 'var(--border-radius-sm)', fontSize: 13, border: '1.5px solid var(--border)' }}>{recName || '-'}</div>
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Closure Reason</label>
                      <div style={{ padding: '9px 14px', background: '#f5f5f5', color: '#555', borderRadius: 'var(--border-radius-sm)', fontSize: 13, border: '1.5px solid var(--border)' }}>{closureName || '-'}</div>
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Transfer Department</label>
                      <div style={{ padding: '9px 14px', background: '#f5f5f5', color: '#555', borderRadius: 'var(--border-radius-sm)', fontSize: 13, border: '1.5px solid var(--border)' }}>{form.transfer_department || '-'}</div>
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Transfer Circle</label>
                      <div style={{ padding: '9px 14px', background: '#f5f5f5', color: '#555', borderRadius: 'var(--border-radius-sm)', fontSize: 13, border: '1.5px solid var(--border)' }}>{transferCircleName || form.transfer_circle || '-'}</div>
                    </div>
                    <div className="cf-field">
                      <label className="cf-label">Merge Complaint ID</label>
                      <div style={{ padding: '9px 14px', background: '#f5f5f5', color: '#555', borderRadius: 'var(--border-radius-sm)', fontSize: 13, border: '1.5px solid var(--border)' }}>{form.merge_complaint_id || '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* WITNESSES TAB */}
        {activeTab === 'witnesses' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#264078' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div><div className="cf-section-title">Witnesses</div><div className="cf-section-sub">Name, CNIC, nationality, passport, address &amp; attachment</div></div>
              <div className="cf-section-badge">STEP 3</div>
            </div>
            <div className="cf-body">
              <button type="button" className="btn btn-outline btn-sm" onClick={addWitness} style={{ marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Witness
              </button>
              {form.witnesses.map((w, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Witness Name</label>
                      <input type="text" className="cf-input" value={w.name} onChange={e => updateWitness(i, 'name', e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="cf-field"><label className="cf-label">CNIC</label>
                      <input type="text" className="cf-input" value={w.cnic} onChange={e => updateWitness(i, 'cnic', e.target.value)} placeholder="XXXXX-XXXXXXX-X" />
                    </div>
                    <div className="cf-field"><label className="cf-label">Nationality</label>
                      <input type="text" className="cf-input" value={w.nationality} onChange={e => updateWitness(i, 'nationality', e.target.value)} placeholder="e.g. Pakistani" />
                    </div>
                    <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeWitness(i)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Passport No</label>
                      <input type="text" className="cf-input" value={w.passport} onChange={e => updateWitness(i, 'passport', e.target.value)} placeholder="Passport (if foreigner)" />
                    </div>
                    <div className="cf-field"><label className="cf-label">Attachment</label>
                      <input type="file" className="cf-input" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => updateWitnessFile(i, e.target.files[0])} />
                    </div>
                    <div className="cf-field" style={{ alignSelf: 'end' }}>
                      {w.attachment && typeof w.attachment === 'string' && (
                        <a href={w.attachment} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#015C94', fontWeight: 600 }}>Existing file ↗</a>
                      )}
                    </div>
                  </div>
                  <div className="cf-field"><label className="cf-label">Address</label>
                    <textarea className="cf-input" rows={2} value={w.address} onChange={e => updateWitness(i, 'address', e.target.value)} placeholder="Witness address" style={{ width: '100%' }}></textarea>
                  </div>
                </div>
              ))}
              {form.witnesses.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No witnesses added yet. Click "Add Witness" to start.</p>}
            </div>
          </div>
        )}

        {/* NOTICES TAB */}
        {activeTab === 'notices' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#B7791F' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div><div className="cf-section-title">Notices</div><div className="cf-section-sub">Issue notices — after 3 non-appearances the matter is referred to court</div></div>
              <div className="cf-section-badge">STEP 3</div>
            </div>
            <div className="cf-body">
              {nonAppearanceCount > 0 && (
                <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(255,193,7,0.14)', border: '1px solid #d69e2e', borderRadius: 8, fontSize: 13, color: '#7a5b00', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <div>
                    <strong>Non-Appearance recorded ({nonAppearanceCount} of 3).</strong>
                    {referredToCourt
                      ? ' This enquiry has been referred to court as per procedure.'
                      : ' After 3 non-appearances the file will be referred to court.'}
                  </div>
                </div>
              )}
              {referredToCourt && (
                <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(229,62,62,0.1)', border: '1px solid #e53e3e', borderRadius: 8, fontSize: 13, color: '#b42318', fontWeight: 600 }}>
                  ⚠ This enquiry has been referred to court (3 non-appearances).
                </div>
              )}
              <button type="button" className="btn btn-outline btn-sm" onClick={addNotice} style={{ marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Notice
              </button>
              {form.notices.map((n, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Notice No</label>
                      <input type="text" className="cf-input" value={n.notice_number} onChange={e => updateNotice(i, 'notice_number', e.target.value)} placeholder="e.g. NCCIA/N/25" />
                    </div>
                    <div className="cf-field"><label className="cf-label">Notice Type</label>
                      <select className="cf-input" value={n.notice_type} onChange={e => updateNotice(i, 'notice_type', e.target.value)}>
                        <option value="">— Select —</option>
                        {NOTICE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Receiver Name</label>
                      <input type="text" className="cf-input" value={n.receiver_name} onChange={e => updateNotice(i, 'receiver_name', e.target.value)} placeholder="Recipient name" />
                    </div>
                    <div className="cf-field"><label className="cf-label">Notice Date</label>
                      <input type="date" className="cf-input" value={n.notice_date} onChange={e => updateNotice(i, 'notice_date', e.target.value)} />
                    </div>
                    <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeNotice(i)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Notice Via</label>
                      <select className="cf-input" value={n.notice_via} onChange={e => updateNotice(i, 'notice_via', e.target.value)}>
                        <option value="">— Select —</option>
                        {NOTICE_VIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Person Type</label>
                      <select className="cf-input" value={n.person_type} onChange={e => updateNotice(i, 'person_type', e.target.value)}>
                        <option value="">— Select —</option>
                        {PERSON_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Phone</label>
                      <input type="text" className="cf-input" value={n.phone} onChange={e => updateNotice(i, 'phone', e.target.value)} placeholder="Phone number" />
                    </div>
                    <div className="cf-field"><label className="cf-label">Status</label>
                      <select className="cf-input" value={n.status} onChange={e => updateNotice(i, 'status', e.target.value)}>
                        {NOTICE_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="cf-field" style={{ marginBottom: 12 }}><label className="cf-label">Address</label>
                    <textarea className="cf-input" rows={2} value={n.address} onChange={e => updateNotice(i, 'address', e.target.value)} placeholder="Delivery / contact address" style={{ width: '100%' }}></textarea>
                  </div>
                  <div className="cf-field" style={{ marginBottom: 12 }}><label className="cf-label">Description</label>
                    <textarea className="cf-input" rows={2} value={n.description} onChange={e => updateNotice(i, 'description', e.target.value)} placeholder="Brief description / instructions on the notice" style={{ width: '100%' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => printNotice(n)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print Notice
                    </button>
                  </div>
                </div>
              ))}
              {form.notices.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No notices added yet. Click "Add Notice" to start.</p>}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#015C94' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
              </div>
              <div><div className="cf-section-title">Technical &amp; Forensic Reports</div><div className="cf-section-sub">Required reports for this enquiry</div></div>
              <div className="cf-section-badge">STEP 3</div>
            </div>
            <div className="cf-body">
              <div className="cf-field" style={{ marginBottom: 16 }}>
                <label className="cf-label required">Technical Report</label>
                <textarea className="cf-input" rows={4} required value={form.technical_report || ''} onChange={setF('technical_report')} placeholder="Technical analysis / report findings..." style={{ width: '100%' }}></textarea>
                {technicalReportUrl && <div style={{ fontSize: 12, marginTop: 6 }}>Current file: <a href={technicalReportUrl} target="_blank" rel="noreferrer" style={{ color: '#015C94', fontWeight: 600 }}>Open ↗</a></div>}
                <input type="file" className="cf-input" style={{ marginTop: 8 }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setTechnicalFile(e.target.files[0] || null)} />
              </div>
              <div className="cf-field">
                <label className="cf-label required">Forensic Report</label>
                <textarea className="cf-input" rows={4} required value={form.forensic_report || ''} onChange={setF('forensic_report')} placeholder="Forensic analysis / report findings..." style={{ width: '100%' }}></textarea>
                {forensicReportUrl && <div style={{ fontSize: 12, marginTop: 6 }}>Current file: <a href={forensicReportUrl} target="_blank" rel="noreferrer" style={{ color: '#015C94', fontWeight: 600 }}>Open ↗</a></div>}
                <input type="file" className="cf-input" style={{ marginTop: 8 }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setForensicFile(e.target.files[0] || null)} />
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === 'activities' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#264078' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <div><div className="cf-section-title">Enquiry Activities</div><div className="cf-section-sub">DAC, Bank, Search, Seize, Notices, Diaries, Seizures, Recoveries, CFR</div></div>
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

        {/* LEGAL OPINIONS TAB */}
        {activeTab === 'legal' && (
          <div className="cf-section">
            <div className="cf-section-header">
              <div className="cf-section-icon" style={{ background: '#015C94' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div><div className="cf-section-title">Legal Opinion Chain</div><div className="cf-section-sub">DD Legal → AD Legal → DG Legal</div></div>
              <div className="cf-section-badge">STEP 4</div>
            </div>
            <div className="cf-body">
              {!isPrivileged && (
                <div style={{ padding: '10px 14px', marginBottom: 16, background: '#eef4f8', border: '1px solid #c5d9e8', borderRadius: 8, fontSize: 13, color: '#2b5d7f' }}>
                  🔒 This section is read-only. Only Circle Incharge / Admin can add or modify legal opinions.
                </div>
              )}
              {isPrivileged && (
                <button type="button" className="btn btn-outline btn-sm" onClick={addLegalOpinion} style={{ marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Legal Opinion
                </button>
              )}
              {form.legal_opinions.map((lo, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Role</label>
                      <select className="cf-input" value={lo.role} onChange={e => updateLegalOpinion(i, 'role', e.target.value)} disabled={!isPrivileged}>
                        <option value="">— Select Role —</option>
                        {LEGAL_ROLES.map(r => <option key={r} value={r}>{r.toUpperCase().replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Decision</label>
                      <select className="cf-input" value={lo.decision} onChange={e => updateLegalOpinion(i, 'decision', e.target.value)} disabled={!isPrivileged}>
                        <option value="">— Select —</option>
                        {LEGAL_DECISIONS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Officer</label>
                      <select className="cf-input" value={lo.created_by} onChange={e => updateLegalOpinion(i, 'created_by', e.target.value)} disabled={!isPrivileged}>
                        <option value="">— Select Officer —</option>
                        {legalOfficers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.designation})</option>)}
                      </select>
                    </div>
                    {isPrivileged && (
                      <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeLegalOpinion(i)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    )}
                  </div>
                  <div className="cf-field"><label className="cf-label">Opinion Text</label>
                    <textarea className="cf-input" rows={3} value={lo.opinion_text} onChange={e => updateLegalOpinion(i, 'opinion_text', e.target.value)} disabled={!isPrivileged} placeholder="Enter legal opinion…" style={{ width: '100%' }}></textarea>
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
              <div><div className="cf-section-title">Circle Incharge Approvals</div><div className="cf-section-sub">Approval chain for enquiry finalization</div></div>
              <div className="cf-section-badge">STEP 5</div>
            </div>
            <div className="cf-body">
              {!isPrivileged && (
                <div style={{ padding: '10px 14px', marginBottom: 16, background: '#eef4f8', border: '1px solid #c5d9e8', borderRadius: 8, fontSize: 13, color: '#2b5d7f' }}>
                  🔒 This section is read-only. Only Circle Incharge / Admin can add or modify approvals.
                </div>
              )}
              {isPrivileged && (
                <button type="button" className="btn btn-outline btn-sm" onClick={addApproval} style={{ marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Approval
                </button>
              )}
              {form.approvals.map((ap, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '16px', background: '#f8f8f8', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <div className="cf-field"><label className="cf-label">Circle Incharge</label>
                      <select className="cf-input" value={ap.circle_incharge_id} onChange={e => updateApproval(i, 'circle_incharge_id', e.target.value)} disabled={!isPrivileged}>
                        <option value="">— Select —</option>
                        {circleIncharges.map(o => <option key={o.id} value={o.id}>{o.name}{o.designation ? ' (' + o.designation + ')' : ''}</option>)}
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Decision</label>
                      <select className="cf-input" value={ap.decision} onChange={e => updateApproval(i, 'decision', e.target.value)} disabled={!isPrivileged}>
                        <option value="">— Select —</option>
                        <option value="agree">Agree</option>
                        <option value="review">Review</option>
                      </select>
                    </div>
                    <div className="cf-field"><label className="cf-label">Remarks</label>
                      <input type="text" className="cf-input" value={ap.remarks} onChange={e => updateApproval(i, 'remarks', e.target.value)} disabled={!isPrivileged} placeholder="Remarks" />
                    </div>
                    {isPrivileged && (
                      <button type="button" className="btn btn-sm" style={{ background: 'rgba(229,62,62,0.15)', color: '#e53e3e', border: 'none', borderRadius: '8px', width: '36px', height: '36px', alignSelf: 'end', justifySelf: 'end' }} onClick={() => removeApproval(i)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    )}
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
              <div><div className="cf-section-title">Final Outcome</div><div className="cf-section-sub">Closure / Transfer / Convert to Case</div></div>
              <div className="cf-section-badge">STEP 6</div>
            </div>
            <div className="cf-body">
              <div className="cf-row-3">
                {renderField('Recommendation', 'recommendation', { options: RECOMMENDATIONS, required: true })}
                {renderField('Closure Reason', 'closure_reason', { options: CLOSURE_REASONS })}
              </div>
              <div className="cf-row-2">
                {renderField('Transfer Department', 'transfer_department')}
                {renderField('Transfer Circle', 'transfer_circle', { options: circles.map(c => ({ value: c.name, name: c.name })) })}
              </div>
              {renderField('Merge Complaint ID', 'merge_complaint_id', { placeholder: 'Complaint ID to merge with' })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <Link to="/enquiries" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: '#015C94', color: '#fff', padding: '12px 24px', fontWeight: 600, fontSize: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
            {saving ? 'Saving...' : (id ? 'Update Enquiry' : 'Register Enquiry')}
          </button>
        </div>
      </form>
    </div>
  );
}