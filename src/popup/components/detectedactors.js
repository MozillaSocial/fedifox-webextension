/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FedifoxMainBase from './mainbase.js';

customElements.define('fedifox-detectedactors', class FedifoxDetectedActors extends FedifoxMainBase {
  static observedAttributes = ['hidden'];

  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <main>
      <h2 data-i18n="componentDetectedActorsTitle"></h2>
      <p data-i18n="componentDetectedActorsMsg"></p>
      <ul></ul>
    </main>
    `
  }

  setData(actors) {
    const items = actors.map(actor => {
      const card = document.createElement('actor-card')
      card.initialize(actor)

      const li = document.createElement('li')
      li.append(card)
      return li
    })

    const ul = this.querySelector('ul')
    // TODO: detected actors loading indicator doesn't work as expected, because of multiple calls to `setData` – the first of which is usually empty
    ul.classList.remove('loading')
    ul.replaceChildren(...items)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // We are now visible!
    if (name === "hidden" && !this.hidden) {
      // TODO: detected actors loading indicator doesn't work as expected – see above
      this.querySelector('ul').classList.add('loading')
      this.sendMessage("detectActors");
    }
  }
});