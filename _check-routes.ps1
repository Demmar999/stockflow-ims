$routes = @('/', '/login', '/dashboard', '/products', '/categories', '/suppliers', '/stock-in', '/stock-out', '/monitoring', '/alerts', '/transactions', '/reports')
foreach ($r in $routes) {
  try {
    $resp = Invoke-WebRequest -Uri ("http://localhost:3000" + $r) -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 0 -ErrorAction Stop
    Write-Output ($r + " -> " + $resp.StatusCode)
  } catch {
    Write-Output ($r + " -> ERROR " + $_.Exception.Message)
  }
}
