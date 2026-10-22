const CACHE_NAME = "pass-mobile-id-v7";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./assets/logo.png", "./assets/default-photo.svg", "./assets/qr.png"];

self.addEventListener("install", function(event){
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache){
    return cache.addAll(APP_SHELL);
  }).then(function(){
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(key){
        return key !== CACHE_NAME;
      }).map(function(key){
        return caches.delete(key);
      })).then(function(){
        return self.clients.claim();
      });
    })
  );
});

self.addEventListener("fetch", function(event){
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request).then(function(response){
        if (event.request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, copy);
          });
        }
        return response;
      });
    })
  );
});
