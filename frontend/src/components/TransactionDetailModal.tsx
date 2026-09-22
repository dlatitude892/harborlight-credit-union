import type { Transaction, TransactionParty } from '../types';
import { useAuth } from '../context/AuthContext';
import { downloadTransactionReceipt } from '../utils/receipt';
import { IconClose, IconDownload } from './icons';

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const partyName = (party?: TransactionParty | string) => {
  if (!party) return null;
  return typeof party === 'string' ? party : `${party.firstName} ${party.lastName} (${party.accountNumber})`;
};

const methodLabel = (method: Transaction['method']) => {
  switch (method) {
    case 'BANK_ACCOUNT':
      return 'External bank transfer';
    case 'CASH_APP':
      return 'Cash App';
    case 'ZELLE':
      return 'Zelle';
    case 'VENMO':
      return 'Venmo';
    case 'PAYPAL':
      return 'PayPal';
    default:
      return 'Harborlight member transfer';
  }
};

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const { user } = useAuth();

  const senderId = typeof transaction.senderId === 'string' ? transaction.senderId : transaction.senderId._id;
  const isOutgoing = senderId === user?.id;
  const sender = partyName(transaction.senderId);
  const recipient = partyName(transaction.recipientId);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2>Transaction details</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <div className="txn-detail-amount">
          <div className={`txn-detail-amount-value ${isOutgoing ? 'text-danger' : 'text-positive'}`}>
            {isOutgoing ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </div>
          <span className={`badge ${transaction.status.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-block' }}>
            {transaction.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="review-row">
          <span className="review-row-label">Reference</span>
          <span className="review-row-value mono-figure">{transaction.reference}</span>
        </div>
        <div className="review-row">
          <span className="review-row-label">Date</span>
          <span className="review-row-value">{formatDateTime(transaction.createdAt)}</span>
        </div>
        <div className="review-row">
          <span className="review-row-label">Method</span>
          <span className="review-row-value">{methodLabel(transaction.method)}</span>
        </div>
        <div className="review-row">
          <span className="review-row-label">Category</span>
          <span className="review-row-value">{transaction.category}</span>
        </div>
        {sender && (
          <div className="review-row">
            <span className="review-row-label">From</span>
            <span className="review-row-value">{sender}</span>
          </div>
        )}
        {recipient && (
          <div className="review-row">
            <span className="review-row-label">To</span>
            <span className="review-row-value">{recipient}</span>
          </div>
        )}
        {transaction.description && (
          <div className="review-row">
            <span className="review-row-label">Description</span>
            <span className="review-row-value">{transaction.description}</span>
          </div>
        )}
        {transaction.adminNote && (
          <div className="review-row">
            <span className="review-row-label">Note</span>
            <span className="review-row-value">{transaction.adminNote}</span>
          </div>
        )}

        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => user && downloadTransactionReceipt(transaction, user.accountNumber)}
        >
          <IconDownload style={{ width: 15, height: 15 }} />
          Download receipt
        </button>
      </div>
    </div>
  );
}
