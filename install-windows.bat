@echo off
echo ================================================
echo   BookMyBanquets - Quick Start
echo   By Mam Ummay Habiba - InnovateiTzone
echo ================================================
echo.

echo [1/3] Installing Backend packages...
cd backend
call npm install
echo Backend packages installed.
echo.

echo [2/3] Installing Frontend packages...
cd ../frontend
call npm install
echo Frontend packages installed.
echo.

echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Now run these commands in TWO separate terminals:
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     npm run dev
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend
echo     npm start
echo.
echo   Then open: http://localhost:3000
echo.
echo   Demo Login:
echo     Customer:  ali@customer.com / Customer@123
echo     Manager:   ahmed@manager.com / Manager@123
echo     Admin:     admin@bookmybanquets.com / Admin@123
echo ================================================
pause
