'use client';
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const events = [
    { dot: "ok",   label: "Login verified — Lagos, NG",       meta: "2s ago · Risk: 12/100" },
    { dot: "warn", label: "Blocked — Unknown device, Moscow", meta: "8s ago · Risk: 94/100" },
    { dot: "mid",  label: "MFA triggered — New location",     meta: "22s ago · Risk: 58/100" },
    { dot: "ok",   label: "Transfer ₦45,000 completed",       meta: "1m ago · Risk: 8/100" },
    { dot: "warn", label: "Pharming attempt stopped",         meta: "3m ago · Risk: 99/100" },
  ];

  const checks = [
    ["Device Fingerprinting", "Recognizes your devices uniquely"],
    ["Location Tracking",     "Flags logins from unusual places"],
    ["Behavior Analysis",     "Learns your patterns over time"],
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, padding: 0 }}>

      {/* ─── GLOBAL STYLES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        /* ── TOKENS ── */
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
          --shadow-sm:  0 4px 6px -1px rgba(13,27,42,.10), 0 2px 4px -1px rgba(13,27,42,.06);
          --shadow-lg:  0 10px 15px -3px rgba(13,27,42,.10), 0 4px 6px -2px rgba(13,27,42,.05);
        }

        /* ── LAYOUT ── */
        .sp-page { background: var(--gray-light); min-height: 100vh; overflow-x: hidden; }
        .sp-wrap { max-width: 1180px; margin: 0 auto; padding: 0 1.25rem; }
        @media (min-width: 640px)  { .sp-wrap { padding: 0 1.75rem; } }
        @media (min-width: 1024px) { .sp-wrap { padding: 0 2rem; } }

        /* ── NAV ── */
        .sp-nav {
          position: sticky; top: 0; z-index: 200;
          background: rgba(13,27,42,0.97);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: box-shadow .3s;
        }
        .sp-nav.scrolled { box-shadow: 0 4px 30px rgba(0,0,0,.35); }
        .sp-nav-bar {
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .sp-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
        }
        .sp-logo-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: var(--blue);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 18px rgba(26,115,232,.45);
          flex-shrink: 0;
        }
        .sp-logo-text { font-size: 1.15rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

        /* Desktop links */
        .sp-nav-desktop {
          display: none;
        }
        @media (min-width: 768px) {
          .sp-nav-desktop { display: flex; align-items: center; gap: 1.5rem; }
        }
        .sp-nav-link {
          color: rgba(255,255,255,.6); font-size: .875rem; text-decoration: none;
          font-weight: 500; transition: color .2s; white-space: nowrap;
        }
        .sp-nav-link:hover { color: #fff; }
        .sp-nav-btn {
          background: var(--blue); color: #fff; border: none;
          padding: .5rem 1.2rem; border-radius: 8px; font-size: .875rem;
          font-weight: 600; cursor: pointer; font-family: inherit;
          transition: background .2s, transform .15s;
          white-space: nowrap;
        }
        .sp-nav-btn:hover { background: var(--blue-dark); transform: translateY(-1px); }

        /* Hamburger */
        .sp-hamburger {
          display: flex; flex-direction: column; justify-content: center;
          gap: 5px; width: 36px; height: 36px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px; cursor: pointer; padding: 8px;
          transition: background .2s;
        }
        .sp-hamburger:hover { background: rgba(255,255,255,.14); }
        .sp-hamburger span {
          display: block; height: 2px; border-radius: 2px;
          background: rgba(255,255,255,.85); transition: all .25s;
          transform-origin: center;
        }
        .sp-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .sp-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .sp-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        @media (min-width: 768px) { .sp-hamburger { display: none; } }

        /* Mobile dropdown */
        .sp-mobile-menu {
          overflow: hidden; transition: max-height .35s cubic-bezier(.4,0,.2,1), opacity .25s;
          max-height: 0; opacity: 0;
          background: rgba(5,10,15,0.98);
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .sp-mobile-menu.open { max-height: 420px; opacity: 1; }
        .sp-mobile-menu-inner { padding: 1rem 1.25rem 1.5rem; display: flex; flex-direction: column; gap: .25rem; }
        .sp-mobile-link {
          display: block; padding: .8rem 1rem; border-radius: 8px;
          color: rgba(255,255,255,.7); font-size: .95rem; font-weight: 500;
          text-decoration: none; transition: background .2s, color .2s;
        }
        .sp-mobile-link:hover { background: rgba(255,255,255,.07); color: #fff; }
        .sp-mobile-divider { height: 1px; background: rgba(255,255,255,.07); margin: .5rem 0; }
        .sp-mobile-actions { display: flex; gap: .75rem; padding-top: .5rem; }
        .sp-mobile-login {
          flex: 1; padding: .75rem; border-radius: 8px; text-align: center;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
          color: #fff; font-size: .9rem; font-weight: 600; text-decoration: none;
          transition: background .2s;
        }
        .sp-mobile-login:hover { background: rgba(255,255,255,.13); }
        .sp-mobile-register {
          flex: 1; padding: .75rem; border-radius: 8px; text-align: center;
          background: var(--blue); color: #fff; font-size: .9rem; font-weight: 600;
          text-decoration: none; transition: background .2s;
        }
        .sp-mobile-register:hover { background: var(--blue-dark); }

        /* ── HERO ── */
        .sp-hero {
          position: relative; overflow: hidden;
          padding: 5rem 0 4rem;
          background: linear-gradient(160deg, var(--navy-dark) 0%, var(--navy) 45%, var(--navy-light) 100%);
        }
        @media (min-width: 768px) { .sp-hero { padding: 7rem 0 6rem; } }
        .sp-orb {
          position: absolute; border-radius: 50%;
          pointer-events: none; filter: blur(80px); opacity: .22;
        }
        .sp-orb-1 { width: 500px; height: 500px; background: var(--blue);   top: -180px; right: -80px; }
        .sp-orb-2 { width: 350px; height: 350px; background: var(--green);  bottom: -120px; left: -60px; }
        .sp-hero-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 2.5rem; position: relative; z-index: 1;
        }
        @media (min-width: 900px) {
          .sp-hero-grid { grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        }

        .sp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(43,196,138,.12); border: 1px solid rgba(43,196,138,.3);
          color: var(--green); font-size: .72rem; font-weight: 700;
          padding: .3rem .9rem; border-radius: 100px;
          margin-bottom: 1.25rem; letter-spacing: .07em; text-transform: uppercase;
        }
        .sp-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--green);
          animation: sp-pulse 2s infinite;
        }
        @keyframes sp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }

        .sp-h1 {
          font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 800;
          line-height: 1.07; letter-spacing: -.035em; color: #fff;
          margin-bottom: 1.25rem;
        }
        .sp-h1-accent {
          background: linear-gradient(90deg, var(--blue-light), var(--green));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .sp-hero-sub {
          font-size: clamp(.95rem, 2vw, 1.05rem); line-height: 1.75;
          color: rgba(255,255,255,.52); max-width: 460px; margin-bottom: 2rem;
        }
        .sp-hero-btns { display: flex; gap: .75rem; flex-wrap: wrap; }

        .sp-btn-primary {
          background: var(--blue); color: #fff; border: none;
          padding: .8rem 1.75rem; border-radius: 8px;
          font-size: .95rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all .2s;
          display: inline-flex; align-items: center; gap: 7px;
          box-shadow: 0 0 28px rgba(26,115,232,.4);
          white-space: nowrap;
        }
        .sp-btn-primary:hover { background: var(--blue-dark); transform: translateY(-1px); box-shadow: 0 0 38px rgba(26,115,232,.5); }
        .sp-btn-ghost {
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15);
          color: #fff; padding: .8rem 1.75rem; border-radius: 8px;
          font-size: .95rem; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: all .2s; white-space: nowrap;
        }
        .sp-btn-ghost:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.3); }

        /* Hero live panel */
        .sp-hero-panel {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
          border-radius: 14px; padding: 1.25rem; backdrop-filter: blur(10px);
        }
        @media (max-width: 899px) { .sp-hero-panel { display: none; } }
        .sp-panel-hdr {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem; padding-bottom: .9rem;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .sp-panel-title { color: #fff; font-weight: 700; font-size: .88rem; }
        .sp-live-pill {
          display: flex; align-items: center; gap: 5px;
          background: rgba(43,196,138,.15); border: 1px solid rgba(43,196,138,.3);
          color: var(--green); font-size: .68rem; font-weight: 700;
          padding: .18rem .6rem; border-radius: 4px; text-transform: uppercase; letter-spacing: .08em;
        }
        .sp-event { display: flex; align-items: flex-start; gap: 9px; padding: .55rem 0; border-bottom: 1px solid rgba(255,255,255,.05); }
        .sp-event:last-child { border-bottom: none; }
        .sp-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .sp-dot-ok   { background: var(--green);   box-shadow: 0 0 5px var(--green); }
        .sp-dot-warn { background: var(--danger);  box-shadow: 0 0 5px var(--danger); }
        .sp-dot-mid  { background: var(--warning); box-shadow: 0 0 5px var(--warning); }
        .sp-ev-label { color: rgba(255,255,255,.78); font-size: .8rem; font-weight: 500; }
        .sp-ev-meta  { color: rgba(255,255,255,.32); font-size: .72rem; margin-top: 1px; }

        /* ── STATS ── */
        .sp-stats {
          background: var(--blue);
          background-image: linear-gradient(135deg, var(--blue-dark), var(--blue), var(--blue-light));
          position: relative;
        }
        .sp-stats-grid {
          display: grid; grid-template-columns: 1fr;
          padding: 2.5rem 0; gap: 1.5rem; text-align: center;
        }
        @media (min-width: 640px) {
          .sp-stats-grid { grid-template-columns: repeat(3,1fr); gap: 0; padding: 3rem 0; }
        }
        .sp-stat { padding: 1rem 1.5rem; }
        @media (min-width: 640px) {
          .sp-stat + .sp-stat { border-left: 1px solid rgba(255,255,255,.15); }
        }
        .sp-stat-num { font-family: 'Space Mono', monospace; font-size: clamp(2.2rem,5vw,3rem); font-weight: 700; color: #fff; line-height: 1; margin-bottom: .4rem; }
        .sp-stat-lbl { color: rgba(255,255,255,.7); font-size: .85rem; font-weight: 500; }

        /* ── SECTION SHARED ── */
        .sp-section { padding: 4.5rem 0; }
        @media (min-width: 768px) { .sp-section { padding: 6rem 0; } }
        .sp-section-bg-white { background: #fff; }
        .sp-section-bg-gray  { background: var(--gray-light); }
        .sp-section-bg-dark  { background: linear-gradient(170deg, var(--gray-light) 0%, #fff 100%); }

        .sp-sec-eyebrow { font-size: .73rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--blue); margin-bottom: .65rem; }
        .sp-sec-title { font-size: clamp(1.7rem, 3.5vw, 2.6rem); font-weight: 800; letter-spacing: -.03em; color: var(--navy); line-height: 1.15; margin-bottom: .9rem; }
        .sp-sec-sub { color: #4b5563; font-size: .975rem; line-height: 1.75; max-width: 500px; }

        /* ── FEATURES ── */
        .sp-features-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 1.25rem; margin-top: 3rem;
        }
        @media (min-width: 640px) { .sp-features-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 900px) { .sp-features-grid { grid-template-columns: repeat(3,1fr); } }

        .sp-feat {
          background: #fff; border-radius: 14px; border: 1px solid var(--gray);
          padding: 1.75rem 1.5rem; box-shadow: var(--shadow-sm);
          transition: transform .25s, box-shadow .25s; position: relative; overflow: hidden;
        }
        .sp-feat::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; opacity: 0; transition: opacity .25s; }
        .sp-feat-1::after { background: linear-gradient(90deg, var(--blue), var(--blue-light)); }
        .sp-feat-2::after { background: linear-gradient(90deg, var(--green), var(--green-light)); }
        .sp-feat-3::after { background: linear-gradient(90deg, var(--warning), #f97316); }
        .sp-feat:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .sp-feat:hover::after { opacity: 1; }
        .sp-feat-icon {
          width: 50px; height: 50px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 1.1rem;
        }
        .sp-fi-1 { background: rgba(26,115,232,.1); }
        .sp-fi-2 { background: rgba(43,196,138,.1); }
        .sp-fi-3 { background: rgba(245,158,11,.1); }
        .sp-feat-title { font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: .5rem; }
        .sp-feat-desc  { font-size: .875rem; color: #6b7280; line-height: 1.7; }

        /* ── STEPS ── */
        .sp-steps-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 2rem; margin-top: 3rem; position: relative;
        }
        @media (min-width: 640px) {
          .sp-steps-grid { grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
          .sp-steps-grid::before {
            content: ''; position: absolute; top: 30px;
            left: calc(16.6% + 1.5rem); right: calc(16.6% + 1.5rem); height: 2px;
            background: repeating-linear-gradient(90deg, var(--gray-dark) 0, var(--gray-dark) 6px, transparent 6px, transparent 12px);
          }
        }
        .sp-step { text-align: center; padding: 0 .75rem; }
        .sp-step-circle {
          width: 60px; height: 60px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem; font-family: 'Space Mono', monospace;
          font-size: 1rem; font-weight: 700; color: #fff; position: relative; z-index: 1;
        }
        .sp-sc-1 { background: var(--blue);    box-shadow: 0 0 0 8px rgba(26,115,232,.12); }
        .sp-sc-2 { background: var(--green);   box-shadow: 0 0 0 8px rgba(43,196,138,.12); }
        .sp-sc-3 { background: var(--warning); box-shadow: 0 0 0 8px rgba(245,158,11,.12); }
        .sp-step-title { font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: .5rem; }
        .sp-step-desc  { font-size: .875rem; color: #6b7280; line-height: 1.7; }

        /* ── SECURITY ── */
        .sp-sec-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 2.5rem; align-items: center;
        }
        @media (min-width: 900px) { .sp-sec-grid { grid-template-columns: 1fr 1fr; gap: 5rem; } }

        .sp-attack-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: .28rem .8rem; border-radius: 6px;
          background: #fee2e2; color: #991b1b; font-size: .72rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase; margin-bottom: 1.1rem;
        }
        .sp-sec-title { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; letter-spacing: -.03em; color: var(--navy); line-height: 1.2; margin-bottom: 1rem; }
        .sp-sec-body  { font-size: .95rem; color: #4b5563; line-height: 1.8; margin-bottom: 1.75rem; }
        .sp-checks { display: flex; flex-direction: column; gap: .8rem; }
        .sp-check { display: flex; align-items: flex-start; gap: 10px; font-size: .9rem; color: var(--navy); }
        .sp-check-dot {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; margin-top: 1px;
          background: rgba(43,196,138,.1); border: 1px solid rgba(43,196,138,.3);
          color: var(--green); display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800;
        }

        .sp-threat-box {
          background: var(--navy); border-radius: 14px; padding: 1.4rem;
          box-shadow: var(--shadow-lg), 0 0 50px rgba(13,27,42,.12);
        }
        .sp-tb-hdr {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.1rem; padding-bottom: .9rem;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .sp-tb-title { color: rgba(255,255,255,.9); font-size: .85rem; font-weight: 700; }
        .sp-rt-tag {
          background: rgba(26,115,232,.15); border: 1px solid rgba(26,115,232,.3);
          color: var(--blue-light); font-size: .67rem; font-weight: 700;
          padding: .18rem .58rem; border-radius: 4px; text-transform: uppercase; letter-spacing: .08em;
        }
        .sp-tcard { border-radius: 9px; padding: .9rem 1rem; margin-bottom: .65rem; }
        .sp-tcard:last-child { margin-bottom: 0; }
        .sp-tcard-d { background: rgba(239,68,68,.07);  border: 1px solid rgba(239,68,68,.2); }
        .sp-tcard-s { background: rgba(43,196,138,.07); border: 1px solid rgba(43,196,138,.2); }
        .sp-tc-hdr  { display: flex; align-items: center; justify-content: space-between; margin-bottom: .4rem; }
        .sp-tc-name { color: rgba(255,255,255,.9); font-size: .83rem; font-weight: 700; }
        .sp-tc-score{ color: rgba(255,255,255,.38); font-size: .73rem; margin-bottom: .5rem; }
        .sp-tc-rows { display: flex; flex-direction: column; gap: 3px; }
        .sp-tc-row  { font-size: .77rem; color: rgba(255,255,255,.48); display: flex; align-items: center; gap: 5px; }
        .sp-tc-row-d{ color: #fca5a5; }
        .sp-tc-row-s{ color: rgba(43,196,138,.85); }

        /* Risk badges reuse from globals */
        .risk-high {
          display: inline-flex; align-items: center; padding: .2rem .65rem; border-radius: 100px;
          font-size: .72rem; font-weight: 700;
          background: #fee2e2; color: #991b1b;
        }
        .risk-low {
          display: inline-flex; align-items: center; padding: .2rem .65rem; border-radius: 100px;
          font-size: .72rem; font-weight: 700;
          background: rgba(43,196,138,.2); color: var(--green-dark);
        }

        /* ── CTA ── */
        .sp-cta {
          padding: 5rem 0; text-align: center; position: relative; overflow: hidden;
          background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 55%, var(--blue-light) 100%);
        }
        @media (min-width: 768px) { .sp-cta { padding: 6.5rem 0; } }
        .sp-cta-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(60px); opacity: .18; }
        .sp-cta-orb-1 { width: 450px; height: 450px; background: #fff;        top: -180px; left: -100px; }
        .sp-cta-orb-2 { width: 380px; height: 380px; background: var(--green); bottom: -180px; right: -80px; }
        .sp-cta-inner { position: relative; z-index: 1; }
        .sp-cta-title { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; color: #fff; letter-spacing: -.03em; margin-bottom: .9rem; }
        .sp-cta-sub   { color: rgba(255,255,255,.78); font-size: 1rem; max-width: 480px; margin: 0 auto 2.25rem; line-height: 1.75; }
        .sp-cta-btn {
          background: #fff; color: var(--blue); border: none;
          padding: .88rem 2.1rem; border-radius: 8px; font-size: .975rem;
          font-weight: 700; cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 28px rgba(0,0,0,.22);
          transition: transform .2s, box-shadow .2s;
          display: inline-flex; align-items: center; gap: 7px;
        }
        .sp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,.28); }

        /* ── FOOTER ── */
        .sp-footer {
          background: linear-gradient(135deg, var(--navy-dark), var(--navy));
          padding: 3.5rem 0 2rem;
          border-top: 1px solid rgba(255,255,255,.04);
        }
        .sp-footer-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2rem; margin-bottom: 2.5rem;
        }
        @media (min-width: 640px) { .sp-footer-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .sp-footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; } }

        .sp-footer-brand-name { color: #fff; font-size: 1.05rem; font-weight: 800; margin-bottom: .55rem; }
        .sp-footer-brand-desc { color: rgba(255,255,255,.33); font-size: .825rem; line-height: 1.7; max-width: 210px; }
        .sp-footer-col-title  { color: rgba(255,255,255,.48); font-size: .73rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: .9rem; }
        .sp-footer-links { list-style: none; display: flex; flex-direction: column; gap: .5rem; }
        .sp-footer-link { color: rgba(255,255,255,.33); font-size: .85rem; text-decoration: none; transition: color .2s; }
        .sp-footer-link:hover { color: rgba(255,255,255,.8); }
        .sp-footer-bottom {
          display: flex; flex-direction: column; gap: .4rem; align-items: center; text-align: center;
          padding-top: 1.75rem; border-top: 1px solid rgba(255,255,255,.06);
        }
        @media (min-width: 640px) {
          .sp-footer-bottom { flex-direction: row; justify-content: space-between; text-align: left; }
        }
        .sp-footer-copy { color: rgba(255,255,255,.22); font-size: .78rem; }

        /* ── UTILS ── */
        .sp-text-center { text-align: center; }
        .sp-mx-auto { margin-left: auto; margin-right: auto; }
      `}</style>

      <div className="sp-page">

        {/* ══ NAV ══ */}
        <nav className={`sp-nav${scrolled ? " scrolled" : ""}`}>
          <div className="sp-wrap">
            <div className="sp-nav-bar">
              <a href="/" className="sp-logo">
                <div className="sp-logo-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <span className="sp-logo-text">SecurePay</span>
              </a>

              {/* Desktop */}
              <div className="sp-nav-desktop">
                <a href="#features"    className="sp-nav-link">Features</a>
                <a href="#how-it-works" className="sp-nav-link">How it works</a>
                <a href="#security"    className="sp-nav-link">Security</a>
                <a href="/login"       className="sp-nav-link">Login</a>
                <a href="/register">
                  <button className="sp-nav-btn">Get Started</button>
                </a>
              </div>

              {/* Hamburger */}
              <button
                className={`sp-hamburger${menuOpen ? " open" : ""}`}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
              >
                <span /><span /><span />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <div className={`sp-mobile-menu${menuOpen ? " open" : ""}`}>
            <div className="sp-mobile-menu-inner">
              <a href="#features"     className="sp-mobile-link" onClick={closeMenu}>Features</a>
              <a href="#how-it-works" className="sp-mobile-link" onClick={closeMenu}>How it works</a>
              <a href="#security"     className="sp-mobile-link" onClick={closeMenu}>Security</a>
              <div className="sp-mobile-divider" />
              <div className="sp-mobile-actions">
                <a href="/login"    className="sp-mobile-login"    onClick={closeMenu}>Login</a>
                <a href="/register" className="sp-mobile-register" onClick={closeMenu}>Get Started</a>
              </div>
            </div>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section className="sp-hero">
          <div className="sp-orb sp-orb-1" />
          <div className="sp-orb sp-orb-2" />
          <div className="sp-wrap">
            <div className="sp-hero-grid">
              <div>
                <div className="sp-eyebrow">
                  <span className="sp-eyebrow-dot" />
                  AI-Powered Security · Live
                </div>
                <h1 className="sp-h1">
                  Smart Payments,<br/>
                  <span className="sp-h1-accent">Smarter Security</span>
                </h1>
                <p className="sp-hero-sub">
                  Send money with confidence. Our AI detects pharming attacks in real-time,
                  protecting your transactions with adaptive multi-factor authentication.
                </p>
                <div className="sp-hero-btns">
                  <a href="/register">
                    <button className="sp-btn-primary">
                      Create Free Account
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </a>
                  <a href="#how-it-works">
                    <button className="sp-btn-ghost">Learn More</button>
                  </a>
                </div>
              </div>

              {/* Live panel — hidden on mobile via CSS */}
              <div className="sp-hero-panel">
                <div className="sp-panel-hdr">
                  <span className="sp-panel-title">Live Threat Monitor</span>
                  <span className="sp-live-pill">
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                    Live
                  </span>
                </div>
                {events.map((ev, i) => (
                  <div className="sp-event" key={i}>
                    <span className={`sp-dot sp-dot-${ev.dot}`} />
                    <div>
                      <div className="sp-ev-label">{ev.label}</div>
                      <div className="sp-ev-meta">{ev.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section className="sp-stats">
          <div className="sp-wrap">
            <div className="sp-stats-grid">
              <div className="sp-stat">
                <div className="sp-stat-num">85%</div>
                <div className="sp-stat-lbl">Threat Detection Accuracy</div>
              </div>
              <div className="sp-stat">
                <div className="sp-stat-num">100%</div>
                <div className="sp-stat-lbl">Legitimate User Precision</div>
              </div>
              <div className="sp-stat">
                <div className="sp-stat-num">10+</div>
                <div className="sp-stat-lbl">Security Factors Analyzed</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" className="sp-section sp-section-bg-gray">
          <div className="sp-wrap">
            <div className="sp-text-center" style={{ maxWidth: 540, margin: "0 auto" }}>
              <div className="sp-sec-eyebrow">Core Capabilities</div>
              <h2 className="sp-sec-title">Security That Adapts to You</h2>
              <p className="sp-sec-sub sp-mx-auto">Not all logins are equal. Our AI knows the difference between you and a hacker — and acts accordingly.</p>
            </div>
            <div className="sp-features-grid">
              <div className="sp-feat sp-feat-1">
                <div className="sp-feat-icon sp-fi-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <div className="sp-feat-title">AI Risk Assessment</div>
                <div className="sp-feat-desc">Machine learning analyzes every login in real-time, scoring risk from 0–100 based on device, location, and behavior patterns.</div>
              </div>
              <div className="sp-feat sp-feat-2">
                <div className="sp-feat-icon sp-fi-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <div className="sp-feat-title">Adaptive MFA</div>
                <div className="sp-feat-desc">Low-risk users get instant access. Suspicious activity? Additional verification required. Security when you need it, not when you don't.</div>
              </div>
              <div className="sp-feat sp-feat-3">
                <div className="sp-feat-icon sp-fi-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div className="sp-feat-title">Instant Transfers</div>
                <div className="sp-feat-desc">Send money to anyone, instantly. Our AI monitors every transaction for fraud while keeping legitimate transfers lightning fast.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section id="how-it-works" className="sp-section sp-section-bg-white">
          <div className="sp-wrap">
            <div className="sp-text-center" style={{ maxWidth: 500, margin: "0 auto" }}>
              <div className="sp-sec-eyebrow">Getting Started</div>
              <h2 className="sp-sec-title">Three Steps to Secure Payments</h2>
            </div>
            <div className="sp-steps-grid">
              <div className="sp-step">
                <div className="sp-step-circle sp-sc-1">01</div>
                <div className="sp-step-title">Sign Up</div>
                <div className="sp-step-desc">Create your account in seconds. Get your unique account number and start with ₦0 balance.</div>
              </div>
              <div className="sp-step">
                <div className="sp-step-circle sp-sc-2">02</div>
                <div className="sp-step-title">Add Funds</div>
                <div className="sp-step-desc">Load your wallet securely. Your money is protected by bank-level encryption and AI monitoring.</div>
              </div>
              <div className="sp-step">
                <div className="sp-step-circle sp-sc-3">03</div>
                <div className="sp-step-title">Send Money</div>
                <div className="sp-step-desc">Transfer to anyone instantly. AI checks every transaction for suspicious patterns automatically.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SECURITY ══ */}
        <section id="security" className="sp-section sp-section-bg-dark">
          <div className="sp-wrap">
            <div className="sp-sec-grid">
              <div>
                <div className="sp-attack-tag">⚠ Pharming Attack Detected</div>
                <h2 className="sp-sec-title">We Stop Attacks Before They Happen</h2>
                <p className="sp-sec-body">
                  Hackers create fake websites identical to banking sites. When victims enter their passwords, they're stolen instantly. Traditional security can't catch this.
                  <br/><br/>
                  <strong style={{ color: "var(--navy)", fontWeight: 700 }}>SecurePay is different.</strong> Even with a stolen password, our AI detects suspicious patterns — unknown device, strange location, unusual behavior — and blocks the attack instantly.
                </p>
                <ul className="sp-checks" style={{ listStyle: "none" }}>
                  {checks.map(([title, desc]) => (
                    <li className="sp-check" key={title}>
                      <span className="sp-check-dot">✓</span>
                      <span><strong style={{ fontWeight: 600 }}>{title}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sp-threat-box">
                <div className="sp-tb-hdr">
                  <span className="sp-tb-title">AI Threat Analysis</span>
                  <span className="sp-rt-tag">Real-time</span>
                </div>
                <div className="sp-tcard sp-tcard-d">
                  <div className="sp-tc-hdr">
                    <span className="sp-tc-name">Login Attempt Blocked</span>
                    <span className="risk-high">High Risk</span>
                  </div>
                  <div className="sp-tc-score">Risk Score: 90 / 100</div>
                  <div className="sp-tc-rows">
                    <div className="sp-tc-row sp-tc-row-d">⚠ Unknown device from Russia</div>
                    <div className="sp-tc-row sp-tc-row-d">⚠ 5 failed login attempts</div>
                    <div className="sp-tc-row sp-tc-row-d">⚠ Location 8,000 km from usual</div>
                  </div>
                </div>
                <div className="sp-tcard sp-tcard-s">
                  <div className="sp-tc-hdr">
                    <span className="sp-tc-name">Login Successful</span>
                    <span className="risk-low">Low Risk</span>
                  </div>
                  <div className="sp-tc-score">Risk Score: 15 / 100</div>
                  <div className="sp-tc-rows">
                    <div className="sp-tc-row sp-tc-row-s">✓ Known device (MacBook Pro)</div>
                    <div className="sp-tc-row sp-tc-row-s">✓ Usual location (Lagos, Nigeria)</div>
                    <div className="sp-tc-row sp-tc-row-s">✓ Normal login time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="sp-cta">
          <div className="sp-cta-orb sp-cta-orb-1" />
          <div className="sp-cta-orb sp-cta-orb-2" />
          <div className="sp-wrap sp-cta-inner">
            <h2 className="sp-cta-title">Ready for Intelligent Security?</h2>
            <p className="sp-cta-sub">Join SecurePay today and protect your money with AI-powered threat detection that works silently in the background.</p>
            <a href="/register">
              <button className="sp-cta-btn">
                Create Your Free Account
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </a>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="sp-footer">
          <div className="sp-wrap">
            <div className="sp-footer-grid">
              <div>
                <div className="sp-footer-brand-name">SecurePay</div>
                <p className="sp-footer-brand-desc">AI-powered pharming detection for secure peer-to-peer payments.</p>
              </div>
              <div>
                <div className="sp-footer-col-title">Product</div>
                <ul className="sp-footer-links">
                  <li><a href="#features"  className="sp-footer-link">Features</a></li>
                  <li><a href="#security"  className="sp-footer-link">Security</a></li>
                  <li><a href="#"          className="sp-footer-link">Pricing</a></li>
                </ul>
              </div>
              <div>
                <div className="sp-footer-col-title">Company</div>
                <ul className="sp-footer-links">
                  <li><a href="#" className="sp-footer-link">About</a></li>
                  <li><a href="#" className="sp-footer-link">Blog</a></li>
                  <li><a href="#" className="sp-footer-link">Careers</a></li>
                </ul>
              </div>
              <div>
                <div className="sp-footer-col-title">Legal</div>
                <ul className="sp-footer-links">
                  <li><a href="#" className="sp-footer-link">Privacy</a></li>
                  <li><a href="#" className="sp-footer-link">Terms</a></li>
                  <li><a href="#" className="sp-footer-link">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="sp-footer-bottom">
              <span className="sp-footer-copy">© 2026 SecurePay. Built with AI to protect your money.</span>
              <span className="sp-footer-copy">Lagos, Nigeria</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}