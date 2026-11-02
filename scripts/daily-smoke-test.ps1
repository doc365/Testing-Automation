<#
.SYNOPSIS
    Daily Smoke Test Automation Script
.DESCRIPTION
    Scheduled via Windows Task Scheduler to run at 8:55 AM daily.
    1. Starts Docker Desktop (if not running)
    2. Starts the n8n-automation container
    3. Waits for n8n to become healthy
    4. Waits for the 9:00 AM scheduled workflow to fire and complete
    5. Shuts down the container to save resources
.NOTES
    Timezone: Asia/Ho_Chi_Minh (UTC+7)
    This is a persistent automation script - do NOT self-delete.
#>

$ErrorActionPreference = "Continue"
$ProjectDir = "E:\Documents\Testing Automation"
$LogDir = Join-Path $ProjectDir "logs"
$LogFile = Join-Path $LogDir "daily-smoke-$(Get-Date -Format 'yyyy-MM-dd').log"

# Ensure log directory exists
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$timestamp] [$Level] $Message"
    Write-Host $entry
    Add-Content -Path $LogFile -Value $entry -Encoding UTF8
}

# ============================================================
# STEP 1: Ensure Docker Desktop is running
# ============================================================
Write-Log "Daily Smoke Test automation started."

$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Log "Docker Desktop is not running. Attempting to start..."
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Log "Docker Desktop launch requested. Waiting for daemon..."
    } else {
        Write-Log "Docker Desktop not found at expected path. Checking alternative..." "WARNING"
        $altPath = (Get-Command "Docker Desktop" -ErrorAction SilentlyContinue).Source
        if ($altPath) {
            Start-Process $altPath
        } else {
            Write-Log "Cannot locate Docker Desktop. Aborting." "ERROR"
            exit 1
        }
    }

    # Wait for Docker daemon to be ready (up to 120 seconds)
    $maxWait = 120
    $elapsed = 0
    $dockerReady = $false
    while ($elapsed -lt $maxWait) {
        $result = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            break
        }
        Start-Sleep -Seconds 5
        $elapsed += 5
        Write-Log "Waiting for Docker daemon... ($elapsed/$maxWait seconds)"
    }

    if (-not $dockerReady) {
        Write-Log "Docker daemon failed to start within $maxWait seconds. Aborting." "ERROR"
        exit 1
    }
    Write-Log "Docker daemon is ready."
} else {
    Write-Log "Docker Desktop is already running."
}

# ============================================================
# STEP 2: Start the n8n container
# ============================================================
Write-Log "Starting n8n-automation container..."
Set-Location $ProjectDir
docker compose up -d 2>&1 | ForEach-Object { Write-Log $_ }

if ($LASTEXITCODE -ne 0) {
    Write-Log "Failed to start n8n container. Aborting." "ERROR"
    exit 1
}
Write-Log "Container start command issued."

# ============================================================
# STEP 3: Wait for n8n to become healthy
# ============================================================
Write-Log "Waiting for n8n to become healthy..."
$maxHealthWait = 90
$healthElapsed = 0
$n8nReady = $false

while ($healthElapsed -lt $maxHealthWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $n8nReady = $true
            break
        }
    } catch {
        # Not ready yet
    }
    Start-Sleep -Seconds 5
    $healthElapsed += 5
    Write-Log "n8n health check pending... ($healthElapsed/$maxHealthWait seconds)"
}

if (-not $n8nReady) {
    Write-Log "n8n failed to become healthy within $maxHealthWait seconds." "ERROR"
    docker compose down 2>&1 | ForEach-Object { Write-Log $_ }
    exit 1
}
Write-Log "n8n is healthy and ready."

# ============================================================
# STEP 4: Wait for the 9:00 AM scheduled workflow to execute
# ============================================================
# The n8n Schedule Trigger fires at 9:00 AM (Asia/Ho_Chi_Minh).
# The script starts at 8:55 AM, so we wait until 9:02 AM to
# give the workflow time to fire and complete (API call + Slack post).

$targetTime = (Get-Date).Date.AddHours(9).AddMinutes(2)
$now = Get-Date

if ($now -lt $targetTime) {
    $waitSeconds = [math]::Ceiling(($targetTime - $now).TotalSeconds)
    Write-Log "Waiting $waitSeconds seconds until 9:02 AM for workflow execution..."
    Start-Sleep -Seconds $waitSeconds
} else {
    # If script started after 9:02 AM (e.g. Docker took long to start),
    # give an additional 60 seconds for the workflow to catch up
    Write-Log "Past 9:02 AM. Giving n8n 60 seconds to execute the scheduled workflow..."
    Start-Sleep -Seconds 60
}

Write-Log "Scheduled workflow window complete."

# ============================================================
# STEP 5: Shut down the container to save resources
# ============================================================
Write-Log "Shutting down n8n-automation container..."
Set-Location $ProjectDir
docker compose down 2>&1 | ForEach-Object { Write-Log $_ }

if ($LASTEXITCODE -eq 0) {
    Write-Log "n8n-automation container stopped and removed successfully."
} else {
    Write-Log "Warning: docker compose down returned non-zero exit code." "WARNING"
}

Write-Log "Daily Smoke Test automation completed."
Write-Log "============================================"
