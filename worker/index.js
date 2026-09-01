// The one hostname this site should be reachable at. Everything else that is
// attached to this Worker is redirected here so two identical copies of the
// site do not compete with each other in search results.
const CANONICAL_HOST = 'sec-pos-advisor.xavierboone.us';

// Custom hostnames that should redirect to CANONICAL_HOST.
//
// The *.workers.dev hostname is deliberately absent: it bypasses the zone, so
// it stays reachable as a way in if a custom domain or the zone config breaks.
const REDIRECT_HOSTS = new Set(['securitypostureadvisor.xavierboone.us']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (REDIRECT_HOSTS.has(url.hostname)) {
      url.hostname = CANONICAL_HOST;
      // 301: permanent, so crawlers transfer ranking to the canonical host.
      return Response.redirect(url.toString(), 301);
    }

    // Everything else is served from the static assets store. This Worker runs
    // ahead of asset serving (run_worker_first), so the redirect above is
    // reached even for paths that match a real file.
    return env.ASSETS.fetch(request);
  },
};
