const ID_BUTTON_ARM = "button_toggle_arm"
const ID_BUTTON_CLEAR = "button_clear"

let divourActive = false

function initializeListeners() {
    const armButton = document.getElementById(ID_BUTTON_ARM)
    armButton.addEventListener("click", (event) => {
        divourActive = !divourActive
        
        armButton.innerText = divourActive ? "Disarm" : "Arm"
    })

    const clearButton = document.getElementById(ID_BUTTON_CLEAR)
    clearButton.addEventListener("click", (event) => {
        
        browser.tabs.query({active: true, currentWindow: true})
        .then(() => {
            browser.tabs.removeCSS({code: hidePage}).then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command: "reset",
                })
            })
        })
        .catch(reportException);
    })
}
function reportException(exception) {
    console.log(`ERROR ${exception}`)
}
function clearHidden() {

}

browser.tabs.executeScript({file: "/divourer.js"})
.then(initializeListeners)
.catch(reportException)