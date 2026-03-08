@echo off
echo Cleaning up node_modules and cache...
rmdir /s /q node_modules
del package-lock.json

echo Installing dependencies cleanly...
npm install --legacy-peer-deps --no-audit --no-fund --no-progress > npm_install_log.txt 2>&1

echo Starting Vite Dev Server...
npm run dev -- --force > vite_startup_log.txt 2>&1
