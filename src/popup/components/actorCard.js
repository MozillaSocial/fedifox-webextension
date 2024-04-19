/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @description
 * Card to display an ActivityPub Actor object
 * https://www.w3.org/TR/activitypub/#actors 
 */

customElements.define("actor-card", class ActorCard extends HTMLElement {
  #data
  #dateTimeFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short'
  })

  initialize(value) {
    this.#data = value
  }

  connectedCallback() {
    // TODO: Sanitize this content!
    this.innerHTML = `
    <article>
      <header>
        <img src="${this.#data.avatar}">
        <h3>${this.#data.display_name || this.#data.username}</h3>
      </header>
      ${this.#data.note}
      <address>
        <a href="${this.#data.url}">${this.#data.url}</a>
      </address>
      <footer>
        <actor-follow actor_id="${this.#data.id}" is_following="${this.#data.isFollowing}" followers_count="${this.#data.followers_count}"></actor-follow>
        ${this.#data.last_status_at ? `<time datetime="${this.#data.last_status_at}">${chrome.i18n.getMessage("componentActorCardLastActive", this.#formatDate(this.#data.last_status_at))}</time>` : ''}
      </footer>
    </article>
    `
  }

  #formatDate(dateString) {
    const date = new Date(dateString)
    return this.#dateTimeFormat.format(date)
  }
})

customElements.define("actor-follow", class ActorFollow extends HTMLElement {
  #actorId = 0;
  #isFollowing = false;
  #followersCount = 0;

  #button;
  #text;

  static observedAttributes = ['actor_id', 'is_following', 'followers_count'];

  connectedCallback() {
    const span = document.createElement('span');

    this.#button = document.createElement('button');
    this.#button.setAttribute('class', 'secondary');
    span.append(this.#button);

    this.#text = document.createTextNode('')

    span.append(this.#text);

    this.append(span);

    this.#updateButtonAndText();

    this.#button.addEventListener('click', () => this.#buttonClicked());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'actor_id': {
        this.#actorId = newValue;
        break;
      }

      case 'is_following': {
        this.#isFollowing = (newValue === "true");
        break;
      }

      case 'followers_count': {
        this.#followersCount = parseInt(newValue, 10);
        break;
      }
    }

    this.#updateButtonAndText();
  }

  #updateButtonAndText() {
    if (this.#text) {
      this.#text.textContent = `${chrome.i18n.getMessage("componentActorCardFollowerCount", this.#followersCount)}`;
    }

    if (this.#button) {
      this.#button.textContent = chrome.i18n.getMessage(this.#isFollowing ? 'componentActorCardButtonFollowing' : 'componentActorCardButtonFollow');
    }
  }

  #buttonClicked() {
    let eventName;

    if (this.#isFollowing) {
      this.#followersCount--;
      eventName = "unfollowActor";
    } else {
      this.#followersCount++;
      eventName = "followActor";
    }

    this.#isFollowing = !this.#isFollowing;

    this.#updateButtonAndText();

    document.dispatchEvent(new CustomEvent(eventName, {
      detail: this.#actorId
    }));
  }
})