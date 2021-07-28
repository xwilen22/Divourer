function onException(error) {
    console.error(error)
}

(function () {
    if (window.hasRun) {
        return
    }
    window.hasRun = true
    
    const HOVER_ELEMENT_CLASS = "divour-hover-element"
    const DISABLE_POINTER_EVENTS_CLASS = "disable-point-events"

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
    function onMouseOverElement(currentDocument, event) {
        if(!requestHideOnClick()) {
            return
        }
        let hoverElement = currentDocument.elementFromPoint(event.clientX, event.clientY)
        if(hoverElement == currentDocument.body || hoverElement == currentDocument.documentElement) { 
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
    }
    function initializeEventListeners() {
        document.addEventListener("click", (event) => {
            if (requestHideOnClick()) {
                event.preventDefault()
            }
        })
        let iFrameElements = document.getElementsByTagName("iframe")
        for (iFrameElement of iFrameElements) {
            let wrapperSpan = document.createElement("div")

            wrapperSpan.addEventListener("mouseover", (event) => {
                if(!requestHideOnClick()) {
                    return
                }
                wrapperSpan.childNodes[0].classList.add(DISABLE_POINTER_EVENTS_CLASS)
            })

            wrapperSpan.appendChild(iFrameElement)
            document.body.appendChild(wrapperSpan)
            
        }
        document.addEventListener("mouseover", (event) => {
            onMouseOverElement(document, event)
        })
    }

    initializeEventListeners()

    browser.runtime.onMessage.addListener((message) => {
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