'use client';

import { useState } from 'react';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:        #0d1b2a;
    --navy-light:  #1b2838;
    --navy-dark:   #050a0f;
    --blue:        #1a73e8;
    --blue-light:  #4a8ff0;
    --blue-dark:   #0d5bc4;
    --green:       #2bc48a;
    --green-dark:  #1fa872;
    --green-light: #5bd4a5;
    --danger:      #ef4444;
    --card-bg:     #0e1c2c;
    --card-border: rgba(255,255,255,0.08);
    --muted:       rgba(255,255,255,0.42);
  }

  /* ── ROOT ── */
  .fp-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: linear-gradient(145deg, var(--navy-dark) 0%, #0a1520 50%, #0c1a30 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 1.5rem; position: relative; overflow: hidden;
  }

  /* bg grid */
  .fp-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(26,115,232,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,115,232,0.035) 1px, transparent 1px);
    background-size: 50px 50px;
  }

  /* orbs */
  .fp-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(90px); }
  .fp-orb-1 { width: 420px; height: 420px; background: rgba(26,115,232,0.12);  top: -140px;    right: -80px; }
  .fp-orb-2 { width: 300px; height: 300px; background: rgba(43,196,138,0.09);  bottom: -90px;  left: -70px; }

  /* ── CARD ── */
  .fp-card {
    width: 100%; max-width: 430px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 22px;
    padding: 2.5rem 2rem;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(26,115,232,0.06);
    position: relative; z-index: 1;
    animation: fp-rise 0.5s cubic-bezier(.22,1,.36,1) both;
  }
  @media (min-width: 480px) { .fp-card { padding: 2.75rem 2.5rem; } }
  @keyframes fp-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

  /* blue top accent */
  .fp-card::before {
    content: ''; position: absolute;
    top: 0; left: 2rem; right: 2rem; height: 3px;
    background: linear-gradient(90deg, transparent, var(--blue), transparent);
    border-radius: 0 0 3px 3px; opacity: 0.6;
  }

  /* ── ICON ── */
  .fp-icon-wrap {
    width: 66px; height: 66px; border-radius: 18px; margin: 0 auto 1.5rem;
    background: rgba(26,115,232,0.1); border: 1.5px solid rgba(26,115,232,0.25);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 28px rgba(26,115,232,0.15);
    animation: fp-float 4s ease-in-out infinite;
  }
  @keyframes fp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

  .fp-icon-wrap.sent-state {
    background: rgba(43,196,138,0.1); border-color: rgba(43,196,138,0.3);
    box-shadow: 0 0 28px rgba(43,196,138,0.15);
    animation: fp-scale-in 0.4s cubic-bezier(.175,.885,.32,1.275) both;
  }
  @keyframes fp-scale-in { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }

  /* ── HEADINGS ── */
  .fp-title {
    text-align: center; font-size: 1.55rem; font-weight: 800;
    letter-spacing: -0.03em; color: #fff; margin-bottom: 0.4rem;
  }
  .fp-sub {
    text-align: center; font-size: 0.875rem; color: var(--muted);
    line-height: 1.65; margin-bottom: 1.75rem;
  }

  /* ── STEP INDICATOR ── */
  .fp-steps {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 1.75rem;
  }
  .fp-step {
    flex: 1; height: 3px; border-radius: 3px;
    background: rgba(255,255,255,0.08);
    transition: background 0.4s;
  }
  .fp-step.active   { background: var(--blue); }
  .fp-step.complete { background: var(--green); }

  /* ── SUCCESS STATE ── */
  .fp-sent-body { text-align: center; animation: fp-fadein 0.4s ease both; }
  @keyframes fp-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .fp-sent-title { font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
  .fp-sent-sub   { font-size: 0.875rem; color: var(--muted); line-height: 1.75; max-width: 300px; margin: 0 auto; }

  .fp-sent-email-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(43,196,138,0.08); border: 1px solid rgba(43,196,138,0.22);
    color: var(--green-light); font-size: 0.82rem; font-weight: 700;
    font-family: 'Space Mono', monospace;
    padding: 0.35rem 0.9rem; border-radius: 8px;
    margin: 1rem auto 0; display: flex; justify-content: center; width: fit-content;
  }

  .fp-sent-steps {
    margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0;
    text-align: left;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; overflow: hidden;
  }
  .fp-sent-step {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .fp-sent-step:last-child { border-bottom: none; }
  .fp-step-num {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
    background: rgba(26,115,232,0.15); border: 1px solid rgba(26,115,232,0.3);
    color: var(--blue-light); font-size: 0.65rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center; margin-top: 1px;
  }
  .fp-step-text { font-size: 0.8rem; color: rgba(255,255,255,0.55); line-height: 1.6; }

  .fp-resend-row {
    text-align: center; margin-top: 1.25rem;
    font-size: 0.82rem; color: var(--muted);
  }
  .fp-resend-link {
    color: var(--blue-light); font-weight: 700; cursor: pointer;
    background: none; border: none; font-family: inherit; font-size: inherit;
    transition: color .2s; text-decoration: none;
  }
  .fp-resend-link:hover { color: var(--blue); }

  /* ── FORM FIELD ── */
  .fp-field { margin-bottom: 1.25rem; }
  .fp-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; font-weight: 700;
    color: rgba(255,255,255,0.6); margin-bottom: 0.48rem; letter-spacing: 0.02em;
  }
  .fp-input-wrap { position: relative; }
  .fp-input-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.22); pointer-events: none; display: flex; align-items: center;
  }
  .fp-input {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #fff;
    padding: 0.8rem 0.9rem 0.8rem 2.6rem;
    font-size: 0.9rem; font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none; -webkit-appearance: none;
  }
  .fp-input::placeholder { color: rgba(255,255,255,0.22); }
  .fp-input:focus {
    border-color: var(--blue);
    background: rgba(26,115,232,0.06);
    box-shadow: 0 0 0 3px rgba(26,115,232,0.15);
  }
  .fp-input:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── SUBMIT ── */
  .fp-submit {
    width: 100%; padding: 0.9rem;
    background: var(--blue); border: none; border-radius: 10px;
    color: #fff; font-size: 0.95rem; font-weight: 700;
    font-family: inherit; cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 0 24px rgba(26,115,232,0.35);
    letter-spacing: 0.01em;
  }
  .fp-submit:hover:not(:disabled) {
    background: var(--blue-dark); transform: translateY(-1px);
    box-shadow: 0 0 34px rgba(26,115,232,0.45);
  }
  .fp-submit:active:not(:disabled) { transform: translateY(0); }
  .fp-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* spinner */
  .fp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff; animation: fp-spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes fp-spin { to { transform: rotate(360deg); } }

  /* ── DIVIDER ── */
  .fp-divider {
    display: flex; align-items: center; gap: 0.75rem;
    margin: 1.4rem 0; font-size: 0.77rem; color: rgba(255,255,255,0.17);
  }
  .fp-divider::before, .fp-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07);
  }

  /* ── BACK TO LOGIN ── */
  .fp-back {
    text-align: center; font-size: 0.84rem; color: rgba(255,255,255,0.38);
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .fp-back-link {
    color: var(--blue-light); font-weight: 700; text-decoration: none;
    transition: color 0.2s; display: flex; align-items: center; gap: 4px;
  }
  .fp-back-link:hover { color: var(--blue); }

  /* ── SECURITY BADGE ── */
  .fp-sec-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 1.5rem; font-size: 0.76rem; color: rgba(255,255,255,0.2);
    position: relative; z-index: 1;
  }

  /* toast */
  .Toastify__toast { font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: .875rem !important; border-radius: 10px !important; }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }
`;

/* ── icons ── */
const KeyIcon = ({ color = 'var(--blue-light)', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const MailCheckIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
    <path d="M9 12l2 2 4-4" strokeWidth="2.5"/>
  </svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSentEmail(email);
        setEmail('');
        setSent(true);
        toast.success(data.message || 'Reset link sent! Check your inbox.', { autoClose: 3000 });
      } else {
        toast.error(data.message || 'Failed to send reset email. Please try again.', { autoClose: 4500 });
      }
    } catch {
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── resend ── */
  const handleResend = async () => {
    if (!sentEmail) return;
    setLoading(true);
    try {
      const response = await fetch('${API_URL}/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Reset link resent! Check your inbox.', { autoClose: 3000 });
      } else {
        toast.error(data.message || 'Failed to resend. Please try again.', { autoClose: 4000 });
      }
    } catch {
      toast.error('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      <ToastContainer
        position="top-right"
        transition={Slide}
        closeButton={false}
        hideProgressBar={false}
        newestOnTop
        pauseOnHover
        theme="dark"
      />

      <div className="fp-root">
        <div className="fp-grid" />
        <div className="fp-orb fp-orb-1" />
        <div className="fp-orb fp-orb-2" />

        <div style={{ width: '100%', maxWidth: 430, position: 'relative', zIndex: 1 }}>

          {/* ── CARD ── */}
          <div className="fp-card">

            {/* icon */}
            <div className={`fp-icon-wrap${sent ? ' sent-state' : ''}`}>
              {sent ? <MailCheckIcon size={28} /> : <KeyIcon size={28} />}
            </div>

            {/* step indicators */}
            <div className="fp-steps">
              <div className={`fp-step${sent ? ' complete' : ' active'}`} />
              <div className={`fp-step${sent ? ' active' : ''}`} />
              <div className="fp-step" />
            </div>

            {/* ── SENT STATE ── */}
            {sent ? (
              <div className="fp-sent-body">
                <div className="fp-sent-title">Check your inbox</div>
                <div className="fp-sent-sub">
                  We sent a password reset link to your email address.
                </div>
                <div className="fp-sent-email-chip">
                  <MailIcon />
                  {sentEmail}
                </div>

                <div className="fp-sent-steps">
                  {[
                    'Open the email from SecurePay',
                    'Click the "Reset Password" link',
                    'Create your new secure password',
                  ].map((step, i) => (
                    <div className="fp-sent-step" key={i}>
                      <div className="fp-step-num">{i + 1}</div>
                      <div className="fp-step-text">{step}</div>
                    </div>
                  ))}
                </div>

                <div className="fp-resend-row">
                  Didn't receive it?{' '}
                  <button
                    className="fp-resend-link"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    {loading ? 'Sending…' : 'Resend email'}
                  </button>
                </div>

                <div className="fp-divider">or</div>

                <div style={{ textAlign: 'center' }}>
                  <a href="/login" className="fp-back-link">
                    <ArrowLeftIcon />
                    Back to login
                  </a>
                </div>
              </div>

            ) : (
              /* ── FORM STATE ── */
              <>
                <h1 className="fp-title">Forgot Password?</h1>
                <p className="fp-sub">
                  Enter your registered email and we'll send you a secure reset link instantly.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="fp-field">
                    <label className="fp-label" htmlFor="email">
                      <MailIcon /> Email Address
                    </label>
                    <div className="fp-input-wrap">
                      <span className="fp-input-icon"><MailIcon /></span>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="fp-input"
                        required
                        disabled={loading}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="fp-submit"
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <><span className="fp-spinner" /> Sending reset link…</>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRightIcon />
                      </>
                    )}
                  </button>
                </form>

                <div className="fp-divider">or</div>

                <div className="fp-back">
                  Remember your password?{' '}
                  <a href="/login" className="fp-back-link">
                    <ArrowLeftIcon /> Back to login
                  </a>
                </div>
              </>
            )}

          </div>

          {/* security badge */}
          <div className="fp-sec-badge">
            <ShieldIcon />
            Reset links expire after 15 minutes for your security
          </div>

        </div>
      </div>
    </>
  );
}