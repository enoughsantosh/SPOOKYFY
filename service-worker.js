const CACHE_NAME = "spookify-audio-v1";

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    if (url.pathname.endsWith(".mp3")) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    return cachedResponse || fetch(event.request).then((response) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })
        );
    }
});
