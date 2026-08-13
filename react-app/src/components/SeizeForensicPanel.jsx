import { useEffect, useState } from 'react';
import api from '../api';
import { formatDisplayDateTime } from '../utils/datetime';

const ITEM_TYPES = [
  { value: 'phone', label: 'Mobile Phone' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'sim', label: 'SIM' },
  { value: 'hdd', label: 'Hard Disk / SSD' },
  { value: 'usb', label: 'USB / Pendrive' },
  { value: 'other', label: 'Other' },
];

const emptyItem = () => ({
  item_type: 'phone',
  make_model: '',
  imei: '',
  serial_no: '',
  quantity: 1,
  description: '',
});

const STATUS_LABEL = {
  submitted: 'Submitted — AD review',
  assigned: 'Assigned to FO',
  in_progress: 'FO in progress',
  report_ready: 'Report ready (Desk)',
  handed_over: 'Handed to EO',
};

/**
 * EO seize note → Technical / Forensic department.
 * @param {{ enquiryId?: number|string, caseId?: number|string }} props
 */
export default function SeizeForensicPanel({ enquiryId, caseId }) {
  const [note, setNote] = useState('');
  const [destination, setDestination] = useState('forensic');
  const [items, setItems] = useState([emptyItem()]);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [list, setList] = useState([]);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupErr, setLookupErr] = useState('');

  const loadList = () => {
    if (!enquiryId && !caseId) return;
    const params = {};
    if (enquiryId) params.enquiry_id = enquiryId;
    if (caseId) params.case_id = caseId;
    api.get('/forensic-requests', { params })
      .then(r => setList(r.data.data || []))
      .catch(() => {});
  };

  useEffect(() => { loadList(); }, [enquiryId, caseId]);

  const updateItem = (i, key, val) => {
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    if (!note.trim()) {
      setErr('Concerned officer note is required.');
      return;
    }
    if (!items.length || items.some(it => !it.item_type)) {
      setErr('Add at least one seized item.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      if (enquiryId) fd.append('enquiry_id', String(enquiryId));
      if (caseId) fd.append('case_id', String(caseId));
      fd.append('destination', destination);
      fd.append('note', note.trim());
      fd.append('items', JSON.stringify(items.map(it => ({
        ...it,
        quantity: Number(it.quantity) || 1,
      }))));
      if (file) fd.append('attachment', file);
      const r = await api.post('/forensic-requests', fd);
      setMsg(r.data.message || 'Submitted.');
      setNote('');
      setItems([emptyItem()]);
      setFile(null);
      loadList();
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message || 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  const doLookup = async (e) => {
    e.preventDefault();
    setLookupErr('');
    setLookupResult(null);
    try {
      const r = await api.post('/forensic-requests/lookup', { report_code: lookupCode.trim() });
      setLookupResult(r.data.data);
    } catch (ex) {
      setLookupErr(ex.response?.data?.message || 'Code not found');
    }
  };

  if (!enquiryId && !caseId) {
    return (
      <div style={{ fontSize: 13, color: '#888', padding: 12 }}>
        Save the enquiry first, then submit seized items to Technical / Forensic.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        border: '1px solid #b2ebf2', borderRadius: 10, padding: 16, background: '#f0fafb', marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#015C94', marginBottom: 4 }}>
          Seize → Technical / Forensic
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>
          Concerned officer note + item details (IMEI / model). After submit, AD Forensic reviews and assigns a Forensic Officer.
          FO opens → auto report code. Desk collects physical report; EO collects by hand with that code.
        </div>

        <form onSubmit={submit}>
          <div className="cf-field" style={{ marginBottom: 12 }}>
            <label className="cf-label required">Concerned Officer Note</label>
            <textarea
              className="cf-input"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Describe seizure and what analysis is required..."
              style={{ width: '100%' }}
            />
          </div>

          <div className="cf-field" style={{ marginBottom: 14 }}>
            <label className="cf-label required">Send to department</label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="dest" checked={destination === 'forensic'} onChange={() => setDestination('forensic')} />
                Forensic Department
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="dest" checked={destination === 'technical'} onChange={() => setDestination('technical')} />
                Technical Department
              </label>
            </div>
          </div>

          {items.map((it, i) => (
            <div key={i} style={{
              padding: 12, marginBottom: 10, background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 8 }}>
                <div className="cf-field">
                  <label className="cf-label">Item type</label>
                  <select className="cf-input" value={it.item_type} onChange={e => updateItem(i, 'item_type', e.target.value)}>
                    {ITEM_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="cf-field">
                  <label className="cf-label">Make / Model</label>
                  <input className="cf-input" value={it.make_model} onChange={e => updateItem(i, 'make_model', e.target.value)} placeholder="e.g. iPhone 13" />
                </div>
                <div className="cf-field">
                  <label className="cf-label">IMEI</label>
                  <input className="cf-input" value={it.imei} onChange={e => updateItem(i, 'imei', e.target.value)} placeholder="IMEI" />
                </div>
                <div className="cf-field">
                  <label className="cf-label">Serial No</label>
                  <input className="cf-input" value={it.serial_no} onChange={e => updateItem(i, 'serial_no', e.target.value)} />
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'rgba(229,62,62,0.12)', color: '#e53e3e', border: 'none', alignSelf: 'end', height: 36 }}
                  onClick={() => setItems(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [emptyItem()])}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
                <div className="cf-field">
                  <label className="cf-label">Qty</label>
                  <input type="number" min={1} className="cf-input" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                </div>
                <div className="cf-field">
                  <label className="cf-label">Description</label>
                  <input className="cf-input" value={it.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Optional details" />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-outline btn-sm" style={{ marginBottom: 12 }} onClick={() => setItems(prev => [...prev, emptyItem()])}>
            + Add item
          </button>

          <div className="cf-field" style={{ marginBottom: 12 }}>
            <label className="cf-label">Attachment (optional)</label>
            <input type="file" className="cf-input" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>

          {err && <div className="cf-alert cf-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
          {msg && <div className="cf-alert" style={{ marginBottom: 10, background: '#e6f7ef', color: '#0d7a4f' }}>{msg}</div>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Submitting…' : `Submit to ${destination === 'forensic' ? 'Forensic' : 'Technical'}`}
          </button>
        </form>
      </div>

      {list.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Submitted seize requests</div>
          {list.map(r => (
            <div key={r.id} style={{
              border: '1px solid #e5eaf0', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 13, background: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong>{r.request_no}</strong>
                <span style={{ color: '#015C94', fontWeight: 600 }}>{STATUS_LABEL[r.status] || r.status}</span>
              </div>
              <div style={{ color: '#64748b', marginTop: 4 }}>
                → {r.destination} · {r.items?.length || 0} item(s)
                {r.report_code ? ` · Code: ${r.report_code}` : ''}
                {r.created_at ? ` · ${formatDisplayDateTime(r.created_at)}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ border: '1px solid #e5eaf0', borderRadius: 10, padding: 16, background: '#fff' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Lookup forensic report by code</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
          When Desk hands over the physical report, use the auto-generated code (FREP-…) here.
        </div>
        <form onSubmit={doLookup} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="cf-input"
            style={{ flex: 1, minWidth: 180 }}
            value={lookupCode}
            onChange={e => setLookupCode(e.target.value)}
            placeholder="FREP-26-0001"
          />
          <button type="submit" className="btn btn-outline btn-sm">Lookup</button>
        </form>
        {lookupErr && <div style={{ color: '#e53e3e', fontSize: 12, marginTop: 8 }}>{lookupErr}</div>}
        {lookupResult && (
          <div style={{ marginTop: 10, fontSize: 13, padding: 10, background: '#f7f9fc', borderRadius: 8 }}>
            <div><strong>{lookupResult.report_code}</strong> · {STATUS_LABEL[lookupResult.status] || lookupResult.status}</div>
            <div style={{ color: '#64748b', marginTop: 4 }}>Request {lookupResult.request_no}</div>
            {lookupResult.note && <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{lookupResult.note}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
