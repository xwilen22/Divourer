function onException(error) {
    console.error(error)
}

(function () {
    if (window.hasRun) {
        return
    }
    window.hasRun = true
    
    const hiddenElements = []
    let hideOnClickActive = false

    function hideElementAtPosition(x, y) {
        hideElement(document.elementFromPoint(x, y))
    }
    function hideElement(element) {
        hiddenElements.push({element, initialStyle: element.style})
        element.style.display = "none"
    }
    function clearAll() {
        for(elementObject of hiddenElements) {
            elementObject.element.style = elementObject.initialStyle
        }
        hiddenElements.splice(0, hiddenElements.length)
    }
    function setHideOnClick(enabledBool) {
        hideOnClickActive = enabledBool
    }
    function requestHideOnClick() {
        return Boolean(hideOnClickActive)
    }
    function initializeEventListeners() {
        document.addEventListener("click", (event) => {
            if(!requestHideOnClick()) {
                return
            }
            event.preventDefault()
            hideElementAtPosition(event.clientX, event.clientY)
        })
    }

    initializeEventListeners()

    browser.runtime.onMessage.addListener((message) => {
        console.log(`Message recieved! ${message.command}`)
        switch(message.command) {
            case "enabled" : {
                setHideOnClick(true)
                break;
            }
            case "disabled" : {
                setHideOnClick(false)
                break;
            }
            case "reset" : {
                clearAll()
                break;
            }
            case "hide" : {
                hideElement(browser.menus.getTargetElement(message.data))
                break;
            }
            case "get" : {  
                browser.runtime.sendMessage({
                    data: {
                        active: hideOnClickActive,
                        hiddenAmount: hiddenElements.length
                    }
                })
                .catch(onException)
                break;
            }
        }
    })
})()
