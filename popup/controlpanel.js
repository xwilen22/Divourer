const ID_BUTTON_ARM = "button_toggle_arm"
const ID_BUTTON_CLEAR = "button_clear"

const POINTER_NAME = "crosshair"

const CSS_DIVOURER_ACTIVE = `
    html {
        cursor: ${POINTER_NAME}
    }
    a, input {
        pointer-events:none
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
    armButton.innerText = divourActive ? "Disarm" : "Arm"
    
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
                .catch(reportException)
            })
            .catch(reportException)
        } else {
            browser.tabs.removeCSS({code: CSS_DIVOURER_ACTIVE})
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command
                })
                .catch(reportException)
            })
            .catch(reportException)
        }
    })
    .catch(reportException);  
}
function onClearButton(event) {
    browser.tabs.query({active: true, currentWindow: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "reset",
            })
        })
        .catch(reportException);
}

function reportException(exception) {
    console.log(`BOLLOXED! ${exception} Stack: ${exception.stack}`)
}

browser.tabs.executeScript({file: "/divourer.js"})
.then(() => {
    initializeListeners()
})
.catch(reportException)