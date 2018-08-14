var PARAMS = {

	// General params
	doCache: true, // Enable/Disable caching
	cacheName: "project-prototype-app-cache", // App cache name
	imagesCaching: true, // global enable of images caching
	videosCaching: false, // global enable of videos caching
	cacheOldenTime: 5, // Time in seconds, after that when user is online API request is made and cache is updated.
	staticFilesArray: ['/', 'bundle.js', 'service-worker.js'], // Static files to be cached
	dummyImage: 'content/images/dummy.jpg', //Dummy image to be shown if some images not available
	dummyImageHeader: {"dummy": "true"}, // Response header by returning dummy
	enableGeneralFetchCaching: false, // Enables caching on fetch (is necessary if not all
														 // necessary files is cached on sw install)
	enableImagesFetchCaching: false,
	refreshSuccessMessage: "Update available, please refresh",
	refreshFailMessage: "Update failed, please connect to the internet to update caches",

	// Errors handling functions
	fileSpaceError: console.log('Not enough space for file'),
	storageEstimateLoadError: console.log('Not enough space for file'),
	storageApiUnavailableError: console.error('Loading storage estimate failed:'),
};