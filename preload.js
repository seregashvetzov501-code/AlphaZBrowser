console.log('[PRELOAD] Script started');

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openURL: (url) => {
    console.log(`[PRELOAD] openURL -> ${url}`);
    ipcRenderer.send("open-url", url);
  },
  goBack: () => {
    console.log('[PRELOAD] goBack');
    ipcRenderer.send("go-back");
  },
  goForward: () => {
    console.log('[PRELOAD] goForward');
    ipcRenderer.send("go-forward");
  },
  reload: () => {
    console.log('[PRELOAD] reload');
    ipcRenderer.send("reload");
  },
  goHome: () => {
    console.log('[PRELOAD] goHome');
    ipcRenderer.send("go-home");
  },

  createTab: (url) => {
    console.log(`[PRELOAD] createTab -> ${url}`);
    return ipcRenderer.invoke("tabs:create", url);
  },
  closeTab: (tabId) => {
    console.log(`[PRELOAD] closeTab -> ${tabId}`);
    return ipcRenderer.invoke("tabs:close", tabId);
  },
  switchTab: (tabId) => {
    console.log(`[PRELOAD] switchTab -> ${tabId}`);
    return ipcRenderer.invoke("tabs:switch", tabId);
  },
  getTabs: () => {
    console.log('[PRELOAD] getTabs');
    return ipcRenderer.invoke("tabs:getAll");
  },

  getHistory: () => {
    console.log('[PRELOAD] getHistory');
    return ipcRenderer.invoke("history:get");
  },
  clearHistory: () => {
    console.log('[PRELOAD] clearHistory');
    return ipcRenderer.invoke("history:clear");
  },
  onHistoryUpdate: (callback) => {
    console.log('[PRELOAD] onHistoryUpdate registered');
    ipcRenderer.on("history-update", (event, history) => {
      console.log(`[PRELOAD] history-update -> ${history ? history.length : 0} entries`);
      callback(history || []);
    });
  },

  getPasswords: () => {
    console.log('[PRELOAD] getPasswords');
    return ipcRenderer.invoke("passwords:get");
  },
  savePassword: (entry) => {
    console.log('[PRELOAD] savePassword');
    return ipcRenderer.invoke("passwords:save", entry);
  },
  deletePassword: (url, username) => {
    console.log(`[PRELOAD] deletePassword -> ${url}`);
    return ipcRenderer.invoke("passwords:delete", url, username);
  },

  openPasswords: () => {
    console.log('[PRELOAD] openPasswords');
    ipcRenderer.send("open-passwords");
  },
  openHistory: () => {
    console.log('[PRELOAD] openHistory');
    ipcRenderer.send("open-history");
  },

  closeCurrentTab: () => {
    console.log('[PRELOAD] closeCurrentTab');
    ipcRenderer.send("close-current-tab");
  },

  clearCache: () => {
    console.log('[PRELOAD] clearCache');
    return ipcRenderer.invoke("cache:clear");
  },

  getSuggestions: (query) => {
    console.log(`[PRELOAD] getSuggestions -> ${query}`);
    return ipcRenderer.invoke("suggest:get", query);
  },

  updateSuggestHeight: (height) => {
    console.log(`[PRELOAD] updateSuggestHeight -> ${height}`);
    ipcRenderer.send("update-suggest-height", height);
  },

  minimizeWindow: () => {
    console.log('[PRELOAD] minimizeWindow');
    ipcRenderer.send("window:minimize");
  },
  maximizeWindow: () => {
    console.log('[PRELOAD] maximizeWindow');
    ipcRenderer.send("window:maximize");
  },
  closeWindow: () => {
    console.log('[PRELOAD] closeWindow');
    ipcRenderer.send("window:close");
  },

  openDevTools: () => {
    console.log('[PRELOAD] openDevTools');
    ipcRenderer.send("open-dev-tools");
  },

  getSettings: () => {
    console.log('[PRELOAD] getSettings');
    return ipcRenderer.invoke("settings:getAll");
  },
  getSearchEngine: () => {
    console.log('[PRELOAD] getSearchEngine');
    return ipcRenderer.invoke("settings:getSearchEngine");
  },
  setSearchEngine: (engine) => {
    console.log(`[PRELOAD] setSearchEngine -> ${engine}`);
    ipcRenderer.send("settings:setSearchEngine", engine);
  },
  setTheme: (theme) => {
    console.log(`[PRELOAD] setTheme -> ${theme}`);
    ipcRenderer.send("settings:setTheme", theme);
  },
  setCustomTheme: (customTheme) => {
    console.log('[PRELOAD] setCustomTheme');
    ipcRenderer.send("settings:setCustomTheme", customTheme);
  },
  onSettingsChanged: (callback) => {
    console.log('[PRELOAD] onSettingsChanged registered');
    ipcRenderer.on("settings:changed", (event, data) => {
      console.log(`[PRELOAD] settings:changed ->`, data);
      callback(data);
    });
  },

  toggleSettings: (show) => {
    console.log('[PRELOAD] toggleSettings');
    ipcRenderer.send("toggle-settings", show);
  },
  onSettingsToggle: (callback) => {
    console.log('[PRELOAD] onSettingsToggle registered');
    ipcRenderer.on("settings-toggle", (event, show) => {
      console.log(`[PRELOAD] settings-toggle -> ${show}`);
      callback(show);
    });
  },

  toggleSuggest: (show) => {
    console.log('[PRELOAD] toggleSuggest');
    ipcRenderer.send("toggle-suggest", show);
  },
  onSuggestToggle: (callback) => {
    console.log('[PRELOAD] onSuggestToggle registered');
    ipcRenderer.on("suggest-toggle", (event, show) => {
      console.log(`[PRELOAD] suggest-toggle -> ${show}`);
      callback(show);
    });
  },

  onUpdateUrl: (callback) => {
    console.log('[PRELOAD] onUpdateUrl registered');
    ipcRenderer.on("update-url", (event, url) => {
      console.log(`[PRELOAD] update-url -> ${url}`);
      callback(url);
    });
  },
  onLoadingStatus: (callback) => {
    console.log('[PRELOAD] onLoadingStatus registered');
    ipcRenderer.on("loading-status", (event, isLoading) => {
      console.log(`[PRELOAD] loading-status -> ${isLoading}`);
      callback(isLoading);
    });
  },
  onTabsUpdate: (callback) => {
    console.log('[PRELOAD] onTabsUpdate registered');
    ipcRenderer.on("tabs-update", (event, tabs) => {
      console.log(`[PRELOAD] tabs-update -> ${tabs.length} tabs`);
      callback(tabs);
    });
  },
});

console.log('[PRELOAD] electronAPI exposed');