import { useEffect, useState, type FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import OtpModal from '../components/OtpModal';
import TransferReview, { type ReviewRow } from '../components/TransferReview';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import type { Transaction, SavingsAccount } from '../types';

interface CreateTransactionResponse {
  transaction: Transaction;
  devOtp?: string;
}

type Tab = 'internal' | 'interaccount' | 'local' | 'international';
type Step = 'form' | 'review';

const initialMemberForm = { recipientAccountNumber: '', amount: '', category: 'General', description: '' };
const initialInterAccountForm = { direction: 'TO_SAVINGS' as 'TO_SAVINGS' | 'TO_CHECKING', amount: '' };
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
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('internal');
  const [step, setStep] = useState<Step>('form');

  const [memberForm, setMemberForm] = useState(initialMemberForm);
  const [interAccountForm, setInterAccountForm] = useState(initialInterAccountForm);
  const [localForm, setLocalForm] = useState(initialWireForm);
  const [intlForm, setIntlForm] = useState(initialWireForm);

  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null | undefined>(undefined);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingTxn, setPendingTxn] = useState<CreateTransactionResponse | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tab === 'interaccount' && savingsAccount === undefined) {
      api
        .get<SavingsAccount | null>('/savings')
        .then(setSavingsAccount)
        .catch(() => setSavingsAccount(null));
    }
  }, [tab, savingsAccount]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setStep('form');
    setError(null);
    setSuccess(false);
  };

  const updateMember = (field: keyof typeof memberForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setMemberForm((f) => ({ ...f, [field]: e.target.value }));

  const updateWire = (setForm: typeof setLocalForm, field: keyof typeof initialWireForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ---- Review row builders -------------------------------------------------

  const memberReviewRows: ReviewRow[] = [
    { label: t('common.recipient'), value: memberForm.recipientAccountNumber },
    { label: t('common.category'), value: memberForm.category },
    ...(memberForm.description ? [{ label: t('common.description'), value: memberForm.description }] : []),
  ];

  const interAccountReviewRows: ReviewRow[] = [
    {
      label: 'Direction',
      value: interAccountForm.direction === 'TO_SAVINGS' ? 'Checking → Savings' : 'Savings → Checking',
    },
  ];

  const wireReviewRows = (form: typeof initialWireForm, international: boolean): ReviewRow[] => [
    { label: t('common.recipient'), value: form.recipientName },
    ...(international && form.recipientAddress ? [{ label: 'Recipient address', value: form.recipientAddress }] : []),
    { label: 'Bank', value: form.bankName },
    ...(form.bankAddress ? [{ label: 'Bank address', value: form.bankAddress }] : []),
    { label: 'Account number', value: `••••${form.accountNumber.slice(-4)}` },
    ...(international ? [{ label: 'SWIFT / BIC', value: form.swiftCode }] : [{ label: 'Routing number', value: form.routingNumber }]),
    ...(form.description ? [{ label: t('common.description'), value: form.description }] : []),
  ];

  // ---- Submit handlers ------------------------------------------------------

  const startReview = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('review');
  };

  const confirmMember = async () => {
    setSubmitting(true);
    setError(null);
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
      setStep('form');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start transfer');
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmInterAccount = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/savings/transfer', {
        direction: interAccountForm.direction,
        amount: parseFloat(interAccountForm.amount),
      });
      setSuccess(true);
      setStep('form');
      setInterAccountForm(initialInterAccountForm);
      const acc = await api.get<SavingsAccount | null>('/savings');
      setSavingsAccount(acc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete transfer');
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmWire = async (form: typeof initialWireForm, category: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.post<CreateTransactionResponse>('/transactions/bank-transfer', {
        ...form,
        amount: parseFloat(form.amount),
        category,
      });
      setPendingTxn(result);
      setStep('form');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start transfer');
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
    setMemberForm(initialMemberForm);
    setLocalForm(initialWireForm);
    setIntlForm(initialWireForm);
  };

  const transferTypes: { key: Tab; titleKey: string; descKey: string }[] = [
    { key: 'internal', titleKey: 'transfer.internal', descKey: 'transfer.internalDesc' },
    { key: 'interaccount', titleKey: 'transfer.interAccount', descKey: 'transfer.interAccountDesc' },
    { key: 'local', titleKey: 'transfer.local', descKey: 'transfer.localDesc' },
    { key: 'international', titleKey: 'transfer.international', descKey: 'transfer.internationalDesc' },
  ];

  return (
    <AppLayout title={t('transfer.title')} subtitle="Internal, inter-account, local, and international transfers - all active.">
      <div className="transfer-type-grid">
        {transferTypes.map((type) => (
          <div key={type.key} className={`transfer-type-card${tab === type.key ? ' active' : ''}`} onClick={() => switchTab(type.key)}>
            <h3>{t(type.titleKey)}</h3>
            <p>{t(type.descKey)}</p>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 520 }}>
        {success && <div className="form-success">Identity verified. Your transfer is pending approval.</div>}
        {error && <div className="form-error">{error}</div>}

        {step === 'review' ? (
          <>
            {tab === 'internal' && (
              <TransferReview
                amount={parseFloat(memberForm.amount) || 0}
                rows={memberReviewRows}
                submitting={submitting}
                onConfirm={confirmMember}
                onEdit={() => setStep('form')}
              />
            )}
            {tab === 'interaccount' && (
              <TransferReview
                amount={parseFloat(interAccountForm.amount) || 0}
                rows={interAccountReviewRows}
                submitting={submitting}
                onConfirm={confirmInterAccount}
                onEdit={() => setStep('form')}
              />
            )}
            {tab === 'local' && (
              <TransferReview
                amount={parseFloat(localForm.amount) || 0}
                rows={wireReviewRows(localForm, false)}
                submitting={submitting}
                onConfirm={() => confirmWire(localForm, 'Local bank transfer')}
                onEdit={() => setStep('form')}
              />
            )}
            {tab === 'international' && (
              <TransferReview
                amount={parseFloat(intlForm.amount) || 0}
                rows={wireReviewRows(intlForm, true)}
                submitting={submitting}
                onConfirm={() => confirmWire(intlForm, 'International bank transfer')}
                onEdit={() => setStep('form')}
              />
            )}
          </>
        ) : (
          <div className="card" style={{ padding: 26 }}>
            {tab === 'internal' && (
              <form onSubmit={startReview}>
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
                  <label htmlFor="amount">{t('common.amount')} (USD)</label>
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
                  <label htmlFor="category">{t('common.category')}</label>
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
                <button className="btn btn-primary" type="submit">
                  {t('common.continue')}
                </button>
              </form>
            )}

            {tab === 'interaccount' &&
              (savingsAccount === undefined ? (
                <div className="empty-state">{t('common.loading')}</div>
              ) : savingsAccount === null ? (
                <div className="empty-state">
                  You don't have a savings account yet. Open one from the Savings page to move money between accounts.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setError(null);
                    setStep('review');
                  }}
                >
                  <div className="field">
                    <label htmlFor="direction">Direction</label>
                    <select
                      id="direction"
                      value={interAccountForm.direction}
                      onChange={(e) => setInterAccountForm((f) => ({ ...f, direction: e.target.value as typeof f.direction }))}
                    >
                      <option value="TO_SAVINGS">Checking → Savings</option>
                      <option value="TO_CHECKING">Savings → Checking</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="ia-amount">{t('common.amount')} (USD)</label>
                    <input
                      id="ia-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={interAccountForm.amount}
                      onChange={(e) => setInterAccountForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <button className="btn btn-primary" type="submit">
                    {t('common.continue')}
                  </button>
                </form>
              ))}

            {(tab === 'local' || tab === 'international') && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError(null);
                  setStep('review');
                }}
              >
                {(() => {
                  const form = tab === 'local' ? localForm : intlForm;
                  const setForm = tab === 'local' ? setLocalForm : setIntlForm;
                  const international = tab === 'international';
                  return (
                    <>
                      <div className="field">
                        <label htmlFor="recipientName">Receiver's full name</label>
                        <input
                          id="recipientName"
                          required
                          value={form.recipientName}
                          onChange={updateWire(setForm, 'recipientName')}
                          placeholder="Jordan Rivera"
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="recipientAddress">
                          Receiver's address{international ? '' : ' (optional)'}
                        </label>
                        <input
                          id="recipientAddress"
                          required={international}
                          value={form.recipientAddress}
                          onChange={updateWire(setForm, 'recipientAddress')}
                          placeholder="Street, city, state/province, postal code, country"
                        />
                      </div>

                      <div className="ledger-rule" style={{ margin: '18px 0' }} />

                      <div className="field">
                        <label htmlFor="bankName">Bank name</label>
                        <input
                          id="bankName"
                          required
                          value={form.bankName}
                          onChange={updateWire(setForm, 'bankName')}
                          placeholder="e.g. Chase, Bank of America"
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="bankAddress">
                          Bank address{international ? '' : ' (optional)'}
                        </label>
                        <input
                          id="bankAddress"
                          required={international}
                          value={form.bankAddress}
                          onChange={updateWire(setForm, 'bankAddress')}
                          placeholder="Branch address"
                        />
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label htmlFor="accountNumber">Account number</label>
                          <input
                            id="accountNumber"
                            required
                            minLength={4}
                            value={form.accountNumber}
                            onChange={updateWire(setForm, 'accountNumber')}
                            placeholder="Account number"
                          />
                        </div>
                        {international ? (
                          <div className="field">
                            <label htmlFor="swiftCode">SWIFT / BIC</label>
                            <input
                              id="swiftCode"
                              required
                              value={form.swiftCode}
                              onChange={updateWire(setForm, 'swiftCode')}
                              placeholder="e.g. CHASUS33"
                            />
                          </div>
                        ) : (
                          <div className="field">
                            <label htmlFor="routingNumber">Routing number</label>
                            <input
                              id="routingNumber"
                              required
                              value={form.routingNumber}
                              onChange={updateWire(setForm, 'routingNumber')}
                              placeholder="9 digits"
                            />
                          </div>
                        )}
                      </div>

                      <div className="ledger-rule" style={{ margin: '18px 0' }} />

                      <div className="field">
                        <label htmlFor="wire-amount">Transfer {t('common.amount').toLowerCase()} (USD)</label>
                        <input
                          id="wire-amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          value={form.amount}
                          onChange={updateWire(setForm, 'amount')}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="wire-description">{t('common.description')} / reference</label>
                        <input
                          id="wire-description"
                          value={form.description}
                          onChange={updateWire(setForm, 'description')}
                          placeholder="What's this for?"
                        />
                      </div>

                      <button className="btn btn-primary" type="submit">
                        {t('common.continue')}
                      </button>
                    </>
                  );
                })()}
              </form>
            )}
          </div>
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
