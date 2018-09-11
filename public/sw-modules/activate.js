function aelActivate() {
    self.addEventListener('activate', event => {
        console.log('ACTIVATE EVENT');
        const currentCachelist = PARAMS.cacheName;
        event.waitUntil(
            caches.keys().then(keyList =>
                Promise.all(
                    keyList.map(key => {
                        if (!currentCachelist.includes(key)) {
                            return caches.delete(key);
                        }
                    })
                )
            )
        );
    });
}
