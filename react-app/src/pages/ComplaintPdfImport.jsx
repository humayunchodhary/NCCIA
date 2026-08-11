import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { canCreateComplaint } from '../utils/permissions';

const STATUS_COLORS = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  extracted: '#8b5cf6',
  imported: '#10b981',
  failed: '#ef4444',
};

function FieldRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8, fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: '#64748b', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#111827', wordBreak: 'break-word' }}>{String(value)}</span>
    </div>
  );
}

export default function ComplaintPdfImport() {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [imports, setImports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);

  const [processingId, setProcessingId] = useState(null);

  const canUpload = canCreateComplaint(user);

  const fetchData = useCallback(() => {
    Promise.all([
      api.get('/complaint-pdf-imports?per_page=30'),
      api.get('/complaint-pdf-imports/stats'),
    ]).then(([listRes, statsRes]) => {
      setImports(listRes.data?.data || listRes.data || []);
      setStats(statsRes.data || {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const t = setInterval(fetchData, 8000);
    return () => clearInterval(t);
  }, [fetchData]);

  const handlePreview = async (file) => {
    if (!file) return;
    setPreview(null);
    setPreviewError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await api.post('/complaint-pdf-imports/preview', fd);
      setPreview(r.data?.extracted || null);
    } catch (err) {
      setPreviewError(err.response?.data?.error || err.response?.data?.message || 'Preview failed');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = fileRef.current?.files;
    if (!files?.length) return;
    setUploading(true);
    setMessage('');
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('files[]', f));
    fd.append('auto_apply', '1');
    fd.append('sync', '0');
    try {
      const r = await api.post('/complaint-pdf-imports', fd, { timeout: 120000 });
      const uploaded = r.data?.imports || [];
      setMessage(`Uploaded ${uploaded.length} file(s). Running OCR…`);
      for (const imp of uploaded) {
        setMessage(`Processing ${imp.original_filename}… (OCR may take 1–2 min)`);
        await api.post(`/complaint-pdf-imports/${imp.id}/process`, { auto_apply: 1 }, { timeout: 300000 });
      }
      setMessage('Import complete.');
      if (fileRef.current) fileRef.current.value = '';
      setPreview(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.import?.error_message
        || err.message
        || 'Upload/process failed';
      setMessage(msg);
      fetchData();
    } finally {
      setUploading(false);
    }
  };

  const processImport = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/complaint-pdf-imports/${id}/process`, { auto_apply: 1 }, { timeout: 300000 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.import?.error_message || 'Process failed');
      fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  const applyImport = async (id) => {
    try {
      await api.post(`/complaint-pdf-imports/${id}/apply`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Apply failed');
    }
  };

  if (!canUpload) {
    return <div className="page-header"><h1>PDF Import</h1><p>Access denied.</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Complaint PDF Import</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
          Upload scanned verification reports (e.g. <code>261-26.PDF</code>) — system auto-extracts complainant, tracking no, amount &amp; creates/updates records.
        </p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Upload PDF(s)</h3>
        <form onSubmit={handleUpload}>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="cf-input"
            style={{ marginBottom: 12 }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePreview(f);
            }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Processing OCR… (may take 1–2 min)' : 'Upload & Import'}
            </button>
            <span style={{ fontSize: 12, color: '#64748b', alignSelf: 'center' }}>
              Bulk: up to 100 PDFs per batch · Max 50MB each
            </span>
          </div>
        </form>
        {message && <div style={{ marginTop: 12, color: '#015C94', fontSize: 13 }}>{message}</div>}
      </div>

      {(preview || previewError) && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Preview — extracted fields</h3>
          {previewError && <div style={{ color: '#ef4444', fontSize: 13 }}>{previewError}</div>}
          {preview && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
              <FieldRow label="Tracking No" value={preview.tracking_no} />
              <FieldRow label="Inquiry No" value={preview.inquiry_no} />
              <FieldRow label="Complainant" value={preview.complainant_full_name || preview.victim_name} />
              <FieldRow label="Father Name" value={preview.victim_father_name} />
              <FieldRow label="CNIC" value={preview.victim_cnic} />
              <FieldRow label="Phone" value={preview.victim_phone} />
              <FieldRow label="Gender" value={preview.victim_gender} />
              <FieldRow label="Occupation" value={preview.victim_occupation} />
              <FieldRow label="Address" value={preview.victim_address} />
              <FieldRow label="Crime Category" value={preview.crime_category} />
              <FieldRow label="Amount" value={preview.amount_involved} />
              <FieldRow label="City" value={preview.city} />
              <FieldRow label="Verification Date" value={preview.verification_date} />
              <FieldRow label="OCR Used" value={preview.used_ocr ? 'Yes' : 'No'} />
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="card" style={{ padding: '10px 16px', minWidth: 100 }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{k}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>File</th>
                <th>Inquiry Ref</th>
                <th>Status</th>
                <th>Tracking</th>
                <th>Complainant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {imports.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>No imports yet</td></tr>
              )}
              {imports.map(row => {
                const ex = row.extracted_data || {};
                return (
                  <tr key={row.id}>
                    <td style={{ fontSize: 13 }}>{row.original_filename}</td>
                    <td>{row.inquiry_ref || ex.inquiry_no || '—'}</td>
                    <td>
                      <span style={{
                        background: (STATUS_COLORS[row.status] || '#94a3b8') + '22',
                        color: STATUS_COLORS[row.status] || '#64748b',
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      }}>{row.status}</span>
                    </td>
                    <td>{ex.tracking_no || row.complaint?.tracking_no || '—'}</td>
                    <td>{ex.victim_name || ex.complainant_full_name || '—'}</td>
                    <td>
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setSelected(row)} style={{ marginRight: 6 }}>View</button>
                      {(row.status === 'pending' || row.status === 'failed' || row.status === 'processing') && (
                        <button type="button" className="btn btn-sm btn-primary" disabled={processingId === row.id} onClick={() => processImport(row.id)} style={{ marginRight: 6 }}>
                          {processingId === row.id ? 'Processing…' : 'Process'}
                        </button>
                      )}
                      {row.status === 'extracted' && (
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => applyImport(row.id)} style={{ marginRight: 6 }}>Apply</button>
                      )}
                      {row.complaint_id && (
                        <Link to={`/complaints/${row.complaint_id}/edit`} className="btn btn-sm btn-outline" style={{ marginLeft: 6 }}>Complaint</Link>
                      )}
                      {row.error_message && (
                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, maxWidth: 220 }}>{row.error_message}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setSelected(null)}>
          <div className="card" style={{ maxWidth: 640, width: '100%', maxHeight: '80vh', overflow: 'auto', padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{selected.original_filename}</h3>
            {selected.error_message && <div style={{ color: '#ef4444', marginBottom: 12 }}>{selected.error_message}</div>}
            {selected.extracted_data && Object.entries(selected.extracted_data).map(([k, v]) => (
              k !== 'raw_text_preview' && <FieldRow key={k} label={k.replace(/_/g, ' ')} value={v} />
            ))}
            <button type="button" className="btn btn-outline" onClick={() => setSelected(null)} style={{ marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
