import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconHome,
  IconWallet,
  IconSwap,
  IconBill,
  IconCard,
  IconHistory,
  IconSettings,
  IconSupport,
  IconAnchorMark,
  IconClose,
} from './icons';
import { IconPiggyBank } from './marketing-icons';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: IconHome, end: true },
  { to: '/checking', label: 'Checking', icon: IconWallet },
  { to: '/savings', label: 'Savings', icon: IconPiggyBank },
  { to: '/transfer', label: 'Transfers', icon: IconSwap },
  { to: '/bills', label: 'Pay Bills / P2P', icon: IconBill },
  { to: '/cards', label: 'Cards', icon: IconCard },
  { to: '/transactions', label: 'Transactions', icon: IconHistory },
];

const secondaryLinks = [
  { to: '/settings', label: 'Settings', icon: IconSettings },
  { to: '/support', label: 'Support', icon: IconSupport },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : '';

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/" className="brand-link">
          <div className="brand-mark">
            <IconAnchorMark />
          </div>
          <div>
            <div className="brand-name">Harborlight</div>
            <div className="brand-sub">Credit Union</div>
          </div>
        </Link>
        <button
          className="mobile-menu-btn"
          style={{ marginLeft: 'auto', display: open ? 'flex' : 'none' }}
          onClick={onClose}
          aria-label="Close menu"
        >
          <IconClose />
        </button>
      </div>

      <div className="nav-section-label">Banking</div>
      <ul className="nav-list">
        {links.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-section-label">Member</div>
      <ul className="nav-list">
        {secondaryLinks.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
        {user?.role === 'ADMIN' && (
          <li>
            <NavLink to="/admin" className="nav-link" onClick={onClose}>
              <IconSettings />
              <span>Admin portal</span>
            </NavLink>
          </li>
        )}
      </ul>

      <div className="sidebar-footer">
        <div className="member-chip">
          <div className="avatar">{initials}</div>
          <div>
            <div className="member-name">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="member-acct">{user?.accountNumber}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
