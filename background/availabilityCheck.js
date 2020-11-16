window.onload = (event) => {
    if (!browser.tabs.onUpdated.hasListener(onUpdated)) {
        browser.tabs.onUpdated.addListener(onUpdated)
    }
}

function onUpdated(tabId, changeInfo, tabInfo) {
        browser.tabs.query({
            currentWindow: true,
            active: true
        })
        .then((tabs) => {
            console.log(`Updated tab on: ${tabId}\nCurrent tab is now: ${tabs[0].id}`)

            browser.runtime.sendMessage({
                command: "set-enabled"
            })
            .catch((exception) => {
                console.error(exception)
                browser.tabs.query({
                    currentWindow: true,
                    active: true
                })
                .then((tabs) => {
                    browser.browserAction.disable(tabs[0].id)
                })
            })
        })
}
