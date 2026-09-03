import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { CustomerCareTicket } from '../types';

const statusOptions: CustomerCareTicket['status'][] = ['NEW', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'];

const authorName = (author: CustomerCareTicket['responses'][number]['authorId']) =>
  typeof author === 'string' ? author : `${author.firstName} ${author.lastName}`;

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<CustomerCareTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = () => api.get<CustomerCareTicket>(`/customer-care/${id}`).then(setTicket);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  const setStatus = async (status: CustomerCareTicket['status']) => {
    setUpdating(true);
    try {
      await api.patch(`/customer-care/${id}`, { status });
      await load();
    } finally {
      setUpdating(false);
    }
  };

  const assignToMe = async () => {
    setUpdating(true);
    try {
      await api.patch(`/customer-care/${id}`, { assignToSelf: true });
      await load();
    } finally {
      setUpdating(false);
    }
  };

  const handleRespond = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/customer-care/${id}/responses`, { message });
      setMessage('');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !ticket) {
    return (
      <AdminLayout title="Ticket">
        <div className="empty-state">Loading ticket…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={ticket.subject} subtitle={`From ${ticket.name} · ${ticket.email}`}>
      <Link to="/admin/tickets" className="link-accent" style={{ display: 'inline-block', marginBottom: 18, fontSize: 13 }}>
        ← Back to tickets
      </Link>

      <div className="card" style={{ padding: 22, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <span className="badge pending">{ticket.category.replace(/_/g, ' ')}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statusOptions.map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${s === ticket.status ? 'btn-approve' : 'btn-ghost'}`}
                disabled={updating}
                onClick={() => setStatus(s)}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{ticket.message}</p>
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-ghost btn-sm" disabled={updating} onClick={assignToMe}>
            Assign to me
          </button>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Responses</h2>
      </div>
      {ticket.responses.length === 0 ? (
        <div className="card table-card" style={{ marginBottom: 20 }}>
          <div className="empty-state">No responses yet.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          {ticket.responses.map((r, i) => (
            <div key={i} style={{ padding: '12px 0', borderTop: i > 0 ? '1px solid var(--border-soft)' : 'none' }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                {authorName(r.authorId)} · {new Date(r.createdAt).toLocaleString()}
              </div>
              <div style={{ fontSize: 13.5 }}>{r.message}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleRespond} className="card" style={{ padding: 20 }}>
        <div className="field">
          <label htmlFor="response">Add a response</label>
          <textarea
            id="response"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: 13.5,
              fontFamily: 'inherit',
            }}
          />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: 'auto' }} disabled={submitting}>
          {submitting ? 'Sending…' : 'Send response'}
        </button>
      </form>
    </AdminLayout>
  );
}
