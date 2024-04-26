/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FedifoxMainBase from './mainbase.js';

customElements.define('fedifox-timeline', class FedifoxTimeline extends FedifoxMainBase {
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
      ${this.#navItems.map(item => `<button id="button-${item.listType}" data-list-type="${item.listType}">${chrome.i18n.getMessage(item.name)}</button>`).join('')}
    </nav>
    <h2></h2>
    <ol class="loading"></ol>
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
    ol.classList.remove('loading')

    this.querySelector('h2').textContent = chrome.i18n.getMessage(this.#navItems.find(item => item.listType === this.#currentList).name);

    const replyMap = new Map()

    this.#lists[this.#currentList]?.forEach(status => {
      const li = document.createElement('li')
      const card = document.createElement('status-card')
      card.setAttribute("id", status.id);
      card.setAttribute("action", true);
      card.initialize(status);
      li.append(card)
      ol.append(li)
      if (status.in_reply_to_id) {
        // add reply to array of replies associated with original status ID
        replyMap.has(status.in_reply_to_id) ? replyMap.get(status.in_reply_to_id).unshift(li) : replyMap.set(status.in_reply_to_id, [li])
      }
    })

    replyMap.forEach((value, key, map) => {
      const originalStatus = ol.querySelector(`status-card[id="${key}"]`)

      if (originalStatus) {
        // if original status is present in timeline, thread replies
        const ol = document.createElement('ol')
        ol.append(...value) // value is an array of <li> replies 
        originalStatus.parentElement.append(ol)
      } else {
        // otherwise remove from replyMap and leave reply as-is: detatched in chronological order
        map.delete(key)
      }
    })

    replyMap.forEach(value => {
      // after items are rendered to DOM, assign class and thread-line height property to status-card elements
      for (const li of value) {
        const thisCard = li.firstElementChild
        const prevCard = li.previousElementSibling?.firstElementChild

        thisCard.rect = thisCard.getBoundingClientRect()

        if (prevCard) {
          // 2 cards in a row: we need full height between cards including gap
          thisCard.threadHeight = thisCard.rect.bottom - prevCard.getBoundingClientRect().bottom
        } else {
          // card directly below original status: we need half the reply height plus gap between cards
          thisCard.threadHeight = thisCard.rect.height / 2
        }

        thisCard.style.setProperty('--thread-h', `${thisCard.threadHeight}px`)
        thisCard.classList.add('thread')
      }
    })

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

    this.#showAvailableLists();
  }

  #showAvailableLists() {
    for (const item of this.#navItems) {
      const button = document.getElementById(`button-${item.listType}`);
      button.disabled = this.#lists[item.listType]?.length === 0;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // We are now visible!
    if (name === "hidden" && !this.hidden) {
      this.sendMessage("fetchLists");
    }
  }
});