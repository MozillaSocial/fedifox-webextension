/**
 * @description
 * A rich preview card that is generated using OpenGraph tags from a URL
 */

customElements.define("preview-card", class PreviewCard extends HTMLElement {
  #data

  initialize(value) {
    this.#data = value
    this.setAttribute('type', this.#data.type)
  }

  connectedCallback() {
    this.innerHTML = this[this.#data.type](this.#data) // ['photo', 'video', 'link', 'rich']
  }

  photo = data => `
  <figure>
    <a href="${data.url}">
      <img src="${data.image}" alt="${data.image_description || ''}">
    </a>
    <figcaption>
      <h3>${data.title}</h3>
      <p>${data.author_url ? `<a href="${data.author_url}">${data.author_name}</a>` : data.author_name}</p>
      <p>${data.provider_name}</p>
    </figcaption>
  </figure>
  `

  video = data => `
  <figure>
    ${data.html}
    <figcaption>
      <h3>${data.title}</h3>
      <p>${data.author_url ? `<a href="${data.author_url}">${data.author_name}</a>` : data.author_name}</p>
      <p>${data.provider_name}</p>
    </figcaption>
  </figure>
  `

  link = data => `
  <figure ${!data.image ? 'class="default-img"' : ''}>
    <img src="${data.image || '../../commons/images/article.svg'}" alt="${data.image_description}" />
    <figcaption>
      <h3>${data.title}</h3>
      <p><em>${data.description}</em></p>
      <p>${data.author_url ? `<a href="${data.author_url}">${data.author_name}</a>` : data.author_name}</p>
      <p>${data.provider_name}</p>
    </figcaption>
  </figure>
  `

  rich = data => `
  <figure>
    ${data.html}
    <figcaption>
      <h3>${data.title}</h3>
      <p>${data.author_url ? `<a href="${data.author_url}">${data.author_name}</a>` : data.author_name}</p>
      <p>${data.provider_name}</p>
    </figcaption>
  </figure>
  `

});