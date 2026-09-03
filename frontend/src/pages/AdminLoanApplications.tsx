import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { LoanApplication } from '../types';

const loanTypeLabels: Record<string, string> = {
  HOME: 'Home Loan',
  HOME_REFINANCE: 'Mortgage Refinance',
  AUTO: 'Auto Loan',
  PERSONAL: 'Personal Loan',
  BUSINESS: 'Business Lending',
};

const statusOptions: LoanApplication['status'][] = ['NEW', 'IN_REVIEW', 'APPROVED', 'DENIED'];

export default function AdminLoanApplications() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => api.get<LoanApplication[]>('/loan-applications').then(setApplications);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const setStatus = async (id: string, status: LoanApplication['status']) => {
    setUpdating(id);
    try {
      await api.patch(`/loan-applications/${id}/status`, { status });
      await load();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AdminLayout title="Loan applications" subtitle="Home, auto, personal, and business loan requests.">
      {loading ? (
        <div className="empty-state">Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No loan applications yet.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Update status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td className="mono-figure text-secondary">{app.reference}</td>
                  <td>
                    {app.fullName}
                    <div className="txn-meta">{app.email}</div>
                  </td>
                  <td className="text-secondary">{loanTypeLabels[app.loanType]}</td>
                  <td className="amount-cell">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(app.requestedAmount)}
                  </td>
                  <td>
                    <span className={`badge ${app.status === 'APPROVED' ? 'approved' : app.status === 'DENIED' ? 'rejected' : 'pending'}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-secondary">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={app.status}
                      disabled={updating === app._id}
                      onChange={(e) => setStatus(app._id, e.target.value as LoanApplication['status'])}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: 'var(--text-primary)',
                        fontSize: 12.5,
                      }}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
