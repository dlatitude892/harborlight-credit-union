import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ProfileHeader from '../components/ProfileHeader';
import AccountNoticeBanner from '../components/AccountNoticeBanner';
import StatCard from '../components/StatCard';
import QuickActions from '../components/QuickActions';
import TransactionsTable from '../components/TransactionsTable';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary, PaginatedTransactions, Transaction } from '../types';
import { IconWallet, IconArrowDown, IconArrowUp } from '../components/icons';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [summaryRes, txnRes] = await Promise.all([
          api.get<DashboardSummary>('/accounts/summary'),
          api.get<PaginatedTransactions>('/transactions?limit=5'),
        ]);
        if (!cancelled) {
          setSummary(summaryRes);
          setTransactions(txnRes.transactions);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout title={`Good to see you, ${user?.firstName || 'member'}`} subtitle="Here's where things stand today.">
      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading your accounts…</div>
      ) : (
        <>
          <AccountNoticeBanner />
          <ProfileHeader />

          <div className="stat-grid">
            <StatCard
              label="Total balance"
              value={summary?.balance ?? 0}
              icon={<IconWallet />}
              iconClass="balance"
            />
            <StatCard
              label="Income this month"
              value={summary?.income ?? 0}
              changePct={summary?.incomeChangePct}
              icon={<IconArrowDown />}
              iconClass="income"
            />
            <StatCard
              label="Expenses this month"
              value={summary?.expenses ?? 0}
              changePct={summary ? -summary.expenseChangePct : undefined}
              icon={<IconArrowUp />}
              iconClass="expense"
            />
          </div>

          <div className="ledger-rule" />

          <QuickActions />

          <div className="section-header">
            <h2 className="section-title">Recent transactions</h2>
            <Link className="link-accent" to="/transactions">
              View all
            </Link>
          </div>
          <TransactionsTable transactions={transactions} />
        </>
      )}
    </AppLayout>
  );
}
