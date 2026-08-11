import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { canCreateComplaint } from '../utils/permissions';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ fontSize: 13, padding: '3px 0' }}>
      <span style={{ color: '#64748b', fontWeight: 600 }}>{label}: </span>
      <span>{value}</span>
    </div>
  );
}

export default function AdpImport() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [complaintId, setComplaintId] = useState(null);

  const canUse = canCreateComplaint(user);

  const runExtract = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('ADP extracting…');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/adp/extract', fd);
      setExtracted(res.data.data);
      setMessage(`Extracted in ${res.data.elapsed_ms}ms (${res.data.ai_provider}${res.data.used_ocr ? ' + OCR' : ''})`);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Extract failed — is ADP backend running?');
    } finally {
      setLoading(false);
    }
  };

  const applyToNccia = async () => {
    if (!extracted) return;
    setLoading(true);
    setMessage('Saving to NCCIA…');
    try {
      const fd = new FormData();
      fd.append('data', JSON.stringify(extracted));
      if (complaintId) fd.append('complaint_id', String(complaintId));
      if (file) fd.append('attachment', file);
      const r = await api.post('/adp/apply', fd);
      setComplaintId(r.data?.data?.id);
      setMessage(r.data?.message || 'Saved');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'application/pdf') setFile(f);
  }, []);

  if (!canUse) {
    return <div className="page-header"><h1>ADP Extract</h1><p>Access denied.</p></div>;
  }

  const v = extracted?.complainant_victim_info || {};
  const r = extracted?.complaint_reference || {};
  const c = extracted?.crime_details || {};
  const e = extracted?.enquiry_and_case || {};

  return (
    <div>
      <div className="page-header">
        <h1>ADP — Fast AI Extract</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Upload PDF → Python ADP backend (OCR + AI) → one-click save to NCCIA complaint.
        </p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}
        onDragOver={(ev) => ev.preventDefault()}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={(ev) => setFile(ev.target.files?.[0] || null)}
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" disabled={!file || loading} onClick={runExtract}>
            {loading ? 'Working…' : 'Extract PDF'}
          </button>
          <button type="button" className="btn btn-primary" disabled={!extracted || loading} onClick={applyToNccia}>
            Save to NCCIA
          </button>
          {complaintId && (
            <Link to={`/complaints/${complaintId}/edit`} className="btn btn-outline">Open Complaint</Link>
          )}
        </div>
        {message && <div style={{ marginTop: 12, fontSize: 13, color: '#015C94' }}>{message}</div>}
      </div>

      {extracted && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Extracted preview</h3>
          <Field label="Tracking" value={r.tracking_no} />
          <Field label="Inquiry" value={e.enquiry_no} />
          <Field label="Name" value={v.name} />
          <Field label="Father" value={v.father_name} />
          <Field label="CNIC" value={v.cnic} />
          <Field label="Phone" value={v.phone} />
          <Field label="Crime" value={c.category} />
          <Field label="City" value={c.city} />
          <Field label="Amount" value={c.amount_involved} />
        </div>
      )}
    </div>
  );
}
