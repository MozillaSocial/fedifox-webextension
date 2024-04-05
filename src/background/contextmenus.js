/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Component
} from "./component.js";
import {
  Logger
} from './logger.js';

const log = Logger.logger('ContextMenus');

export class ContextMenus extends Component {
  constructor(register) {
    super(register);

    // Menus need to be created at the on-installed event.
    browser.runtime.onInstalled.addListener(() => {
      browser.menus.create({
        id: 'sharePage',
        title: 'Share this website',
        contexts: ['all'],
        enabled: false,
      });

      browser.menus.create({
        id: 'shareLink',
        title: 'Share this URL',
        contexts: ['link'],
        enabled: false,
      });

      browser.menus.onClicked.addListener((info, tab) => {
        switch (info.menuItemId) {
          case 'sharePage':
            const url = tab.url
            this.sendMessage("shareURL", url);
            break;

          case 'shareLink':
            this.sendMessage('shareURL', info.linkUrl);
            break;
        }
        browser.browserAction.openPopup();
      });

      browser.menus.onShown.addListener(async (info, tab) => {
        const url = new URL(tab.url)
        browser.menus.update("sharePage", {
          enabled: (this.state === STATE_MAIN && (url.protocol === 'http:' || url.protocol === 'https:'))
        });

        if (info.linkUrl) {
          const linkUrl = new URL(info.linkUrl);
          browser.menus.update("shareLink", {
            enabled: (this.state === STATE_MAIN && (linkUrl.protocol === 'http:' || linkUrl.protocol === 'https:'))
          });
        }

        browser.menus.refresh();
      })
    });
  }
}