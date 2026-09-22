import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  IconDeposit,
  IconTrendingUp,
} from './icons';
import { IconPiggyBank } from './marketing-icons';

const links = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: IconHome, end: true },
  { to: '/checking', labelKey: 'nav.checking', icon: IconWallet },
  { to: '/savings', labelKey: 'nav.savings', icon: IconPiggyBank },
  { to: '/transfer', labelKey: 'nav.transfers', icon: IconSwap },
  { to: '/deposit', labelKey: 'nav.deposit', icon: IconDeposit },
  { to: '/bills', labelKey: 'nav.bills', icon: IconBill },
  { to: '/loans', labelKey: 'nav.loans', icon: IconTrendingUp },
  { to: '/cards', labelKey: 'nav.cards', icon: IconCard },
  { to: '/transactions', labelKey: 'nav.transactions', icon: IconHistory },
];

const secondaryLinks = [
  { to: '/settings', labelKey: 'nav.settings', icon: IconSettings },
  { to: '/support', labelKey: 'nav.support', icon: IconSupport },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

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

      <div className="nav-section-label">{t('nav.banking')}</div>
      <ul className="nav-list">
        {links.map(({ to, labelKey, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <Icon />
              <span>{t(labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-section-label">{t('nav.member')}</div>
      <ul className="nav-list">
        {secondaryLinks.map(({ to, labelKey, icon: Icon }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <Icon />
              <span>{t(labelKey)}</span>
            </NavLink>
          </li>
        ))}
        {user?.role === 'ADMIN' && (
          <li>
            <NavLink to="/admin" className="nav-link" onClick={onClose}>
              <IconSettings />
              <span>{t('nav.adminPortal')}</span>
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
          {t('nav.signOut')}
        </button>
      </div>
    </aside>
  );
}
