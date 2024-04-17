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
  STATE_MAIN
} from './utils.js';

const log = Logger.logger('HCard');

export class HCard extends Component {
  #ports = [];

  async init() {
    chrome.runtime.onConnect.addListener(port => {
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

      const actors = [];

      function flat(data) {
        data.forEach(a => {
          if (Array.isArray(a)) {
            flat(a);
          } else if (a) {
            actors.push(a);
          }
        });
      }

      flat([await Promise.all(message.hCards.map(card => this.#fetchHCardURLs(card))),
        await Promise.all(message.relsme.map(url => this.#fetchActor(url)))
      ]);

      log("AP Actors:", actors.length);

      if (actors.length === 0) {
        return;
      }

      const followingIDs = (await this.sendMessage("fetchFollowingIDs")).flat();
      const unknownActors = actors.filter(actor => !followingIDs.includes(actor.id));
      log("Filtered AP Actors:", unknownActors.length);

      if (unknownActors.length > 0 && this.#ports.includes(port)) {
        this.sendMessage('apActorDetected', {
          actors: unknownActors,
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

      if (actor.error) {
        log("Unable to fetch the data");
        return null;
      }

      const urlParts = url.split('/').filter(a => a != '');
      const urlObj = new URL(url);

      let handle = urlParts[urlParts.length - 1];
      if (handle.startsWith('@')) handle = handle.slice(1)

      let subject;
      try {
        subject = (await fetch(`${urlObj.origin}/.well-known/webfinger?resource=${handle}@${urlObj.hostname}`).then(a => a.json())).subject;
      } catch (e) {
        log("Failed to fetch the webfinger data");
        return null;
      }

      if (!subject.startsWith('acct:')) {
        log(`Invalid subject: ${subject}`);
        return null;
      }

      subject = subject.slice(5);

      const data = (await this.sendMessage("searchOnMasto", subject)).flat();
      const accounts = data.map(account => account.moved ? account.moved : account).filter(account => account.username === handle);

      if (accounts.length === 0) {
        log("Unable to retrieve data from masto");
        return null;
      }
      return accounts;
    } catch (e) {
      return null;
    }
  }
}