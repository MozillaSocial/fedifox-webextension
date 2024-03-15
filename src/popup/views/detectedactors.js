/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";
import ViewMain from './main.js';

// This main view is mainly a "bridge" for the real action.
export default class ViewShare extends ViewMain {
  show(url) {
    this.sendMessage("detectActors");

    return escapedTemplate`
    ${this.showHeaderWithNav()}
    <br><br>
    <h1>Detected Actors</h1>
    <div id="actors"></div>
    `;
  }

  async handleClickEvent(e) {
    switch (e.target.id) {
      case 'share':
        const body = document.getElementById("shareBody").value; // TODO: validation
        this.sendMessage("post", {
          /* TODO: other flags */
          body
        });
        // TODO: show a loading icon...
        break;

      case 'followActor':
        await this.sendMessage("followActor", e.target.dataset.url);
        await this.sendMessage('detectActors');
        break;

      default:
        super.handleClickEvent(e);
        break;
    }
  }

  actorDetected(actors) {
    super.actorDetected(actors);

    const body = [];
    for (const actor of actors) {
      body.push(`<h3>URL: ${actor.actor.id}</h3><button id="followActor" data-url="${actor.actor.id}">Follow</button><br /><pre>`);
      if (actor.actor.image?.url) {
        body.push(`<img src="${actor.actor.image.url}" /><br />`);
      }
      body.push(`Name: ${actor.actor.name}<br />`);
      body.push(`Summary: ${actor.actor.summary}<br />`);
      body.push("</pre>");
    }

    document.getElementById("actors").innerHTML = body.join('');
  }
}