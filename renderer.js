console.log('🔍 RENDERER: started');

if (!window.electronAPI) {
  console.error('❌ electronAPI не определён!');
  alert('Ошибка загрузки API. Смотрите консоль (Ctrl+Shift+I)');
}

const api = window.electronAPI;

// --- Элементы DOM ---
const urlBar = document.getElementById('url-bar');
const goBtn = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');
const homeBtn = document.getElementById('home-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const settingsCloseBtnBottom = document.getElementById('settings-close-btn-bottom');
const tabsList = document.getElementById('tabs-list');
const newTabBtn = document.getElementById('new-tab-btn');
const historyBtn = document.getElementById('history-btn');
const passwordsBtn = document.getElementById('passwords-btn');
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const closeBtn = document.getElementById('close-btn');
const searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const cacheStatus = document.getElementById('cache-status');
const themeRadios = document.querySelectorAll('input[name="theme"]');
const customThemeContainer = document.getElementById('custom-theme-container');
const applyCustomThemeBtn = document.getElementById('apply-custom-theme');
const themeToolbarColor = document.getElementById('theme-toolbar-color');
const themeTabColor = document.getElementById('theme-tab-color');
const themeAccentColor = document.getElementById('theme-accent-color');

// ============================================================
//  1. ЕДИНЫЙ МЕНЕДЖЕР НАСТРОЕК
// ============================================================
const SettingsManager = {
  _data: {
    searchEngine: 'yandex',
    theme: 'light',
    customTheme: null,
  },

  load() {
    try {
      this._data.searchEngine = localStorage.getItem('searchEngine') || 'yandex';
      this._data.theme = localStorage.getItem('theme') || 'light';
      const custom = localStorage.getItem('theme-custom');
      this._data.customTheme = custom ? JSON.parse(custom) : null;
      console.log('📂 Настройки загружены:', this._data);
    } catch (e) {
      console.warn('⚠️ Ошибка загрузки настроек:', e);
    }
    return this._data;
  },

  save() {
    try {
      localStorage.setItem('searchEngine', this._data.searchEngine);
      localStorage.setItem('theme', this._data.theme);
      if (this._data.customTheme) {
        localStorage.setItem('theme-custom', JSON.stringify(this._data.customTheme));
      } else {
        localStorage.removeItem('theme-custom');
      }
      console.log('💾 Настройки сохранены:', this._data);
    } catch (e) {
      console.warn('⚠️ Ошибка сохранения настроек:', e);
    }
  },

  apply() {
    this._applySearchEngine();
    this._applyTheme();
    this.syncUI();
    console.log('🎨 Настройки применены');
  },

  _applySearchEngine() {
    window.__currentSearchEngine = this._data.searchEngine;
  },

  _applyTheme() {
    const themeName = this._data.theme;
    const customTheme = this._data.customTheme;

    if (themeName === 'custom' && customTheme) {
      this._applyCustomThemeToCSS(customTheme);
    } else {
      const theme = THEMES[themeName];
      if (theme) {
        this._applyThemeToCSS(theme);
      } else {
        this._applyThemeToCSS(THEMES.light);
      }
    }
  },

  _applyThemeToCSS(theme) {
    const root = document.documentElement;
    root.style.setProperty('--toolbar-bg', theme.toolbar);
    root.style.setProperty('--tab-bg', theme.tab);
    root.style.setProperty('--tab-active-bg', theme.tabActive);
    root.style.setProperty('--tab-hover-bg', theme.tabHover);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--border-color', theme.border);
    root.style.setProperty('--urlbar-bg', theme.urlBarBg);
    root.style.setProperty('--urlbar-text', theme.urlBarText);
    root.style.setProperty('--urlbar-border', theme.urlBarBorder);
  },

  _applyCustomThemeToCSS(customTheme) {
    const root = document.documentElement;
    root.style.setProperty('--toolbar-bg', customTheme.toolbar);
    root.style.setProperty('--tab-bg', customTheme.tab);
    root.style.setProperty('--tab-active-bg', customTheme.tabActive);
    root.style.setProperty('--tab-hover-bg', customTheme.tabHover);
    root.style.setProperty('--text-color', customTheme.text || '#202124');
    root.style.setProperty('--text-secondary', customTheme.textSecondary || '#5f6368');
    root.style.setProperty('--accent-color', customTheme.accent);
    root.style.setProperty('--border-color', customTheme.border || '#dadce0');
    root.style.setProperty('--urlbar-bg', customTheme.urlBarBg || '#f5f7fa');
    root.style.setProperty('--urlbar-text', customTheme.urlBarText || '#202124');
    root.style.setProperty('--urlbar-border', customTheme.urlBarBorder || '#dadce0');
  },

  syncUI() {
    searchEngineRadios.forEach(radio => {
      radio.checked = radio.value === this._data.searchEngine;
    });

    themeRadios.forEach(radio => {
      radio.checked = radio.value === this._data.theme;
      if (radio.value === 'custom' && this._data.theme === 'custom') {
        radio.checked = true;
        customThemeContainer.style.display = 'block';
      }
    });

    if (this._data.customTheme) {
      themeToolbarColor.value = this._data.customTheme.toolbar || '#f1f3f4';
      themeTabColor.value = this._data.customTheme.tab || '#e8eaed';
      themeAccentColor.value = this._data.customTheme.accent || '#1a73e8';
    }
  },

  get searchEngine() {
    return this._data.searchEngine;
  },
  get theme() {
    return this._data.theme;
  },
  get homeUrl() {
    const engines = {
      yandex: 'https://ya.ru',
      google: 'https://www.google.com',
      duckduckgo: 'https://duckduckgo.com',
      bing: 'https://www.bing.com'
    };
    return engines[this._data.searchEngine] || 'https://ya.ru';
  },
  get searchUrl() {
    const engines = {
      yandex: 'https://yandex.ru/search/?text=',
      google: 'https://www.google.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      bing: 'https://www.bing.com/search?q='
    };
    return engines[this._data.searchEngine] || 'https://yandex.ru/search/?text=';
  },

  setSearchEngine(value) {
    if (value && value !== this._data.searchEngine) {
      this._data.searchEngine = value;
      this.save();
      this._applySearchEngine();
      this.syncUI();
      console.log(`🔍 Поисковик сохранён: ${value}`);
      return true;
    }
    return false;
  },

  setTheme(value) {
    if (value && value !== this._data.theme) {
      this._data.theme = value;
      if (value !== 'custom') {
        this._data.customTheme = null;
      }
      this.save();
      this._applyTheme();
      this.syncUI();
      console.log(`🎨 Тема изменена на: ${value}`);
      return true;
    }
    return false;
  },

  setCustomTheme(customTheme) {
    this._data.theme = 'custom';
    this._data.customTheme = customTheme;
    this.save();
    this._applyTheme();
    this.syncUI();
    console.log('🎨 Пользовательская тема применена');
    return true;
  },
};

// ============================================================
//  2. ТЕМЫ
// ============================================================
const THEMES = {
  'dark-classic': {
    toolbar: '#2d2d2d',
    tab: '#3d3d3d',
    tabActive: '#4d4d4d',
    tabHover: '#4a4a4a',
    text: '#e0e0e0',
    textSecondary: '#b0b0b0',
    accent: '#666',
    border: '#444',
    urlBarBg: '#3d3d3d',
    urlBarText: '#e0e0e0',
    urlBarBorder: '#555',
  },
  'dark-modern': {
    toolbar: '#1e1e2e',
    tab: '#2a2a3e',
    tabActive: '#313156',
    tabHover: '#35355a',
    text: '#cdd6f4',
    textSecondary: '#a6adc8',
    accent: '#89b4fa',
    border: '#313156',
    urlBarBg: '#313156',
    urlBarText: '#cdd6f4',
    urlBarBorder: '#45457a',
  },
  'light': {
    toolbar: '#f1f3f4',
    tab: '#e8eaed',
    tabActive: '#ffffff',
    tabHover: '#dadce0',
    text: '#202124',
    textSecondary: '#5f6368',
    accent: '#1a73e8',
    border: '#dadce0',
    urlBarBg: '#f5f7fa',
    urlBarText: '#202124',
    urlBarBorder: '#dadce0',
  },
};

// ============================================================
//  3. ФУНКЦИИ
// ============================================================
function formatInput(input) {
  input = input.trim();
  if (!input) return null;
  if (/^https?:\/\//i.test(input)) return input;
  if (/\./.test(input) && !/\s/.test(input)) return `https://${input}`;
  return `${SettingsManager.searchUrl}${encodeURIComponent(input)}`;
}

function getHomeUrl() {
  return SettingsManager.homeUrl;
}

function showNotification(text) {
  const oldNotify = document.getElementById('temp-notification');
  if (oldNotify) oldNotify.remove();
  
  const notify = document.createElement('div');
  notify.id = 'temp-notification';
  notify.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--tab-active-bg);
    color: var(--text-color);
    padding: 12px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 999999;
    font-size: 14px;
    border: 1px solid var(--border-color);
    animation: fadeInUp 0.3s ease;
  `;
  notify.textContent = text;
  document.body.appendChild(notify);
  
  setTimeout(() => {
    notify.style.opacity = '0';
    notify.style.transition = 'opacity 0.3s';
    setTimeout(() => notify.remove(), 300);
  }, 2000);
}

// ============================================================
//  4. РЕНДЕРИНГ ВКЛАДОК
// ============================================================
function renderTabs(tabsData) {
  tabsList.innerHTML = '';
  tabsData.forEach((tab) => {
    const tabElement = document.createElement('div');
    tabElement.className = `tab${tab.isActive ? ' active' : ''}`;
    tabElement.dataset.tabId = tab.id;
    const titleSpan = document.createElement('span');
    titleSpan.className = 'tab-title';
    titleSpan.textContent = tab.title || 'Новая вкладка';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      api.closeTab(tab.id);
    });
    tabElement.appendChild(titleSpan);
    tabElement.appendChild(closeBtn);
    tabElement.addEventListener('click', () => {
      api.switchTab(tab.id);
    });
    tabsList.appendChild(tabElement);
  });
  const activeTab = tabsList.querySelector('.tab.active');
  if (activeTab) {
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

// ============================================================
//  5. ИСТОРИЯ (отображение)
// ============================================================
let historyEntries = [];

function updateHistoryDisplay() {
  const historyList = document.getElementById('history-list');
  if (historyList) {
    renderHistoryList(historyList);
  }
  console.log(`📜 Загружено ${historyEntries ? historyEntries.length : 0} записей истории`);
}

function renderHistoryList(container) {
  if (!container) return;
  
  if (!historyEntries || historyEntries.length === 0) {
    container.innerHTML = `
      <div class="empty" style="text-align:center;padding:40px;color:#5f6368;">
        📭 История пуста
      </div>
    `;
    return;
  }
  
  container.innerHTML = historyEntries.map((h, index) => `
    <div class="history-item" style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid #e8eaed;
      cursor: pointer;
      transition: background 0.15s;
    " onclick="window.electronAPI.openURL('${h.url}')">
      <div>
        <div style="font-weight:500;color:#202124;">${h.title || h.url}</div>
        <div style="font-size:13px;color:#1a73e8;">${h.url}</div>
      </div>
      <div style="font-size:12px;color:#5f6368;">
        ${h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}
      </div>
    </div>
  `).join('');
  
  // Добавляем стиль при наведении, если ещё нет
  if (!document.getElementById('history-style')) {
    const style = document.createElement('style');
    style.id = 'history-style';
    style.textContent = `
      .history-item:hover {
        background: #f1f3f4;
      }
    `;
    document.head.appendChild(style);
  }
}

api.onHistoryUpdate((history) => {
  historyEntries = history || [];
  updateHistoryDisplay();
});

// ============================================================
//  6. ПОДСКАЗКИ ПОИСКА
// ============================================================
let suggestTimeout = null;
let currentSuggestions = [];
let suggestVisible = false;

function showSuggestPanel() {
  suggestVisible = true;
  api.toggleSuggest(true);
}

function hideSuggestPanel() {
  suggestVisible = false;
  api.toggleSuggest(false);
  api.updateSuggestHeight(0);
}

api.onSuggestToggle((show) => {
  suggestVisible = show;
});

const suggestContainer = document.createElement('div');
suggestContainer.id = 'suggest-container';
suggestContainer.addEventListener('mousedown', (e) => e.preventDefault());

const urlBarWrapper = urlBar.parentElement;
urlBarWrapper.style.position = 'relative';
urlBarWrapper.appendChild(suggestContainer);

async function fetchSuggestions(query) {
  if (!query || query.length < 1) {
    suggestContainer.style.display = 'none';
    hideSuggestPanel();
    return;
  }

  try {
    const historySuggestions = await api.getSuggestions(query);
    
    let yandexSuggestions = [];
    try {
      const url = `https://suggest.yandex.ru/suggest-ff.cgi?part=${encodeURIComponent(query)}&v=4&sn=5&srv=ru&uil=ru`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data[1] && data[1].length > 0) {
        yandexSuggestions = data[1].slice(0, 5).map(s => ({
          type: 'suggest',
          title: s,
          url: null,
        }));
      }
    } catch (e) {}

    let allSuggestions = [];
    if (historySuggestions && historySuggestions.length > 0) {
      const filteredHistory = historySuggestions.filter(s => s.type !== 'search');
      allSuggestions.push(...filteredHistory.slice(0, 5));
    }
    allSuggestions.push(...yandexSuggestions.slice(0, 5));
    
    const uniqueResults = [];
    const seen = new Set();
    for (const item of allSuggestions) {
      const key = (item.title || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueResults.push(item);
      }
    }

    currentSuggestions = uniqueResults.slice(0, 10);
    renderSuggestions(currentSuggestions, query);
    
    if (currentSuggestions.length > 0) {
      suggestContainer.style.display = 'block';
      showSuggestPanel();
    } else {
      renderSuggestions([{ type: 'search', title: `🔍 Поиск: ${query}`, url: null }], query);
      suggestContainer.style.display = 'block';
      showSuggestPanel();
    }
  } catch (error) {
    console.warn('Ошибка получения подсказок:', error);
    renderSuggestions([{ type: 'search', title: `🔍 Поиск: ${query}`, url: null }], query);
    suggestContainer.style.display = 'block';
    showSuggestPanel();
  }
}

function renderSuggestions(suggestions, query) {
  suggestContainer.innerHTML = '';
  
  if (!suggestions || suggestions.length === 0) {
    const item = document.createElement('div');
    item.className = 'suggest-item';
    item.innerHTML = `
      <span class="icon">🔍</span>
      <span class="text"><strong>${escapeHtml(query)}</strong></span>
      <span class="hint">поиск</span>
    `;
    item.addEventListener('click', () => {
      urlBar.value = query;
      suggestContainer.style.display = 'none';
      hideSuggestPanel();
      goBtn.click();
    });
    suggestContainer.appendChild(item);
    
    requestAnimationFrame(() => {
      const height = suggestContainer.scrollHeight;
      if (height > 0) {
        api.updateSuggestHeight(height);
      }
    });
    return;
  }

  suggestions.forEach((suggestion) => {
    const item = document.createElement('div');
    item.className = 'suggest-item';
    
    let displayText = escapeHtml(suggestion.title || '');
    const lowerQuery = query.toLowerCase();
    const lowerTitle = (suggestion.title || '').toLowerCase();
    const index = lowerTitle.indexOf(lowerQuery);
    
    if (index !== -1 && query.length > 0) {
      const before = escapeHtml((suggestion.title || '').substring(0, index));
      const match = escapeHtml((suggestion.title || '').substring(index, index + query.length));
      const after = escapeHtml((suggestion.title || '').substring(index + query.length));
      displayText = `${before}<strong>${match}</strong>${after}`;
    }
    
    const icon = suggestion.type === 'history' ? '📂' : suggestion.type === 'suggest' ? '💡' : '🔍';
    const urlPart = suggestion.url ? `<span class="url">${escapeHtml(suggestion.url)}</span>` : '';
    
    item.innerHTML = `
      <span class="icon">${icon}</span>
      <span class="text">${displayText}</span>
      ${urlPart}
    `;
    
    item.addEventListener('click', () => {
      if (suggestion.url) {
        urlBar.value = suggestion.url;
        api.openURL(suggestion.url);
      } else {
        urlBar.value = suggestion.title;
        goBtn.click();
      }
      suggestContainer.style.display = 'none';
      hideSuggestPanel();
    });
    
    suggestContainer.appendChild(item);
  });
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      const height = suggestContainer.scrollHeight;
      if (height > 0) {
        api.updateSuggestHeight(height);
      }
    }, 10);
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- Обработчики подсказок ---
urlBar.addEventListener('input', (e) => {
  const val = e.target.value;
  const query = val.trim();
  
  if (val.includes('.') && !val.includes(' ') && !val.startsWith('http')) {
    suggestContainer.style.display = 'none';
    hideSuggestPanel();
    return;
  }
  if (val.startsWith('http://') || val.startsWith('https://')) {
    suggestContainer.style.display = 'none';
    hideSuggestPanel();
    return;
  }
  
  clearTimeout(suggestTimeout);
  suggestTimeout = setTimeout(() => {
    fetchSuggestions(query);
  }, 150);
});

urlBar.addEventListener('focus', (e) => {
  const val = e.target.value.trim();
  if (val.length >= 1 && !val.includes('.') && !val.startsWith('http')) {
    fetchSuggestions(val);
  }
});

urlBar.addEventListener('blur', () => {
  setTimeout(() => {
    suggestContainer.style.display = 'none';
    hideSuggestPanel();
  }, 250);
});

urlBar.addEventListener('keydown', (e) => {
  const items = suggestContainer.querySelectorAll('.suggest-item');
  let activeIndex = -1;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    items.forEach((item, index) => {
      if (item.classList.contains('active')) {
        activeIndex = index;
        item.classList.remove('active');
      }
    });
    const nextIndex = activeIndex + 1 >= items.length ? 0 : activeIndex + 1;
    if (items[nextIndex]) {
      items[nextIndex].classList.add('active');
      items[nextIndex].scrollIntoView({ block: 'nearest' });
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    items.forEach((item, index) => {
      if (item.classList.contains('active')) {
        activeIndex = index;
        item.classList.remove('active');
      }
    });
    const prevIndex = activeIndex - 1 < 0 ? items.length - 1 : activeIndex - 1;
    if (items[prevIndex]) {
      items[prevIndex].classList.add('active');
      items[prevIndex].scrollIntoView({ block: 'nearest' });
    }
  } else if (e.key === 'Enter') {
    const activeItem = suggestContainer.querySelector('.suggest-item.active');
    if (activeItem) {
      e.preventDefault();
      activeItem.click();
    } else {
      suggestContainer.style.display = 'none';
      hideSuggestPanel();
      goBtn.click();
    }
  } else if (e.key === 'Escape') {
    suggestContainer.style.display = 'none';
    hideSuggestPanel();
  }
});

// ============================================================
//  7. ВЫБОР ПОИСКОВИКА
// ============================================================
searchEngineRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      const value = e.target.value;
      
      SettingsManager._data.searchEngine = value;
      api.setSearchEngine(value);
      SettingsManager._applySearchEngine();
      SettingsManager.syncUI();
      
      const engineNames = {
        yandex: 'Яндекс',
        google: 'Google',
        duckduckgo: 'DuckDuckGo',
        bing: 'Bing'
      };
      showNotification(`Поисковик изменён на ${engineNames[value]}`);
      console.log(`🔍 Поисковик сохранён: ${value}`);
      
      closeSettings();
      
      const homeUrls = {
        yandex: 'https://ya.ru',
        google: 'https://www.google.com',
        duckduckgo: 'https://duckduckgo.com',
        bing: 'https://www.bing.com'
      };
      const homeUrl = homeUrls[value] || 'https://ya.ru';
      api.openURL(homeUrl);
      urlBar.value = homeUrl;
    }
  });
});

// ============================================================
//  8. ТЕМЫ
// ============================================================
themeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      const value = e.target.value;
      if (value === 'custom') {
        customThemeContainer.style.display = 'block';
      } else {
        customThemeContainer.style.display = 'none';
        SettingsManager._data.theme = value;
        SettingsManager._data.customTheme = null;
        api.setTheme(value);
        SettingsManager._applyTheme();
        SettingsManager.syncUI();
        showNotification('Тема изменена');
      }
    }
  });
});

if (applyCustomThemeBtn) {
  applyCustomThemeBtn.addEventListener('click', () => {
    const customTheme = {
      toolbar: themeToolbarColor.value,
      tab: themeTabColor.value,
      tabActive: themeTabColor.value,
      tabHover: themeTabColor.value,
      text: '#202124',
      textSecondary: '#5f6368',
      accent: themeAccentColor.value,
      border: '#dadce0',
      urlBarBg: '#f5f7fa',
      urlBarText: '#202124',
      urlBarBorder: '#dadce0',
    };
    SettingsManager._data.theme = 'custom';
    SettingsManager._data.customTheme = customTheme;
    api.setCustomTheme(customTheme);
    SettingsManager._applyTheme();
    SettingsManager.syncUI();
    const customRadio = document.querySelector('input[name="theme"][value="custom"]');
    if (customRadio) customRadio.checked = true;
    customThemeContainer.style.display = 'block';
    showNotification('Пользовательская тема применена');
  });
}

// ============================================================
//  9. ОБНОВЛЕНИЕ НАСТРОЕК ИЗ MAIN
// ============================================================
api.onSettingsChanged((settings) => {
  if (settings) {
    if (settings.searchEngine) {
      SettingsManager._data.searchEngine = settings.searchEngine;
      SettingsManager._applySearchEngine();
    }
    if (settings.theme) {
      SettingsManager._data.theme = settings.theme;
      SettingsManager._data.customTheme = settings.customTheme || null;
      SettingsManager._applyTheme();
    }
    SettingsManager.syncUI();
    console.log('📂 Настройки обновлены из main:', settings);
  }
});

// ============================================================
//  10. КЕШ
// ============================================================
if (clearCacheBtn) {
  clearCacheBtn.addEventListener('click', async () => {
    if (cacheStatus) {
      cacheStatus.textContent = '⏳ Очистка...';
      cacheStatus.style.color = '#f9ab00';
    }
    const result = await api.clearCache();
    if (result && result.success) {
      if (cacheStatus) {
        cacheStatus.textContent = '✅ Кеш очищен!';
        cacheStatus.style.color = '#34a853';
        setTimeout(() => { cacheStatus.textContent = ''; }, 3000);
      }
      showNotification('Кеш очищен');
    } else {
      if (cacheStatus) {
        cacheStatus.textContent = '❌ Ошибка очистки';
        cacheStatus.style.color = '#ea4335';
      }
      showNotification('Ошибка очистки кеша');
    }
  });
}

// ============================================================
//  11. НАСТРОЙКИ (СПРАВА)
// ============================================================
let settingsVisible = false;

function toggleSettings() {
  settingsVisible = !settingsVisible;
  api.toggleSettings(settingsVisible);
  settingsOverlay.classList.toggle('hidden', !settingsVisible);
}

function closeSettings() {
  settingsVisible = false;
  api.toggleSettings(false);
  settingsOverlay.classList.add('hidden');
}

settingsBtn.addEventListener('click', toggleSettings);

if (settingsCloseBtn) {
  settingsCloseBtn.addEventListener('click', closeSettings);
}

if (settingsCloseBtnBottom) {
  settingsCloseBtnBottom.addEventListener('click', closeSettings);
}

settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) closeSettings();
});

api.onSettingsToggle((show) => {
  settingsVisible = show;
  settingsOverlay.classList.toggle('hidden', !show);
});

// ============================================================
//  12. АНИМАЦИЯ ЗАГРУЗКИ
// ============================================================
let isSpinning = false;
function startSpin() {
  if (!isSpinning) {
    isSpinning = true;
    reloadBtn.classList.add('spinning');
  }
}
function stopSpin() {
  isSpinning = false;
  reloadBtn.classList.remove('spinning');
}

// ============================================================
//  13. СОБЫТИЯ ОТ MAIN
// ============================================================
api.onLoadingStatus((isLoading) => {
  if (isLoading) startSpin();
  else stopSpin();
});
api.onUpdateUrl((url) => {
  urlBar.value = url;
});
api.onTabsUpdate((tabsData) => {
  renderTabs(tabsData);
});

// ============================================================
//  14. НАВИГАЦИЯ
// ============================================================
goBtn.addEventListener('click', () => {
  const input = urlBar.value;
  const url = formatInput(input);
  if (url) {
    suggestContainer.style.display = 'none';
    hideSuggestPanel();
    api.openURL(url);
  }
});
backBtn.addEventListener('click', () => api.goBack());
forwardBtn.addEventListener('click', () => api.goForward());
reloadBtn.addEventListener('click', () => api.reload());

homeBtn.addEventListener('click', () => {
  api.goHome();
});

urlBar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    suggestContainer.style.display = 'none';
    hideSuggestPanel();
    goBtn.click();
  }
});

newTabBtn.addEventListener('click', async () => {
  const tabId = await api.createTab();
  console.log('✨ Новая вкладка создана:', tabId);
});

if (historyBtn) {
  historyBtn.addEventListener('click', () => api.openHistory());
}
if (passwordsBtn) {
  passwordsBtn.addEventListener('click', () => api.openPasswords());
}
if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => api.minimizeWindow());
}
if (maximizeBtn) {
  maximizeBtn.addEventListener('click', () => api.maximizeWindow());
}
if (closeBtn) {
  closeBtn.addEventListener('click', () => api.closeWindow());
}

// ============================================================
//  15. DevTools в отдельном окне
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'I') {
    e.preventDefault();
    try {
      if (api.openDevTools) {
        api.openDevTools();
      }
    } catch (err) {
      console.warn('Ошибка открытия DevTools:', err);
    }
  }
});

// ============================================================
//  16. СТАРТ
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const settings = await api.getSettings();
    if (settings) {
      SettingsManager._data.searchEngine = settings.searchEngine || 'yandex';
      SettingsManager._applySearchEngine();
      
      SettingsManager._data.theme = settings.theme || 'light';
      SettingsManager._data.customTheme = settings.customTheme || null;
      SettingsManager._applyTheme();
      SettingsManager.syncUI();
      console.log('📂 Настройки загружены из main:', settings);
    }
  } catch (e) {
    console.warn('⚠️ Ошибка загрузки настроек из main:', e);
  }
  
  try {
    const history = await api.getHistory();
    historyEntries = history || [];
    console.log(`📜 Загружено ${historyEntries.length} записей истории`);
  } catch (e) {
    console.warn('Ошибка загрузки истории:', e);
  }
  
  urlBar.focus();
  console.log('🔍 RENDERER: готов');
  console.log(`🔍 Текущий поисковик: ${SettingsManager.searchEngine}`);
  console.log(`🔍 Текущая тема: ${SettingsManager.theme}`);
});
console.log('🔍 RENDERER: запущен');