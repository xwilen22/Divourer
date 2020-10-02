function onException(error) {
    console.error(error)
}

/*browser.tabs.executeScript({file: "/divourer.js"}).then(() => {
    console.log("Supposedly injected script... 🤠")
}).catch(onException)*/ 


browser.runtime.onMessage.addListener((message) => {
    console.log(`Message recieved from browser action! ${message.command}`)
    
    switch(message.command) {
        case "set-badge" : {
            browser.tabs.query({
                currentWindow: true,
                active: true
            })
            .then((tabs) => {
                browser.browserAction.setBadgeText({
                    text: parseInt(message.data) > 0 ? String(message.data) : "",
                    tabId: tabs[0].id
                })
            })
            .catch(onException)
            break;
        }
        case "set-icon-type" : {
            browser.tabs.query({
                currentWindow: true,
                active: true
            })
            .then((tabs) => {
                let imageType = message.data
                let imagePath = null
                
                if(imageType != null) {
                    imagePath = `icons/divour-48-active.png`
                }

                browser.browserAction.setIcon({
                    path:imagePath,
                    tabId: tabs[0].id
                })
                .catch((exception) => {
                    //TODO Revert to old image?
                    onException(exception)
                })
            })
            .catch(onException)
            break
        }
        default : onException(Error("Invalid command: ", message.command))
    }
})