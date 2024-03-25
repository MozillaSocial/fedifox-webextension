/**
 * @description
 * Card to display a status/post from a user's status feed/timeline
 */

class StatusCard extends HTMLElement {
  #status
  #dateTimeFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  set status(value) {
    this.#status = value
    this.render()
  }

  get status() {
    return this.#status
  }

  parseMedia(obj) {
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

  formatDate(dateString) {
    const date = new Date(dateString)
    return this.#dateTimeFormat.format(date)
  }

  render() {
    const data = this.#status

    this.innerHTML = `
    <article id=${data.id}>
      <header>
        <a href="${data.url}">
          <img src="${data.account.avatar}">
          <address>${data.account.display_name || data.account.username}</address>
          <time datetime="${data.created_at}">${this.formatDate(data.created_at)}</time>
        </a>
      </header>
      ${data.content}
      <div class="media">${data.media_attachments?.map(obj => this.parseMedia(obj)).join('')}</div>
    </article>
    `
  }
}

customElements.define("status-card", StatusCard);