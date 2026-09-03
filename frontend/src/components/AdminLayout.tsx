import { useState, type ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconAnchorMark, IconMenu, IconClose } from './icons';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Members' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/transactions', label: 'Pending transactions' },
  { to: '/admin/loan-applications', label: 'Loan applications' },
  { to: '/admin/tickets', label: 'Customer care' },
  { to: '/admin/chat', label: 'Live chat' },
  { to: '/admin/flagged', label: 'Flagged activity' },
  { to: '/admin/audit-log', label: 'Audit log' },
];

export default function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link to="/admin" className="pub-brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">
              <IconAnchorMark />
            </span>
            <span>
              <span className="pub-brand-name">Harborlight</span>
              <span className="pub-brand-sub">Admin portal</span>
            </span>
          </Link>

          <nav className="admin-nav-links">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="admin-topbar-actions">
            <Link to="/dashboard" className="link-accent" style={{ fontSize: 13 }}>
              Member view
            </Link>
            <span className="text-secondary" style={{ fontSize: 13 }}>
              {user?.firstName} {user?.lastName}
            </span>
            <button className="logout-btn" style={{ marginTop: 0, width: 'auto' }} onClick={logout}>
              Sign out
            </button>
          </div>

          <button className="admin-mobile-toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {menuOpen && (
          <div className="admin-mobile-panel">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="admin-mobile-panel-footer">
              <Link to="/dashboard" className="link-accent" style={{ fontSize: 13 }} onClick={() => setMenuOpen(false)}>
                Member view
              </Link>
              <button className="logout-btn" style={{ marginTop: 0 }} onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="admin-main">
        <div className="page-heading" style={{ marginBottom: 26 }}>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
