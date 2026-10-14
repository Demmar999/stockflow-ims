$root = "C:\Users\TO GOD BE THE GLORY\Downloads\stockflow-ims-files"
$nested = Join-Path $root "stockflow-ims"

function Get-RelFiles($base, $sub) {
  $full = Join-Path $base $sub
  if (-not (Test-Path $full)) { return @() }
  Get-ChildItem -Path $full -Recurse -File | ForEach-Object {
    $_.FullName.Substring($full.Length + 1)
  }
}

foreach ($sub in @("app", "components", "lib")) {
  $a = Get-RelFiles $root $sub
  $b = Get-RelFiles $nested $sub
  $all = @($a + $b) | Sort-Object -Unique
  Write-Output ("=== " + $sub + " ===")
  foreach ($rel in $all) {
    $pa = Join-Path (Join-Path $root $sub) $rel
    $pb = Join-Path (Join-Path $nested $sub) $rel
    $ha = if (Test-Path $pa) { (Get-FileHash $pa -Algorithm MD5).Hash } else { "MISSING" }
    $hb = if (Test-Path $pb) { (Get-FileHash $pb -Algorithm MD5).Hash } else { "MISSING" }
    $state = if ($ha -eq $hb) { "SAME" } elseif ($ha -eq "MISSING") { "ONLY-NESTED" } elseif ($hb -eq "MISSING") { "ONLY-ROOT" } else { "DIFFERENT" }
    Write-Output ($state + "  " + $rel)
  }
}
