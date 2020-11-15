browser.tabs.executeScript({file: "../divourer.js"})
    .then(() => {
        browser.runtime.sendMessage({
            command: "set-enabled"
        })
        .catch(onException);
    })
.catch((exception) => {
    browser.runtime.sendMessage({
        command: "set-disabled"
    })
    onException(exception)
})