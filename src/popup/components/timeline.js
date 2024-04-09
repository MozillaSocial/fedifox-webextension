/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MosoMainBase from './mainbase.js';

customElements.define('moso-timeline', class MosoTimeline extends MosoMainBase {
  #lists = {};

  #currentList = "timeline";

  static observedAttributes = ['hidden'];

  connectedCallback() {
    super.connectedCallback();

    for (const data of [{
          id: "timeline",
          name: "Content Feed"
        },
        {
          id: "favourites",
          name: "Favourites"
        },
        {
          id: "bookmarks",
          name: "Bookmarks"
        }
      ]) {
      const a = document.createElement('a');
      a.href = "#";
      a.id = data.id;
      a.textContent = data.name;
      this.append(a);

      a.onclick = () => {
        this.sendMessage("fetchLists");
        this.#currentList = data.id;
        this.#renderList();
      }
    }

    this.append(document.createElement('ol'));
    this.querySelector("#timeline").click();
  }

  #renderList() {
    const ol = this.querySelector("ol");
    ol.replaceChildren()

    this.#lists[this.#currentList]?.forEach(status => {
      const li = document.createElement('li')
      const card = document.createElement('status-card')
      card.setAttribute("action", true);
      card.initialize(status);
      li.append(card)
      ol.append(li)
    });
  }

  setData(data) {
    if (data.timeline) {
      this.#lists.timeline = data.timeline;
    }

    if (data.favourites) {
      this.#lists.favourites = data.favourites;
    }

    if (data.bookmarks) {
      this.#lists.bookmarks = data.bookmarks;
    }

    if (this.#currentList in data) {
      this.#renderList();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // We are now visible!
    if (name === "hidden" && !this.hidden) {
      this.sendMessage("fetchLists");
    }
  }
});