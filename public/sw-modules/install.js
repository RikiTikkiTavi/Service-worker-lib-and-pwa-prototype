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

							// 1) First cache static files

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
							cache.put("/get_cache_timestamp", new Response(currentTimestamp));

							//2) Cache texts and then cache other files in the available space;

							fetch(apiRequestAdac, apiRequestAdacParams).then(responseRaw => {

								// Cache fetched apiRequestAdac
								console.log("CACHING API...");
								const responseRawClone = responseRaw.clone();
								cache.put(apiRequestAdac, responseRawClone);

								/*
								* 1) Sort files by its cache-priority
								* 2) Start caching.
								*    if space available -> cache file
								* */

								responseRaw.json()
									.then(response => {
										const files = response.files;

										// We can sort an array of files here

										// 2)
										if ('storage' in navigator && 'estimate' in navigator.storage) {
											navigator.storage.estimate().then(({usage, quota}) => {
												let freeSpace = quota-usage;
												let apiRequestAdacParamsImages = {...apiRequestAdac, mode: 'no-cors'};
												console.log(freeSpace);
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
	});
}