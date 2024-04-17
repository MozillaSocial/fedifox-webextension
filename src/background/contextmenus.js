/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Component
} from "./component.js";
import {
  Logger
} from './logger.js';
import {
  STATE_MAIN
} from './utils.js';

const log = Logger.logger('ContextMenus');

export class ContextMenus extends Component {
  constructor(register) {
    super(register);

    if (!("browser" in self)) {
      // We don't want to expose the context menu items in Chrome because
      // chrome.action.openPopup() is not implemented.
      return;
    }

    // Menus need to be created at the on-installed event.
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: 'sharePage',
        title: chrome.i18n.getMessage("contextMenuShareWebsite"),
        contexts: ['all'],
        enabled: false,
      });

      chrome.contextMenus.create({
        id: 'shareLink',
        title: chrome.i18n.getMessage("contextMenuShareURL"),
        contexts: ['link'],
        enabled: false,
      });

      chrome.contextMenus.onClicked.addListener((info, tab) => {
        switch (info.menuItemId) {
          case 'sharePage':
            const url = tab.url
            this.sendMessage("shareURL", url);
            break;

          case 'shareLink':
            this.sendMessage('shareURL', info.linkUrl);
            break;
        }
      });

      chrome.contextMenus.onShown.addListener(async (info, tab) => {
        const url = new URL(tab.url)
        chrome.contextMenus.update("sharePage", {
          enabled: (this.state === STATE_MAIN && (url.protocol === 'http:' || url.protocol === 'https:'))
        });

        if (info.linkUrl) {
          const linkUrl = new URL(info.linkUrl);
          chrome.contextMenus.update("shareLink", {
            enabled: (this.state === STATE_MAIN && (linkUrl.protocol === 'http:' || linkUrl.protocol === 'https:'))
          });
        }

        chrome.contextMenus.refresh();
      })
    });
  }
}