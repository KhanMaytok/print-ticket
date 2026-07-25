@echo off
title INSTALAR MELIPRINTER
cd /d "%~dp0"

echo ========================================
echo  Instalacion de MeliPrinter
echo ========================================
echo.

echo 1/4 Configurando git...
git config --global user.email "you@example.com"
git config --global user.name "Your Name"

echo 2/4 Clonando repositorio...
if not exist "%~dp0\.git" (
    rmdir /Q/S node_modules 2>nul
    git init
    git remote add origin https://github.com/KhanMaytok/print-ticket.git
    git fetch --all
    git reset --hard origin/master
    git pull origin master
)

echo 3/4 Instalando dependencias...
call npm install

echo 4/4 Copiando archivos de configuracion...
if not exist "%~dp0\.env" (
    copy .env.template .env
)
if not exist "%~dp0\additional_data.js" (
    copy additional_data.js.template additional_data.js
)

echo.
echo ========================================
echo  Instalacion completada!
echo  Ejecuta iniciar.bat para iniciar
echo ========================================
echo.
echo  Para compilar a .exe:
echo  npm run build
echo.

pause
