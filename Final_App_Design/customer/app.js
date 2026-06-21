const config = window.APP_CONFIG;
const store = window.FinalAppStore;
const baht = (value) => `฿${Number(value).toLocaleString("th-TH", { minimumFractionDigits: value % 1 ? 2 : 0 })}`;

const state = {
  cart: Object.fromEntries(config.products.map((product) => [product.id, product.id === "roll" ? 1 : 0])),
  orders: [],
  settings: null,
  selectedSlot: null,
  createdOrder: null,
};

const screens = document.querySelectorAll(".screen");
const productList = document.querySelector("#productList");
const productTotal = document.querySelector("#productTotal");
const slotGrid = document.querySelector("#slotGrid");
const checkoutTotal = document.querySelector("#checkoutTotal");
const checkoutDetail = document.querySelector("#checkoutDetail");
const createOrderButton = document.querySelector("#createOrderButton");
const paymentPanel = document.querySelector("#paymentPanel");
const createdOrderId = document.querySelector("#createdOrderId");
const qrCanvas = document.querySelector("#promptPayCanvas");
const qrFallbackImage = document.querySelector("#qrFallbackImage");
const downloadQrButton = document.querySelector("#downloadQrButton");
const qrExpiryCard = document.querySelector("#qrExpiryCard");
const qrExpiryCountdown = document.querySelector("#qrExpiryCountdown");
const slipInput = document.querySelector("#slipInput");
const orderStatusMessage = document.querySelector("#orderStatusMessage");
let expiryTimerId = null;
let expirySyncing = false;

document.querySelector("#shopName").textContent = config.shopName;
document.querySelector("#shopSubtitle").textContent = config.shopSubtitle;
document.querySelector("#mapsLink").href = config.googleMapsUrl;
document.querySelector("#deliveryChoice").href = config.deliveryUrl;
document.querySelector("#deliveryButton").href = config.deliveryUrl;

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === screenId);
  });
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

function getCartLines() {
  return config.products
    .map((product) => ({
      ...product,
      qty: state.cart[product.id] || 0,
    }))
    .filter((product) => product.qty > 0);
}

function getCapacityBoxes() {
  return config.products.reduce((sum, product) => {
    return product.capacityUnit ? sum + (state.cart[product.id] || 0) : sum;
  }, 0);
}

function getCartTotal() {
  return getCartLines().reduce((sum, product) => sum + product.price * product.qty, 0);
}

function isActiveOrder(order) {
  return !["cancelled", "expired"].includes(order.orderStatus);
}

function getSlotUsedBoxes(slot) {
  return state.orders
    .filter((order) => order.fulfillment === "pickup" && order.pickupTime === slot && isActiveOrder(order))
    .reduce((sum, order) => sum + (order.capacityBoxes || 0), 0);
}

function getSlotStatus(slot) {
  if (!state.settings?.stockOpen || state.settings?.closedSlots?.includes(slot)) {
    return { label: "ของหมดชั่วคราว", status: "closed", disabled: true };
  }

  const usedBoxes = getSlotUsedBoxes(slot);
  const nextBoxes = getCapacityBoxes();

  if (usedBoxes + nextBoxes > config.capacityPerSlot) {
    return { label: "เต็มแล้ว", status: "full", disabled: true };
  }

  return { label: "ว่างอยู่", status: "available", disabled: false };
}

function renderProducts() {
  productList.innerHTML = config.products
    .map((product) => {
      const qty = state.cart[product.id] || 0;

      return `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h3>${product.name}</h3>
            <p>${product.desc}</p>
            <small>${baht(product.price)} / ชุด</small>
          </div>
          <div class="stepper">
            <button type="button" data-action="minus" data-product="${product.id}" aria-label="ลด ${product.name}">−</button>
            <strong>${qty}</strong>
            <button type="button" data-action="plus" data-product="${product.id}" aria-label="เพิ่ม ${product.name}">+</button>
          </div>
        </article>
      `;
    })
    .join("");

  productTotal.textContent = baht(getCartTotal());
}

function renderSlots() {
  const slots = generateSlots();

  if (state.selectedSlot) {
    const selectedStatus = getSlotStatus(state.selectedSlot);
    if (selectedStatus.disabled) {
      state.selectedSlot = null;
    }
  }

  slotGrid.innerHTML = slots
    .map((slot) => {
      const slotStatus = getSlotStatus(slot);
      const selected = state.selectedSlot === slot;
      const classes = ["slot-btn", slotStatus.status, selected ? "selected" : ""].join(" ");

      return `
        <button class="${classes}" type="button" data-slot="${slot}" ${slotStatus.disabled ? "disabled" : ""}>
          <strong>${slot}</strong>
          <span>${slotStatus.label}</span>
        </button>
      `;
    })
    .join("");
}

function renderTotals() {
  const total = getCartTotal();
  checkoutTotal.textContent = baht(total);
  checkoutDetail.textContent = state.selectedSlot ? `รับที่ร้าน ${state.selectedSlot}` : "เลือกรอบรับสินค้า";
  createOrderButton.disabled = total <= 0 || !state.selectedSlot;
}

function render() {
  renderProducts();
  renderSlots();
  renderTotals();
}

function getNextOrderId() {
  const today = new Date();
  const dateCode = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const countToday = state.orders.filter((order) => order.id.includes(dateCode)).length + 1;
  return `NB-${dateCode}-${String(countToday).padStart(3, "0")}`;
}

function getPaymentAmount(orderId, baseTotal) {
  if (!config.useUniqueSatang) {
    return baseTotal;
  }

  const sequence = Number(orderId.slice(-3));
  const satang = ((sequence % 90) + 1) / 100;
  return Number((baseTotal + satang).toFixed(2));
}

function getQrExpiresAt(fromDate = new Date()) {
  const minutes = config.qrExpiresInMinutes || 15;
  return new Date(fromDate.getTime() + minutes * 60 * 1000).toISOString();
}

function getLatestCreatedOrder() {
  if (!state.createdOrder) return null;
  return state.orders.find((order) => order.id === state.createdOrder.id) || state.createdOrder;
}

function isQrExpired(order) {
  return Boolean(order?.qrExpiresAt && Date.now() >= Date.parse(order.qrExpiresAt));
}

function canAutoExpire(order) {
  return (
    order &&
    !["paid", "pending_slip", "verifying", "needs_manual_check", "rejected"].includes(order.paymentStatus) &&
    isActiveOrder(order)
  );
}

function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

async function expireCreatedOrderIfNeeded(order) {
  if (!canAutoExpire(order) || expirySyncing) return;

  expirySyncing = true;
  try {
    const patch = {
      paymentStatus: "expired",
      orderStatus: "expired",
      qrExpiredAt: new Date().toISOString(),
    };

    await store.updateOrder(order.id, patch);
    state.createdOrder = { ...order, ...patch };
  } finally {
    expirySyncing = false;
  }
}

function stopExpiryTimer() {
  if (expiryTimerId) {
    window.clearInterval(expiryTimerId);
    expiryTimerId = null;
  }
}

function renderQrExpiry() {
  const order = getLatestCreatedOrder();
  if (!order?.qrExpiresAt) return;

  state.createdOrder = order;
  qrExpiryCard.hidden = false;

  const remaining = Date.parse(order.qrExpiresAt) - Date.now();
  const expired = remaining <= 0;

  qrExpiryCountdown.textContent = expired ? "หมดอายุ" : formatRemaining(remaining);
  qrExpiryCard.classList.toggle("expired", expired);
  downloadQrButton.classList.toggle("is-disabled", expired && canAutoExpire(order));

  if (expired && canAutoExpire(order)) {
    orderStatusMessage.textContent = "QR หมดอายุแล้ว ระบบปล่อยรอบนี้กลับให้ลูกค้าคนอื่น กรุณาสร้างออเดอร์ใหม่";
    expireCreatedOrderIfNeeded(order).catch(() => {
      orderStatusMessage.textContent = "QR หมดอายุแล้ว กรุณาสร้างออเดอร์ใหม่";
    });
  }
}

function startQrExpiryTimer(order) {
  stopExpiryTimer();
  state.createdOrder = order;
  renderQrExpiry();
  expiryTimerId = window.setInterval(renderQrExpiry, 1000);
}

async function verifySlipWithBackend(file, order) {
  if (!config.paymentVerification?.enabled) {
    return {
      status: "manual",
      message: "ยังไม่ได้เปิดระบบตรวจสลิปอัตโนมัติ",
    };
  }

  const body = new FormData();
  body.append("orderId", order.id);
  body.append("expectedAmount", String(order.paymentAmount || order.total));
  body.append("promptPayId", config.promptPayId);
  body.append("slip", file, file.name || "payment-slip.jpg");

  try {
    const response = await fetch(config.paymentVerification.verifyEndpoint, {
      method: "POST",
      body,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok && !data.status) {
      return {
        status: "needs_manual_check",
        message: `ระบบตรวจสลิปตอบกลับไม่สำเร็จ (${response.status})`,
      };
    }

    return data;
  } catch {
    return {
      status: "manual",
      message: "ยังไม่ได้เชื่อม backend ตรวจสลิปในเครื่องนี้ ร้านจะตรวจสลิปเองก่อน",
    };
  }
}

function getVerificationPatch(result, file, expiredBeforeUpload) {
  const base = {
    slipUploaded: true,
    slipFileName: file.name,
    slipUploadedAt: new Date().toISOString(),
    verification: {
      ...(result.verification || {}),
      provider: result.provider || result.verification?.provider || "manual",
      message: result.message,
      checkedAt: result.checkedAt || new Date().toISOString(),
      qrExpiredBeforeUpload: expiredBeforeUpload,
    },
  };

  if (expiredBeforeUpload) {
    return {
      ...base,
      paymentStatus: "needs_manual_check",
      orderStatus: "new",
    };
  }

  if (result.status === "verified") {
    return {
      ...base,
      paymentStatus: "paid",
      orderStatus: "confirmed",
      paidAt: new Date().toISOString(),
    };
  }

  if (result.status === "rejected") {
    return {
      ...base,
      paymentStatus: "rejected",
      orderStatus: "new",
    };
  }

  return {
    ...base,
    paymentStatus: "needs_manual_check",
    orderStatus: "new",
  };
}

function getCustomerVerificationMessage(status, expiredBeforeUpload) {
  if (expiredBeforeUpload) {
    return "รับสลิปแล้ว แต่ QR หมดอายุก่อนอัปโหลด ร้านจะตรวจสอบให้เอง";
  }

  if (status === "verified") {
    return "ตรวจสอบสลิปสำเร็จแล้ว ออเดอร์ถูกยืนยันเรียบร้อย";
  }

  if (status === "rejected") {
    return "สลิปนี้ตรวจไม่ผ่าน กรุณาติดต่อร้านหรืออัปโหลดสลิปที่ถูกต้อง";
  }

  return "รับสลิปแล้ว ระบบส่งต่อให้ร้านตรวจสอบอีกครั้ง";
}

async function createPickupOrder() {
  const customerName = document.querySelector("#customerName").value.trim();
  const customerPhone = document.querySelector("#customerPhone").value.trim();

  if (!customerName || !customerPhone) {
    alert("กรุณากรอกชื่อและเบอร์โทรก่อนสร้าง QR");
    return;
  }

  if (!state.selectedSlot) {
    alert("กรุณาเลือกรอบรับสินค้า");
    return;
  }

  const slotStatus = getSlotStatus(state.selectedSlot);
  if (slotStatus.disabled) {
    alert("รอบนี้ไม่สามารถจองได้ กรุณาเลือกรอบอื่น");
    render();
    return;
  }

  const id = getNextOrderId();
  const total = getCartTotal();
  const paymentAmount = getPaymentAmount(id, total);
  const promptPayPayload = window.PromptPayTools.buildPromptPayPayload(config.promptPayId, paymentAmount);
  const qrGeneratedAt = new Date();

  const order = {
    id,
    fulfillment: "pickup",
    pickupTime: state.selectedSlot,
    customerName,
    customerPhone,
    items: getCartLines().map((line) => ({
      id: line.id,
      name: line.name,
      qty: line.qty,
      price: line.price,
      lineTotal: line.qty * line.price,
    })),
    total,
    paymentAmount,
    capacityBoxes: getCapacityBoxes(),
    promptPayPayload,
    paymentStatus: "awaiting_payment",
    orderStatus: "new",
    slipUploaded: false,
    qrGeneratedAt: qrGeneratedAt.toISOString(),
    qrExpiresAt: getQrExpiresAt(qrGeneratedAt),
    createdAt: qrGeneratedAt.toISOString(),
    updatedAt: qrGeneratedAt.toISOString(),
  };

  await store.createOrder(order);
  state.createdOrder = order;
  paymentPanel.hidden = false;
  createdOrderId.textContent = order.id;

  const rendered = await window.PromptPayTools.renderQr(qrCanvas, promptPayPayload);
  if (!rendered) {
    qrFallbackImage.src = `https://quickchart.io/qr?size=230&text=${encodeURIComponent(promptPayPayload)}`;
    qrFallbackImage.hidden = false;
  }

  try {
    downloadQrButton.href = qrCanvas.toDataURL("image/png");
    downloadQrButton.download = `${order.id}-promptpay.png`;
  } catch {
    downloadQrButton.href = `https://quickchart.io/qr?size=600&text=${encodeURIComponent(promptPayPayload)}`;
  }

  orderStatusMessage.textContent = `สร้าง Dynamic QR แล้ว กรุณาชำระเงินภายใน ${config.qrExpiresInMinutes || 15} นาที`;
  startQrExpiryTimer(order);
  render();
}

productList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-product][data-action]");
  if (!button) return;

  const productId = button.dataset.product;
  const delta = button.dataset.action === "plus" ? 1 : -1;
  state.cart[productId] = Math.max(0, (state.cart[productId] || 0) + delta);
  paymentPanel.hidden = true;
  state.createdOrder = null;
  stopExpiryTimer();
  render();
});

slotGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-slot]");
  if (!button || button.disabled) return;

  state.selectedSlot = button.dataset.slot;
  paymentPanel.hidden = true;
  state.createdOrder = null;
  stopExpiryTimer();
  render();
});

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.next));
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.back));
});

document.querySelector("#pickupChoice").addEventListener("click", () => showScreen("productScreen"));
document.querySelector("#toCheckoutButton").addEventListener("click", () => {
  if (getCartTotal() <= 0) {
    alert("กรุณาเลือกสินค้าอย่างน้อย 1 รายการ");
    return;
  }
  showScreen("checkoutScreen");
});

createOrderButton.addEventListener("click", createPickupOrder);

slipInput.addEventListener("change", async () => {
  if (!state.createdOrder || !slipInput.files?.length) {
    return;
  }

  const file = slipInput.files[0];
  const latestOrder = getLatestCreatedOrder();
  const expiredBeforeUpload = isQrExpired(latestOrder);

  orderStatusMessage.textContent = "กำลังตรวจสอบสลิป...";

  await store.updateOrder(latestOrder.id, {
    paymentStatus: "verifying",
    orderStatus: "new",
    slipUploaded: true,
    slipFileName: file.name,
    slipUploadedAt: new Date().toISOString(),
  });

  const result = expiredBeforeUpload
    ? { status: "manual", message: "QR expired before slip upload." }
    : await verifySlipWithBackend(file, latestOrder);
  const patch = getVerificationPatch(result, file, expiredBeforeUpload);

  await store.updateOrder(latestOrder.id, patch);
  state.createdOrder = { ...latestOrder, ...patch };
  orderStatusMessage.textContent = getCustomerVerificationMessage(result.status, expiredBeforeUpload);
  renderQrExpiry();
});

store.subscribeOrders((orders) => {
  state.orders = orders;
  if (state.createdOrder) {
    state.createdOrder = orders.find((order) => order.id === state.createdOrder.id) || state.createdOrder;
  }
  render();
  renderQrExpiry();
});

store.subscribeSettings((settings) => {
  state.settings = settings;
  render();
});

render();
