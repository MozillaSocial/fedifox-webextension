/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default class ViewBase extends HTMLElement {
  #port
  #data;

  connectedCallback() {
    this.addEventListener('click', this)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this)
  }

  initialize(port, data = {}) {
    this.#port = port;
    this.#data = data;
  }

  // Override this!
  async handleEvent(e) {}

  // Override this!
  handleMessage(msg) {}

  // Helper method to send messages to the background script.
  async sendMessage(type, data = {}) {
    if (!this.#port) {
      throw new Error("Invalid port!");
    }

    return this.#port.postMessage({
      type,
      data,
    });
  }
}