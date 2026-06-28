@echo off
chcp 65001 > nul
title AlphaZ Browser

echo ========================================
echo     ALPHAZ BROWSER
echo ========================================
echo.
echo Запуск браузера...
echo.

:: Проверяем, установлены ли зависимости
if not exist "node_modules" (
    echo [ВНИМАНИЕ] Зависимости не найдены!
    echo Запустите install.bat для установки.
    echo.
    pause
    exit /b 1
)

:: Запускаем браузер
call npm start

:: Если npm start завершился с ошибкой
if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Браузер завершил работу с ошибкой.
    echo.
    pause
    exit /b 1
)

pause