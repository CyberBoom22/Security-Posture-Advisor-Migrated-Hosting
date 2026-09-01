import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Globe,
  Bug,
  Users,
  Check,
  X,
  Minus,
  AlertTriangle,
  ExternalLink,
  Info,
  MoveHorizontal,
  Scale,
  Building2,
  Lock,
} from 'lucide-react';
import {
  PW_MANAGERS,
  SUITES,
  VPN_COMPARE,
  AV_COMPARE,
  PWManager,
  Suite,
  VPNCompareItem,
  AVCompareItem,
  JurisdictionInfo,
} from '../data';
import {
  JurisdictionBadge,
  LegalImpactCard,
  JurisdictionModal,
  UserRegion,
} from './JurisdictionDetails';
import { JurisdictionMatrixView } from './JurisdictionMatrixView';

// Shared Section Intro
const SectionIntro: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => (
  <div style={{ marginBottom: 24 }}>
    <h2
      style={{
        fontFamily: "'Newsreader', 'Spectral', serif",
        fontSize: '26px',
        fontWeight: 500,
        margin: '0 0 8px',
        color: '#1A1A1A',
        letterSpacing: '-0.015em',
      }}
    >
      {title}
    </h2>
    <p
      style={{
        fontSize: '14.5px',
        color: '#4A4A4A',
        maxWidth: 720,
        lineHeight: 1.6,
        margin: 0,
      }}
    >
      {body}
    </p>
  </div>
);

// Shared Plan Toggle
const PlanToggle: React.FC<{
  plan: 'family' | 'indiv';
  setPlan: (p: 'family' | 'indiv') => void;
}> = ({ plan, setPlan }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
      flexWrap: 'wrap',
    }}
  >
    <span
      style={{
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#C5A059',
      }}
    >
      TIER FILTER:
    </span>
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        className={`tabbtn ${plan === 'family' ? 'on' : ''}`}
        onClick={() => setPlan('family')}
        style={
          plan === 'family'
            ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: '#F9F7F2' }
            : {}
        }
      >
        <Users size={14} />
        <span>Family / Multi-Seat</span>
      </button>
      <button
        type="button"
        className={`tabbtn ${plan === 'indiv' ? 'on' : ''}`}
        onClick={() => setPlan('indiv')}
        style={
          plan === 'indiv'
            ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: '#F9F7F2' }
            : {}
        }
      >
        <Users size={14} />
        <span>Individual / Solo</span>
      </button>
    </div>
  </div>
);

// Shared Takeaway Box
const TakeawayBox: React.FC<{
  items: { label: string; body: string }[];
}> = ({ items }) => (
  <div
    style={{
      background: '#1A1A1A',
      borderRadius: 4,
      padding: '24px 28px',
      marginTop: 24,
      color: '#F9F7F2',
    }}
  >
    <div
      style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: '#C5A059',
        marginBottom: 4,
      }}
    >
      Editorial Verdict
    </div>
    <h3
      style={{
        fontFamily: "'Newsreader', 'Spectral', serif",
        fontSize: '22px',
        fontWeight: 500,
        color: '#F9F7F2',
        margin: '0 0 16px',
        letterSpacing: '-0.01em',
      }}
    >
      Key Takeaways & Architecture Notes
    </h3>
    <div className="two-col" style={{ gap: '16px 28px' }}>
      {items.map((item, idx) => (
        <div key={idx}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C5A059',
              marginBottom: 4,
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontSize: '13.5px',
              color: '#E8E4DB',
              lineHeight: 1.55,
            }}
          >
            {item.body}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Shared YesNo cell helper
const YesNo: React.FC<{ v: boolean | string | null | undefined }> = ({ v }) => {
  if (v === true) return <Check size={16} color="#1E7A46" />;
  if (v === false) return <X size={16} color="#C4472E" />;
  if (typeof v === 'string') {
    return <span style={{ fontSize: 12.5, color: '#6B5B4A' }}>{v}</span>;
  }
  return <Minus size={16} color="#B0A896" />;
};

export const CompareView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'pw' | 'suite' | 'vpn' | 'av' | 'jurisdiction'
  >('pw');
  const [pwPlan, setPwPlan] = useState<'family' | 'indiv'>('family');
  const [suitePlan, setSuitePlan] = useState<'family' | 'indiv'>('family');
  const [userRegion, setUserRegion] = useState<UserRegion>('us');
  const [selectedDossier, setSelectedDossier] = useState<{
    name: string;
    info: JurisdictionInfo;
  } | null>(null);

  return (
    <div
      style={{
        background: '#F9F7F2',
        paddingTop: 36,
        paddingBottom: 72,
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        color: '#1A1A1A',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#C5A059',
              marginBottom: 8,
            }}
          >
            Section II // Architectural Comparisons & Audits
          </div>
          <h1
            style={{
              fontFamily: "'Newsreader', 'Spectral', serif",
              fontSize: '42px',
              fontWeight: 500,
              margin: '0 0 12px',
              color: '#1A1A1A',
              lineHeight: 1.12,
              letterSpacing: '-0.025em',
            }}
          >
            Comparative Feature, Cost & Legal Jurisdiction Analysis
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#4A4A4A',
              maxWidth: 720,
              lineHeight: 1.6,
              margin: 0,
              fontFamily: "'Newsreader', 'Spectral', serif",
              fontStyle: 'italic',
            }}
          >
            Unvarnished technical assessments across standalone password managers, privacy VPNs, endpoint agents, and all-in-one security suites. Complete country of origin, corporate headquarters, surveillance alliance status, and extraterritorial subpoena reach evaluated for your location.
          </p>
        </div>

        {/* Global User Location / Legal Perspective Toggle Bar */}
        <div
          style={{
            background: '#F2EDE2',
            border: '1px solid #E2D9C8',
            borderRadius: 6,
            padding: '12px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scale size={16} color="#8A6A1E" />
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#8A6A1E',
                }}
              >
                USER LOCATION LEGAL AUDIT PERSPECTIVE:
              </div>
              <div style={{ fontSize: '13px', color: '#2A2118', fontWeight: 500 }}>
                Adjusting legal frameworks & subpoena risks for:{' '}
                <strong>
                  {userRegion === 'us'
                    ? '🇺🇸 United States Resident'
                    : userRegion === 'eu'
                    ? '🇪🇺 EU / EEA Citizen'
                    : '🌐 International / Global User'}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`tabbtn ${userRegion === 'us' ? 'on' : ''}`}
              onClick={() => setUserRegion('us')}
              style={
                userRegion === 'us'
                  ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: '#F9F7F2', padding: '6px 12px' }
                  : { background: '#FFFFFF', borderColor: '#DCD4C4', padding: '6px 12px' }
              }
            >
              <span>🇺🇸 US Resident</span>
            </button>
            <button
              type="button"
              className={`tabbtn ${userRegion === 'eu' ? 'on' : ''}`}
              onClick={() => setUserRegion('eu')}
              style={
                userRegion === 'eu'
                  ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: '#F9F7F2', padding: '6px 12px' }
                  : { background: '#FFFFFF', borderColor: '#DCD4C4', padding: '6px 12px' }
              }
            >
              <span>🇪🇺 EU / EEA</span>
            </button>
            <button
              type="button"
              className={`tabbtn ${userRegion === 'global' ? 'on' : ''}`}
              onClick={() => setUserRegion('global')}
              style={
                userRegion === 'global'
                  ? { background: '#1A1A1A', borderColor: '#1A1A1A', color: '#F9F7F2', padding: '6px 12px' }
                  : { background: '#FFFFFF', borderColor: '#DCD4C4', padding: '6px 12px' }
              }
            >
              <span>🌐 Global</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className={`tabbtn ${activeTab === 'pw' ? 'on' : ''}`}
            onClick={() => setActiveTab('pw')}
          >
            <KeyRound size={17} />
            <span>Password managers</span>
          </button>
          <button
            type="button"
            className={`tabbtn ${activeTab === 'suite' ? 'on' : ''}`}
            onClick={() => setActiveTab('suite')}
          >
            <ShieldCheck size={17} />
            <span>All-in-one suites</span>
          </button>
          <button
            type="button"
            className={`tabbtn ${activeTab === 'vpn' ? 'on' : ''}`}
            onClick={() => setActiveTab('vpn')}
          >
            <Globe size={17} />
            <span>VPNs</span>
          </button>
          <button
            type="button"
            className={`tabbtn ${activeTab === 'av' ? 'on' : ''}`}
            onClick={() => setActiveTab('av')}
          >
            <Bug size={17} />
            <span>Antivirus</span>
          </button>
          <button
            type="button"
            className={`tabbtn ${activeTab === 'jurisdiction' ? 'on' : ''}`}
            onClick={() => setActiveTab('jurisdiction')}
            style={
              activeTab === 'jurisdiction'
                ? { background: '#8A6A1E', borderColor: '#8A6A1E', color: '#FFFFFF' }
                : {}
            }
          >
            <Scale size={17} />
            <span>Jurisdiction & Legal Matrix</span>
          </button>
        </div>

        {/* TAB 1: PASSWORD MANAGERS */}
        {activeTab === 'pw' && (
          <div>
            <SectionIntro
              title="Standalone password managers"
              body="These do one job — store, generate, and share credentials — and do it better than the password tools bundled into suites. Price differences are small; the real decision is free-tier quality, household seat limits, and whether you want open-source verifiability."
            />

            <PlanToggle plan={pwPlan} setPlan={setPwPlan} />

            {/* Product Cards */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {PW_MANAGERS.map((m: PWManager) => {
                const intro =
                  pwPlan === 'family' ? m.price.familyIntro : m.price.indivIntro;
                const renew =
                  pwPlan === 'family' ? m.price.familyRenew : m.price.indivRenew;
                const isDifferent = intro !== renew;

                return (
                  <div
                    key={m.name}
                    className="compare-card"
                    style={{ padding: '18px 20px' }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginBottom: 4,
                          }}
                        >
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="svc"
                            style={{ fontSize: 18 }}
                          >
                            <span>{m.name}</span>
                            <ExternalLink size={14} />
                          </a>
                          <JurisdictionBadge
                            info={m.jurisdiction}
                            onClick={() =>
                              setSelectedDossier({ name: m.name, info: m.jurisdiction })
                            }
                          />
                          {m.openSource && (
                            <span
                              className="pill"
                              style={{ background: '#E4F0E8', color: '#1E7A46' }}
                            >
                              Open source
                            </span>
                          )}
                          {m.price.free && (
                            <span
                              className="pill"
                              style={{ background: '#EAE4F2', color: '#5B3E8E' }}
                            >
                              Free tier
                            </span>
                          )}
                          {m.audited && (
                            <span
                              className="pill"
                              style={{ background: '#F0EAD8', color: '#8A6A1E' }}
                            >
                              Audited
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13.5, color: '#6B5B4A' }}>
                          {m.tagline}
                        </div>
                      </div>

                      {/* Right aligned pricing */}
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: "'Spectral', serif",
                            fontSize: 21,
                            fontWeight: 700,
                            color: '#2A2118',
                          }}
                        >
                          ${intro}/yr {pwPlan === 'family' ? 'family' : 'solo'}
                        </div>
                        <div style={{ fontSize: 12.5 }}>
                          {isDifferent ? (
                            <span
                              style={{ color: '#B5462A', fontWeight: 600 }}
                            >
                              then ${renew}/yr at renewal
                            </span>
                          ) : (
                            <span
                              style={{ color: '#1E7A46', fontWeight: 600 }}
                            >
                              same price at renewal
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#9A8A76',
                            marginTop: 2,
                          }}
                        >
                          {pwPlan === 'family'
                            ? `${m.price.familySeats} seats · solo from $${m.price.indivIntro}/yr`
                            : `1 person · family (${m.price.familySeats} seats) from $${m.price.familyIntro}/yr`}
                        </div>
                        {pwPlan === 'family' && (
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              marginTop: 2,
                              color: m.price.adultCap ? '#8A6A1E' : '#1E7A46',
                            }}
                          >
                            {m.price.adultCap
                              ? `⚠ ${m.price.adultCap}-adult cap — kids fill remaining seats`
                              : `no adult/child split — any ${m.price.familySeats} people`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Strengths & Limitations */}
                    <div
                      className="two-col"
                      style={{
                        gap: '12px 20px',
                        paddingTop: 12,
                        borderTop: '1px solid #EDE5D4',
                      }}
                    >
                      <div>
                        <div className="grid-h" style={{ marginBottom: 6 }}>
                          Strengths
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                          }}
                        >
                          {m.strengths.map((str, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 6,
                                fontSize: 13.5,
                                color: '#3A3025',
                              }}
                            >
                              <Check
                                size={15}
                                color="#1E7A46"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="grid-h" style={{ marginBottom: 6 }}>
                          Limitations
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                          }}
                        >
                          {m.limits.map((lim, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 6,
                                fontSize: 13.5,
                                color: '#3A3025',
                              }}
                            >
                              <AlertTriangle
                                size={14}
                                color="#B5462A"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <span>{lim}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Legal Jurisdiction & Location Impact Card */}
                    <LegalImpactCard
                      serviceName={m.name}
                      info={m.jurisdiction}
                      userRegion={userRegion}
                    />
                  </div>
                );
              })}
            </div>

            {/* Matrix Table */}
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: '#C5A059',
                      marginBottom: 3,
                    }}
                  >
                    Feature & Price Audit
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '22px',
                      fontWeight: 500,
                      margin: 0,
                      color: '#1A1A1A',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    Feature & price matrix —{' '}
                    {pwPlan === 'family' ? 'family' : 'individual'} plans
                  </h3>
                </div>
                <div className="table-scroll-hint">
                  <MoveHorizontal size={13} color="#C5A059" />
                  <span>Scroll sideways to view all columns</span>
                </div>
              </div>

              <div className="table-scroll-container">
                <table className="matrix-table" style={{ minWidth: 880 }}>
                  <thead>
                    <tr>
                      <th>Manager</th>
                      <th>Jurisdiction & HQ</th>
                      <th>Free tier</th>
                      <th>Encryption</th>
                      <th>Open source</th>
                      <th>{pwPlan === 'family' ? 'Family seats' : 'Covers'}</th>
                      {pwPlan === 'family' && <th>Adult cap</th>}
                      <th>Emergency access</th>
                      <th>Intro / yr</th>
                      <th>Renewal / yr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PW_MANAGERS.map((m) => {
                      const intro =
                        pwPlan === 'family'
                          ? m.price.familyIntro
                          : m.price.indivIntro;
                      const renew =
                        pwPlan === 'family'
                          ? m.price.familyRenew
                          : m.price.indivRenew;
                      const isDifferent = intro !== renew;

                      return (
                        <tr key={m.name}>
                          <td className="name">
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="svc"
                            >
                              {m.name}
                            </a>
                          </td>
                          <td>
                            <JurisdictionBadge
                              info={m.jurisdiction}
                              onClick={() =>
                                setSelectedDossier({
                                  name: m.name,
                                  info: m.jurisdiction,
                                })
                              }
                            />
                          </td>
                          <td>
                            {m.freeTierUsable === 'excellent' ||
                            m.freeTierUsable === 'good' ? (
                              <YesNo v={true} />
                            ) : m.freeTierUsable === 'trial only' ||
                              m.freeTierUsable === 'discontinued' ? (
                              <span
                                style={{ fontSize: 12.5, color: '#6B5B4A' }}
                              >
                                {m.freeTierUsable}
                              </span>
                            ) : (
                              <YesNo v={false} />
                            )}
                          </td>
                          <td>{m.encryption}</td>
                          <td>
                            <YesNo v={m.openSource} />
                          </td>
                          <td>
                            {pwPlan === 'family'
                              ? `${m.price.familySeats} seats`
                              : '1 person'}
                          </td>
                          {pwPlan === 'family' && (
                            <td
                              style={{
                                color: m.price.adultCap
                                  ? '#8A6A1E'
                                  : '#1E7A46',
                                fontWeight: 600,
                              }}
                            >
                              {m.price.adultCap
                                ? `${m.price.adultCap} adults`
                                : 'any mix'}
                            </td>
                          )}
                          <td>
                            <YesNo v={m.emergencyAccess} />
                          </td>
                          <td style={{ fontWeight: 600 }}>${intro}/yr</td>
                          <td>
                            {isDifferent ? (
                              <span
                                style={{ color: '#B5462A', fontWeight: 600 }}
                              >
                                ${renew}/yr
                              </span>
                            ) : (
                              <span
                                style={{ color: '#1E7A46', fontWeight: 600 }}
                              >
                                same
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Takeaways */}
            <TakeawayBox
              items={[
                {
                  label: 'Cheapest solid pick',
                  body: 'Bitwarden — $10/yr solo, strong free tier, open-source and audited.',
                },
                {
                  label: 'Best for households',
                  body: '1Password (5 polished seats) or Dashlane (up to 10) if you need more people.',
                },
                {
                  label: 'Watch the adult caps',
                  body: 'NordPass-style bundles host 2 adults; Bitwarden, 1Password, Dashlane & Proton Pass let any mix of ages fill their seats.',
                },
                {
                  label: "Don't overpay for a bundle",
                  body: "A suite's built-in password manager is fine, but a dedicated tool shares and audits better.",
                },
              ]}
            />
          </div>
        )}

        {/* TAB 2: ALL-IN-ONE SUITES */}
        {activeTab === 'suite' && (
          <div>
            <SectionIntro
              title="All-in-one security suites"
              body="Two flavors here: identity-first suites (Aura, Norton, McAfee) that bundle insurance and credit monitoring, and privacy-stack bundles (Surfshark One+, Proton) that trade the insurance layer for stronger privacy tools at lower cost. The common trade-off: each bundled tool is weaker than a dedicated one, and several hit you with a steep renewal increase after year one."
            />

            <PlanToggle plan={suitePlan} setPlan={setSuitePlan} />

            {/* Product Cards */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {SUITES.map((s: Suite) => {
                const intro =
                  suitePlan === 'family'
                    ? s.price.familyIntro
                    : s.price.indivIntro;
                const renew =
                  suitePlan === 'family'
                    ? s.price.familyRenew
                    : s.price.indivRenew;
                const covers =
                  suitePlan === 'family'
                    ? s.price.familyCovers
                    : s.price.indivCovers;
                const isDifferent = intro !== renew;

                return (
                  <div
                    key={s.name}
                    className="compare-card"
                    style={{ padding: '18px 20px' }}
                  >
                    {/* Top Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginBottom: 4,
                          }}
                        >
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="svc"
                            style={{ fontSize: 18 }}
                          >
                            <span>{s.name}</span>
                            <ExternalLink size={14} />
                          </a>
                          <JurisdictionBadge
                            info={s.jurisdiction}
                            onClick={() =>
                              setSelectedDossier({ name: s.name, info: s.jurisdiction })
                            }
                          />
                        </div>
                        {suitePlan === 'indiv' && (
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: '#8A6A1E',
                              marginBottom: 2,
                            }}
                          >
                            Individual tier: {s.price.indivPlan}
                          </div>
                        )}
                        <div style={{ fontSize: 13.5, color: '#6B5B4A' }}>
                          {s.tagline}
                        </div>
                      </div>

                      {/* Right aligned pricing */}
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: "'Spectral', serif",
                            fontSize: 21,
                            fontWeight: 700,
                            color: '#2A2118',
                          }}
                        >
                          ${intro}/yr intro
                        </div>
                        <div style={{ fontSize: 12.5 }}>
                          {isDifferent ? (
                            <span
                              style={{ color: '#B5462A', fontWeight: 600 }}
                            >
                              then ${renew}/yr at renewal
                            </span>
                          ) : (
                            <span
                              style={{ color: '#1E7A46', fontWeight: 600 }}
                            >
                              flat — no renewal hike
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: '#9A8A76',
                            marginTop: 2,
                          }}
                        >
                          {covers}
                        </div>
                        {suitePlan === 'family' && (
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              marginTop: 2,
                              color: s.price.adultCap ? '#8A6A1E' : '#1E7A46',
                            }}
                          >
                            {s.price.adultCap
                              ? `⚠ ${s.price.adultCap}-adult cap · ${s.price.kidsNote}`
                              : `no adult cap — ${s.price.kidsNote}`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inclusion Pill Strip */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 7,
                        flexWrap: 'wrap',
                        margin: '12px 0 10px',
                      }}
                    >
                      {/* Antivirus */}
                      <span
                        className="pill"
                        style={{
                          background: s.includes.antivirus
                            ? '#E4F0E8'
                            : '#F5E4DE',
                          color: s.includes.antivirus ? '#1E7A46' : '#B5462A',
                        }}
                      >
                        Antivirus {s.includes.antivirus ? '✓' : '✗'}
                      </span>
                      {/* VPN */}
                      <span
                        className="pill"
                        style={{
                          background: s.includes.vpn ? '#E4F0E8' : '#F5E4DE',
                          color: s.includes.vpn ? '#1E7A46' : '#B5462A',
                        }}
                      >
                        VPN {s.includes.vpn ? '✓' : '✗'}
                      </span>
                      {/* Password mgr */}
                      <span
                        className="pill"
                        style={{
                          background: s.includes.pwManager
                            ? '#E4F0E8'
                            : '#F5E4DE',
                          color: s.includes.pwManager ? '#1E7A46' : '#B5462A',
                        }}
                      >
                        Password mgr {s.includes.pwManager ? '✓' : '✗'}
                      </span>
                      {/* ID theft */}
                      <span
                        className="pill"
                        style={{
                          background:
                            typeof s.includes.idTheft === 'string'
                              ? '#F0EAD8'
                              : s.includes.idTheft
                              ? '#E4F0E8'
                              : '#F5E4DE',
                          color:
                            typeof s.includes.idTheft === 'string'
                              ? '#8A6A1E'
                              : s.includes.idTheft
                              ? '#1E7A46'
                              : '#B5462A',
                        }}
                      >
                        {typeof s.includes.idTheft === 'string'
                          ? `ID theft: ${s.includes.idTheft}`
                          : `ID theft ${s.includes.idTheft ? '✓' : '✗'}`}
                      </span>
                      {/* Data removal */}
                      <span
                        className="pill"
                        style={{
                          background:
                            typeof s.includes.dataRemoval === 'string'
                              ? '#F0EAD8'
                              : s.includes.dataRemoval
                              ? '#E4F0E8'
                              : '#F5E4DE',
                          color:
                            typeof s.includes.dataRemoval === 'string'
                              ? '#8A6A1E'
                              : s.includes.dataRemoval
                              ? '#1E7A46'
                              : '#B5462A',
                        }}
                      >
                        {typeof s.includes.dataRemoval === 'string'
                          ? `Data removal: ${s.includes.dataRemoval}`
                          : `Data removal ${s.includes.dataRemoval ? '✓' : '✗'}`}
                      </span>
                      {/* Parental */}
                      <span
                        className="pill"
                        style={{
                          background:
                            typeof s.includes.parental === 'string'
                              ? '#F0EAD8'
                              : s.includes.parental
                              ? '#E4F0E8'
                              : '#F5E4DE',
                          color:
                            typeof s.includes.parental === 'string'
                              ? '#8A6A1E'
                              : s.includes.parental
                              ? '#1E7A46'
                              : '#B5462A',
                        }}
                      >
                        {typeof s.includes.parental === 'string'
                          ? `Parental: ${s.includes.parental}`
                          : `Parental ${s.includes.parental ? '✓' : '✗'}`}
                      </span>
                    </div>

                    {/* Devices and Insurance */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        color: '#6B5B4A',
                        marginBottom: 12,
                      }}
                    >
                      <Info size={15} />
                      <span>
                        Devices: {s.includes.deviceCap} · Identity insurance:{' '}
                        {s.insurance}
                      </span>
                    </div>

                    {/* Strengths & Limitations */}
                    <div
                      className="two-col"
                      style={{
                        gap: '12px 20px',
                        paddingTop: 12,
                        borderTop: '1px solid #EDE5D4',
                      }}
                    >
                      <div>
                        <div className="grid-h" style={{ marginBottom: 6 }}>
                          Strengths
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                          }}
                        >
                          {s.strengths.map((str, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 6,
                                fontSize: 13.5,
                                color: '#3A3025',
                              }}
                            >
                              <Check
                                size={15}
                                color="#1E7A46"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="grid-h" style={{ marginBottom: 6 }}>
                          Limitations
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                          }}
                        >
                          {s.limits.map((lim, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 6,
                                fontSize: 13.5,
                                color: '#3A3025',
                              }}
                            >
                              <AlertTriangle
                                size={14}
                                color="#B5462A"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <span>{lim}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Legal Jurisdiction & Location Impact Card */}
                    <LegalImpactCard
                      serviceName={s.name}
                      info={s.jurisdiction}
                      userRegion={userRegion}
                    />
                  </div>
                );
              })}
            </div>

            {/* Matrix Table */}
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: '#C5A059',
                      marginBottom: 3,
                    }}
                  >
                    Suite Insurance & Caps
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '22px',
                      fontWeight: 500,
                      margin: 0,
                      color: '#1A1A1A',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    Coverage, insurance & renewal matrix —{' '}
                    {suitePlan === 'family' ? 'family' : 'individual'} plans
                  </h3>
                </div>
                <div className="table-scroll-hint">
                  <MoveHorizontal size={13} color="#C5A059" />
                  <span>Scroll sideways to view all columns</span>
                </div>
              </div>

              <div className="table-scroll-container">
                <table className="matrix-table" style={{ minWidth: 840 }}>
                  <thead>
                    <tr>
                      <th>Suite</th>
                      <th>Jurisdiction & HQ</th>
                      <th>
                        {suitePlan === 'family' ? 'Plan' : 'Individual tier'}
                      </th>
                      <th>Covers</th>
                      {suitePlan === 'family' && <th>Adult cap</th>}
                      <th>ID insurance</th>
                      <th>Intro / yr</th>
                      <th>Renewal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUITES.map((s) => {
                      const intro =
                        suitePlan === 'family'
                          ? s.price.familyIntro
                          : s.price.indivIntro;
                      const renew =
                        suitePlan === 'family'
                          ? s.price.familyRenew
                          : s.price.indivRenew;
                      const planLabel =
                        suitePlan === 'family'
                          ? s.price.familyCovers.split('(')[0]
                          : s.price.indivPlan;
                      const covers =
                        suitePlan === 'family'
                          ? s.price.familyCovers
                          : s.price.indivCovers;
                      const isSame = intro === renew;

                      return (
                        <tr key={s.name}>
                          <td className="name">
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="svc"
                            >
                              {s.name}
                            </a>
                          </td>
                          <td>
                            <JurisdictionBadge
                              info={s.jurisdiction}
                              onClick={() =>
                                setSelectedDossier({
                                  name: s.name,
                                  info: s.jurisdiction,
                                })
                              }
                            />
                          </td>
                          <td>{planLabel}</td>
                          <td>{covers}</td>
                          {suitePlan === 'family' && (
                            <td
                              style={{
                                color: s.price.adultCap
                                  ? '#8A6A1E'
                                  : '#1E7A46',
                                fontWeight: 600,
                              }}
                            >
                              {s.price.adultCap
                                ? `${s.price.adultCap} adults`
                                : 'n/a (device cap)'}
                            </td>
                          )}
                          <td>{s.insurance}</td>
                          <td style={{ fontWeight: 600 }}>${intro}/yr</td>
                          <td>
                            {isSame ? (
                              <span
                                style={{ color: '#1E7A46', fontWeight: 600 }}
                              >
                                No increase
                              </span>
                            ) : (
                              <span
                                style={{ color: '#B5462A', fontWeight: 600 }}
                              >
                                ${renew}/yr
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Takeaways */}
            <TakeawayBox
              items={[
                {
                  label: 'Renewal cliffs everywhere',
                  body: 'Aura, Norton, and McAfee all renew at full list price after 50-60% intro discounts — only Proton historically holds its rate.',
                },
                {
                  label: 'Adult caps differ',
                  body: 'McAfee+ Family hosts only 2 adults; Aura hosts 5 adults + unlimited kids; Norton caps by devices, not people.',
                },
                {
                  label: 'Best malware engine',
                  body: 'Norton 360 scores highest in independent detection tests.',
                },
                {
                  label: 'Most devices',
                  body: 'McAfee+ and Aura Family cover unlimited devices; Norton Deluxe caps at 5.',
                },
                {
                  label: 'The bundle trade-off',
                  body: 'Every included tool is a notch below a dedicated one — worth it only if you value one bill over best-in-class.',
                },
                {
                  label: 'Insurance vs privacy',
                  body: "Surfshark One+ and Proton cost less but carry no ID theft insurance — pick the identity suites if coverage matters, the privacy bundles if it doesn't.",
                },
              ]}
            />
          </div>
        )}

        {/* TAB 3: VPNS */}
        {activeTab === 'vpn' && (
          <div>
            <SectionIntro
              title="Standalone VPNs"
              body="Every discounter below advertises a first-term promotional rate billed upfront — the renewal column is what you actually pay from year two (or three) onward. Mullvad is the control group: one flat price since 2009, no games. Compare on renewal, not on the ad."
            />

            {/* Product Cards */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {VPN_COMPARE.map((v: VPNCompareItem) => (
                <div
                  key={v.name}
                  className="compare-card"
                  style={{ padding: '18px 20px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginBottom: 4,
                        }}
                      >
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="svc"
                          style={{ fontSize: 18 }}
                        >
                          <span>{v.name}</span>
                          <ExternalLink size={14} />
                        </a>
                        <JurisdictionBadge
                          info={v.jurisdiction}
                          onClick={() =>
                            setSelectedDossier({
                              name: v.name,
                              info: v.jurisdiction,
                            })
                          }
                        />
                        {v.freeTier && (
                          <span
                            className="pill"
                            style={{ background: '#EAE4F2', color: '#5B3E8E' }}
                          >
                            Free tier
                          </span>
                        )}
                        {v.audited && (
                          <span
                            className="pill"
                            style={{ background: '#F0EAD8', color: '#8A6A1E' }}
                          >
                            Audited no-logs
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#6B5B4A' }}>
                        {v.devices} devices · {v.blocker}
                      </div>
                    </div>

                    {/* Right pricing */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: "'Spectral', serif",
                          fontSize: 21,
                          fontWeight: 700,
                          color: '#2A2118',
                        }}
                      >
                        ${v.introMo.toFixed(2)}/mo intro
                      </div>
                      <div style={{ fontSize: 12.5, color: '#6B5B4A' }}>
                        {v.term}
                        {v.firstBill !== v.introMo &&
                          ` · $${v.firstBill} first bill`}
                      </div>
                      <div style={{ fontSize: 12.5, marginTop: 2 }}>
                        {v.name === 'Mullvad' ? (
                          <span
                            style={{ color: '#1E7A46', fontWeight: 600 }}
                          >
                            same price forever — no renewal hike
                          </span>
                        ) : (
                          <span
                            style={{ color: '#B5462A', fontWeight: 600 }}
                          >
                            then ${v.renewYr}/yr at renewal ($
                            {(v.renewYr / 12).toFixed(2)}/mo)
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#8A96A2',
                          marginTop: 2,
                        }}
                      >
                        or ${v.monthlyMo.toFixed(2)}/mo month-to-month
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Limitations */}
                  <div
                    className="two-col"
                    style={{
                      gap: '12px 20px',
                      paddingTop: 12,
                      borderTop: '1px solid #EDE5D4',
                    }}
                  >
                    <div>
                      <div className="grid-h" style={{ marginBottom: 6 }}>
                        Strengths
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                        }}
                      >
                        {v.strengths.map((str, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 6,
                              fontSize: 13.5,
                              color: '#3A3025',
                            }}
                          >
                            <Check
                              size={15}
                              color="#1E7A46"
                              style={{ flexShrink: 0, marginTop: 2 }}
                            />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="grid-h" style={{ marginBottom: 6 }}>
                        Limitations
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                        }}
                      >
                        {v.limits.map((lim, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 6,
                              fontSize: 13.5,
                              color: '#3A3025',
                            }}
                          >
                            <AlertTriangle
                              size={14}
                              color="#B5462A"
                              style={{ flexShrink: 0, marginTop: 2 }}
                            />
                            <span>{lim}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legal Jurisdiction & Location Impact Card */}
                    <LegalImpactCard
                      serviceName={v.name}
                      info={v.jurisdiction}
                      userRegion={userRegion}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix Table */}
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: '#C5A059',
                      marginBottom: 3,
                    }}
                  >
                    VPN Terms & Renewals
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '22px',
                      fontWeight: 500,
                      margin: 0,
                      color: '#1A1A1A',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    Intro vs renewal matrix
                  </h3>
                </div>
                <div className="table-scroll-hint">
                  <MoveHorizontal size={13} color="#C5A059" />
                  <span>Scroll sideways to view all columns</span>
                </div>
              </div>

              <div className="table-scroll-container">
                <table className="matrix-table" style={{ minWidth: 780 }}>
                  <thead>
                    <tr>
                      <th>VPN</th>
                      <th>Jurisdiction & HQ</th>
                      <th>Devices</th>
                      <th>Intro</th>
                      <th>First bill</th>
                      <th>Renewal / yr</th>
                      <th>Monthly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VPN_COMPARE.map((v) => {
                      const termClean = v.term.replace(/\s*\(.*?\)/, '');
                      return (
                        <tr key={v.name}>
                          <td className="name">
                            <a
                              href={v.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="svc"
                            >
                              {v.name}
                            </a>
                          </td>
                          <td>
                            <JurisdictionBadge
                              info={v.jurisdiction}
                              onClick={() =>
                                setSelectedDossier({
                                  name: v.name,
                                  info: v.jurisdiction,
                                })
                              }
                            />
                          </td>
                          <td>{v.devices}</td>
                          <td>
                            ${v.introMo.toFixed(2)}/mo ({termClean})
                          </td>
                          <td>${v.firstBill}</td>
                          <td>
                            {v.name === 'Mullvad' ? (
                              <span
                                style={{ color: '#1E7A46', fontWeight: 600 }}
                              >
                                No increase
                              </span>
                            ) : (
                              <span
                                style={{ color: '#B5462A', fontWeight: 600 }}
                              >
                                ${v.renewYr}/yr
                              </span>
                            )}
                          </td>
                          <td>${v.monthlyMo.toFixed(2)}/mo</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Takeaways */}
            <TakeawayBox
              items={[
                {
                  label: 'Compare on renewal',
                  body: 'Intro rates renew at 2-3× — NordVPN jumps most (~$139/yr), PIA least (~$56/yr) among the discounters.',
                },
                {
                  label: 'The flat-price control',
                  body: "Mullvad has charged the same ~$5.50/mo since 2009 — over 3 years it beats most 'cheap' VPNs.",
                },
                {
                  label: 'Big households',
                  body: 'Surfshark and PIA cover unlimited devices; the rest cap at 10 unless installed on a router.',
                },
                {
                  label: 'Escape hatch',
                  body: 'Set a calendar reminder before renewal — re-subscribing as a new customer or switching providers restores intro pricing.',
                },
              ]}
            />
          </div>
        )}

        {/* TAB 4: ANTIVIRUS */}
        {activeTab === 'av' && (
          <div>
            <SectionIntro
              title="Antivirus / anti-malware"
              body="First-year prices here are marketing; the renewal column is the real cost of ownership. Microsoft Defender is included as the free baseline every Windows PC already has — the honest question is what a paid suite adds for your household, not whether you're 'unprotected' without one."
            />

            {/* Product Cards */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {AV_COMPARE.map((a: AVCompareItem) => {
                const isFree = a.introYr === 0;
                const multiple = (a.renewYr / (a.introYr || 1)).toFixed(1);
                const isSame = a.renewYr === a.introYr;

                return (
                  <div
                    key={a.name}
                    className="compare-card"
                    style={{ padding: '18px 20px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginBottom: 4,
                          }}
                        >
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="svc"
                            style={{ fontSize: 18 }}
                          >
                            <span>{a.name}</span>
                            <ExternalLink size={14} />
                          </a>
                          <JurisdictionBadge
                            info={a.jurisdiction}
                            onClick={() =>
                              setSelectedDossier({
                                name: a.name,
                                info: a.jurisdiction,
                              })
                            }
                          />
                        </div>
                        <div style={{ fontSize: 13, color: '#6B5B4A' }}>
                          {a.devices} devices · {a.platforms}
                        </div>
                      </div>

                      {/* Right Pricing */}
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: "'Spectral', serif",
                            fontSize: 21,
                            fontWeight: 700,
                            color: isFree ? '#1E7A46' : '#2A2118',
                          }}
                        >
                          {isFree ? 'Free' : `$${a.introYr}/yr first year`}
                        </div>
                        {a.introMoNote && (
                          <div style={{ fontSize: 12, color: '#9A8A76' }}>
                            {a.introMoNote}
                          </div>
                        )}
                        <div style={{ fontSize: 12.5, marginTop: 2 }}>
                          {isSame ? (
                            <span
                              style={{ color: '#1E7A46', fontWeight: 600 }}
                            >
                              no renewal increase
                            </span>
                          ) : (
                            <span
                              style={{ color: '#B5462A', fontWeight: 600 }}
                            >
                              then ${a.renewYr}/yr at renewal ({multiple}× the
                              intro)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Limitations */}
                    <div
                      className="two-col"
                      style={{
                        gap: '12px 20px',
                        paddingTop: 12,
                        borderTop: '1px solid #EDE5D4',
                      }}
                    >
                      <div>
                        <div className="grid-h" style={{ marginBottom: 6 }}>
                          Strengths
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                          }}
                        >
                          {a.strengths.map((str, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 6,
                                fontSize: 13.5,
                                color: '#3A3025',
                              }}
                            >
                              <Check
                                size={15}
                                color="#1E7A46"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <span>{str}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="grid-h" style={{ marginBottom: 6 }}>
                          Limitations
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                          }}
                        >
                          {a.limits.map((lim, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 6,
                                fontSize: 13.5,
                                color: '#3A3025',
                              }}
                            >
                              <AlertTriangle
                                size={14}
                                color="#B5462A"
                                style={{ flexShrink: 0, marginTop: 2 }}
                              />
                              <span>{lim}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Legal Jurisdiction & Location Impact Card */}
                    <LegalImpactCard
                      serviceName={a.name}
                      info={a.jurisdiction}
                      userRegion={userRegion}
                    />
                  </div>
                );
              })}
            </div>

            {/* Matrix Table */}
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: '#C5A059',
                      marginBottom: 3,
                    }}
                  >
                    Endpoint Agent Rates
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '22px',
                      fontWeight: 500,
                      margin: 0,
                      color: '#1A1A1A',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    First-year vs renewal matrix
                  </h3>
                </div>
                <div className="table-scroll-hint">
                  <MoveHorizontal size={13} color="#C5A059" />
                  <span>Scroll sideways to view all columns</span>
                </div>
              </div>

              <div className="table-scroll-container">
                <table className="matrix-table" style={{ minWidth: 740 }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Jurisdiction & HQ</th>
                      <th>Devices</th>
                      <th>Platforms</th>
                      <th>First year</th>
                      <th>Renewal / yr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AV_COMPARE.map((a) => {
                      const isSame = a.renewYr === a.introYr;
                      return (
                        <tr key={a.name}>
                          <td className="name">
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="svc"
                            >
                              {a.name}
                            </a>
                          </td>
                          <td>
                            <JurisdictionBadge
                              info={a.jurisdiction}
                              onClick={() =>
                                setSelectedDossier({
                                  name: a.name,
                                  info: a.jurisdiction,
                                })
                              }
                            />
                          </td>
                          <td>{a.devices}</td>
                          <td>{a.platforms}</td>
                          <td>{a.introYr === 0 ? 'Free' : `$${a.introYr}/yr`}</td>
                          <td>
                            {isSame ? (
                              <span
                                style={{ color: '#1E7A46', fontWeight: 600 }}
                              >
                                No increase
                              </span>
                            ) : (
                              <span
                                style={{ color: '#B5462A', fontWeight: 600 }}
                              >
                                ${a.renewYr}/yr
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Takeaways */}
            <TakeawayBox
              items={[
                {
                  label: 'Renewal multiples are brutal',
                  body: 'McAfee renews at 4× its intro, TotalAV at 3.3×, Bitdefender and Norton at 2-2.4× — budget on the renewal number.',
                },
                {
                  label: 'Free is a real option',
                  body: 'Defender + careful habits covers a single careful Windows user; paid suites earn their keep on cross-device households.',
                },
                {
                  label: 'Best test scores',
                  body: 'Bitdefender and Norton trade the top spots at AV-TEST and AV-Comparatives; both hit effectively 100% detection.',
                },
                {
                  label: 'Best per-device value',
                  body: "Surfshark One's unlimited devices beats the 5-device caps for big households — if you also want its VPN.",
                },
              ]}
            />
          </div>
        )}

        {/* TAB 5: JURISDICTION & LEGAL MATRIX */}
        {activeTab === 'jurisdiction' && (
          <JurisdictionMatrixView
            userRegion={userRegion}
            setUserRegion={setUserRegion}
          />
        )}

        {/* Footer note under active tab */}
        <div
          style={{
            fontSize: '12px',
            color: '#9A8A76',
            marginTop: 32,
            lineHeight: 1.5,
          }}
        >
          Pricing and legal analyses are indicative and checked around August 2026; promotional
          rates change and often renew higher. Confirm the live price and current
          feature set on each provider's page before subscribing. Feature notes
          summarize independent testing, statutory frameworks, and vendor documentation.
        </div>
      </div>

      {/* Jurisdiction Dossier Modal */}
      {selectedDossier && (
        <JurisdictionModal
          item={selectedDossier}
          onClose={() => setSelectedDossier(null)}
          userRegion={userRegion}
        />
      )}
    </div>
  );
};
