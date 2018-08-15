function handleUpdate() {
	setInterval(function () {
			updateCachesIfOld(PARAMS)
				.then((updateResult) => {
					console.log("UPDATE RESULT", updateResult);
					if (updateResult === 1) {
						sendMessage(PARAMS.refreshSuccessMessage)
					}
					if (updateResult === 0) {
						console.log("Content is up to date")
					}
					if (updateResult === 404) {
						sendMessage(PARAMS.refreshFailMessage)
					}
				})
		}, PARAMS.updateInterval
	)
}