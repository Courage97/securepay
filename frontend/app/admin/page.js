'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
    --navy:       #0d1b2a;
    --navy-light: #1b2838;
    --navy-dark:  #050a0f;
    --blue:       #1a73e8;
    --blue-light: #4a8ff0;
    --blue-dark:  #0d5bc4;
    --green:      #2bc48a;
    --green-light:#5bd4a5;
    --green-dark: #1fa872;
    --danger:     #ef4444;
    --warning:    #f59e0b;
    --gray:       #e6e9ec;
    --gray-light: #f5f7f9;
    --gray-dark:  #d1d5d9;
    --muted:      #6b7280;
    --shadow-sm:  0 1px 3px rgba(13,27,42,.08), 0 1px 2px rgba(13,27,42,.05);
    --shadow-md:  0 4px 12px rgba(13,27,42,.10), 0 2px 4px rgba(13,27,42,.06);
    --shadow-lg:  0 10px 28px rgba(13,27,42,.12), 0 4px 8px rgba(13,27,42,.06);
  }

  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── SHELL ── */
  .ad-shell { display: flex; min-height: 100vh; background: var(--gray-light); overflow-x: hidden; }

  /* ── SIDEBAR ── */
  .ad-sidebar {
    width: 240px; flex-shrink: 0;
    background: linear-gradient(170deg, var(--navy-dark) 0%, var(--navy) 60%, var(--navy-light) 100%);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 200; overflow-y: auto;
    border-right: 1px solid rgba(255,255,255,.05);
    transition: transform .3s;
  }
  @media (max-width: 899px) {
    .ad-sidebar { transform: translateX(-100%); }
    .ad-sidebar.open { transform: translateX(0); box-shadow: 4px 0 30px rgba(0,0,0,.5); }
  }
  @media (min-width: 900px) {
    .ad-sidebar { position: sticky; top: 0; height: 100vh; }
  }

  .ad-sidebar-top {
    padding: 1.4rem 1.25rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .ad-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; margin-bottom: .9rem; }
  .ad-brand-icon {
    width: 34px; height: 34px; border-radius: 8px;
    background: var(--danger); display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(239,68,68,.4); flex-shrink: 0;
  }
  .ad-brand-name { font-size: 1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1; }
  .ad-brand-sub  { font-size: .65rem; color: rgba(255,255,255,.35); letter-spacing: .06em; text-transform: uppercase; }

  .ad-admin-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25);
    color: #f87171; font-size: .68rem; font-weight: 700;
    padding: .2rem .65rem; border-radius: 100px; text-transform: uppercase; letter-spacing: .07em;
  }
  .ad-admin-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--danger); animation: ad-pulse 2s infinite; }
  @keyframes ad-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }

  /* nav items */
  .ad-nav { padding: .75rem 0; flex: 1; }
  .ad-nav-section { padding: .5rem 1.25rem .3rem; font-size: .62rem; font-weight: 700; color: rgba(255,255,255,.25); letter-spacing: .1em; text-transform: uppercase; }
  .ad-nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: .65rem 1.1rem; margin: 1px .5rem; border-radius: 8px;
    color: rgba(255,255,255,.55); font-size: .85rem; font-weight: 600;
    cursor: pointer; border: none; background: transparent; font-family: inherit;
    text-decoration: none; transition: all .2s; width: calc(100% - 1rem);
    text-align: left;
  }
  .ad-nav-item:hover { background: rgba(255,255,255,.07); color: #fff; }
  .ad-nav-item.active { background: rgba(239,68,68,.15); color: #fff; border: 1px solid rgba(239,68,68,.25); }
  .ad-nav-item.active .ad-ni-icon { color: var(--danger); }
  .ad-ni-icon { display: flex; flex-shrink: 0; }
  .ad-ni-badge {
    margin-left: auto; font-family: 'Space Mono', monospace;
    font-size: .65rem; font-weight: 700; background: rgba(255,255,255,.1);
    padding: 1px 6px; border-radius: 4px; color: rgba(255,255,255,.55);
  }

  /* sidebar user */
  .ad-sidebar-user {
    padding: 1rem 1.25rem; border-top: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; gap: 9px;
  }
  .ad-user-avatar {
    width: 30px; height: 30px; border-radius: 8px; background: var(--danger);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace; font-size: .72rem; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .ad-user-name { font-size: .8rem; font-weight: 700; color: rgba(255,255,255,.8); }
  .ad-user-role { font-size: .68rem; color: rgba(255,255,255,.35); }
  .ad-logout-mini {
    margin-left: auto; background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,.3); transition: color .2s; display: flex; padding: 4px;
  }
  .ad-logout-mini:hover { color: #f87171; }

  /* hamburger */
  .ad-hamburger {
    display: none; position: fixed; top: 14px; left: 14px; z-index: 300;
    width: 38px; height: 38px; background: rgba(13,27,42,.97);
    border: 1px solid rgba(255,255,255,.12); border-radius: 9px;
    align-items: center; justify-content: center; cursor: pointer;
    flex-direction: column; gap: 5px; padding: 9px;
  }
  @media (max-width: 899px) { .ad-hamburger { display: flex; } }
  .ad-hamburger span { display: block; height: 2px; border-radius: 2px; background: rgba(255,255,255,.8); transition: all .25s; transform-origin: center; }
  .ad-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .ad-hamburger.open span:nth-child(2) { opacity: 0; }
  .ad-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* overlay */
  .ad-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 150; }
  .ad-overlay.open { display: block; }

  /* ── MAIN ── */
  .ad-main {
    flex: 1; min-width: 0;
    margin-left: 0; transition: margin-left .3s;
  }
  @media (min-width: 900px) { .ad-main { margin-left: 240px; } }

  /* topbar */
  .ad-topbar {
    background: rgba(13,27,42,.97); backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,.06);
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 1.5rem; position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 16px rgba(0,0,0,.22);
  }
  @media (max-width: 899px) { .ad-topbar { padding-left: 4rem; } }
  .ad-topbar-title { font-size: .95rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
  .ad-topbar-right { display: flex; align-items: center; gap: .6rem; }
  .ad-topbar-link {
    color: rgba(255,255,255,.5); font-size: .8rem; text-decoration: none;
    padding: .35rem .7rem; border-radius: 6px; transition: all .2s;
    font-weight: 500; white-space: nowrap; display: none;
  }
  @media (min-width: 640px) { .ad-topbar-link { display: block; } }
  .ad-topbar-link:hover { background: rgba(255,255,255,.07); color: #fff; }
  .ad-topbar-logout {
    background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.22);
    color: #f87171; font-size: .78rem; font-weight: 600; font-family: inherit;
    padding: .35rem .8rem; border-radius: 7px; cursor: pointer; transition: all .2s;
  }
  .ad-topbar-logout:hover { background: rgba(239,68,68,.18); }

  /* ── PAGE BODY ── */
  .ad-body { padding: 1.75rem 1.5rem 3rem; }
  @media (min-width: 640px)  { .ad-body { padding: 2rem 2rem 3rem; } }

  .ad-section-title { font-size: clamp(1.2rem,2.5vw,1.5rem); font-weight: 800; letter-spacing: -0.03em; color: var(--navy); margin-bottom: .3rem; }
  .ad-section-sub   { font-size: .85rem; color: var(--muted); margin-bottom: 1.75rem; }

  /* ── METRIC CARDS ── */
  .ad-metrics { display: grid; gap: 1rem; margin-bottom: 1.75rem; grid-template-columns: repeat(2,1fr); }
  @media (min-width: 640px)  { .ad-metrics { grid-template-columns: repeat(2,1fr); } }
  @media (min-width: 1100px) { .ad-metrics { grid-template-columns: repeat(4,1fr); } }

  .ad-metric {
    border-radius: 14px; padding: 1.25rem; border: 1px solid transparent;
    box-shadow: var(--shadow-sm); transition: transform .2s, box-shadow .2s;
    position: relative; overflow: hidden;
  }
  .ad-metric:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .ad-metric-blue  { background: linear-gradient(135deg, var(--blue-dark), var(--blue)); border-color: rgba(255,255,255,.1); }
  .ad-metric-green { background: linear-gradient(135deg, var(--green-dark), var(--green)); border-color: rgba(255,255,255,.1); }
  .ad-metric-amber { background: linear-gradient(135deg, #d97706, var(--warning)); border-color: rgba(255,255,255,.1); }
  .ad-metric-red   { background: linear-gradient(135deg, #dc2626, var(--danger)); border-color: rgba(255,255,255,.1); }
  .ad-metric-white { background: #fff; border-color: var(--gray); }

  .ad-metric-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: .9rem; }
  .ad-metric-lbl  { font-size: .72rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; }
  .ad-metric-lbl-light { color: rgba(255,255,255,.7); }
  .ad-metric-lbl-dark  { color: var(--muted); }
  .ad-metric-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ad-mi-light { background: rgba(255,255,255,.18); color: #fff; }
  .ad-mi-blue  { background: rgba(26,115,232,.1);   color: var(--blue); }
  .ad-mi-green { background: rgba(43,196,138,.1);   color: var(--green); }
  .ad-mi-amber { background: rgba(245,158,11,.1);   color: var(--warning); }
  .ad-mi-red   { background: rgba(239,68,68,.1);    color: var(--danger); }

  .ad-metric-val { font-family: 'Space Mono', monospace; font-size: clamp(1.4rem,3vw,2rem); font-weight: 700; line-height: 1; margin-bottom: .3rem; letter-spacing: -0.02em; }
  .ad-metric-val-light { color: #fff; }
  .ad-metric-val-dark  { color: var(--navy); }
  .ad-metric-sub  { font-size: .72rem; }
  .ad-metric-sub-light { color: rgba(255,255,255,.65); }
  .ad-metric-sub-dark  { color: var(--muted); }

  /* metric shine */
  .ad-metric::after {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 110px; height: 110px; border-radius: 50%;
    background: rgba(255,255,255,.06); pointer-events: none;
  }

  /* ── CHARTS ROW ── */
  .ad-charts-grid { display: grid; gap: 1.25rem; margin-bottom: 1.75rem; grid-template-columns: 1fr; }
  @media (min-width: 860px) { .ad-charts-grid { grid-template-columns: 1fr 1fr 1fr; } }

  /* ── CARD ── */
  .ad-card { background: #fff; border: 1px solid var(--gray); border-radius: 14px; box-shadow: var(--shadow-sm); overflow: hidden; }
  .ad-card-hdr {
    padding: 1rem 1.4rem; border-bottom: 1px solid var(--gray);
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .6rem;
  }
  .ad-card-title { font-size: .92rem; font-weight: 800; color: var(--navy); letter-spacing: -0.02em; }
  .ad-card-body  { padding: 1.1rem 1.4rem; }

  /* risk distribution bar */
  .ad-risk-rows { display: flex; flex-direction: column; gap: .85rem; }
  .ad-risk-row  {}
  .ad-risk-row-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .35rem; }
  .ad-risk-row-lbl { font-size: .8rem; font-weight: 700; color: var(--navy); }
  .ad-risk-count   { font-family: 'Space Mono', monospace; font-size: .75rem; font-weight: 700; }
  .ad-risk-track { height: 8px; background: var(--gray-light); border-radius: 4px; overflow: hidden; }
  .ad-risk-fill  { height: 100%; border-radius: 4px; transition: width .6s cubic-bezier(.22,1,.36,1); }

  /* login stats */
  .ad-login-stat {
    display: flex; align-items: center; gap: 12px;
    padding: .85rem; border-radius: 10px; margin-bottom: .65rem;
  }
  .ad-login-stat:last-child { margin-bottom: 0; }
  .ad-ls-ok   { background: rgba(43,196,138,.07); border: 1px solid rgba(43,196,138,.2); }
  .ad-ls-fail { background: rgba(239,68,68,.07);  border: 1px solid rgba(239,68,68,.2); }
  .ad-ls-mfa  { background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.2); }
  .ad-ls-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ad-ls-icon-ok   { background: rgba(43,196,138,.15); color: var(--green); }
  .ad-ls-icon-fail { background: rgba(239,68,68,.12);  color: var(--danger); }
  .ad-ls-icon-mfa  { background: rgba(245,158,11,.12); color: var(--warning); }
  .ad-ls-label { font-size: .78rem; font-weight: 700; color: var(--muted); }
  .ad-ls-val   { font-family: 'Space Mono', monospace; font-size: 1.3rem; font-weight: 700; color: var(--navy); line-height: 1; }

  /* txn stats */
  .ad-txn-stat-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: .7rem 0; border-bottom: 1px solid var(--gray);
  }
  .ad-txn-stat-row:last-child { border-bottom: none; }
  .ad-txn-stat-lbl  { font-size: .85rem; font-weight: 700; color: var(--navy); display: flex; align-items: center; gap: 8px; }
  .ad-txn-stat-dot  { width: 8px; height: 8px; border-radius: 50%; }
  .ad-txn-badge {
    font-family: 'Space Mono', monospace; font-size: .78rem; font-weight: 700;
    padding: 2px 8px; border-radius: 5px;
  }
  .ad-tb-ok   { background: rgba(43,196,138,.12); color: var(--green-dark); }
  .ad-tb-warn { background: rgba(245,158,11,.1);  color: #92400e; }
  .ad-tb-fail { background: rgba(239,68,68,.1);   color: #991b1b; }

  /* ── DATA SECTION TABS ── */
  .ad-tabs-bar { display: flex; border-bottom: 1px solid var(--gray); padding: 0 1.4rem; overflow-x: auto; gap: 0; }
  .ad-tab {
    padding: .9rem 1.1rem; font-size: .845rem; font-weight: 700;
    color: var(--muted); background: none; border: none; cursor: pointer;
    font-family: inherit; transition: color .2s; white-space: nowrap;
    border-bottom: 2.5px solid transparent; margin-bottom: -1px;
    display: flex; align-items: center; gap: 6px;
  }
  .ad-tab:hover { color: var(--navy); }
  .ad-tab.active { color: var(--danger); border-bottom-color: var(--danger); }
  .ad-tab-badge {
    font-family: 'Space Mono', monospace; font-size: .65rem; font-weight: 700;
    background: var(--gray-light); border: 1px solid var(--gray);
    padding: 1px 6px; border-radius: 4px; color: var(--muted);
  }

  /* ── TABLE TOOLBAR ── */
  .ad-table-toolbar {
    display: flex; align-items: center; gap: .6rem;
    padding: .9rem 1.4rem; flex-wrap: wrap;
    border-bottom: 1px solid var(--gray);
  }
  .ad-search-wrap { position: relative; }
  .ad-search-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--gray-dark); pointer-events: none; display: flex; }
  .ad-search {
    padding: .5rem .75rem .5rem 2.2rem; border: 1.5px solid var(--gray-dark);
    border-radius: 8px; background: #fff; color: var(--navy); font-size: .82rem;
    font-family: inherit; outline: none; width: 200px; transition: all .2s;
  }
  .ad-search::placeholder { color: var(--gray-dark); }
  .ad-search:focus { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(26,115,232,.12); }

  .ad-filter-tabs { display: flex; gap: 3px; background: var(--gray-light); border-radius: 8px; padding: 3px; }
  .ad-ftab {
    padding: .33rem .7rem; border-radius: 6px; font-size: .73rem; font-weight: 700;
    cursor: pointer; border: none; font-family: inherit; background: transparent;
    color: var(--muted); transition: all .2s; white-space: nowrap;
  }
  .ad-ftab.active { background: #fff; color: var(--navy); box-shadow: var(--shadow-sm); }

  .ad-export-btn {
    display: flex; align-items: center; gap: 5px; margin-left: auto;
    padding: .45rem .85rem; border-radius: 8px; font-size: .78rem;
    font-weight: 700; cursor: pointer; font-family: inherit;
    background: var(--gray-light); border: 1.5px solid var(--gray);
    color: var(--navy); transition: all .2s;
  }
  .ad-export-btn:hover { background: var(--gray); }

  /* ── TABLE ── */
  .ad-table-wrap { overflow-x: auto; }
  .ad-table { width: 100%; border-collapse: collapse; }
  .ad-table th {
    padding: .65rem 1rem; text-align: left; font-size: .72rem; font-weight: 800;
    color: var(--muted); text-transform: uppercase; letter-spacing: .07em;
    background: var(--gray-light); border-bottom: 1px solid var(--gray);
    white-space: nowrap; cursor: pointer; user-select: none;
  }
  .ad-table th:hover { color: var(--navy); }
  .ad-table td { padding: .75rem 1rem; font-size: .85rem; color: var(--navy); border-bottom: 1px solid var(--gray); white-space: nowrap; }
  .ad-table tr:last-child td { border-bottom: none; }
  .ad-table tr:hover td { background: rgba(26,115,232,.03); }

  .ad-td-mono  { font-family: 'Space Mono', monospace; font-size: .75rem; }
  .ad-td-bold  { font-weight: 700; }
  .ad-td-muted { color: var(--muted); font-size: .8rem; }
  .ad-td-green { color: var(--green-dark); font-weight: 700; font-family: 'Space Mono', monospace; }
  .ad-td-navy  { color: var(--navy); font-weight: 700; font-family: 'Space Mono', monospace; }

  /* table badge */
  .ad-badge {
    display: inline-flex; align-items: center; padding: 2px 8px;
    border-radius: 100px; font-size: .69rem; font-weight: 700; white-space: nowrap;
  }
  .ad-badge-ok    { background: rgba(43,196,138,.12); color: var(--green-dark); }
  .ad-badge-fail  { background: rgba(239,68,68,.1);   color: #991b1b; }
  .ad-badge-warn  { background: rgba(245,158,11,.1);  color: #92400e; }
  .ad-badge-info  { background: rgba(26,115,232,.1);  color: var(--blue-dark); }
  .ad-badge-low   { background: rgba(43,196,138,.12); color: var(--green-dark); }
  .ad-badge-med   { background: rgba(245,158,11,.1);  color: #92400e; }
  .ad-badge-high  { background: rgba(239,68,68,.1);   color: #991b1b; }

  /* risk mini-bar in table */
  .ad-risk-mini { display: flex; align-items: center; gap: 6px; }
  .ad-risk-mini-track { width: 52px; height: 5px; background: var(--gray); border-radius: 3px; overflow: hidden; flex-shrink: 0; }
  .ad-risk-mini-fill  { height: 100%; border-radius: 3px; }
  .ad-risk-mini-val   { font-family: 'Space Mono', monospace; font-size: .72rem; font-weight: 700; }

  /* user avatar in table */
  .ad-tbl-user { display: flex; align-items: center; gap: 8px; }
  .ad-tbl-avatar {
    width: 28px; height: 28px; border-radius: 7px;
    background: linear-gradient(135deg, var(--blue-dark), var(--blue));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Mono', monospace; font-size: .65rem; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }

  /* empty state */
  .ad-empty {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 3rem 1rem;
  }
  .ad-empty-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--gray-light); border: 1.5px solid var(--gray); display: flex; align-items: center; justify-content: center; color: var(--gray-dark); margin-bottom: 1rem; }
  .ad-empty-title { font-size: .9rem; font-weight: 700; color: var(--navy); margin-bottom: .3rem; }
  .ad-empty-sub   { font-size: .8rem; color: var(--muted); }

  /* pagination */
  .ad-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: .8rem 1.4rem; border-top: 1px solid var(--gray);
    flex-wrap: wrap; gap: .5rem;
  }
  .ad-page-info { font-size: .78rem; color: var(--muted); font-weight: 600; }
  .ad-page-btns { display: flex; gap: 4px; }
  .ad-page-btn {
    width: 30px; height: 30px; border-radius: 7px; font-size: .78rem; font-weight: 700;
    border: 1.5px solid var(--gray); background: #fff; color: var(--navy);
    cursor: pointer; font-family: inherit; display: flex; align-items: center;
    justify-content: center; transition: all .2s;
  }
  .ad-page-btn:hover:not(:disabled) { border-color: var(--blue); color: var(--blue); background: rgba(26,115,232,.05); }
  .ad-page-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; }
  .ad-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* overview mini-table */
  .ad-ov-table { width: 100%; border-collapse: collapse; }
  .ad-ov-table th { padding: .6rem 1rem; text-align: left; font-size: .72rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; border-bottom: 1px solid var(--gray); }
  .ad-ov-table td { padding: .7rem 1rem; font-size: .85rem; border-bottom: 1px solid var(--gray); }
  .ad-ov-table tr:last-child td { border-bottom: none; }
  .ad-ov-table tr:hover td { background: rgba(26,115,232,.02); }

  /* ── LOADING ── */
  .ad-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--gray-light); }
  .ad-loading-ring { width: 42px; height: 42px; border-radius: 50%; border: 3px solid var(--gray); border-top-color: var(--danger); animation: ad-spin .8s linear infinite; margin-bottom: 1rem; }
  @keyframes ad-spin { to { transform: rotate(360deg); } }
  .ad-loading-text { font-size: .9rem; color: var(--muted); font-family: 'Plus Jakarta Sans', sans-serif; }

  /* toast */
  .Toastify__toast { font-family: 'Plus Jakarta Sans', sans-serif !important; font-size: .875rem !important; border-radius: 10px !important; }
  .Toastify__toast--success { background: #0d2818 !important; border: 1px solid rgba(43,196,138,.3) !important; }
  .Toastify__toast--error   { background: #1a0d0d !important; border: 1px solid rgba(239,68,68,.3) !important; }
  .Toastify__toast--warning { background: #1a1505 !important; border: 1px solid rgba(245,158,11,.3) !important; }
  .Toastify__toast--info    { background: #0a1628 !important; border: 1px solid rgba(26,115,232,.3) !important; }
`;

/* ── icon helpers ── */
const ShieldIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const TxnIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const LoginIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const OverviewIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const SearchIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>;
const XIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ── helpers ── */
const riskColor = s => s <= 30 ? 'var(--green)' : s <= 60 ? 'var(--warning)' : 'var(--danger)';
const riskBadge = l => l === 0 ? 'ad-badge-low' : l === 1 ? 'ad-badge-med' : 'ad-badge-high';
const riskLabel = l => l === 0 ? 'Low' : l === 1 ? 'Medium' : 'High';
const PAGE_SIZE = 12;

function exportCSV(rows, cols, filename) {
  const csv = [cols.map(c => c.label), ...rows.map(r => cols.map(c => `"${c.val(r)}"`))]
    .map(r => r.join(',')).join('\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: filename,
  });
  a.click();
}

/* ── Pagination ── */
function Pager({ total, page, setPage }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="ad-pagination">
      <span className="ad-page-info">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </span>
      <div className="ad-page-btns">
        <button className="ad-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const n = page <= 3 ? i + 1 : page + i - 2;
          if (n < 1 || n > pages) return null;
          return <button key={n} className={`ad-page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>;
        })}
        <button className="ad-page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>›</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers]                 = useState([]);
  const [transactions, setTransactions]   = useState([]);

  /* search / filter / sort / page */
  const [userSearch,    setUserSearch]    = useState('');
  const [txnSearch,     setTxnSearch]     = useState('');
  const [txnFilter,     setTxnFilter]     = useState('all');
  const [loginFilter,   setLoginFilter]   = useState('all');
  const [userPage,      setUserPage]      = useState(1);
  const [txnPage,       setTxnPage]       = useState(1);
  const [loginPage,     setLoginPage]     = useState(1);

  /* ── bootstrap ── */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const raw   = localStorage.getItem('user');
    if (!token || !raw) { router.push('/login'); return; }
    try {
      setUser(JSON.parse(raw));
      fetchDashboardData(token);
      fetchUsers(token);
      fetchTransactions(token);
    } catch { router.push('/login'); }
  }, [router]);

  /* ── API calls (all original logic preserved) ── */
  const fetchDashboardData = async (token) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/dashboard/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setDashboardData(await res.json()); }
      else if (res.status === 403) { toast.error('Admin access required.'); router.push('/dashboard'); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchUsers = async (token) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { const d = await res.json(); setUsers(d.users || []); }
    } catch (e) { console.error(e); }
  };

  const fetchTransactions = async (token) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/transactions/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { const d = await res.json(); setTransactions(d.transactions || []); }
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    ['access_token','refresh_token','user'].forEach(k => localStorage.removeItem(k));
    router.push('/login');
  };

  /* ── filtered data ── */
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter(u =>
      !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.account_number?.includes(q)
    );
  }, [users, userSearch]);

  const filteredTxns = useMemo(() => {
    let list = transactions;
    if (txnFilter !== 'all') list = list.filter(t => t.status === txnFilter);
    const q = txnSearch.toLowerCase();
    if (q) list = list.filter(t => t.sender?.toLowerCase().includes(q) || t.receiver?.toLowerCase().includes(q));
    return list;
  }, [transactions, txnSearch, txnFilter]);

  const filteredLogins = useMemo(() => {
    if (!dashboardData) return [];
    let list = dashboardData.recent_logins || [];
    if (loginFilter === 'success') list = list.filter(l => l.status === 'success');
    if (loginFilter === 'failed')  list = list.filter(l => l.status === 'failed');
    if (loginFilter === 'high')    list = list.filter(l => l.risk_level >= 2);
    return list;
  }, [dashboardData, loginFilter]);

  /* paginated slices */
  const pagedUsers  = filteredUsers.slice((userPage  - 1) * PAGE_SIZE, userPage  * PAGE_SIZE);
  const pagedTxns   = filteredTxns.slice ((txnPage   - 1) * PAGE_SIZE, txnPage   * PAGE_SIZE);
  const pagedLogins = filteredLogins.slice((loginPage - 1) * PAGE_SIZE, loginPage * PAGE_SIZE);

  /* ── loading ── */
  if (loading || !user || !dashboardData) {
    return (
      <>
        <style>{css}</style>
        <div className="ad-loading">
          <div className="ad-loading-ring" />
          <p className="ad-loading-text">Loading admin dashboard…</p>
        </div>
      </>
    );
  }

  const { stats, risk_distribution, login_stats, transaction_stats } = dashboardData;
  const totalLogins = stats.total_logins || 1;
  const initials = user.username?.slice(0, 2).toUpperCase() || 'AD';

  const navItems = [
    { id: 'overview',     label: 'Overview',     icon: <OverviewIcon />, badge: null },
    { id: 'users',        label: 'Users',        icon: <UsersIcon />,   badge: users.length },
    { id: 'transactions', label: 'Transactions', icon: <TxnIcon />,     badge: transactions.length },
    { id: 'logins',       label: 'Recent Logins',icon: <LoginIcon />,   badge: (dashboardData.recent_logins || []).length },
  ];

  return (
    <>
      <style>{css}</style>
      <ToastContainer position="top-right" transition={Slide} closeButton={false} hideProgressBar={false} newestOnTop pauseOnHover theme="dark" />

      {/* hamburger */}
      <button className={`ad-hamburger${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(o => !o)}>
        <span /><span /><span />
      </button>

      {/* overlay */}
      <div className={`ad-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="ad-shell">

        {/* ══ SIDEBAR ══ */}
        <aside className={`ad-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="ad-sidebar-top">
            <a href="/" className="ad-brand">
              <div className="ad-brand-icon"><ShieldIcon /></div>
              <div>
                <div className="ad-brand-name">SecurePay</div>
                <div className="ad-brand-sub">Admin Console</div>
              </div>
            </a>
            <div className="ad-admin-chip"><span className="ad-admin-dot" /> Admin</div>
          </div>

          <nav className="ad-nav">
            <div className="ad-nav-section">Navigation</div>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`ad-nav-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              >
                <span className="ad-ni-icon">{item.icon}</span>
                {item.label}
                {item.badge !== null && <span className="ad-ni-badge">{item.badge}</span>}
              </button>
            ))}

            <div className="ad-nav-section" style={{ marginTop: '1rem' }}>Quick Links</div>
            <a href="/dashboard" className="ad-nav-item">
              <span className="ad-ni-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="18" height="7"/>
                </svg>
              </span>
              User Dashboard
            </a>
          </nav>

          <div className="ad-sidebar-user">
            <div className="ad-user-avatar">{initials}</div>
            <div>
              <div className="ad-user-name">{user.username}</div>
              <div className="ad-user-role">Super Admin</div>
            </div>
            <button className="ad-logout-mini" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className="ad-main">

          {/* topbar */}
          <div className="ad-topbar">
            <span className="ad-topbar-title">
              {navItems.find(n => n.id === activeTab)?.label || 'Admin Dashboard'}
            </span>
            <div className="ad-topbar-right">
              <a href="/dashboard" className="ad-topbar-link">User Dashboard</a>
              <button className="ad-topbar-logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <div className="ad-body">

            {/* ── METRIC CARDS ── */}
            <div className="ad-metrics">
              {[
                { cls: 'ad-metric-blue',  lCls: 'ad-metric-lbl-light', vCls: 'ad-metric-val-light', sCls: 'ad-metric-sub-light', iCls: 'ad-mi-light', lbl: 'Total Users',        val: stats.total_users, sub: 'registered accounts',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
                { cls: 'ad-metric-green', lCls: 'ad-metric-lbl-light', vCls: 'ad-metric-val-light', sCls: 'ad-metric-sub-light', iCls: 'ad-mi-light', lbl: 'Transactions',       val: stats.total_transactions, sub: 'all-time transfers',
                  icon: <TxnIcon /> },
                { cls: 'ad-metric-amber', lCls: 'ad-metric-lbl-light', vCls: 'ad-metric-val-light', sCls: 'ad-metric-sub-light', iCls: 'ad-mi-light', lbl: 'Login Attempts',     val: stats.total_logins, sub: 'authentication events',
                  icon: <LoginIcon /> },
                { cls: 'ad-metric-red',   lCls: 'ad-metric-lbl-light', vCls: 'ad-metric-val-light', sCls: 'ad-metric-sub-light', iCls: 'ad-mi-light', lbl: 'System Balance',     val: `₦${parseFloat(stats.total_balance).toLocaleString(undefined,{maximumFractionDigits:0})}`, sub: 'total user wallets',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg> },
              ].map(m => (
                <div className={`ad-metric ${m.cls}`} key={m.lbl}>
                  <div className="ad-metric-top">
                    <span className={`ad-metric-lbl ${m.lCls}`}>{m.lbl}</span>
                    <div className={`ad-metric-icon ${m.iCls}`}>{m.icon}</div>
                  </div>
                  <div className={`ad-metric-val ${m.vCls}`}>{m.val}</div>
                  <div className={`ad-metric-sub ${m.sCls}`}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* ── CHARTS ── */}
            <div className="ad-charts-grid">

              {/* risk distribution */}
              <div className="ad-card">
                <div className="ad-card-hdr"><span className="ad-card-title">Risk Distribution</span></div>
                <div className="ad-card-body">
                  <div className="ad-risk-rows">
                    {[
                      { lbl: 'Low Risk',    count: risk_distribution.low,    pct: (risk_distribution.low / totalLogins * 100), color: 'var(--green)' },
                      { lbl: 'Medium Risk', count: risk_distribution.medium, pct: (risk_distribution.medium / totalLogins * 100), color: 'var(--warning)' },
                      { lbl: 'High Risk',   count: risk_distribution.high,   pct: (risk_distribution.high / totalLogins * 100), color: 'var(--danger)' },
                    ].map(r => (
                      <div className="ad-risk-row" key={r.lbl}>
                        <div className="ad-risk-row-top">
                          <span className="ad-risk-row-lbl">{r.lbl}</span>
                          <span className="ad-risk-count" style={{ color: r.color }}>{r.count}</span>
                        </div>
                        <div className="ad-risk-track">
                          <div className="ad-risk-fill" style={{ width: `${r.pct || 0}%`, background: r.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* login stats */}
              <div className="ad-card">
                <div className="ad-card-hdr"><span className="ad-card-title">Login Statistics</span></div>
                <div className="ad-card-body">
                  <div className="ad-login-stat ad-ls-ok">
                    <div className="ad-ls-icon ad-ls-icon-ok"><CheckIcon /></div>
                    <div>
                      <div className="ad-ls-label">Successful Logins</div>
                      <div className="ad-ls-val" style={{ color: 'var(--green-dark)' }}>{login_stats.successful}</div>
                    </div>
                  </div>
                  <div className="ad-login-stat ad-ls-fail">
                    <div className="ad-ls-icon ad-ls-icon-fail"><XIcon /></div>
                    <div>
                      <div className="ad-ls-label">Failed Logins</div>
                      <div className="ad-ls-val" style={{ color: 'var(--danger)' }}>{login_stats.failed}</div>
                    </div>
                  </div>
                  <div className="ad-login-stat ad-ls-mfa">
                    <div className="ad-ls-icon ad-ls-icon-mfa"><ShieldIcon size={14} /></div>
                    <div>
                      <div className="ad-ls-label">MFA Triggered</div>
                      <div className="ad-ls-val" style={{ color: 'var(--warning)' }}>{login_stats.mfa_required || 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* txn stats */}
              <div className="ad-card">
                <div className="ad-card-hdr"><span className="ad-card-title">Transaction Stats</span></div>
                <div className="ad-card-body">
                  {[
                    { lbl: 'Completed', val: transaction_stats.completed, dot: 'var(--green)',   badgeCls: 'ad-tb-ok' },
                    { lbl: 'Pending',   val: transaction_stats.pending,   dot: 'var(--warning)', badgeCls: 'ad-tb-warn' },
                    { lbl: 'Failed',    val: transaction_stats.failed,    dot: 'var(--danger)',  badgeCls: 'ad-tb-fail' },
                  ].map(r => (
                    <div className="ad-txn-stat-row" key={r.lbl}>
                      <span className="ad-txn-stat-lbl">
                        <span className="ad-txn-stat-dot" style={{ background: r.dot }} />
                        {r.lbl}
                      </span>
                      <span className={`ad-txn-badge ${r.badgeCls}`}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── DATA TABS ── */}
            <div className="ad-card">

              {/* tab bar */}
              <div className="ad-tabs-bar">
                {navItems.map(item => (
                  <button key={item.id} className={`ad-tab${activeTab === item.id ? ' active' : ''}`} onClick={() => setActiveTab(item.id)}>
                    {item.icon} {item.label}
                    {item.badge !== null && <span className="ad-tab-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ padding: '1.25rem 1.4rem 0', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

                    {/* recent users */}
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Recent Users</div>
                      <table className="ad-ov-table">
                        <thead><tr><th>User</th><th>Email</th><th>Balance</th><th>Joined</th></tr></thead>
                        <tbody>
                          {(dashboardData.recent_users || []).map(u => (
                            <tr key={u.username}>
                              <td>
                                <div className="ad-tbl-user">
                                  <div className="ad-tbl-avatar">{u.username.slice(0,2).toUpperCase()}</div>
                                  <span style={{ fontWeight: 700, fontSize: '.85rem' }}>{u.username}</span>
                                </div>
                              </td>
                              <td className="ad-td-muted">{u.email}</td>
                              <td className="ad-td-green">₦{parseFloat(u.wallet_balance).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                              <td className="ad-td-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* recent transactions */}
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Recent Transactions</div>
                      <table className="ad-ov-table">
                        <thead><tr><th>Sender → Receiver</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                          {(dashboardData.recent_transactions || []).slice(0, 6).map(t => (
                            <tr key={t.id}>
                              <td style={{ fontWeight: 600, fontSize: '.82rem' }}>{t.sender} → {t.receiver}</td>
                              <td className="ad-td-navy">₦{parseFloat(t.amount).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                              <td>
                                <span className={`ad-badge ${t.status==='completed'?'ad-badge-ok':t.status==='pending'?'ad-badge-warn':'ad-badge-fail'}`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                  <div style={{ height: '1.5rem' }} />
                </div>
              )}

              {/* ── USERS TAB ── */}
              {activeTab === 'users' && (
                <>
                  <div className="ad-table-toolbar">
                    <div className="ad-search-wrap">
                      <span className="ad-search-icon"><SearchIcon /></span>
                      <input type="text" className="ad-search" placeholder="Search users…"
                        value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
                    </div>
                    <button className="ad-export-btn" onClick={() => {
                      exportCSV(filteredUsers, [
                        { label: 'Username',   val: u => u.username },
                        { label: 'Email',      val: u => u.email },
                        { label: 'Account #',  val: u => u.account_number },
                        { label: 'Balance',    val: u => u.wallet_balance },
                        { label: 'Logins',     val: u => u.login_count },
                        { label: 'Txns',       val: u => u.transaction_count },
                        { label: 'Active',     val: u => u.is_active ? 'Yes' : 'No' },
                      ], 'users.csv');
                      toast.success('Users exported!', { autoClose: 2000 });
                    }}>
                      <DownloadIcon /> Export
                    </button>
                  </div>
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead><tr>
                        <th>User</th><th>Email</th><th>Account #</th>
                        <th>Balance</th><th>Logins</th><th>Txns</th><th>Status</th>
                      </tr></thead>
                      <tbody>
                        {pagedUsers.length === 0 ? (
                          <tr><td colSpan={7}>
                            <div className="ad-empty">
                              <div className="ad-empty-icon"><UsersIcon /></div>
                              <div className="ad-empty-title">No users found</div>
                              <div className="ad-empty-sub">Try a different search term.</div>
                            </div>
                          </td></tr>
                        ) : pagedUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="ad-tbl-user">
                                <div className="ad-tbl-avatar">{u.username.slice(0,2).toUpperCase()}</div>
                                <span className="ad-td-bold">{u.username}</span>
                              </div>
                            </td>
                            <td className="ad-td-muted">{u.email}</td>
                            <td className="ad-td-mono">{u.account_number}</td>
                            <td className="ad-td-green">₦{parseFloat(u.wallet_balance).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                            <td className="ad-td-muted">{u.login_count}</td>
                            <td className="ad-td-muted">{u.transaction_count}</td>
                            <td><span className={`ad-badge ${u.is_active ? 'ad-badge-ok' : 'ad-badge-fail'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pager total={filteredUsers.length} page={userPage} setPage={setUserPage} />
                </>
              )}

              {/* ── TRANSACTIONS TAB ── */}
              {activeTab === 'transactions' && (
                <>
                  <div className="ad-table-toolbar">
                    <div className="ad-search-wrap">
                      <span className="ad-search-icon"><SearchIcon /></span>
                      <input type="text" className="ad-search" placeholder="Search sender, receiver…"
                        value={txnSearch} onChange={e => { setTxnSearch(e.target.value); setTxnPage(1); }} />
                    </div>
                    <div className="ad-filter-tabs">
                      {['all','completed','pending','failed'].map(f => (
                        <button key={f} className={`ad-ftab${txnFilter===f?' active':''}`} onClick={() => { setTxnFilter(f); setTxnPage(1); }}>
                          {f.charAt(0).toUpperCase()+f.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button className="ad-export-btn" onClick={() => {
                      exportCSV(filteredTxns, [
                        { label: 'Sender',    val: t => t.sender },
                        { label: 'Receiver',  val: t => t.receiver },
                        { label: 'Amount',    val: t => t.amount },
                        { label: 'Risk Score',val: t => t.risk_score },
                        { label: 'Status',    val: t => t.status },
                        { label: 'Date',      val: t => t.created_at },
                      ], 'transactions.csv');
                      toast.success('Transactions exported!', { autoClose: 2000 });
                    }}>
                      <DownloadIcon /> Export
                    </button>
                  </div>
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead><tr>
                        <th>Sender</th><th>Receiver</th><th>Amount</th>
                        <th>Risk</th><th>Status</th><th>Date</th>
                      </tr></thead>
                      <tbody>
                        {pagedTxns.length === 0 ? (
                          <tr><td colSpan={6}>
                            <div className="ad-empty">
                              <div className="ad-empty-icon"><TxnIcon /></div>
                              <div className="ad-empty-title">No transactions found</div>
                              <div className="ad-empty-sub">Try adjusting the filter or search.</div>
                            </div>
                          </td></tr>
                        ) : pagedTxns.map(t => (
                          <tr key={t.id}>
                            <td className="ad-td-bold">{t.sender}</td>
                            <td className="ad-td-bold">{t.receiver}</td>
                            <td className="ad-td-navy">₦{parseFloat(t.amount).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                            <td>
                              <div className="ad-risk-mini">
                                <div className="ad-risk-mini-track">
                                  <div className="ad-risk-mini-fill" style={{ width:`${t.risk_score}%`, background: riskColor(t.risk_score) }} />
                                </div>
                                <span className={`ad-badge ${riskBadge(t.risk_level)}`}>{riskLabel(t.risk_level)}</span>
                              </div>
                            </td>
                            <td><span className={`ad-badge ${t.status==='completed'?'ad-badge-ok':t.status==='pending'?'ad-badge-warn':'ad-badge-fail'}`}>{t.status}</span></td>
                            <td className="ad-td-muted">{new Date(t.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pager total={filteredTxns.length} page={txnPage} setPage={setTxnPage} />
                </>
              )}

              {/* ── LOGINS TAB ── */}
              {activeTab === 'logins' && (
                <>
                  <div className="ad-table-toolbar">
                    <div className="ad-filter-tabs">
                      {['all','success','failed','high'].map(f => (
                        <button key={f} className={`ad-ftab${loginFilter===f?' active':''}`} onClick={() => { setLoginFilter(f); setLoginPage(1); }}>
                          {f === 'high' ? 'High Risk' : f.charAt(0).toUpperCase()+f.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button className="ad-export-btn" onClick={() => {
                      exportCSV(filteredLogins, [
                        { label: 'Username',  val: l => l.username },
                        { label: 'IP',        val: l => l.ip_address },
                        { label: 'Risk Score',val: l => l.risk_score },
                        { label: 'Status',    val: l => l.status },
                        { label: 'Timestamp', val: l => l.timestamp },
                      ], 'logins.csv');
                      toast.success('Logins exported!', { autoClose: 2000 });
                    }}>
                      <DownloadIcon /> Export
                    </button>
                  </div>
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead><tr>
                        <th>Username</th><th>IP Address</th><th>Location</th>
                        <th>Risk</th><th>Status</th><th>Timestamp</th>
                      </tr></thead>
                      <tbody>
                        {pagedLogins.length === 0 ? (
                          <tr><td colSpan={6}>
                            <div className="ad-empty">
                              <div className="ad-empty-icon"><LoginIcon /></div>
                              <div className="ad-empty-title">No logins found</div>
                              <div className="ad-empty-sub">Try a different filter.</div>
                            </div>
                          </td></tr>
                        ) : pagedLogins.map((l, i) => (
                          <tr key={i}>
                            <td className="ad-td-bold">{l.username}</td>
                            <td className="ad-td-mono">{l.ip_address}</td>
                            <td className="ad-td-muted">{l.city ? `${l.city}, ${l.country}` : '—'}</td>
                            <td>
                              <div className="ad-risk-mini">
                                <div className="ad-risk-mini-track">
                                  <div className="ad-risk-mini-fill" style={{ width:`${l.risk_score}%`, background: riskColor(l.risk_score) }} />
                                </div>
                                <span className="ad-risk-mini-val" style={{ color: riskColor(l.risk_score) }}>{l.risk_score}</span>
                              </div>
                            </td>
                            <td><span className={`ad-badge ${l.status==='success'?'ad-badge-ok':'ad-badge-fail'}`}>{l.status}</span></td>
                            <td className="ad-td-muted">{new Date(l.timestamp).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pager total={filteredLogins.length} page={loginPage} setPage={setLoginPage} />
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}