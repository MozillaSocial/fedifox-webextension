/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const LOADING_TIMEOUT = 5000;

class Popup {
  #port;
  #handlingMessage;
  #pendingMessages = [];

  async init() {
    const {
      View
    } = await import("./view.js");

    // Let's start showing something...
    await View.setView("loading");

    // Disable context menu.
    window.addEventListener("contextmenu", e => e.preventDefault());

    this.#port = browser.runtime.connect({
      name: "panel"
    });
    View.setPort(this.#port);

    let timeoutId = setTimeout(() => View.setView("error", "loadingError"), LOADING_TIMEOUT);

    this.#port.onMessage.addListener(async msg => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = 0;
      }

      if (this.#handlingMessage) {
        await new Promise(resolve => this.#pendingMessages.push(resolve));
      }

      this.#handlingMessage = true;

      // stateChanged requires a view change.
      if (msg.type === 'stateChanged') {
        switch (msg.state) {
          case STATE_INITIALIZE:
            await View.setView("initialize");
            break;

          case STATE_AUTHENTICATING:
            await View.setView("authenticating");
            break;

          case STATE_AUTH_FAILED:
            await View.setView("authfailed");
            break;

          case STATE_MAIN:
            await View.setView("main", msg);
            break;

          default:
            await View.setView("error", "internalError");
            break;
        }
      } else {
        // Any other message is sent to the view.
        await View.propagateMessage(msg);
      }

      this.#handlingMessage = false;

      if (this.#pendingMessages.length) {
        this.#pendingMessages.shift()();
      }
    });
  }
}

const i = new Popup();

// Defer loading until the document has loaded
if (document.readyState === "loading") {
  // We don't care about waiting for init to finish in this code
  document.addEventListener("DOMContentLoaded", () => {
    i.init();
  });
} else {
  i.init();
}