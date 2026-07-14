const { app, BrowserWindow, WebContentsView, ipcMain, session } = require("electron");
const path = require("path");
const fs = require('fs');

// ============================================================
//  БЛОКИРОВКА ПОВТОРНОГО ЗАПУСКА + ОТКРЫТИЕ ФАЙЛОВ
// ============================================================
const singleInstanceLock = app.requestSingleInstanceLock();
let mainWindow;
let tabs = new Map();
let activeTabId = null;
let tabCounter = 0;
let isReady = false;
let settingsOverlayVisible = false;
let isFullscreen = false;
let suggestVisibleHeight = 0;

if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const args = commandLine.slice(1);
    for (const arg of args) {
      if (arg.endsWith('.html') || arg.endsWith('.htm') || arg.endsWith('.xhtml')) {
        createTab(`file://${arg}`);
      }
    }
  });
}

// ============================================================
//  НАСТРОЙКИ
// ============================================================
let settings = {
  searchEngine: 'yandex',
  theme: 'light',
  customTheme: null,
};

const settingsFile = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      const data = fs.readFileSync(settingsFile, 'utf8');
      const loaded = JSON.parse(data);
      settings = { ...settings, ...loaded };
      console.log('📂 Настройки загружены:', settings);
    }
  } catch (e) {
    console.warn('⚠️ Ошибка загрузки настроек:', e);
  }
}

function saveSettings() {
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    console.log('💾 Настройки сохранены:', settings);
  } catch (e) {
    console.warn('⚠️ Ошибка сохранения настроек:', e);
  }
}

function broadcastSettings() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('settings:changed', settings);
  }
}

function getHomeUrl() {
  const homeUrls = {
    yandex: 'https://ya.ru',
    google: 'https://www.google.com',
    duckduckgo: 'https://duckduckgo.com',
    bing: 'https://www.bing.com'
  };
  return homeUrls[settings.searchEngine] || 'https://ya.ru';
}

// ============================================================
//  СОБСТВЕННАЯ СИСТЕМА ИСТОРИИ
// ============================================================
const historyFile = path.join(app.getPath('userData'), 'history.json');
let historyEntries = [];

function loadHistoryFromDisk() {
  try {
    if (fs.existsSync(historyFile)) {
      const data = fs.readFileSync(historyFile, 'utf8');
      historyEntries = JSON.parse(data);
      if (!Array.isArray(historyEntries)) historyEntries = [];
    } else {
      historyEntries = [];
    }
    console.log(`📂 История загружена: ${historyEntries.length} записей`);
  } catch (e) {
    console.warn('⚠️ Ошибка загрузки истории:', e);
    historyEntries = [];
  }
  return historyEntries;
}

function saveHistoryToDisk() {
  try {
    fs.writeFileSync(historyFile, JSON.stringify(historyEntries, null, 2));
    console.log(`💾 История сохранена: ${historyEntries.length} записей`);
    broadcastHistory();
  } catch (e) {
    console.error('❌ Ошибка сохранения истории:', e);
  }
}

function addHistoryEntry(url, title) {
  console.log(`📝 addHistoryEntry: ${url}`);
  if (!url || url.startsWith('kodium://') || url.startsWith('data:text/html') || url.startsWith('about:')) {
    return;
  }
  const last = historyEntries.length > 0 ? historyEntries[historyEntries.length - 1] : null;
  if (last && last.url === url) {
    last.title = title || last.title;
    last.timestamp = Date.now();
  } else {
    historyEntries.push({
      url,
      title: title || url,
      timestamp: Date.now()
    });
  }
  if (historyEntries.length > 1000) {
    historyEntries = historyEntries.slice(-1000);
  }
  saveHistoryToDisk();
}

function getHistory() {
  console.log(`📖 getHistory: возвращаю ${historyEntries.length} записей`);
  return historyEntries;
}

function clearHistory() {
  historyEntries = [];
  saveHistoryToDisk();
  return true;
}

function broadcastHistory() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const history = getHistory();
    mainWindow.webContents.send('history-update', history);
    tabs.forEach((tab) => {
      if (tab.isSpecial && tab.url === 'kodium://history') {
        try {
          tab.view.webContents.send('history-update', history);
        } catch (e) {}
      }
    });
  }
}

// ============================================================
//  ПАРОЛИ
// ============================================================
const passwordsFile = path.join(app.getPath('userData'), 'passwords.json');

function savePassword(entry) {
  try {
    let passwords = [];
    if (fs.existsSync(passwordsFile)) {
      passwords = JSON.parse(fs.readFileSync(passwordsFile, 'utf8'));
    }
    const index = passwords.findIndex(p => p.url === entry.url && p.username === entry.username);
    if (index !== -1) {
      passwords[index] = entry;
    } else {
      passwords.push(entry);
    }
    fs.writeFileSync(passwordsFile, JSON.stringify(passwords, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

function getPasswords() {
  try {
    if (fs.existsSync(passwordsFile)) {
      return JSON.parse(fs.readFileSync(passwordsFile, 'utf8'));
    }
  } catch (error) {}
  return [];
}

function deletePassword(url, username) {
  try {
    let passwords = [];
    if (fs.existsSync(passwordsFile)) {
      passwords = JSON.parse(fs.readFileSync(passwordsFile, 'utf8'));
    }
    passwords = passwords.filter(p => !(p.url === url && p.username === username));
    fs.writeFileSync(passwordsFile, JSON.stringify(passwords, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================================
//  КЕШ
// ============================================================
const userDataPath = app.getPath('userData');
const cachePath = path.join(userDataPath, 'Cache');

try {
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
    console.log('📁 Кеш создан в:', cachePath);
  } else {
    console.log('📁 Кеш уже существует:', cachePath);
  }
} catch (err) {
  console.warn('⚠️ Не удалось создать кеш:', err);
}

app.setPath('cache', cachePath);
app.setPath('userData', userDataPath);

app.commandLine.appendSwitch('disable-gpu-cache');
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-disk-cache');
app.commandLine.appendSwitch('disable-quota');
app.commandLine.appendSwitch('disable-features', 'WebSecurity', 'OutOfBlinkCors');
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('enable-features', 'NetworkService');

const TOOLBAR_HEIGHT = 84;
const SETTINGS_WIDTH = 450;

// ============================================================
//  УПРАВЛЕНИЕ РАЗМЕРАМИ
// ============================================================
function updateViewBounds(suggestHeight = 0) {
  if (!mainWindow || !activeTabId) return;
  const tab = tabs.get(activeTabId);
  if (!tab || !tab.view) return;
  const bounds = mainWindow.getContentBounds();
  const offsetX = settingsOverlayVisible ? SETTINGS_WIDTH : 0;
  const offsetY = suggestHeight > 0 ? suggestHeight : 0;
  tab.view.setBounds({
    x: 0,
    y: TOOLBAR_HEIGHT + offsetY,
    width: bounds.width - offsetX,
    height: bounds.height - TOOLBAR_HEIGHT - offsetY,
  });
}

function syncTabsToRenderer() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const tabsData = Array.from(tabs.values()).map(tab => ({
    id: tab.id,
    title: tab.title || 'Новая вкладка',
    url: tab.url || '',
    isLoading: tab.isLoading || false,
    isActive: tab.id === activeTabId,
  }));
  mainWindow.webContents.send('tabs-update', tabsData);
}

// ============================================================
//  ОБРАБОТЧИК ЗАГРУЗОК (СКАЧИВАНИЕ)
// ============================================================
function setupDownloadHandlers() {
  session.defaultSession.on('will-download', (event, item, webContents) => {
    const fileName = item.getFilename();
    const savePath = path.join(app.getPath('downloads'), fileName);
    item.setSavePath(savePath);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-started', { fileName });
    }

    item.once('done', (event, state) => {
      if (state === 'completed') {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('download-completed', { fileName, savePath });
        }
        console.log(`✅ Файл скачан: ${fileName}`);
      } else {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('download-failed', { fileName, state });
        }
        console.log(`❌ Ошибка скачивания: ${fileName} (${state})`);
      }
    });
  });
}

// ============================================================
//  ОКНО
// ============================================================
function createWindow() {
  loadSettings();
  loadHistoryFromDisk();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    fullscreenable: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: 'persist:browser',
    },
    show: false,
  });

  mainWindow.loadFile("index.html");

  // Проверяем, был ли браузер запущен с .html файлом
  const args = process.argv.slice(1);
  let hasFileArg = false;
  for (const arg of args) {
    if (arg.endsWith('.html') || arg.endsWith('.htm') || arg.endsWith('.xhtml')) {
      hasFileArg = true;
      break;
    }
  }

  mainWindow.once('ready-to-show', () => {
    if (hasFileArg) {
      for (const arg of args) {
        if (arg.endsWith('.html') || arg.endsWith('.htm') || arg.endsWith('.xhtml')) {
          createTab(`file://${arg}`);
        }
      }
    } else {
      const homeUrl = getHomeUrl();
      createTab(homeUrl);
      console.log(`🏠 Стартовая страница: ${homeUrl}`);
    }

    isReady = true;
    syncTabsToRenderer();
    broadcastSettings();
    broadcastHistory();
    mainWindow.show();
  });

  mainWindow.on('resize', () => {
    updateViewBounds(suggestVisibleHeight);
  });

  mainWindow.on('close', () => {
    saveSettings();
    saveHistoryToDisk();
    tabs.forEach((tab) => {
      try {
        if (tab.view && tab.view.webContents) {
          mainWindow.contentView.removeChildView(tab.view);
          tab.view.webContents.close();
        }
      } catch (error) {}
    });
    tabs.clear();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      event.preventDefault();
      toggleFullscreen();
    }
  });

  setupIpcHandlers();
  setupDownloadHandlers();
}

function toggleFullscreen() {
  if (!mainWindow) return;
  isFullscreen = !isFullscreen;
  mainWindow.setFullScreen(isFullscreen);
}

// ============================================================
//  IPC
// ============================================================
function setupIpcHandlers() {
  // --- НАСТРОЙКИ ---
  ipcMain.handle("settings:getAll", () => settings);
  ipcMain.handle("settings:getSearchEngine", () => settings.searchEngine);
  ipcMain.on("settings:setSearchEngine", (event, engine) => {
    if (engine && engine !== settings.searchEngine) {
      settings.searchEngine = engine;
      saveSettings();
      broadcastSettings();
      console.log(`🔍 Поисковик изменён на: ${engine}`);
    }
  });
  ipcMain.on("settings:setTheme", (event, theme) => {
    if (theme && theme !== settings.theme) {
      settings.theme = theme;
      saveSettings();
      broadcastSettings();
      console.log(`🎨 Тема изменена на: ${theme}`);
    }
  });
  ipcMain.on("settings:setCustomTheme", (event, customTheme) => {
    settings.theme = 'custom';
    settings.customTheme = customTheme;
    saveSettings();
    broadcastSettings();
    console.log('🎨 Пользовательская тема применена');
  });

  // --- Вкладки ---
  ipcMain.handle("tabs:create", (event, url) => {
    const tabId = createTab(url || getHomeUrl());
    syncTabsToRenderer();
    return tabId;
  });

  ipcMain.handle("tabs:close", (event, tabId) => {
    if (tabs.size <= 1) {
      app.quit();
      return true;
    }
    const result = closeTab(tabId);
    syncTabsToRenderer();
    return result;
  });

  ipcMain.handle("tabs:switch", (event, tabId) => {
    const result = switchTab(tabId);
    syncTabsToRenderer();
    return result;
  });

  ipcMain.handle("tabs:getAll", () => {
    return Array.from(tabs.values()).map(tab => ({
      id: tab.id,
      title: tab.title || 'Новая вкладка',
      url: tab.url || '',
      isLoading: tab.isLoading || false,
      isActive: tab.id === activeTabId,
    }));
  });

  // --- История ---
  ipcMain.handle("history:get", () => {
    const history = getHistory();
    console.log(`📤 history:get возвращает ${history.length} записей`);
    return history;
  });
  ipcMain.handle("history:clear", () => clearHistory());

  // --- Пароли ---
  ipcMain.handle("passwords:get", () => getPasswords());
  ipcMain.handle("passwords:save", (event, entry) => savePassword(entry));
  ipcMain.handle("passwords:delete", (event, url, username) => deletePassword(url, username));

  ipcMain.on("open-passwords", () => {
    createTab('kodium://passwords');
    syncTabsToRenderer();
  });

  ipcMain.on("open-history", () => {
    createTab('kodium://history');
    syncTabsToRenderer();
  });

  ipcMain.on("close-current-tab", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      if (tab.isSpecial) {
        closeTab(activeTabId);
        syncTabsToRenderer();
      }
    }
  });

  ipcMain.handle("cache:clear", async () => {
    try {
      await session.defaultSession.clearCache();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("suggest:get", async (event, query) => {
    if (!query || query.length < 2) {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    const history = getHistory();
    const historySuggestions = history
      .filter(h => {
        const title = (h.title || '').toLowerCase();
        const url = h.url.toLowerCase();
        return title.includes(lowerQuery) || url.includes(lowerQuery);
      })
      .slice(0, 8)
      .map(h => ({
        type: 'history',
        title: h.title || h.url,
        url: h.url,
      }));
    if (historySuggestions.length === 0) {
      return [{ type: 'search', title: `Поиск: ${query}`, url: null }];
    }
    return historySuggestions;
  });

  ipcMain.on("open-url", (event, url) => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.view.webContents.loadURL(url);
      tab.url = url;
      mainWindow.webContents.send("update-url", url);
      syncTabsToRenderer();
    }
  });

  ipcMain.on("go-back", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      if (tab.view.webContents.canGoBack()) tab.view.webContents.goBack();
    }
  });

  ipcMain.on("go-forward", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      if (tab.view.webContents.canGoForward()) tab.view.webContents.goForward();
    }
  });

  ipcMain.on("reload", () => {
    if (activeTabId && tabs.has(activeTabId)) {
      const tab = tabs.get(activeTabId);
      tab.view.webContents.reload();
    }
  });

  ipcMain.on("go-home", () => {
    const homeUrl = getHomeUrl();
    createTab(homeUrl);
    syncTabsToRenderer();
  });

  ipcMain.on("window:minimize", () => mainWindow.minimize());
  ipcMain.on("window:maximize", () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on("window:close", () => mainWindow.close());

  ipcMain.on("open-dev-tools", () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // --- НАСТРОЙКИ (справа) ---
  ipcMain.on("toggle-settings", (event, show) => {
    settingsOverlayVisible = (show !== undefined) ? show : !settingsOverlayVisible;
    mainWindow.webContents.send("settings-toggle", settingsOverlayVisible);
    updateViewBounds(suggestVisibleHeight);
  });

  // --- ПОДСКАЗКИ ---
  ipcMain.on("update-suggest-height", (event, height) => {
    suggestVisibleHeight = height;
    updateViewBounds(suggestVisibleHeight);
  });
}

// ============================================================
//  ВКЛАДКИ
// ============================================================
function createTab(url, switchToNew = true) {
  const tabId = ++tabCounter;

  if (!url || url === '' || url === 'about:blank') {
    url = getHomeUrl();
  }

  if (url === 'kodium://passwords') {
    return createPasswordsTab(tabId, switchToNew);
  }
  if (url === 'kodium://history') {
    return createHistoryTab(tabId, switchToNew);
  }

  const view = new WebContentsView({
    webPreferences: {
      plugins: true,
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:browser',
      javascript: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  view.webContents.setWindowOpenHandler(({ url }) => {
    createTab(url);
    return { action: 'deny' };
  });

  const tab = {
    id: tabId,
    view: view,
    url: url,
    title: 'Новая вкладка',
    isLoading: false,
    isSpecial: false,
  };

  tabs.set(tabId, tab);
  mainWindow.contentView.addChildView(view);

  const bounds = mainWindow.getContentBounds();
  view.setBounds({
    x: 0,
    y: TOOLBAR_HEIGHT,
    width: bounds.width,
    height: bounds.height - TOOLBAR_HEIGHT,
  });

  view.webContents.loadURL(url).catch(err => console.warn('Ошибка загрузки:', err));
  setupTabEvents(tabId);

  if (switchToNew) switchTab(tabId);
  return tabId;
}

function closeTab(tabId) {
  const tab = tabs.get(tabId);
  if (!tab) return false;

  try {
    if (tab.view && tab.view.webContents) {
      mainWindow.contentView.removeChildView(tab.view);
      tab.view.webContents.close();
    }
  } catch (error) {}

  tabs.delete(tabId);

  if (tabId === activeTabId) {
    const remainingTabs = Array.from(tabs.keys());
    if (remainingTabs.length > 0) {
      switchTab(remainingTabs[0]);
    }
  }

  return true;
}

function switchTab(tabId) {
  if (!tabs.has(tabId)) return false;

  tabs.forEach((tab) => {
    if (tab.view) {
      tab.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  });

  const tab = tabs.get(tabId);
  if (!tab) return false;

  activeTabId = tabId;

  const bounds = mainWindow.getContentBounds();
  const offsetY = suggestVisibleHeight > 0 ? suggestVisibleHeight : 0;
  tab.view.setBounds({
    x: 0,
    y: TOOLBAR_HEIGHT + offsetY,
    width: bounds.width - (settingsOverlayVisible ? SETTINGS_WIDTH : 0),
    height: bounds.height - TOOLBAR_HEIGHT - offsetY,
  });

  mainWindow.webContents.send("update-url", tab.url);
  mainWindow.setTitle(tab.title || 'AlphaZ');
  return true;
}

// ============================================================
//  СОБЫТИЯ ВКЛАДКИ
// ============================================================
function setupTabEvents(tabId) {
  const tab = tabs.get(tabId);
  if (!tab) return;

  const webContents = tab.view.webContents;

  webContents.on('did-start-loading', () => {
    tab.isLoading = true;
    mainWindow.webContents.send("loading-status", true);
    syncTabsToRenderer();
  });

  webContents.on('did-stop-loading', () => {
    tab.isLoading = false;
    mainWindow.webContents.send("loading-status", false);
    syncTabsToRenderer();
  });

  webContents.on('did-finish-load', () => {
    tab.isLoading = false;
    const url = webContents.getURL();
    tab.url = url;
    mainWindow.webContents.send("loading-status", false);

    webContents.executeJavaScript('document.title')
      .then(title => {
        if (title) {
          tab.title = title;
          if (tabId === activeTabId) {
            mainWindow.setTitle(title);
            mainWindow.webContents.send("update-url", url);
          }
          syncTabsToRenderer();
        }
        addHistoryEntry(url, title || url);
      })
      .catch(() => {
        addHistoryEntry(url, url);
      });

    if (tabId === activeTabId) {
      mainWindow.webContents.send("update-url", url);
    }
    syncTabsToRenderer();
  });

  webContents.on('did-navigate', (event, url) => {
    tab.url = url;
    if (tabId === activeTabId) {
      mainWindow.webContents.send("update-url", url);
    }
    syncTabsToRenderer();

    webContents.executeJavaScript('document.title')
      .then(title => {
        if (title) {
          tab.title = title;
          if (tabId === activeTabId) {
            mainWindow.setTitle(title);
          }
          syncTabsToRenderer();
        }
        addHistoryEntry(url, title || url);
      })
      .catch(() => {
        addHistoryEntry(url, url);
      });
  });

  webContents.on('did-navigate-in-page', (event, url) => {
    tab.url = url;
    if (tabId === activeTabId) {
      mainWindow.webContents.send("update-url", url);
    }
    syncTabsToRenderer();

    webContents.executeJavaScript('document.title')
      .then(title => {
        if (title) {
          tab.title = title;
          if (tabId === activeTabId) {
            mainWindow.setTitle(title);
          }
          syncTabsToRenderer();
        }
        addHistoryEntry(url, title || url);
      })
      .catch(() => {
        addHistoryEntry(url, url);
      });
  });

  webContents.on('page-title-updated', (event, title) => {
    if (title) {
      tab.title = title;
      if (tabId === activeTabId) {
        mainWindow.setTitle(title);
      }
      syncTabsToRenderer();
    }
  });

  webContents.setWindowOpenHandler(({ url }) => {
    createTab(url);
    return { action: 'deny' };
  });
}

// ============================================================
//  СПЕЦИАЛЬНЫЕ СТРАНИЦЫ
// ============================================================

function createPasswordsTab(tabId, switchToNew) {
  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  view.webContents.setWindowOpenHandler(({ url }) => {
    createTab(url);
    return { action: 'deny' };
  });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Пароли</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:Arial,sans-serif; background:#f5f7fa; padding:30px; }
h1 { color:#202124; margin-bottom:20px; }
.password-item { background:white; padding:15px; border-radius:8px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1); display:flex; justify-content:space-between; align-items:center; }
.password-item .info { display:flex; flex-direction:column; gap:4px; }
.password-item .url { color:#1a73e8; font-weight:500; }
.password-item .username { color:#5f6368; font-size:14px; }
.password-item .password { color:#5f6368; font-size:14px; font-family:monospace; }
.delete-btn { background:#e81123; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; }
.delete-btn:hover { background:#c00; }
.empty { color:#5f6368; text-align:center; padding:40px; }
.back-btn { background:#1a73e8; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; margin-bottom:20px; }
.back-btn:hover { background:#1557b0; }
</style></head>
<body>
<button class="back-btn" onclick="closeCurrentTab()">← Назад</button>
<h1>🔑 Сохранённые пароли</h1>
<div id="passwords-list"></div>
<script>
const { electronAPI } = window;

function closeCurrentTab() {
  electronAPI.closeCurrentTab();
}

async function loadPasswords() {
  const passwords = await electronAPI.getPasswords();
  const list = document.getElementById('passwords-list');
  if (passwords.length === 0) {
    list.innerHTML = '<div class="empty">Нет сохранённых паролей</div>';
    return;
  }
  list.innerHTML = passwords.map(p => \`
    <div class="password-item">
      <div class="info">
        <div class="url">\${p.url}</div>
        <div class="username">👤 \${p.username}</div>
        <div class="password">🔒 \${'•'.repeat(p.password.length)}</div>
      </div>
      <button class="delete-btn" onclick="deletePassword('\${p.url}', '\${p.username}')">Удалить</button>
    </div>
  \`).join('');
}
async function deletePassword(url, username) {
  if (confirm('Удалить пароль для ' + url + '?')) {
    await electronAPI.deletePassword(url, username);
    loadPasswords();
  }
}
loadPasswords();
</script>
</body></html>`;

  view.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  const tab = {
    id: tabId,
    view: view,
    url: 'kodium://passwords',
    title: 'Пароли',
    isLoading: false,
    isSpecial: true,
  };

  tabs.set(tabId, tab);
  mainWindow.contentView.addChildView(view);
  const bounds = mainWindow.getContentBounds();
  view.setBounds({
    x: 0,
    y: TOOLBAR_HEIGHT,
    width: bounds.width,
    height: bounds.height - TOOLBAR_HEIGHT,
  });

  if (switchToNew) switchTab(tabId);
  return tabId;
}

// ============================================================
//  СТРАНИЦА ИСТОРИИ
// ============================================================
function createHistoryTab(tabId, switchToNew) {
  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  view.webContents.setWindowOpenHandler(({ url }) => {
    createTab(url);
    return { action: 'deny' };
  });

  view.webContents.loadFile("history.html");

  const tab = {
    id: tabId,
    view: view,
    url: 'kodium://history',
    title: 'История',
    isLoading: false,
    isSpecial: true,
  };

  tabs.set(tabId, tab);
  mainWindow.contentView.addChildView(view);
  const bounds = mainWindow.getContentBounds();
  view.setBounds({
    x: 0,
    y: TOOLBAR_HEIGHT,
    width: bounds.width,
    height: bounds.height - TOOLBAR_HEIGHT,
  });

  if (switchToNew) switchTab(tabId);
  return tabId;
}

app.whenReady().then(() => {
  app.commandLine.appendSwitch('enable-features', 'NetworkService');
  createWindow();
});

app.on("window-all-closed", () => {
  saveSettings();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    loadSettings();
    createWindow();
  }
});