/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MosoMainBase from './mainbase.js';

customElements.define('moso-timeline', class MosoTimeline extends MosoMainBase {
  #lists = {};

  #currentList = "timeline";

  #navItems = [{
      listType: "timeline",
      name: "componentTimelineContentFeed"
    },
    {
      listType: "favourites",
      name: "componentTimelineFavourites"
    },
    {
      listType: "bookmarks",
      name: "componentTimelineBookmarks"
    }
  ]

  static observedAttributes = ['hidden'];

  connectedCallback() {
    super.connectedCallback();

    this.innerHTML = `
    <nav>
      ${this.#navItems.map(item => `<button data-list-type="${item.listType}">${chrome.i18n.getMessage(item.name)}</button>`).join('')}
    </nav>
    <h2></h2>
    <ol></ol>
    `
  }

  handleEvent(e) {
    if (e.target.hasAttribute('data-list-type')) {
      this.sendMessage("fetchLists");
      this.#currentList = e.target.dataset.listType
      this.#renderList();
    }
  }

  #renderList() {
    const ol = this.querySelector("ol");
    ol.replaceChildren()

    this.querySelector('h2').textContent = chrome.i18n.getMessage(this.#navItems.find(item => item.listType === this.#currentList).name);

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