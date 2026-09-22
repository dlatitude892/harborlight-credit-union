import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { AccountRequest } from '../types';
import { IconClose } from '../components/icons';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const memberLabel = (userId: AccountRequest['userId']) =>
  typeof userId === 'string' ? userId : `${userId.firstName} ${userId.lastName} (${userId.accountNumber})`;

export default function AdminAccountRequests() {
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'KYC' | 'LIMIT_UPGRADE'>('ALL');
  const [viewing, setViewing] = useState<AccountRequest | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = () => {
    const params = new URLSearchParams({ status: 'PENDING' });
    if (typeFilter !== 'ALL') params.set('type', typeFilter);
    return api.get<AccountRequest[]>(`/account-requests/admin/list?${params.toString()}`).then(setRequests);
  };

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load requests'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const openDetail = async (request: AccountRequest) => {
    setError(null);
    try {
      const full = await api.get<AccountRequest>(`/account-requests/admin/${request._id}`);
      setViewing(full);
      setRejectNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load request');
    }
  };

  const approve = async (id: string) => {
    setActingOn(id);
    setError(null);
    try {
      await api.post(`/account-requests/admin/${id}/approve`, {});
      setViewing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve request');
    } finally {
      setActingOn(null);
    }
  };

  const reject = async (id: string) => {
    setActingOn(id);
    setError(null);
    try {
      await api.post(`/account-requests/admin/${id}/reject`, { adminNote: rejectNote });
      setViewing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject request');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <AdminLayout title="Account requests" subtitle="KYC verification and transaction limit upgrade requests awaiting review.">
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {(['ALL', 'KYC', 'LIMIT_UPGRADE'] as const).map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTypeFilter(t)}
          >
            {t === 'ALL' ? 'All' : t === 'KYC' ? 'KYC verification' : 'Limit upgrades'}
          </button>
        ))}
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading requests…</div>
      ) : requests.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">Nothing pending right now.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Member</th>
                <th>Details</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <span className={`badge ${r.type === 'KYC' ? 'pending' : 'approved'}`}>
                      {r.type === 'KYC' ? 'KYC' : 'Limit upgrade'}
                    </span>
                  </td>
                  <td>{memberLabel(r.userId)}</td>
                  <td className="text-secondary">
                    {r.type === 'KYC' ? `${r.idType} ending ${r.idNumberLast4}` : `Requesting ${formatCurrency(r.requestedLimit || 0)}`}
                  </td>
                  <td className="text-secondary">{formatDate(r.createdAt)}</td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => openDetail(r)}>
                      Review
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
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2>{viewing.type === 'KYC' ? 'KYC verification' : 'Limit upgrade request'}</h2>
              <button className="icon-btn" onClick={() => setViewing(null)} aria-label="Close">
                <IconClose />
              </button>
            </div>
            <p className="modal-sub">{memberLabel(viewing.userId)}</p>

            {viewing.type === 'KYC' ? (
              <>
                <div className="review-row">
                  <span className="review-row-label">ID type</span>
                  <span className="review-row-value">{viewing.idType}</span>
                </div>
                <div className="review-row">
                  <span className="review-row-label">ID number</span>
                  <span className="review-row-value">ending {viewing.idNumberLast4}</span>
                </div>
                {viewing.idImageUrl && (
                  <img
                    src={viewing.idImageUrl}
                    alt="ID document"
                    style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', margin: '14px 0' }}
                  />
                )}
              </>
            ) : (
              <>
                <div className="review-row">
                  <span className="review-row-label">Current limit</span>
                  <span className="review-row-value">
                    {typeof viewing.userId !== 'string' && formatCurrency(viewing.userId.transactionLimit)}
                  </span>
                </div>
                <div className="review-row">
                  <span className="review-row-label">Requested limit</span>
                  <span className="review-row-value">{formatCurrency(viewing.requestedLimit || 0)}</span>
                </div>
                {viewing.reason && (
                  <div className="review-row">
                    <span className="review-row-label">Reason</span>
                    <span className="review-row-value">{viewing.reason}</span>
                  </div>
                )}
              </>
            )}

            {viewing.status === 'PENDING' ? (
              <>
                <div className="field" style={{ marginTop: 14 }}>
                  <label htmlFor="rejectNote">Note (optional)</label>
                  <input id="rejectNote" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
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
                    Approve
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
