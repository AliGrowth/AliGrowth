const products = [
  {
    id: "bbk-infrared-massager",
    name: "جهاز BBK للمساج 5 في 1",
    description: "جهاز مساج يدوي بتصميم فضي ورؤوس متعددة للاستخدام على مناطق مختلفة من الجسم. صُمم بخمس وظائف، مع خاصية الأشعة تحت الحمراء حسب وصف المنتج. يُرجى مراجعة تعليمات الاستخدام المرفقة.",
    quantity: 1,
    price: 228,
    oldPrice: null,
    label: "5 في 1",
    image: "images/قلم التدليك1.jpg",
    imageAlt: "صورة توضيحية لجهاز قلم تدليك فضي متعدد الرؤوس",
    supplierUrl: "https://www.alibaba.com/product-detail/BBK-Silver-5-in-1-Infrared_1601453698479.html?source_from=alilens_1793116095201",
  },
  {
    id: "shiatsu-neck-massager",
    name: "جهاز مساج الرقبة Shiatsu",
    description: "جهاز كهربائي مخصص لتدليك منطقة الرقبة والكتفين بتقنية شياتسو التي تحاكي حركات العجن. اتبعوا تعليمات الشركة المصنّعة للاستخدام.",
    quantity: 1,
    price: 299,
    oldPrice: null,
    label: "مساج الرقبة",
    image: "images/تدليك الرقبة.jpg",
    imageAlt: "صورة توضيحية لجهاز كهربائي لتدليك الرقبة والكتفين",
    supplierUrl: "https://www.alibaba.com/product-detail/Hot-Sale-Electric-Shiatsu-Neck-and_1601014957551.html?source_from=alilens_1793116197941",
  },
  {
    id: "ems-mini-face-massager",
    name: "جهاز مساج الوجه EMS ميني",
    description: "جهاز مساج وجه كهربائي بحجم ميني، يأتي بسبعة ألوان أو أنماط ضوئية حسب وصف المنتج. أضيفوه إلى روتين العناية بالوجه واستخدموه وفق تعليمات الشركة المصنّعة.",
    quantity: 1,
    price: 229,
    oldPrice: null,
    label: "7 ألوان",
    image: "images/face-massage-user.png",
    imageAlt: "صورة توضيحية لجهاز كهربائي لمساج الوجه",
    supplierUrl: "https://www.alibaba.com/product-detail/7-Color-Mini-Electric-EMS-Wrinkle_1601844583772.html?source_from=alilens_1793116333493",
  },
];

const currency = new Intl.NumberFormat("ar-MA", { maximumFractionDigits: 2 });
const getPrice = (amount) => `<span class="money" dir="rtl"><bdi class="money-amount" dir="ltr">${currency.format(amount)}</bdi><span class="money-currency" dir="rtl">درهم</span></span>`;
const productGrid = document.querySelector("#product-grid");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const drawerCount = document.querySelector("#drawer-count");
const cartTotal = document.querySelector("#cart-total");
const drawerFooter = document.querySelector("#drawer-footer");
const emptyCart = document.querySelector("#empty-cart");
const shippingNote = document.querySelector("#shipping-note");
const overlay = document.querySelector("#overlay");
const drawer = document.querySelector("#cart-drawer");
const checkoutModal = document.querySelector("#checkout-modal");
const toast = document.querySelector("#toast");

let cart = loadCart();
let toastTimeout;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("hayfo-cart") || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      products.some((product) => product.id === item.id)
      && Number.isInteger(item.quantity)
      && item.quantity > 0
      && item.quantity <= 99
    );
  } catch (error) {
    console.warn("Could not restore the saved cart.", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("hayfo-cart", JSON.stringify(cart));
  } catch (error) {
    console.warn("Could not save the cart in this browser.", error);
  }
}

function renderProducts() {
  productGrid.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-photo">
        ${product.image
          ? `<img src="${product.image}?v=457cf47" alt="${product.imageAlt}" loading="eager" />`
          : `<div class="product-art" aria-label="${product.name}"><span>${product.artLabel}</span><small>${product.artDetail}</small></div>`}
        <span class="product-label${product.id === "ems-mini-face-massager" ? " product-label-bottom" : ""}">${product.label}</span>
      </div>
      <h3 class="product-title">${product.name}</h3>
      <div class="product-info">
        <div><p>${product.description}</p></div>
        <div class="product-price">${product.price === null ? `<span class="price-on-request">السعر عند الطلب</span>` : `${getPrice(product.price)}${product.oldPrice ? `<del>${getPrice(product.oldPrice)}</del>` : ""}`}</div>
      </div>
      <button class="add-to-cart" type="button" data-add="${product.id}">
        <svg class="add-to-cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 9H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
        <span>أضيفوا إلى السلة</span>
      </button>
    </article>
  `).join("");
}

function renderCart() {
  const count = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product ? product.quantity * item.quantity : 0);
  }, 0);
  const hasUnpricedProduct = cart.some((item) =>
    products.find((entry) => entry.id === item.id)?.price === null
  );
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product && product.price !== null ? product.price * item.quantity : 0);
  }, 0);
  const discountRate = hasUnpricedProduct ? 0 : count >= 3 ? 0.25 : count === 2 ? 0.15 : 0;
  const discount = subtotal * discountRate;
  cartCount.textContent = String(count);
  drawerCount.textContent = `(${count})`;
  document.querySelector("#cart-subtotal").innerHTML = hasUnpricedProduct
    ? `${getPrice(subtotal)} + السعر عند الطلب`
    : getPrice(subtotal);
  document.querySelector("#cart-discount-row").hidden = discountRate === 0;
  document.querySelector("#cart-discount-label").textContent = `خصم ${Math.round(discountRate * 100)}٪`;
  document.querySelector("#cart-discount").innerHTML = `− ${getPrice(discount)}`;
  cartTotal.innerHTML = hasUnpricedProduct ? `${getPrice(subtotal)} + السعر عند الطلب` : getPrice(subtotal - discount);
  emptyCart.hidden = count > 0;
  drawerFooter.hidden = count === 0;
  document.querySelector("#cart-price-note").hidden = !hasUnpricedProduct;
  document.querySelector("#checkout-button").disabled = hasUnpricedProduct;
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return "";
    return `
      <article class="cart-item">
        ${product.image
          ? `<img src="${product.image}" alt="" />`
          : `<div class="cart-item-art" aria-hidden="true">${product.artLabel}</div>`}
        <div>
          <h3>${product.name}</h3><p>${product.price === null ? "السعر عند الطلب" : getPrice(product.price)}</p>
          <div class="quantity-control" aria-label="عدد الباقات">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="تقليل الكمية">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="زيادة الكمية">＋</button>
          </div>
        </div>
        <span class="cart-item-price">${product.price === null ? "عند الطلب" : getPrice(product.price * item.quantity)}</span>
      </article>
    `;
  }).join("");
  shippingNote.textContent = "التوصيل مجاني لجميع الطلبات.";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function syncOverlay() {
  const isOpen = drawer.classList.contains("open") || checkoutModal.classList.contains("open");
  overlay.hidden = !isOpen;
  document.body.classList.toggle("locked", isOpen);
}

function openCart() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  syncOverlay();
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  syncOverlay();
}

function openCheckout() {
  if (cart.some((item) => products.find((product) => product.id === item.id)?.price === null)) {
    showToast("حددي ثمن المنتجات التي أُضيفت عند الطلب قبل إتمام الطلب.");
    return;
  }
  closeCart();
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
  syncOverlay();
  document.querySelector("#close-checkout").focus();
}

function closeCheckout() {
  checkoutModal.classList.remove("open");
  checkoutModal.setAttribute("aria-hidden", "true");
  syncOverlay();
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = button.dataset.add;
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity = Math.min(existing.quantity + 1, 99);
  else cart.push({ id, quantity: 1 });
  saveCart();
  renderCart();
  const product = products.find((entry) => entry.id === id);
  showToast(product?.price === null
    ? "أُضيف المنتج إلى السلة؛ السعر عند الطلب."
    : "أُضيف المنتج إلى السلة");
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const item = cart.find((entry) => entry.id === button.dataset.quantity);
  if (!item) return;
  item.quantity += Number(button.dataset.change);
  if (item.quantity <= 0) cart = cart.filter((entry) => entry !== item);
  else item.quantity = Math.min(item.quantity, 99);
  saveCart();
  renderCart();
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
document.querySelector("#checkout-button").addEventListener("click", openCheckout);
document.querySelector("#close-checkout").addEventListener("click", closeCheckout);
overlay.addEventListener("click", () => {
  closeCart();
  closeCheckout();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
  }
});

document.querySelector("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#checkout-form").hidden = true;
  document.querySelector("#order-success").hidden = false;
});

document.querySelector("#finish-order").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
  document.querySelector("#checkout-form").reset();
  document.querySelector("#checkout-form").hidden = false;
  document.querySelector("#order-success").hidden = true;
  closeCheckout();
  showToast("انتهت تجربة الطلب التجريبي");
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("شكراً لاهتمامكم! الاشتراك غير مفعّل في النسخة التجريبية.");
});

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest("img")) event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
  if (event.target.closest("img")) event.preventDefault();
});

renderProducts();
renderCart();
