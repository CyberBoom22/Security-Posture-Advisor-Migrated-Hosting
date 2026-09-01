# Deploying Security Hub

This app is a **static single-page site**. It builds to plain HTML, CSS and JS
in `dist/`, makes no server-side calls, and needs no API keys or runtime secrets
at all.

## How it deploys

Cloudflare's **Git integration** builds and publishes this repository directly.
Pushing to `main` is the deploy: Cloudflare clones the repo, runs the build, and
serves the result as a Worker with static assets. There are no deploy
credentials in GitHub, and nothing in this repo triggers the deploy.

| Setting                | Value           |
| ---------------------- | --------------- |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Production branch      | `main`          |

Cloudflare reads `.nvmrc` for the Node version.

`.github/workflows/ci.yml` type-checks and builds on pushes and pull requests.
It does **not** deploy — it exists so a commit that fails to compile is caught
in the pull request rather than turning into a failed Cloudflare build.

To reproduce the build locally:

```bash
npm ci        # install exactly what package-lock.json pins
npm run lint  # tsc --noEmit
npm run build # -> dist/
```

`dist/` contains `index.html`, fingerprinted files under `dist/assets/`, and
`_headers`, `robots.txt` and `sitemap.xml` copied from `public/`.

---

## Putting it on sec-pos-advisor.xavierboone.us

`xavierboone.us` is already served by Cloudflare nameservers
(`aurora`/`morgan.ns.cloudflare.com`), so there is no nameserver migration to
do. As of this writing the zone had no records on `sec-pos-advisor`, no
wildcard, and no `MX`, so nothing conflicts with the setup below and no mail
routing is at risk.

Because this is a dedicated subdomain rather than the apex, there is no
apex-versus-`www` split to canonicalise. `sec-pos-advisor.xavierboone.us` is the
one public hostname, and it is what `<link rel="canonical">`, `og:url`,
`robots.txt` and `sitemap.xml` in this repo point at.

### Attach the hostname

This is a **Worker**, not a Pages project, so the custom domain lives under the
Worker's own settings. It is also not done from the zone's DNS tab: you are not
creating a subdomain record and pointing the site at it, you are telling the
Worker to claim the hostname, and Cloudflare writes the DNS record for you.

*Workers & Pages* → the Worker → *Settings* → *Domains & Routes* → *Add* →
*Custom Domain* → enter `sec-pos-advisor.xavierboone.us` → *Add Custom Domain*.

Cloudflare creates the DNS record and issues the TLS certificate, normally
within a few minutes.

**Do not pre-create the DNS record.** Cloudflare will not attach a custom domain
to a hostname that already has a `CNAME` record on it. The hostname is currently
empty, so leave it alone and let the Worker claim it. If a record does already
exist, delete it first.

### Check the TLS mode

*SSL/TLS → Overview* for `xavierboone.us` must be **Full (strict)**. A zone set
to **Flexible** puts visitors in an infinite redirect loop, because Cloudflare
always serves this site over HTTPS. The setting is zone-wide, so it affects
every hostname under `xavierboone.us`.

### Verify

```bash
curl -sSI https://sec-pos-advisor.xavierboone.us | head -n 1  # expect: HTTP/2 200
curl -sS  https://sec-pos-advisor.xavierboone.us/robots.txt   # expect: the sitemap line
```

### Retire the workers.dev URL

The Worker also answers on its `*.workers.dev` subdomain, serving identical
content. Search engines can index both and split the ranking between them. The
canonical tag points at `sec-pos-advisor.xavierboone.us`, which handles any
crawler that honours it; to remove the duplicate outright, disable the
`workers.dev` route under *Settings* → *Domains & Routes* once the custom domain
is confirmed working.

---

## Notes on this repo

- **The hostname is written into four places:** `<link rel="canonical">` and
  `og:url` in `index.html`, `public/robots.txt`, and `public/sitemap.xml`.
  Change all four together, or crawlers keep being pointed at the old address.
- **No `_redirects` file, deliberately.** The app has no client-side router, so
  every real page is served from `/`. An SPA catch-all (`/* /index.html 200`)
  would answer unknown URLs with a `200` and the full app, which reads as a soft
  404 to search engines. Returning a genuine 404 is correct here. If you later
  add a router, add `public/_redirects` at that point.
- **`public/_headers`** sets the security headers and the cache policy:
  fingerprinted assets under `/assets/` are `immutable`, while `index.html` must
  revalidate, so a deploy cannot leave clients holding a stale entry point that
  references deleted asset hashes.
- **`package-lock.json` is committed** so `npm ci` installs a byte-identical
  tree. Do not add it to `.gitignore`.
- **`.env.example` is a leftover** from AI Studio. Nothing in `src/` reads
  `GEMINI_API_KEY` or `APP_URL`, and nothing needs configuring to deploy.
- **Unused dependencies.** `@google/genai`, `express`, `dotenv` and `motion` are
  declared in `package.json` but imported nowhere. They only slow the install
  down. They were left in place rather than removed, since dropping them is a
  judgement call about where the project is heading — `metadata.json` still
  advertises a server-side Gemini capability that the code does not use.
