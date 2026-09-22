import { useEffect, useRef, useState, type FormEvent } from 'react';
import AppLayout from '../components/AppLayout';
import { api } from '../api/client';
import { resizeImageToDataUrl } from '../utils/image';
import type { CheckDeposit } from '../types';
import { IconDeposit } from '../components/icons';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Deposit() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deposits, setDeposits] = useState<CheckDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = () => api.get<CheckDeposit[]>('/deposits').then(setDeposits);

  useEffect(() => {
    load()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    setProcessingImage(true);
    setError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setImageDataUrl(dataUrl);
      setImagePreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process that image');
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!imageDataUrl) {
      setError('Please upload a photo of the check first');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/deposits', { amount: parseFloat(amount), imageUrl: imageDataUrl });
      setSuccess(true);
      setAmount('');
      setImageDataUrl(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit deposit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Deposit a check" subtitle="Upload a photo of your check - an admin reviews it before funds are added.">
      <div className="card" style={{ padding: 26, maxWidth: 460, marginBottom: 30 }}>
        {success && <div className="form-success">Deposit submitted. You'll see it reflected once it's reviewed.</div>}
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Check photo</label>
            {imagePreview ? (
              <div className="deposit-preview">
                <img src={imagePreview} alt="Check preview" />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setImagePreview(null);
                    setImageDataUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove and choose another
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="deposit-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={processingImage}
              >
                <IconDeposit />
                <span>{processingImage ? 'Processing…' : 'Upload a photo of the front of your check'}</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>

          <div className="field">
            <label htmlFor="amount">Amount written on the check (USD)</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting || processingImage}>
            {submitting ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>
      </div>

      <div className="section-header">
        <h2 className="section-title">Deposit history</h2>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : deposits.length === 0 ? (
        <div className="card table-card">
          <div className="empty-state">No deposits yet. Once you submit a check, it'll show up here.</div>
        </div>
      ) : (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d._id}>
                  <td className="mono-figure text-secondary">{d.reference}</td>
                  <td className="text-secondary">{formatDate(d.createdAt)}</td>
                  <td className="amount-cell">{formatCurrency(d.amount)}</td>
                  <td>
                    <span className={`badge ${d.status.toLowerCase()}`}>{d.status}</span>
                  </td>
                  <td className="text-secondary">{d.adminNote || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
