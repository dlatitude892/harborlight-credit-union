import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import CardVisual from '../components/CardVisual';
import { api } from '../api/client';
import type { Card } from '../types';

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitDraft, setLimitDraft] = useState<Record<string, number>>({});

  useEffect(() => {
    api
      .get<Card[]>('/cards')
      .then((res) => {
        setCards(res);
        setLimitDraft(Object.fromEntries(res.map((c) => [c._id, c.spendingLimit])));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load cards'))
      .finally(() => setLoading(false));
  }, []);

  const toggleFreeze = async (card: Card) => {
    const nextStatus = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    const updated = await api.patch<Card>(`/cards/${card._id}`, { status: nextStatus });
    setCards((prev) => prev.map((c) => (c._id === card._id ? updated : c)));
  };

  const saveLimit = async (card: Card) => {
    const spendingLimit = limitDraft[card._id];
    const updated = await api.patch<Card>(`/cards/${card._id}`, { spendingLimit });
    setCards((prev) => prev.map((c) => (c._id === card._id ? updated : c)));
  };

  return (
    <AppLayout title="Cards" subtitle="Manage your Harborlight debit card.">
      {error && <div className="form-error">{error}</div>}
      {loading ? (
        <div className="empty-state">Loading your card…</div>
      ) : (
        cards.map((card) => (
          <div className="cards-columns" key={card._id}>
            <div>
              <CardVisual card={card} revealed={revealed} />
              <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%' }} onClick={() => setRevealed((r) => !r)}>
                {revealed ? 'Hide card number' : 'Reveal card number'}
              </button>
            </div>

            <div className="card-controls" style={{ maxWidth: 420 }}>
              <div className="card-control-row">
                <div>
                  <div className="card-control-label">Freeze card</div>
                  <div className="card-control-sub">Instantly blocks new purchases and withdrawals.</div>
                </div>
                <div
                  className={`toggle-switch${card.status === 'FROZEN' ? ' on' : ''}`}
                  onClick={() => toggleFreeze(card)}
                  role="switch"
                  aria-checked={card.status === 'FROZEN'}
                >
                  <div className="knob" />
                </div>
              </div>

              <div className="card-control-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div className="card-control-label">Daily spending limit</div>
                    <div className="card-control-sub">Applies to purchases and ATM withdrawals.</div>
                  </div>
                  <div className="mono-figure" style={{ fontWeight: 600 }}>
                    ${limitDraft[card._id]?.toLocaleString()}
                  </div>
                </div>
                <input
                  type="range"
                  className="limit-slider"
                  min={100}
                  max={10000}
                  step={100}
                  value={limitDraft[card._id] ?? card.spendingLimit}
                  onChange={(e) => setLimitDraft((d) => ({ ...d, [card._id]: Number(e.target.value) }))}
                  onMouseUp={() => saveLimit(card)}
                  onTouchEnd={() => saveLimit(card)}
                />
              </div>

              <div className="card-control-row">
                <div>
                  <div className="card-control-label">Card type</div>
                  <div className="card-control-sub">
                    {card.cardType === 'DEBIT' ? 'Linked to checking' : 'Revolving credit line'}
                  </div>
                </div>
                <span className="badge approved">{card.cardType}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </AppLayout>
  );
}
