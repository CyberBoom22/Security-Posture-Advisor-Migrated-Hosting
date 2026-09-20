import React from 'react';
import { Tag, ExternalLink, Clock } from 'lucide-react';
import {
  announcedPromotions,
  durationLabel,
  endingSoon,
  Promotion,
} from '../promotions';

const GOLD = '#C5A059';
const INK = '#1A1A1A';
const MUTED = '#767064';
const BODY = '#4A4A4A';
const RULE = 'rgba(26, 26, 26, 0.1)';

/**
 * Tells a visitor which prices on this page are temporary.
 *
 * It says a sale is running and how long it lasts, and nothing else. No
 * countdown timers, no "act now", no links framed as offers — this site takes
 * no commission and a sale is not a recommendation. The only reason a shopper
 * needs this is timing: an intro price seen during a sale is not the price at
 * renewal, and the renewal figure is the one in the tables below.
 *
 * A sale with a past end date is filtered out upstream, so a forgotten entry
 * cannot leave a dead offer on the page.
 */
export const SaleNotice: React.FC = () => {
  const promos = announcedPromotions();
  if (promos.length === 0) return null;

  const soon = promos.filter((p) => endingSoon(p));

  return (
    <section
      aria-label="Sales running at vendors"
      style={{
        background: '#FFFDF9',
        border: `1px solid ${RULE}`,
        borderLeft: `3px solid ${GOLD}`,
        borderRadius: 6,
        padding: '16px 20px',
        marginBottom: 26,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <Tag size={13} style={{ color: GOLD, flexShrink: 0 }} />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: INK,
          }}
        >
          Sales running now
        </span>
        <span style={{ fontSize: '11.5px', color: MUTED }}>
          {promos.length} of the tools below
          {soon.length > 0 && ` · ${soon.length} ending within a week`}
        </span>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {promos.map((p: Promotion) => {
          const urgent = endingSoon(p);
          return (
            <li
              key={`${p.vendor}-${p.product}`}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                flexWrap: 'wrap',
                padding: '7px 0',
                borderTop: `1px solid rgba(26,26,26,0.06)`,
              }}
            >
              <strong style={{ fontSize: '13px', color: INK, minWidth: 150 }}>
                {p.vendor}
              </strong>
              <span style={{ fontSize: '12.5px', color: BODY, flex: '1 1 220px' }}>
                {p.headline}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '11px',
                  fontWeight: urgent ? 700 : 500,
                  color: urgent ? '#8A6B2E' : MUTED,
                  whiteSpace: 'nowrap',
                }}
              >
                <Clock size={11} />
                {durationLabel(p)}
              </span>
              <a
                href={p.source}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="svc"
                style={{ fontSize: '11px' }}
              >
                Check <ExternalLink size={10} />
              </a>
            </li>
          );
        })}
      </ul>

      <p
        style={{
          fontSize: '11.5px',
          color: MUTED,
          lineHeight: 1.6,
          margin: '11px 0 0',
          paddingTop: 10,
          borderTop: `1px solid ${RULE}`,
        }}
      >
        A sale changes the intro price only. Every renewal figure in the tables below is
        what you pay once it ends, and those do not move when a sale does. Full details,
        including what each one renews at, are on the Sales tab. We take no commission on
        any of this.
      </p>
    </section>
  );
};
