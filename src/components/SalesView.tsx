import React from 'react';
import {
  Tag,
  Clock,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Hourglass,
  CalendarCheck,
} from 'lucide-react';
import {
  announcedPromotions,
  awaitingConfirmation,
  durationLabel,
  endingSoon,
  savingPercent,
  renewalMultiple,
  REQUIRED_SCANS,
  scanDaysLabel,
  Promotion,
} from '../promotions';
import { VPN_COMPARE, AV_COMPARE, termMonths } from '../data';

const GOLD = '#C5A059';
const INK = '#1A1A1A';
const MUTED = '#767064';
const BODY = '#4A4A4A';
const CARD = '#FFFDF9';
const RULE = 'rgba(26, 26, 26, 0.1)';

const money = (n: number) => `$${n.toFixed(2)}`;

/** Months covered by the intro term of the product a sale applies to. */
function productTermMonths(product: string): number | null {
  const vpn = VPN_COMPARE.find((v) => v.name === product);
  if (vpn) return termMonths(vpn.term);
  return AV_COMPARE.find((a) => a.name === product) ? 12 : null;
}

const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = MUTED,
}) => (
  <div
    style={{
      fontSize: '9.5px',
      fontWeight: 700,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color,
    }}
  >
    {children}
  </div>
);

const SaleCard: React.FC<{ promo: Promotion }> = ({ promo }) => {
  const urgent = endingSoon(promo);
  const saved = savingPercent(promo);
  const months = productTermMonths(promo.product);
  const multiple = renewalMultiple(promo, months);
  const seenSince = new Date(`${promo.firstSeen}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <article
      className="compare-card"
      style={{ padding: '22px 24px', marginBottom: 18 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '22px',
              fontWeight: 600,
              margin: 0,
              color: INK,
              letterSpacing: '-0.015em',
            }}
          >
            {promo.vendor}
          </h3>
          <div style={{ fontSize: '11.5px', color: MUTED, marginTop: 3 }}>
            {promo.product}
          </div>
        </div>

        {promo.discount && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8A6B2E',
              background: 'rgba(197,160,89,0.16)',
              padding: '5px 10px',
              borderRadius: 3,
              whiteSpace: 'nowrap',
            }}
          >
            {promo.discount}
          </span>
        )}
      </div>

      <p style={{ fontSize: '14px', color: BODY, lineHeight: 1.6, margin: '0 0 16px' }}>
        {promo.headline}
      </p>

      {/* What it costs now, and what it costs after. */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0,
          border: `1px solid ${RULE}`,
          borderRadius: 5,
          background: '#FDFBF6',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <div style={{ flex: '1 1 210px', padding: '14px 18px', minWidth: 0 }}>
          <Label color={GOLD}>Sale price</Label>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 9,
              marginTop: 7,
              flexWrap: 'wrap',
            }}
          >
            {promo.priceWas !== null && (
              <span
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: '17px',
                  color: MUTED,
                  textDecoration: 'line-through',
                }}
              >
                {money(promo.priceWas)}
              </span>
            )}
            <span
              style={{
                fontFamily: "'Newsreader', 'Fraunces', serif",
                fontSize: '32px',
                fontWeight: 500,
                lineHeight: 1,
                color: INK,
              }}
            >
              {promo.priceNow !== null ? money(promo.priceNow) : '—'}
            </span>
            {saved !== null && (
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#4A6B4A' }}>
                save {saved}%
              </span>
            )}
          </div>
          <div style={{ fontSize: '11.5px', color: BODY, marginTop: 6 }}>
            {promo.priceCovers}
          </div>
        </div>

        <div
          style={{
            flex: '1 1 210px',
            padding: '14px 18px',
            minWidth: 0,
            borderLeft: `1px solid ${RULE}`,
            background: 'rgba(26,26,26,0.02)',
          }}
        >
          <Label>Then it renews at</Label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 7 }}>
            <span
              style={{
                fontFamily: "'Newsreader', 'Fraunces', serif",
                fontSize: '32px',
                fontWeight: 500,
                lineHeight: 1,
                color: INK,
              }}
            >
              {promo.renewsAt !== null ? money(promo.renewsAt) : '—'}
            </span>
            <span style={{ fontSize: '12px', color: MUTED }}>{promo.renewsPer}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: BODY, marginTop: 6 }}>
            {multiple !== null
              ? `${multiple.toFixed(1)}x the sale rate. The sale does not change this.`
              : 'The sale does not change this.'}
          </div>
        </div>
      </div>

      {/* How long it runs. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          paddingTop: 12,
          borderTop: `1px solid ${RULE}`,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '12.5px',
            fontWeight: urgent ? 700 : 600,
            color: urgent ? '#8A6B2E' : INK,
          }}
        >
          <Clock size={13} />
          {durationLabel(promo)}
        </span>
        <span style={{ fontSize: '11.5px', color: MUTED }}>
          Seen since {seenSince} · confirmed by {promo.confirmations} scans
        </span>
        <a
          href={promo.source}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="svc"
          style={{ fontSize: '11.5px', marginLeft: 'auto' }}
        >
          Check at {promo.vendor} <ExternalLink size={11} />
        </a>
      </div>
    </article>
  );
};

export const SalesView: React.FC = () => {
  const announced = announcedPromotions();
  const pending = awaitingConfirmation();

  return (
    <div
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '32px 24px 60px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h2
        style={{
          fontFamily: "'Newsreader', 'Spectral', serif",
          fontSize: '30px',
          fontWeight: 500,
          margin: '0 0 10px',
          color: INK,
          letterSpacing: '-0.015em',
        }}
      >
        Sales running now
      </h2>
      <p
        style={{
          fontSize: '15px',
          color: BODY,
          maxWidth: 760,
          lineHeight: 1.65,
          margin: '0 0 20px',
        }}
      >
        Which security tools are discounted, what the sale actually costs, how long it
        runs, and — the part the vendor puts in smaller type — what it renews at once the
        sale is over. We take no commission on any of this, and a sale appearing here is
        not a recommendation.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 9,
          alignItems: 'flex-start',
          background: CARD,
          border: `1px solid ${RULE}`,
          borderLeft: `3px solid ${GOLD}`,
          borderRadius: 4,
          padding: '12px 16px',
          marginBottom: 26,
        }}
      >
        <CalendarCheck size={14} style={{ color: '#8A6B2E', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '12px', color: BODY, lineHeight: 1.6 }}>
          <strong style={{ color: INK }}>Nothing is announced on first sighting.</strong> An
          automated check runs on the {scanDaysLabel()} of each month, and a sale
          appears here only after {REQUIRED_SCANS} separate scans have seen it. A flash
          promotion or a regional price quirk expires before it clears that bar. Sales with a published end date
          disappear from this page on their own once it passes.
        </div>
      </div>

      {announced.length > 0 ? (
        announced.map((p) => <SaleCard key={`${p.vendor}-${p.product}`} promo={p} />)
      ) : (
        <div
          style={{
            background: CARD,
            border: `1px solid ${RULE}`,
            borderRadius: 6,
            padding: '38px 28px',
            textAlign: 'center',
          }}
        >
          <Hourglass size={22} style={{ color: GOLD, marginBottom: 12 }} />
          <p style={{ fontSize: '16px', color: INK, margin: '0 0 8px', fontWeight: 500 }}>
            No confirmed sales to announce yet.
          </p>
          <p
            style={{
              fontSize: '13.5px',
              color: BODY,
              margin: '0 auto',
              maxWidth: 520,
              lineHeight: 1.65,
            }}
          >
            {pending.length > 0 ? (
              <>
                {pending.length} {pending.length === 1 ? 'discount is' : 'discounts are'}{' '}
                currently being tracked, but none has been seen by {REQUIRED_SCANS} scans
                yet. They will be announced here once they have, and not before — a
                discount that vanishes between scans was never worth telling you about.
              </>
            ) : (
              <>
                The last scan found no discounts running on any tool in this index. Nothing
                is being withheld; there is simply nothing on sale.
              </>
            )}
          </p>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 9,
          alignItems: 'flex-start',
          background: '#F4F0E8',
          borderRadius: 4,
          padding: '13px 16px',
          marginTop: 22,
        }}
      >
        <ShieldAlert size={14} style={{ color: '#8A6B2E', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '12.5px', color: BODY, lineHeight: 1.65 }}>
          <strong style={{ color: INK }}>What a sale does not change.</strong> Every
          discount above applies to the introductory term only. The renewal figure beside
          it is what you pay afterwards, and it is unaffected by the sale. Before buying on
          a discount, check the renewal column in{' '}
          <span style={{ color: INK, fontWeight: 600 }}>Compare Tools</span> — for several
          vendors in this index, year two costs more than three times year one.
        </div>
      </div>

      <p
        style={{
          fontSize: '11.5px',
          color: MUTED,
          lineHeight: 1.65,
          marginTop: 20,
          paddingTop: 14,
          borderTop: `1px solid ${RULE}`,
        }}
      >
        Prices are read from each vendor&apos;s own page and confirmed across multiple
        scans before publication, but promotions change without notice and can vary by
        country. Confirm the current terms on the vendor&apos;s page before you buy. No
        affiliate links, no sponsorships, no commission.
      </p>
    </div>
  );
};
