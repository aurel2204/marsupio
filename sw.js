// Marsupio (version web) : réseau d'abord pour toujours avoir la dernière version,
// cache en secours pour s'ouvrir sans réseau. Les données, elles, sont gérées par Firebase.
const CACHE = "marsupio-v1";
const CORE = ["./", "index.html", "bundle.js", "manifest.webmanifest", "icons/apple-touch-icon.png",
  "fonts/archivo-latin-standard-normal.woff2", "fonts/archivo-latin-ext-standard-normal.woff2", "fonts/DSEG7Classic-Bold.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // Firebase passe en direct
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
