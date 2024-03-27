/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MosoMainBase from './mainbase.js';

customElements.define('moso-timeline', class MosoTimeline extends MosoMainBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
      <h2>Content Feed</h2>
      <ol id="ol"></ol>
    `;
  }

  setData(data) {
    const ol = document.getElementById("ol");
    while (ol.firstChild) ol.firstChild.remove();
    data.forEach(status => {
      const li = document.createElement('li')
      const card = document.createElement('status-card')
      card.setAttribute("action", true);
      card.initialize(status);
      li.append(card)
      ol.append(li)
    })
  }
});