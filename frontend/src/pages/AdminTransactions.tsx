import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import TransactionEditModal from '../components/TransactionEditModal';
import { api } from '../api/client';
import type { Transaction, TransactionParty } from '../types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const partyLabel = (party?: TransactionParty | string) => {
  if (!party) return '—';
  if (typeof party === 'string') return party;
  return `${party.firstName} ${party.lastName}`;
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const load = () => api.get<Transaction[]>('/admin/transactions/pending').then(setTransactions);

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  const act = async (id: string, action: 'approve' | 'block' | 'hold' | 'reject' | 'unblock') => {
    setActingOn(id);
    setError(null);
    try {
      await api.post(`/admin/transactions/${id}/${action}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} transaction`);
    } finally {
      setActingOn(null);
    }
  };

  return (
    <AdminLayout title="Pending transactions" subtitle="Authorize, hold, or block transactions awaiting review.">
      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading pending transactions…</div>
      ) : transactions.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">Nothing pending right now — all caught up.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td className="mono-figure text-secondary">{txn.reference}</td>
                  <td>{partyLabel(txn.senderId)}</td>
                  <td>{txn.method === 'MEMBER' ? partyLabel(txn.recipientId) : txn.method.replace('_', ' ')}</td>
                  <td className="amount-cell">{formatCurrency(txn.amount)}</td>
                  <td className="text-secondary">{txn.method}</td>
                  <td>
                    <span className={`badge ${txn.status.toLowerCase()}`}>{txn.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button
                        className="btn btn-sm btn-approve"
                        disabled={actingOn === txn._id}
                        onClick={() => act(txn._id, 'approve')}
                      >
                        Approve
                      </button>
                      {txn.status === 'ON_HOLD' ? (
                        <button className="btn btn-sm btn-hold" disabled={actingOn === txn._id} onClick={() => act(txn._id, 'unblock')}>
                          Release hold
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-hold" disabled={actingOn === txn._id} onClick={() => act(txn._id, 'hold')}>
                          Hold
                        </button>
                      )}
                      <button className="btn btn-sm btn-block" disabled={actingOn === txn._id} onClick={() => act(txn._id, 'block')}>
                        Block
                      </button>
                      <button className="btn btn-sm btn-block" disabled={actingOn === txn._id} onClick={() => act(txn._id, 'reject')}>
                        Reject
                      </button>
                      <button className="btn btn-sm btn-ghost" disabled={actingOn === txn._id} onClick={() => setEditing(txn)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <TransactionEditModal transaction={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </AdminLayout>
  );
}
