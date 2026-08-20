import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDisplayDateTime } from '../utils/datetime';
import { hasAnyRole, hasRole, isForensicAdmin } from '../utils/permissions';
import { useAuth } from '../contexts/AuthContext';

const ITEM_LABELS = {
  'cd_dvd':      { label: 'CD/DVD',           icon: '\uD83D\uDCC0' },
  'computer':    { label: 'Computer/Desktop',  icon: '\uD83D\uDDA5\uFE0F' },
  'dvr':         { label: 'DVR',               icon: '\uD83D\uDCF9' },
  'hdd':         { label: 'Hard Disk - HDD',   icon: '\uD83D\uDCBD' },
  'ipad_tablet': { label: 'iPad/Tablet',        icon: '\uD83D\uDCF1' },
  'laptop':      { label: 'Laptop',             icon: '\uD83D\uDCBB' },
  'memory_card': { label: 'Memory Card',        icon: '\uD83D\uDDC2\uFE0F' },
  'phone':       { label: 'Mobile Phone',       icon: '\uD83D\uDCF1' },
  'other':       { label: 'Other',              icon: '\uD83D\uDCE6' },
  'sim':         { label: 'SIM Card',           icon: '\uD83D\uDCF6' },
  'usb':         { label: 'USB',                icon: '\uD83D\uDD0C' },
};
function itemLabel(type) {
  const m = ITEM_LABELS[type] || ITEM_LABELS['other'];
  return `${m.icon} ${m.label}`;
}

const STATUS_META = {
  submitted:             { label: 'Pending CI Review',             color: '#e5a100', bg: '#fef3c7', icon: '\u23F3' },
  forwarded_to_forensic: { label: 'Pending AD Review',             color: '#e5a100', bg: '#fef3c7', icon: '\u23F3' },
  assigned:              { label: 'Assigned to FO',                color: '#2563eb', bg: '#dbeafe', icon: '\uD83D\uDC64' },
  in_progress:           { label: 'Lab Examination',               color: '#7c3aed', bg: '#ede9fe', icon: '\uD83D\uDD2C' },
  submitted_to_ad:       { label: 'Submitted to AD',               color: '#d97706', bg: '#fef3c7', icon: '\uD83D\uDCDD' },
  report_ready:          { label: 'Report Approved (EO Notified)', color: '#059669', bg: '#d1fae5', icon: '\u2705' },
  handed_over:           { label: 'Handed Over to EO',             color: '#64748b', bg: '#f1f5f9', icon: '\uD83D\uDCE4' },
};

export default function ForensicRequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [row, setRow] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [assignPriority, setAssignPriority] = useState('normal');
  const [remarks, setRemarks] = useState('');
  const [handoverRemarks, setHandoverRemarks] = useState('');
  const [findings, setFindings] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const isAdmin = isForensicAdmin(user);
  const isAd    = hasAnyRole(user, ['dd_forensic', 'ad_forensic', 'admin_forensic']);
  const isDesk  = hasAnyRole(user, ['desk_forensic', 'admin_forensic', 'dd_forensic', 'ad_forensic']);
  const isFo    = hasRole(user, 'forensic_team') || hasRole(user, 'admin_forensic');

  const load = () => {
    setLoading(true); setErr('');
    api.get(`/forensic/requests/${id}`)
      .then(r => {
        const d = r.data.data;
        setRow(d);
        setFindings(d.findings || '');
        setLabNotes(d.lab_notes || '');
        setAssignPriority(d.priority || 'normal');
      })
      .catch(e => setErr(e.response?.data?.message || 'Failed to load request details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (isAd) {
      api.get('/forensic/team-officers').then(r => setOfficers(r.data.data || [])).catch(() => {});
    }
  }, [isAd]);

  const assign = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await api.post(`/forensic/requests/${id}/assign`, {
        assigned_to: Number(assignedTo),
        remarks: remarks || undefined,
        priority: assignPriority || 'normal',
      });
      setRow(r.data.data); setMsg(r.data.message);
    } catch (e) { setErr(e.response?.data?.message || 'Assignment failed'); }
    finally { setBusy(false); }
  };

  const postFd = async (url) => {
    const fd = new FormData();
    if (findings) fd.append('findings', findings);
    if (labNotes) fd.append('lab_notes', labNotes);
    if (reportFile) fd.append('report_file', reportFile);
    const r = await api.post(url, fd);
    setRow(r.data.data); setMsg(r.data.message); setReportFile(null);
  };

  const saveFindings     = async () => { setBusy(true); setErr(''); setMsg(''); try { await postFd(`/forensic/requests/${id}/findings`); } catch(e){ setErr(e.response?.data?.message||'Save failed'); } finally { setBusy(false); } };
  const submitToAd       = async () => { setBusy(true); setErr(''); setMsg(''); try { await postFd(`/forensic/requests/${id}/submit-to-ad`); } catch(e){ setErr(e.response?.data?.message||'Submit failed'); } finally { setBusy(false); } };
  const approveAndNotify = async () => { setBusy(true); setErr(''); setMsg(''); try { await postFd(`/forensic/requests/${id}/mark-ready`); } catch(e){ setErr(e.response?.data?.message||'Approve failed'); } finally { setBusy(false); } };
  const handOver         = async () => { setBusy(true); setErr(''); setMsg(''); try { const r = await api.post(`/forensic/requests/${id}/hand-over`, { handover_remarks: handoverRemarks||undefined }); setRow(r.data.data); setMsg(r.data.message); } catch(e){ setErr(e.response?.data?.message||'Handover failed'); } finally { setBusy(false); } };

  const handlePrintF31 = () => {
    const area = document.getElementById('f31PrintArea');
    if (!area) return;
    const w = window.open('', '_blank', 'width=920,height=750');
    w.document.write(`<!DOCTYPE html><html><head><title>F-31 Chain of Custody</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:11.5px;color:#000;padding:20px;}
    table{width:100%;border-collapse:collapse;margin-bottom:14px;}td,th{border:1px solid #000;padding:5px 7px;vertical-align:top;}
    th{background:#d0d0d0;font-weight:bold;text-align:center;}.lbl{font-weight:bold;background:#f5f5f5;}
    .sec{background:#c0c0c0;font-weight:bold;text-align:center;padding:5px;}
    @media print{body{padding:10px;}}</style></head><body>${area.innerHTML}</body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
  };

  const handlePrintScopeLetter = () => {
    if (!row) return;
    const enqNo = row.enquiry?.enquiry_number || row.enquiry?.complaint?.tracking_no || `ENQ-${row.enquiry_id}`;
    const compName = row.enquiry?.complaint?.complainant_name || row.enquiry?.direct_info?.complainant_name || 'Complainant';
    const compCnic = row.enquiry?.complaint?.cnic || row.enquiry?.direct_info?.cnic || '—';
    const dateStr = new Date().toLocaleDateString('en-GB');
    const officerName = row.submitter?.name || 'Enquiry Officer';
    const officerDesig = row.submitter?.designation || 'Enquiry Officer';
    const circleName = row.submitter?.circle?.name || row.enquiry?.complaint?.circle?.name || 'Headquarters / Main';
    
    const accusedList = row.enquiry?.accused_persons || [];
    const accRows = accusedList.length > 0 
      ? accusedList.map((a, i) => `<div><strong>${i+1}. ${a.name || '—'}</strong> S/O ${a.father_name || '—'} R/O ${a.postal_address || a.permanent_address || '—'}</div>`).join('')
      : '<div>1. Name S/o R/o ________________________________________________</div>';

    const itemRows = (row.items && row.items.length > 0 ? row.items : [{ item_type: 'Digital Device', make_model: 'Seized Device', quantity: 1 }]).map((it, idx) => {
      let imeiStr = [];
      if (it.imei) imeiStr.push('IMEI1: ' + it.imei);
      if (it.imei2) imeiStr.push('IMEI2: ' + it.imei2);
      if (it.serial_no) imeiStr.push('SN: ' + it.serial_no);
      let imeiFinal = imeiStr.length > 0 ? imeiStr.join('<br/>') : '—';
      
      return `
      <tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${idx + 1}</td>
        <td style="border:1px solid #000;padding:6px;"><strong>${it.item_type || 'Digital Device'}</strong></td>
        <td style="border:1px solid #000;padding:6px;">${it.make_model || '—'}</td>
        <td style="border:1px solid #000;padding:6px;font-family:monospace;">${imeiFinal}</td>
        <td style="border:1px solid #000;padding:6px;">${it.storage_capacity || '—'}</td>
        <td style="border:1px solid #000;padding:6px;">${it.condition || 'Sealed'}</td>
        <td style="border:1px solid #000;padding:6px;">${it.description || '—'}</td>
      </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Forensic Scope Letter - ${enqNo}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 15mm; }
          body { font-family: Arial, Helvetica, sans-serif; color: #000; background: #fff; margin: 0; padding: 0; line-height: 1.45; font-size: 13px; }
          .hdr { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
          .hdr-title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .hdr-sub { font-size: 13px; font-weight: 600; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
          .to-sec { margin-bottom: 12px; }
          .subj { font-weight: 800; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin: 12px 0; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="hdr">
          <div class="hdr-title">NATIONAL CYBER CRIME INVESTIGATION AGENCY (NCCIA)</div>
          <div class="hdr-sub">CYBER CRIME REPORTING CENTRE (CCRC) ${circleName.toUpperCase()}</div>
        </div>

        <div class="meta-row">
          <div><strong>Memo No.</strong> ${row.request_no || '—'} / NCCIA / CCRC / ${circleName}</div>
          <div><strong>Dated:</strong> ${dateStr}</div>
        </div>

        <div class="to-sec">
          <strong>THE INCHARGE</strong><br/>
          <strong>NCCIA, CCRC, ${circleName.toUpperCase()}</strong>
        </div>

        <div class="subj">
          SUBJECT: REQUEST FOR PROVIDING FORENSIC ANALYSIS REPORT IN ENQ / CASE FIR NO. ${enqNo} (SEIZURE MEMO ATTACHED) OF PS. NCCIA, CCRC, ${circleName.toUpperCase()}.
        </div>

        <div><strong>SIR,</strong></div>
        <p style="margin-top:8px;">
          <strong>BACKGROUND:</strong> THE SUBJECT CASE HAS BEEN REGISTERED AT CCRC ${circleName}, NCCIA, AND THE BELOW DIGITAL MEDIA REQUIRES FORENSIC ANALYSIS TO CONCLUDE THE INVESTIGATION ON MERIT. THE SUBJECT-CITED ENQUIRY HAS BEEN REGISTERED AGAINST THE ACCUSED PERSON,
        </p>

        <div style="margin: 6px 0 10px 16px; line-height: 1.6;">
          ${accRows}
        </div>

        <p>THE BRIEF CONTENTS OF THE CASE ARE THAT THE ALLEGED PERSON IS INVOLVED IN <strong>${row.brief_contents || 'alleged cybercrime offences'}</strong>.</p>

        <p>DURING THE COURSE OF ENQUIRY/INVESTIGATION, THE RELEVANT DIGITAL MEDIA WAS TAKEN INTO POSSESSION FOR FORENSIC EXAMINATION. THE DETAIL OF THE DIGITAL MEDIA IS AS UNDER:</p>

        <div style="font-weight:800; text-decoration:underline; margin: 14px 0 6px 0;">DIGITAL MEDIA RECOVERED</div>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
          <thead>
            <tr>
              <th style="border:1px solid #000;padding:6px;background:#f1f5f9;width:40px;">SR. NO.</th>
              <th style="border:1px solid #000;padding:6px;background:#f1f5f9;">TYPE OF EVIDENTIARY DEVICE</th>
              <th style="border:1px solid #000;padding:6px;background:#f1f5f9;">MAKE / MODEL</th>
              <th style="border:1px solid #000;padding:6px;background:#f1f5f9;">IMEI / SERIAL NO</th>
              <th style="border:1px solid #000;padding:6px;background:#f1f5f9;">STORAGE</th>
              <th style="border:1px solid #000;padding:6px;background:#f1f5f9;">CONDITION</th>
              <th style="border:1px solid #000;padding:6px;background:#f1f5f9;">DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="font-weight:800; text-decoration:underline; margin: 14px 0 6px 0;">SCOPE FOR FORENSIC ANALYSIS</div>
        <p><strong>YOU ARE REQUESTED TO CONDUCT FORENSIC EXAMINATION AND PROVIDE REPORT ON THE FOLLOWING SCOPE:</strong></p>
        <div style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; white-space: pre-wrap; font-size: 13px; line-height: 1.5; margin-bottom: 12px; min-height: 60px;">
          ${row.analysis_scope || 'Conduct comprehensive forensic examination and data extraction...'}
        </div>

        <p style="margin-top:10px;">
          It is therefore requested that the allied forensic analysis report, as per the above scope, may kindly be furnished at the earliest to enable the undersigned to finalize the instant case/enquiry on merit, please.
        </p>

        <div style="margin-top:16px;">
          <strong>ENCLOSURES:</strong><br/>
          1. COPY OF ENQ NO. <strong>${enqNo}</strong><br/>
          2. COPY OF SEIZURE MEMO (RECOVERY MEMO) OF DIGITAL DEVICE
        </div>

        <div style="margin-top: 50px; display:flex; justify-content:flex-end;">
          <div style="text-align:right;">
            <strong>${officerName}</strong><br/>
            ${officerDesig}<br/>
            NCCIA, ${circleName}
          </div>
        </div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  if (loading) return <div className="page-content"><LoadingSkeleton type="form" /></div>;
  if (err && !row) return (
    <div className="page-content">
      <div style={{color:'#e53e3e',padding:40,textAlign:'center',background:'#fff',borderRadius:12,border:'1px solid #fee2e2'}}>
        <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>⚠️ {err}</div>
        <p style={{color:'#64748b',fontSize:13,marginBottom:16}}>Could not retrieve forensic request record.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={load}>Retry Loading</button>
      </div>
    </div>
  );
  if (!row) return null;

  const canAssign        = isAd && (row.status === 'submitted' || row.status === 'forwarded_to_forensic' || isAdmin) && row.destination === 'forensic';
  const canWorkFindings  = isFo && ['assigned','in_progress','submitted_to_ad'].includes(row.status) && ((Number(row.assigned_to) === Number(user?.id)) || isAdmin);
  const canApproveAd     = isAd && ['submitted_to_ad','in_progress','assigned'].includes(row.status);
  const canHandOver      = isDesk && row.status === 'report_ready';
  const sm               = STATUS_META[row.status] || { label: row.status, color: '#64748b', bg: '#f1f5f9', icon: '' };
  const circleName       = row.submitter?.circle?.name || row.enquiry?.complaint?.circle?.name || 'Headquarters / Main';
  const zoneName         = row.enquiry?.complaint?.zone?.name || 'NCCIA';
  const caseRef          = row.enquiry?.enquiry_number
    ? `Enquiry #${row.enquiry.enquiry_number}`
    : (row.caseFile?.fir_no ? `FIR #${row.caseFile.fir_no}` : 'Direct Case Seizure');
  const accusedList      = row.enquiry?.accused_persons || row.enquiry?.accusedPersons || [];
  const complainantName  = row.enquiry?.complaint?.complainant_name;
  const receivedDateTime = row.created_at
    ? new Date(row.created_at).toLocaleString('en-PK',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
    : '\u2014';

  return (
    <div className="page-content" id="forensicPrintArea">

      {/* Header */}
      <div className="page-header" style={{marginBottom:16}}>
        <div className="page-title-group">
          <div className="page-label">
            <Link to="/forensic/requests" style={{color:'inherit',textDecoration:'none'}}>\u2190 Forensic Seizure Register</Link>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <h1 className="page-title" style={{margin:0}}>{row.request_no}</h1>
            <span style={{fontSize:12,fontWeight:700,background:sm.bg,color:sm.color,padding:'4px 12px',borderRadius:20}}>
              {sm.icon} {sm.label}
            </span>
            {row.priority === 'urgent' && (
              <span style={{fontSize:11,background:'#fee2e2',color:'#b91c1c',padding:'3px 8px',borderRadius:6,fontWeight:800}}>\u26A1 URGENT</span>
            )}
          </div>
          <p className="page-subtitle">Seizure Evidence Provenance &amp; Forensic Chain of Custody Record</p>
          <div className="title-underline"></div>
        </div>
        <div className="page-actions" style={{display:'flex',gap:8}}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handlePrintScopeLetter} style={{color:'#d97706',borderColor:'#d97706'}}>
            🖨️ Print Scope Letter
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrintF31} style={{background:'#015C94'}}>
            \uD83D\uDDA8\uFE0F Print F-31 Chain of Custody
          </button>
          <Link to="/forensic" className="btn btn-outline">Dashboard</Link>
        </div>
      </div>

      {msg && (
        <div style={{padding:'12px 18px',marginBottom:16,background:'#ecfdf5',border:'1px solid #6ee7b7',color:'#065f46',borderRadius:10,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span>\u2705 {msg}</span>
          <button type="button" onClick={()=>setMsg('')} style={{background:'none',border:'none',cursor:'pointer',color:'#065f46',fontWeight:'bold'}}>\xD7</button>
        </div>
      )}
      {err && (
        <div style={{padding:'12px 18px',marginBottom:16,background:'#fef2f2',border:'1px solid #fca5a5',color:'#991b1b',borderRadius:10,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span>\u26A0\uFE0F {err}</span>
          <button type="button" onClick={()=>setErr('')} style={{background:'none',border:'none',cursor:'pointer',color:'#991b1b',fontWeight:'bold'}}>\xD7</button>
        </div>
      )}

      {/* Report Code Banner */}
      {row.report_code && (
        <div style={{padding:'18px 24px',marginBottom:20,borderRadius:14,background:'linear-gradient(135deg,#065f46 0%,#0081a7 100%)',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:14,boxShadow:'0 8px 24px rgba(6,95,70,0.22)'}}>
          <div>
            <div style={{fontSize:12,textTransform:'uppercase',letterSpacing:1,opacity:0.9}}>Official Forensic Report Tracking Code</div>
            <div style={{fontSize:32,fontWeight:900,letterSpacing:1.5,marginTop:2,fontFamily:'monospace'}}>{row.report_code}</div>
            <div style={{fontSize:12,opacity:0.85,marginTop:4}}>EO presents this code at Forensic Desk for physical report collection (By-Hand).</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.15)',padding:'10px 18px',borderRadius:10,textAlign:'center',border:'1px solid rgba(255,255,255,0.3)'}}>
            <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:0.8}}>Status</div>
            <div style={{fontSize:16,fontWeight:800,color:'#a7f3d0'}}>
              {row.status==='handed_over'?'Handed to EO':row.status==='report_ready'?'Ready for Handover':row.status==='submitted_to_ad'?'Submitted to AD':'In Analysis'}
            </div>
          </div>
        </div>
      )}

      {/* Officer + Case Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16,marginBottom:20}}>
        <div className="card">
          <div className="card-header" style={{padding:'12px 18px',background:'#f8fafc'}}>
            <div className="card-title" style={{fontSize:13.5,fontWeight:700}}>\uD83D\uDC64 Seizing Officer Details</div>
            <span style={{fontSize:11,background:'#dbeafe',color:'#1e40af',padding:'2px 8px',borderRadius:12,fontWeight:700}}>Officer Profile</span>
          </div>
          <div className="card-body" style={{padding:'14px 18px'}}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#0097a7,#015C94)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800}}>
                {(row.submitter?.name||'E')[0]}
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:'#0f172a'}}>{row.submitter?.name||'Enquiry Officer'}</div>
                <div style={{fontSize:12,color:'#64748b'}}>{row.submitter?.designation||'Investigation / Enquiry Officer'}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:12,background:'#f8fafc',padding:12,borderRadius:8}}>
              <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Circle / Station</span><strong>{circleName}</strong></div>
              <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Zone</span><strong>{zoneName}</strong></div>
              <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Email / Contact</span><span>{row.submitter?.email||'\u2014'}</span></div>
              <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Seizure Submitted</span><strong>{row.created_at?formatDisplayDateTime(row.created_at):'\u2014'}</strong></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{padding:'12px 18px',background:'#f8fafc'}}>
            <div className="card-title" style={{fontSize:13.5,fontWeight:700}}>\uD83D\uDCCD Case &amp; Origin Reference</div>
            <span style={{fontSize:11,background:'#e0f2fe',color:'#0369a1',padding:'2px 8px',borderRadius:12,fontWeight:700}}>{caseRef}</span>
          </div>
          <div className="card-body" style={{padding:'14px 18px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:12,marginBottom:12}}>
              <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Case Reference</span><strong style={{color:'#015C94',fontSize:13}}>{caseRef}</strong></div>
              <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Complainant Name</span><strong>{complainantName||'Direct Field Seizure'}</strong></div>
              {row.enquiry?.officer?.name && (
                <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Enquiry Officer (Case)</span><strong>{row.enquiry.officer.name}</strong></div>
              )}
              {row.assignee?.name && (
                <div><span style={{color:'#64748b',display:'block',fontSize:11}}>Assigned FO (Lab)</span><strong>{row.assignee.name}</strong></div>
              )}
            </div>
            {accusedList.length > 0 && (
              <div style={{background:'#f8fafc',padding:10,borderRadius:8,fontSize:11.5,marginBottom:10}}>
                <span style={{color:'#64748b',display:'block',marginBottom:4,fontWeight:600}}>Accused Persons Linked:</span>
                {accusedList.map((acc,idx)=>(
                  <div key={idx} style={{color:'#1e293b'}}>\u2022 <strong>{acc.name}</strong> {acc.cnic?`(CNIC: ${acc.cnic})`:''} {(acc.contact_no||acc.mobile||acc.whatsapp_no)?`\u00B7 \uD83D\uDCDE ${acc.contact_no||acc.mobile||acc.whatsapp_no}`:''}</div>
                ))}
              </div>
            )}
            {row.attachment_path && (
              <a href={`/storage/${row.attachment_path}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:11.5}}>
                \uD83D\uDCC4 View Attached Seizure Memo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Memo */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header" style={{padding:'12px 18px'}}>
          <div className="card-title" style={{fontSize:13.5,fontWeight:700}}>\uD83D\uDCCB Dispatch Memo &amp; Examination Request</div>
        </div>
        <div className="card-body" style={{padding:'14px 18px'}}>
          <div style={{marginBottom:14}}>
            <span style={{fontSize:12,fontWeight:700,color:'#334155',display:'block',marginBottom:4}}>Brief Contents of the Case:</span>
            <div style={{whiteSpace:'pre-wrap',fontSize:13.5,lineHeight:1.6,color:'#1e293b'}}>{row.brief_contents||'N/A'}</div>
          </div>
          <div style={{marginBottom:14}}>
            <span style={{fontSize:12,fontWeight:700,color:'#334155',display:'block',marginBottom:4}}>Scope for Forensic Analysis:</span>
            <div style={{whiteSpace:'pre-wrap',fontSize:13.5,lineHeight:1.6,color:'#1e293b'}}>{row.analysis_scope||'N/A'}</div>
          </div>
          <div>
            <span style={{fontSize:12,fontWeight:700,color:'#334155',display:'block',marginBottom:4}}>Memo Notes:</span>
            <div style={{whiteSpace:'pre-wrap',fontSize:13.5,lineHeight:1.6,color:'#1e293b'}}>{row.note||'No special dispatch memo notes provided.'}</div>
          </div>
        </div>
      </div>

      {/* Evidence Inventory */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header" style={{padding:'14px 18px',background:'#f8fafc'}}>
          <div className="card-title" style={{fontSize:14,fontWeight:800,color:'#0f172a'}}>
            \uD83D\uDDC4\uFE0F Seized Evidence Items &amp; Digital Devices Inventory ({row.items?.length||0} items)
          </div>
          <span style={{fontSize:11,background:'#015C94',color:'#fff',padding:'3px 10px',borderRadius:12,fontWeight:700}}>Physical Vault Items</span>
        </div>
        <div className="card-body" style={{padding:0}}>
          <div style={{overflowX:'auto'}}>
            <table className="data-table" style={{width:'100%',minWidth:820}}>
              <thead>
                <tr>
                  <th style={{width:145}}>Category (NR3C)</th>
                  <th style={{width:170}}>Item Brand / Make Model</th>
                  <th style={{width:160}}>IMEI 1 / IMEI 2</th>
                  <th style={{width:130}}>Serial / S.N No</th>
                  <th style={{width:90}}>Storage (GB)</th>
                  <th style={{width:50}}>Qty</th>
                  <th>Condition / Seized From / Description</th>
                </tr>
              </thead>
              <tbody>
                {(row.items||[]).map((it,i)=>(
                  <tr key={it.id||i}>
                    <td><span style={{fontSize:11.5,fontWeight:700,background:'#f1f5f9',color:'#334155',padding:'3px 8px',borderRadius:6}}>{itemLabel(it.item_type)}</span></td>
                    <td><strong style={{color:'#0f172a',fontSize:13}}>{it.make_model||'\u2014'}</strong></td>
                    <td style={{fontSize:12,fontFamily:'monospace'}}>
                      {it.imei?<div>IMEI1: <strong>{it.imei}</strong></div>:'\u2014'}
                      {it.imei2&&<div style={{color:'#64748b'}}>IMEI2: {it.imei2}</div>}
                    </td>
                    <td style={{fontSize:12,fontFamily:'monospace'}}>{it.serial_no||'\u2014'}</td>
                    <td style={{fontSize:12,textAlign:'center'}}>{it.storage_capacity||'\u2014'}</td>
                    <td style={{fontWeight:700,textAlign:'center'}}>{it.quantity||1}</td>
                    <td style={{fontSize:12}}>
                      {it.condition&&<span style={{fontSize:10.5,background:'#e2e8f0',color:'#1e293b',padding:'1px 6px',borderRadius:4,marginRight:6,fontWeight:600}}>{it.condition}</span>}
                      {it.seized_from&&<span style={{fontSize:10.5,color:'#0097a7',marginRight:6}}>\uD83D\uDCCD {it.seized_from}</span>}
                      {it.description&&<span style={{color:'#475569'}}>{it.description}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header" style={{padding:'12px 18px'}}>
          <div className="card-title" style={{fontSize:13.5,fontWeight:700}}>\u26D3\uFE0F Forensic Chain of Custody Audit Trail</div>
        </div>
        <div className="card-body" style={{padding:'16px 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>
            {[
              {step:'1. Seized & Dispatched',       name:row.submitter?.name||'EO',                                                         date:row.created_at,    color:'#0097a7'},
              {step:'2. AD Review & FO Assignment', name:row.assignee?.name?`FO: ${row.assignee.name}`:'Pending',                            date:row.assigned_at,   color:row.assigned_at?'#2563eb':'#cbd5e1'},
              {step:'3. Lab Examination Opened',    name:row.opened_at?'Analysis Active':'Waiting for FO',                                   date:row.opened_at,     color:row.opened_at?'#7c3aed':'#cbd5e1'},
              {step:'4. AD Approval & EO+AD Notified',name:row.report_ready_at?`Approved (${row.report_code})`:row.status==='submitted_to_ad'?'Submitted to AD':'Pending FO',date:row.report_ready_at,color:row.report_ready_at?'#059669':row.status==='submitted_to_ad'?'#d97706':'#cbd5e1'},
              {step:'5. Handed Over to EO',         name:row.handed_over_at?(row.handedTo?.name||'EO'):'In Lab Custody',                    date:row.handed_over_at,color:row.handed_over_at?'#64748b':'#cbd5e1'},
            ].map((s,i)=>(
              <div key={i} style={{borderLeft:`3px solid ${s.color}`,paddingLeft:12}}>
                <div style={{fontSize:11,color:'#64748b'}}>{s.step}</div>
                <div style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{s.name}</div>
                <div style={{fontSize:11,color:'#64748b'}}>{s.date?formatDisplayDateTime(s.date):'\u2014'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Findings Display */}
      {(row.findings||row.lab_notes||row.report_attachment_path)&&(
        <div className="card" style={{marginBottom:20}}>
          <div className="card-header" style={{padding:'12px 18px',background:'#f0fdf4'}}>
            <div className="card-title" style={{fontSize:13.5,fontWeight:700,color:'#166534'}}>\uD83D\uDD2C Forensic Officer Examination Findings</div>
          </div>
          <div className="card-body" style={{padding:'16px 20px'}}>
            {row.findings&&<div style={{marginBottom:14}}><span style={{fontSize:12,fontWeight:700,color:'#334155',display:'block',marginBottom:4}}>Recovered Artifacts &amp; Analysis Summary:</span><div style={{background:'#f8fafc',padding:14,borderRadius:8,fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{row.findings}</div></div>}
            {row.lab_notes&&<div style={{marginBottom:14}}><span style={{fontSize:12,fontWeight:700,color:'#334155',display:'block',marginBottom:4}}>Internal Lab / Tool Notes:</span><div style={{background:'#f8fafc',padding:12,borderRadius:8,fontSize:12.5,color:'#475569',whiteSpace:'pre-wrap'}}>{row.lab_notes}</div></div>}
            {row.report_attachment_path&&(
              <a href={`/storage/${row.report_attachment_path}`} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{display:'inline-flex',alignItems:'center',gap:6}}>
                \uD83D\uDCE5 Download Signed Lab Report PDF
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action 1: AD Assign FO */}
      {canAssign&&(
        <div className="card" style={{marginBottom:20,border:'1.5px solid #bfdbfe'}}>
          <div className="card-header" style={{background:'#eff6ff'}}><div className="card-title" style={{color:'#1e40af'}}>AD Action: Assign Forensic Officer &amp; Scope</div></div>
          <div className="card-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:12}}>
              <div className="cf-field">
                <label className="cf-label required">Select Forensic Officer</label>
                <select className="cf-input" value={assignedTo} onChange={e=>setAssignedTo(e.target.value)}>
                  <option value="">\u2014 Select FO \u2014</option>
                  {officers.map(o=><option key={o.id} value={o.id}>{o.name} ({o.designation||'Examiner'})</option>)}
                </select>
              </div>
              <div className="cf-field">
                <label className="cf-label">Priority Level</label>
                <select className="cf-input" value={assignPriority} onChange={e=>setAssignPriority(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">\u26A1 Urgent (Court / High Sensitivity)</option>
                </select>
              </div>
            </div>
            <div className="cf-field" style={{marginBottom:14}}>
              <label className="cf-label">Directives &amp; Examination Instructions</label>
              <input className="cf-input" placeholder="e.g. Physical extraction of WhatsApp chats, CDRs..." value={remarks} onChange={e=>setRemarks(e.target.value)} />
            </div>
            <button type="button" className="btn btn-primary" disabled={busy||!assignedTo} onClick={assign}>{busy?'Assigning\u2026':'Assign & Notify Forensic Officer'}</button>
          </div>
        </div>
      )}

      {/* Action 2: FO Workbench */}
      {canWorkFindings&&(
        <div className="card" style={{marginBottom:20,border:'1.5px solid #ddd6fe'}}>
          <div className="card-header" style={{background:'#f5f3ff'}}><div className="card-title" style={{color:'#6d28d9'}}>\uD83D\uDD2C Forensic Examiner Workbench: Record Findings &amp; Submit to AD</div></div>
          <div className="card-body">
            <div className="cf-field" style={{marginBottom:12}}>
              <label className="cf-label">Forensic Examination Findings</label>
              <textarea className="cf-input" rows={4} placeholder="Enter extraction results, hash values, chat logs, call records..." value={findings} onChange={e=>setFindings(e.target.value)} />
            </div>
            <div className="cf-field" style={{marginBottom:12}}>
              <label className="cf-label">Internal Lab Notes &amp; Tool Logs</label>
              <textarea className="cf-input" rows={2} placeholder="Tools used: UFED, Oxygen, Magnet AXIOM, EnCase, FTK Imager..." value={labNotes} onChange={e=>setLabNotes(e.target.value)} />
            </div>
            <div className="cf-field" style={{marginBottom:16}}>
              <label className="cf-label">Upload Lab Report PDF / Archive <span style={{fontSize:11,color:'#64748b',fontWeight:400}}>(Optional \u2014 not mandatory)</span></label>
              <input type="file" className="cf-input" accept=".pdf,.doc,.docx,.zip" onChange={e=>setReportFile(e.target.files?.[0]||null)} />
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button type="button" className="btn btn-outline" disabled={busy} onClick={saveFindings}>{busy?'Saving\u2026':'Save Findings Draft'}</button>
              <button type="button" className="btn btn-primary" style={{background:'#7c3aed'}} disabled={busy} onClick={submitToAd}>{busy?'Submitting\u2026':'Submit Report to AD Forensic for Approval'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Action 3: AD Approve + Notify EO & AD */}
      {canApproveAd&&(
        <div className="card" style={{marginBottom:20,border:'1.5px solid #a7f3d0'}}>
          <div className="card-header" style={{background:'#ecfdf5'}}><div className="card-title" style={{color:'#065f46'}}>\u2705 AD Forensic Approval: Authorize Report &amp; Notify EO + AD</div></div>
          <div className="card-body">
            <p style={{fontSize:13,color:'#334155',marginBottom:12,lineHeight:1.5}}>
              Review FO findings above. Click below to approve \u2014 system will immediately notify:
            </p>
            <ul style={{fontSize:13,color:'#334155',marginBottom:14,paddingLeft:20,lineHeight:1.9}}>
              <li>\uD83D\uDCCB <strong>Enquiry Officer ({row.enquiry?.officer?.name||row.submitter?.name||'EO'})</strong> \u2014 Notification + SMS to collect physical report by-hand. Report Code: <strong>{row.report_code||'Auto-Generated'}</strong></li>
              <li>\uD83D\uDC64 <strong>AD Forensic</strong> \u2014 Approval confirmation record</li>
            </ul>
            <div className="cf-field" style={{marginBottom:12}}>
              <label className="cf-label">Approval Notes <span style={{fontSize:11,color:'#64748b',fontWeight:400}}>(Optional)</span></label>
              <input className="cf-input" placeholder="e.g. Report reviewed and found satisfactory..." value={remarks} onChange={e=>setRemarks(e.target.value)} />
            </div>
            <button type="button" className="btn btn-primary" style={{background:'#059669'}} disabled={busy} onClick={approveAndNotify}>{busy?'Approving & Notifying\u2026':'\u2705 Approve Report & Notify EO + AD (By-Hand Collection)'}</button>
          </div>
        </div>
      )}

      {/* Action 4: Desk Handover */}
      {canHandOver&&(
        <div className="card" style={{marginBottom:20,border:'1.5px solid #cbd5e1'}}>
          <div className="card-header" style={{background:'#f8fafc'}}><div className="card-title" style={{color:'#334155'}}>\uD83D\uDCE4 Desk Officer: Physical Evidence Handover to EO</div></div>
          <div className="card-body">
            <p style={{fontSize:13,color:'#334155',marginBottom:10}}>Confirm physical signed lab report and sealed evidence bag handed over to EO. Report code: <strong>{row.report_code}</strong></p>
            <div className="cf-field" style={{marginBottom:14}}>
              <label className="cf-label">Handover Remarks</label>
              <input className="cf-input" placeholder="e.g. Physical sealed packet handed to EO with signature on register." value={handoverRemarks} onChange={e=>setHandoverRemarks(e.target.value)} />
            </div>
            <button type="button" className="btn btn-primary" style={{background:'#059669'}} disabled={busy} onClick={handOver}>{busy?'Confirming\u2026':'Confirm Custody Handover to EO'}</button>
          </div>
        </div>
      )}

      {/* F-31 PRINT AREA (Hidden - opens in popup window) */}
      <div id="f31PrintArea" style={{display:'none'}}>
        <div style={{textAlign:'center',marginBottom:14,borderBottom:'2px solid #000',paddingBottom:10}}>
          <div style={{fontSize:13,fontWeight:'bold'}}>National Response Centre for Cyber Crimes (NR3C)</div>
          <div style={{fontSize:11}}>National Cyber Crime Investigation Agency (NCCIA) | Digital Forensic Lab Lahore</div>
          <div style={{fontSize:14,fontWeight:'bold',marginTop:6,textDecoration:'underline'}}>Chain of Custody Form (F-31)</div>
        </div>

        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:14}}>
          <tbody>
            <tr>
              <td style={{border:'1px solid #000',padding:'5px 7px',fontWeight:'bold',background:'#f5f5f5',width:'38%'}}>Laboratory Case File No.</td>
              <td style={{border:'1px solid #000',padding:'5px 7px',width:'22%'}}>{row.request_no}</td>
              <td style={{border:'1px solid #000',padding:'5px 7px',fontWeight:'bold',background:'#f5f5f5',width:'18%'}}>Date &amp; Time of Receiving</td>
              <td style={{border:'1px solid #000',padding:'5px 7px'}}>{receivedDateTime}</td>
            </tr>
            <tr>
              <td style={{border:'1px solid #000',padding:'5px 7px',fontWeight:'bold',background:'#f5f5f5',verticalAlign:'top'}}>Name of the Organization from which the equipment is received</td>
              <td colSpan={3} style={{border:'1px solid #000',padding:'5px 7px'}}>
                <div><strong>Organization:</strong> {circleName}</div>
                <div><strong>Name:</strong> {row.submitter?.name||'\u2014'}</div>
                <div><strong>Contact No.:</strong> {row.submitter?.email||'\u2014'}</div>
                {complainantName&&<div><strong>Complainant:</strong> {complainantName}</div>}
              </td>
            </tr>
            <tr>
              <td style={{border:'1px solid #000',padding:'5px 7px',fontWeight:'bold',background:'#f5f5f5',verticalAlign:'top'}}>Type of evidence to be required by the said organization</td>
              <td colSpan={3} style={{border:'1px solid #000',padding:'5px 7px'}}>
                <div><strong>Scope / Category:</strong> {caseRef}</div>
                {row.note&&<div style={{marginTop:4}}>{row.note}</div>}
              </td>
            </tr>
            <tr>
              <td style={{border:'1px solid #000',padding:'5px 7px',fontWeight:'bold',background:'#f5f5f5'}}>Remarks</td>
              <td colSpan={3} style={{border:'1px solid #000',padding:'5px 7px',height:30}}>{row.findings?row.findings.substring(0,200):''}</td>
            </tr>
          </tbody>
        </table>

        <div style={{fontWeight:'bold',background:'#c0c0c0',textAlign:'center',fontSize:12,padding:5,border:'1px solid #000',borderBottom:'none'}}>Detail of Electronic Equipment(s) Received:</div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:14}}>
          <thead>
            <tr>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',width:35,textAlign:'center'}}>No</th>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',textAlign:'center'}}>Description of the Evidence</th>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',width:'30%',textAlign:'center'}}>Serial No / IMEI No.</th>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',width:'22%',textAlign:'center'}}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {(row.items||[]).length>0?(row.items||[]).map((it,i)=>(
              <tr key={i}>
                <td style={{border:'1px solid #000',padding:'5px 7px',textAlign:'center',verticalAlign:'top'}}>{i+1}</td>
                <td style={{border:'1px solid #000',padding:'5px 7px',verticalAlign:'top'}}>
                  <strong>{itemLabel(it.item_type)}</strong>{it.make_model&&` \u2014 ${it.make_model}`}
                  {it.storage_capacity&&<div style={{fontSize:10}}>Storage: {it.storage_capacity} GB</div>}
                  {it.quantity>1&&<div style={{fontSize:10}}>Qty: {it.quantity}</div>}
                </td>
                <td style={{border:'1px solid #000',padding:'5px 7px',fontFamily:'monospace',fontSize:11,verticalAlign:'top'}}>
                  {it.serial_no&&<div>S/N: {it.serial_no}</div>}
                  {it.imei&&<div>IMEI1: {it.imei}</div>}
                  {it.imei2&&<div>IMEI2: {it.imei2}</div>}
                  {!it.serial_no&&!it.imei&&'\u2014'}
                </td>
                <td style={{border:'1px solid #000',padding:'5px 7px',fontSize:11,verticalAlign:'top'}}>
                  {it.condition&&<div>Condition: {it.condition}</div>}
                  {it.seized_from&&<div>From: {it.seized_from}</div>}
                  {it.description&&<div>{it.description}</div>}
                </td>
              </tr>
            )):(
              <tr>
                <td style={{border:'1px solid #000',padding:'5px 7px',textAlign:'center',height:40}}>1</td>
                <td style={{border:'1px solid #000',padding:'5px 7px'}}></td>
                <td style={{border:'1px solid #000',padding:'5px 7px'}}></td>
                <td style={{border:'1px solid #000',padding:'5px 7px'}}></td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{fontWeight:'bold',background:'#c0c0c0',textAlign:'center',fontSize:12,padding:5,border:'1px solid #000',borderBottom:'none'}}>Chain of Custody Log:</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',width:35,textAlign:'center'}}>S. No</th>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',textAlign:'center'}}>Received From / Signature / Date &amp; Time</th>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',textAlign:'center'}}>Received By / Signature / Date &amp; Time</th>
              <th style={{border:'1px solid #000',padding:'5px 7px',background:'#d0d0d0',width:'22%',textAlign:'center'}}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                from_name: row.submitter?.name||'\u2014',
                from_des: (row.submitter?.designation||'Enquiry Officer')+' \u00B7 '+circleName,
                from_date: receivedDateTime,
                to_name: row.adReviewer?.name||'AD Forensic / Desk Officer',
                to_des: row.adReviewer?.designation||'AD Forensic',
                to_date: row.assigned_at?formatDisplayDateTime(row.assigned_at):null,
                remark:'Received at Lab',
              },
              {
                from_name: row.adReviewer?.name||'AD Forensic',
                from_des: 'AD Forensic',
                from_date: row.assigned_at?formatDisplayDateTime(row.assigned_at):null,
                to_name: row.assignee?.name||'\u2014',
                to_des: row.assignee?.designation||'Forensic Officer',
                to_date: row.assigned_at?formatDisplayDateTime(row.assigned_at):null,
                remark:'Assigned to FO for Examination',
              },
              {
                from_name: row.deskOfficer?.name||row.adReviewer?.name||'Desk Officer',
                from_des: 'NCCIA Forensic Lab',
                from_date: row.handed_over_at?formatDisplayDateTime(row.handed_over_at):null,
                to_name: row.handedTo?.name||row.submitter?.name||'\u2014',
                to_des: 'Enquiry Officer',
                to_date: row.handed_over_at?formatDisplayDateTime(row.handed_over_at):null,
                remark: row.handover_remarks||('Report Code: '+(row.report_code||'________')),
              },
            ].map((r2,i)=>(
              <tr key={i}>
                <td style={{border:'1px solid #000',padding:'5px 7px',textAlign:'center',verticalAlign:'top'}}>{i+1}</td>
                <td style={{border:'1px solid #000',padding:'5px 7px',verticalAlign:'top',height:65}}>
                  <div><strong>{r2.from_name}</strong></div>
                  <div style={{fontSize:10,color:'#555'}}>{r2.from_des}</div>
                  <div style={{fontSize:10}}>{r2.from_date||'\u00A0'}</div>
                  <div style={{marginTop:8,borderTop:'1px solid #aaa',paddingTop:4,fontSize:10}}>Signature: ________________</div>
                </td>
                <td style={{border:'1px solid #000',padding:'5px 7px',verticalAlign:'top',height:65}}>
                  <div><strong>{r2.to_name}</strong></div>
                  <div style={{fontSize:10,color:'#555'}}>{r2.to_des}</div>
                  <div style={{fontSize:10}}>{r2.to_date||'\u00A0'}</div>
                  <div style={{marginTop:8,borderTop:'1px solid #aaa',paddingTop:4,fontSize:10}}>Signature: ________________</div>
                </td>
                <td style={{border:'1px solid #000',padding:'5px 7px',verticalAlign:'top'}}>{r2.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
