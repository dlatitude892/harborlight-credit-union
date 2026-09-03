import { Link } from 'react-router-dom';
import { IconLock, IconShield } from '../marketing-icons';
import { IconSupport } from '../icons';
import { useReveal } from '../../hooks/useReveal';

const trustItems = [
  { icon: IconLock, title: 'Secure online banking', body: 'Bank-grade encryption on every session.' },
  { icon: IconShield, title: 'Federally insured', body: 'NCUA insured up to $250,000 per member.' },
  { icon: IconSupport, title: 'Real customer support', body: 'Reach a real person, every time.' },
  { icon: IconShield, title: 'Responsible banking', body: 'Member-owned, not shareholder-driven.' },
];

export default function PgTrustAndCta() {
  const trust = useReveal<HTMLDivElement>();
  const cta = useReveal<HTMLDivElement>();

  return (
    <>
      <section className="pg-section">
        <div className="pg-container">
          <div className="pg-section-head">
            <span className="pg-eyebrow">Why members trust us</span>
            <h2>Bank With Confidence</h2>
          </div>
          <div ref={trust.ref} className={`pg-trust-grid ${trust.className}`}>
            {trustItems.map((item) => (
              <div className="pg-trust-item" key={item.title}>
                <span className="pg-feature-icon">
                  <item.icon />
                </span>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-container" style={{ paddingBottom: 20 }}>
        <div ref={cta.ref} className={`pg-final-cta ${cta.className}`}>
          <h2>Your Next Financial Step Starts Here</h2>
          <p>
            Whether you're opening an account, exploring a loan, planning for a home, or simply looking for answers,
            Harborlight Credit Union is here to help you move forward.
          </p>
          <div className="pg-final-cta-actions">
            <Link to="/register" className="pg-btn pg-btn-primary">
              Get Started
            </Link>
            <a href="#customer-care" className="pg-btn pg-btn-ghost">
              Contact Customer Care
            </a>
            <a href="#home-loans" className="pg-btn pg-btn-ghost">
              Explore Loans
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
