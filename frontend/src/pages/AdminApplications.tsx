import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { AccountApplication } from '../types';

const statusBadge: Record<AccountApplication['status'], string> = {
  SUBMITTED: 'pending',
  UNDER_REVIEW: 'pending',
  REQUIRES_ADDITIONAL_INFO: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const applicantLabel = (app: AccountApplication) => {
  if (typeof app.userId === 'string') return app.userId;
  return `${app.userId.firstName} ${app.userId.lastName}`;
};

const applicantEmail = (app: AccountApplication) => (typeof app.userId === 'string' ? '' : app.userId.email);

export default function AdminApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AccountApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AccountApplication[]>('/admin/applications')
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Account applications" subtitle="New-member compliance review queue.">
      {loading ? (
        <div className="empty-state">Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No account applications yet.</div>
        </div>
      ) : (
        <div className="card table-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Email</th>
                <th>Employment</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/applications/${app._id}`)}>
                  <td>{applicantLabel(app)}</td>
                  <td className="text-secondary">{applicantEmail(app)}</td>
                  <td className="text-secondary">{app.employmentStatus}</td>
                  <td>
                    <span className={`badge ${statusBadge[app.status]}`}>{app.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="text-secondary">{new Date(app.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
