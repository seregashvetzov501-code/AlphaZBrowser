@echo off
chcp 65001 > nul
title Установка AlphaZ Browser

echo ========================================
echo     ALPHAZ BROWSER - УСТАНОВКА
echo ========================================
echo.
echo [1/4] Проверка наличия Node.js...
echo.

:: Проверяем, установлен ли Node.js
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo [ВНИМАНИЕ] Node.js не найден!
    echo.
    echo Начинаю автоматическую установку Node.js...
    echo.
    
    :: Определяем архитектуру системы
    if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
        set NODE_ARCH=x64
        set NODE_URL=https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi
    ) else (
        set NODE_ARCH=x86
        set NODE_URL=https://nodejs.org/dist/v22.14.0/node-v22.14.0-x86.msi
    )
    
    :: Скачиваем Node.js
    echo Скачиваю Node.js...
    echo.
    echo Использую официальный установщик Node.js
    echo Версия: 22.14.0 LTS
    echo Архитектура: %NODE_ARCH%
    echo.
    
    :: Используем curl или bitsadmin для скачивания
    set NODE_INSTALLER=%TEMP%\node-installer.msi
    
    echo Загрузка установщика...
    curl -L -o "%NODE_INSTALLER%" "%NODE_URL%"
    
    if %errorlevel% neq 0 (
        echo [ОШИБКА] Не удалось скачать Node.js!
        echo.
        echo Пожалуйста, установите Node.js вручную:
        echo %NODE_URL%
        echo.
        pause
        exit /b 1
    )
    
    echo [OK] Установщик загружен.
    echo.
    echo Запуск установки Node.js...
    echo.
    echo ВНИМАНИЕ: Может появиться окно установщика.
    echo Нажмите "Next" и "Install" для продолжения.
    echo.
    
    :: Запускаем установку Node.js
    start /wait msiexec /i "%NODE_INSTALLER%" /quiet /norestart
    
    if %errorlevel% neq 0 (
        echo [ОШИБКА] Не удалось установить Node.js!
        echo.
        echo Пожалуйста, установите Node.js вручную:
        echo %NODE_URL%
        echo.
        pause
        exit /b 1
    )
    
    echo [OK] Node.js установлен!
    echo.
    echo Обновляю переменные среды...
    
    :: Обновляем PATH
    setx PATH "%PATH%;C:\Program Files\nodejs" > nul
    set "PATH=%PATH%;C:\Program Files\nodejs"
    
    :: Проверяем установку
    node --version
    echo.
) else (
    echo [OK] Node.js уже установлен!
    node --version
    echo.
)

:: Проверяем наличие npm
echo [2/4] Проверка наличия npm...
where npm > nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] npm не найден!
    echo Попробуйте переустановить Node.js.
    echo.
    pause
    exit /b 1
)

echo [OK] npm найден!
npm --version
echo.

:: Проверяем наличие package.json
echo [3/4] Проверка файлов проекта...
echo.

if not exist "package.json" (
    echo [ОШИБКА] Файл package.json не найден!
    echo.
    echo Убедитесь, что вы запускаете install.bat из папки с проектом.
    echo.
    pause
    exit /b 1
)

echo [OK] package.json найден.
echo.

:: Проверяем наличие electron в package.json
findstr /i "electron" package.json > nul
if %errorlevel% neq 0 (
    echo [ВНИМАНИЕ] Electron не найден в package.json!
    echo Добавляю Electron в зависимости...
    echo.
    call npm install electron --save-dev
)

echo.
echo [4/4] Установка зависимостей...
echo ========================================
echo.
echo Это может занять несколько минут...
echo.

:: Устанавливаем зависимости
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Не удалось установить зависимости!
    echo.
    echo Попробуйте выполнить вручную:
    echo npm install
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo     УСТАНОВКА ЗАВЕРШЕНА!
echo ========================================
echo.
echo Установлены следующие компоненты:
echo   - Node.js (если не был установлен)
echo   - Electron
echo   - Все зависимости из package.json
echo.
echo Папка node_modules создана: 
if exist "node_modules" (
    echo   ✅ node_modules
) else (
    echo   ❌ node_modules не найдена
)
echo.

echo ========================================
echo     ЧТО ДЕЛАТЬ ДАЛЬШЕ?
echo ========================================
echo.
echo Для запуска браузера:
echo   1. Дважды кликните start.bat
echo   2. Или выполните команду: npm start
echo.
echo Для проверки установки:
echo   node --version
echo   npm --version
echo.

echo Нажмите любую клавишу для выхода...
pause > nul