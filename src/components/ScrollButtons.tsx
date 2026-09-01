import React from 'react';

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
