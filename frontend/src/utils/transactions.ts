import type { Transaction } from '../types';

/**
 * Whether a transaction is money *leaving* this member's account.
 *
 * Deposits (admin credits, check deposits) only ever add money, so they're
 * never outgoing - even check deposits approved before the fix, which
 * recorded the member as the sender and would otherwise show as -$.
 */
export function isOutgoingFor(txn: Transaction, userId?: string): boolean {
  if (txn.transactionType === 'DEPOSIT') return false;
  const senderId = typeof txn.senderId === 'string' ? txn.senderId : txn.senderId._id;
  return senderId === userId;
}
