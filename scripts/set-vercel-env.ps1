$ErrorActionPreference = "Stop"
Set-Location "e:\Test 6A (with Academic Reports June 2026)\Web Mirror with Academics June 2026"

$vars = @{
  "NEXT_PUBLIC_FIREBASE_API_KEY" = "AIzaSyBCpajdj01oLa4HRalaUpo2ODOvyI2rqfM"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" = "praisefaith-junior-school.firebaseapp.com"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID" = "praisefaith-junior-school"
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" = "praisefaith-junior-school.firebasestorage.app"
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "95874105499"
  "NEXT_PUBLIC_FIREBASE_APP_ID" = "1:95874105499:web:589ff457a9302eb41ec63e"
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" = "G-THV8L2GVQS"
  "NEXT_PUBLIC_SCHOOL_MIRROR_PASSWORD" = "SuperAdmin123!"
}

foreach ($name in $vars.Keys) {
  Write-Host "Updating $name ..."
  npx vercel env rm $name production --yes 2>$null
  $value = $vars[$name]
  $value | npx vercel env add $name production 2>&1
}

Write-Host "Done updating Vercel env vars."
