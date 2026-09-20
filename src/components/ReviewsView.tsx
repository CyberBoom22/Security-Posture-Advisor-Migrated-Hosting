import React, { useMemo, useState } from 'react';
import {
  Star,
  Smartphone,
  MessageSquare,
  Search,
  ChevronDown,
  ExternalLink,
  Gauge,
  Layers,
  LifeBuoy,
  Lock,
  BadgeCheck,
  Scale,
  Receipt,
  MousePointerClick,
  AlertTriangle,
  Info,
  MoveHorizontal,
} from 'lucide-react';
import {
  COMPANY_REVIEWS,
  CATEGORY_LABELS,
  SCORE_RUBRIC,
  RATINGS_AS_OF,
  resolveScores,
  ratingGap,
  reviewRatio,
  byDivergence,
  GAP_DRIVER_LABELS,
  CAUTION_DRIVERS,
  overallScore,
  CompanyReview,
  ProductCategory,
  ScoreKey,
  AssessedScore,
} from '../reviews';

const GOLD = '#C5A059';
const INK = '#1A1A1A';
const MUTED = '#767064';
const BODY = '#4A4A4A';
const CARD = '#FFFDF9';
const RULE = 'rgba(26, 26, 26, 0.1)';

const SCORE_ICONS: Record<ScoreKey, React.ComponentType<{ size?: number }>> = {
  ui: MousePointerClick,
  speed: Gauge,
  platforms: Layers,
  support: LifeBuoy,
  encryption: Lock,
  audit: BadgeCheck,
  jurisdiction: Scale,
  billing: Receipt,
};

const nf = new Intl.NumberFormat('en-US');

/** Five stars with a precise partial fill, so 4.84 does not render as 5. */
const StarRow: React.FC<{ value: number | null; size?: number }> = ({
  value,
  size = 13,
}) => {
  if (value === null) {
    return (
      <div style={{ display: 'flex', gap: 2, opacity: 0.25 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} color={MUTED} />
        ))}
      </div>
    );
  }
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} color="rgba(26,26,26,0.18)" />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${pct}%`,
          overflow: 'hidden',
          display: 'flex',
          gap: 2,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} color={GOLD} fill={GOLD} style={{ flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
};

/** A 1-5 category score as five discrete blocks. */
const ScoreBlocks: React.FC<{ score: number | null }> = ({ score }) => (
  <div style={{ display: 'flex', gap: 3 }} aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        style={{
          width: 16,
          height: 6,
          borderRadius: 1,
          background:
            score !== null && i <= score ? GOLD : 'rgba(26, 26, 26, 0.1)',
        }}
      />
    ))}
  </div>
);

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

/**
 * The centrepiece: the same company measured by two systems that are not
 * measuring the same thing, with the distance between them stated outright.
 */
const RatingFaceoff: React.FC<{ company: CompanyReview }> = ({ company }) => {
  const gap = ratingGap(company);
  const { appStore, trustpilot } = company;

  const Side: React.FC<{
    platform: string;
    icon: React.ReactNode;
    measures: string;
    score: number | null;
    count: number | null;
    countNoun: string;
    url: string;
    subtitle: string;
    unavailable?: string;
  }> = ({ platform, icon, measures, score, count, countNoun, url, subtitle, unavailable }) => (
    <div style={{ flex: '1 1 210px', minWidth: 0, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <span style={{ color: GOLD, display: 'flex' }}>{icon}</span>
        <Label>{platform}</Label>
      </div>

      {score === null ? (
        <>
          <div
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '30px',
              color: 'rgba(26,26,26,0.3)',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            n/a
          </div>
          <div style={{ fontSize: '11.5px', color: BODY, lineHeight: 1.55 }}>
            {unavailable}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: "'Newsreader', 'Fraunces', serif",
                fontSize: '40px',
                fontWeight: 500,
                lineHeight: 1,
                color: INK,
              }}
            >
              {score.toFixed(2).replace(/0$/, '')}
            </span>
            <span style={{ fontSize: '12px', color: MUTED }}>/ 5</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <StarRow value={score} />
          </div>
          <div style={{ fontSize: '11.5px', color: BODY, marginBottom: 10 }}>
            {count !== null ? nf.format(count) : '—'} {countNoun}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: MUTED,
              lineHeight: 1.5,
              paddingTop: 9,
              borderTop: `1px solid ${RULE}`,
            }}
          >
            <strong style={{ color: BODY }}>Measures:</strong> {measures}
            <br />
            {subtitle}
          </div>
        </>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="svc"
        style={{ fontSize: '11px', marginTop: 10, display: 'inline-flex' }}
      >
        View source <ExternalLink size={11} />
      </a>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        border: `1px solid ${RULE}`,
        borderRadius: 5,
        background: '#FDFBF6',
        overflow: 'hidden',
      }}
    >
      <Side
        platform="App Store"
        icon={<Smartphone size={13} />}
        measures="the iOS app"
        score={appStore.score}
        count={appStore.reviewCount}
        countNoun="ratings"
        url={appStore.url}
        subtitle={appStore.appName}
      />

      {/* The gap is the actual finding, so it gets the middle of the panel. */}
      <div
        className="faceoff-gap"
        style={{
          // flex sizing lives in index.css: an inline value here would win the
          // cascade and defeat the mobile rule that makes this full-width.
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 12px',
          background: gap !== null && Math.abs(gap) >= 1 ? 'rgba(197,160,89,0.1)' : 'transparent',
        }}
      >
        <Label color={gap !== null && Math.abs(gap) >= 1 ? '#8A6B2E' : MUTED}>Gap</Label>
        <div
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: '25px',
            fontWeight: 500,
            color: gap === null ? 'rgba(26,26,26,0.3)' : gap >= 1 ? '#8A6B2E' : INK,
            lineHeight: 1.1,
            marginTop: 6,
          }}
        >
          {gap === null ? '—' : `${gap > 0 ? '+' : ''}${gap.toFixed(2)}`}
        </div>
        <div
          style={{
            fontSize: '9.5px',
            color: MUTED,
            textAlign: 'center',
            marginTop: 5,
            lineHeight: 1.4,
          }}
        >
          {gap === null
            ? 'not comparable'
            : gap > 0
              ? 'app rated higher'
              : 'company rated higher'}
        </div>
      </div>

      <Side
        platform="Trustpilot"
        icon={<MessageSquare size={13} />}
        measures="the company"
        score={trustpilot.score}
        count={trustpilot.reviewCount}
        countNoun="reviews"
        url={trustpilot.url}
        subtitle="Billing, support and cancellation dominate."
        unavailable={trustpilot.unavailableReason}
      />
    </div>
  );
};

/** One category score with its evidence revealed on demand. */
const ScoreRow: React.FC<{ scoreKey: ScoreKey; value: AssessedScore }> = ({
  scoreKey,
  value,
}) => {
  const [open, setOpen] = useState(false);
  const meta = SCORE_RUBRIC.find((r) => r.key === scoreKey)!;
  const Icon = SCORE_ICONS[scoreKey];

  return (
    <div style={{ borderBottom: `1px solid rgba(26,26,26,0.06)` }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 2px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        <span style={{ color: MUTED, display: 'flex', flexShrink: 0 }}>
          <Icon size={13} />
        </span>
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: INK,
            flex: 1,
            minWidth: 0,
          }}
        >
          {meta.label}
          {meta.method === 'computed' && (
            <span
              style={{
                marginLeft: 7,
                fontSize: '8.5px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#8A6B2E',
                background: 'rgba(197,160,89,0.16)',
                padding: '2px 5px',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}
            >
              Computed
            </span>
          )}
        </span>
        <ScoreBlocks score={value.score} />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: value.score === null ? 'rgba(26,26,26,0.3)' : INK,
            width: 20,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {value.score ?? '—'}
        </span>
        <ChevronDown
          size={13}
          style={{
            color: MUTED,
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.18s ease',
          }}
        />
      </button>
      {open && (
        <div
          style={{
            fontSize: '12px',
            color: BODY,
            lineHeight: 1.6,
            padding: '0 2px 12px 33px',
          }}
        >
          {value.evidence}
          <div style={{ fontSize: '11px', color: MUTED, marginTop: 6, fontStyle: 'italic' }}>
            {meta.anchors}
          </div>
        </div>
      )}
    </div>
  );
};

const CompanyCard: React.FC<{ company: CompanyReview }> = ({ company }) => {
  const scores = resolveScores(company);
  const overall = overallScore(company);
  const usability = SCORE_RUBRIC.filter((r) => r.group === 'usability');
  const security = SCORE_RUBRIC.filter((r) => r.group === 'security');

  return (
    <article
      id={`review-${company.slug}`}
      className="compare-card"
      style={{ padding: '22px 24px', marginBottom: 18, scrollMarginTop: 16 }}
    >
      {/* Identity */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '23px',
              fontWeight: 600,
              margin: 0,
              color: INK,
              letterSpacing: '-0.015em',
            }}
          >
            {company.name}
          </h3>
          <div style={{ fontSize: '11.5px', color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
            {company.parent && company.parent !== company.name && (
              <>Owned by {company.parent} · </>
            )}
            {company.categories.map((c) => CATEGORY_LABELS[c]).join(' · ')}
          </div>
          <div style={{ fontSize: '11.5px', color: BODY, marginTop: 4 }}>
            In this index as: {company.products.join(', ')}
          </div>
        </div>

        {overall !== null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <Label>Assessed overall</Label>
            <div
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '28px',
                fontWeight: 500,
                color: INK,
                lineHeight: 1.1,
              }}
            >
              {overall.toFixed(1)}
              <span style={{ fontSize: '13px', color: MUTED }}> / 5</span>
            </div>
          </div>
        )}
      </div>

      <RatingFaceoff company={company} />

      {/* Why the two disagree */}
      <div
        style={{
          display: 'flex',
          gap: 9,
          marginTop: 14,
          padding: '12px 14px',
          background: '#F4F0E8',
          borderLeft: `3px solid ${GOLD}`,
          borderRadius: 3,
        }}
      >
        <Info size={14} style={{ color: '#8A6B2E', flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '12.5px', color: BODY, lineHeight: 1.6, margin: 0 }}>
          {company.divergenceNote}
        </p>
      </div>

      {/* Category scores */}
      <div className="two-col" style={{ marginTop: 18, gap: 24 }}>
        <div>
          <div style={{ marginBottom: 6 }}>
            <Label color={GOLD}>Usability</Label>
          </div>
          {usability.map((r) => (
            <ScoreRow key={r.key} scoreKey={r.key} value={scores[r.key]} />
          ))}
        </div>
        <div>
          <div style={{ marginBottom: 6 }}>
            <Label color={GOLD}>Security &amp; Cost Integrity</Label>
          </div>
          {security.map((r) => (
            <ScoreRow key={r.key} scoreKey={r.key} value={scores[r.key]} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: '10.5px', color: MUTED, marginTop: 12, fontStyle: 'italic' }}>
        Tap any category to see the evidence behind the score.
      </div>
    </article>
  );
};

/** How the two platforms build a number, stated plainly and side by side. */
const SystemsExplainer: React.FC = () => {
  const col = (
    icon: React.ReactNode,
    name: string,
    rows: [string, string][]
  ) => (
    <div
      style={{
        flex: '1 1 300px',
        minWidth: 0,
        background: CARD,
        border: `1px solid ${RULE}`,
        borderRadius: 6,
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ color: GOLD, display: 'flex' }}>{icon}</span>
        <h3
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: '19px',
            fontWeight: 600,
            margin: 0,
            color: INK,
          }}
        >
          {name}
        </h3>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ marginBottom: 11 }}>
          <Label>{k}</Label>
          <div style={{ fontSize: '12.5px', color: BODY, lineHeight: 1.6, marginTop: 3 }}>
            {v}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
      {col(<Smartphone size={17} />, 'The App Store score', [
        ['What it rates', 'One mobile app, on one operating system. Not the desktop client, not the service, not the company.'],
        ['Who can rate', 'Only people who installed the iOS app. A prompt appears inside the app, usually after a successful session.'],
        ['Why it skews high', 'Apple lets developers ask at a moment of their choosing, and people who uninstalled in frustration are rarely still there to be asked. Almost every app in this index sits between 4.5 and 4.9.'],
        ['What it cannot see', 'Renewal pricing, refund disputes, desktop bugs, or anything that happens on a website.'],
      ])}
      {col(<MessageSquare size={17} />, 'The Trustpilot score', [
        ['What it rates', 'The company as a whole — overwhelmingly the billing, support and cancellation experience.'],
        ['Who can rate', 'Anyone, whether or not they were ever a customer. Companies may also pay to send automated review invitations.'],
        ['Why it splits', 'Unsolicited profiles collect mostly angry people, because satisfied customers rarely visit a review site unprompted. Solicited profiles collect a far more representative — and far happier — sample.'],
        ['What it cannot see', 'Whether the software is any good, how fast the VPN is, or whether the encryption holds.'],
      ])}
    </div>
  );
};

/** The whole argument of the page in one sortable list. */
const DivergenceTable: React.FC<{ onJump: (slug: string) => void }> = ({ onJump }) => {
  const rows = byDivergence();

  return (
    <div className="table-scroll-container" style={{ marginBottom: 10 }}>
      <table className="matrix-table">
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">App Store</th>
            <th scope="col">Trustpilot</th>
            <th scope="col">Gap</th>
            <th scope="col">What the gap is made of</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const gap = ratingGap(c)!;
            const wide = Math.abs(gap) >= 1;
            const ratio = reviewRatio(c);
            const caution = CAUTION_DRIVERS.has(c.gapAnatomy.driver);
            return (
              <tr key={c.slug}>
                <td className="name">
                  <button
                    type="button"
                    onClick={() => onJump(c.slug)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: INK,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationColor: GOLD,
                      textUnderlineOffset: 3,
                    }}
                  >
                    {c.name}
                  </button>
                </td>
                <td>
                  {c.appStore.score?.toFixed(2)}
                  <span style={{ color: MUTED, fontSize: '11px' }}>
                    {' '}
                    ({nf.format(c.appStore.reviewCount ?? 0)})
                  </span>
                </td>
                <td>
                  {c.trustpilot.score?.toFixed(1)}
                  <span style={{ color: MUTED, fontSize: '11px' }}>
                    {' '}
                    ({nf.format(c.trustpilot.reviewCount ?? 0)})
                  </span>
                </td>
                <td
                  style={{
                    fontWeight: 700,
                    color: wide ? '#8A6B2E' : INK,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {wide && <AlertTriangle size={11} style={{ marginRight: 4 }} />}
                  {gap > 0 ? '+' : ''}
                  {gap.toFixed(2)}
                </td>
                <td style={{ whiteSpace: 'normal', minWidth: 300, fontSize: '12px', color: BODY }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      flexWrap: 'wrap',
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '8.5px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        padding: '2px 6px',
                        borderRadius: 2,
                        color: caution ? '#8A6B2E' : MUTED,
                        background: caution
                          ? 'rgba(197,160,89,0.16)'
                          : 'rgba(26,26,26,0.06)',
                      }}
                    >
                      {GAP_DRIVER_LABELS[c.gapAnatomy.driver]}
                    </span>
                    {ratio !== null && (
                      <span
                        style={{ fontSize: '10.5px', color: MUTED, whiteSpace: 'nowrap' }}
                        title="App Store ratings per Trustpilot review"
                      >
                        {ratio < 1
                          ? `1 : ${(1 / ratio).toFixed(1)} sample`
                          : `${ratio.toFixed(1)} : 1 sample`}
                      </span>
                    )}
                  </div>
                  <div style={{ lineHeight: 1.55 }}>{c.gapAnatomy.detail}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const ReviewsView: React.FC = () => {
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPANY_REVIEWS.filter((c) => {
      const matchesCat = filter === 'all' || c.categories.includes(filter);
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.parent ?? '').toLowerCase().includes(q) ||
        c.products.some((p) => p.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [filter, query]);

  const jump = (slug: string) => {
    // Clear any filter that would keep the target card unmounted.
    setFilter('all');
    setQuery('');
    window.requestAnimationFrame(() => {
      document
        .getElementById(`review-${slug}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const filters: { key: ProductCategory | 'all'; label: string }[] = [
    { key: 'all', label: `All (${COMPANY_REVIEWS.length})` },
    ...(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((k) => ({
      key: k,
      label: `${CATEGORY_LABELS[k]} (${COMPANY_REVIEWS.filter((c) => c.categories.includes(k)).length})`,
    })),
  ];

  return (
    <div
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '32px 24px 60px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Intro */}
      <div style={{ marginBottom: 22 }}>
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
          Two scores, one company, no agreement
        </h2>
        <p style={{ fontSize: '15px', color: BODY, maxWidth: 760, lineHeight: 1.65, margin: 0 }}>
          Every vendor in this index carries two public ratings that routinely contradict
          each other. Proton scores 4.84 on the App Store and 2.2 on Trustpilot. McAfee
          scores 4.72 and 1.3. Neither platform is lying; they are measuring different
          things, and the distance between them is often more informative than either
          number by itself. Below, both are shown side by side for all{' '}
          {COMPANY_REVIEWS.length} companies, followed by eight categories we score
          ourselves — because the thing you actually want to know, whether the product is
          good and whether the price is honest, is something neither platform measures.
        </p>
      </div>

      {/* Provenance */}
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
        <Scale size={14} style={{ color: '#8A6B2E', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '12px', color: BODY, lineHeight: 1.6 }}>
          <strong style={{ color: INK }}>Where these numbers come from.</strong> App Store
          figures are read directly from Apple&apos;s public lookup API and were last
          refreshed on {RATINGS_AS_OF}. Trustpilot figures were transcribed by hand on the
          same date, because Trustpilot publishes no API covering companies you do not own.
          Every figure links to its source so you can check it. The eight category scores
          are our own editorial assessment against a published rubric — two of them are
          computed directly from this site&apos;s pricing and jurisdiction research rather
          than judged. Still no affiliate links, and no vendor has seen this page.
        </div>
      </div>

      {/* Side-by-side explainer */}
      <h3
        style={{
          fontFamily: "'Newsreader', serif",
          fontSize: '22px',
          fontWeight: 500,
          margin: '0 0 12px',
          color: INK,
        }}
      >
        How the two ranking systems actually work
      </h3>
      <SystemsExplainer />

      <div
        style={{
          fontSize: '12.5px',
          color: BODY,
          lineHeight: 1.65,
          background: '#F4F0E8',
          borderRadius: 4,
          padding: '13px 16px',
          marginBottom: 34,
        }}
      >
        <strong style={{ color: INK }}>The trap this creates.</strong> A zero-knowledge
        provider cannot reset your password, because it does not hold the key — that is the
        entire security guarantee. But every locked-out user becomes a one-star Trustpilot
        review about support. Proton, Bitwarden and Mullvad are penalised on Trustpilot
        precisely for the property that earns them a 5 in Encryption Architecture below.
        Meanwhile TotalAV, which runs one of the steepest renewal multipliers in this index,
        holds the largest and one of the highest-rated Trustpilot profiles here. Read a
        TrustScore as a measure of how diligently a company collects reviews, not of how
        well it will treat you.
      </div>

      {/* Divergence leaderboard */}
      <h3
        style={{
          fontFamily: "'Newsreader', serif",
          fontSize: '22px',
          fontWeight: 500,
          margin: '0 0 6px',
          color: INK,
        }}
      >
        Ranked by disagreement
      </h3>
      <p style={{ fontSize: '13.5px', color: BODY, margin: '0 0 12px', maxWidth: 720, lineHeight: 1.6 }}>
        The widest gaps sit at the top. A gap above one full point almost always means the
        software is fine and the commercial relationship is not. The sample figure is App
        Store ratings per Trustpilot review, and it is the most diagnostic number here:
        a vendor that solicits reviews collects a Trustpilot sample proportionally close to
        its app&apos;s, while a vendor that never asks collects only the aggrieved minority.
        Select a company to jump to its full breakdown.
      </p>
      <div className="table-scroll-hint" style={{ marginBottom: 8 }}>
        <MoveHorizontal size={12} /> Scroll the table sideways
      </div>
      <DivergenceTable onJump={jump} />
      <p style={{ fontSize: '11.5px', color: MUTED, margin: '0 0 34px', fontStyle: 'italic' }}>
        Microsoft Defender is absent from this table: it has no product-level Trustpilot
        profile, so there is nothing to compare against.
      </p>

      {/* Navigation */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: '#F9F7F2',
          paddingTop: 14,
          paddingBottom: 12,
          marginBottom: 6,
          borderBottom: `1px solid ${RULE}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`tabbtn ${filter === f.key ? 'on' : ''}`}
                style={{ fontSize: '10px', padding: '7px 12px', letterSpacing: '0.12em' }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              border: `1px solid ${RULE}`,
              background: CARD,
              borderRadius: 4,
              padding: '7px 11px',
              minWidth: 190,
            }}
          >
            <Search size={13} style={{ color: MUTED, flexShrink: 0 }} />
            <span className="visually-hidden">Search companies</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company or product"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                font: 'inherit',
                fontSize: '12.5px',
                color: INK,
                width: '100%',
                minWidth: 0,
              }}
            />
          </label>
        </div>
      </div>

      {/* Company breakdowns */}
      <div style={{ marginTop: 18 }}>
        {visible.length === 0 ? (
          <p style={{ fontSize: '13.5px', color: BODY, padding: '30px 0', textAlign: 'center' }}>
            No company matches that filter. Clear the search to see all{' '}
            {COMPANY_REVIEWS.length}.
          </p>
        ) : (
          visible.map((c) => <CompanyCard key={c.slug} company={c} />)
        )}
      </div>

      {/* Rubric */}
      <h3
        style={{
          fontFamily: "'Newsreader', serif",
          fontSize: '22px',
          fontWeight: 500,
          margin: '34px 0 6px',
          color: INK,
        }}
      >
        How we score the eight categories
      </h3>
      <p style={{ fontSize: '13.5px', color: BODY, margin: '0 0 16px', maxWidth: 740, lineHeight: 1.6 }}>
        A score with no published rubric is an opinion wearing a number. Here is ours.
        Categories marked <em>computed</em> are not judgements at all — they are derived
        from the pricing and jurisdiction data published elsewhere on this site, so they
        move automatically when that research is updated.
      </p>
      <div className="two-col" style={{ gap: 16 }}>
        {SCORE_RUBRIC.map((r) => {
          const Icon = SCORE_ICONS[r.key];
          return (
            <div
              key={r.key}
              style={{
                background: CARD,
                border: `1px solid ${RULE}`,
                borderRadius: 5,
                padding: '15px 17px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ color: GOLD, display: 'flex' }}>
                  <Icon size={14} />
                </span>
                <strong style={{ fontSize: '13.5px', color: INK }}>{r.label}</strong>
                <span
                  style={{
                    fontSize: '8.5px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: r.method === 'computed' ? '#8A6B2E' : MUTED,
                    background:
                      r.method === 'computed' ? 'rgba(197,160,89,0.16)' : 'rgba(26,26,26,0.06)',
                    padding: '2px 5px',
                    borderRadius: 2,
                  }}
                >
                  {r.method}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: INK, marginBottom: 5, fontWeight: 500 }}>
                {r.question}
              </div>
              <div style={{ fontSize: '12px', color: BODY, lineHeight: 1.6 }}>{r.anchors}</div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontSize: '11.5px',
          color: MUTED,
          lineHeight: 1.65,
          marginTop: 22,
          paddingTop: 16,
          borderTop: `1px solid ${RULE}`,
        }}
      >
        App Store ratings are the property of Apple and its reviewers; TrustScores are the
        property of Trustpilot and its reviewers. Both are reproduced here as short factual
        citations with attribution and a link to the source, for comparison and commentary.
        Neither company endorses this page. Ratings move daily — follow any source link for
        the live figure.
      </p>
    </div>
  );
};
