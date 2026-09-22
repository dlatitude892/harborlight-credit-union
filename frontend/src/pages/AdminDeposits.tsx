import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { CheckDeposit } from '../types';
import { IconClose } from '../components/icons';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const depositorLabel = (userId: CheckDeposit['userId']) =>
  typeof userId === 'string' ? userId : `${userId.firstName} ${userId.lastName} (${userId.accountNumber})`;

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<CheckDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const [viewing, setViewing] = useState<CheckDeposit | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = (status: 'PENDING' | 'ALL') =>
    api.get<CheckDeposit[]>(`/deposits/admin/list?status=${status}`).then(setDeposits);

  useEffect(() => {
    setLoading(true);
    load(filter)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load deposits'))
      .finally(() => setLoading(false));
  }, [filter]);

  const openDetail = async (deposit: CheckDeposit) => {
    setError(null);
    try {
      const full = await api.get<CheckDeposit>(`/deposits/admin/${deposit._id}`);
      setViewing(full);
      setRejectNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load deposit');
    }
  };

  const approve = async (id: string) => {
    setActingOn(id);
    setError(null);
    try {
      await api.post(`/deposits/admin/${id}/approve`, {});
      setViewing(null);
      await load(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve deposit');
    } finally {
      setActingOn(null);
    }
  };

  const reject = async (id: string) => {
    if (!rejectNote.trim()) {
      setError('Please explain why this deposit is being rejected');
      return;
    }
    setActingOn(id);
    setError(null);
    try {
      await api.post(`/deposits/admin/${id}/reject`, { adminNote: rejectNote });
      setViewing(null);
      await load(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject deposit');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <AdminLayout title="Check deposits" subtitle="Review submitted checks before funds are added to a member's account.">
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button className={`btn btn-sm ${filter === 'PENDING' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('PENDING')}>
          Pending
        </button>
        <button className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('ALL')}>
          All
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading deposits…</div>
      ) : deposits.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">Nothing here right now.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d._id}>
                  <td className="mono-figure text-secondary">{d.reference}</td>
                  <td>{depositorLabel(d.userId)}</td>
                  <td className="amount-cell">{formatCurrency(d.amount)}</td>
                  <td className="text-secondary">{formatDate(d.createdAt)}</td>
                  <td>
                    <span className={`badge ${d.status.toLowerCase()}`}>{d.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => openDetail(d)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2>Deposit {viewing.reference}</h2>
              <button className="icon-btn" onClick={() => setViewing(null)} aria-label="Close">
                <IconClose />
              </button>
            </div>
            <p className="modal-sub">
              {depositorLabel(viewing.userId)} · {formatCurrency(viewing.amount)}
            </p>

            {viewing.imageUrl && (
              <img
                src={viewing.imageUrl}
                alt="Check"
                style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}
              />
            )}

            {viewing.status === 'PENDING' ? (
              <>
                <div className="field">
                  <label htmlFor="rejectNote">Note (required if rejecting)</label>
                  <input
                    id="rejectNote"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="e.g. Amount doesn't match the check"
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-block"
                    style={{ flex: 1 }}
                    disabled={actingOn === viewing._id}
                    onClick={() => reject(viewing._id)}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-approve"
                    style={{ flex: 1 }}
                    disabled={actingOn === viewing._id}
                    onClick={() => approve(viewing._id)}
                  >
                    Approve &amp; credit account
                  </button>
                </div>
              </>
            ) : (
              <div className={`form-${viewing.status === 'APPROVED' ? 'success' : 'error'}`}>
                {viewing.status} {viewing.adminNote && `- ${viewing.adminNote}`}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
