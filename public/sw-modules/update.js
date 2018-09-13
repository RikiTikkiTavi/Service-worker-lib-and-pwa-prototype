function handleUpdate_setInterval() {
	setInterval(async function () {
			let cache = await caches.open(PARAMS.cacheName);
			updateCachesIfOld(PARAMS.cacheOldenTime, cache, PARAMS.whatToUpdate)
				.then((updateResult) => handleUpdateResult(updateResult))
		}, PARAMS.updateInterval
	)
}