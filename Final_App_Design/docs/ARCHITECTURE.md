# Architecture

## Frontend

Hosting target:

- Cloudflare Pages

Apps:

- `customer/index.html`
- `admin/index.html`

Why:

- Static HTML/CSS/JS is fastest to release.
- Cloudflare Pages is simple for static deployment.
- Customer and admin screens can share the same Firebase backend.

## Backend

Primary database:

- Firebase Firestore

Collections:

```text
orders/{orderId}
settings/shop
```

Order document example:

```json
{
  "id": "NB-20260618-001",
  "fulfillment": "pickup",
  "pickupTime": "10:30",
  "customerName": "คุณเอ",
  "customerPhone": "086xxxxxxx",
  "items": [
    {
      "id": "roll",
      "name": "ปอเปี๊ยะสด",
      "qty": 2,
      "price": 50,
      "lineTotal": 100
    },
    {
      "id": "mustard",
      "name": "มัสตาร์ด",
      "qty": 1,
      "price": 20,
      "lineTotal": 20,
      "type": "add_on"
    }
  ],
  "total": 120,
  "paymentAmount": 120,
  "capacityBoxes": 2,
  "promptPayPayload": "...",
  "paymentStatus": "pending_slip",
  "orderStatus": "new",
  "slipUploaded": true,
  "createdAt": "2026-06-18T10:00:00.000Z",
  "updatedAt": "2026-06-18T10:01:00.000Z"
}
```

Order status lifecycle:

```text
new
confirmed
ready_for_pickup
picked_up
cancelled
expired
```

Payment status lifecycle:

```text
awaiting_payment
verifying
needs_manual_check
paid
rejected
expired
```

Settings document:

```json
{
  "id": "shop",
  "stockOpen": true,
  "closedSlots": ["11:00"],
  "updatedAt": "2026-06-18T10:00:00.000Z"
}
```

## Capacity Rule

Customer-facing status labels:

- `ว่างอยู่`
- `เต็มแล้ว`
- `ของหมดชั่วคราว`

Hidden calculation:

```text
if admin.stockOpen == false:
  show "ของหมดชั่วคราว"
else if slot.usedBoxes + cart.springRollBoxes > 12:
  show "เต็มแล้ว"
else:
  show "ว่างอยู่"
```

## Dynamic PromptPay

Current app:

- Builds PromptPay EMV payload in `shared/promptpay.js`.
- Renders QR in the customer checkout screen.
- Uses PromptPay ID from `shared/config.js`.
- Stores `qrGeneratedAt` and `qrExpiresAt` on every order.
- Default QR validity window is 15 minutes.

Production improvement:

- Add backend order validation.
- Add permanent slip file storage if you need audit images.
- Keep SlipOK/EasySlip keys in Cloudflare environment variables.
- Update order status to `paid` only after amount/account/duplicate checks pass.

## Slip Verification

Frontend:

- Customer uploads a slip after paying.
- The browser sends the image to `/api/verify-slip`.
- The browser never receives or stores provider API keys.

Cloudflare Function:

```text
functions/api/verify-slip.js
```

Provider strategy:

- Primary: SlipOK, because the OK BASIC public plan starts at 0 THB/month for 100 slips/month.
- Optional fallback: EasySlip, public pricing starts at 99 THB/month for 250 checks.

Decision logic:

```text
if provider is not configured:
  return manual
else if slip is duplicate:
  return rejected
else if amount does not match:
  return needs_manual_check
else if receiver account does not match:
  return needs_manual_check
else:
  return verified
```

## Manual Fallback

Fallback mode:

- Customer uploads slip.
- Admin sees `Manual Check`.
- Shop owner checks payment in bank app.
- Shop owner taps `Mark Paid`.
- When the food is ready, shop owner taps `Ready`.
- Customer page updates to `อาหารพร้อมรับแล้ว`.
- After handoff, shop owner taps `Picked Up`.

This remains available even after API integration, because provider quota, network failures, or unreadable slip images can still happen.
