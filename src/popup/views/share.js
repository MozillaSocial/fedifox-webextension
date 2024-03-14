/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";
import ViewMain from './main.js';

// This main view is mainly a "bridge" for the real action.
export default class ViewShare extends ViewMain {
  show(url) {
    return escapedTemplate`
    ${this.showHeaderWithNav()}
    <br><br>
    <h1>Share</h1>
    <textarea id="shareBody">${url}\n</textarea>
    <button class="secondary" id="share">Share</button>
    `;
  }

  postShow() {
    const body = document.getElementById("shareBody");
    body.focus();
    body.selectionStart = body.selectionEnd = body.value.length;
  }

  async handleClickEvent(e) {
    switch (e.target.id) {
      case 'share':
        const body = document.getElementById("shareBody").value; // TODO: validation
        this.sendMessage("post", {
          /* TODO: other flags */
          body
        });
        // TODO: show a loading icon...
        break;
      default:
        super.handleClickEvent(e);
        break;
    }
  }

  // Let's override this method to stop the triggering of new actions.
  async handleMessage(msg) {
    if (msg.type === 'postResult') {
      // TODO: message send!
      setTimeout(() => View.close(), 1000);
    }
  }
}