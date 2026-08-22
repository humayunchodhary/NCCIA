import React, { useState } from 'react';
import api from '../api';

const CASE_CATEGORIES = [
  'Financial Fraud',
  'AHTC',
  'Anti-State',
  'ATM/Credit Card Skimming',
  'Audio Sampling/Collection',
  'Blackmailing',
  'Blasphemy',
  'Child Pornography',
  'Crypto Currency',
  'Cyber Stalking',
  'Dark Web',
  'Defamation',
  'Departmental Inquiry',
  'Fake Documents',
  'Hacking',
  'Harassment',
  'Hate Speech',
  'Hawala / Hundi',
  'Illegal Drugs',
  'Illegal SIM Activation',
  'Impersonation',
  'Infringement / Copyrights',
  'Money Laundering',
  'Murder',
  'Social Media',
  'Spamming',
  'Terrorism (CTW)',
  'Threatening',
  'Voice Analysis',
  'VOIP (Illegal Gateway Exchange)',
  'Other',
];

const ITEM_TYPES = [
  { value: 'phone', label: 'Mobile Phone' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'computer', label: 'Computer / Desktop' },
  { value: 'storage', label: 'Hard Disk / SSD' },
  { value: 'dvr', label: 'DVR / NVR' },
  { value: 'sim', label: 'SIM Card' },
  { value: 'usb', label: 'USB / Flash Drive' },
  { value: 'tablet', label: 'Tablet / iPad' },
  { value: 'memory_card', label: 'Memory Card' },
  { value: 'cd_dvd', label: 'CD / DVD' },
  { value: 'other', label: 'Other' },
];

const ORGANIZATIONS = [
  'CCRC',
  'FIA CCRC Lahore',
  'FIA CCRC Islamabad',
  'FIA CCRC Karachi',
  'FIA CCRC Peshawar',
  'FIA CCRC Quetta',
  'Punjab Police',
  'Sindh Police',
  'KP Police',
  'Balochistan Police',
  'Islamabad Capital Police',
  'NAB',
  'ANF',
  'Customs',
  'Special Court / Sessions Court',
  'Other Organization',
];

export default function ExternalForensicRequestModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    external_ref: '',
    external_letter_no: '',
    external_courier_no: '',
    external_organization: 'CCRC',
    custom_organization: '',
    external_person_name: '',
    external_person_contact: '',
    external_person_address: '',
    external_category: 'Financial Fraud',
    external_scope: 'AS PER THE LETTER ATTACHED',
    priority: 'normal',
    destination: 'forensic',
    note: '',
  });

  const [attachment, setAttachment] = useState(null);

  const [items, setItems] = useState([
    {
      item_type: 'phone',
      make_model: '',
      serial_no: '',
      imei: '',
      imei2: '',
      storage_capacity: '',
      condition: 'Sealed',
      seized_from: '',
      quantity: 1,
      description: '',
    },
  ]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_type: 'phone',
        make_model: '',
        serial_no: '',
        imei: '',
        imei2: '',
        storage_capacity: '',
        condition: 'Sealed',
        seized_from: '',
        quantity: 1,
        description: '',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const org = formData.external_organization === 'Other Organization'
      ? (formData.custom_organization.trim() || 'Other Organization')
      : formData.external_organization;

    if (!org) {
      setError('Please select or specify the Organization.');
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('is_external', '1');
      fd.append('destination', formData.destination);
      fd.append('priority', formData.priority);
      fd.append('external_ref', formData.external_ref);
      fd.append('external_letter_no', formData.external_letter_no);
      fd.append('external_courier_no', formData.external_courier_no);
      fd.append('external_organization', org);
      fd.append('external_person_name', formData.external_person_name);
      fd.append('external_person_contact', formData.external_person_contact);
      fd.append('external_person_address', formData.external_person_address);
      fd.append('external_category', formData.external_category);
      fd.append('external_scope', formData.external_scope);
      fd.append('note', formData.note || formData.external_scope || 'External Seizure Request');

      fd.append('items', JSON.stringify(items));
      if (attachment) {
        fd.append('attachment', attachment);
      }

      const res = await api.post('/forensic-requests', fd);
      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit direct forensic request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, maxWidth: 900, width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc',
          borderTopLeftRadius: 14, borderTopRightRadius: 14,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
              ➕ Direct Forensic Request / External Seizure (باہر سے آنے والا کیس)
            </h2>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Register equipment received directly from outside organizations (Police, Courts, NAB, etc.) without an internal NCCIA Enquiry.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', fontSize: 22, color: '#64748b',
              cursor: 'pointer', padding: 4, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: 24, flex: 1 }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b',
              padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Section 1: Case Details */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#015C94', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 6 }}>
              1. External Case &amp; Organization Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div className="cf-field">
                <label className="cf-label required">Organization from which equipment received</label>
                <select
                  className="cf-input"
                  value={formData.external_organization}
                  onChange={e => setFormData({ ...formData, external_organization: e.target.value })}
                  required
                >
                  {ORGANIZATIONS.map(org => <option key={org} value={org}>{org}</option>)}
                </select>
              </div>

              {formData.external_organization === 'Other Organization' && (
                <div className="cf-field">
                  <label className="cf-label required">Specify Other Organization Name</label>
                  <input
                    type="text"
                    className="cf-input"
                    placeholder="Enter Organization name..."
                    value={formData.custom_organization}
                    onChange={e => setFormData({ ...formData, custom_organization: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="cf-field">
                <label className="cf-label">Case No. / Reference (e.g. RE-39/2025 or FIR-119)</label>
                <input
                  type="text"
                  className="cf-input"
                  placeholder="e.g. RE-39/2025, FIR-12/2026"
                  value={formData.external_ref}
                  onChange={e => setFormData({ ...formData, external_ref: e.target.value })}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Letter No. / Memo No.</label>
                <input
                  type="text"
                  className="cf-input"
                  placeholder="e.g. 145/DFL/2026"
                  value={formData.external_letter_no}
                  onChange={e => setFormData({ ...formData, external_letter_no: e.target.value })}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Courier No. / Dispatch No. (if any)</label>
                <input
                  type="text"
                  className="cf-input"
                  placeholder="e.g. TCS-7839210"
                  value={formData.external_courier_no}
                  onChange={e => setFormData({ ...formData, external_courier_no: e.target.value })}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Received From Person (Officer / Representative)</label>
                <input
                  type="text"
                  className="cf-input"
                  placeholder="Name of person handing over device"
                  value={formData.external_person_name}
                  onChange={e => setFormData({ ...formData, external_person_name: e.target.value })}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Person Contact Number</label>
                <input
                  type="text"
                  className="cf-input"
                  placeholder="e.g. 0300-1234567"
                  value={formData.external_person_contact}
                  onChange={e => setFormData({ ...formData, external_person_contact: e.target.value })}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Person Address / Police Station</label>
                <input
                  type="text"
                  className="cf-input"
                  placeholder="e.g. PS Gulberg, Lahore"
                  value={formData.external_person_address}
                  onChange={e => setFormData({ ...formData, external_person_address: e.target.value })}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label required">Case Category / Offence Type</label>
                <select
                  className="cf-input"
                  value={formData.external_category}
                  onChange={e => setFormData({ ...formData, external_category: e.target.value })}
                >
                  {CASE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="cf-field">
                <label className="cf-label">Priority</label>
                <select
                  className="cf-input"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="high">🔥 High</option>
                  <option value="urgent">⚡ Urgent</option>
                </select>
              </div>
            </div>

            <div className="cf-field" style={{ marginTop: 12 }}>
              <label className="cf-label">Scope of Analysis / Required Evidence</label>
              <textarea
                className="cf-input"
                rows={2}
                placeholder="Scope of analysis or questions required by organization..."
                value={formData.external_scope}
                onChange={e => setFormData({ ...formData, external_scope: e.target.value })}
              />
            </div>

            <div className="cf-field" style={{ marginTop: 12 }}>
              <label className="cf-label">Attach Scanned Request Letter / Memo (PDF or Image)</label>
              <input
                type="file"
                className="cf-input"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setAttachment(e.target.files[0] || null)}
              />
            </div>
          </div>

          {/* Section 2: Evidentiary Items */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1.5px solid #e2e8f0', paddingBottom: 6, marginBottom: 14,
            }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#015C94', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                2. Detail of Electronic Equipment(s) Received ({items.length})
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddItem}
                style={{ fontSize: 12 }}
              >
                ➕ Add Another Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10,
                  padding: 16, marginBottom: 14, position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
                    Item #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{
                        background: '#fee2e2', border: 'none', color: '#b91c1c',
                        borderRadius: 6, padding: '2px 8px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      🗑️ Remove Item
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  <div className="cf-field">
                    <label className="cf-label required">Evidentiary Category</label>
                    <select
                      className="cf-input"
                      value={item.item_type}
                      onChange={e => handleItemChange(idx, 'item_type', e.target.value)}
                    >
                      {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="cf-field">
                    <label className="cf-label">Item Brand &amp; Model (e.g. Samsung Galaxy S21)</label>
                    <input
                      type="text"
                      className="cf-input"
                      placeholder="e.g. Apple iPhone 13 / Dell Latitude"
                      value={item.make_model}
                      onChange={e => handleItemChange(idx, 'make_model', e.target.value)}
                    />
                  </div>

                  <div className="cf-field">
                    <label className="cf-label">Serial Number (S/N)</label>
                    <input
                      type="text"
                      className="cf-input"
                      placeholder="e.g. F2LZ89X1"
                      value={item.serial_no}
                      onChange={e => handleItemChange(idx, 'serial_no', e.target.value)}
                    />
                  </div>

                  {['phone', 'tablet', 'sim'].includes(item.item_type) && (
                    <>
                      <div className="cf-field">
                        <label className="cf-label">IMEI #1</label>
                        <input
                          type="text"
                          className="cf-input"
                          placeholder="e.g. 356789012345678"
                          value={item.imei}
                          onChange={e => handleItemChange(idx, 'imei', e.target.value)}
                        />
                      </div>
                      <div className="cf-field">
                        <label className="cf-label">IMEI #2</label>
                        <input
                          type="text"
                          className="cf-input"
                          placeholder="e.g. 356789012345679"
                          value={item.imei2}
                          onChange={e => handleItemChange(idx, 'imei2', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="cf-field">
                    <label className="cf-label">Memory / Storage Capacity (GB)</label>
                    <input
                      type="text"
                      className="cf-input"
                      placeholder="e.g. 128 / 512"
                      value={item.storage_capacity}
                      onChange={e => handleItemChange(idx, 'storage_capacity', e.target.value)}
                    />
                  </div>

                  <div className="cf-field">
                    <label className="cf-label">Condition</label>
                    <select
                      className="cf-input"
                      value={item.condition}
                      onChange={e => handleItemChange(idx, 'condition', e.target.value)}
                    >
                      <option value="Sealed">Sealed</option>
                      <option value="Unsealed / Open">Unsealed / Open</option>
                      <option value="Damaged / Broken">Damaged / Broken</option>
                      <option value="Working">Working</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0',
            paddingTop: 16, marginTop: 10,
          }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
              style={{ minWidth: 160 }}
            >
              {busy ? 'Registering...' : '💾 Save Direct Seizure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
