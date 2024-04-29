/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Component
} from "./component.js";
import {
  Logger
} from './logger.js';
import {
  STATE_PERMISSION
} from './utils.js';

const log = Logger.logger('Permission');

export class Permission extends Component {
  #permissionGranted = false;

  async init() {
    chrome.permissions.onAdded.addListener(() => this.#permissionChanged());
    chrome.permissions.onRemoved.addListener(() => this.#permissionChanged());

    this.#permissionGranted = await this.#permissionCheck();

    if (!this.#permissionGranted) {
      this.setState(STATE_PERMISSION);
    }
  }

  async #permissionCheck() {
    return chrome.permissions.contains({
      origins: ["<all_urls>"]
    });
  }

  async #permissionChanged() {
    log("Permission changed!");

    const permissionGranted = await this.#permissionCheck();
    if (permissionGranted === this.#permissionGranted) {
      log("Nothing has changed");
      return;
    }

    this.#permissionGranted = permissionGranted;
    log("New permission status:", this.#permissionGranted);

    if (!this.#permissionGranted) {
      this.setState(STATE_PERMISSION);
    } else {
      this.recomputeState();
    }
  }

  stateChanged() {
    if (this.state !== STATE_PERMISSION && !this.#permissionGranted) {
      this.setState(STATE_PERMISSION);
    }
  }
}