import React from 'react';

/**
 * Fixed jump-to-top and jump-to-bottom controls.
 *
 * The comparison pages are long enough that reaching either end by scrolling
 * is tedious, particularly once AutoFit has zoomed the page out.
 */
export const ScrollButtons: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    // Positioning is set here rather than in CSS so the control stays anchored
    // regardless of which view is mounted. React sets these through the CSSOM,
    // not as a style attribute in the markup, so the Content-Security-Policy
    // permits it without style-src needing an inline-style allowance.
    <div
      style={{
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      role="region"
      aria-label="Scroll controls"
    >
      {/* The glyphs are decorative, so each button carries an accessible name. */}
      <button
        type="button"
        className="scrollbtn up"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        ▲
      </button>
      <button
        type="button"
        className="scrollbtn down"
        onClick={scrollToBottom}
        aria-label="Scroll to bottom"
        title="Scroll to bottom"
      >
        ▼
      </button>
    </div>
  );
};
