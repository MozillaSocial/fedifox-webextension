/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-error', class ViewError extends ViewBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <moso-header></moso-header>
    <main>
      <h2>Error: ${data}</h2>
    </main>`;
  }
});