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
  #currentWindowId;
  #messageQueue = [];
  #tabs = {};

  constructor(receiver) {
    super(receiver);

    browser.runtime.onConnect.addListener(async port => {
      if (port.name === "panel") {
        await this.#panelConnected(port);
      }
    });

    // To know the current tab to share, we need to track the focused window.
    browser.windows.onFocusChanged.addListener(windowId => this.#currentWindowId = windowId);

    browser.tabs.onRemoved.addListener(tabId => this.#deleteTabData(tabId));
    browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === 'loading') {
        this.#deleteTabData(tabId);
      }
    }, {
      properties: ['status']
    });
    browser.tabs.onActivated.addListener(async tabInfo => {
      if (tabInfo.windowId === this.#currentWindowId) {
        const tab = await browser.tabs.get(tabInfo.tabId);
        if (this.#currentPort) {
          await this.#currentPort.postMessage({
            type: "urlShareable",
            shareable: (tab.url.startsWith('http://') || tab.url.startsWith('https://'))
          });
        }
      }
    });
  }

  #deleteTabData(tabId) {
    delete this.#tabs[tabId];
    browser.browserAction.setBadgeText({
      text: '',
      tabId
    });
  }

  async #setTabData(tabId, actors) {
    this.#tabs[tabId] = actors;
    await browser.browserAction.setBadgeText({
      text: "🛎️",
      tabId
    });

    this.#sendActorsDetected();
  }

  async stateChanged() {
    this.#sendDataToCurrentPort();

    if (this.state === STATE_AUTH_FAILED) {
      await browser.browserAction.openPopup();
    }
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

    if (type === 'shareCurrentPage') {
      const tabs = await browser.tabs.query({
        active: true,
        windowId: this.#currentWindowId
      });
      return this.#sendOrQueueAndPopup({
        type: "shareURL",
        url: tabs.length && (tabs[0].url.startsWith('http://') || tabs[0].url.startsWith('https://')) ? tabs[0].url : '',
      });
    }

    if (type === 'apActorDetected') {
      this.#setTabData(data.tabId, data.actors);
    }

    if (type === 'detectActors') {
      this.#sendActorsDetected();
    }
  }

  async #sendActorsDetected() {
    if (this.#currentPort) {
      const tabs = await browser.tabs.query({
        active: true,
        windowId: this.#currentWindowId
      });

      this.#currentPort.postMessage({
        type: 'actorsDetected',
        actors: this.#tabs[tabs[0].id] || []
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