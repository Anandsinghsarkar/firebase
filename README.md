# Firebase Admin Dashboard

A Vercel-hosted, password-protected Firebase data viewer with:
- Cloud Firestore top-level collection listing and document JSON viewer
- Document pagination (50 per page)
- Firebase Realtime Database path/JSON viewer
- Existing user/referral management tools

## Vercel environment variables

Add these in **Vercel → Project → Settings → Environment Variables**, then redeploy.

| Variable | Required | Value |
|---|---|---|
| `ADMIN_KEY` | Yes | A long, unique password for the dashboard login |
| `JWT_SECRET` | Yes | A separate long, random secret used to sign the login session |
| `FIREBASE_CREDENTIALS_B64` | Yes* | Base64-encoded contents of your Firebase service-account JSON file |
| `FIREBASE_DATABASE_URL` | For Realtime Database | Your RTDB URL, e.g. `https://PROJECT-ID-default-rtdb.firebaseio.com` |

*Instead of `FIREBASE_CREDENTIALS_B64`, you may set `FIREBASE_SERVICE_ACCOUNT_JSON` to the complete service-account JSON. Use one of these two variables; Base64 is generally easier to paste into Vercel.

### Getting the service account

1. Open Firebase Console → Project settings → Service accounts.
2. Generate a new private key and download the JSON file.
3. Encode the **entire JSON file** as Base64 (do not paste the raw private key into the browser).
4. Paste the resulting one-line value into Vercel as `FIREBASE_CREDENTIALS_B64`.
5. Find the Realtime Database URL in Firebase Console → Realtime Database and set it as `FIREBASE_DATABASE_URL`.

The service account must have the required Firestore/Realtime Database permissions. This project uses the Firebase Admin SDK on the server; Firestore and Realtime Database security rules do not restrict Admin SDK access. Protect the service-account key and dashboard credentials carefully. Never add them to GitHub or frontend JavaScript.

## Deploy

Import this repository into Vercel. Vercel should install dependencies from `package.json`. Add the environment variables above and redeploy. Open the deployed site and sign in using `ADMIN_KEY`.

## Notes

- The Database page is read-only: it lists Firestore collections/documents and reads Realtime Database paths.
- Existing user-management endpoints still support credit and ban updates.
- The current Firestore explorer lists root collections and documents. Nested collection paths can be requested by the API.
- Realtime Database browsing requires `FIREBASE_DATABASE_URL`.
