# Wearino.pk Easy Git Push Script
# Automates the Git add, commit, and push process for wearino.pk.

$message = Read-Host "Enter commit message (or press Enter for 'Wearino Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')')"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Wearino Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "Staging changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "$message"

Write-Host "Pushing to GitHub (origin main)..." -ForegroundColor Cyan
git push origin main

Write-Host "`nSync Complete!" -ForegroundColor Green
