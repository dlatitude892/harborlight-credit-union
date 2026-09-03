import { useCountUp } from '../../hooks/useCountUp';
import { useReveal } from '../../hooks/useReveal';

const stats = [
  { value: 42000, suffix: '+', label: 'Members served' },
  { value: 99, suffix: '.9%', label: 'Digital banking uptime' },
  { value: 24, suffix: '/7', label: 'Account access' },
  { value: 60, suffix: '+ yrs', label: 'Serving our community' },
];

function StatCounter({ value, suffix, label }: (typeof stats)[number]) {
  const { ref, value: current } = useCountUp(value);
  return (
    <div className="pg-stat-card">
      <div ref={ref} className="pg-stat-value">
        {current.toLocaleString()}
        {suffix}
      </div>
      <div className="pg-stat-label">{label}</div>
    </div>
  );
}

export default function PgAbout() {
  const copy = useReveal<HTMLDivElement>();
  const visual = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="pg-section pg-section-soft">
      <div className="pg-container pg-about-grid">
        <div ref={copy.ref} className={copy.className}>
          <div className="pg-about-copy">
            <span className="pg-eyebrow">About Harborlight</span>
            <h2>Banking Built Around You</h2>
            <p>
              At Harborlight Credit Union, we believe banking should be more than transactions. It should be a
              relationship built on trust, transparency, and service.
            </p>
            <p>
              Whether you're saving for tomorrow, purchasing your first home, financing a vehicle, managing everyday
              expenses, or growing a business, our goal is to provide the tools and support you need to move forward
              with confidence.
            </p>
          </div>
          <div className="pg-stat-grid">
            {stats.map((s) => (
              <StatCounter key={s.label} {...s} />
            ))}
          </div>
        </div>

        <div ref={visual.ref} className={`pg-about-visual ${visual.className}`}>
          <div className="pg-float-card" style={{ marginBottom: 16 }}>
            <div className="pg-card-label">Member-focused service</div>
            <div className="pg-card-value" style={{ fontSize: 16 }}>
              A credit union owned by the people it serves
            </div>
          </div>
          <div className="pg-float-card" style={{ marginBottom: 16 }}>
            <div className="pg-card-label">Secure digital banking</div>
            <div className="pg-card-value" style={{ fontSize: 16 }}>
              Bank-grade encryption on every transaction
            </div>
          </div>
          <div className="pg-float-card">
            <div className="pg-card-label">Convenient access</div>
            <div className="pg-card-value" style={{ fontSize: 16 }}>
              Manage everything from your phone, anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
