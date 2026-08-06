import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function VerificationReports() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchReports = () => {
      api.get('/verifications/reports-list').then(r => {
        setList(r.data.data || r.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    };
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredList = list.filter(r => {
    const matchesSearch = r.tracking_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.victim_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.victim_cnic?.includes(search);
    return matchesSearch;
  });

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-label">Verifications</div>
          <h1 className="page-title">Verification Reports</h1>
          <p className="page-subtitle">Saved victim verification report records</p>
          <div className="title-underline"></div>
        </div>
        <div className="page-actions">
          <Link to="/verifications/reports/create" className="btn btn-primary btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            New Report
          </Link>
        </div>
      </div>

      <div className="tab-nav" style={{display:'flex',gap:'2px',marginBottom:'16px',padding:'4px',background:'#f3f0f0',borderRadius:'8px'}}>
        <Link to="/verifications" className="tab-nav-item" style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:600,color:'#6c757d',background:'transparent'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Verifications
        </Link>
        <Link to="/verifications/reports" className="tab-nav-item active" style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'6px',fontSize:'13px',fontWeight:600,color:'#015C94',background:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Reports
        </Link>
      </div>

      <div className="card" style={{marginBottom:'20px'}}>
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            Saved Reports
          </div>
          <div className="section-actions">
            <span style={{fontSize:'11.5px',color:'#6c757d'}}>Total: <strong style={{color:'#2b2b2b'}}>{filteredList.length}</strong></span>
          </div>
        </div>
        <div className="card-body" style={{padding:0}}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tracking No.</th>
                  <th>Complaint</th>
                  <th>Victim Name</th>
                  <th>CNIC</th>
                  <th>Crime Category</th>
                  <th>City</th>
                  <th>Created By</th>
                  <th>Signature</th>
                  <th>Date</th>
                  <th style={{textAlign:'center'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((r, i) => (
                  <tr key={r.id}>
                    <td><span style={{fontSize:'12px',color:'#6c757d'}}>{i + 1}</span></td>
                    <td><span className="table-id">{r.tracking_no}</span></td>
                    <td>
                      <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                        <span style={{fontSize:'13px',fontWeight:500}}>{r.complaint?.complainant_name || 'N/A'}</span>
                        <span style={{fontSize:'11.5px',color:'#6c757d',fontFamily:'monospace'}}>{r.complaint?.tracking_no || ''}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(38,64,120,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:600,color:'#2B2B2B'}}>
                          {(r.victim_name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0,2).join('').toUpperCase() || '?'}
                        </div>
                        <span style={{fontSize:'13px',fontWeight:500}}>{r.victim_name}</span>
                      </div>
                    </td>
                    <td><span style={{fontSize:'12px',fontFamily:'monospace',color:'#6c757d'}}>{r.victim_cnic}</span></td>
                    <td><span className={`badge badge-active`}>{r.crime_category}</span></td>
                    <td><span style={{fontSize:'12.5px'}}>{r.city}</span></td>
                    <td><span style={{fontSize:'12.5px'}}>{r.creator?.name || 'N/A'}</span></td>
                    <td>
                      {r.signature ? (
                        <img src={r.signature} alt="Signature" style={{height:'30px',border:'1px solid #e0e0e0',borderRadius:'4px',background:'#fff',cursor:'pointer'}} onClick={(e) => window.open(e.target.src, '_blank')} />
                      ) : (
                        <span style={{fontSize:'11px',color:'#6c757d'}}>—</span>
                      )}
                    </td>
                    <td><span style={{fontSize:'12px',color:'#6c757d'}}>{new Date(r.created_at).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'})}</span></td>
                    <td style={{textAlign:'center'}}>
                      <a href={`/verifications/reports/${r.id}/pdf`} target="_blank" className="btn btn-outline btn-sm btn-icon" title="Download PDF">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="12 10 12 18 15 15"/></svg>
                      </a>
                    </td>
                  </tr>
                ))}
                {filteredList.length === 0 && <tr><td colSpan={11} style={{textAlign:'center',padding:'24px',color:'#6c757d'}}>No reports found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}