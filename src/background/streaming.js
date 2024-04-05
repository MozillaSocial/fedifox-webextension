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

const log = Logger.logger('Streaming');

export class Streaming extends Component {
  #connected = false;
  #timeout;
  #lastEvent;

  async init() {
    log("init");
    this.#resetTimeout();
    this.#maybeStart();
  }

  stateChanged() {
    this.#maybeStart();
  }

  #increaseTimeout() {
    this.#timeout *= 2;
  }

  #resetTimeout() {
    this.#timeout = 1;
  }

  async #maybeStart() {
    if (this.state !== STATE_MAIN) {
      this.#connected = false;
      return;
    }

    if (this.#connected) {
      log("We are already connected!");
      return;
    }

    const hostname = await StorageUtils.getServerHost();
    log(`Fetching the streaming endpoint for ${hostname}`);

    const accessToken = await StorageUtils.getAccessToken();
    const reader = await fetch(`https://${hostname}/api/v1/streaming/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(a => a.body.getReader());

    this.#connected = true;

    const utf8Decoder = new TextDecoder("utf-8");

    let buffer = '';
    const pump = data => {
      if (data.done) {
        log("Stream complete");

        if (this.#connected) {
          this.#connected = false;
          this.#increaseTimeout();
          setTimeout(() => this.#maybeStart, this.#timeout * 1000);
        }
        return;
      }

      if (!this.#connected) {
        log("We have been disconnected in the meantime!");
        reader.close();
        return;
      }

      this.#resetTimeout();

      buffer += utf8Decoder.decode(data.value, {
        stream: true
      })

      while (true) {
        const pos = buffer.indexOf('\n');
        if (pos < 0) break;

        const line = buffer.substr(0, pos);
        buffer = buffer.substr(pos + 1);

        this.#processLine(line);
      }

      return reader.read().then(pump);
    }

    reader.read().then(pump);
  }

  #processLine(line) {
    if (line.startsWith(':')) {
      return;
    }

    if (line.startsWith('event: ')) {
      this.#lastEvent = line.slice(7);
      return;
    }

    if (line.startsWith('data: ')) {
      this.#processEvent(this.#lastEvent, JSON.parse(line.slice(6)));
      return;
    }

    if (line === '') {
      return;
    }

    log('Unsupported streaming line', line);
  }

  #processEvent(eventName, data) {
    switch (eventName) {
      case 'update':
      case 'delete':
      case 'status.update':
        this.sendMessage('timelineRefreshNeeded');
        break;
    }
  }
}