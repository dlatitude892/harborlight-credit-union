import '../marketing.css';
import PgHeader from '../components/pg/PgHeader';
import PgHero from '../components/pg/PgHero';
import PgQuickFeatures from '../components/pg/PgQuickFeatures';
import PgAbout from '../components/pg/PgAbout';
import PgExperience from '../components/pg/PgExperience';
import PgLoanSections from '../components/pg/PgLoanSections';
import PgCustomerCare from '../components/pg/PgCustomerCare';
import PgTrustAndCta from '../components/pg/PgTrustAndCta';
import PgFooter from '../components/pg/PgFooter';
import { usePageMeta } from '../utils/usePageMeta';

export default function Home() {
  usePageMeta({
    title: 'Harborlight Credit Union — Banking Made Simpler',
    description: 'Harborlight Credit Union is a member-owned credit union offering checking, high-yield savings, loans, and modern online banking.',
    path: '/',
  });
  return (
    <div className="pub-site">
      <PgHeader />
      <PgHero />
      <PgQuickFeatures />
      <PgAbout />
      <PgExperience />
      <PgLoanSections />
      <PgCustomerCare />
      <PgTrustAndCta />
      <PgFooter />
    </div>
  );
}
