/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";

class ViewInitialize extends View {
  show(data) {
    this.sendMessage("fetchTimeline");

    return escapedTemplate`
    <h1>The main view!</h1>
    <button id="reset">Reset</button>
    `;
  }

  async handleClickEvent(e) {
    if (e.target.id === "reset") {
      await this.sendMessage("reset");
    }
  }

  async handleMessage(msg) {
    console.log("MESAGE", msg.type);
  }
}

const view = new ViewInitialize();
export default view;