/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-authenticating', class ViewAuthenticating extends ViewBase {
  connectedCallback() {
    this.innerHTML = `
    <fedifox-header></fedifox-header>
    <h2 data-i18n="viewAuthenticatingTitle"></h2>
    `;

    super.connectedCallback();
  }
});