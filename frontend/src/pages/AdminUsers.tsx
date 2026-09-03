import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { AdminUser } from '../types';

interface UsersResponse {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .get<UsersResponse>(`/admin/users?q=${encodeURIComponent(query)}`)
        .then((res) => !cancelled && setUsers(res.users))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <AdminLayout title="Members" subtitle="Newly registered members and account search.">
      <div className="field" style={{ maxWidth: 380, marginBottom: 20 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or account number"
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading members…</div>
      ) : users.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No members match that search.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Account #</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${u._id}`)}>
                  <td>
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="text-secondary">{u.email}</td>
                  <td className="mono-figure text-secondary">{u.accountNumber}</td>
                  <td className="amount-cell">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(u.balance)}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.accountStatus === 'ACTIVE' ? 'approved' : u.accountStatus === 'UNDER_REVIEW' ? 'pending' : 'rejected'
                      }`}
                    >
                      {u.accountStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
