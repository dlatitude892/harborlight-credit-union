import { useEffect, useState, type FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import OtpModal from '../components/OtpModal';
import TransferReview, { type ReviewRow } from '../components/TransferReview';
import { api } from '../api/client';
import type { Payee, Transaction } from '../types';

interface CreateTransactionResponse {
  transaction: Transaction;
  devOtp?: string;
}

type P2PMethod = 'CASH_APP' | 'ZELLE' | 'VENMO' | 'PAYPAL';

const services: { method: P2PMethod; name: string; badgeClass: string; symbol: string; handleLabel: string; placeholder: string }[] = [
  { method: 'CASH_APP', name: 'Cash App', badgeClass: 'cashapp', symbol: '$', handleLabel: "Recipient's $Cashtag", placeholder: '$jordanrivera' },
  { method: 'ZELLE', name: 'Zelle', badgeClass: 'zelle', symbol: 'Z', handleLabel: "Recipient's email or phone", placeholder: 'name@example.com' },
  { method: 'VENMO', name: 'Venmo', badgeClass: 'venmo', symbol: 'V', handleLabel: "Recipient's Venmo username", placeholder: '@jordan-rivera' },
  { method: 'PAYPAL', name: 'PayPal', badgeClass: 'paypal', symbol: 'P', handleLabel: "Recipient's PayPal email", placeholder: 'name@example.com' },
];

export default function Bills() {
  const [selected, setSelected] = useState<P2PMethod | null>(null);
  const [recent, setRecent] = useState<Payee[]>([]);

  const [form, setForm] = useState({ recipientName: '', handle: '', amount: '', description: '' });
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingTxn, setPendingTxn] = useState<CreateTransactionResponse | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get<Payee[]>('/payees').then(setRecent).catch(() => undefined);
  }, [success]);

  const service = services.find((s) => s.method === selected);
  const recentForService = recent.filter((p) => p.method === selected).slice(0, 4);

  const startReview = (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    setStep('review');
  };

  const confirmSend = async () => {
    if (!selected) return;
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const result = await api.post<CreateTransactionResponse>('/transactions/p2p', {
        method: selected,
        recipientName: form.recipientName,
        handle: form.handle,
        amount: parseFloat(form.amount),
        description: form.description,
      });
      setPendingTxn(result);
      setStep('form');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start payment');
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (otp: string) => {
    if (!pendingTxn) return;
    await api.post('/transactions/verify-otp', { transactionId: pendingTxn.transaction._id, otp });
    setPendingTxn(null);
    setSuccess(true);
    setForm({ recipientName: '', handle: '', amount: '', description: '' });
  };

  return (
    <AppLayout title="Pay bills & P2P" subtitle="Send money via Cash App, Zelle, Venmo, or PayPal.">
      <div className="service-grid">
        {services.map((s) => (
          <div
            key={s.method}
            className={`card service-card${selected === s.method ? ' selected' : ''}`}
            onClick={() => {
              setSelected(s.method);
              setSuccess(false);
              setError(null);
              setStep('form');
            }}
          >
            <span className={`service-badge ${s.badgeClass}`}>{s.symbol}</span>
            <span className="service-name">{s.name}</span>
          </div>
        ))}
      </div>

      {selected && service && (
        <>
          {step === 'review' ? (
            <TransferReview
              amount={parseFloat(form.amount) || 0}
              rows={[
                { label: 'Service', value: service.name },
                { label: 'Recipient', value: form.recipientName },
                { label: service.handleLabel, value: form.handle },
                ...(form.description ? [{ label: 'Description', value: form.description } as ReviewRow] : []),
              ]}
              submitting={submitting}
              onConfirm={confirmSend}
              onEdit={() => setStep('form')}
              confirmLabel={`Confirm & send via ${service.name}`}
            />
          ) : (
            <div className="card" style={{ maxWidth: 460, padding: 26 }}>
              {success && <div className="form-success">Identity verified. Your payment via {service.name} is pending approval.</div>}
              {error && <div className="form-error">{error}</div>}

              {recentForService.length > 0 && (
                <div className="recent-chip-row">
                  {recentForService.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      className="recent-chip"
                      onClick={() => setForm((f) => ({ ...f, recipientName: p.recipientName || p.label, handle: p.handle }))}
                    >
                      {p.recipientName || p.label}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={startReview}>
                <div className="field">
                  <label htmlFor="recipientName">Recipient name</label>
                  <input
                    id="recipientName"
                    required
                    value={form.recipientName}
                    onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div className="field">
                  <label htmlFor="handle">{service.handleLabel}</label>
                  <input
                    id="handle"
                    required
                    value={form.handle}
                    onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
                    placeholder={service.placeholder}
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
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="field">
                  <label htmlFor="description">Description / reference</label>
                  <input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What's this for?"
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Continue
                </button>
              </form>
            </div>
          )}
        </>
      )}

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
