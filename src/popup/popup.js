const LOADING_TIMEOUT = 5000;

class Popup {
  #port;

  async init() {
    // Disable context menu.
    window.addEventListener("contextmenu", e => e.preventDefault());

    this.#port = browser.runtime.connect({
      name: "panel"
    });

    let timeoutId = setTimeout(async _ => {
      // TODO: show an error!
    }, LOADING_TIMEOUT);

    this.#port.onMessage.addListener(async msg => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = 0;
      }

      switch (msg.state) {
        case STATE_LOADING:
          // TODO
          return;

        default:
          // TODO: show error!
      }
    });
  }
}

const i = new Popup();

// Defer loading until the document has loaded
if (document.readyState === "loading") {
  // We don't care about waiting for init to finish in this code
  document.addEventListener("DOMContentLoaded", () => {
    i.init();
  });
} else {
  i.init();
}