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
    <style>
      button.primary{
        align-self: end;
      }
    </style>
    ${this.showHeaderWithNav()}
    <main>
      <h2>Share a link with your status</h2>
      <fieldset>
        <textarea id="shareBody">\n\n\n${url}</textarea>
        <button class="primary" id="share">Post</button>
      </fieldset>
    </main>
    `;
  }

  postShow() {
    const body = document.getElementById("shareBody");
    body.focus();
    body.selectionStart = body.selectionEnd = 0;
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