/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

customElements.define('fedifox-header', class ViewHeader extends HTMLElement {
  async connectedCallback() {
    const data = await this.#getInstanceData();
    const logoSrc = data?.instanceData?.icon ? `<img src="${data.instanceData.icon}" alt="Logo"></img>` : `
    <source srcset="../icons/logo.svg" media="(prefers-color-scheme: light)">
    <source srcset="../icons/logo-light.svg"  media="(prefers-color-scheme: dark)">
    <img src="../icons/logo.svg" alt="Logo">
    `

    this.innerHTML = `
      <header>
        <picture>${logoSrc}</picture>
        <h1>${data?.instanceData?.title || 'FediFox'}</h1>
      </header>`;
  }

  async #getInstanceData() {
    return chrome.storage.local.get(['instanceData']);
  }
});