@echo off

echo Killing existing dev servers...
npx -y kill-port 5000 5173 5174 3001

echo Starting LALEN Backend...
start "LALEN Backend" cmd /k "cd server && node index.js"

echo Installing fresh dependencies...
call npm install --legacy-peer-deps --no-audit --no-fund

echo Wiping Vite Cache...
rmdir /s /q node_modules\.vite

echo Starting LALEN Frontend (Forced on port 5174)...
start "LALEN Frontend" cmd /k "npm run dev -- --port 5174 --force"

echo Both servers are starting in new windows.
exit
