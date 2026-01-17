# Test Authentication API with PowerShell
# Disable SSL certificate validation
add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TESTING AUTHENTICATION API" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$testUser = @{
    fullName = "Test User"
    username = "testuser$timestamp"
    password = "Test123!"
    confirmPassword = "Test123!"
    email = "test$timestamp@example.com"
    phoneNumber = "0123456789"
}

Write-Host "`nTest User Data:" -ForegroundColor Yellow
$testUser | ConvertTo-Json | Write-Host

# Test Register
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "TEST 1: Register" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$registerUrl = "http://localhost:5150/api/auth/register"
Write-Host "URL: $registerUrl" -ForegroundColor Gray

try {
    $registerBody = $testUser | ConvertTo-Json
    $registerResponse = Invoke-RestMethod -Uri $registerUrl -Method Post -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "`n✅ Register SUCCESS" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $registerResponse | ConvertTo-Json | Write-Host
    
    $userId = $registerResponse.id
    
    # Test Login
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host "TEST 2: Login" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    
    $loginUrl = "http://localhost:5150/api/auth/login"
    Write-Host "URL: $loginUrl" -ForegroundColor Gray
    
    $loginBody = @{
        username = $testUser.username
        password = $testUser.password
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "`n✅ Login SUCCESS" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $loginResponse | ConvertTo-Json | Write-Host
    
    # Test Get User
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host "TEST 3: Get User by ID" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    
    $getUserUrl = "http://localhost:5150/api/auth/user/$userId"
    Write-Host "URL: $getUserUrl" -ForegroundColor Gray
    
    $getUserResponse = Invoke-RestMethod -Uri $getUserUrl -Method Get -ErrorAction Stop
    
    Write-Host "`n✅ Get User SUCCESS" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $getUserResponse | ConvertTo-Json | Write-Host
    
    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    
    Write-Host "`nAPI Endpoints are working correctly!" -ForegroundColor Green
    Write-Host "`nYou can now use these endpoints in your Angular app:" -ForegroundColor Yellow
    Write-Host "- POST /api/auth/register" -ForegroundColor White
    Write-Host "- POST /api/auth/login" -ForegroundColor White
    Write-Host "- GET /api/auth/user/{id}" -ForegroundColor White
    
} catch {
    Write-Host "`n============================================================" -ForegroundColor Red
    Write-Host "❌ TEST FAILED" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Red
        }
    }
    
    Write-Host "`nMake sure:" -ForegroundColor Yellow
    Write-Host "1. Backend is running (cd backend/ChemistryAPI/ChemistryAPI && dotnet run)" -ForegroundColor White
    Write-Host "2. Database is accessible" -ForegroundColor White
    Write-Host "3. CORS is configured correctly" -ForegroundColor White
    Write-Host "4. Port 5150 is not blocked by firewall" -ForegroundColor White
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
