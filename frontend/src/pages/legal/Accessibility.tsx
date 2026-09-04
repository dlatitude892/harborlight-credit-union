import '../../marketing.css';
import PgHeader from '../../components/pg/PgHeader';
import PgFooter from '../../components/pg/PgFooter';

export default function Accessibility() {
  return (
    <div className="pub-site">
      <PgHeader />
      <div className="pg-container">
        <div className="pg-legal-page">
          <h1>Accessibility</h1>
          <p className="pg-updated">Last updated: January 2026</p>

          <p>
            Harborlight Credit Union is committed to making our website and online banking services usable by
            everyone, including members who use assistive technology.
          </p>

          <h2>Our approach</h2>
          <ul>
            <li>Semantic, keyboard-navigable page structure</li>
            <li>Sufficient color contrast for text and interactive elements</li>
            <li>Respect for reduced-motion preferences in animations</li>
            <li>Descriptive labels on forms and interactive controls</li>
          </ul>

          <h2>Ongoing work</h2>
          <p>
            Accessibility is an ongoing effort. We periodically review our site against recognized accessibility
            guidelines and welcome feedback on areas we can improve.
          </p>

          <h2>Let us know</h2>
          <p>
            If you encounter a barrier using our site, please contact customer care from the homepage so we can
            address it.
          </p>
        </div>
      </div>
      <PgFooter />
    </div>
  );
}
