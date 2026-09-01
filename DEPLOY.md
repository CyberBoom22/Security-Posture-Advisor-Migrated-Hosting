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

## Putting it on a subdomain

Out of the box the site is served at `security-posture-advisor.pages.dev`.
That is already a Cloudflare subdomain and needs no DNS work.

For a subdomain of a domain you own (for example `hub.example.com`):

1. The domain must be in the same Cloudflare account, with Cloudflare acting as
   its nameservers.
2. Open the Pages project → *Custom domains* → *Set up a domain* → enter
   `hub.example.com`.
3. Cloudflare creates the `CNAME` record pointing at the project and issues the
   TLS certificate. This normally takes a few minutes.

Do not create the `CNAME` by hand first — letting Pages add it avoids a
conflicting record that blocks certificate issuance.

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
