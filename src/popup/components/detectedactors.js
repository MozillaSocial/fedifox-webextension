/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FedifoxMainBase from './mainbase.js';

customElements.define('fedifox-detectedactors', class FedifoxDetectedActors extends FedifoxMainBase {
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

    const ul = this.querySelector('ul')
    console.log('removing "loading" classname...')
    ul.classList.remove('loading')
    ul.replaceChildren(...items)
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
      console.log('Detected Actors view is now visible: adding "loading" classname')
      this.querySelector('ul').classList.add('loading')
      this.sendMessage("detectActors");
    }
  }
});