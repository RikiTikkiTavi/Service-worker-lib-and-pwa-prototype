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
	console.log("CACHE TIMESTAMP", cacheTimestamp);
	if (cacheTimestamp !== undefined) {
		const timeDiff = currentTimestamp - cacheTimestamp;
		if (timeDiff > PARAMS.cacheOldenTime) {
			console.log("CACHE IS OLDER THEN ", PARAMS.cacheOldenTime, " Difference: ", timeDiff);
			isCacheOld = true
		}
	}
	return {isCacheOld, cacheTimestamp}
}


async function checkCachesThroughApi(cacheTimestamp) {

	console.log('checkCachesThroughApi()');

	// API Request with last update timestamp
	const apiRequestAdac =
		'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0firstupdate=1&last_update=' +
		cacheTimestamp + '&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';

	const apiRequestAdacHeaders = new Headers({
		Authorization: 'Basic cnNtOnJzbTIwMTc='
	});
	const apiRequestAdacParams = {
		headers: apiRequestAdacHeaders
	};

	let response;
	let isCacheUpToDate;
	let headers;

	try {
		let responseRaw = await fetch(apiRequestAdac, apiRequestAdacParams);
		headers = responseRaw.headers;
		response = await responseRaw.json();
		console.log("UPDATE RECEIVED", response);
		isCacheUpToDate = parseInt(response.code) !== 5;
	} catch (e) {
		console.log(e);
		response = 404;
	}

	return {isCacheUpToDate, response, headers}

}


async function deleteCachedRequest(requestUrl) {
	caches.open(CACHE_NAME).then(cache => {
		cache.delete(requestUrl).then(result => result)
	})
}


/**
 * @function getFreeSpace
 * @description Detects free space in cache storage.
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
			console.error(PARAMS.storageEstimateLoadError);
			console.log(e.stack);
		}
	} else {
		console.error(PARAMS.storageApiUnavailableError);
	}

	return freeSpace;
}


async function downloadAndCacheRequest(requestUrl, size, cachePriority, freeSpace) {
	if (size <= freeSpace) {
		fetch(requestUrl, apiRequestAdacParamsImages).then(
			responseRaw => {
				const responseRawClone = responseRaw.clone();
				// We can check here file headers if needed
				cache.put(requestUrl, responseRawClone);
			}
		);
		freeSpace -= size;
	} else {
		// TODO: On update delete files with low priority to download files with high prior.
		if (cachePriority !== undefined) {
			// DELETE file with priority lower then this file has
		}
		console.error(PARAMS.fileSpaceError);
	}
	return freeSpace
}


async function downloadUpdateAndCacheFiles(cachedResponse, response, PARAMS) {

	let freeSpace = await getFreeSpace();
	console.log("downloadUpdateAndCacheFiles() -> freeSpace", freeSpace);

	// TEMPORARY add params to files
	let filesArr = tempAddPARAMSToFiles(response.files);

	// Sort them and remove no-cache files
	filesArr = bSortFilesByPriorAndRmNoCache(filesArr, false);

	for (let id in filesArr) {
		const file = filesArr[id];
		const cachedFile = cachedResponse.files[id];
		const fileReq = `https://pa.adac.rsm-stage.de/${
			file.path
			}`;
		// If file exists in cache
		if (cachedResponse.files.hasOwnProperty(id)) {

			// If file in cache has same path and size
			if (file.path === cachedFile.path && file.size === cachedFile.size) {
				cachedResponse.files[id] = file;
				if(!file.needToCache){
					await deleteCachedRequest(cachedFile.path);
				}
			}
			// If file in cache has NOT the same path and size
			else {
				// If file needs to be cached
				// Delete old file
				await deleteCachedRequest(cachedFile.path);
				cachedResponse.files[id] = file;
				if (file.needToCache) {
					freeSpace = await downloadAndCacheRequest(fileReq, file.size, file.priority, freeSpace);
				}
			}
		}
		// If file NOT exists in cache
		else {
			cachedResponse.files[id] = file;
			if (file.needToCache) {
				freeSpace = await downloadAndCacheRequest(fileReq, file.size, file.cachePriority, freeSpace)
			}
		}
	}
	return cachedResponse.files
}


function setCurrentTimestamp(PARAMS) {
	const currentTimestamp = Math.round(new Date().getTime() / 1000);
	caches.open(PARAMS.cacheName).then(cache => {
		cache.put('/get_cache_timestamp', new Response(currentTimestamp));
	});
}


async function updateCachesIfOld(PARAMS) {
	console.log('updateCachesIfOld()');
	let {isCacheOld, cacheTimestamp} = await checkCachesThroughCachedTimestamp(PARAMS);
	if (isCacheOld) {
		let {isCacheUpToDate, response, headers} = await checkCachesThroughApi(cacheTimestamp);

		console.log('updateCachesIfOld() -> isCacheUpToDate', isCacheUpToDate);
		console.log('updateCachesIfOld() -> response', response);

		if (response !== 404) {
			if (isCacheUpToDate === false) {
				// setCurrentTimestamp(PARAMS);
				await updateCaches(response, headers, PARAMS);
				return 1
			}
		}
		if (response === 404) {
			// User is offline. Show message, that caches might be old
			console.log("User is offline. Show message, that caches might be old");
			return 404;
		}
	}
	return 0;
}


function sendMessage(msg) {
	self.clients.matchAll().then(function (clients) {
		clients.forEach(function (client) {
			client.postMessage({
				msg: msg
			});
		});
	});
}


function handleUpdateResult(updateResult){
	console.log("UPDATE RESULT", updateResult);
	if (updateResult === 1) {
		sendMessage(PARAMS.refreshSuccessMessage)
	}
	if (updateResult === 0) {
		console.log("Content is up to date")
	}
	if (updateResult === 404) {
		sendMessage(PARAMS.refreshFailMessage)
	}
}


/**
 * @function updateCaches
 * @param response: Fresh response
 * @param headers: Old headers
 * @param PARAMS
 * @returns {Promise<void>}
 */
async function updateCaches(response, headers, PARAMS) {

	// Get raw cache response
	let cachedResponseRaw = await caches.match(apiRequestAdac, {ignoreVary: true});
	let cachedResponse = await cachedResponseRaw.json();
	console.log("updateCaches -> cachedResponse:", cachedResponse);

	cachedResponse.timestamp = response.timestamp;
	cachedResponse.code = response.code;
	cachedResponse.message = response.message;

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


async function tryFetchFromServer(request){
	let serverResponse;
	try {
		serverResponse = await fetch(request)
	} catch (e) {
		console.log(e)
	}
	return serverResponse;
}


async function handleFetchServerResponse(serverResponse, param) {
	if (
		isHeaderValueTrue(serverResponse, "need-to-cache-file")
		&& PARAMS[param]
	) {
		await caches.open(PARAMS.cacheName).then(cache => {
			cache.put(event.request.url, serverResponse.clone());
		});
	}
}


// Handle images caching logic when user makes request
async function handleFetchImage(event){

	// Try to get the response from a cache.
	const cachedResponse = await caches.match(event.request);

	// If no cache try to make request
	if (cachedResponse === undefined) {

		// Check if server is available
		let serverResponse = await tryFetchFromServer(event.request);

		// If server is available
		if (serverResponse !== undefined) {

			/*
			* Cache image on each server response if:
			* 1) need-to-cache-file header
			* 2) Images fetch caching is enabled */

			await handleFetchServerResponse(serverResponse, 'enableGeneralImagesCaching');

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


// Handle other content caching logic when user makes request
async function handleFetchOther(event){
	var cachedResponse;
	cachedResponse = await caches.match(event.request, {ignoreVary: true});
	if (cachedResponse !== undefined) {
		return cachedResponse;
	}

	// Try to get the response from a server if cacheResponse is undefined.
	let serverResponse = tryFetchFromServer(event.request);

	// If server is available
	if (serverResponse !== undefined) {
		// On this point we know, that fresh cache for this req doesn't exist,
		/*
		* Here we cache Response, if (fresh cache for this req doesn't exist):
		* 1) Header param
		* 2) General fetch caching is enabled */
		await handleFetchServerResponse(serverResponse, 'enableGeneralFetchCaching');
		return serverResponse
	}

	return await caches.match('/', {ignoreVary: true});
}