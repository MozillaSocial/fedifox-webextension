/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-initialize', class ViewInitialize extends ViewBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <moso-header></moso-header>
    <main>
      <p>Sign in to Mozilla.social, or connect with any other Mastodon server.</p>
      <p>No account? No sweat. Use the "Register" button to create a Mozilla account, and we'll set you up.</p>
      <fieldset>
        <legend>Connect to Mozilla.social</legend>
        <button class="primary" id="moso-register-btn">Register</button>
        <button class="secondary" id="moso-login-btn">Sign in</button>
      </fieldset>
      <hr>
      <fieldset>
        <legend>Connect to another Mastodon server</legend>
        <input type="url" id="other-server-url" placeholder="https://example.url">
        <button class="secondary" id="other-server-btn">Connect</button>
      </fieldset>
    </main>
    `

    document.getElementById("other-server-url").onchange = () => document.getElementById("other-server-btn").click();
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
        if (input.value.trim() === '' || !input.checkValidity()) return alert('Mastodon URL is not valid')
        this.sendMessage('connectToHost', new URL(input.value).hostname);
        window.close()
        break
      }
    }
  }
});