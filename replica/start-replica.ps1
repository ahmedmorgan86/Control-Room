# start-replica.ps1
# Starts the local Terminal Monitoring System replica on http://localhost:3000.
# The replica serves the exact original client bundles and proxies all /api and
# /auth traffic to the real backend (BACKEND_URL, default 172.16.20.249:3000).
#
# Usage:  powershell -ExecutionPolicy Bypass -File start-replica.ps1
# Stop:   stop-replica.ps1  (or close the PowerShell window)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$server = Join-Path $root "server.mjs"

function Test-Port {
  param([int]$port)
  return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

if (Test-Port 3000) {
  Write-Host "A server is already listening on port 3000." -ForegroundColor Yellow
  Write-Host "Open http://localhost:3000 in your browser." -ForegroundColor Cyan
  exit 0
}

Write-Host "Starting replica on http://localhost:3000 ..." -ForegroundColor Cyan
Write-Host "(proxying API/auth to the real backend)" -ForegroundColor Gray

# Launch node in a detached process so it survives this script exiting.
$p = Start-Process -FilePath "node" -ArgumentList "`"$server`"" `
  -WorkingDirectory $root `
  -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $root "server.log") `
  -RedirectStandardError (Join-Path $root "server.err.log") `
  -PassThru

Start-Sleep -Seconds 2

if (Test-Port 3000) {
  Write-Host "Replica is running. Open:" -ForegroundColor Green
  Write-Host "  http://localhost:3000" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Stop it later with:  powershell -File stop-replica.ps1" -ForegroundColor Gray
} else {
  Write-Host "Failed to start. Check server.err.log" -ForegroundColor Red
  if (Test-Path (Join-Path $root "server.err.log")) {
    Get-Content (Join-Path $root "server.err.log")
  }
}
