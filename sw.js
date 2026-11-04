const CACHE = "cultureland-prototype-v26";
const CORE = [
  "/", "/index.html", "/styles.css", "/app.js", "/usage-data.js", "/nearby-data.js",
  "/walking-routes.js", "/route-navigation.js", "/route-guide.js", "/manifest.webmanifest",
  "/icon.svg", "/icon-192.png", "/icon-512.png",
  "/assets/logo.png", "/assets/attendance.png", "/assets/menu.svg",
  "/assets/charge.png", "/assets/convert.svg", "/assets/three-percent.png",
  "/assets/coupon.svg", "/assets/quick-use.svg", "/assets/barcode.png",
  "/assets/google-play.png", "/assets/banner-bank.png", "/assets/banner-coupon.png", "/assets/banner-welcome.png",
  "/assets/banner-new.png", "/assets/banner-soop.png", "/assets/hot-promo.png",
  "/assets/service-smallpay.png", "/assets/service-coupang.png",
  "/assets/service-event.png", "/assets/service-daily.png",
  "/assets/nav-shop.svg", "/assets/nav-coupon.svg", "/assets/nav-game.svg",
  "/assets/nav-cash.svg", "/assets/nav-benefit.svg", "/assets/social-instagram.png",
  "/assets/social-blog.png", "/assets/social-webtoon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
