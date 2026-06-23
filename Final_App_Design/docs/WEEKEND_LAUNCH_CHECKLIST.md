# Weekend Launch Checklist

## Before Sharing With Customers

- Replace test Firebase config in `shared/config.js`.
- Set Firebase enabled to `true`.
- Confirm PromptPay ID is correct: `0867876813`.
- Test Dynamic QR with a small payment.
- Open customer app on phone.
- Open admin app on another phone/tablet.
- Submit one pickup order.
- Confirm the order appears in admin without refresh.
- Tap `ฉันโอนเงินแล้ว`.
- Confirm admin shows `รอตรวจยอดโอน`.
- Tap `Mark Paid`.
- Confirm status changes to `Paid`.

## Customer Link

After Cloudflare Pages deployment, share:

```text
https://YOUR-CLOUDFLARE-PAGES-DOMAIN/customer/
```

## Admin Link

Keep this private:

```text
https://YOUR-CLOUDFLARE-PAGES-DOMAIN/admin/
```

For the first weekend, do not post the admin link publicly.

## Operational Flow

1. Customer opens link.
2. Customer chooses pickup or delivery.
3. Pickup customer selects products and time.
4. Customer generates Dynamic PromptPay QR.
5. Customer pays in bank app.
6. Customer taps `ฉันโอนเงินแล้ว`.
7. Admin checks the bank app and taps `Mark Paid`.
8. Kitchen prepares by pickup time slot.

## Emergency Controls

Use admin stock toggle:

- `เปิด` = customer can book.
- `ปิด` = customer sees `ของหมดชั่วคราว` on pickup slots.

## What Not To Do Yet

- Do not rely on static QR images.
- Do not expose admin URL publicly.
- Do not skip a real QR payment test.
- Do not promise automatic payment verification while the shop is using manual bank checks.
