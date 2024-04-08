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
      <button class="secondary">Show</button>
    </dialog>
    `
    this.#dialog = this.querySelector('dialog')
    this.addEventListener('pointerdown', this)
  }

  disconnectedCallback() {
    this.removeEventListener('pointerdown', this)
  }

  handleEvent(e) {
    if (this.#dialog.open) this.#dialog.close()
  }
})