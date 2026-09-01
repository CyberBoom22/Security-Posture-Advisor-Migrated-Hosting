import React from 'react';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';

export const SupportView: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '36px 24px 60px',
        fontFamily: "'Inter', sans-serif",
        color: '#1A1A1A',
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 620,
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: '#FFFDF9',
          border: '1px solid rgba(26, 26, 26, 0.1)',
          borderRadius: '6px',
          padding: '44px 36px',
          boxShadow: '0 4px 20px rgba(26, 26, 26, 0.04)',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#C5A059',
            marginBottom: 16,
          }}
        >
          Independent Stewardship
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Logo size={56} />
        </div>

        <h1
          style={{
            fontFamily: "'Newsreader', 'Spectral', serif",
            fontSize: '34px',
            fontWeight: 500,
            color: '#1A1A1A',
            margin: '0 0 14px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          Support Independent Security Audits
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#4A4A4A',
            lineHeight: 1.6,
            margin: '0 auto 30px',
            maxWidth: 480,
            fontFamily: "'Newsreader', 'Spectral', serif",
            fontStyle: 'italic',
          }}
        >
          Donations sustain weekly pricing verification and honest analysis — keeping this tool 100% free from affiliate links and vendor kickbacks.
        </p>

        <div>
          <a
            href="https://venmo.com/code?user_id=1967605971681280647&created=1787946735"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#1A1A1A',
              color: '#F9F7F2',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '14px 32px',
              borderRadius: '4px',
              border: '1px solid #1A1A1A',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#C5A059';
              e.currentTarget.style.borderColor = '#C5A059';
              e.currentTarget.style.color = '#1A1A1A';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#1A1A1A';
              e.currentTarget.style.borderColor = '#1A1A1A';
              e.currentTarget.style.color = '#F9F7F2';
            }}
          >
            <Wallet size={16} />
            <span>Contribute via Venmo</span>
            <ArrowUpRight size={15} />
          </a>
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid rgba(26, 26, 26, 0.08)',
            fontSize: '11.5px',
            color: '#8C8275',
            lineHeight: 1.6,
          }}
        >
          Contributions are strictly voluntary. Security Hub maintains zero commercial affiliations,
          sponsored placements, or affiliate cookies. Upkeep directly covers hosting, domain registration,
          and ongoing manual pricing audits.
        </div>
      </div>
    </div>
  );
};
