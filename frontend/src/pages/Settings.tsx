import { useRef, useState, type FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { resizeImageToDataUrl } from '../utils/image';
import { IconShieldCheck, IconTrendingUp } from '../components/icons';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const kycLabel: Record<string, string> = {
  UNVERIFIED: 'Not verified',
  PENDING: 'Pending review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected - resubmit below',
};

export default function Settings() {
  const { user, changePassword, changeEmail } = useAuth();

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Email
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // KYC
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [idType, setIdType] = useState('Driver\u2019s license');
  const [idNumberLast4, setIdNumberLast4] = useState('');
  const [idImageUrl, setIdImageUrl] = useState<string | null>(null);
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycSuccess, setKycSuccess] = useState(false);
  const [savingKyc, setSavingKyc] = useState(false);
  const [processingIdImage, setProcessingIdImage] = useState(false);

  // Limit upgrade
  const [requestedLimit, setRequestedLimit] = useState('');
  const [limitReason, setLimitReason] = useState('');
  const [limitError, setLimitError] = useState<string | null>(null);
  const [limitSuccess, setLimitSuccess] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Unable to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setSavingEmail(true);
    try {
      await changeEmail(emailPassword, newEmail);
      setEmailSuccess(true);
      setEmailPassword('');
      setNewEmail('');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Unable to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingIdImage(true);
    setKycError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setIdImageUrl(dataUrl);
    } catch (err) {
      setKycError(err instanceof Error ? err.message : 'Unable to process that image');
    } finally {
      setProcessingIdImage(false);
    }
  };

  const handleKycSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setKycError(null);
    setKycSuccess(false);
    setSavingKyc(true);
    try {
      await api.post('/account-requests/kyc', { idType, idNumberLast4, idImageUrl: idImageUrl || undefined });
      setKycSuccess(true);
      setIdNumberLast4('');
      setIdImageUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setKycError(err instanceof Error ? err.message : 'Unable to submit verification');
    } finally {
      setSavingKyc(false);
    }
  };

  const handleLimitSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLimitError(null);
    setLimitSuccess(false);
    setSavingLimit(true);
    try {
      await api.post('/account-requests/limit-upgrade', { requestedLimit: parseFloat(requestedLimit), reason: limitReason });
      setLimitSuccess(true);
      setRequestedLimit('');
      setLimitReason('');
    } catch (err) {
      setLimitError(err instanceof Error ? err.message : 'Unable to submit request');
    } finally {
      setSavingLimit(false);
    }
  };

  const canSubmitKyc = user?.kycStatus === 'UNVERIFIED' || user?.kycStatus === 'REJECTED';

  return (
    <AppLayout title="Settings" subtitle="Your profile, security, and account preferences.">
      <div className="card" style={{ padding: 24, maxWidth: 460, marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Profile
        </h2>
        <div className="field">
          <label>Full name</label>
          <input value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} disabled />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={user?.email ?? ''} disabled />
        </div>
        <div className="field">
          <label>Member number</label>
          <input value={user?.accountNumber ?? ''} disabled className="mono-figure" />
        </div>
        <p className="text-secondary" style={{ fontSize: 12.5, marginTop: 4 }}>
          Contact support to update your name or address.
        </p>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 460, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <IconShieldCheck style={{ width: 18, height: 18, color: 'var(--accent-strong)' }} />
          <h2 className="section-title" style={{ margin: 0 }}>
            Identity verification (KYC)
          </h2>
        </div>
        <p className="text-secondary" style={{ fontSize: 12.5, marginBottom: 16 }}>
          Status: <strong>{kycLabel[user?.kycStatus || 'UNVERIFIED']}</strong>
        </p>

        {kycSuccess && <div className="form-success">Submitted for review.</div>}
        {kycError && <div className="form-error">{kycError}</div>}

        {canSubmitKyc && (
          <form onSubmit={handleKycSubmit}>
            <div className="field">
              <label htmlFor="idType">ID type</label>
              <select id="idType" value={idType} onChange={(e) => setIdType(e.target.value)}>
                <option>Driver&rsquo;s license</option>
                <option>Passport</option>
                <option>State ID</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="idNumberLast4">Last 4 digits of ID number</label>
              <input
                id="idNumberLast4"
                required
                maxLength={4}
                value={idNumberLast4}
                onChange={(e) => setIdNumberLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
            <div className="field">
              <label>ID photo (optional)</label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={processingIdImage}
              >
                {processingIdImage ? 'Processing…' : idImageUrl ? 'Photo attached - change' : 'Upload a photo'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleIdFileChange} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingKyc}>
              {savingKyc ? 'Submitting…' : 'Submit for verification'}
            </button>
          </form>
        )}
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 460, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <IconTrendingUp style={{ width: 18, height: 18, color: 'var(--accent-strong)' }} />
          <h2 className="section-title" style={{ margin: 0 }}>
            Transaction limit
          </h2>
        </div>
        <p className="text-secondary" style={{ fontSize: 12.5, marginBottom: 16 }}>
          Current limit per transaction: <strong>{formatCurrency(user?.transactionLimit || 0)}</strong>
        </p>

        {limitSuccess && <div className="form-success">Upgrade request submitted.</div>}
        {limitError && <div className="form-error">{limitError}</div>}

        <form onSubmit={handleLimitSubmit}>
          <div className="field">
            <label htmlFor="requestedLimit">Requested limit (USD)</label>
            <input
              id="requestedLimit"
              type="number"
              min="1"
              step="1"
              required
              value={requestedLimit}
              onChange={(e) => setRequestedLimit(e.target.value)}
              placeholder="e.g. 15000"
            />
          </div>
          <div className="field">
            <label htmlFor="limitReason">Reason (optional)</label>
            <input id="limitReason" value={limitReason} onChange={(e) => setLimitReason(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingLimit}>
            {savingLimit ? 'Submitting…' : 'Request upgrade'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 460, marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Change password
        </h2>
        {passwordSuccess && (
          <div className="form-success" style={{ marginBottom: 14 }}>
            Password updated.
          </div>
        )}
        {passwordError && (
          <div className="form-error" style={{ marginBottom: 14 }}>
            {passwordError}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit}>
          <div className="field">
            <label htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingPassword}>
            {savingPassword ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 460 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Change email address
        </h2>
        {emailSuccess && (
          <div className="form-success" style={{ marginBottom: 14 }}>
            Email updated.
          </div>
        )}
        {emailError && (
          <div className="form-error" style={{ marginBottom: 14 }}>
            {emailError}
          </div>
        )}
        <form onSubmit={handleEmailSubmit}>
          <div className="field">
            <label htmlFor="newEmail">New email address</label>
            <input id="newEmail" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="emailPassword">Confirm your password</label>
            <input
              id="emailPassword"
              type="password"
              required
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingEmail}>
            {savingEmail ? 'Saving…' : 'Update email'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
