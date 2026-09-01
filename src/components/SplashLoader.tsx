import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const SplashLoader: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing audit indices...');

  useEffect(() => {
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

    const t4 = setTimeout(() => {
      setLoaded(true);
    }, 1600);

    const t5 = setTimeout(() => {
      setLoaderGone(true);
    }, 2150);

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

  return (
    <div
      id="splash-loader-screen"
      className={`loader ${loaded ? 'loader-out' : ''}`}
      aria-hidden={loaded}
      role="status"
      aria-live="polite"
      aria-label="Loading Security Hub"
    >
      {/* Editorial Frame Accents */}
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
        {/* Animated Center Logo with Subtle Orbit Ring */}
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

        {/* Progress Bar */}
        <div className="loader-progress-track" style={{ marginTop: 8 }}>
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live Status Message */}
        <div className="loader-status">
          <span style={{ color: '#C5A059', fontSize: 10 }}>●</span>
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
};

