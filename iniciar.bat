@echo off

echo "CERRANDO OTROS PROCESOS DE IMPRESIÓN"
taskkill /f /im node.exe

echo "COMPROBANDO ACTUALIZACIONES"
call git stash
call git pull origin node12
call npm install
call npm install printer --msvs_version=2017  --build-from-source
call nodemon index.js

echo " _____       _      _           _       "
echo "|_   _|     (_)    (_)         | |      "
echo "  | |  _ __  _  ___ _  __ _  __| | ___  "
echo "  | | | '_ \| |/ __| |/ _` |/ _` |/ _ \ "
echo " _| |_| | | | | (__| | (_| | (_| | (_) |"
echo "|_____|_| |_|_|\___|_|\__,_|\__,_|\___/ "

pause
