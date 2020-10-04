const ARM_TOGGLE_BUTTON = "button_toggle_arm"
const CLASS_NAME_ARMED_BUTTON_ENABLED = "button-divourer-active"

document.addEventListener("load", (event) => {
    document.getElementById(ARM_TOGGLE_BUTTON).addEventListener("click", (event) => {

    })
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