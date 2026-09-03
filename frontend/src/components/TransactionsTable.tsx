import type { Transaction, TransactionParty } from '../types';
import { useAuth } from '../context/AuthContext';
import { downloadTransactionReceipt } from '../utils/receipt';
import { IconDownload } from './icons';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const partyName = (party: TransactionParty | string) =>
  typeof party === 'string' ? party : `${party.firstName} ${party.lastName}`;

const methodLabel = (method: Transaction['method']) => {
  switch (method) {
    case 'BANK_ACCOUNT':
      return 'External bank';
    case 'CASH_APP':
      return 'Cash App';
    case 'ZELLE':
      return 'Zelle';
    case 'VENMO':
      return 'Venmo';
    case 'PAYPAL':
      return 'PayPal';
    default:
      return null;
  }
};

const describe = (txn: Transaction, isOutgoing: boolean) =>
  txn.description ||
  (isOutgoing
    ? txn.method === 'MEMBER' && txn.recipientId
      ? `To ${partyName(txn.recipientId)}`
      : `To ${methodLabel(txn.method) || 'external account'}`
    : txn.senderId
    ? `From ${partyName(txn.senderId)}`
    : 'Deposit');

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const { user } = useAuth();

  if (transactions.length === 0) {
    return (
      <div className="card table-card">
        <div className="empty-state">No transactions yet. Once you send or receive money, it'll show up here.</div>
      </div>
    );
  }

  return (
    <div className="card table-card">
      {/* Desktop table - hidden below 860px */}
      <table className="member-txn-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const senderId = typeof txn.senderId === 'string' ? txn.senderId : txn.senderId._id;
            const isOutgoing = senderId === user?.id;
            return (
              <tr key={txn._id}>
                <td>
                  <div className="txn-desc">{describe(txn, isOutgoing)}</div>
                  <div className="txn-meta">{txn.reference}</div>
                </td>
                <td className="text-secondary">{txn.category}</td>
                <td className="text-secondary">{formatDate(txn.createdAt)}</td>
                <td className={`amount-cell ${isOutgoing ? 'text-danger' : 'text-positive'}`}>
                  {isOutgoing ? '-' : '+'}
                  {formatCurrency(txn.amount)}
                </td>
                <td>
                  <span className={`badge ${txn.status.toLowerCase()}`}>{txn.status.replace('_', ' ')}</span>
                </td>
                <td>
                  <button
                    className="icon-btn"
                    aria-label="Download receipt"
                    onClick={() => user && downloadTransactionReceipt(txn, user.accountNumber)}
                  >
                    <IconDownload />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile card list - hidden at 860px and above. Plain flexbox, no grid-area
         tricks, so every row lines up predictably. */}
      <div className="txn-mobile-list">
        {transactions.map((txn) => {
          const senderId = typeof txn.senderId === 'string' ? txn.senderId : txn.senderId._id;
          const isOutgoing = senderId === user?.id;
          return (
            <div className="txn-mobile-card" key={txn._id}>
              <div className="txn-mobile-top">
                <div className="txn-mobile-title">
                  <div className="txn-desc">{describe(txn, isOutgoing)}</div>
                  <div className="txn-meta">{txn.reference}</div>
                </div>
                <div className={`amount-cell ${isOutgoing ? 'text-danger' : 'text-positive'}`}>
                  {isOutgoing ? '-' : '+'}
                  {formatCurrency(txn.amount)}
                </div>
              </div>
              <div className="txn-mobile-bottom">
                <div className="txn-mobile-meta-row">
                  <span className="text-secondary">{formatDate(txn.createdAt)}</span>
                  <span className={`badge ${txn.status.toLowerCase()}`}>{txn.status.replace('_', ' ')}</span>
                </div>
                <button
                  className="icon-btn"
                  aria-label="Download receipt"
                  onClick={() => user && downloadTransactionReceipt(txn, user.accountNumber)}
                >
                  <IconDownload />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
