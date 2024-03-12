/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";

class ViewInitialize extends View {
  // TODO: retrieve a list of server to have an autocomplete input field.
  show(data) {
    return escapedTemplate`
    <main>
      <header>
        <img src="../icons/logo.svg">
        <h1>Mozilla Social</h1>
      </header>
      <p>Sign in to Mozilla.social, or connect to any other Mastodon server.</p>
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
  }

  async handleClickEvent(e) {
    switch (e.target.id) {
      case 'moso-register-btn':
      case 'moso-login-btn':
        await this.sendMessage("connectToHost", 'mastodon.mozsoc.local') // TODO: make url dynamic
        View.close()
        break
      case 'other-server-btn':
        if (!document.getElementById("other-server-url").checkValidity()) return alert('Mastodon URL is not valid')
        await this.sendMessage("connectToHost", new URL(document.getElementById("other-server-url").value).hostname)
        View.close()
        break
    }
  }
}

const view = new ViewInitialize();
export default view;