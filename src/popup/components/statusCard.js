/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @description
 * Card to display a status/post from a user's status feed/timeline
 */

customElements.define("status-card", class StatusCard extends HTMLElement {
  #status
  #dateTimeFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  initialize(value) {
    this.#status = value
  }

  connectedCallback() {
    console.assert(this.#status, "No status yet?!?");

    this.replaceChildren()

    const article = document.createElement('article');
    article.id = `id${this.#status.id}`;
    this.append(article);

    if (this.#status.reblog) {
      article.className = 'boosted'
      article.insertAdjacentHTML('beforebegin', `
      <div class="boost-credit">
        <a href="${this.#status.account.url}">
          <img src="${this.#status.account.avatar}">
          <span>${this.#status.account.display_name || this.#status.account.username}</span>
        </a>
        <span>boosted</span>
      </div>
      `)

      article.innerHTML = `
        <header>
          <a href="${this.#status.reblog.url}">
            <img src="${this.#status.reblog.account.avatar}">
            <address>${this.#status.reblog.account.display_name || this.#status.reblog.account.username}</address>
            <time datetime="${this.#status.created_at}">${this.#formatDate(this.#status.created_at)}</time>
          </a>
        </header>
      `
    } else {
      article.innerHTML = `
        <header>
          <a href="${this.#status.url}">
            <img src="${this.#status.account.avatar}">
            <address>${this.#status.account.display_name || this.#status.account.username}</address>
            <time datetime="${this.#status.created_at}">${this.#formatDate(this.#status.created_at)}</time>
          </a>
        </header>
      `;
    }

    const content = document.createElement('status-content');
    content.initialize(this.#status.reblog || this.#status);
    article.append(content);

    if (this.getAttribute("action")) {
      const actions = document.createElement('status-actions');
      actions.initialize(this.#status.reblog || this.#status);
      article.append(actions);
    }
  }

  #formatDate(dateString) {
    const date = new Date(dateString)
    return this.#dateTimeFormat.format(date)
  }
});

customElements.define("status-content", class StatusContent extends HTMLElement {
  #status

  initialize(value) {
    this.#status = value
  }

  connectedCallback() {
    console.assert(this.#status, "No status yet?!?");

    this.innerHTML = this.#status.content;

    // TODO: poll!

    this.innerHTML += `<div class="media">${this.#status.media_attachments?.map(obj => this.#parseMedia(obj)).join('')}</div>`;

    if (this.#status.card && ['link', 'photo', 'video', 'rich'].includes(this.#status.card.type)) {
      const card = document.createElement('preview-card');
      card.initialize(this.#status.card);
      this.append(card);
    }

    if (this.#status.sensitive) {
      const sensitiveToggle = document.createElement('sensitive-toggle')
      sensitiveToggle.spoiler = this.#status.spoiler_text
      this.append(sensitiveToggle)
      this.classList.add('sensitive')
    }
  }

  #parseMedia(obj) {
    const figure = document.createElement('figure')

    switch (obj.type) {
      case 'audio':
        figure.innerHTML = `<audio src="${obj.url}" id="${obj.id}" controls></audio>`
        break
      case 'gifv':
        figure.innerHTML = `<video src="${obj.url}" id="${obj.id}" muted autoplay loop></video>`
        break
      case 'image':
        figure.innerHTML = `<img src="${obj.url}" id="${obj.id}">`
        break
      case 'video':
        figure.innerHTML = `<video src="${obj.url}" id="${obj.id}" controls></video>`
        break
    }

    return figure.hasChildNodes() ? figure.outerHTML : ''
  }
});

customElements.define("status-actions", class StatusActions extends HTMLElement {
  #status

  initialize(value) {
    this.#status = value
  }

  connectedCallback() {
    console.assert(this.#status, "No status yet?!?");

    const replyButton = document.createElement('button');
    replyButton.className = `status-action`
    replyButton.title = chrome.i18n.getMessage("componentStatusActionsButtonReply");
    replyButton.style.setProperty('--icon-url', 'url(../commons/images/reply.svg)')
    replyButton.onclick = () => document.dispatchEvent(new CustomEvent("replyStatus", {
      detail: this.#status,
    }));
    const replyDiv = document.createElement('div');
    replyDiv.className = 'status-replies'
    replyDiv.append(replyButton)
    replyDiv.insertAdjacentHTML('beforeend', `<small>${this.#status.replies_count}<small>`)
    this.append(replyDiv);

    const boostButton = document.createElement('status-action-toggle');
    boostButton.initialize("boost", ["componentStatusActionsButtonBoost", "componentStatusActionsButtonBoosted"], ["reblogStatus", "unreblogStatus"], this.#status.reblogged, this.#status.id);
    this.append(boostButton);

    const favouriteButton = document.createElement('status-action-toggle');
    favouriteButton.initialize("favourite", ["componentStatusActionsButtonFavourite", "componentStatusActionsButtonFavourited"], ["favouriteStatus", "unfavouriteStatus"], this.#status.favourited, this.#status.id);
    this.append(favouriteButton);

    const bookmarkButton = document.createElement('status-action-toggle');
    bookmarkButton.initialize("bookmark", ["componentStatusActionsButtonBookmark", "componentStatusActionsButtonBookmarked"], ["bookmarkStatus", "unbookmarkStatus"], this.#status.bookmarked, this.#status.id);
    this.append(bookmarkButton);
  }
});

customElements.define("status-action-toggle", class StatusCard extends HTMLElement {
  #icon;
  #texts;
  #events;
  #status = false;
  #id;

  initialize(icon, texts, events, status, id) {
    this.#icon = icon;
    this.#texts = texts;
    this.#events = events;
    this.#status = status;
    this.#id = id;
  }

  connectedCallback() {
    this.innerHTML = `
    <button class="status-action" style="--icon-url:url(../commons/images/${this.#icon}.svg)"></button>
    `
    this.button = this.querySelector('button')
    this.button.addEventListener('click', this)
    this.updateButton();
  }

  handleEvent() {
    document.dispatchEvent(new CustomEvent(this.#events[this.#status ? 1 : 0], {
      detail: this.#id
    }));
    this.#status = !this.#status;
    this.updateButton();
  }

  updateButton() {
    this.button.title = chrome.i18n.getMessage(this.#texts[this.#status ? 1 : 0])
    this.button.classList.toggle('on', this.#status)
  }

  disconnectedCallback() {
    this.button.removeEventListener('click', this)
  }
});
