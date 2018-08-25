// TODO: In every Fetch request as Request object
// TODO: Split all functions on small reusable components
// TODO: Lib to OOP style
// TODO: Abstract from ADAC request

/*
* ADAC CONSTANTS
* */

const apiRequestAdac =
	'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0&firstupdate=1&last_update=0&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';

const apiRequestAdacHeaders = new Headers({
	Authorization: 'Basic cnNtOnJzbTIwMTc='
});

const apiRequestAdacPARAMS = {
	headers: apiRequestAdacHeaders
};

// Temporary cross-origin req
const apiRequestAdacImagesHeaders = new Headers({
	Authorization: 'Basic cnNtOnJzbTIwMTc=',
	"Content-Type": "image/jpg",
});

const apiRequestAdacPARAMSImages = {
	headers: apiRequestAdacImagesHeaders,
	mode: 'no-cors'
};

/**
 * @param {number} cacheOldenTime - Cache olden time
 * @returns {Promise<{isCacheOld: (boolean | undefined), cacheTimestamp: (number | undefined)}>}
 * isCacheOld = true or false if cache successfully checked
 * cacheTimestamp = number or If '/get_cache_timestamp' doesn't exist - undefined
 * @description Checks if cache is old by comparing with cacheOldenTime value
 */
async function checkCachesThroughCachedTimestamp(cacheOldenTime) {
	let isCacheOld;
	const currentTimestamp = Math.round((new Date()).getTime() / 1000);
	let cacheTimestampResponse = await caches.match('/get_cache_timestamp');
	let cacheTimestamp = await cacheTimestampResponse.text();
	if (cacheTimestamp !== undefined) {
		const timeDiff = currentTimestamp - cacheTimestamp;
		if (timeDiff > cacheOldenTime) {
			console.log("CACHE IS OLDER THEN: ", cacheOldenTime, " Difference: ", timeDiff);
			isCacheOld = true
		} else {
			isCacheOld = false;
		}
	}
	return {isCacheOld, cacheTimestamp}
}


/**
 * @param {number} cacheTimestamp - timestamp of last cache update / installation
 * @returns {Promise<{
 *  isCacheUpToDate: (boolean | undefined),
 *  response: (Response | number),
 *  headers: (Headers | undefined)}
 * >} - isCacheUpToDate - if request failed -> is undefined;
 *      response - Response or If request failed -> 404
 *      headers - Headers of Response or If request failed -> undefined
 * @description Checks if cache is old by making API request with cacheTimestamp and
 * checking response code
 */
async function checkCachesThroughApi(cacheTimestamp) {

	console.log('checkCachesThroughApi()');

	// API Request with last update timestamp
	const apiRequestAdac =
		'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0firstupdate=1&last_update=' +
		cacheTimestamp + '&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';

	let response;
	let isCacheUpToDate;
	let headers;

	try {
		let responseRaw = await fetch(apiRequestAdac, apiRequestAdacPARAMS);
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


/**
 * @param {string} requestUrl - url to delete
 * @param {Cache} cache - Cache interface
 * @returns {Promise<void>}
 * @description Deletes cached request
 */
async function deleteCachedRequest(requestUrl, cache) {
	cache.delete(requestUrl).then(result => result)
}


/**
 * @returns {Promise<(number | undefined)>}
 * @description Detects free space in cache storage.
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


/**
 * @param {string} requestUrl - request url to cache
 * @param {number} size - request size in bytes (set 0 if doc)
 * @param {number} cachePriority - cache priority of this request.
 * if no space: cached requests with lower priority will be deleted
 * @param {number} freeSpace - available Space in cache storage
 * @param {Object} [requestParams] - fetch params
 * @param {Cache} cache - Cache interface
 * @returns {Promise<{freeSpace: number, responseRaw: (Response | undefined)}>}
 * @description Downloads and caches request if enough space, if not - tries to free space;
 */
async function downloadAndCacheRequest(
	requestUrl, size, cachePriority, freeSpace, requestParams = {}, cache
) {
	let responseRaw;
	if (size < freeSpace) {
		await fetch(requestUrl, requestParams).then(
			rRaw => {
				responseRaw = rRaw.clone();
				// We can check here file headers if needed

				// Set headers for easy delete of low-prior files later
				let headers;
				headers = new Headers({
					'cachepriority': cachePriority,
					'size': size
				});

				let reqObject = new Request(requestUrl, {headers: headers});
				cache.put(reqObject, rRaw);
			}
		);
		freeSpace -= size;
	} else {

		console.error(PARAMS.fileSpaceError);

		let {reqToDelete, emulatedFreeSpace} = await emulateDeleteFromCacheToFreeSpace(
			size, cachePriority, freeSpace, cache
		);

		// If emulatedFreeSpace is enough - cache file, else - not available to cache file
		if (size < emulatedFreeSpace) {
			for (let i in reqToDelete) {
				await deleteCachedRequest(reqToDelete[i].url, cache)
			}
			freeSpace = emulatedFreeSpace;
			(
				{freeSpace, responseRaw} = await downloadAndCacheRequest(
					requestUrl, size, cachePriority, freeSpace, requestParams, cache
				)
			)
		} else {
			console.error(PARAMS.unableToFreeSpaceError);
		}

	}

	return {freeSpace, responseRaw}
}

/**
 * @param {number} size - request size in bytes (set 0 if doc)
 * @param {number} cachePriority - cache priority of this request
 * @param {number} freeSpace - available Space in cache storage
 * @param {Cache} cache - Cache interface
 * @returns {Promise<{reqToDelete: Array, emulatedFreeSpace: number}>}
 * @description Function emulates deletion of Requests and returns
 * an array of Requests and amount of space, that could be free
 */
async function emulateDeleteFromCacheToFreeSpace(
	size, cachePriority, freeSpace, cache
) {

	// Array of cached requests
	let requestsArr = await cache.keys();

	//bsort
	requestsArr = bSortArrAndRmNoCache(requestsArr, false, undefined, 'cachepriority');

	let reqToDelete = [];
	let emulatedFreeSpace = freeSpace;

	// Try to free space
	while (size>emulatedFreeSpace) {
		let requestsArrLength = requestsArr.length;
		let lastReq = requestsArr[requestsArrLength - 1];
		let lastCachePrior = parseInt(lastReq.headers.get('cachepriority'));
		let lastSize = parseInt(lastReq.headers.get('size'));
		if (lastCachePrior > cachePriority) {
			reqToDelete.push(lastReq);
			emulatedFreeSpace += lastSize;
			requestsArr.splice(requestsArrLength - 1, 1)
		} else {
			break;
		}
	}
	return {reqToDelete, emulatedFreeSpace}
}

/**
 * @param {Object[]} filesArr - array of files to cache
 * @param {string} filesArr[].path - relative path
 * @param {number} filesArr[].size
 * @param {number} filesArr[].cachePriority
 * @param {number} freeSpace - available Space in cache storage
 * @param {string} baseUrl - base url to download file
 * @param {Cache} cache - Cache interface
 * @returns {Promise<boolean>} - True if all files are downloaded and cached
 * False if error
 * @description Downloads and caches files from array, if enough space
 */
async function downloadAndCacheFiles(filesArr, freeSpace, baseUrl, cache) {
	try {
		for (const i in filesArr) {
			const file = filesArr[i];
			const fileReq = baseUrl + file.path;
			(
				{freeSpace} = await downloadAndCacheRequest(
					fileReq, file.size, file.cachePriority, freeSpace, apiRequestAdacPARAMSImages, cache
				)
			)
		}
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}


/**
 * Sorts new filesArr, updates cachedResponse.files, deletes file if no more need to cache,
 * overwrites old files if they are changed, downloads and caches new files
 * @param {Object} cachedResponse - Cached main API request
 * @param {Object} response - Fresh fetched main API request
 * @param {Cache} cache - cache interface
 * @returns {Promise<Array>} - updated cachedResponse.files array
 */
async function downloadUpdateAndCacheFiles(cachedResponse, response, cache) {

	let freeSpace = await getFreeSpace();
	console.log("downloadUpdateAndCacheFiles() -> freeSpace", freeSpace);

	// TEMPORARY add params to files
	let filesArr = tempAddPARAMSToFiles(response.files);

	// Sort them and remove no-cache files
	filesArr = bSortArrAndRmNoCache(filesArr, false, 'cachePriority');

	for (let id in filesArr) {
		const file = filesArr[id];
		const cachedFile = cachedResponse.files[id];
		const fileReq = `https://pa.adac.rsm-stage.de/${
			file.path
			}`;
		// If file exists in cache
		if (cachedResponse.files.hasOwnProperty(id)) {

			// update file in cachedResponse and in Cache
			(
				{cachedResponse, freeSpace} = await updateFileInCachedResponseAndCaches(
					cachedFile, file, cachedResponse, fileReq, freeSpace, cache
				)
			)

		}
		// If file NOT exists in cache
		else {
			cachedResponse.files[id] = file;
			if (file.needToCache) {
				(
					{freeSpace} = await downloadAndCacheRequest(
						fileReq, file.size, file.priority, freeSpace, apiRequestAdacPARAMSImages, cache
					)
				)
			}
		}
	}
	return cachedResponse.files
}


/**
 * Updates cachedResponse.files, deletes file if no more need to cache,
 * overwrites old files if they are changed
 * @param {Object} cachedFile - Old file object
 * @param {Object} file - New file object
 * @param {Object} cachedResponse - cached Response of main API
 * @param {String} fileReq - URL to fetch file
 * @param {number} freeSpace - available space
 * @param {Cache} cache - cache interface
 * @returns {Promise<{cachedResponse: Object, freeSpace: number}>}
 */
async function updateFileInCachedResponseAndCaches (
	cachedFile, file, cachedResponse, fileReq, freeSpace, cache
){
	// If file in cache has same path and size
	if (file.path === cachedFile.path && file.size === cachedFile.size) {
		cachedResponse.files[id] = file;
		if (!file.needToCache) {
			await deleteCachedRequest(cachedFile.path, cache);
		}
		freeSpace+=cachedFile.size;
	}
	// If file in cache has NOT the same path and size
	else {
		// If file needs to be cached
		// Delete old file
		await deleteCachedRequest(cachedFile.path, cache);
		freeSpace+=cachedFile.size;
		cachedResponse.files[id] = file;
		if (file.needToCache) {
			(
				{freeSpace} = await downloadAndCacheRequest(
					fileReq, file.size, file.priority, freeSpace, apiRequestAdacPARAMSImages, cache
				)
			)
		}
	}
	return {cachedResponse, freeSpace}
}


/**
 * Sets current timestamp on request /get_cache_timestamp
 * @param cache
 */
function setCurrentTimestamp(cache) {
	const currentTimestamp = Math.round(new Date().getTime() / 1000);
	cache.put('/get_cache_timestamp', new Response(currentTimestamp));
}


/**
 * Updates caches if caches older then cacheOldenTime and response has updates
 * @param {number} cacheOldenTime - time after cache is old (seconds)
 * @param {Cache} cache - cache Interface
 * @returns {Promise<number>} - 1 if have updated cache, 0 if caches are up to date,
 * 404 if offline or api unavailable
 */
async function updateCachesIfOld(cacheOldenTime, cache) {
	console.log('updateCachesIfOld()');
	let {isCacheOld, cacheTimestamp} = await checkCachesThroughCachedTimestamp(cacheOldenTime);
	if (isCacheOld) {
		let {isCacheUpToDate, response, headers} = await checkCachesThroughApi(cacheTimestamp);

		console.log('updateCachesIfOld() -> isCacheUpToDate', isCacheUpToDate);
		console.log('updateCachesIfOld() -> response', response);

		if (response !== 404) {
			if (isCacheUpToDate === false) {
				// setCurrentTimestamp(PARAMS);
				await updateCaches(response, headers, cache);
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


/**
 * Sends message to client
 * @param {String} msg - message
 */
function sendMessage(msg) {
	self.clients.matchAll().then(function (clients) {
		clients.forEach(function (client) {
			client.postMessage({
				msg: msg
			});
		});
	});
}


/**
 * Converts header value to true/false
 * @param response
 * @param headerName
 * @returns {boolean} - true if header value is 1, false if header value is 1
 */
function isHeaderValueTrue(response, headerName) {
	return response.headers.get(headerName) === '1';
}


/**
 * Converts update result code in message and sends it to client
 * @param updateResult
 */
function handleUpdateResult(updateResult) {
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
 * @param cache: result of caches.open
 * @returns {Promise<void>}
 */
async function updateCaches(response, headers, cache) {

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
	cachedResponse.files = await downloadUpdateAndCacheFiles(cachedResponse, response, cache);

	// Create new cache Response
	let cachedResponseRawNew = new Response(JSON.stringify(cachedResponse), {headers: headers});

	// Update timestamp and update Response in caches
	const currentTimestamp = Math.round(new Date().getTime() / 1000);
	console.log("Setting new timestamp and updating cache");
	cache.put('/get_cache_timestamp', new Response(currentTimestamp));
	cache.put(apiRequestAdac, cachedResponseRawNew);
}


/**
 * Fetches request from server
 * @param {String} request - request to fetch
 * @returns {Promise<Response|undefined>} - Response on success, undefined if offline or
 * API unavailable
 */
async function tryFetchFromServer(request) {
	let serverResponse;
	try {
		serverResponse = await fetch(request)
	} catch (e) {
		console.log(e)
	}
	return serverResponse;
}


/**
 * Function handles response from server, if general caching in params is enabled and
 * needToCache header is true
 * @param {Response} serverResponse - Response
 * @param {String} param - param in PARAMS that enables/disables general caching for req of this type
 * @param {Cache} cache - cache interface
 * @param {String} needToCacheHeaderName - needToCache header name
 * @returns {Promise<void>}
 */
async function handleFetchServerResponse(serverResponse, param, cache, needToCacheHeaderName) {
	if (
		isHeaderValueTrue(serverResponse, needToCacheHeaderName)
		&& PARAMS[param]
	) {
		cache.put(event.request.url, serverResponse.clone());
	}
}


/**
 * Handles images caching logic when user makes request
 * @param event - fetch event
 * @param {Cache} cache - cache Interface
 * @returns {Promise<Response>} - cached response, server response or dummy image
 */
async function handleFetchImage(event, cache) {

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

			await handleFetchServerResponse(serverResponse, 'enableGeneralImagesCaching', cache, PARAMS.needToCacheHeaderName);

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


/**
 * Handle other content caching logic when user makes request
 * @param event - fetch event
 * @param {Cache} cache - cache interface
 * @returns {Promise<Response>} - cached response or server response or homepage
 */
async function handleFetchOther(event, cache) {
	let cachedResponse;
	cachedResponse = await caches.match(event.request, {ignoreVary: true});
	if (cachedResponse !== undefined) {
		return cachedResponse;
	}

	// Try to get the response from a server if cacheResponse is undefined.
	let serverResponse = await tryFetchFromServer(event.request);

	// If server is available
	if (serverResponse !== undefined) {
		// On this point we know, that fresh cache for this req doesn't exist,
		/*
		* Here we cache Response, if (fresh cache for this req doesn't exist):
		* 1) Header param
		* 2) General fetch caching is enabled */
		await handleFetchServerResponse(serverResponse, 'enableGeneralFetchCaching', cache, PARAMS.needToCacheHeaderName);
		return serverResponse
	}

	//TODO: Notify user if page is unavailable

	return await caches.match('/', {ignoreVary: true});
}


/**
 * Sorts array of objects by property or by header value, if specified. Removes
 * elements, where noNeedToCache if doRemoveWhereNoNeedToCache is true
 * @param {array<Object>} arr - array to sort
 * @param {boolean} doRemoveWhereNoNeedToCache - remove elements, that no need to cache
 * @param {String} property - property name to sort array by
 * @param {String} [headerNameAsParam] - if not undefined - sort array by header value
 * @returns {array<Object>} - sorted array
 */
function bSortArrAndRmNoCache(arr, doRemoveWhereNoNeedToCache, property, headerNameAsParam) {
	let len = arr.length;
	let swapped;
	do {
		swapped = false;
		for (let i = 0; i < len; i++) {
			if (doRemoveWhereNoNeedToCache) {
				if (arr[i].needToCache === 0) {
					arr.splice(i, 1);
					len--;
				}
				if (i === len - 1 || i === len) {
					break;
				}
			}

			let property = property;

			let val;
			let valNext;

			if (headerNameAsParam !== undefined) {
				val = arr[i].headers.get(headerNameAsParam);
				valNext = arr[i + 1].headers.get(headerNameAsParam);
			}
			else {
				val = arr[i][property];
				valNext = arr[i + 1][property];
			}
			if (val > valNext) {
				const tmp = arr[i];
				arr[i] = arr[i + 1];
				arr[i + 1] = tmp;
				swapped = true;
			}
		}
	} while (swapped);
	return arr;
}


function tempAddPARAMSToFiles(filesArr) {
	for (let i = 0; i < filesArr.length; i++) {
		filesArr[i].cachePriority = Math.floor(Math.random() * 5);
		filesArr[i].needToCache = Math.round(Math.random());
	}
	return filesArr;
}


/**
 * Fetches and caches url with additional headers
 * @param {String} url - url to cache
 * @param {Object} headers - additional headers object
 * @param {Cache} cache - cache interface
 */
function cacheWithAdditionalHeaders(url, headers, cache) {
	fetch(url).then((response) => {
		let newHeaders = new Headers(response.headers);
		for (let h in headers) {
			newHeaders.append(h.name, h.value)
		}
		response.headers = newHeaders;
		cache.put(url, response);
	});
}


/**
 * Gets static urls from assets-manifest json file.
 * @param {String} assetManifestUrl - url of asset-manifest
 * @param {Array} staticFilesArray - files to cache
 * @returns {Promise<Array>} - returns urls ready to add to cache
 */
async function getStaticUrls(assetManifestUrl, staticFilesArray) {
	let urlsToCache = [];
	let assetsResponse = await fetch(assetManifestUrl);
	let assets = await assetsResponse.json();
	for (let id in staticFilesArray) {
		let file = staticFilesArray[id];
		if (assets.hasOwnProperty(file)) {
			urlsToCache.push(assets[file])
		} else {
			urlsToCache.push(file)
		}
	}
	return urlsToCache;
}