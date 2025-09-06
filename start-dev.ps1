# Color Hinter 开发服务器启动脚本
# 自动清理端口3000并启动开发服务器

Write-Host "正在检查端口3000..." -ForegroundColor Cyan

# 查找占用端口3000的进程
$processInfo = netstat -ano | findstr :3000 | Select-String "LISTENING"
if ($processInfo) {
    $pid = ($processInfo -split '\s+')[-1]
    Write-Host "发现进程 $pid 占用端口3000，正在终止..." -ForegroundColor Yellow
    try {
        taskkill /PID $pid /F
        Write-Host "进程已终止" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "终止进程失败: $_" -ForegroundColor Red
    }
}

Write-Host "启动开发服务器..." -ForegroundColor Cyan
npm run dev
