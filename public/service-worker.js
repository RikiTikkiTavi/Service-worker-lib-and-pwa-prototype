/* eslint-disable no-undef */
self.importScripts(
	'./sw-modules/activate.js',
	'./sw-modules/install.js',
	'./sw-modules/fetch.js',
	'./service-worker.params.js'
);

/*
On API call we get content that was updated since the time we specify in request OR 0 -> all content.
Strategy:
1) On service worker install we cache all API and static, save current timestamp
2) On each App load OR if cache is older then 10min ->
   do API request with timestamp of latest caching.
*/

// TODO: Fetch params from cache or json file
const CACHE_NAME = 'project-prototype-app-cache';

// Delete old caches
aelActivate(CACHE_NAME);

// This triggers when user starts the app
aelInstall(CACHE_NAME, params);

// Here we intercept request and serve up the matching files
aelFetch(CACHE_NAME, params);

setInterval(function () {
		updateCachesIfOld(params)
			.then((updateResult) => {
				console.log("UPDATE RESULT", updateResult);
				let options = {
					actions: [{action: "refresh", title: "Refresh"}]
				};
				if (updateResult === 1) {
					sendMessage(params.refreshSuccessMessage)
				}
				if (updateResult === 0) {
					sendMessage(params.refreshFailMessage)
				}
				if (updateResult === 404) {
					sendMessage("User is offline. Show message, that caches might be old")
				}
			})
	}, 600000
);