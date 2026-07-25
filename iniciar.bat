@echo off
title MeliPrinter
cd /d "%~dp0"

echo Cerrando instancias anteriores...
taskkill /f /im meliprinter.exe 2>nul
taskkill /f /im node.exe 2>nul
taskkill /f /im nodemon.exe 2>nul

echo.
echo Iniciando MeliPrinter...
echo.

:: Usar SEA executable si existe, sino node
if exist "%~dp0meliprinter.exe" (
    "%~dp0meliprinter.exe"
) else (
    node src/index.js
)

echo.
pause
