$base = 'http://localhost:8000'

function Invoke-ApiTest {
    param($label, $method, $url, $body = $null, $expectedStatus = 200)
    try {
        $headers = @{ 'Content-Type' = 'application/json' }
        if ($body) {
            $r = Invoke-WebRequest -Uri $url -Method $method -Body ($body | ConvertTo-Json) -Headers $headers -UseBasicParsing -TimeoutSec 15
        } else {
            $r = Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing -TimeoutSec 15
        }
        $ok = $r.StatusCode -eq $expectedStatus
        Write-Host ("[$( if($ok){'PASS'} else {'FAIL (expected ' + $expectedStatus + ')'} )] $label -- HTTP $($r.StatusCode)")
        return $r
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $expectedOk = ($code -eq $expectedStatus)
        Write-Host ("[$( if($expectedOk){'PASS'} else {'FAIL'} )] $label -- Error HTTP $code (expected $expectedStatus)")
        return $null
    }
}

Write-Host ""
Write-Host "=== INTEGRATION TESTS ==="

# 1. Health
Invoke-ApiTest "Health check" GET "$base/health" | Out-Null

# 2. Create session A
$rA = Invoke-ApiTest "Create session A" POST "$base/api/v1/sessions/start" @{language='en';user_type='citizen';state='Karnataka'} 201
$tokenA = ($rA.Content | ConvertFrom-Json).session_token
Write-Host "  Session A token: $($tokenA.Substring(0,12))..."

# 3. Create session B
$rB = Invoke-ApiTest "Create session B" POST "$base/api/v1/sessions/start" @{language='en';user_type='citizen';state='Tamil Nadu'} 201
$tokenB = ($rB.Content | ConvertFrom-Json).session_token
Write-Host "  Session B token: $($tokenB.Substring(0,12))..."

# 4. Get each session
Invoke-ApiTest "Get session A" GET "$base/api/v1/sessions/$tokenA" | Out-Null
Invoke-ApiTest "Get session B" GET "$base/api/v1/sessions/$tokenB" | Out-Null

# 5. Case-strength with no messages -- expect 400
Invoke-ApiTest "Case-strength: no messages (expect 400)" GET "$base/api/v1/sessions/$tokenA/case-strength" -expectedStatus 400 | Out-Null

# 6. Add message to session A
$mA = Invoke-ApiTest "Add message to A" POST "$base/api/v1/sessions/$tokenA/messages" @{content='Session A: I was terminated without notice after 5 years of service.'} 201
Write-Host "  Message A length: $(($mA.Content | ConvertFrom-Json).content.Length) chars"

# 7. Add message to session B
$mB = Invoke-ApiTest "Add message to B" POST "$base/api/v1/sessions/$tokenB/messages" @{content='Session B: Consumer fraud - I paid for a product that was never delivered.'} 201
Write-Host "  Message B length: $(($mB.Content | ConvertFrom-Json).content.Length) chars"

# 8. Verify session A contains only its own message
$convA = (Invoke-WebRequest -Uri "$base/api/v1/sessions/$tokenA/conversation" -UseBasicParsing).Content | ConvertFrom-Json
$aHasOwn = ($convA.messages | Where-Object { $_.content -like '*terminated*' }).Count -gt 0
$aHasB   = ($convA.messages | Where-Object { $_.content -like '*Consumer fraud*' }).Count -gt 0
Write-Host ("[$( if($aHasOwn -and -not $aHasB){'PASS'} else {'FAIL'} )] Session A isolation -- has own: $aHasOwn, has B msg: $aHasB")

# 9. Verify session B contains only its own message
$convB = (Invoke-WebRequest -Uri "$base/api/v1/sessions/$tokenB/conversation" -UseBasicParsing).Content | ConvertFrom-Json
$bHasOwn = ($convB.messages | Where-Object { $_.content -like '*Consumer fraud*' }).Count -gt 0
$bHasA   = ($convB.messages | Where-Object { $_.content -like '*terminated*' }).Count -gt 0
Write-Host ("[$( if($bHasOwn -and -not $bHasA){'PASS'} else {'FAIL'} )] Session B isolation -- has own: $bHasOwn, has A msg: $bHasA")

# 10. Delete session B
$delR = Invoke-ApiTest "Delete session B" DELETE "$base/api/v1/sessions/$tokenB" -expectedStatus 200
$deleted = ($delR.Content | ConvertFrom-Json).deleted
Write-Host ("[$( if($deleted -eq $true){'PASS'} else {'FAIL'} )] Delete confirmed in body: $deleted")

# 11. Deleted session returns 404
Invoke-ApiTest "Deleted session returns 404" GET "$base/api/v1/sessions/$tokenB" -expectedStatus 404 | Out-Null

# 12. Session A still exists
Invoke-ApiTest "Session A survives B deletion" GET "$base/api/v1/sessions/$tokenA" | Out-Null

# 13. Case-strength on session A with real Ollama
Write-Host "[INFO] Running case-strength (Ollama may take 30-180 sec)..."
try {
    $csR = Invoke-WebRequest -Uri "$base/api/v1/sessions/$tokenA/case-strength" -UseBasicParsing -TimeoutSec 180
    $cs  = $csR.Content | ConvertFrom-Json
    $csOk = $csR.StatusCode -eq 200 -and $cs.analysis.Length -gt 20
    Write-Host ("[$( if($csOk){'PASS'} else {'FAIL'} )] Case-strength -- HTTP $($csR.StatusCode), analysis chars: $($cs.analysis.Length)")
    Write-Host "  Disclaimer present: $($cs.disclaimer.Length -gt 0)"
    Write-Host "  Recommendation present: $($cs.recommendation.Length -gt 0)"
} catch {
    Write-Host "[FAIL] Case-strength -- $($_.Exception.Message)"
}

# 14. Nonexistent session returns 404
Invoke-ApiTest "Case-strength nonexistent session (404)" GET "$base/api/v1/sessions/FAKEFAKEFAKE/case-strength" -expectedStatus 404 | Out-Null

# 15. Assessment 404 before creation
Invoke-ApiTest "Assessment 404 before creation" GET "$base/api/v1/assessments/$tokenA" -expectedStatus 404 | Out-Null

# 16. OpenAPI includes case-strength route
try {
    $oapi = (Invoke-WebRequest -Uri "$base/openapi.json" -UseBasicParsing).Content | ConvertFrom-Json
    $csRoute = $oapi.paths.PSObject.Properties.Name | Where-Object { $_ -like '*case-strength*' }
    Write-Host ("[$( if($csRoute){'PASS'} else {'FAIL'} )] case-strength in OpenAPI: $csRoute")
} catch {
    Write-Host "[FAIL] OpenAPI check -- $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== INTEGRATION TESTS DONE ==="
