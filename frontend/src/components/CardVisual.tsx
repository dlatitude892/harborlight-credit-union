import type { Card as CardType } from '../types';

interface CardVisualProps {
  card: CardType;
  revealed: boolean;
}

export default function CardVisual({ card, revealed }: CardVisualProps) {
  return (
    <div className={`bank-card${card.status === 'FROZEN' ? ' frozen' : ''}`}>
      <div className="bank-card-top">
        <span className="bank-card-union">Harborlight</span>
        <span className="bank-card-type">{card.cardType}</span>
      </div>
      <div className="bank-card-chip" />
      <div className="bank-card-number mono-figure">
        {revealed ? `4129  5502  8834  ${card.last4}` : `••••  ••••  ••••  ${card.last4}`}
      </div>
      <div className="bank-card-bottom">
        <div>
          <div className="bank-card-label">Card holder</div>
          <div className="bank-card-value">{card.cardholderName}</div>
        </div>
        <div>
          <div className="bank-card-label">Expires</div>
          <div className="bank-card-value mono-figure">
            {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
          </div>
        </div>
        <div className="bank-card-brand">{card.brand === 'VISA' ? 'VISA' : 'Mastercard'}</div>
      </div>
      {card.status === 'FROZEN' && <div className="bank-card-frozen-badge">Frozen</div>}
    </div>
  );
}
