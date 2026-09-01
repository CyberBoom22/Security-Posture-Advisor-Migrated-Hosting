import { useEffect } from 'react';

/**
 * Scales the whole document down when its content is wider than the viewport.
 *
 * The layout has fixed-width tables (the pricing matrices) that cannot reflow
 * below a certain width. Rather than let narrow screens scroll horizontally,
 * this shrinks the document until it fits.
 *
 * Renders nothing — it exists purely for the effect below.
 */
export const AutoFit = () => {
  useEffect(() => {
    const handleCheck = () => {
      // How much wider the content is than the window. Above 1 means overflow.
      const ratio = document.documentElement.scrollWidth / window.innerWidth;

      // The 1.02 threshold ignores sub-pixel rounding, which would otherwise
      // toggle zoom on and off continuously. The 0.55 floor stops the page
      // shrinking to the point of being unreadable on very narrow screens,
      // accepting some horizontal scroll instead.
      if (ratio > 1.02) {
        document.documentElement.style.zoom = String(Math.max(1 / ratio, 0.55));
      } else {
        document.documentElement.style.zoom = '';
      }
    };

    handleCheck();

    // Viewport-level changes: window resizing and device rotation.
    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);

    // Content-level changes: switching tabs or expanding a section can change
    // the content width without the viewport changing at all, which neither
    // event above would catch.
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      observer = new ResizeObserver(handleCheck);
      observer.observe(document.body);
    }

    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('orientationchange', handleCheck);
      if (observer) {
        observer.disconnect();
      }
      // Clear the zoom on unmount so this component cannot leave the document
      // permanently scaled.
      document.documentElement.style.zoom = '';
    };
  }, []);

  return null;
};
