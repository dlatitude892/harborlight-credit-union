import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import TransactionEditModal from '../components/TransactionEditModal';
import { api } from '../api/client';
import type { AdminUser, Transaction, TransactionParty, SavingsAccount } from '../types';

interface UserDetailResponse {
  user: AdminUser;
  transactions: Transaction[];
  savingsAccount: SavingsAccount | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const partyLabel = (party?: TransactionParty | string) => {
  if (!party) return '—';
  if (typeof party === 'string') return party;
  return `${party.firstName} ${party.lastName}`;
};

const authorLabel = (author: { firstName: string; lastName: string; email: string } | string) =>
  typeof author === 'string' ? author : `${author.firstName} ${author.lastName}`;

const statusOptions: AdminUser['accountStatus'][] = ['ACTIVE', 'UNDER_REVIEW', 'RESTRICTED', 'FROZEN', 'CLOSED'];
const statusBadgeClass = (status: AdminUser['accountStatus']) =>
  status === 'ACTIVE' ? 'approved' : status === 'UNDER_REVIEW' ? 'pending' : 'rejected';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [noticeDraft, setNoticeDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [memberSinceDraft, setMemberSinceDraft] = useState('');
  const [savingDate, setSavingDate] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  const load = () =>
    api.get<UserDetailResponse>(`/admin/users/${id}`).then((res) => {
      setData(res);
      setNoticeDraft(res.user.customerNotice || '');
      setMemberSinceDraft(new Date(res.user.createdAt).toISOString().slice(0, 10));
    });

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load member'))
      .finally(() => setLoading(false));
  }, [id]);

  const setStatus = async (accountStatus: AdminUser['accountStatus']) => {
    if (!id) return;
    setUpdating(true);
    setError(null);
    try {
      await api.patch(`/admin/users/${id}/status`, { accountStatus });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status');
    } finally {
      setUpdating(false);
    }
  };

  const saveNotice = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !data) return;
    setUpdating(true);
    try {
      await api.patch(`/admin/users/${id}/status`, { accountStatus: data.user.accountStatus, customerNotice: noticeDraft });
      await load();
    } finally {
      setUpdating(false);
    }
  };

  const saveMemberSince = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingDate(true);
    try {
      await api.patch(`/admin/users/${id}/created-at`, { createdAt: new Date(memberSinceDraft).toISOString() });
      await load();
    } finally {
      setSavingDate(false);
    }
  };

  const addNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !noteDraft.trim()) return;
    setSavingNote(true);
    try {
      await api.post(`/admin/users/${id}/notes`, { message: noteDraft });
      setNoteDraft('');
      await load();
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Member profile">
        <div className="empty-state">Loading member…</div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout title="Member profile">
        {error && <div className="form-error">{error}</div>}
      </AdminLayout>
    );
  }

  const { user, transactions, savingsAccount } = data;

  return (
    <AdminLayout title={`${user.firstName} ${user.lastName}`} subtitle={user.email}>
      <Link to="/admin/users" className="link-accent" style={{ display: 'inline-block', marginBottom: 18, fontSize: 13 }}>
        ← Back to members
      </Link>

      {error && <div className="form-error">{error}</div>}

      <div className={`admin-summary-grid${savingsAccount ? ' cols-4' : ''}`}>
        <div className="card stat-card">
          <div className="eyebrow">
            <span>Checking balance</span>
          </div>
          <div className="stat-value mono-figure">{formatCurrency(user.balance)}</div>
        </div>
        {savingsAccount && (
          <div className="card stat-card">
            <div className="eyebrow">
              <span>Savings balance</span>
            </div>
            <div className="stat-value mono-figure">{formatCurrency(savingsAccount.balance)}</div>
          </div>
        )}
        <div className="card stat-card">
          <div className="eyebrow">
            <span>Account number</span>
          </div>
          <div className="stat-value mono-figure" style={{ fontSize: 17 }}>
            {user.accountNumber}
          </div>
        </div>
        <div className="card stat-card">
          <div className="eyebrow">
            <span>Member since</span>
          </div>
          <div className="stat-value" style={{ fontSize: 17 }}>
            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Backdate account creation</h2>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 20, maxWidth: 380 }}>
        <form onSubmit={saveMemberSince} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="field" style={{ marginBottom: 0, flex: 1 }}>
            <label htmlFor="memberSince">Account created on</label>
            <input id="memberSince" type="date" required value={memberSinceDraft} onChange={(e) => setMemberSinceDraft(e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm" type="submit" disabled={savingDate}>
            {savingDate ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>

      <div className="section-header">
        <h2 className="section-title">Account status</h2>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
          <span className={`badge ${statusBadgeClass(user.accountStatus)}`}>Current: {user.accountStatus.replace('_', ' ')}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statusOptions
              .filter((s) => s !== user.accountStatus)
              .map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${s === 'ACTIVE' ? 'btn-approve' : s === 'UNDER_REVIEW' ? 'btn-hold' : 'btn-block'}`}
                  disabled={updating}
                  onClick={() => setStatus(s)}
                >
                  Set {s.replace('_', ' ')}
                </button>
              ))}
          </div>
        </div>

        <form onSubmit={saveNotice}>
          <div className="field">
            <label htmlFor="notice">Customer-facing notice</label>
            <textarea
              id="notice"
              rows={2}
              value={noticeDraft}
              onChange={(e) => setNoticeDraft(e.target.value)}
              placeholder="Shown on the member's dashboard when their account isn't Active - leave blank to use the default message."
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: 13.5,
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button className="btn btn-ghost btn-sm" type="submit" disabled={updating}>
            Save notice
          </button>
        </form>
      </div>

      <div className="section-header">
        <h2 className="section-title">Internal notes</h2>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 28 }}>
        <p className="text-secondary" style={{ fontSize: 12, marginBottom: 14 }}>
          Visible only to administrators - never shown to the customer.
        </p>
        {user.adminNotes.length === 0 ? (
          <div className="empty-state" style={{ padding: '10px 0' }}>
            No internal notes yet.
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {user.adminNotes.map((note, i) => (
              <div key={i} style={{ padding: '12px 0', borderTop: i > 0 ? '1px solid var(--border-soft)' : 'none' }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  {authorLabel(note.authorId)} · {new Date(note.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: 13.5 }}>{note.message}</div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={addNote}>
          <div className="field">
            <label htmlFor="note">Add an internal note</label>
            <textarea
              id="note"
              rows={2}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: 13.5,
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: 'auto' }} disabled={savingNote}>
            {savingNote ? 'Saving…' : 'Add note'}
          </button>
        </form>
      </div>

      <div className="section-header">
        <h2 className="section-title">Transaction history</h2>
      </div>
      {transactions.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No transactions yet.</div>
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
                <th>Date</th>
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
                  <td className="text-secondary">{new Date(txn.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditingTxn(txn)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingTxn && <TransactionEditModal transaction={editingTxn} onClose={() => setEditingTxn(null)} onSaved={load} />}
    </AdminLayout>
  );
}
