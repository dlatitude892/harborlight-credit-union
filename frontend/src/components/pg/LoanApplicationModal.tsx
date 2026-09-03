import { useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import { IconClose } from '../icons';
import { IconCheck } from '../marketing-icons';

export type LoanType = 'HOME' | 'HOME_REFINANCE' | 'AUTO' | 'PERSONAL' | 'BUSINESS';

interface LoanApplicationModalProps {
  loanType: LoanType;
  onClose: () => void;
}

const titles: Record<LoanType, string> = {
  HOME: 'Home Loan Application',
  HOME_REFINANCE: 'Mortgage Refinance Application',
  AUTO: 'Auto Loan Application',
  PERSONAL: 'Personal Loan Application',
  BUSINESS: 'Small Business Lending Application',
};

const stepLabels = ['About You', 'Financial Information', 'Loan Details', 'Review', 'Submit'];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  preferredContactMethod: string;
  employer: string;
  annualIncome: string;
  employmentStatus: string;
  requestedAmount: string;
  loanTerm: string;
  purpose: string;
  propertyInfo: string;
  estimatedPropertyValue: string;
  downPayment: string;
  purchaseOrRefinance: string;
  currentMortgageBalance: string;
  currentInterestRate: string;
  remainingLoanTerm: string;
  vehicleType: string;
  newOrUsed: string;
  estimatedVehiclePrice: string;
  creditRange: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  yearsInBusiness: string;
  annualRevenueRange: string;
  numberOfEmployees: string;
}

const emptyForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  preferredContactMethod: 'Email',
  employer: '',
  annualIncome: '',
  employmentStatus: 'Employed',
  requestedAmount: '',
  loanTerm: '',
  purpose: '',
  propertyInfo: '',
  estimatedPropertyValue: '',
  downPayment: '',
  purchaseOrRefinance: 'Purchase',
  currentMortgageBalance: '',
  currentInterestRate: '',
  remainingLoanTerm: '',
  vehicleType: '',
  newOrUsed: 'New',
  estimatedVehiclePrice: '',
  creditRange: '670-739 (Good)',
  businessName: '',
  businessType: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  yearsInBusiness: '',
  annualRevenueRange: '',
  numberOfEmployees: '',
};

export default function LoanApplicationModal({ loanType, onClose }: LoanApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const isBusiness = loanType === 'BUSINESS';
  const isHome = loanType === 'HOME' || loanType === 'HOME_REFINANCE';

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.post<{ reference: string }>('/loan-applications', {
        loanType,
        fullName: isBusiness ? form.fullName : form.fullName,
        email: isBusiness ? form.businessEmail || form.email : form.email,
        phone: isBusiness ? form.businessPhone || form.phone : form.phone,
        address: form.address,
        preferredContactMethod: form.preferredContactMethod,
        employer: form.employer,
        annualIncome: form.annualIncome,
        employmentStatus: form.employmentStatus,
        requestedAmount: parseFloat(form.requestedAmount || '0'),
        loanTerm: form.loanTerm,
        purpose: form.purpose,
        propertyInfo: form.propertyInfo,
        estimatedPropertyValue: form.estimatedPropertyValue,
        downPayment: form.downPayment,
        purchaseOrRefinance: form.purchaseOrRefinance,
        currentMortgageBalance: form.currentMortgageBalance,
        currentInterestRate: form.currentInterestRate,
        remainingLoanTerm: form.remainingLoanTerm,
        vehicleType: form.vehicleType,
        newOrUsed: form.newOrUsed,
        estimatedVehiclePrice: form.estimatedVehiclePrice,
        creditRange: form.creditRange,
        businessName: form.businessName,
        businessType: form.businessType,
        businessAddress: form.businessAddress,
        businessPhone: form.businessPhone,
        businessEmail: form.businessEmail,
        yearsInBusiness: form.yearsInBusiness,
        annualRevenueRange: form.annualRevenueRange,
        numberOfEmployees: form.numberOfEmployees,
      });
      setReference(result.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 4) next();
    else if (step === 4) {
      setStep(5);
      handleSubmit();
    }
  };

  return (
    <div className="pg-modal-backdrop" onClick={onClose}>
      <div className="pg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pg-modal-head">
          <div>
            <h2>{titles[loanType]}</h2>
          </div>
          <button className="pg-modal-close" onClick={onClose} aria-label="Close">
            <IconClose style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {reference ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="pg-success-icon">
              <IconCheck />
            </div>
            <h2 style={{ marginBottom: 6 }}>Application Received</h2>
            <p className="pg-modal-sub" style={{ marginBottom: 4 }}>
              Thank you for submitting your application. Your request has been received and will be reviewed. A
              member of our team will contact you regarding the next steps.
            </p>
            <div className="pg-reference-code">{reference}</div>
            <button className="pg-btn pg-btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="pg-modal-sub">
              Submitting an application is a request for review and does not guarantee approval.
            </p>

            <div className="pg-steps">
              {stepLabels.map((_, i) => (
                <div key={i} className={`pg-step-dot${i < step ? ' done' : ''}`} />
              ))}
            </div>
            <div className="pg-step-label">
              Step {Math.min(step, 4)} of 4 — {stepLabels[Math.min(step, 4) - 1]}
            </div>

            {error && <div className="pg-form-error">{error}</div>}

            <form onSubmit={handleFormSubmit}>
              {step === 1 && (
                <>
                  {isBusiness ? (
                    <>
                      <div className="pg-field">
                        <label>Business name</label>
                        <input required value={form.businessName} onChange={update('businessName')} />
                      </div>
                      <div className="pg-field">
                        <label>Business type</label>
                        <input required value={form.businessType} onChange={update('businessType')} placeholder="e.g. LLC, retail, restaurant" />
                      </div>
                      <div className="pg-field">
                        <label>Business address</label>
                        <input value={form.businessAddress} onChange={update('businessAddress')} />
                      </div>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Business phone</label>
                          <input required value={form.businessPhone} onChange={update('businessPhone')} />
                        </div>
                        <div className="pg-field">
                          <label>Business email</label>
                          <input required type="email" value={form.businessEmail} onChange={update('businessEmail')} />
                        </div>
                      </div>
                      <div className="pg-field">
                        <label>Owner / applicant name</label>
                        <input required value={form.fullName} onChange={update('fullName')} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pg-field">
                        <label>Full name</label>
                        <input required value={form.fullName} onChange={update('fullName')} />
                      </div>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Email address</label>
                          <input required type="email" value={form.email} onChange={update('email')} />
                        </div>
                        <div className="pg-field">
                          <label>Phone number</label>
                          <input required value={form.phone} onChange={update('phone')} />
                        </div>
                      </div>
                      <div className="pg-field">
                        <label>Current address</label>
                        <input value={form.address} onChange={update('address')} />
                      </div>
                      <div className="pg-field">
                        <label>Preferred contact method</label>
                        <select value={form.preferredContactMethod} onChange={update('preferredContactMethod')}>
                          <option>Email</option>
                          <option>Phone</option>
                          <option>Text</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  {isBusiness ? (
                    <>
                      <div className="pg-field">
                        <label>Years in business</label>
                        <input value={form.yearsInBusiness} onChange={update('yearsInBusiness')} />
                      </div>
                      <div className="pg-field">
                        <label>Annual revenue range</label>
                        <select value={form.annualRevenueRange} onChange={update('annualRevenueRange')}>
                          <option value="">Select a range</option>
                          <option>Under $100,000</option>
                          <option>$100,000 - $500,000</option>
                          <option>$500,000 - $1,000,000</option>
                          <option>$1,000,000+</option>
                        </select>
                      </div>
                      <div className="pg-field">
                        <label>Number of employees</label>
                        <input value={form.numberOfEmployees} onChange={update('numberOfEmployees')} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pg-field">
                        <label>Employer</label>
                        <input value={form.employer} onChange={update('employer')} />
                      </div>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Employment status</label>
                          <select value={form.employmentStatus} onChange={update('employmentStatus')}>
                            <option>Employed</option>
                            <option>Self-employed</option>
                            <option>Retired</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div className="pg-field">
                          <label>Annual income</label>
                          <input value={form.annualIncome} onChange={update('annualIncome')} placeholder="$" />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  {loanType === 'HOME' && (
                    <>
                      <div className="pg-field">
                        <label>Property information</label>
                        <input value={form.propertyInfo} onChange={update('propertyInfo')} placeholder="Address or description" />
                      </div>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Estimated property value</label>
                          <input value={form.estimatedPropertyValue} onChange={update('estimatedPropertyValue')} placeholder="$" />
                        </div>
                        <div className="pg-field">
                          <label>Down payment</label>
                          <input value={form.downPayment} onChange={update('downPayment')} placeholder="$" />
                        </div>
                      </div>
                      <div className="pg-field">
                        <label>Purchase or refinance</label>
                        <select value={form.purchaseOrRefinance} onChange={update('purchaseOrRefinance')}>
                          <option>Purchase</option>
                          <option>Refinance</option>
                        </select>
                      </div>
                    </>
                  )}

                  {loanType === 'HOME_REFINANCE' && (
                    <>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Current mortgage balance</label>
                          <input value={form.currentMortgageBalance} onChange={update('currentMortgageBalance')} placeholder="$" />
                        </div>
                        <div className="pg-field">
                          <label>Current interest rate</label>
                          <input value={form.currentInterestRate} onChange={update('currentInterestRate')} placeholder="%" />
                        </div>
                      </div>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Estimated property value</label>
                          <input value={form.estimatedPropertyValue} onChange={update('estimatedPropertyValue')} placeholder="$" />
                        </div>
                        <div className="pg-field">
                          <label>Remaining loan term</label>
                          <input value={form.remainingLoanTerm} onChange={update('remainingLoanTerm')} placeholder="years" />
                        </div>
                      </div>
                      <div className="pg-field">
                        <label>Reason for refinancing</label>
                        <input value={form.purpose} onChange={update('purpose')} />
                      </div>
                    </>
                  )}

                  {loanType === 'AUTO' && (
                    <>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Vehicle type</label>
                          <input value={form.vehicleType} onChange={update('vehicleType')} placeholder="e.g. Sedan, SUV, truck" />
                        </div>
                        <div className="pg-field">
                          <label>New or used</label>
                          <select value={form.newOrUsed} onChange={update('newOrUsed')}>
                            <option>New</option>
                            <option>Used</option>
                          </select>
                        </div>
                      </div>
                      <div className="pg-field">
                        <label>Estimated vehicle price</label>
                        <input value={form.estimatedVehiclePrice} onChange={update('estimatedVehiclePrice')} placeholder="$" />
                      </div>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Desired loan term</label>
                          <input value={form.loanTerm} onChange={update('loanTerm')} placeholder="e.g. 60 months" />
                        </div>
                        <div className="pg-field">
                          <label>Approximate credit range</label>
                          <select value={form.creditRange} onChange={update('creditRange')}>
                            <option>800+ (Excellent)</option>
                            <option>740-799 (Very good)</option>
                            <option>670-739 (Good)</option>
                            <option>580-669 (Fair)</option>
                            <option>Below 580</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {loanType === 'PERSONAL' && (
                    <>
                      <div className="pg-field">
                        <label>Purpose of loan</label>
                        <input value={form.purpose} onChange={update('purpose')} />
                      </div>
                      <div className="pg-field-row">
                        <div className="pg-field">
                          <label>Desired loan term</label>
                          <input value={form.loanTerm} onChange={update('loanTerm')} placeholder="e.g. 36 months" />
                        </div>
                        <div className="pg-field">
                          <label>Approximate credit score range</label>
                          <select value={form.creditRange} onChange={update('creditRange')}>
                            <option>800+ (Excellent)</option>
                            <option>740-799 (Very good)</option>
                            <option>670-739 (Good)</option>
                            <option>580-669 (Fair)</option>
                            <option>Below 580</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {isBusiness && (
                    <div className="pg-field">
                      <label>Purpose of financing</label>
                      <select value={form.purpose} onChange={update('purpose')}>
                        <option value="">Select a purpose</option>
                        <option>Business expansion</option>
                        <option>Equipment</option>
                        <option>Working capital</option>
                        <option>Commercial needs</option>
                        <option>Business development</option>
                      </select>
                    </div>
                  )}

                  <div className="pg-field">
                    <label>{isHome ? 'Desired loan amount' : 'Requested loan amount'}</label>
                    <input required type="number" min="1" value={form.requestedAmount} onChange={update('requestedAmount')} placeholder="$" />
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="pg-review-list">
                  <div className="pg-review-row">
                    <span>Applicant</span>
                    <span>{isBusiness ? form.businessName : form.fullName}</span>
                  </div>
                  <div className="pg-review-row">
                    <span>Contact</span>
                    <span>
                      {isBusiness ? form.businessEmail || form.email : form.email} · {isBusiness ? form.businessPhone || form.phone : form.phone}
                    </span>
                  </div>
                  <div className="pg-review-row">
                    <span>Requested amount</span>
                    <span>${form.requestedAmount || '0'}</span>
                  </div>
                  {form.purpose && (
                    <div className="pg-review-row">
                      <span>Purpose</span>
                      <span>{form.purpose}</span>
                    </div>
                  )}
                  <div className="pg-review-row">
                    <span>Loan type</span>
                    <span>{titles[loanType]}</span>
                  </div>
                </div>
              )}

              {step === 5 && !reference && !error && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--pg-text-secondary)', fontSize: 13.5 }}>
                  Submitting your application…
                </div>
              )}

              {step < 5 && (
                <div className="pg-modal-actions">
                  {step > 1 ? (
                    <button type="button" className="pg-btn pg-btn-ghost" onClick={back}>
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="submit" className="pg-btn pg-btn-primary" disabled={submitting}>
                    {step === 4 ? 'Submit application' : 'Continue'}
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
