function aelFetch(cacheName, cacheImages){
	self.addEventListener('fetch', event => {
		event.respondWith(async function () {

			let isCacheOld = false;

			// Check if cache is old
			const currentTimestamp = Math.round((new Date()).getTime() / 1000);
			let cacheTimestamp;
			caches.match('/get_cache_timestamp')
				.then((cacheTimestampResponse) => {
					cacheTimestampResponse.text().then(cacheTimestampText => {
						cacheTimestamp = cacheTimestampText;
					})
				});
			if (cacheTimestamp !== undefined) {
				const timeDiff = currentTimestamp - cacheTimestamp;
				if (timeDiff < 600) {
					alert("CACHE IS OLDER THEN 10min");
					isCacheOld = true
				}
			}
			// End Check if cache is old

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

						//If cacheImage is enabled, cache response
						//Here is possible to check header
						if (cacheImages) {
							await caches.open(cacheName).then(cache => {
								cache.put(event.request.url, serverResponse.clone());
							});
						}

						//If not enabled just return server response
						else {
							return serverResponse
						}
					}

					// If server not available return dummy image
					const dummyImageResponse = caches.match('/content/images/dummy.jpg');
					return dummyImageResponse
				}

				//Else return cached image
				else {
					return cachedResponse;
				}
			}
			// End image caching logic

			var cachedResponse;

			// Try to get the response from a cache, if it is not old
			if (!isCacheOld) {
				// Try to get the response from a cache
				cachedResponse = await caches.match(event.request, {ignoreVary: true});
				if (cachedResponse !== undefined) {
					return cachedResponse;
				}
			}

			// ON that point we can make request to server with timestamp we have cached
			// -> in response become what is changed
			// -> replace changed files in cache
			// return response

			// Try to get the response from a server if cache is old or undefined.
			let serverResponse;
			try {
				serverResponse = await fetch(event.request)
			} catch (e) {
				console.log(e)
			}

			// If server is available
			if (serverResponse !== undefined) {
				// On this point we know, that fresh cache for this req doesn't exist,
				// so we cache it if it is so in Header
				if (isHeaderValueTrue(serverResponse, "need-to-cache-file")) {
					await caches.open(cacheName).then(cache => {
						cache.put(event.request.url, serverResponse.clone());
					});
				}
				return serverResponse
			}

			// Return the response from an old cache, if offline and cache is old
			if (cachedResponse !== undefined) {
				alert("Local data is old. Connect to the internet to get fresh data");
				return cachedResponse;
			}

			return new Response("NOT AVAILABLE OFFLINE")
		}());
	});
}