import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  isAnimated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 34, className = '', isAnimated = false }) => {
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
