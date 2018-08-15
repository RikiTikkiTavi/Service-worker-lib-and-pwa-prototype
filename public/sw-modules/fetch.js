// TODO: Optimize caches.open
// TODO: On update delete files with low priority to download files with high prior.

function aelFetch() {
	self.addEventListener('fetch', event => {
		event.respondWith(async function () {
			/*
			* All logic can be made simple: if caches are old -> update and proceed further as normal.
			* 2-Factor check:
			* 1) If caches are older then 10min -> API request
			* 2) If code == 5 (Means "Ein Update steht zur Verfügung.") -> update caches */
			// NOW: update is made only for ADAC categories
			// If caches old: update caches or show message about old caches
			// It is needed to check caches update only once by each request

			// Handle images caching logic when user makes request
			if (event.request.destination === 'image') {

				// Try to get the response from a cache.
				const cachedResponse = await caches.match(event.request);

				// If no cache try to make request
				if (cachedResponse === undefined) {

					// Check if server is available
					let serverResponse;
					try {
						serverResponse = await fetch(event.request)
					} catch (e) {
						console.log(e)
					}

					// If server is available
					if (serverResponse !== undefined) {

						/*
						* Cache image on each server response if:
						* 1) need-to-cache-file header
						* 2) Images fetch caching is enabled */

						if (
							isHeaderValueTrue(serverResponse, "need-to-cache-file")
							&& PARAMS.enableImagesFetchCaching
						) {
							await caches.open(cacheName).then(cache => {
								cache.put(event.request.url, serverResponse.clone());
							});
						}

						return serverResponse
					}

					// If server not available return dummy image
					// Отдавать также статус ("IMAGE_NOT_AVAILABLE")
					return caches.match('/content/images/dummy.jpg');
				}

				//Else return cached image
				else {
					return cachedResponse;
				}
			}
			// End image caching logic

			var cachedResponse;

			cachedResponse = await caches.match(event.request, {ignoreVary: true});
			if (cachedResponse !== undefined) {
				return cachedResponse;
			}

			// Try to get the response from a server if cacheResponse is undefined.
			let serverResponse;
			try {
				serverResponse = await fetch(event.request)
			} catch (e) {
				console.log(e)
			}

			// If server is available
			if (serverResponse !== undefined) {
				// On this point we know, that fresh cache for this req doesn't exist,
				/*
				* Here we cache Response, if (fresh cache for this req doesn't exist):
				* 1) Header param
				* 2) General fetch caching is enabled */
				if (
					isHeaderValueTrue(serverResponse, "need-to-cache-file")
					&& PARAMS.enableGeneralFetchCaching
				) {
					await caches.open(cacheName).then(cache => {
						cache.put(event.request.url, serverResponse.clone());
					});
				}
				return serverResponse
			}

			return await caches.match('/', {ignoreVary: true});
		}());
	});
}