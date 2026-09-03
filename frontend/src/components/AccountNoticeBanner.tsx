import { useAuth } from '../context/AuthContext';

const statusLabels: Record<string, string> = {
  UNDER_REVIEW: 'Account under review',
  RESTRICTED: 'Account restricted',
  FROZEN: 'Account frozen',
  CLOSED: 'Account closed',
};

const defaultMessages: Record<string, string> = {
  UNDER_REVIEW: 'Some account functions may be temporarily unavailable while we complete a review.',
  RESTRICTED: 'Some account functions are currently restricted.',
  FROZEN: 'Transfers and payments are currently unavailable on this account.',
  CLOSED: 'This account has been closed.',
};

export default function AccountNoticeBanner() {
  const { user } = useAuth();
  if (!user || user.accountStatus === 'ACTIVE') return null;

  return (
    <div className={`notice-banner ${user.accountStatus.toLowerCase()}`}>
      <div>
        <strong>{statusLabels[user.accountStatus]}</strong>
        {user.customerNotice || defaultMessages[user.accountStatus]} Please contact customer care if you need
        assistance.
      </div>
    </div>
  );
}
