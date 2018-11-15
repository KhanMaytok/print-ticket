@echo off
git init
git remote add origin https://github.com/KhanMaytok/print-ticket.git
git add --all
git commit -m "juajua"
git fetch --all
git reset --hard origin/master
git pull origin master
npm install -g pm2
npm install
pause
