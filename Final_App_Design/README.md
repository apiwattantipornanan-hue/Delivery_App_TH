# Final App Design

Weekend-release MVP for the fresh spring roll shop.

This folder is isolated from the older demos. It contains:

- `index.html` - redirects public visitors to the customer ordering app.
- `customer/` - customer PWA-style ordering app.
- `admin/` - live order queue dashboard for shop owner/kitchen.
- `shared/` - shared config, local/Firebase data adapter, Dynamic PromptPay QR payload generator.
- `backend/` - Firebase/Cloudflare backend reference files.
- `functions/` - Cloudflare Pages Functions for private slip verification.
- `docs/` - launch checklist and architecture notes.
- `assets/` - copied logo, food photos, and storefront image.

## Customer Journey

1. Entry choice
   - `รับที่ร้าน`
   - `จัดส่ง`
   - Delivery links to the existing UI:
     `https://apiwattantipornanan-hue.github.io/Delivery_App_TH/UI_Jun_2026/index.html`
   - Pickup shows logo, storefront photo, and Google Maps link.

2. Product and quantity
   - Real food photos.
   - Large `+` / `-` controls.
   - Clear total.

3. Pickup time and checkout
   - 30-minute slots from `09:30` to `15:00`.
   - Customer sees only:
     - `ว่างอยู่`
     - `เต็มแล้ว`
     - `ของหมดชั่วคราว`
   - Capacity numbers stay behind the scenes.
   - Dynamic PromptPay QR is generated from PromptPay ID + order amount.
   - QR expires after `15` minutes by default.
   - Customer uploads slip; backend tries SlipOK/EasySlip verification.
   - If verification is not configured, admin sees `Manual Check` instead of fake auto-paid status.

## Admin Journey

- Live queue grouped by pickup time slot.
- Each order card shows:
  - Time slot / order ID.
  - Customer name.
  - Quantity in boxes.
  - Payment badge: `Awaiting Pay`, `Verifying`, `Manual Check`, `Rejected`, or `Paid`.
- Admin can mark an order paid.
- Admin can cancel an order.
- Admin can turn stock availability on/off.

## Dynamic PromptPay QR

The app does not use a static QR image.

PromptPay ID is configured in:

```text
shared/config.js
```

Current value:

```text
0867876813
```

For production, test the QR carefully with a small payment before sharing publicly.

QR expiry is configured in:

```text
shared/config.js
```

Current value:

```text
15 minutes
```

## Slip Verification

The frontend never stores SlipOK/EasySlip API keys.

Cloudflare Pages Function:

```text
functions/api/verify-slip.js
```

Free-first recommendation:

- SlipOK OK BASIC: 0 THB/month, 100 slips/month, then over-quota checks are charged.
- EasySlip: optional fallback; public pricing starts at 99 THB/month for 250 checks.

Until real API keys are configured, uploaded slips stay as `Manual Check` for admin review.

## Local Testing

Open these files in a browser:

```text
customer/index.html
admin/index.html
```

When Firebase is disabled, both apps use browser `localStorage`.
This is good for design testing on one device, but not enough for real multi-device customer/admin use.

## Real Weekend Use

For real customers and admin on different devices:

1. Create Firebase project.
2. Enable Cloud Firestore.
3. Put Firebase config into `shared/config.js`.
4. Set:

```js
window.FINAL_APP_FIREBASE_CONFIG.enabled = true
```

5. Deploy `Final_App_Design` to Cloudflare Pages.

Cloudflare Pages settings:

```text
Root directory: Final_App_Design
Build command: blank
Build output directory: .
Functions directory: functions
```

## Important Notes

- Do not commit payment API keys to GitHub.
- Cloudflare environment variables are the correct place for provider keys.
- Keep manual bank checking available as fallback when quota is exceeded or provider verification fails.
- Before launch, verify pricing and terms for Cloudflare, Firebase, SlipOK, and EasySlip.
