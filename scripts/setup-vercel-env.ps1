# PraiseFaith Junior School — Vercel environment variables
# Prereqs: npm i -g vercel  (or use npx vercel)
#          vercel login
#          cd to this repo and: vercel link   (select connect-group-of-schools project)

$ErrorActionPreference = "Stop"

$vars = @{
  NEXT_PUBLIC_FIREBASE_API_KEY            = "AIzaSyBCpajdj01oLa4HRalaUpo2ODOvyI2rqfM"
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        = "praisefaith-junior-school.firebaseapp.com"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID         = "praisefaith-junior-school"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     = "praisefaith-junior-school.firebasestorage.app"
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "95874105499"
  NEXT_PUBLIC_FIREBASE_APP_ID             = "1:95874105499:web:589ff457a9302eb41ec63e"
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID     = "G-THV8L2GVQS"
  NEXT_PUBLIC_SCHOOL_MIRROR_PASSWORD      = "SuperAdmin123!"
}

$environments = @("production", "preview", "development")

Write-Host "Setting PraiseFaith Firebase env on linked Vercel project..." -ForegroundColor Cyan
Write-Host "Project ID must be: praisefaith-junior-school" -ForegroundColor Yellow

foreach ($name in $vars.Keys) {
  foreach ($env in $environments) {
    Write-Host "  $name ($env)"
    npx vercel env add $name $env --value $vars[$name] --yes --force 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "    (run manually: vercel env add $name $env)" -ForegroundColor DarkYellow
    }
  }
}

Write-Host ""
Write-Host "Done. Redeploy: npx vercel --prod" -ForegroundColor Green
Write-Host "Confirm footer shows: Firestore: praisefaith-junior-school" -ForegroundColor Green
