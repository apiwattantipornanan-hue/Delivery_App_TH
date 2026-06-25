const config = window.APP_CONFIG;
const store = window.FinalAppStore;
const baht = (value) => `฿${Number(value).toLocaleString("th-TH", { minimumFractionDigits: value % 1 ? 2 : 0 })}`;

let orders = [];
let settings = null;

const slotColumns = document.querySelector("#slotColumns");
const stockToggle = document.querySelector("#stockToggle");
const shopStatusText = document.querySelector("#shopStatusText");
const totalOrders = document.querySelector("#totalOrders");
const pendingOrders = document.querySelector("#pendingOrders");
const paidOrders = document.querySelector("#paidOrders");
const totalBoxes = document.querySelector("#totalBoxes");

function isActiveOrder(order) {
  return !["cancelled", "expired"].includes(order.orderStatus);
}

function generateSlots() {
  const slots = [];
  const [startHour, startMinute] = config.pickupStart.split(":").map(Number);
  const [endHour, endMinute] = config.pickupEnd.split(":").map(Number);
  const current = new Date(2026, 0, 1, startHour, startMinute);
  const end = new Date(2026, 0, 1, endHour, endMinute);

  while (current <= end) {
    slots.push(current.toTimeString().slice(0, 5));
    current.setMinutes(current.getMinutes() + config.pickupIntervalMinutes);
  }

  return slots;
}

function getPaymentBadge(order) {
  if (order.paymentStatus === "paid") {
    return `<div class="payment-status paid"><span>ชำระเงิน</span><strong>ชำระแล้ว</strong></div>`;
  }

  if (order.paymentStatus === "verifying") {
    return `<div class="payment-status verifying"><span>ชำระเงิน</span><strong>ตรวจยอด</strong></div>`;
  }

  if (order.paymentStatus === "needs_manual_check" || order.paymentStatus === "pending_slip") {
    return `<div class="payment-status manual"><span>ชำระเงิน</span><strong>รอตรวจยอดโอน</strong></div>`;
  }

  if (order.paymentStatus === "rejected") {
    return `<div class="payment-status rejected"><span>ชำระเงิน</span><strong>ยอดไม่ผ่าน</strong></div>`;
  }

  return `<div class="payment-status qr"><span>ชำระเงิน</span><strong>รอชำระ</strong></div>`;
}

function getOrderCardClass(order) {
  if (order.paymentStatus === "paid") {
    return "paid-card";
  }

  if (order.paymentStatus === "verifying") {
    return "verifying-card";
  }

  if (order.paymentStatus === "needs_manual_check" || order.paymentStatus === "pending_slip") {
    return "pending-card";
  }

  if (order.paymentStatus === "rejected") {
    return "rejected-card";
  }

  return "qr-card";
}

function getVerificationLine(order) {
  if (!order.verification) return "";

  const provider = order.verification.provider || "manual";
  const ref = order.verification.transRef ? ` · ${order.verification.transRef}` : "";
  const label = provider === "manual_bank_check" ? "ลูกค้าแจ้งโอนแล้ว รอตรวจในแอปธนาคาร" : provider;
  return `<p class="verification-line">ตรวจยอด: ${label}${ref}</p>`;
}

function getOrderProducts(order) {
  return (order.items || []).filter((item) => item.type !== "add_on");
}

function getOrderAddOns(order) {
  return (order.items || []).filter((item) => item.type === "add_on");
}

function getMustardLabel(order) {
  return getOrderAddOns(order).some((item) => item.id === "mustard" && Number(item.qty || 0) > 0)
    ? "มีมัสตาร์ด"
    : "ไม่มีมัสตาร์ด";
}

function renderLineItems(items, emptyText) {
  if (!items.length) {
    return `<div class="line-empty">${emptyText}</div>`;
  }

  return items
    .map(
      (item) => `
        <div class="line-item">
          <span>${item.name}</span>
          <strong>x ${item.qty}</strong>
        </div>
      `,
    )
    .join("");
}

function getFulfillmentStatus(order) {
  if (order.orderStatus === "ready_for_pickup") {
    return `<div class="prep-status ready"><span>รับสินค้า</span><strong>พร้อมรับ</strong></div>`;
  }

  if (order.orderStatus === "picked_up") {
    return `<div class="prep-status completed"><span>รับสินค้า</span><strong>รับแล้ว</strong></div>`;
  }

  if (order.paymentStatus === "paid" || order.orderStatus === "confirmed") {
    return `<div class="prep-status preparing"><span>รับสินค้า</span><strong>กำลังเตรียม</strong></div>`;
  }

  return `<div class="prep-status waiting"><span>รับสินค้า</span><strong>รอชำระ</strong></div>`;
}

function getOrderActions(order) {
  if (order.orderStatus === "picked_up") {
    return `
      <div class="order-actions one-action">
        <button class="complete-order" type="button" disabled>เสร็จแล้ว</button>
      </div>
    `;
  }

  if (order.orderStatus === "ready_for_pickup") {
    return `
      <div class="order-actions">
        <button class="picked-up" type="button" data-action="picked_up" data-order="${order.id}">ลูกค้ารับแล้ว</button>
        <button class="cancel-order" type="button" data-action="cancelled" data-order="${order.id}">ยกเลิก</button>
      </div>
    `;
  }

  if (order.paymentStatus === "paid" || order.orderStatus === "confirmed") {
    return `
      <div class="order-actions">
        <button class="ready-pickup" type="button" data-action="ready" data-order="${order.id}">อาหารพร้อมแล้ว</button>
        <button class="cancel-order" type="button" data-action="cancelled" data-order="${order.id}">ยกเลิก</button>
      </div>
    `;
  }

  return `
    <div class="order-actions">
      <button class="mark-paid" type="button" data-action="paid" data-order="${order.id}">ยืนยันชำระเงิน</button>
      <button class="cancel-order" type="button" data-action="cancelled" data-order="${order.id}">ยกเลิก</button>
    </div>
  `;
}

function orderCard(order) {
  const products = getOrderProducts(order);
  const addOns = getOrderAddOns(order);
  const mustardLabel = getMustardLabel(order);
  const mustardClass = mustardLabel.startsWith("มี") ? "has-mustard" : "no-mustard";

  return `
    <article class="order-card ${getOrderCardClass(order)}" data-order="${order.id}">
      <div class="order-top">
        <div>
          <span class="order-id">${order.id}</span>
          <strong class="customer-name">${order.customerName || "ไม่ระบุชื่อ"}</strong>
        </div>
      </div>

      ${getOrderActions(order)}

      <div class="kitchen-summary ${mustardClass}">
        <span>รอบ ${order.pickupTime || "-"}</span>
        <strong>${mustardLabel}</strong>
      </div>

      ${getPaymentBadge(order)}
      ${getFulfillmentStatus(order)}

      <div class="order-meta">
        <div>
          <span>จำนวน</span>
          <strong>${order.capacityBoxes || 0} Boxes</strong>
        </div>
        <div>
          <span>ยอดชำระ</span>
          <strong>${baht(order.paymentAmount || order.total || 0)}</strong>
        </div>
      </div>

      <section class="item-panel">
        <div class="item-section">
          <span class="item-heading">สินค้า</span>
          ${renderLineItems(products, "ไม่มีสินค้า")}
        </div>
        <div class="item-section addon">
          <span class="item-heading">ตัวเลือกเพิ่ม</span>
          ${renderLineItems(addOns, "ไม่มีตัวเลือกเพิ่ม")}
        </div>
      </section>

      ${getVerificationLine(order)}
    </article>
  `;
}

function renderStats() {
  const activeOrders = orders.filter(isActiveOrder);
  totalOrders.textContent = activeOrders.length;
  pendingOrders.textContent = activeOrders.filter((order) => order.paymentStatus !== "paid").length;
  paidOrders.textContent = activeOrders.filter((order) => order.paymentStatus === "paid").length;
  totalBoxes.textContent = activeOrders.reduce((sum, order) => sum + (order.capacityBoxes || 0), 0);
}

function renderSettings() {
  const isOpen = settings?.stockOpen !== false;
  stockToggle.textContent = isOpen ? "เปิด" : "ปิด";
  stockToggle.classList.toggle("closed", !isOpen);
  shopStatusText.textContent = isOpen ? "เปิดรับออเดอร์" : "ของหมดชั่วคราว";
}

function renderQueue() {
  const slots = generateSlots();
  const activeOrders = orders.filter(isActiveOrder);

  slotColumns.innerHTML = slots
    .map((slot) => {
      const slotOrders = activeOrders
        .filter((order) => order.pickupTime === slot)
        .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
      const boxes = slotOrders.reduce((sum, order) => sum + (order.capacityBoxes || 0), 0);
      const slotClass = [
        "slot-column",
        slotOrders.length ? "has-orders" : "is-empty",
        boxes >= config.capacityPerSlot ? "is-full" : "",
      ].join(" ");

      return `
        <section class="${slotClass}">
          <div class="slot-header">
            <h3>${slot}</h3>
            <span>${boxes}/${config.capacityPerSlot} boxes</span>
          </div>
          <div class="order-list">
            ${
              slotOrders.length
                ? slotOrders.map(orderCard).join("")
                : `<div class="empty-slot">ยังไม่มีออเดอร์รอบนี้</div>`
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function render() {
  renderStats();
  renderSettings();
  renderQueue();
}

stockToggle.addEventListener("click", async () => {
  await store.saveSettings({
    ...settings,
    stockOpen: settings?.stockOpen === false,
  });
});

slotColumns.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action][data-order]");
  if (!button) return;

  if (button.dataset.action === "paid") {
    await store.updateOrder(button.dataset.order, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
      paidAt: new Date().toISOString(),
    });
  }

  if (button.dataset.action === "ready") {
    await store.updateOrder(button.dataset.order, {
      orderStatus: "ready_for_pickup",
      readyAt: new Date().toISOString(),
    });
  }

  if (button.dataset.action === "picked_up") {
    await store.updateOrder(button.dataset.order, {
      orderStatus: "picked_up",
      pickedUpAt: new Date().toISOString(),
    });
  }

  if (button.dataset.action === "cancelled") {
    await store.updateOrder(button.dataset.order, {
      orderStatus: "cancelled",
    });
  }
});

store.subscribeOrders((nextOrders) => {
  orders = nextOrders;
  render();
});

store.subscribeSettings((nextSettings) => {
  settings = nextSettings;
  render();
});
