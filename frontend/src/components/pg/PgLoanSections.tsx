import { useState } from 'react';
import { IconHouse, IconGraduationCap, IconUsers } from '../marketing-icons';
import { IconCard } from '../icons';
import LoanApplicationModal, { type LoanType } from './LoanApplicationModal';
import { useReveal } from '../../hooks/useReveal';

export default function PgLoanSections() {
  const [activeLoan, setActiveLoan] = useState<LoanType | null>(null);

  const home = useReveal<HTMLDivElement>();
  const auto = useReveal<HTMLDivElement>();
  const personal = useReveal<HTMLDivElement>();
  const business = useReveal<HTMLDivElement>();

  return (
    <div className="pg-container">
      <div id="home-loans" ref={home.ref} className={`pg-loan-section ${home.className}`}>
        <div className="pg-loan-copy">
          <span className="pg-eyebrow">Home &amp; mortgage</span>
          <h2>Find Your Way Home</h2>
          <p>
            Whether you're purchasing your first home, moving into your next chapter, or looking for a better way to
            manage your existing mortgage, explore home financing options designed around your goals.
          </p>
          <div className="pg-loan-actions">
            <button className="pg-btn pg-btn-primary" onClick={() => setActiveLoan('HOME')}>
              Apply for a Home Loan
            </button>
            <button className="pg-btn pg-btn-ghost" onClick={() => setActiveLoan('HOME_REFINANCE')}>
              Explore Mortgage Refinance
            </button>
          </div>
        </div>
        <div className="pg-loan-visual">
          <span className="pg-feature-icon">
            <IconHouse />
          </span>
          <div className="pg-loan-visual-row">
            <span>Rate</span>
            <span>from 5.89% APR¹</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>Term options</span>
            <span>15, 20, or 30 years</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>Down payment</span>
            <span>As low as 3%</span>
          </div>
        </div>
      </div>

      <div id="auto-loans" ref={auto.ref} className={`pg-loan-section pg-reverse ${auto.className}`}>
        <div className="pg-loan-copy">
          <span className="pg-eyebrow">Auto financing</span>
          <h2>Drive Forward With Confidence</h2>
          <p>
            Whether you're purchasing a new vehicle or a dependable used vehicle, Harborlight can help you explore
            financing options that fit your budget and financial goals.
          </p>
          <div className="pg-loan-actions">
            <button className="pg-btn pg-btn-primary" onClick={() => setActiveLoan('AUTO')}>
              Apply for an Auto Loan
            </button>
          </div>
        </div>
        <div className="pg-loan-visual">
          <span className="pg-feature-icon">
            <IconCard />
          </span>
          <div className="pg-loan-visual-row">
            <span>Rate</span>
            <span>from 6.25% APR¹</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>New or used</span>
            <span>Both eligible</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>Terms up to</span>
            <span>72 months</span>
          </div>
        </div>
      </div>

      <div id="personal-loans" ref={personal.ref} className={`pg-loan-section ${personal.className}`}>
        <div className="pg-loan-copy">
          <span className="pg-eyebrow">Personal financing</span>
          <h2>A Loan Designed Around Your Goals</h2>
          <p>
            Life doesn't always follow a plan. A personal loan can provide financing for eligible personal needs,
            planned expenses, or other financial goals.
          </p>
          <div className="pg-loan-actions">
            <button className="pg-btn pg-btn-primary" onClick={() => setActiveLoan('PERSONAL')}>
              Apply for a Personal Loan
            </button>
          </div>
        </div>
        <div className="pg-loan-visual">
          <span className="pg-feature-icon">
            <IconGraduationCap />
          </span>
          <div className="pg-loan-visual-row">
            <span>Rate</span>
            <span>from 8.49% APR¹</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>Loan amounts</span>
            <span>$1,000 - $50,000</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>No collateral</span>
            <span>Unsecured</span>
          </div>
        </div>
      </div>

      <div id="business-lending" ref={business.ref} className={`pg-loan-section pg-reverse ${business.className}`}>
        <div className="pg-loan-copy">
          <span className="pg-eyebrow">Business banking</span>
          <h2>Helping Businesses Move Forward</h2>
          <p>
            Your business has plans. We can help you explore financing options that support those plans — from
            managing cash flow to investing in equipment, expansion, or other eligible business needs.
          </p>
          <div className="pg-loan-actions">
            <button className="pg-btn pg-btn-primary" onClick={() => setActiveLoan('BUSINESS')}>
              Explore Business Lending
            </button>
          </div>
        </div>
        <div className="pg-loan-visual">
          <span className="pg-feature-icon">
            <IconUsers />
          </span>
          <div className="pg-loan-visual-row">
            <span>Rate</span>
            <span>from 7.10% APR¹</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>Lines of credit</span>
            <span>Available</span>
          </div>
          <div className="pg-loan-visual-row">
            <span>Equipment financing</span>
            <span>Available</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--pg-text-tertiary)', marginTop: 12 }}>
        ¹ APR = Annual Percentage Rate. Rates shown are the lowest available, vary by creditworthiness, term, and
        collateral, and are subject to change.
      </p>

      {activeLoan && <LoanApplicationModal loanType={activeLoan} onClose={() => setActiveLoan(null)} />}
    </div>
  );
}
