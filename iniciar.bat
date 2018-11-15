@echo off
call pm2 start index.js --name "thermal-printer"
pause
