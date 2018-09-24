var PARAMS = {

	// General params
	doCache: true, // Enable/Disable caching
	cacheName: "project-prototype-app-cache", // App cache name
	imagesCaching: true, // global enable of images caching
	videosCaching: false, // global enable of videos caching
	cacheOldenTime: 600, // Time in seconds, after that when user is online API request is made and cache is updated.
    staticFilesArray: ['/', 'favicon.ico', 'manifest.json'], // DEV temporary
	// staticFilesArray: ['/','main.js', 'service-worker.js', 'favicon.ico', 'manifest.json'], // Static files to be cached
	dummyImage: '/content/images/dummy.jpg', //Dummy image to be shown if some images not available
	dummyImageHeader: {"dummy": "true"}, // Response header by returning dummy
	enableGeneralFetchCaching: false, // Enables caching on fetch (is necessary if not all
														 // necessary files is cached on sw install)
	enableImagesFetchCaching: false,
	refreshSuccessMessage: "Update available, please refresh",
	updateInterval: 600000, // Interval of update-request,
	assetManifestUrl: '/asset-manifest.json',
	baseApiUrl: "https://pa.adac.rsm-stage.de/",

	needToCacheHeaderName: "need-to-cache-file",

	// Errors
	fileSpaceError: 'Not enough space for file',
	storageEstimateLoadError: 'Loading storage estimate failed',
	storageApiUnavailableError: 'Storage Api Unavailable',
	refreshFailMessage: "Update failed, please connect to the internet to update caches",
	unableToFreeSpaceError: "Unable to free space for file",

	// Messages
	installationCompleteMsg: 'App is ready for offline use',
	installationFailMsg: "App can't download content for offline use",

	// Update params
	whatToUpdate: ['categories'] // Array of API response object properties ("property": Object<id: value>)
								 // that contain content.
};