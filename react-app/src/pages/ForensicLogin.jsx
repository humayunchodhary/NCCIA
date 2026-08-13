import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { isForensicUser } from '../utils/permissions';

export default function ForensicLogin() {
  const { forensicLogin, error, retryAfter, clearError, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (user && isForensicUser(user)) { navigate('/forensic', { replace: true }); }
  }, [user, navigate]);

  useEffect(() => {
    if (retryAfter > 0) {
      setCountdown(retryAfter);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearError();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [retryAfter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forensicLogin(email, password);
    } catch (_) {}
  };

  return (
    <div style={{minHeight:'100vh',background:'#0d1117',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans', sans-serif",position:'relative',overflow:'hidden'}}>
      <div style={{position:'fixed',inset:0,background:'#0d1117',zIndex:0}}></div>
      <div style={{position:'absolute',width:'420px',height:'420px',borderRadius:'50%',background:'radial-gradient(circle, rgba(0,188,212,0.16), transparent 65%)',top:'-120px',left:'-120px',zIndex:1,pointerEvents:'none'}}></div>
      <div style={{position:'absolute',width:'520px',height:'520px',borderRadius:'50%',background:'radial-gradient(circle, rgba(255,111,0,0.10), transparent 65%)',bottom:'-180px',right:'-140px',zIndex:1,pointerEvents:'none'}}></div>

      <div style={{position:'relative',zIndex:10,display:'flex',width:'min(900px, 95vw)',minHeight:'560px',borderRadius:'24px',overflow:'hidden',boxShadow:'0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',animation:'forensicCardRise .7s cubic-bezier(.22,1,.36,1) both',background:'#161b22'}}>
        <div className="panel-left" style={{flex:1,background:'linear-gradient(160deg,#00bcd4 0%,#0097a7 55%,#015C94 100%)',padding:'48px 36px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',color:'#fff'}}>
          <div style={{position:'absolute',width:'320px',height:'320px',borderRadius:'50%',border:'1.5px solid rgba(255,255,255,0.22)',top:'-80px',left:'-80px',animation:'rotateSlow 18s linear infinite'}}></div>
          <div style={{position:'absolute',width:'220px',height:'220px',borderRadius:'50%',border:'1.5px solid rgba(255,255,255,0.18)',bottom:'-60px',right:'-60px',animation:'rotateSlow 22s linear infinite reverse'}}></div>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
            <div style={{width:'112px',height:'112px',background:'rgba(255,255,255,0.14)',backdropFilter:'blur(4px)',borderRadius:'24px',border:'2px solid rgba(255,255,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 20px rgba(0,0,0,0.3)'}}>
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
          </div>
          <div className="brand-name" style={{fontFamily:"'Cinzel', serif",fontSize:'1.8rem',fontWeight:700,letterSpacing:'.06em',color:'#fff',textShadow:'0 2px 8px rgba(0,0,0,0.3)',textAlign:'center'}}>FORENSIC</div>
          <div className="brand-sub" style={{fontSize:'.68rem',fontWeight:600,letterSpacing:'.2em',textTransform:'uppercase',color:'rgba(255,255,255,0.95)',marginTop:'4px',textAlign:'center'}}>Digital Forensic Laboratory</div>
          <div className="divider-line" style={{width:'48px',height:'1.5px',background:'rgba(255,255,255,0.5)',margin:'22px 0'}}></div>
          <ul className="info-list" style={{listStyle:'none',width:'100%',display:'flex',flexDirection:'column',gap:'14px'}}>
            <li style={{display:'flex',alignItems:'flex-start',gap:'12px',fontSize:'.85rem',lineHeight:1.5,color:'rgba(255,255,255,0.95)'}}>
              <span className="icon-dot" style={{width:'28px',height:'28px',flexShrink:0,background:'rgba(0,0,0,0.22)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" width="16" height="16"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></span>
              <span>Forensic case intake, evidence custody &amp; lab analysis workflow</span>
            </li>
            <li style={{display:'flex',alignItems:'flex-start',gap:'12px',fontSize:'.85rem',lineHeight:1.5,color:'rgba(255,255,255,0.95)'}}>
              <span className="icon-dot" style={{width:'28px',height:'28px',flexShrink:0,background:'rgba(0,0,0,0.22)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></span>
              <span>Restricted portal — access is limited to authorized forensic personnel</span>
            </li>
            <li style={{display:'flex',alignItems:'flex-start',gap:'12px',fontSize:'.85rem',lineHeight:1.5,color:'rgba(255,255,255,0.95)'}}>
              <span className="icon-dot" style={{width:'28px',height:'28px',flexShrink:0,background:'rgba(0,0,0,0.22)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/></svg></span>
              <span>Unauthorized access is strictly prohibited and logged</span>
            </li>
          </ul>
          <div style={{marginTop:'28px',padding:'14px 20px',background:'rgba(0,0,0,0.22)',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.3)',width:'100%',textAlign:'center',fontSize:'.75rem',color:'rgba(255,255,255,0.9)'}}>
            <strong style={{color:'#fff'}}>NCCIA</strong> Digital Forensic Laboratory<br />
            <Link to="/login" style={{color:'#fff',fontWeight:600,textDecoration:'underline'}}>Main NCCIA Portal</Link>
          </div>
        </div>
        <div className="panel-right" style={{flex:1,background:'#161b22',padding:'48px 42px',display:'flex',flexDirection:'column',justifyContent:'center',position:'relative',overflow:'hidden'}}>
          <div className="form-header" style={{marginBottom:'32px'}}>
            <h2 style={{fontFamily:"'Cinzel', serif",fontSize:'1.6rem',color:'#fff',fontWeight:700}}>Forensic Portal</h2>
            <p style={{marginTop:'6px',fontSize:'.83rem',color:'#00bcd4'}}>Sign in with your forensic credentials</p>
          </div>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{background: retryAfter ? 'rgba(229,62,62,0.12)' : 'rgba(255,111,0,0.08)',border:`1px solid ${retryAfter ? '#e53e3e' : '#ff6f00'}`,borderRadius:'10px',padding:'10px 14px',marginBottom:'18px',fontSize:'13px',color: retryAfter ? '#e53e3e' : '#ffb74d',fontWeight:500}}>
                {error}
                {countdown > 0 && <div style={{marginTop:'6px',fontSize:'18px',fontWeight:700,letterSpacing:'1px'}}>{countdown}s</div>}
              </div>
            )}
            <div className="form-group" style={{marginBottom:'20px'}}>
              <label htmlFor="forensic-email" style={{display:'block',fontSize:'.75rem',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',color:'#c9d1d9',marginBottom:'7px'}}>Email Address</label>
              <div className="input-wrap" style={{position:'relative'}}>
                <span className="icon" style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#00bcd4',pointerEvents:'none',display:'flex'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13L2 4"/></svg>
                </span>
                <input type="email" id="forensic-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="forensic@nccia.gov.pk" autoComplete="email" required style={{width:'100%',padding:'12px 14px 12px 42px',border:'1.5px solid #30363d',borderRadius:'11px',fontSize:'.88rem',fontFamily:"'DM Sans', sans-serif",color:'#fff',background:'#0d1117',outline:'none'}} />
              </div>
            </div>
            <div className="form-group" style={{marginBottom:'20px'}}>
              <label htmlFor="forensic-password" style={{display:'block',fontSize:'.75rem',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',color:'#c9d1d9',marginBottom:'7px'}}>Password</label>
              <div className="input-wrap" style={{position:'relative'}}>
                <span className="icon" style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#00bcd4',pointerEvents:'none',display:'flex'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input type={showPwd ? 'text' : 'password'} id="forensic-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" autoComplete="current-password" required style={{width:'100%',padding:'12px 14px 12px 42px',border:'1.5px solid #30363d',borderRadius:'11px',fontSize:'.88rem',fontFamily:"'DM Sans', sans-serif",color:'#fff',background:'#0d1117',outline:'none'}} />
                <button type="button" className="eye-toggle" onClick={() => setShowPwd(!showPwd)} aria-label="Show password" style={{position:'absolute',right:'13px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#00bcd4',padding:'4px',display:'flex'}}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <button type="submit" className="btn-login" style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#00bcd4,#015C94)',border:'none',borderRadius:'12px',color:'#fff',fontFamily:"'DM Sans', sans-serif",fontSize:'.92rem',fontWeight:600,letterSpacing:'.04em',cursor:'pointer',boxShadow:'0 4px 14px rgba(0,188,212,0.25)'}}>Sign In to Forensic Portal</button>
          </form>
          <p className="help-text" style={{marginTop:'20px',textAlign:'center',fontSize:'.78rem',color:'#8b949e'}}>Don&apos;t have access? <a href="#" style={{color:'#00bcd4',textDecoration:'none',fontWeight:500}}>Request forensic credentials</a></p>
          <div className="security-badge" style={{marginTop:'22px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',fontSize:'.72rem',color:'#8b949e'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>256-bit SSL Encrypted · Restricted Forensic Portal</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes forensicCardRise { from { opacity: 0; transform: translateY(32px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { border-color: #00bcd4 !important; box-shadow: 0 0 0 3px rgba(0,188,212,0.15) !important; }
        @media (max-width: 680px) { .card { flex-direction: column; width: 96vw; min-height: auto; border-radius: 18px; } .panel-left { padding: 36px 28px; } .info-list, .contact-strip { display: none; } .panel-right { padding: 36px 28px; } }
      `}</style>
    </div>
  );
}
