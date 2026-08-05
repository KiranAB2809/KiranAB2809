# 1-Click Resume PDF Generation Script
# Compiles resume.html to Kiran_AB_Resume.pdf using Microsoft Edge Headless engine

$htmlPath = Join-Path $PSScriptRoot "resume.html"
$pdfPath = Join-Path $PSScriptRoot "Kiran_AB_Resume.pdf"

if (-not (Test-Path $htmlPath)) {
    Write-Error "Could not find resume.html in $PSScriptRoot"
    exit 1
}

$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$browserPath = $null
foreach ($path in $edgePaths) {
    if (Test-Path $path) {
        $browserPath = $path
        break
    }
}

if (-not $browserPath) {
    Write-Error "Could not locate Microsoft Edge or Google Chrome executable."
    exit 1
}

Write-Host "Compiling resume.html to PDF using: $browserPath" -ForegroundColor Cyan

$fileUri = "file:///" + ($htmlPath -replace '\\', '/')
$argList = @(
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--print-to-pdf=$pdfPath",
    $fileUri
)

Start-Process -FilePath $browserPath -ArgumentList $argList -Wait -NoNewWindow

if (Test-Path $pdfPath) {
    $item = Get-Item $pdfPath
    Write-Host "Success! Generated: $($item.FullName) ($([math]::Round($item.Length/1KB, 1)) KB)" -ForegroundColor Green
} else {
    Write-Error "PDF generation failed."
}
