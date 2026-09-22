import { useState } from 'react';
import type { Card as CardType } from '../types';

interface CardVisualProps {
  card: CardType;
  revealed: boolean;
}

// A stable, deterministic 3-digit display value derived from the card's own
// id - not a real security code, just enough for the back-of-card visual to
// look complete without inventing separate stored state for it.
const pseudoCvv = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  return String(hash).padStart(3, '0');
};

const ContactlessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="contactless-icon">
    <path d="M8.5 8.5a5 5 0 0 1 0 7" opacity="0.55" />
    <path d="M11 6a8.5 8.5 0 0 1 0 12" opacity="0.78" />
    <path d="M13.5 3.5a12 12 0 0 1 0 17" />
  </svg>
);

export default function CardVisual({ card, revealed }: CardVisualProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="bank-card-scene">
      <div
        className={`bank-card-flipper${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label="Flip card"
        onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
      >
        {/* Front */}
        <div className={`bank-card${card.status === 'FROZEN' ? ' frozen' : ''}`}>
          <div className="bank-card-sheen" />
          <div className="bank-card-blob" />

          <div className="bank-card-top">
            <span className="bank-card-union">Harborlight</span>
            <div className="mastercard-mark" aria-label="Mastercard">
              <div className="mc-circles">
                <span className="mc-circle mc-circle-red" />
                <span className="mc-circle mc-circle-yellow" />
              </div>
              <span className="mc-wordmark">mastercard</span>
            </div>
          </div>

          <div className="bank-card-chip-row">
            <div className="bank-card-chip" />
            <ContactlessIcon />
          </div>

          <div className="bank-card-number mono-figure">
            {revealed ? `5412  7534  9081  ${card.last4}` : `••••  ••••  ••••  ${card.last4}`}
          </div>

          <div className="bank-card-valid-thru">
            <span className="bank-card-label">Valid thru</span>
            <span className="mono-figure">
              {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
            </span>
          </div>

          <div className="bank-card-bottom">
            <div className="bank-card-value bank-card-holder">{card.cardholderName}</div>
            <span className="bank-card-type-tag">{card.cardType === 'CREDIT' ? 'CREDIT' : 'ATM/DEBIT'}</span>
          </div>

          {card.status === 'FROZEN' && <div className="bank-card-frozen-badge">Frozen</div>}
        </div>

        {/* Back */}
        <div className={`bank-card bank-card-back${card.status === 'FROZEN' ? ' frozen' : ''}`}>
          <div className="bank-card-magstripe" />

          <div className="bank-card-signature-label">Signature panel - not valid unless signed</div>
          <div className="bank-card-signature-row">
            <div className="bank-card-signature-strip">
              <span>{card.cardholderName}</span>
            </div>
            <div className="bank-card-cvv">{revealed ? pseudoCvv(card._id) : '•••'}</div>
          </div>

          <p className="bank-card-fineprint">
            This card is property of Harborlight Credit Union. If found, please return to any branch or call
            customer care. Use of this card is subject to the cardholder agreement.
          </p>

          <div className="bank-card-back-bottom">
            <div className="mastercard-mark-badge" aria-label="Mastercard">
              <span className="mc-circle mc-circle-red" />
              <span className="mc-circle mc-circle-yellow" />
            </div>
            <span className="bank-card-back-brand">mastercard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
