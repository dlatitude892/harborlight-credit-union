import { useState, type FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import OtpModal from '../components/OtpModal';
import { api } from '../api/client';
import type { Transaction } from '../types';

interface CreateTransactionResponse {
  transaction: Transaction;
  devOtp?: string;
}

const initialWireForm = {
  recipientName: '',
  bankName: '',
  bankAddress: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  recipientAddress: '',
  amount: '',
  description: '',
};

export default function Transfer() {
  const [tab, setTab] = useState<'member' | 'bank'>('member');

  const [memberForm, setMemberForm] = useState({ recipientAccountNumber: '', amount: '', category: 'General', description: '' });
  const [wireForm, setWireForm] = useState(initialWireForm);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingTxn, setPendingTxn] = useState<CreateTransactionResponse | null>(null);
  const [success, setSuccess] = useState(false);

  const updateMember = (field: keyof typeof memberForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setMemberForm((f) => ({ ...f, [field]: e.target.value }));

  const updateWire = (field: keyof typeof wireForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setWireForm((f) => ({ ...f, [field]: e.target.value }));

  const handleMemberSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const result = await api.post<CreateTransactionResponse>('/transactions', {
        recipientAccountNumber: memberForm.recipientAccountNumber,
        amount: parseFloat(memberForm.amount),
        transactionType: 'TRANSFER',
        currency: 'USD',
        category: memberForm.category,
        description: memberForm.description,
      });
      setPendingTxn(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWireSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const result = await api.post<CreateTransactionResponse>('/transactions/bank-transfer', {
        ...wireForm,
        amount: parseFloat(wireForm.amount),
      });
      setPendingTxn(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (otp: string) => {
    if (!pendingTxn) return;
    await api.post('/transactions/verify-otp', { transactionId: pendingTxn.transaction._id, otp });
    setPendingTxn(null);
    setSuccess(true);
    setMemberForm({ recipientAccountNumber: '', amount: '', category: 'General', description: '' });
    setWireForm(initialWireForm);
  };

  return (
    <AppLayout title="Send money" subtitle="Transfer to a Harborlight member or wire funds to any bank account.">
      <div className="tab-switch">
        <button className={tab === 'member' ? 'active' : ''} onClick={() => setTab('member')}>
          Harborlight member
        </button>
        <button className={tab === 'bank' ? 'active' : ''} onClick={() => setTab('bank')}>
          Bank wire transfer
        </button>
      </div>

      <div className="card" style={{ maxWidth: 520, padding: 26 }}>
        {success && <div className="form-success">Identity verified. Your transfer is pending approval.</div>}
        {error && <div className="form-error">{error}</div>}

        {tab === 'member' ? (
          <form onSubmit={handleMemberSubmit}>
            <div className="field">
              <label htmlFor="recipientAccountNumber">Recipient member ID</label>
              <input
                id="recipientAccountNumber"
                required
                value={memberForm.recipientAccountNumber}
                onChange={updateMember('recipientAccountNumber')}
                placeholder="e.g. HL-123456789"
              />
            </div>
            <div className="field">
              <label htmlFor="amount">Amount (USD)</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={memberForm.amount}
                onChange={updateMember('amount')}
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" value={memberForm.category} onChange={updateMember('category')}>
                <option>General</option>
                <option>Rent</option>
                <option>Utilities</option>
                <option>Groceries</option>
                <option>Family &amp; friends</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="description">Note (optional)</label>
              <input
                id="description"
                value={memberForm.description}
                onChange={updateMember('description')}
                placeholder="What's this for?"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Starting transfer…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleWireSubmit}>
            <div className="field">
              <label htmlFor="recipientName">Receiver's full name</label>
              <input id="recipientName" required value={wireForm.recipientName} onChange={updateWire('recipientName')} placeholder="Jordan Rivera" />
            </div>
            <div className="field">
              <label htmlFor="recipientAddress">Receiver's address</label>
              <input
                id="recipientAddress"
                value={wireForm.recipientAddress}
                onChange={updateWire('recipientAddress')}
                placeholder="Street, city, state, ZIP"
              />
            </div>

            <div className="ledger-rule" style={{ margin: '18px 0' }} />

            <div className="field">
              <label htmlFor="bankName">Bank name</label>
              <input id="bankName" required value={wireForm.bankName} onChange={updateWire('bankName')} placeholder="e.g. Chase, Bank of America" />
            </div>
            <div className="field">
              <label htmlFor="bankAddress">Bank address</label>
              <input id="bankAddress" value={wireForm.bankAddress} onChange={updateWire('bankAddress')} placeholder="Branch address" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="accountNumber">Account number</label>
                <input id="accountNumber" required minLength={4} value={wireForm.accountNumber} onChange={updateWire('accountNumber')} placeholder="Account number" />
              </div>
              <div className="field">
                <label htmlFor="routingNumber">Routing number</label>
                <input id="routingNumber" value={wireForm.routingNumber} onChange={updateWire('routingNumber')} placeholder="9 digits" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="swiftCode">SWIFT / BIC (for international transfers)</label>
              <input id="swiftCode" value={wireForm.swiftCode} onChange={updateWire('swiftCode')} placeholder="Optional" />
            </div>

            <div className="ledger-rule" style={{ margin: '18px 0' }} />

            <div className="field">
              <label htmlFor="wire-amount">Transfer amount (USD)</label>
              <input
                id="wire-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={wireForm.amount}
                onChange={updateWire('amount')}
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label htmlFor="wire-description">Description / reference</label>
              <input id="wire-description" value={wireForm.description} onChange={updateWire('description')} placeholder="What's this for?" />
            </div>

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Starting transfer…' : 'Continue'}
            </button>
          </form>
        )}
      </div>

      {pendingTxn && (
        <OtpModal
          reference={pendingTxn.transaction.reference}
          devOtp={pendingTxn.devOtp}
          onVerify={handleVerify}
          onClose={() => setPendingTxn(null)}
        />
      )}
    </AppLayout>
  );
}
