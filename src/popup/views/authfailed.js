/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-authfailed', class ViewAuthFailed extends ViewBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <moso-header></moso-header>
    <main>
      <h2>Auth Failed!</h2>
      <button id="retry">Retry</button>
    </main>
    `;
  }

  async handleEvent(e) {
    if (e.target.id === "retry") {
      await this.sendMessage("reset");
    }
  }
});