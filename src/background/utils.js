/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Permission check is needed
export const STATE_PERMISSION = "permission";

// The user has not selected a default server.
export const STATE_INITIALIZE = "initialize";

// We are trying to connect to a server and start the authentication.
export const STATE_AUTHENTICATING = "authenticating";

// The authentication failed
export const STATE_AUTH_FAILED = "auth_failed";

// The main state: the user is authenticated
export const STATE_MAIN = "main";

export default null;