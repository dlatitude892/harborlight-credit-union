import { useEffect, useState, type FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import AccountNoticeBanner from '../components/AccountNoticeBanner';
import StatCard from '../components/StatCard';
import { api } from '../api/client';
import type { SavingsAccount as SavingsAccountType, SavingsTransaction } from '../types';
import { IconWallet } from '../components/icons';
import { IconTrendingUp } from '../components/marketing-icons';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function Savings() {
  const [account, setAccount] = useState<SavingsAccountType | null>(null);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [direction, setDirection] = useState<'TO_SAVINGS' | 'TO_CHECKING'>('TO_SAVINGS');
  const [amount, setAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    const acc = await api.get<SavingsAccountType | null>('/savings');
    setAccount(acc);
    if (acc) {
      const txns = await api.get<SavingsTransaction[]>('/savings/transactions');
      setTransactions(txns);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleOpen = async () => {
    setOpening(true);
    setError(null);
    try {
      await api.post('/savings/open');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open savings account');
    } finally {
      setOpening(false);
    }
  };

  const handleTransfer = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTransferring(true);
    try {
      await api.post('/savings/transfer', { direction, amount: parseFloat(amount) });
      setSuccess('Transfer complete.');
      setAmount('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete transfer');
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Savings Account">
        <div className="empty-state">Loading…</div>
      </AppLayout>
    );
  }

  if (!account) {
    return (
      <AppLayout title="Savings Account" subtitle="Open a high-yield savings account in one click.">
        {error && <div className="form-error">{error}</div>}
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 460 }}>
          <span className="stat-icon income" style={{ margin: '0 auto 18px' }}>
            <IconTrendingUp />
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 8 }}>You don't have a savings account yet</h2>
          <p className="text-secondary" style={{ fontSize: 13.5, marginBottom: 22 }}>
            Open a Harborlight Advantage Savings account and start earning 4.35% APY - no minimum balance, no
            monthly fee.
          </p>
          <button className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }} disabled={opening} onClick={handleOpen}>
            {opening ? 'Opening…' : 'Open a Savings Account'}
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Savings Account" subtitle="Harborlight Advantage Savings.">
      <AccountNoticeBanner />

      <div className="stat-grid cols-2">
        <StatCard label="Savings balance" value={account.balance} icon={<IconWallet />} iconClass="income" />
        <div className="card stat-card">
          <div className="eyebrow">
            <span>Annual percentage yield</span>
            <span className="stat-icon income">
              <IconTrendingUp />
            </span>
          </div>
          <div className="stat-value mono-figure">{account.apy}% APY</div>
          <div className="stat-change">Account #{account.accountNumber}</div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Move money</h2>
      </div>
      <div className="card" style={{ padding: 24, maxWidth: 420, marginBottom: 28 }}>
        {success && <div className="form-success">{success}</div>}
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleTransfer}>
          <div className="field">
            <label htmlFor="direction">Direction</label>
            <select id="direction" value={direction} onChange={(e) => setDirection(e.target.value as typeof direction)}>
              <option value="TO_SAVINGS">Checking → Savings</option>
              <option value="TO_CHECKING">Savings → Checking</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="amount">Amount (USD)</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={transferring}>
            {transferring ? 'Transferring…' : 'Transfer'}
          </button>
        </form>
      </div>

      <div className="section-header">
        <h2 className="section-title">Savings activity</h2>
      </div>
      {transactions.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No savings activity yet.</div>
        </div>
      ) : (
        <div className="card table-card">
          <table className="savings-txn-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Balance after</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td className="txn-desc">{t.description}</td>
                  <td className="text-secondary">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className={`amount-cell ${t.type === 'DEPOSIT' ? 'text-positive' : 'text-danger'}`}>
                    {t.type === 'DEPOSIT' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="mono-figure text-secondary">{formatCurrency(t.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="savings-mobile-list">
            {transactions.map((t) => (
              <div className="txn-mobile-card" key={t._id}>
                <div className="txn-mobile-top">
                  <div className="txn-mobile-title">
                    <div className="txn-desc">{t.description}</div>
                    <div className="txn-meta">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className={`amount-cell ${t.type === 'DEPOSIT' ? 'text-positive' : 'text-danger'}`}>
                    {t.type === 'DEPOSIT' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </div>
                </div>
                <div className="txn-mobile-bottom">
                  <span className="text-secondary" style={{ fontSize: 12.5 }}>
                    Balance after
                  </span>
                  <span className="mono-figure text-secondary">{formatCurrency(t.balanceAfter)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
