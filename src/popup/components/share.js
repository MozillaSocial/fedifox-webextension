/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FedifoxMainBase from './mainbase.js';

customElements.define('fedifox-share', class FedifoxShare extends FedifoxMainBase {
  static observedAttributes = ['hidden'];
  #in_reply_to_id = undefined;
  #in_reply_to_card
  #instanceData = {
    status_max_characters: 500 // default in case instance data not available/propagated
  }
  textArea

  async connectedCallback() {
    this.sendMessage("urlShareable");

    super.connectedCallback();

    this.innerHTML = `
    <main>
      <h2 data-i18n="componentShareTitle"></h2>
      <p data-i18n="componentShareBody"></p>
      <fieldset>
        <textarea></textarea>
        <div class="share-buttons">
          <button disabled class="secondary" id="insert-url" data-i18n="componentShareInsertURL"></button>
          <button class="primary" id="share" data-i18n="componentShareButtonPost"></button>
        </div>
      </fieldset>
    </main>
    `;

    this.textArea = this.querySelector('textarea')

    this.setInstanceData(this.#instanceData);
  }

  setData(url, status) {
    if (url) {
      this.textArea.value += `\n${url}\n`;
    }

    this.textArea.focus();

    if (status) {
      this.#in_reply_to_id = status.id;

      const card = document.createElement('status-card');
      card.initialize(status);

      if (this.#in_reply_to_card) {
        this.#in_reply_to_card.replaceWith(card)
      } else {
        this.textArea.insertAdjacentElement('afterend', card)
      }

      card.insertAdjacentHTML('beforeend', '<button class="close"></button>')
      this.#in_reply_to_card = card
    }
  }

  setInstanceData(data) {
    this.#instanceData = data
    this.textArea.maxlength = data.status_max_characters;
  }

  async handleEvent(e) {
    if (e.target.id === 'share') {
      this.sendMessage("post", {
        /* TODO: other flags */
        body: this.textArea.value,
        in_reply_to_id: this.#in_reply_to_id,
      });

      // TODO: show a loading icon...
    }
    if (e.target.id === 'insert-url') {
      this.sendMessage("shareCurrentPage");
    }
    if (e.target.classList.contains('close')) {
      this.#in_reply_to_card.remove()
      this.#in_reply_to_card = null
      this.#in_reply_to_id = null
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "hidden" && !this.hidden) {
      this.textArea.style.removeProperty('height')
      window.scrollTo(0, 0);
      this.textArea.focus();
      this.textArea.selectionEnd = 0
    }
  }
});