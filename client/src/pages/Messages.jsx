// Messages — design handoff layout (Mobius Student.dc.html "MESSAGES"):
// one card, 320px thread rail + conversation pane. Polling-based (no
// websocket layer): the open thread and the list re-fetch on timers.
//
// Messaging model (2026-08-13): DMs + per-class announcement threads
// (read-only unless instructor-of-class/staff) + guardian oversight rows
// (children's DM threads, read-only). See server/src/routes/messageRoutes.js.
import { useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import authService from '@/services/authService';
import messageService from '@/services/messageService';
import Modal from '@/components/Modal';
import '@/css/attendance.css';
import '@/css/home.css';

const CONVERSATIONS_POLL_MS = 15000;
const MESSAGES_POLL_MS = 5000;

function timeLabel(iso) {
  const dt = DateTime.fromISO(iso);
  const now = DateTime.now();
  return dt.hasSame(now, 'day') ? dt.toFormat('h:mm a') : dt.toFormat('LLL d');
}

// Per-person avatar tint (design: initials on a soft tint) — stable hash of
// the name into the handoff's tint pairs.
const TINTS = [
  { bg: '#e6f3f0', fg: '#2e9d8d' }, { bg: '#eef1fb', fg: '#5b6bc0' },
  { bg: '#fbeef1', fg: '#b95a76' }, { bg: '#fff4e0', fg: '#9c6a1d' },
];
const tintOf = (name) => {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
};
const initialsOf = (name) =>
  String(name || '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

function Avatar({ conv, size = 40 }) {
  const isClass = conv.kind === 'class';
  const t = isClass ? TINTS[0] : tintOf(conv.other_name);
  return (
    <span style={{ width: size, height: size, borderRadius: 11, flexShrink: 0, background: t.bg, color: t.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
      {isClass ? <i className="fa-solid fa-bullhorn" style={{ fontSize: 14 }} /> : initialsOf(conv.other_name)}
    </span>
  );
}

function subtitleOf(conv) {
  if (!conv) return '';
  if (conv.kind === 'class') return conv.can_post ? 'Class announcements · you can post' : 'Class announcements';
  if (conv.oversight) return `${conv.child_name}'s conversation · read-only`;
  return conv.other_role ? conv.other_role.charAt(0).toUpperCase() + conv.other_role.slice(1) : '';
}

function Messages() {
  const me = authService.getCurrentUser();
  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);           // { messages, can_post, mode }
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);
  const [contacts, setContacts] = useState(null);
  const [announceable, setAnnounceable] = useState([]);
  const bottomRef = useRef(null);

  const loadConversations = () => messageService.getConversations().then(setConversations).catch(
    (err) => setError(err.response?.data?.message || 'Failed to load messages'));

  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, CONVERSATIONS_POLL_MS);
    return () => clearInterval(t);
  }, []);

  const loadThread = (id) => messageService.getMessages(id).then((data) => {
    setThread(data);
    loadConversations(); // clears the unread flag we just resolved server-side
  }).catch((err) => setError(err.response?.data?.message || 'Failed to load conversation'));

  useEffect(() => {
    if (!activeId) return undefined;
    loadThread(activeId);
    const t = setInterval(() => loadThread(activeId), MESSAGES_POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages?.length]);

  const openConversation = (id) => { setActiveId(id); setThread(null); };

  const send = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    try {
      await messageService.sendMessage(activeId, body);
      loadThread(activeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const startNewMessage = () => {
    setComposing(true);
    if (!contacts) messageService.getContacts().then(setContacts).catch(() => setContacts([]));
    messageService.getAnnounceable().then(setAnnounceable).catch(() => {});
  };

  const pickContact = async (userId) => {
    try {
      const conv = await messageService.startConversation(userId);
      setComposing(false);
      loadConversations();
      openConversation(conv.conversation_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start conversation');
    }
  };

  const pickClass = async (classId) => {
    try {
      const conv = await messageService.startClassThread(classId);
      setComposing(false);
      loadConversations();
      openConversation(conv.conversation_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start announcements');
    }
  };

  const active = conversations?.find((c) => c.conversation_id === activeId);
  const shown = (conversations ?? []).filter((c) =>
    !query.trim() || `${c.other_name} ${c.child_name ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const canPost = thread?.can_post;

  return (
    <div className="at-page" style={{ display: 'flex', flexDirection: 'column', maxWidth: 1160, width: '100%', margin: '0 auto' }}>
      {error && <div className="hm-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="hm-card" style={{ padding: 0, overflow: 'hidden', display: 'grid',
        gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 150px)', minHeight: 560 }}>
        {/* Thread rail */}
        <div style={{ borderRight: '1px solid #e3eeec', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', gap: 8, margin: 12 }}>
            <label style={{ flex: 1, padding: '0 14px', height: 42, display: 'flex', alignItems: 'center', gap: 9,
              background: '#fff', borderRadius: 11, border: '1px solid #e3eeec' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ color: '#9fb4b0', fontSize: 12 }} />
              <input placeholder="Search messages" value={query} onChange={(e) => setQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13, width: '100%' }} />
            </label>
            <button type="button" className="hm-btn primary" onClick={startNewMessage} title="New message"
              style={{ width: 42, height: 42, padding: 0, justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-solid fa-pen-to-square" />
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations === null && <p style={{ padding: 16, fontSize: 13, color: '#64827e' }}>Loading…</p>}
            {conversations?.length === 0 && (
              <p style={{ padding: 16, fontSize: 13, color: '#64827e' }}>No conversations yet — start one with the pen button.</p>
            )}
            {shown.map((c) => (
              <button key={c.conversation_id} type="button" onClick={() => openConversation(c.conversation_id)}
                style={{ width: '100%', textAlign: 'left', border: 'none',
                  background: c.conversation_id === activeId ? '#f2faf8' : 'transparent',
                  borderBottom: '1px solid #eef5f3', padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', gap: 12, fontFamily: 'inherit' }}>
                <Avatar conv={c} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.other_name}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9fb4b0', flexShrink: 0 }}>{timeLabel(c.last_message_at)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64827e', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.oversight && (
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: '#5b6bc0', background: '#eef1fb',
                        borderRadius: 999, padding: '1px 7px', marginRight: 6 }}>via {c.child_name}</span>
                    )}
                    {c.last_message_body || 'No messages yet'}
                  </div>
                </div>
                {c.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2e9d8d', flexShrink: 0, marginTop: 6 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation pane */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          {!activeId && (
            <div style={{ margin: 'auto', fontSize: 13.5, color: '#64827e' }}>Select a conversation, or start a new one.</div>
          )}
          {activeId && active && (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef5f3', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar conv={active} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{active.other_name}</div>
                  <div style={{ fontSize: 12, color: '#64827e' }}>{subtitleOf(active)}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14, background: '#fbfdfc' }}>
                {thread === null && <p style={{ fontSize: 13, color: '#64827e' }}>Loading…</p>}
                {thread?.messages?.length === 0 && (
                  <p style={{ margin: 'auto', fontSize: 13, color: '#9fb4b0' }}>
                    {active.kind === 'class' ? 'No announcements yet.' : 'Say hello.'}
                  </p>
                )}
                {thread?.messages?.map((m) => {
                  const mine = m.sender_id === me?.user_id;
                  const showSender = !mine && (active.kind === 'class' || active.oversight);
                  return (
                    <div key={m.message_id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', padding: '11px 14px', borderRadius: 14, fontSize: 13.5, lineHeight: 1.5,
                        background: mine ? '#2e9d8d' : '#fff', color: mine ? '#fff' : '#16303a',
                        border: mine ? 'none' : '1px solid #e3eeec' }}>
                        {showSender && <div style={{ fontSize: 11, fontWeight: 600, color: '#2e9d8d', marginBottom: 3 }}>{m.sender_name}</div>}
                        {m.body}
                        <div style={{ fontSize: 10, marginTop: 5, color: mine ? 'rgba(255,255,255,.7)' : '#9fb4b0' }}>{timeLabel(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              {canPost ? (
                <form onSubmit={send} style={{ padding: '14px 18px', borderTop: '1px solid #eef5f3', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#f4f9f8',
                    border: '1px solid #e3eeec', borderRadius: 11, padding: '0 14px', height: 44 }}>
                    <input value={draft} onChange={(e) => setDraft(e.target.value)}
                      placeholder={active.kind === 'class' ? 'Write an announcement…' : 'Write a message…'}
                      style={{ border: 'none', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13.5, width: '100%' }} />
                  </label>
                  <button type="submit" className="hm-btn primary" style={{ width: 44, height: 44, padding: 0, justifyContent: 'center' }}>
                    <i className="fa-solid fa-paper-plane" />
                  </button>
                </form>
              ) : thread && (
                <div style={{ padding: '13px 18px', borderTop: '1px solid #eef5f3', fontSize: 12.5, color: '#64827e',
                  display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-eye" style={{ color: '#9fb4b0' }} />
                  {active.oversight
                    ? `You're viewing ${active.child_name}'s messages — read-only.`
                    : 'Announcements are posted by your tutor and academy staff.'}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={composing} onClose={() => setComposing(false)}>
        <div className="modal-header"><h2>New message</h2></div>
        <div className="modal-body">
          {contacts === null && <p>Loading…</p>}
          {contacts?.length === 0 && announceable.length === 0 && <p>No one available to message yet.</p>}
          {contacts?.map((c) => (
            <button key={c.user_id} type="button" onClick={() => pickContact(c.user_id)}
              className="hm-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', marginBottom: 6 }}>
              <Avatar conv={{ other_name: c.name }} size={30} />
              {c.name} <span className="hm-kpi-label" style={{ textTransform: 'capitalize' }}>· {c.role}</span>
            </button>
          ))}
          {announceable.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#9fb4b0', margin: '14px 0 8px' }}>
                Announce to a class
              </div>
              {announceable.map((k) => (
                <button key={k.class_id} type="button" onClick={() => pickClass(k.class_id)}
                  className="hm-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', marginBottom: 6 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: '#e6f3f0', color: '#2e9d8d',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-bullhorn" style={{ fontSize: 12 }} />
                  </span>
                  {k.subject} <span className="hm-kpi-label">· announcements</span>
                </button>
              ))}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Messages;
