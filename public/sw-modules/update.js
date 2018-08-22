function handleUpdate_setInterval() {
	setInterval(async function () {
			let cache = await caches.open(PARAMS.cacheName);
			updateCachesIfOld(PARAMS.cacheOldenTime, cache)
				.then((updateResult) => handleUpdateResult(updateResult))
		}, PARAMS.updateInterval
	)
}