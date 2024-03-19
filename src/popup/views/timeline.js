/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewMain from './main.js';

// This main view is mainly a "bridge" for the real action.
export default class ViewTimeline extends ViewMain {
  show(timeline) {
    this.sendMessage("detectActors");

    return escapedTemplate`
    ${this.showHeaderWithNav()}
    <main>
      <h2>Content Feed</h2>
      <div id="timeline"></div>
    </main>
    `;
  }

  postShow(timeline) {
    const frag = document.createDocumentFragment()

    for (const status of timeline) {
      const card = document.createElement('status-card')
      card.status = status
      frag.append(card)
    }
    document.body.append(frag)
  }
}