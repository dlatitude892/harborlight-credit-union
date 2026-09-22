import { useEffect, useState, type FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { LoanApplication } from '../types';

const loanTypes: { value: string; label: string }[] = [
  { value: 'PERSONAL', label: 'Personal loan' },
  { value: 'AUTO', label: 'Auto loan' },
  { value: 'HOME', label: 'Home loan' },
  { value: 'HOME_REFINANCE', label: 'Home refinance' },
  { value: 'BUSINESS', label: 'Business loan' },
];

const statusTone: Record<string, string> = {
  NEW: 'pending',
  IN_REVIEW: 'pending',
  APPROVED: 'approved',
  DENIED: 'rejected',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Loans() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [loanType, setLoanType] = useState('PERSONAL');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [purpose, setPurpose] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('Employed');
  const [annualIncome, setAnnualIncome] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get<LoanApplication[]>('/loan-applications/mine').then(setApplications);

  useEffect(() => {
    load()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.post('/loan-applications', {
        loanType,
        fullName: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        phone,
        employmentStatus,
        annualIncome,
        requestedAmount: parseFloat(requestedAmount),
        loanTerm,
        purpose,
      });
      setSuccess(true);
      setShowForm(false);
      setRequestedAmount('');
      setLoanTerm('');
      setPurpose('');
      setAnnualIncome('');
      setPhone('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Loans" subtitle="Apply for a loan and track your applications.">
      {success && <div className="form-success">Application submitted - we'll be in touch soon.</div>}
      {error && <div className="form-error">{error}</div>}

      {!showForm && (
        <button className="btn btn-primary" style={{ marginBottom: 24 }} onClick={() => setShowForm(true)}>
          Apply for a loan
        </button>
      )}

      {showForm && (
        <div className="card" style={{ padding: 26, maxWidth: 460, marginBottom: 30 }}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="loanType">Loan type</label>
              <select id="loanType" value={loanType} onChange={(e) => setLoanType(e.target.value)}>
                {loanTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>
            <div className="field">
              <label htmlFor="requestedAmount">Amount requested (USD)</label>
              <input
                id="requestedAmount"
                type="number"
                min="1"
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label htmlFor="loanTerm">Preferred term</label>
              <input id="loanTerm" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} placeholder="e.g. 36 months" />
            </div>
            <div className="field">
              <label htmlFor="employmentStatus">Employment status</label>
              <select id="employmentStatus" value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
                <option>Employed</option>
                <option>Self-employed</option>
                <option>Retired</option>
                <option>Unemployed</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="annualIncome">Annual income (optional)</label>
              <input id="annualIncome" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} placeholder="$0" />
            </div>
            <div className="field">
              <label htmlFor="purpose">What's this loan for?</label>
              <input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Your applications</h2>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : applications.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No loan applications yet.</div>
        </div>
      ) : (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a._id}>
                  <td className="mono-figure text-secondary">{a.reference}</td>
                  <td>{loanTypes.find((t) => t.value === a.loanType)?.label || a.loanType}</td>
                  <td className="amount-cell">{formatCurrency(a.requestedAmount)}</td>
                  <td className="text-secondary">{formatDate(a.createdAt)}</td>
                  <td>
                    <span className={`badge ${statusTone[a.status] || 'pending'}`}>{a.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
