(function () {
    if (window.hasRun) {
        return
    }
    window.hasRun = true
    
    const hiddenElements = []
    let hideOnClickActive = false

    function hideElementAtPosition(x, y) {
        let retrievedElement = document.elementFromPoint(x, y)
        hiddenElements.push({element: retrievedElement, initialStyle: retrievedElement.style})
        retrievedElement.style.display = "none"
    }

    function clearAll() {
        for(elementObject of hiddenElements) {
            elementObject.element.style = elementObject.initialStyle
        }
    }
    
    function setHideOnClick(enabledBool) {
        console.log("Hide on click called ", enabledBool)
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
            case "get" : {
                console.log(hiddenElements)
                browser.runtime.sendMessage({
                    data: {
                        active: hideOnClickActive/*,
                        hiddenElements*/
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                break;
            }
        }
    })
})()
