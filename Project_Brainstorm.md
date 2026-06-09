# Delivery Application Brainstorm

## Business Context

Food shop in Thailand selling fresh spring rolls starting around 50 THB.

Main business concern:

- Avoid GrabFood / LINE MAN marketplace GP because commission forces the selling price too high.
- Keep food price attractive from the customer perspective.
- Build a direct ordering and delivery flow connecting customer, shop, and rider.
- Start with low capital and grow step by step.

## Core Strategy

Do not build "another Grab" first.

Build a direct-ordering system for the shop:

1. Customer orders directly from our app or LINE entry point.
2. Shop receives and confirms order.
3. Customer pays by PromptPay QR.
4. Shop assigns rider manually at first.
5. Rider uses LINE or rider PWA link.
6. Customer can see order status and, later, rider tracking.

Recommended first architecture:

```text
LINE Official Account Free Plan
  -> Order Now button
  -> Shop PWA / Web App
  -> Firebase backend/database
  -> PromptPay QR payment
  -> Admin order screen
  -> Rider PWA link or LINE live location
```

## Rider Strategy

Phase 1 should not require every rider to install a native app.

Recommended rider options:

1. LINE manual tracking
   - Rider shares live location in LINE.
   - Cheapest and easiest.
   - Good for early pilot.

2. Rider PWA link
   - Rider opens a link such as `/rider/order/12345`.
   - Rider accepts job, starts pickup, starts delivery, and shares GPS.
   - No App Store / Play Store install required.
   - Browser asks permission for GPS.
   - Works best while browser page is open.

3. Native rider app
   - Best for reliable background GPS and push notifications.
   - More expensive and should come later.

Suggested MVP rider flow:

```text
Admin assigns order
  -> Rider receives LINE message with job link
  -> Rider opens PWA
  -> Accept job
  -> Start pickup
  -> Start delivery
  -> Share GPS while active
  -> Mark delivered
```

External backup rider services can be considered later:

- Lalamove API
- SKOOTAR API / web booking
- Other local motorcycle courier options

Use these as backup logistics, not as food marketplace platforms.

## Payment Strategy

Phase 1: PromptPay QR with manual verification.

Example:

```text
Customer buys 2 boxes
Food total = 100 THB
App generates PromptPay QR for 100 THB
Customer scans with Thai bank app
Customer uploads payment slip
Shop checks payment
Order confirmed
```

Risk reduction:

- Use exact amount per order.
- Optionally use small unique satang amount, for example 100.03 THB for order #003.
- QR expires after 10-15 minutes.
- Payment status stays pending until confirmed.

Phase 2: PromptPay payment API.

Possible providers to compare:

- Opn / Omise
- 2C2P
- Xendit
- Thai bank direct APIs such as SCB, Bangkok Bank, Kasikorn, etc.

Phase 3: LINE Pay only if useful.

LINE Pay exists in Thailand, but merchant onboarding and MDR fees may apply. For low capital, PromptPay QR is probably better as the first payment path.

## LINE Strategy

Use LINE because Thai customers and riders are familiar with it.

Recommended first setup:

- LINE Official Account free plan.
- Rich menu button: Order Now.
- The button opens our PWA ordering app.
- LINE chat is used for support and manual communication.
- Do not rely on heavy automated broadcasts at the beginning.

Known cost notes from current research:

- LINE OA Free plan exists.
- Basic and Pro paid plans exist for higher message volume.
- Verified account is optional and has a one-time fee.
- Messaging API usage depends on LINE OA message allowance.

LINE is the customer entry and communication layer.
Our app still owns order data, payment status, rider assignment, and tracking.

## Firebase Backend

Firebase is owned by Google and can act as our backend/database without running our own server.

Firebase can store:

- Menu items
- Prices
- Customer orders
- Customer addresses
- Payment status
- Rider assignment
- Rider GPS location
- Order status history

Recommended Firebase products for MVP:

- Firebase Hosting for web/PWA hosting.
- Cloud Firestore for database.
- Firebase Authentication later, but avoid phone OTP at first because SMS verification can cost money.

Low-capital recommendation:

- Start on Firebase Spark free plan.
- Use simple admin/rider login during prototype.
- Avoid large image storage costs.
- Add budget alerts before upgrading to Blaze.

Important:

- Some server-side features, such as payment webhooks and backend automation, may require Blaze pay-as-you-go later.
- Blaze is not automatically expensive, but it requires careful budget management.

## Gemini / AI Ideas

Gemini can connect with Firebase through Firebase AI Logic and Gemini API.

Important distinction:

- Personal Gemini Pro / Google AI Pro subscription helps the developer personally.
- App features usually use Gemini API / Firebase AI Logic, which has separate free or paid tiers.

Recommended AI roadmap:

Phase 1:

- Do not add AI to customer app yet.
- Build the core ordering system first.

Phase 2:

- Use analytics from orders.
- Track sales by day, time, menu, and area.

Phase 3:

- Add Gemini for admin support.
- Generate LINE promotion text.
- Summarize daily sales.
- Suggest how many boxes to prepare.
- Analyze customer feedback.
- Translate menu text Thai / English.

Phase 4:

- Add customer-facing AI only if it creates real value.
- Food recommendation.
- FAQ assistant.
- Healthy / vegetarian / spicy guidance.

Best AI feature idea for the shop:

```text
"How many spring roll boxes should I prepare today,
and what promotion should I send on LINE?"
```

## MVP Feature List

Customer PWA:

- Menu with food photos.
- Quantity selection.
- Cart.
- Delivery address.
- Delivery fee calculation.
- PromptPay QR.
- Payment slip upload.
- Order status page.

Admin PWA:

- Incoming orders.
- Payment pending / confirmed.
- Cooking status.
- Assign rider.
- View rider status.
- Mark delivered.

Rider PWA:

- Job link.
- Accept order.
- Pickup location.
- Customer drop-off location.
- Customer phone/contact.
- Start delivery.
- Share GPS.
- Mark delivered.

## Current Prototype

Created on 2026-06-04 as the first static MVP prototype.

Updated on 2026-06-06 after review:

- First prototype felt too much like a Power App / internal tool.
- Customer UI should feel more attractive and food-shop friendly.
- Admin UI should still be operational, but easier to scan.
- Real food pictures will be added later from `Ptcture_Food` after the owner confirms the image set is ready.
- UI direction should be real-photo first. Avoid AI-generated food that changes the product too much.
- Product moodboard should reference the real food images around 80%, with UI design supporting the photo instead of replacing it.

Files:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

Current prototype scope:

- Customer menu and cart.
- Delivery fee selection.
- PromptPay QR mock screen.
- Payment slip upload step.
- Admin order dashboard.
- Manual payment and order status updates.
- Rider job selection.
- Rider status updates.
- Browser GPS sharing for active rider job.
- Local data stored in browser `localStorage`.

This prototype is intentionally simple so the product flow can be tested before connecting Firebase, LINE LIFF, and payment APIs.

## Suggested Build Phases

### Phase 1: Manual MVP

- Customer order page.
- Admin order dashboard.
- PromptPay QR generation.
- Manual payment confirmation.
- Manual rider assignment through LINE.
- Simple order status.

### Phase 2: Rider PWA Tracking

- Rider job link.
- GPS permission.
- Real-time location stored in Firebase.
- Admin/customer map view.

### Phase 3: Payment Automation

- Connect PromptPay API provider.
- Use webhook for payment confirmation.
- Reduce fake-slip risk.

### Phase 4: Better Operations

- Delivery zones.
- Rider payout report.
- Customer reorder.
- LINE rich menu.
- Order notifications.

### Phase 5: AI Business Brain

- Daily summary.
- Demand prediction.
- Promotion generator.
- Review/customer feedback analysis.

## Product Principle

Keep the 50 THB food attractive.

Do not let technology or platform fees force the food price into 70-80 THB unless the customer clearly receives extra value.

The app should feel:

- Friendly.
- Fast.
- Simple like Shopee-style checkout.
- Thai customer friendly.
- Low friction for riders.
- Easy for the shop owner to operate.

## Open Questions

- What is the shop location and first delivery radius?
- How many orders per day are expected in the first month?
- Will delivery be only fresh spring rolls or more menu items later?
- Should customer login be optional at first?
- Should admin confirm payment manually or use slip upload OCR later?
- Which payment API provider is best for Thailand small merchant onboarding?

## Reference Links

- Firebase pricing plans: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Firebase pricing page: https://firebase.google.com/pricing
- Firebase AI Logic: https://firebase.google.com/products/vertex-ai-in-firebase
- Firebase AI Logic get started: https://firebase.google.com/docs/vertex-ai/get-started
- Gemini API billing: https://ai.google.dev/gemini-api/docs/billing
- LINE Official Account Thailand: https://lineforbusiness.com/th/
- LINE Developers LIFF: https://developers.line.biz/en/docs/liff/
- LINE Messaging API pricing: https://developers.line.biz/en/docs/messaging-api/pricing/
- Opn PromptPay: https://docs.opn.ooo/en/promptpay/thailand
- 2C2P QR payment: https://developer.2c2p.com/docs/direct-api-method-qr-payment
- Lalamove Developers: https://developers.lalamove.com/
- SKOOTAR: https://www.skootar.com/en
