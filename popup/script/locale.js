const ID_SPAN_POSTFIX_TEXT = "span_hidden_amount_postfix"

const TEXT_DISABLED_MESSAGE = browser.i18n.getMessage("placeholderHiddenAmount")

window.addEventListener("load", (event) => {
    document.getElementById(ID_SPAN_POSTFIX_TEXT).innerText = TEXT_DISABLED_MESSAGE
})