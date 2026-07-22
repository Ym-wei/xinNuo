$content = Get-Content 'E:\self\xinNuo\dev\node_modules\vue-json-pretty\esm\vue-json-pretty.js' -Raw
# Search for where 'key' (the span for the key name) gets rendered, so we know which CSS selector
# corresponds to a single key/value text node
$idx = $content.IndexOf('vjs-key')
Write-Host "vjs-key span occurrences:"
$count = 0
$i = 0
while (($i = $content.IndexOf('vjs-key', $i + 1)) -gt 0 -and $count -lt 10) {
    $count++
    Write-Host "  [$count] $($content.Substring([Math]::Max(0,$i-60), 120))"
}

Write-Host ""
Write-Host "vjs-value span occurrences:"
$count = 0
$i = 0
while (($i = $content.IndexOf('vjs-value', $i + 1)) -gt 0 -and $count -lt 10) {
    $count++
    Write-Host "  [$count] $($content.Substring([Math]::Max(0,$i-60), 120))"
}