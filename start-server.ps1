try {
    $flags = "--esm"
    $file = ".\server\server.ts";
    Start-Process node -ArgumentList ".\node_modules\ts-node\dist\bin.js $flags $file"
}
catch {
    
}