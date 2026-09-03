import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Transaction } from '../types';
import { IconClose } from './icons';

interface TransactionEditModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSaved: () => void;
}

const toDateInputValue = (iso: string) => new Date(iso).toISOString().slice(0, 16);

export default function TransactionEditModal({ transaction, onClose, onSaved }: TransactionEditModalProps) {
  const [amount, setAmount] = useState(String(transaction.amount));
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState(transaction.category);
  const [createdAt, setCreatedAt] = useState(toDateInputValue(transaction.createdAt));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.patch(`/admin/transactions/${transaction._id}/edit`, {
        amount: parseFloat(amount),
        description,
        category,
        createdAt: new Date(createdAt).toISOString(),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2>Edit transaction</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <p className="modal-sub">
          Reference {transaction.reference} · changing the amount on a completed transaction adjusts the affected
          balance(s) accordingly.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="amount">Amount (USD)</label>
            <input id="amount" type="number" min="0.01" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="createdAt">Date &amp; time</label>
            <input id="createdAt" type="datetime-local" required value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
