function aelFetch() {
    self.addEventListener('fetch', event => {
        event.respondWith(async function () {

            let cache = await caches.open(PARAMS.cacheName);

            if (event.request.url.indexOf('/update-caches') !== -1) {
                let updateResult = await updateCachesIfOld(PARAMS.cacheOldenTime, cache, PARAMS.whatToUpdate);
                handleUpdateResult(updateResult);
                return new Response(updateResult);
            }

            else {

                if (event.request.destination === 'image') {
                    return await handleFetchImage(event, cache, PARAMS.dummyImage);
                }
                // Handle other content caching logic when user makes request
                return await handleFetchOther(event, cache);
            }
        }());
    });
}