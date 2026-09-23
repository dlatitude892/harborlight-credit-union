import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { IconEye, IconEyeOff } from '../components/icons';
import '../marketing.css';
import Logo from '../components/pg/Logo';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pub-site pg-auth-shell">
      <div className="pg-auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/">
            <Logo />
          </Link>
          <LanguageSwitcher compact />
        </div>
        <h1>{t('auth.welcomeBack')}</h1>
        <p>{t('auth.signInSubtitle')}</p>

        {error && <div className="pg-form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="pg-field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="pg-field">
            <label htmlFor="password">{t('auth.password')}</label>
            <div className="pg-password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="pg-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{ background: 'none', border: 'none', color: 'var(--pg-green)', fontSize: 13, cursor: 'pointer', padding: 0 }}
            >
              Forgot password?
            </button>
          </div>
          <button className="pg-btn pg-btn-primary" style={{ width: '100%' }} type="submit" disabled={submitting}>
            {submitting ? '…' : t('auth.signIn')}
          </button>
        </form>

        <div className="pg-auth-switch">
          {t('auth.newToHarborlight')} <Link to="/register">{t('auth.openAccount')}</Link>
        </div>
      </div>

      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </div>
  );
}
