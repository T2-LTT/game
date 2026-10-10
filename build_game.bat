@echo off
title Build Game Hanh Trinh Vu Tru
color 0B
echo ===================================================
echo      DANG DONG GOI GAME HANH TRINH VU TRU
echo ===================================================
echo.
echo Xin vui long doi trong giay lat...
echo Dang tao thu muc "dist" phien ban moi nhat...
echo.

call npm run build

echo.
echo ===================================================
echo   XONG! DONG GOI THANH CONG!
echo ===================================================
echo.
echo Dang tu dong mo thu muc "dist" cho ban...
echo Ban chi viec KEO va THA thu muc nay vao trang Netlify Drop!
echo.
explorer "dist"
pause
