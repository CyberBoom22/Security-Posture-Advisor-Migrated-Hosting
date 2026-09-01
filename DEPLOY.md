# Deploying Security Hub

This app is a **static single-page site**. It builds to plain HTML, CSS and JS in
`dist/`, makes no server-side calls, and needs no API keys or runtime secrets at
all. Any static host can serve it; the setup below uses Cloudflare Pages with
GitHub as the source of truth.

## What the build produces

```
npm ci        # install exactly what package-lock.json pins
npm run lint  # tsc --noEmit
npm run build # -> dist/
```

`dist/` contains `index.html`, fingerprinted files under `dist/assets/`, and the
`_headers` file copied from `public/`.

---

## Option A — GitHub Actions deploys to Cloudflare Pages (configured here)

`.github/workflows/deploy.yml` builds on every push to `main` and publishes
`dist/` to Cloudflare Pages. Pull requests build and type-check but do **not**
deploy, so the credentials are never exposed to a forked PR.

To turn it on:

**1. Create the Pages project.** In the Cloudflare dashboard go to
*Workers & Pages → Create → Pages → Upload assets*, name the project
`security-posture-advisor`, and create it. (The name must match
`--project-name` in the workflow. Uploading a placeholder once is enough — the
workflow takes over from there.)

**2. Create an API token.** *My Profile → API Tokens → Create Token → Custom
token* with these permissions:

| Scope   | Permission            | Access |
| ------- | --------------------- | ------ |
| Account | Cloudflare Pages      | Edit   |

**3. Find your account ID.** It is in the URL of the Cloudflare dashboard
(`dash.cloudflare.com/<account-id>/...`) and on the Workers & Pages overview.

**4. Add both as GitHub secrets.** In the repo: *Settings → Secrets and
variables → Actions → New repository secret*.

| Secret name             | Value                     |
| ----------------------- | ------------------------- |
| `CLOUDFLARE_API_TOKEN`  | the token from step 2     |
| `CLOUDFLARE_ACCOUNT_ID` | the account ID from step 3 |

**5. Merge to `main`.** The workflow runs and the site goes live at
`https://security-posture-advisor.pages.dev`.

## Option B — Cloudflare Pages builds it directly (no secrets)

If you would rather not manage tokens, connect the repo in Cloudflare instead
and delete `.github/workflows/deploy.yml`:

*Workers & Pages → Create → Pages → Connect to Git*, pick this repo, then set:

| Setting               | Value           |
| --------------------- | --------------- |
| Framework preset      | Vite            |
| Build command         | `npm run build` |
| Build output directory | `dist`         |
| Production branch     | `main`          |

Cloudflare reads `.nvmrc` for the Node version. Every push to `main` redeploys;
every other branch gets its own preview URL.

Option A gives you type-checking as a merge gate and keeps the build definition
in the repo. Option B is fewer moving parts. Use one, not both — two systems
deploying the same project will fight over the deployment history.

---

## Putting it on a domain you own

Out of the box the site is served at `security-posture-advisor.pages.dev`. To
serve it from your own domain, the domain has to reach Cloudflare first, and
then the Pages project has to claim the hostname.

### Step 1 — get the domain onto Cloudflare

**If the domain already uses Cloudflare nameservers,** skip to step 2.

**If it is registered elsewhere and not yet on Cloudflare,** add it:

1. Cloudflare dashboard → *Add a site* → enter the domain → pick the Free plan.
2. Cloudflare scans your current DNS and copies the records it finds. **Check
   this list against your registrar before continuing** — the scan is
   best-effort and quietly misses records. Anything missing here stops working
   the moment the nameservers change. Mail records (`MX`, and the `TXT` records
   for SPF, DKIM and DMARC) are the ones that most often get dropped, and losing
   them silently breaks inbound email for the domain.
3. At your registrar, replace the existing nameservers with the two Cloudflare
   gives you.
4. Wait for Cloudflare to report the domain as **Active**. This is usually well
   under an hour but can take up to 24.

Do not start step 2 until the domain shows Active.

> Keeping DNS at your current provider instead is possible but worse: you would
> point a `CNAME` at `security-posture-advisor.pages.dev` by hand, and most
> providers refuse a `CNAME` on the bare apex, so `example.com` (without `www`)
> would not work unless they support `ALIAS`/`ANAME` records. Moving the
> nameservers avoids the whole problem.

### Step 2 — attach the domain to the Pages project

In *Workers & Pages* → your project → *Custom domains* → *Set up a domain*,
enter the hostname and confirm. Do this once per hostname you want to serve.

Cloudflare then creates the DNS record itself and issues a TLS certificate,
normally within a few minutes.

Two things that block certificate issuance, both worth checking first:

- **A conflicting record already on that hostname.** If an `A`, `AAAA` or
  `CNAME` record for it already exists, delete it and let Pages create its own.
  Adding the record by hand ahead of time causes the same conflict.
- **The record must stay proxied** (the orange cloud in the DNS tab). Grey-cloud
  DNS-only mode bypasses Cloudflare and the Pages project never sees the
  request.

### Step 3 — pick one canonical hostname

If you serve both `example.com` and `www.example.com`, decide which is the real
one and redirect the other. Serving identical content on both splits search
ranking between them, which matters for a site built around organic search.

Attach **both** hostnames in step 2, then send the non-canonical one to the
canonical one with a redirect: *Rules → Redirect Rules → Create rule*, matching
requests where the hostname equals the non-canonical name, with a **301
(permanent)** redirect to the canonical hostname, preserving path and query
string.

Apex (`example.com`) and `www` are both fine choices. Cloudflare flattens
`CNAME` records at the apex, so the apex works here even though a plain DNS
provider would not allow it.

### Step 4 — check the TLS mode

*SSL/TLS → Overview* must be set to **Full (strict)**. The default on newer
zones is already correct, but a zone set to **Flexible** will send visitors into
an infinite redirect loop against Pages, which always serves HTTPS. This is the
single most common cause of a custom domain that loads as a redirect loop right
after setup.

### Step 5 — verify

Once the certificate is issued:

```bash
curl -sSI https://example.com | head -n 1        # expect: HTTP/2 200
curl -sSI https://www.example.com | head -n 1    # expect: 301 if redirecting
```

The `pages.dev` URL keeps working alongside the custom domain. If you would
rather it not be publicly reachable, block it under the project's
*Settings → General*.

### After the domain is live

`index.html` currently has no `<link rel="canonical">` and no `og:url`, because
until now there was no stable address to point them at. Both should name the
canonical hostname you chose in step 3 once it is settled, and a `robots.txt`
and `sitemap.xml` referencing that hostname are worth adding at the same time.

---

## Notes on this repo

- **No `_redirects` file, deliberately.** The app has no client-side router, so
  every real page is served from `/`. An SPA catch-all (`/* /index.html 200`)
  would answer unknown URLs with a `200` and the full app, which reads as a soft
  404 to search engines. Letting Cloudflare return a genuine 404 is correct here.
  If you later add a router, add `public/_redirects` at that point.
- **`package-lock.json` is committed** so `npm ci` installs a byte-identical
  tree in CI. Do not add it to `.gitignore`.
- **`.env.example` is a leftover** from AI Studio. Nothing in `src/` reads
  `GEMINI_API_KEY` or `APP_URL`, and nothing needs to be configured to deploy.
- **Unused dependencies.** `@google/genai`, `express`, `dotenv` and `motion` are
  declared in `package.json` but imported nowhere. They only slow the CI install
  down. They were left in place rather than removed, since dropping them is a
  judgement call about where the project is heading — `metadata.json` still
  advertises a server-side Gemini capability that the code does not use.
