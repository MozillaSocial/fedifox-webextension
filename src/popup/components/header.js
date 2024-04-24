/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

customElements.define('fedifox-header', class ViewHeader extends HTMLElement {
  async connectedCallback() {
    const data = await this.#getInstanceData();

    this.innerHTML = `
      <header>
        <img src="${data?.instanceData?.icon || '../icons/logo.svg' }">
        <h1>${data?.instanceData?.title || 'FediFox'}</h1>
      </header>`;
  }

  async #getInstanceData() {
    return chrome.storage.local.get(['instanceData']);
  }
});