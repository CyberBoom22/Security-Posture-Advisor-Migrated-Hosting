import React, { useState } from 'react';
import {
  ArrowRight,
  Tag,
  ExternalLink,
  AlertTriangle,
  Eye,
  FlaskConical,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';
import {
  PRICE_CHANGES,
  FINDINGS,
  FIELD_LABELS,
  FINDING_LABELS,
  changeDates,
  changesOn,
  isPromotional,
  lastAudit,
  PriceChange,
  Finding,
  FindingKind,
} from '../changelog';

const GOLD = '#C5A059';
const INK = '#1A1A1A';
const MUTED = '#767064';
const BODY = '#4A4A4A';
const CARD = '#FFFDF9';
const RULE = 'rgba(26, 26, 26, 0.1)';

const FINDING_ICONS: Record<FindingKind, React.ComponentType<{ size?: number }>> = {
  correction: AlertTriangle,
  observation: Eye,
  method: FlaskConical,
};

const money = (n: number) => `$${n.toFixed(2)}`;

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

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

/** One field that moved, with the direction of travel made obvious. */
const ChangeRow: React.FC<{ change: PriceChange }> = ({ change }) => {
  const promotional = isPromotional(change);
  const rose = change.from !== null && change.to > change.from;

  return (
    <div style={{ padding: '14px 0', borderBottom: `1px solid rgba(26,26,26,0.07)` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 6,
        }}
      >
        <strong style={{ fontSize: '14px', color: INK }}>{change.vendor}</strong>
        <span style={{ fontSize: '12px', color: MUTED }}>{change.product}</span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: MUTED,
            background: 'rgba(26,26,26,0.06)',
            padding: '2px 6px',
            borderRadius: 2,
          }}
        >
          {FIELD_LABELS[change.field]}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: '20px',
            color: MUTED,
            textDecoration: 'line-through',
            textDecorationColor: 'rgba(26,26,26,0.35)',
          }}
        >
          {change.from === null ? '—' : money(change.from)}
        </span>
        <ArrowRight size={14} style={{ color: GOLD, flexShrink: 0 }} />
        <span
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: '24px',
            fontWeight: 500,
            color: INK,
          }}
        >
          {money(change.to)}
        </span>
        {change.from !== null && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: rose ? '#8A6B2E' : '#4A6B4A',
              whiteSpace: 'nowrap',
            }}
          >
            {rose ? '+' : ''}
            {(((change.to - change.from) / change.from) * 100).toFixed(0)}%
          </span>
        )}
        {promotional && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#8A6B2E',
              background: 'rgba(197,160,89,0.16)',
              padding: '3px 7px',
              borderRadius: 2,
            }}
          >
            <Tag size={10} />
            Sale price
          </span>
        )}
      </div>

      {promotional && change.promo && (
        <div style={{ fontSize: '11.5px', color: BODY, marginTop: 7, lineHeight: 1.55 }}>
          Promotion running when this was read: {change.promo.signals.join(' · ')}
          {change.promo.listPriceShown !== null &&
          change.promo.listPriceShown !== undefined
            ? `. Vendor showed ${money(change.promo.listPriceShown)} as the list price.`
            : '.'}{' '}
          Expect this to revert when the sale ends.
        </div>
      )}

      {change.note && (
        <p style={{ fontSize: '12.5px', color: BODY, lineHeight: 1.6, margin: '7px 0 0' }}>
          {change.note}
        </p>
      )}

      <a
        href={change.source}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="svc"
        style={{ fontSize: '11px', marginTop: 7, display: 'inline-flex' }}
      >
        Source <ExternalLink size={11} />
      </a>
    </div>
  );
};

/** Changes grouped under the audit that found them. */
const ChangesPage: React.FC = () => {
  const dates = changeDates();

  if (!dates.length) {
    return (
      <div
        style={{
          background: CARD,
          border: `1px solid ${RULE}`,
          borderRadius: 6,
          padding: '40px 28px',
          textAlign: 'center',
        }}
      >
        <CheckCircle2 size={22} style={{ color: GOLD, marginBottom: 12 }} />
        <p style={{ fontSize: '15px', color: INK, margin: '0 0 6px', fontWeight: 500 }}>
          Nothing has moved.
        </p>
        <p style={{ fontSize: '13px', color: BODY, margin: 0, lineHeight: 1.6 }}>
          The last audit found every published price still live at its source. No prices
          changed, so there is nothing to report.
        </p>
      </div>
    );
  }

  return (
    <>
      {dates.map((date) => {
        const rows = changesOn(date);
        const promos = rows.filter(isPromotional).length;
        return (
          <section key={date} style={{ marginBottom: 26 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                flexWrap: 'wrap',
                paddingBottom: 9,
                borderBottom: `2px solid ${INK}`,
                marginBottom: 4,
              }}
            >
              <h3
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  margin: 0,
                  color: INK,
                }}
              >
                {longDate(date)}
              </h3>
              <span style={{ fontSize: '11.5px', color: MUTED }}>
                {rows.length} {rows.length === 1 ? 'change' : 'changes'}
                {promos > 0 && ` · ${promos} tied to a sale`}
              </span>
            </div>
            <div
              className="compare-card"
              style={{ padding: '4px 20px 8px', borderRadius: 6 }}
            >
              {rows.map((c, i) => (
                <ChangeRow key={`${c.vendor}-${c.field}-${i}`} change={c} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
};

const FindingCard: React.FC<{ finding: Finding }> = ({ finding }) => {
  const Icon = FINDING_ICONS[finding.kind];
  const isCorrection = finding.kind === 'correction';

  return (
    <article
      className="compare-card"
      style={{
        padding: '22px 24px',
        marginBottom: 18,
        borderLeft: isCorrection ? `3px solid ${GOLD}` : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        <span style={{ color: isCorrection ? '#8A6B2E' : GOLD, display: 'flex' }}>
          <Icon size={14} />
        </span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: isCorrection ? '#8A6B2E' : MUTED,
            background: isCorrection ? 'rgba(197,160,89,0.16)' : 'rgba(26,26,26,0.06)',
            padding: '2px 6px',
            borderRadius: 2,
          }}
        >
          {FINDING_LABELS[finding.kind]}
        </span>
        <span style={{ fontSize: '11.5px', color: MUTED }}>{longDate(finding.date)}</span>
        {finding.vendors.length > 0 && (
          <span style={{ fontSize: '11.5px', color: MUTED }}>
            · {finding.vendors.join(', ')}
          </span>
        )}
      </div>

      <h3
        style={{
          fontFamily: "'Newsreader', serif",
          fontSize: '21px',
          fontWeight: 600,
          margin: '0 0 10px',
          color: INK,
          letterSpacing: '-0.012em',
          lineHeight: 1.25,
        }}
      >
        {finding.title}
      </h3>

      {finding.body.map((para, i) => (
        <p
          key={i}
          style={{ fontSize: '13.5px', color: BODY, lineHeight: 1.68, margin: '0 0 10px' }}
        >
          {para}
        </p>
      ))}

      {finding.sources && finding.sources.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${RULE}`,
          }}
        >
          {finding.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="svc"
              style={{ fontSize: '11px' }}
            >
              {s.label} <ExternalLink size={11} />
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

const FindingsPage: React.FC = () => (
  <>
    {FINDINGS.length === 0 ? (
      <p style={{ fontSize: '13.5px', color: BODY, padding: '30px 0', textAlign: 'center' }}>
        No findings published yet.
      </p>
    ) : (
      FINDINGS.map((f, i) => <FindingCard key={i} finding={f} />)
    )}
  </>
);

export const DispatchView: React.FC = () => {
  const [page, setPage] = useState<'changes' | 'findings'>('changes');
  const audited = lastAudit();
  const promoCount = PRICE_CHANGES.filter(isPromotional).length;

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
        Dispatch
      </h2>
      <p
        style={{
          fontSize: '15px',
          color: BODY,
          maxWidth: 760,
          lineHeight: 1.65,
          margin: '0 0 18px',
        }}
      >
        Prices on this site are audited on a schedule, and every figure that moves is
        recorded here with the source it was read from and whether a sale was running at
        the time. Findings — including our own corrections — are kept on a separate page,
        because what changed and what it means are earned differently.
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
          marginBottom: 24,
        }}
      >
        <CalendarClock size={14} style={{ color: '#8A6B2E', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '12px', color: BODY, lineHeight: 1.6 }}>
          <strong style={{ color: INK }}>How this page is kept.</strong> An automated check
          runs three times a month, the last of them in the final week, and asks a narrow
          question: does every price we publish still appear on the vendor&apos;s own page?
          It never reads a new price off a page and publishes it — a person confirms each
          one first. A quiet month produces no entry.
          {audited && ` Last change recorded ${longDate(audited)}.`}
        </div>
      </div>

      {/* Two pages, kept apart on purpose. */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 22,
          paddingBottom: 14,
          borderBottom: `1px solid ${RULE}`,
        }}
      >
        <button
          type="button"
          className={`tabbtn ${page === 'changes' ? 'on' : ''}`}
          onClick={() => setPage('changes')}
        >
          Changes ({PRICE_CHANGES.length})
        </button>
        <button
          type="button"
          className={`tabbtn ${page === 'findings' ? 'on' : ''}`}
          onClick={() => setPage('findings')}
        >
          Findings ({FINDINGS.length})
        </button>
      </div>

      {page === 'changes' ? (
        <>
          {promoCount > 0 && (
            <p
              style={{
                fontSize: '12.5px',
                color: BODY,
                lineHeight: 1.6,
                background: '#F4F0E8',
                borderRadius: 4,
                padding: '11px 15px',
                margin: '0 0 20px',
              }}
            >
              <strong style={{ color: INK }}>On sale prices.</strong> {promoCount} of the{' '}
              {PRICE_CHANGES.length} changes below were read while a promotion was running,
              and are marked as such. A sale price is not a price cut — it reverts, and the
              renewal figure is what you will actually pay in year two.
            </p>
          )}
          <ChangesPage />
        </>
      ) : (
        <FindingsPage />
      )}
    </div>
  );
};
