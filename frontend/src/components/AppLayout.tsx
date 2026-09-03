import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setMenuOpen(true)} />
        {children}
      </main>
    </div>
  );
}
