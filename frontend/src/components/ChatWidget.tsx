import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { ChatMessage, ChatSession } from '../types';
import { IconChatBubble, IconClose, IconPaperPlane } from './icons';

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [starting, setStarting] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (!open || !session) return;

    const poll = () => api.get<ChatMessage[]>(`/chat/sessions/${session._id}/messages`).then(setMessages);
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, session]);

  useEffect(() => {
    if (open && user && !session) {
      startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const startSession = async (name?: string, email?: string) => {
    setStarting(true);
    try {
      const newSession = await api.post<ChatSession>('/chat/sessions', {
        visitorName: name,
        visitorEmail: email,
      });
      setSession(newSession);
    } finally {
      setStarting(false);
    }
  };

  const handleGuestStart = (e: FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    startSession(guestName.trim(), guestEmail.trim() || undefined);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !text.trim()) return;
    setSending(true);
    try {
      const message = await api.post<ChatMessage>(`/chat/sessions/${session._id}/messages`, { message: text.trim() });
      setMessages((m) => [...m, message]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Open live chat">
        {open ? <IconClose /> : <IconChatBubble />}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <h3>Harborlight Support</h3>
              <p>Usually replies in a few minutes</p>
            </div>
            <button className="chat-panel-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <IconClose />
            </button>
          </div>

          {!session ? (
            user ? (
              <div className="chat-start-form">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {starting ? 'Starting chat…' : 'Connecting you to support…'}
                </p>
              </div>
            ) : (
              <form className="chat-start-form" onSubmit={handleGuestStart}>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Tell us your name to start chatting.</p>
                <div className="field" style={{ marginBottom: 0 }}>
                  <input required placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <input type="email" placeholder="Email (optional)" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={starting}>
                  {starting ? 'Starting…' : 'Start chat'}
                </button>
              </form>
            )
          ) : (
            <>
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="chat-empty">Say hello — a Harborlight team member will be with you shortly.</div>
                )}
                {messages.map((m) => (
                  <div key={m._id} className={`chat-bubble ${m.sender === 'CUSTOMER' ? 'customer' : 'admin'}`}>
                    {m.message}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input-row" onSubmit={handleSend}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
                <button type="submit" disabled={sending || !text.trim()} aria-label="Send">
                  <IconPaperPlane />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
