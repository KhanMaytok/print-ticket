@echo off
call git pull origin master
call pm2 restart all
pause
