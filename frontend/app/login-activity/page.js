'use client';

import { useState, useEffect, useMemo } from 'react';
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
    --muted:       #6b7280;
    --shadow-sm:   0 1px 3px rgba(13,27,42,.08), 0 1px 2px rgba(13,27,42,.05);
    --shadow-md:   0 4px 12px rgba(13,27,42,.10), 0 2px 4px rgba(13,27,42,.06);
    --shadow-lg:   0 10px 28px rgba(13,27,42,.12), 0 4px 8px rgba(13,27,42,.06);
  }

  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── PAGE ── */
  .la-page { background: var(--gray-light); min-height: 100vh; overflow-x: hidden; }

  /* ── NAV ── */
  .la-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,27,42,0.97);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 2px 20px rgba(0,0,0,0.25);
  }
  .la-nav-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 62px;
  }
  @media (min-width: 640px) { .la-nav-inner { padding: 0 1.75rem; } }
  @media (min-width: 1024px) { .la-nav-inner { padding: 0 2rem; } }

  .la-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .la-logo-icon {
    width: 34px; height: 34px; border-radius: 8px; background: var(--blue);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(26,115,232,.4); flex-shrink: 0;
  }
  .la-logo-text { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

  .la-nav-right { display: flex; align-items: center; gap: .5rem; }
  .la-nav-link {
    color: rgba(255,255,255,.55); font-size: .82rem; font-weight: 500;
    text-decoration: none; padding: .4rem .65rem; border-radius: 6px;
    transition: all .2s; white-space: nowrap; display: none;
  }
  @media (min-width: 580px) { .la-nav-link { display: block; } }
  .la-nav-link:hover { background: rgba(255,255,255,.07); color: #fff; }
  .la-nav-link.active { background: rgba(26,115,232,.15); color: var(--blue-light); }

  .la-logout-btn {
    background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2);
    color: #f87171; font-size: .8rem; font-weight: 600; font-family: inherit;
    padding: .4rem .85rem; border-radius: 7px; cursor: pointer; transition: all .2s;
  }
  .la-logout-btn:hover { background: rgba(239,68,68,.18); color: #fca5a5; }

  /* ── MAIN ── */
  .la-main {
    max-width: 1280px; margin: 0 auto;
    padding: 2rem 1.25rem 3rem;
  }
  @media (min-width: 640px)  { .la-main { padding: 2.25rem 1.75rem 3rem; } }
  @media (min-width: 1024px) { .la-main { padding: 2.5rem 2rem 3rem; } }

  .la-page-hdr { margin-bottom: 2rem; }
  .la-page-title { font-size: clamp(1.5rem,3vw,2rem); font-weight: 800; letter-spacing: -0.03em; color: var(--navy); margin-bottom: .3rem; }
  .la-page-sub   { font-size: .9rem; color: var(--muted); }

  /* ── METRIC STRIP ── */
  .la-metrics {
    display: grid; gap: 1rem; margin-bottom: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 640px)  { .la-metrics { grid-template-columns: repeat(4, 1fr); } }

  .la-metric {
    background: #fff; border: 1px solid var(--gray); border-radius: 14px;
    padding: 1.1rem 1.25rem; box-shadow: var(--shadow-sm);
    display: flex; flex-direction: column; gap: .25rem;
    transition: transform .2s, box-shadow .2s;
  }
  .la-metric:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .la-metric-top { display: flex; align-items: center; justify-content: space-between; }
  .la-metric-lbl { font-size: .72rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; }
  .la-metric-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .la-mi-blue   { background: rgba(26,115,232,.1);  color: var(--blue); }
  .la-mi-green  { background: rgba(43,196,138,.1);  color: var(--green); }
  .la-mi-red    { background: rgba(239,68,68,.1);   color: var(--danger); }
  .la-mi-amber  { background: rgba(245,158,11,.1);  color: var(--warning); }
  .la-metric-val {
    font-family: 'Space Mono', monospace; font-size: 1.7rem; font-weight: 700;
    line-height: 1; letter-spacing: -0.02em; color: var(--navy);
  }
  .la-metric-sub { font-size: .72rem; color: var(--muted); }

  /* ── CONTENT GRID ── */
  .la-content-grid {
    display: grid; gap: 1.5rem; grid-template-columns: 1fr;
  }
  @media (min-width: 1100px) {
    .la-content-grid { grid-template-columns: 1fr 320px; }
  }

  /* ── CARD ── */
  .la-card {
    background: #fff; border: 1px solid var(--gray);
    border-radius: 14px; box-shadow: var(--shadow-sm); overflow: hidden;
  }

  .la-card-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 1.4rem; border-bottom: 1px solid var(--gray);
    flex-wrap: wrap; gap: .75rem;
  }
  .la-card-title { font-size: .95rem; font-weight: 800; color: var(--navy); letter-spacing: -0.02em; }

  /* ── TOOLBAR ── */
  .la-toolbar {
    display: flex; align-items: center; gap: .6rem; flex-wrap: wrap;
  }

  /* search */
  .la-search-wrap { position: relative; }
  .la-search-icon {
    position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
    color: var(--gray-dark); pointer-events: none; display: flex;
  }
  .la-search {
    padding: .5rem .75rem .5rem 2.2rem;
    border: 1.5px solid var(--gray-dark); border-radius: 8px;
    background: #fff; color: var(--navy); font-size: .82rem;
    font-family: inherit; outline: none; width: 180px;
    transition: all .2s;
  }
  @media (min-width: 480px) { .la-search { width: 210px; } }
  .la-search::placeholder { color: var(--gray-dark); }
  .la-search:focus { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(26,115,232,.12); }

  /* filter tabs */
  .la-filter-tabs { display: flex; gap: 3px; background: var(--gray-light); border-radius: 8px; padding: 3px; }
  .la-ftab {
    padding: .35rem .75rem; border-radius: 6px; font-size: .75rem; font-weight: 700;
    cursor: pointer; border: none; font-family: inherit; background: transparent;
    color: var(--muted); transition: all .2s; white-space: nowrap;
  }
  .la-ftab:hover { color: var(--navy); }
  .la-ftab.active { background: #fff; color: var(--navy); box-shadow: var(--shadow-sm); }

  /* export btn */
  .la-export-btn {
    display: flex; align-items: center; gap: 5px;
    padding: .48rem .9rem; border-radius: 8px; font-size: .78rem;
    font-weight: 700; cursor: pointer; font-family: inherit;
    background: var(--gray-light); border: 1.5px solid var(--gray);
    color: var(--navy); transition: all .2s; white-space: nowrap;
  }
  .la-export-btn:hover { background: var(--gray); }

  /* ── TIMELINE ── */
  .la-timeline { padding: 1rem 1.4rem; }
  .la-tl-item {
    display: flex; gap: 14px; padding-bottom: 1rem;
    position: relative;
  }
  .la-tl-item:not(:last-child)::before {
    content: ''; position: absolute;
    left: 17px; top: 38px; bottom: 0; width: 2px;
    background: var(--gray);
  }

  /* dot */
  .la-tl-dot {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1; margin-top: 2px;
  }
  .la-dot-ok    { background: rgba(43,196,138,.12); border: 1.5px solid rgba(43,196,138,.3); color: var(--green); }
  .la-dot-fail  { background: rgba(239,68,68,.12);  border: 1.5px solid rgba(239,68,68,.3);  color: var(--danger); }
  .la-dot-mfa   { background: rgba(245,158,11,.12); border: 1.5px solid rgba(245,158,11,.3); color: var(--warning); }

  /* row card */
  .la-tl-body { flex: 1; min-width: 0; }
  .la-row-card {
    background: var(--gray-light); border: 1px solid var(--gray);
    border-radius: 11px; overflow: hidden; transition: box-shadow .2s;
  }
  .la-row-card:hover { box-shadow: var(--shadow-md); }

  .la-row-main {
    display: flex; align-items: center; justify-content: space-between;
    padding: .8rem 1rem; cursor: pointer; gap: .75rem; flex-wrap: wrap;
  }

  .la-row-left { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .la-row-title {
    display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
  }
  .la-row-name  { font-size: .875rem; font-weight: 700; color: var(--navy); }
  .la-row-time  { font-size: .72rem; color: var(--muted); }
  .la-row-meta  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .la-row-loc   { font-size: .78rem; color: var(--muted); display: flex; align-items: center; gap: 4px; }
  .la-row-ip    { font-family: 'Space Mono', monospace; font-size: .7rem; color: var(--gray-dark); background: var(--gray); padding: 1px 6px; border-radius: 4px; }

  .la-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .la-row-chevron { color: var(--gray-dark); transition: transform .2s; display: flex; flex-shrink: 0; }
  .la-row-chevron.open { transform: rotate(180deg); }

  /* risk bar inside row */
  .la-risk-bar-wrap { display: flex; align-items: center; gap: 6px; }
  .la-risk-bar-track {
    width: 60px; height: 5px; border-radius: 3px; background: var(--gray);
    overflow: hidden; flex-shrink: 0;
  }
  .la-risk-bar-fill { height: 100%; border-radius: 3px; transition: width .4s; }
  .la-risk-score { font-family: 'Space Mono', monospace; font-size: .72rem; font-weight: 700; white-space: nowrap; }

  /* badges */
  .la-badge {
    display: inline-flex; align-items: center; padding: 2px 8px;
    border-radius: 100px; font-size: .69rem; font-weight: 700; white-space: nowrap;
  }
  .la-badge-ok    { background: rgba(43,196,138,.12); color: var(--green-dark); }
  .la-badge-fail  { background: rgba(239,68,68,.1);   color: #991b1b; }
  .la-badge-mfa   { background: rgba(245,158,11,.1);  color: #92400e; }
  .la-badge-low   { background: rgba(43,196,138,.12); color: var(--green-dark); }
  .la-badge-med   { background: rgba(245,158,11,.1);  color: #92400e; }
  .la-badge-high  { background: rgba(239,68,68,.1);   color: #991b1b; }

  /* expanded details */
  .la-row-details {
    border-top: 1px solid var(--gray);
    padding: .9rem 1rem 1rem;
    display: grid; grid-template-columns: 1fr 1fr; gap: .65rem;
    animation: la-fadein .2s ease both;
  }
  @keyframes la-fadein { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @media (min-width: 480px) { .la-row-details { grid-template-columns: repeat(3, 1fr); } }

  .la-detail-cell {}
  .la-detail-lbl { font-size: .68rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 3px; }
  .la-detail-val { font-size: .8rem; font-weight: 600; color: var(--navy); word-break: break-all; line-height: 1.4; }
  .la-detail-mono { font-family: 'Space Mono', monospace; font-size: .72rem; }

  .la-mfa-row {
    grid-column: 1 / -1;
    display: flex; align-items: center; gap: 7px;
    background: rgba(245,158,11,.06); border: 1px solid rgba(245,158,11,.2);
    border-radius: 7px; padding: .55rem .75rem;
    font-size: .78rem; font-weight: 700; color: #92400e;
  }

  /* empty */
  .la-empty {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 3rem 1rem;
  }
  .la-empty-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--gray-light); border: 1.5px solid var(--gray);
    display: flex; align-items: center; justify-content: center;
    color: var(--gray-dark); margin-bottom: 1rem;
  }
  .la-empty-title { font-size: .95rem; font-weight: 700; color: var(--navy); margin-bottom: .3rem; }
  .la-empty-sub   { font-size: .82rem; color: var(--muted); }

  /* ── SIDEBAR ── */
  .la-sidebar { display: flex; flex-direction: column; gap: 1.25rem; }

  /* risk chart */
  .la-chart-wrap { padding: 1.25rem 1.4rem; }
  .la-chart-bars {
    display: flex; align-items: flex-end; gap: 4px;
    height: 80px; margin-bottom: .75rem;
  }
  .la-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .la-bar-track { flex: 1; width: 100%; background: var(--gray-light); border-radius: 4px 4px 0 0; position: relative; min-height: 4px; overflow: hidden; }
  .la-bar-fill  { position: absolute; bottom: 0; left: 0; right: 0; border-radius: 4px 4px 0 0; transition: height .5s cubic-bezier(.22,1,.36,1); }
  .la-bar-lbl   { font-size: .62rem; color: var(--muted); text-align: center; white-space: nowrap; }

  /* threat summary */
  .la-threat-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: .7rem 0; border-bottom: 1px solid var(--gray);
  }
  .la-threat-item:last-child { border-bottom: none; }
  .la-threat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .la-td-ok   { background: var(--green);   box-shadow: 0 0 5px var(--green); }
  .la-td-warn { background: var(--warning); box-shadow: 0 0 5px var(--warning); }
  .la-td-fail { background: var(--danger);  box-shadow: 0 0 5px var(--danger); }
  .la-threat-label { font-size: .82rem; font-weight: 600; color: var(--navy); margin-bottom: 1px; }
  .la-threat-sub   { font-size: .72rem; color: var(--muted); }

  /* notice */
  .la-notice {
    border-radius: 12px; padding: 1.1rem 1.25rem;
    background: rgba(26,115,232,.05);
    border: 1px solid rgba(26,115,232,.18);
  }
  .la-notice-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: .5rem; }
  .la-notice-icon { width: 28px; height: 28px; border-radius: 7px; background: rgba(26,115,232,.1); color: var(--blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .la-notice-title { font-size: .85rem; font-weight: 800; color: var(--navy); }
  .la-notice-body  { font-size: .8rem; color: var(--muted); line-height: 1.65; margin-bottom: .85rem; }
  .la-notice-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: .5rem 1rem; border-radius: 8px; font-size: .8rem; font-weight: 700;
    background: var(--blue); color: #fff; border: none; cursor: pointer;
    font-family: inherit; text-decoration: none; transition: all .2s;
  }
  .la-notice-btn:hover { background: var(--blue-dark); transform: translateY(-1px); }

  /* ── LOADING ── */
  .la-loading {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; background: var(--gray-light);
  }
  .la-loading-ring {
    width: 42px; height: 42px; border-radius: 50%;
    border: 3px solid var(--gray); border-top-color: var(--blue);
    animation: la-spin .8s linear infinite; margin-bottom: 1rem;
  }
  @keyframes la-spin { to { transform: rotate(360deg); } }
  .la-loading-text { font-size: .9rem; color: var(--muted); font-family: 'Plus Jakarta Sans', sans-serif; }

  /* toast */
  .Toastify__toast { font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: .875rem !important; border-radius: 10px !important; }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }
`;

/* ── tiny icon helpers ── */
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ── helpers ── */
const riskColor = (score) =>
  score <= 30 ? 'var(--green)' : score <= 60 ? 'var(--warning)' : 'var(--danger)';

const riskBadgeCls = (level) =>
  level === 0 ? 'la-badge-low' : level === 1 ? 'la-badge-med' : 'la-badge-high';

const riskLabel = (level) =>
  level === 0 ? 'Low Risk' : level === 1 ? 'Medium Risk' : 'High Risk';

const statusBadgeCls = (status) =>
  status === 'success' ? 'la-badge-ok' : status === 'failed' ? 'la-badge-fail' : 'la-badge-mfa';

const dotCls = (status, mfa) =>
  status === 'success' && !mfa ? 'la-dot-ok' : status === 'failed' ? 'la-dot-fail' : 'la-dot-mfa';

/* export CSV */
function exportCSV(history) {
  const header = ['Timestamp','Status','City','Country','IP Address','Risk Score','Risk Level','MFA Required','MFA Completed','Device'];
  const rows = history.map(h => [
    new Date(h.timestamp).toLocaleString(),
    h.status, h.city, h.country, h.ip_address,
    h.risk_score,
    riskLabel(h.risk_level),
    h.mfa_required ? 'Yes' : 'No',
    h.mfa_completed ? 'Yes' : 'No',
    h.device_fingerprint || 'N/A',
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `securepay-login-activity-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

/* ── mini bar chart ── */
function RiskChart({ history }) {
  const days = useMemo(() => {
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[k] = { ok: 0, fail: 0, mfa: 0 };
    }
    history.forEach(h => {
      const k = new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (map[k]) {
        if (h.status === 'failed') map[k].fail++;
        else if (h.mfa_required)  map[k].mfa++;
        else                      map[k].ok++;
      }
    });
    return Object.entries(map).map(([label, counts]) => ({ label, ...counts, total: counts.ok + counts.fail + counts.mfa }));
  }, [history]);

  const max = Math.max(...days.map(d => d.total), 1);

  return (
    <div>
      <div className="la-chart-bars">
        {days.map(d => (
          <div className="la-chart-col" key={d.label}>
            <div className="la-bar-track" style={{ height: 72 }}>
              {/* stacked: fail on top, mfa, ok at bottom */}
              {d.total > 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {d.fail > 0 && (
                    <div style={{ height: `${(d.fail / max) * 100}%`, background: 'var(--danger)', opacity: 0.7, transition: 'height .5s', minHeight: 3 }} />
                  )}
                  {d.mfa > 0 && (
                    <div style={{ height: `${(d.mfa / max) * 100}%`, background: 'var(--warning)', opacity: 0.7, transition: 'height .5s', minHeight: 3 }} />
                  )}
                  {d.ok > 0 && (
                    <div style={{ height: `${(d.ok / max) * 100}%`, background: 'var(--green)', opacity: 0.8, transition: 'height .5s', minHeight: 3 }} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* x-axis labels */}
      <div style={{ display: 'flex', gap: 4 }}>
        {days.map(d => (
          <div key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: '.58rem', color: 'var(--muted)', lineHeight: 1.2 }}>
            {d.label.split(' ')[1]}
          </div>
        ))}
      </div>
      {/* legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: '.75rem', flexWrap: 'wrap' }}>
        {[['var(--green)','Success'],['var(--warning)','MFA'],['var(--danger)','Failed']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function LoginActivityPage() {
  const router = useRouter();

  const [user, setUser]             = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [expanded, setExpanded]     = useState(null);

  /* ── bootstrap ── */
  useEffect(() => {
    const token    = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/login'); return; }
    try {
      const u = JSON.parse(userData);
      setUser(u);
      fetchLoginHistory(token);
    } catch {
      router.push('/login');
    }
  }, [router]);

  /* ── fetch ── */
  const fetchLoginHistory = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login-history/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLoginHistory(data.login_history || []);
      }
    } catch (err) {
      console.error('Error fetching login history:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── logout ── */
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  /* ── derived ── */
  const counts = useMemo(() => ({
    total:   loginHistory.length,
    success: loginHistory.filter(l => l.status === 'success').length,
    failed:  loginHistory.filter(l => l.status === 'failed').length,
    mfa:     loginHistory.filter(l => l.mfa_required).length,
  }), [loginHistory]);

  const avgRisk = useMemo(() => {
    if (!loginHistory.length) return 0;
    return Math.round(loginHistory.reduce((s, l) => s + (l.risk_score || 0), 0) / loginHistory.length);
  }, [loginHistory]);

  const filteredHistory = useMemo(() => {
    let list = loginHistory;
    if (filter === 'success') list = list.filter(l => l.status === 'success');
    if (filter === 'failed')  list = list.filter(l => l.status === 'failed');
    if (filter === 'mfa')     list = list.filter(l => l.mfa_required === true);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(l =>
        (l.city?.toLowerCase().includes(q)) ||
        (l.country?.toLowerCase().includes(q)) ||
        (l.ip_address?.toLowerCase().includes(q)) ||
        (l.device_fingerprint?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [loginHistory, filter, search]);

  /* recent threats for sidebar */
  const recentThreats = useMemo(() =>
    loginHistory
      .filter(l => l.status === 'failed' || l.risk_level >= 1)
      .slice(0, 4)
  , [loginHistory]);

  /* ── loading ── */
  if (loading || !user) {
    return (
      <>
        <style>{css}</style>
        <div className="la-loading">
          <div className="la-loading-ring" />
          <p className="la-loading-text">Loading login activity…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <ToastContainer position="top-right" transition={Slide} closeButton={false} hideProgressBar={false} newestOnTop pauseOnHover theme="dark" />

      <div className="la-page">

        {/* ══ NAV ══ */}
        <nav className="la-nav">
          <div className="la-nav-inner">
            <a href="/" className="la-logo">
              <div className="la-logo-icon"><LockIcon /></div>
              <span className="la-logo-text">SecurePay</span>
            </a>
            <div className="la-nav-right">
              <a href="/dashboard"      className="la-nav-link">Dashboard</a>
              <a href="/profile"        className="la-nav-link">Profile</a>
              <a href="/login-activity" className="la-nav-link active">Activity</a>
              <button onClick={handleLogout} className="la-logout-btn">Logout</button>
            </div>
          </div>
        </nav>

        <div className="la-main">

          {/* header */}
          <div className="la-page-hdr">
            <h1 className="la-page-title">Login Activity</h1>
            <p className="la-page-sub">Monitor all login attempts and security events for your account.</p>
          </div>

          {/* ── METRICS ── */}
          <div className="la-metrics">
            {[
              { lbl: 'Total Logins',   val: counts.total,   sub: 'all attempts',            iCls: 'la-mi-blue',  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, valCol: 'var(--navy)' },
              { lbl: 'Successful',     val: counts.success, sub: 'verified logins',          iCls: 'la-mi-green', icon: <CheckIcon />, valCol: 'var(--green-dark)' },
              { lbl: 'Failed',         val: counts.failed,  sub: 'blocked attempts',         iCls: 'la-mi-red',   icon: <XIcon />,     valCol: 'var(--danger)' },
              { lbl: 'MFA Triggered',  val: counts.mfa,     sub: `avg risk ${avgRisk}/100`,  iCls: 'la-mi-amber', icon: <ShieldIcon />, valCol: 'var(--warning)' },
            ].map(m => (
              <div className="la-metric" key={m.lbl}>
                <div className="la-metric-top">
                  <span className="la-metric-lbl">{m.lbl}</span>
                  <div className={`la-metric-icon ${m.iCls}`}>{m.icon}</div>
                </div>
                <div className="la-metric-val" style={{ color: m.valCol }}>{m.val}</div>
                <div className="la-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* ── CONTENT GRID ── */}
          <div className="la-content-grid">

            {/* ── TIMELINE CARD ── */}
            <div className="la-card">
              <div className="la-card-hdr">
                <span className="la-card-title">
                  Login Timeline
                  {filteredHistory.length > 0 && (
                    <span style={{ marginLeft: 8, fontFamily: "'Space Mono', monospace", fontSize: '.72rem', fontWeight: 700, background: 'var(--gray-light)', border: '1px solid var(--gray)', padding: '1px 7px', borderRadius: 5, color: 'var(--muted)' }}>
                      {filteredHistory.length}
                    </span>
                  )}
                </span>

                <div className="la-toolbar">
                  {/* search */}
                  <div className="la-search-wrap">
                    <span className="la-search-icon"><SearchIcon /></span>
                    <input
                      type="text" className="la-search"
                      placeholder="Search location, IP…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  {/* filter tabs */}
                  <div className="la-filter-tabs">
                    {[
                      { id: 'all',     label: `All` },
                      { id: 'success', label: 'OK' },
                      { id: 'failed',  label: 'Failed' },
                      { id: 'mfa',     label: 'MFA' },
                    ].map(f => (
                      <button key={f.id} className={`la-ftab${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* export */}
                  <button className="la-export-btn" onClick={() => {
                    exportCSV(filteredHistory);
                    toast.success('CSV exported!', { autoClose: 2000 });
                  }}>
                    <DownloadIcon /> Export
                  </button>
                </div>
              </div>

              <div className="la-timeline">
                {filteredHistory.length === 0 ? (
                  <div className="la-empty">
                    <div className="la-empty-icon">
                      <ShieldIcon />
                    </div>
                    <div className="la-empty-title">No login events found</div>
                    <div className="la-empty-sub">
                      {search ? 'Try a different search term.' : 'No login attempts match the selected filter.'}
                    </div>
                  </div>
                ) : (
                  filteredHistory.map(attempt => {
                    const isOut = attempt.status === 'success';
                    const dc    = dotCls(attempt.status, attempt.mfa_required);
                    const isExp = expanded === attempt.id;
                    const rColor = riskColor(attempt.risk_score);

                    return (
                      <div className="la-tl-item" key={attempt.id}>

                        {/* dot */}
                        <div className={`la-tl-dot ${dc}`}>
                          {attempt.status === 'success' && !attempt.mfa_required ? <CheckIcon /> :
                           attempt.status === 'failed' ? <XIcon /> : <ShieldIcon />}
                        </div>

                        {/* row card */}
                        <div className="la-tl-body">
                          <div className="la-row-card">

                            {/* main row */}
                            <div className="la-row-main" onClick={() => setExpanded(isExp ? null : attempt.id)}>
                              <div className="la-row-left">
                                <div className="la-row-title">
                                  <span className="la-row-name">
                                    {attempt.status === 'success' ? 'Login Successful' : 'Login Failed'}
                                    {attempt.mfa_required ? ' · MFA' : ''}
                                  </span>
                                  <span className={`la-badge ${statusBadgeCls(attempt.status)}`}>
                                    {attempt.status}
                                  </span>
                                  {attempt.mfa_required && <span className="la-badge la-badge-mfa">MFA</span>}
                                </div>
                                <div className="la-row-meta">
                                  <span className="la-row-loc">
                                    <PinIcon />
                                    {attempt.city}, {attempt.country}
                                  </span>
                                  <span className="la-row-ip">{attempt.ip_address}</span>
                                  <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
                                    {new Date(attempt.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>

                              <div className="la-row-right">
                                <div className="la-risk-bar-wrap">
                                  <div className="la-risk-bar-track">
                                    <div className="la-risk-bar-fill" style={{ width: `${attempt.risk_score}%`, background: rColor }} />
                                  </div>
                                  <span className="la-risk-score" style={{ color: rColor }}>{attempt.risk_score}</span>
                                </div>
                                <span className={`la-badge ${riskBadgeCls(attempt.risk_level)}`}>
                                  {riskLabel(attempt.risk_level)}
                                </span>
                                <div className={`la-row-chevron${isExp ? ' open' : ''}`}>
                                  <ChevronDown />
                                </div>
                              </div>
                            </div>

                            {/* expanded details */}
                            {isExp && (
                              <div className="la-row-details">
                                <div className="la-detail-cell">
                                  <div className="la-detail-lbl">Date &amp; Time</div>
                                  <div className="la-detail-val">{new Date(attempt.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                </div>
                                <div className="la-detail-cell">
                                  <div className="la-detail-lbl">Location</div>
                                  <div className="la-detail-val">{attempt.city}, {attempt.country}</div>
                                </div>
                                <div className="la-detail-cell">
                                  <div className="la-detail-lbl">IP Address</div>
                                  <div className="la-detail-val la-detail-mono">{attempt.ip_address}</div>
                                </div>
                                <div className="la-detail-cell">
                                  <div className="la-detail-lbl">Risk Score</div>
                                  <div className="la-detail-val" style={{ color: rColor, fontFamily: "'Space Mono', monospace" }}>
                                    {attempt.risk_score} / 100
                                  </div>
                                </div>
                                <div className="la-detail-cell">
                                  <div className="la-detail-lbl">Device ID</div>
                                  <div className="la-detail-val la-detail-mono" style={{ wordBreak: 'break-all' }}>
                                    {attempt.device_fingerprint || 'Unknown'}
                                  </div>
                                </div>
                                <div className="la-detail-cell">
                                  <div className="la-detail-lbl">User Agent</div>
                                  <div className="la-detail-val" style={{ fontSize: '.72rem', wordBreak: 'break-all', lineHeight: 1.5 }}>
                                    {attempt.user_agent ? attempt.user_agent.slice(0, 80) + (attempt.user_agent.length > 80 ? '…' : '') : 'N/A'}
                                  </div>
                                </div>
                                {attempt.mfa_required && (
                                  <div className="la-mfa-row">
                                    <ShieldIcon />
                                    MFA was required for this login attempt
                                    {attempt.mfa_completed && <span style={{ marginLeft: 6, color: 'var(--green-dark)', fontWeight: 700 }}>· Completed ✓</span>}
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="la-sidebar">

              {/* 7-day chart */}
              <div className="la-card">
                <div className="la-card-hdr" style={{ borderBottom: '1px solid var(--gray)', paddingBottom: '1rem' }}>
                  <span className="la-card-title">7-Day Activity</span>
                </div>
                <div className="la-chart-wrap">
                  {loginHistory.length > 0 ? (
                    <RiskChart history={loginHistory} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--muted)', fontSize: '.82rem' }}>
                      No data yet
                    </div>
                  )}
                </div>
              </div>

              {/* threat summary */}
              {recentThreats.length > 0 && (
                <div className="la-card">
                  <div className="la-card-hdr">
                    <span className="la-card-title">Recent Threats</span>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--danger)', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', padding: '2px 7px', borderRadius: 100 }}>
                      {recentThreats.length}
                    </span>
                  </div>
                  <div style={{ padding: '0 1.4rem 1rem' }}>
                    {recentThreats.map(t => (
                      <div className="la-threat-item" key={t.id}>
                        <span className={`la-threat-dot ${t.status === 'failed' ? 'la-td-fail' : 'la-td-warn'}`} />
                        <div>
                          <div className="la-threat-label">
                            {t.status === 'failed' ? 'Failed login' : 'High-risk login'}
                          </div>
                          <div className="la-threat-sub">
                            {t.city}, {t.country} · Score {t.risk_score}/100
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* security notice */}
              <div className="la-notice">
                <div className="la-notice-hdr">
                  <div className="la-notice-icon"><InfoIcon /></div>
                  <span className="la-notice-title">Don't recognise a login?</span>
                </div>
                <div className="la-notice-body">
                  If you see suspicious activity, secure your account immediately by changing your password and reviewing your security settings.
                </div>
                <a href="/profile" className="la-notice-btn">
                  Secure My Account
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}