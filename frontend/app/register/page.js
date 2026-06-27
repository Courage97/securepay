'use client';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  :root {
    --navy:        #0d1b2a;
    --navy-light:  #1b2838;
    --navy-dark:   #050a0f;
    --blue:        #1a73e8;
    --blue-light:  #4a8ff0;
    --blue-dark:   #0d5bc4;
    --green:       #2bc48a;
    --green-light: #5bd4a5;
    --green-dark:  #1fa872;
    --danger:      #ef4444;
    --warning:     #f59e0b;
    --card-bg:     #0e1c2c;
    --card-border: rgba(255,255,255,0.08);
    --muted:       rgba(255,255,255,0.42);
  }

  /* ── ROOT ── */
  .rp-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    display: flex;
    background: var(--navy-dark);
    overflow-x: hidden;
  }

  /* ── LEFT PANEL ── */
  .rp-left {
    display: none;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
    overflow: hidden;
    background: linear-gradient(155deg, #060d17 0%, #0a1828 55%, #0d2240 100%);
    flex-shrink: 0;
  }
  @media (min-width: 1024px) { .rp-left { display: flex; width: 44%; } }

  .rp-grid-bg {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(43,196,138,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(43,196,138,0.035) 1px, transparent 1px);
    background-size: 44px 44px;
  }
  .rp-orb {
    position: absolute; border-radius: 50%;
    pointer-events: none; filter: blur(90px);
  }
  .rp-orb-1 { width: 420px; height: 420px; background: rgba(43,196,138,0.14); top: -130px; left: -80px; }
  .rp-orb-2 { width: 300px; height: 300px; background: rgba(26,115,232,0.15); bottom: -80px; right: -60px; }

  /* brand */
  .rp-brand {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; position: relative; z-index: 1;
  }
  .rp-brand-icon {
    width: 38px; height: 38px; border-radius: 10px; background: var(--green);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(43,196,138,0.5); flex-shrink: 0;
  }
  .rp-brand-name { font-size: 1.2rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

  /* left body */
  .rp-left-body { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 2rem; }
  .rp-left-tag {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(43,196,138,0.1); border: 1px solid rgba(43,196,138,0.28);
    color: var(--green); font-size: 0.72rem; font-weight: 700;
    padding: 0.3rem 0.85rem; border-radius: 100px;
    letter-spacing: 0.07em; text-transform: uppercase; width: fit-content;
  }
  .rp-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: rp-pulse 2s infinite; }
  @keyframes rp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }

  .rp-left-h {
    font-size: clamp(1.8rem, 2.8vw, 2.5rem);
    font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; color: #fff;
  }
  .rp-left-h span {
    background: linear-gradient(90deg, var(--green), var(--blue-light));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .rp-left-sub { font-size: 0.875rem; color: var(--muted); line-height: 1.75; }

  /* trust items */
  .rp-trust-list { display: flex; flex-direction: column; gap: 0; }
  .rp-trust-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .rp-trust-item:last-child { border-bottom: none; }
  .rp-trust-icon {
    width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; margin-top: 1px;
  }
  .rp-ti-1 { background: rgba(43,196,138,0.14); }
  .rp-ti-2 { background: rgba(26,115,232,0.14); }
  .rp-ti-3 { background: rgba(245,158,11,0.14); }
  .rp-ti-4 { background: rgba(239,68,68,0.12); }
  .rp-trust-label { font-size: 0.87rem; font-weight: 700; color: rgba(255,255,255,0.78); margin-bottom: 2px; }
  .rp-trust-desc  { font-size: 0.77rem; color: var(--muted); line-height: 1.6; }

  /* left footer */
  .rp-left-footer { position: relative; z-index: 1; font-size: 0.77rem; color: rgba(255,255,255,0.2); }

  /* ── RIGHT PANEL ── */
  .rp-right {
    flex: 1; display: flex; align-items: flex-start; justify-content: center;
    padding: 2rem 1.25rem;
    background: linear-gradient(140deg, #080f18 0%, var(--navy) 100%);
    position: relative; overflow-y: auto;
    min-height: 100vh;
  }
  @media (min-width: 640px) { .rp-right { padding: 2.5rem 2rem; } }

  .rp-right-orb {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    background: rgba(43,196,138,0.07); filter: blur(70px);
    bottom: -60px; left: -60px; pointer-events: none;
  }

  .rp-form-wrap {
    width: 100%; max-width: 460px;
    padding-top: 1rem; padding-bottom: 2rem;
    position: relative; z-index: 1;
    animation: rp-fadein 0.5s ease both;
  }
  @keyframes rp-fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  /* mobile brand */
  .rp-mobile-brand {
    display: flex; align-items: center; gap: 10px;
    justify-content: center; margin-bottom: 1.75rem;
  }
  @media (min-width: 1024px) { .rp-mobile-brand { display: none; } }
  .rp-mob-icon {
    width: 36px; height: 36px; border-radius: 9px; background: var(--green);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 18px rgba(43,196,138,0.45);
  }
  .rp-mob-name { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

  /* headings */
  .rp-page-title {
    font-size: clamp(1.6rem, 3.5vw, 2rem); font-weight: 800;
    letter-spacing: -0.03em; color: #fff; margin-bottom: 0.35rem;
  }
  .rp-page-sub { font-size: 0.875rem; color: var(--muted); margin-bottom: 1.75rem; }

  /* step indicator */
  .rp-steps-bar {
    display: flex; align-items: center; gap: 0;
    margin-bottom: 1.75rem;
  }
  .rp-step-seg {
    flex: 1; height: 3px; border-radius: 3px;
    background: rgba(255,255,255,0.08); margin: 0 2px;
    transition: background 0.4s;
  }
  .rp-step-seg.active   { background: var(--green); }
  .rp-step-seg.complete { background: var(--green-dark); }

  /* card */
  .rp-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 18px; padding: 2rem 1.75rem;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  }
  @media (min-width: 480px) { .rp-card { padding: 2.25rem 2rem; } }

  /* success state */
  .rp-success {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding: 1rem 0 0.5rem; animation: rp-fadein 0.4s ease both;
  }
  .rp-success-ring {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(43,196,138,0.12); border: 2px solid rgba(43,196,138,0.35);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem; color: var(--green);
    animation: rp-scale-in 0.4s cubic-bezier(.175,.885,.32,1.275) both;
  }
  @keyframes rp-scale-in { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
  .rp-success-title { font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
  .rp-success-sub   { font-size: 0.875rem; color: var(--muted); line-height: 1.7; max-width: 300px; }
  .rp-redirect {
    display: flex; align-items: center; gap: 7px;
    margin-top: 1rem; font-size: 0.78rem; color: var(--muted);
  }
  .rp-dots span {
    display: inline-block; width: 4px; height: 4px; border-radius: 50%;
    background: var(--muted); margin: 0 1.5px;
    animation: rp-bounce 1.2s infinite;
  }
  .rp-dots span:nth-child(2) { animation-delay: .2s; }
  .rp-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes rp-bounce { 0%,80%,100%{transform:scale(.6);opacity:.5} 40%{transform:scale(1);opacity:1} }

  /* row of two fields */
  .rp-field-row {
    display: grid; grid-template-columns: 1fr; gap: 1.1rem; margin-bottom: 1.1rem;
  }
  @media (min-width: 480px) { .rp-field-row { grid-template-columns: 1fr 1fr; } }

  /* field */
  .rp-field { margin-bottom: 1.1rem; }
  .rp-field:last-child { margin-bottom: 0; }
  .rp-field-row .rp-field { margin-bottom: 0; }

  .rp-label {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.78rem; font-weight: 700;
    color: rgba(255,255,255,0.6); margin-bottom: 0.45rem; letter-spacing: 0.02em;
  }
  .rp-required { color: var(--danger); font-size: 0.75rem; }
  .rp-optional {
    font-size: 0.68rem; color: rgba(255,255,255,0.25);
    font-weight: 500; background: rgba(255,255,255,0.06);
    padding: 1px 6px; border-radius: 4px; letter-spacing: 0.03em;
  }

  .rp-input-wrap { position: relative; }
  .rp-input-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.22); pointer-events: none; display: flex; align-items: center;
  }
  .rp-input {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #fff;
    padding: 0.78rem 0.9rem 0.78rem 2.55rem;
    font-size: 0.875rem; font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none; -webkit-appearance: none;
  }
  .rp-input::placeholder { color: rgba(255,255,255,0.2); }
  .rp-input:focus {
    border-color: var(--blue);
    background: rgba(26,115,232,0.06);
    box-shadow: 0 0 0 3px rgba(26,115,232,0.15);
  }
  .rp-input.valid  { border-color: rgba(43,196,138,0.5); }
  .rp-input.invalid{ border-color: rgba(239,68,68,0.5); }
  .rp-input:disabled { opacity: 0.45; cursor: not-allowed; }

  /* pw toggle */
  .rp-pw-btn {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    color: rgba(255,255,255,0.28); transition: color 0.2s; display: flex;
  }
  .rp-pw-btn:hover { color: rgba(255,255,255,0.65); }

  /* field hint */
  .rp-hint { font-size: 0.72rem; color: rgba(255,255,255,0.28); margin-top: 0.35rem; }
  .rp-hint-err { font-size: 0.72rem; color: var(--danger); margin-top: 0.35rem; animation: rp-fadein 0.2s ease; }

  /* password strength bar */
  .rp-strength { margin-top: 0.55rem; }
  .rp-strength-bar {
    display: flex; gap: 3px; margin-bottom: 0.3rem;
  }
  .rp-strength-seg {
    flex: 1; height: 3px; border-radius: 3px;
    background: rgba(255,255,255,0.08);
    transition: background 0.3s;
  }
  .rp-strength-seg.s1 { background: var(--danger); }
  .rp-strength-seg.s2 { background: var(--warning); }
  .rp-strength-seg.s3 { background: var(--blue-light); }
  .rp-strength-seg.s4 { background: var(--green); }
  .rp-strength-label { font-size: 0.7rem; font-weight: 600; }
  .rp-sl-1 { color: var(--danger); }
  .rp-sl-2 { color: var(--warning); }
  .rp-sl-3 { color: var(--blue-light); }
  .rp-sl-4 { color: var(--green); }

  /* pw match indicator */
  .rp-match {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.72rem; margin-top: 0.35rem; font-weight: 600;
  }
  .rp-match-ok  { color: var(--green); }
  .rp-match-err { color: var(--danger); }

  /* terms */
  .rp-terms {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 1.35rem;
  }
  .rp-check-wrap {
    width: 18px; height: 18px; border-radius: 5px;
    border: 1.5px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; margin-top: 1px;
    transition: border-color 0.2s, background 0.2s;
  }
  .rp-check-wrap.checked { border-color: var(--green); background: rgba(43,196,138,0.15); }
  .rp-terms-label {
    font-size: 0.815rem; color: rgba(255,255,255,0.45); line-height: 1.6; cursor: pointer;
  }
  .rp-terms-link { color: var(--blue-light); text-decoration: none; font-weight: 600; transition: color 0.2s; }
  .rp-terms-link:hover { color: var(--blue); }

  /* submit */
  .rp-submit {
    width: 100%; padding: 0.9rem;
    background: var(--green); border: none; border-radius: 10px;
    color: #fff; font-size: 0.95rem; font-weight: 700;
    font-family: inherit; cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 0 24px rgba(43,196,138,0.32);
    letter-spacing: 0.01em;
  }
  .rp-submit:hover:not(:disabled) {
    background: var(--green-dark); transform: translateY(-1px);
    box-shadow: 0 0 36px rgba(43,196,138,0.42);
  }
  .rp-submit:active:not(:disabled) { transform: translateY(0); }
  .rp-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* spinner */
  .rp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff; animation: rp-spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes rp-spin { to { transform: rotate(360deg); } }

  /* divider */
  .rp-divider {
    display: flex; align-items: center; gap: 0.75rem;
    margin: 1.35rem 0; font-size: 0.77rem; color: rgba(255,255,255,0.17);
  }
  .rp-divider::before, .rp-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07);
  }

  /* login row */
  .rp-login-row { text-align: center; font-size: 0.84rem; color: rgba(255,255,255,0.38); }
  .rp-login-link { color: var(--blue-light); font-weight: 700; text-decoration: none; transition: color 0.2s; }
  .rp-login-link:hover { color: var(--blue); }

  /* security badge */
  .rp-sec-badge {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 1.4rem; font-size: 0.77rem; color: rgba(255,255,255,0.22);
  }

  /* toast overrides */
  .Toastify__toast {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 0.875rem !important; border-radius: 10px !important;
  }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }
`;

/* ─── tiny icon helpers ─── */
const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>
);
const EyeOn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);

/* ─── password strength ─── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', cls: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const clamped = Math.min(score, 4);
  const map = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const cls = ['', 'rp-sl-1', 'rp-sl-2', 'rp-sl-3', 'rp-sl-4'];
  return { score: clamped, label: map[clamped], cls: cls[clamped] };
}

/* ─── trust items ─── */
const trustItems = [
  {
    icCls: 'rp-ti-1',
    color: 'var(--green)',
    icon: (c) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: 'Bank-grade encryption',
    desc:  'All data in transit and at rest is AES-256 encrypted.',
  },
  {
    icCls: 'rp-ti-2',
    color: 'var(--blue-light)',
    icon: (c) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    ),
    label: 'AI pharming protection',
    desc:  'Real-time threat scoring on every single login attempt.',
  },
  {
    icCls: 'rp-ti-3',
    color: 'var(--warning)',
    icon: (c) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    ),
    label: 'Device fingerprinting',
    desc:  'Trusted devices are remembered so logins stay seamless.',
  },
  {
    icCls: 'rp-ti-4',
    color: '#f87171',
    icon: (c) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    label: 'Instant MFA when needed',
    desc:  'Extra verification only fires when risk demands it.',
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '', email: '', phone_number: '', password: '', password2: '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showPw2, setShowPw2]   = useState(false);
  const [terms, setTerms]       = useState(false);
  const [touched, setTouched]   = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  /* ─── validation ─── */
  const validateForm = () => {
    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long.'); return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address.'); return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long.'); return false;
    }
    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match.'); return false;
    }
    if (!terms) {
      toast.warning('Please accept the Terms of Service to continue.'); return false;
    }
    return true;
  };

  /* ─── submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || success) return;
    // mark all touched
    setTouched({ username: true, email: true, phone_number: true, password: true, password2: true });
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('${API_URL}/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccess(true);
        toast.success('Account created! Redirecting to login…', { autoClose: 2200 });

        localStorage.setItem('access_token',  data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user',          JSON.stringify(data.user));

        setTimeout(() => router.push('/login'), 2000);
      } else {
        if (data.errors) {
          const msgs = Object.values(data.errors).flat().join('. ');
          toast.error(msgs, { autoClose: 5000 });
        } else {
          toast.error(data.message || 'Registration failed. Please try again.', { autoClose: 4500 });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── derived state ─── */
  const strength   = useMemo(() => getStrength(formData.password), [formData.password]);
  const pwMatch    = formData.password2.length > 0 && formData.password === formData.password2;
  const pwNoMatch  = formData.password2.length > 0 && formData.password !== formData.password2;
  const disabled   = loading || success;

  /* field validity helpers */
  const uValid = touched.username  && formData.username.length >= 3;
  const uInval = touched.username  && formData.username.length > 0 && formData.username.length < 3;
  const eValid = touched.email     && formData.email.includes('@');
  const eInval = touched.email     && formData.email.length > 0 && !formData.email.includes('@');

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

      <div className="rp-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="rp-left">
          <div className="rp-grid-bg" />
          <div className="rp-orb rp-orb-1" />
          <div className="rp-orb rp-orb-2" />

          <Link href="/" className="rp-brand">
            <div className="rp-brand-icon"><LockIcon /></div>
            <span className="rp-brand-name">SecurePay</span>
          </Link>

          <div className="rp-left-body">
            <div className="rp-left-tag">
              <span className="rp-tag-dot" />
              Zero-compromise security
            </div>
            <div>
              <h2 className="rp-left-h">
                Join Thousands<br/>
                <span>Banking Smarter</span>
              </h2>
              <p className="rp-left-sub" style={{ marginTop: '0.9rem' }}>
                Your account comes protected from day one — no setup needed. Every transaction is monitored by AI so you never have to think about security.
              </p>
            </div>
            <div className="rp-trust-list">
              {trustItems.map((t) => (
                <div className="rp-trust-item" key={t.label}>
                  <div className={`rp-trust-icon ${t.icCls}`}>{t.icon(t.color)}</div>
                  <div>
                    <div className="rp-trust-label">{t.label}</div>
                    <div className="rp-trust-desc">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rp-left-footer">© 2026 SecurePay · All rights reserved</div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="rp-right">
          <div className="rp-right-orb" />

          <div className="rp-form-wrap">

            {/* Mobile brand */}
            <div className="rp-mobile-brand">
              <div className="rp-mob-icon"><LockIcon /></div>
              <span className="rp-mob-name">SecurePay</span>
            </div>

            <h1 className="rp-page-title">Create your account</h1>
            <p className="rp-page-sub">Join SecurePay and start sending money securely</p>

            {/* Progress bar — 3 implied steps */}
            <div className="rp-steps-bar" aria-hidden="true">
              {[0,1,2].map((i) => {
                const filled = Object.values(formData).filter(Boolean).length;
                const active = filled > i * 2;
                return (
                  <div key={i} className={`rp-step-seg ${success ? 'complete' : active ? 'active' : ''}`} />
                );
              })}
            </div>

            <div className="rp-card">

              {/* ── SUCCESS STATE ── */}
              {success ? (
                <div className="rp-success">
                  <div className="rp-success-ring">
                    <CheckIcon size={32} />
                  </div>
                  <div className="rp-success-title">Account Created!</div>
                  <div className="rp-success-sub">
                    Welcome to SecurePay. Your account is ready and protected by AI security from this moment.
                  </div>
                  <div className="rp-redirect">
                    <span>Redirecting to login</span>
                    <span className="rp-dots"><span/><span/><span/></span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>

                  {/* Row: username + email */}
                  <div className="rp-field-row">
                    {/* Username */}
                    <div className="rp-field">
                      <label className="rp-label" htmlFor="username">
                        Username <span className="rp-required">*</span>
                      </label>
                      <div className="rp-input-wrap">
                        <span className="rp-input-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </span>
                        <input
                          id="username" name="username" type="text"
                          value={formData.username} onChange={handleChange} onBlur={handleBlur}
                          placeholder="e.g. johndoe"
                          className={`rp-input${uValid ? ' valid' : uInval ? ' invalid' : ''}`}
                          required disabled={disabled} minLength={3} autoComplete="username"
                        />
                      </div>
                      {uInval
                        ? <div className="rp-hint-err">Min. 3 characters</div>
                        : <div className="rp-hint">At least 3 characters</div>
                      }
                    </div>

                    {/* Email */}
                    <div className="rp-field">
                      <label className="rp-label" htmlFor="email">
                        Email <span className="rp-required">*</span>
                      </label>
                      <div className="rp-input-wrap">
                        <span className="rp-input-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </span>
                        <input
                          id="email" name="email" type="email"
                          value={formData.email} onChange={handleChange} onBlur={handleBlur}
                          placeholder="you@example.com"
                          className={`rp-input${eValid ? ' valid' : eInval ? ' invalid' : ''}`}
                          required disabled={disabled} autoComplete="email"
                        />
                      </div>
                      {eInval && <div className="rp-hint-err">Enter a valid email</div>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="rp-field">
                    <label className="rp-label" htmlFor="phone_number">
                      Phone Number <span className="rp-optional">Optional</span>
                    </label>
                    <div className="rp-input-wrap">
                      <span className="rp-input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.9 1.18 2 2 0 012.92.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.99 14l.01 2.92z"/>
                        </svg>
                      </span>
                      <input
                        id="phone_number" name="phone_number" type="tel"
                        value={formData.phone_number} onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        className="rp-input"
                        disabled={disabled} autoComplete="tel"
                      />
                    </div>
                    <div className="rp-hint">Used for SMS verification if needed</div>
                  </div>

                  {/* Password */}
                  <div className="rp-field">
                    <label className="rp-label" htmlFor="password">
                      Password <span className="rp-required">*</span>
                    </label>
                    <div className="rp-input-wrap">
                      <span className="rp-input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      </span>
                      <input
                        id="password" name="password"
                        type={showPw ? 'text' : 'password'}
                        value={formData.password} onChange={handleChange} onBlur={handleBlur}
                        placeholder="Create a strong password"
                        className="rp-input"
                        required disabled={disabled} minLength={8}
                        autoComplete="new-password"
                      />
                      <button type="button" className="rp-pw-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                        {showPw ? <EyeOff /> : <EyeOn />}
                      </button>
                    </div>
                    {/* strength meter */}
                    {formData.password.length > 0 && (
                      <div className="rp-strength">
                        <div className="rp-strength-bar">
                          {[1,2,3,4].map(n => (
                            <div key={n} className={`rp-strength-seg${strength.score >= n ? ` s${strength.score}` : ''}`} />
                          ))}
                        </div>
                        <span className={`rp-strength-label ${strength.cls}`}>{strength.label} password</span>
                      </div>
                    )}
                    {!formData.password && <div className="rp-hint">At least 8 characters</div>}
                  </div>

                  {/* Confirm Password */}
                  <div className="rp-field">
                    <label className="rp-label" htmlFor="password2">
                      Confirm Password <span className="rp-required">*</span>
                    </label>
                    <div className="rp-input-wrap">
                      <span className="rp-input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      </span>
                      <input
                        id="password2" name="password2"
                        type={showPw2 ? 'text' : 'password'}
                        value={formData.password2} onChange={handleChange} onBlur={handleBlur}
                        placeholder="Re-enter your password"
                        className={`rp-input${pwMatch ? ' valid' : pwNoMatch ? ' invalid' : ''}`}
                        required disabled={disabled} minLength={8}
                        autoComplete="new-password"
                      />
                      <button type="button" className="rp-pw-btn" onClick={() => setShowPw2(v => !v)} tabIndex={-1}>
                        {showPw2 ? <EyeOff /> : <EyeOn />}
                      </button>
                    </div>
                    {pwMatch   && <div className="rp-match rp-match-ok"><CheckIcon size={12} /> Passwords match</div>}
                    {pwNoMatch && <div className="rp-match rp-match-err">✕ Passwords don't match</div>}
                  </div>

                  {/* Terms */}
                  <div className="rp-terms" onClick={() => setTerms(v => !v)}>
                    <div className={`rp-check-wrap${terms ? ' checked' : ''}`}>
                      {terms && <CheckIcon size={11} />}
                    </div>
                    <span className="rp-terms-label">
                      I agree to the{' '}
                      <a href="#" className="rp-terms-link" onClick={e => e.stopPropagation()}>Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="rp-terms-link" onClick={e => e.stopPropagation()}>Privacy Policy</a>
                    </span>
                  </div>

                  {/* Submit */}
                  <button type="submit" className="rp-submit" disabled={disabled}>
                    {loading ? (
                      <><span className="rp-spinner" /> Creating your account…</>
                    ) : (
                      <>
                        Create Account
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </>
                    )}
                  </button>

                </form>
              )}

              {!success && (
                <>
                  <div className="rp-divider">or</div>
                  <div className="rp-login-row">
                    Already have an account?{' '}
                    <a href="/login" className="rp-login-link">Sign in here</a>
                  </div>
                </>
              )}

            </div>

            {/* Security badge */}
            <div className="rp-sec-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Your data is encrypted and protected
            </div>

          </div>
        </div>

      </div>
    </>
  );
}