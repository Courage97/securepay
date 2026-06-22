'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
    --green:       #2bc48a;
    --green-dark:  #1fa872;
    --green-light: #5bd4a5;
    --danger:      #ef4444;
    --danger-dark: #dc2626;
    --danger-light:#f87171;
    --warning:     #f59e0b;
    --card-bg:     #0e1c2c;
    --card-border: rgba(255,255,255,0.08);
    --muted:       rgba(255,255,255,0.42);
  }

  /* ── ROOT ── */
  .vt-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: linear-gradient(145deg, var(--navy-dark) 0%, #0d1520 50%, #120a0a 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 1.5rem; position: relative; overflow: hidden;
  }

  /* bg grid — red tint */
  .vt-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(239,68,68,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(239,68,68,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .vt-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(90px); }
  .vt-orb-1 { width: 460px; height: 460px; background: rgba(239,68,68,0.1);   top: -150px;  right: -100px; }
  .vt-orb-2 { width: 320px; height: 320px; background: rgba(26,115,232,0.08); bottom: -100px; left: -80px; }

  /* ── CARD ── */
  .vt-card {
    width: 100%; max-width: 460px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 22px;
    padding: 2.5rem 2rem;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.06);
    position: relative; z-index: 1;
    animation: vt-rise 0.5s cubic-bezier(.22,1,.36,1) both;
  }
  @media (min-width: 480px) { .vt-card { padding: 2.75rem 2.5rem; } }
  @keyframes vt-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

  /* red top-bar accent */
  .vt-card::before {
    content: ''; position: absolute;
    top: 0; left: 2rem; right: 2rem; height: 3px;
    background: linear-gradient(90deg, transparent, var(--danger), transparent);
    border-radius: 0 0 3px 3px; opacity: 0.65;
  }

  /* ── ICON ── */
  .vt-icon-wrap {
    width: 68px; height: 68px; border-radius: 18px; margin: 0 auto 1.5rem;
    background: rgba(239,68,68,0.1); border: 1.5px solid rgba(239,68,68,0.25);
    display: flex; align-items: center; justify-content: center;
    animation: vt-pulse-ring 3s ease-in-out infinite;
  }
  @keyframes vt-pulse-ring {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); }
    50%      { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
  }
  .vt-icon-wrap.success-state {
    background: rgba(43,196,138,0.1); border-color: rgba(43,196,138,0.3);
    animation: vt-scale-in 0.4s cubic-bezier(.175,.885,.32,1.275) both;
  }
  @keyframes vt-scale-in { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }

  /* ── HEADINGS ── */
  .vt-title {
    text-align: center; font-size: 1.55rem; font-weight: 800;
    letter-spacing: -0.03em; color: #fff; margin-bottom: 0.4rem;
  }
  .vt-sub {
    text-align: center; font-size: 0.875rem; color: var(--muted);
    line-height: 1.65; margin-bottom: 1.75rem;
  }

  /* ── TRANSACTION SUMMARY ── */
  .vt-txn-box {
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 14px; padding: 1.1rem 1.25rem;
    margin-bottom: 1.35rem;
    animation: vt-fadein 0.3s ease both;
  }
  @keyframes vt-fadein { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .vt-txn-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.7rem; font-weight: 800; color: var(--danger-light);
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.85rem;
  }
  .vt-txn-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--danger); animation: vt-blink 1.5s ease-in-out infinite; }
  @keyframes vt-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .vt-txn-amount {
    text-align: center; margin-bottom: 1rem;
    padding-bottom: 1rem; border-bottom: 1px solid rgba(239,68,68,0.12);
  }
  .vt-txn-amount-val {
    font-family: 'Space Mono', monospace;
    font-size: clamp(2rem, 6vw, 2.8rem); font-weight: 700;
    color: var(--danger-light); line-height: 1; letter-spacing: -0.02em;
  }
  .vt-txn-amount-label { font-size: 0.72rem; color: var(--muted); margin-top: 0.3rem; }

  .vt-txn-rows { display: flex; flex-direction: column; gap: 0; }
  .vt-txn-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.45rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
    gap: 0.5rem;
  }
  .vt-txn-row:last-child { border-bottom: none; }
  .vt-txn-row-key { font-size: 0.77rem; color: var(--muted); font-weight: 600; }
  .vt-txn-row-val { font-size: 0.82rem; font-weight: 700; color: rgba(255,255,255,0.8); font-family: 'Space Mono', monospace; }

  /* ── INFO BANNER ── */
  .vt-info-banner {
    display: flex; align-items: flex-start; gap: 10px;
    background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.22);
    border-radius: 10px; padding: 0.85rem 1rem;
    margin-bottom: 1.5rem;
  }
  .vt-info-icon {
    width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
    background: rgba(245,158,11,0.15); color: var(--warning);
    display: flex; align-items: center; justify-content: center; margin-top: 1px;
  }
  .vt-info-text { font-size: 0.8rem; color: rgba(255,255,255,0.55); line-height: 1.65; }
  .vt-info-otp  {
    margin-top: 0.35rem; font-family: 'Space Mono', monospace;
    font-size: 0.78rem; color: rgba(245,158,11,0.7);
  }

  /* ── OTP BOXES ── */
  .vt-otp-label {
    font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.55);
    letter-spacing: 0.08em; text-transform: uppercase; text-align: center;
    margin-bottom: 0.75rem;
  }
  .vt-otp-boxes {
    display: flex; gap: 8px; justify-content: center; margin-bottom: 0.6rem;
  }
  @media (min-width: 380px) { .vt-otp-boxes { gap: 10px; } }

  .vt-otp-box {
    width: 48px; height: 58px; border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #fff; font-size: 1.4rem; font-weight: 700;
    font-family: 'Space Mono', monospace;
    text-align: center; outline: none; caret-color: var(--danger);
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.15s;
    -webkit-appearance: none;
  }
  @media (min-width: 380px) { .vt-otp-box { width: 54px; height: 62px; } }

  .vt-otp-box:focus {
    border-color: var(--danger);
    background: rgba(239,68,68,0.07);
    box-shadow: 0 0 0 3px rgba(239,68,68,0.18);
    transform: translateY(-2px);
  }
  .vt-otp-box.filled {
    border-color: rgba(239,68,68,0.45);
    background: rgba(239,68,68,0.06);
  }
  .vt-otp-box.shake { animation: vt-shake 0.4s ease; }
  @keyframes vt-shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-5px)} 40%{transform:translateX(5px)}
    60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
  }
  .vt-otp-box:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
  .vt-otp-box.success-digit {
    border-color: rgba(43,196,138,0.5) !important;
    background: rgba(43,196,138,0.08) !important;
    box-shadow: none !important;
  }

  .vt-otp-hint { text-align: center; font-size: 0.77rem; color: var(--muted); margin-bottom: 1.5rem; }

  /* ── TIMER ── */
  .vt-timer-wrap {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; margin-bottom: 1.5rem;
  }
  .vt-timer-ring { position: relative; width: 36px; height: 36px; flex-shrink: 0; }
  .vt-timer-svg  { transform: rotate(-90deg); }
  .vt-timer-track { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 3; }
  .vt-timer-prog  { fill: none; stroke-width: 3; stroke-linecap: round; transition: stroke-dashoffset 1s linear, stroke 0.5s; }
  .vt-timer-num   {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace; font-size: 0.72rem; font-weight: 700;
    color: rgba(255,255,255,0.6);
  }
  .vt-timer-label { font-size: 0.82rem; color: var(--muted); }
  .vt-timer-expired { color: var(--danger); font-weight: 700; font-size: 0.82rem; }

  /* ── ACTION BUTTONS ── */
  .vt-actions { display: flex; gap: 0.75rem; }
  .vt-btn {
    flex: 1; padding: 0.88rem; border-radius: 10px;
    font-size: 0.95rem; font-weight: 700; font-family: inherit;
    cursor: pointer; border: none; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .vt-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

  .vt-btn-cancel {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.65);
  }
  .vt-btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: #fff; }

  .vt-btn-confirm {
    background: linear-gradient(135deg, var(--danger-dark), var(--danger));
    color: #fff; box-shadow: 0 0 24px rgba(239,68,68,0.3);
  }
  .vt-btn-confirm:hover:not(:disabled) {
    opacity: 0.9; transform: translateY(-1px);
    box-shadow: 0 0 34px rgba(239,68,68,0.4);
  }
  .vt-btn-confirm.done {
    background: linear-gradient(135deg, var(--green-dark), var(--green));
    box-shadow: 0 0 24px rgba(43,196,138,0.3);
    animation: vt-scale-in 0.3s ease both;
  }

  /* ── SPINNER ── */
  .vt-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff; animation: vt-spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes vt-spin { to { transform: rotate(360deg); } }

  /* ── SUCCESS STATE ── */
  .vt-success-body { text-align: center; animation: vt-fadein 0.4s ease both; }
  .vt-success-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
  .vt-success-sub   { font-size: 0.875rem; color: var(--muted); line-height: 1.7; max-width: 300px; margin: 0 auto; }
  .vt-redirect {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    margin-top: 1rem; font-size: 0.78rem; color: var(--muted);
  }
  .vt-dots span {
    display: inline-block; width: 4px; height: 4px; border-radius: 50%;
    background: var(--muted); margin: 0 1.5px; animation: vt-bounce 1.2s infinite;
  }
  .vt-dots span:nth-child(2) { animation-delay:.2s }
  .vt-dots span:nth-child(3) { animation-delay:.4s }
  @keyframes vt-bounce { 0%,80%,100%{transform:scale(.6);opacity:.5} 40%{transform:scale(1);opacity:1} }

  /* ── LOADING SCREEN ── */
  .vt-loading {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--navy-dark);
  }
  .vt-loading-ring {
    width: 42px; height: 42px; border-radius: 50%;
    border: 3px solid rgba(239,68,68,0.15); border-top-color: var(--danger);
    animation: vt-spin 0.8s linear infinite;
  }

  /* ── SECURITY BADGE ── */
  .vt-sec-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 1.5rem; font-size: 0.76rem; color: rgba(255,255,255,0.2);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* toast */
  .Toastify__toast { font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: .875rem !important; border-radius: 10px !important; }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }
`;

/* ── constants ── */
const OTP_LENGTH  = 6;
const EXPIRE_SECS = 120;

/* ── icons ── */
const AlertIcon = ({ color = 'var(--danger)', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const CheckIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const WarnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ── countdown ring ── */
function TimerRing({ seconds, total }) {
  const r     = 14;
  const circ  = 2 * Math.PI * r;
  const pct   = seconds / total;
  const offset = circ * (1 - pct);
  const color = seconds > 60 ? 'var(--danger)' : seconds > 20 ? '#dc2626' : '#ef4444';
  return (
    <div className="vt-timer-ring">
      <svg width="36" height="36" viewBox="0 0 36 36" className="vt-timer-svg">
        <circle className="vt-timer-track" cx="18" cy="18" r={r} />
        <circle className="vt-timer-prog" cx="18" cy="18" r={r}
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="vt-timer-num" style={{ color }}>{seconds}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function VerifyTransactionPage() {
  const router = useRouter();

  const [digits, setDigits]               = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [ready, setReady]                 = useState(false);
  const [shake, setShake]                 = useState(false);
  const [timeLeft, setTimeLeft]           = useState(EXPIRE_SECS);

  const inputRefs = useRef([]);

  /* ── session load ── */
  useEffect(() => {
    const raw = localStorage.getItem('pending_transaction');
    if (!raw) { router.push('/dashboard'); return; }
    try {
      const data = JSON.parse(raw);
      setTransactionData(data);
      setReady(true);
    } catch {
      router.push('/dashboard');
    }
  }, [router]);

  /* ── countdown ── */
  useEffect(() => {
    if (!ready || success || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [ready, success, timeLeft]);

  /* ── auto-focus ── */
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
    const next = [...digits]; next[i] = char; setDigits(next);
    if (char && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

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
    if (!transactionData) {
      toast.error('Transaction expired. Please try again.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/verify-mfa/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionData.transaction_id,
          otp_code:       otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccess(true);
        toast.success('Transaction verified! Money sent successfully.', { autoClose: 2000 });
        localStorage.removeItem('pending_transaction');
        setTimeout(() => router.push('/dashboard'), 2000);
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
  }, [isFull, loading, success, expired, transactionData, otpCode, router]);

  /* ── auto-submit when 6 digits filled ── */
  useEffect(() => {
    if (isFull && !loading && !success && !expired) handleSubmit();
  }, [isFull]); // eslint-disable-line

  /* ── cancel ── */
  const handleCancel = () => {
    localStorage.removeItem('pending_transaction');
    router.push('/dashboard');
  };

  /* ── loading screen ── */
  if (!ready) {
    return (
      <>
        <style>{css}</style>
        <div className="vt-loading"><div className="vt-loading-ring" /></div>
      </>
    );
  }

  const amount  = transactionData?.amount  ? parseFloat(transactionData.amount)  : 0;
  const receiver = transactionData?.receiver || '—';
  const txnId    = transactionData?.transaction_id || '—';

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

      <div className="vt-root">
        <div className="vt-grid" />
        <div className="vt-orb vt-orb-1" />
        <div className="vt-orb vt-orb-2" />

        <div className="vt-card">

          {/* ── icon ── */}
          <div className={`vt-icon-wrap${success ? ' success-state' : ''}`}>
            {success
              ? <CheckIcon size={30} />
              : <AlertIcon size={28} />
            }
          </div>

          {/* ── SUCCESS STATE ── */}
          {success ? (
            <div className="vt-success-body">
              <div className="vt-success-title">Transaction Verified!</div>
              <div className="vt-success-sub">
                ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been sent to <strong style={{ color: '#fff' }}>{receiver}</strong> successfully.
              </div>
              <div className="vt-redirect">
                <span>Returning to dashboard</span>
                <span className="vt-dots"><span /><span /><span /></span>
              </div>
            </div>
          ) : (
            <>
              <h1 className="vt-title">Verify Transaction</h1>
              <p className="vt-sub">
                High-risk transfer detected. Enter the 6-digit code sent to your email to authorize this payment.
              </p>

              {/* ── transaction summary ── */}
              <div className="vt-txn-box">
                <div className="vt-txn-label">
                  <span className="vt-txn-dot" />
                  Transaction Pending Approval
                </div>
                <div className="vt-txn-amount">
                  <div className="vt-txn-amount-val">
                    ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="vt-txn-amount-label">Amount to be sent</div>
                </div>
                <div className="vt-txn-rows">
                  <div className="vt-txn-row">
                    <span className="vt-txn-row-key">Recipient</span>
                    <span className="vt-txn-row-val">{receiver}</span>
                  </div>
                  <div className="vt-txn-row">
                    <span className="vt-txn-row-key">Transaction ID</span>
                    <span className="vt-txn-row-val" style={{ fontSize: '0.72rem' }}>
                      {String(txnId).slice(0, 18)}{String(txnId).length > 18 ? '…' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── security alert ── */}
              <div className="vt-info-banner">
                <div className="vt-info-icon"><WarnIcon /></div>
                <div>
                  <div className="vt-info-text">
                    Our AI flagged this transfer as high-risk. A one-time code has been sent to your registered email. Enter it below to authorise.
                  </div>
                  {transactionData.otp_code && (
                    <div className="vt-info-otp">
                      Dev mode · OTP: <strong>{transactionData.otp_code}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* ── OTP boxes ── */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="vt-otp-label">Enter 6-digit code</div>
                <div className="vt-otp-boxes" onPaste={handlePaste}>
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
                      className={`vt-otp-box${d ? ' filled' : ''}${shake ? ' shake' : ''}`}
                      disabled={disabled}
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="vt-otp-hint">
                  {expired
                    ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Code expired — cancel and resend from the dashboard</span>
                    : 'Code valid for 2 minutes · Paste supported · Auto-submits on completion'
                  }
                </div>

                {/* ── countdown ── */}
                {!expired ? (
                  <div className="vt-timer-wrap">
                    <TimerRing seconds={timeLeft} total={EXPIRE_SECS} />
                    <span className="vt-timer-label">
                      Expires in{' '}
                      <strong style={{ color: timeLeft <= 20 ? 'var(--danger)' : 'rgba(255,255,255,0.65)', fontFamily: "'Space Mono', monospace", fontSize: '0.8rem' }}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <div className="vt-timer-wrap">
                    <span className="vt-timer-expired">⚠ Code expired</span>
                  </div>
                )}

                {/* ── action buttons ── */}
                <div className="vt-actions">
                  <button
                    type="button"
                    className="vt-btn vt-btn-cancel"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`vt-btn vt-btn-confirm${success ? ' done' : ''}`}
                    disabled={!isFull || disabled}
                  >
                    {loading
                      ? <><span className="vt-spinner" /> Verifying…</>
                      : <>
                          Confirm Transfer
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </>
                    }
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

        {/* security badge */}
        {!success && (
          <div className="vt-sec-badge" style={{ position: 'relative', zIndex: 1 }}>
            <ShieldIcon />
            AI detected unusual activity — extra verification protects your money
          </div>
        )}

      </div>
    </>
  );
}