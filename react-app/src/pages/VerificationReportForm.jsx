import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { countryCodes } from '../data/countries';

const SearchableSelect = ({ options, value, onChange, placeholder, name, required }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="cf-input-wrap" ref={ref} style={{ position: 'relative' }}>
      <input
        className="cf-input"
        placeholder={placeholder}
        value={open ? search : (value || '')}
        onFocus={() => { setOpen(true); setSearch(''); }}
        onChange={e => setSearch(e.target.value)}
        required={required && !value}
        autoComplete="off"
      />
      <input type="hidden" name={name} value={value || ''} />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 99, background: '#fff', border: '1px solid #ccc', maxHeight: 220, overflowY: 'auto', borderRadius: '0 0 6px 6px' }}>
          <div
            style={{ padding: '8px 12px', cursor: 'pointer', background: !value ? '#e8f0fe' : 'transparent', fontWeight: value ? 400 : 500 }}
            onClick={() => { onChange({ target: { value: '' } }); setOpen(false); setSearch(''); }}
          >— {placeholder} —</div>
          {filtered.map(c => (
            <div
              key={c}
              style={{ padding: '8px 12px', cursor: 'pointer', background: value === c ? '#e8f0fe' : 'transparent', fontWeight: value === c ? 600 : 400 }}
              onClick={() => { onChange({ target: { value: c } }); setOpen(false); setSearch(''); }}
            >{c}</div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '8px 12px', color: '#999' }}>No city found</div>}
        </div>
      )}
    </div>
  );
};

const RECOMMENDATION_OPTIONS = [
  { value: 'enquiry_registration', name: 'Enquiry Registration' },
  { value: 'closure', name: 'Closure' },
  { value: 'merge', name: 'Merge' },
  { value: 'transfer', name: 'Transfer' },
];

const CLOSURE_REASONS = [
  { value: 'non_pursuance', name: 'Non-pursuance by Complainant' },
  { value: 'irrelevant', name: 'Irrelevant' },
  { value: 'invalid', name: 'Invalid' },
  { value: 'lack_of_evidence', name: 'Lack of Evidence' },
];

const majorCities = [
  'Islamabad', 'Rawalpindi', 'Murree',
  // Punjab
  'Lahore', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha',
  'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Gujrat', 'Kasur', 'Sahiwal', 'Okara',
  'Wah', 'Dera Ghazi Khan', 'Chakwal', 'Jhelum', 'Attock', 'Mianwali', 'Bhakkar',
  'Layyah', 'Muzaffargarh', 'Rajanpur', 'Khanewal', 'Vehari', 'Pakpattan',
  'Toba Tek Singh', 'Nankana Sahib', 'Narowal', 'Hafizabad', 'Mandi Bahauddin',
  'Sadiqabad', 'Bahawalnagar', 'Lodhran', 'Hasilpur', 'Yazman', 'Khanpur',
  'Gogera', 'Kamalia', 'Chiniot', 'Pattoki', 'Renala Khurd', 'Daska', 'Pasrur',
  'Kot Addu', 'Taunsa', 'Alipur', 'Arifwala', 'Burewala', 'Mailsi', 'Dunyapur',
  'Jalalpur Pirwala', 'Shujaabad', 'Qadirpur Ran', 'Makhdoompur', 'Talagang',
  'Pind Dadan Khan', 'Kallar Kahar', 'Choa Saidan Shah', 'Khushab', 'Noorpur Thal',
  'Jauharabad', 'Qaidabad', 'Risalpur', 'Wazirabad', 'Kharian', 'Sarai Alamgir',
  // Sindh
  'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Khairpur',
  'Mirpur Khas', 'Jacobabad', 'Shikarpur', 'Dadu', 'Thatta', 'Badin', 'Sanghar',
  'Tando Allahyar', 'Tando Muhammad Khan', 'Umerkot', 'Matiari', 'Jamshoro',
  'Kashmore', 'Ghotki', 'Kandhkot', 'Shahdadkot', 'Qambar', 'Mehar', 'Moro',
  'Hala', 'Sakrand', 'Kotri', 'Sehwan', 'Rohri', 'Pano Aqil', 'Mirpur Mathelo',
  'Dharki', 'Sobhodero', 'Khipro', 'Diplo', 'Chhor', 'Samaro', 'Nabisar Road',
  // KPK
  'Peshawar', 'Mardan', 'Mingora', 'Abbottabad', 'Kohat', 'Bannu', 'Dera Ismail Khan',
  'Swat', 'Mansehra', 'Haripur', 'Charsadda', 'Nowshera', 'Swabi', 'Karak',
  'Lakki Marwat', 'Tank', 'Battagram', 'Shangla', 'Upper Dir', 'Lower Dir',
  'Bajaur', 'Mohmand', 'Khyber', 'Orakzai', 'Kurram', 'North Waziristan',
  'South Waziristan', 'Tor Ghar', 'Kohistan', 'Malakand', 'Buner', 'Hangu',
  'Chitral', 'Timergara', 'Kalam', 'Matta', 'Barikot', 'Saidu Sharif',
  // Balochistan
  'Quetta', 'Turbat', 'Khuzdar', 'Chaman', 'Sibi', 'Zhob', 'Gwadar', 'Panjgur',
  'Lasbela', 'Hub', 'Nushki', 'Dalbandin', 'Kharan', 'Mastung', 'Kalat',
  'Killa Saifullah', 'Killa Abdullah', 'Pishin', 'Ziarat', 'Harnai', 'Kohlu',
  'Dera Bugti', 'Barkhan', 'Musakhel', 'Sherani', 'Loralai', 'Bela', 'Pasni',
  'Ormara', 'Jiwani', 'Tump', 'Basima', 'Wadh', 'Dhadar', 'Sohbatpur',
  'Jhal Magsi', 'Gandava', 'Usta Muhammad', 'Sujawal', 'Shahdadkot',
  // Gilgit-Baltistan
  'Gilgit', 'Skardu', 'Hunza', 'Nagar', 'Khaplu', 'Shigar', 'Astore', 'Diamer',
  'Ghanche', 'Ghizer', 'Roundu', 'Kharmang', 'Aliabad', 'Sost', 'Chilas',
  'Dasu', 'Tangir', 'Darel', 'Ishkoman', 'Yasin', 'Gupis', 'Puniyal',
  // Azad Kashmir
  'Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli', 'Bhimber', 'Pallandri',
  'Bagh', 'Haveli', 'Neelum', 'Athmuqam', 'Sharda', 'Kahuta', 'Mangla',
  'Dadyal', 'Jhelum Valley', 'Leepa', 'Samahni', 'Nakyal', 'Tatta Pani',
];

export default function VerificationReportForm() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [crimeCategories, setCrimeCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

const [form, setForm] = useState({    tracking_no: '',
    complaint_id: '',
    assignment_date: '',
    verification_date: '',
    victim_name: '',
    victim_father_name: '',
    victim_occupation: '',
    victim_gender: '',
    victim_cnic: '',
    victim_country_code: '+92',
    victim_phone: '',
    crime_category: '',
    city: '',
    crime_description: '',
    accused_known: '0',
    accused: [],
    recommendation: '',
    closure_reason: '',
    recommendation_short: '',
    recommendation_full: '',
    evidence: [],
    inquiry_no: '',
    case_no: '',
  });


  const setF = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setFNum = (field) => (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (field === 'victim_cnic') {
      val = val.slice(0,13);
      if (val.length > 5) val = val.slice(0,5) + '-' + val.slice(5);
      if (val.length > 13) val = val.slice(0,13) + '-' + val.slice(13);
    }
    if (field === 'victim_phone') {
      val = val.replace(/^0+/, '');
    }
    setForm(f => ({ ...f, [field]: val }));
  };

  const setPhone = (e) => {
    let val = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0,10);
    setForm(f => ({ ...f, victim_phone: val }));
  };

  useEffect(() => {
    api.get('/lookup/offence-types').then(r => setCrimeCategories(r.data.data || r.data)).catch(() => {});
    api.get('/complaints').then(r => setComplaints(r.data.data || r.data)).catch(() => {});
  }, []);

  const handleTrackingChange = (e) => {
    const tracking = e.target.value;
    setForm(f => ({ ...f, tracking_no: tracking }));
    const comp = complaints.find(c => c.tracking_no === tracking);
    if (comp) {
      const phone = (comp.contact_no || '').replace(/\D/g, '').replace(/^0+/, '');
      setForm(f => ({ 
        ...f, 
        complaint_id: comp.id, 
        victim_name: comp.complainant_name || '',
        victim_father_name: '',
        victim_cnic: comp.cnic || '',
        victim_phone: phone,
        victim_occupation: comp.profession || '',
        crime_category: comp.offence_type || '',
        city: comp.cmu || '',
        crime_description: comp.description || '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      if (k === 'evidence') { v.forEach((ev, i) => { if (ev.file instanceof File) fd.append(`evidence_file[${i}]`, ev.file); fd.append(`evidence_desc[${i}]`, ev.desc || ''); }); return; }
      if (k === 'accused') { v.forEach((a, i) => { Object.entries(a).forEach(([ak, av]) => { if (ak === 'photo' && av instanceof File) fd.append(`accused_photo[${i}]`, av); else fd.append(`accused[${i}][${ak}]`, av ?? ''); }); }); return; }
      fd.append(k, v);
    });
    try {
      await api.post('/verifications/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/verifications/reports');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
        setServerError('Please fix the highlighted fields below.');
      } else if (res?.message) {
        setServerError(res.message + (res.exception ? ' (' + res.exception + ')' : ''));
      } else {
        setServerError('Error saving report. Please try again. Status: ' + (err.response?.status || 'N/A'));
      }
      console.error('Save error:', err.response);
    }
    finally { setSaving(false); }
  };

  const addAccused = () => setForm(f => ({ ...f, accused: [...f.accused, { name: '', father_name: '', phone: '', country_code: '+92', cnic: '', address: '', post_address: '', nationality: 'Pakistani', passport_no: '', photo: null }] }));
  const removeAccused = (i) => setForm(f => ({ ...f, accused: f.accused.filter((_, idx) => idx !== i) }));
  const updateAccused = (i, field, value) => setForm(f => ({ ...f, accused: f.accused.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));
  const updateAccusedFile = (i, field, file) => setForm(f => ({ ...f, accused: f.accused.map((a, idx) => idx === i ? { ...a, [field]: file } : a) }));

  const addEvidence = () => setForm(f => ({ ...f, evidence: [...f.evidence, { file: null, desc: '' }] }));
  const removeEvidence = (i) => setForm(f => ({ ...f, evidence: f.evidence.filter((_, idx) => idx !== i) }));
  const updateEvidence = (i, field, value) => setForm(f => ({ ...f, evidence: f.evidence.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));

  return (
    <div className="page-content" style={{maxWidth:'1120px',margin:'0 auto'}}>
      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        <div className="page-header">
          <div className="page-title-group">
            <div className="page-label">Verifications</div>
            <h1 className="page-title">Victim Verification Report</h1>
            <p className="page-subtitle">Record victim appearance & verification findings</p>
            <div className="title-underline"></div>
          </div>
          <div className="page-actions">
            <Link to="/verifications/reports" className="btn btn-outline btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </Link>
          </div>
        </div>

        {serverError && <div className="cf-error-message" style={{background:'#fff5f5',border:'1px solid #e53e3e',borderRadius:'8px',padding:'12px 16px',marginBottom:'16px',color:'#e53e3e'}}>{serverError}
          {Object.keys(errors).length > 0 && <ul style={{margin:'8px 0 0 0',paddingLeft:'20px'}}>{Object.entries(errors).map(([k,v]) => <li key={k}><strong>{k}:</strong> {Array.isArray(v) ? v.join(', ') : v}</li>)}</ul>}
        </div>}

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon" style={{background:'#015C94'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <div className="cf-section-title">Tracking & Dates</div>
              <div className="cf-section-sub">Pull complaint from system, then record key dates</div>
            </div>
            <div className="cf-section-badge">STEP 01</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-3">
              <div className="cf-field">
                <label className="cf-label required">Tracking No.</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
                  <select name="tracking_no" className="cf-input cf-select" required value={form.tracking_no} onChange={handleTrackingChange}>
                    <option value="">— Select Tracking No. —</option>
                    {complaints.map(c => <option key={c.id} value={c.tracking_no} data-complaint={c.id} data-cnic={c.cnic} data-phone={c.contact_no}>{c.tracking_no} — {c.complainant_name}</option>)}
                  </select>
                </div>
                <input type="hidden" name="complaint_id" value={form.complaint_id} />
                <span className="cf-hint">Auto-suggested from complaint record</span>
              </div>

              <div className="cf-field">
                <label className="cf-label">Assignment Date</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                  <input type="date" className="cf-input" name="assignment_date" value={form.assignment_date} onChange={setF('assignment_date')} />
                </div>
                <span className="cf-hint">Date victim submitted on online portal</span>
              </div>

              <div className="cf-field">
                <label className="cf-label">Verification Date</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                  <input type="date" className="cf-input" name="verification_date" value={form.verification_date} onChange={setF('verification_date')} />
                </div>
                <span className="cf-hint">Date victim appeared for verification</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon" style={{background:'#2B2B2B'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
            </div>
            <div>
              <div className="cf-section-title">Victim Data Form</div>
              <div className="cf-section-sub">Personal details of the complainant / victim</div>
            </div>
            <div className="cf-section-badge">STEP 02</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-3">
              <div className="cf-field">
                <label className="cf-label required">Name</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                  <input type="text" className="cf-input" name="victim_name" placeholder="Full name" value={form.victim_name} onChange={setF('victim_name')} required />
                </div>
              </div>
              <div className="cf-field">
                <label className="cf-label">Father Name</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                  <input type="text" className="cf-input" name="victim_father_name" placeholder="Father's name" value={form.victim_father_name} onChange={setF('victim_father_name')} />
                </div>
              </div>
              <div className="cf-field">
                <label className="cf-label">Occupation</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                  <input type="text" className="cf-input" name="victim_occupation" placeholder="e.g. Business" value={form.victim_occupation} onChange={setF('victim_occupation')} />
                </div>
              </div>
            </div>

            <div className="cf-row-3">
              <div className="cf-field">
                <label className="cf-label">Gender</label>
                <div className="cf-input-wrap">
                  <select className="cf-input" name="victim_gender" value={form.victim_gender} onChange={e => setForm(f => ({...f, victim_gender: e.target.value}))}>
                    <option value="">— Select Gender —</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-label required">CNIC</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h4M15 12h4M15 16h4M6 16h6"/></svg></span>
                  <input type="text" className="cf-input font-mono" name="victim_cnic" id="victimCnic" inputMode="numeric" maxLength={15} placeholder="00000-0000000-0" value={form.victim_cnic} onChange={setFNum('victim_cnic')} required />
                </div>
                <span className="cf-hint">13 digits with dashes (auto-formatted)</span>
              </div>

              <div className="cf-field">
                <label className="cf-label required">Phone No.</label>
                  <div className="cf-phone-group" style={{display:'flex',gap:'8px'}}>
                    <div className="cf-input-wrap" style={{width:'190px'}}>
                      <select className="cf-input" name="victim_country_code" value={form.victim_country_code} onChange={setF('victim_country_code')}>
                        {countryCodes.map(c => <option key={c.code + c.name} value={c.code}>{c.code} {c.name}</option>)}
                      </select>
                    </div>
                  <div className="cf-input-wrap cf-phone-num" style={{flex:1}}>
                    <input type="text" className="cf-input font-mono" name="victim_phone" id="victimPhone" inputMode="numeric" placeholder="3XXXXXXXXX" value={form.victim_phone} onChange={setPhone} required />
                  </div>
                </div>
                <span className="cf-hint" id="phoneHint">Pakistan: 10 digits after code</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon" style={{background:'#264078'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div className="cf-section-title">Crime Details</div>
              <div className="cf-section-sub">Category, description & location</div>
            </div>
            <div className="cf-section-badge">STEP 03</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-2">
              <div className="cf-field">
                <label className="cf-label required">Crime Category</label>
                <div className="cf-input-wrap">
                  <select className="cf-input" name="crime_category" value={form.crime_category} onChange={setF('crime_category')} required>
                    <option value="">— Select Category —</option>
                    {crimeCategories.map(c => <option key={c.value||c.name} value={c.value||c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-label required">City</label>
                <SearchableSelect
                  options={majorCities}
                  value={form.city}
                  onChange={setF('city')}
                  placeholder="Select City"
                  name="city"
                  required
                />
              </div>
            </div>

            <div className="cf-field">
              <label className="cf-label">Crime Description</label>
              <div className="cf-input-wrap">
                <textarea className="cf-input cf-textarea cf-textarea-lg" name="crime_description" rows={4} placeholder="Provide complete description of the crime…" value={form.crime_description} onChange={setF('crime_description')}></textarea>
              </div>
              <div className="cf-char-count"><span id="crimeCount">{form.crime_description.length}</span> / 5000 characters</div>
            </div>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon" style={{background:'#015C94'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div className="cf-section-title">Accused Details</div>
              <div className="cf-section-sub">Known or unknown — add multiple accused if known</div>
            </div>
            <div className="cf-section-badge">STEP 04</div>
          </div>
          <div className="cf-body">
            <p style={{fontSize:13,color:'#6c757d',marginTop:0,marginBottom:16}}>If no accused details are entered, it will be treated as unknown. You can add accused info later.</p>
            <div className="cf-repeater">
                <div id="accusedList">
                  {form.accused.map((a, i) => (
                    <div key={i} style={{padding:'12px',marginBottom:'12px',background:'#f8f8f8',borderRadius:'8px',border:'1px solid #e0e0e0'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:'12px',marginBottom:'12px'}}>
                        <div className="cf-field"><label className="cf-label">Name</label><input type="text" className="cf-input" value={a.name} onChange={e => updateAccused(i, 'name', e.target.value)} placeholder="Accused name" /></div>
                        <div className="cf-field"><label className="cf-label">Father Name</label><input type="text" className="cf-input" value={a.father_name} onChange={e => updateAccused(i, 'father_name', e.target.value)} placeholder="Father's name" /></div>
                        <div className="cf-field"><label className="cf-label">Phone</label><div style={{display:'flex',gap:'6px'}}><select className="cf-input" value={a.country_code || '+92'} onChange={e => updateAccused(i,'country_code',e.target.value)} style={{width:'150px',flexShrink:0}}>{countryCodes.map(c => <option key={c.code + c.name} value={c.code}>{c.code} {c.name}</option>)}</select><input type="text" className="cf-input" value={a.phone} onChange={e => { let v=e.target.value.replace(/\D/g,'').replace(/^0+/,''); if(v.length>10) v=v.slice(0,10); updateAccused(i,'phone',v); }} placeholder="3XXXXXXXXX" maxLength={10} style={{flex:1}} /></div></div>
                        <button type="button" className="btn btn-sm" style={{background:'rgba(229,62,62,0.15)',color:'#e53e3e',border:'none',borderRadius:'8px',width:'36px',height:'36px',alignSelf:'end',justifySelf:'end'}} onClick={() => removeAccused(i)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                        <div className="cf-field"><label className="cf-label">CNIC</label><input type="text" className="cf-input font-mono" value={a.cnic} onChange={e => {let v=e.target.value.replace(/\D/g,'').slice(0,13);if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5);if(v.length>13)v=v.slice(0,13)+'-'+v.slice(13);updateAccused(i,'cnic',v);}} maxLength={15} placeholder="00000-0000000-0" /></div>
                        <div className="cf-field"><label className="cf-label">Address</label><input type="text" className="cf-input" value={a.address || ''} onChange={e => updateAccused(i, 'address', e.target.value)} placeholder="Accused address" /></div>
                        <div className="cf-field"><label className="cf-label">Postal Address</label><input type="text" className="cf-input" value={a.post_address || ''} onChange={e => updateAccused(i, 'post_address', e.target.value)} placeholder="Accused postal address" /></div>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                        <div className="cf-field"><label className="cf-label">Nationality</label>
                          <select className="cf-input" value={a.nationality || 'Pakistani'} onChange={e => updateAccused(i, 'nationality', e.target.value)}>
                            <option value="Pakistani">Pakistani</option>
                            <option value="Dual Nationality Holder">Dual Nationality Holder</option>
                            <option value="Foreigner">Foreigner</option>
                          </select>
                        </div>
                        <div className="cf-field"><label className="cf-label">Passport No {(['Dual Nationality Holder','Foreigner'].includes(a.nationality)) ? <span style={{color:'#e53e3e'}}>*</span> : null}</label>
                          <input type="text" className="cf-input" value={a.passport_no || ''} onChange={e => updateAccused(i, 'passport_no', e.target.value)} placeholder={(['Dual Nationality Holder','Foreigner'].includes(a.nationality)) ? 'Passport number required' : 'Optional for Pakistani nationals'} required={['Dual Nationality Holder','Foreigner'].includes(a.nationality)} />
                        </div>
                      </div>
                      <div className="cf-field">
                        <label className="cf-label">Photo <span style={{fontSize:11,color:'#6c757d',fontWeight:400}}>(victim can provide accused's picture)</span></label>
                        <input type="file" className="cf-input" accept="image/*" onChange={e => updateAccusedFile(i, 'photo', e.target.files[0])} />
                        {a.photo && <span style={{fontSize:12,color:'#38a169',marginTop:4,display:'block'}}>Photo selected: {a.photo.name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={addAccused}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Accused</button>
              </div>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon" style={{background:'#2B2B2B'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div>
              <div className="cf-section-title">Recommendations</div>
              <div className="cf-section-sub">Officer's recommendation on the case</div>
            </div>
            <div className="cf-section-badge">STEP 05</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-2">
              <div className="cf-field">
                <label className="cf-label required">Recommendation Type</label>
                <div className="cf-input-wrap">
                  <select className="cf-input" name="recommendation" value={form.recommendation} onChange={setF('recommendation')} required>
                    <option value="">— Select Recommendation —</option>
                    {RECOMMENDATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                  </select>
                </div>
                <span className="cf-hint">Select the verification outcome</span>
              </div>

              {form.recommendation === 'closure' && (
                <div className="cf-field">
                  <label className="cf-label required">Closure Reason</label>
                  <div className="cf-input-wrap">
                    <select className="cf-input" name="closure_reason" value={form.closure_reason} onChange={setF('closure_reason')} required>
                      <option value="">— Select Closure Reason —</option>
                      {CLOSURE_REASONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                    </select>
                  </div>
                  <span className="cf-hint">Required for Closure recommendation</span>
                </div>
              )}
            </div>

            <div className="cf-field">
              <label className="cf-label">Short Description</label>
              <div className="cf-input-wrap">
                <textarea className="cf-input cf-textarea" name="recommendation_short" rows={2} placeholder="Brief recommendation…" value={form.recommendation_short} onChange={setF('recommendation_short')}></textarea>
              </div>
              <div className="cf-char-count"><span id="recShortCount">{form.recommendation_short.length}</span> / 2000 characters</div>
            </div>

            <div className="cf-field">
              <label className="cf-label">Full Description</label>
              <div className="cf-input-wrap">
                <textarea className="cf-input cf-textarea cf-textarea-lg" name="recommendation_full" rows={4} placeholder="Detailed recommendation & rationale…" value={form.recommendation_full} onChange={setF('recommendation_full')}></textarea>
              </div>
              <div className="cf-char-count"><span id="recFullCount">{form.recommendation_full.length}</span> / 10000 characters</div>
            </div>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon" style={{background:'#264078'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <div>
              <div className="cf-section-title">Evidence</div>
              <div className="cf-section-sub">Upload media files — add a short description for each</div>
            </div>
            <div className="cf-section-badge">STEP 06</div>
          </div>
          <div className="cf-body">
            <div className="cf-repeater">
              <div id="evidenceList">
                {form.evidence.map((e, i) => (
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'12px',marginBottom:'12px',padding:'12px',background:'#f8f8f8',borderRadius:'8px',border:'1px solid #e0e0e0'}}>
                    <div className="cf-field"><label className="cf-label">Evidence File</label><input type="file" className="cf-input" accept="image/*,application/pdf" onChange={e => updateEvidence(i, 'file', e.target.files[0])} /></div>
                    <div className="cf-field"><label className="cf-label">Description</label><input type="text" className="cf-input" value={e.desc} onChange={e => updateEvidence(i, 'desc', e.target.value)} placeholder="Brief description" /></div>
                    <button type="button" className="btn btn-sm" style={{background:'rgba(229,62,62,0.15)',color:'#e53e3e',border:'none',borderRadius:'8px',width:'36px',height:'36px',alignSelf:'end'}} onClick={() => removeEvidence(i)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={addEvidence}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Evidence</button>
            </div>
          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon" style={{background:'#015C94'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M4 4h16v16H4z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
            </div>
            <div>
              <div className="cf-section-title">Reference Numbers</div>
              <div className="cf-section-sub">Inquiry & case references</div>
            </div>
            <div className="cf-section-badge">STEP 07</div>
          </div>
          <div className="cf-body">
            <div className="cf-row-2">
              <div className="cf-field">
                <label className="cf-label">Inquiry No.</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
                  <input type="text" className="cf-input font-mono" name="inquiry_no" placeholder="e.g. INQ-0001/25" value={form.inquiry_no} onChange={setF('inquiry_no')} />
                </div>
              </div>
              <div className="cf-field">
                <label className="cf-label">Case No.</label>
                <div className="cf-input-wrap">
                  <span className="cf-input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                  <input type="text" className="cf-input font-mono" name="case_no" placeholder="e.g. CCW-C-0001/25" value={form.case_no} onChange={setF('case_no')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {serverError && (
          <div className="cf-alert cf-alert-error">{serverError}</div>
        )}

        <div className="cf-form-actions" style={{display:'flex',justifyContent:'flex-end',gap:'10px',paddingTop:'20px',marginTop:'10px'}}>
          <Link to="/verifications/reports" className="btn btn-outline">Reset</Link>
          <button type="submit" className="btn cf-submit-btn" disabled={saving} style={{background:'#015C94',color:'#fff',padding:'12px 24px',fontWeight:600,fontSize:'14px',borderRadius:'8px',display:'flex',alignItems:'center',gap:'8px',border:'none',cursor:saving?'not-allowed':'pointer',opacity:saving?0.7:1}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            {saving ? 'Saving...' : 'Save Verification Report'}
          </button>
        </div>
      </form>
    </div>
  );
}