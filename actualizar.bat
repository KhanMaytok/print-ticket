@echo off
call git stash
call git pull origin master
call npm install
pause
