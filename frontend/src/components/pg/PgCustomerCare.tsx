import { useState } from 'react';
import { IconMail, IconPhoneCall } from '../marketing-icons';
import CustomerCareModal from './CustomerCareModal';
import { useReveal } from '../../hooks/useReveal';

export default function PgCustomerCare() {
  const [open, setOpen] = useState(false);
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section id="customer-care" className="pg-section pg-section-soft">
      <div className="pg-container">
        <div ref={reveal.ref} className={`pg-care-card ${reveal.className}`}>
          <span className="pg-eyebrow">We're here to help</span>
          <h2 style={{ fontSize: 26, marginBottom: 4 }}>How Can We Help?</h2>
          <p>
            Have a question about your account, our services, a loan application, or something else? Our
            customer-care team is here to help.
          </p>
          <button className="pg-btn pg-btn-primary pg-btn-lg" onClick={() => setOpen(true)} style={{ margin: '0 auto' }}>
            Contact Customer Care
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 26, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--pg-text-secondary)' }}>
              <IconMail style={{ width: 16, height: 16, color: 'var(--pg-green)' }} /> support@harborlight.example
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--pg-text-secondary)' }}>
              <IconPhoneCall style={{ width: 16, height: 16, color: 'var(--pg-green)' }} /> 1-800-555-0139
            </span>
          </div>
        </div>
      </div>

      {open && <CustomerCareModal onClose={() => setOpen(false)} />}
    </section>
  );
}
