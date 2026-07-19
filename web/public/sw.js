const CACHE = 'mixandcall-visited-v2';

function isAssetRequest(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/assets/');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (isAssetRequest(url)) {
    // Cache-first for static assets: prefer a prior successful download on flaky mobile.
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) {
          // Refresh in background when possible.
          event.waitUntil(
            fetch(req)
              .then((res) => {
                if (res.ok) cache.put(req, res.clone());
              })
              .catch(() => {}),
          );
          return cached;
        }
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return Response.error();
        }
      }),
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || Response.error())),
  );
});
