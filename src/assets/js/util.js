const config = {  // system parameters
  sectionLimit: 100,
  favLimit: 10,
  historyLimit: 20,
}

const storage = {
  get(key) {
    return chrome.storage.local.get(key).then(res => res[key]);
  },
  set(key, value) {
    return chrome.storage.local.set({ [key]: value });
  },
  remove(key) {
    return chrome.storage.local.remove(key);
  },
  clear() {
    return chrome.storage.local.clear();
  }
};

export { config, storage };