/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MosoMainBase from './mainbase.js';

customElements.define('moso-detectedactors', class MosoDetectedActors extends MosoMainBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `<div id="actors"></div>`;
  }

  setData(accounts) {
    const actors = document.getElementById('actors');
    while (actors.firstChild) actors.firstChild.remove();

    for (const account of accounts) {
      actors.innerHTML += `
          <img src="${account.avatar}">
          <address>${account.display_name || account.username}</address>
          <button id="followActor" data-actorid="${account.id}">Follow</button>`;
    }
  }

  async handleEvent(e) {
    switch (e.target.id) {
      case 'followActor':
        await this.sendMessage("followActor", e.target.dataset.actorid);
        window.close();
        break;
    }
  }
});