const ID_BUTTON_ARM = "button_toggle_arm"
const ID_BUTTON_CLEAR = "button_clear"
const ID_PARAGR_HIDDEN_AMOUNT = "paragr_hidden_amount_tab"

const TEXT_ARM_BUTTON_ENABLED = "Disarm"
const TEXT_ARM_BUTTON_DISABLED = "Arm"

const TEXT_HIDDEN_AMOUNT = "hidden elements on this tab."

const POINTER_NAME = "crosshair"

const CSS_DIVOURER_ACTIVE = `
    :root {
        --cursor-enabled: crosshair;
        --size-outline: 2px;
    }
    * {
        cursor: var(--cursor-enabled);
    }
    *:hover {
        cursor: var(--cursor-enabled) !important;
    }
    .divour-hover-element {
        transition: background-color 0.2s cubic-bezier(.07,.95,0,1);
        background-color: green !important;
        
        outline: var(--size-outline) solid rgba(255, 255, 0, 1);
        outline-offset: calc(var(--size-outline) * -1);
    }
`

const COMMAND = {
    GET:"get",
    ENABLE:"enabled",
    DISABLE:"disabled",
    CLEAR:"reset",
    HIDE:"hide"
}

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
        browser.browserAction.setBadgeText(
            {
                text: "Hello???",
                tabId: tabs[0].id
            }
          )


        const command = divourActive ? COMMAND.ENABLE : COMMAND.DISABLE
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
                command: COMMAND.CLEAR
            })
            .then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command: COMMAND.GET
                })
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
        browser.tabs.sendMessage(tabs[0].id, {
            command: COMMAND.GET
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
        divourActive = dataObject.active
        setHiddenElementsCount(dataObject.hiddenAmount)
        document.getElementById(ID_BUTTON_ARM).innerText = dataObject.active ? TEXT_ARM_BUTTON_ENABLED : TEXT_ARM_BUTTON_DISABLED
    }
})