const ID_BUTTON_ARM = "button_toggle_arm"
const ID_BUTTON_CLEAR = "button_clear"

const TEXT_ARM_BUTTON_ENABLED = "Disarm"
const TEXT_ARM_BUTTON_DISABLED = "Arm"

const POINTER_NAME = "crosshair"

const CSS_DIVOURER_ACTIVE = `
    html {
        cursor: ${POINTER_NAME};
    }
    html:hover, a:hover, button:hover {
        cursor: ${POINTER_NAME} !important;
    }
`

let divourActive = false

function initializeListeners() {
    console.log("Initialized")
    const armButton = document.getElementById(ID_BUTTON_ARM)
    armButton.addEventListener("click", onArmButton)

    const clearButton = document.getElementById(ID_BUTTON_CLEAR)
    clearButton.addEventListener("click", onClearButton)
}
function onArmButton(event) {
    const armButton = document.getElementById(ID_BUTTON_ARM)

    divourActive = !divourActive
    armButton.innerText = divourActive ? TEXT_ARM_BUTTON_ENABLED : TEXT_ARM_BUTTON_DISABLED
    
    browser.tabs.query({
        currentWindow: true,
        active: true
    })
    .then((tabs) => {
        let command = divourActive ? "enabled" : "disabled"
        if(divourActive) {
            browser.tabs.insertCSS({code: CSS_DIVOURER_ACTIVE})
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command
                })
                .catch(onException)
            })
            .catch(onException)
        } else {
            browser.tabs.removeCSS({code: CSS_DIVOURER_ACTIVE})
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command
                })
                .catch(onException)
            })
            .catch(onException)
        }
    })
    .catch(onException);  
}
function onClearButton(event) {
    browser.tabs.query({active: true, currentWindow: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "reset",
            })
        })
        .catch(onException);
}

function requestUIStatus() {
    browser.tabs.query({
        currentWindow: true,
        active: true
    })
    .then(tabs => {
        const command = "get"

        browser.tabs.sendMessage(tabs[0].id, {
            command
        })
        .catch(onException)
    })
    .catch(onException)
}

function onException(exception) {
    for (button of document.getElementsByTagName("button")) {
        button.disabled = true
    }
    console.error(`BOLLOXED! ${exception} Stack: ${exception.stack}`)
}

browser.tabs.executeScript({file: "/divourer.js"})
.then(() => {
    requestUIStatus()
    initializeListeners()
})
.catch(onException)

browser.runtime.onMessage.addListener((message) => {
    let dataObject = message.data
    if(dataObject != undefined) {
        console.log("Retrieved data! ", dataObject)
        divourActive = dataObject.active
        document.getElementById(ID_BUTTON_ARM).innerText = dataObject.active ? TEXT_ARM_BUTTON_ENABLED : TEXT_ARM_BUTTON_DISABLED
    }
})