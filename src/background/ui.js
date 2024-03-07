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
      // TODO
    });

    port.onDisconnect.addListener(_ => {
      log("Panel disconnected");
      this.#currentPort = null;
    });

    await this.#sendDataToCurrentPort();
  }

  async #sendDataToCurrentPort() {
    log("Update the panel: ", this.#currentPort);
    if (this.#currentPort) {
      return this.#currentPort.postMessage({
        state: this.state,
      });
    }
  }

  getTranslation(stringName, ...args) {
    if (args.length !== 0) {
      return browser.i18n.getMessage(stringName, ...args);
    }
    return browser.i18n.getMessage(stringName);
  }
}