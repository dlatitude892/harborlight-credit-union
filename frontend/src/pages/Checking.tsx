import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import AccountNoticeBanner from '../components/AccountNoticeBanner';
import StatCard from '../components/StatCard';
import TransactionsTable from '../components/TransactionsTable';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary, PaginatedTransactions, Transaction } from '../types';
import { IconWallet, IconArrowDown, IconArrowUp } from '../components/icons';
import { IconShield } from '../components/marketing-icons';

export default function Checking() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get<DashboardSummary>('/accounts/summary'), api.get<PaginatedTransactions>('/transactions?limit=5')])
      .then(([summaryRes, txnRes]) => {
        if (!cancelled) {
          setSummary(summaryRes);
          setTransactions(txnRes.transactions);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout title="Checking Account" subtitle="Harborlight Advantage Checking.">
      {loading ? (
        <div className="empty-state">Loading your checking account…</div>
      ) : (
        <>
          <AccountNoticeBanner />

          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div className="text-secondary" style={{ fontSize: 12.5, marginBottom: 6 }}>
                  Account holder
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div>
                <div className="text-secondary" style={{ fontSize: 12.5, marginBottom: 6 }}>
                  Account number
                </div>
                <div className="mono-figure" style={{ fontSize: 15 }}>
                  {user?.accountNumber}
                </div>
              </div>
              <div>
                <div className="text-secondary" style={{ fontSize: 12.5, marginBottom: 6 }}>
                  Routing number
                </div>
                <div className="mono-figure" style={{ fontSize: 15 }}>
                  211274450
                </div>
              </div>
              <div>
                <div className="text-secondary" style={{ fontSize: 12.5, marginBottom: 6 }}>
                  Status
                </div>
                <span className="status-pill">
                  <span className="dot" />
                  {user?.accountStatus === 'ACTIVE' ? 'Active' : user?.accountStatus?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-grid">
            <StatCard label="Checking balance" value={summary?.balance ?? 0} icon={<IconWallet />} iconClass="balance" />
            <StatCard label="Income this month" value={summary?.income ?? 0} icon={<IconArrowDown />} iconClass="income" />
            <StatCard label="Expenses this month" value={summary?.expenses ?? 0} icon={<IconArrowUp />} iconClass="expense" />
          </div>

          <div className="card" style={{ padding: 22, marginTop: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="stat-icon balance" style={{ flexShrink: 0 }}>
              <IconShield />
            </span>
            <div style={{ fontSize: 13.5 }} className="text-secondary">
              No monthly fee, no minimum balance. Federally insured by the NCUA up to $250,000 per member.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <Link to="/transfer" className="btn btn-primary" style={{ width: 'auto' }}>
              Send money
            </Link>
            <Link to="/transactions" className="btn btn-ghost">
              View full transaction history
            </Link>
          </div>

          <div className="section-header">
            <h2 className="section-title">Recent activity</h2>
          </div>
          <TransactionsTable transactions={transactions} />
        </>
      )}
    </AppLayout>
  );
}
