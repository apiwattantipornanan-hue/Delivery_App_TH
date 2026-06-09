# Visual Direction: Pattern 01 Fresh LINE-Native Shop

This direction is the visual north star for the customer-facing ordering flow.
It should feel fresh, warm, practical, delicious, and easy to understand inside a LINE/mobile context.

## Color Palette

- LINE Green: `#06C755`
  - Primary action color.
  - Use for checkout buttons, active product states, quantity badges, and important positive status.
- Soft Lime: `#E8F7E9`
  - Gentle supporting background.
  - Use for chips, badges, light panels, and selected states.
- Warm Yellow: `#FFF4C2`
  - Friendly secondary action color.
  - Use for upload slip buttons, soft highlights, and warm accents.
- Rice Paper: `#F7F8F6`
  - Main calm background.
  - Keeps the UI clean, light, and food-safe.
- Warm Gray: `#8B8F94`
  - Secondary text and helper labels.
  - Use for quiet information, not primary selling text.
- Deep Food Text: `#17251D`
  - Main text color.
  - Softer than pure black while still clear and readable.

## Typography Mood

- Friendly, clear, modern.
- Thai text must feel easy to read, warm, and direct.
- Use strong weight for:
  - Product names.
  - Prices.
  - Checkout totals.
  - Short action labels.
- Use small helper text for guidance, but avoid long paragraphs inside the phone UI.
- Tone should feel like a kind local shop, not a corporate delivery platform.

## Layout Principles

- Start with a large appetizing hero image.
  - The selected product image should be the first visual focus.
  - Product photo should feel bright, clean, and fresh.
- Keep the screen one-page and mobile-first.
  - Customer can select product, adjust quantity, and see cart summary without leaving the page.
- Use horizontal product cards for extra items.
  - Products such as `ปอเปี๊ยะสด`, `เต้าหู้`, and `กุนเชียง` should be swipeable.
  - Tapping a product changes the hero image, title, description, and price.
- Each product should keep its own quantity.
  - Customer can buy mixed items in one order.
  - Cart summary should update immediately.
- Keep checkout action sticky near the bottom.
  - Primary action should always feel close and obvious.
  - Example: `ชำระเงิน ฿110`.
- Payment screen should be calmer than product selection.
  - QR code is the main focus.
  - Total and order summary should be easy to scan.

## Motion / Interaction Feel

- Interactions should feel fast, light, and LINE-native.
- Product selection should be immediate:
  - Tap product card.
  - Hero content changes.
  - Active product card becomes clearly highlighted.
- Quantity changes should update:
  - Selected product quantity.
  - Product card badge.
  - Cart summary.
  - Payment total.
- Horizontal product cards should invite swipe naturally.
- Use soft elevation and rounded shapes.
  - Shadows should feel airy, not heavy.
  - Cards should feel touchable, not boxy.
- No dramatic animation is needed for MVP.
  - Prefer subtle, practical feedback over decorative movement.

## What To Avoid

- Avoid dark, heavy, or overly premium restaurant styling.
- Avoid square, rigid, internal-tool-like components.
- Avoid too many borders, tables, or dashboard patterns on customer screens.
- Avoid making food photos look artificial or different from the real product.
- Avoid overloading the first screen with too much explanation.
- Avoid hiding the checkout action far below the fold.
- Avoid forcing the customer through many pages before payment.
- Avoid marketplace-style complexity at MVP stage.
- Avoid colors that make the food look dull, cold, or less fresh.
- Avoid using AI-generated food visuals as final product truth when real product photos are available.
