function handleUpdate_setInterval() {
	setInterval(function () {
			updateCachesIfOld(PARAMS)
				.then((updateResult) => handleUpdateResult(updateResult))
		}, PARAMS.updateInterval
	)
}