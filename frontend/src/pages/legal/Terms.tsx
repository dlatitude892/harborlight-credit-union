import '../../marketing.css';
import PgHeader from '../../components/pg/PgHeader';
import PgFooter from '../../components/pg/PgFooter';

export default function Terms() {
  return (
    <div className="pub-site">
      <PgHeader />
      <div className="pg-container">
        <div className="pg-legal-page">
          <h1>Terms &amp; Conditions</h1>
          <p className="pg-updated">Last updated: January 2026</p>

          <p>
            These terms govern your use of Harborlight Credit Union's website and online banking services. By
            creating an account or using our services, you agree to these terms.
          </p>

          <h2>Membership</h2>
          <p>
            Harborlight Credit Union is a member-owned financial cooperative. Opening an account establishes your
            membership, subject to our eligibility requirements and applicable regulations.
          </p>

          <h2>Accounts and transactions</h2>
          <p>
            You're responsible for keeping your login credentials confidential and for reviewing your account
            activity. Report any unauthorized transaction to customer care as soon as possible.
          </p>

          <h2>Loan applications</h2>
          <p>
            Submitting a loan or credit application through this site is a request for review. Approval is not
            guaranteed and depends on creditworthiness, verification of the information provided, and applicable
            underwriting criteria.
          </p>

          <h2>Service availability</h2>
          <p>
            We aim for high availability of online and mobile banking but do not guarantee uninterrupted access.
            Scheduled maintenance or unforeseen issues may temporarily affect service.
          </p>

          <h2>Changes to these terms</h2>
          <p>We may update these terms from time to time. Continued use of our services after an update constitutes acceptance of the revised terms.</p>
        </div>
      </div>
      <PgFooter />
    </div>
  );
}
