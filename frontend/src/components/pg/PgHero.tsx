import { Link } from 'react-router-dom';
import { IconChevronRight, IconTrendingUp } from '../marketing-icons';
import { useReveal } from '../../hooks/useReveal';

export default function PgHero() {
  const copy = useReveal<HTMLDivElement>();
  const visual = useReveal<HTMLDivElement>();

  return (
    <section className="pg-hero">
      <div className="pg-container pg-hero-grid">
        <div ref={copy.ref} className={copy.className}>
          <span className="pg-eyebrow">Member-owned · Federally insured</span>
          <h1>
            Banking Made Simpler. <br />
            Your <span>Financial Future</span> Starts Here.
          </h1>
          <p>
            At Harborlight Credit Union, we combine modern banking technology with personalized service to help you
            manage your money, reach your goals, and build a stronger financial future.
          </p>
          <div className="pg-hero-actions">
            <Link to="/register" className="pg-btn pg-btn-primary">
              Get Started <IconChevronRight />
            </Link>
            <a href="#banking" className="pg-btn pg-btn-ghost">
              Explore Our Services
            </a>
          </div>
          <div className="pg-hero-signin">
            Already a member? <Link to="/login">Sign in to online banking</Link>
          </div>
        </div>

        <div ref={visual.ref} className={`pg-hero-visual ${visual.className}`}>
          <div className="pg-float-card pg-card-balance">
            <div className="pg-card-label">Total balance</div>
            <div className="pg-card-value">$24,180.55</div>
            <div className="pg-mini-avatar-row">
              <span className="pg-mini-avatar" style={{ background: '#1f7a4d' }}>
                JR
              </span>
              <span className="pg-mini-avatar" style={{ background: '#2f9563' }}>
                DM
              </span>
              <span className="pg-mini-avatar" style={{ background: '#7bb896' }}>
                CS
              </span>
            </div>
          </div>

          <div className="pg-float-card pg-card-growth">
            <div className="pg-card-label">Savings growth</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconTrendingUp style={{ width: 18, height: 18, color: '#1f7a4d' }} />
              <span className="pg-card-value" style={{ fontSize: 16 }}>
                +4.35% APY
              </span>
            </div>
          </div>

          <div className="pg-float-card pg-card-mobile">
            <div className="pg-card-label">Mobile deposit</div>
            <div className="pg-card-value" style={{ fontSize: 15 }}>
              Check cleared ✓
            </div>
          </div>

          <div className="pg-float-card pg-card-family">
            <div className="pg-card-label">Home loan pre-approval</div>
            <div className="pg-card-value" style={{ fontSize: 15 }}>
              $340,000 approved
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
