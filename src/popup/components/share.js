/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MosoMainBase from './mainbase.js';

customElements.define('moso-share', class MosoShare extends MosoMainBase {
  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <style>
      button.primary{
        align-self: end;
      }
    </style>
    <h2>Share a link with your status</h2>
    <fieldset>
      <textarea id="shareBody"></textarea>
      <button class="primary" id="share">Post</button>
    </fieldset>
    `;

    document.getElementById("shareBody").focus();
  }

  setData(url) {
    const textarea = document.getElementById("shareBody");
    textarea.value = `\n\n${url}`;
    textarea.selectionEnd = 0;
    textarea.focus();
  }

  async handleEvent(e) {
    if (e.target.id === 'share') {
      const body = document.getElementById("shareBody").value; // TODO: validation
      this.sendMessage("post", {
        /* TODO: other flags */
        body
      });

      // TODO: show a loading icon...
    }
  }
});