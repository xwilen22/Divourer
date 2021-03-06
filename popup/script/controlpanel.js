import * as utils from "../../util.mjs"

const ID_BUTTON_CLEAR = "button_clear"

const ID_SPAN_HIDDEN_AMOUNT = "span_hidden_amount"
const ID_SPAN_HIDDEN_POST_TEXT = "span_hidden_amount_postfix"
const ID_INPUT_TOGGLE = "input_checkbox_arm_toggle"
const ID_LABEL_STATUS = "label_status"

const CLASS_HIDE_ON_DISABLE = "logic-hide-on-disabled"
const CLASS_HIDE_ON_NO_HIDDEN_ELEMENTS = "logic-hide-on-no-hidden-elements"

const TEXT_ARM_BUTTON_ENABLED = browser.i18n.getMessage("divourerEnabled") //"Armed"
const TEXT_ARM_BUTTON_DISABLED = browser.i18n.getMessage("divourerDisabled")
const TEXT_ELEMENT_SINGULAR = browser.i18n.getMessage("elementSingular") //"element"
const TEXT_ELEMENT_PLURAL = browser.i18n.getMessage("elementPlural") //"elements"
const TEXT_HIDDEN_AMOUNT = browser.i18n.getMessage("hiddenAmount") //"hidden on this tab"

const PATH_CSS_ACTIVE = "../divourer.css"

let divourActive = false

function initializeListeners() {
    const armButton = document.getElementById(ID_INPUT_TOGGLE)
    armButton.addEventListener("change", onArmButton)

    const clearButton = document.getElementById(ID_BUTTON_CLEAR)
    clearButton.addEventListener("click", onClearButton)
}
function setHiddenElementsCount(amountNumber) {
    const countAmountSpan = document.getElementById(ID_SPAN_HIDDEN_AMOUNT)
    const postTextSpan = document.getElementById(ID_SPAN_HIDDEN_POST_TEXT)
    const retrievedNumber = Number(amountNumber)

    if (Number.isInteger(retrievedNumber)) {
        for (let element of document.getElementsByClassName(CLASS_HIDE_ON_NO_HIDDEN_ELEMENTS)) {
            element.hidden = retrievedNumber <= 0
        }
        
        //'Elements' or 'Element'
        const textElement = retrievedNumber != 1 ? TEXT_ELEMENT_PLURAL : TEXT_ELEMENT_SINGULAR
        postTextSpan.innerText =  ` ${textElement} ${TEXT_HIDDEN_AMOUNT}`
        
        countAmountSpan.innerText = retrievedNumber
    }
}
function onArmButton(event) {
    const armInputToggle = document.getElementById(ID_INPUT_TOGGLE)

    divourActive = armInputToggle.checked
    
    const statusTextLabel = document.getElementById(ID_LABEL_STATUS)
    statusTextLabel.innerText = divourActive ? TEXT_ARM_BUTTON_ENABLED : TEXT_ARM_BUTTON_DISABLED
    
    browser.tabs.query({
        currentWindow: true,
        active: true
    })
    .then((tabs) => {
        const commandActivateDivourer = divourActive ? utils.COMMAND.ENABLE : utils.COMMAND.DISABLE
        const commandSetIcon = "set-icon-type"
        
        const location = utils.COMMAND_LOCATION.CONTENT
        if(divourActive) {
            browser.tabs.insertCSS({file: PATH_CSS_ACTIVE, cssOrigin: "user"})
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command: commandActivateDivourer,
                    location
                })
                .catch(onException)
                
                browser.runtime.sendMessage({
                    command: commandSetIcon,
                    location: null,
                    data: "active"
                }).catch(onException)
            })
            .catch(onException)
        } else {
            browser.tabs.removeCSS({file: PATH_CSS_ACTIVE, cssOrigin: "user"})
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command: commandActivateDivourer,
                    location
                })
                .catch(onException)

                browser.runtime.sendMessage({
                    command: commandSetIcon,
                    location: null,
                    data: null
                }).catch(onException)
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

    //Gets data from injected script. Amount of hidden divs etc.
    browser.runtime.onMessage.addListener((message) => {
        let dataObject = message.data
        if(dataObject != undefined) {
            divourActive = dataObject.active
            
            setHiddenElementsCount(dataObject.hiddenAmount)
            
            document.getElementById(ID_INPUT_TOGGLE).checked = dataObject.active
            document.getElementById(ID_LABEL_STATUS).innerText = dataObject.active ? TEXT_ARM_BUTTON_ENABLED : TEXT_ARM_BUTTON_DISABLED
            
            for (let element of document.getElementsByClassName(CLASS_HIDE_ON_DISABLE)) {
                element.hidden = false
            }
        }
    })
}