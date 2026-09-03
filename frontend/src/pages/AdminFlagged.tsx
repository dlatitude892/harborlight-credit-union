import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { FlaggedActivity, TransactionParty } from '../types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const partyLabel = (party?: TransactionParty | string) => {
  if (!party) return '—';
  if (typeof party === 'string') return party;
  return `${party.firstName} ${party.lastName}`;
};

export default function AdminFlagged() {
  const navigate = useNavigate();
  const [data, setData] = useState<FlaggedActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<FlaggedActivity>('/admin/flagged')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Flagged activity" subtitle="Accounts marked for review and unusually large transactions.">
      {loading ? (
        <div className="empty-state">Loading flagged activity…</div>
      ) : (
        <>
          <div className="section-header">
            <h2 className="section-title">Flagged accounts</h2>
          </div>
          {data?.flaggedUsers.length === 0 ? (
            <div className="card table-card" style={{ marginBottom: 28 }}>
              <div className="empty-state">No accounts currently flagged.</div>
            </div>
          ) : (
            <div className="card table-card" style={{ overflowX: 'auto', marginBottom: 28 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.flaggedUsers.map((u) => (
                    <tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${u._id}`)}>
                      <td>
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="text-secondary">{u.email}</td>
                      <td className="amount-cell">{formatCurrency(u.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="section-header">
            <h2 className="section-title">Large transactions (${data?.threshold.toLocaleString()}+)</h2>
          </div>
          {data?.largeTransactions.length === 0 ? (
            <div className="card table-card" style={{ marginBottom: 28 }}>
              <div className="empty-state">No large transactions to review.</div>
            </div>
          ) : (
            <div className="card table-card" style={{ overflowX: 'auto', marginBottom: 28 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>From</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.largeTransactions.map((txn) => (
                    <tr key={txn._id}>
                      <td className="mono-figure text-secondary">{txn.reference}</td>
                      <td>{partyLabel(txn.senderId)}</td>
                      <td className="amount-cell">{formatCurrency(txn.amount)}</td>
                      <td>
                        <span className={`badge ${txn.status.toLowerCase()}`}>{txn.status.replace('_', ' ')}</span>
                      </td>
                      <td className="text-secondary">{new Date(txn.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="section-header">
            <h2 className="section-title">Blocked &amp; rejected transactions</h2>
          </div>
          {data?.blockedTransactions.length === 0 ? (
            <div className="card table-card">
              <div className="empty-state">Nothing blocked or rejected.</div>
            </div>
          ) : (
            <div className="card table-card" style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>From</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.blockedTransactions.map((txn) => (
                    <tr key={txn._id}>
                      <td className="mono-figure text-secondary">{txn.reference}</td>
                      <td>{partyLabel(txn.senderId)}</td>
                      <td className="amount-cell">{formatCurrency(txn.amount)}</td>
                      <td>
                        <span className={`badge ${txn.status.toLowerCase()}`}>{txn.status.replace('_', ' ')}</span>
                      </td>
                      <td className="text-secondary">{new Date(txn.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
