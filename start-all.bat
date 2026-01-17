@echo off
echo ========================================
echo Starting Chemistry Learning Platform
echo ========================================
echo.
echo Starting Backend (API)...
start "Backend API" cmd /k "cd backend\ChemistryAPI\ChemistryAPI && dotnet run"

timeout /t 5 /nobreak >nul

echo Starting Frontend (Angular)...
start "Frontend Angular" cmd /k "cd frontend\AngularAtomic && npm start"

echo.
echo ========================================
echo Both services are starting...
echo.
echo Backend: https://localhost:7240
echo Frontend: http://localhost:4200
echo.
echo Press any key to close this window...
echo ========================================
pause >nul
