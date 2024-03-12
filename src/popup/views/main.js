/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";

// This main view is mainly a "bridge" for the real action.
export default class ViewMain extends View {
  showHeader() {
    return escapedTemplate`
    <div>
    <button id="openInstance">Open Instance</button>
    <button id="reset">Reset</button>
    </div>
    `;
  }

  show(data) {
    // In case the panel was opened by the user, let's fetch the timeline to
    // trigger the `timeline` view.
    this.sendMessage("fetchTimeline");

    return escapedTemplate`
    <h1>The main view!</h1>
    ${this.showHeader()}
    `;
  }

  async handleClickEvent(e) {
    if (e.target.id === "reset") {
      await this.sendMessage("reset");
      return;
    }

    if (e.target.id === "openInstance") {
      await this.sendMessage("openInstance");
      View.close();
      return;
    }
  }

  async handleMessage(msg) {
    switch (msg.type) {
      case 'timeline':
        View.setView('timeline', msg.timeline);
        break;

      case 'shareURL':
        View.setView('share', msg.url);
        break;
    }
  }
}