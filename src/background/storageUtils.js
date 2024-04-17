/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class StorageUtils {
  async getState() {
    return this.#getStorageKey("state");
  }

  async setState(state) {
    await chrome.storage.local.set({
      state
    });
  }

  async getServerHost() {
    return this.#getStorageKey("serverHost");
  }

  async setServerHost(serverHost) {
    await chrome.storage.local.set({
      serverHost
    });
  }

  async getAccessToken() {
    return this.#getStorageKey("accessToken");
  }

  async setAccessToken(accessToken) {
    await chrome.storage.local.set({
      accessToken
    });
  }

  async getServerList() {
    return this.#getStorageKey("serverList");
  }

  async setServerList(serverList) {
    await chrome.storage.local.set({
      serverList
    });
  }

  async getInstanceData() {
    return this.#getStorageKey("instanceData");
  }

  async setInstanceData(instanceData) {
    await chrome.storage.local.set({
      instanceData
    });
  }

  async #getStorageKey(key) {
    const data = await chrome.storage.local.get(key);
    return data[key];
  }
}

const i = new StorageUtils();
export default i;