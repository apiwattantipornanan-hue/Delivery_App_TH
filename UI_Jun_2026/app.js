const products = {
  roll: {
    name: "ปอเปี๊ยะสดไส้รวม",
    desc: "แป้งนุ่ม เต้าหู้ กุนเชียง และน้ำจิ้มถั่วโฮมเมด",
    price: 50,
    image: "../assets/home-kitchen-spring-roll-hero.png",
    alt: "ปอเปี๊ยะสดไส้รวม",
  },
  tofu: {
    name: "เต้าหู้",
    desc: "เต้าหู้เนื้อนุ่ม หั่นพอดีคำ ทานคู่กับปอเปี๊ยะสด",
    price: 25,
    image: "../Moodboard_Directions/ai_food_demo/tofu_ai_clean.png",
    alt: "เต้าหู้",
  },
  sausage: {
    name: "กุนเชียง",
    desc: "กุนเชียงรสเข้ม เพิ่มรสหวานเค็มให้ชุดอร่อยขึ้น",
    price: 35,
    image: "../Moodboard_Directions/ai_food_demo/chinese_sausage_ai_extra_dry.png",
    alt: "กุนเชียง",
  },
};

const productOrder = ["roll", "tofu", "sausage"];
const baht = (value) => `฿${value.toLocaleString("th-TH")}`;

let activeProduct = "roll";
let draftQuantity = 1;
const cart = {};

const heroImage = document.querySelector("#heroImage");
const productName = document.querySelector("#productName");
const productDesc = document.querySelector("#productDesc");
const productPrice = document.querySelector("#productPrice");
const quantityValue = document.querySelector("#quantityValue");
const checkoutTotal = document.querySelector("#checkoutTotal");
const cartCount = document.querySelector("#cartCount");
const addFeedback = document.querySelector("#addFeedback");
const basketList = document.querySelector("#basketList");
const emptyBasket = document.querySelector("#emptyBasket");
const basketItemCount = document.querySelector("#basketItemCount");
const basketSubtotal = document.querySelector("#basketSubtotal");
const basketTotal = document.querySelector("#basketTotal");
const basketCtaTotal = document.querySelector("#basketCtaTotal");
const paymentTotal = document.querySelector("#paymentTotal");
const paymentItems = document.querySelector("#paymentItems");
const payButton = document.querySelector("#payButton");
const tabs = document.querySelectorAll(".product-tab");

function scrollToScreen(selector) {
  document.querySelector(selector).scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function getCartLines() {
  return productOrder
    .filter((id) => cart[id] > 0)
    .map((id) => {
      const product = products[id];
      const quantity = cart[id];

      return {
        id,
        ...product,
        quantity,
        lineTotal: product.price * quantity,
      };
    });
}

function getCartSummary() {
  const lines = getCartLines();
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return { lines, itemCount, total };
}

function changeDraftQuantity(delta) {
  draftQuantity = Math.max(1, draftQuantity + delta);
  render();
}

function changeCartQuantity(productId, delta) {
  cart[productId] = Math.max(0, (cart[productId] || 0) + delta);

  if (cart[productId] === 0) {
    delete cart[productId];
  }

  render();
}

function addActiveProductToCart() {
  cart[activeProduct] = (cart[activeProduct] || 0) + draftQuantity;
  addFeedback.textContent = `เพิ่ม ${products[activeProduct].name} ${draftQuantity} ชุด ในตะกร้าแล้ว`;
  draftQuantity = 1;
  render();
}

function renderProduct() {
  const product = products[activeProduct];
  const draftTotal = product.price * draftQuantity;

  heroImage.src = product.image;
  heroImage.alt = product.alt;
  productName.textContent = product.name;
  productDesc.textContent = product.desc;
  productPrice.textContent = baht(product.price);
  quantityValue.textContent = draftQuantity;
  checkoutTotal.textContent = baht(draftTotal);

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.product === activeProduct);
  });
}

function renderBasket() {
  const { lines, itemCount, total } = getCartSummary();

  cartCount.textContent = itemCount > 0 ? `${itemCount} ชุด | ${baht(total)}` : "ตะกร้าว่าง";
  basketItemCount.textContent = `${itemCount} ชุด`;
  basketSubtotal.textContent = baht(total);
  basketTotal.textContent = baht(total);
  basketCtaTotal.textContent = baht(total);
  emptyBasket.classList.toggle("is-visible", lines.length === 0);
  payButton.disabled = lines.length === 0;

  basketList.innerHTML = lines
    .map(
      (line) => `
        <div class="basket-item" data-product="${line.id}">
          <img src="${line.image}" alt="${line.alt}" />
          <div>
            <strong>${line.name}</strong>
            <p>${line.desc}</p>
            <small>${baht(line.price)} / ชุด</small>
          </div>
          <div class="line-control">
            <span class="line-qty">x ${line.quantity}</span>
            <div class="mini-stepper" aria-label="ปรับจำนวน ${line.name}">
              <button type="button" data-action="decrease" data-product="${line.id}" aria-label="ลดจำนวน ${line.name}">−</button>
              <strong>${line.quantity}</strong>
              <button type="button" data-action="increase" data-product="${line.id}" aria-label="เพิ่มจำนวน ${line.name}">+</button>
            </div>
            <strong class="line-total">${baht(line.lineTotal)}</strong>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderPayment() {
  const { lines, total } = getCartSummary();

  paymentTotal.textContent = baht(total);
  paymentItems.innerHTML =
    lines.length > 0
      ? lines
          .map(
            (line) => `
              <div class="payment-line">
                <div>
                  <span>${line.name}</span>
                  <small>${baht(line.price)} x ${line.quantity} ชุด</small>
                </div>
                <strong>${baht(line.lineTotal)}</strong>
              </div>
            `,
          )
          .join("")
      : `
        <div class="payment-line">
          <div>
            <span>ยังไม่มีสินค้า</span>
            <small>กลับไปเลือกเมนูก่อนนะคะ</small>
          </div>
          <strong>฿0</strong>
        </div>
      `;
}

function render() {
  renderProduct();
  renderBasket();
  renderPayment();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeProduct = tab.dataset.product;
    draftQuantity = 1;
    addFeedback.textContent = "";
    render();
  });
});

document.querySelector("#minusBtn").addEventListener("click", () => {
  changeDraftQuantity(-1);
});

document.querySelector("#plusBtn").addEventListener("click", () => {
  changeDraftQuantity(1);
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  addActiveProductToCart();
});

document.querySelector("#cartButton").addEventListener("click", () => {
  scrollToScreen(".basket-screen");
});

basketList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action][data-product]");

  if (!button) {
    return;
  }

  const delta = button.dataset.action === "increase" ? 1 : -1;
  changeCartQuantity(button.dataset.product, delta);
});

payButton.addEventListener("click", () => {
  if (getCartSummary().itemCount > 0) {
    scrollToScreen(".payment-screen");
  }
});

document.querySelector("#basketBackButton").addEventListener("click", () => {
  scrollToScreen(".order-screen");
});

document.querySelector("#paymentBackButton").addEventListener("click", () => {
  scrollToScreen(".basket-screen");
});

render();
