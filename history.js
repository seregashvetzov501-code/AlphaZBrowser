console.log('📄 history.js загружен');

// Проверяем API
if (!window.electronAPI) {
  console.error('❌ electronAPI не найден!');
  document.getElementById('history-list').innerHTML =
    '<div class="empty" style="color:red;">❌ Ошибка: API не загружен</div>';
}

const { electronAPI } = window;

// ============================================================
//  ЭЛЕМЕНТЫ
// ============================================================
const historyList = document.getElementById('history-list');
const backBtn = document.getElementById('backBtn');
const clearBtn = document.getElementById('clearBtn');

// ============================================================
//  ФУНКЦИИ
// ============================================================
function renderHistoryList(entries) {
  console.log('📋 renderHistoryList, записей:', entries ? entries.length : 0);

  if (!entries || entries.length === 0) {
    historyList.innerHTML = '<div class="empty">📭 История пуста</div>';
    return;
  }

  historyList.innerHTML = entries.map(h => {
    const title = h.title || h.url || 'Без названия';
    const url = h.url || '';
    const time = h.timestamp ? new Date(h.timestamp).toLocaleString() : '';
    return `
      <div class="history-item" data-url="${url}">
        <div>
          <div class="title">${escapeHtml(title)}</div>
          <div class="url">${escapeHtml(url)}</div>
        </div>
        <div class="time">${time}</div>
      </div>
    `;
  }).join('');

  // Навешиваем обработчики кликов
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.dataset.url;
      if (url && electronAPI.openURL) {
        electronAPI.openURL(url);
      }
    });
  });

  console.log('✅ История отрисована, элементов:', entries.length);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadHistory() {
  console.log('🔄 loadHistory вызван');
  try {
    if (!electronAPI || !electronAPI.getHistory) {
      console.error('❌ electronAPI.getHistory недоступен!');
      return;
    }
    const history = await electronAPI.getHistory();
    console.log('📥 Получена история:', history ? history.length : 0, 'записей');
    renderHistoryList(history);
  } catch (error) {
    console.error('❌ Ошибка загрузки истории:', error);
    historyList.innerHTML = `<div class="empty" style="color:red;">❌ Ошибка: ${error.message}</div>`;
  }
}

async function clearHistory() {
  if (!confirm('Очистить всю историю?')) return;
  try {
    await electronAPI.clearHistory();
    loadHistory();
  } catch (error) {
    console.error('Ошибка очистки истории:', error);
  }
}

function closeCurrentTab() {
  if (electronAPI && electronAPI.closeCurrentTab) {
    electronAPI.closeCurrentTab();
  }
}

// ============================================================
//  СОБЫТИЯ
// ============================================================
backBtn.addEventListener('click', closeCurrentTab);
clearBtn.addEventListener('click', clearHistory);

// Подписка на обновления в реальном времени
if (electronAPI && electronAPI.onHistoryUpdate) {
  console.log('📡 Подписка на onHistoryUpdate');
  electronAPI.onHistoryUpdate((history) => {
    console.log('📡 Обновление истории:', history ? history.length : 0, 'записей');
    renderHistoryList(history);
  });
} else {
  console.warn('⚠️ onHistoryUpdate недоступен');
}

// ============================================================
//  СТАРТ
// ============================================================
loadHistory();
console.log('📄 history.js готов');