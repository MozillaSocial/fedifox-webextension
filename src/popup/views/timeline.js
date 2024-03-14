/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ViewMain from './main.js';

// This main view is mainly a "bridge" for the real action.
export default class ViewTimeline extends ViewMain {
  show(timeline) {
    return escapedTemplate`
    ${this.showHeaderWithNav()}
    <br><br>
    <h1>Timeline</h1>
    <div id="timeline"></div>
    `;
  }

  postShow(timeline) {
    const body = [];
    for (const status of timeline) {
      body.push(`<pre>Date: ${status.created_at}<br />`);
      body.push(`Author: ${status.account.display_name || status.account.username}<br />`);
      body.push(`Visibility: ${status.visibility}<br />`);
      body.push(`Sensitive: ${status.sensitive}<br />`);
      body.push(`Media Attachment: ${status.media_attachments?.map(a => a.url)}<br />`);
      body.push(`Content: ${status.content}<br />`);
      // TODO: other properties!
      body.push("</pre>");
    }

    document.getElementById("timeline").innerHTML = body.join('');
  }
}