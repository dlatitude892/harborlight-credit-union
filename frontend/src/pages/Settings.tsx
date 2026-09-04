import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <AppLayout title="Settings" subtitle="Your profile and account preferences.">
      <div className="card" style={{ padding: 24, maxWidth: 460 }}>
        <div className="field">
          <label>Full name</label>
          <input value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`} disabled />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={user?.email ?? ''} disabled />
        </div>
        <div className="field">
          <label>Member number</label>
          <input value={user?.accountNumber ?? ''} disabled className="mono-figure" />
        </div>
        <p className="text-secondary" style={{ fontSize: 12.5, marginTop: 4 }}>
          Profile editing is coming soon. Contact support to update your details in the meantime.
        </p>
      </div>
    </AppLayout>
  );
}
