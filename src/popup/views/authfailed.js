/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-authfailed', class ViewAuthFailed extends ViewBase {
  connectedCallback() {
    this.innerHTML = `
    <style>
      main{
        align-items: center;
      }
    </style>
    <fedifox-header></fedifox-header>
    <main>
      <h2 data-i18n="viewAuthFailedTitle"></h2>
      <button class="primary" id="retry" data-i18n="viewAuthFailedButtonRetry"></button>
    </main>
    `;

    super.connectedCallback();
  }

  async handleEvent(e) {
    if (e.target.id === "retry") {
      await this.sendMessage("reset");
    }
  }
});