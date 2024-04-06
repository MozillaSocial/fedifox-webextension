/**
 * @description
 * Screen overlay to hide/show sensitive content below.
 * TODO: add button to re-hide content (re-open dialog) after it has been shown
 */

customElements.define("sensitive-toggle", class sensitiveToggle extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this)
    this.innerHTML = `
    <style>
      sensitive-toggle dialog{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--padding-sm);
        background: rgba(255 255 255 / .5);
        border: 1px solid var(--light-gray);
        border-radius: var(--border-radius);
        -webkit-backdrop-filter: blur(24px);
        backdrop-filter: blur(24px);
      }
    </style>
    <dialog open>
      <h3>Sensitive Content</h3>
      <p>${this.spoiler || 'Some people may find this content offensive or disturbing'}</p>
      <form method="dialog">
        <button class="secondary">Show</button>
      </form>
    </dialog>
    `
  }

  handleEvent(e) {
    console.log('handle sensitiveToggle event')
    // this.querySelector('dialog').show()
  }
})