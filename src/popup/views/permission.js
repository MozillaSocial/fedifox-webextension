/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-permission', class ViewPermission extends ViewBase {
  async connectedCallback() {
    this.innerHTML = `
    <fedifox-header></fedifox-header>
    <main>
      <div>
        <h2 data-i18n="viewPermissionHeading"></h2>
        <p data-i18n="viewPermissionBody1"></p>
        <p data-i18n="viewPermissionBody2"></p>
      </div>
      <img src="../../commons/images/sleeping-fox.png" width="439" height="482" alt="">
      <button class="primary" data-i18n="viewPermissionButton"></button>
    </main>
    `

    super.connectedCallback();
  }

  async handleEvent(e) {
    const permissionObj = {
      origins: ["<all_urls>"]
    }

    chrome.permissions.request(permissionObj)
    window.close() // close popup due to permission dialog hidden behind: https://bugzilla.mozilla.org/show_bug.cgi?id=1798454
  }
});