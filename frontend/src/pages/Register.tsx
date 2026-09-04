import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../marketing.css';
import Logo from '../components/pg/Logo';

const stepLabels = ['Personal Information', 'Address', 'Account & Security', 'Identity & Compliance', 'Review'];

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  password: string;
  confirmPassword: string;
  ssnLast4: string;
  idType: string;
  idNumberLast4: string;
  employmentStatus: string;
  occupation: string;
  sourceOfIncome: string;
}

const emptyForm: FormState = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  password: '',
  confirmPassword: '',
  ssnLast4: '',
  idType: "Driver's License",
  idNumberLast4: '',
  employmentStatus: 'Employed',
  occupation: '',
  sourceOfIncome: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.email || !form.phone) return 'Please complete all required fields.';
    }
    if (step === 2) {
      if (!form.address || !form.city || !form.state || !form.zip || !form.country) return 'Please complete all required fields.';
    }
    if (step === 3) {
      if (form.password.length < 8) return 'Password must be at least 8 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 4) {
      if (form.ssnLast4.length !== 4) return 'Enter the last 4 digits of your SSN.';
      if (form.idNumberLast4.length < 1) return 'Enter at least the last few characters of your ID number.';
    }
    return null;
  };

  const next = (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(5, s + 1));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await register({
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        password: form.password,
        ssnLast4: form.ssnLast4,
        idType: form.idType,
        idNumberLast4: form.idNumberLast4,
        employmentStatus: form.employmentStatus,
        occupation: form.occupation || undefined,
        sourceOfIncome: form.sourceOfIncome || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pub-site pg-auth-shell">
      <div className="pg-auth-card pg-wizard">
        <Link to="/">
          <Logo />
        </Link>
        <h1>Open an account</h1>
        <p>Join Harborlight in a few minutes. Your account is active as soon as you finish.</p>

        <div className="pg-steps">
          {stepLabels.map((_, i) => (
            <div key={i} className={`pg-step-dot${i < step ? ' done' : ''}`} />
          ))}
        </div>
        <div className="pg-step-label">
          Step {step} of 5 — {stepLabels[step - 1]}
        </div>

        {error && <div className="pg-form-error">{error}</div>}

        <form onSubmit={step < 5 ? next : (e) => e.preventDefault()}>
          {step === 1 && (
            <>
              <div className="pg-field-row">
                <div className="pg-field">
                  <label>First name</label>
                  <input required value={form.firstName} onChange={update('firstName')} placeholder="Jordan" />
                </div>
                <div className="pg-field">
                  <label>Last name</label>
                  <input required value={form.lastName} onChange={update('lastName')} placeholder="Rivera" />
                </div>
              </div>
              <div className="pg-field">
                <label>Middle name (optional)</label>
                <input value={form.middleName} onChange={update('middleName')} />
              </div>
              <div className="pg-field">
                <label>Date of birth</label>
                <input required type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
              </div>
              <div className="pg-field-row">
                <div className="pg-field">
                  <label>Email address</label>
                  <input required type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
                </div>
                <div className="pg-field">
                  <label>Phone number</label>
                  <input required value={form.phone} onChange={update('phone')} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="pg-field">
                <label>Residential address</label>
                <input required value={form.address} onChange={update('address')} placeholder="123 Main St" />
              </div>
              <div className="pg-field-row">
                <div className="pg-field">
                  <label>City</label>
                  <input required value={form.city} onChange={update('city')} />
                </div>
                <div className="pg-field">
                  <label>State</label>
                  <input required value={form.state} onChange={update('state')} />
                </div>
              </div>
              <div className="pg-field-row">
                <div className="pg-field">
                  <label>ZIP / postal code</label>
                  <input required value={form.zip} onChange={update('zip')} />
                </div>
                <div className="pg-field">
                  <label>Country</label>
                  <input required value={form.country} onChange={update('country')} />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="pg-field">
                <label>Password</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="pg-field">
                <label>Confirm password</label>
                <input required type="password" value={form.confirmPassword} onChange={update('confirmPassword')} />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p style={{ fontSize: 12.5, color: 'var(--pg-text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                For your security, we only ever collect the last few digits of identifying numbers - never a full
                SSN or ID number.
              </p>
              <div className="pg-field-row">
                <div className="pg-field">
                  <label>Last 4 of SSN</label>
                  <input required maxLength={4} value={form.ssnLast4} onChange={update('ssnLast4')} placeholder="1234" />
                </div>
                <div className="pg-field">
                  <label>ID type</label>
                  <select value={form.idType} onChange={update('idType')}>
                    <option>Driver's License</option>
                    <option>State ID</option>
                    <option>Passport</option>
                  </select>
                </div>
              </div>
              <div className="pg-field">
                <label>Last 4 characters of ID number</label>
                <input required maxLength={4} value={form.idNumberLast4} onChange={update('idNumberLast4')} placeholder="5678" />
              </div>
              <div className="pg-field-row">
                <div className="pg-field">
                  <label>Employment status</label>
                  <select value={form.employmentStatus} onChange={update('employmentStatus')}>
                    <option>Employed</option>
                    <option>Self-employed</option>
                    <option>Student</option>
                    <option>Retired</option>
                    <option>Unemployed</option>
                  </select>
                </div>
                <div className="pg-field">
                  <label>Occupation</label>
                  <input value={form.occupation} onChange={update('occupation')} />
                </div>
              </div>
              <div className="pg-field">
                <label>Source of income</label>
                <input value={form.sourceOfIncome} onChange={update('sourceOfIncome')} placeholder="e.g. Employment, business income" />
              </div>
            </>
          )}

          {step === 5 && (
            <div className="pg-review-list">
              <div className="pg-review-row">
                <span>Name</span>
                <span>
                  {form.firstName} {form.middleName} {form.lastName}
                </span>
              </div>
              <div className="pg-review-row">
                <span>Contact</span>
                <span>
                  {form.email} · {form.phone}
                </span>
              </div>
              <div className="pg-review-row">
                <span>Address</span>
                <span>
                  {form.address}, {form.city}, {form.state} {form.zip}
                </span>
              </div>
              <div className="pg-review-row">
                <span>Identity</span>
                <span>
                  SSN ••{form.ssnLast4} · {form.idType} ••{form.idNumberLast4}
                </span>
              </div>
              <div className="pg-review-row">
                <span>Employment</span>
                <span>
                  {form.employmentStatus}
                  {form.occupation ? ` · ${form.occupation}` : ''}
                </span>
              </div>
            </div>
          )}

          <div className="pg-modal-actions">
            {step > 1 ? (
              <button type="button" className="pg-btn pg-btn-ghost" onClick={back}>
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 5 ? (
              <button type="submit" className="pg-btn pg-btn-primary">
                Continue
              </button>
            ) : (
              <button type="button" className="pg-btn pg-btn-primary" disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Opening account…' : 'Open account'}
              </button>
            )}
          </div>
        </form>

        <div className="pg-auth-switch">
          Already a member? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
