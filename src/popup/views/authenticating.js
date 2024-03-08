/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  View
} from "../view.js";

// This is the first view to be shown.
class ViewAuthenticating extends View {
  show(data) {
    return escapedTemplate`
    <h1>Authenticating!</h1>
    `;
  }
}

const view = new ViewAuthenticating();
export default view;