/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewBase from './base.js';

customElements.define('view-main', class ViewMain extends ViewBase {
  #views = {};

  connectedCallback() {
    this.sendMessage("detectActors");

    this.innerHTML = `
    <fedifox-header></fedifox-header>
    <nav>
      <button id="showTimeline" data-i18n="viewMainButtonFeed"></button>
      <button id="share" data-i18n="viewMainButtonShare"></button>
      <button id="showDetectedActors" data-i18n="viewMainButtonShowDetectedActors"></button>
      <button id="openInstance" data-i18n="viewMainButtonOpenInstance"></button>
      <button id="reset" data-i18n="viewMainButtonSignOut"></button>
    </nav>
    `

    for (const view of ["timeline", "share", "detectedactors"]) {
      const el = document.createElement(`fedifox-${view}`)
      el.initialize(this)
      el.hidden = true;
      this.append(el)

      this.#views[view] = el;
    }

    this.#render('timeline');

    for (const eventName of ["reblogStatus",
        "unreblogStatus",
        "favouriteStatus",
        "unfavouriteStatus",
        "bookmarkStatus",
        "unbookmarkStatus",
        "replyStatus",
        "followActor",
        "unfollowActor"
      ]) {
      document.addEventListener(eventName, e => {
        this.sendMessage(eventName, e.detail);
        e.stopPropagation();
      });
    }

    super.connectedCallback();
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
      this.#render("timeline");
      return;
    }

    if (e.target.id === "share") {
      this.#views.share.setData("", null);
      this.#render('share');
      return;
    }

    if (e.target.id === 'showDetectedActors') {
      this.#render('detectedactors');
      return;
    }
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'mastoLists':
        this.#views.timeline.setData(msg);
        this.localize();
        break;

      case 'share':
        this.#views.share.setData(msg.url, msg.status)
        this.#render('share');
        break;

      case 'actorsDetected': {
        // this is called multiple times: once with empty object, and a second time when actors are present
        // it's not a reliable way to know if background script is done fetching actor data.
        this.#views.detectedactors.setData(msg.actors);
        this.localize();
        break;
      }

      case 'postResult':
        if (this.#views.share.hidden === false) {
          setTimeout(() => window.close(), 1000);
        }
        break;

      case 'urlShareable':
        document.getElementById("insert-url").disabled = !msg.shareable;
        break;
    }
  }

  #render(name) {
    Object.entries(this.#views).forEach(entry => entry[1].hidden = entry[0] !== name);
  }
});