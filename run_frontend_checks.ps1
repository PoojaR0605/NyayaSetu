Set-Location 'C:\Users\Pooja Rajappa\Downloads\NyayaSetu_complete_project\NyayaSetu\frontend'
Write-Host "=== TypeScript check ==="
npx tsc --noEmit 2>&1
$tsExit = $LASTEXITCODE
Write-Host "TS_EXIT:$tsExit"
Write-Host "=== npm run build ==="
npm run build 2>&1
$buildExit = $LASTEXITCODE
Write-Host "BUILD_EXIT:$buildExit"
Write-Host "=== FRONTEND_CHECKS_DONE ==="
