@echo off
echo ===================================================
echo 🛑 SHUTTING DOWN FULL-STACK HIGH-TRAFFIC ENGINE (WSL)
echo ===================================================

echo [1/2] Killing PM2 background process cluster...
call pm2 kill

echo [2/2] Stopping active Redis service via WSL...
wsl sudo service redis-server stop

echo ===================================================
echo 💤 INFRASTRUCTURE CLOSED: RAM and CPU freed up safely.
echo ===================================================
pause