# stop-replica.ps1
# Stops the local replica server (the node process listening on port 3000
# that was started by start-replica.ps1).

$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $conn) {
  Write-Host "No replica is running on port 3000." -ForegroundColor Gray
  exit 0
}

$ids = $conn.OwningProcess | Sort-Object -Unique
foreach ($id in $ids) {
  $proc = Get-Process -Id $id -ErrorAction SilentlyContinue
  if ($proc -and $proc.ProcessName -eq "node") {
    Stop-Process -Id $id -Force
    Write-Host "Stopped replica (PID $id)." -ForegroundColor Green
  } else {
    Write-Host "Port 3000 is held by non-node process $id ($($proc.ProcessName)) - not stopping." -ForegroundColor Yellow
  }
}
