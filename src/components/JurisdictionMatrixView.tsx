import React, { useState } from 'react';
import {
  Scale,
  Globe,
  Building2,
  Lock,
  ExternalLink,
  Shield,
  Search,
  MoveHorizontal,
  Info,
  Filter,
  BookOpen,
  Gavel,
  FileCheck2,
  Layers,
} from 'lucide-react';
import {
  PW_MANAGERS,
  SUITES,
  VPN_COMPARE,
  AV_COMPARE,
  CARRIERS,
  JurisdictionInfo,
  LegalReference,
  OFFICIAL_LEGAL_STATUTES,
} from '../data';
import {
  JurisdictionBadge,
  JurisdictionModal,
  ALLIANCE_COLORS,
  UserRegion,
} from './JurisdictionDetails';

/**
 * The jurisdiction sub-tab of Compare: every provider on the site ranked by
 * legal exposure rather than by price, plus a directory of the statutes cited.
 *
 * This is the one view that cuts across product categories. A reader choosing
 * between a password manager and a VPN never compares them on features, but
 * both hold data reachable by whichever government seats them, and that is
 * comparable.
 */

/**
 * One provider, flattened out of its category-specific table.
 *
 * The comparison tables in data.ts have different shapes because they describe
 * different products; this is the common subset needed to compare them on
 * jurisdiction alone.
 */
interface FlatServiceRecord {
  name: string;
  category: 'Password Manager' | 'Security Suite' | 'VPN' | 'Antivirus' | 'Carrier / ISP';
  url: string;
  jurisdiction: JurisdictionInfo;
}

export const JurisdictionMatrixView: React.FC<{
  userRegion: UserRegion;
  setUserRegion: (r: UserRegion) => void;
}> = ({ userRegion, setUserRegion }) => {
  // Two views: the provider matrix, and the statute directory behind it.
  const [activeTab, setActiveTab] = useState<'matrix' | 'statutes'>('matrix');

  // Filters, applied together. Alliance answers "who can compel this?",
  // category narrows to one product type, and the search box covers the case
  // where the reader already has a specific provider in mind.
  const [filterAlliance, setFilterAlliance] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<{
    name: string;
    info: JurisdictionInfo;
  } | null>(null);

  // Flatten every product table into one comparable list. Rebuilt each render
  // rather than memoised: the source tables are static and small enough that
  // the work is irrelevant next to rendering the matrix itself.
  const allServices: FlatServiceRecord[] = [
    ...PW_MANAGERS.map((m) => ({
      name: m.name,
      category: 'Password Manager' as const,
      url: m.url,
      jurisdiction: m.jurisdiction,
    })),
    ...SUITES.map((s) => ({
      name: s.name,
      category: 'Security Suite' as const,
      url: s.url,
      jurisdiction: s.jurisdiction,
    })),
    ...VPN_COMPARE.map((v) => ({
      name: v.name,
      category: 'VPN' as const,
      url: v.url,
      jurisdiction: v.jurisdiction,
    })),
    ...AV_COMPARE.map((a) => ({
      name: a.name,
      category: 'Antivirus' as const,
      url: a.url,
      jurisdiction: a.jurisdiction,
    })),
    // Carriers and ISPs are included because they see traffic before any of
    // the products above encrypt it, which makes their jurisdiction as
    // relevant as a VPN's. They are the one category whose JurisdictionInfo is
    // derived here rather than authored in data.ts: CarrierInfo carries only
    // origin, HQ and framework, so alliance and statutes are inferred from
    // whether the carrier is US-based. That inference is deliberately coarse —
    // a non-US carrier is placed outside the 14-Eyes bloc without checking
    // which country it actually sits in, so any carrier added here that is
    // neither US nor genuinely outside those alliances needs its own entry
    // rather than this fallback.
    ...Object.entries(CARRIERS)
      .filter(([name]) => name !== 'Other / Not sure')
      .map(([name, c]) => ({
      name: `${name} (Carrier/ISP)`,
      category: 'Carrier / ISP' as const,
      url: 'https://www.fcc.gov/',
      jurisdiction: {
        origin: c.origin,
        hq: c.hq,
        country: c.origin.includes('United States') ? 'United States' : 'Various',
        flag: c.flag,
        alliance: c.origin.includes('United States') ? '5-Eyes Intelligence Alliance' : 'Regional',
        allianceCategory: (c.origin.includes('United States') ? '5-Eyes' : 'Non-14-Eyes') as JurisdictionInfo['allianceCategory'],
        legalFramework: c.legalFramework,
        subpoenaReach: 'Telecommunications lawful intercept and CALEA compliance apply directly to all US network traffic under federal subpoenas.',
        governingStatutes: [
          OFFICIAL_LEGAL_STATUTES.CALEA,
          OFFICIAL_LEGAL_STATUTES.CABLE_COMMUNICATIONS_ACT,
          OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        ],
        userImpact: {
          usUser: 'FCC CPNI privacy rules govern call/connection records; unencrypted traffic subject to domestic legal intercept orders.',
          euUser: 'Cross-border roaming data subject to EU GDPR and bilateral carrier transit agreements.',
          globalUser: 'Subject to local telecom regulatory compliance in country of residence.',
        },
      },
    })),
  ];

  // Filtering for Services Matrix
  const filteredServices = allServices.filter((s) => {
    if (filterAlliance !== 'all' && s.jurisdiction.allianceCategory !== filterAlliance) {
      return false;
    }
    if (filterCategory !== 'all' && s.category !== filterCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCountry = s.jurisdiction.country.toLowerCase().includes(q);
      const matchHq = s.jurisdiction.hq.toLowerCase().includes(q);
      const matchOrigin = s.jurisdiction.origin.toLowerCase().includes(q);
      const matchStatute = s.jurisdiction.governingStatutes?.some(
        (st) => st.code.toLowerCase().includes(q) || st.name.toLowerCase().includes(q)
      );
      if (!matchName && !matchCountry && !matchHq && !matchOrigin && !matchStatute) {
        return false;
      }
    }
    return true;
  });

  // Master Statutes List with mapped affected SaaS
  const statutesList = Object.values(OFFICIAL_LEGAL_STATUTES).map((statute) => {
    const affected = allServices.filter(
      (s) =>
        s.jurisdiction.governingStatutes?.some((st) => st.id === statute.id) ||
        s.jurisdiction.courtPrecedents?.some((cp) => cp.id === statute.id)
    );
    return {
      ...statute,
      affectedServices: affected,
    };
  });

  const filteredStatutes = statutesList.filter((st) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = st.code.toLowerCase().includes(q);
      const matchName = st.name.toLowerCase().includes(q);
      const matchBody = st.governingBody.toLowerCase().includes(q);
      const matchSummary = st.summary.toLowerCase().includes(q);
      const matchAffected = st.affectedServices.some((s) => s.name.toLowerCase().includes(q));
      if (!matchCode && !matchName && !matchBody && !matchSummary && !matchAffected) {
        return false;
      }
    }
    return true;
  });

  return (
    <div style={{ marginTop: 24 }}>
      {/* Intro Header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#C5A059',
            marginBottom: 6,
          }}
        >
          Jurisdiction, Origin & Subpoena Intelligence
        </div>
        <h2
          style={{
            fontFamily: "'Newsreader', 'Spectral', serif",
            fontSize: '32px',
            fontWeight: 500,
            margin: '0 0 10px',
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
          }}
        >
          Official Statutory Codes & Legal Jurisdiction Framework
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: '#4A4A4A',
            maxWidth: 820,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Because corporate marketing pages rarely link to live statutory texts, this directory provides direct links to the official legal documents, statutory codes, and court records governing subpoena reach, search warrants, and data retention standards for each SaaS company.
        </p>
      </div>

      {/* The matrix answers "who can reach this provider"; the statute
        * directory answers "what is the law that lets them". */}
      {/* Sub-view switcher: Service Matrix vs. Statutory Directory */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          borderBottom: '1px solid #DCD4C4',
          paddingBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: 4,
            cursor: 'pointer',
            border: activeTab === 'matrix' ? '1px solid #1A1A1A' : '1px solid #DCD4C4',
            background: activeTab === 'matrix' ? '#1A1A1A' : '#FAF8F5',
            color: activeTab === 'matrix' ? '#F9F7F2' : '#4A3E31',
          }}
        >
          <Layers size={14} />
          <span>Company & SaaS Legal Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('statutes')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: 4,
            cursor: 'pointer',
            border: activeTab === 'statutes' ? '1px solid #1A1A1A' : '1px solid #DCD4C4',
            background: activeTab === 'statutes' ? '#1A1A1A' : '#FAF8F5',
            color: activeTab === 'statutes' ? '#F9F7F2' : '#4A3E31',
          }}
        >
          <BookOpen size={14} />
          <span>Statutes & Ordinances Official Directory ({statutesList.length} Laws)</span>
        </button>
      </div>

      {/* User Perspective Selector Banner */}
      <div
        style={{
          background: '#1A1A1A',
          color: '#F9F7F2',
          borderRadius: 6,
          padding: '18px 22px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C5A059',
              marginBottom: 4,
            }}
          >
            ACTIVE LEGAL PERSPECTIVE
          </div>
          <div style={{ fontSize: '14px', color: '#E8E4DB' }}>
            Evaluating legal protections & court reach from the perspective of:
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`tabbtn ${userRegion === 'us' ? 'on' : ''}`}
            onClick={() => setUserRegion('us')}
            style={
              userRegion === 'us'
                ? { background: '#C5A059', borderColor: '#C5A059', color: '#1A1A1A', fontWeight: 700 }
                : { background: '#2D2D2D', borderColor: '#404040', color: '#E8E4DB' }
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
                ? { background: '#C5A059', borderColor: '#C5A059', color: '#1A1A1A', fontWeight: 700 }
                : { background: '#2D2D2D', borderColor: '#404040', color: '#E8E4DB' }
            }
          >
            <span>🇪🇺 EU / EEA Citizen</span>
          </button>
          <button
            type="button"
            className={`tabbtn ${userRegion === 'global' ? 'on' : ''}`}
            onClick={() => setUserRegion('global')}
            style={
              userRegion === 'global'
                ? { background: '#C5A059', borderColor: '#C5A059', color: '#1A1A1A', fontWeight: 700 }
                : { background: '#2D2D2D', borderColor: '#404040', color: '#E8E4DB' }
            }
          >
            <span>🌐 International / Global</span>
          </button>
        </div>
      </div>

      {/* The blocs, explained before the matrix uses them as a filter — the
        * labels mean nothing to a reader who has not met them before. */}
      {/* Alliance Explainer Cards */}
      <div className="two-col" style={{ gap: 12, marginBottom: 24 }}>
        <div
          style={{
            background: '#FAF8F5',
            border: '1px solid #EAE3D5',
            borderRadius: 6,
            padding: '14px 16px',
            fontSize: '13px',
            color: '#3A3025',
          }}
        >
          <strong style={{ color: '#9A4B1A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span>🇺🇸 🇨🇦 🇬🇧 🇦🇺 🇳🇿 5-Eyes Intelligence Alliance</span>
          </strong>
          <span style={{ lineHeight: 1.5 }}>
            Includes the US, UK, Canada, Australia, and New Zealand. Subject to the US CLOUD Act (18 U.S.C. § 2523), mutual assistance treaties, and domestic lawful intercept mandates. However, <em>zero-knowledge client-side encryption</em> mathematically prevents password vault exposure even under federal warrants.
          </span>
        </div>

        <div
          style={{
            background: '#FAF8F5',
            border: '1px solid #EAE3D5',
            borderRadius: 6,
            padding: '14px 16px',
            fontSize: '13px',
            color: '#3A3025',
          }}
        >
          <strong style={{ color: '#1B5E7D', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span>🇨🇭 🇵🇦 🇻🇬 Non-14-Eyes & Swiss Privacy Sanctuaries</span>
          </strong>
          <span style={{ lineHeight: 1.5 }}>
            Switzerland (Proton / SR 235.1), Panama (Nord / Ley 81), British Virgin Islands (ExpressVPN / DPA 2021), and Romania (Bitdefender / CCR 1258/2009) operate outside multilateral bulk surveillance pacts, requiring local judicial court approval before responding to foreign subpoenas.
          </span>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        {activeTab === 'matrix' ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#8A6A1E',
              }}
            >
              Filter by:
            </span>

            {/* Alliance Dropdown */}
            <select
              value={filterAlliance}
              onChange={(e) => setFilterAlliance(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '13px',
                borderRadius: 4,
                border: '1px solid #DCD4C4',
                background: '#FFFFFF',
                color: '#1A1A1A',
              }}
              aria-label="Filter by surveillance alliance"
            >
              <option value="all">All Alliance Statuses</option>
              <option value="5-Eyes">5-Eyes (US, UK, CA)</option>
              <option value="9-Eyes">9-Eyes (NL, FR)</option>
              <option value="14-Eyes">14-Eyes (SE)</option>
              <option value="Non-14-Eyes">Non-14-Eyes (PA, BVI, RO)</option>
              <option value="Swiss">Swiss Neutrality (CH)</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '13px',
                borderRadius: 4,
                border: '1px solid #DCD4C4',
                background: '#FFFFFF',
                color: '#1A1A1A',
              }}
              aria-label="Filter by software category"
            >
              <option value="all">All Product Categories</option>
              <option value="Password Manager">Password Managers</option>
              <option value="Security Suite">Security Suites</option>
              <option value="VPN">VPNs</option>
              <option value="Antivirus">Antivirus</option>
              <option value="Carrier / ISP">Carriers & ISPs</option>
            </select>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#6B5B4A' }}>
            Showing <strong>{filteredStatutes.length}</strong> official legal codes and statutory acts
          </div>
        )}

        {/* Search box */}
        <div style={{ position: 'relative', minWidth: 260 }}>
          <input
            type="text"
            placeholder={
              activeTab === 'matrix'
                ? 'Search company, country, code, statute...'
                : "Search law name, code (e.g. '18 U.S.C.', 'GDPR', 'FADP')..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '13px',
              borderRadius: 4,
              border: '1px solid #DCD4C4',
              background: '#FFFFFF',
              color: '#1A1A1A',
            }}
          />
          <Search
            size={14}
            color="#8A6A1E"
            style={{ position: 'absolute', left: 10, top: 9 }}
          />
        </div>
      </div>

      {/* VIEW 1: MATRIX TAB */}
      {activeTab === 'matrix' && (
        <>
          {/* Responsive Horizontal Scroll Hint */}
          <div className="table-scroll-hint">
            <MoveHorizontal size={14} />
            <span>Scroll sideways to view statutory codes, official links & legal reach</span>
          </div>

          {/* Comprehensive Table */}
          <div className="table-scroll-container">
            <table className="compare-matrix" style={{ minWidth: 1020 }}>
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Service / Company</th>
                  <th style={{ width: 110 }}>Category</th>
                  <th style={{ width: 150 }}>Origin & HQ</th>
                  <th style={{ width: 130 }}>Surveillance Alliance</th>
                  <th style={{ width: 220 }}>Official Statutes & Legal Codes</th>
                  <th style={{ width: 250 }}>
                    Impact on{' '}
                    {userRegion === 'us'
                      ? '🇺🇸 US Resident'
                      : userRegion === 'eu'
                      ? '🇪🇺 EU Citizen'
                      : '🌐 Global User'}
                  </th>
                  <th style={{ width: 60, textAlign: 'center' }}>Dossier</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((item, idx) => {
                  const info = item.jurisdiction;
                  const styling = ALLIANCE_COLORS[info.allianceCategory] || ALLIANCE_COLORS['Non-14-Eyes'];
                  const impact =
                    userRegion === 'us'
                      ? info.userImpact.usUser
                      : userRegion === 'eu'
                      ? info.userImpact.euUser
                      : info.userImpact.globalUser;

                  return (
                    <tr key={`${item.name}-${idx}`}>
                      {/* Service Name */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#1A1A1A' }}>
                          {item.name}
                        </div>
                        {info.zeroKnowledgeMitigation && (
                          <div
                            style={{
                              fontSize: 10.5,
                              color: '#1E7A46',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 2,
                            }}
                          >
                            <Lock size={10} />
                            <span>Zero-knowledge encrypted</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            background: '#EDE7DC',
                            color: '#4A3E31',
                            padding: '2px 6px',
                            borderRadius: 3,
                            fontWeight: 600,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Origin & HQ */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 14 }}>{info.flag}</span>
                          <strong style={{ fontSize: 13, color: '#2A2118' }}>
                            {info.country}
                          </strong>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#6B5B4A', marginTop: 2 }}>
                          {info.hq}
                        </div>
                      </td>

                      {/* Alliance */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: 11,
                            fontWeight: 700,
                            background: styling.bg,
                            color: styling.text,
                            border: `1px solid ${styling.border}`,
                            padding: '3px 7px',
                            borderRadius: 3,
                          }}
                        >
                          {info.alliance}
                        </span>
                      </td>

                      {/* Statutory Legal Codes with Direct Official Links */}
                      <td>
                        <div style={{ fontSize: 12, color: '#3A3025', lineHeight: 1.4, marginBottom: 6 }}>
                          {info.legalFramework}
                        </div>
                        {info.governingStatutes && info.governingStatutes.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {info.governingStatutes.map((st) => (
                              <a
                                key={st.id}
                                href={st.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: '#1B5E7D',
                                  background: '#EBF4F8',
                                  border: '1px solid #D1E5EE',
                                  padding: '2px 6px',
                                  borderRadius: 3,
                                  textDecoration: 'none',
                                }}
                                title={`Open official government document for ${st.name} (${st.governingBody})`}
                              >
                                <span>{st.code}</span>
                                <ExternalLink size={9} />
                              </a>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Location Impact */}
                      <td>
                        <div style={{ fontSize: 12, color: '#3A3025', lineHeight: 1.45 }}>
                          {impact}
                        </div>
                      </td>

                      {/* Inspect Details Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedService({ name: item.name, info: item.jurisdiction })
                          }
                          style={{
                            background: '#FAF8F5',
                            border: '1px solid #DCD4C4',
                            borderRadius: 4,
                            padding: '5px 8px',
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#8A6A1E',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          title="Open full legal dossier"
                          aria-label={`Open legal dossier for ${item.name}`}
                        >
                          <Scale size={13} />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* VIEW 2: STATUTES & ORDINANCES DIRECTORY */}
      {activeTab === 'statutes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredStatutes.map((st) => (
            <div
              key={st.id}
              style={{
                background: '#FAF8F5',
                border: '1px solid #EAE3D5',
                borderRadius: 6,
                padding: '18px 20px',
              }}
            >
              {/* Top Row: Law Code, Law Name & Official Link */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        background: '#1A1A1A',
                        color: '#F9F7F2',
                        padding: '3px 8px',
                        borderRadius: 4,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {st.code}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: '#EDE7DC',
                        color: '#4A3E31',
                        padding: '2px 7px',
                        borderRadius: 3,
                      }}
                    >
                      {st.category}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: 19,
                      fontWeight: 600,
                      margin: 0,
                      color: '#1A1A1A',
                    }}
                  >
                    {st.name}
                  </h3>
                </div>

                <a
                  href={st.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#1B5E7D',
                    background: '#E8F1F5',
                    border: '1px solid #D1E5EE',
                    padding: '6px 12px',
                    borderRadius: 4,
                    textDecoration: 'none',
                  }}
                  title="Open official legislative or judicial source document"
                >
                  <span>Official Government Document</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Authority & Citation */}
              <div
                style={{
                  fontSize: 12,
                  color: '#6B5B4A',
                  marginBottom: 10,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <span>
                  <strong>Official Citation:</strong> {st.officialDocumentCitation}
                </span>
                <span>•</span>
                <span>
                  <strong>Governing Authority:</strong> {st.governingBody}
                </span>
              </div>

              {/* Summary of statutory standard */}
              <div style={{ fontSize: 13, color: '#3A3025', lineHeight: 1.55, marginBottom: 12 }}>
                {st.summary}
              </div>

              {/* SaaS Impact */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5DFD3',
                  borderRadius: 4,
                  padding: '10px 12px',
                  fontSize: 12.5,
                  color: '#4A3E31',
                  marginBottom: 12,
                }}
              >
                <strong style={{ color: '#2A2118' }}>Direct Impact on Security & SaaS Products: </strong>
                {st.impactOnSaaS}
              </div>

              {/* Affected Services in this guide */}
              {st.affectedServices && st.affectedServices.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12 }}>
                  <strong style={{ color: '#8A6A1E' }}>Governed Services in Guide:</strong>
                  {st.affectedServices.map((srv) => (
                    <button
                      key={srv.name}
                      type="button"
                      onClick={() =>
                        setSelectedService({ name: srv.name, info: srv.jurisdiction })
                      }
                      style={{
                        background: '#FAF8F5',
                        border: '1px solid #DCD4C4',
                        borderRadius: 3,
                        padding: '2px 7px',
                        fontSize: 11.5,
                        color: '#1A1A1A',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>{srv.jurisdiction.flag}</span>
                      <span>{srv.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Dossier Modal */}
      {selectedService && (
        <JurisdictionModal
          serviceName={selectedService.name}
          info={selectedService.info}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};
