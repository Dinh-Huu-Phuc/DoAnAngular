@echo off
echo ========================================
echo CLEANUP OLD FOLDERS
echo ========================================
echo.
echo This will DELETE the old folders:
echo - AngularAtomic (root)
echo - API_Angular (root)
echo.
echo The new structure is:
echo - frontend/AngularAtomic
echo - backend/ChemistryAPI
echo.
echo ========================================
echo.
set /p confirm="Are you sure? Type YES to confirm: "

if /i "%confirm%"=="YES" (
    echo.
    echo Deleting old folders...
    rmdir /s /q "AngularAtomic" 2>nul
    rmdir /s /q "API_Angular" 2>nul
    echo.
    echo ✓ Cleanup completed!
    echo.
) else (
    echo.
    echo Cleanup cancelled.
    echo.
)

pause
