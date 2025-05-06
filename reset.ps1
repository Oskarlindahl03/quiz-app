# Stop any running Metro processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "metro" } | Stop-Process -Force

# Remove node_modules directory
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}

# Clear npm cache
npm cache clean --force

# Clear Metro bundler cache
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Temp\metro-*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Temp\haste-map-*" -ErrorAction SilentlyContinue

# Remove package-lock.json
if (Test-Path package-lock.json) {
    Remove-Item package-lock.json
}

# Reinstall dependencies
npm install

# Start Expo with cleared cache
Write-Host "Starting Expo with cleared cache..."
npx expo start --clear 