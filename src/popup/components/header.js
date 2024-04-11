/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

customElements.define('moso-header', class ViewHeader extends HTMLElement {
  async connectedCallback() {
    const data = await browser.storage.local.get(['instanceData']);

    this.innerHTML = `
      <header>
        <img src="${data?.instanceData?.icon || '.../icons/logo.svg' }">
        <h1>${data?.instanceData?.title || 'Mozilla.Social'}</h1>
      </header>`;
  }
});