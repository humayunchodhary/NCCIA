import { useRef, useState } from 'react';
import { ocrAndParsePdf } from '../utils/fillFromPdf';

export default function PdfAutoFillBar({ onFilled, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    setMessage('Reading PDF…');
    try {
      const { extracted, fieldsOk, error: parseErr } = await ocrAndParsePdf(file, setMessage);
      await onFilled(extracted, file);
      if (!fieldsOk) {
        setError(parseErr || 'Kuch fields nahi mili — form check karke complete karein.');
      } else {
        setMessage('PDF se information fill ho gayi. Save se pehle check kar lein.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'PDF read failed');
      setMessage('');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="cf-section" style={{ marginBottom: 16, border: '1.5px dashed #015C94' }}>
      <div className="cf-section-header">
        <div className="cf-section-icon" style={{ background: '#015C94' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div>
          <div className="cf-section-title">Fill from PDF</div>
          <div className="cf-section-sub">{hint || 'Upload verification report PDF (e.g. 261-26.PDF) — name, CNIC, phone, offence, amount auto-fill'}</div>
        </div>
      </div>
      <div className="cf-body">
        <input
          ref={inputRef}
          type="file"
          className="cf-input"
          accept="application/pdf,.pdf"
          disabled={busy}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {busy && <div style={{ marginTop: 8, fontSize: 13, color: '#015C94', fontWeight: 600 }}>{message || 'Working…'}</div>}
        {!busy && message && <div style={{ marginTop: 8, fontSize: 13, color: '#0d7a4f' }}>{message}</div>}
        {error && <div className="cf-error" style={{ marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
