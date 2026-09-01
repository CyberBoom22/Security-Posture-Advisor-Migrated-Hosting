export interface CarrierInfo {
  isISP: boolean;
  mobilePerks: string[];
  networkPerks: string[];
  note: string;
  hq: string;
  origin: string;
  flag: string;
  legalFramework: string;
}

export interface LegalReference {
  id: string;
  code: string;
  name: string;
  category: 'Statutory Code' | 'EU Regulation' | 'Constitutional Article' | 'Judicial Precedent' | 'Regulatory Rule';
  officialUrl: string;
  governingBody: string;
  officialDocumentCitation: string;
  summary: string;
  impactOnSaaS: string;
}

export interface JurisdictionInfo {
  origin: string;
  hq: string;
  country: string;
  flag: string;
  alliance: string;
  allianceCategory: '5-Eyes' | '9-Eyes' | '14-Eyes' | 'Non-14-Eyes' | 'Swiss';
  legalFramework: string;
  subpoenaReach: string;
  governingStatutes: LegalReference[];
  courtPrecedents?: LegalReference[];
  userImpact: {
    usUser: string;
    euUser: string;
    globalUser: string;
  };
  zeroKnowledgeMitigation?: string;
}

// Master Directory of Official Legal Codes, Statutes & Precedents
export const OFFICIAL_LEGAL_STATUTES: Record<string, LegalReference> = {
  CLOUD_ACT: {
    id: 'cloud_act',
    code: '18 U.S.C. § 2523 / Pub. L. 115–141',
    name: 'Clarifying Lawful Overseas Use of Data Act (CLOUD Act)',
    category: 'Statutory Code',
    officialUrl: 'https://www.congress.gov/bill/115th-congress/house-bill/1625/text',
    governingBody: 'United States Congress / US Department of Justice',
    officialDocumentCitation: '18 U.S. Code § 2523 - Consolidated Appropriations Act, 2018, Div. V, 132 Stat. 1213',
    summary: 'Compels US-based technology companies, SaaS providers, and telecommunications carriers to provide data within their custody or control, regardless of whether that data is stored domestically or on foreign servers.',
    impactOnSaaS: 'If a SaaS provider holds customer data or decryption keys in the cloud, US federal law enforcement can compel its production even if the datacenter is in Europe or Asia. Zero-knowledge client-side encryption nullifies this because the provider cannot decrypt customer ciphertexts.',
  },
  STORED_COMMUNICATIONS_ACT: {
    id: 'stored_communications_act',
    code: '18 U.S.C. §§ 2701–2712 (ECPA Title II)',
    name: 'Stored Communications Act (SCA)',
    category: 'Statutory Code',
    officialUrl: 'https://www.law.cornell.edu/uscode/text/18/chapter/121',
    governingBody: 'United States Congress (Office of the Law Revision Counsel)',
    officialDocumentCitation: 'Title 18 U.S. Code Chapter 121 - Electronic Communications Privacy Act of 1986',
    summary: 'Establishes statutory standards for law enforcement access to stored electronic communications and transactional metadata held by cloud service providers.',
    impactOnSaaS: 'Section 2703(c)(2) permits government entities to obtain basic subscriber identity and connection logs via standard grand jury subpoenas. Section 2703(d) orders require specific factual showings, and Rule 41 search warrants require probable cause for content disclosure.',
  },
  FISA_702: {
    id: 'fisa_702',
    code: '50 U.S.C. § 1881a (FISA Section 702)',
    name: 'Foreign Intelligence Surveillance Act — Section 702',
    category: 'Statutory Code',
    officialUrl: 'https://www.law.cornell.edu/uscode/text/50/1881a',
    governingBody: 'US Foreign Intelligence Surveillance Court (FISC) & ODNI',
    officialDocumentCitation: '50 U.S. Code § 1881a - FISA Amendments Act of 2008 / Reauthorization',
    summary: 'Authorizes warrantless electronic surveillance targeting non-US persons reasonably believed to be located outside the United States with the compelled assistance of US electronic communication service providers.',
    impactOnSaaS: 'US cloud providers can receive classified section 702 directives with accompanying non-disclosure gag orders. Encrypted payload architectures prevent intelligence interception of decrypted vault data.',
  },
  CALEA: {
    id: 'calea',
    code: '47 U.S.C. §§ 1001–1010',
    name: 'Communications Assistance for Law Enforcement Act (CALEA)',
    category: 'Regulatory Rule',
    officialUrl: 'https://www.fcc.gov/public-safety-and-homeland-security/policy-and-licensing-division/communications-assistance-law',
    governingBody: 'Federal Communications Commission (FCC) & US Department of Justice',
    officialDocumentCitation: 'Pub. L. 103–414, 108 Stat. 4279; 47 CFR Part 1 Subpart Z',
    summary: 'Requires telecommunications carriers and broadband internet access service providers to ensure their networks possess built-in capabilities for authorized lawful electronic wiretaps.',
    impactOnSaaS: 'Directly impacts mobile carriers (T-Mobile, Verizon, AT&T) and home broadband ISPs (Xfinity, Spectrum). Does not mandate backdoor access for pure zero-knowledge cryptographic SaaS applications.',
  },
  CABLE_COMMUNICATIONS_ACT: {
    id: 'cable_act',
    code: '47 U.S.C. § 551',
    name: 'Cable Communications Policy Act — Subscriber Privacy Protection',
    category: 'Statutory Code',
    officialUrl: 'https://www.law.cornell.edu/uscode/text/47/551',
    governingBody: 'United States Congress / Federal Communications Commission',
    officialDocumentCitation: '47 U.S. Code § 551 - Pub. L. 98–549, 98 Stat. 2794',
    summary: 'Prohibits cable operators and broadband providers from collecting personally identifiable information without prior consent or disclosing it to third parties except under valid court orders with subscriber notice.',
    impactOnSaaS: 'Governs cable ISP DNS lookup logs and broadband connection telemetry for companies like Comcast / Xfinity and Charter / Spectrum.',
  },
  FCRA: {
    id: 'fcra',
    code: '15 U.S.C. § 1681 et seq.',
    name: 'Fair Credit Reporting Act (FCRA)',
    category: 'Statutory Code',
    officialUrl: 'https://www.law.cornell.edu/uscode/text/15/chapter/41/subchapter/III',
    governingBody: 'Federal Trade Commission (FTC) & CFPB',
    officialDocumentCitation: 'Pub. L. 91–508, Title VI, 84 Stat. 1128; 15 U.S.C. § 1681',
    summary: 'Regulates collection, dissemination, and use of consumer credit information and dark web identity monitoring data, imposing strict permissible purpose and disclosure rules.',
    impactOnSaaS: 'Directly dictates how identity theft protection suites (Aura, Norton LifeLock, McAfee+) query Experian, Equifax, and TransUnion bureau records and notify users of credit inquiries.',
  },
  GLBA: {
    id: 'glba',
    code: '15 U.S.C. §§ 6801–6809',
    name: 'Gramm-Leach-Bliley Act (Financial Privacy & Safeguards Rule)',
    category: 'Statutory Code',
    officialUrl: 'https://www.ftc.gov/business-guidance/privacy-security/gramm-leach-bliley-act',
    governingBody: 'Federal Trade Commission (FTC)',
    officialDocumentCitation: 'Pub. L. 106–102, 113 Stat. 1338; 16 CFR Part 314',
    summary: 'Mandates strict administrative, technical, and physical safeguards to protect nonpublic personal financial customer records.',
    impactOnSaaS: 'Ensures identity monitoring SaaS suites encrypt bank transaction feeds, credit inquiry caches, and SSN vaults with bank-grade controls.',
  },
  CCPA_CPRA: {
    id: 'ccpa_cpra',
    code: 'Cal. Civ. Code §§ 1798.100–1798.199.100',
    name: 'California Consumer Privacy Act & CPRA',
    category: 'Statutory Code',
    officialUrl: 'https://cppa.ca.gov/regulations/consumer_privacy_act.html',
    governingBody: 'California Privacy Protection Agency (CPPA)',
    officialDocumentCitation: 'Cal. Civ. Code § 1798.100 et seq.; Cal. Code Regs. tit. 11, § 7000 et seq.',
    summary: 'Provides California consumers statutory rights to access, delete, correct, and opt-out of the sale or sharing of their personal information.',
    impactOnSaaS: 'Gives automated data-broker removal tools (Incogni, Aura Data Removal, McAfee Personal Data Cleanup) the legal statutory mechanism to issue binding deletion orders to US data brokers.',
  },
  EU_GDPR: {
    id: 'eu_gdpr',
    code: 'Regulation (EU) 2016/679 (GDPR)',
    name: 'EU General Data Protection Regulation',
    category: 'EU Regulation',
    officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679',
    governingBody: 'European Parliament, Council of the EU & EDPB',
    officialDocumentCitation: 'OJ L 119, 4.5.2016, p. 1–88; CELEX 32016R0679',
    summary: 'Europe’s baseline data protection statute. Mandates strict consent, data minimization (Art. 5), right to erasure (Art. 17), and regulates cross-border transfers (Chapter V).',
    impactOnSaaS: 'EU-headquartered SaaS providers (Surfshark B.V. in Netherlands, Bitdefender in Romania, Nord Security in Lithuania) must provide full GDPR rights and maintain comprehensive technical auditing.',
  },
  SWISS_FADP: {
    id: 'swiss_fadp',
    code: 'SR 235.1 (Federal Act on Data Protection)',
    name: 'Swiss Federal Act on Data Protection (FADP / DSG)',
    category: 'Statutory Code',
    officialUrl: 'https://www.fedlex.admin.ch/eli/cc/2022/491/en',
    governingBody: 'Swiss Federal Assembly & FDPIC (Federal Data Protection Commissioner)',
    officialDocumentCitation: 'SR 235.1; Official Compilation of Federal Legislation (RO 2022 491)',
    summary: 'Swiss federal statute granting comprehensive personal data protection and constitutional confidentiality.',
    impactOnSaaS: 'Shields Swiss SaaS companies (Proton AG) from direct foreign administrative subpoenas. Any foreign law enforcement request must proceed through formal Swiss judicial channels under Swiss legal criteria.',
  },
  SWISS_BUPF: {
    id: 'swiss_bupf',
    code: 'SR 780.1 (Swiss BÜPF / SPTA)',
    name: 'Swiss Federal Act on the Surveillance of Post & Telecommunications',
    category: 'Statutory Code',
    officialUrl: 'https://www.fedlex.admin.ch/eli/cc/2018/31/en',
    governingBody: 'Swiss Federal Department of Justice and Police (FDJP / ÜPF)',
    officialDocumentCitation: 'SR 780.1; Federal Act of 18 March 2016 (Current to 2026)',
    summary: 'Regulates lawful intercept in Switzerland. Pure application SaaS and VPN providers that do not provide public telecommunications networks are exempt from indiscriminate continuous logging mandates.',
    impactOnSaaS: 'Confirms that VPN and encrypted email/password providers in Switzerland are not legally obligated to maintain active connection logs or IP timestamp mapping for general users.',
  },
  SWISS_CONSTITUTION_13: {
    id: 'swiss_const_13',
    code: 'SR 101 Art. 13 (Swiss Federal Constitution)',
    name: 'Federal Constitution of the Swiss Confederation — Article 13',
    category: 'Constitutional Article',
    officialUrl: 'https://www.fedlex.admin.ch/eli/cc/1999/404/en#art_13',
    governingBody: 'Swiss Federal Supreme Court',
    officialDocumentCitation: 'Federal Constitution of the Swiss Confederation of 18 April 1999, Art. 13',
    summary: 'Constitutional guarantee of individual privacy, correspondence confidentiality, and protection against misuse of personal data.',
    impactOnSaaS: 'Provides the supreme constitutional basis protecting Swiss communication services against arbitrary government surveillance.',
  },
  CANADA_PIPEDA: {
    id: 'canada_pipeda',
    code: 'S.C. 2000, c. 5 (PIPEDA)',
    name: 'Personal Information Protection and Electronic Documents Act',
    category: 'Statutory Code',
    officialUrl: 'https://laws-lois.justice.gc.ca/eng/acts/P-8.6/',
    governingBody: 'Parliament of Canada & Privacy Commissioner of Canada (OPC)',
    officialDocumentCitation: 'Statutes of Canada 2000, chapter 5 (Current to 2026)',
    summary: 'Canadian federal privacy legislation governing the collection, use, and disclosure of personal data in commercial activities.',
    impactOnSaaS: 'Governs Canadian SaaS operations (such as 1Password / AgileBits in Toronto). Recognized as providing adequate protection by the European Commission under GDPR Article 45.',
  },
  UK_IPA: {
    id: 'uk_ipa',
    code: 'Investigatory Powers Act 2016 (c. 25)',
    name: 'UK Investigatory Powers Act 2016 ("Snooper’s Charter")',
    category: 'Statutory Code',
    officialUrl: 'https://www.legislation.gov.uk/ukpga/2016/25/contents',
    governingBody: 'UK Parliament & Investigatory Powers Commissioner (IPCO)',
    officialDocumentCitation: 'Investigatory Powers Act 2016 (c. 25) - Acts of the UK Parliament',
    summary: 'Grants UK intelligence and law enforcement agencies powers for targeted and bulk interception, equipment interference, and mandatory retention of Internet Connection Records (ICRs).',
    impactOnSaaS: 'Enables UK authorities to issue technical capability notices to UK-incorporated communications and security companies (like Protected.net / TotalAV).',
  },
  UK_DPA: {
    id: 'uk_dpa',
    code: 'Data Protection Act 2018 (c. 12)',
    name: 'UK Data Protection Act 2018 / UK GDPR',
    category: 'Statutory Code',
    officialUrl: 'https://www.legislation.gov.uk/ukpga/2018/12/contents',
    governingBody: 'UK Information Commissioner’s Office (ICO)',
    officialDocumentCitation: 'Data Protection Act 2018 (c. 12) - United Kingdom',
    summary: 'Regulates data protection and processing in the United Kingdom following its exit from the EU, retaining key GDPR data subject rights.',
    impactOnSaaS: 'Ensures UK residents have statutory rights to data subject access requests, rectification, and erasure.',
  },
  SWEDEN_LEK: {
    id: 'sweden_lek',
    code: 'SFS 2022:482 (Lag om elektronisk kommunikation - LEK)',
    name: 'Swedish Electronic Communications Act (LEK)',
    category: 'Statutory Code',
    officialUrl: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2022482-om-elektronisk-kommunikation_sfs-2022-482/',
    governingBody: 'Sveriges Riksdag (Swedish Parliament) & PTS',
    officialDocumentCitation: 'Svensk författningssamling SFS 2022:482, 6 kap. (Integritetsskydd)',
    summary: 'Regulates Swedish electronic communications networks and privacy. Telecommunications regulators and Swedish courts confirmed VPN operators are not subject to mandatory traffic data retention.',
    impactOnSaaS: 'Allows Swedish VPN operators (Mullvad VPN AB in Gothenburg) to operate zero-logging architectures lawfully without violating telecommunications regulations.',
  },
  ROMANIA_CCR_1258: {
    id: 'romania_ccr_1258',
    code: 'Romanian Law 365/2002 & CCR Dec. 1258/2009',
    name: 'Romanian Constitutional Court Decision 1258/2009 (Invalidating Bulk Retention)',
    category: 'Judicial Precedent',
    officialUrl: 'https://legislatie.just.ro/Public/DetaliiDocument/39327',
    governingBody: 'Curtea Constituțională a României (Constitutional Court of Romania)',
    officialDocumentCitation: 'Monitorul Oficial al României nr. 798 din 23 noiembrie 2009',
    summary: 'Landmark constitutional court ruling holding that statutory bulk telecommunications and internet data retention violates European and Romanian constitutional privacy rights.',
    impactOnSaaS: 'Provides legal certainty for Romanian cybersecurity and SaaS firms (Bitdefender S.R.L.) against government bulk retention mandates.',
  },
  PANAMA_LEY_81: {
    id: 'panama_ley_81',
    code: 'Panama Ley 81 de 2019 / Decreto Ejecutivo 285',
    name: 'Panamanian Personal Data Protection Law (Ley 81 de 2019)',
    category: 'Statutory Code',
    officialUrl: 'https://www.gacetaoficial.gob.pa/pdfTemp/28741_A/72382.pdf',
    governingBody: 'Asamblea Nacional de Panamá & ANTAI',
    officialDocumentCitation: 'Gaceta Oficial Digital No. 28741-A - Ley 81 de 26 de marzo de 2019',
    summary: 'Panama’s data protection law regulating principles of loyalty, purpose, proportionality, and security for personal data processing.',
    impactOnSaaS: 'Panama has no statutory data retention laws for VPN providers. Foreign subpoenas cannot be enforced without Panamanian judicial letters rogatory (exequatur).',
  },
  BVI_DPA: {
    id: 'bvi_dpa',
    code: 'BVI Data Protection Act, 2021 (Act No. 3 of 2021)',
    name: 'British Virgin Islands Data Protection Act, 2021',
    category: 'Statutory Code',
    officialUrl: 'https://eservices.gov.vg/gazette/sites/default/files/Data%20Protection%20Act%202021.pdf',
    governingBody: 'House of Assembly of the Virgin Islands & Information Commissioner',
    officialDocumentCitation: 'Virgin Islands Official Gazette Vol. LV, No. 32 (Act No. 3 of 2021)',
    summary: 'Establishes OECD-standard data protection in the British Virgin Islands, safeguarding personal data processing while preserving BVI judicial autonomy.',
    impactOnSaaS: 'BVI-registered companies (ExpressVPN / Kape) operate under local BVI High Court jurisdiction; foreign orders carry no automatic extraterritorial authority.',
  },
  PIA_COURT_PRECEDENT: {
    id: 'pia_court_precedent',
    code: 'Fed. R. Crim. P. 17 Subpoena Docket Records',
    name: 'US Federal Court Precedent: United States v. PIA No-Logs Verifications',
    category: 'Judicial Precedent',
    officialUrl: 'https://www.courtlistener.com/docket/4514571/united-states-v-frazier/',
    governingBody: 'United States District Court (D. Mass. / E.D. Tex.) & FBI',
    officialDocumentCitation: 'US v. Frazier, Case 1:16-cr-00057; US v. Real, Case 1:18-cr-00109',
    summary: 'Federal criminal court dockets where FBI and Secret Service subpoenas compelled PIA to testify and produce connection records. PIA proved in court that no IP logs or timestamps existed.',
    impactOnSaaS: 'Serves as landmark judicial precedent demonstrating that RAM-only diskless logging implementations withstand federal grand jury subpoena scrutiny.',
  },
  MULLVAD_POLICE_WARRANT: {
    id: 'mullvad_police_warrant',
    code: 'Rättegångsbalken (1942:740) 28 kap. 1 §',
    name: 'Swedish Police Search Warrant Incident on Mullvad VPN (April 2023)',
    category: 'Judicial Precedent',
    officialUrl: 'https://mullvad.net/en/blog/mullvad-vpn-was-subject-to-a-search-warrant',
    governingBody: 'National Operations Department of the Swedish Police (NOA)',
    officialDocumentCitation: 'Swedish Code of Judicial Procedure (RB 28 kap. 1 §) Search Warrant Incident',
    summary: 'Swedish National Police served a search warrant at Mullvad’s Gothenburg headquarters. Officers left without seizing data because Mullvad’s system architecture stores zero customer records.',
    impactOnSaaS: 'Demonstrates real-world physical raid resilience of numbered-account architectures with zero email or payment data collection.',
  },
};

export const CARRIERS: Record<string, CarrierInfo> = {
  "T-Mobile": {
    isISP: false,
    mobilePerks: ["McAfee Security app (Magenta/Go5G plans)", "Scam Shield free call protection", "Basic VPN via McAfee on some plans"],
    networkPerks: [],
    note: "Mobile-carrier only (unless you also have T-Mobile Home Internet). McAfee runs as an app, so it protects phones/tablets — not your desktop.",
    hq: "Bellevue, Washington, USA (Deutsche Telekom parent, Germany)",
    origin: "United States / Germany",
    flag: "🇺🇸",
    legalFramework: "Subject to US FCC regulations, CALEA wiretap mandates, and Title 18 subpoena requests.",
  },
  "Verizon": {
    isISP: false,
    mobilePerks: ["Verizon Mobile Protect security tools", "Call Filter for spam"],
    networkPerks: ["Fios/5G Home Internet: router-level threat blocking (if you're a home-internet customer)"],
    note: "Mobile add-ons cover phones. Desktop coverage only comes via Verizon Home Internet at the router.",
    hq: "New York, NY, USA",
    origin: "United States",
    flag: "🇺🇸",
    legalFramework: "US 5-Eyes jurisdiction; complies with CALEA, FISA 702 directives, and federal warrants.",
  },
  "AT&T": {
    isISP: false,
    mobilePerks: ["ActiveArmor app: free spam/fraud blocking (mobile only)", "ActiveArmor Advanced ($3.99/mo) adds mobile VPN + ID monitoring"],
    networkPerks: ["AT&T Internet/Fiber: ActiveArmor Internet Security at the router — covers every device on the network, desktops included"],
    note: "Key distinction: the ActiveArmor app has no desktop agent, so on mobile service alone your desktop is unprotected. But if AT&T is also your home ISP, protection kicks in at the router and covers desktops/laptops network-wide.",
    hq: "Dallas, Texas, USA",
    origin: "United States",
    flag: "🇺🇸",
    legalFramework: "US 5-Eyes jurisdiction; governed by FCC CPNI rules and statutory lawful intercept standards.",
  },
  "Xfinity / Comcast": {
    isISP: true,
    mobilePerks: ["Xfinity Mobile: basic app protections"],
    networkPerks: ["xFi Advanced Security at the router (free with xFi Gateway) — blocks malicious sites for every device on the network, desktops included"],
    note: "As a home ISP, the router-level protection covers desktops automatically. No per-device agent needed.",
    hq: "Philadelphia, Pennsylvania, USA",
    origin: "United States",
    flag: "🇺🇸",
    legalFramework: "US Cable Communications Policy Act & FCC mandates; DNS lookup logs subject to lawful subpoenas.",
  },
  "Spectrum": {
    isISP: true,
    mobilePerks: ["Security Suite (F-Secure) app — installs on individual devices incl. desktop, up to 10"],
    networkPerks: ["Advanced WiFi adds router-level security if you rent their gateway"],
    note: "F-Secure suite installs on desktops directly (not just network-level), covering up to 10 devices.",
    hq: "Stamford, Connecticut, USA",
    origin: "United States",
    flag: "🇺🇸",
    legalFramework: "US 5-Eyes jurisdiction; F-Secure sub-license operates under combined US/Finnish security standards.",
  },
  "Other / Not sure": {
    isISP: false,
    mobilePerks: [],
    networkPerks: [],
    note: "Worth calling your provider — many bundle protections people never activate, and home-ISP plans often protect desktops at the router.",
    hq: "Local / Regional Provider",
    origin: "Varies by provider",
    flag: "🌐",
    legalFramework: "Governed by local national telecommunications authorities and regional surveillance laws.",
  },
};

export interface VaultPick {
  adultCap: number;
  totalSeats: number;
  name: string;
  url: string;
  price: { intro: number; renew: number; monthly: number | null; term: string };
  why: string;
}

export const VAULT_PICKS: VaultPick[] = [
  { adultCap: 1, totalSeats: 1, name: "Bitwarden (individual)", url: "https://bitwarden.com/pricing/",
    price: { intro: 10, renew: 10, monthly: null, term: "annual" },
    why: "Cheapest solid option for a single adult; free tier also works." },
  { adultCap: 2, totalSeats: 6, name: "NordPass Family", url: "https://nordpass.com/pricing/",
    price: { intro: 44.28, renew: 89.88, monthly: null, term: "1-year" },
    why: "Simple, privacy-first, great for less-technical relatives. Hosts up to 2 adults; kids fill the remaining seats." },
  { adultCap: 5, totalSeats: 6, name: "1Password Families", url: "https://1password.com/families",
    price: { intro: 59.88, renew: 59.88, monthly: null, term: "annual" },
    why: "Up to 5 adults with per-person and shared vaults, clean permission controls." },
  { adultCap: 10, totalSeats: 10, name: "Dashlane Friends & Family", url: "https://www.dashlane.com/pricing",
    price: { intro: 89.88, renew: 89.88, monthly: null, term: "annual" },
    why: "Up to 10 members regardless of age; bundles a basic VPN." },
];

export const FREE_TIERS = "Bitwarden Free, Proton Pass Free, or NordPass Free";
export const FREE_TIER_URL = "https://bitwarden.com/pricing/";
export const VPN_BLOCKERS = "Proton VPN's NetShield, NordVPN's Threat Protection, or Surfshark's CleanWeb";

export interface AVSuite {
  name: string;
  deviceCap: number | null;
  url: string;
  price: { intro: number; renew: number; monthly: number | null; term: string };
  note: string;
}

export const AV_SUITES: AVSuite[] = [
  { name: "McAfee+ (Family)", deviceCap: null, url: "https://www.mcafee.com/en-us/identity-theft/family.html",
    price: { intro: 84.99, renew: 224.99, monthly: null, term: "1-year" },
    note: "Covers unlimited devices, up to 6 members (2 adults) — the simplest fit for big households." },
  { name: "Bitdefender Family Pack", deviceCap: 15, url: "https://www.bitdefender.com/en-us/consumer/family-pack",
    price: { intro: 44.99, renew: 149.99, monthly: null, term: "1-year" },
    note: "Up to 15 devices; strong detection scores." },
  { name: "Norton 360 Deluxe", deviceCap: 5, url: "https://us.norton.com/products/norton-360-deluxe",
    price: { intro: 49.99, renew: 119.99, monthly: null, term: "1-year" },
    note: "5 devices; bundles VPN + password manager." },
];

export interface VPNChoice {
  id: string;
  name: string;
  url: string;
  price: { intro: number; renew: number; monthly: number; term: string };
  routerCapable: boolean;
  note: string;
}

export const VPN_CHOICES: VPNChoice[] = [
  { id: "surfshark", name: "Surfshark", url: "https://surfshark.com/pricing",
    price: { intro: 53.73, renew: 79.00, monthly: 15.45, term: "2-year" }, routerCapable: true,
    note: "Unlimited devices on every plan; CleanWeb blocks ads + malware. Intro is the 2-year Starter rate." },
  { id: "nordvpn", name: "NordVPN", url: "https://nordvpn.com/pricing/",
    price: { intro: 41.88, renew: 65.88, monthly: 14.99, term: "2-year" }, routerCapable: true,
    note: "10 devices per account or unlimited via router; Threat Protection blocks ads + malware. Intro is the 2-year Basic rate." },
  { id: "proton", name: "Proton VPN", url: "https://protonvpn.com/pricing",
    price: { intro: 71.76, renew: 83.88, monthly: 9.99, term: "2-year" }, routerCapable: false,
    note: "10 devices; NetShield blocks ads + malware. Open-source, Swiss privacy. Intro is the 2-year Plus rate." },
];

export interface PWManager {
  name: string;
  url: string;
  tagline: string;
  price: {
    free: boolean;
    indivIntro: number;
    indivRenew: number;
    familyIntro: number;
    familyRenew: number;
    familySeats: number;
    adultCap: number | null;
  };
  encryption: string;
  audited: boolean;
  openSource: boolean;
  freeTierUsable: string;
  sharing: string;
  emergencyAccess: boolean;
  jurisdiction: JurisdictionInfo;
  strengths: string[];
  limits: string[];
}

export const PW_MANAGERS: PWManager[] = [
  {
    name: "Bitwarden",
    url: "https://bitwarden.com/pricing/",
    tagline: "Open-source, cheapest paid tier, generous free plan",
    price: { free: true, indivIntro: 10, indivRenew: 10, familyIntro: 40, familyRenew: 40, familySeats: 6, adultCap: null },
    encryption: "AES-256",
    audited: true,
    openSource: true,
    freeTierUsable: "excellent",
    sharing: "Family/Org plans; free tier shares with 1 other",
    emergencyAccess: true,
    jurisdiction: {
      origin: "United States (Santa Barbara, CA)",
      hq: "Santa Barbara, California, USA (Bitwarden Inc.)",
      country: "United States",
      flag: "🇺🇸",
      alliance: "5-Eyes Intelligence Alliance",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction (5-Eyes / CLOUD Act / FISA 702). Governed by US federal & California CCPA privacy laws.",
      subpoenaReach: "US federal law enforcement can compel account metadata (account creation date, billing records, IP access logs) via grand jury subpoenas under 18 U.S.C. § 2703.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        OFFICIAL_LEGAL_STATUTES.CCPA_CPRA,
      ],
      userImpact: {
        usUser: "Domestic subpoenas apply directly. However, vault contents are zero-knowledge client-encrypted with your master key; Bitwarden cannot decrypt your passwords even under federal court order.",
        euUser: "Transfers covered under Data Privacy Framework (DPF) / Standard Contractual Clauses (SCCs). Zero-knowledge client-side encryption ensures GDPR confidentiality.",
        globalUser: "Zero-knowledge architecture provides universal cryptographic immunity for vault payloads, regardless of international MLAT requests.",
      },
      zeroKnowledgeMitigation: "Client-side AES-256 zero-knowledge encryption ensures Bitwarden servers never hold master keys or plaintext vault items.",
    },
    strengths: ["Cheapest credible option", "Fully open-source & audited", "Free tier covers a single user well"],
    limits: ["Interface is functional, not polished", "Autofill occasionally needs nudging", "Fewer bundled extras than rivals"],
  },

  {
    name: "1Password",
    url: "https://1password.com/families",
    tagline: "Most polished apps, best vault permission controls",
    price: { free: false, indivIntro: 47.88, indivRenew: 47.88, familyIntro: 71.88, familyRenew: 71.88, familySeats: 5, adultCap: null },
    encryption: "AES-256 + secret key",
    audited: true,
    openSource: false,
    freeTierUsable: "trial only",
    sharing: "Per-vault access policies; shared + private vaults",
    emergencyAccess: true,
    jurisdiction: {
      origin: "Canada (Toronto, Ontario)",
      hq: "Toronto, Ontario, Canada (AgileBits Inc.)",
      country: "Canada",
      flag: "🇨🇦",
      alliance: "5-Eyes Intelligence Alliance",
      allianceCategory: "5-Eyes",
      legalFramework: "Canadian Jurisdiction (PIPEDA / 5-Eyes Alliance). Subject to Canadian federal court warrants and cross-border US-Canada MLATs.",
      subpoenaReach: "Canadian and US authorities can demand account billing and registration metadata under statutory procedures.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CANADA_PIPEDA,
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      userImpact: {
        usUser: "AgileBits operates under Canadian privacy legislation (PIPEDA). Dual-key architecture (Master Password + 128-bit Secret Key generated client-side) provides mathematical insulation against subpoena decryption.",
        euUser: "Canada holds European Commission adequacy status under GDPR Art. 45. User data enjoys EU-equivalent data protection standards.",
        globalUser: "Secret Key is stored solely on authorized devices, preventing cloud extraction or government interception.",
      },
      zeroKnowledgeMitigation: "Dual-key architecture (Master Password + 128-bit Secret Key) ensures vaults cannot be decrypted even with raw server database access.",
    },
    strengths: ["Best-in-class macOS/iOS integration", "Travel Mode hides vaults at borders", "Watchtower breach dashboard"],
    limits: ["No free tier (14-day trial only)", "Family caps at 5 members", "Prices rose ~33% in March 2026", "Not open-source"],
  },

  {
    name: "NordPass",
    url: "https://nordpass.com/pricing/",
    tagline: "Simple, privacy-first, newest encryption",
    price: { free: true, indivIntro: 25.35, indivRenew: 35.88, familyIntro: 44.28, familyRenew: 71.88, familySeats: 6, adultCap: 2 },
    encryption: "XChaCha20",
    audited: true,
    openSource: false,
    freeTierUsable: "good",
    sharing: "Family plan (6 seats); per-item sharing",
    emergencyAccess: true,
    jurisdiction: {
      origin: "Lithuania (Vilnius)",
      hq: "Panama City, Panama & Vilnius, Lithuania (Nord Security)",
      country: "Panama / Lithuania",
      flag: "🇵🇦",
      alliance: "Non-14-Eyes / EU Operations",
      allianceCategory: "Non-14-Eyes",
      legalFramework: "Panamanian parent entity (no mandatory data retention, outside 14-Eyes) with EU operational entity in Lithuania under GDPR.",
      subpoenaReach: "Requires Panamanian court order to demand records; foreign subpoenas have no direct legal jurisdiction.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.PANAMA_LEY_81,
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      userImpact: {
        usUser: "Provides strong jurisdictional barrier against US domestic discovery and warrantless civil subpoenas.",
        euUser: "Lithuanian engineering hub operates in strict compliance with EU GDPR privacy regulations.",
        globalUser: "Offshore registration plus modern XChaCha20-Poly1305 zero-knowledge encryption ensures robust double-layer protection.",
      },
      zeroKnowledgeMitigation: "Zero-knowledge architecture with XChaCha20 encryption executed entirely on client endpoints.",
    },
    strengths: ["Dead-simple for less-technical users", "Email masking built in", "Newer XChaCha20 cipher"],
    limits: ["Best price needs 2-year commit", "Family renews at $71.88/yr — a big jump", "Fewer power-user features", "Free tier limited to 1 device"],
  },

  {
    name: "Dashlane",
    url: "https://www.dashlane.com/pricing",
    tagline: "Bundles a VPN; largest household plan",
    price: { free: false, indivIntro: 59.88, indivRenew: 59.88, familyIntro: 89.88, familyRenew: 89.88, familySeats: 10, adultCap: null },
    encryption: "AES-256",
    audited: true,
    openSource: false,
    freeTierUsable: "discontinued",
    sharing: "Friends & Family up to 10; unlimited sharing",
    emergencyAccess: true,
    jurisdiction: {
      origin: "France (Paris)",
      hq: "New York, NY, USA & Paris, France (Dashlane Inc.)",
      country: "United States / France",
      flag: "🇺🇸",
      alliance: "5-Eyes (US) / 9-Eyes (France)",
      allianceCategory: "5-Eyes",
      legalFramework: "Dual US/French jurisdiction. Subject to US CLOUD Act for US entity and EU GDPR / French CNIL oversight for French operations.",
      subpoenaReach: "Account records and billing data can be requested via US federal subpoenas under 18 U.S.C. § 2703 or French judicial rogatory requests.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      userImpact: {
        usUser: "Domestic US operations subject to standard US corporate jurisdiction; vaults protected by client-side zero-knowledge encryption.",
        euUser: "French branch ensures European users have full GDPR rights including data portability and erasure.",
        globalUser: "Patented zero-knowledge derivation architecture keeps master keys off company servers.",
      },
      zeroKnowledgeMitigation: "Argon2d / PBKDF2 client-side key derivation prevents server-side vault decryption.",
    },
    strengths: ["Covers up to 10 people", "Bundled Hotspot Shield VPN", "Real-time phishing + dark web alerts"],
    limits: ["Most expensive per seat", "No free tier anymore", "Bundled VPN is third-party, not a full replacement"],
  },

  {
    name: "Proton Pass",
    url: "https://proton.me/pass/pricing",
    tagline: "End-to-end encrypts metadata; Proton ecosystem",
    price: { free: true, indivIntro: 23.88, indivRenew: 23.88, familyIntro: 47.88, familyRenew: 47.88, familySeats: 6, adultCap: null },
    encryption: "AES-256-GCM (E2E metadata)",
    audited: true,
    openSource: true,
    freeTierUsable: "good",
    sharing: "Family vault sharing (6 seats)",
    emergencyAccess: true,
    jurisdiction: {
      origin: "Switzerland (Geneva)",
      hq: "Geneva, Switzerland (Proton AG)",
      country: "Switzerland",
      flag: "🇨🇭",
      alliance: "Non-14-Eyes (Swiss Jurisdiction)",
      allianceCategory: "Swiss",
      legalFramework: "Strict Swiss Federal Jurisdiction. Governed by Swiss Federal Act on Data Protection (FADP) and Federal Constitution Art. 13.",
      subpoenaReach: "Immune to US CLOUD Act, EU directives, and foreign gag orders. Data requests require formal approval by a Swiss cantonal or federal court.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.SWISS_FADP,
        OFFICIAL_LEGAL_STATUTES.SWISS_BUPF,
        OFFICIAL_LEGAL_STATUTES.SWISS_CONSTITUTION_13,
      ],
      userImpact: {
        usUser: "Complete jurisdictional shielding from US surveillance laws (FISA, CLOUD Act). US agencies must submit mutual legal assistance requests through Swiss courts.",
        euUser: "Swiss FADP is recognized by the European Commission as providing full GDPR adequacy while remaining outside EU surveillance pacts.",
        globalUser: "All metadata (including URLs and item titles) is end-to-end encrypted client-side alongside credentials.",
      },
      zeroKnowledgeMitigation: "Comprehensive end-to-end encryption covering both payload and item metadata (URLs, notes, titles) on open-source code.",
    },
    strengths: ["Encrypts URLs & metadata, not just passwords", "Integrated hide-my-email aliases", "Emergency Access: up to 5 trusted contacts (paid plans)", "Cleanest fit if you use Proton Mail/VPN"],
    limits: ["Feature depth below 1Password", "Ties you to a Proton account", "Emergency contacts must also have a Proton account"],
  },
];

export interface Suite {
  name: string;
  url: string;
  tagline: string;
  price: {
    indivPlan: string;
    indivIntro: number;
    indivRenew: number;
    indivCovers: string;
    familyIntro: number;
    familyRenew: number;
    familyCovers: string;
    adultCap: number | null;
    kidsNote: string;
  };
  includes: {
    antivirus: boolean;
    vpn: boolean;
    pwManager: boolean;
    idTheft: boolean | string;
    dataRemoval: boolean | string;
    parental: boolean | string;
    deviceCap: string;
  };
  insurance: string;
  jurisdiction: JurisdictionInfo;
  strengths: string[];
  limits: string[];
}

export const SUITES: Suite[] = [
  {
    name: "Aura",
    url: "https://www.aura.com/pricing",
    tagline: "Identity-first; all features in every plan, no tier-gating",
    price: { indivPlan: "Aura Individual", indivIntro: 144, indivRenew: 288, indivCovers: "1 adult, 10 devices (intro = 50% off)", familyIntro: 384, familyRenew: 960, familyCovers: "5 adults + unlimited kids (intro = 60% off)", adultCap: 5, kidsNote: "unlimited children" },
    includes: { antivirus: true, vpn: true, pwManager: true, idTheft: true, dataRemoval: true, parental: "Family plan", deviceCap: "Unlimited (Family)" },
    insurance: "$1M per adult (up to $5M/household on some plans)",
    jurisdiction: {
      origin: "United States (Burlington, MA)",
      hq: "Burlington, Massachusetts, USA (Aura Inc.)",
      country: "United States",
      flag: "🇺🇸",
      alliance: "5-Eyes Intelligence Alliance",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction (5-Eyes / FCRA / GLBA / FTC). Subject to US CLOUD Act.",
      subpoenaReach: "Identity monitoring logs, SSN lookup queries, and credit bureau inquiry logs are subject to US civil and criminal court orders under 15 U.S.C. § 1681.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.FCRA,
        OFFICIAL_LEGAL_STATUTES.GLBA,
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.CCPA_CPRA,
      ],
      userImpact: {
        usUser: "Built specifically around US financial infrastructure (Experian, Equifax, TransUnion). Maximum domestic identity protection backing up to $5M insurance.",
        euUser: "Not optimized for non-US identity records; credit bureau features are US-centric.",
        globalUser: "Telemetry and personal records stored in US cloud infrastructure subject to US subpoena powers.",
      },
    },
    strengths: ["All features in every plan (no upsells)", "Strong identity + financial fraud monitoring", "Child SSN monitoring & Safe Gaming", "Up to $5M/household identity insurance"],
    limits: ["Intro is a 50-60% discount — renews at full list price", "Bundled VPN/antivirus trail dedicated tools", "Data-broker removal weaker than specialists", "No permanent free tier"],
  },

  {
    name: "Norton 360 Deluxe",
    url: "https://us.norton.com/products/norton-360-deluxe",
    tagline: "Best-tested malware engine; device-first",
    price: { indivPlan: "Norton 360 Standard", indivIntro: 39.99, indivRenew: 94.99, indivCovers: "1 person, 3 devices", familyIntro: 49.99, familyRenew: 119.99, familyCovers: "5 devices (Deluxe)", adultCap: null, kidsNote: "capped by devices, not people" },
    includes: { antivirus: true, vpn: true, pwManager: true, idTheft: "LifeLock tiers (extra)", dataRemoval: "Higher tiers", parental: true, deviceCap: "5 (Deluxe)" },
    insurance: "$25K–$1M via LifeLock tiers (add-on)",
    jurisdiction: {
      origin: "United States (Mountain View / Tempe, AZ)",
      hq: "Tempe, Arizona, USA & Prague, Czech Republic (Gen Digital Inc.)",
      country: "United States / Czech Republic",
      flag: "🇺🇸",
      alliance: "5-Eyes Alliance & EU Operations",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction with extensive EU operating entities (following Avast/AVG merger into Gen Digital).",
      subpoenaReach: "Subject to US federal warrants, SEC disclosures, and EU GDPR regulator inquiries across regional hubs.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
        OFFICIAL_LEGAL_STATUTES.FCRA,
      ],
      userImpact: {
        usUser: "Direct domestic integration with LifeLock identity systems and US telecommunications law.",
        euUser: "Gen Digital maintains substantial Prague-based technical operations compliant with European GDPR privacy rules.",
        globalUser: "Endpoint telemetry routed through global intelligence clouds with high-reliability scanning.",
      },
    },
    strengths: ["Top malware detection (100% in tests)", "Fast scans, low system impact", "Best parental controls on the market", "Cloud backup + webcam protection"],
    limits: ["Renewal jumps ~40-60% after year 1", "Identity coverage costs extra (LifeLock)", "Device-count limited unless Ultimate", "Constant upsell prompts"],
  },

  {
    name: "McAfee+ (Family)",
    url: "https://www.mcafee.com/en-us/identity-theft/family.html",
    tagline: "Unlimited devices; broad identity coverage",
    price: { indivPlan: "McAfee+ Premium Individual", indivIntro: 49.99, indivRenew: 149.99, indivCovers: "1 person, unlimited devices", familyIntro: 84.99, familyRenew: 224.99, familyCovers: "6 members, unlimited devices", adultCap: 2, kidsNote: "remaining 4 seats for children" },
    includes: { antivirus: true, vpn: true, pwManager: true, idTheft: true, dataRemoval: true, parental: true, deviceCap: "Unlimited" },
    insurance: "Up to $2M per adult / $4M per family",
    jurisdiction: {
      origin: "United States (San Jose, CA)",
      hq: "San Jose, California, USA (McAfee Corp)",
      country: "United States",
      flag: "🇺🇸",
      alliance: "5-Eyes Intelligence Alliance",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction (5-Eyes / CLOUD Act). Governed by US law enforcement subpoenas and FTC oversight.",
      subpoenaReach: "Customer identity logs, transaction records, and scam protection telemetry subject to US court orders under 18 U.S.C. § 2703.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        OFFICIAL_LEGAL_STATUTES.FCRA,
        OFFICIAL_LEGAL_STATUTES.CCPA_CPRA,
      ],
      userImpact: {
        usUser: "Deep integration with US credit monitoring and full domestic insurance coverage up to $4M per household.",
        euUser: "Operates regional processing servers under EU GDPR contractual safeguards.",
        globalUser: "Cloud threat network aggregates threat signatures internationally under US corporate authority.",
      },
    },
    strengths: ["Truly unlimited devices", "Up to $4M household ID theft coverage", "Personal data cleanup included", "Beginner-friendly, strong support"],
    limits: ["Steep renewal increase after intro", "2-adult limit on Family plan", "Malware detection slightly below Norton", "VPN/PW manager are basic"],
  },

  {
    name: "Surfshark One+",
    url: "https://surfshark.com/pricing",
    tagline: "Privacy bundle: VPN + antivirus + data removal, unlimited devices",
    price: { indivPlan: "Surfshark One+ (2-yr)", indivIntro: 53.88, indivRenew: 119, indivCovers: "1 account, unlimited devices", familyIntro: 53.88, familyRenew: 119, familyCovers: "Household via unlimited devices (single account)", adultCap: null, kidsNote: "one account shared across all devices" },
    includes: { antivirus: true, vpn: true, pwManager: false, idTheft: "Alert breach monitoring", dataRemoval: true, parental: false, deviceCap: "Unlimited" },
    insurance: "None (breach alerts only)",
    jurisdiction: {
      origin: "Lithuania (Vilnius)",
      hq: "Amsterdam, Netherlands & Vilnius, Lithuania (Surfshark B.V. / Nord Security)",
      country: "Netherlands / Lithuania",
      flag: "🇳🇱",
      alliance: "9-Eyes Alliance / EU GDPR",
      allianceCategory: "9-Eyes",
      legalFramework: "Netherlands & Lithuania Jurisdiction (EU GDPR). Incogni data removal operates under statutory GDPR Art. 17 & CCPA opt-out mandates.",
      subpoenaReach: "Requires Dutch judicial warrant for account data; RAM-only VPN infrastructure means traffic logs do not exist.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
        OFFICIAL_LEGAL_STATUTES.CCPA_CPRA,
      ],
      userImpact: {
        usUser: "Provides European legal insulation for VPN traffic combined with CCPA-compliant automated broker removal via Incogni.",
        euUser: "Full statutory GDPR backing for enforcing data deletion requests across global brokers.",
        globalUser: "Dutch legal seat provides established European rule-of-law protections and independent privacy auditing.",
      },
    },
    strengths: ["Cheapest intro of any bundle here (~$4.49/mo, 2-yr)", "Incogni data-broker removal included", "CleanWeb ad/malware blocking + real antivirus", "Unlimited devices on one subscription"],
    limits: ["No password manager included", "No identity theft insurance", "Single account — no per-member profiles or parental tools", "Renews at $119/yr after the 2-yr intro"],
  },

  {
    name: "Proton Unlimited / Family",
    url: "https://proton.me/pricing",
    tagline: "Privacy ecosystem: VPN + Pass + Mail + Drive, Swiss-based",
    price: { indivPlan: "Proton Unlimited", indivIntro: 119.88, indivRenew: 119.88, indivCovers: "1 person, 10 VPN devices", familyIntro: 287.88, familyRenew: 287.88, familyCovers: "6 members, 3 TB shared storage", adultCap: null, kidsNote: "any 6 people, independent accounts" },
    includes: { antivirus: false, vpn: true, pwManager: true, idTheft: "Dark web monitoring", dataRemoval: false, parental: false, deviceCap: "10 VPN devices/user" },
    insurance: "None (monitoring only)",
    jurisdiction: {
      origin: "Switzerland (Geneva)",
      hq: "Geneva, Switzerland (Proton AG)",
      country: "Switzerland",
      flag: "🇨🇭",
      alliance: "Non-14-Eyes (Swiss Jurisdiction)",
      allianceCategory: "Swiss",
      legalFramework: "Strict Swiss Federal Jurisdiction. Completely outside the US CLOUD Act, FISA, and EU intelligence alliances.",
      subpoenaReach: "Foreign intelligence requests have no validity in Switzerland without a formal bilateral MLAT request approved by a Swiss judge under strict Swiss evidentiary standards.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.SWISS_FADP,
        OFFICIAL_LEGAL_STATUTES.SWISS_BUPF,
        OFFICIAL_LEGAL_STATUTES.SWISS_CONSTITUTION_13,
      ],
      userImpact: {
        usUser: "Full legal protection from US bulk surveillance, National Security Letters, and warrantless discovery.",
        euUser: "Swiss data privacy recognized as providing European standard privacy without EU surveillance obligations.",
        globalUser: "End-to-end encrypted ecosystem (Mail, Drive, Pass, VPN) backed by Swiss neutrality laws.",
      },
      zeroKnowledgeMitigation: "Zero-access encryption architecture means Proton servers cannot read stored emails, files, or vault items.",
    },
    strengths: ["Historically flat renewal pricing", "Password manager + encrypted email + cloud storage in one", "Open-source apps, audited, Swiss jurisdiction", "Emergency Access for up to 5 trusted contacts"],
    limits: ["No real antivirus (NetShield blocks, doesn't scan)", "No identity theft insurance or data-broker removal", "No parental controls", "Family tier is pricier than identity suites"],
  },
];

export interface VPNCompareItem {
  name: string;
  url: string;
  introMo: number;
  term: string;
  firstBill: number;
  renewYr: number;
  monthlyMo: number;
  devices: string;
  blocker: string;
  freeTier: boolean;
  audited: boolean;
  jurisdiction: JurisdictionInfo;
  strengths: string[];
  limits: string[];
}

export const VPN_COMPARE: VPNCompareItem[] = [
  {
    name: "Surfshark Starter",
    url: "https://surfshark.com/pricing",
    introMo: 2.49,
    term: "2 yr + 3 mo",
    firstBill: 53.73,
    renewYr: 79,
    monthlyMo: 15.45,
    devices: "Unlimited",
    blocker: "CleanWeb (ads + malware domains)",
    freeTier: false,
    audited: true,
    jurisdiction: {
      origin: "Lithuania (Vilnius)",
      hq: "Amsterdam, Netherlands (Surfshark B.V.)",
      country: "Netherlands",
      flag: "🇳🇱",
      alliance: "9-Eyes Intelligence Alliance",
      allianceCategory: "9-Eyes",
      legalFramework: "Netherlands Jurisdiction (EU GDPR). Operates 100% RAM-only diskless servers with independent Deloitte no-logs audits.",
      subpoenaReach: "Under Dutch law, VPN providers have no mandatory data retention obligations for consumer internet activity.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      userImpact: {
        usUser: "Protected from US ISP monitoring and copyright trolling without being subject to domestic US logging orders.",
        euUser: "Strong GDPR consumer and data subject rights; diskless servers wipe all connection state on power cycles.",
        globalUser: "Regular third-party security audits verify that no IP or timestamp mapping is persisted to physical storage.",
      },
      zeroKnowledgeMitigation: "RAM-only server architecture ensures cryptographic session keys and transient routing data vanish immediately.",
    },
    strengths: ["Cheapest credible intro rate", "Unlimited devices on every plan", "Consistent year-round pricing (no waiting for sales)"],
    limits: ["Renews at $79/yr — over 2.5× the intro rate", "2-yr commitment for the best price", "Owned by Nord Security (shared parent with NordVPN)"],
  },

  {
    name: "NordVPN Basic",
    url: "https://nordvpn.com/pricing/",
    introMo: 3.49,
    term: "2 yr + 3 mo ($94.23 upfront)",
    firstBill: 94.23,
    renewYr: 139,
    monthlyMo: 14.99,
    devices: "10",
    blocker: "Threat Protection (ads + malware)",
    freeTier: false,
    audited: true,
    jurisdiction: {
      origin: "Lithuania (Vilnius)",
      hq: "Panama City, Panama (nordvpn s.a.)",
      country: "Panama",
      flag: "🇵🇦",
      alliance: "Non-14-Eyes Alliance",
      allianceCategory: "Non-14-Eyes",
      legalFramework: "Panama Jurisdiction. Completely outside the 14-Eyes intelligence-sharing pact. No mandatory data retention laws.",
      subpoenaReach: "Foreign government agencies cannot serve binding subpoenas directly; requires complex Panamanian judicial process.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.PANAMA_LEY_81,
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      userImpact: {
        usUser: "Provides total legal severance from US domestic law enforcement jurisdiction and warrantless national security letters.",
        euUser: "Insulated from European surveillance directives while maintaining low-latency European server infrastructure.",
        globalUser: "Multiple independent audits by PwC and Deloitte confirm strict no-logs implementation.",
      },
      zeroKnowledgeMitigation: "Diskless RAM-only infrastructure with colocated server options.",
    },
    strengths: ["Fastest speeds in most independent tests", "Largest audited server network", "Renewal price shown at checkout before you commit"],
    limits: ["Steepest renewal jump here — ~$139/yr (1-yr list rate)", "10-device cap unless installed on a router", "2-yr plans renew as pricier 1-yr plans"],
  },

  {
    name: "Proton VPN Plus",
    url: "https://protonvpn.com/pricing",
    introMo: 2.99,
    term: "2 yr ($71.76 upfront)",
    firstBill: 71.76,
    renewYr: 83.88,
    monthlyMo: 9.99,
    devices: "10",
    blocker: "NetShield (ads + malware domains)",
    freeTier: true,
    audited: true,
    jurisdiction: {
      origin: "Switzerland (Geneva)",
      hq: "Geneva, Switzerland (Proton AG)",
      country: "Switzerland",
      flag: "🇨🇭",
      alliance: "Non-14-Eyes (Swiss Jurisdiction)",
      allianceCategory: "Swiss",
      legalFramework: "Swiss Federal Jurisdiction. Governed by Swiss BÜPF and NDG legislation; VPN services are not subject to telecommunication retention mandates.",
      subpoenaReach: "Swiss law strictly prohibits warrantless interception. Foreign legal requests must pass Swiss federal court review under Swiss criminal law standards.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.SWISS_FADP,
        OFFICIAL_LEGAL_STATUTES.SWISS_BUPF,
        OFFICIAL_LEGAL_STATUTES.SWISS_CONSTITUTION_13,
      ],
      userImpact: {
        usUser: "Maximum legal shielding against US surveillance (FISA Section 702, Executive Order 12333, CLOUD Act).",
        euUser: "Fully compliant with Swiss data protection standards recognized as GDPR-equivalent without joining EU surveillance networks.",
        globalUser: "All core client applications are 100% open source and independently security audited with Secure Core routing through Swiss underground bunkers.",
      },
      zeroKnowledgeMitigation: "Open-source apps with Secure Core underground multi-hop architecture routed through Switzerland and Iceland.",
    },
    strengths: ["Only major VPN with an unlimited-bandwidth free tier", "Open-source apps, Swiss jurisdiction", "Cheapest month-to-month rate ($9.99) of the majors"],
    limits: ["Renews at $83.88/yr after the 2-yr intro", "Slower on distant servers with Secure Core on", "10-device cap"],
  },

  {
    name: "ExpressVPN Basic",
    url: "https://www.expressvpn.com/order",
    introMo: 3.49,
    term: "2 yr + 4 mo (28 mo billed)",
    firstBill: 97.72,
    renewYr: 99.95,
    monthlyMo: 12.99,
    devices: "10",
    blocker: "Threat Manager (trackers + malware)",
    freeTier: false,
    audited: true,
    jurisdiction: {
      origin: "British Virgin Islands (Road Town)",
      hq: "Road Town, Tortola, British Virgin Islands (Parent: Kape Technologies, UK/Isle of Man)",
      country: "British Virgin Islands",
      flag: "🇻🇬",
      alliance: "Non-14-Eyes (BVI Autonomous Jurisdiction)",
      allianceCategory: "Non-14-Eyes",
      legalFramework: "British Virgin Islands Jurisdiction. Autonomous territory with distinct legal system, no mandatory data retention, and strict commercial confidentiality.",
      subpoenaReach: "BVI High Court order required for any legal discovery; foreign warrants hold no direct extraterritorial authority.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.BVI_DPA,
        OFFICIAL_LEGAL_STATUTES.UK_DPA,
      ],
      userImpact: {
        usUser: "Complete separation from US court reach; TrustedServer RAM technology proven in high-profile international asset seizures.",
        euUser: "Insulated from EU digital data retention directives.",
        globalUser: "Proprietary Lightway protocol is open-source and audited by Cure53 and PwC.",
      },
      zeroKnowledgeMitigation: "TrustedServer RAM-only architecture ensures every reboot reinstalls the cryptographic operating system.",
    },
    strengths: ["Most polished apps; best for beginners & travel", "Works reliably in restrictive regions", "Lightway protocol is fast and audited"],
    limits: ["Renews near $100/yr — roughly 3× the intro", "No money-back promo periods on some regional plans", "Priciest month-to-month of this group at renewal"],
  },

  {
    name: "Private Internet Access",
    url: "https://www.privateinternetaccess.com/buy-vpn-online",
    introMo: 2.19,
    term: "3 yr + 3 mo",
    firstBill: 79,
    renewYr: 56.16,
    monthlyMo: 11.95,
    devices: "Unlimited",
    blocker: "MACE (ads + trackers + malware)",
    freeTier: false,
    audited: true,
    jurisdiction: {
      origin: "United States (Denver, CO)",
      hq: "Denver, Colorado, USA (Parent: Kape Technologies)",
      country: "United States",
      flag: "🇺🇸",
      alliance: "5-Eyes Intelligence Alliance",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction (5-Eyes / CLOUD Act). Subject to US federal subpoenas and National Security Letters (NSLs).",
      subpoenaReach: "Has been subpoenaed multiple times in US federal criminal trials (FBI and US Secret Service cases); repeatedly proved in open court that zero logging records existed to turn over.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
      ],
      courtPrecedents: [
        OFFICIAL_LEGAL_STATUTES.PIA_COURT_PRECEDENT,
      ],
      userImpact: {
        usUser: "Domestic US company; while in 5-Eyes territory, their zero-logs architecture has the strongest real-world courtroom track record of any VPN.",
        euUser: "Operates under US parent framework with Deloitte-audited RAM server configurations.",
        globalUser: "All desktop and mobile clients are 100% open source and verifiable on GitHub.",
      },
      zeroKnowledgeMitigation: "Court-tested no-logs implementation and 100% open-source client codebase.",
    },
    strengths: ["Most modest renewal of the discounters (~$56/yr)", "Court-proven no-logs claims, Deloitte-audited", "Unlimited devices"],
    limits: ["US jurisdiction bothers some privacy purists", "Streaming unblocking weaker than Nord/Express", "Longest lock-in for the best rate (3+ yrs)"],
  },

  {
    name: "Mullvad",
    url: "https://mullvad.net/en/pricing",
    introMo: 5.50,
    term: "flat monthly — no contracts",
    firstBill: 5.50,
    renewYr: 66,
    monthlyMo: 5.50,
    devices: "5",
    blocker: "DNS content blocking (ads + malware)",
    freeTier: false,
    audited: true,
    jurisdiction: {
      origin: "Sweden (Gothenburg)",
      hq: "Gothenburg, Sweden (Mullvad VPN AB)",
      country: "Sweden",
      flag: "🇸🇪",
      alliance: "14-Eyes Alliance / EU GDPR",
      allianceCategory: "14-Eyes",
      legalFramework: "Swedish Jurisdiction (14-Eyes / EU GDPR). Swedish Electronic Communications Act exempts VPN services from data retention mandates.",
      subpoenaReach: "In April 2023, Swedish National Police (NOA) raided Mullvad's Gothenburg offices with a search warrant; police left empty-handed because zero user data existed.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.SWEDEN_LEK,
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      courtPrecedents: [
        OFFICIAL_LEGAL_STATUTES.MULLVAD_POLICE_WARRANT,
      ],
      userImpact: {
        usUser: "Account creation requires zero personal info (no email, no name, no password — only a generated 16-digit number). Accepts cash in an envelope or cryptocurrency.",
        euUser: "Strict Swedish consumer and GDPR rights, combined with absolute technical zero-knowledge identity.",
        globalUser: "The gold standard for radical data minimization: even if a server or office is physically seized, no user records can be obtained.",
      },
      zeroKnowledgeMitigation: "Numbered token accounts with zero personal data collection, cash payment support, and RAM-only server deployment.",
    },
    strengths: ["Flat ~$5.50/mo since 2009 — zero intro games, zero renewal hikes", "No email required — anonymous numbered accounts, cash accepted", "Police raid produced no user data"],
    limits: ["No long-term discounts at all", "5-device cap", "One Netflix library; weak for streaming/travel"],
  },
];

export interface AVCompareItem {
  name: string;
  url: string;
  introYr: number;
  renewYr: number;
  devices: string;
  platforms: string;
  introMoNote?: string;
  jurisdiction: JurisdictionInfo;
  strengths: string[];
  limits: string[];
}

export const AV_COMPARE: AVCompareItem[] = [
  {
    name: "Microsoft Defender (built-in)",
    url: "https://www.microsoft.com/en-us/windows/comprehensive-security",
    introYr: 0,
    renewYr: 0,
    devices: "Every Windows PC",
    platforms: "Windows (XProtect on macOS)",
    jurisdiction: {
      origin: "United States (Redmond, WA)",
      hq: "Redmond, Washington, USA (Microsoft Corp)",
      country: "United States",
      flag: "🇺🇸",
      alliance: "5-Eyes Intelligence Alliance",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction (5-Eyes / US CLOUD Act / Microsoft Privacy Policy). Governed by US federal law enforcement and FTC standards.",
      subpoenaReach: "Telemetry, SmartScreen URL lookups, and cloud behavioral data can be subpoenaed under US legal process.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        OFFICIAL_LEGAL_STATUTES.FISA_702,
      ],
      userImpact: {
        usUser: "Native Windows operating system integration. High reliability with zero third-party software installation overhead.",
        euUser: "Complies with EU Data Boundary provisions for enterprise and consumer Windows data.",
        globalUser: "Backed by Microsoft's global threat intelligence indexing billions of endpoint signals daily.",
      },
    },
    strengths: ["Free, already installed, always on", "Solid real-time protection in independent tests", "Zero renewal games — the honest baseline"],
    limits: ["Windows-only (macOS has separate built-in XProtect)", "No cross-device dashboard for a household", "No phishing/web protection outside Edge"],
  },

  {
    name: "Bitdefender Total Security",
    url: "https://www.bitdefender.com/en-us/consumer/total-security",
    introYr: 49.99,
    renewYr: 109.99,
    devices: "5",
    platforms: "Win / Mac / iOS / Android",
    jurisdiction: {
      origin: "Romania (Bucharest)",
      hq: "Bucharest, Romania (Bitdefender S.R.L.)",
      country: "Romania",
      flag: "🇷🇴",
      alliance: "EU GDPR / Non-14-Eyes",
      allianceCategory: "Non-14-Eyes",
      legalFramework: "Romanian & EU Jurisdiction. Romania is an EU member state outside the 14-Eyes pact; the Romanian Constitutional Court struck down mandatory data retention laws as unconstitutional.",
      subpoenaReach: "Requires Romanian judicial authorization under EU privacy directives; strong statutory protections against bulk surveillance.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
        OFFICIAL_LEGAL_STATUTES.ROMANIA_CCR_1258,
      ],
      userImpact: {
        usUser: "Provides European cybersecurity engineering independent of US big-tech surveillance ecosystems.",
        euUser: "Full statutory GDPR adherence with headquarters directly within the European Union.",
        globalUser: "Consistently rated #1 for threat telemetry and signature accuracy worldwide.",
      },
    },
    strengths: ["Top scores at AV-TEST & AV-Comparatives year after year", "Lightest system impact in its class", "Includes password manager + webcam protection"],
    limits: ["Renews at $109.99/yr — more than 2× the intro", "Bundled VPN capped at 200 MB/day per device", "First-year price varies wildly by retailer/promo"],
  },

  {
    name: "Norton 360 Deluxe",
    url: "https://us.norton.com/products/norton-360-deluxe",
    introYr: 49.99,
    renewYr: 119.99,
    devices: "5",
    platforms: "Win / Mac / iOS / Android",
    jurisdiction: {
      origin: "United States (Mountain View / Tempe, AZ)",
      hq: "Tempe, Arizona, USA (Gen Digital Inc.)",
      country: "United States",
      flag: "🇺🇸",
      alliance: "5-Eyes Alliance & EU Hub",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction (5-Eyes / US CLOUD Act) with major European corporate nexus in Prague.",
      subpoenaReach: "Subject to US federal agency subpoenas, civil discovery, and mandatory corporate reporting.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      userImpact: {
        usUser: "Deeply entrenched in US domestic identity infrastructure with optional LifeLock restoration services.",
        euUser: "Protected under European General Data Protection Regulation for EU residents.",
        globalUser: "Cloud analysis engines operate across US, European, and Asia-Pacific datacenters.",
      },
    },
    strengths: ["100% detection in recent independent tests", "Unlimited-data VPN + cloud backup included", "Best parental controls of the group"],
    limits: ["Renews at ~$120/yr (some report $124.99)", "Frequent in-app upsell prompts", "5-device cap without pricier tiers"],
  },

  {
    name: "McAfee Total Protection",
    url: "https://www.mcafee.com/en-us/antivirus/mcafee-total-protection.html",
    introYr: 29.99,
    renewYr: 119.99,
    devices: "5",
    platforms: "Win / Mac / iOS / Android",
    jurisdiction: {
      origin: "United States (San Jose, CA)",
      hq: "San Jose, California, USA (McAfee Corp)",
      country: "United States",
      flag: "🇺🇸",
      alliance: "5-Eyes Intelligence Alliance",
      allianceCategory: "5-Eyes",
      legalFramework: "US Federal Jurisdiction (5-Eyes / US CLOUD Act). Operates under California and US federal consumer laws.",
      subpoenaReach: "Threat telemetry, web protection heuristics, and user account records can be compelled via US court orders.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.CLOUD_ACT,
        OFFICIAL_LEGAL_STATUTES.STORED_COMMUNICATIONS_ACT,
        OFFICIAL_LEGAL_STATUTES.CCPA_CPRA,
      ],
      userImpact: {
        usUser: "Primary service focus is US consumer and family protection with extensive retail partner integration.",
        euUser: "Maintains EU data processing agreements to satisfy cross-border transfer requirements.",
        globalUser: "Global threat intelligence network monitors endpoint telemetry worldwide.",
      },
    },
    strengths: ["Lowest 5-device intro price here", "Strong scam/phishing protection", "Upgrade path to unlimited devices (McAfee+)"],
    limits: ["Renews at 4× the intro price", "Detection scores slightly below Norton/Bitdefender", "Heavier system impact than Bitdefender"],
  },

  {
    name: "TotalAV Internet Security",
    url: "https://www.totalav.com/",
    introYr: 39,
    renewYr: 129,
    devices: "6",
    platforms: "Win / Mac / iOS / Android",
    jurisdiction: {
      origin: "United Kingdom (Fareham, Hampshire)",
      hq: "Fareham, Hampshire, United Kingdom (Protected.net Group Ltd)",
      country: "United Kingdom",
      flag: "🇬🇧",
      alliance: "5-Eyes Alliance / UK GDPR",
      allianceCategory: "5-Eyes",
      legalFramework: "UK Jurisdiction (5-Eyes Alliance / UK Investigatory Powers Act / UK GDPR). Governed by the Information Commissioner's Office (ICO).",
      subpoenaReach: "UK authorities have broad surveillance powers under the Investigatory Powers Act ('Snooper's Charter'); subject to UK High Court orders.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.UK_IPA,
        OFFICIAL_LEGAL_STATUTES.UK_DPA,
      ],
      userImpact: {
        usUser: "Foreign UK entity subject to UK/US bilateral data access agreements.",
        euUser: "UK holds European Commission adequacy decision under UK GDPR.",
        globalUser: "Commercial software operating primarily through UK corporate entity.",
      },
    },
    strengths: ["Very beginner-friendly interface", "Includes a full VPN in the Internet Security tier", "Efficient malware detection in tests"],
    limits: ["Steepest renewal multiple here (~3.3×)", "No firewall; lacks behavior-based detection", "Aggressive upsells and rebilling complaints"],
  },

  {
    name: "Surfshark One",
    url: "https://surfshark.com/one",
    introMoNote: "$2.79/mo (2-yr)",
    introYr: 67,
    renewYr: 99,
    devices: "Unlimited",
    platforms: "Win / Mac / iOS / Android",
    jurisdiction: {
      origin: "Lithuania / Netherlands",
      hq: "Amsterdam, Netherlands & Vilnius, Lithuania (Surfshark B.V.)",
      country: "Netherlands / Lithuania",
      flag: "🇳🇱",
      alliance: "9-Eyes Alliance / EU GDPR",
      allianceCategory: "9-Eyes",
      legalFramework: "Netherlands & Lithuania Jurisdiction (EU GDPR). Audited endpoint and malware analysis under European privacy standards.",
      subpoenaReach: "Complies with Dutch statutory judicial process; strict limits on warrantless user data sharing.",
      governingStatutes: [
        OFFICIAL_LEGAL_STATUTES.EU_GDPR,
      ],
      userImpact: {
        usUser: "Consumer privacy protected under European GDPR standards.",
        euUser: "Native European service operating within the EU single market with full data subject rights.",
        globalUser: "All telemetry processed under European privacy safeguards.",
      },
    },
    strengths: ["Antivirus + full VPN + breach alerts in one sub", "Unlimited devices — best per-device price for big homes", "Real-time protection now scored well by AV-TEST"],
    limits: ["Renews at $99/yr", "Antivirus is newer with a shorter testing track record", "No firewall or parental controls"],
  },
];
