import { useNavigate } from 'react-router-dom';
import { IconSend, IconBill, IconWallet, IconCard } from './icons';

const actions = [
  { title: 'Send money', icon: IconSend, to: '/transfer' },
  { title: 'Pay bills', icon: IconBill, to: '/bills' },
  { title: 'Open a share', icon: IconWallet, to: '/savings' },
  { title: 'Manage cards', icon: IconCard, to: '/cards' },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      {actions.map(({ title, icon: Icon, to }) => (
        <div className="card action-card" key={title} onClick={() => navigate(to)}>
          <span className="stat-icon">
            <Icon />
          </span>
          <span className="action-title">{title}</span>
        </div>
      ))}
    </div>
  );
}
