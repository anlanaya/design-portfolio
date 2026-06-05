@echo off
chcp 65001 >nul
echo.
echo   🏠 设计案例库 - 构建中...
echo.
cd /d "%~dp0"
call npm run build
if %errorlevel% equ 0 (
    echo.
    echo   ✅ 构建成功！dist 文件夹已更新。
    echo.
    echo   请去 Cloudflare Pages 上传 dist 文件夹：
    echo   https://dash.cloudflare.com → Workers ^& Pages → design-cases
    echo.
    explorer dist
) else (
    echo.
    echo   ❌ 构建失败，请检查错误信息。
    echo.
)
pause
