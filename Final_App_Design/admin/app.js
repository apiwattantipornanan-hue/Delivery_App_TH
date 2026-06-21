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
    return `<span class="badge paid">Paid</span>`;
  }

  if (order.paymentStatus === "verifying") {
    return `<span class="badge verifying">Verifying</span>`;
  }

  if (order.paymentStatus === "needs_manual_check" || order.paymentStatus === "pending_slip") {
    return `<span class="badge manual">Manual</span>`;
  }

  if (order.paymentStatus === "rejected") {
    return `<span class="badge rejected">Rejected</span>`;
  }

  return `<span class="badge qr">Awaiting Pay</span>`;
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
  const message = order.verification.message ? ` · ${order.verification.message}` : "";
  return `<p class="verification-line">Check: ${provider}${ref}${message}</p>`;
}

function orderCard(order) {
  const items = order.items
    .map((item) => `<li>${item.name} x ${item.qty}</li>`)
    .join("");

  return `
    <article class="order-card ${getOrderCardClass(order)}" data-order="${order.id}">
      <div class="order-top">
        <div>
          <span class="order-id">${order.id}</span>
          <strong class="customer-name">${order.customerName || "ไม่ระบุชื่อ"}</strong>
        </div>
        ${getPaymentBadge(order)}
      </div>

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

      <ul class="item-list">${items}</ul>
      ${getVerificationLine(order)}

      <div class="order-actions">
        <button class="mark-paid" type="button" data-action="paid" data-order="${order.id}">Mark Paid</button>
        <button class="cancel-order" type="button" data-action="cancelled" data-order="${order.id}">Cancel</button>
      </div>
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
