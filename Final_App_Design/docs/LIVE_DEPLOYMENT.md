# Live Deployment Handoff

## Current Public Preview

The app is pushed to GitHub and can be previewed at:

```text
https://apiwattantipornanan-hue.github.io/Delivery_App_TH/Final_App_Design/
```

Customer page:

```text
https://apiwattantipornanan-hue.github.io/Delivery_App_TH/Final_App_Design/customer/
```

Admin page:

```text
https://apiwattantipornanan-hue.github.io/Delivery_App_TH/Final_App_Design/admin/
```

## What Still Blocks Real Operation

GitHub Pages is static only. It can show the app, but it cannot run the private slip verification function and it cannot share `localStorage` orders between customer/admin devices.

For real shop operation, connect:

1. Firebase Firestore for shared real-time orders.
2. Cloudflare Pages for hosting + `/api/verify-slip`.
3. SlipOK API key later for automatic slip checks.

## Firebase Values Needed

Paste the Firebase Web App config into `shared/config.js`:

```js
window.FINAL_APP_FIREBASE_CONFIG = {
  enabled: true,
  firebaseConfig: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  }
};
```

## Cloudflare Pages Settings

Connect GitHub repository:

```text
apiwattantipornanan-hue/Delivery_App_TH
```

Use:

```text
Root directory: Final_App_Design
Build command: blank
Build output directory: .
Functions directory: functions
```

## Cloudflare Environment Variables

Start without cost:

```text
PAYMENT_VERIFIER_PROVIDER=slipok
```

After SlipOK gives API details:

```text
SLIPOK_API_KEY=...
SLIPOK_API_URL=...
SLIPOK_BRANCH_ID=optional
```

Until those are set, the app safely falls back to `Manual Check`.
