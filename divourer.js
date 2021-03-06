function onException(error) {
    console.error(error)
}

(function () {
    if (window.hasRun) {
        return
    }
    window.hasRun = true
    
    //console.log("Yeah im active 👺")

    const HOVER_ELEMENT_CLASS = "divour-hover-element"

    const hiddenElements = []
    let hideOnClickActive = false

    function hideElementAtPosition(x, y) {
        hideElement(document.elementFromPoint(x, y))
    }
    function hideElement(element) {
        element.classList.remove(HOVER_ELEMENT_CLASS)
        
        hiddenElements.push({
            element, 
            initialStyle: element.style, 
            initialClassName: element.className,
            initialId: element.id
        })

        element.id = ""
        element.className = ""
        element.style.display = "none"
        
        const command = "set-badge"
        browser.runtime.sendMessage({
            command,
            data: hiddenElements.length
        })
    }
    function clearAll() {
        for(elementObject of hiddenElements) {
            elementObject.element.style = elementObject.initialStyle
            elementObject.element.className = elementObject.initialClassName
            elementObject.element.id = elementObject.initialId
        }
        hiddenElements.splice(0, hiddenElements.length)

        const command = "set-badge"
        browser.runtime.sendMessage({
            command,
            data: hiddenElements.length
        })
    }
    function setHideOnClick(enabledBool) {
        hideOnClickActive = enabledBool
    }
    function requestHideOnClick() {
        return Boolean(hideOnClickActive)
    }
    function initializeEventListeners() {
        document.addEventListener("click", (event) => {
            if (requestHideOnClick()) {
                event.preventDefault()
            }
        })
        document.addEventListener("mouseover", (event) => {
            if(!requestHideOnClick()) {
                return
            }
            let hoverElement = document.elementFromPoint(event.clientX, event.clientY)
            if(hoverElement == document.body || hoverElement == document.documentElement) { 
                return 
            }

            hoverElement.classList.add(HOVER_ELEMENT_CLASS)
            function onMouseDown(event) {
                event.preventDefault()
                hideElementAtPosition(event.clientX, event.clientY)
                hoverElement.removeEventListener("mousedown", this)
            }
            function onMouseLeave(event) {
                hoverElement.classList.remove(HOVER_ELEMENT_CLASS)

                hoverElement.removeEventListener("mouseout", this)
                hoverElement.removeEventListener("mousedown", onMouseDown)
            }

            hoverElement.addEventListener("mousedown", onMouseDown)
            hoverElement.addEventListener("mouseout", onMouseLeave)
        })
    }

    initializeEventListeners()

    browser.runtime.onMessage.addListener((message) => {
        //console.log(`Message recieved! ${message.command}`)
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