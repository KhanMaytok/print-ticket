@echo off
title ACTUALIZAR MELIPRINTER
cd /d "%~dp0"

echo Cerrando instancias...
taskkill /f /im meliprinter.exe 2>nul
taskkill /f /im node.exe 2>nul

echo.
echo Actualizando desde GitHub...
call git stash
call git pull origin master
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo actualizar. Revisa la conexion.
    pause
    exit /b 1
)

echo.
echo Instalando dependencias...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install fallo.
    pause
    exit /b 1
)

echo.
echo Actualizacion completada. Version actual:
call node -e "console.log(require('./package.json').version)"

echo.
pause
