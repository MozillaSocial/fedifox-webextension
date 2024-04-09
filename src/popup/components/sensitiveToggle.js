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
      <h3>Sensitive Content</h3>
      <p>${this.spoiler || 'Some people may find this content offensive or disturbing'}</p>
      <button class="secondary sensitive-show-btn" title="Show content">Show</button>
    </dialog>
    <button class="sensitive-hide-btn" title="Hide content">
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