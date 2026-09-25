@echo off
echo ===================================================
echo 🚀 STARTING FULL-STACK HIGH-TRAFFIC INFRASTRUCTURE (WSL)
echo ===================================================

:: 1. Boot up the Redis Server inside your WSL Linux subsystem
echo [1/2] Spinning up Redis service via WSL...
wsl sudo service redis-server start

:: 2. Small 2-second pause to let Redis finish its network handshake loop
timeout /t 2 /nobreak >nul

:: 3. Launch the 8 load-balanced Express nodes via PM2
echo [2/2] Launching PM2 load-balanced server cluster...
call pm2 start ecosystem.config.cjs

echo ===================================================
echo 🎉 SUCCESS: Full-stack engine is completely ONLINE!
echo Base URL: http://localhost:5000/
echo ===================================================
pause