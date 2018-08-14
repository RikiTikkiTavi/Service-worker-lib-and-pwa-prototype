// TODO: Optimize caches.open
// TODO: Optimize apiRequestAdac
// TODO: On update delete files with low priority to download files with high prior.

/*
* ADAC CONSTANTS
* */

const apiRequestAdac =
	'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0&firstupdate=1&last_update=0&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';

const apiRequestAdacHeaders = new Headers({
	Authorization: 'Basic cnNtOnJzbTIwMTc='
});

const apiRequestAdacParams = {
	headers: apiRequestAdacHeaders
};

// Temporary cross-origin req
const apiRequestAdacParamsImages = {
	...apiRequestAdac,
	mode: 'no-cors'
};

async function checkCachesThroughCachedTimestamp(PARAMS) {
	let isCacheOld = false;

	const currentTimestamp = Math.round((new Date()).getTime() / 1000);
	let cacheTimestampResponse = await caches.match('/get_cache_timestamp');
	let cacheTimestamp = await cacheTimestampResponse.text();
	if (cacheTimestamp !== undefined) {
		const timeDiff = currentTimestamp - cacheTimestamp;
		if (timeDiff < PARAMS.cacheOldenTime) {
			console.log("CACHE IS OLDER THEN 10min");
			isCacheOld = true
		}
	}
	return {isCacheOld, cacheTimestamp}
}

async function checkCachesThroughApi(cacheTimestamp) {

	console.log('Checking caches through api');

	// API Request with last update timestamp
	const apiRequestAdac =
		'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0&' +
		cacheTimestamp +
		'firstupdate=1&last_update=0&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';

	const apiRequestAdacHeaders = new Headers({
		Authorization: 'Basic cnNtOnJzbTIwMTc='
	});
	const apiRequestAdacParams = {
		headers: apiRequestAdacHeaders
	};

	let response;
	let cacheUpToDate;
	let headers;

	try {
		let responseRaw = await fetch(apiRequestAdac, apiRequestAdacParams);
		let headers = responseRaw.headers;
		response = await responseRaw.json();
		console.log("UPDATE RECEIVED", response);
		cacheUpToDate = parseInt(response.code) !== 5;
	} catch (e) {
		console.log(e);
		response = 404;
	}

	return {cacheUpToDate, response, headers}

}

async function deleteCachedRequest(requestUrl) {
	caches.open(CACHE_NAME).then(cache => {
		cache.delete(requestUrl).then(result => result)
	})
}

/**
 * Detects free space in cache storage.
 * @returns int or undefined
 */
async function getFreeSpace() {
	let freeSpace;
	if (
		'storage' in navigator &&
		'estimate' in navigator.storage
	) {
		try {
			const {usage, quota} = await navigator.storage.estimate();
			freeSpace = quota - usage;
		}
		catch (e) {
			PARAMS.storageEstimateLoadError();
			console.log(e.stack);
		}
	} else {
		PARAMS.storageApiUnavailableError();
	}

	return freeSpace;
}

async function downloadAndCacheRequest(requestUrl, size, priority, freeSpace) {
	if (size <= freeSpace) {
		fetch(requestUrl, apiRequestAdacParamsImages).then(
			responseRaw => {
				const responseRawClone = responseRaw.clone();
				// We can check here file headers if needed
				cache.put(requestUrl, responseRawClone);
			}
		);
	} else {
		// TODO: On update delete files with low priority to download files with high prior.
		PARAMS.fileSpaceError();
	}
}

async function downloadUpdateAndCacheFiles(cachedResponse, response, PARAMS) {
	console.log("downloadUpdateAndCacheFiles()");

	let freeSpace = await getFreeSpace();
	for (let id in response.files) {
		const file = response.files[id];
		const cachedFile = cachedResponse.files[id];
		const fileReq = `https://pa.adac.rsm-stage.de/${
			file.path
			}`;
		// If file exists in cache
		if (cachedResponse.files.hasOwnProperty(id)) {
			// If file in cache has same path and size
			if (file.path === cachedFile.path && file.size === cachedFile.size) {
				cachedResponse.files[id] = file;
			}
			// If file in cache has NOT the same path and size
			else {
				// If file needs to be cached
				await deleteCachedRequest(cachedFile.path);
				cachedResponse.files[id] = file;
				if (file.needToCache) {
					await downloadAndCacheRequest(fileReq, file.size, file.priority, freeSpace)
				}
			}
		}
		// If file NOT exists in cache
		else {
			if (file.needToCache) {
				cachedResponse.files[id] = file;
				await downloadAndCacheRequest(fileReq, file.size, file.priority, freeSpace)
			}
		}
	}
	return cachedResponse.files
}

/**
 *
 * @param response: Fresh response
 * @param headers: Old headers
 * @param PARAMS
 * @returns {Promise<void>}
 */
async function updateCaches(response, headers, PARAMS) {

	// Get raw cache response
	let cachedResponseRaw = await caches.match(apiRequestAdac, {ignoreVary: true});
	let cachedResponse = await cachedResponseRaw.json();

	// Update categories
	for (let id in response.categories) {
		cachedResponse.categories[id] = response.categories[id];
	}

	// Update files
	cachedResponse.files = await downloadUpdateAndCacheFiles(cachedResponse, response);

	// Create new cache Response
	let cachedResponseRawNew = new Response(JSON.stringify(cachedResponse), {headers: headers});

	// Update timestamp and update Response in caches
	const currentTimestamp = Math.round(new Date().getTime() / 1000);
	console.log("Setting new timestamp and updating cache");
	caches.open(PARAMS.cacheName).then(cache => {
		cache.put('/get_cache_timestamp', new Response(currentTimestamp));
		cache.put(apiRequestAdac, cachedResponseRawNew);
	});
}

function setCurrentTimestamp(PARAMS) {
	const currentTimestamp = Math.round(new Date().getTime() / 1000);
	caches.open(PARAMS.cacheName).then(cache => {
		cache.put('/get_cache_timestamp', new Response(currentTimestamp));
	});
}

async function updateCachesIfOld(PARAMS) {
	let {isCacheOld, cacheTimestamp} = await checkCachesThroughCachedTimestamp(PARAMS);
	if (isCacheOld) {
		let {isCacheUpToDate, response, headers} = await checkCachesThroughApi(cacheTimestamp);

		if (response !== 404) {
			if (!isCacheUpToDate) {
				// setCurrentTimestamp(PARAMS);
				await updateCaches(response, headers, PARAMS);
				return 1
			}
		} else {
			// User is offline. Show message, that caches might be old
			console.log("User is offline. Show message, that caches might be old");
			return 404;
		}
	}
	else {
		return 0;
	}
}

function sendMessage(msg) {
	self.clients.matchAll().then(function (clients) {
		console.log(clients);
		clients.forEach(function (client) {
			console.log('sending message');
			client.postMessage({
				msg: msg
			});
		});
	});
}

function aelFetch(cacheName, PARAMS) {
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