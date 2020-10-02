function onException(error) {
    console.error(error)
}

browser.runtime.onMessage.addListener((message) => {
    console.log(`Message recieved! ${message.command}`)
    
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
        default : onException(Error("Invalid command: ", message.command))
    }
})