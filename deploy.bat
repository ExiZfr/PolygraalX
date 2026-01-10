@echo off
REM PolyGraalX VPS Deployment Script
REM Usage: deploy.bat

set VPS_HOST=87.106.2.116
set VPS_USER=root
set VPS_PASS=x3FoZWtS
set VPS_DIR=/root/polygraalx

echo ========================================
echo PolyGraalX VPS Deployment
echo ========================================

REM Add host key to PuTTY registry to avoid confirmation
echo Adding host key...
echo y | "C:\Program Files\PuTTY\plink.exe" -pw %VPS_PASS% %VPS_USER%@%VPS_HOST% exit 2>nul

echo.
echo Creating remote directory...
"C:\Program Files\PuTTY\plink.exe" -batch -pw %VPS_PASS% %VPS_USER%@%VPS_HOST% "mkdir -p %VPS_DIR%"

echo.
echo Uploading Python files...
"C:\Program Files\PuTTY\pscp.exe" -batch -pw %VPS_PASS% *.py %VPS_USER%@%VPS_HOST%:%VPS_DIR%/

echo.
echo Uploading configuration files...
"C:\Program Files\PuTTY\pscp.exe" -batch -pw %VPS_PASS% *.txt *.md .env.template .gitignore %VPS_USER%@%VPS_HOST%:%VPS_DIR%/

echo.
echo Uploading systemd service...
"C:\Program Files\PuTTY\pscp.exe" -batch -pw %VPS_PASS% *.service %VPS_USER%@%VPS_HOST%:%VPS_DIR%/

echo.
echo Installing dependencies on VPS...
"C:\Program Files\PuTTY\plink.exe" -batch -pw %VPS_PASS% %VPS_USER%@%VPS_HOST% "cd %VPS_DIR% && apt update && apt install -y python3 python3-pip python3-venv"

echo.
echo Creating virtual environment...
"C:\Program Files\PuTTY\plink.exe" -batch -pw %VPS_PASS% %VPS_USER%@%VPS_HOST% "cd %VPS_DIR% && python3 -m venv venv"

echo.
echo Installing Python dependencies...
"C:\Program Files\PuTTY\plink.exe" -batch -pw %VPS_PASS% %VPS_USER%@%VPS_HOST% "cd %VPS_DIR% && ./venv/bin/pip install -r requirements.txt"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. SSH to VPS: ssh %VPS_USER%@%VPS_HOST%
echo 2. Configure .env: cd %VPS_DIR% ^&^& nano .env
echo 3. Test bot: ./venv/bin/python main.py
echo.
pause
