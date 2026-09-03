import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../api/client';
import type { AccountApplication } from '../types';

const statusOptions: AccountApplication['status'][] = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_ADDITIONAL_INFO'];

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<AccountApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => api.get<AccountApplication>(`/admin/applications/${id}`).then(setApp);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  const setStatus = async (status: AccountApplication['status']) => {
    setUpdating(true);
    try {
      await api.patch(`/admin/applications/${id}/status`, { status });
      await load();
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !app) {
    return (
      <AdminLayout title="Application">
        <div className="empty-state">Loading application…</div>
      </AdminLayout>
    );
  }

  const applicant = typeof app.userId === 'string' ? null : app.userId;

  return (
    <AdminLayout title={applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Application'} subtitle={applicant?.email}>
      <Link to="/admin/applications" className="link-accent" style={{ display: 'inline-block', marginBottom: 18, fontSize: 13 }}>
        ← Back to applications
      </Link>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {statusOptions.map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${s === app.status ? 'btn-approve' : s === 'REJECTED' ? 'btn-block' : 'btn-ghost'}`}
            disabled={updating}
            onClick={() => setStatus(s)}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          Address
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
            <span className="text-secondary">Residential address</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>
              {app.address}, {app.city}, {app.state} {app.zip}, {app.country}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span className="text-secondary">Date of birth</span>
            <span style={{ fontWeight: 600 }}>{app.dateOfBirth}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          Identity &amp; compliance
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
            <span className="text-secondary">SSN</span>
            <span className="mono-figure" style={{ fontWeight: 600 }}>••{app.ssnLast4}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span className="text-secondary">ID</span>
            <span className="mono-figure" style={{ fontWeight: 600 }}>
              {app.idType} ••{app.idNumberLast4}
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          Employment
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
            <span className="text-secondary">Employment status</span>
            <span style={{ fontWeight: 600 }}>{app.employmentStatus}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
            <span className="text-secondary">Occupation</span>
            <span style={{ fontWeight: 600 }}>{app.occupation || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
            <span className="text-secondary">Source of income</span>
            <span style={{ fontWeight: 600 }}>{app.sourceOfIncome || '—'}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
