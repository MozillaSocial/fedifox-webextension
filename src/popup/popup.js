/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import './components/components.js';
import './views/views.js'

const LOADING_TIMEOUT = 5000;

class Popup {
  #port;
  #view;

  #handlingMessage;
  #pendingMessages = [];

  async init() {
    window.addEventListener("contextmenu", e => e.preventDefault());
    this.#port = browser.runtime.connect({
      name: "panel"
    });

    await this.#showView('loading');

    let timeoutId = setTimeout(() => this.#showView("error", "loadingError"), LOADING_TIMEOUT);

    this.#port.onMessage.addListener(async msg => {
      clearTimeout(timeoutId);

      if (this.#handlingMessage) {
        await new Promise(resolve => this.#pendingMessages.push(resolve));
      }

      this.#handlingMessage = true;

      // stateChanged requires a view change.
      if (msg.type === 'stateChanged') {
        switch (msg.state) {
          case STATE_INITIALIZE:
            await this.#showView("initialize");
            break;

          case STATE_AUTHENTICATING:
            await this.#showView("authenticating");
            break;

          case STATE_AUTH_FAILED:
            await this.#showView("authfailed");
            break;

          case STATE_MAIN:
            await this.#showView("main");
            break;

          default:
            await this.#showView("error", "internalError");
            break;
        }
      } else {
        // Any other message is sent to the view.
        await this.#view.handleMessage(msg);
      }

      this.#handlingMessage = false;

      if (this.#pendingMessages.length) {
        this.#pendingMessages.shift()();
      }
    });
  }

  #showView(viewName, data = {}) {
    // This custom element naming convention uses prefix "view-" added to filename
    const tagName = `view-${viewName}`

    if (!window.customElements.get(tagName)) {
      return console.warn(`Element <${tagName}> not defined.`)
    }

    this.#view = document.createElement(tagName)
    this.#view.initialize(this.#port, data);

    document.body.replaceChildren(this.#view)
  }
}

new Popup().init()