const CACHE_NAME = 'project-prototype-app-cache';

/*
We can set params in cache or some json file before calling registerServiceWorker() (index.js)
*/

/*
PROBLEM: How to change content in cache on its change in server
NOW: No dynamic caching when online
*/

/*
При вызове АПИ мы получим контент который был обновлен с времени, которое мы укажем.
Следовательно стратегия:
1) На установке сервис воркера кэшировать весь API и статику, сохранить текущий timestamp
2) При каждой загрузке приложения ИЛИ при устаревании кэша на 10 минут ->
   делать запрос к апи с предидущим timestamp и обновлять кэш.
*/

//TODO: Fetch params from cache or json file
const doCache = true;
const cacheImages = false;

// Delete old caches
self.addEventListener('activate', event => {
	console.log('ACTIVATE EVENT')
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
	console.log('installing service worker');
	if (doCache) {
		event.waitUntil(
			caches.open(CACHE_NAME).then(cache => {
				fetch('/asset-manifest.json').then(response => {
					response.json().then(assets => {

						/*
						Here we can build an array of urls that we need to cache.
						1) Fetch each request we need to cache.
						2) if cacheImages: For each fetched request -> fetch its image if exists
						3) Fetch static css and images
						*/

						const apiRequestGetServices = '/api/get_list_of_services';

						// 1)
						fetch(apiRequestGetServices).then(responseRaw => {

							// Cache fetched apiRequestGetServices
							console.log("CACHING API...");
							const responseRawClone = responseRaw.clone();
							cache.put(apiRequestGetServices, responseRawClone);

							// 2) If image caching enabled
							if (cacheImages) {
								console.log("CACHING IMAGES...");
								responseRaw.json()
									.then(response => {
										const services = response;
										services.forEach((service, i) => {
											cache.add(service.image)
										})
									})
							}
						});

						// 3) Cache static css, images, js
						/*If we want some url to work offline after page reload or by going direct to url
						  -> must cache it here. Example: /services/1*/
						console.log("CACHING STATIC...");
						const urlsToCache = [
							'/',
							'/services',
							'/services/1',
							'/service-worker.js',
							assets['main.js'],
							'/manifest.json',
							assets['favicon.ico'],
							'/content/images/dummy.jpg'
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
	event.respondWith(async function () {

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
					if (cacheImages) {
						await caches.open(CACHE_NAME).then(cache => {
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

		// Try to get the response from a cache.
		const cachedResponse = await caches.match(event.request);

		if (cachedResponse !== undefined) {
			console.log("RETURNING CACHED RES");
			return cachedResponse;
		}

		// Try to get the response from a server.
		let serverResponse;
		try {
			serverResponse = await fetch(event.request)
		} catch (e) {
			console.log(e)
		}

		// If server is available
		if (serverResponse !== undefined) {
			// Cache server response
			/*await caches.open(CACHE_NAME).then(cache => {
				cache.put(event.request.url, serverResponse.clone());
			});*/
			return serverResponse
		}

		return new Response("NOT AVAILABLE OFFLINE")
	}());
});
