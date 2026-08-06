// Messages (design handoff README > Student app / Instructor app >
// Messages): 320px thread list + conversation pane + compose modal. Real
// now — conversations/messages tables and /api/messages are brand new
// (unlike payroll/payments/rooms, there was no unused schema to build
// against here). Polling-based: no websocket/realtime layer in this app,
// so an open thread re-fetches on a timer instead of pushing live.
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

function Messages() {
  const me = authService.getCurrentUser();
  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);
  const [contacts, setContacts] = useState(null);
  const bottomRef = useRef(null);

  const loadConversations = () => messageService.getConversations().then(setConversations).catch(
    (err) => setError(err.response?.data?.message || 'Failed to load messages'));

  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, CONVERSATIONS_POLL_MS);
    return () => clearInterval(t);
  }, []);

  const loadMessages = (id) => messageService.getMessages(id).then((rows) => {
    setMessages(rows);
    loadConversations(); // clears the unread flag we just resolved server-side
  }).catch((err) => setError(err.response?.data?.message || 'Failed to load conversation'));

  useEffect(() => {
    if (!activeId) return undefined;
    loadMessages(activeId);
    const t = setInterval(() => loadMessages(activeId), MESSAGES_POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const openConversation = (id) => { setActiveId(id); setMessages(null); };

  const send = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    try {
      await messageService.sendMessage(activeId, body);
      loadMessages(activeId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const startNewMessage = () => {
    setComposing(true);
    if (!contacts) messageService.getContacts().then(setContacts).catch(() => setContacts([]));
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

  const active = conversations?.find((c) => c.conversation_id === activeId);

  return (
    <div className="at-page">
      <h1 className="at-title">Messages</h1>
      {error && <div className="hm-error">{error}</div>}

      <div style={{ display: 'flex', gap: 16, height: 560 }}>
        <div className="hm-card" style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 14, borderBottom: '1px solid var(--shell-border)' }}>
            <button type="button" className="hm-btn primary" style={{ width: '100%' }} onClick={startNewMessage}>
              + New message
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations === null && <p style={{ padding: 14 }}>Loading…</p>}
            {conversations?.length === 0 && <p style={{ padding: 14 }} className="hm-kpi-label">No conversations yet.</p>}
            {conversations?.map((c) => (
              <button key={c.conversation_id} type="button" onClick={() => openConversation(c.conversation_id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: 12, border: 'none',
                  borderBottom: '1px solid var(--shell-border)', cursor: 'pointer',
                  background: c.conversation_id === activeId ? 'var(--shell-hover, rgba(0,0,0,0.04))' : 'transparent',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong>{c.other_name}</strong>
                  <span className="hm-kpi-label">{timeLabel(c.last_message_at)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span className="hm-kpi-label" style={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontWeight: c.unread ? 700 : 400, color: c.unread ? 'var(--shell-text)' : undefined,
                  }}>
                    {c.last_message_body || 'No messages yet'}
                  </span>
                  {c.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-info)', flexShrink: 0 }} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="hm-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {!activeId && <div style={{ margin: 'auto' }} className="hm-kpi-label">Select a conversation, or start a new one.</div>}
          {activeId && (
            <>
              <div style={{ padding: 14, borderBottom: '1px solid var(--shell-border)' }}>
                <strong>{active?.other_name}</strong>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages === null && <p>Loading…</p>}
                {messages?.map((m) => {
                  const mine = m.sender_id === me?.user_id;
                  return (
                    <div key={m.message_id} style={{
                      alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '70%',
                      background: mine ? 'var(--status-info)' : 'var(--shell-surface-alt, #f0f0f0)',
                      color: mine ? '#fff' : 'inherit', borderRadius: 12, padding: '8px 12px',
                    }}>
                      <div>{m.body}</div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{timeLabel(m.created_at)}</div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--shell-border)' }}>
                <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…"
                  style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--shell-border)' }} />
                <button type="submit" className="hm-btn primary">Send</button>
              </form>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={composing} onClose={() => setComposing(false)}>
        <div className="modal-header"><h2>New message</h2></div>
        <div className="modal-body">
          {contacts === null && <p>Loading…</p>}
          {contacts?.length === 0 && <p>No one available to message yet.</p>}
          {contacts?.map((c) => (
            <button key={c.user_id} type="button" onClick={() => pickContact(c.user_id)}
              className="hm-btn" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6 }}>
              {c.name} <span className="hm-kpi-label" style={{ textTransform: 'capitalize' }}>· {c.role}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default Messages;
