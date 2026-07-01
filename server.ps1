$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:8080/")
$listener.Start()
Write-Host "Listening on http://127.0.0.1:8080/ ..."

$currentDir = Get-Location
try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") { 
            $urlPath = "/index.html" 
        }
        
        $subPath = $urlPath.TrimStart('/')
        $filePath = [System.IO.Path]::Combine($currentDir.Path, $subPath)
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            if ($filePath.EndsWith(".html")) { 
                $response.ContentType = "text/html; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".css")) { 
                $response.ContentType = "text/css; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".js")) { 
                $response.ContentType = "application/javascript; charset=utf-8" 
            }
            else {
                $response.ContentType = "application/octet-stream"
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
