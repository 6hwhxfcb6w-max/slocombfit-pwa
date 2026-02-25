# Slocomb Fitness Center PWA — v2.0 (Firebase Edition)

Progressive Web App for Slocomb Fitness Center, Slocomb, Alabama.

## What's New in v2
- **Firebase Authentication** — Real admin login (email/password, staff-only)
- **Firestore Database** — Announcements, classes, trainers, workouts, feedback persist in real-time
- **localStorage** — Dark mode, notification prefs, install guide dismissal saved between sessions
- **iOS Standalone Fix** — Safe area padding for notch/Dynamic Island
- **Bigger Nav Tabs** — 24px icons, bold labels
- **Idiot-Proof Install Guide** — Rewritten with crystal clear instructions
- **Facebook Link Fixed** — Points to correct SFC page
- **Feedback to Firestore** — Member submissions visible in admin panel
- **Yoga Removed** — No longer on the schedule

## Tech Stack
- React 18 + Firebase Auth + Firestore
- Progressive Web App (PWA) with offline support
- Cloudflare Pages hosting

## Setup
1. `npm install`
2. `npm run build`
3. Push to GitHub → Cloudflare auto-deploys

## Admin Access
Only whitelisted emails can log in. First admin: twallace2677@gmail.com
Create the account in Firebase Console → Authentication → Add User

## Domain
slocombfit.com
