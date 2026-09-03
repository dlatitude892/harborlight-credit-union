import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { AuditLogEntry } from '../types';

const actionLabels: Record<string, string> = {
  CREDIT_ACCOUNT: 'Credited account',
  APPROVE_TRANSACTION: 'Approved transaction',
  BLOCK_TRANSACTION: 'Blocked transaction',
  REJECT_TRANSACTION: 'Rejected transaction',
  HOLD_TRANSACTION: 'Held transaction',
  UNBLOCK_TRANSACTION: 'Unblocked transaction',
  UPDATE_USER_STATUS: 'Updated account status',
};

const adminName = (entry: AuditLogEntry) =>
  typeof entry.userId === 'string' ? entry.userId : `${entry.userId.firstName} ${entry.userId.lastName}`;

const describeDetails = (entry: AuditLogEntry) => {
  const d = entry.details || {};
  switch (entry.action) {
    case 'CREDIT_ACCOUNT':
      return `${d.targetEmail} · $${d.amount}`;
    case 'UPDATE_USER_STATUS':
      return `${d.targetEmail} · ${d.from} → ${d.to}`;
    case 'APPROVE_TRANSACTION':
    case 'BLOCK_TRANSACTION':
    case 'REJECT_TRANSACTION':
    case 'HOLD_TRANSACTION':
    case 'UNBLOCK_TRANSACTION':
      return `${d.reference}`;
    default:
      return JSON.stringify(d);
  }
};

export default function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AuditLogEntry[]>('/admin/audit-log')
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Audit log" subtitle="Every administrative action, who performed it, and when.">
      {loading ? (
        <div className="empty-state">Loading audit log…</div>
      ) : entries.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No administrative actions recorded yet.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Details</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{adminName(entry)}</td>
                  <td>{actionLabels[entry.action] || entry.action}</td>
                  <td className="text-secondary">{describeDetails(entry)}</td>
                  <td className="text-secondary">{new Date(entry.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
