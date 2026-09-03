import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function PgFooter() {
  return (
    <footer className="pg-footer">
      <div className="pg-container">
        <div className="pg-footer-top">
          <div className="pg-footer-brand">
            <Logo />
            <p>Modern banking solutions designed around your financial goals.</p>
          </div>
          <div className="pg-footer-cols">
            <div>
              <h4>Banking</h4>
              <a href="/#banking">Checking</a>
              <a href="/#banking">Savings</a>
              <a href="/#experience">Online Banking</a>
              <a href="/#experience">Mobile Banking</a>
              <a href="/#experience">ATM Access</a>
            </div>
            <div>
              <h4>Lending</h4>
              <a href="/#home-loans">Home Loans</a>
              <a href="/#home-loans">Mortgage Refinance</a>
              <a href="/#auto-loans">Auto Loans</a>
              <a href="/#personal-loans">Personal Loans</a>
              <a href="/#business-lending">Small Business Lending</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="/#customer-care">Customer Care</a>
              <a href="/#customer-care">Contact Us</a>
              <Link to="/security-center">Security</Link>
              <a href="/#customer-care">FAQs</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="/#about">About Us</a>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/accessibility">Accessibility</Link>
            </div>
          </div>
        </div>
        <div className="pg-footer-bottom">
          <span>© {new Date().getFullYear()} Harborlight Credit Union. Federally insured by the NCUA.</span>
          <span>Equal Housing Lender</span>
        </div>
      </div>
    </footer>
  );
}
