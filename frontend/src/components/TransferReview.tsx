import { useLanguage } from '../context/LanguageContext';

export interface ReviewRow {
  label: string;
  value: string;
}

interface TransferReviewProps {
  amount: number;
  rows: ReviewRow[];
  submitting: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  confirmLabel?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function TransferReview({ amount, rows, submitting, onConfirm, onEdit, confirmLabel }: TransferReviewProps) {
  const { t } = useLanguage();

  return (
    <div className="card review-card" style={{ padding: 26 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>{t('transfer.reviewTitle')}</h2>
      <p className="text-secondary" style={{ fontSize: 12.5, marginBottom: 18 }}>
        {t('transfer.reviewSubtitle')}
      </p>

      <div className="review-amount">
        <div className="review-amount-value">{formatCurrency(amount)}</div>
        <div className="review-amount-label">{t('common.amount')}</div>
      </div>

      {rows.map((row) => (
        <div className="review-row" key={row.label}>
          <span className="review-row-label">{row.label}</span>
          <span className="review-row-value">{row.value}</span>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onEdit} disabled={submitting}>
          {t('common.edit')}
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onConfirm} disabled={submitting}>
          {submitting ? '…' : confirmLabel || t('common.confirm')}
        </button>
      </div>
    </div>
  );
}
