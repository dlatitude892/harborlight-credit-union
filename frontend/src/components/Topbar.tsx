import { IconMenu } from './icons';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <IconMenu />
        </button>
        <div className="page-heading">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
