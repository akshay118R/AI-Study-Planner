<#
.SYNOPSIS
    Safe PowerShell diagnostic script to verify Ollama and Gemma setup on Windows.
    Does not modify files, does not require elevated/admin privileges.
#>

$ErrorActionPreference = "Stop"

$OllamaBaseUrl = if ($env:OLLAMA_BASE_URL) { $env:OLLAMA_BASE_URL } else { "http://127.0.0.1:11434" }
$RequiredModel = if ($env:OLLAMA_MODEL) { $env:OLLAMA_MODEL } else { "gemma4:2b" }

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   HACKTOBERFEST TRACKER - LOCAL AI DIAGNOSTICS     " -ForegroundColor Cyan
Write-Host "====================================================`n" -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "[1/3] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Node.js is not found in PATH. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# 2. Check Ollama API Reachability
Write-Host "`n[2/3] Checking Ollama endpoint at $OllamaBaseUrl..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$OllamaBaseUrl/api/tags" -Method Get -TimeoutSec 5
    Write-Host "  [OK] Ollama service is running and responsive." -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Could not connect to Ollama at $OllamaBaseUrl" -ForegroundColor Red
    Write-Host "  Reason: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n--> Action Required:" -ForegroundColor White
    Write-Host "  1. If Ollama is not installed, download it from https://ollama.com" -ForegroundColor Gray
    Write-Host "  2. Start Ollama: Open Ollama app or run 'ollama serve' in terminal" -ForegroundColor Gray
    Write-Host "  3. Download the model: ollama pull $RequiredModel`n" -ForegroundColor Gray
    exit 1
}

# 3. Check for Required Model
Write-Host "`n[3/3] Checking for Gemma model '$RequiredModel'..." -ForegroundColor Yellow
$models = $response.models
$found = $null

if ($models) {
    foreach ($m in $models) {
        $name = "$($m.name)".ToLower()
        $req = "$RequiredModel".ToLower()
        if ($name -eq $req -or $name.StartsWith($req.Split(':')[0])) {
            $found = $m
            break
        }
    }
}

if ($found) {
    $sizeGb = [math]::Round(($found.size / 1GB), 1)
    Write-Host "  [OK] Found model: $($found.name) ($sizeGb GB)" -ForegroundColor Green
    Write-Host "`n====================================================" -ForegroundColor Cyan
    Write-Host "  STATUS: LOCAL AI IS READY TO USE!                 " -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "  GitHub Pages: https://akshay118r.github.io/AI-Study-Planner/" -ForegroundColor White
    Write-Host "  Local dev   : npm start -> http://localhost:3000/#create-plan`n" -ForegroundColor White
    exit 0
} else {
    Write-Host "  [WARN] Model '$RequiredModel' is missing in Ollama." -ForegroundColor Yellow
    Write-Host "`n--> Action Required:" -ForegroundColor White
    Write-Host "  Run this command in PowerShell to download the model:" -ForegroundColor Gray
    Write-Host "  ollama pull $RequiredModel`n" -ForegroundColor Cyan
    exit 1
}
