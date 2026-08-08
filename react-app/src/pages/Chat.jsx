import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

const PRIMARY = '#015C94';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

function initialsOf(name) {
  return (name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef(null);
  const meId = user?.id;

  const refreshConversations = useCallback(() => {
    api.get('/messages/conversations').then(r => setConversations(r.data || [])).catch(() => {});
  }, []);

  const loadThread = useCallback((otherId) => {
    if (!otherId || otherId === meId) return;
    setThreadLoading(true);
    api.get(`/messages/conversations/${otherId}`).then(r => {
      setMessages(r.data || []);
    }).catch(() => {}).finally(() => setThreadLoading(false));
  }, [meId]);

  useEffect(() => {
    api.get('/messages/contacts').then(r => setContacts(r.data || [])).catch(() => {});
    refreshConversations();
    setLoading(false);
  }, [refreshConversations]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshConversations();
      if (activeId) loadThread(activeId);
    }, 5000);
    return () => clearInterval(timer);
  }, [refreshConversations, loadThread, activeId]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeId]);

  const selectConversation = (otherId) => {
    setActiveId(otherId);
    setMessages([]);
    loadThread(otherId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    try {
      const r = await api.post('/messages', { receiver_id: activeId, message: body });
      setMessages(prev => [...prev, {
        id: r.data.id,
        sender_id: r.data.sender_id,
        message: r.data.message,
        is_read: false,
        created_at: r.data.created_at,
      }]);
      setText('');
      refreshConversations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeContact = contacts.find(c => c.id === activeId) || conversations.find(c => c.user?.id === activeId)?.user || null;

  const filtered = contacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.designation || '').toLowerCase().includes(q) || (c.role || '').toLowerCase().includes(q);
  });

  const convFor = (id) => conversations.find(c => c.user?.id === id);

  if (loading) {
    return (
      <div className="page-header">
        <h1>Messages</h1>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Internal Messages</h1>
        <span style={{ color: '#6b7280', fontSize: 13 }}>
          Secure in-agency chat — data is saved and visible only to participants
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: 'calc(100vh - 240px)', minHeight: 480 }}>
          {/* Contact sidebar */}
          <div style={{ width: 320, minWidth: 260, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <input
                type="search"
                placeholder="Search officers…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="cf-input"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No contacts found</div>
              )}
              {filtered.map(c => {
                const conv = convFor(c.id);
                const unread = conv?.unread || 0;
                const isActive = activeId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f1f3',
                      background: isActive ? '#eaf2f8' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f3f4f6'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 14,
                    }}>
                      {initialsOf(c.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                        {conv?.last_time && <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{timeAgo(conv.last_time)}</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: unread ? PRIMARY : '#9ca3af', fontWeight: unread ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv?.last_message || (c.designation || c.role)}
                        </span>
                        {unread > 0 && (
                          <span style={{
                            background: '#ef4444', color: '#fff', borderRadius: 10, fontSize: 11,
                            minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 5px', flexShrink: 0,
                          }}>{unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thread area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {!activeContact ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.4 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p style={{ marginTop: 12 }}>Select a contact to start messaging</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 13,
                  }}>
                    {initialsOf(activeContact.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{activeContact.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{(activeContact.designation || activeContact.role || 'Officer').replace(/_/g, ' ')}</div>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f3f4f6' }}>
                  {threadLoading && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 20 }}>Loading conversation…</div>}
                  {!threadLoading && messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 30 }}>No messages yet. Say hello!</div>
                  )}
                  {!threadLoading && messages.map((m, i) => {
                    const mine = Number(m.sender_id) === Number(meId);
                    const prev = messages[i - 1];
                    const showDay = !prev || formatDay(prev.created_at) !== formatDay(m.created_at);
                    return (
                      <div key={m.id}>
                        {showDay && (
                          <div style={{ textAlign: 'center', margin: '12px 0' }}>
                            <span style={{ background: '#e5e7eb', color: '#6b7280', fontSize: 11, padding: '3px 10px', borderRadius: 10 }}>{formatDay(m.created_at)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                          <div style={{
                            maxWidth: '72%',
                            background: mine ? PRIMARY : '#fff',
                            color: mine ? '#fff' : '#111827',
                            padding: '9px 13px',
                            borderRadius: 14,
                            borderBottomRightRadius: mine ? 4 : 14,
                            borderBottomLeftRadius: mine ? 14 : 4,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: 14,
                            lineHeight: 1.45,
                          }}>
                            {m.message}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            {formatTime(m.created_at)}
                            {mine && (m.is_read ? ' · Read' : ' · Sent')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>

                <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, background: '#fff' }}>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type a message…"
                    rows={1}
                    className="cf-input"
                    style={{ flex: 1, resize: 'none', minHeight: 40, maxHeight: 120, padding: '10px 12px' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6 }} disabled={sending || !text.trim()}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
