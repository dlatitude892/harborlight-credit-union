import { useEffect, useRef, useState, type FormEvent } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { ChatMessage, ChatSession } from '../types';
import { IconPaperPlane } from '../components/icons';

export default function AdminChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSessions = () => api.get<ChatSession[]>('/chat/admin/sessions').then(setSessions);

  useEffect(() => {
    loadSessions().finally(() => setLoading(false));
    const interval = setInterval(loadSessions, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const poll = () => api.get<ChatMessage[]>(`/chat/admin/sessions/${selected._id}/messages`).then(setMessages);
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !text.trim()) return;
    setSending(true);
    try {
      const message = await api.post<ChatMessage>(`/chat/admin/sessions/${selected._id}/messages`, { message: text.trim() });
      setMessages((m) => [...m, message]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const closeSession = async () => {
    if (!selected) return;
    await api.patch(`/chat/admin/sessions/${selected._id}`, { status: 'CLOSED' });
    await loadSessions();
    setSelected((s) => (s ? { ...s, status: 'CLOSED' } : s));
  };

  return (
    <AdminLayout title="Live chat" subtitle="Respond to members and visitors in real time.">
      {loading ? (
        <div className="empty-state">Loading conversations…</div>
      ) : (
        <div className="admin-chat-layout">
          <div className="admin-chat-list">
            {sessions.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                No conversations yet.
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s._id}
                  className={`admin-chat-list-item${selected?._id === s._id ? ' active' : ''}`}
                  onClick={() => setSelected(s)}
                >
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.visitorName}</div>
                  <div className="txn-meta">{s.visitorEmail || 'No email provided'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span className={`badge ${s.status === 'OPEN' ? 'approved' : 'rejected'}`} style={{ fontSize: 10.5 }}>
                      {s.status}
                    </span>
                    <span className="txn-meta">{new Date(s.lastMessageAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="admin-chat-thread">
            {!selected ? (
              <div className="empty-state" style={{ margin: 'auto' }}>
                Select a conversation to view messages.
              </div>
            ) : (
              <>
                <div className="chat-panel-header" style={{ borderRadius: 0 }}>
                  <div>
                    <h3>{selected.visitorName}</h3>
                    <p>{selected.visitorEmail || 'No email provided'}</p>
                  </div>
                  {selected.status === 'OPEN' && (
                    <button className="btn btn-sm btn-block" onClick={closeSession}>
                      Close
                    </button>
                  )}
                </div>
                <div className="chat-messages">
                  {messages.map((m) => (
                    <div key={m._id} className={`chat-bubble ${m.sender === 'ADMIN' ? 'customer' : 'admin'}`}>
                      {m.message}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form className="chat-input-row" onSubmit={handleSend}>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply…" />
                  <button type="submit" disabled={sending || !text.trim()} aria-label="Send">
                    <IconPaperPlane />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
