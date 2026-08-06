import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import SearchableSelect from '../components/SearchableSelect';
import { countryCodes } from '../data/countries';

const SCRUTINY_OPTIONS = [
  { value: 'complete', name: 'Complete (Generate Tracking No)' },
  { value: 'incomplete', name: 'Incomplete' },
  { value: 'invalid', name: 'Invalid' },
  { value: 'irrelevant', name: 'Irrelevant' },
];

const RECEIVED_VIA_OPTIONS = [
  { value: 'Email', name: 'Email' },
  { value: 'Telephone', name: 'Telephone' },
  { value: 'Postal Service', name: 'Postal Service' },
  { value: 'Individually', name: 'Individually' },
  { value: 'Mobile Apps', name: 'Mobile Apps' },
  { value: 'Online Form', name: 'Online Form' },
];

const RECEIVED_FROM_OPTIONS = [
  { value: 'Government Sector', name: 'Government Sector' },
  { value: 'President Office', name: 'President Office' },
  { value: 'PM Office', name: 'PM Office' },
  { value: 'Apex Courts', name: 'Apex Courts' },
  { value: 'Ministries', name: 'Ministries' },
  { value: 'Source Reports', name: 'Source Reports' },
  { value: 'National & International (Tipline)', name: 'National & International (Tipline)' },
  { value: 'Other Departments', name: 'Other Departments' },
  { value: 'Private Sector', name: 'Private Sector' },
  { value: 'Banks', name: 'Banks' },
  { value: 'Organizations', name: 'Organizations' },
  { value: 'Universities', name: 'Universities' },
  { value: 'Companies', name: 'Companies' },
  { value: 'NGOs', name: 'NGOs' },
  { value: 'Other Offices', name: 'Other Offices' },
  { value: 'General Public', name: 'General Public' },
];

const CMU_OPTIONS = [
  { value: 'NCCIA - HQ', name: 'NCCIA - HQ' },
  { value: 'Zonal Directorate', name: 'Zonal Directorate' },
  { value: 'CCRC', name: 'CCRC' },
];

const initialForm = {
  complainant_name: '',
  cnic: '',
  contact_no: '',
  contact_country_code: '+92',
  nationality: 'Pakistani',
  passport_no: '',
  address: '',
  post_address: '',
  profession: '',
  report_date: '',
  diary_no: '',
  received_via: '',
  received_from: '',
  cmu: '',
  priority_type: 'regular',
  offence_type: '',
  amount_involved: '',
  occurrence_date: '',
  laws: [],
  description: '',
  evidence: [],
  operator_name: '',
  operator_designation: '',
  entry_time: '',
  operator_remarks: '',
  source: '',
  scrutiny_result: '',
};

const PRIORITY_OPTIONS = [
  { value: 'normal', name: 'Normal' },
  { value: 'high', name: 'High' },
  { value: 'critical', name: 'Critical' },
];

export default function ComplaintForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [offenceTypes, setOffenceTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState(null);

  const { user } = useAuth();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const setCNIC = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 5) val = val.slice(0,5) + '-' + val.slice(5);
    if (val.length > 13) val = val.slice(0,13) + '-' + val.slice(13);
    setForm(f => ({ ...f, cnic: val }));
  };

  const setPhone = (e) => {
    let val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
    if (val.length > 10) val = val.slice(0,10);
    setForm(f => ({ ...f, contact_no: val }));
  };

  useEffect(() => {
    if (!id && user) {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const local = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setForm(f => ({
        ...f,
        operator_name: user.name || '',
        operator_designation: user.designation || '',
        entry_time: local,
      }));
    }
  }, [id, user]);

  useEffect(() => {
    api.get('/offence-types').then(r => setOffenceTypes(r.data.data || r.data)).catch(() => {});
    if (id) {
      api.get(`/complaints/${id}`).then(r => {
        const d = r.data.data || r.data;
        if (d.contact_no) d.contact_no = d.contact_no.replace(/\D/g, '').replace(/^0+/, '');
        if (!d.contact_country_code) d.contact_country_code = '+92';
        setForm({ ...initialForm, ...d, laws: d.laws || [], evidence: d.evidence || [] });
        if (d.attachment_url) setExistingAttachment(d.attachment_url);
      }).catch(() => navigate('/complaints'));
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setServerError('');
    try {
      const fd = new FormData();
      const payload = { ...form };
      if (!payload.entry_time) {
        payload.entry_time = new Date().toISOString().slice(0, 16);
      }
      Object.entries(payload).forEach(([k, v]) => {
        if (k === 'laws' && Array.isArray(v)) {
          v.forEach(item => fd.append('laws[]', item));
          return;
        }
        if (k === 'evidence' && Array.isArray(v)) {
          v.forEach(item => fd.append('evidence[]', item));
          return;
        }
        if (v !== null && v !== undefined && v !== '') {
          fd.append(k, v);
        }
      });
      if (attachmentFile) {
        fd.append('attachment', attachmentFile);
      }
      if (id) {
        await api.put(`/complaints/${id}`, fd);
      } else {
        await api.post('/complaints', fd);
      }
      navigate('/complaints');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
        setServerError('Please fix the highlighted fields below.');
      } else {
        setServerError(res?.message || 'Error saving complaint. Please try again.');
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
          <SearchableSelect
            value={form[field]}
            onChange={v => setForm(f => ({ ...f, [field]: v }))}
            options={options}
            placeholder={'Select ' + label}
            valueKey="value"
            labelKey="name"
          />
        ) : rows ? (
          <textarea className="cf-input" value={form[field]} onChange={set(field)} placeholder={placeholder} rows={rows} required={required} style={fieldErr ? {borderColor:'#e53e3e'} : {}} />
        ) : (
          <input type={type} className="cf-input" value={form[field]} onChange={set(field)} placeholder={placeholder} required={required} style={fieldErr ? {borderColor:'#e53e3e'} : {}} />
        )}
        {fieldErr && <div className="cf-error">{fieldErr}</div>}
      </div>
    );
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">{id ? 'Edit Complaint' : 'New Complaint'}</h1>
          <p className="page-subtitle">{id ? 'Update complaint details' : 'Register a new complaint'}</p>
          <div className="title-underline"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div><div className="cf-section-title">Complainant Information</div><div className="cf-section-sub">Personal details of the complainant</div></div>
            <div className="cf-section-badge">Step 1</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-2">
              {renderField('Complainant Name', 'complainant_name', { required: true })}
              <div className="cf-field">
                <label className="cf-label required">CNIC</label>
                <input type="text" className="cf-input" value={form.cnic} onChange={setCNIC} placeholder="XXXXX-XXXXXXX-X" required maxLength={15} />
                {errors.cnic && <div className="cf-error">{errors.cnic}</div>}
              </div>
            </div>
            <div className="cf-row-2">
              <div className="cf-field">
                <label className="cf-label required">Contact No</label>
                <div style={{display:'flex',gap:'8px'}}>
                  <select className="cf-input" value={form.contact_country_code} onChange={set('contact_country_code')} style={{width:'190px'}}>
                    {countryCodes.map(c => <option key={c.code + c.name} value={c.code}>{c.code} — {c.name}</option>)}
                  </select>
                  <input type="text" className="cf-input" value={form.contact_no} onChange={setPhone} placeholder="3XXXXXXXXX" required maxLength={12} style={{flex:1}} />
                </div>
                {errors.contact_no && <div className="cf-error">{errors.contact_no}</div>}
              </div>
              {renderField('Profession', 'profession')}
            </div>
            <div className="cf-row-2">
              <div className="cf-field">
                <label className="cf-label">Nationality</label>
                <select className="cf-input" value={form.nationality || 'Pakistani'} onChange={set('nationality')}>
                  <option value="Pakistani">Pakistani</option>
                  <option value="Dual Nationality Holder">Dual Nationality Holder</option>
                  <option value="Foreigner">Foreigner</option>
                </select>
                {errors.nationality && <div className="cf-error">{errors.nationality}</div>}
              </div>
              <div className="cf-field">
                <label className="cf-label">Passport No {(['Dual Nationality Holder','Foreigner'].includes(form.nationality)) && <span style={{color:'#e53e3e'}}>*</span>}</label>
                <input type="text" className="cf-input" value={form.passport_no} onChange={set('passport_no')} placeholder={(['Dual Nationality Holder','Foreigner'].includes(form.nationality)) ? 'Passport number required' : 'Optional for Pakistani nationals'} required={['Dual Nationality Holder','Foreigner'].includes(form.nationality)} />
                {errors.passport_no && <div className="cf-error">{errors.passport_no}</div>}
              </div>
            </div>
            <div className="cf-row-2">
              {renderField('Address', 'address', { rows: 2, required: true })}
              {renderField('Postal Address', 'post_address', { rows: 2 })}
            </div>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div><div className="cf-section-title">Complaint Details</div><div className="cf-section-sub">Receipt and nature of the complaint</div></div>
            <div className="cf-section-badge">Step 2</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-2">
              {renderField('Report Date', 'report_date', { type: 'date', required: true })}
              {renderField('Diary No', 'diary_no', { required: true })}
            </div>
            <div className="cf-row-2">
              {renderField('Received Via', 'received_via', { required: true, options: RECEIVED_VIA_OPTIONS })}
              {renderField('Received From', 'received_from', { required: true, options: RECEIVED_FROM_OPTIONS })}
            </div>
            <div className="cf-row-3">
              {renderField('CMU', 'cmu', { options: CMU_OPTIONS })}
              {renderField('Priority', 'priority_type', { options: PRIORITY_OPTIONS })}
              {renderField('Amount Involved', 'amount_involved', { type: 'number' })}
            </div>
            <div className="cf-row-2">
              {renderField('Offence Type', 'offence_type', { required: true, options: offenceTypes })}
              {renderField('Occurrence Date', 'occurrence_date', { type: 'date', required: true })}
            </div>
            {renderField('Description', 'description', { rows: 4, required: true })}
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div><div className="cf-section-title">Operator / Scrutiny</div><div className="cf-section-sub">Entry and scrutiny details</div></div>
            <div className="cf-section-badge">Step 3</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-2">
              {renderField('Operator Name', 'operator_name', { readOnly: true })}
              {renderField('Operator Designation', 'operator_designation', { readOnly: true })}
            </div>
            <div className="cf-row-2">
              {renderField('Entry Time', 'entry_time', { type: 'datetime-local', readOnly: true })}
            </div>
            {renderField('Scrutiny Result', 'scrutiny_result', { required: true, options: SCRUTINY_OPTIONS })}
            {renderField('Operator Remarks', 'operator_remarks', { rows: 2 })}

            <div className="cf-section" style={{ marginTop: 16 }}>
              <div className="cf-section-header">
                <div className="cf-section-icon" style={{ background: '#805ad5' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </div>
                <div><div className="cf-section-title">Attachment</div><div className="cf-section-sub">Any supporting document (PDF, image, Word, Excel)</div></div>
                <div className="cf-section-badge">Optional</div>
              </div>
              <div className="cf-body">
                {existingAttachment && (
                  <div style={{ marginBottom: 10, fontSize: 13 }}>
                    Current file: <a href={existingAttachment} target="_blank" rel="noreferrer" style={{ color: '#015C94', fontWeight: 600 }}>Open attachment ↗</a>
                  </div>
                )}
                <input
                  type="file"
                  className="cf-input"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={e => setAttachmentFile(e.target.files[0] || null)}
                />
                <span className="cf-hint">Upload a new file to replace any existing attachment.</span>
              </div>
            </div>
          </div>
        </div>

        {serverError && (
          <div className="cf-alert cf-alert-error">{serverError}</div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/complaints')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : (id ? 'Update Complaint' : 'Register Complaint')}
          </button>
        </div>
      </form>
    </div>
  );
}
