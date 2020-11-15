const PATH_ACTIVE_ICON = "icons/divour-48-active.png"
const COLOUR_BADGE_BACKGROUND = "#4245b3"

function onException(error) {
    console.error(`BrowserAction Error: ${error} Stack ${error.stack}`)
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
                browser.browserAction.setBadgeBackgroundColor({
                    color: COLOUR_BADGE_BACKGROUND
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
                    imagePath = PATH_ACTIVE_ICON
                }

                browser.browserAction.setIcon({
                    path:imagePath,
                    tabId: tabs[0].id
                })
                .catch(onException)
            })
            .catch(onException)
            break
        }
        case "set-disabled" : {
            browser.tabs.query({
                currentWindow: true,
                active: true
            })
            .then((tabs) => {
                browser.browserAction.disable(tabs[0].id)
            })
            .catch(onException)
        }
        case "set-enabled" : {
            browser.tabs.query({
                currentWindow: true,
                active: true
            })
            .then((tabs) => {
                browser.browserAction.enable(tabs[0].id)
            })
            .catch(onException)
        }
        default : onException(Error("Invalid command: ", message.command))
    }
})