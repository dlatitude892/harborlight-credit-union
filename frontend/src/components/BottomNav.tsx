import { NavLink } from 'react-router-dom';
import { IconHome, IconSwap, IconDeposit, IconCard, IconUser } from './icons';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: IconHome, end: true },
  { to: '/transfer', label: 'Transfer', icon: IconSwap },
  { to: '/deposit', label: 'Deposit', icon: IconDeposit },
  { to: '/cards', label: 'Card', icon: IconCard },
  { to: '/settings', label: 'Me', icon: IconUser },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
