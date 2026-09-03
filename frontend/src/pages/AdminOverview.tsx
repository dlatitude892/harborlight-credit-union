import { useEffect, useState, type FormEvent } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { api } from '../api/client';
import type { AdminSummary, Transaction } from '../types';
import { IconUsers, IconTrendingUp } from '../components/marketing-icons';
import { IconHistory } from '../components/icons';

export default function AdminOverview() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ memberEmail: '', amount: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Transaction | null>(null);

  const loadSummary = () => api.get<AdminSummary>('/admin/summary').then(setSummary);

  useEffect(() => {
    loadSummary().finally(() => setLoading(false));
  }, []);

  const handleCredit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const result = await api.post<{ transaction: Transaction }>('/admin/credit', {
        memberEmail: form.memberEmail,
        amount: parseFloat(form.amount),
        note: form.note || undefined,
      });
      setSuccess(result.transaction);
      setForm({ memberEmail: '', amount: '', note: '' });
      loadSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to credit account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Overview" subtitle="Membership and balances across Harborlight.">
      {loading ? (
        <div className="empty-state">Loading admin summary…</div>
      ) : (
        <div className="admin-summary-grid cols-5">
          <StatCard label="Total members" value={summary?.memberCount ?? 0} icon={<IconUsers />} iconClass="balance" format="number" />
          <StatCard label="Total member balance" value={summary?.totalBalance ?? 0} icon={<IconTrendingUp />} iconClass="income" />
          <StatCard label="Pending transactions" value={summary?.pendingCount ?? 0} icon={<IconHistory />} iconClass="expense" format="number" />
          <StatCard label="Accounts under review" value={summary?.underReviewCount ?? 0} icon={<IconHistory />} iconClass="expense" format="number" />
          <StatCard label="Pending applications" value={summary?.pendingApplicationsCount ?? 0} icon={<IconHistory />} iconClass="expense" format="number" />
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Credit a member account</h2>
      </div>
      <div className="card" style={{ padding: 24, maxWidth: 460 }}>
        {error && <div className="form-error">{error}</div>}
        {success && (
          <div className="form-success">
            Credited {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(success.amount)} — reference{' '}
            {success.reference}
          </div>
        )}
        <form onSubmit={handleCredit}>
          <div className="field">
            <label htmlFor="memberEmail">Member email</label>
            <input
              id="memberEmail"
              type="email"
              required
              value={form.memberEmail}
              onChange={(e) => setForm((f) => ({ ...f, memberEmail: e.target.value }))}
              placeholder="member@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="amount">Amount (USD)</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label htmlFor="note">Note</label>
            <input
              id="note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Reason for credit"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Crediting…' : 'Credit account'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
