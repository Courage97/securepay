'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    --amber:       #f59e0b;
    --amber-light: #fbbf24;
    --amber-dark:  #d97706;
    --danger:      #ef4444;
    --card-bg:     #0e1c2c;
    --card-border: rgba(255,255,255,0.08);
    --muted:       rgba(255,255,255,0.42);
  }

  /* ── ROOT ── */
  .mv-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: linear-gradient(145deg, #050a0f 0%, #0a1520 50%, #0d1e32 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 1.5rem; position: relative; overflow: hidden;
  }

  /* bg grid */
  .mv-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* orbs */
  .mv-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(90px); }
  .mv-orb-1 { width: 450px; height: 450px; background: rgba(245,158,11,0.1);  top: -150px;  right: -100px; }
  .mv-orb-2 { width: 350px; height: 350px; background: rgba(26,115,232,0.08); bottom: -100px; left: -80px; }

  /* ── CARD ── */
  .mv-card {
    width: 100%; max-width: 440px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 22px;
    padding: 2.5rem 2rem;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.06);
    position: relative; z-index: 1;
    animation: mv-rise 0.5s cubic-bezier(.22,1,.36,1) both;
  }
  @media (min-width: 480px) { .mv-card { padding: 2.75rem 2.5rem; } }
  @keyframes mv-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

  /* amber top-bar accent */
  .mv-card::before {
    content: ''; position: absolute;
    top: 0; left: 2rem; right: 2rem; height: 3px;
    background: linear-gradient(90deg, transparent, var(--amber), transparent);
    border-radius: 0 0 3px 3px; opacity: 0.7;
  }

  /* ── ICON ── */
  .mv-icon-wrap {
    width: 68px; height: 68px; border-radius: 18px; margin: 0 auto 1.5rem;
    background: rgba(245,158,11,0.1); border: 1.5px solid rgba(245,158,11,0.25);
    display: flex; align-items: center; justify-content: center;
    position: relative;
    animation: mv-pulse-ring 3s ease-in-out infinite;
  }
  @keyframes mv-pulse-ring {
    0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.2); }
    50%      { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
  }
  .mv-icon-wrap.success-state {
    background: rgba(43,196,138,0.1); border-color: rgba(43,196,138,0.3);
    animation: mv-scale-in 0.4s cubic-bezier(.175,.885,.32,1.275) both;
  }
  @keyframes mv-scale-in { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }

  /* ── TEXT ── */
  .mv-title {
    text-align: center; font-size: 1.55rem; font-weight: 800;
    letter-spacing: -0.03em; color: #fff; margin-bottom: 0.4rem;
  }
  .mv-sub {
    text-align: center; font-size: 0.875rem; color: var(--muted);
    line-height: 1.65; margin-bottom: 1.75rem;
  }
  .mv-username {
    color: rgba(255,255,255,0.75); font-weight: 700;
    font-family: 'Space Mono', monospace; font-size: 0.82rem;
  }

  /* ── INFO BANNER ── */
  .mv-info-banner {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(26,115,232,0.07); border: 1px solid rgba(26,115,232,0.2);
    border-radius: 10px; padding: 0.85rem 1rem;
    margin-bottom: 1.75rem;
  }
  .mv-info-icon {
    width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
    background: rgba(26,115,232,0.15); display: flex; align-items: center;
    justify-content: center; color: var(--blue-light); margin-top: 1px;
  }
  .mv-info-text { font-size: 0.82rem; color: rgba(255,255,255,0.55); line-height: 1.6; }
  .mv-info-method {
    display: inline-flex; align-items: center; gap: 4px;
    color: rgba(255,255,255,0.75); font-weight: 700; font-size: 0.82rem;
    margin-top: 0.3rem;
  }
  .mv-info-method-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--blue-light);
    animation: mv-blink 1.5s ease-in-out infinite;
  }
  @keyframes mv-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── OTP BOXES ── */
  .mv-otp-label {
    font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.55);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
    text-align: center;
  }
  .mv-otp-boxes {
    display: flex; gap: 8px; justify-content: center;
    margin-bottom: 0.6rem;
  }
  @media (min-width: 380px) { .mv-otp-boxes { gap: 10px; } }

  .mv-otp-box {
    width: 48px; height: 58px; border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #fff; font-size: 1.4rem; font-weight: 700;
    font-family: 'Space Mono', monospace;
    text-align: center; outline: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.15s;
    caret-color: var(--amber); -webkit-appearance: none;
  }
  @media (min-width: 380px) { .mv-otp-box { width: 54px; height: 62px; } }

  .mv-otp-box:focus {
    border-color: var(--amber);
    background: rgba(245,158,11,0.07);
    box-shadow: 0 0 0 3px rgba(245,158,11,0.18);
    transform: translateY(-2px);
  }
  .mv-otp-box.filled {
    border-color: rgba(245,158,11,0.45);
    background: rgba(245,158,11,0.06);
  }
  .mv-otp-box.shake {
    animation: mv-shake 0.4s ease;
  }
  @keyframes mv-shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-5px)}
    40%{transform:translateX(5px)}
    60%{transform:translateX(-4px)}
    80%{transform:translateX(4px)}
  }
  .mv-otp-box:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
  .mv-otp-box.success-digit {
    border-color: rgba(43,196,138,0.5) !important;
    background: rgba(43,196,138,0.08) !important;
    box-shadow: none !important;
  }

  .mv-otp-hint { text-align: center; font-size: 0.77rem; color: var(--muted); margin-bottom: 1.6rem; }

  /* ── COUNTDOWN ── */
  .mv-timer-wrap {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; margin-bottom: 1.6rem;
  }
  .mv-timer-ring {
    position: relative; width: 36px; height: 36px; flex-shrink: 0;
  }
  .mv-timer-svg { transform: rotate(-90deg); }
  .mv-timer-track { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 3; }
  .mv-timer-prog {
    fill: none; stroke-width: 3; stroke-linecap: round;
    transition: stroke-dashoffset 1s linear, stroke 0.5s;
  }
  .mv-timer-num {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; font-family: 'Space Mono', monospace;
    font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.6);
  }
  .mv-timer-label { font-size: 0.82rem; color: var(--muted); }
  .mv-timer-expired { color: var(--danger); font-weight: 700; font-size: 0.82rem; }

  /* ── SUBMIT ── */
  .mv-submit {
    width: 100%; padding: 0.9rem;
    background: linear-gradient(135deg, var(--amber-dark), var(--amber));
    border: none; border-radius: 10px;
    color: #fff; font-size: 0.95rem; font-weight: 700;
    font-family: inherit; cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 0 24px rgba(245,158,11,0.3);
    letter-spacing: 0.01em;
  }
  .mv-submit:hover:not(:disabled) {
    opacity: 0.92; transform: translateY(-1px);
    box-shadow: 0 0 36px rgba(245,158,11,0.4);
  }
  .mv-submit:active:not(:disabled) { transform: translateY(0); }
  .mv-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

  /* success submit */
  .mv-submit.done {
    background: linear-gradient(135deg, var(--green-dark), var(--green));
    box-shadow: 0 0 24px rgba(43,196,138,0.3);
    animation: mv-scale-in 0.3s ease both;
  }

  /* ── SPINNER ── */
  .mv-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff; animation: mv-spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes mv-spin { to{transform:rotate(360deg)} }

  /* ── RESEND / CANCEL ── */
  .mv-actions { display: flex; flex-direction: column; gap: 0.6rem; align-items: center; margin-top: 1.4rem; }
  .mv-resend-btn {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.84rem; font-weight: 700; transition: color 0.2s; padding: 2px 0;
  }
  .mv-resend-btn.active { color: var(--amber-light); }
  .mv-resend-btn.active:hover { color: var(--amber); }
  .mv-resend-btn.inactive { color: var(--muted); cursor: default; }
  .mv-cancel-btn {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.8rem; color: rgba(255,255,255,0.25);
    transition: color 0.2s; padding: 2px 0;
  }
  .mv-cancel-btn:hover { color: rgba(255,255,255,0.55); }
  .mv-cancel-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── SECURITY BADGE ── */
  .mv-sec-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 1.5rem; font-size: 0.76rem; color: rgba(255,255,255,0.2);
  }

  /* ── LOADING SCREEN ── */
  .mv-loading {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; background: #050a0f;
  }
  .mv-loading-ring {
    width: 42px; height: 42px; border-radius: 50%;
    border: 3px solid rgba(245,158,11,0.15);
    border-top-color: var(--amber);
    animation: mv-spin 0.8s linear infinite;
  }

  /* ── SUCCESS OVERLAY ── */
  .mv-success-body { text-align: center; animation: mv-fadein 0.4s ease both; }
  @keyframes mv-fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .mv-success-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
  .mv-success-sub   { font-size: 0.875rem; color: var(--muted); line-height: 1.7; max-width: 300px; margin: 0 auto; }
  .mv-redirect {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    margin-top: 1rem; font-size: 0.78rem; color: var(--muted);
  }
  .mv-dots span {
    display: inline-block; width: 4px; height: 4px; border-radius: 50%;
    background: var(--muted); margin: 0 1.5px; animation: mv-bounce 1.2s infinite;
  }
  .mv-dots span:nth-child(2) { animation-delay:.2s }
  .mv-dots span:nth-child(3) { animation-delay:.4s }
  @keyframes mv-bounce { 0%,80%,100%{transform:scale(.6);opacity:.5} 40%{transform:scale(1);opacity:1} }

  /* toast */
  .Toastify__toast {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 0.875rem !important; border-radius: 10px !important;
  }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }
`;

/* ─── constants ─── */
const OTP_LENGTH  = 6;
const EXPIRE_SECS = 120; // 2-minute countdown

/* ─── tiny icons ─── */
const ShieldIcon = ({ color = 'var(--amber)', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const CheckIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const SmsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.9 1.18 2 2 0 012.92.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.99 14l.01 2.92z"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ─── countdown ring helper ─── */
function TimerRing({ seconds, total }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const pct  = seconds / total;
  const offset = circ * (1 - pct);
  const color = seconds > 60 ? 'var(--amber)' : seconds > 20 ? 'var(--amber-dark)' : 'var(--danger)';
  return (
    <div className="mv-timer-ring">
      <svg width="36" height="36" viewBox="0 0 36 36" className="mv-timer-svg">
        <circle className="mv-timer-track" cx="18" cy="18" r={r} />
        <circle
          className="mv-timer-prog"
          cx="18" cy="18" r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="mv-timer-num" style={{ color }}>{seconds}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function VerifyMFAPage() {
  const router = useRouter();

  const [digits, setDigits]         = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [ready, setReady]           = useState(false);
  const [shake, setShake]           = useState(false);
  const [timeLeft, setTimeLeft]     = useState(EXPIRE_SECS);
  const [resendCooldown, setResendCooldown] = useState(30);

  const inputRefs = useRef([]);

  /* ── session load ── */
  useEffect(() => {
    const raw = localStorage.getItem('mfa_session');
    if (!raw) { router.push('/login'); return; }
    try {
      const data = JSON.parse(raw);
      setSessionData(data);
      setReady(true);
    } catch {
      router.push('/login');
    }
  }, [router]);

  /* ── OTP expiry countdown ── */
  useEffect(() => {
    if (!ready || success) return;
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [ready, success, timeLeft]);

  /* ── resend cooldown ── */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  /* ── auto-focus first box ── */
  useEffect(() => {
    if (ready) setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [ready]);

  /* ── derived ── */
  const otpCode  = digits.join('');
  const isFull   = otpCode.length === OTP_LENGTH;
  const expired  = timeLeft <= 0;
  const disabled = loading || success || expired;

  /* ── digit change ── */
  const handleDigitChange = (i, val) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  /* ── keydown (backspace, arrow nav) ── */
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; setDigits(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
        const next = [...digits]; next[i - 1] = ''; setDigits(next);
      }
    }
    if (e.key === 'ArrowLeft'  && i > 0)              inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  /* ── paste ── */
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, idx) => { next[idx] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  /* ── submit ── */
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (!isFull || loading || success || expired) return;
    if (!sessionData) { toast.error('Session expired. Please login again.'); return; }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-mfa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionData.session_id,
          otp_code:   otpCode,
          method:     'email',
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccess(true);
        toast.success('Identity verified! Redirecting to dashboard…', { autoClose: 1800 });

        localStorage.setItem('access_token',  data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user',          JSON.stringify(data.user));
        localStorage.removeItem('mfa_session');

        setTimeout(() => router.push('/dashboard'), 1500);

      } else {
        toast.error(data.message || 'Invalid code. Please try again.', { autoClose: 4000 });
        setShake(true);
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => { setShake(false); inputRefs.current[0]?.focus(); }, 500);
      }
    } catch {
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isFull, loading, success, expired, sessionData, otpCode, router]);

  /* ── auto-submit when all 6 digits filled ── */
  useEffect(() => {
    if (isFull && !loading && !success && !expired) {
      handleSubmit();
    }
  }, [isFull]); // eslint-disable-line

  /* ── resend ── */
  const handleResend = async () => {
    if (!sessionData || resendCooldown > 0) return;
    try {
      const response = await fetch('${API_URL}/api/auth/resend-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionData.session_id }),
      });
      const data = await response.json();
      if (response.ok) {
        const via = data.mfa_method === 'sms' ? 'SMS' : 'email';
        toast.info(`New code sent via ${via}. Check your inbox.`, { autoClose: 3500 });
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeLeft(EXPIRE_SECS);
        setResendCooldown(30);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        toast.error('Failed to resend code. Please try again.');
      }
    } catch {
      toast.error('Unable to resend code. Please try again.');
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('mfa_session');
    router.push('/login');
  };

  /* ── loading screen ── */
  if (!ready) {
    return (
      <>
        <style>{css}</style>
        <div className="mv-loading"><div className="mv-loading-ring" /></div>
      </>
    );
  }

  const isSms = sessionData?.mfa_method === 'sms';

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

      <div className="mv-root">
        <div className="mv-grid" />
        <div className="mv-orb mv-orb-1" />
        <div className="mv-orb mv-orb-2" />

        <div className="mv-card">

          {/* ── icon ── */}
          <div className={`mv-icon-wrap${success ? ' success-state' : ''}`}>
            {success ? <CheckIcon size={30} /> : <ShieldIcon size={28} />}
          </div>

          {/* ── SUCCESS STATE ── */}
          {success ? (
            <div className="mv-success-body">
              <div className="mv-success-title">Identity Verified</div>
              <div className="mv-success-sub">
                Your identity has been confirmed. Signing you in now.
              </div>
              <div className="mv-redirect">
                <span>Redirecting to dashboard</span>
                <span className="mv-dots"><span/><span/><span/></span>
              </div>
            </div>
          ) : (
            <>
              {/* ── header ── */}
              <h1 className="mv-title">Verify Your Identity</h1>
              <p className="mv-sub">
                {sessionData.username
                  ? <>Signed in as <span className="mv-username">{sessionData.username}</span>. We've sent a 6-digit code.</>
                  : 'Additional verification required to complete sign-in.'
                }
              </p>

              {/* ── info banner ── */}
              <div className="mv-info-banner">
                <div className="mv-info-icon"><InfoIcon /></div>
                <div>
                  <div className="mv-info-text">
                    Our AI detected elevated risk on this login attempt. Enter the one-time code sent to your{' '}
                    {isSms ? 'phone number' : 'email address'} to verify it's really you.
                  </div>
                  <div className="mv-info-method">
                    <span className="mv-info-method-dot" />
                    {isSms ? <SmsIcon /> : <EmailIcon />}
                    Code sent via {isSms ? 'SMS' : 'Email'}
                  </div>
                  {/* dev-only OTP hint */}
                  {sessionData.otp_code && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)' }}>
                      Dev mode · OTP: <span style={{ fontFamily: "'Space Mono', monospace", color: 'rgba(245,158,11,0.7)' }}>{sessionData.otp_code}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── OTP boxes ── */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="mv-otp-label">Enter 6-digit code</div>
                <div className="mv-otp-boxes" onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={d}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className={`mv-otp-box${d ? ' filled' : ''}${shake ? ' shake' : ''}`}
                      disabled={disabled}
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="mv-otp-hint">
                  {expired
                    ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Code expired — request a new one below</span>
                    : 'Code is valid for 2 minutes · Paste supported'
                  }
                </div>

                {/* ── countdown ── */}
                {!expired ? (
                  <div className="mv-timer-wrap">
                    <TimerRing seconds={timeLeft} total={EXPIRE_SECS} />
                    <span className="mv-timer-label">
                      Code expires in <strong style={{ color: timeLeft <= 20 ? 'var(--danger)' : 'rgba(255,255,255,0.65)', fontFamily: "'Space Mono', monospace", fontSize: '0.8rem' }}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <div className="mv-timer-wrap">
                    <span className="mv-timer-expired">⚠ Code expired</span>
                  </div>
                )}

                {/* ── submit ── */}
                <button
                  type="submit"
                  className={`mv-submit${success ? ' done' : ''}`}
                  disabled={!isFull || disabled}
                >
                  {loading ? (
                    <><span className="mv-spinner" /> Verifying…</>
                  ) : (
                    <>
                      Verify Code
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </>
                  )}
                </button>
              </form>

              {/* ── resend / cancel ── */}
              <div className="mv-actions">
                <button
                  onClick={handleResend}
                  className={`mv-resend-btn ${resendCooldown === 0 ? 'active' : 'inactive'}`}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend verification code'
                  }
                </button>
                <button
                  onClick={handleCancel}
                  className="mv-cancel-btn"
                  disabled={loading}
                >
                  Cancel and return to login
                </button>
              </div>

            </>
          )}

        </div>

        {/* security badge */}
        {!success && (
          <div className="mv-sec-badge" style={{ position: 'relative', zIndex: 1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            This extra step keeps your account secure
          </div>
        )}

      </div>
    </>
  );
}