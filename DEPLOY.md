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

## Putting it on secposadv.xavierboone.us

The target hostname is **`secposadv.xavierboone.us`**, and `xavierboone.us` is
already served by Cloudflare nameservers (`aurora`/`morgan.ns.cloudflare.com`),
so there is no nameserver migration to do. As of this writing the zone had no
records on `secposadv`, no wildcard, and no `MX`, so nothing conflicts with the
setup below and no mail routing is at risk.

Because this is a dedicated subdomain rather than the apex, there is also no
apex-versus-`www` split to canonicalise — `secposadv.xavierboone.us` is the one
and only public hostname, and it is what `<link rel="canonical">`,
`og:url`, `robots.txt` and `sitemap.xml` in this repo already point at.

### Attach the hostname

In *Workers & Pages* → the `security-posture-advisor` project → *Custom domains*
→ *Set up a domain*, enter `secposadv.xavierboone.us` and confirm.

Cloudflare creates the `CNAME` itself and issues the TLS certificate, normally
within a few minutes. Two rules:

- **Do not pre-create the DNS record.** An `A`, `AAAA` or `CNAME` already
  sitting on `secposadv` conflicts with the one Pages needs to add and blocks
  certificate issuance. The hostname is currently empty, so simply leave it
  alone and let Pages claim it.
- **Leave the record proxied** (orange cloud in the DNS tab). Grey-cloud
  DNS-only mode bypasses Cloudflare, and the Pages project never sees the
  request.

### Check the TLS mode

*SSL/TLS → Overview* for `xavierboone.us` must be **Full (strict)**. A zone set
to **Flexible** puts visitors in an infinite redirect loop against Pages, which
always serves HTTPS. This is the most common cause of a custom domain that
comes up as a redirect loop immediately after setup, and the setting lives on
the zone, so it affects every hostname under `xavierboone.us`.

### Verify

Once the certificate is issued:

```bash
curl -sSI https://secposadv.xavierboone.us | head -n 1   # expect: HTTP/2 200
curl -sS  https://secposadv.xavierboone.us/robots.txt    # expect: the sitemap line
```

The `security-posture-advisor.pages.dev` URL keeps working alongside the custom
domain. Because it serves identical content, search engines can index both and
split the ranking. The canonical tag in `index.html` points at
`secposadv.xavierboone.us`, which resolves that for any crawler that honours it;
to be certain, disable the `pages.dev` alias under the project's
*Settings → General* once the custom domain is confirmed working.

### If the domain ever changes

The hostname is written into four places: `<link rel="canonical">` and
`og:url` in `index.html`, `public/robots.txt`, and `public/sitemap.xml`. Update
all four together, or search engines will keep being pointed at the old address.

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
