import { IconGlobe, IconMobile, IconATM } from '../marketing-icons';
import { IconWallet, IconSwap, IconBill, IconSupport } from '../icons';
import { useReveal } from '../../hooks/useReveal';

const items = [
  { icon: IconGlobe, title: 'Online Banking', body: 'Full account access from any browser.' },
  { icon: IconMobile, title: 'Mobile Banking', body: 'Deposit checks and manage cards on the go.' },
  { icon: IconATM, title: 'ATM Access', body: 'Fee-free at thousands of locations nationwide.' },
  { icon: IconWallet, title: 'Account Management', body: 'View balances and activity in real time.' },
  { icon: IconSwap, title: 'Transfers', body: 'Move money between members instantly.' },
  { icon: IconBill, title: 'Bill Payments', body: 'Pay bills via bank transfer, Zelle, and more.' },
  { icon: IconSupport, title: 'Financial Support', body: 'Guidance from real people, not a call tree.' },
  { icon: IconSupport, title: 'Customer Care', body: 'Reach us by phone, email, or secure message.' },
];

export default function PgExperience() {
  const head = useReveal<HTMLDivElement>();

  return (
    <section id="experience" className="pg-section">
      <div className="pg-container">
        <div ref={head.ref} className={`pg-section-head ${head.className}`}>
          <span className="pg-eyebrow">The Harborlight experience</span>
          <h2>Everything You Need, Wherever Life Takes You</h2>
          <p>
            From everyday banking to major financial decisions, Harborlight Credit Union provides convenient
            solutions designed to fit the way you live, work, save, and grow.
          </p>
        </div>
        <div className="pg-experience-grid">
          {items.map((item) => (
            <div className="pg-mini-feature" key={item.title}>
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
  );
}
