import { useState, type FormEvent } from 'react';

interface OtpModalProps {
  reference: string;
  devOtp?: string;
  onVerify: (otp: string) => Promise<void>;
  onClose: () => void;
}

export default function OtpModal({ reference, devOtp, onVerify, onClose }: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Verify it's you</h2>
        <p className="modal-sub">
          We sent a 6-digit code for transaction {reference}. Enter it below to verify your identity - it will be
          reviewed before funds move.
        </p>

        {devOtp && (
          <div className="form-success">
            Dev mode: no SMTP configured, so here's the code directly — {devOtp}
          </div>
        )}
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              className="otp-input"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting || otp.length < 6}>
              {submitting ? 'Verifying…' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
