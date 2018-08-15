console.info("SERVICE WORKER", "IMPORTING SCRIPTS");
/* eslint-disable no-undef */
self.importScripts(
	'./service-worker.params.js',
	'./sw-modules/service-worker.lib.js',
	'./sw-modules/activate.js',
	'./sw-modules/install.js',
	'./sw-modules/fetch.js',
	'./sw-modules/update.js',
);

/*
On API call we get content that was updated since the time we specify in request OR 0 -> all content.
Strategy:
1) On service worker install we cache all API and static, save current timestamp
2) On each App load OR if cache is older then 10min ->
   do API request with timestamp of latest caching.
*/

const CACHE_NAME = 'project-prototype-app-cache';
console.info("SERVICE WORKER", "CALLING aelActivate");

// Delete old unused caches if exist
aelActivate();

console.info("SERVICE WORKER", "CALLING aelInstall");
// This triggers when user starts the app
aelInstall();

console.info("SERVICE WORKER", "CALLING aelFetch");
// Here we intercept request and serve up the matching files
aelFetch();

handleUpdate();