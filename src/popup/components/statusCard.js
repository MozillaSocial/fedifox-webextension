/**
 * @description
 * Card to display a status/post from a user's status feed/timeline
 */

customElements.define("status-card", class StatusCard extends HTMLElement {
  #shadow;
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

    this.innerHTML = `
    <article id=id${this.#status.id}>
      <header>
        <a href="${this.#status.url}">
          <img src="${this.#status.account.avatar}">
          <address>${this.#status.account.display_name || this.#status.account.username}</address>
          <time datetime="${this.#status.created_at}">${this.#formatDate(this.#status.created_at)}</time>
        </a>
      </header>
    </article>
    `

    const article = document.getElementById(`id${this.#status.id}`);

    const content = document.createElement('status-content-wrapper');
    content.initialize(this.#status);
    article.append(content);

    if (this.getAttribute("action")) {
      const actions = document.createElement('status-actions');
      actions.initialize(this.#status);
      article.append(actions);
    }
  }

  #formatDate(dateString) {
    const date = new Date(dateString)
    return this.#dateTimeFormat.format(date)
  }
});

customElements.define("status-content-wrapper", class StatusContentWrapper extends HTMLElement {
  #status

  initialize(value) {
    this.#status = value
  }

  connectedCallback() {
    console.assert(this.#status, "No status yet?!?");

    const content = document.createElement('status-content');
    content.initialize(this.#status);

    if (this.#status.spoiler_text) {
      this.innerHTML = this.#status.spoiler_text;

      const moreButton = document.createElement('button');
      moreButton.textContent = "SHOW MORE";
      this.append(moreButton);

      const lessButton = document.createElement('button');
      lessButton.textContent = "SHOW LESS";
      lessButton.hidden = true;
      this.append(lessButton);

      content.hidden = true;
      this.append(content);

      moreButton.onclick = () => {
        moreButton.hidden = true;
        lessButton.hidden = false;
        content.hidden = false;
      }

      lessButton.onclick = () => {
        moreButton.hidden = false;
        lessButton.hidden = true;
        content.hidden = true;
      }
      return;
    }

    this.append(content);
  }
});

customElements.define("status-content", class StatusContent extends HTMLElement {
  #status

  initialize(value) {
    this.#status = value
  }

  connectedCallback() {
    console.assert(this.#status, "No status yet?!?");

    // TODO: poll!

    this.innerHTML = `
      ${this.#status.content}
      <div class="media">${this.#status.media_attachments?.map(obj => this.#parseMedia(obj)).join('')}</div>
    `;
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
    replyButton.title = 'Replies'
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
    boostButton.initialize("boost", ["Boost", "Boosted"], ["reblogStatus", "unreblogStatus"], this.#status.reblogged, this.#status.id);
    this.append(boostButton);

    const favouriteButton = document.createElement('status-action-toggle');
    favouriteButton.initialize("favourite", ["Favourite", "Favourited"], ["favouriteStatus", "unfavouriteStatus"], this.#status.favourited, this.#status.id);
    this.append(favouriteButton);

    const bookmarkButton = document.createElement('status-action-toggle');
    bookmarkButton.initialize("bookmark", ["Bookmark", "Bookmarked"], ["bookmarkStatus", "unbookmarkStatus"], this.#status.bookmarked, this.#status.id);
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
    this.button.title = this.#texts[this.#status ? 1 : 0]
    this.button.classList.toggle('on', this.#status)
  }

  disconnectedCallback() {
    this.button.removeEventListener('click', this)
  }
});