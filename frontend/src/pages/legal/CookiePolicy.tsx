import '../../marketing.css';
import PgHeader from '../../components/pg/PgHeader';
import PgFooter from '../../components/pg/PgFooter';

export default function CookiePolicy() {
  return (
    <div className="pub-site">
      <PgHeader />
      <div className="pg-container">
        <div className="pg-legal-page">
          <h1>Cookie Policy</h1>
          <p className="pg-updated">Last updated: January 2026</p>

          <p>
            This policy explains how Harborlight Credit Union uses cookies and similar technologies on our website
            and online banking platform.
          </p>

          <h2>What cookies are</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help the site
            remember information about your visit, like your session and preferences.
          </p>

          <h2>How we use cookies</h2>
          <p>We use cookies for a few essential purposes:</p>
          <ul>
            <li>Keeping you signed in during your online banking session.</li>
            <li>Remembering preferences like your chosen language and light/dark mode.</li>
            <li>Understanding how our website is used, so we can improve it.</li>
          </ul>

          <h2>Essential vs. optional cookies</h2>
          <p>
            Some cookies are essential for online banking to function - such as the ones that keep you securely
            signed in - and cannot be disabled without affecting the service. Others, like preference cookies, are
            optional.
          </p>

          <h2>Managing cookies</h2>
          <p>
            Most browsers let you view, delete, and block cookies through their settings. Blocking essential
            cookies may prevent you from signing in or using certain features of online banking.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this cookie policy from time to time. Continued use of our website after an update
            constitutes acceptance of the revised policy.
          </p>

          <h2>Questions</h2>
          <p>If you have questions about our use of cookies, contact customer care.</p>
        </div>
      </div>
      <PgFooter />
    </div>
  );
}
