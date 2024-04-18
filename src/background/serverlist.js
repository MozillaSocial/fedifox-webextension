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

const log = Logger.logger('ServerList');

export class ServerList extends Component {
  #servers = [];

  async init() {
    log("init");
    this.#servers = await StorageUtils.getServerList();
    if (!Array.isArray(this.#servers)) {
      this.#servers = [];
    }

    setInterval(() => this.#fetchServerList(), 3600 * 1000 /* Once per hour */ );
    this.#fetchServerList();
  }

  async #fetchServerList() {
    log("Fetching server list");

    this.#servers = await fetch('https://mozillasocial.github.io/moso-addon/servers.json').then(r => r.json());
    await StorageUtils.setServerList(this.#servers);
  }

  async handleEvent(type, data) {
    if (type === 'fetchServerList') {
      this.sendMessage("serverListFetched", this.#servers);
    }
  }
}
