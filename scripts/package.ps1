# Packages the extension into a clean ZIP for the Chrome Web Store / Edge Add-ons.
# Usage: npm run package
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$staging = Join-Path $root 'build\markly'
$zip = Join-Path $root 'build\markly.zip'

# Clean staging
if (Test-Path (Join-Path $root 'build')) { Remove-Item (Join-Path $root 'build') -Recurse -Force }
New-Item -ItemType Directory -Force $staging | Out-Null

# Copy only the runtime files
Copy-Item (Join-Path $root 'manifest.json')   $staging
Copy-Item (Join-Path $root 'background.js')    $staging
Copy-Item (Join-Path $root 'bookmarks.html')   $staging
New-Item -ItemType Directory -Force (Join-Path $staging 'dist')  | Out-Null
Copy-Item (Join-Path $root 'dist\bundle.js')   (Join-Path $staging 'dist')
Copy-Item (Join-Path $root 'icons')            $staging -Recurse

# Zip it
Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $zip -Force

$size = [Math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "Packaged: build\markly.zip ($size KB)"
