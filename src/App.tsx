import React, { useState } from 'react';
import { Shield, LayoutGrid, Wallet } from 'lucide-react';
import { Logo } from './components/Logo';
import { SplashLoader } from './components/SplashLoader';
import { ScrollButtons } from './components/ScrollButtons';
import { AutoFit } from './components/AutoFit';
import { AdvisorView } from './components/AdvisorView';
import { CompareView } from './components/CompareView';
import { SupportView } from './components/SupportView';

/**
 * Application shell: dispatch bar, masthead and tab navigation, disclaimer,
 * the active view, and the colophon.
 *
 * Tab state is held here in memory and is not reflected in the URL. There is
 * no client-side router anywhere in this app, and the deployment depends on
 * that: wrangler.jsonc sets `not_found_handling: "none"` and there is no
 * `_redirects` SPA fallback, so unknown paths return a real 404 instead of
 * being answered with a 200 and the whole app. If routing is ever added, both
 * of those need revisiting together — see DEPLOY.md.
 *
 * A consequence worth knowing: the three views are not linkable or
 * bookmarkable, and switching tabs loses the advisor's in-progress answers,
 * since AdvisorView unmounts.
 */
export function App() {
  const [currentTab, setCurrentTab] = useState<'advisor' | 'compare' | 'support'>(
    'advisor'
  );

  return (
    <div style={{ backgroundColor: '#F9F7F2', minHeight: '100vh', color: '#1A1A1A' }}>
      {/*
        * Three behavioural components that render no layout of their own:
        * AutoFit scales the document down when content overflows the viewport,
        * SplashLoader covers the first ~2s then removes itself, and
        * ScrollButtons pins the jump-to-top/bottom controls.
        */}
      <AutoFit />
      <SplashLoader />
      <ScrollButtons />

      {/* Masthead strip above the header. Decorative framing only — it states
        * the site's stance rather than carrying any live data. */}
      <div
        style={{
          borderBottom: '1px solid rgba(26, 26, 26, 0.08)',
          backgroundColor: '#F4F0E8',
          fontSize: '9.5px',
          fontWeight: 700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#767064',
          padding: '8px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#C5A059' }}>●</span>
            <span>Security Posture Advisory</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span>Public Consumer Dispatch</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span>Weekly Pricing Audit</span>
            <span style={{ opacity: 0.4 }}>//</span>
            <span>Zero Sponsorships</span>
          </div>
        </div>
      </div>

      {/* Masthead: logo and wordmark on the left, tab navigation on the right. */}
      <header
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          padding: '24px 24px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 16,
          borderBottom: '1px solid rgba(26, 26, 26, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <div>
            <div
              style={{
                fontFamily: "'Newsreader', 'Spectral', serif",
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: '#1A1A1A',
              }}
            >
              Security Hub
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#8C8275',
                marginTop: 3,
              }}
            >
              Independent Intelligence & Tool Analysis
            </div>
          </div>
        </div>

        {/*
          * Tab bar. These are <button> elements rather than links because the
          * tabs are not addressable; using anchors would imply a URL that does
          * not exist. The `on` class marks the active tab, styled in index.css.
          */}
        <nav
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          aria-label="Main Navigation"
        >
          <button
            type="button"
            className={`apptab ${currentTab === 'advisor' ? 'on' : ''}`}
            onClick={() => setCurrentTab('advisor')}
          >
            <Shield size={14} />
            <span>Advisor</span>
          </button>

          <button
            type="button"
            className={`apptab ${currentTab === 'compare' ? 'on' : ''}`}
            onClick={() => setCurrentTab('compare')}
          >
            <LayoutGrid size={14} />
            <span>Compare Tools</span>
          </button>

          <button
            type="button"
            className={`apptab ${currentTab === 'support' ? 'on' : ''}`}
            onClick={() => setCurrentTab('support')}
          >
            <Wallet size={14} />
            <span>Support</span>
          </button>
        </nav>
      </header>

      {/* Standing disclaimer. Shown on every tab rather than only on Compare,
        * because the no-affiliate claim is what the advice rests on. */}
      <div
        style={{
          maxWidth: 1040,
          margin: '16px auto 0',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            lineHeight: 1.6,
            color: '#4A4A4A',
            backgroundColor: '#FFFDF9',
            border: '1px solid rgba(26, 26, 26, 0.1)',
            borderLeft: '3px solid #C5A059',
            borderRadius: '4px',
            padding: '12px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: 6,
          }}
        >
          <strong
            style={{
              color: '#1A1A1A',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '10.5px',
            }}
          >
            Editor&apos;s Protocol:
          </strong>
          <span>
            Created to encourage sensible household security postures without commercial bias.
            Unaffiliated with all vendors mentioned — zero affiliate commissions, zero sponsorships.
            Pricing audited weekly to uncover real renewal costs.
          </span>
        </div>
      </div>

      {/*
        * The active view. Rendering is conditional rather than hidden-and-kept,
        * so each view mounts fresh and unmounts on tab change — which is why
        * advisor answers do not survive a trip to Compare and back.
        */}
      <main id="main-content">
        {currentTab === 'advisor' && <AdvisorView />}
        {currentTab === 'compare' && <CompareView />}
        {currentTab === 'support' && <SupportView />}
      </main>

      {/* Colophon: the full disclaimer, plus the reminder that prices are
        * point-in-time and should be confirmed with the provider. */}
      <footer
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          padding: '24px 24px 48px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            borderTop: '1px solid rgba(26, 26, 26, 0.1)',
            paddingTop: 18,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '11.5px',
            color: '#767064',
            lineHeight: 1.6,
          }}
        >
          <div style={{ maxWidth: 680 }}>
            Published as a free public resource. Security Hub is not affiliated with, endorsed by,
            or compensated by any company reviewed. Prices and feature matrices are refreshed
            regularly from verified public documentation — confirm current terms directly with
            providers before transaction.
          </div>
          <div
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: '#8C8275',
            }}
          >
            Curated Index // Edition 2024
          </div>
        </div>
      </footer>
    </div>
  );
}

// Exported both ways: main.tsx imports the default, while the named export
// keeps the component importable by name if this file ever grows siblings.
export default App;
