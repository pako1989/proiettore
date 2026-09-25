// Proiettore: permette di installare l'app e di aprirla anche senza rete.
const CACHE = "proiettore-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./manifest.webmanifest"])).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Pagina e file dell'app: prima la rete (così gli aggiornamenti arrivano subito), poi la copia salvata.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req.mode === "navigate" ? "./" : req, copy)); }
      return res;
    }).catch(() => caches.match(req.mode === "navigate" ? "./" : req).then((r) => r || caches.match("./")))
  );
});
