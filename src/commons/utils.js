/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The user has not selected a default server.
const STATE_INITIALIZE = "initialize";

// We are trying to connect to a server and start the authentication.
const STATE_AUTHENTICATING = "authenticating";

// The authentication failed
const STATE_AUTH_FAILED = "auth_failed";

// The main state: the user is authenticated
const STATE_MAIN = "main";

function assert(a, msg) {
  if (!a) {
    throw new Error(msg);
  }
}