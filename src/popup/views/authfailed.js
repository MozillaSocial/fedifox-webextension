/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";

// This is the first view to be shown.
export default class ViewAuthFailed extends View {
  show(data) {
    return escapedTemplate`
    <h1>Auth Failed!</h1>
    <button id="retry">Retry</button>
    `;
  }

  async handleClickEvent(e) {
    if (e.target.id === "retry") {
      await this.sendMessage("reset");
    }
  }
}