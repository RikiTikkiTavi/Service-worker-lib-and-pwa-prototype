// TODO: Optimize caches.open
// TODO: On update delete files with low priority to download files with high prior.
// TODO: Break fetch and install on small functions

function aelFetch() {
	self.addEventListener('fetch', event => {
		event.respondWith(async function () {

			if (event.request.url.indexOf('/update-caches') !== -1) {
				let updateResult = await updateCachesIfOld(PARAMS);
				handleUpdateResult(updateResult);
				console.log(updateResult);
				return new Response(updateResult);
			}

			else {

				if (event.request.destination === 'image') {
					return await handleFetchImage(event);
				}
				// Handle other content caching logic when user makes request
				return await handleFetchOther(event);
			}
		}());
	});
}