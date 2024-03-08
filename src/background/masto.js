/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Component
} from "./component.js";
import {
  Logger
} from './logger.js';
import StorageUtils from "./storageUtils.js";

const log = Logger.logger('Masto');

const SCOPES = 'read write push';

export class Masto extends Component {
  async connectToServer(url) {
    assert(this.state === STATE_INITIALIZE, "Invalid state");
    const serverURL = new URL(url);

    log(`Connecting to server ${serverURL.hostname}`);
    await StorageUtils.setServerDomain(serverURL.hostname);
    this.setState(STATE_CONNECTING);

    const appData = await this.#createApplication(serverURL.hostname);
    const appCode = await this.#oauth2Authentication(serverURL.hostname, appData);
    const accessToken = await this.#fetchAccessToken(serverURL.hostname, appData, appCode);

    await StorageUtils.setAccessToken(accessToken);
    this.setState(STATE_MAIN);
  }

  async #createApplication(domain) {
    const formData = new FormData();
    // TODO: these fields should be retrieved from introspection
    formData.set('client_name', 'MoSo for Firefox');
    formData.set('website', 'http://mozilla.com');
    formData.set('redirect_uris', browser.identity.getRedirectURL());
    formData.set('scopes', SCOPES);

    const request = await fetch(`https://${domain}/api/v1/apps`, {
      method: 'POST',
      body: formData
    });

    return await request.json();
  }


  async #oauth2Authentication(domain, appData) {
    const authorizeURL = new URL(`https://${domain}/oauth/authorize`);
    authorizeURL.searchParams.set('client_id', appData.client_id);
    authorizeURL.searchParams.set('scope', SCOPES);
    authorizeURL.searchParams.set('redirect_uri', appData.redirect_uri);
    authorizeURL.searchParams.set('response_type', 'code');

    const redirectURL = await browser.identity.launchWebAuthFlow({
      interactive: true,
      url: authorizeURL.href,
    });

    const url = new URL(redirectURL);
    return url.searchParams.get("code");
  }

  async #fetchAccessToken(domain, appData, code) {
    const formData = new FormData();
    formData.append('client_id', appData.client_id);
    formData.append('client_secret', appData.client_secret);
    formData.append('redirect_uri', appData.redirect_uri);
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('scope', SCOPES);

    const tokenData = await fetch(`https://${domain}/oauth/token`, {
      method: "POST",
      body: formData
    }).then(res => res.json())

    return tokenData.access_token;
  }
}
