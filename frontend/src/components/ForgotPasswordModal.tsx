import { useState, type FormEvent } from 'react';
import { api } from '../api/client';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process that request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pg-modal-backdrop" onClick={onClose}>
      <div className="pg-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <button className="pg-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Reset your password</h2>

        {done ? (
          <>
            <p style={{ marginTop: 12 }}>
              If that email is registered with us, a new password has been sent to it. Sign in with it, then change
              it right away from Settings.
            </p>
            <button className="pg-btn pg-btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <>
            <p style={{ marginTop: 8, marginBottom: 16 }}>
              Enter your account email and we'll send you a new password.
            </p>
            {error && <div className="pg-form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="pg-field">
                <label htmlFor="reset-email">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button className="pg-btn pg-btn-primary" style={{ width: '100%' }} type="submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
