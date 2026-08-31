import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  REPORT_STATUS_LABELS,
  canCompileAdminReports,
  canReviewAdminReports,
  canAckHqReports,
} from '../utils/adminReports';

export default function DsrReportForm() {
  const { id } = useParams();
  const isCreate = !id || id === 'create';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({
    circle_id: user?.circle_id || '',
    report_date: new Date().toISOString().slice(0, 10),
    unit_name: 'CCRC-Lahore',
    notes: '',
  });
  const [loading, setLoading] = useState(!isCreate);
  const [busy, setBusy] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    api.get('/lookup/circles').then(r => setCircles(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isCreate) return;
    api.get(`/dsr-reports/${id}`).then(r => {
      setReport(r.data);
      setForm({
        circle_id: r.data.circle_id,
        report_date: r.data.report_date?.slice?.(0, 10) || r.data.report_date,
        unit_name: r.data.unit_name,
        notes: r.data.notes || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, isCreate]);

  const save = async (recompile = false) => {
    setBusy(true);
    try {
      if (isCreate) {
        const r = await api.post('/dsr-reports', { ...form, auto_compile: true });
        navigate(`/dsr-reports/${r.data.report.id}`);
      } else {
        const r = await api.put(`/dsr-reports/${id}`, { ...form, recompile });
        setReport(r.data.report);
        alert('DSR saved');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const action = async (path, body = {}) => {
    setBusy(true);
    try {
      const r = await api.post(`/dsr-reports/${id}/${path}`, body);
      setReport(r.data.report);
      alert(r.data.message);
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const exportReport = () => {
    window.open(`/api/dsr-reports/${id}/export`, '_blank');
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  const status = report?.status;
  const highlights = report?.highlights || {};

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label"><Link to="/dsr-reports">DSR</Link></div>
          <h1 className="page-title">{isCreate ? 'New Daily Situation Report' : `DSR — ${form.report_date}`}</h1>
          {!isCreate && <p className="page-subtitle">Status: {REPORT_STATUS_LABELS[status] || status}</p>}
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!isCreate && <button type="button" className="btn btn-sm" onClick={exportReport}>Export / Print</button>}
          {canCompileAdminReports(user) && ['draft', 'sent_back'].includes(status) && !isCreate && (
            <>
              <button type="button" className="btn btn-sm" disabled={busy} onClick={() => save(true)}>Recompile from System</button>
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => action('submit-ci')}>Mark to Circle Incharge</button>
            </>
          )}
          {canReviewAdminReports(user) && status === 'submitted_to_ci' && (
            <>
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => action('approve-ci', { ci_remarks: remarks })}>Approve</button>
              <button type="button" className="btn btn-sm" disabled={busy} onClick={() => action('send-back', { send_back_remarks: remarks || 'Please revise' })}>Send Back</button>
            </>
          )}
          {canReviewAdminReports(user) && status === 'ci_approved' && (
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => action('forward-hq')}>Forward to Islamabad HQ</button>
          )}
          {canAckHqReports(user) && status === 'forwarded_to_hq' && (
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => action('ack-hq')}>HQ Acknowledge</button>
          )}
        </div>
      </div>

      {(canReviewAdminReports(user) || canAckHqReports(user)) && !isCreate && (
        <div className="card" style={{ marginBottom: 16 }}>
          <label>Remarks</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} style={{ width: '100%' }} />
        </div>
      )}

      {report?.send_back_remarks && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#e53e3e' }}>
          <strong>Send back:</strong> {report.send_back_remarks}
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <div>
            <label>Circle</label>
            <select value={form.circle_id} disabled={!isCreate && !canCompileAdminReports(user)} onChange={e => setForm(f => ({ ...f, circle_id: e.target.value }))}>
              <option value="">Select circle</option>
              {circles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Report Date</label>
            <input type="date" value={form.report_date} disabled={!isCreate} onChange={e => setForm(f => ({ ...f, report_date: e.target.value }))} />
          </div>
          <div>
            <label>Unit Name</label>
            <input value={form.unit_name} onChange={e => setForm(f => ({ ...f, unit_name: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ width: '100%' }} />
        </div>
        {canCompileAdminReports(user) && (
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save(false)}>
              {isCreate ? 'Create & Auto-Compile' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {!isCreate && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Highlights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
              {Object.entries(highlights).map(([k, v]) => (
                <div key={k} style={{ background: '#f7fafc', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#666' }}>{k.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>Compiled Data Preview</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, maxHeight: 400, overflow: 'auto' }}>
              {JSON.stringify(report?.payload || {}, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
