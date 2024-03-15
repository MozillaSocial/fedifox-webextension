/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Component
} from "./component.js";
import {
  Logger
} from './logger.js';

const log = Logger.logger('HCard');

export class HCard extends Component {
  #ports = [];

  async init() {
    browser.runtime.onConnect.addListener(port => {
      if (port.name === 'cs') {
        this.#csConnected(port);
      }
    });
  }

  #csConnected(port) {
    log("Content script connected");

    this.#ports.push(port);

    port.onDisconnect.addListener(() => this.#ports.splice(this.#ports.indexOf(port), 1));

    port.onMessage.addListener(async message => {
      log("H-Card received:", message.hCards.length);
      log("Rels=me received:", message.relsme.length);

      const actors = [(await Promise.all(message.hCards.map(card => this.#fetchHCardURLs(card)))).flat(),
        (await Promise.all(message.relsme.map(url => this.#fetchActor(url)))).filter(actor => actor !== null)
      ].flat();
      log("AP Actors:", actors.length);

      if (actors.length > 0 && this.#ports.includes(port)) {
        this.sendMessage('apActorDetected', {
          actors,
          tabId: port.sender?.tab?.id
        });
      }
    });

    port.postMessage(this.state === STATE_MAIN);
  }

  stateChanged() {
    this.#ports.forEach(p => p.postMessage(this.state === STATE_MAIN));
  }

  async #fetchHCardURLs(card) {
    return (await Promise.all(card.properties.url.map(url => this.#fetchActor(url)))).filter(actor => actor !== null);
  }

  async #fetchActor(url) {
    try {
      const actor = await fetch(url, {
        headers: {
          Accept: 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
        }
      }).then(a => a.json());
      return {
        url,
        actor
      };
    } catch (e) {
      return null;
    }
  }
}