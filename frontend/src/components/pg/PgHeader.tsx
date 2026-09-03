import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { IconMenu, IconClose } from '../icons';

const navItems = [
  { label: 'Personal Banking', href: '#banking' },
  { label: 'Loans', href: '#home-loans' },
  { label: 'Mortgages', href: '#home-loans' },
  { label: 'Business Banking', href: '#business-lending' },
  { label: 'About Us', href: '#about' },
  { label: 'Contact', href: '#customer-care' },
];

export default function PgHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`pg-header${scrolled ? ' scrolled' : ''}`}>
      <div className="pg-container pg-header-inner">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="pg-nav-links">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="pg-header-actions">
          {user ? (
            <Link to="/dashboard" className="pg-btn pg-btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="pg-btn pg-btn-ghost">
                Login
              </Link>
              <Link to="/register" className="pg-btn pg-btn-primary">
                Open an Account
              </Link>
            </>
          )}
        </div>

        <button className="pg-mobile-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <div className="pg-container pg-mobile-panel">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <div className="pg-mobile-actions">
            {user ? (
              <Link to="/dashboard" className="pg-btn pg-btn-primary" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="pg-btn pg-btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="pg-btn pg-btn-primary" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                  Open an Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
