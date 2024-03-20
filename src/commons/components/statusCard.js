/**
 * @description
 * Card to display a status/post from a user's status feed/timeline
 */

class StatusCard extends HTMLElement {
  #status

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
      case 'image':
        figure.innerHTML = `<img src="${obj.url}" id="${obj.id}">`
        break
      case 'video':
        figure.innerHTML = `<video src="${obj.url}" id="${obj.id}" controls></video>`
        break
    }

    return figure.outerHTML
  }

  render() {
    const data = this.#status

    this.innerHTML = `
    <article id=${data.id}>
      <header>
        <img src="${data.account.avatar}">
        <address>${data.account.display_name || data.account.username}</address>
        <time datetime="${data.created_at}">${data.created_at}</time>
      </header>
      ${data.content}
      <div class="media">${data.media_attachments?.map(obj => this.parseMedia(obj)).join('')}</div>
    </article>
    `
  }
}

customElements.define("status-card", StatusCard);