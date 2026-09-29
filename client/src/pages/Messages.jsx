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
import '@/css/messages.css';

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
    <span className="msg-avatar" style={{ width: size, height: size, background: t.bg, color: t.fg }}>
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

function displayNameOf(conv) {
  if (!conv) return '';
  return conv.kind === 'class'
    ? conv.other_name.replace(/\s*·\s*announcements$/i, '')
    : conv.other_name;
}

function dayLabel(iso) {
  const day = DateTime.fromISO(iso);
  const today = DateTime.now();
  if (day.hasSame(today, 'day')) return 'Today';
  if (day.hasSame(today.minus({ days: 1 }), 'day')) return 'Yesterday';
  return day.toFormat('cccc, LLL d');
}

function classContext(classItem) {
  const details = [];
  if (classItem.instructor) details.push(classItem.instructor);
  if (classItem.starts_on) {
    const start = DateTime.fromISO(classItem.starts_on);
    if (start.isValid) details.push(`Starts ${start.toFormat('LLL d')}`);
  }
  return details.join(' · ') || 'Class announcements';
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
  const [composeQuery, setComposeQuery] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const didAutoSelect = useRef(false);

  const loadConversations = () => messageService.getConversations().then(setConversations).catch(
    (err) => setError(err.response?.data?.message || 'Failed to load messages'));

  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, CONVERSATIONS_POLL_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!didAutoSelect.current && conversations?.length) {
      didAutoSelect.current = true;
      setActiveId(conversations[0].conversation_id);
    }
  }, [conversations]);

  const loadThread = (id) => messageService.getMessages(id).then((data) => {
    setThread(data);
    loadConversations(); // clears the unread flag we just resolved server-side
  }).catch((err) => setError(err.response?.data?.message || 'Failed to load conversation'));

  useEffect(() => {
    if (!activeId) return undefined;
    loadThread(activeId);
    const t = setInterval(() => loadThread(activeId), MESSAGES_POLL_MS);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages?.length]);

  const openConversation = (id) => { setActiveId(id); setThread(null); };

  const send = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await messageService.sendMessage(activeId, body);
      setDraft('');
      loadThread(activeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startNewMessage = () => {
    setComposeQuery('');
    setComposing(true);
    if (!contacts) messageService.getContacts().then(setContacts).catch(() => setContacts([]));
    messageService.getAnnounceable().then(setAnnounceable).catch(() => {});
  };

  const closeComposer = () => {
    setComposing(false);
    setComposeQuery('');
  };

  const pickContact = async (userId) => {
    try {
      const conv = await messageService.startConversation(userId);
      closeComposer();
      loadConversations();
      openConversation(conv.conversation_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start conversation');
    }
  };

  const pickClass = async (classId) => {
    try {
      const conv = await messageService.startClassThread(classId);
      closeComposer();
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
  const unreadCount = (conversations ?? []).filter((c) => c.unread).length;
  const normalizedComposeQuery = composeQuery.trim().toLowerCase();
  const shownContacts = (contacts ?? []).filter((contact) =>
    !normalizedComposeQuery || `${contact.name} ${contact.role}`.toLowerCase().includes(normalizedComposeQuery));
  const shownClasses = announceable.filter((classItem) =>
    !normalizedComposeQuery
      || `${classItem.subject} ${classItem.instructor ?? ''}`.toLowerCase().includes(normalizedComposeQuery));

  return (
    <div className="msg-page">
      {error && (
        <div className="hm-error msg-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      <section className={`msg-shell${activeId ? ' is-thread-open' : ''}`} aria-label="Messages workspace">
        <aside className="msg-rail">
          <div className="msg-rail-header">
            <div className="msg-rail-title">
              <h1>Inbox</h1>
              {unreadCount > 0 && <span>{unreadCount} new</span>}
            </div>
            <button type="button" className="msg-compose" onClick={startNewMessage} title="New message" aria-label="New message">
              <i className="fa-solid fa-pen-to-square" /><span>New</span>
            </button>
          </div>

          <label className="msg-search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              aria-label="Search conversations"
              placeholder="Search conversations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </label>

          <div className="msg-thread-list" aria-label="Conversations">
            {conversations === null && <div className="msg-list-state">Loading conversations…</div>}
            {conversations?.length === 0 && (
              <div className="msg-list-state msg-list-state--empty">
                <i className="fa-regular fa-comments" />
                <strong>No conversations yet</strong>
                <span>Start a message to connect with someone at your academy.</span>
              </div>
            )}
            {conversations?.length > 0 && shown.length === 0 && (
              <div className="msg-list-state msg-list-state--empty">
                <i className="fa-solid fa-magnifying-glass" />
                <strong>No matches</strong>
                <span>Try a different name or class.</span>
              </div>
            )}
            {shown.map((c) => {
              const isActive = c.conversation_id === activeId;
              return (
                <button
                  key={c.conversation_id}
                  type="button"
                  className={`msg-thread${isActive ? ' is-active' : ''}${c.unread ? ' is-unread' : ''}`}
                  onClick={() => openConversation(c.conversation_id)}
                  aria-pressed={isActive}
                >
                  <Avatar conv={c} />
                  <span className="msg-thread-copy">
                    <span className="msg-thread-line">
                      <strong>{displayNameOf(c)}</strong>
                      <time>{timeLabel(c.last_message_at)}</time>
                    </span>
                    <span className="msg-thread-preview">
                      {c.oversight && <span className="msg-oversight">via {c.child_name}</span>}
                      {c.last_message_body || 'No messages yet'}
                    </span>
                  </span>
                  {c.unread && <span className="msg-unread-dot" aria-label="Unread" />}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="msg-conversation">
          {!activeId && (
            <div className="msg-empty-pane">
              <span><i className="fa-regular fa-comments" /></span>
              <h2>Your conversations</h2>
              <p>Select a conversation or start a new message.</p>
              <button type="button" className="hm-btn primary" onClick={startNewMessage}>
                <i className="fa-solid fa-pen-to-square" /> New message
              </button>
            </div>
          )}
          {activeId && active && (
            <>
              <header className="msg-conversation-header">
                <button type="button" className="msg-back" onClick={() => setActiveId(null)} aria-label="Back to conversations">
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <Avatar conv={active} />
                <div>
                  <h2>{displayNameOf(active)}</h2>
                  <p>{subtitleOf(active)}</p>
                </div>
              </header>

              <div className="msg-message-list" aria-live="polite">
                {thread === null && <div className="msg-message-state">Loading messages…</div>}
                {thread?.messages?.length === 0 && (
                  <div className="msg-message-state msg-message-state--empty">
                    <i className={active.kind === 'class' ? 'fa-solid fa-bullhorn' : 'fa-regular fa-comment'} />
                    <strong>{active.kind === 'class' ? 'No announcements yet' : 'Start the conversation'}</strong>
                    <span>{active.kind === 'class' ? 'The first announcement will appear here.' : 'Send a message below to say hello.'}</span>
                  </div>
                )}
                {thread?.messages?.map((m, index) => {
                  const mine = m.sender_id === me?.user_id;
                  const showSender = !mine && (active.kind === 'class' || active.oversight);
                  const previous = thread.messages[index - 1];
                  const showDay = !previous
                    || DateTime.fromISO(previous.created_at).toISODate() !== DateTime.fromISO(m.created_at).toISODate();
                  return (
                    <div key={m.message_id} className="msg-message-entry">
                      {showDay && <div className="msg-day"><span>{dayLabel(m.created_at)}</span></div>}
                      <div className={`msg-message-row${mine ? ' is-mine' : ''}`}>
                        {!mine && <Avatar conv={{ other_name: m.sender_name || displayNameOf(active) }} size={30} />}
                        <div className="msg-message-content">
                          <div className="msg-message-meta">
                            {showSender && <strong>{m.sender_name}</strong>}
                            <time>{timeLabel(m.created_at)}</time>
                          </div>
                          <div className="msg-bubble"><p>{m.body}</p></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {canPost ? (
                <form onSubmit={send} className="msg-composer">
                  <label>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={active.kind === 'class' ? 'Write an announcement…' : 'Write a message…'}
                      aria-label={active.kind === 'class' ? 'Write an announcement' : 'Write a message'}
                    />
                  </label>
                  <button
                    type="submit"
                    className="msg-send"
                    disabled={sending || !draft.trim()}
                    aria-label={sending ? 'Sending message' : 'Send message'}
                    title="Send message"
                  >
                    <i className={sending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'} />
                  </button>
                </form>
              ) : thread && (
                <div className="msg-readonly">
                  <i className="fa-solid fa-eye" />
                  <span>{active.oversight
                    ? `You're viewing ${active.child_name}'s messages — read-only.`
                    : 'Announcements are posted by your tutor and academy staff.'}</span>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Modal isOpen={composing} onClose={closeComposer}>
        <div className="modal-header msg-modal-header">
          <div><span className="msg-eyebrow">Start a conversation</span><h2>New message</h2></div>
          <button type="button" onClick={closeComposer} aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="modal-body msg-modal-body">
          <label className="msg-modal-search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              value={composeQuery}
              onChange={(e) => setComposeQuery(e.target.value)}
              placeholder="Search people or classes"
              aria-label="Search people or classes"
              autoFocus
            />
            {composeQuery && (
              <button type="button" onClick={() => setComposeQuery('')} aria-label="Clear search">
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </label>
          {contacts === null && <p>Loading…</p>}
          {contacts?.length === 0 && announceable.length === 0 && <p>No one available to message yet.</p>}
          {contacts !== null && contacts.length > 0 && <div className="msg-modal-section">People · {shownContacts.length}</div>}
          {shownContacts.map((c) => (
            <button key={c.user_id} type="button" onClick={() => pickContact(c.user_id)}
              className="msg-contact">
              <Avatar conv={{ other_name: c.name }} size={30} />
              <span><strong>{c.name}</strong><small>{c.role}</small></span>
              <i className="fa-solid fa-chevron-right" />
            </button>
          ))}
          {shownClasses.length > 0 && (
            <>
              <div className="msg-modal-section">Classes · {shownClasses.length}</div>
              {shownClasses.map((k) => (
                <button key={k.class_id} type="button" onClick={() => pickClass(k.class_id)}
                  className="msg-contact">
                  <span className="msg-class-icon">
                    <i className="fa-solid fa-bullhorn" style={{ fontSize: 12 }} />
                  </span>
                  <span><strong>{k.subject}</strong><small>{classContext(k)}</small></span>
                  <i className="fa-solid fa-chevron-right" />
                </button>
              ))}
            </>
          )}
          {contacts !== null && shownContacts.length === 0 && shownClasses.length === 0 && (
            <div className="msg-modal-empty">
              <i className="fa-solid fa-magnifying-glass" />
              <strong>No matches</strong>
              <span>Try another name, role, or class.</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Messages;
