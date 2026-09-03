import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import { IconClose } from '../icons';
import { IconCheck } from '../marketing-icons';

interface CustomerCareModalProps {
  onClose: () => void;
}

const categories = [
  { value: 'GENERAL', label: 'General Question' },
  { value: 'ACCOUNT_SUPPORT', label: 'Account Support' },
  { value: 'LOAN_QUESTION', label: 'Loan Question' },
  { value: 'MORTGAGE_QUESTION', label: 'Mortgage Question' },
  { value: 'ONLINE_BANKING', label: 'Online Banking' },
  { value: 'TECHNICAL_SUPPORT', label: 'Technical Support' },
  { value: 'APPLICATION_STATUS', label: 'Application Status' },
  { value: 'OTHER', label: 'Other' },
];

export default function CustomerCareModal({ onClose }: CustomerCareModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', category: 'GENERAL', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/customer-care', form);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-modal-backdrop" onClick={onClose}>
      <div className="pg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pg-modal-head">
          <h2>Contact Customer Care</h2>
          <button className="pg-modal-close" onClick={onClose} aria-label="Close">
            <IconClose style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="pg-success-icon">
              <IconCheck />
            </div>
            <p className="pg-modal-sub">
              Your message has been received. Our customer-care team will review your request and respond through
              the contact information you provided.
            </p>
            <button className="pg-btn pg-btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="pg-form-error">{error}</div>}
            <div className="pg-field">
              <label>Name</label>
              <input required value={form.name} onChange={update('name')} />
            </div>
            <div className="pg-field-row">
              <div className="pg-field">
                <label>Email</label>
                <input required type="email" value={form.email} onChange={update('email')} />
              </div>
              <div className="pg-field">
                <label>Phone (optional)</label>
                <input value={form.phone} onChange={update('phone')} />
              </div>
            </div>
            <div className="pg-field">
              <label>Category</label>
              <select value={form.category} onChange={update('category')}>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pg-field">
              <label>Subject</label>
              <input required value={form.subject} onChange={update('subject')} />
            </div>
            <div className="pg-field">
              <label>Message</label>
              <textarea required rows={4} value={form.message} onChange={update('message')} />
            </div>
            <button className="pg-btn pg-btn-primary" type="submit" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
