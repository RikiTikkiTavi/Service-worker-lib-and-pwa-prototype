/* eslint-disable no-undef,no-shadow,no-param-reassign */
function isHeaderValueTrue(response, headerName) {
  return response.headers.get(headerName) === '1';
}

function bSortFilesByPriorAndRmNoCache(filesArr) {
  let len = filesArr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len; i++) {
      if (filesArr[i].needToCache === 0) {
        filesArr.splice(i, 1);
        len--;
      }
      if (i === len - 1 || i === len) {
        break;
      }
      if (filesArr[i].cachePriority > filesArr[i + 1].cachePriority) {
        const tmp = filesArr[i];
        filesArr[i] = filesArr[i + 1];
        filesArr[i + 1] = tmp;
        swapped = true;
      }
    }
  } while (swapped);
  return filesArr;
}

function tempAddParamsToFiles(filesArr) {
  for (let i = 0; i < filesArr.length; i++) {
    filesArr[i].cachePriority = Math.floor(Math.random() * 5);
    filesArr[i].needToCache = Math.round(Math.random());
  }
  return filesArr;
}

function aelInstall(cacheName, doCache, params) {
  self.addEventListener('install', event => {
    console.log('installing service worker');
    if (doCache) {
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
          fetch('/asset-manifest.json').then(response => {
            response.json().then(assets => {
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
							*       if available-space > file-size: fetch file
							*       if need-to-cache-file header is true: put file to cache
							* */

              // 1) Cache static files (priority 0)
              const urlsToCache = [
                '/',
                '/service-worker.js',
                assets['main.js'],
                '/manifest.json',
                assets['favicon.ico'],
              ];
              cache.addAll(urlsToCache);

              // Cache dummy alone, because need to set header
	            fetch('content/images/dummy.jpg').then((response)=> {
	            	let newHeaders = new Headers(response.headers);
	            	newHeaders.append("dummy", "true");
	            	response.headers = newHeaders;
	            	cache.put('content/images/dummy.jpg', response);
	            });

              // 2) Save current timestamp -> so we can update cache, when it is older then X
              const currentTimestamp = Math.round(new Date().getTime() / 1000);
              cache.put('/get_cache_timestamp', new Response(currentTimestamp));

              // 3) Cache api:
              const apiRequestAdac =
                'https://pa.adac.rsm-stage.de/api/contents/bjoern@hempel.li/updates/contents.json?confirm=0&firstupdate=1&last_update=0&token=80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0';
              const apiRequestAdacHeaders = new Headers({
                Authorization: 'Basic cnNtOnJzbTIwMTc='
              });
              const apiRequestAdacParams = {
                headers: apiRequestAdacHeaders
              };

              // 3.1. Fetch api, cache response
              fetch(apiRequestAdac, apiRequestAdacParams).then(responseRaw => {
                // Cache fetched apiRequestAdac
                const responseRawClone = responseRaw.clone();
                cache.put(apiRequestAdac, responseRawClone);

                // 3.2. In api response we have cache-priority param for each file,
                //      so we sort an array of files by priority from high to low.
                responseRaw.json().then(response => {
                  // Transform files OBJ into array for sorting and further usage.
                  let filesArr = Object.values(response.files);

                  // Temporary add some params to files
                  filesArr = tempAddParamsToFiles(filesArr);

                  /* 2. In api response we have cachePriority and needToCache param for each file,
										 * so we sort an array of files by priority from high to low and remove
							       * files we don't need to cache */
                  filesArr = bSortFilesByPriorAndRmNoCache(filesArr);
                  console.log('FILES ARRAY AFTER SORTING', filesArr);

                  // 3.3. Iterate files-array:
                  //      if available-space > file-size: fetch file
                  //      if need-to-cache-file header is true: put file to cache
                  if (
                    'storage' in navigator &&
                    'estimate' in navigator.storage
                  ) {
                    navigator.storage
                      .estimate()
                      .then(({ usage, quota }) => {
                        let freeSpace = quota - usage;
                        // Temporary cross-origin request
                        const apiRequestAdacParamsImages = {
                          ...apiRequestAdac,
                          mode: 'no-cors'
                        };
                        for (const i in filesArr) {
                          const file = filesArr[i];
                          const fileReq = `https://pa.adac.rsm-stage.de/${
                            file.path
                          }`;
                          if (file.size <= freeSpace) {
                            fetch(fileReq, apiRequestAdacParamsImages).then(
                              responseRaw => {
                                const responseRawClone = responseRaw.clone();
                                // We can check here file headers if needed
                                cache.put(fileReq, responseRawClone);
                              }
                            );
                            freeSpace -= file.size;
                          } else {
                            console.log('Not enough space for file');
                            break;
                          }
                        }
                      })
                      .catch(error => {
                        console.error('Loading storage estimate failed:');
                        console.log(error.stack);
                      });
                  } else {
                    console.error(
                      'navigator.storage.estimate API unavailable.'
                    );
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
