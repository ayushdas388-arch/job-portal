@echo off
REM Job Portal backend launcher - venv PATH ke jhamele se bachne ke liye
cd /d "%~dp0backend"
echo Starting backend on http://127.0.0.1:8000 ...
"%~dp0backend\venv\Scripts\python.exe" -m uvicorn main:app --reload --port 8000
pause
