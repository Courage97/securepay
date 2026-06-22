'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    --green-light: #5bd4a5;
    --danger:      #ef4444;
    --warning:     #f59e0b;
    --card-bg:     #101e2e;
    --card-border: rgba(255,255,255,0.08);
    --input-bg:    #0d1b2a;
    --muted:       rgba(255,255,255,0.45);
  }

  .lp-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: var(--navy-dark);
    display: flex;
    overflow: hidden;
  }

  /* ── LEFT PANEL ── */
  .lp-left {
    display: none;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
    overflow: hidden;
    background: linear-gradient(160deg, var(--navy-dark) 0%, #0a1628 50%, #0f2040 100%);
  }
  @media (min-width: 1024px) {
    .lp-left { display: flex; width: 46%; flex-shrink: 0; }
  }

  /* background grid */
  .lp-grid-bg {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(26,115,232,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,115,232,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  /* orbs */
  .lp-orb {
    position: absolute; border-radius: 50%;
    pointer-events: none; filter: blur(80px);
  }
  .lp-orb-1 { width: 380px; height: 380px; background: rgba(26,115,232,0.18); top: -120px; right: -80px; }
  .lp-orb-2 { width: 280px; height: 280px; background: rgba(43,196,138,0.12); bottom: -60px; left: -60px; }

  /* brand */
  .lp-brand {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; position: relative; z-index: 1;
  }
  .lp-brand-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: var(--blue);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(26,115,232,0.5);
    flex-shrink: 0;
  }
  .lp-brand-name {
    font-size: 1.2rem; font-weight: 800; color: #fff; letter-spacing: -0.02em;
  }

  /* left content */
  .lp-left-body {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; gap: 2rem;
  }
  .lp-left-tag {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(43,196,138,0.1); border: 1px solid rgba(43,196,138,0.28);
    color: var(--green); font-size: 0.72rem; font-weight: 700;
    padding: 0.3rem 0.85rem; border-radius: 100px;
    letter-spacing: 0.07em; text-transform: uppercase; width: fit-content;
  }
  .lp-left-tag-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--green);
    animation: lp-pulse 2s infinite;
  }
  @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }

  .lp-left-heading {
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; color: #fff;
  }
  .lp-left-heading span {
    background: linear-gradient(90deg, var(--blue-light), var(--green));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .lp-left-sub {
    font-size: 0.9rem; color: var(--muted); line-height: 1.75;
  }

  /* feature pills */
  .lp-pills { display: flex; flex-direction: column; gap: 0.65rem; }
  .lp-pill {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 0.7rem 1rem;
    transition: background 0.2s;
  }
  .lp-pill:hover { background: rgba(255,255,255,0.06); }
  .lp-pill-icon {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .lp-pill-icon-1 { background: rgba(26,115,232,0.15); }
  .lp-pill-icon-2 { background: rgba(43,196,138,0.15); }
  .lp-pill-icon-3 { background: rgba(245,158,11,0.15); }
  .lp-pill-text { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.75); }
  .lp-pill-sub  { font-size: 0.75rem; color: var(--muted); margin-top: 1px; }

  /* left footer */
  .lp-left-footer {
    position: relative; z-index: 1;
    font-size: 0.78rem; color: rgba(255,255,255,0.22);
  }

  /* ── RIGHT PANEL ── */
  .lp-right {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0a141f 0%, var(--navy) 100%);
    position: relative;
  }
  @media (min-width: 640px) { .lp-right { padding: 2.5rem; } }

  .lp-right-orb {
    position: absolute; width: 350px; height: 350px; border-radius: 50%;
    background: rgba(26,115,232,0.08); filter: blur(70px);
    top: -80px; right: -80px; pointer-events: none;
  }

  .lp-form-wrap {
    width: 100%; max-width: 420px;
    position: relative; z-index: 1;
    animation: lp-fadein 0.5s ease both;
  }
  @keyframes lp-fadein {
    from { opacity:0; transform: translateY(16px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* mobile brand (shown only on mobile) */
  .lp-mobile-brand {
    display: flex; align-items: center; gap: 10px;
    justify-content: center; margin-bottom: 2rem;
  }
  @media (min-width: 1024px) { .lp-mobile-brand { display: none; } }
  .lp-mobile-brand-icon {
    width: 36px; height: 36px; border-radius: 9px;
    background: var(--blue); display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 18px rgba(26,115,232,0.45);
  }
  .lp-mobile-brand-name { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

  /* headings */
  .lp-form-title {
    font-size: clamp(1.6rem, 4vw, 2rem); font-weight: 800;
    letter-spacing: -0.03em; color: #fff; margin-bottom: 0.4rem;
  }
  .lp-form-sub { font-size: 0.88rem; color: var(--muted); margin-bottom: 2rem; }

  /* card */
  .lp-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 18px;
    padding: 2rem 1.75rem;
    box-shadow: 0 24px 60px rgba(0,0,0,0.45);
  }
  @media (min-width: 480px) { .lp-card { padding: 2.25rem 2rem; } }

  /* risk banner */
  .lp-risk-banner {
    border-radius: 10px; padding: 0.9rem 1rem;
    margin-bottom: 1.4rem; display: flex; align-items: flex-start; gap: 10px;
    animation: lp-fadein 0.3s ease both;
  }
  .lp-risk-banner-low  { background: rgba(43,196,138,0.08);  border: 1px solid rgba(43,196,138,0.25); }
  .lp-risk-banner-med  { background: rgba(245,158,11,0.08);  border: 1px solid rgba(245,158,11,0.25); }
  .lp-risk-banner-high { background: rgba(239,68,68,0.08);   border: 1px solid rgba(239,68,68,0.25); }
  .lp-risk-icon {
    width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
  }
  .lp-risk-icon-low  { background: rgba(43,196,138,0.15);  color: var(--green); }
  .lp-risk-icon-med  { background: rgba(245,158,11,0.15);  color: var(--warning); }
  .lp-risk-icon-high { background: rgba(239,68,68,0.15);   color: var(--danger); }
  .lp-risk-content { flex: 1; }
  .lp-risk-title { font-size: 0.83rem; font-weight: 700; margin-bottom: 0.25rem; }
  .lp-risk-title-low  { color: var(--green); }
  .lp-risk-title-med  { color: var(--warning); }
  .lp-risk-title-high { color: var(--danger); }
  .lp-risk-score { font-size: 0.77rem; color: var(--muted); }
  .lp-risk-badge {
    font-size: 0.67rem; font-weight: 700; padding: 0.18rem 0.6rem;
    border-radius: 100px; text-transform: uppercase; letter-spacing: 0.06em;
    white-space: nowrap; flex-shrink: 0;
  }
  .lp-risk-badge-low  { background: rgba(43,196,138,0.15); color: var(--green); }
  .lp-risk-badge-med  { background: rgba(245,158,11,0.15); color: var(--warning); }
  .lp-risk-badge-high { background: rgba(239,68,68,0.15);  color: var(--danger); }

  /* redirect loading */
  .lp-redirect {
    display: flex; align-items: center; gap: 8px;
    margin-top: 0.6rem; font-size: 0.77rem; color: var(--muted);
  }
  .lp-redirect-dots span {
    display: inline-block; width: 4px; height: 4px; border-radius: 50%;
    background: var(--muted); margin: 0 1.5px;
    animation: lp-bounce 1.2s infinite;
  }
  .lp-redirect-dots span:nth-child(2) { animation-delay: 0.2s; }
  .lp-redirect-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes lp-bounce { 0%,80%,100%{transform:scale(0.6);opacity:.5} 40%{transform:scale(1);opacity:1} }

  /* fields */
  .lp-field { margin-bottom: 1.25rem; }
  .lp-label {
    display: block; font-size: 0.8rem; font-weight: 700;
    color: rgba(255,255,255,0.65); margin-bottom: 0.5rem; letter-spacing: 0.02em;
  }
  .lp-input-wrap { position: relative; }
  .lp-input-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.25); pointer-events: none;
    display: flex; align-items: center;
  }
  .lp-input {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #fff;
    padding: 0.8rem 0.9rem 0.8rem 2.6rem;
    font-size: 0.9rem; font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none; -webkit-appearance: none;
  }
  .lp-input::placeholder { color: rgba(255,255,255,0.22); }
  .lp-input:focus {
    border-color: var(--blue);
    background: rgba(26,115,232,0.06);
    box-shadow: 0 0 0 3px rgba(26,115,232,0.18);
  }
  .lp-input:disabled { opacity: 0.5; cursor: not-allowed; }

  /* password toggle */
  .lp-pw-toggle {
    position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    color: rgba(255,255,255,0.3); transition: color 0.2s; display: flex;
  }
  .lp-pw-toggle:hover { color: rgba(255,255,255,0.7); }

  /* row */
  .lp-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem; gap: 0.5rem; flex-wrap: wrap;
  }
  .lp-check-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.82rem; color: rgba(255,255,255,0.5); cursor: pointer;
    user-select: none;
  }
  .lp-check {
    width: 15px; height: 15px; border-radius: 4px;
    border: 1.5px solid rgba(255,255,255,0.2);
    accent-color: var(--blue); cursor: pointer;
  }
  .lp-forgot {
    font-size: 0.82rem; color: var(--blue-light);
    text-decoration: none; font-weight: 600; transition: color 0.2s;
  }
  .lp-forgot:hover { color: var(--blue); }

  /* submit */
  .lp-submit {
    width: 100%; padding: 0.88rem;
    background: var(--blue); border: none; border-radius: 10px;
    color: #fff; font-size: 0.95rem; font-weight: 700;
    font-family: inherit; cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 0 24px rgba(26,115,232,0.35);
    letter-spacing: 0.01em;
  }
  .lp-submit:hover:not(:disabled) {
    background: var(--blue-dark); transform: translateY(-1px);
    box-shadow: 0 0 34px rgba(26,115,232,0.45);
  }
  .lp-submit:active:not(:disabled) { transform: translateY(0); }
  .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* spinner */
  .lp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    animation: lp-spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes lp-spin { to { transform: rotate(360deg); } }

  /* divider */
  .lp-divider {
    display: flex; align-items: center; gap: 0.75rem;
    margin: 1.4rem 0; font-size: 0.78rem; color: rgba(255,255,255,0.18);
  }
  .lp-divider::before, .lp-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08);
  }

  /* register link */
  .lp-register-row {
    text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.4);
  }
  .lp-register-link {
    color: var(--blue-light); font-weight: 700; text-decoration: none;
    transition: color 0.2s;
  }
  .lp-register-link:hover { color: var(--blue); }

  /* security badge */
  .lp-sec-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 1.5rem; font-size: 0.77rem; color: rgba(255,255,255,0.25);
  }

  /* toast override */
  .Toastify__toast {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 0.875rem !important;
    border-radius: 10px !important;
  }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,0.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,0.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,0.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,0.3) !important; }
`;

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>
);

const pills = [
  {
    cls: "lp-pill-icon-1",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    ),
    text: "AI Risk Scoring",
    sub:  "Real-time threat analysis on every login"
  },
  {
    cls: "lp-pill-icon-2",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    text: "Adaptive MFA",
    sub:  "Extra steps only when risk demands it"
  },
  {
    cls: "lp-pill-icon-3",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    ),
    text: "Device Fingerprinting",
    sub:  "Recognizes your trusted devices instantly"
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData]     = useState({ username: '', password: '' });
  const [loading, setLoading]       = useState(false);
  const [riskInfo, setRiskInfo]     = useState(null);
  const [showPw, setShowPw]         = useState(false);
  const [remember, setRemember]     = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || riskInfo) return;
    setLoading(true);
    setRiskInfo(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'mfa_required') {
          setRiskInfo({
            score:     data.risk_score,
            level:     data.risk_level,
            sessionId: data.session_id,
            otpCode:   data.otp_code,
          });

          toast.warning('Additional verification required. Redirecting…', {
            icon: '🛡️', autoClose: 2500,
          });

          localStorage.setItem('mfa_session', JSON.stringify({
            session_id: data.session_id,
            otp_code:   data.otp_code,
            username:   formData.username,
          }));

          setTimeout(() => router.push('/verify-mfa'), 2000);

        } else if (data.status === 'success') {
          setRiskInfo({
            score: data.risk_score,
            level: data.risk_level,
          });

          toast.success('Login successful! Redirecting to dashboard…', {
            autoClose: 1800,
          });

          localStorage.setItem('access_token',  data.tokens.access);
          localStorage.setItem('refresh_token', data.tokens.refresh);
          localStorage.setItem('user',          JSON.stringify(data.user));

          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } else {
        toast.error(data.message || 'Invalid credentials. Please try again.', {
          autoClose: 4000,
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Unable to connect to server. Please try again.', {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  /* risk display helpers */
  const riskLevel = riskInfo?.level;
  const riskBannerCls = riskLevel === 'low' ? 'lp-risk-banner-low' : riskLevel === 'medium' ? 'lp-risk-banner-med' : 'lp-risk-banner-high';
  const riskIconCls   = riskLevel === 'low' ? 'lp-risk-icon-low'   : riskLevel === 'medium' ? 'lp-risk-icon-med'   : 'lp-risk-icon-high';
  const riskTitleCls  = riskLevel === 'low' ? 'lp-risk-title-low'  : riskLevel === 'medium' ? 'lp-risk-title-med'  : 'lp-risk-title-high';
  const riskBadgeCls  = riskLevel === 'low' ? 'lp-risk-badge-low'  : riskLevel === 'medium' ? 'lp-risk-badge-med'  : 'lp-risk-badge-high';
  const riskLabel     = riskLevel === 'low' ? '✓ Login Successful'
                      : riskLevel === 'medium' ? 'Additional Verification Required'
                      : 'High Risk Detected';
  const riskIcon      = riskLevel === 'low' ? '✓' : riskLevel === 'medium' ? '⚠' : '🛡';

  const disabled = loading || !!riskInfo;

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

      <div className="lp-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="lp-left">
          <div className="lp-grid-bg" />
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />

          {/* Brand */}
          <a href="/" className="lp-brand">
            <div className="lp-brand-icon"><LockIcon /></div>
            <span className="lp-brand-name">SecurePay</span>
          </a>

          {/* Body */}
          <div className="lp-left-body">
            <div className="lp-left-tag">
              <span className="lp-left-tag-dot" />
              AI Security Active
            </div>
            <div>
              <h2 className="lp-left-heading">
                Your Money,<br/>
                <span>always Protected</span>
              </h2>
              <p className="lp-left-sub" style={{ marginTop: '0.9rem' }}>
                Every login is silently analyzed across 10+ signals — so threats are stopped before they reach your account.
              </p>
            </div>
            <div className="lp-pills">
              {pills.map((p) => (
                <div className="lp-pill" key={p.text}>
                  <div className={`lp-pill-icon ${p.cls}`}>{p.icon}</div>
                  <div>
                    <div className="lp-pill-text">{p.text}</div>
                    <div className="lp-pill-sub">{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-left-footer">© 2026 SecurePay · All rights reserved</div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="lp-right">
          <div className="lp-right-orb" />

          <div className="lp-form-wrap">

            {/* Mobile brand */}
            <div className="lp-mobile-brand">
              <div className="lp-mobile-brand-icon"><LockIcon /></div>
              <span className="lp-mobile-brand-name">SecurePay</span>
            </div>

            <h1 className="lp-form-title">Welcome back</h1>
            <p className="lp-form-sub">Sign in to your SecurePay account</p>

            <div className="lp-card">

              {/* Risk banner */}
              {riskInfo && (
                <div className={`lp-risk-banner ${riskBannerCls}`}>
                  <div className={`lp-risk-icon ${riskIconCls}`}>{riskIcon}</div>
                  <div className="lp-risk-content">
                    <div className={`lp-risk-title ${riskTitleCls}`}>{riskLabel}</div>
                    <div className="lp-risk-score">Risk Score: {riskInfo.score} / 100</div>
                    {riskInfo.sessionId && (
                      <div className="lp-redirect">
                        <span>Redirecting to verification</span>
                        <span className="lp-redirect-dots">
                          <span/><span/><span/>
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`lp-risk-badge ${riskBadgeCls}`}>
                    {riskInfo.level} risk
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                {/* Username */}
                <div className="lp-field">
                  <label className="lp-label" htmlFor="username">Username</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className="lp-input"
                      required
                      autoComplete="username"
                      disabled={disabled}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lp-field">
                  <label className="lp-label" htmlFor="password">Password</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="lp-input"
                      required
                      autoComplete="current-password"
                      disabled={disabled}
                    />
                    <button
                      type="button"
                      className="lp-pw-toggle"
                      onClick={() => setShowPw(v => !v)}
                      tabIndex={-1}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="lp-row">
                  <label className="lp-check-label">
                    <input
                      type="checkbox"
                      className="lp-check"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <a href="/forgot-password" className="lp-forgot">Forgot password?</a>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="lp-submit"
                  disabled={disabled}
                >
                  {loading ? (
                    <>
                      <span className="lp-spinner" />
                      Checking security…
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>

              </form>

              <div className="lp-divider">or</div>

              <div className="lp-register-row">
                Don't have an account?{' '}
                <a href="/register" className="lp-register-link">Create one now</a>
              </div>

            </div>

            {/* Security badge */}
            <div className="lp-sec-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Protected by AI-powered pharming detection
            </div>

          </div>
        </div>

      </div>
    </>
  );
}