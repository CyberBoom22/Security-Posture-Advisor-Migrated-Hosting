import React, { useState } from 'react';
import {
  Globe,
  Scale,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  BookOpen,
  Gavel,
  CheckCircle2,
} from 'lucide-react';
import { JurisdictionInfo, LegalReference } from '../data';

/**
 * Presentation layer for the jurisdiction data in data.ts: a badge, an
 * in-page impact card, and the full dossier modal.
 *
 * The argument these three make is that where a provider is incorporated
 * decides who can compel it to hand over data, and that this can outweigh a
 * feature comparison entirely. The components stay close to the cited statutes
 * so a reader can check the claim rather than take it on trust.
 */

/** Whose legal exposure is being described — the reader's own location. */
export type UserRegion = 'us' | 'eu' | 'global';

/**
 * Colour and description per intelligence-sharing bloc.
 *
 * Colour carries meaning here and runs warm-to-cool with exposure: 5-Eyes
 * members share intelligence most freely, and Swiss is separated from the rest
 * of Non-14-Eyes because its regime differs materially rather than by degree.
 */
export const ALLIANCE_COLORS: Record<
  JurisdictionInfo['allianceCategory'],
  { bg: string; text: string; border: string; desc: string }
> = {
  '5-Eyes': {
    bg: '#FDF2E9',
    text: '#9A4B1A',
    border: 'rgba(154, 75, 26, 0.25)',
    desc: '5-Eyes Alliance (US, UK, CA, AU, NZ) — Extensive mutual intelligence sharing and CLOUD Act / MLAT subpoena coordination.',
  },
  '9-Eyes': {
    bg: '#FBF5E6',
    text: '#8A6A1E',
    border: 'rgba(138, 106, 30, 0.25)',
    desc: '9-Eyes Alliance (5-Eyes + FR, NL, DK, NO) — Enhanced intelligence cooperation across Western European partners.',
  },
  '14-Eyes': {
    bg: '#F4F4F6',
    text: '#555460',
    border: 'rgba(85, 84, 96, 0.2)',
    desc: '14-Eyes Alliance (SIGINT Seniors Europe) — Broad European signals intelligence network with data exchange frameworks.',
  },
  'Non-14-Eyes': {
    bg: '#EAF3ED',
    text: '#1C6B3D',
    border: 'rgba(28, 107, 61, 0.25)',
    desc: 'Autonomous / Non-14-Eyes Jurisdiction — Sovereign territory outside Western multilateral bulk surveillance pacts.',
  },
  'Swiss': {
    bg: '#E8F1F5',
    text: '#1B5E7D',
    border: 'rgba(27, 94, 125, 0.25)',
    desc: 'Swiss Federal Neutrality — Governed by strict Swiss Federal Act on Data Protection (FADP) and Art. 13 of the Federal Constitution.',
  },
};

interface JurisdictionBadgeProps {
  info: JurisdictionInfo;
  onClick?: () => void;
  showDetailsButton?: boolean;
}

/**
 * Compact alliance marker shown on product cards.
 *
 * Falls back to Non-14-Eyes styling for an unrecognised category, so a new
 * entry in data.ts renders plainly rather than crashing or losing its colour.
 */
export const JurisdictionBadge: React.FC<JurisdictionBadgeProps> = ({
  info,
  onClick,
  showDetailsButton = true,
}) => {
  const styling = ALLIANCE_COLORS[info.allianceCategory] || ALLIANCE_COLORS['Non-14-Eyes'];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: styling.bg,
        color: styling.text,
        border: `1px solid ${styling.border}`,
        borderRadius: 4,
        padding: '3px 8px',
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      <span style={{ fontSize: 13 }} role="img" aria-label={info.country}>
        {info.flag}
      </span>
      <span>{info.country}</span>
      <span
        style={{
          opacity: 0.65,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          borderLeft: `1px solid ${styling.border}`,
          paddingLeft: 5,
        }}
      >
        {info.allianceCategory}
      </span>
      {showDetailsButton && onClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 0 0 2px',
            color: styling.text,
            display: 'inline-flex',
            alignItems: 'center',
          }}
          title="Inspect legal jurisdiction details and statutory codes"
          aria-label="Inspect legal jurisdiction details"
        >
          <Scale size={12} />
        </button>
      )}
    </div>
  );
};

interface LegalImpactCardProps {
  serviceName: string;
  info: JurisdictionInfo;
  userRegion: UserRegion;
  onOpenDossier?: () => void;
}

/**
 * In-page summary of what a provider's jurisdiction means for this reader.
 *
 * Collapsed by default: it is context for a purchase decision, not the
 * decision itself, and expanded by default it would bury the pricing. The
 * text shown is selected by userRegion, since the same provider carries
 * different exposure for a US, EU or other reader.
 */
export const LegalImpactCard: React.FC<LegalImpactCardProps> = ({
  serviceName,
  info,
  userRegion,
  onOpenDossier,
}) => {
  const [expanded, setExpanded] = useState(false);
  const styling = ALLIANCE_COLORS[info.allianceCategory] || ALLIANCE_COLORS['Non-14-Eyes'];

  const impactText =
    userRegion === 'us'
      ? info.userImpact.usUser
      : userRegion === 'eu'
      ? info.userImpact.euUser
      : info.userImpact.globalUser;

  const regionLabel =
    userRegion === 'us'
      ? '🇺🇸 United States Resident'
      : userRegion === 'eu'
      ? '🇪🇺 EU / EEA Citizen'
      : '🌐 International / Global User';

  return (
    <div
      style={{
        marginTop: 10,
        background: '#FAF8F5',
        border: '1px solid #EAE3D5',
        borderRadius: 4,
        padding: '10px 14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Building2 size={13} color="#8A6A1E" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2A2118' }}>
            {info.hq}
          </span>
          <span
            style={{
              fontSize: 11,
              background: styling.bg,
              color: styling.text,
              border: `1px solid ${styling.border}`,
              padding: '1px 5px',
              borderRadius: 3,
              fontWeight: 600,
            }}
          >
            {info.alliance}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 11.5,
            fontWeight: 600,
            color: '#8A6A1E',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
          }}
        >
          <span>{expanded ? 'Hide legal dossier' : 'Legal & Subpoena info'}</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <div style={{ marginTop: 6, fontSize: 12.5, color: '#4A3E31', lineHeight: 1.5 }}>
        <strong style={{ color: '#2A2118' }}>Impact on {regionLabel}: </strong>
        {impactText}
      </div>

      {/* The statutes themselves, as badges. Each links to the official text
        * so the summary can be checked against the source. */}
      {/* Governing Statutes Quick Badges */}
      {info.governingStatutes && info.governingStatutes.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#8A6A1E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Statutory Links:
          </span>
          {info.governingStatutes.map((st) => (
            <a
              key={st.id}
              href={st.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: '#1B5E7D',
                background: '#EBF4F8',
                border: '1px solid #D1E5EE',
                padding: '2px 7px',
                borderRadius: 3,
                textDecoration: 'none',
              }}
              title={`Official document for ${st.name} (${st.governingBody})`}
            >
              <span>{st.code}</span>
              <ExternalLink size={10} />
            </a>
          ))}
        </div>
      )}

      {expanded && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px dashed #DCD4C4',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 12,
            color: '#55483B',
          }}
        >
          <div>
            <strong style={{ color: '#2A2118' }}>Origin / Founding: </strong>
            {info.origin}
          </div>
          <div>
            <strong style={{ color: '#2A2118' }}>Governing Legal Framework: </strong>
            {info.legalFramework}
          </div>
          <div>
            <strong style={{ color: '#2A2118' }}>Subpoena Reach & Precedents: </strong>
            {info.subpoenaReach}
          </div>
          {info.zeroKnowledgeMitigation && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
                background: '#EAF3ED',
                color: '#1C6B3D',
                padding: '6px 10px',
                borderRadius: 4,
              }}
            >
              <Lock size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>Cryptographic Mitigation: </strong>
                {info.zeroKnowledgeMitigation}
              </span>
            </div>
          )}

          {/* Official Document Directory Link */}
          {onOpenDossier && (
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                onClick={onOpenDossier}
                style={{
                  background: '#F0ECE1',
                  border: '1px solid #DCD4C4',
                  borderRadius: 3,
                  padding: '4px 9px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#4A3E31',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <BookOpen size={12} />
                <span>Open Full Statutory Dossier & Document Citations</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface JurisdictionModalProps {
  serviceName?: string;
  info?: JurisdictionInfo;
  item?: { name: string; jurisdiction?: JurisdictionInfo; info?: JurisdictionInfo };
  userRegion?: UserRegion;
  onClose: () => void;
}

/**
 * Full dossier for one provider: seat and origin, alliance, governing
 * statutes, subpoena reach, and any court precedents.
 *
 * Props accept either a provider's fields directly or a whole record, because
 * callers hold their subjects in different shapes — `item` may carry the
 * jurisdiction under either key. The resolved* values below normalise that,
 * and render a fallback rather than failing when nothing usable arrives.
 */
export const JurisdictionModal: React.FC<JurisdictionModalProps> = ({
  serviceName,
  info,
  item,
  onClose,
}) => {
  const resolvedName = serviceName || item?.name || 'Security Provider';
  const resolvedInfo = info || item?.jurisdiction || item?.info;

  if (!resolvedInfo) return null;

  const styling = ALLIANCE_COLORS[resolvedInfo.allianceCategory] || ALLIANCE_COLORS['Non-14-Eyes'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#F9F7F2',
          borderRadius: 8,
          maxWidth: 720,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1px solid #DCD4C4',
          padding: '24px 28px',
          color: '#1A1A1A',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '1px solid #EAE3D5',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C5A059',
                marginBottom: 4,
              }}
            >
              Jurisdiction & Legal Intelligence Dossier
            </div>
            <h2
              style={{
                fontFamily: "'Newsreader', 'Spectral', serif",
                fontSize: 24,
                fontWeight: 500,
                margin: 0,
                color: '#1A1A1A',
              }}
            >
              {resolvedInfo.flag} {resolvedName} ({resolvedInfo.country})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#EAE3D5',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4A3E31',
            }}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alliance Category Banner */}
        <div
          style={{
            background: styling.bg,
            border: `1px solid ${styling.border}`,
            color: styling.text,
            borderRadius: 6,
            padding: '12px 14px',
            marginBottom: 18,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            Alliance Status: {resolvedInfo.alliance}
          </div>
          <div>{styling.desc}</div>
        </div>

        {/* Detailed Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Seat & Origin */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#767064',
                marginBottom: 2,
              }}
            >
              Corporate Seat & Engineering Origin
            </div>
            <div style={{ fontSize: 13.5, color: '#1A1A1A' }}>
              <strong>Headquarters: </strong> {resolvedInfo.hq}
            </div>
            <div style={{ fontSize: 13, color: '#55483B' }}>
              <strong>Country of Origin: </strong> {resolvedInfo.origin}
            </div>
          </div>

          {/* Statutory Legal Framework */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#767064',
                marginBottom: 2,
              }}
            >
              Statutory Legal Framework Overview
            </div>
            <div style={{ fontSize: 13, color: '#3A3025', lineHeight: 1.55 }}>
              {resolvedInfo.legalFramework}
            </div>
          </div>

          {/* Subpoena Reach & Extraterritorial Court Orders */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#767064',
                marginBottom: 2,
              }}
            >
              Subpoena Reach & Extraterritorial Discovery
            </div>
            <div style={{ fontSize: 13, color: '#3A3025', lineHeight: 1.55 }}>
              {resolvedInfo.subpoenaReach}
            </div>
          </div>

          {/* Every statute with its official citation and a link to the
            * primary source. This is the section that makes the rest of the
            * dossier checkable instead of assertion. */}
          {/* OFFICIAL STATUTORY CODES & DIRECT GOVERNMENT LINKS */}
          {resolvedInfo.governingStatutes && resolvedInfo.governingStatutes.length > 0 && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCD4C4',
                borderRadius: 6,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#8A6A1E',
                  marginBottom: 10,
                }}
              >
                <BookOpen size={14} />
                <span>Applicable Laws & Official Government Documents</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {resolvedInfo.governingStatutes.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      background: '#FAF8F5',
                      border: '1px solid #EAE3D5',
                      borderRadius: 4,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#EDE7DC',
                            color: '#4A3E31',
                            padding: '2px 6px',
                            borderRadius: 3,
                            marginRight: 6,
                          }}
                        >
                          {st.code}
                        </span>
                        <strong style={{ fontSize: 13, color: '#1A1A1A' }}>
                          {st.name}
                        </strong>
                      </div>
                      <a
                        href={st.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#1B5E7D',
                          textDecoration: 'none',
                          background: '#E8F1F5',
                          padding: '3px 8px',
                          borderRadius: 3,
                        }}
                      >
                        <span>Official Law Document</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    <div style={{ fontSize: 11, color: '#767064', marginBottom: 5 }}>
                      <strong>Citation: </strong> {st.officialDocumentCitation} • <strong>Authority: </strong> {st.governingBody}
                    </div>
                    <div style={{ fontSize: 12, color: '#4A3E31', lineHeight: 1.45 }}>
                      {st.summary}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        paddingTop: 6,
                        borderTop: '1px dashed #E5DFD3',
                        fontSize: 11.5,
                        color: '#55483B',
                      }}
                    >
                      <strong style={{ color: '#2A2118' }}>Impact on {resolvedName}: </strong>
                      {st.impactOnSaaS}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional. Present only where a decision or a documented seizure
            * shows how the statutes above have actually been applied, which
            * carries more weight than the text of the law alone. */}
          {/* COURT PRECEDENTS / POLICE INCIDENTS */}
          {resolvedInfo.courtPrecedents && resolvedInfo.courtPrecedents.length > 0 && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCD4C4',
                borderRadius: 6,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#9A4B1A',
                  marginBottom: 10,
                }}
              >
                <Gavel size={14} />
                <span>Judicial Court Records & Search Warrant Precedents</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {resolvedInfo.courtPrecedents.map((cp) => (
                  <div
                    key={cp.id}
                    style={{
                      background: '#FAF8F5',
                      border: '1px solid #EAE3D5',
                      borderRadius: 4,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#FDF2E9',
                            color: '#9A4B1A',
                            padding: '2px 6px',
                            borderRadius: 3,
                            marginRight: 6,
                          }}
                        >
                          {cp.code}
                        </span>
                        <strong style={{ fontSize: 13, color: '#1A1A1A' }}>
                          {cp.name}
                        </strong>
                      </div>
                      <a
                        href={cp.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#9A4B1A',
                          textDecoration: 'none',
                          background: '#FDF2E9',
                          padding: '3px 8px',
                          borderRadius: 3,
                        }}
                      >
                        <span>Official Court Docket / Report</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    <div style={{ fontSize: 11, color: '#767064', marginBottom: 5 }}>
                      <strong>Citation: </strong> {cp.officialDocumentCitation} • <strong>Tribunal: </strong> {cp.governingBody}
                    </div>
                    <div style={{ fontSize: 12, color: '#4A3E31', lineHeight: 1.45 }}>
                      {cp.summary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedInfo.zeroKnowledgeMitigation && (
            <div
              style={{
                background: '#EAF3ED',
                border: '1px solid rgba(28, 107, 61, 0.2)',
                borderRadius: 6,
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1C6B3D',
                  marginBottom: 2,
                }}
              >
                Cryptographic Immunity / Architecture Defense
              </div>
              <div style={{ fontSize: 13, color: '#1A4D2E', lineHeight: 1.5 }}>
                {resolvedInfo.zeroKnowledgeMitigation}
              </div>
            </div>
          )}

          {/* User Location Legal Comparison */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#767064',
                marginBottom: 8,
              }}
            >
              Legal Rights by User Location
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5DFD3',
                  borderRadius: 4,
                  padding: '8px 12px',
                  fontSize: 12.5,
                }}
              >
                <strong style={{ color: '#1A1A1A' }}>🇺🇸 For US Residents: </strong>
                <span style={{ color: '#4A3E31' }}>{resolvedInfo.userImpact.usUser}</span>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5DFD3',
                  borderRadius: 4,
                  padding: '8px 12px',
                  fontSize: 12.5,
                }}
              >
                <strong style={{ color: '#1A1A1A' }}>🇪🇺 For EU / EEA Residents: </strong>
                <span style={{ color: '#4A3E31' }}>{resolvedInfo.userImpact.euUser}</span>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5DFD3',
                  borderRadius: 4,
                  padding: '8px 12px',
                  fontSize: 12.5,
                }}
              >
                <strong style={{ color: '#1A1A1A' }}>🌐 For International / Other: </strong>
                <span style={{ color: '#4A3E31' }}>{resolvedInfo.userImpact.globalUser}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#1A1A1A',
              color: '#F9F7F2',
              border: 'none',
              borderRadius: 4,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
