import React, { useState, useMemo } from 'react';
import {
  Shield,
  Smartphone,
  Monitor,
  Users,
  Key,
  Wallet,
  Router,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
  MoveHorizontal,
} from 'lucide-react';
import {
  CARRIERS,
  VAULT_PICKS,
  FREE_TIERS,
  FREE_TIER_URL,
  VPN_BLOCKERS,
  AV_SUITES,
  VPN_CHOICES,
  ASURION_BUNDLE,
} from '../data';

export const AdvisorView: React.FC = () => {
  // State with exact defaults
  const [mobileDevices, setMobileDevices] = useState(4);
  const [desktopDevices, setDesktopDevices] = useState(2);
  const [household, setHousehold] = useState(4);
  const [vaultAdults, setVaultAdults] = useState(3);
  const [vaultKids, setVaultKids] = useState(1);
  const [budget, setBudget] = useState(15);
  const [sharing, setSharing] = useState(true);
  const [carrier, setCarrier] = useState<string>('AT&T');
  const [sameISP, setSameISP] = useState(false);
  const [routerVpn, setRouterVpn] = useState<'yes' | 'maybe' | 'no'>('maybe');
  const [vpnChoice, setVpnChoice] = useState<string | null>(null);
  const [wantMobileAV, setWantMobileAV] = useState(true);
  const [wantDesktopAV, setWantDesktopAV] = useState(true);
  const [buysOnAmazon, setBuysOnAmazon] = useState(false);
  const [amazonSpend, setAmazonSpend] = useState(500);
  const [submitted, setSubmitted] = useState(false);

  const devices = mobileDevices + desktopDevices;

  // Plan Engine computation
  const plan = useMemo(() => {
    const c = CARRIERS[carrier] || CARRIERS['Other / Not sure'];
    const networkActive = (c.isISP || sameISP) && c.networkPerks.length > 0;
    const mobileCovered = c.mobilePerks.length > 0;
    const desktopInstallable = /installs on desktop|incl\. desktop|on individual devices/i.test(
      c.mobilePerks.join(' ')
    );
    const desktopCovered = networkActive || desktopInstallable;
    const desktopGap = desktopDevices > 0 && !desktopCovered;

    const totalVaultPeople = vaultAdults + vaultKids;
    const fits = VAULT_PICKS.filter(
      (v) => vaultAdults <= v.adultCap && totalVaultPeople <= v.totalSeats
    );
    const vault = fits[0] || VAULT_PICKS[VAULT_PICKS.length - 1];
    const overflowAdults = Math.max(0, vaultAdults - vault.adultCap);
    const hasOverflow = overflowAdults > 0;

    const carrierHasVpn =
      /VPN/i.test(c.mobilePerks.join(' ')) || /VPN/i.test(c.note);
    const vpnPool =
      routerVpn === 'yes'
        ? VPN_CHOICES.filter((v) => v.routerCapable)
        : VPN_CHOICES;
    const vpnShortlist = vpnPool.slice(0, 2);
    const chosenVpn =
      (vpnChoice && vpnShortlist.find((v) => v.id === vpnChoice)) ||
      vpnShortlist[0];
    const vpnDecided = !!(vpnChoice && vpnShortlist.find((v) => v.id === vpnChoice));

    const mobileAVneeded = wantMobileAV && !mobileCovered ? mobileDevices : 0;
    const desktopAVneeded = wantDesktopAV && !desktopCovered ? desktopDevices : 0;
    const agentsNeeded = mobileAVneeded + desktopAVneeded;
    const wantsAnyAV = wantMobileAV || wantDesktopAV;
    const avSuite =
      agentsNeeded > 0
        ? AV_SUITES.find((s) => s.deviceCap === null || agentsNeeded <= s.deviceCap) ||
          AV_SUITES[0]
        : null;
    const antivirusNeeded = agentsNeeded > 0;

    // Cost roll-up lineItems
    interface LineItem {
      label: string;
      url: string;
      price: { intro: number; renew: number; monthly: number | null; term: string };
      pending?: boolean;
    }

    const lineItems: LineItem[] = [];

    // 1. Vault
    lineItems.push({
      label: vault.name,
      url: vault.url,
      price: vault.price,
      pending: false,
    });

    // 2. Extra adults overflow
    if (hasOverflow) {
      lineItems.push({
        label: `Free accounts × ${overflowAdults} (extra adults)`,
        url: FREE_TIER_URL,
        price: { intro: 0, renew: 0, monthly: null, term: 'free' },
        pending: false,
      });
    }

    // 3. VPN
    lineItems.push({
      label: `${chosenVpn.name} (VPN)`,
      url: chosenVpn.url,
      price: chosenVpn.price,
      pending: !vpnDecided,
    });

    // 4. Antivirus suite
    if (antivirusNeeded && avSuite) {
      lineItems.push({
        label: avSuite.name,
        url: avSuite.url,
        price: avSuite.price,
        pending: false,
      });
    }

    const yearlyIntro = lineItems.reduce((acc, item) => acc + (item.price.intro || 0), 0);
    const yearlyRenew = lineItems.reduce((acc, item) => acc + (item.price.renew || 0), 0);
    const total = +(yearlyIntro / 12).toFixed(2);
    const monthlyRenew = +(yearlyRenew / 12).toFixed(2);
    const overBudget = total > budget;

    // Optional alternative path: Asurion Complete Protect (Amazon bundle).
    // Only considered when the user buys on Amazon. It replaces the VPN line and
    // the antivirus line for up to its device cap; any devices beyond the cap
    // fall back to the standalone suite choice. The password manager line is
    // kept because the bundled Norton's password manager is not confirmed.
    let asurion: null | {
      lineItems: LineItem[];
      remainderAgents: number;
      remainderSuite: (typeof AV_SUITES)[number] | null;
      total: number;
      monthlyRenew: number;
      yearlyIntro: number;
      yearlyRenew: number;
      overBudget: boolean;
      steps: { title: string; body: string }[];
    } = null;
    if (buysOnAmazon) {
      const remainderAgents = Math.max(0, agentsNeeded - ASURION_BUNDLE.deviceCap);
      const remainderSuite =
        remainderAgents > 0
          ? AV_SUITES.find((s) => s.deviceCap === null || remainderAgents <= s.deviceCap) ||
            AV_SUITES[0]
          : null;
      const aItems: LineItem[] = [
        { label: vault.name, url: vault.url, price: vault.price, pending: false },
      ];
      if (hasOverflow) {
        aItems.push({
          label: `Free accounts × ${overflowAdults} (extra adults)`,
          url: FREE_TIER_URL,
          price: { intro: 0, renew: 0, monthly: null, term: 'free' },
          pending: false,
        });
      }
      const bundleYear = +(ASURION_BUNDLE.monthly * 12).toFixed(2);
      aItems.push({
        label: ASURION_BUNDLE.name,
        url: ASURION_BUNDLE.sourceUrl,
        price: { intro: bundleYear, renew: bundleYear, monthly: ASURION_BUNDLE.monthly, term: 'monthly' },
        pending: false,
      });
      if (remainderSuite) {
        aItems.push({
          label: `${remainderSuite.name} (remaining ${remainderAgents} device${remainderAgents > 1 ? 's' : ''})`,
          url: remainderSuite.url,
          price: remainderSuite.price,
          pending: false,
        });
      }
      const aIntro = aItems.reduce((acc, i) => acc + (i.price.intro || 0), 0);
      const aRenew = aItems.reduce((acc, i) => acc + (i.price.renew || 0), 0);
      const aTotal = +(aIntro / 12).toFixed(2);
      const aSteps: { title: string; body: string }[] = [
        {
          title: 'Enroll in Complete Protect through Amazon',
          body: 'Use the Amazon link above and subscribe to Asurion Complete Protect from your Amazon account. Billing is monthly and you can cancel anytime from the same Amazon account.',
        },
        {
          title: `Activate ${ASURION_BUNDLE.bundledProduct} through your Asurion/Norton account`,
          body: `After enrolling, follow the activation instructions from Asurion to create or sign in to your Norton account, then install it on up to ${ASURION_BUNDLE.deviceCap} devices. Turn on real-time scanning and the VPN.`,
        },
      ];
      if (remainderSuite) {
        aSteps.push({
          title: `Cover the remaining ${remainderAgents} device${remainderAgents > 1 ? 's' : ''} with ${remainderSuite.name}`,
          body: `The bundle covers up to ${ASURION_BUNDLE.deviceCap} devices. Install ${remainderSuite.name} on the rest, the same way the standalone path does.`,
        });
      }
      asurion = {
        lineItems: aItems,
        remainderAgents,
        remainderSuite,
        total: aTotal,
        monthlyRenew: +(aRenew / 12).toFixed(2),
        yearlyIntro: aIntro,
        yearlyRenew: aRenew,
        overBudget: aTotal > budget,
        steps: aSteps,
      };
    }

    // Steps Generation
    const steps: { title: string; body: string }[] = [];

    // Step 1: Carrier
    let carrierStepBody = '';
    if (networkActive) {
      carrierStepBody = `Log into your ${carrier} account and turn on the router-level security (it covers desktops automatically). Install the mobile security app on each phone/tablet.`;
    } else if (mobileCovered) {
      carrierStepBody = `Install the ${carrier} security app on every phone and tablet and enable it. If a desktop browsing-protection extension is offered, add it to each computer.`;
    } else {
      carrierStepBody = `Confirm with ${carrier} what's included — activate any free security or spam-blocking tools before buying anything.`;
    }
    steps.push({
      title: `Activate what ${carrier} already includes`,
      body: carrierStepBody,
    });

    // Step 2: Vault
    steps.push({
      title: `Set up ${vault.name} on the paid seats`,
      body: `One adult creates the account and becomes the plan organizer. Add the other paid adult${
        vault.adultCap > 2 ? 's' : ''
      } and any children as members. Each person sets their own strong master password — the organizer never sees it.`,
    });

    // Steps 3 & 4 (if overflow) or Step 5 (if sharing)
    if (hasOverflow) {
      steps.push({
        title: `Create free accounts for the ${overflowAdults} extra adult${
          overflowAdults > 1 ? 's' : ''
        }`,
        body: `Have each extra adult sign up for a free vault (${FREE_TIERS}) using their own email. They'll manage their personal passwords there at no cost.`,
      });
      steps.push({
        title: 'Build a shared vault on a paid seat, then share outward',
        body: 'On the paid plan, create a shared vault (e.g. "Household") for the passwords everyone needs — streaming, utilities, Wi-Fi. Use the "share item" feature to send those specific logins to each free-account adult by their email. Set them to read-only unless they need to edit.',
      });
    } else if (sharing) {
      steps.push({
        title: 'Create a shared household vault',
        body: "Make one shared vault for passwords the family uses in common (streaming, Wi-Fi, utilities) and keep personal logins in each member's private vault. Set kids' access to only what they need.",
      });
    }

    // Step: Import passwords
    steps.push({
      title: 'Import existing passwords and run a health check',
      body: 'Each member imports saved passwords from their browser, then runs the built-in password health / breach scanner. Replace anything flagged as weak, reused, or breached — starting with email and banking.',
    });

    // Step: VPN
    if (routerVpn === 'yes') {
      steps.push({
        title: 'Install the VPN on your router',
        body: `Sign up for ${chosenVpn.name}, then follow their router-setup guide to install it on your router. Every device on your Wi-Fi is then covered by one subscription — no per-device apps needed.`,
      });
    } else {
      steps.push({
        title: 'Set up the VPN on each device',
        body: `Sign up for ${chosenVpn.name} and install the app on each device that leaves the house (laptops, phones). Turn on the kill switch and auto-connect on untrusted Wi-Fi.`,
      });
    }

    // Step: Antivirus
    if (antivirusNeeded && avSuite) {
      if (avSuite.deviceCap === null) {
        steps.push({
          title: `Install ${avSuite.name} on the ${agentsNeeded} device(s) that need it`,
          body: `${avSuite.name} covers unlimited devices, so one subscription installs on every phone and computer that isn't already protected by ${carrier}. Turn on real-time scanning and let it auto-update.`,
        });
      } else {
        const types: string[] = [];
        if (mobileAVneeded > 0) types.push('phone');
        if (desktopAVneeded > 0) types.push('computer');
        const targetText = types.join(' and/or ');
        steps.push({
          title: `Install ${avSuite.name} on the ${agentsNeeded} device(s) that need it`,
          body: `${avSuite.name} covers up to ${avSuite.deviceCap} devices — enough for your ${agentsNeeded}. Install the agent on each ${targetText} that ${carrier} doesn't already cover. Turn on real-time scanning and let it auto-update.`,
        });
      }
    } else if (wantsAnyAV && !antivirusNeeded) {
      steps.push({
        title: "Skip a paid anti-malware suite — you're covered",
        body: `The protection you already have (${carrier}${
          desktopCovered ? ' plus built-in OS defenses' : ''
        }) covers the devices you wanted agents on. Also worth knowing: your VPN's built-in blocker (${VPN_BLOCKERS}) filters malicious sites and ads at the network level, adding a layer without another install.`,
      });
    }

    return {
      c,
      networkActive,
      mobileCovered,
      desktopCovered,
      desktopGap,
      vault,
      hasOverflow,
      overflowAdults,
      carrierHasVpn,
      vpnShortlist,
      chosenVpn,
      vpnDecided,
      mobileAVneeded,
      desktopAVneeded,
      agentsNeeded,
      wantsAnyAV,
      avSuite,
      antivirusNeeded,
      lineItems,
      yearlyIntro,
      yearlyRenew,
      total,
      monthlyRenew,
      overBudget,
      steps,
      asurion,
    };
  }, [
    mobileDevices,
    desktopDevices,
    household,
    vaultAdults,
    vaultKids,
    sharing,
    carrier,
    sameISP,
    routerVpn,
    vpnChoice,
    wantMobileAV,
    wantDesktopAV,
    buysOnAmazon,
    budget,
  ]);

  const selectedCarrierData = CARRIERS[carrier] || CARRIERS['Other / Not sure'];

  return (
    <div style={{ background: '#F9F7F2', paddingTop: 36, minHeight: '100vh', color: '#1A1A1A' }}>
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          padding: '0 24px 72px',
          color: '#1A1A1A',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            color: '#C5A059',
            fontWeight: 700,
            fontSize: '10.5px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <Shield size={14} />
          <span>Section I // Household Security Audit</span>
        </div>

        {/* Hero Headline */}
        <h1
          style={{
            fontFamily: "'Newsreader', 'Spectral', serif",
            fontSize: '44px',
            fontWeight: 500,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
            color: '#1A1A1A',
          }}
        >
          Right-size your household security posture.
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontSize: '16px',
            color: '#4A4A4A',
            maxWidth: 620,
            lineHeight: 1.6,
            margin: '0 0 36px',
            fontFamily: "'Newsreader', 'Spectral', serif",
            fontStyle: 'italic',
          }}
        >
          Most households overspend by purchasing redundant tools that their mobile carrier or router already supplies.
          Complete the six parameters below to generate an independent, deduplicated allocation plan.
        </p>

        {/* Input Cards Grid */}
        <div className="two-col" style={{ gap: 16 }}>
          {/* Card 1: Mobile Devices */}
          <div className="advisor-card">
            <div className="field-label">
              <Smartphone size={14} />
              <span>Mobile devices (phones / tablets)</span>
            </div>
            <div className="num" style={{ marginBottom: 12 }}>
              {mobileDevices}
            </div>
            <input
              type="range"
              min={0}
              max={15}
              value={mobileDevices}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setMobileDevices(Number.isNaN(val) ? 0 : Math.max(0, Math.min(15, val)));
              }}
              aria-label="Mobile devices"
            />
          </div>

          {/* Card 2: Desktop Devices */}
          <div className="advisor-card">
            <div className="field-label">
              <Monitor size={14} />
              <span>Desktops / workstations</span>
            </div>
            <div className="num" style={{ marginBottom: 12 }}>
              {desktopDevices}
            </div>
            <input
              type="range"
              min={0}
              max={15}
              value={desktopDevices}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDesktopDevices(Number.isNaN(val) ? 0 : Math.max(0, Math.min(15, val)));
              }}
              aria-label="Desktops and laptops"
            />
          </div>

          {/* Card 3: People in household */}
          <div className="advisor-card">
            <div className="field-label">
              <Users size={14} />
              <span>Household members</span>
            </div>
            <div className="num" style={{ marginBottom: 12 }}>
              {household}
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={household}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setHousehold(Number.isNaN(val) ? 1 : Math.max(1, Math.min(10, val)));
              }}
              aria-label="People in household"
            />
          </div>

          {/* Card 4: Adults needing vault */}
          <div className="advisor-card">
            <div className="field-label">
              <Key size={14} />
              <span>Adult seats required</span>
            </div>
            <div className="num" style={{ marginBottom: 12 }}>
              {vaultAdults}
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={vaultAdults}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setVaultAdults(Number.isNaN(val) ? 1 : Math.max(1, Math.min(8, val)));
              }}
              aria-label="Adults needing a vault"
            />
          </div>

          {/* Card 5: Kids needing vault */}
          <div className="advisor-card">
            <div className="field-label">
              <Users size={14} />
              <span>Children / dependent seats</span>
            </div>
            <div className="num" style={{ marginBottom: 12 }}>
              {vaultKids}
            </div>
            <input
              type="range"
              min={0}
              max={8}
              value={vaultKids}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setVaultKids(Number.isNaN(val) ? 0 : Math.max(0, Math.min(8, val)));
              }}
              aria-label="Children needing a vault"
            />
          </div>

          {/* Card 6: Monthly Budget */}
          <div className="advisor-card">
            <div className="field-label">
              <Wallet size={14} />
              <span>Target monthly budget</span>
            </div>
            <div className="num" style={{ marginBottom: 12 }}>
              ${budget}
            </div>
            <input
              type="range"
              min={0}
              max={40}
              value={budget}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setBudget(Number.isNaN(val) ? 0 : Math.max(0, Math.min(40, val)));
              }}
              aria-label="Monthly budget"
            />
          </div>

          {/* Full-width Card: Sharing */}
          <div className="advisor-card" style={{ gridColumn: '1 / -1' }}>
            <div className="field-label">
              <Key size={14} />
              <span>Shared credentials required between household members?</span>
            </div>
            <div className="seg" style={{ maxWidth: 280 }}>
              <button
                type="button"
                className={sharing ? 'on' : ''}
                onClick={() => setSharing(true)}
              >
                Yes (Shared vaults)
              </button>
              <button
                type="button"
                className={!sharing ? 'on' : ''}
                onClick={() => setSharing(false)}
              >
                No (Individual only)
              </button>
            </div>
          </div>

          {/* Full-width Card: Mobile Carrier */}
          <div className="advisor-card" style={{ gridColumn: '1 / -1' }}>
            <div className="field-label">
              <Smartphone size={14} />
              <span>Primary mobile / telecommunications carrier</span>
            </div>
            <div className="seg" style={{ marginBottom: 12 }}>
              {Object.keys(CARRIERS).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={carrier === key ? 'on' : ''}
                  onClick={() => setCarrier(key)}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Conditional Sub-block for Carrier ISP */}
            {!selectedCarrierData.isISP &&
              selectedCarrierData.networkPerks.length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid rgba(26, 26, 26, 0.08)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: '#1A1A1A',
                      marginBottom: 6,
                    }}
                  >
                    <Router size={15} color="#C5A059" />
                    <span>Is {carrier} also your residential internet service provider (ISP)?</span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: '#4A4A4A',
                      margin: '0 0 10px',
                      lineHeight: 1.5,
                    }}
                  >
                    Inclusions differ: mobile apps protect handheld endpoints, whereas home ISP subscriptions protect traffic at the gateway router — covering desktop endpoints without extra software.
                  </p>
                  <div className="seg" style={{ maxWidth: 220 }}>
                    <button
                      type="button"
                      className={sameISP ? 'on' : ''}
                      onClick={() => setSameISP(true)}
                    >
                      Yes (Same ISP)
                    </button>
                    <button
                      type="button"
                      className={!sameISP ? 'on' : ''}
                      onClick={() => setSameISP(false)}
                    >
                      No (Different ISP)
                    </button>
                  </div>
                </div>
              )}
          </div>

          {/* Full-width Card: Router VPN */}
          <div className="advisor-card" style={{ gridColumn: '1 / -1' }}>
            <div className="field-label">
              <Router size={14} />
              <span>Can your gateway router execute client-side VPN tunnels (OpenVPN / WireGuard)?</span>
            </div>
            <div className="seg" style={{ maxWidth: 440 }}>
              <button
                type="button"
                className={routerVpn === 'yes' ? 'on' : ''}
                onClick={() => setRouterVpn('yes')}
              >
                Yes (Router compatible)
              </button>
              <button
                type="button"
                className={routerVpn === 'maybe' ? 'on' : ''}
                onClick={() => setRouterVpn('maybe')}
              >
                Uncertain
              </button>
              <button
                type="button"
                className={routerVpn === 'no' ? 'on' : ''}
                onClick={() => setRouterVpn('no')}
              >
                No (Endpoint installs only)
              </button>
            </div>
          </div>

          {/* Half-width Card: Mobile Anti-malware */}
          <div className="advisor-card">
            <div className="field-label">
              <Smartphone size={14} />
              <span>Endpoint anti-malware agent on mobile?</span>
            </div>
            <div className="seg" style={{ maxWidth: 220 }}>
              <button
                type="button"
                className={wantMobileAV ? 'on' : ''}
                onClick={() => setWantMobileAV(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={!wantMobileAV ? 'on' : ''}
                onClick={() => setWantMobileAV(false)}
              >
                No
              </button>
            </div>
          </div>

          {/* Half-width Card: Desktop Anti-malware */}
          <div className="advisor-card">
            <div className="field-label">
              <Monitor size={14} />
              <span>Endpoint anti-malware agent on desktops?</span>
            </div>
            <div className="seg" style={{ maxWidth: 220 }}>
              <button
                type="button"
                className={wantDesktopAV ? 'on' : ''}
                onClick={() => setWantDesktopAV(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={!wantDesktopAV ? 'on' : ''}
                onClick={() => setWantDesktopAV(false)}
              >
                No
              </button>
            </div>
          </div>

          {/* Half-width Card: Amazon purchases */}
          <div className="advisor-card">
            <div className="field-label">
              <Wallet size={14} />
              <span>Do you regularly buy electronics, appliances, or furniture on Amazon?</span>
            </div>
            <div className="seg" style={{ maxWidth: 220 }}>
              <button
                type="button"
                className={buysOnAmazon ? 'on' : ''}
                onClick={() => setBuysOnAmazon(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={!buysOnAmazon ? 'on' : ''}
                onClick={() => setBuysOnAmazon(false)}
              >
                No
              </button>
            </div>
          </div>

          {/* Half-width Card: Amazon annual spend (only when Yes) */}
          {buysOnAmazon && (
            <div className="advisor-card">
              <div className="field-label">
                <Wallet size={14} />
                <span>Approx. yearly Amazon spend on those purchases</span>
              </div>
              <div className="num" style={{ marginBottom: 12 }}>
                ${amazonSpend.toLocaleString('en-US')}
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={amazonSpend}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAmazonSpend(Number.isNaN(val) ? 0 : Math.max(0, Math.min(5000, val)));
                }}
                aria-label="Yearly Amazon spend on electronics, appliances and furniture"
              />
            </div>
          )}
        </div>

        {/* Go button */}
        <button
          type="button"
          className="go"
          style={{ marginTop: 22 }}
          onClick={() => setSubmitted(true)}
        >
          <span>Calculate Optimized Household Plan</span>
          <ChevronRight size={16} />
        </button>

        {/* RESULTS SECTION */}
        {submitted && (
          <div style={{ marginTop: 40 }}>
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 18,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(26, 26, 26, 0.1)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: '#C5A059',
                    marginBottom: 4,
                  }}
                >
                  Audit Findings
                </div>
                <h2
                  style={{
                    fontFamily: "'Newsreader', 'Spectral', serif",
                    fontSize: '30px',
                    fontWeight: 500,
                    margin: 0,
                    color: '#1A1A1A',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Your Right-Sized Security Blueprint
                </h2>
              </div>
              <span
                className="pill"
                style={{
                  background: plan.overBudget ? '#FBE4DE' : '#E4EFE6',
                  color: plan.overBudget ? '#A34E36' : '#1E7A46',
                  border: `1px solid ${plan.overBudget ? 'rgba(163, 78, 54, 0.2)' : 'rgba(30, 122, 70, 0.2)'}`,
                  fontSize: '11.5px',
                  padding: '6px 12px',
                }}
              >
                ~${plan.total}/mo intro · ${plan.monthlyRenew}/mo renewal ·{' '}
                {plan.overBudget ? 'Exceeds budget' : 'Within budget target'}
              </span>
            </div>

            {/* Results Card with 4 rec-rows */}
            <div className="advisor-card" style={{ padding: '8px 24px' }}>
              {/* Row 1: Carrier Check */}
              <div className="rec-row">
                <div className="ico">
                  <Smartphone size={17} color="#1A1A1A" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '19px',
                      fontWeight: 600,
                      margin: '0 0 8px',
                      color: '#1A1A1A',
                    }}
                  >
                    1. Existing Telecommunications Baseline ({carrier})
                  </h3>

                  {/* Mobile Sub-block */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Smartphone size={13} color="#767064" />
                      <strong style={{ fontSize: '12.5px', color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Mobile Endpoints ({mobileDevices})
                      </strong>
                      <span
                        className="pill"
                        style={{
                          fontSize: 10.5,
                          padding: '2px 7px',
                          background: plan.mobileCovered ? '#E4EFE6' : '#E8E4DB',
                          color: plan.mobileCovered ? '#1E7A46' : '#6B655C',
                        }}
                      >
                        {plan.mobileCovered
                          ? 'App Inclusions Active'
                          : 'No Carrier Inclusions'}
                      </span>
                    </div>
                    {plan.c.mobilePerks.length > 0 ? (
                      <ul
                        style={{
                          margin: '4px 0 0 18px',
                          padding: 0,
                          fontSize: 13.5,
                          color: '#4A4A4A',
                          lineHeight: 1.5,
                        }}
                      >
                        {plan.c.mobilePerks.map((perk, idx) => (
                          <li key={idx}>{perk}</li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        style={{
                          margin: '2px 0 0 22px',
                          fontSize: 13,
                          color: '#8C8275',
                        }}
                      >
                        None identified in public tier audits.
                      </p>
                    )}
                  </div>

                  {/* Desktop Sub-block */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Monitor size={13} color="#767064" />
                      <strong style={{ fontSize: '12.5px', color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Workstation / Desktop Endpoints ({desktopDevices})
                      </strong>
                      <span
                        className="pill"
                        style={{
                          fontSize: 10.5,
                          padding: '2px 7px',
                          background: plan.desktopCovered ? '#E4EFE6' : '#FBE4DE',
                          color: plan.desktopCovered ? '#1E7A46' : '#A34E36',
                        }}
                      >
                        {plan.desktopCovered && plan.networkActive
                          ? 'Protected at Router'
                          : plan.desktopCovered && !plan.networkActive
                          ? 'Covered via Desktop App'
                          : 'Uncovered Gap'}
                      </span>
                    </div>
                    {plan.networkActive ? (
                      <ul
                        style={{
                          margin: '4px 0 0 18px',
                          padding: 0,
                          fontSize: 13.5,
                          color: '#4A4A4A',
                          lineHeight: 1.5,
                        }}
                      >
                        {plan.c.networkPerks.map((perk, idx) => (
                          <li key={idx}>{perk}</li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        style={{
                          margin: '2px 0 0 22px',
                          fontSize: 13.5,
                          color: '#4A4A4A',
                          lineHeight: 1.5,
                        }}
                      >
                        {plan.desktopCovered
                          ? 'Carrier suite provides direct desktop client installers.'
                          : `Carrier mobile app lacks desktop software${
                              !plan.c.isISP && plan.c.networkPerks.length > 0
                                ? ', and provider is not your home gateway ISP.'
                                : '.'
                            } Desktops require independent coverage.`}
                      </p>
                    )}
                  </div>

                  {/* Footer note */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12.5,
                      color: '#4A4A4A',
                      background: '#F4F0E8',
                      border: '1px solid rgba(26, 26, 26, 0.06)',
                      padding: '8px 12px',
                      borderRadius: 4,
                      marginTop: 8,
                    }}
                  >
                    <Info size={14} color="#C5A059" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{plan.c.note}</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Password Vault */}
              <div className="rec-row">
                <div className="ico">
                  <Key size={17} color="#1A1A1A" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '19px',
                      fontWeight: 600,
                      margin: '0 0 6px',
                      color: '#1A1A1A',
                    }}
                  >
                    2. Credential Security — {plan.vault.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#4A4A4A',
                      margin: '0 0 8px',
                      lineHeight: 1.55,
                    }}
                  >
                    Configured for {vaultAdults} adult(s)
                    {vaultKids > 0 ? ` and ${vaultKids} child(ren)` : ''}.{' '}
                    {plan.vault.why}
                    {sharing
                      ? ' Supports shared vault synchronization for household credentials.'
                      : ' Individualized vaults selected for discrete credential storage.'}
                  </p>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: '#6B655C',
                      marginBottom: plan.hasOverflow ? 12 : 0,
                    }}
                  >
                    ${(plan.vault.price.intro / 12).toFixed(2)}/mo intro ($
                    {plan.vault.price.intro}/yr, {plan.vault.price.term})
                    {plan.vault.price.renew !== plan.vault.price.intro && (
                      <span style={{ color: '#C5A059', fontWeight: 600 }}>
                        {' '}
                        · renews ${plan.vault.price.renew}/yr
                      </span>
                    )}{' '}
                    · {plan.vault.adultCap} adult limit,{' '}
                    {plan.vault.totalSeats} aggregate seats
                  </div>

                  {/* Overflow Callout */}
                  {plan.hasOverflow && (
                    <div
                      style={{
                        background: '#FFFDF9',
                        border: '1px solid rgba(197, 160, 89, 0.4)',
                        borderLeft: '3px solid #C5A059',
                        borderRadius: 4,
                        padding: '12px 14px',
                        display: 'flex',
                        gap: 10,
                      }}
                    >
                      <AlertTriangle
                        size={16}
                        color="#C5A059"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#1A1A1A',
                            marginBottom: 4,
                          }}
                        >
                          Notice: {plan.overflowAdults} adult seat(s) beyond tier boundary
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: '#4A4A4A',
                            lineHeight: 1.5,
                          }}
                        >
                          Avoid upgrading to expensive commercial enterprise tiers. Retain the {plan.vault.adultCap} paid seats as organizational vault hosts, instantiate free personal accounts ({FREE_TIERS}) for the remaining {plan.overflowAdults} adult(s), and share requisite collection items to their accounts without added overhead.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: VPN */}
              <div className="rec-row">
                <div className="ico">
                  <Shield size={17} color="#1A1A1A" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '19px',
                      fontWeight: 600,
                      margin: '0 0 6px',
                      color: '#1A1A1A',
                    }}
                  >
                    3. Network Privacy (VPN) —{' '}
                    {plan.vpnDecided
                      ? plan.chosenVpn.name
                      : 'Curated Options'}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#4A4A4A',
                      margin: '0 0 12px',
                      lineHeight: 1.55,
                    }}
                  >
                    {routerVpn === 'yes' &&
                      `Router-level client deployment protects all ${devices} connected devices simultaneously under a single subscription seat.`}
                    {routerVpn === 'maybe' &&
                      `Verify router OpenVPN / WireGuard support. If supported, a single configuration covers all ${devices} endpoints without device limits.`}
                    {routerVpn === 'no' &&
                      `Unlimited-endpoint plans ensure all ${devices} household devices maintain active tunnels.`}
                    {plan.carrierHasVpn &&
                      ' Note: carrier default proxies offer lightweight protection, while dedicated VPN tunnels offer strict zero-logging and global exit nodes.'}
                  </p>

                  {/* 2 Selectable VPN Cards */}
                  <div className="two-col" style={{ gap: 12, marginBottom: 8 }}>
                    {plan.vpnShortlist.map((v) => {
                      const isSelected = plan.chosenVpn.id === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setVpnChoice(v.id)}
                          style={{
                            border: isSelected
                              ? '1px solid #1A1A1A'
                              : '1px solid rgba(26, 26, 26, 0.12)',
                            background: isSelected ? '#FFFDF9' : '#F9F7F2',
                            boxShadow: isSelected ? '0 2px 8px rgba(26, 26, 26, 0.08)' : 'none',
                            borderRadius: 4,
                            padding: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14.5,
                                fontWeight: 700,
                                color: '#1A1A1A',
                              }}
                            >
                              {v.name}
                            </span>
                            {isSelected ? (
                              <Check size={16} color="#C5A059" />
                            ) : (
                              <span
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  border: '1px solid #8C8275',
                                  display: 'inline-block',
                                }}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: '#1A1A1A',
                              fontWeight: 600,
                            }}
                          >
                            ${(v.price.intro / 12).toFixed(2)}/mo intro ($
                            {v.price.intro}/yr, {v.price.term})
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#767064',
                              margin: '2px 0',
                            }}
                          >
                            renews ${(v.price.renew / 12).toFixed(2)}/mo ($
                            {v.price.renew}/yr)
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: '#8C8275',
                              marginBottom: 8,
                            }}
                          >
                            or ${v.price.monthly}/mo month-to-month
                          </div>
                          <div>
                            <a
                              href={v.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#1A1A1A',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                              }}
                            >
                              Inspect {v.name} ↗
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#767064',
                    }}
                  >
                    <Info size={13} color="#C5A059" />
                    <span>
                      {plan.vpnDecided
                        ? `Selected ${plan.chosenVpn.name} for the ledger below. Select alternative card to swap.`
                        : `Defaulting to ${plan.chosenVpn.name}. Select a card above to customize.`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Anti-malware */}
              <div className="rec-row">
                <div className="ico">
                  {plan.antivirusNeeded ? (
                    <AlertTriangle size={17} color="#C5A059" />
                  ) : (
                    <Check size={17} color="#1E7A46" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '19px',
                      fontWeight: 600,
                      margin: '0 0 6px',
                      color: '#1A1A1A',
                    }}
                  >
                    {!plan.wantsAnyAV
                      ? '4. Anti-Malware — Skipped by Preference'
                      : plan.antivirusNeeded && plan.avSuite
                      ? `4. Anti-Malware — ${plan.avSuite.name}`
                      : '4. Anti-Malware — Inherent Coverage Sufficient'}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#4A4A4A',
                      margin: '0 0 8px',
                      lineHeight: 1.55,
                    }}
                  >
                    {!plan.wantsAnyAV &&
                      "Standalone endpoint agents skipped. Integrated network DNS blockers filter malicious domains without taxing system memory."}
                    {plan.antivirusNeeded && plan.avSuite && (
                      <>
                        Requested dedicated agents across{' '}
                        {plan.mobileAVneeded > 0
                          ? `${plan.mobileAVneeded} mobile`
                          : ''}
                        {plan.mobileAVneeded > 0 && plan.desktopAVneeded > 0
                          ? ' and '
                          : ''}
                        {plan.desktopAVneeded > 0
                          ? `${plan.desktopAVneeded} desktop`
                          : ''}{' '}
                        endpoint(s) outside {carrier}&apos;s default umbrella.{' '}
                        {plan.avSuite.note}
                      </>
                    )}
                    {plan.wantsAnyAV && !plan.antivirusNeeded && (
                      <>
                        {carrier}&apos;s existing stack covers the designated endpoints — no separate suite purchase required ($0 extra).
                      </>
                    )}
                  </p>

                  {/* Conditional note if close to cap */}
                  {plan.antivirusNeeded &&
                    plan.avSuite &&
                    plan.avSuite.deviceCap !== null &&
                    plan.agentsNeeded > plan.avSuite.deviceCap * 0.7 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          color: '#767064',
                          marginBottom: 6,
                        }}
                      >
                        <Info size={13} color="#C5A059" />
                        <span>
                          Approaching {plan.avSuite.deviceCap}-endpoint quota. If hardware inventory expands, McAfee+ offers unlimited endpoint licensing at a comparable cost structure.
                        </span>
                      </div>
                    )}

                  {/* Always show lighter option note if antivirus needed */}
                  {plan.antivirusNeeded && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#767064',
                        marginBottom: 8,
                      }}
                    >
                      <Info size={13} color="#C5A059" />
                      <span>
                        Alternative: {VPN_BLOCKERS} filter malicious hosts and tracking trackers at the DNS layer — frequently sufficient for security-conscious users.
                      </span>
                    </div>
                  )}

                  {plan.antivirusNeeded && plan.avSuite && (
                    <div style={{ fontSize: 12.5, color: '#6B655C' }}>
                      ${(plan.avSuite.price.intro / 12).toFixed(2)}/mo intro ($
                      {plan.avSuite.price.intro}/yr, {plan.avSuite.price.term}) ·{' '}
                      <span style={{ color: '#C5A059', fontWeight: 600 }}>
                        renews ${plan.avSuite.price.renew}/yr
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Budget note */}
            <div
              style={{
                marginTop: 18,
                padding: '14px 18px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: plan.overBudget ? '#FBE4DE' : '#E4EFE6',
                color: plan.overBudget ? '#A34E36' : '#1E7A46',
                border: `1px solid ${plan.overBudget ? 'rgba(163, 78, 54, 0.2)' : 'rgba(30, 122, 70, 0.2)'}`,
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              {plan.overBudget ? (
                <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <Check size={17} style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <div>
                {plan.overBudget
                  ? `Plan totals ~$${plan.total}/mo, exceeding your target of $${budget}/mo. Optimization: Route VPN at gateway router (single subscription) to reduce per-seat requirements.`
                  : `Plan totals ~$${plan.total}/mo, comfortably within your $${budget}/mo envelope. Annual terms preserve maximum savings.`}
              </div>
            </div>

            {/* Alternative path: Asurion Complete Protect (only when buying on Amazon) */}
            {plan.asurion && (
              <div style={{ marginTop: 32 }}>
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
                  Alternative Path // Bundle
                </div>
                <h3
                  style={{
                    fontFamily: "'Newsreader', 'Spectral', serif",
                    fontSize: '24px',
                    fontWeight: 500,
                    margin: '0 0 12px',
                    color: '#1A1A1A',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Option: {ASURION_BUNDLE.name}
                </h3>

                <div className="advisor-card" style={{ padding: '18px 24px' }}>
                  <p style={{ fontSize: 14, color: '#4A4A4A', margin: '0 0 10px', lineHeight: 1.6 }}>
                    An Amazon purchase-protection plan that includes {ASURION_BUNDLE.bundledProduct} (antivirus,
                    malware and ransomware protection, AI scam protection, secure VPN, up to{' '}
                    {ASURION_BUNDLE.deviceCap} devices). ${ASURION_BUNDLE.monthly}/month + tax, billed
                    monthly, so there is no intro-to-renewal jump. It also has $0 service fees, a $5,000
                    annual claim limit, no claim waiting period, in-person services at about 700
                    uBreakiFix locations, and a $100/yr care credit for furniture and major appliances
                    bought on Amazon. This is an alternative to compare, not an automatic pick.
                  </p>

                  {/* Side-by-side totals */}
                  <div className="two-col" style={{ gap: 12, margin: '14px 0' }}>
                    {[
                      {
                        title: 'Standalone path (plan above)',
                        total: plan.total,
                        renew: plan.monthlyRenew,
                        yearlyIntro: plan.yearlyIntro,
                        yearlyRenew: plan.yearlyRenew,
                        over: plan.overBudget,
                      },
                      {
                        title: `With ${ASURION_BUNDLE.name}`,
                        total: plan.asurion.total,
                        renew: plan.asurion.monthlyRenew,
                        yearlyIntro: plan.asurion.yearlyIntro,
                        yearlyRenew: plan.asurion.yearlyRenew,
                        over: plan.asurion.overBudget,
                      },
                    ].map((col) => (
                      <div
                        key={col.title}
                        style={{
                          border: '1px solid rgba(26, 26, 26, 0.1)',
                          borderRadius: 4,
                          padding: '12px 14px',
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
                          {col.title}
                        </div>
                        <div style={{ fontSize: 13.5, color: '#1A1A1A' }}>
                          <strong>${col.total}/mo</strong> intro · ${col.yearlyIntro.toFixed(2)}/yr
                        </div>
                        <div style={{ fontSize: 13.5, color: '#C5A059' }}>
                          <strong>${col.renew}/mo</strong> renewal · ${col.yearlyRenew.toFixed(2)}/yr
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            marginTop: 4,
                            color: col.over ? '#A34E36' : '#1E7A46',
                            fontWeight: 600,
                          }}
                        >
                          {col.over
                            ? `Exceeds your $${budget}/mo target`
                            : `Within your $${budget}/mo target`}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#767064', margin: '0 0 12px' }}>
                    Both totals exclude sales tax. The bundle replaces the VPN and antivirus lines for up to{' '}
                    {ASURION_BUNDLE.deviceCap} devices
                    {plan.asurion.remainderSuite
                      ? `; the remaining ${plan.asurion.remainderAgents} device${plan.asurion.remainderAgents > 1 ? 's' : ''} use ${plan.asurion.remainderSuite.name}`
                      : ''}
                    . Your password manager line stays: whether the bundled Norton includes a password
                    manager, parental controls, cloud backup or dark web monitoring is not confirmed.
                    {routerVpn === 'yes' &&
                      ' The bundled VPN is installed per device, so it would not replace a router-level VPN.'}
                  </p>

                  {/* Plain-language caveats */}
                  <div className="grid-h" style={{ marginBottom: 6 }}>Read before choosing</div>
                  <ul
                    style={{
                      margin: '0 0 12px 18px',
                      padding: 0,
                      fontSize: 13.5,
                      color: '#4A4A4A',
                      lineHeight: 1.55,
                    }}
                  >
                    <li>The Norton benefit ends if the Asurion subscription is cancelled.</li>
                    <li>The protection covers Amazon purchases only.</li>
                    <li>
                      It mainly makes sense if your household would otherwise pay for product
                      protection on Amazon purchases. You said you spend roughly $
                      {amazonSpend.toLocaleString('en-US')}/yr on electronics, appliances and furniture
                      there; that figure is context only, not a threshold.
                    </li>
                    <li>
                      How far back past Amazon purchases are covered is not confirmed (sources say 90
                      days or 12 months). Check Asurion&apos;s terms before relying on it.
                    </li>
                  </ul>

                  {/* Rollout steps for this option */}
                  <div className="grid-h" style={{ marginBottom: 6 }}>Rollout if you choose this option</div>
                  <div style={{ marginBottom: 14 }}>
                    {plan.asurion.steps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 12, paddingBottom: 12 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            background: '#1A1A1A',
                            color: '#F9F7F2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>
                            {step.title}
                          </div>
                          <div style={{ fontSize: 13.5, color: '#4A4A4A', lineHeight: 1.55 }}>
                            {step.body}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Affiliate call-to-action with adjacent disclosure */}
                  <div style={{ borderTop: '1px solid rgba(26, 26, 26, 0.1)', paddingTop: 12 }}>
                    <a
                      href={ASURION_BUNDLE.affiliateUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: '#1A1A1A',
                        textDecoration: 'none',
                        borderBottom: '1px solid #C5A059',
                        display: 'inline-block',
                      }}
                    >
                      {ASURION_BUNDLE.ctaLabel} ↗
                    </a>
                    <div style={{ fontSize: 12, color: '#6B655C', marginTop: 6, lineHeight: 1.5 }}>
                      {ASURION_BUNDLE.affiliateDisclosure}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B655C', marginTop: 2 }}>
                      {ASURION_BUNDLE.amazonAssociateStatement}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cost summary table */}
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div>
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
                    Cost Ledger
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', 'Spectral', serif",
                      fontSize: '24px',
                      fontWeight: 500,
                      margin: 0,
                      color: '#1A1A1A',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Itemized Cost Schedule
                  </h3>
                </div>
                <div className="table-scroll-hint">
                  <MoveHorizontal size={13} color="#C5A059" />
                  <span>Scroll sideways to view all columns</span>
                </div>
              </div>

              <div
                className="advisor-card table-scroll-container costwrap"
                style={{ padding: 0 }}
              >
                <div style={{ minWidth: 540 }}>
                  {/* Table Header */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                      background: '#F4F0E8',
                      padding: '12px 20px',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#767064',
                    }}
                  >
                    <div>Component / Service</div>
                    <div style={{ textAlign: 'right' }}>Introductory</div>
                    <div style={{ textAlign: 'right' }}>Renewal</div>
                    <div style={{ textAlign: 'right' }}>Monthly</div>
                  </div>

                  {/* Line Items */}
                  {plan.lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                        borderBottom: '1px solid rgba(26, 26, 26, 0.08)',
                        padding: '14px 20px',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: '#1A1A1A',
                            textDecoration: 'none',
                            borderBottom: '1px solid #C5A059',
                            display: 'inline-block',
                          }}
                        >
                          {item.label} ↗
                        </a>
                        {item.pending && (
                          <div
                            style={{
                              fontSize: 11,
                              color: '#C5A059',
                              marginTop: 2,
                            }}
                          >
                            Default allocation — toggle above to modify
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {item.price.intro === 0 ? (
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1E7A46' }}>
                            Free
                          </span>
                        ) : (
                          <>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A' }}>
                              ${(item.price.intro / 12).toFixed(2)}/mo
                            </div>
                            <div style={{ fontSize: 11, color: '#767064' }}>
                              ${item.price.intro}/yr
                            </div>
                          </>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', color: '#1A1A1A' }}>
                        {item.price.renew === 0 ? (
                          <span style={{ fontSize: 13.5, color: '#8C8275' }}>—</span>
                        ) : (
                          <>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#C5A059' }}>
                              ${(item.price.renew / 12).toFixed(2)}/mo
                            </div>
                            <div style={{ fontSize: 11, color: '#767064' }}>
                              ${item.price.renew}/yr
                            </div>
                          </>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', color: '#767064' }}>
                        {item.price.monthly ? (
                          <span style={{ fontSize: 13 }}>
                            ${item.price.monthly}/mo
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, color: '#8C8275' }}>—</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Total Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                      background: '#1A1A1A',
                      color: '#F9F7F2',
                      padding: '16px 20px',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Newsreader', 'Spectral', serif",
                        fontSize: 18,
                        fontWeight: 600,
                      }}
                    >
                      Aggregate Total
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: "'Newsreader', 'Spectral', serif",
                          fontSize: 20,
                          fontWeight: 600,
                        }}
                      >
                        ${plan.total}/mo
                      </div>
                      <div style={{ fontSize: 10.5, opacity: 0.8 }}>
                        ${plan.yearlyIntro.toFixed(2)}/yr
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', color: '#C5A059' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>
                        ${plan.monthlyRenew}/mo
                      </div>
                      <div style={{ fontSize: 10.5, opacity: 0.9 }}>
                        ${plan.yearlyRenew.toFixed(2)}/yr
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        fontSize: 10.5,
                        opacity: 0.7,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Standard Term
                    </div>
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: '12px',
                  color: '#767064',
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                Introductory rates reflect upfront billing cycles (e.g. 24-month promotional blocks). The renewal column indicates projected ongoing spend. All figures verified against public documentation.
              </p>
            </div>

            {/* Implementation Timeline */}
            <div style={{ marginTop: 36 }}>
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
                Execution Protocol
              </div>
              <h3
                style={{
                  fontFamily: "'Newsreader', 'Spectral', serif",
                  fontSize: '24px',
                  fontWeight: 500,
                  margin: '0 0 6px',
                  color: '#1A1A1A',
                  letterSpacing: '-0.01em',
                }}
              >
                Sequential Implementation Roadmap
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#4A4A4A',
                  margin: '0 0 24px',
                  fontFamily: "'Newsreader', 'Spectral', serif",
                  fontStyle: 'italic',
                }}
              >
                Execute in designated sequence to ensure seamless credential migration and network tunnel establishment.
              </p>

              <div>
                {plan.steps.map((step, idx) => {
                  const isLast = idx === plan.steps.length - 1;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: 16,
                        position: 'relative',
                        paddingBottom: isLast ? 0 : 24,
                      }}
                    >
                      {/* Timeline icon / number & line */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            background: '#1A1A1A',
                            color: '#F9F7F2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            fontWeight: 700,
                            zIndex: 1,
                          }}
                        >
                          {idx + 1}
                        </div>
                        {!isLast && (
                          <div
                            style={{
                              width: 1,
                              flex: 1,
                              background: 'rgba(26, 26, 26, 0.15)',
                              marginTop: 6,
                              marginBottom: 6,
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ paddingTop: 2 }}>
                        <div
                          style={{
                            fontSize: 14.5,
                            fontWeight: 700,
                            color: '#1A1A1A',
                            marginBottom: 4,
                          }}
                        >
                          {step.title}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: '#4A4A4A',
                            lineHeight: 1.6,
                          }}
                        >
                          {step.body}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
