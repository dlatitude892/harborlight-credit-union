import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { CustomerCareTicket } from '../types';

const statusBadge: Record<CustomerCareTicket['status'], string> = {
  NEW: 'pending',
  IN_PROGRESS: 'pending',
  WAITING_FOR_CUSTOMER: 'pending',
  RESOLVED: 'approved',
  CLOSED: 'approved',
};

export default function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<CustomerCareTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CustomerCareTicket[]>('/customer-care')
      .then(setTickets)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Customer care" subtitle="Support tickets submitted from the homepage.">
      {loading ? (
        <div className="empty-state">Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No support tickets yet.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>From</th>
                <th>Category</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/tickets/${t._id}`)}>
                  <td>{t.subject}</td>
                  <td>
                    {t.name}
                    <div className="txn-meta">{t.email}</div>
                  </td>
                  <td className="text-secondary">{t.category.replace(/_/g, ' ')}</td>
                  <td>
                    <span className={`badge ${statusBadge[t.status]}`}>{t.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="text-secondary">
                    {t.assignedTo && typeof t.assignedTo !== 'string' ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'}
                  </td>
                  <td className="text-secondary">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
