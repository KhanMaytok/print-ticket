@echo off

echo "CERRANDO OTROS PROCESOS DE IMPRESIÓN"
taskkill /im /f node.exe
echo "ACTUALIZANDO..."
call git stash
call git pull origin master
call npm install
pause
