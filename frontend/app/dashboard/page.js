'use client';

import { useState, useEffect, useCallback } from 'react';
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
    --gray:        #e6e9ec;
    --gray-light:  #f5f7f9;
    --gray-dark:   #d1d5d9;
    --card-bg:     #ffffff;
    --shadow-sm:   0 1px 3px rgba(13,27,42,.08), 0 1px 2px rgba(13,27,42,.05);
    --shadow-md:   0 4px 12px rgba(13,27,42,.10), 0 2px 4px rgba(13,27,42,.06);
    --shadow-lg:   0 10px 28px rgba(13,27,42,.12), 0 4px 8px rgba(13,27,42,.06);
    --muted:       #6b7280;
  }

  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── PAGE ── */
  .db-page { background: var(--gray-light); min-height: 100vh; overflow-x: hidden; }

  /* ── NAV ── */
  .db-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,27,42,0.97);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 2px 20px rgba(0,0,0,0.25);
  }
  .db-nav-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 62px;
  }
  @media (min-width: 640px) { .db-nav-inner { padding: 0 1.75rem; } }
  @media (min-width: 1024px) { .db-nav-inner { padding: 0 2rem; } }

  .db-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .db-logo-icon {
    width: 34px; height: 34px; border-radius: 8px; background: var(--blue);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(26,115,232,.4); flex-shrink: 0;
  }
  .db-logo-text { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

  .db-nav-right { display: flex; align-items: center; gap: 0.5rem; }
  @media (min-width: 640px) { .db-nav-right { gap: 0.75rem; } }

  .db-nav-link {
    color: rgba(255,255,255,.55); font-size: 0.82rem; font-weight: 500;
    text-decoration: none; padding: 0.4rem 0.6rem; border-radius: 6px;
    transition: all .2s; white-space: nowrap;
    display: none;
  }
  @media (min-width: 640px) { .db-nav-link { display: block; } }
  .db-nav-link:hover { background: rgba(255,255,255,.07); color: #fff; }

  .db-nav-user {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
    border-radius: 8px; padding: 0.35rem 0.75rem;
  }
  .db-avatar {
    width: 26px; height: 26px; border-radius: 50%; background: var(--blue);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 800; color: #fff; flex-shrink: 0;
    font-family: 'Space Mono', monospace;
  }
  .db-username { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,.8); display: none; }
  @media (min-width: 480px) { .db-username { display: block; } }

  .db-logout-btn {
    background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2);
    color: #f87171; font-size: 0.8rem; font-weight: 600; font-family: inherit;
    padding: 0.4rem 0.85rem; border-radius: 7px; cursor: pointer;
    transition: all .2s; white-space: nowrap;
  }
  .db-logout-btn:hover { background: rgba(239,68,68,.18); color: #fca5a5; }

  /* ── MAIN WRAP ── */
  .db-main { max-width: 1280px; margin: 0 auto; padding: 1.75rem 1.25rem 3rem; }
  @media (min-width: 640px)  { .db-main { padding: 2rem 1.75rem 3rem; } }
  @media (min-width: 1024px) { .db-main { padding: 2.5rem 2rem 3rem; } }

  /* ── PAGE HEADER ── */
  .db-header { margin-bottom: 2rem; }
  .db-greeting { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.03em; color: var(--navy); margin-bottom: 0.3rem; }
  .db-subheading { font-size: 0.9rem; color: var(--muted); }

  /* ── METRICS GRID ── */
  .db-metrics {
    display: grid; gap: 1.25rem; margin-bottom: 2rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px)  { .db-metrics { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 1024px) { .db-metrics { grid-template-columns: repeat(4, 1fr); } }

  .db-metric {
    border-radius: 14px; padding: 1.5rem;
    border: 1px solid var(--gray);
    box-shadow: var(--shadow-sm);
    transition: transform .2s, box-shadow .2s;
    position: relative; overflow: hidden;
  }
  .db-metric:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .db-metric-white { background: var(--card-bg); }
  .db-metric-blue  {
    background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 60%, var(--blue-light) 100%);
    border-color: transparent;
  }
  .db-metric-green {
    background: linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%);
    border-color: transparent;
  }

  .db-metric-toprow {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 1rem;
  }
  .db-metric-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
  .db-metric-label-light { color: rgba(255,255,255,.7); }
  .db-metric-label-dark  { color: var(--muted); }
  .db-metric-icon {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .db-mi-light { background: rgba(255,255,255,.15); color: #fff; }
  .db-mi-blue  { background: rgba(26,115,232,.1);   color: var(--blue); }
  .db-mi-green { background: rgba(43,196,138,.1);   color: var(--green); }
  .db-mi-amber { background: rgba(245,158,11,.1);   color: var(--warning); }

  .db-metric-val {
    font-family: 'Space Mono', monospace;
    font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; line-height: 1;
    margin-bottom: 0.35rem; letter-spacing: -0.02em;
  }
  .db-metric-val-light { color: #fff; }
  .db-metric-val-dark  { color: var(--navy); }
  .db-metric-sub { font-size: 0.77rem; }
  .db-metric-sub-light { color: rgba(255,255,255,.65); }
  .db-metric-sub-dark  { color: var(--muted); }

  /* account number copy */
  .db-acct-row {
    display: flex; align-items: center; gap: 8px; margin-top: 0.25rem;
  }
  .db-acct-num {
    font-family: 'Space Mono', monospace; font-size: 0.95rem; font-weight: 700;
    color: var(--navy); letter-spacing: 0.06em;
  }
  .db-copy-btn {
    background: rgba(26,115,232,.08); border: 1px solid rgba(26,115,232,.2);
    color: var(--blue); border-radius: 5px; padding: 3px 7px;
    font-size: 0.7rem; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: all .2s; white-space: nowrap;
  }
  .db-copy-btn:hover { background: rgba(26,115,232,.16); }
  .db-copy-btn.copied { background: rgba(43,196,138,.1); border-color: rgba(43,196,138,.3); color: var(--green); }

  /* ── ACTION BUTTONS ── */
  .db-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem; }
  .db-action-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 0.7rem 1.3rem; border-radius: 10px; font-size: 0.875rem;
    font-weight: 700; cursor: pointer; font-family: inherit; border: none;
    transition: all .2s; white-space: nowrap;
  }
  .db-action-primary {
    background: var(--blue); color: #fff;
    box-shadow: 0 0 18px rgba(26,115,232,.3);
  }
  .db-action-primary:hover { background: var(--blue-dark); transform: translateY(-1px); box-shadow: 0 0 28px rgba(26,115,232,.4); }
  .db-action-secondary {
    background: #fff; color: var(--navy);
    border: 1.5px solid var(--gray); box-shadow: var(--shadow-sm);
  }
  .db-action-secondary:hover { border-color: var(--gray-dark); background: var(--gray-light); }

  /* ── CONTENT GRID ── */
  .db-content-grid {
    display: grid; gap: 1.5rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 1024px) {
    .db-content-grid { grid-template-columns: 1fr 340px; }
  }

  /* ── CARD ── */
  .db-card {
    background: var(--card-bg); border: 1px solid var(--gray);
    border-radius: 14px; padding: 1.5rem;
    box-shadow: var(--shadow-sm);
  }
  @media (min-width: 640px) { .db-card { padding: 1.75rem; } }

  .db-card-title {
    font-size: 1rem; font-weight: 800; color: var(--navy);
    letter-spacing: -0.02em; margin-bottom: 1.25rem;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
  }

  /* ── FILTER TABS ── */
  .db-filter-tabs { display: flex; gap: 4px; background: var(--gray-light); border-radius: 8px; padding: 3px; }
  .db-filter-tab {
    padding: 0.35rem 0.8rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700;
    cursor: pointer; border: none; font-family: inherit; background: transparent;
    color: var(--muted); transition: all .2s; white-space: nowrap;
  }
  .db-filter-tab.active { background: #fff; color: var(--navy); box-shadow: var(--shadow-sm); }

  /* ── TRANSACTION LIST ── */
  .db-txn-list { display: flex; flex-direction: column; gap: 0; }
  .db-txn-row {
    display: flex; align-items: center; gap: 12px;
    padding: 0.9rem 0; border-bottom: 1px solid var(--gray);
    transition: background .15s; border-radius: 0; cursor: default;
  }
  .db-txn-row:last-child { border-bottom: none; padding-bottom: 0; }
  .db-txn-row:first-child { padding-top: 0; }

  .db-txn-icon {
    width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .db-txn-icon-out { background: rgba(239,68,68,.1);  color: var(--danger); }
  .db-txn-icon-in  { background: rgba(43,196,138,.1); color: var(--green); }

  .db-txn-info { flex: 1; min-width: 0; }
  .db-txn-name {
    font-size: 0.875rem; font-weight: 700; color: var(--navy);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 2px;
  }
  .db-txn-desc { font-size: 0.77rem; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .db-txn-date { font-size: 0.7rem; color: var(--gray-dark); margin-top: 1px; }

  .db-txn-right { text-align: right; flex-shrink: 0; }
  .db-txn-amt {
    font-family: 'Space Mono', monospace;
    font-size: 0.9rem; font-weight: 700; margin-bottom: 4px;
  }
  .db-txn-amt-out { color: var(--danger); }
  .db-txn-amt-in  { color: var(--green); }
  .db-txn-status {
    display: inline-flex; align-items: center; padding: 1px 7px;
    border-radius: 100px; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.03em;
  }
  .db-txn-s-completed { background: rgba(43,196,138,.12); color: var(--green-dark); }
  .db-txn-s-pending   { background: rgba(245,158,11,.12); color: #92400e; }
  .db-txn-s-failed    { background: rgba(239,68,68,.12);  color: #991b1b; }

  /* empty state */
  .db-empty {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 2.5rem 1rem;
  }
  .db-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--gray-light); border: 1.5px solid var(--gray);
    display: flex; align-items: center; justify-content: center;
    color: var(--gray-dark); margin-bottom: 1rem;
  }
  .db-empty-title { font-size: 0.95rem; font-weight: 700; color: var(--navy); margin-bottom: 0.3rem; }
  .db-empty-sub   { font-size: 0.83rem; color: var(--muted); }

  /* ── SECURITY PANEL ── */
  .db-sec-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 0.75rem 0; border-bottom: 1px solid var(--gray);
  }
  .db-sec-item:last-child { border-bottom: none; padding-bottom: 0; }
  .db-sec-item:first-child { padding-top: 0; }
  .db-sec-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .db-sec-dot-ok   { background: var(--green); box-shadow: 0 0 5px var(--green); }
  .db-sec-dot-warn { background: var(--danger); box-shadow: 0 0 5px var(--danger); }
  .db-sec-dot-mid  { background: var(--warning); box-shadow: 0 0 5px var(--warning); }
  .db-sec-label { font-size: 0.83rem; font-weight: 600; color: var(--navy); margin-bottom: 1px; }
  .db-sec-meta  { font-size: 0.72rem; color: var(--muted); }
  .db-sec-badge {
    margin-left: auto; flex-shrink: 0; padding: 1px 7px; border-radius: 4px;
    font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .db-sb-ok   { background: rgba(43,196,138,.12); color: var(--green-dark); }
  .db-sb-warn { background: rgba(239,68,68,.12);  color: #991b1b; }

  /* ── MODAL OVERLAY ── */
  .db-overlay {
    position: fixed; inset: 0; background: rgba(5,10,15,.65);
    backdrop-filter: blur(6px); z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 1.25rem;
    animation: db-fade-bg .2s ease both;
  }
  @keyframes db-fade-bg { from{opacity:0} to{opacity:1} }

  .db-modal {
    background: #fff; border-radius: 18px; width: 100%; max-width: 440px;
    box-shadow: 0 30px 70px rgba(0,0,0,.3);
    animation: db-modal-rise .3s cubic-bezier(.22,1,.36,1) both;
    overflow: hidden;
  }
  @keyframes db-modal-rise { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .db-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.4rem 1.75rem; border-bottom: 1px solid var(--gray);
  }
  .db-modal-title { font-size: 1.05rem; font-weight: 800; color: var(--navy); letter-spacing: -0.02em; }
  .db-modal-close {
    width: 30px; height: 30px; border-radius: 7px; border: none;
    background: var(--gray-light); color: var(--muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s; font-size: 1rem;
  }
  .db-modal-close:hover { background: var(--gray); color: var(--navy); }
  .db-modal-body  { padding: 1.5rem 1.75rem; }
  .db-modal-footer{ padding: 0 1.75rem 1.5rem; display: flex; gap: 0.75rem; }

  /* modal banner */
  .db-modal-banner {
    border-radius: 10px; padding: 0.85rem 1rem;
    display: flex; align-items: flex-start; gap: 9px;
    margin-bottom: 1.25rem; animation: db-modal-rise .2s ease both;
  }
  .db-mb-success { background: rgba(43,196,138,.08); border: 1px solid rgba(43,196,138,.25); }
  .db-mb-error   { background: rgba(239,68,68,.06);  border: 1px solid rgba(239,68,68,.2); }
  .db-mb-icon { width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
  .db-mb-icon-s { background: rgba(43,196,138,.15); color: var(--green-dark); }
  .db-mb-icon-e { background: rgba(239,68,68,.12);  color: var(--danger); }
  .db-mb-text { font-size: 0.83rem; color: var(--navy); font-weight: 600; line-height: 1.5; }

  /* modal field */
  .db-mfield { margin-bottom: 1.1rem; }
  .db-mfield:last-child { margin-bottom: 0; }
  .db-mlabel {
    display: block; font-size: 0.78rem; font-weight: 700;
    color: var(--navy); margin-bottom: 0.4rem; letter-spacing: 0.02em;
  }
  .db-minput-wrap { position: relative; }
  .db-minput-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    color: var(--gray-dark); pointer-events: none; display: flex;
  }
  .db-minput {
    width: 100%; padding: 0.78rem 0.9rem 0.78rem 2.4rem;
    border: 1.5px solid var(--gray-dark); border-radius: 9px;
    background: #fff; color: var(--navy); font-size: 0.875rem;
    font-family: inherit; outline: none; transition: all .2s; -webkit-appearance: none;
  }
  .db-minput::placeholder { color: var(--gray-dark); }
  .db-minput:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(26,115,232,.12);
  }
  .db-minput:disabled { opacity: .5; cursor: not-allowed; background: var(--gray-light); }
  .db-minput-prefix {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    font-weight: 700; color: var(--navy); font-size: 0.9rem; pointer-events: none;
  }
  .db-minput-padded { padding-left: 1.85rem !important; }

  /* balance chip shown in modal */
  .db-bal-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(26,115,232,.07); border: 1px solid rgba(26,115,232,.18);
    border-radius: 7px; padding: 0.3rem 0.7rem;
    font-size: 0.77rem; font-weight: 700; color: var(--blue);
    margin-bottom: 1.25rem;
  }

  /* modal action buttons */
  .db-mbtn {
    flex: 1; padding: 0.82rem; border-radius: 9px; font-size: 0.9rem;
    font-weight: 700; font-family: inherit; cursor: pointer; border: none;
    transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .db-mbtn:disabled { opacity: .45; cursor: not-allowed; transform: none !important; }
  .db-mbtn-cancel  { background: var(--gray-light); color: var(--navy); border: 1.5px solid var(--gray); }
  .db-mbtn-cancel:hover:not(:disabled)  { background: var(--gray); }
  .db-mbtn-primary { background: var(--blue); color: #fff; box-shadow: 0 0 16px rgba(26,115,232,.25); }
  .db-mbtn-primary:hover:not(:disabled) { background: var(--blue-dark); transform: translateY(-1px); }
  .db-mbtn-green   { background: var(--green); color: #fff; box-shadow: 0 0 16px rgba(43,196,138,.25); }
  .db-mbtn-green:hover:not(:disabled)   { background: var(--green-dark); transform: translateY(-1px); }

  /* modal spinner */
  .db-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    animation: db-spin .65s linear infinite; flex-shrink: 0;
  }
  @keyframes db-spin { to{transform:rotate(360deg)} }

  /* ── LOADING SCREEN ── */
  .db-loading {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; background: var(--gray-light);
  }
  .db-loading-ring {
    width: 44px; height: 44px; border-radius: 50%;
    border: 3px solid var(--gray); border-top-color: var(--blue);
    animation: db-spin .8s linear infinite; margin-bottom: 1rem;
  }
  .db-loading-text { font-size: 0.9rem; color: var(--muted); font-family: 'Plus Jakarta Sans', sans-serif; }

  /* toast */
  .Toastify__toast { font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: .875rem !important; border-radius: 10px !important; }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }

  /* ── RESPONSIVE ── */
  @media (max-width: 480px) {
    .db-modal { border-radius: 14px; }
    .db-modal-header, .db-modal-body, .db-modal-footer { padding-left: 1.25rem; padding-right: 1.25rem; }
  }
`;

/* ── icon helpers ── */
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>
);
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const ArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 10l7-7m0 0l7 7m-7-7v18"/>
  </svg>
);
const ArrowDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

/* security feed mock */
const secFeed = [
  { dot: 'ok',   label: 'Login verified',         meta: 'Lagos · Risk 12/100',    badge: 'safe' },
  { dot: 'ok',   label: 'Transaction completed',  meta: '2h ago · ₦12,000 sent',  badge: 'safe' },
  { dot: 'warn', label: 'Unusual location flagged', meta: '1d ago · MFA required', badge: 'warn' },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();

  /* ── state ── */
  const [user, setUser]             = useState(null);
  const [balance, setBalance]       = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [txnFilter, setTxnFilter]   = useState('all');
  const [copied, setCopied]         = useState(false);

  /* send money modal */
  const [showSend, setShowSend]     = useState(false);
  const [sendForm, setSendForm]     = useState({ receiver_username: '', amount: '', description: '' });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendBanner, setSendBanner] = useState(null); // {type:'success'|'error', msg}

  /* add funds modal */
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount]   = useState('');
  const [addLoading, setAddLoading] = useState(false);

  /* ── bootstrap ── */
  useEffect(() => {
    const token    = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/login'); return; }
    try {
      const u = JSON.parse(userData);
      setUser(u);
      setBalance(parseFloat(u.wallet_balance) || 0);
      fetchTransactions(token);
    } catch {
      router.push('/login');
    }
  }, [router]);

  /* ── fetch transactions ── */
  const fetchTransactions = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/history/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.current_balance !== undefined) setBalance(parseFloat(data.current_balance));
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── derived metrics ── */
  const totalSent = transactions
    .filter(t => t.sender_username === user?.username && t.status === 'completed')
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalReceived = transactions
    .filter(t => t.receiver_username === user?.username && t.status === 'completed')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  /* ── filtered transactions ── */
  const filteredTxns = transactions.filter(t => {
    if (txnFilter === 'sent')     return t.sender_username   === user?.username;
    if (txnFilter === 'received') return t.receiver_username === user?.username;
    return true;
  });

  /* ── copy account number ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(user?.account_number || '').then(() => {
      setCopied(true);
      toast.info('Account number copied!', { autoClose: 2000 });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── send money ── */
  const handleSendMoney = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendBanner(null);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/api/send/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === 'success') {
          setSendBanner({ type: 'success', msg: `Successfully sent ₦${parseFloat(sendForm.amount).toLocaleString()} to ${sendForm.receiver_username}!` });
          setBalance(data.new_balance);
          fetchTransactions(token);
          setSendForm({ receiver_username: '', amount: '', description: '' });
          toast.success('Transfer complete!', { autoClose: 2500 });
          setTimeout(() => { setShowSend(false); setSendBanner(null); }, 2200);
        } else if (data.status === 'mfa_required') {
          localStorage.setItem('pending_transaction', JSON.stringify({
            transaction_id: data.transaction_id,
            otp_code:       data.otp_code,
            amount:         data.amount,
            receiver:       data.receiver,
          }));
          toast.warning('Verification required for this transfer.', { autoClose: 2500 });
          router.push('/verify-transaction');
        }
      } else {
        setSendBanner({ type: 'error', msg: data.message || 'Failed to send money. Please try again.' });
      }
    } catch {
      setSendBanner({ type: 'error', msg: 'Unable to connect to server. Please try again.' });
    } finally {
      setSendLoading(false);
    }
  };

  /* ── add funds ── */
  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (!addAmount || isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount.'); return;
    }
    setAddLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/api/add-funds/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      });
      if (!res.ok) { toast.error('Failed to add funds. Please try again.'); return; }
      const data = await res.json();
      if (data.status === 'success') {
        setBalance(data.new_balance);
        toast.success(`₦${amt.toLocaleString()} added to your wallet!`, { autoClose: 2500 });
        fetchTransactions(token);
        setAddAmount('');
        setShowAddFunds(false);
      } else {
        toast.error(data.message || 'Failed to add funds.');
      }
    } catch {
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  /* ── logout ── */
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  /* ── loading screen ── */
  if (loading || !user) {
    return (
      <>
        <style>{css}</style>
        <div className="db-loading">
          <div className="db-loading-ring" />
          <p className="db-loading-text">Loading your dashboard…</p>
        </div>
      </>
    );
  }

  const initials = user.username?.slice(0, 2).toUpperCase() || 'SP';

  /* ── status badge helper ── */
  const statusCls = (s) =>
    s === 'completed' ? 'db-txn-s-completed' :
    s === 'pending'   ? 'db-txn-s-pending'   : 'db-txn-s-failed';

  return (
    <>
      <style>{css}</style>

      <ToastContainer position="top-right" transition={Slide} closeButton={false} hideProgressBar={false} newestOnTop pauseOnHover theme="dark" />

      <div className="db-page">

        {/* ══ NAV ══ */}
        <nav className="db-nav">
          <div className="db-nav-inner">
            <a href="/" className="db-logo">
              <div className="db-logo-icon"><LockIcon /></div>
              <span className="db-logo-text">SecurePay</span>
            </a>
            <div className="db-nav-right">
              <a href="/login-activity" className="db-nav-link">Login Activity</a>
              <a href="/profile"        className="db-nav-link">Profile</a>
              <a href="/admin"          className="db-nav-link">Admin</a>
              <div className="db-nav-user">
                <div className="db-avatar">{initials}</div>
                <span className="db-username">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="db-logout-btn">Logout</button>
            </div>
          </div>
        </nav>

        {/* ══ MAIN ══ */}
        <div className="db-main">

          {/* header */}
          <div className="db-header">
            <h1 className="db-greeting">Good day, {user.username} 👋</h1>
            <p className="db-subheading">Here's a summary of your SecurePay account.</p>
          </div>

          {/* ── METRICS ── */}
          <div className="db-metrics">

            {/* Balance */}
            <div className="db-metric db-metric-blue">
              <div className="db-metric-toprow">
                <div className="db-metric-label db-metric-label-light">Wallet Balance</div>
                <div className="db-metric-icon db-mi-light"><WalletIcon /></div>
              </div>
              <div className="db-metric-val db-metric-val-light">
                ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="db-metric-sub db-metric-sub-light">Available to spend</div>
            </div>

            {/* Account Number */}
            <div className="db-metric db-metric-white">
              <div className="db-metric-toprow">
                <div className="db-metric-label db-metric-label-dark">Account Number</div>
                <div className="db-metric-icon db-mi-blue"><UserIcon /></div>
              </div>
              <div className="db-acct-row">
                <span className="db-acct-num">{user.account_number}</span>
                <button className={`db-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                  {copied ? '✓ Copied' : <><CopyIcon /> Copy</>}
                </button>
              </div>
              <div className="db-metric-sub db-metric-sub-dark" style={{ marginTop: '0.35rem' }}>Your unique account ID</div>
            </div>

            {/* Total Sent */}
            <div className="db-metric db-metric-white">
              <div className="db-metric-toprow">
                <div className="db-metric-label db-metric-label-dark">Total Sent</div>
                <div className="db-metric-icon db-mi-amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  </svg>
                </div>
              </div>
              <div className="db-metric-val db-metric-val-dark" style={{ color: 'var(--danger)' }}>
                ₦{totalSent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="db-metric-sub db-metric-sub-dark">{transactions.filter(t => t.sender_username === user.username).length} transfer{transactions.filter(t => t.sender_username === user.username).length !== 1 ? 's' : ''}</div>
            </div>

            {/* Total Received */}
            <div className="db-metric db-metric-green">
              <div className="db-metric-toprow">
                <div className="db-metric-label db-metric-label-light">Total Received</div>
                <div className="db-metric-icon db-mi-light">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </div>
              </div>
              <div className="db-metric-val db-metric-val-light">
                ₦{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="db-metric-sub db-metric-sub-light">{transactions.filter(t => t.receiver_username === user.username).length} payment{transactions.filter(t => t.receiver_username === user.username).length !== 1 ? 's' : ''}</div>
            </div>

          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className="db-actions">
            <button className="db-action-btn db-action-primary" onClick={() => { setShowSend(true); setSendBanner(null); }}>
              <SendIcon /> Send Money
            </button>
            <button className="db-action-btn db-action-secondary" onClick={() => { setShowAddFunds(true); setAddAmount(''); }}>
              <PlusIcon /> Add Funds
            </button>
            <a href="/login-activity">
              <button className="db-action-btn db-action-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Activity Log
              </button>
            </a>
          </div>

          {/* ── CONTENT GRID ── */}
          <div className="db-content-grid">

            {/* Transaction history */}
            <div className="db-card">
              <div className="db-card-title">
                Recent Transactions
                <div className="db-filter-tabs">
                  {['all','sent','received'].map(f => (
                    <button key={f} className={`db-filter-tab${txnFilter === f ? ' active' : ''}`} onClick={() => setTxnFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTxns.length === 0 ? (
                <div className="db-empty">
                  <div className="db-empty-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div className="db-empty-title">No transactions yet</div>
                  <div className="db-empty-sub">Start by sending money or adding funds to your wallet.</div>
                </div>
              ) : (
                <div className="db-txn-list">
                  {filteredTxns.map(txn => {
                    const isOut = txn.sender_username === user.username;
                    return (
                      <div key={txn.id} className="db-txn-row">
                        <div className={`db-txn-icon ${isOut ? 'db-txn-icon-out' : 'db-txn-icon-in'}`}>
                          {isOut ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        </div>
                        <div className="db-txn-info">
                          <div className="db-txn-name">
                            {isOut ? `Sent to ${txn.receiver_username}` : `Received from ${txn.sender_username}`}
                          </div>
                          <div className="db-txn-desc">{txn.description || 'No description'}</div>
                          <div className="db-txn-date">{new Date(txn.created_at).toLocaleString()}</div>
                        </div>
                        <div className="db-txn-right">
                          <div className={`db-txn-amt ${isOut ? 'db-txn-amt-out' : 'db-txn-amt-in'}`}>
                            {isOut ? '−' : '+'}₦{parseFloat(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`db-txn-status ${statusCls(txn.status)}`}>{txn.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Security feed */}
            <div className="db-card">
              <div className="db-card-title" style={{ marginBottom: '1rem' }}>Security Feed</div>
              <div>
                {secFeed.map((item, i) => (
                  <div key={i} className="db-sec-item">
                    <span className={`db-sec-dot db-sec-dot-${item.dot}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="db-sec-label">{item.label}</div>
                      <div className="db-sec-meta">{item.meta}</div>
                    </div>
                    <span className={`db-sec-badge ${item.badge === 'safe' ? 'db-sb-ok' : 'db-sb-warn'}`}>
                      {item.badge === 'safe' ? 'Safe' : 'Alert'}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI status */}
              <div style={{
                marginTop: '1.25rem', padding: '0.85rem', borderRadius: '10px',
                background: 'rgba(26,115,232,.05)', border: '1px solid rgba(26,115,232,.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.4rem' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)', display: 'inline-block', animation: 'rp-pulse 2s infinite' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)' }}>AI Protection Active</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  All logins and transactions are being monitored in real-time.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ══ SEND MONEY MODAL ══ */}
        {showSend && (
          <div className="db-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowSend(false); setSendBanner(null); } }}>
            <div className="db-modal">
              <div className="db-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(26,115,232,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                    <SendIcon />
                  </div>
                  <span className="db-modal-title">Send Money</span>
                </div>
                <button className="db-modal-close" onClick={() => { setShowSend(false); setSendBanner(null); }}>✕</button>
              </div>
              <div className="db-modal-body">
                <div className="db-bal-chip">
                  <WalletIcon />
                  Balance: ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {sendBanner && (
                  <div className={`db-modal-banner ${sendBanner.type === 'success' ? 'db-mb-success' : 'db-mb-error'}`}>
                    <div className={`db-mb-icon ${sendBanner.type === 'success' ? 'db-mb-icon-s' : 'db-mb-icon-e'}`}>
                      {sendBanner.type === 'success' ? '✓' : '✕'}
                    </div>
                    <div className="db-mb-text">{sendBanner.msg}</div>
                  </div>
                )}

                <form id="send-form" onSubmit={handleSendMoney}>
                  <div className="db-mfield">
                    <label className="db-mlabel" htmlFor="receiver">Recipient Username</label>
                    <div className="db-minput-wrap">
                      <span className="db-minput-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </span>
                      <input id="receiver" type="text" className="db-minput"
                        value={sendForm.receiver_username}
                        onChange={e => setSendForm({ ...sendForm, receiver_username: e.target.value })}
                        placeholder="Enter username" required
                        disabled={sendLoading || sendBanner?.type === 'success'}
                      />
                    </div>
                  </div>
                  <div className="db-mfield">
                    <label className="db-mlabel" htmlFor="amount">Amount (₦)</label>
                    <div className="db-minput-wrap">
                      <span className="db-minput-prefix">₦</span>
                      <input id="amount" type="number" className="db-minput db-minput-padded"
                        value={sendForm.amount}
                        onChange={e => setSendForm({ ...sendForm, amount: e.target.value })}
                        placeholder="0.00" min="1" step="0.01" required
                        disabled={sendLoading || sendBanner?.type === 'success'}
                      />
                    </div>
                  </div>
                  <div className="db-mfield">
                    <label className="db-mlabel" htmlFor="desc">Description <span style={{ fontWeight: 500, color: 'var(--gray-dark)' }}>(Optional)</span></label>
                    <div className="db-minput-wrap">
                      <span className="db-minput-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                      </span>
                      <input id="desc" type="text" className="db-minput"
                        value={sendForm.description}
                        onChange={e => setSendForm({ ...sendForm, description: e.target.value })}
                        placeholder="What's this for?"
                        disabled={sendLoading || sendBanner?.type === 'success'}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="db-modal-footer">
                <button className="db-mbtn db-mbtn-cancel"
                  onClick={() => { setShowSend(false); setSendBanner(null); }}
                  disabled={sendLoading}>
                  Cancel
                </button>
                <button className="db-mbtn db-mbtn-primary" form="send-form" type="submit"
                  disabled={sendLoading || sendBanner?.type === 'success'}>
                  {sendLoading ? <><span className="db-spinner" /> Sending…</> : <><SendIcon /> Send Money</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ ADD FUNDS MODAL ══ */}
        {showAddFunds && (
          <div className="db-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddFunds(false); }}>
            <div className="db-modal">
              <div className="db-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(43,196,138,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                    <PlusIcon />
                  </div>
                  <span className="db-modal-title">Add Funds</span>
                </div>
                <button className="db-modal-close" onClick={() => setShowAddFunds(false)}>✕</button>
              </div>
              <div className="db-modal-body">
                <div className="db-bal-chip">
                  <WalletIcon />
                  Current balance: ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* quick amount pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                  {[1000, 5000, 10000, 50000].map(amt => (
                    <button key={amt}
                      onClick={() => setAddAmount(String(amt))}
                      style={{
                        padding: '0.35rem 0.85rem', borderRadius: 7,
                        background: addAmount === String(amt) ? 'rgba(43,196,138,.1)' : 'var(--gray-light)',
                        border: addAmount === String(amt) ? '1.5px solid rgba(43,196,138,.35)' : '1.5px solid var(--gray)',
                        color: addAmount === String(amt) ? 'var(--green-dark)' : 'var(--navy)',
                        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all .15s',
                      }}>
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <form id="add-form" onSubmit={handleAddFunds}>
                  <div className="db-mfield">
                    <label className="db-mlabel" htmlFor="add-amount">Enter Amount (₦)</label>
                    <div className="db-minput-wrap">
                      <span className="db-minput-prefix">₦</span>
                      <input id="add-amount" type="number"
                        className="db-minput db-minput-padded"
                        value={addAmount}
                        onChange={e => setAddAmount(e.target.value)}
                        placeholder="0.00" min="1" step="0.01" required
                        disabled={addLoading}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="db-modal-footer">
                <button className="db-mbtn db-mbtn-cancel"
                  onClick={() => setShowAddFunds(false)} disabled={addLoading}>
                  Cancel
                </button>
                <button className="db-mbtn db-mbtn-green" form="add-form" type="submit"
                  disabled={addLoading || !addAmount}>
                  {addLoading ? <><span className="db-spinner" /> Adding…</> : <><PlusIcon /> Add Funds</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}