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
      <button id="share">Share</button>
      <button id="shareCurrentPage">Share Current Page</button>
      <button id="showDetectedActors" disabled>Show detected actors</button>
      <button id="openInstance">Open Instance</button>
      <button id="reset">Sign out</button>
    </nav>
    `

    this.mainEl = document.createElement('main')
    this.append(this.mainEl)

    for (const eventName of ["reblogStatus", "unreblogStatus", "favouriteStatus", "unfavouriteStatus", "bookmarkStatus", "unbookmarkStatus", "replyStatus"]) {
      document.addEventListener(eventName, e => {
        this.sendMessage(eventName, e.detail);
        e.stopPropagation();
      });
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
      return;
    }

    if (e.target.id === "share") {
      this.#render('share');
      return;
    }

    if (e.target.id === "shareCurrentPage" && !e.target.disabled) {
      await this.sendMessage("shareCurrentPage");
      return;
    }

    if (e.target.id === 'showDetectedActors' && !e.target.disabled) {
      this.sendMessage("detectActors");
      this.#render('detectedactors');
      return;
    }
  }

  handleMessage(msg) {
    let el
    switch (msg.type) {
      case 'timeline':
        el = this.#render('timeline')
        el.setData(msg.timeline)
        break;

      case 'share':
        el = this.#render('share');
        el.setData(msg.url, msg.status)
        break;

      case 'actorsDetected': {
        var menu = document.getElementById("showDetectedActors");
        menu.disabled = msg.actors.length === 0;
        if (menu.disabled) break

        el = this.mainEl.getElementsByTagName('moso-detectedactors')[0]
        if (el) el.setData(msg.actors)
        break;
      }

      case 'urlShareable': {
        var menu = document.getElementById("shareCurrentPage");
        if (menu) menu.disabled = !msg.shareable;
        break;
      }

      case 'postResult':
        el = this.mainEl.getElementsByTagName('moso-share')[0]
        if (el) {
          setTimeout(() => window.close(), 1000);
        }
    }
  }

  #render(name) {
    const el = document.createElement(`moso-${name}`)
    el.initialize(this)
    this.mainEl.replaceChildren(el)
    return el
  }
});