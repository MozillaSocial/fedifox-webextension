/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-permission', class ViewPermission extends ViewBase {
  async connectedCallback() {
    this.innerHTML = `
      <p>PERMISSION REQUEST</p>
      <button class="primary">CLICK</button>
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