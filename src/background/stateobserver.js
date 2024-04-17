/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Component
} from "./component.js";
import {
  Logger
} from './logger.js';
import StorageUtils from "./storageUtils.js";
import {
  STATE_INITIALIZE
} from './utils.js';

const log = Logger.logger('StateObserver');

export class StateObserver extends Component {
  stateChanged() {
    log(`Saving state: ${this.state}`);
    StorageUtils.setState(this.state);
  }

  async handleEvent(type, data) {
    if (type === "reset") {
      this.setState(STATE_INITIALIZE);
    }
  }
}