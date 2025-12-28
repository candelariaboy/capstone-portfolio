# FIX: Add all environment variables to Vercel with BOTH Production and Development

Write-Host "=== FIXING ENVIRONMENT VARIABLES ===" -ForegroundColor Green
Write-Host ""
Write-Host "The issue is that environment variables are set to DIFFERENT environments." -ForegroundColor Yellow
Write-Host "They must be in BOTH Production AND Development."  -ForegroundColor Yellow
Write-Host ""

# Read the actual values from user's current environment
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseAnonKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
$hfToken = $env:HF_TOKEN

if (-not $supabaseUrl) {
    Write-Host "ERROR: NEXT_PUBLIC_SUPABASE_URL not found in local .env" -ForegroundColor Red
    Write-Host "Please ensure you have set up .env.local with all credentials"
    exit 1
}

Write-Host "Found local environment variables:" -ForegroundColor Green
Write-Host "✅ NEXT_PUBLIC_SUPABASE_URL: $($supabaseUrl.Substring(0, 20))..."
Write-Host "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${$supabaseAnonKey.Substring(0, 20))..."
Write-Host "✅ SUPABASE_SERVICE_ROLE_KEY: $($serviceRoleKey.Substring(0, 20))..."
Write-Host "✅ HF_TOKEN: ${$hfToken.Substring(0, 20))..."
Write-Host ""
Write-Host "Adding to Vercel Production environment..."

# This requires manual entry in Vercel, so just show the instructions
Write-Host ""
Write-Host "MANUAL STEPS:" -ForegroundColor Cyan
Write-Host "1. Go to: https://vercel.com/ernestocandelaria49-6939s-projects/sad/settings/environment-variables"
Write-Host "2. For EACH variable below, click 'Add New' and:"
Write-Host "   - Set the NAME and VALUE"
Write-Host "   - Select BOTH 'Production' and 'Development' checkboxes"
Write-Host "   - Click 'Save'"
Write-Host ""
Write-Host "Variables to add:"
Write-Host "1. NEXT_PUBLIC_SUPABASE_URL = $supabaseUrl"
Write-Host "2. NEXT_PUBLIC_SUPABASE_ANON_KEY = $supabaseAnonKey"
Write-Host "3. SUPABASE_SERVICE_ROLE_KEY = $serviceRoleKey"
Write-Host "4. HF_TOKEN = $hfToken"
Write-Host "5. UPLOAD_MAX_FILE_SIZE = 209715200"
Write-Host "6. NEXT_PUBLIC_APP_URL = https://sad-swart-nine.vercel.app"
