/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-main', class ViewMain extends ViewBase {
  #views = {};

  connectedCallback() {
    super.connectedCallback();

    // In case the panel was opened by the user, let's fetch the timeline to
    // trigger the `timeline` view.
    this.sendMessage("fetchTimeline");
    this.sendMessage("urlShareable");
    this.sendMessage("detectActors");

    this.innerHTML = `
    <moso-header></moso-header>
      <nav>
        <button id="showTimeline">Feed</button>
        <button id="shareCurrentPage">Share Current Page</button>
        <button id="showDetectedActors" disabled>Show detected actors</button>
        <button id="openInstance">Open Instance</button>
        <button id="reset">Sign out</button>
      </nav>
    <main id="main"></main>`;

    const main = document.getElementById('main');

    for (const name of ['timeline', 'share', 'detectedactors']) {
      const elm = document.createElement(`moso-${name}`);
      elm.initialize(this);
      elm.hidden = name !== 'timeline';
      main.append(elm);
      this.#views[name] = elm;
    }
  }

  async handleEvent(e) {
    if (e.target.id === "reset") {
      await this.sendMessage("reset");
      return;
    }

    if (e.target.id === "openInstance") {
      await this.sendMessage("openInstance");
      window.close();
      return;
    }

    if (e.target.id === "showTimeline") {
      this.sendMessage("fetchTimeline");
      this.#render('timeline');
      return;
    }

    if (e.target.id === "shareCurrentPage" && !e.target.disabled) {
      await this.sendMessage("shareCurrentPage");
      this.#render('share');
      return;
    }

    if (e.target.id === 'showDetectedActors' && !e.target.disabled) {
      this.sendMessage("detectActors");
      this.#render('detectedactors');
      return;
    }
  }

  async handleMessage(msg) {
    switch (msg.type) {
      case 'timeline':
        this.#views['timeline'].setData(msg.timeline);
        break;

      case 'shareURL':
        this.#views['share'].setData(msg.url);
        this.#render('share');
        break;

      case 'actorsDetected': {
        const menu = document.getElementById("showDetectedActors");
        menu.disabled = msg.actors.length === 0;
        this.#views['detectedactors'].setData(msg.actors);
        break;
      }

      case 'urlShareable': {
        const menu = document.getElementById("shareCurrentPage");
        if (menu) menu.disabled = !msg.shareable;
        break;
      }

      case 'postResult':
        if (!this.#views['share'].hidden) {
          setTimeout(() => window.close(), 1000);
        }
    }
  }

  #render(name) {
    Object.entries(this.#views).forEach(entry => entry[1].hidden = entry[0] !== name);
  }
});