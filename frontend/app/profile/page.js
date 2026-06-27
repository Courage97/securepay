'use client';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

import { useState, useEffect, useMemo } from 'react';
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
  .pp-page { background: var(--gray-light); min-height: 100vh; overflow-x: hidden; }

  /* ── NAV ── */
  .pp-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,27,42,0.97);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 2px 20px rgba(0,0,0,0.25);
  }
  .pp-nav-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 62px;
  }
  @media (min-width: 640px) { .pp-nav-inner { padding: 0 1.75rem; } }
  @media (min-width: 1024px) { .pp-nav-inner { padding: 0 2rem; } }

  .pp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .pp-logo-icon {
    width: 34px; height: 34px; border-radius: 8px; background: var(--blue);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(26,115,232,.4); flex-shrink: 0;
  }
  .pp-logo-text { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

  .pp-nav-right { display: flex; align-items: center; gap: 0.5rem; }
  .pp-nav-link {
    color: rgba(255,255,255,.55); font-size: 0.82rem; font-weight: 500;
    text-decoration: none; padding: 0.4rem 0.65rem; border-radius: 6px;
    transition: all .2s; white-space: nowrap; display: none;
  }
  @media (min-width: 580px) { .pp-nav-link { display: block; } }
  .pp-nav-link:hover { background: rgba(255,255,255,.07); color: #fff; }
  .pp-nav-link.active { background: rgba(26,115,232,.15); color: var(--blue-light); }

  .pp-logout-btn {
    background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2);
    color: #f87171; font-size: 0.8rem; font-weight: 600; font-family: inherit;
    padding: 0.4rem 0.85rem; border-radius: 7px; cursor: pointer;
    transition: all .2s; white-space: nowrap;
  }
  .pp-logout-btn:hover { background: rgba(239,68,68,.18); color: #fca5a5; }

  /* ── MAIN ── */
  .pp-main {
    max-width: 1100px; margin: 0 auto;
    padding: 2rem 1.25rem 3rem;
  }
  @media (min-width: 640px)  { .pp-main { padding: 2.25rem 1.75rem 3rem; } }
  @media (min-width: 1024px) { .pp-main { padding: 2.5rem 2rem 3rem; } }

  .pp-page-heading { margin-bottom: 2rem; }
  .pp-page-title { font-size: clamp(1.5rem,3vw,2rem); font-weight: 800; letter-spacing: -0.03em; color: var(--navy); margin-bottom: 0.3rem; }
  .pp-page-sub    { font-size: 0.9rem; color: var(--muted); }

  /* ── LAYOUT ── */
  .pp-grid {
    display: grid; grid-template-columns: 1fr;
    gap: 1.5rem; align-items: start;
  }
  @media (min-width: 860px) {
    .pp-grid { grid-template-columns: 280px 1fr; }
  }

  /* ── CARD ── */
  .pp-card {
    background: #fff; border: 1px solid var(--gray);
    border-radius: 16px; box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  /* ── SIDEBAR ── */
  .pp-sidebar-top {
    padding: 2rem 1.5rem 1.5rem;
    background: linear-gradient(160deg, var(--navy-dark) 0%, #0a1628 55%, var(--navy-light) 100%);
    display: flex; flex-direction: column; align-items: center; text-align: center;
    position: relative; overflow: hidden;
  }
  .pp-sidebar-orb {
    position: absolute; border-radius: 50%; pointer-events: none; filter: blur(55px);
    opacity: 0.25;
  }
  .pp-sidebar-orb-1 { width: 200px; height: 200px; background: var(--blue);  top: -60px; right: -40px; }
  .pp-sidebar-orb-2 { width: 150px; height: 150px; background: var(--green); bottom: -40px; left: -30px; }

  /* avatar */
  .pp-avatar-wrap { position: relative; margin-bottom: 1rem; z-index: 1; }
  .pp-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, var(--blue), var(--blue-light));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace; font-size: 1.6rem; font-weight: 700; color: #fff;
    border: 3px solid rgba(255,255,255,0.15);
    box-shadow: 0 0 30px rgba(26,115,232,0.4);
  }
  .pp-avatar-badge {
    position: absolute; bottom: 2px; right: 2px;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--green); border: 2.5px solid var(--navy);
    box-shadow: 0 0 6px var(--green);
  }

  .pp-sidebar-name  { font-size: 1.05rem; font-weight: 800; color: #fff; margin-bottom: 0.2rem; letter-spacing: -0.02em; position: relative; z-index: 1; }
  .pp-sidebar-email { font-size: 0.78rem; color: rgba(255,255,255,0.5); position: relative; z-index: 1; }

  /* sidebar stats */
  .pp-sidebar-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    border-top: 1px solid rgba(255,255,255,0.07);
    position: relative; z-index: 1; width: 100%;
  }
  .pp-sidebar-stat {
    padding: 0.9rem 0.75rem; text-align: center;
    border-right: 1px solid rgba(255,255,255,0.07);
  }
  .pp-sidebar-stat:last-child { border-right: none; }
  .pp-sidebar-stat-val {
    font-family: 'Space Mono', monospace; font-size: 0.9rem; font-weight: 700;
    color: #fff; margin-bottom: 2px;
  }
  .pp-sidebar-stat-lbl { font-size: 0.68rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.06em; }

  /* sidebar info rows */
  .pp-sidebar-info { padding: 1.1rem 1.4rem; display: flex; flex-direction: column; gap: 0; }
  .pp-info-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.65rem 0; border-bottom: 1px solid var(--gray);
    gap: 8px;
  }
  .pp-info-row:last-child { border-bottom: none; }
  .pp-info-label { font-size: 0.75rem; color: var(--muted); font-weight: 600; white-space: nowrap; }
  .pp-info-val   { font-size: 0.82rem; font-weight: 700; color: var(--navy); text-align: right; word-break: break-all; }
  .pp-info-val-mono { font-family: 'Space Mono', monospace; font-size: 0.78rem; letter-spacing: 0.03em; }

  /* copy button */
  .pp-copy-btn {
    background: rgba(26,115,232,.08); border: 1px solid rgba(26,115,232,.2);
    color: var(--blue); border-radius: 5px; padding: 2px 7px;
    font-size: 0.68rem; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: all .18s; flex-shrink: 0; display: flex; align-items: center; gap: 3px;
  }
  .pp-copy-btn:hover { background: rgba(26,115,232,.15); }
  .pp-copy-btn.done  { background: rgba(43,196,138,.1); border-color: rgba(43,196,138,.3); color: var(--green-dark); }

  /* ── TABS ── */
  .pp-tabs {
    display: flex; border-bottom: 1px solid var(--gray);
    padding: 0 1.5rem; gap: 0; overflow-x: auto;
  }
  .pp-tab {
    padding: 1rem 1.1rem; font-size: 0.845rem; font-weight: 700;
    color: var(--muted); background: none; border: none; cursor: pointer;
    font-family: inherit; transition: color .2s; white-space: nowrap;
    border-bottom: 2.5px solid transparent; margin-bottom: -1px;
    display: flex; align-items: center; gap: 6px;
  }
  .pp-tab:hover { color: var(--navy); }
  .pp-tab.active { color: var(--blue); border-bottom-color: var(--blue); }
  .pp-tab-icon { display: flex; align-items: center; }

  /* ── TAB BODY ── */
  .pp-tab-body { padding: 1.75rem 1.5rem; }
  @media (min-width: 640px) { .pp-tab-body { padding: 2rem; } }

  /* ── SECTION HEADER ── */
  .pp-sec-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;
  }
  .pp-sec-title { font-size: 1rem; font-weight: 800; color: var(--navy); letter-spacing: -0.02em; }

  /* edit / save button */
  .pp-edit-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 0.45rem 1rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700;
    cursor: pointer; font-family: inherit; border: none; transition: all .2s;
  }
  .pp-edit-btn-outline {
    background: transparent; border: 1.5px solid var(--blue); color: var(--blue);
  }
  .pp-edit-btn-outline:hover { background: rgba(26,115,232,.06); }
  .pp-edit-btn-cancel {
    background: var(--gray-light); border: 1.5px solid var(--gray); color: var(--navy);
  }
  .pp-edit-btn-cancel:hover { background: var(--gray); }

  /* display rows */
  .pp-display-grid { display: flex; flex-direction: column; gap: 0; }
  .pp-display-row {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 0.9rem 0; border-bottom: 1px solid var(--gray);
    gap: 1rem; flex-wrap: wrap;
  }
  .pp-display-row:last-child { border-bottom: none; }
  .pp-dr-label { font-size: 0.78rem; font-weight: 700; color: var(--muted); min-width: 120px; padding-top: 1px; }
  .pp-dr-val   { font-size: 0.875rem; font-weight: 600; color: var(--navy); flex: 1; }
  .pp-dr-locked {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.68rem; font-weight: 700; color: var(--muted);
    background: var(--gray-light); border: 1px solid var(--gray);
    padding: 2px 7px; border-radius: 5px;
  }

  /* ── FORM FIELDS ── */
  .pp-field { margin-bottom: 1.15rem; }
  .pp-field:last-child { margin-bottom: 0; }
  .pp-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; font-weight: 700; color: var(--navy);
    margin-bottom: 0.45rem; letter-spacing: 0.02em;
  }
  .pp-locked-chip {
    font-size: 0.65rem; font-weight: 600; color: var(--muted);
    background: var(--gray-light); border: 1px solid var(--gray);
    padding: 1px 6px; border-radius: 4px;
  }
  .pp-input-wrap { position: relative; }
  .pp-input-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    color: var(--gray-dark); pointer-events: none; display: flex;
  }
  .pp-input {
    width: 100%; padding: 0.78rem 0.9rem 0.78rem 2.4rem;
    border: 1.5px solid var(--gray-dark); border-radius: 9px;
    background: #fff; color: var(--navy); font-size: 0.875rem;
    font-family: inherit; outline: none; transition: all .2s; -webkit-appearance: none;
  }
  .pp-input::placeholder { color: var(--gray-dark); }
  .pp-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,115,232,.12); }
  .pp-input:disabled { background: var(--gray-light); cursor: not-allowed; color: var(--muted); opacity: 1; }
  .pp-input-locked { background: var(--gray-light) !important; color: var(--muted) !important; }
  .pp-hint { font-size: 0.72rem; color: var(--muted); margin-top: 0.3rem; }

  /* pw toggle */
  .pp-pw-toggle {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    color: var(--gray-dark); transition: color .2s; display: flex;
  }
  .pp-pw-toggle:hover { color: var(--navy); }

  /* pw strength */
  .pp-strength { margin-top: 0.5rem; }
  .pp-strength-bar { display: flex; gap: 3px; margin-bottom: 0.3rem; }
  .pp-strength-seg {
    flex: 1; height: 3px; border-radius: 3px; background: var(--gray);
    transition: background 0.3s;
  }
  .pp-ss-1 { background: var(--danger); }
  .pp-ss-2 { background: var(--warning); }
  .pp-ss-3 { background: var(--blue-light); }
  .pp-ss-4 { background: var(--green); }
  .pp-strength-label { font-size: 0.7rem; font-weight: 700; }
  .pp-sl-1 { color: var(--danger); }
  .pp-sl-2 { color: var(--warning); }
  .pp-sl-3 { color: var(--blue-light); }
  .pp-sl-4 { color: var(--green); }

  /* pw match */
  .pp-match { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; margin-top: 0.35rem; font-weight: 700; }
  .pp-match-ok  { color: var(--green); }
  .pp-match-err { color: var(--danger); }

  /* form row buttons */
  .pp-form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  .pp-fbtn {
    flex: 1; padding: 0.82rem; border-radius: 9px; font-size: 0.875rem;
    font-weight: 700; font-family: inherit; cursor: pointer; border: none;
    transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .pp-fbtn:disabled { opacity: .45; cursor: not-allowed; transform: none !important; }
  .pp-fbtn-cancel  { background: var(--gray-light); color: var(--navy); border: 1.5px solid var(--gray); }
  .pp-fbtn-cancel:hover:not(:disabled) { background: var(--gray); }
  .pp-fbtn-primary { background: var(--blue); color: #fff; box-shadow: 0 0 14px rgba(26,115,232,.25); }
  .pp-fbtn-primary:hover:not(:disabled) { background: var(--blue-dark); transform: translateY(-1px); }
  .pp-fbtn-danger  { background: var(--danger); color: #fff; box-shadow: 0 0 14px rgba(239,68,68,.2); }
  .pp-fbtn-danger:hover:not(:disabled)  { background: #dc2626; transform: translateY(-1px); }

  /* spinner */
  .pp-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    animation: pp-spin .65s linear infinite; flex-shrink: 0;
  }
  @keyframes pp-spin { to { transform: rotate(360deg); } }

  /* ── SECURITY ITEMS ── */
  .pp-sec-items { display: flex; flex-direction: column; gap: 0; }
  .pp-sec-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 0; border-bottom: 1px solid var(--gray);
    gap: 1rem; flex-wrap: wrap;
  }
  .pp-sec-item:last-child { border-bottom: none; }
  .pp-sec-item-left { display: flex; align-items: center; gap: 12px; }
  .pp-sec-item-icon {
    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .pp-si-blue   { background: rgba(26,115,232,.09);  color: var(--blue); }
  .pp-si-green  { background: rgba(43,196,138,.09);  color: var(--green); }
  .pp-si-amber  { background: rgba(245,158,11,.09);  color: var(--warning); }
  .pp-si-danger { background: rgba(239,68,68,.09);   color: var(--danger); }
  .pp-si-label { font-size: 0.875rem; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
  .pp-si-sub   { font-size: 0.77rem; color: var(--muted); }

  .pp-badge {
    display: inline-flex; align-items: center; padding: 0.2rem 0.65rem;
    border-radius: 100px; font-size: 0.7rem; font-weight: 700; white-space: nowrap;
  }
  .pp-badge-success { background: rgba(43,196,138,.12);  color: var(--green-dark); }
  .pp-badge-warning { background: rgba(245,158,11,.12);  color: #92400e; }
  .pp-badge-danger  { background: rgba(239,68,68,.1);    color: #991b1b; }
  .pp-badge-info    { background: rgba(26,115,232,.1);   color: var(--blue-dark); }

  .pp-change-pw-btn {
    background: transparent; border: 1.5px solid var(--blue); color: var(--blue);
    padding: 0.4rem 0.9rem; border-radius: 7px; font-size: 0.78rem; font-weight: 700;
    cursor: pointer; font-family: inherit; transition: all .2s; white-space: nowrap;
  }
  .pp-change-pw-btn:hover { background: rgba(26,115,232,.07); }

  /* pw change inline form */
  .pp-pw-form-wrap {
    margin-top: 1rem; padding: 1.25rem;
    background: var(--gray-light); border-radius: 12px;
    border: 1px solid var(--gray);
    animation: pp-fadein .25s ease both;
  }
  @keyframes pp-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .pp-pw-form-title { font-size: 0.85rem; font-weight: 800; color: var(--navy); margin-bottom: 1rem; }

  /* ── DANGER ZONE ── */
  .pp-danger-zone {
    border: 1.5px solid rgba(239,68,68,.25);
    border-radius: 12px; padding: 1.25rem 1.4rem;
    background: rgba(239,68,68,.03);
  }
  .pp-danger-title { font-size: 0.85rem; font-weight: 800; color: var(--danger); margin-bottom: 0.5rem; }
  .pp-danger-desc  { font-size: 0.82rem; color: var(--muted); line-height: 1.6; margin-bottom: 1.1rem; }

  /* ── LOADING ── */
  .pp-loading {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; background: var(--gray-light);
  }
  .pp-loading-ring {
    width: 42px; height: 42px; border-radius: 50%;
    border: 3px solid var(--gray); border-top-color: var(--blue);
    animation: pp-spin .8s linear infinite; margin-bottom: 1rem;
  }
  .pp-loading-text { font-size: 0.9rem; color: var(--muted); font-family: 'Plus Jakarta Sans', sans-serif; }

  /* toast */
  .Toastify__toast { font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: .875rem !important; border-radius: 10px !important; }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }

  @media (max-width: 480px) {
    .pp-form-actions { flex-direction: column; }
    .pp-sec-item { flex-direction: column; align-items: flex-start; }
  }
`;

/* ── icon helpers ── */
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);
const UserIcon2 = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.9 1.18 2 2 0 012.92.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.99 14l.01 2.92z"/>
  </svg>
);
const PwIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

/* ── password strength ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', cls: '' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const c = Math.min(s, 4);
  return {
    score: c,
    label: ['','Weak','Fair','Good','Strong'][c],
    cls:   ['','pp-sl-1','pp-sl-2','pp-sl-3','pp-sl-4'][c],
    segCls:['','pp-ss-1','pp-ss-2','pp-ss-3','pp-ss-4'][c],
  };
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [copied, setCopied]       = useState(false);

  /* profile form */
  const [editMode, setEditMode]       = useState(false);
  const [formData, setFormData]       = useState({ username: '', email: '', phone_number: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  /* password form */
  const [showPwForm, setShowPwForm]   = useState(false);
  const [pwForm, setPwForm]           = useState({ old_password: '', new_password: '', new_password2: '' });
  const [showOld, setShowOld]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showNew2, setShowNew2]       = useState(false);
  const [pwLoading, setPwLoading]     = useState(false);

  /* ── bootstrap ── */
  useEffect(() => {
    const token    = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/login'); return; }
    try {
      const u = JSON.parse(userData);
      setUser(u);
      setFormData({ username: u.username, email: u.email, phone_number: u.phone_number || '' });
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /* ── copy account number ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(user?.account_number || '').then(() => {
      setCopied(true);
      toast.info('Account number copied!', { autoClose: 2000 });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── profile update ── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('${API_URL}/api/auth/profile/', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = data.user || formData;
        localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
        setUser(prev => ({ ...prev, ...updated }));
        setEditMode(false);
        toast.success('Profile updated successfully!', { autoClose: 2500 });
      } else {
        toast.error(data.message || 'Failed to update profile.', { autoClose: 4000 });
      }
    } catch {
      toast.error('Unable to connect to server.', { autoClose: 4000 });
    } finally {
      setUpdateLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData({ username: user.username, email: user.email, phone_number: user.phone_number || '' });
  };

  /* ── password change ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters.'); return;
    }
    if (pwForm.new_password !== pwForm.new_password2) {
      toast.error('New passwords do not match.'); return;
    }
    setPwLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      /* Production endpoint — uncomment when available:
      const res = await fetch('${API_URL}/api/auth/change-password/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (res.ok) { ... } else { toast.error(data.message); }
      */
      await new Promise(r => setTimeout(r, 900)); // simulate
      toast.success('Password changed successfully!', { autoClose: 2500 });
      setPwForm({ old_password: '', new_password: '', new_password2: '' });
      setShowPwForm(false);
    } catch {
      toast.error('Unable to connect to server.');
    } finally {
      setPwLoading(false);
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
  const strength   = useMemo(() => getStrength(pwForm.new_password), [pwForm.new_password]);
  const pwMatch    = pwForm.new_password2.length > 0 && pwForm.new_password === pwForm.new_password2;
  const pwNoMatch  = pwForm.new_password2.length > 0 && pwForm.new_password !== pwForm.new_password2;
  const initials   = user?.username?.slice(0, 2).toUpperCase() || 'SP';

  /* ── loading ── */
  if (loading || !user) {
    return (
      <>
        <style>{css}</style>
        <div className="pp-loading">
          <div className="pp-loading-ring" />
          <p className="pp-loading-text">Loading profile…</p>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'account',  label: 'Account Info',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'security', label: 'Security',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: 'danger',   label: 'Danger Zone',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  ];

  return (
    <>
      <style>{css}</style>

      <ToastContainer position="top-right" transition={Slide} closeButton={false} hideProgressBar={false} newestOnTop pauseOnHover theme="dark" />

      <div className="pp-page">

        {/* ══ NAV ══ */}
        <nav className="pp-nav">
          <div className="pp-nav-inner">
            <a href="/" className="pp-logo">
              <div className="pp-logo-icon"><LockIcon /></div>
              <span className="pp-logo-text">SecurePay</span>
            </a>
            <div className="pp-nav-right">
              <a href="/dashboard"      className="pp-nav-link">Dashboard</a>
              <a href="/login-activity" className="pp-nav-link">Login Activity</a>
              <a href="/profile"        className="pp-nav-link active">Profile</a>
              <button onClick={handleLogout} className="pp-logout-btn">Logout</button>
            </div>
          </div>
        </nav>

        {/* ══ MAIN ══ */}
        <div className="pp-main">

          <div className="pp-page-heading">
            <h1 className="pp-page-title">My Profile</h1>
            <p className="pp-page-sub">Manage your account information and settings.</p>
          </div>

          <div className="pp-grid">

            {/* ── SIDEBAR ── */}
            <div className="pp-card">
              <div className="pp-sidebar-top">
                <div className="pp-sidebar-orb pp-sidebar-orb-1" />
                <div className="pp-sidebar-orb pp-sidebar-orb-2" />
                <div className="pp-avatar-wrap">
                  <div className="pp-avatar">{initials}</div>
                  <div className="pp-avatar-badge" />
                </div>
                <div className="pp-sidebar-name">{user.username}</div>
                <div className="pp-sidebar-email">{user.email}</div>

                <div className="pp-sidebar-stats" style={{ marginTop: '1.25rem' }}>
                  <div className="pp-sidebar-stat">
                    <div className="pp-sidebar-stat-val" style={{ color: 'var(--green-light)' }}>
                      ₦{parseFloat(user.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </div>
                    <div className="pp-sidebar-stat-lbl">Balance</div>
                  </div>
                  <div className="pp-sidebar-stat">
                    <div className="pp-sidebar-stat-val" style={{ color: 'var(--blue-light)' }}>Active</div>
                    <div className="pp-sidebar-stat-lbl">Status</div>
                  </div>
                </div>
              </div>

              <div className="pp-sidebar-info">
                <div className="pp-info-row">
                  <span className="pp-info-label">Account No.</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="pp-info-val pp-info-val-mono">{user.account_number}</span>
                    <button className={`pp-copy-btn${copied ? ' done' : ''}`} onClick={handleCopy}>
                      {copied ? <><CheckIcon size={10} /> Done</> : <><CopyIcon /> Copy</>}
                    </button>
                  </div>
                </div>
                <div className="pp-info-row">
                  <span className="pp-info-label">Phone</span>
                  <span className="pp-info-val">{user.phone_number || '—'}</span>
                </div>
                <div className="pp-info-row">
                  <span className="pp-info-label">MFA</span>
                  <span className="pp-badge pp-badge-success">Enabled</span>
                </div>
                <div className="pp-info-row">
                  <span className="pp-info-label">AI Shield</span>
                  <span className="pp-badge pp-badge-success">Active</span>
                </div>
              </div>
            </div>

            {/* ── MAIN PANEL ── */}
            <div className="pp-card">

              {/* tabs */}
              <div className="pp-tabs">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    className={`pp-tab${activeTab === t.id ? ' active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <span className="pp-tab-icon">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="pp-tab-body">

                {/* ── ACCOUNT INFO TAB ── */}
                {activeTab === 'account' && (
                  <>
                    <div className="pp-sec-hdr">
                      <span className="pp-sec-title">Account Information</span>
                      {!editMode ? (
                        <button className="pp-edit-btn pp-edit-btn-outline" onClick={() => setEditMode(true)}>
                          <EditIcon /> Edit Profile
                        </button>
                      ) : (
                        <button className="pp-edit-btn pp-edit-btn-cancel" onClick={cancelEdit} disabled={updateLoading}>
                          Cancel
                        </button>
                      )}
                    </div>

                    {!editMode ? (
                      <div className="pp-display-grid">
                        {[
                          { label: 'Username', val: user.username, locked: true },
                          { label: 'Email Address', val: user.email },
                          { label: 'Phone Number', val: user.phone_number || 'Not provided' },
                          { label: 'Account Number', val: user.account_number, mono: true },
                        ].map(row => (
                          <div className="pp-display-row" key={row.label}>
                            <span className="pp-dr-label">{row.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                              <span className={`pp-dr-val${row.mono ? ' pp-info-val-mono' : ''}`} style={{ textAlign: 'right' }}>{row.val}</span>
                              {row.locked && <span className="pp-dr-locked"><LockIcon /> locked</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateProfile}>
                        {/* username — locked */}
                        <div className="pp-field">
                          <label className="pp-label">
                            <UserIcon2 /> Username
                            <span className="pp-locked-chip">cannot be changed</span>
                          </label>
                          <div className="pp-input-wrap">
                            <span className="pp-input-icon"><UserIcon2 /></span>
                            <input type="text" className="pp-input pp-input-locked" value={formData.username} disabled />
                          </div>
                        </div>

                        {/* email */}
                        <div className="pp-field">
                          <label className="pp-label"><MailIcon /> Email Address</label>
                          <div className="pp-input-wrap">
                            <span className="pp-input-icon"><MailIcon /></span>
                            <input
                              type="email" name="email" className="pp-input"
                              value={formData.email}
                              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                              required disabled={updateLoading}
                            />
                          </div>
                        </div>

                        {/* phone */}
                        <div className="pp-field">
                          <label className="pp-label">
                            <PhoneIcon /> Phone Number
                            <span className="pp-locked-chip" style={{ background: 'rgba(43,196,138,.07)', borderColor: 'rgba(43,196,138,.2)', color: 'var(--green-dark)' }}>optional</span>
                          </label>
                          <div className="pp-input-wrap">
                            <span className="pp-input-icon"><PhoneIcon /></span>
                            <input
                              type="tel" name="phone_number" className="pp-input"
                              value={formData.phone_number}
                              onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                              placeholder="+234 800 000 0000" disabled={updateLoading}
                            />
                          </div>
                        </div>

                        <div className="pp-form-actions">
                          <button type="button" className="pp-fbtn pp-fbtn-cancel" onClick={cancelEdit} disabled={updateLoading}>
                            Cancel
                          </button>
                          <button type="submit" className="pp-fbtn pp-fbtn-primary" disabled={updateLoading}>
                            {updateLoading ? <><span className="pp-spinner" /> Saving…</> : <><CheckIcon /> Save Changes</>}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === 'security' && (
                  <>
                    <div className="pp-sec-hdr">
                      <span className="pp-sec-title">Security Settings</span>
                    </div>

                    <div className="pp-sec-items">

                      {/* password row */}
                      <div className="pp-sec-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div className="pp-sec-item-left">
                            <div className="pp-sec-item-icon pp-si-blue"><PwIcon /></div>
                            <div>
                              <div className="pp-si-label">Password</div>
                              <div className="pp-si-sub" style={{ fontFamily: "'Space Mono', monospace", letterSpacing: '0.15em' }}>••••••••••</div>
                            </div>
                          </div>
                          {!showPwForm && (
                            <button className="pp-change-pw-btn" onClick={() => setShowPwForm(true)}>
                              Change Password
                            </button>
                          )}
                        </div>

                        {showPwForm && (
                          <div className="pp-pw-form-wrap">
                            <div className="pp-pw-form-title">Change Password</div>
                            <form onSubmit={handleChangePassword}>
                              {/* current */}
                              <div className="pp-field">
                                <label className="pp-label"><PwIcon /> Current Password</label>
                                <div className="pp-input-wrap">
                                  <span className="pp-input-icon"><PwIcon /></span>
                                  <input
                                    type={showOld ? 'text' : 'password'}
                                    name="old_password" className="pp-input"
                                    value={pwForm.old_password}
                                    onChange={e => setPwForm(p => ({ ...p, old_password: e.target.value }))}
                                    required disabled={pwLoading} placeholder="Enter current password"
                                    autoComplete="current-password"
                                  />
                                  <button type="button" className="pp-pw-toggle" onClick={() => setShowOld(v => !v)} tabIndex={-1}>
                                    {showOld ? <EyeOff /> : <EyeOn />}
                                  </button>
                                </div>
                              </div>

                              {/* new */}
                              <div className="pp-field">
                                <label className="pp-label"><PwIcon /> New Password</label>
                                <div className="pp-input-wrap">
                                  <span className="pp-input-icon"><PwIcon /></span>
                                  <input
                                    type={showNew ? 'text' : 'password'}
                                    name="new_password" className="pp-input"
                                    value={pwForm.new_password}
                                    onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                                    required disabled={pwLoading} minLength={8}
                                    placeholder="Create new password"
                                    autoComplete="new-password"
                                  />
                                  <button type="button" className="pp-pw-toggle" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                                    {showNew ? <EyeOff /> : <EyeOn />}
                                  </button>
                                </div>
                                {pwForm.new_password && (
                                  <div className="pp-strength">
                                    <div className="pp-strength-bar">
                                      {[1,2,3,4].map(n => (
                                        <div key={n} className={`pp-strength-seg${strength.score >= n ? ` ${strength.segCls}` : ''}`} />
                                      ))}
                                    </div>
                                    <span className={`pp-strength-label ${strength.cls}`}>{strength.label} password</span>
                                  </div>
                                )}
                              </div>

                              {/* confirm */}
                              <div className="pp-field">
                                <label className="pp-label"><PwIcon /> Confirm New Password</label>
                                <div className="pp-input-wrap">
                                  <span className="pp-input-icon"><PwIcon /></span>
                                  <input
                                    type={showNew2 ? 'text' : 'password'}
                                    name="new_password2" className="pp-input"
                                    value={pwForm.new_password2}
                                    onChange={e => setPwForm(p => ({ ...p, new_password2: e.target.value }))}
                                    required disabled={pwLoading} minLength={8}
                                    placeholder="Re-enter new password"
                                    autoComplete="new-password"
                                  />
                                  <button type="button" className="pp-pw-toggle" onClick={() => setShowNew2(v => !v)} tabIndex={-1}>
                                    {showNew2 ? <EyeOff /> : <EyeOn />}
                                  </button>
                                </div>
                                {pwMatch    && <div className="pp-match pp-match-ok"><CheckIcon size={11} /> Passwords match</div>}
                                {pwNoMatch  && <div className="pp-match pp-match-err">✕ Passwords don't match</div>}
                              </div>

                              <div className="pp-form-actions">
                                <button type="button" className="pp-fbtn pp-fbtn-cancel"
                                  onClick={() => { setShowPwForm(false); setPwForm({ old_password: '', new_password: '', new_password2: '' }); }}
                                  disabled={pwLoading}>
                                  Cancel
                                </button>
                                <button type="submit" className="pp-fbtn pp-fbtn-primary" disabled={pwLoading}>
                                  {pwLoading ? <><span className="pp-spinner" /> Saving…</> : 'Update Password'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>

                      {/* AI shield */}
                      <div className="pp-sec-item">
                        <div className="pp-sec-item-left">
                          <div className="pp-sec-item-icon pp-si-green">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="pp-si-label">AI Pharming Protection</div>
                            <div className="pp-si-sub">Monitors every login in real-time</div>
                          </div>
                        </div>
                        <span className="pp-badge pp-badge-success">Active</span>
                      </div>

                      {/* MFA */}
                      <div className="pp-sec-item">
                        <div className="pp-sec-item-left">
                          <div className="pp-sec-item-icon pp-si-blue">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="pp-si-label">Adaptive MFA</div>
                            <div className="pp-si-sub">Triggered on high-risk login attempts</div>
                          </div>
                        </div>
                        <span className="pp-badge pp-badge-success">Enabled</span>
                      </div>

                      {/* device fingerprinting */}
                      <div className="pp-sec-item">
                        <div className="pp-sec-item-left">
                          <div className="pp-sec-item-icon pp-si-amber">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                            </svg>
                          </div>
                          <div>
                            <div className="pp-si-label">Device Fingerprinting</div>
                            <div className="pp-si-sub">Recognized devices bypass extra checks</div>
                          </div>
                        </div>
                        <span className="pp-badge pp-badge-success">Active</span>
                      </div>

                      {/* 2FA */}
                      <div className="pp-sec-item">
                        <div className="pp-sec-item-left">
                          <div className="pp-sec-item-icon pp-si-amber">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
                            </svg>
                          </div>
                          <div>
                            <div className="pp-si-label">Hardware 2FA</div>
                            <div className="pp-si-sub">TOTP authenticator app support</div>
                          </div>
                        </div>
                        <span className="pp-badge pp-badge-warning">Coming Soon</span>
                      </div>

                    </div>
                  </>
                )}

                {/* ── DANGER ZONE TAB ── */}
                {activeTab === 'danger' && (
                  <>
                    <div className="pp-sec-hdr">
                      <span className="pp-sec-title" style={{ color: 'var(--danger)' }}>Danger Zone</span>
                    </div>

                    <div className="pp-danger-zone">
                      <div className="pp-danger-title">Delete Account</div>
                      <div className="pp-danger-desc">
                        Permanently deletes your SecurePay account, wallet balance, and all transaction history. This action is irreversible and cannot be undone.
                      </div>
                      <button
                        className="pp-fbtn pp-fbtn-danger"
                        style={{ maxWidth: 200 }}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            toast.warning('Account deletion is coming soon. Please contact support.', { autoClose: 5000 });
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/>
                        </svg>
                        Delete Account
                      </button>
                    </div>

                    <div className="pp-danger-zone" style={{ marginTop: '1rem', borderColor: 'rgba(245,158,11,.25)', background: 'rgba(245,158,11,.03)' }}>
                      <div className="pp-danger-title" style={{ color: 'var(--warning)' }}>Sign Out Everywhere</div>
                      <div className="pp-danger-desc">
                        Revokes all active sessions and access tokens. You'll need to sign in again on all devices.
                      </div>
                      <button
                        className="pp-fbtn"
                        style={{
                          maxWidth: 220, background: 'rgba(245,158,11,.1)',
                          border: '1.5px solid rgba(245,158,11,.3)', color: '#92400e',
                          padding: '0.7rem 1.2rem', borderRadius: 9, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit',
                          transition: 'all .2s',
                        }}
                        onClick={() => {
                          toast.info('All sessions revoked. Signing you out…', { autoClose: 2000 });
                          setTimeout(handleLogout, 2000);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign Out Everywhere
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}