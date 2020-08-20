(function () {
    if (window.hasRun) {
        return
    }
    window.hasRun = true
    
    const hiddenElements = []
    let hideOnClickActive = false

    function hideElementAtPosition(x, y) {
        let retrievedElement = document.elementFromPoint(x, y)
        retrievedElement.style.display = "none"
        hiddenElements.push(retrievedElement)
    }

    function clearAll() {
        for(element in hiddenElements) {
            element.style.display = "initial"
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
            console.log("CLICK? ", requestHideOnClick())
            if(!requestHideOnClick()) {
                return
            }
            event.preventDefault()

            console.log(`Mouse click: X ${event.clientX}, Y ${event.clientY}`)
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
                browser.runtime.sendMessage({
                    data: {
                        active: hideOnClickActive,
                        hiddenElements
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
            }
        }
    })
})()
