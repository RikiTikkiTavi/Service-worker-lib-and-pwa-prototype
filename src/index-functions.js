function updateRootState(object){
    window.rootComponent.setState(object)
}

function handleInstallationComplete() {
    alert("SW Installation completed. App will be restarted to activate PWA potential.")
    location.reload()
}

function displayNotification(data, options) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.getRegistration().then(function (reg) {
            reg.showNotification(data.msg, options);
        });
    }
}

function swAddMsgMessageListener(){
    navigator.serviceWorker.addEventListener('message', event => {
        console.log("RECEIVED MESSAGE", event.data);
        displayNotification(event.data.msg);
        launchEvent(event.data.event, event.data.data)
    })
}

function launchEvent (event, data){
    if(event==="reload_api"){
        window.rootComponent.fetchAdacApi(true);
    } if(event==='update_LS'){
        setUpdatedItemsInLocalStore(data.keyName, data.ids)
    }
}

async function setUpdatedItemsInLocalStore(keyName, ids) {
    let lStorage = window.localStorage;
    let uObject = await JSON.stringify({
        upIDs: ids,
        quantity: ids.length,
    });
    lStorage.setItem(keyName, uObject)
}

function triggerCacheUpdateCheckOnDOMUpdate(newHistory){
    newHistory.listen((location, action) => {
        // Trigger cache update check
        fetch('/update-caches');
    })
}

// Update symbols will work only for the PWA app with caching on main request enabled

module.exports = {
    updateRootState,
    handleInstallationComplete,
    displayNotification,
    swAddMsgMessageListener,
    triggerCacheUpdateCheckOnDOMUpdate
};