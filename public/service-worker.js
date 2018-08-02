const CACHE_NAME = 'project-prototype-app-cache';

/*
We can set params in cache or some json file before calling registerServiceWorker() (index.js)
*/

/*
PROBLEM: How to change content in cache on its change in server
NOW: No dynamic caching when online
*/

/*
On API call we get content that was updated since the time we specify in request OR 0 -> all content.
Strategy:
1) On service worker install we cache all API and static, save current timestamp
2) On each App load OR if cache is older then 10min ->
   do API request with timestamp of latest caching.
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

function isHeaderValueTrue(response, headerName) {
	return response.headers.get(headerName) === "1";
}

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
						2) check in headers if need to cache text, images -> put in cache if true
						3) Fetch static css and images
						*/

						const apiRequestGetServices = '/api/get_list_of_services';

						// 1)
						fetch(apiRequestGetServices).then(responseRaw => {

							// Cache fetched apiRequestGetServices
							console.log("CACHING API...");
							const responseRawClone = responseRaw.clone();
							// cache if need-to-cache-text:
							if (isHeaderValueTrue(responseRawClone, "need-to-cache-text")) {
								cache.put(apiRequestGetServices, responseRawClone);
							}
							// 2) cache if need-to-cache-images
							if (isHeaderValueTrue(responseRawClone, "need-to-cache-images")) {
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

						const apiRequestAdac = 'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0&firstupdate=1&last_update=0&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';
						const apiRequestAdacHeaders = new Headers(
							{"Authorization": "Basic cnNtOnJzbTIwMTc="}
						);
						var apiRequestAdacParams = {
							headers: apiRequestAdacHeaders
						};
						fetch(apiRequestAdac, apiRequestAdacParams).then(responseRaw => {

							// Cache fetched apiRequestGetServices
							console.log("CACHING API...");
							const responseRawClone = responseRaw.clone();
							cache.put(apiRequestAdac, responseRawClone);

							// Cache images
							console.log("CACHING IMAGES...");
							responseRaw.json()
								.then(response => {
									const categories = response.categories;
									for(id in categories){
										const category = categories[id];
										const imgReq = 'https://pa.adac.rsm-stage.de/'+category.image;
										const imgBgReq = 'https://pa.adac.rsm-stage.de/'+category.image_bg;
										let apiRequestAdacParamsImages = {...apiRequestAdac, mode: 'no-cors'}
										fetch(imgReq, apiRequestAdacParamsImages)
											.then(responseRaw => {
												const responseRawClone = responseRaw.clone();
												if (isHeaderValueTrue(responseRawClone, "need-to-cache-image")){
													cache.put(imgReq, responseRawClone);
												}
												// Temporary, we don't have need-to-cache-image param in Headers
												cache.put(imgReq, responseRawClone);
											})
									}
								});

							// cache if need-to-cache-text:
							if (isHeaderValueTrue(responseRawClone, "need-to-cache-text")) {
								cache.put(apiRequestAdac, responseRawClone);
							}
						});
						// 3) Cache static css, images, js
						/*If we want some url to work offline after page reload or by going direct to url
						  -> must cache it here. Example: /services/1*/
						console.log("CACHING STATIC...");
						const urlsToCache = [
							'/',
							'/services',
							'/categories',
							'/service-worker.js',
							assets['main.js'],
							'/manifest.json',
							assets['favicon.ico'],
							'/content/images/dummy.jpg'
						];
						cache.addAll(urlsToCache);

						/*Save current timestamp*/
						const currentTimestamp = Math.round((new Date()).getTime() / 1000);
						cache.put("/get_cache_timestamp", new Response(currentTimestamp))
					});
				});
			})
		);
	}
});

// Here we intercept request and serve up the matching files
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

			console.log(event.request);

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

		console.log(event.request);

		var cachedResponse;

		// Try to get the response from a cache, if it is not old
		if (!isCacheOld) {
			// Try to get the response from a cache
			cachedResponse = await caches.match(event.request, {ignoreVary: true});
			if (cachedResponse !== undefined) {
				console.log("RETURNING CACHED RES");
				return cachedResponse;
			}
		}

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
			if (isHeaderValueTrue(serverResponse, "need-to-cache-text")) {
				await caches.open(CACHE_NAME).then(cache => {
					cache.put(event.request.url, serverResponse.clone());
				});
			}
			return serverResponse
		}

		// Return the response from an old cache, if offline and cache is old
		if (cachedResponse !== undefined) {
			console.log("RETURNING CACHED RES");
			alert("Local data is old. Connect to the internet to get fresh data");
			return cachedResponse;
		}

		return new Response("NOT AVAILABLE OFFLINE")
	}());
});
