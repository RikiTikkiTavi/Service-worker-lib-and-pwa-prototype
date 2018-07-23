/* eslint-disable */
// service-worker.js

// Flag for enabling cache in production
const doCache = true;
const CACHE_NAME = 'project-prototype-app-cache';

// Delete old caches
self.addEventListener('activate', event => {
	const currentCachelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then(keyList =>
			Promise.all(
				keyList.map(key => {
					if (!currentCachelist.includes(key)) {
						return caches.delete(key);
					}
				})
			)
		)
	);
});

// This triggers when user starts the app
self.addEventListener('install', event => {
	if (doCache) {
		event.waitUntil(
			caches.open(CACHE_NAME).then(cache => {
				console.log('FETCHING ASSET-MANIFEST');
				fetch('/asset-manifest.json').then(response => {
					response.json().then(assets => {
						// We will cache initial page and the main.js
						// We could also cache assets like CSS and images
						const urlsToCache = [
							'/',
							'/api/get_list_of_services',
							assets['main.js'],
							'/manifest.json',
							assets['favicon.ico'],
						];
						cache.addAll(urlsToCache);
					});
				});
			})
		);
	}
});

// Here we intercept request and serve up the matching files
self.addEventListener('fetch', event => {
	event.respondWith(async function() {
		// Try to get the response from a cache.
		const cachedResponse = await caches.match(event.request);
		let serverResponse;
		try {
			serverResponse = await fetch(event.request)
		} catch (e) {
			console.log(e)
		}

		console.log("SERVER RES", serverResponse);
		console.log("CACHED RES", cachedResponse);

		if(serverResponse!==undefined){
			console.log("SERVER RESPONSE", serverResponse)
			await caches.open(CACHE_NAME).then(cache => {
				cache.put(event.request.url, serverResponse.clone());
			});
			console.log("RETURNING SERVER RES")
			return serverResponse
		}
		if(cachedResponse!==undefined) {
			console.log("RETURNING CACHED RES")
			return cachedResponse;
		}

		const fallback = new Response("NOT AVAILABLE OFFLINE");

		return fallback
	}());
	/*event.respondWith(
		caches
			.match(event.request)
			.then(response => response || fetch(event.request))
	);*/
});
