/* eslint-disable no-undef,no-shadow,no-param-reassign */

/*
*
*
* */

async function aelInstall() {
	self.addEventListener('install', event => {
		if (PARAMS.doCache) {
			event.waitUntil(
				caches.open(PARAMS.cacheName).then(async cache => {
					/*
					* [NEW CACHE STRATEGY]
					* 1) Cache static files (priority 0)
					* 2) Save current timestamp -> so we can update cache, when it is older then X
					* 3) Cache api:
					*    1. Fetch api, cache response
					*    2. In api response we have cache-priority and need-to-cache param for each file,
					*       so we sort an array of files by priority from high to low and remove
					*       files we don't need to cache
					*    3. Iterate files-array:
					*       if available-space > file-size AND need-to-cache is true: fetch and cache file
					* */

					// 1) Cache static files (priority 0)
					let urlsToCache = await getStaticUrls(PARAMS.assetManifestUrl, PARAMS.staticFilesArray);
					cache.addAll(urlsToCache);

					// Cache dummy alone, because need to set header
					cacheWithAdditionalHeaders(PARAMS.dummyImage, {name: "dummy", value: "true"}, cache);

					// 2) Save current timestamp -> so we can update cache, when it is older then X
					setCurrentTimestamp(cache);

					// 3) Cache api:

					// 3.1. Fetch api, cache response
					let freeSpace = await getFreeSpace();
					let responseRaw;
					(
						{freeSpace, responseRaw} = await downloadAndCacheRequest(
							apiRequestAdac, 0, undefined, freeSpace, apiRequestAdacPARAMS, cache
						)
					);
					let response = await responseRaw.json();

					// 3.2. In api response we have cache-priority param for each file,
					//      so we sort an array of files by priority from high to low.

					// Transform files OBJ into array for sorting and further usage.
					let filesArr = Object.values(response.files);

					// Temporary add some PARAMS to files
					filesArr = tempAddPARAMSToFiles(filesArr);

					/* In api response we have cachePriority and needToCache param for each file,
						 * so we sort an array of files by priority from high to low and remove
						 * files we don't need to cache */
					filesArr = bSortArrAndRmNoCache(filesArr, true, 'cachePriority', undefined);
					console.log('FILES ARRAY AFTER SORTING', filesArr);

					// 3.3. Iterate files-array:
					//      if available-space > file-size: fetch file
					//      if need-to-cache-file header is true: put file to cache

					downloadAndCacheFiles(filesArr, freeSpace, 'https://pa.adac.rsm-stage.de/', cache)
				})
			);
		}
	});
}
