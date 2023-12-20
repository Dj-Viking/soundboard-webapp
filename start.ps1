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
    # open the browser
    Write-Host "[INFO]: opening browser page located at $($root)\dist\app\index.html" -ForegroundColor Cyan;

    . {
        Get-ChildItem ".\dist" -Recurse
    } | Out-Null;

    & "C:\Program Files\Google\Chrome\Application\chrome.exe" "$($PSScriptRoot)\dist\app\index.html";

}