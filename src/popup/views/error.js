/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";

export default class ViewError extends View {
  show(data) {
    return escapedTemplate`
    <h1>Error: ${data}</h1>
    `;
  }
}