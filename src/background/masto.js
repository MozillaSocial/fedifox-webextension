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
  #hostname;
  #accessToken;

  #userData;
  #following;

  async init() {
    log("init");

    this.#hostname = await StorageUtils.getHostname();
    this.#accessToken = await StorageUtils.getAccessToken();

    this.#maybeUpdateData();
  }

  stateChanged() {
    this.#maybeUpdateData();
  }

  async #maybeUpdateData() {
    if (this.state !== STATE_MAIN) {
      return;
    }

    try {
      await this.#verifyCredentials();
      await this.#updateFollowing();
    } catch (e) {
      this.setState(STATE_AUTH_FAILED);
    }
  }

  async #verifyCredentials() {
    const data = await fetch(`https://${this.#hostname}/api/v1/accounts/verify_credentials`, {
      headers: {
        Authorization: `Bearer ${this.#accessToken}`
      }
    }).then(r => r.json());

    if (data.error) {
      throw new Error();
    }

    this.#userData = data;
  }

  async #updateFollowing() {
    if (!this.#userData) {
      throw new Error();
    }

    const data = await fetch(`https://${this.#hostname}/api/v1/accounts/${this.#userData.id}/following`, {
      headers: {
        Authorization: `Bearer ${this.#accessToken}`
      }
    }).then(r => r.json());

    if (data.error) {
      throw new Error();
    }

    this.#following = data;
  }

  async #connectToHost(hostname) {
    assert(this.state === STATE_INITIALIZE, "Invalid state");

    log(`Connecting to server host ${hostname})`);
    await StorageUtils.setServerHost(hostname);
    this.setState(STATE_AUTHENTICATING);

    try {
      const appData = await this.#createApplication(hostname);
      const appCode = await this.#oauth2Authentication(hostname, appData);
      const accessToken = await this.#fetchAccessToken(hostname, appData, appCode);

      await StorageUtils.setHostnameAndAccessToken(hostname, accessToken);

      this.#hostname = hostname;
      this.#accessToken = accessToken;

      this.setState(STATE_MAIN);
    } catch (e) {
      this.setState(STATE_AUTH_FAILED);
    }
  }

  async #createApplication(hostname) {
    assert(this.state === STATE_AUTHENTICATING, "Invalid state");
    log("Registering the application");

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
    assert(this.state === STATE_AUTHENTICATING, "Invalid state");
    log("Triggering the oauth2 authentication flow");

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
    assert(this.state === STATE_AUTHENTICATING, "Invalid state");
    log("Requesting the access token");

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

  async #fetchHomeTimeline() {
    assert(this.state === STATE_MAIN, "Invalid state");
    log("Fetching the home timeline");

    const data = await fetch(`https://${this.#hostname}/api/v1/timelines/home`, {
      headers: {
        Authorization: `Bearer ${this.#accessToken}`
      }
    }).then(r => r.json());

    this.sendMessage("mastoTimeline", data);
  }

  async #openInstance() {
    assert(this.state === STATE_MAIN, "Invalid state");
    log("Open instance");

    await browser.tabs.create({
      url: `https://${this.#hostname}`
    });
  }

  async #post(body) {
    log(`Posting: ${body}`);

    const formData = new FormData();
    formData.append('status', body);

    try {
      const data = await fetch(`https://${this.#hostname}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.#accessToken}`
        },
        body: formData
      }).then(r => r.json());
      if (!("id" in data)) throw new Error("Failed!");
      this.sendMessage("postResult", data.id);
    } catch (e) {
      this.sendMessage("postResult", null);
      return;
    }
  }

  async #followActor(url) {
    log("Follow user", url);
    const urlParts = url.split('/').filter(a => a != '');
    const handle = urlParts[urlParts.length - 1];
    const urlObj = new URL(url);

    let subject;
    try {
      subject = (await fetch(`${urlObj.origin}/.well-known/webfinger?resource=${handle}@${urlObj.hostname}`).then(a => a.json())).subject;
    } catch (e) {
      log("Failed to fetch the webfinger data");
      return;
    }

    if (!subject.startsWith('acct:')) {
      log(`Invalid subject: ${subject}`);
      return;
    }

    const searchURL = new URL(`https://${this.#hostname}/api/v2/search`);
    searchURL.searchParams.set('q', subject.slice(5));
    searchURL.searchParams.set('type', 'accounts');
    searchURL.searchParams.set('resolve', 'true');

    const accountIds = [];
    try {
      const data = await fetch(searchURL, {
        headers: {
          Authorization: `Bearer ${this.#accessToken}`
        },
      }).then(r => r.json());
      data.accounts.forEach(account => accountIds.push(account.moved?.id ? account.moved.id : account.id));
    } catch (e) {
      log("Unable to fetch the search output", e);
      return;
    }

    if (accountIds.length === 0) {
      log(`Unable to fetch data for the subject ${subject}`);
      return;
    }

    try {
      const data = await fetch(`https://${this.#hostname}/api/v1/accounts/${accountIds[0]}/follow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.#accessToken}`
        },
      }).then(r => r.json());
    } catch (e) {
      log("Unable to add the follower", e);
      return;
    }
  }

  async handleEvent(type, data) {
    switch (type) {
      case 'connectToHost':
        await this.#connectToHost(data);
        break;

      case 'fetchTimeline':
        await this.#fetchHomeTimeline();
        break;

      case 'openInstance':
        await this.#openInstance();
        break;

      case 'post':
        await this.#post(data.body);
        break;

      case 'followActor':
        await this.#followActor(data);
        break;

      case 'fetchFollowingURLs':
        return this.#following?.map(a => a.url);
    }
  }
}