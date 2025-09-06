@echo off
echo 正在检查端口3000...

REM 查找并终止占用端口3000的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 发现进程 %%a 占用端口3000，正在终止...
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo 进程已终止
        timeout /t 2 >nul
    )
)

echo 启动开发服务器...
npm run dev
