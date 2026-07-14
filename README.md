**Russian**

# 🌐 AlphaZ Browser

> Легкий, быстрый и безопасный браузер на Electron

![AlphaZ Browser](https://img.shields.io/badge/AlphaZ-Browser-blue?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-42.5.0-47848f?style=flat-square&logo=electron)
![Node.js](https://img.shields.io/badge/Node.js-22.12.0-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

---

## 📖 О проекте

**AlphaZ Browser** — полноценный веб-браузер на базе [Electron](https://electronjs.org/).  
Создан с нуля как лёгкая, быстрая и безопасная альтернатива существующим браузерам.

> ⚠️ **Проект на ранней стадии.** Некоторые функции могут работать нестабильно или отсутствовать.  
> Я только начинаю свой путь в разработке браузеров!

---

## 🚀 Особенности

### ✅ Уже работает:
- 🚀 **Быстрый старт** — запускается за доли секунды
- 📑 **Вкладки** — как в обычных браузерах
- 🔍 **Умный поиск** — подсказки при вводе (Яндекс)
- 🎨 **Темы оформления** — светлая, тёмная (классическая/современная), свой цвет
- 🔧 **Настройки** — удобная панель справа
- 🖥️ **Полноэкранный режим** — по нажатию F11
- 📦 **Сохранение сессии** — вкладки восстанавливаются при запуске
- 📜 **История посещений** — сохраняется в `history.json`, отображается в отдельной вкладке
- 📥 **Скачивание файлов** — с уведомлениями о прогрессе
- 🖼️ **Иконка приложения** — для EXE, установщика и панели задач
- 🏗️ **Профессиональный сборщик** — `build.bat` с красивым интерфейсом
- 📦 **Установщик NSIS** — `.exe` для простой установки

### 🔨 В разработке / Требуется доработка:
- 🔐 **Менеджер паролей** — сохранение и автозаполнение паролей (база работает, требуется улучшение)
- 🌍 **Расширения** — поддержка Chrome-расширений (планируется)
- 🧹 **Очистка кеша** — работает частично

### 💡 Запланировано:
- 🎯 Перетаскивание вкладок
- 📚 Закладки
- 🖱️ Контекстное меню
- 📱 Режим чтения
- 🖼️ Скриншоты страниц

---

## 📦 Установка

### 🔹 Для пользователей

1. Скачайте последний релиз с [GitHub Releases](https://github.com/seregashvetzov501-code/AlphaZBrowser/releases)
2. Запустите `AlphaZ Browser Setup <версия>.exe`
3. Следуйте инструкциям установщика
4. Запускайте браузер с рабочего стола или из меню «Пуск»

> **Или используйте портативную версию:**  
> Распакуйте `AlphaZ Browser.zip` (или папку `win-unpacked`) и запустите `AlphaZ Browser.exe`.

### 🔹 Для разработчиков

# Клонируйте репозиторий
git clone https://github.com/seregashvetzov501-code/AlphaZBrowser.git

# Перейдите в папку проекта
cd AlphaZBrowser

# Установите зависимости
npm install

# Запустите браузер в режиме разработки
npm start

# Соберите EXE-установщик
npm run build
Скрипты для сборки и установки:

install.bat — установка зависимостей (для разработчиков)

build.bat — профессиональная сборка EXE-установщика

🛠️ Используемые технологии
Electron — фреймворк для десктопных приложений

Node.js — среда выполнения JavaScript

WebContentsView — современный способ встраивания веб-страниц

IPC — межпроцессное взаимодействие

🗂️ Структура проекта
text
AlphaZBrowser/
├── main.js                # Ядро браузера (основной процесс)
├── preload.js             # Безопасный мост между процессами
├── renderer.js            # UI логика (вкладки, навигация, настройки)
├── index.html             # Главный интерфейс
├── style.css              # Стили
├── history.html           # Страница истории
├── history.css            # Стили страницы истории
├── icon.ico               # Иконка приложения
├── package.json           # Зависимости и скрипты
├── install.bat            # Установка зависимостей (для разработчиков)
├── start.bat              # Запуск в режиме разработки
└── build.bat              # Профессиональная сборка EXE
🎮 Управление
Действие	Описание
Кнопка "+"	Создать новую вкладку
🏠 (Домой)	Открыть домашнюю страницу
◀ / ▶	Назад / Вперёд по истории
⟳	Обновить страницу
⚙️	Открыть настройки
F11	Полноэкранный режим
Ctrl+Shift+I	DevTools (в отдельном окне)
🔧 Настройки
Доступные настройки в правой панели:

Поисковая система — Яндекс, Google, DuckDuckGo, Bing

Тема оформления — Светлая, Тёмная (классическая), Тёмная (современная), Свой цвет

Очистка кеша — удаление сохранённых данных

🤝 Как помочь проекту
Я рад каждому, кто готов помочь с разработкой! Это мой первый серьёзный проект, и любая помощь бесценна.

🐛 Сообщить об ошибке — создайте Issue с описанием и скриншотом

💡 Предложить идею — откройте Issue с пометкой enhancement

🔧 Написать код — сделайте форк и предложите изменения через Pull Request

📢 Рассказать о проекте — поделитесь ссылкой в соцсетях

🧑‍💻 Хотите присоединиться к разработке?
Если вы знаете JavaScript / Electron или просто хотите научиться создавать десктопные приложения — буду рад любой помощи!

📧 Email: seregashvetzov310@gmail.com

💬 Telegram: @seregashvetzov

🐛 Issues: GitHub Issues

🔥 Что нужно доделать прямо сейчас
Задача	Статус
🔐 Менеджер паролей — сохранение и автозаполнение	⚠️ Требуется доработка
📜 История посещений — поиск и фильтрация	⚠️ Требуется доработка
🎯 Перетаскивание вкладок	❌ Не реализовано
🐛 Исправление багов	⚠️ В процессе
🌍 Поддержка расширений	❌ Планируется
📜 Лицензия
Проект распространяется под лицензией ISC.

⭐ Понравился проект?
Поставьте звезду на GitHub — это помогает проекту развиваться!

https://img.shields.io/github/stars/seregashvetzov501-code/AlphaZBrowser?style=social

🙏 Благодарности
Спасибо всем, кто помогает с разработкой и тестированием!

Сделано с ❤️ для всех любителей браузеров

Я только начинаю свой путь, но буду рад каждой помощи!


### ✅ Что изменилось

|                    Было                       |                    Стало                         |
|-----------------------------------------------|--------------------------------------------------|
| Запуск через `start.bat`                      | Запуск через `.exe` (установщик или портативный) |
| Упоминание `.bat` как основного способа       | `.bat` только для разработчиков и сборки         |
| Акцент на разработку                          | Акцент на готовый продукт для пользователей      |

Теперь README полностью соответствует текущему состоянию: **браузер запускается через EXE**. 🔥


**English**

# 🌐 AlphaZ Browser

> Easy, fast and secure browser on Electron

![AlphaZ Browser](https://img.shields.io/badge/AlphaZ-Browser-blue?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-42.5.0-47848f?style=flat-square&logo=electron)
![Node.js](https://img.shields.io/badge/Node.js-22.12.0-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

---

## 📖 About the project

**AlphaZ Browser** — a full-fledged web browser based on [Electron](https://electronjs.org /).  
It was created from scratch as an easy, fast and secure alternative to existing browsers.

> ⚠️ **The project is at an early stage.** Some functions may be unstable or missing.  
> I'm just starting my career in browser development!

---

## 🚀 Features

### ✅ It's already working:
- **Quick Start** — starts in a split second
- 📑 **Tabs** — as in regular browsers
- 🔍 **Smart Search** — input hints (Yandex)
- 🎨 **Design themes** — light, dark (classic/modern), its own color
- 🔧 **Settings** — convenient panel on the right
- 🖥️ **Full—screen mode** - by pressing F11
- 📦 **Session Saving** — tabs are restored at startup
- 📜 **Session history** — is saved in `history.json`, displayed in a separate tab
- 📥 **Downloading files** — with progress notifications
- 🖼️ **Application icon** — for EXE, installer and taskbar
- 🏗️ **Professional assembler** — `build.bat` with a beautiful interface
- 📦 **NSIS Installer** — `.exe` for easy installation

### 🔨 In development / Needs revision:
- 🔐 **Password Manager** — saving and auto-completing passwords (the database is working, improvement is required)
- 🌍 **Extensions** — support for Chrome extensions (planned)
- 🧹 **Clearing the cache** — partially works

### 💡 Planned:
- 🎯 Dragging tabs
- 📚 Bookmarks
- 🖱️ Context menu
- 📱 Reading mode
- 🖼️ Screenshots of the pages

---

## , Installation

### 🔹 For users

1. Download the latest release from [GitHub Releases](https://github.com/seregashvetzov501-code/AlphaZBrowser/releases )
2. Run `AlphaZ Browser Setup <version>.exe`
3. Follow the instructions of the installer
4. Launch the browser from the desktop or from the Start menu

> **Or use the portable version:**  
> Unpack the AlphaZ Browser.zip` (or the `win-unpacked` folder) and run `AlphaZ Browser.exe `.

### 🔹 For developers

# Clone the repository
git clone https://github.com/seregashvetzov501-code/AlphaZBrowser.git

# Go to
the AlphaZBrowser cd project folder

#
Install npm install dependencies

# Launch the browser in
npm start development mode

#
Build the npm run build EXE installer
Scripts for assembly and installation:

install.bat — installing dependencies (for developers)

build.bat — professional assembly of the EXE installer

, Technologies used
Electron — a framework for desktop applications

Node.js — JavaScript runtime environment

WebContentsView is a modern way of embedding web pages

IPC — interprocess communication

, Project structure
text
AlphaZBrowser/
├── main.js # Browser core (main process)
├── preload.js# Secure bridge between processes
├── renderer.js # UI logic (tabs, navigation, settings)
,── index.html # Main interface
,── style.css # Styles
,── history.html # History page
,── history.css # Styles of the history page
,── icon.ico # Application icon
├── package.json # Dependencies and Scripts
├── install.bat # Installing dependencies (for developers)
├── start.bat # Running in development mode
└── build.bat # Professional EXE assembly
, Management
Action Description
The "+" button To create a new tab
🏠 (Home)	Open the home page
◀ / ▶	Back / Forward through history
, Refresh the page
, Open Settings
F11 Full-screen mode
Ctrl+Shift+I DevTools (in a separate window)
🔧 Settings
Available settings in the right panel:

Search engine Yandex, Google, DuckDuckGo, Bing

The design theme is Light, Dark (classic), Dark (modern), and its own color.

Clearing the cache — deleting saved data

How to help the project
I am glad to see everyone who is ready to help with the development! This is my first serious project, and any help is invaluable.

, Report an error — create an Issue with a description and screenshot

, Suggest an idea — open an Issue marked enhancement

, Write code — make a fork and propose changes via a Pull Request

, Tell us about the project — share the link on social networks

🧑‍💻 Would you like to join the development?
If you know JavaScript / Electron or just want to learn how to create desktop applications, I will be glad of any help!

📧 Email: seregashvetzov310@gmail.com

💬 Telegram: @seregashvetzov

🐛 Issues: GitHub Issues

What needs to be completed right now
Task Status
🔐 Password Manager — saving and auto - completion ⚠️ Modification required
📜 Browsing history — search and filtering ⚠️ Needs to be improved
, Dragging tabs Not implemented
🐛 Bug fixes ⚠️ In progress
, Extension support , Planned
📜 License
The project is distributed under the ISC license.

 Did you like the project?
Put a star on GitHub — it helps the project to develop!

https://img.shields.io/github/stars/seregashvetzov501-code/AlphaZBrowser?style=social

, Thanks
Thanks to everyone who helps with development and testing!

Made with ❤️ for all browser lovers

I am just starting my journey, but I will be glad of any help!


### ✅ What has changed

|                    Was                        |                     Became                       |
|-----------------------------------------------|--------------------------------------------------|
| Launch via `start.bat`                        | Launch via `.exe' (installer or portable)        |
| Mention `.bat` as the main method             | `.bat` is only for developers and builds         |
| Focus on development                          | Focus on the finished product for users          |

Now the README is fully consistent with the current state: **the browser is launched via EXE**. 🔥
