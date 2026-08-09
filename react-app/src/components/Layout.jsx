import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { canView } from '../utils/permissions';

function getBreadcrumb(pathname) {
  const map = {
    '/': 'Dashboard',
    '/complaints': 'Complaints',
    '/verifications': 'Verifications',
    '/verifications/reports': 'Verification Reports',
    '/enquiries': 'Enquiries',
    '/messages': 'Messages',
    '/investigation-officers': 'IO Records',
    '/offence-types': 'Crime Categories',
    '/cases': 'DAC Cases',
    '/users': 'Users',
    '/circles': 'Circles',
  };
  return map[pathname] || 'Dashboard';
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [dacOpen, setDacOpen] = useState(false);
  const [counts, setCounts] = useState({ verifications: 0, reports: 0, enquiries: 0, messages: 0 });
  const [notifications, setNotifications] = useState({ unread_count: 0, notifications: [] });
  const [pendingTasks, setPendingTasks] = useState({ tasks: [], count: 0 });
  const [toast, setToast] = useState(null);
  const prevNotifIds = useRef([]);
  const toastTimer = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchCounts = () => api.get('/sidebar-counts').then(r => setCounts(r.data)).catch(() => {});
    fetchCounts();
    const timer = setInterval(fetchCounts, 30000);
    return () => clearInterval(timer);
  }, [location.pathname]);

  const fetchNotifications = () => {
    api.get('/notifications').then(r => {
      const data = r.data;
      const unread = (data.notifications || []).filter(n => !n.read_at);
      const unreadIds = new Set(unread.map(n => n.id));
      const knownIds = new Set(prevNotifIds.current);

      setNotifications(data);

      // Only toast genuinely NEW unread notifications (skip the very first load)
      if (prevNotifIds.current.length > 0) {
        const brandNew = unread.filter(n => !knownIds.has(n.id));
        if (brandNew.length > 0) {
          const n = brandNew[0];
          showToast(n.data?.message || n.type || 'New notification', n.data?.url);
        }
      }
      prevNotifIds.current = Array.from(unreadIds);
    }).catch(() => {});
    api.get('/notifications/pending-tasks').then(r => setPendingTasks(r.data)).catch(() => {});
  };

  const showToast = (message, url) => {
    setToast({ message, url, id: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 5000);
    return () => clearInterval(timer);
  }, []);

  const markNotificationRead = (n) => {
    if (n.read_at) return;
    api.post(`/notifications/${n.id}/read`).then(() => {
      setNotifications(prev => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count - 1),
        notifications: prev.notifications.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x),
      }));
    }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    api.post('/notifications/read-all').then(() => {
      setNotifications(prev => ({
        ...prev,
        unread_count: 0,
        notifications: prev.notifications.map(x => ({ ...x, read_at: new Date().toISOString() })),
      }));
      prevNotifIds.current = [];
    }).catch(() => {});
  };

  const openNotification = (url) => {
    setNotifOpen(false);
    if (url && url.startsWith('/')) navigate(url);
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };
  const closeMobile = () => setMobileOpen(false);
  const go = (path) => { setUserMenuOpen(false); navigate(path); };

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : 'U';

  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <div className="app-wrapper">
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#ffffff', color: '#111827',
          borderRadius: 12, padding: '12px 16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          border: '1px solid #e5e7eb', borderLeft: '4px solid #015C94',
          maxWidth: 360, animation: 'slideIn 0.3s ease',
          cursor: toast.url ? 'pointer' : 'default',
        }} onClick={() => {
          if (toast.url) openNotification(toast.url);
          setToast(null);
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: '#e8f1f8', color: '#015C94',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>New Notification</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {toast.message}
            </div>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); setToast(null); }}
            style={{ marginLeft: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex' }}
            aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
      {mobileOpen && <div className="sidebar-overlay active" onClick={closeMobile}></div>}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`} id="appSidebar" role="navigation" aria-label="Main Navigation">
        <div className="sidebar-logo-area">
          <img src="/images/images.jpg" alt="NCCIA Logo" className="sidebar-logo-circle" />
        </div>
        <div className="sidebar-brand-text">
          <div className="brand-name"><b>NCCIA</b></div>
          <div className="brand-sub"><b>National Cyber Crime Investigation Agency</b></div>
        </div>
        <nav className="sidebar-nav" aria-label="Sidebar Navigation">
          <div className="nav-section-label">Main</div>
          <div className="nav-item">
            <NavLink to="/" end className="nav-link" data-page="dashboard">
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h2l3-9 3 9h2M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/>
                  <circle cx="12" cy="16" r="1"/>
                </svg>
              </span>
              <span>Dashboard</span>
            </NavLink>
          </div>
          {canView('analytics', user) && <div className="nav-section-label">Analytics</div>}
          {canView('analytics', user) && <div className="nav-item">
            <NavLink to="/analytics" className="nav-link" data-page="analytics">
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3"/>
                  <path d="M12 2v8l3-3-3-3-3 3 3 3z"/>
                </svg>
              </span>
              <span>Analytics</span>
            </NavLink>
          </div>}
          {(canView('complaints', user) || canView('verifications', user) || canView('reports', user) || canView('enquiries', user)) && (
            <div className="nav-section-label">Complaints</div>
          )}
          {canView('complaints', user) && (
            <div className="nav-item">
              <NavLink to="/complaints" className="nav-link" data-page="complaints">
                <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
                <span>Complaints</span>
              </NavLink>
            </div>
          )}
          {canView('verifications', user) && (
            <div className="nav-item">
              <NavLink to="/verifications" end className="nav-link" data-page="verifications">
                <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
                <span>Verifications</span>
                <span className="nav-badge urgent">{counts.verifications}</span>
              </NavLink>
            </div>
          )}
          {canView('reports', user) && (
            <div className="nav-item">
              <NavLink to="/verifications/reports" className="nav-link" data-page="verifications-reports">
                <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
                <span>Verification Reports</span>
                <span className="nav-badge urgent">{counts.reports}</span>
              </NavLink>
            </div>
          )}
          {canView('enquiries', user) && (
            <div className="nav-item">
              <NavLink to="/enquiries" className="nav-link" data-page="enquiries">
                <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                <span>Enquiries</span>
                <span className="nav-badge">{counts.enquiries}</span>
              </NavLink>
            </div>
          )}
          <div className="nav-item">
            <NavLink to="/messages" className="nav-link" data-page="messages">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
              <span>Messages</span>
              {counts.messages > 0 && <span className="nav-badge urgent">{counts.messages}</span>}
            </NavLink>
          </div>
          {canView('io_records', user) && <div className="nav-item">
            <NavLink to="/investigation-officers" className="nav-link" data-page="io-records">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
              <span>IO Records</span>
            </NavLink>
          </div>}
          {canView('dac_cases', user) && <div className="nav-item">
            <a href="#dac" className={`nav-link parent-link${dacOpen ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); setDacOpen(!dacOpen); }}>
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
              <span>DAC Cases</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft:'auto',transition:'transform 0.25s',transform:dacOpen?'rotate(180deg)':''}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </a>
            <div className={`nav-submenu${dacOpen ? ' open' : ''}`}>
              <div className="nav-item">
                <NavLink to="/cases" className="nav-link" data-page="dac-new">
                  <span className="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg></span>
                  <span>All Cases</span>
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink to="/court-cases" className="nav-link" data-page="court-cases">
                  <span className="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                  <span>Court Cases</span>
                </NavLink>
              </div>
               <div className="nav-item">
                 <NavLink to="/verifications" className="nav-link" data-page="dac-pending">
                   <span className="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
                   <span>Pending Cases</span>
                 </NavLink>
               </div>
               <div className="nav-item">
                 <NavLink to="/court-cases" className="nav-link" data-page="dac-closed">
                   <span className="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg></span>
                   <span>Closed Cases</span>
                 </NavLink>
               </div>
            </div>
          </div>}
          {canView('reference', user) && <div className="nav-section-label">Reference</div>}
          {canView('users', user) && <div className="nav-item">
            <NavLink to="/users" className="nav-link" data-page="users">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
              <span>Users</span>
            </NavLink>
            <NavLink to="/circles" className="nav-link" data-page="circles">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></span>
              <span>Circles</span>
            </NavLink>
          </div>}
          {canView('offence_types', user) && <div className="nav-item">
            <NavLink to="/offence-types" className="nav-link" data-page="offence-types">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
              <span>Crime Categories</span>
            </NavLink>
          </div>}
          {canView('reference', user) && <div className="nav-item">
            <NavLink to="/laws" className="nav-link" data-page="laws">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg></span>
              <span>Laws</span>
            </NavLink>
          </div>}
          {canView('reference', user) && <div className="nav-item">
            <NavLink to="/rules" className="nav-link" data-page="rules">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></span>
              <span>Rules & Regulations</span>
            </NavLink>
          </div>}
          {canView('reference', user) && <div className="nav-item">
            <NavLink to="/sops" className="nav-link" data-page="sop">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
              <span>SOP</span>
            </NavLink>
          </div>}
          {canView('reference', user) && <div className="nav-item">
            <NavLink to="/user-manuals" className="nav-link" data-page="user-manual">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span>
              <span>User Manual</span>
            </NavLink>
          </div>}
          <div className="nav-section-label">Account</div>
          <div className="nav-item">
            <NavLink to="/profile" className="nav-link" data-page="profile">
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg></span>
              <span>My Profile</span>
            </NavLink>
          </div>
          <div className="nav-item">
            <a href="#" className="nav-link" style={{color:'#fff'}} onClick={(e) => { e.preventDefault(); logout(); }}>
              <span className="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
              <span>Logout</span>
            </a>
          </div>
        </nav>
         <div className="sidebar-footer">
           <NavLink to="/profile" className="help-btn">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
             <span>Help &amp; Support</span>
           </NavLink>
         </div>
      </aside>
      <div className={`main-content${collapsed ? ' collapsed' : ''}`}>
        <header className="header">
          <div className="header-left">
            <button className="sidebar-toggle" id="sidebarToggle" title="Toggle Sidebar" aria-label="Toggle Sidebar" onClick={toggleSidebar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <nav className="breadcrumb" aria-label="breadcrumb">
              <span style={{color:'#fff'}} className="separator">›</span>
              <span style={{color:'#fff'}}>NCCIA</span>
              <span style={{color:'#fff'}} className="separator">›</span>
              <span style={{color:'#fff'}} className="current">{breadcrumb}</span>
            </nav>
          </div>
          <div className="header-search" role="search">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="search" placeholder="Search complaints, cases, officers…" id="globalSearch" autoComplete="off" aria-label="Global Search" />
            <kbd style={{fontSize:'10px',color:'white',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'4px',padding:'1px 5px'}}>Ctrl K</kbd>
          </div>
          <div className="header-right">
            <button className="header-icon-btn" title="Refresh Data" aria-label="Refresh" onClick={() => window.location.reload()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <div className="header-divider"></div>
            <div ref={notifRef} style={{position:'relative'}}>
              <button className="header-icon-btn notif-btn" title="Notifications" aria-label="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {(notifications.unread_count) > 0 && (
                  <span className="notif-badge">{notifications.unread_count}</span>
                )}
              </button>
              <div className={`notif-dropdown${notifOpen ? ' open' : ''}`}>
                <div className="notif-dropdown-header">
                  <span>Notifications</span>
                  <button type="button" onClick={markAllNotificationsRead}>Mark all read</button>
                </div>
                <div className="notif-dropdown-body">
                  {pendingTasks.count > 0 && (
                    <>
                      <div className="notif-section-title">Pending Tasks ({pendingTasks.count})</div>
                      {pendingTasks.tasks.map((t, i) => (
                        <a key={`task-${i}`} href={t.url} className="notif-item pending" onClick={(e) => { e.preventDefault(); openNotification(t.url); }}>
                          <span className="notif-item-dot"></span>
                          <div className="notif-item-text">
                            <span>{t.title}</span>
                            <small>{t.status.replace(/_/g, ' ')}</small>
                          </div>
                        </a>
                      ))}
                    </>
                  )}
                  <div className="notif-section-title">Notifications</div>
                  {notifications.notifications.length === 0 && (
                    <div className="notif-empty">No notifications yet</div>
                  )}
                  {notifications.notifications.map(n => (
                    <a key={n.id} href={n.data?.url || '/dashboard'} className={`notif-item${n.read_at ? '' : ' unread'}`}
                       onClick={(e) => { e.preventDefault(); markNotificationRead(n); openNotification(n.data?.url); }}>
                      <span className="notif-item-dot"></span>
                      <div className="notif-item-text">
                        <span>{n.data?.message || 'Notification'}</span>
                        <small>{timeAgo(n.created_at)}</small>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="notif-dropdown-footer">
                  <a href="#tasks" onClick={(e) => { e.preventDefault(); setNotifOpen(false); navigate('/verifications'); }}>View my tasks</a>
                </div>
              </div>
            </div>
            <div ref={userMenuRef} style={{position:'relative'}}>
              <div className={`header-user${userMenuOpen ? ' open' : ''}`} onClick={() => setUserMenuOpen(!userMenuOpen)} style={{cursor:'pointer'}}>
                <div className="header-avatar">{initials}</div>
                <div className="header-user-info">
                  <div className="header-user-name">{user?.name || 'User'}</div>
                  <div className="header-user-role">{user?.designation || user?.role || 'Officer'} · {user?.circle_code || 'NCCIA'}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft:'2px',color:'rgba(255,255,255,0.6)',transition:'transform 0.25s',transform:userMenuOpen?'rotate(180deg)':''}}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div className={`user-dropdown${userMenuOpen ? ' open' : ''}`} role="menu">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">{initials}</div>
                  <div>
                    <div className="user-dropdown-name">{user?.name || 'User'}</div>
                    <div className="user-dropdown-role">{user?.designation || user?.role || 'Officer'}</div>
                    <div className="user-dropdown-circle">
                      <span className="user-online-dot"></span>
                      {user?.circle_code || 'NCCIA'} Circle
                    </div>
                  </div>
                </div>
                <div className="user-dropdown-body">
                  <a href="#profile" className="user-dropdown-item" role="menuitem" onClick={(e) => { e.preventDefault(); go('/profile'); }}>
                    <div className="user-dropdown-item-icon" style={{background:'#015C94',color:'#fff'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg></div>
                    <div className="user-dropdown-item-text"><span>My Profile</span><small>View & edit your profile</small></div>
                  </a>
                  <a href="#my-cases" className="user-dropdown-item" role="menuitem" onClick={(e) => { e.preventDefault(); go('/cases'); }}>
                    <div className="user-dropdown-item-icon" style={{background:'#015C94',color:'#fff'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
                    <div className="user-dropdown-item-text"><span>My Assigned Cases</span><small>284 pending · 953 processed</small></div>
                  </a>
                  <a href="#activity" className="user-dropdown-item" role="menuitem" onClick={(e) => { e.preventDefault(); go('/profile'); }}>
                    <div className="user-dropdown-item-icon" style={{background:'#015C94',color:'#fff'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                    <div className="user-dropdown-item-text"><span>Activity Log</span><small>Your recent actions</small></div>
                  </a>
                  <a href="#settings" className="user-dropdown-item" role="menuitem" onClick={(e) => { e.preventDefault(); go('/profile'); }}>
                    <div className="user-dropdown-item-icon" style={{background:'#015C94',color:'#fff'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg></div>
                    <div className="user-dropdown-item-text"><span>Account Settings</span><small>Password, preferences</small></div>
                  </a>
                  <a href="#help" className="user-dropdown-item" role="menuitem" onClick={(e) => { e.preventDefault(); go('/profile'); }}>
                    <div className="user-dropdown-item-icon" style={{background:'#015C94',color:'#fff'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                    <div className="user-dropdown-item-text"><span>Help & Support</span><small>Docs, FAQs, contact</small></div>
                  </a>
                </div>
                <div className="user-dropdown-footer">
                  <button className="user-dropdown-logout btn btn-primary btn-sm" onClick={logout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                  <span className="user-dropdown-version">v2.4.1 · NCCIA CMS</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="page-content" id="pageContent" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
