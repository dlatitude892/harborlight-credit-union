import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SESSION_EXPIRED_EVENT } from '../api/client';

const IDLE_LIMIT_MS = 15 * 60 * 1000; // sign out after 15 minutes idle
const WARNING_MS = 60 * 1000; // show the warning for the last 60 seconds
const ACTIVITY_KEY = 'harborlight_last_activity';
const WRITE_THROTTLE_MS = 5000;

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;

// Last activity lives in localStorage rather than component state so every
// open tab shares it - working in one tab keeps the others signed in, and
// a timeout in one tab signs them all out.
const readLastActivity = () => Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now();
const writeLastActivity = () => localStorage.setItem(ACTIVITY_KEY, String(Date.now()));

/**
 * Mounted only while someone is signed in. Handles both ways a session ends
 * on its own: inactivity, and the server rejecting an expired token.
 */
export default function SessionGuard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const warningShownRef = useRef(false);
  const lastWriteRef = useRef(0);

  const signOut = useCallback(
    (reason: 'timeout' | 'expired') => {
      localStorage.removeItem(ACTIVITY_KEY);
      navigate(`/login?reason=${reason}`, { replace: true });
      logout();
    },
    [logout, navigate]
  );

  const staySignedIn = () => {
    writeLastActivity();
    warningShownRef.current = false;
    setSecondsLeft(null);
  };

  useEffect(() => {
    // Signing in (or reloading while signed in) counts as activity - this
    // also stops a stale timestamp from a previous session signing the
    // member straight back out.
    writeLastActivity();
    lastWriteRef.current = Date.now();

    const onActivity = () => {
      // Once the warning is up, the member has to actively choose to stay -
      // an accidental mouse twitch shouldn't silently dismiss it.
      if (warningShownRef.current) return;
      const now = Date.now();
      if (now - lastWriteRef.current > WRITE_THROTTLE_MS) {
        lastWriteRef.current = now;
        writeLastActivity();
      }
    };

    const check = () => {
      const idle = Date.now() - readLastActivity();
      if (idle >= IDLE_LIMIT_MS) {
        signOut('timeout');
      } else if (idle >= IDLE_LIMIT_MS - WARNING_MS) {
        warningShownRef.current = true;
        setSecondsLeft(Math.ceil((IDLE_LIMIT_MS - idle) / 1000));
      } else if (warningShownRef.current) {
        // Activity in another tab pushed the deadline back
        warningShownRef.current = false;
        setSecondsLeft(null);
      }
    };

    const onExpired = () => signOut('expired');

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    // Background tabs (and phones that went to sleep) throttle timers, so
    // re-check the moment the page becomes visible again.
    document.addEventListener('visibilitychange', check);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    const interval = window.setInterval(check, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.clearInterval(interval);
    };
  }, [signOut]);

  if (secondsLeft === null) return null;

  return (
    <div className="session-warning-backdrop">
      <div className="modal session-warning" role="alertdialog" aria-labelledby="session-warning-title">
        <h2 id="session-warning-title">Still there?</h2>
        <p className="modal-sub">
          For your security, you'll be signed out in <strong className="mono-figure">{secondsLeft}</strong>{' '}
          second{secondsLeft === 1 ? '' : 's'} due to inactivity.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => signOut('timeout')}>
            Sign out now
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={staySignedIn} autoFocus>
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
