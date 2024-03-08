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
  async connectToHost(hostname) {
    assert(this.state === STATE_INITIALIZE, "Invalid state");

    log(`Connecting to server host ${hostname})`);
    await StorageUtils.setServerHost(hostname);
    this.setState(STATE_AUTHENTICATING);

    try {
      const appData = await this.#createApplication(hostname);
      const appCode = await this.#oauth2Authentication(hostname, appData);
      const accessToken = await this.#fetchAccessToken(hostname, appData, appCode);

      await StorageUtils.setAccessToken(accessToken);
      this.setState(STATE_MAIN);
    } catch (e) {
      this.setState(STATE_AUTH_FAILED);
    }

  }

  async #createApplication(hostname) {
    const manifest = await browser.runtime.getManifest();

    const formData = new FormData();
    formData.set('client_name', manifest.name);
    formData.set('website', manifest.homepage_url || "https://mozilla.social");
    formData.set('redirect_uris', browser.identity.getRedirectURL());
    formData.set('scopes', SCOPES);

    const request = await fetch(`https://${hostname}/api/v1/apps`, {
      method: 'POST',
      body: formData
    });

    return await request.json();
  }


  async #oauth2Authentication(hostname, appData) {
    const authorizeURL = new URL(`https://${hostname}/oauth/authorize`);
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

  async #fetchAccessToken(hostname, appData, code) {
    const formData = new FormData();
    formData.append('client_id', appData.client_id);
    formData.append('client_secret', appData.client_secret);
    formData.append('redirect_uri', appData.redirect_uri);
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('scope', SCOPES);

    const tokenData = await fetch(`https://${hostname}/oauth/token`, {
      method: "POST",
      body: formData
    }).then(res => res.json())

    return tokenData.access_token;
  }
}