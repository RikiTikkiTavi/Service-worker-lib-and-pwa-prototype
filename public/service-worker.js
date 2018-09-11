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

const swRequest = {
    baseUrl: 'https://pa.adac.rsm-stage.de',
    mainApiPath: "/api/contents/bjoern@hempel.li/updates/contents.json",
    headersInit:
        {
            'Authorization': 'Basic ' + btoa('rsm:rsm2017')
        },
    getReqParams:
        {
            "confirm": "0",
            "firstupdate": "1",
            "last_update": "0",
            "token": "80efdb358e43b56b15a9af74bcdca3b8b595eac7f1fd47aca0b01dfa005c91d0"
        },
    mainReqParams:
        {
            method: 'GET',
        },
    filesReqParams:
        {
            mode: 'no-cors',
            method: 'GET',
            credentials: "include"
        },
    filesReqHeadersInit:
        {
            'Authorization': 'Basic ' + btoa('rsm:rsm2017')
        },
};
swRequest.mainReqParams.headers = new Headers(swRequest.headersInit);
swRequest.filesReqParams.headers = new Headers(swRequest.filesReqHeadersInit);

console.info("SERVICE WORKER", "CALLING aelInstall");
// This triggers when user starts the app
aelInstall();

console.info("SERVICE WORKER", "CALLING aelActivate");
// Delete old unused caches if exist
aelActivate();

console.info("SERVICE WORKER", "CALLING aelFetch");
// Here we intercept request and serve up the matching files
aelFetch();

console.info("SERVICE WORKER", "STARTING update interval");
// Here we starting update interval
handleUpdate_setInterval();