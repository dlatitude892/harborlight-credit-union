import '../../marketing.css';
import PgHeader from '../../components/pg/PgHeader';
import PgFooter from '../../components/pg/PgFooter';
import { IconLock, IconShield } from '../../components/marketing-icons';

export default function SecurityCenter() {
  return (
    <div className="pub-site">
      <PgHeader />
      <div className="pg-container">
        <div className="pg-legal-page">
          <h1>Security Center</h1>
          <p className="pg-updated">How we protect your account</p>

          <p>
            Keeping your accounts secure is a shared responsibility. Here's what Harborlight does, and what you can
            do too.
          </p>

          <h2>What we do</h2>
          <ul>
            <li>Encrypt data in transit and hash passwords - we never store your password in plain text</li>
            <li>Rate-limit login and transfer attempts to slow down automated attacks</li>
            <li>Require one-time passcode verification on every money transfer</li>
            <li>Maintain an audit log of every administrative action on member accounts</li>
            <li>Apply role-based access so only authorized staff can view sensitive account details</li>
          </ul>

          <h2>What you can do</h2>
          <ul>
            <li>Use a unique, strong password for your Harborlight account</li>
            <li>Never share your password, one-time passcode, or account PIN with anyone - Harborlight will never ask for these</li>
            <li>Freeze your card instantly from the Cards page if it's lost or stolen</li>
            <li>Review your transaction history regularly and report anything unfamiliar</li>
          </ul>

          <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--pg-green-dark)', fontWeight: 700 }}>
              <IconLock style={{ width: 18, height: 18 }} /> Bank-grade encryption
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--pg-green-dark)', fontWeight: 700 }}>
              <IconShield style={{ width: 18, height: 18 }} /> NCUA insured
            </span>
          </div>
        </div>
      </div>
      <PgFooter />
    </div>
  );
}
