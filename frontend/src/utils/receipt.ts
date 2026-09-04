import { jsPDF } from 'jspdf';
import type { Transaction, TransactionParty } from '../types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const partyName = (party?: TransactionParty | string) => {
  if (!party) return '—';
  if (typeof party === 'string') return party;
  return `${party.firstName} ${party.lastName} (${party.accountNumber})`;
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

export function downloadTransactionReceipt(transaction: Transaction, currentUserAccountNumber: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const green: [number, number, number] = [31, 122, 77];
  const darkGreen: [number, number, number] = [20, 81, 47];
  const gray: [number, number, number] = [90, 105, 98];
  const margin = 48;
  let y = 60;

  // Header band
  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, 595, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Harborlight Credit Union', margin, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Transaction Receipt', margin, 60);

  y = 130;
  doc.setTextColor(...gray);
  doc.setFontSize(10);
  doc.text('REFERENCE', margin, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(transaction.reference, margin, y + 18);

  doc.setTextColor(...gray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('DATE', 340, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(new Date(transaction.createdAt).toLocaleString(), 340, y + 18);

  y += 50;
  doc.setDrawColor(220, 230, 225);
  doc.line(margin, y, 547, y);
  y += 30;

  doc.setTextColor(...green);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(formatCurrency(transaction.amount), margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const statusText = transaction.status.replace(/_/g, ' ');
  doc.text(`Status: ${statusText}`, 400, y);

  y += 40;

  const row = (label: string, value: string) => {
    doc.setTextColor(...gray);
    doc.setFontSize(10);
    doc.text(label, margin, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(value, 220, y, { maxWidth: 327 });
    y += 26;
  };

  row('Description', transaction.description || '—');
  row('Category', transaction.category);
  row('Method', methodLabel(transaction.method));
  row('Type', transaction.transactionType);

  const senderAccountNum = typeof transaction.senderId === 'string' ? transaction.senderId : transaction.senderId.accountNumber;
  const isOutgoing = senderAccountNum === currentUserAccountNumber;

  row('From', partyName(transaction.senderId));
  if (transaction.method === 'MEMBER') {
    row('To', partyName(transaction.recipientId));
  }
  row('Direction', isOutgoing ? 'Debit (money out)' : 'Credit (money in)');

  y += 20;
  doc.setDrawColor(220, 230, 225);
  doc.line(margin, y, 547, y);
  y += 26;

  doc.setTextColor(...gray);
  doc.setFontSize(9);
  doc.text(
    'This receipt is a record of a transaction on your Harborlight Credit Union account. Harborlight Credit Union is',
    margin,
    y
  );
  y += 13;
  doc.text('federally insured by the NCUA.', margin, y);

  doc.save(`harborlight-receipt-${transaction.reference}.pdf`);
}
