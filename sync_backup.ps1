# Wearino.pk Sync Backup Script (Incremental Mirror)
# This script creates a mirror copy of the project, excluding large/unnecessary folders.

$source = "d:\Business\Revotic AI Pvt Ltd\Development\Under Developing\Revotic AI Development\Revotic AI Development\Product-Listing-Website"
$destination = "d:\Business\Revotic AI Pvt Ltd\Development\Under Developing\Development-Backup\wearino-backup"

# Create destination if it doesn't exist
if (!(Test-Path $destination)) {
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Write-Host "Created backup directory at: $destination" -ForegroundColor Cyan
}

Write-Host "Starting incremental mirror backup..." -ForegroundColor Cyan
Write-Host "Source: $source" -ForegroundColor White
Write-Host "Destination: $destination" -ForegroundColor White

# Robocopy options:
# /MIR - Mirror a directory tree (syncs deletes too)
# /XD - Exclude Directories
# /XF - Exclude Files
# /R:0 - 0 retries on failed copies
# /W:0 - 0 seconds wait between retries
# /NP - No Progress
# /XJD - Exclude Junction Points for Directories
# /XJF - Exclude Junction Points for Files

$excludeDirs = @(".git", "node_modules", ".next", "dist", "temp", ".cursor", ".vscode", "backup", "backups")
$excludeFiles = @("*.log", "sync_backup.ps1", ".DS_Store", "Thumbs.db")

robocopy "$source" "$destination" /MIR /XD $excludeDirs /XF $excludeFiles /R:0 /W:0 /NP /XJD /XJF

Write-Host "`nBackup Complete!" -ForegroundColor Green
Write-Host "Check your backup at: $destination" -ForegroundColor White
