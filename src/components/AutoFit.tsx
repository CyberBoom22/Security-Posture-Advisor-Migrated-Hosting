import { useEffect } from 'react';

export const AutoFit = () => {
  useEffect(() => {
    const handleCheck = () => {
      const ratio = document.documentElement.scrollWidth / window.innerWidth;
      if (ratio > 1.02) {
        document.documentElement.style.zoom = String(Math.max(1 / ratio, 0.55));
      } else {
        document.documentElement.style.zoom = '';
      }
    };

    handleCheck();
    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);

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
      document.documentElement.style.zoom = '';
    };
  }, []);

  return null;
};
