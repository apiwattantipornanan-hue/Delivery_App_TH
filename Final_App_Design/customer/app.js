const config = window.APP_CONFIG;
const store = window.FinalAppStore;
const baht = (value) => `฿${Number(value).toLocaleString("th-TH", { minimumFractionDigits: value % 1 ? 2 : 0 })}`;
const LAST_ORDER_ID_KEY = "final-app-last-order-id";

const state = {
  cart: Object.fromEntries(config.products.map((product) => [product.id, product.id === "roll" ? 1 : 0])),
  addOns: Object.fromEntries((config.addOns || []).map((addOn) => [addOn.id, false])),
  orders: [],
  settings: null,
  selectedSlot: null,
  createdOrder: null,
};

const screens = document.querySelectorAll(".screen");
const productList = document.querySelector("#productList");
const addOnList = document.querySelector("#addOnList");
const productTotal = document.querySelector("#productTotal");
const slotGrid = document.querySelector("#slotGrid");
const checkoutTotal = document.querySelector("#checkoutTotal");
const checkoutDetail = document.querySelector("#checkoutDetail");
const createOrderButton = document.querySelector("#createOrderButton");
const paymentPanel = document.querySelector("#paymentPanel");
const createdOrderId = document.querySelector("#createdOrderId");
const customerOrderStatusCard = document.querySelector("#customerOrderStatusCard");
const customerOrderStatusLabel = document.querySelector("#customerOrderStatusLabel");
const customerOrderStatusText = document.querySelector("#customerOrderStatusText");
const customerPickupMap = document.querySelector("#customerPickupMap");
const qrWrap = document.querySelector(".qr-wrap");
const qrCanvas = document.querySelector("#promptPayCanvas");
const qrFallbackImage = document.querySelector("#qrFallbackImage");
const downloadQrButton = document.querySelector("#downloadQrButton");
const qrNote = document.querySelector(".qr-note");
const qrExpiryCard = document.querySelector("#qrExpiryCard");
const qrExpiryCountdown = document.querySelector("#qrExpiryCountdown");
const uploadSlipLabel = document.querySelector(".upload-slip");
const slipInput = document.querySelector("#slipInput");
const orderStatusMessage = document.querySelector("#orderStatusMessage");
let expiryTimerId = null;
let expirySyncing = false;

document.querySelector("#shopName").textContent = config.shopName;
document.querySelector("#shopSubtitle").textContent = config.shopSubtitle;
document.querySelector("#mapsLink").href = config.googleMapsUrl;
document.querySelector("#deliveryChoice").href = config.deliveryUrl;
document.querySelector("#deliveryButton").href = config.deliveryUrl;
customerPickupMap.href = config.googleMapsUrl;

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

function getAddOnLines() {
  return (config.addOns || [])
    .map((addOn) => ({
      ...addOn,
      qty: state.addOns[addOn.id] ? 1 : 0,
    }))
    .filter((addOn) => addOn.qty > 0);
}

function getCapacityBoxes() {
  return config.products.reduce((sum, product) => {
    return product.capacityUnit ? sum + (state.cart[product.id] || 0) : sum;
  }, 0);
}

function getCartTotal() {
  const productTotalValue = getCartLines().reduce((sum, product) => sum + product.price * product.qty, 0);
  const addOnTotalValue = getAddOnLines().reduce((sum, addOn) => sum + addOn.price * addOn.qty, 0);
  return productTotalValue + addOnTotalValue;
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
      const desc = product.desc ? `<p>${product.desc}</p>` : "";
      const note = product.note ? `<p class="product-note">${product.note}</p>` : "";
      const unitLabel = product.unitLabel || "ชุด";

      return `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h3>${product.name}</h3>
            ${desc}
            ${note}
            <small>${baht(product.price)} / ${unitLabel}</small>
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

function renderAddOns() {
  const addOns = config.addOns || [];
  if (!addOnList || !addOns.length) {
    return;
  }

  addOnList.innerHTML = `
    <section class="addon-section" aria-label="ตัวเลือกเพิ่มเติม">
      <div class="addon-heading">
        <span>ตัวเลือกเพิ่มเติม</span>
        <p>ติ๊กเพิ่มเฉพาะที่ต้องการ</p>
      </div>
      ${addOns
        .map((addOn) => {
          const selected = Boolean(state.addOns[addOn.id]);

          return `
            <label class="addon-card ${selected ? "selected" : ""}">
              <input type="checkbox" data-addon="${addOn.id}" ${selected ? "checked" : ""} />
              <span class="addon-check" aria-hidden="true"></span>
              <span class="addon-copy">
                <strong>${addOn.name}</strong>
                <small>${addOn.desc}</small>
              </span>
              <b>${baht(addOn.price)}</b>
            </label>
          `;
        })
        .join("")}
    </section>
  `;
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
  createOrderButton.disabled = getCartLines().length <= 0 || !state.selectedSlot;
}

function render() {
  renderProducts();
  renderAddOns();
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

function rememberOrder(orderId) {
  try {
    localStorage.setItem(LAST_ORDER_ID_KEY, orderId);
  } catch {
    // Ignore private-browsing storage failures. Live Firestore still works while the page is open.
  }
}

function getRememberedOrderId() {
  try {
    return localStorage.getItem(LAST_ORDER_ID_KEY);
  } catch {
    return null;
  }
}

function getQrExpiresAt(fromDate = new Date()) {
  const minutes = config.qrExpiresInMinutes || 15;
  return new Date(fromDate.getTime() + minutes * 60 * 1000).toISOString();
}

function getLatestCreatedOrder() {
  const trackedOrderId = state.createdOrder?.id || getRememberedOrderId();
  if (!trackedOrderId) return null;
  return state.orders.find((order) => order.id === trackedOrderId) || state.createdOrder;
}

function isQrExpired(order) {
  return Boolean(order?.qrExpiresAt && Date.now() >= Date.parse(order.qrExpiresAt));
}

function isPaymentFinished(order) {
  return Boolean(
    order &&
      (order.paymentStatus === "paid" ||
        ["confirmed", "ready_for_pickup", "picked_up"].includes(order.orderStatus)),
  );
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

  if (isPaymentFinished(order)) {
    qrExpiryCard.hidden = true;
    downloadQrButton.classList.add("is-disabled");
    return;
  }

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

function getCustomerOrderStatus(order) {
  if (!order) {
    return null;
  }

  if (order.orderStatus === "ready_for_pickup") {
    return {
      className: "ready",
      label: "อาหารพร้อมรับแล้ว",
      text: `ออเดอร์รอบ ${order.pickupTime} พร้อมแล้ว มารับที่ร้านได้เลยค่ะ`,
      showMap: true,
    };
  }

  if (order.orderStatus === "picked_up") {
    return {
      className: "completed",
      label: "รับสินค้าแล้ว",
      text: "ขอบคุณมากค่ะ ขอให้อร่อยนะคะ",
      showMap: false,
    };
  }

  if (order.orderStatus === "cancelled") {
    return {
      className: "problem",
      label: "ออเดอร์ถูกยกเลิก",
      text: "หากต้องการสั่งใหม่ กรุณาสร้างออเดอร์อีกครั้งค่ะ",
      showMap: false,
    };
  }

  if (order.orderStatus === "expired" || order.paymentStatus === "expired") {
    return {
      className: "problem",
      label: "QR หมดอายุแล้ว",
      text: "ระบบปล่อยรอบนี้กลับให้ลูกค้าคนอื่น กรุณาสร้างออเดอร์ใหม่ค่ะ",
      showMap: false,
    };
  }

  if (order.paymentStatus === "rejected") {
    return {
      className: "problem",
      label: "สลิปยังไม่ผ่าน",
      text: "กรุณาติดต่อร้านหรืออัปโหลดสลิปที่ถูกต้องอีกครั้งค่ะ",
      showMap: false,
    };
  }

  if (order.paymentStatus === "paid" || order.orderStatus === "confirmed") {
    return {
      className: "preparing",
      label: "ชำระแล้ว กำลังเตรียมอาหาร",
      text: "ร้านรับออเดอร์แล้วค่ะ ถ้าอาหารพร้อมเมื่อไร หน้านี้จะอัปเดตเป็นพร้อมรับ",
      showMap: false,
    };
  }

  if (order.paymentStatus === "verifying" || order.paymentStatus === "needs_manual_check") {
    return {
      className: "waiting",
      label: "ร้านกำลังตรวจสอบสลิป",
      text: "ร้านจะตรวจเงินเข้าในแอปธนาคารก่อนยืนยันออเดอร์ค่ะ",
      showMap: false,
    };
  }

  return {
    className: "waiting",
    label: "รอชำระเงิน",
    text: `กรุณาชำระเงินและอัปโหลดสลิปภายใน ${config.qrExpiresInMinutes || 15} นาที`,
    showMap: false,
  };
}

function renderCustomerOrderStatus() {
  const order = getLatestCreatedOrder();

  if (!order) {
    customerOrderStatusCard.hidden = true;
    qrWrap.hidden = false;
    qrNote.hidden = false;
    downloadQrButton.hidden = false;
    uploadSlipLabel.hidden = false;
    orderStatusMessage.hidden = false;
    return;
  }

  const status = getCustomerOrderStatus(order);
  const paymentFinished = isPaymentFinished(order);

  customerOrderStatusCard.hidden = false;
  customerOrderStatusCard.className = `customer-status-card ${status.className}`;
  customerOrderStatusLabel.textContent = status.label;
  customerOrderStatusText.textContent = status.text;
  customerPickupMap.hidden = !status.showMap;
  qrWrap.hidden = paymentFinished;
  qrNote.hidden = paymentFinished;
  downloadQrButton.hidden = paymentFinished;
  uploadSlipLabel.hidden = paymentFinished;
  orderStatusMessage.hidden = paymentFinished;
  slipInput.disabled = paymentFinished;
}

async function renderPromptPayQr(order) {
  if (!order?.promptPayPayload) {
    return;
  }

  const rendered = await window.PromptPayTools.renderQr(qrCanvas, order.promptPayPayload);
  if (!rendered) {
    qrFallbackImage.src = `https://quickchart.io/qr?size=230&text=${encodeURIComponent(order.promptPayPayload)}`;
    qrFallbackImage.hidden = false;
  } else {
    qrFallbackImage.hidden = true;
  }

  try {
    downloadQrButton.href = qrCanvas.toDataURL("image/png");
    downloadQrButton.download = `${order.id}-promptpay.png`;
  } catch {
    downloadQrButton.href = `https://quickchart.io/qr?size=600&text=${encodeURIComponent(order.promptPayPayload)}`;
  }
}

async function showPaymentPanelForOrder(order) {
  state.createdOrder = order;
  paymentPanel.hidden = false;
  createdOrderId.textContent = order.id;
  rememberOrder(order.id);
  renderCustomerOrderStatus();
  await renderPromptPayQr(order);
  startQrExpiryTimer(order);
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

  if (getCartLines().length <= 0) {
    alert("กรุณาเลือกสินค้าอย่างน้อย 1 รายการ");
    return;
  }

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
    items: [...getCartLines(), ...getAddOnLines()].map((line) => ({
      id: line.id,
      name: line.name,
      qty: line.qty,
      price: line.price,
      lineTotal: line.qty * line.price,
      type: line.type || "product",
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
  await showPaymentPanelForOrder(order);

  orderStatusMessage.textContent = `สร้าง Dynamic QR แล้ว กรุณาชำระเงินภายใน ${config.qrExpiresInMinutes || 15} นาที`;
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

addOnList.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-addon]");
  if (!input) return;

  state.addOns[input.dataset.addon] = input.checked;
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
  if (getCartLines().length <= 0) {
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
  renderCustomerOrderStatus();
  renderQrExpiry();
});

store.subscribeOrders((orders) => {
  state.orders = orders;

  const trackedOrderId = state.createdOrder?.id || getRememberedOrderId();
  if (trackedOrderId) {
    const trackedOrder = orders.find((order) => order.id === trackedOrderId);
    if (trackedOrder) {
      state.createdOrder = trackedOrder;
      paymentPanel.hidden = false;
      createdOrderId.textContent = trackedOrder.id;
    }
  }

  render();
  renderCustomerOrderStatus();
  renderQrExpiry();
});

store.subscribeSettings((settings) => {
  state.settings = settings;
  render();
});

render();
