const ARM_TOGGLE_BUTTON = "button_toggle_arm"
const CLASS_NAME_ARMED_BUTTON_ENABLED = "button-divourer-active"

const CLASS_HIDE_ON_DISABLE = "logic-hide-on-disabled"

window.addEventListener("load", (event) => {
    for (let element of document.getElementsByClassName(CLASS_HIDE_ON_DISABLE)) {
        console.log("Hiding")
        element.hidden = true
    }
})

function setArmedEnabled(enabled) {
    const armedButton = document.getElementById(ARM_TOGGLE_BUTTON)
    
    if (enabled) {
        armedButton.classList.add(CLASS_NAME_ARMED_BUTTON_ENABLED)
    }
    else {
        armedButton.classList.remove(CLASS_NAME_ARMED_BUTTON_ENABLED)
    }
}