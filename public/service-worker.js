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

let adacBaseUrl = "https://pa.adac.rsm-stage.de";
let adacMainApiPath = "/api/contents/bjoern@hempel.li/updates/contents.json";
let adacHeadersInit = {
    'Authorization': 'Basic ' + btoa('rsm:rsm2017')
};
let adacGetReqParams = {
    "confirm":"0",
    "firstupdate":"1",
    "last_update":"0",
    "token":"80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0"
};

let adacMainReqParams = {
    method: 'GET',
};

let adacImagesReqParams = {
    headers: apiRequestAdacImagesHeaders,
    mode: 'no-cors',
    method: 'GET',
    credentials: "include"
};

const adacApiReq = constructRequest(
    adacBaseUrl, adacMainApiPath, adacMainReqParams, adacHeadersInit, adacGetReqParams
);

console.info("SERVICE WORKER", "CALLING aelActivate");

// Delete old unused caches if exist
aelActivate();

console.info("SERVICE WORKER", "CALLING aelInstall");
// This triggers when user starts the app
aelInstall();

console.info("SERVICE WORKER", "CALLING aelFetch");
// Here we intercept request and serve up the matching files
aelFetch();

handleUpdate_setInterval();