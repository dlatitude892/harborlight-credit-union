import { IconWallet, IconCard } from '../icons';
import { IconPiggyBank, IconHouse, IconGraduationCap, IconUsers } from '../marketing-icons';
import { useReveal } from '../../hooks/useReveal';

const features = [
  { icon: IconWallet, title: 'Checking Accounts', body: 'Manage everyday spending with convenient banking options designed around your needs.', href: '#banking' },
  { icon: IconPiggyBank, title: 'Savings', body: 'Build your savings and work toward the goals that matter most.', href: '#banking' },
  { icon: IconHouse, title: 'Home Loans', body: 'Explore financing options for purchasing or refinancing your home.', href: '#home-loans' },
  { icon: IconCard, title: 'Auto Loans', body: 'Find financing options for your next vehicle.', href: '#auto-loans' },
  { icon: IconGraduationCap, title: 'Personal Loans', body: 'Access financing designed around your personal goals.', href: '#personal-loans' },
  { icon: IconUsers, title: 'Business Lending', body: 'Support your business with lending solutions designed to help you grow.', href: '#business-lending' },
];

function FeatureCard({ icon: Icon, title, body, href }: (typeof features)[number]) {
  const reveal = useReveal<HTMLDivElement>();
  return (
    <div ref={reveal.ref} className={`pg-feature-card ${reveal.className}`}>
      <span className="pg-feature-icon">
        <Icon />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <a href={href} className="pg-btn-text">
        Learn More →
      </a>
    </div>
  );
}

export default function PgQuickFeatures() {
  return (
    <section id="banking" className="pg-section">
      <div className="pg-container">
        <div className="pg-section-head">
          <span className="pg-eyebrow">Everyday banking</span>
          <h2>Banking Built for Everyday Life</h2>
        </div>
        <div className="pg-feature-grid">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
