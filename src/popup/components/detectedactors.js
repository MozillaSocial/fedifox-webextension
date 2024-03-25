/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MosoMainBase from './mainbase.js';

customElements.define('moso-detectedactors', class MosoDetectedActors extends MosoMainBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `<div id="actors"></div>`;
  }

  setData(actors) {
    const body = [];
    for (const actor of actors) {
      body.push(`<h3>URL: ${actor.actor.id}</h3><button id="followActor" data-url="${actor.actor.id}">Follow</button><br /><pre>`);
      if (actor.actor.image?.url) {
        body.push(`<img src="${actor.actor.image.url}" /><br />`);
      }
      body.push(`Name: ${actor.actor.name}<br />`);
      body.push(`Summary: ${actor.actor.summary}<br />`);
      body.push("</pre>");
    }

    document.getElementById("actors").innerHTML = body.join('');
  }

  async handleEvent(e) {
    switch (e.target.id) {
      case 'followActor':
        await this.sendMessage("followActor", e.target.dataset.url);
        await this.sendMessage('detectActors');
        break;
    }
  }
});