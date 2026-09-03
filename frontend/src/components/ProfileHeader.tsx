import { useAuth } from '../context/AuthContext';

export default function ProfileHeader() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="profile-header">
      <div className="profile-avatar">{initials}</div>
      <div className="profile-header-info">
        <h2>
          {user.firstName} {user.lastName}
        </h2>
        <div className="profile-header-meta">
          <span>{user.email}</span>
          <span>Member #{user.accountNumber}</span>
          {memberSince && <span>Member since {memberSince}</span>}
        </div>
      </div>
    </div>
  );
}
