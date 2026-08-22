import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProgressBar from '../components/ProgressBar';
import { isForensicAdmin, hasRole, hasAnyRole } from '../utils/permissions';
import { formatDisplayDateTime } from '../utils/datetime';

const ROLE_PORTALS = {
  admin_forensic: {
    icon: '🔬',
    name: 'Admin – Forensic Portal',
    desc: 'Full digital forensic laboratory oversight — evidence custody, team management, pipeline tracking & report validations.',
    stage: 'Forensic Lab Administration & Evidence Custody',
    duties: [
      'Monitor incoming digital evidence and seizure memos from Enquiry Officers',
      'Oversee forensic requests marked to Assistant Director (AD) Forensic',
      'Review high-priority and court-mandated device analysis pipelines',
      'Manage forensic laboratory users, credentials & access control',
    ],
  },
  dd_forensic: {
    icon: '🔬',
    name: 'DD Forensic Portal',
    desc: 'Deputy Director Digital Forensics oversight, review incoming seizure requests, mark to AD Forensic & monitor lab turnaround.',
    stage: 'Deputy Director Forensic Oversight',
    duties: [
      'Scrutinize incoming seizure memos and device condition logs forwarded by Circle Incharge',
      'Mark and assign evidence examination to Assistant Director (AD) Forensic',
      'Set examination priorities (Normal, High, ⚡ Urgent)',
      'Monitor lab turnaround and ensure timely report delivery',
    ],
  },
  ad_forensic: {
    icon: '💻',
    name: 'AD Forensic Portal',
    desc: 'Assistant Director Digital Forensics — conduct device examinations, record findings, finalize lab reports & print Chain of Custody.',
    stage: 'Assistant Director Forensic Examination & Custody',
    duties: [
      'Perform digital forensic examination & extraction on seized evidentiary devices',
      'Record device IMEIs, serial numbers, hashes (MD5/SHA256) and artifact logs',
      'Draft forensic findings and finalize signed laboratory reports',
      'Print official Chain of Custody form & confirm physical handover',
    ],
  },
};

const STATUS_META = {
  submitted:    { label: 'Pending CI Review',      sub: 'Received in System',   color: '#e5a100', barColor: '#e5a100' },
  assigned:     { label: 'Assigned to AD Forensic',sub: 'Allocated to AD',      color: '#2563eb', barColor: '#2563eb' },
  in_progress:  { label: 'Lab Examination (AD)',   sub: 'Analysis & Extraction',color: '#7c3aed', barColor: '#7c3aed' },
  report_ready: { label: 'Report Ready',           sub: 'Awaiting Handover',    color: '#059669', barColor: '#059669' },
  handed_over:  { label: 'Handed Over to EO',      sub: 'Custody Completed',    color: '#64748b', barColor: '#64748b' },
};

export default function ForensicDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reqStats, setReqStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', priority: '' });
  const [teamOfficers, setTeamOfficers] = useState([]);

  // Modals
  const [assignModalReq, setAssignModalReq] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assignPriority, setAssignPriority] = useState('normal');

  const [handoverModalReq, setHandoverModalReq] = useState(null);
  const [handoverRemarks, setHandoverRemarks] = useState('');

  const [findingsModalReq, setFindingsModalReq] = useState(null);
  const [examFindings, setExamFindings] = useState('');
  const [examLabNotes, setExamLabNotes] = useState('');
  const [examReportFile, setExamReportFile] = useState(null);

  const [actionBusy, setActionBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');

  const role = user?.roles?.[0]?.name || user?.role || 'admin_forensic';
  const portal = ROLE_PORTALS[role] || ROLE_PORTALS.admin_forensic;

  const isAdmin = isForensicAdmin(user);
  const isAd    = hasAnyRole(user, ['dd_forensic', 'ad_forensic', 'admin_forensic']);
  const isFo    = hasRole(user, 'forensic_team');
  const isDesk  = hasRole(user, 'desk_forensic');

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/forensic/stats').catch(() => ({ data: {} })),
      api.get('/forensic/request-stats').catch(() => ({ data: null })),
      api.get('/forensic/requests', { params: { per_page: 60 } }).catch(() => ({ data: { data: { data: [] } } })),
      isAd ? api.get('/forensic/team-officers').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([u, r, rq, to]) => {
        setData(u.data);
        setReqStats(r.data);
        setRequests(rq.data?.data?.data || rq.data?.data || []);
        if (to?.data?.data) {
          setTeamOfficers(to.data.data);
        }
      })
      .catch(e => setError(e.response?.data?.message || e.message || 'Failed to load forensic dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (activeTab === 'urgent') {
        if (r.priority !== 'urgent' && r.priority !== 'high') return false;
      } else if (activeTab === 'my_queue') {
        if (Number(r.assigned_to) !== Number(user?.id)) return false;
      } else if (activeTab !== 'all') {
        if (r.status !== activeTab) return false;
      }

      if (selectedCircle) {
        const cName = r.submitter?.circle?.name || r.enquiry?.complaint?.circle?.name || '';
        if (cName !== selectedCircle) return false;
      }

      if (filters.priority) {
        if (r.priority !== filters.priority) return false;
      }

      if (filters.dateFrom) {
        if (!r.created_at || r.created_at < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        if (!r.created_at || r.created_at.slice(0, 10) > filters.dateTo) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchReqNo = r.request_no?.toLowerCase().includes(q);
        const matchCode = r.report_code?.toLowerCase().includes(q);
        const matchNote = r.note?.toLowerCase().includes(q);
        const matchEnquiry = r.enquiry?.enquiry_number?.toLowerCase().includes(q);
        const matchFir = r.case_file?.fir_no?.toLowerCase().includes(q);
        const matchSubmitter = r.submitter?.name?.toLowerCase().includes(q);
        const matchAccused = (r.enquiry?.accused_persons || []).some(a => a.name?.toLowerCase().includes(q));
        const matchItems = (r.items || []).some(it =>
          (it.make_model && it.make_model.toLowerCase().includes(q)) ||
          (it.imei && it.imei.toLowerCase().includes(q)) ||
          (it.serial_no && it.serial_no.toLowerCase().includes(q)) ||
          (it.item_type && it.item_type.toLowerCase().includes(q))
        );
        return matchReqNo || matchCode || matchNote || matchEnquiry || matchFir || matchSubmitter || matchAccused || matchItems;
      }

      return true;
    });
  }, [requests, activeTab, selectedCircle, filters, searchQuery, user?.id]);

  const totalRequests = reqStats
    ? (reqStats.submitted || 0) + (reqStats.assigned || 0) + (reqStats.in_progress || 0) + (reqStats.report_ready || 0) + (reqStats.handed_over || 0)
    : requests.length;

  const totalDevices = reqStats?.total_devices || requests.reduce((acc, r) => acc + (r.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0), 0);

  const circlesList = useMemo(() => {
    if (reqStats?.by_circle) return Object.keys(reqStats.by_circle);
    const set = new Set();
    requests.forEach(r => {
      const c = r.submitter?.circle?.name || r.enquiry?.complaint?.circle?.name;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [reqStats, requests]);

  // Stage rows for workflow progress
  const stageRows = useMemo(() => {
    const sub = reqStats?.submitted || 0;
    const ass = reqStats?.assigned || 0;
    const inp = reqStats?.in_progress || 0;
    const rdy = reqStats?.report_ready || 0;
    const hnd = reqStats?.handed_over || 0;

    return [
      ['Pending Review (New Seizures)', sub, '#e5a100'],
      ['Assigned to FO', ass, '#2563eb'],
      ['Lab Examination / Extraction', inp, '#7c3aed'],
      ['Report Ready (Desk Queue)', rdy, '#059669'],
      ['Handed Over to EO', hnd, '#64748b'],
    ];
  }, [reqStats]);

  const avgCompletion = useMemo(() => {
    if (!totalRequests) return 0;
    const weighted = (
      ((reqStats?.submitted || 0) * 15) +
      ((reqStats?.assigned || 0) * 35) +
      ((reqStats?.in_progress || 0) * 65) +
      ((reqStats?.report_ready || 0) * 90) +
      ((reqStats?.handed_over || 0) * 100)
    );
    return Math.round(weighted / totalRequests);
  }, [reqStats, totalRequests]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ reqStats, requests: filteredRequests }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-evidence-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Action handlers
  const handleAssignSubmit = async () => {
    if (!assignModalReq || !assigneeId) return;
    setActionBusy(true); setActionErr(''); setActionMsg('');
    try {
      const res = await api.post(`/forensic/requests/${assignModalReq.id}/assign`, {
        assigned_to: Number(assigneeId),
        remarks: assignRemarks || undefined,
        priority: assignPriority || 'normal',
      });
      setActionMsg(res.data?.message || 'Assigned successfully.');
      setAssignModalReq(null);
      setAssigneeId('');
      setAssignRemarks('');
      loadData();
    } catch (e) {
      setActionErr(e.response?.data?.message || 'Assignment failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleFindingsSubmit = async (markReady = false) => {
    if (!findingsModalReq) return;
    setActionBusy(true); setActionErr(''); setActionMsg('');
    try {
      const fd = new FormData();
      if (examFindings) fd.append('findings', examFindings);
      if (examLabNotes) fd.append('lab_notes', examLabNotes);
      if (examReportFile) fd.append('report_file', examReportFile);

      const endpoint = markReady
        ? `/forensic/requests/${findingsModalReq.id}/mark-ready`
        : `/forensic/requests/${findingsModalReq.id}/findings`;

      const res = await api.post(endpoint, fd);
      setActionMsg(res.data?.message || 'Updated successfully.');
      setFindingsModalReq(null);
      setExamFindings('');
      setExamLabNotes('');
      setExamReportFile(null);
      loadData();
    } catch (e) {
      setActionErr(e.response?.data?.message || 'Failed to save findings');
    } finally {
      setActionBusy(false);
    }
  };

  const handleHandoverSubmit = async () => {
    if (!handoverModalReq) return;
    setActionBusy(true); setActionErr(''); setActionMsg('');
    try {
      const res = await api.post(`/forensic/requests/${handoverModalReq.id}/hand-over`, {
        handover_remarks: handoverRemarks || undefined,
      });
      setActionMsg(res.data?.message || 'Handover confirmed.');
      setHandoverModalReq(null);
      setHandoverRemarks('');
      loadData();
    } catch (e) {
      setActionErr(e.response?.data?.message || 'Handover failed');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard_page">
        <LoadingSkeleton type="stats" rows={8} />
        <LoadingSkeleton type="table" rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard_page" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#e53e3e', fontSize: 14, marginBottom: 8 }}>⚠️ Forensic Dashboard Error</div>
        <div style={{ color: '#888', fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard_page">

      {/* ── Page Header (Identical to other portals) ── */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label">Forensic Portal</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp; NCCIA Digital Forensic Lab &amp; Evidence Custody
          </p>
          <div className="title-underline"></div>
        </div>

        <div className="page-actions">
          <div className="filters-bar" style={{ margin: 0, padding: '8px 12px' }}>
            <span className="filter-label">Period</span>
            <div className="filter-date-range">
              <input
                type="date"
                id="dateFrom"
                aria-label="From date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              />
              <span className="date-sep">to</span>
              <input
                type="date"
                id="dateTo"
                aria-label="To date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              />
            </div>

            <select
              className="filter-select"
              value={selectedCircle}
              onChange={e => setSelectedCircle(e.target.value)}
            >
              <option value="">All Circles</option>
              {circlesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button className="btn btn-primary btn-sm" onClick={loadData}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              Refresh
            </button>

            <button className="btn btn-outline btn-sm" onClick={handleExport} title="Export Report">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '12px 18px', marginBottom: 16, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', borderRadius: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✅ {actionMsg}</span>
          <button type="button" onClick={() => setActionMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {actionErr && (
        <div style={{ padding: '12px 18px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {actionErr}</span>
          <button type="button" onClick={() => setActionErr('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* ── Standard Role Portal Banner (Identical to other portals) ── */}
      <div className="role-portal-banner" style={{
        background: 'linear-gradient(135deg, #015C94 0%, #084c61 50%, #0081a7 100%)',
        color: '#fff', borderRadius: 12, padding: '20px 24px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        boxShadow: '0 4px 16px rgba(1,92,148,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 36 }}>{portal.icon}</div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>
              Welcome back, <strong>{user?.name?.split(' ')[0] || 'Officer'}</strong>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{portal.name}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{portal.desc}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/forensic/requests" className="btn" style={{ background: '#fff', color: '#015C94', fontWeight: 700 }}>
            Seizure Register
          </Link>
          {isAdmin && (
            <Link to="/forensic/users" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }}>
              Manage Team
            </Link>
          )}
        </div>
      </div>

      {/* ── Stage & Duties Card ── */}
      <div className="card" style={{ marginBottom: 20, border: '1px solid #e2e8f0' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#015C94', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
            Aapka stage: {portal.stage}
          </div>
          <div style={{ fontSize: 13, color: '#334155', marginBottom: 8 }}>Aap yeh perform karenge:</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13, lineHeight: 1.55 }}>
            {(portal.duties || []).map((duty, idx) => <li key={idx}>{duty}</li>)}
          </ul>
        </div>
      </div>

      {/* ── Standard Stats Grid (Identical stat-card styles) ── */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card blue">
          <div className="stat-value">{totalRequests}</div>
          <div className="stat-label">Total Seizures Received</div>
          <div className="stat-footer">
            <span>Seizure Memos</span>
            <span className="stat-footer-value">{totalDevices} devices</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-value">{reqStats?.submitted || 0}</div>
          <div className="stat-label">Pending AD Review</div>
          <div className="stat-footer">
            <span>Awaiting Assignment</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-value">{reqStats?.in_progress || 0}</div>
          <div className="stat-label">In Lab Examination</div>
          <div className="stat-footer">
            <span>Extraction Active</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-value">{reqStats?.report_ready || 0}</div>
          <div className="stat-label">Reports Ready</div>
          <div className="stat-footer">
            <span>Desk Collection Queue</span>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-value">{reqStats?.handed_over || 0}</div>
          <div className="stat-label">Handed Over to EO</div>
          <div className="stat-footer">
            <span>Completed Custody</span>
          </div>
        </div>

        {reqStats?.urgent_count > 0 ? (
          <div className="stat-card red">
            <div className="stat-value">{reqStats.urgent_count}</div>
            <div className="stat-label">⚡ Urgent Priority</div>
            <div className="stat-footer">
              <span>Court / High Sensitive</span>
            </div>
          </div>
        ) : (
          <div className="stat-card gold">
            <div className="stat-value">{totalDevices}</div>
            <div className="stat-label">Total Vault Devices</div>
            <div className="stat-footer">
              <span>Under Custody</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Main 2-Column Dashboard Grid (Identical to other portals) ── */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', marginTop: 8 }}>

        {/* ── Left Column: Seizure Requests & Custody Ledger ── */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div className="card-title">
              <div className="card-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              Seizure Evidence Ledger — Provenance &amp; Custody
            </div>
            <div className="section-actions" style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="cf-input"
                style={{ height: 32, fontSize: 12, minWidth: 200 }}
                placeholder="🔍 Search IMEI, Serial, Officer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Link to="/forensic/requests" className="btn btn-outline btn-sm">View All</Link>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
            {[
              { key: 'all',          label: `All (${requests.length})` },
              { key: 'submitted',    label: `Pending Review (${reqStats?.submitted || 0})` },
              { key: 'assigned',     label: `Assigned FO (${reqStats?.assigned || 0})` },
              { key: 'in_progress',  label: `In Analysis (${reqStats?.in_progress || 0})` },
              { key: 'report_ready', label: `Report Ready (${reqStats?.report_ready || 0})` },
              { key: 'handed_over',  label: `Handed Over (${reqStats?.handed_over || 0})` },
              ...(reqStats?.urgent_count > 0 ? [{ key: 'urgent', label: `⚡ Urgent (${reqStats.urgent_count})` }] : []),
              ...(isFo ? [{ key: 'my_queue', label: `👤 My Queue (${reqStats?.my_assigned || 0})` }] : []),
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? '#015C94' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#475569',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="data-table" style={{ display: 'table', width: '100%' }} aria-label="Forensic Seizure Evidence Table">
                <thead>
                  <tr>
                    <th>Request / Priority</th>
                    <th>Kis nay Seize kiya</th>
                    <th>Kahan say Bheja</th>
                    <th>Seized Items</th>
                    <th>Report Code</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 28, color: '#6c757d' }}>
                        Abhi koi seizure request nahi — field officer seizure add kare ga toh yahan show ho gi.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(r => {
                      const sm = STATUS_META[r.status] || { label: r.status, color: '#64748b', barColor: '#64748b' };
                      const items = r.items || [];
                      const circle = r.submitter?.circle?.name || r.enquiry?.complaint?.circle?.name || 'Circle';
                      const caseRef = r.enquiry?.enquiry_number
                        ? `Enquiry #${r.enquiry.enquiry_number}`
                        : (r.case_file?.fir_no ? `FIR #${r.case_file.fir_no}` : 'Case');

                      return (
                        <tr key={r.id}>
                          {/* Request No */}
                          <td>
                            <span className="table-id">{r.request_no}</span>
                            {r.priority === 'urgent' && (
                              <div style={{ fontSize: 10, color: '#b91c1c', fontWeight: 800 }}>⚡ URGENT</div>
                            )}
                            {r.priority === 'high' && (
                              <div style={{ fontSize: 10, color: '#c2410c', fontWeight: 700 }}>🔥 HIGH</div>
                            )}
                          </td>

                          {/* Kis nay Seize kiya */}
                          <td>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                              {r.submitter?.name || 'Enquiry Officer'}
                            </span>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              {r.submitter?.designation || 'EO'} · {circle}
                            </div>
                          </td>

                          {/* Kahan say Bheja */}
                          <td>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#015C94' }}>{caseRef}</div>
                            {r.enquiry?.complaint?.complainant_name && (
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                Comp: {r.enquiry.complaint.complainant_name}
                              </div>
                            )}
                          </td>

                          {/* Seized Items */}
                          <td>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 4 }}>
                                {items.length} {items.length === 1 ? 'Device' : 'Devices'}
                              </span>
                              {items.slice(0, 1).map((it, idx) => (
                                <span key={idx} style={{ fontSize: 11, color: '#334155' }}>
                                  {it.item_type === 'phone' ? '📱' : it.item_type === 'laptop' ? '💻' : '📦'} {it.make_model || it.item_type}
                                  {it.imei ? ` (${it.imei.slice(-6)})` : ''}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Report Code */}
                          <td>
                            {r.report_code ? (
                              <div style={{ fontSize: 11.5, fontWeight: 800, color: '#059669' }}>
                                {r.report_code}
                              </div>
                            ) : (
                              <div style={{ fontSize: 11.5, color: '#64748b' }}>—</div>
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: sm.color,
                              display: 'inline-block',
                            }}>
                              {sm.label}
                            </span>
                          </td>

                          {/* Action */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                              <Link to={`/forensic/requests/${r.id}`} className="btn btn-outline btn-sm btn-icon" title="View Seizure Detail">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </Link>

                              {isAd && r.status === 'submitted' && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '2px 6px', fontSize: 11 }}
                                  onClick={() => {
                                    setAssignModalReq(r);
                                    setAssigneeId('');
                                    setAssignRemarks('');
                                    setAssignPriority(r.priority || 'normal');
                                  }}
                                >
                                  Assign
                                </button>
                              )}

                              {isFo && ['assigned', 'in_progress'].includes(r.status) && (Number(r.assigned_to) === Number(user?.id) || isAdmin) && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '2px 6px', fontSize: 11, background: '#7c3aed' }}
                                  onClick={() => {
                                    setFindingsModalReq(r);
                                    setExamFindings(r.findings || '');
                                    setExamLabNotes(r.lab_notes || '');
                                  }}
                                >
                                  Report
                                </button>
                              )}

                              {isDesk && r.status === 'report_ready' && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '2px 6px', fontSize: 11, background: '#059669' }}
                                  onClick={() => {
                                    setHandoverModalReq(r);
                                    setHandoverRemarks('');
                                  }}
                                >
                                  Handover
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right Column: Workflow Stages, Categories & Circles (Identical to other portals) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Workflow Stages with ProgressBar */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                Forensic Workflow Stages
              </div>
            </div>
            <div className="card-body">
              <div className="progress-list">
                <div className="progress-item">
                  <div className="progress-header">
                    <span className="progress-name">Avg Lab Turnaround Progress</span>
                    <span className="progress-count">{avgCompletion}%</span>
                  </div>
                  <ProgressBar value={avgCompletion} color="#015C94" />
                </div>

                {stageRows.filter(([, n]) => n > 0).map(([name, n, color]) => (
                  <div className="progress-item" key={name}>
                    <div className="progress-header">
                      <span className="progress-name">{name}</span>
                      <span className="progress-count">{n} · {totalRequests ? Math.round((n / totalRequests) * 100) : 0}%</span>
                    </div>
                    <ProgressBar value={totalRequests ? (n / totalRequests) * 100 : 0} color={color} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seized Device Categories */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/></svg>
                </div>
                Evidence Categories ({totalDevices} Items)
              </div>
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>📱 Phones / IMEIs</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{reqStats?.devices_by_type?.phone || 0}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>💻 Laptops / PCs</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{reqStats?.devices_by_type?.laptop || 0}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>💽 Hard Drives / SSDs</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{reqStats?.devices_by_type?.storage || 0}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>📶 SIMs &amp; USBs</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{reqStats?.devices_by_type?.sim || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seizures by Circle (Origin) */}
          {reqStats?.by_circle && Object.keys(reqStats.by_circle).length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  Origin by Circle
                </div>
              </div>
              <div className="card-body" style={{ padding: '12px 16px' }}>
                <div className="progress-list">
                  {Object.entries(reqStats.by_circle).slice(0, 5).map(([cName, count]) => {
                    const pct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
                    return (
                      <div className="progress-item" key={cName}>
                        <div className="progress-header">
                          <span className="progress-name">{cName}</span>
                          <span className="progress-count">{count} · {pct}%</span>
                        </div>
                        <ProgressBar value={pct} color="#0097a7" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Aapka Kaam Card */}
          <div className="card" style={{ border: '1px solid #bfdbfe' }}>
            <div className="card-body" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#015C94', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Aapka Kaam
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13, lineHeight: 1.55 }}>
                {(portal.duties || []).map((duty, idx) => <li key={idx}>{duty}</li>)}
              </ul>
              <Link to="/forensic/requests" className="btn btn-primary btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
                Seizure Register
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals: AD Assign, FO Findings, Desk Handover ── */}
      {assignModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', padding: 22, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Assign Forensic Officer ({assignModalReq.request_no})
              </h2>
              <button type="button" onClick={() => setAssignModalReq(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="cf-field">
                <label className="cf-label required">Select Forensic Officer</label>
                <select className="cf-input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">— Select FO —</option>
                  {teamOfficers.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.designation || 'Examiner'})</option>
                  ))}
                </select>
              </div>

              <div className="cf-field">
                <label className="cf-label">Priority</label>
                <select className="cf-input" value={assignPriority} onChange={e => setAssignPriority(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">⚡ Urgent Priority</option>
                </select>
              </div>

              <div className="cf-field">
                <label className="cf-label">Directives &amp; Examination Instructions</label>
                <textarea
                  className="cf-input"
                  rows={3}
                  placeholder="Extraction scope, chats, CDRs, financial records..."
                  value={assignRemarks}
                  onChange={e => setAssignRemarks(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setAssignModalReq(null)} disabled={actionBusy}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAssignSubmit} disabled={actionBusy || !assigneeId}>
                {actionBusy ? 'Assigning…' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {findingsModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 580, width: '100%', padding: 22, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Forensic Examination &amp; Report ({findingsModalReq.request_no})
              </h2>
              <button type="button" onClick={() => setFindingsModalReq(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="cf-field">
                <label className="cf-label">Key Forensic Findings &amp; Recovered Artifacts</label>
                <textarea
                  className="cf-input"
                  rows={4}
                  placeholder="Extraction results, chat logs, call details, location data, hash values..."
                  value={examFindings}
                  onChange={e => setExamFindings(e.target.value)}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Lab Tool Logs / Notes</label>
                <textarea
                  className="cf-input"
                  rows={2}
                  placeholder="Tools used (UFED, AXIOM, EnCase), write-blockers..."
                  value={examLabNotes}
                  onChange={e => setExamLabNotes(e.target.value)}
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Upload Lab Report PDF / Archive</label>
                <input
                  type="file"
                  className="cf-input"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={e => setExamReportFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setFindingsModalReq(null)} disabled={actionBusy}>Cancel</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => handleFindingsSubmit(false)} disabled={actionBusy}>
                  Save Draft
                </button>
                <button type="button" className="btn btn-primary btn-sm" style={{ background: '#059669' }} onClick={() => handleFindingsSubmit(true)} disabled={actionBusy}>
                  Mark Report Ready
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {handoverModalReq && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
        }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 460, width: '100%', padding: 22, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Confirm Handover to EO
              </h2>
              <button type="button" onClick={() => setHandoverModalReq(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>
              <div><strong>Recipient:</strong> {handoverModalReq.submitter?.name || 'Enquiry Officer'}</div>
              <div><strong>Report Code:</strong> <span style={{ color: '#059669', fontWeight: 800 }}>{handoverModalReq.report_code}</span></div>
            </div>

            <div className="cf-field">
              <label className="cf-label">Handover Remarks</label>
              <input
                className="cf-input"
                placeholder="Physical report & sealed evidence bag handed to EO."
                value={handoverRemarks}
                onChange={e => setHandoverRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setHandoverModalReq(null)} disabled={actionBusy}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" style={{ background: '#059669' }} onClick={handleHandoverSubmit} disabled={actionBusy}>
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
