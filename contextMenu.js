const ID_MENU_QUICK_HIDE = "menu-fast-hide"

function initializeContextMenus() {
    browser.menus.create({
        id: ID_MENU_QUICK_HIDE,
        title: "Hide Element",
        icons: {
            "48":"icons\divour-48.png"
        },
        contexts: ["all"]
    })
}

function initializeListeners() {
    browser.menus.onClicked.addListener((info, tab) => {
        switch (info.menuItemId) {
            case ID_MENU_QUICK_HIDE:
                console.log("INFO: ", info, tab);
                break;
        }
    })
}

initializeContextMenus()
initializeListeners()