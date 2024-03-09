/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The main class for components.
export class Component {
  #receiver;

  constructor(receiver) {
    this.#receiver = receiver;
    this.#receiver.registerObserver(this);
  }

  // To overwrite, if needed.
  async init() {}

  // To overwrite, if needed.
  stateChanged() {}

  get state() {
    return this.#receiver.state;
  }

  setState(state) {
    return this.#receiver.setState(state);
  }

  // Returns an async response from the main
  sendMessage(type, data = null) {
    return this.#receiver.handleEvent(type, data);
  }
}
