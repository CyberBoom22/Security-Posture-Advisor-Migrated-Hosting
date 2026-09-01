import React from 'react';

/**
 * The Security Hub mark: a hexagonal shield crossed by a gold stroke and a
 * darker diagonal. The same three shapes are duplicated as an inline SVG
 * favicon in index.html, so a change here should be mirrored there.
 */
interface LogoProps {
  size?: number;
  className?: string;
  isAnimated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 34, className = '', isAnimated = false }) => {
  // The animated variant is used once, by the splash screen. It draws each
  // stroke on in sequence using the dash-offset technique: the dash pattern is
  // set to the full path length and offset by the same amount, which hides the
  // stroke entirely, then the `drawin` keyframes (in index.css) animate the
  // offset to zero so the line appears to be drawn. Each strokeDasharray value
  // below is therefore the approximate length of its own path.
  if (isAnimated) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-label="Security Hub logo"
        className={className}
        fill="none"
      >
        {/* Shield outline: drawn first, over 0.7s. */}
        <polygon
          points="32,6 54,19 54,45 32,58 10,45 10,19"
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={5}
          strokeLinejoin="round"
          className="draw"
          style={{
            strokeDasharray: 160,
            strokeDashoffset: 160,
            animation: 'drawin 0.7s ease forwards',
            animationDelay: '0s',
          }}
        />
        {/* Gold inner stroke: starts at 0.5s, once the shield is nearly closed. */}
        <path
          d="M24 24 L40 40"
          fill="none"
          stroke="#C5A059"
          strokeWidth={5}
          strokeLinecap="round"
          className="draw"
          style={{
            strokeDasharray: 30,
            strokeDashoffset: 30,
            animation: 'drawin 0.35s ease forwards',
            animationDelay: '0.5s',
          }}
        />
        {/* Diagonal strike across the whole mark: last, at 0.7s. */}
        <path
          d="M12 50 L52 14"
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={3.5}
          strokeLinecap="round"
          className="draw"
          style={{
            strokeDasharray: 60,
            strokeDashoffset: 60,
            animation: 'drawin 0.4s ease forwards',
            animationDelay: '0.7s',
          }}
        />
      </svg>
    );
  }

  // Static variant: identical geometry with no dash or animation attributes.
  // Used everywhere else in the app, where an animating logo would be noise.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-label="Security Hub logo"
      className={className}
      fill="none"
    >
      <polygon
        points="32,6 54,19 54,45 32,58 10,45 10,19"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M24 24 L40 40"
        fill="none"
        stroke="#C5A059"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M12 50 L52 14"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
