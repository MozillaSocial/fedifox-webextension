/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-loading', class ViewLoading extends ViewBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <style>
      main{
        max-width: 480px;
      }
    </style>
    <main>
      <h2>LOADING</h2>
    </main>
    `
  }
});