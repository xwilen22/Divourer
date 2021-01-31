const ID_MENU_QUICK_HIDE = "menu-fast-hide"
const TEXT_QUICK_HIDE_ELEMENT = "Hide Element"

function onException(error) {
    console.error(error)
}

function initializeContextMenus() {
    browser.menus.create({
        id: ID_MENU_QUICK_HIDE,
        title: TEXT_QUICK_HIDE_ELEMENT,
        contexts: ["all"]
    })
}

function initializeListeners() {
    browser.menus.onClicked.addListener((info, tab) => {
        switch (info.menuItemId) {
            case ID_MENU_QUICK_HIDE: {
                const command = "hide"

                browser.tabs.sendMessage(tab.id, {
                    command,
                    data: info.targetElementId
                })
                .catch(onException)
                break
            }
        }
    })
}

initializeContextMenus()
initializeListeners()