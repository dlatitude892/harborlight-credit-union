import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  changePct?: number;
  icon: ReactNode;
  iconClass: string;
  changeLabel?: string;
  format?: 'currency' | 'number';
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function StatCard({ label, value, changePct, icon, iconClass, changeLabel, format = 'currency' }: StatCardProps) {
  const positive = (changePct ?? 0) >= 0;
  const displayValue = format === 'currency' ? formatCurrency(value) : value.toLocaleString();

  return (
    <div className="card stat-card">
      <div className="eyebrow">
        <span>{label}</span>
        <span className={`stat-icon ${iconClass}`}>{icon}</span>
      </div>
      <div className="stat-value mono-figure">{displayValue}</div>
      {changePct !== undefined && (
        <div className="stat-change">
          <span className={positive ? 'text-positive' : 'text-danger'}>
            {positive ? '+' : ''}
            {changePct.toFixed(1)}%
          </span>{' '}
          {changeLabel || 'from last month'}
        </div>
      )}
    </div>
  );
}
