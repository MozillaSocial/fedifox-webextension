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
import * as utils from './utils.js';

const log = Logger.logger('Masto');

const SCOPES = 'read write push';

function assert(a, msg) {
  if (!a) {
    throw new Error(msg);
  }
}

export class Masto extends Component {
  #hostname;
  #accessToken;

  #userData;
  #following;
  #lists;

  async init() {
    log("init");

    this.#hostname = await StorageUtils.getServerHost();
    this.#accessToken = await StorageUtils.getAccessToken();

    this.#maybeUpdateData();
  }

  stateChanged() {
    this.#maybeUpdateData();
  }

  async #fetchGETJson(path, fullURL = false) {
    return await fetch(fullURL ? path : `https://${this.#hostname}${path}`, {
      headers: {
        Authorization: `Bearer ${this.#accessToken}`
      }
    }).then(r => r.json());
  }

  async #fetchPOSTJson(path, body = undefined) {
    return await fetch(`https://${this.#hostname}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#accessToken}`
      },
      body,
    }).then(r => r.json());
  }

  async #maybeUpdateData() {
    if (this.state !== utils.STATE_MAIN) {
      return;
    }

    try {
      await this.#verifyCredentials();
      await this.#updateFollowing();
      await this.#updateInstance();
      await this.#updateLists();
    } catch (e) {
      this.setState(utils.STATE_AUTH_FAILED);
    }
  }

  async #verifyCredentials() {
    const data = await this.#fetchGETJson('/api/v1/accounts/verify_credentials');

    if (data.error) {
      throw new Error();
    }

    this.#userData = data;
  }

  async #updateFollowing() {
    if (!this.#userData) {
      throw new Error();
    }

    const data = await this.#fetchGETJson(`/api/v1/accounts/${this.#userData.id}/following`);

    if (data.error) {
      throw new Error();
    }

    this.#following = data;
  }

  async #updateInstance() {
    const data = await this.#fetchGETJson('/api/v2/instance');

    if (data.error) {
      throw new Error();
    }

    await StorageUtils.setInstanceData({
      icon: data.thumbnail?.url,
      title: data.title,
    });
  }

  async #updateLists() {
    assert(this.state === utils.STATE_MAIN, "Invalid state");
    log("Fetching the home timeline, favourites and bookmarks");

    this.#lists = {
      timeline: await this.#fetchGETJson('/api/v1/timelines/home'),
      favourites: await this.#fetchGETJson('/api/v1/favourites'),
      bookmarks: await this.#fetchGETJson('/api/v1/bookmarks'),
    };
  }

  async #connectToHost(hostname) {
    assert(this.state === utils.STATE_INITIALIZE, "Invalid state");

    log(`Connecting to server host ${hostname})`);
    await StorageUtils.setServerHost(hostname);
    this.setState(utils.STATE_AUTHENTICATING);

    try {
      const appData = await this.#createApplication(hostname);
      const appCode = await this.#oauth2Authentication(hostname, appData);
      const accessToken = await this.#fetchAccessToken(hostname, appData, appCode);

      await StorageUtils.setAccessToken(accessToken);

      this.#hostname = hostname;
      this.#accessToken = accessToken;

      this.setState(utils.STATE_MAIN);
    } catch (e) {
      this.setState(utils.STATE_AUTH_FAILED);
    }
  }

  async #createApplication(hostname) {
    assert(this.state === utils.STATE_AUTHENTICATING, "Invalid state");
    log("Registering the application");

    const manifest = await chrome.runtime.getManifest();

    const formData = new FormData();
    formData.set('client_name', manifest.name);
    formData.set('website', manifest.homepage_url || "https://mozilla.social");
    formData.set('redirect_uris', chrome.identity.getRedirectURL());
    formData.set('scopes', SCOPES);

    const request = await fetch(`https://${hostname}/api/v1/apps`, {
      method: 'POST',
      body: formData
    });

    return await request.json();
  }

  async #oauth2Authentication(hostname, appData) {
    assert(this.state === utils.STATE_AUTHENTICATING, "Invalid state");
    log("Triggering the oauth2 authentication flow");

    const authorizeURL = new URL(`https://${hostname}/oauth/authorize`);
    authorizeURL.searchParams.set('client_id', appData.client_id);
    authorizeURL.searchParams.set('scope', SCOPES);
    authorizeURL.searchParams.set('redirect_uri', appData.redirect_uri);
    authorizeURL.searchParams.set('response_type', 'code');

    const redirectURL = await chrome.identity.launchWebAuthFlow({
      interactive: true,
      url: authorizeURL.href,
    });

    const url = new URL(redirectURL);
    return url.searchParams.get("code");
  }

  async #fetchAccessToken(hostname, appData, code) {
    assert(this.state === utils.STATE_AUTHENTICATING, "Invalid state");
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

  async #fetchLists() {
    assert(this.state === utils.STATE_MAIN, "Invalid state");
    log("Fetching the home timeline, favourites and bookmarks");

    if (!this.#lists) {
      await this.#updateLists();
    }

    this.sendMessage('mastoLists', this.#lists);
  }

  async #openInstance() {
    assert(this.state === utils.STATE_MAIN, "Invalid state");
    log("Open instance");

    await chrome.tabs.create({
      url: `https://${this.#hostname}`
    });
  }

  async #post(data) {
    log(`Posting!`);

    const formData = new FormData();
    formData.append('status', data.body);

    if (data.in_reply_to_id) {
      formData.append('in_reply_to_id', data.in_reply_to_id);
    }

    try {
      const data = await this.#fetchPOSTJson('/api/v1/statuses', formData);
      if (!("id" in data)) throw new Error("Failed!");
      this.sendMessage("postResult", data.id);
    } catch (e) {
      this.sendMessage("postResult", null);
      return;
    }
  }

  async #search(subject) {
    log("Search subject", subject);

    const searchURL = new URL(`https://${this.#hostname}/api/v2/search`);
    searchURL.searchParams.set('q', subject);
    searchURL.searchParams.set('type', 'accounts');
    searchURL.searchParams.set('resolve', 'true');

    try {
      return (await this.#fetchGETJson(searchURL.href, true)).accounts;
    } catch (e) {
      log("Unable to fetch the search output", e);
    }
  }

  async #followActor(id) {
    log("Follow actor id", id);
    try {
      await this.#fetchPOSTJson(`/api/v1/accounts/${id}/follow`);
    } catch (e) {
      log("Unable to add the follower", e);
    }
  }

  async #unfollowActor(id) {
    log("Unfollow actor id", id);
    try {
      await this.#fetchPOSTJson(`/api/v1/accounts/${id}/unfollow`);
    } catch (e) {
      log("Unable to remove the follower", e);
    }
  }

  async handleEvent(type, data) {
    switch (type) {
      case 'connectToHost':
        await this.#connectToHost(data);
        break;

      case 'fetchLists':
        await this.#fetchLists();
        break;

      case 'openInstance':
        await this.#openInstance();
        break;

      case 'post':
        await this.#post(data);
        this.#invalidateLists();
        break;

      case 'searchOnMasto':
        return this.#search(data);

      case 'followActor':
        await this.#followActor(data);
        await this.#updateFollowing();
        this.#invalidateLists();
        break;

      case 'unfollowActor':
        await this.#unfollowActor(data);
        await this.#updateFollowing();
        this.#invalidateLists();
        break;

      case 'fetchFollowingIDs':
        return this.#following?.map(a => a.id);

      case 'reblogStatus':
        await this.#genericAction("reblog", data);
        this.#invalidateLists();
        break;

      case 'unreblogStatus':
        await this.#genericAction("unreblog", data);
        this.#invalidateLists();
        break;

      case 'favouriteStatus':
        await this.#genericAction("favourite", data);
        this.#invalidateLists();
        break;

      case 'unfavouriteStatus':
        await this.#genericAction("unfavourite", data);
        this.#invalidateLists();
        break;

      case 'bookmarkStatus':
        await this.#genericAction("bookmark", data);
        this.#invalidateLists();
        break;

      case 'unbookmarkStatus':
        await this.#genericAction("unbookmark", data);
        this.#invalidateLists();
        break;
    }
  }

  #invalidateLists() {
    this.#lists = undefined;
  }

  async #genericAction(action, id) {
    await this.#fetchPOSTJson(`/api/v1/statuses/${id}/${action}`);
    this.sendMessage(`${action}Completed`)
  }
}