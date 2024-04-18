/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

window.browser = (function() {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

const port = chrome.runtime.connect({
  name: "cs"
});

let active = false;
port.onMessage.addListener(a => {
  active = a;
  if (active) {
    const items = Microformats.get({
      filters: ['h-card']
    });
    if (Array.isArray(items.items) || Array.isArray(items?.rels?.me)) {
      const filteredItems = items.items.filter(item => item.properties?.url?.length);
      port.postMessage({
        hCards: filteredItems,
        relsme: items?.rels?.me || []
      });
    }
  }
});