function isHeaderValueTrue(response, headerName) {
	return response.headers.get(headerName) === "1";
}

function aelInstall(cacheName, doCache){
	self.addEventListener('install', event => {
		console.log('installing service worker');
		if (doCache) {
			event.waitUntil(
				caches.open(CACHE_NAME).then(cache => {
					fetch('/asset-manifest.json').then(response => {
						response.json().then(assets => {

							/*
							[OLD STRATEGY]
							Here we can build an array of urls that we need to cache.
							1) Fetch each request we need to cache.
							2) check in headers if need to cache text, images -> put in cache if true
							3) Fetch static css and images
							*/

							const apiRequestGetServices = '/api/get_list_of_services';

							// 1)
							fetch(apiRequestGetServices).then(responseRaw => {

								// Cache fetched apiRequestGetServices
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

							/*
							* [NEW CACHE STRATEGY]
							* 1) Cache static files (priority 0)
							* 2) Save current timestamp -> so we can update cache, when it is older then X
							* 3) Cache api:
							*    1. Fetch api, cache response
							*    2. In api response we have cache-priority param for each file,
							*       so we sort an array of files by priority from high to low.
							*    3. Iterate files-array:
							*       if available-space > file-size: fetch file
							*       if need-to-cache-file header is true: put file to cache
							* */

							// 1) Cache static files (priority 0)
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

							// 2) Save current timestamp -> so we can update cache, when it is older then X
							const currentTimestamp = Math.round((new Date()).getTime() / 1000);
							cache.put("/get_cache_timestamp", new Response(currentTimestamp));

							// 3) Cache api:
							const apiRequestAdac = 'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0&firstupdate=1&last_update=0&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';
							const apiRequestAdacHeaders = new Headers(
								{"Authorization": "Basic cnNtOnJzbTIwMTc="}
							);
							var apiRequestAdacParams = {
								headers: apiRequestAdacHeaders
							};

							// 3.1. Fetch api, cache response
							fetch(apiRequestAdac, apiRequestAdacParams).then(responseRaw => {

								// Cache fetched apiRequestAdac
								const responseRawClone = responseRaw.clone();
								cache.put(apiRequestAdac, responseRawClone);

								// 3.2. In api response we have cache-priority param for each file,
							  //      so we sort an array of files by priority from high to low.
								responseRaw.json()
									.then(response => {
										const files = response.files;

										// We can sort an array of files here

										// 3.3. Iterate files-array:
									  //      if available-space > file-size: fetch file
										//      if need-to-cache-file header is true: put file to cache
										if ('storage' in navigator && 'estimate' in navigator.storage) {
											navigator.storage.estimate().then(({usage, quota}) => {
												let freeSpace = quota-usage;
												let apiRequestAdacParamsImages = {...apiRequestAdac, mode: 'no-cors'};
												for(id in files){
													file = files[id];
													const fileReq = 'https://pa.adac.rsm-stage.de/'+file.path;
													if(file.size<=freeSpace){
														fetch(fileReq, apiRequestAdacParamsImages)
															.then(responseRaw => {
																const responseRawClone = responseRaw.clone();
																if (isHeaderValueTrue(responseRawClone, "need-to-cache-file")){
																	cache.put(fileReq, responseRawClone);
																}
																// Temporary, we don't have need-to-cache-file param in Header
																console.log(file.path);
																cache.put(fileReq, responseRawClone);
															});
														freeSpace-=file.size;
													} else {
														console.log("Not enough space for file");
														break;
													}
												}
											}).catch(error => {
												console.error('Loading storage estimate failed:');
												console.log(error.stack);
											});
										} else {
											console.error('navigator.storage.estimate API unavailable.');
										}
									});
							});
						});
					});
				})
			);
		}
		Notification.requestPermission(function(status) {
			console.log('Notification permission status:', status);
		});
	});
}