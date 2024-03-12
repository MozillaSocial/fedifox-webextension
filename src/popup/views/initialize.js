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
        <button class="primary" name="moso-register">Register</button>
        <button class="secondary" name="moso-login">Sign in</button>
      </fieldset>
      <hr>
      <fieldset>
        <legend>Connect to another Mastodon server</legend>
        <input type="text" id="connectToServer" placeholder="https://example.url">
        <button class="secondary" id="connectToServerButton">Connect</button>
      </fieldset>
    </main>
    `;
  }

  async handleClickEvent(e) {
    if (e.target.id === "connectToServerButton") {
      // TODO: the validation of the URL needs to happen here!!
      await this.sendMessage("connectToHost", new URL(document.getElementById("connectToServer").value).hostname);
      View.close();
    }
  }
}

const view = new ViewInitialize();
export default view;