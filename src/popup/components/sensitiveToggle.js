/**
 * @description
 * Screen overlay to hide/show sensitive content below.
 * TODO: add button to re-hide content (re-open dialog) after it has been shown
 */

customElements.define("sensitive-toggle", class sensitiveToggle extends HTMLElement {
  #dialog

  connectedCallback() {
    this.innerHTML = `
    <dialog open>
      <h3 data-i18n="componentSensitiveToggleTitle"></h3>
      <p>${this.spoiler || chrome.i18n.getMessage("componentSensitiveToggleSpoiler")}</p>
      <button class="secondary sensitive-show-btn" title="${chrome.i18n.getMessage("componentSensitiveToggleButtonShowTitle")}" data-i18n="componentSensitiveToggleButtonShow"></button>
    </dialog>
    <button class="sensitive-hide-btn" title="${chrome.i18n.getMessage("componentSensitiveToggleButtonHideTitle")}">
      <img src="../../commons/images/eye-toggle.svg" width="24" height="24">
    </button>
    `
    this.#dialog = this.querySelector('dialog')
    this.addEventListener('pointerdown', this)
  }

  disconnectedCallback() {
    this.removeEventListener('pointerdown', this)
  }

  handleEvent(e) {
    switch (true) {
      case e.target.matches('.sensitive-show-btn'):
        this.#dialog.close()
        break
      case e.target.matches('.sensitive-hide-btn'):
        this.#dialog.show()
        break
    }
  }
})