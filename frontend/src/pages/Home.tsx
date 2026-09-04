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

export default function Home() {
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
