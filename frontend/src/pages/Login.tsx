import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../marketing.css';
import Logo from '../components/pg/Logo';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="pg-btn pg-btn-primary" style={{ width: '100%' }} type="submit" disabled={submitting}>
            {submitting ? '…' : t('auth.signIn')}
          </button>
        </form>

        <div className="pg-auth-switch">
          {t('auth.newToHarborlight')} <Link to="/register">{t('auth.openAccount')}</Link>
        </div>
      </div>
    </div>
  );
}
