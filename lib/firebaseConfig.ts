function pickEnv(name: string): string {
  return process.env[name]?.trim() || ""
}

export function getFirebaseWebConfig() {
  return {
    apiKey: pickEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: pickEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: pickEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: pickEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: pickEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: pickEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    measurementId: pickEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") || undefined,
  }
}

export function isFirebaseEnvConfigured(): boolean {
  const config = getFirebaseWebConfig()
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId,
  )
}
