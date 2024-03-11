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
    <h1>Initialize!</h1>
    <label for="server">Write here the server:</label>
    <input type="text" id="connectToServer" />
    <button id="connectToServerButton">Connect</button>
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