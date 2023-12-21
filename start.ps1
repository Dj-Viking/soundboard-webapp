param()

if (-not (Test-Path ".\dist")) {
    node .\node_modules\typescript\lib\tsc.js -b .;
}

# watch by default

$root = $PSScriptRoot;

try {
    Copy-Item -Path "$($root)\app\index.html" -Destination "$($root)\dist\app"

    Start-Process node -ArgumentList "$($root)\node_modules\typescript\lib\tsc.js -b . --watch" -WindowStyle Minimized;
}
catch {
    Write-Host "[ERROR]: could not start node process to watch changes" -ForegroundColor Red;
}
finally {
    # start the static file server
    # type="module" can't be used from file protocol
    Write-Host "[INFO]: starting static file server" -ForegroundColor Cyan;

    . {
        Get-ChildItem ".\dist" -Recurse
    } | Out-Null;

    & .\start-server.ps1;

    & "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8080";
}