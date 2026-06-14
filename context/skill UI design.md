# Home Kitchen Fresh Soft UI Skill

Use this skill when designing or extending the Thai direct-ordering demo for the fresh spring roll shop.

## Visual North Star

The chosen direction is warm, fresh, calm, and practical. It should feel like a small home kitchen that is ready for real customer orders, not a dark restaurant app or a generic tech dashboard.

Reference asset:

- `context/visual-north-star-home-kitchen.png`

Hero food direction:

- Fresh spring roll plate with a soft home-kitchen environment.
- Wrapper should look dry, matte, beige/off-white, and not fluorescent.
- Sauce stays separate in a bowl, never poured over the product.
- Visible filling should include Chinese sausage, tofu, and fewer bean sprouts.
- Chinese sausage should feel like rectangular fried slabs, not oval slices.

## Color Palette

- LINE green: `#06b954` for primary actions and active states.
- Deep leaf: `#123b28` for main text.
- Soft lime: `#eef7e7` for calm backgrounds.
- Rice white: `#fffdf7` for cards.
- Warm yellow: `#ffe49a` for secondary payment/support actions.
- Peanut brown: `#8a5a2c` for home-kitchen warmth.
- Soft gray green: `#7d8378` for supporting text.

Keep shadows soft and green-tinted. Avoid heavy black shadows.

## Typography Mood

- Thai-first, friendly, clear, and modern.
- Use rounded, readable system fonts: `Leelawadee UI`, `Noto Sans Thai`, `Segoe UI`, sans-serif.
- Product names should be confident and easy to scan.
- Supporting copy should sound human, warm, and practical.

Tone examples:

- `จากครัวบ้านเรา`
- `ทำสดเป็นรอบ น้ำจิ้มแยกให้ พร้อมทานค่ะ`
- `สรุปตะกร้าก่อนจ่าย`
- `ร้านจะยืนยันหลังตรวจสอบสลิปค่ะ`

## Favorite Customer Journey

The preferred journey is three screens:

1. Overall menu page
   - Customer browses products.
   - Customer selects a product and quantity.
   - Main CTA is `เพิ่มในตะกร้า`.
   - The selected quantity is a draft quantity for the current product only.
   - After adding, customer should be able to keep browsing and add more products.
   - The small cart pill shows accumulated cart count and total, and links to basket.

2. Basket summary page
   - Shows all accumulated items, not only the current product.
   - Example behavior: ปอเปี๊ยะสด 2 ชุด + เต้าหู้ 1 ชุด = 3 ชุด, ฿125.
   - Customer can adjust each item quantity in the basket.
   - Shows item count, subtotal, free packing/sauce note, and total.
   - CTA is `ไปชำระเงิน`.

3. Payment page
   - Shows total payment amount.
   - Shows all basket item lines.
   - Shows PromptPay QR area.
   - Includes actions to download QR and upload transfer slip.
   - Keeps the same calm, trusted, home-kitchen tone.

## Layout Principles

- Use mobile phone mockups for demo presentation.
- Keep cards rounded, soft, and breathable.
- Primary actions should be large, green, and thumb-friendly.
- Avoid too many competing CTAs.
- The basket should feel like a confirmation checkpoint before QR payment.
- Keep customer confidence high by repeating the total clearly on basket and payment.

## Interaction Feel

- Quantity steppers should update totals immediately.
- Adding an item should update cart count and total without surprise navigation.
- Cart pill is the bridge from menu to basket.
- Basket quantity changes should update basket and payment totals together.
- Payment CTA should be disabled or avoided when cart is empty.
- Motion should be gentle: simple scroll-to-screen is enough for the demo.

## What To Avoid

- Do not replace the current favorite journey with a large floating bottom basket bar unless the user asks again.
- Avoid dark, heavy, or overly premium restaurant styling.
- Avoid square, sharp, cold UI components.
- Avoid fluorescent wrapper colors or overly glossy food.
- Avoid oval Chinese sausage slices in the hero direction.
- Avoid making payment appear before the customer has confirmed the basket.
