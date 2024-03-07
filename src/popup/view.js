/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is the generic a view. Any other view should inherit from this class.
export class View {
  static #views = new Map();
  static #currentView = null;
  static #currentPort = null;

  // Static method to set the current view. The previous one will be dismissed.
  static async setView(name, data = null) {
    if (!View.#views.has(name)) {
      const view = await import(`./views/${name}.js`);
      this.#registerView(view.default, name);
    }

    const view = View.#views.get(name);
    if (!(view instanceof View)) {
      console.error("Invalid view name: " + name);
      return;
    }

    View.#currentView = view;

    const content = document.getElementById("content");
    content.innerHTML = "";

    let template = View.#currentView.show(data);
    if (template && template instanceof Template) {
      template.renderTo(content);
    }

    View.#currentView.postShow(data);
  }

  // Closes the popup
  static close() {
    close();
  }

  // This method stores a view in the view map.
  static #registerView(view, name) {
    View.#views.set(name, view);
  }

  constructor() {}

  handleEvent(e) {
    if (e instanceof DragEvent) {
      e.preventDefault();
      return;
    }

    this.handleClickEvent(e);
  }

  // Override if you want to handle events
  handleClickEvent() {}

  // Override to display content from an escaped template.
  show(data) {}

  // To be overwritten if needed.
  postShow(data) {}

  // Helper method to send messages to the background script.
  static async sendMessage(type, data = {}) {
    if (!View.#currentPort) {
      throw new Error("Invalid port!");
    }

    return View.#currentPort.postMessage({
      type,
      data,
    });
  }

  static setPort(port) {
    View.#currentPort = port;
  }
}
