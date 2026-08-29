# PraiseFaith Junior School — Web Portals

Parent-facing website and staff financial mirror for **PraiseFaith Junior School**, synced from **My Students Track** (Electron desktop app).

## Portals

- **Parent Portal** — view and download student academic reports
- **School Mirror** — staff read-only view of students, fees, expenses, and outstanding balances

## Setup

```bash
npm install
cp .env.example .env.local
# Fill NEXT_PUBLIC_FIREBASE_* — same Firebase project as the Electron app
npm run dev
```

Open http://localhost:3000

## Firebase

The web app and Electron desktop app must share the same Firebase project (`praisefaith-junior-school`).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web SDK API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics (optional) |
| `NEXT_PUBLIC_SCHOOL_MIRROR_PASSWORD` | Staff mirror login password |

## Firestore collections (read)

| Collection | Purpose |
|------------|---------|
| `students` | Validate parent login (ID + name) |
| `academicStudentReports` | Report header per student/term |
| `academicStudentSubjectResults` | Marks per subject |
| `academicReportCollections` | Exam/term labels (optional) |
| `academicSchoolBranding` / `settings/app` | School name & branding |
| `expenses`, `extraBilling`, `outstandingStudents` | School mirror data |

## Desktop app (Electron sync)

- Place `firebase-service-account.json` for `praisefaith-junior-school` in the Electron app root
- Set matching `NEXT_PUBLIC_FIREBASE_*` in the desktop app `.env.local`
- Run Firebase sync after publishing results or updating financial data

## Deploy

Deploy to Vercel with the same `NEXT_PUBLIC_FIREBASE_*` environment variables as your Firebase project.
