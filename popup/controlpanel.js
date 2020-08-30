import * as utils from "../util.mjs"

const ID_BUTTON_ARM = "button_toggle_arm"
const ID_BUTTON_CLEAR = "button_clear"
const ID_PARAGR_HIDDEN_AMOUNT = "paragr_hidden_amount_tab"

const TEXT_ARM_BUTTON_ENABLED = "Disarm"
const TEXT_ARM_BUTTON_DISABLED = "Arm"
const TEXT_HIDDEN_AMOUNT = "hidden elements on this tab."

const PATH_CSS_ACTIVE = "../divourer.css"

let divourActive = false

function initializeListeners() {
    const armButton = document.getElementById(ID_BUTTON_ARM)
    armButton.addEventListener("click", onArmButton)

    const clearButton = document.getElementById(ID_BUTTON_CLEAR)
    clearButton.addEventListener("click", onClearButton)
}
function setHiddenElementsCount(amountNumber) {
    const paragraphElement = document.getElementById(ID_PARAGR_HIDDEN_AMOUNT)
    paragraphElement.innerText = `${Number(amountNumber)} ${TEXT_HIDDEN_AMOUNT}`
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
        const command = divourActive ? utils.COMMAND.ENABLE : utils.COMMAND.DISABLE
        const location = utils.COMMAND_LOCATION.CONTENT
        if(divourActive) {
            browser.tabs.insertCSS({file: PATH_CSS_ACTIVE, cssOrigin: "user"})
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command,
                    location
                })
                .catch(onException)
            })
            .catch(onException)
        } else {
            browser.tabs.removeCSS({file: PATH_CSS_ACTIVE, cssOrigin: "user"})
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command,
                    location
                })
                .catch(onException)
            })
            .catch(onException)
        }
    })
    .catch(onException);  
}
function onClearButton(event) {
    const location = utils.COMMAND_LOCATION.CONTENT

    browser.tabs.query({active: true, currentWindow: true})
        .then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, {
                command: utils.COMMAND.CLEAR,
                location
            })
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command: utils.COMMAND.GET,
                    location
                })
            })
        })
        .catch(onException);
}
function requestUIStatus() {
    const location = utils.COMMAND_LOCATION.CONTENT

    browser.tabs.query({
        currentWindow: true,
        active: true
    })
    .then(tabs => { 
        browser.tabs.sendMessage(tabs[0].id, {
            command: utils.COMMAND.GET,
            location
        })
        .catch(onException)
    })
    .catch(onException)
}
function onException(exception) {
    for (let button of document.getElementsByTagName("button")) {
        button.disabled = true
    }
    console.error(`BOLLOXED! ${exception} Stack: ${exception.stack}`)
}

window.onload = (event) => {
    browser.tabs.executeScript({file: "/divourer.js"})
    .then(() => {
        requestUIStatus()
        initializeListeners()
    })
    .catch(onException)
    
    browser.runtime.onMessage.addListener((message) => {
        let dataObject = message.data
        if(dataObject != undefined) {
            divourActive = dataObject.active
            setHiddenElementsCount(dataObject.hiddenAmount)
    
            document.getElementById(ID_BUTTON_ARM).innerText = dataObject.active ? TEXT_ARM_BUTTON_ENABLED : TEXT_ARM_BUTTON_DISABLED
        }
    })
}