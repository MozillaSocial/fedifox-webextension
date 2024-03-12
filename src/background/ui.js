import {
  Component
} from "./component.js";
import {
  Logger
} from "./logger.js";
import StorageUtils from "./storageUtils.js";

const log = Logger.logger("UI");

export class UI extends Component {
  #currentPort;
  #messageQueue = [];

  constructor(receiver) {
    super(receiver);

    browser.runtime.onConnect.addListener(async port => {
      if (port.name !== "panel") {
        return;
      }

      await this.#panelConnected(port);
    });
  }

  stateChanged() {
    this.#sendDataToCurrentPort();
  }


  async #panelConnected(port) {
    log("Panel connected");

    // Overwrite any existing port. We want to talk with 1 single popup.
    this.#currentPort = port;

    // Let's send the initial data.
    port.onMessage.addListener(async message => {
      log("Message received from the panel", message);
      this.sendMessage(message.type, message.data);
    });

    port.onDisconnect.addListener(_ => {
      log("Panel disconnected");
      this.#currentPort = null;
    });

    await this.#sendDataToCurrentPort();

    // Sending the pending messages.
    while (this.#messageQueue.length && this.#currentPort) {
      await this.#currentPort.postMessage(this.#messageQueue.splice(0, 1)[0]);
    }
    this.#messageQueue.splice(0);
  }

  async #sendDataToCurrentPort() {
    log("Update the panel");
    if (this.#currentPort) {
      return this.#currentPort.postMessage({
        type: 'stateChanged',
        state: this.state,
      });
    }
  }

  async handleEvent(type, data) {
    if (type === 'mastoTimeline' && this.#currentPort) {
      return this.#currentPort.postMessage({
        type: "timeline",
        timeline: data,
      });
    }

    if (type === "shareURL") {
      return this.#sendOrQueueAndPopup({
        type: "shareURL",
        url: data,
      });
    }

    if (type === 'postResult') {
      return this.#sendOrQueueAndPopup({
        type: "postResult",
        url: data,
      });
    }
  }

  async #sendOrQueueAndPopup(msg) {
    if (this.#currentPort) {
      return this.#currentPort.postMessage(msg);
    }
    this.#messageQueue.push(msg);
    await browser.browserAction.openPopup();
  }
}