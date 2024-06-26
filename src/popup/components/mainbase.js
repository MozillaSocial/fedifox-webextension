/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default class FedifoxMainBase extends HTMLElement {
  #parent;

  connectedCallback() {
    this.addEventListener('pointerdown', this)
  }

  disconnectedCallback() {
    this.removeEventListener('pointerdown', this)
  }

  handleEvent(e) {
    // overwrite this function in child class, if needed
  }

  initialize(parent) {
    this.#parent = parent;
  }

  setData(data) {}

  sendMessage(type, data) {
    this.#parent.sendMessage(type, data);
  }
}