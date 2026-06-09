<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Customer UI Directions Demo</title>
  <link rel="stylesheet" href="customer-ui-demo.css" />
</head>
<body>
  <header class="demo-hero">
    <div class="demo-hero__eyebrow">Customer UI/UX Moodboard Demo</div>
    <h1>3 แนวทางหน้าลูกค้า สำหรับร้านปอเปี๊ยะสด</h1>
    <p>
      แต่ละแบบเป็นคนละ direction จริง: โทนสี ฟอนต์ บรรยากาศ และ hero visual ต่างกัน
      แต่ยังคง practical, delicious, และพร้อมนำไปใช้เป็น demo ต่อได้
    </p>
  </header>

  <main class="directions">
    <section class="direction direction--garden" data-pattern="garden" data-price="50">
      <div class="direction__intro">
        <div>
          <span class="direction__number">Pattern 01</span>
          <h2>สวนครัวอบอุ่น</h2>
          <p>
            อารมณ์ร้านอาหารบ้าน ๆ ที่สะอาด นุ่ม และจริงใจ ให้ภาพอาหารเป็นพระเอก
            เหมาะกับร้านเล็กที่อยากดูน่าเชื่อถือโดยไม่หรูเกินไป
          </p>
        </div>
        <div class="palette-card palette-card--fresh">
          <h3>Color Palette</h3>
          <div class="palette-list">
            <span>
              <i style="--swatch: #06c755"></i>
              <strong>LINE Green</strong>
              <small>#06C755</small>
            </span>
            <span>
              <i style="--swatch: #e8f7e9"></i>
              <strong>Soft Lime</strong>
              <small>#E8F7E9</small>
            </span>
            <span>
              <i style="--swatch: #fff4c2"></i>
              <strong>Warm Yellow</strong>
              <small>#FFF4C2</small>
            </span>
            <span>
              <i style="--swatch: #f7f8f6"></i>
              <strong>Rice Paper</strong>
              <small>#F7F8F6</small>
            </span>
            <span>
              <i style="--swatch: #8b8f94"></i>
              <strong>Warm Gray</strong>
              <small>#8B8F94</small>
            </span>
          </div>
        </div>
      </div>

      <div class="direction__notes direction__notes--fresh">
        <span>Typography: Friendly · Clear · Modern</span>
        <span>อ่านง่าย อบอุ่น เป็นมิตร</span>
        <span>Atmosphere: สดใหม่ น่ากิน ใช้งานง่าย เร็ว</span>
        <span>Hero: Fresh & Tasty product tile</span>
      </div>

      <div class="fresh-board">
        <div class="fresh-typo-card">
          <span>Aa</span>
          <div>
            <strong>Friendly · Clear · Modern</strong>
            <small>อ่านง่าย อบอุ่น เป็นมิตร</small>
          </div>
        </div>
        <div class="fresh-atmosphere-card">
          <h3>UI Atmosphere</h3>
          <p><b>สดใหม่ น่ากิน</b><small>Fresh & Delicious</small></p>
          <p><b>ใช้งานง่าย เร็ว</b><small>Simple & Fast</small></p>
          <p><b>อบอุ่น เป็นกันเอง</b><small>Warm & Friendly</small></p>
          <p><b>LINE เข้าใจง่าย</b><small>LINE-native feel</small></p>
        </div>
        <div class="fresh-hero-card">
          <img src="Moodboard_Directions/ai_food_demo/fresh_roll_ai_clean.png" alt="Fresh and tasty hero visual" />
          <strong>Fresh<br />&amp; Tasty!</strong>
        </div>
      </div>

      <div class="screens">
        <article class="phone garden-phone">
          <div class="phone__bar"></div>
          <div class="garden-shell">
            <div class="garden-top">
              <span>สดใหม่วันนี้</span>
              <strong>ปอเปี๊ยะโฮมเมด</strong>
            </div>
            <div class="garden-hero garden-hero--shop">
              <img data-garden-hero src="Moodboard_Directions/ai_food_demo/fresh_roll_ai_clean.png" alt="ปอเปี๊ยะสดไส้รวม" />
              <div class="garden-blob garden-blob--one"></div>
              <div class="garden-blob garden-blob--two"></div>
            </div>
            <div class="product-card product-card--garden">
              <div>
                <p class="product-card__label" data-garden-label>เมนูแนะนำ</p>
                <h3 data-garden-title>ปอเปี๊ยะสดไส้รวม</h3>
                <p data-garden-desc>เต้าหู้ กุนเชียง ผักสด และน้ำจิ้มถั่วรสกลมกล่อม</p>
              </div>
              <div class="price-pill" data-garden-price>฿50</div>
            </div>

            <div class="product-slider">
              <div class="section-heading">
                <span>เลือกเมนูเพิ่ม</span>
                <small>เลื่อนดูได้</small>
              </div>
              <div class="product-track" aria-label="เมนูสินค้า">
                <button class="mini-product is-active" type="button" data-product-card data-product-id="roll">
                  <img src="Moodboard_Directions/ai_food_demo/fresh_roll_ai_clean.png" alt="ปอเปี๊ยะสดไส้รวม" />
                  <strong>ปอเปี๊ยะสด</strong>
                  <span>฿50</span>
                  <em data-card-qty="roll">1</em>
                </button>
                <button class="mini-product" type="button" data-product-card data-product-id="tofu">
                  <img src="Moodboard_Directions/ai_food_demo/tofu_ai_clean.png" alt="เต้าหู้" />
                  <strong>เต้าหู้</strong>
                  <span>฿25</span>
                  <em data-card-qty="tofu">0</em>
                </button>
                <button class="mini-product" type="button" data-product-card data-product-id="sausage">
                  <img src="Moodboard_Directions/ai_food_demo/chinese_sausage_ai_extra_dry.png" alt="กุนเชียง" />
                  <strong>กุนเชียง</strong>
                  <span>฿35</span>
                  <em data-card-qty="sausage">0</em>
                </button>
              </div>
            </div>

            <div class="quantity-row">
              <span data-garden-qty-label>จำนวนปอเปี๊ยะสด</span>
              <div class="stepper">
                <button type="button" data-garden-action="minus" aria-label="ลดจำนวน">−</button>
                <strong data-garden-current-quantity>1</strong>
                <button type="button" data-garden-action="plus" aria-label="เพิ่มจำนวน">+</button>
              </div>
            </div>

            <div class="cart-summary">
              <div>
                <span>ตะกร้าของคุณ</span>
                <strong data-garden-cart-count>1 รายการ</strong>
              </div>
              <p data-garden-cart-lines>ปอเปี๊ยะสด x1</p>
            </div>

            <button class="main-cta sticky-cta" type="button">ชำระเงิน <span data-garden-total>฿50</span></button>
          </div>
        </article>

        <article class="phone garden-phone payment-phone">
          <div class="phone__bar"></div>
          <div class="payment-shell payment-shell--garden">
            <span class="payment-badge">PromptPay</span>
            <h3>ชำระเงิน</h3>
            <p>สแกน QR ด้วยแอปธนาคาร หรือดาวน์โหลด QR เพื่อไปสแกนต่อ</p>
            <strong class="payment-total" data-garden-total>฿50</strong>
            <div class="payment-mini-summary">
              <span>รายการ</span>
              <p data-garden-payment-lines>ปอเปี๊ยะสด x1</p>
            </div>
            <div class="qr-card qr-card--garden" aria-label="QR Code mockup">
              <div class="qr-grid"></div>
            </div>
            <button class="download-btn" type="button">ดาวน์โหลด QR Code</button>
            <button class="upload-btn" type="button">อัปโหลดสลิปโอนเงิน</button>
            <small>ร้านจะยืนยันคำสั่งซื้อหลังตรวจสอบสลิป</small>
          </div>
        </article>
      </div>
    </section>

    <section class="direction direction--market" data-pattern="market" data-price="50">
      <div class="direction__intro">
        <div>
          <span class="direction__number">Pattern 02</span>
          <h2>ตลาดเช้าคลีน</h2>
          <p>
            สดใสกว่าแบบแรก เหมาะกับอนาคตที่มีหลายสินค้า ให้ความรู้สึกเลือกง่าย
            คล้ายร้านอาหารใน LINE ที่เร็ว เป็นมิตร และเห็นรายการชัด
          </p>
        </div>
        <div class="moodboard">
          <span style="--swatch: #f9f5df"></span>
          <span style="--swatch: #ffb25b"></span>
          <span style="--swatch: #58a681"></span>
          <span style="--swatch: #d94f38"></span>
        </div>
      </div>

      <div class="direction__notes">
        <span>Typography: สดใส เป็นกันเอง</span>
        <span>Atmosphere: ตลาดเช้าสะอาด เลือกเร็ว</span>
        <span>Hero: ถาดสินค้าแบบ horizontal tile</span>
      </div>

      <div class="screens">
        <article class="phone market-phone">
          <div class="phone__bar"></div>
          <div class="market-shell">
            <div class="market-header">
              <div>
                <span>เปิดรับออเดอร์</span>
                <h3>เลือกชุดอร่อย</h3>
              </div>
              <div class="market-cart">1</div>
            </div>
            <div class="market-strip">
              <div class="market-tile market-tile--big">
                <img src="Moodboard_Directions/ai_food_demo/fresh_roll_ai_clean.png" alt="ปอเปี๊ยะสดไส้รวม" />
                <strong>ปอเปี๊ยะสด</strong>
              </div>
              <div class="market-tile">
                <img src="Moodboard_Directions/ai_food_demo/tofu_ai_clean.png" alt="เต้าหู้" />
                <strong>เต้าหู้</strong>
              </div>
              <div class="market-tile">
                <img src="Moodboard_Directions/ai_food_demo/chinese_sausage_ai_extra_dry.png" alt="กุนเชียง" />
                <strong>กุนเชียง</strong>
              </div>
            </div>
            <div class="ticket-card">
              <span class="ticket-card__tag">ขายดีวันนี้</span>
              <h3>ปอเปี๊ยะสดไส้รวม</h3>
              <p>น้ำจิ้มถั่วโฮมเมด แยกน้ำจิ้มให้ พร้อมทาน</p>
              <div class="ticket-card__meta">
                <strong>฿50 / ชุด</strong>
                <div class="stepper">
                  <button type="button" data-action="minus" aria-label="ลดจำนวน">−</button>
                  <strong data-quantity>1</strong>
                  <button type="button" data-action="plus" aria-label="เพิ่มจำนวน">+</button>
                </div>
              </div>
            </div>
            <button class="main-cta main-cta--market" type="button">ไปชำระเงิน <span data-total>฿50</span></button>
          </div>
        </article>

        <article class="phone market-phone payment-phone">
          <div class="phone__bar"></div>
          <div class="market-payment">
            <div class="receipt-head">
              <span>สรุปยอด</span>
              <strong data-total>฿50</strong>
            </div>
            <div class="receipt-line">
              <span>ปอเปี๊ยะสดไส้รวม</span>
              <span><span data-quantity>1</span> ชุด</span>
            </div>
            <div class="qr-card qr-card--market" aria-label="QR Code mockup">
              <div class="qr-grid"></div>
            </div>
            <p>สแกนจ่ายผ่าน PromptPay แล้วแนบสลิปเพื่อให้ร้านยืนยัน</p>
            <button class="download-btn download-btn--market" type="button">ดาวน์โหลด QR</button>
            <button class="upload-btn upload-btn--market" type="button">แนบสลิป</button>
          </div>
        </article>
      </div>
    </section>

    <section class="direction direction--calm" data-pattern="calm" data-price="50">
      <div class="direction__intro">
        <div>
          <span class="direction__number">Pattern 03</span>
          <h2>มินิมอลพร้อมส่ง</h2>
          <p>
            เรียบกว่าแต่ไม่เย็นชา ใช้ภาพใหญ่และพื้นที่ว่างเพื่อให้ดู premium เล็กน้อย
            เหมาะกับ demo ที่อยากให้ดู modern และพร้อมต่อยอดเป็น PWA จริง
          </p>
        </div>
        <div class="moodboard">
          <span style="--swatch: #fbf3ea"></span>
          <span style="--swatch: #d8794a"></span>
          <span style="--swatch: #395c48"></span>
          <span style="--swatch: #21170f"></span>
        </div>
      </div>

      <div class="direction__notes">
        <span>Typography: Modern Thai, น้ำหนักชัด</span>
        <span>Atmosphere: สงบ สะอาด พร้อมใช้</span>
        <span>Hero: ภาพ crop ใหญ่แบบ editorial</span>
      </div>

      <div class="screens">
        <article class="phone calm-phone">
          <div class="phone__bar"></div>
          <div class="calm-shell">
            <div class="calm-hero">
              <img src="Moodboard_Directions/ai_food_demo/fresh_roll_ai_clean.png" alt="ปอเปี๊ยะสดไส้รวม" />
              <div class="calm-hero__copy">
                <span>พร้อมส่งวันนี้</span>
                <h3>ปอเปี๊ยะสดไส้รวม</h3>
              </div>
            </div>
            <div class="calm-content">
              <p>ชุดอิ่มพอดี สด สะอาด พร้อมน้ำจิ้มถั่วโฮมเมด</p>
              <div class="calm-details">
                <span>฿50 / ชุด</span>
                <span>ทำสดเป็นรอบ</span>
              </div>
              <div class="calm-order">
                <div>
                  <span>จำนวน</span>
                  <div class="stepper stepper--calm">
                    <button type="button" data-action="minus" aria-label="ลดจำนวน">−</button>
                    <strong data-quantity>1</strong>
                    <button type="button" data-action="plus" aria-label="เพิ่มจำนวน">+</button>
                  </div>
                </div>
                <button class="main-cta main-cta--calm" type="button">สั่งเลย <span data-total>฿50</span></button>
              </div>
            </div>
          </div>
        </article>

        <article class="phone calm-phone payment-phone">
          <div class="phone__bar"></div>
          <div class="calm-payment">
            <span class="payment-badge payment-badge--calm">PromptPay QR</span>
            <h3>ยอดชำระ <strong data-total>฿50</strong></h3>
            <div class="qr-card qr-card--calm" aria-label="QR Code mockup">
              <div class="qr-grid"></div>
            </div>
            <div class="calm-payment__actions">
              <button class="download-btn download-btn--calm" type="button">ดาวน์โหลด QR</button>
              <button class="upload-btn upload-btn--calm" type="button">อัปโหลดสลิป</button>
            </div>
            <p>หลังร้านตรวจสอบสลิปแล้ว ระบบจะแจ้งสถานะคำสั่งซื้อ</p>
          </div>
        </article>
      </div>
    </section>
  </main>

  <script src="customer-ui-demo.js"></script>
</body>
</html>
