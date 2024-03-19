/**
 * @description
 * Card to display a status/post from a user's status feed/timeline
 */

const html = data => `
<article id=${data.id}>
  <header>
    <img src="${data.account.avatar}">
    <address>${data.account.display_name || data.account.username}</address>
    <time datetime="${data.created_at}">${data.created_at}</time>
  </header>
  <p>${data.content}</p>
  <p>${data.media_attachments?.map(a => a.url)}</p>
</article>
`

class StatusCard extends HTMLElement {
  #status

  set status(value) {
    this.#status = value
    this.render()
  }

  get status() {
    return this.#status
  }

  render() {
    this.innerHTML = html(this.#status)
  }
}

customElements.define("status-card", StatusCard);