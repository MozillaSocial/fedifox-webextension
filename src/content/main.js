/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Content scripts are injected and run in the context of a web page. 
// They can read and modify the content of their page using standard DOM APIs
// (as opposed to background scripts which are part of the extension, or scripts which are part of the website itself)

window.addEventListener("contextmenu", notifyExtension);

function notifyExtension(e) {
  const href = e.target.closest('a')?.href // null or undefined is acceptable value

  browser.runtime.sendMessage({
    contextClickHref: href
  })
}