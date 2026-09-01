import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

/**
 * Opening splash screen.
 *
 * The progress it reports is theatrical, not real: the app is a static bundle
 * with nothing to fetch, so the bar runs on fixed timers rather than tracking
 * actual work. It exists to give the first paint a deliberate feel instead of
 * snapping straight to a dense pricing table.
 */
export const SplashLoader: React.FC = () => {
  // Two separate flags, because the exit is two-phase: `loaded` starts the CSS
  // fade-out (the .loader-out class), and `loaderGone` unmounts once that fade
  // has finished. Unmounting immediately would cut the animation off.
  const [loaded, setLoaded] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing audit indices...');

  useEffect(() => {
    // Scripted timeline. Each step advances the bar and swaps the status line;
    // the last two hand over to the fade-out and then the unmount.
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Indexing carrier perk matrices...');
    }, 450);

    const t2 = setTimeout(() => {
      setProgress(80);
      setStatusText('Validating multi-seat renewal benchmarks...');
    }, 900);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Audits loaded.');
    }, 1300);

    // Begin the fade-out 300ms after the bar fills, so "Audits loaded." is
    // readable rather than flashing past.
    const t4 = setTimeout(() => {
      setLoaded(true);
    }, 1600);

    // Unmount 550ms later, which must stay longer than the CSS transition on
    // .loader-out or the splash will vanish mid-fade.
    const t5 = setTimeout(() => {
      setLoaderGone(true);
    }, 2150);

    // Clearing every timer matters under StrictMode, which mounts, unmounts
    // and remounts this component in development.
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  if (loaderGone) {
    return null;
  }

  // aria-hidden flips on at `loaded` so assistive technology drops the splash
  // as soon as it starts leaving, rather than waiting for the unmount.

  return (
    <div
      id="splash-loader-screen"
      className={`loader ${loaded ? 'loader-out' : ''}`}
      aria-hidden={loaded}
      role="status"
      aria-live="polite"
      aria-label="Loading Security Hub"
    >
      {/* Centred card holding the mark, wordmark, progress bar and status. */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
          maxWidth: 420,
          padding: '36px 32px',
          background: '#FFFDF9',
          border: '1px solid rgba(26, 26, 26, 0.1)',
          borderRadius: 6,
          boxShadow: '0 8px 32px rgba(26, 26, 26, 0.04)',
        }}
      >
        {/* The orbit halo spins via CSS; the logo draws itself in over ~1.1s. */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            marginBottom: 4,
          }}
        >
          <div className="loader-ring" />
          <Logo size={76} isAnimated={true} />
        </div>

        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 className="loader-text">Security Hub</h1>
          <span className="loader-subtext">Independent Intelligence & Tool Analysis</span>
        </div>

        {/* Width is driven by the `progress` state set on the timeline above. */}
        <div className="loader-progress-track" style={{ marginTop: 8 }}>
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* aria-live on the wrapper announces each status change once. */}
        <div className="loader-status">
          <span style={{ color: '#C5A059', fontSize: 10 }}>●</span>
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
};

