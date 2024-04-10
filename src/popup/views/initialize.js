/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-initialize', class ViewInitialize extends ViewBase {
  async connectedCallback() {
    this.sendMessage("fetchServerList");

    this.innerHTML = `
    <moso-header></moso-header>
    <main>
      <p data-i18n="viewInitializeMsg1"></p>
      <p data-i18n="viewInitializeMsg2"></p>
      <fieldset>
        <legend data-i18n="viewInitializeConnectToMoSo"></legend>
        <button class="primary" id="moso-register-btn" data-i18n="viewInitializeButtonRegister"></button>
        <button class="secondary" id="moso-login-btn" data-i18n="viewInitializeButtonSignIn"></button>
      </fieldset>
      <hr>
      <fieldset>
        <legend data-i18n="viewInitializeConnectToOther"></legend>
        <input list="servers" id="other-server-url" placeholder="https://example.url">
        <datalist id="servers"></datalist>
        <button class="secondary" id="other-server-btn" data-i18n="viewInitializeButtonConnect"></button>
      </fieldset>
    </main>
    `

    document.getElementById("other-server-url").onkeypress = e => {
      if (e.keyCode === 13 /* Enter */ ) {
        e.preventDefault();
        document.getElementById("other-server-btn").click();
      }
    }

    let data = await browser.storage.local.get(["serverHost"]);
    if (data && data.serverHost) {
      document.getElementById("other-server-url").value = data.serverHost;
    }

    super.connectedCallback();
  }

  async handleEvent(e) {
    switch (e.target.id) {
      case 'moso-register-btn':
      case 'moso-login-btn':
        this.sendMessage('connectToHost', 'stage.moztodon.nonprod.webservices.mozgcp.net');
        window.close()
        break
      case 'other-server-btn': {
        const input = document.getElementById("other-server-url");
        const hostname = this.#validateHost(input.value);
        if (!hostname) {
          return alert("Mastodon URL is not valid");
        }
        this.sendMessage('connectToHost', hostname);
        window.close()
        break
      }
    }
  }

  handleMessage(msg) {
    if (msg.type === "serverListFetched") {
      const servers = document.getElementById("servers");
      while (servers.firstChild) servers.firstChild.remove();
      msg.servers.forEach(server => {
        const opt = document.createElement("option");
        opt.value = server;
        servers.append(opt);
      });
    }
  }

  #validateHost(input) {
    input = input.trim();

    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      input = 'https://' + input;
    }

    try {
      const u = new URL(input);
      return u.hostname;
    } catch (e) {
      return null;
    }
  }
});