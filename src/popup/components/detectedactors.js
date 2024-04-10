/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MosoMainBase from './mainbase.js';

customElements.define('moso-detectedactors', class MosoDetectedActors extends MosoMainBase {
  static observedAttributes = ['hidden'];

  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <h2 data-i18n="componentDetectedActorsTitle"></h2>
    <p data-i18n="componentDetectedActorsMsg"></p>
    <ul></ul>
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

    this.querySelector('ul').replaceChildren(...items)
  }

  async handleEvent(e) {
    switch (e.target.id) {
      case 'followActor':
        this.sendMessage("followActor", e.target.dataset.actorid);
        window.close();
        break;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // We are now visible!
    if (name === "hidden" && !this.hidden) {
      this.sendMessage("detectActors");
    }
  }
});