const products = [
  {
    id: "bbk-infrared-massager",
    name: "جهاز BBK للمساج 5 في 1",
    description: "تصميم فضي · مساج مع الأشعة تحت الحمراء",
    quantity: 1,
    price: 228,
    oldPrice: null,
    label: "5 في 1",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80",
    imageAlt: "جلسة مساج واسترخاء توضيحية لجهاز المساج متعدد الوظائف",
    artLabel: "BBK",
    artDetail: "5 IN 1 · INFRARED",
    supplierUrl: "https://www.alibaba.com/product-detail/BBK-Silver-5-in-1-Infrared_1601453698479.html?source_from=alilens_1793116095201",
  },
  {
    id: "shiatsu-neck-massager",
    name: "جهاز مساج الرقبة Shiatsu",
    description: "جهاز تدليك كهربائي للرقبة والكتفين",
    quantity: 1,
    price: 299,
    oldPrice: null,
    label: "مساج الرقبة",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
    imageAlt: "جلسة تدليك وعناية بالوجه والرقبة",
    artLabel: "SHIATSU",
    artDetail: "NECK MASSAGER",
    supplierUrl: "https://www.alibaba.com/product-detail/Hot-Sale-Electric-Shiatsu-Neck-and_1601014957551.html?source_from=alilens_1793116197941",
  },
  {
    id: "ems-mini-face-massager",
    name: "جهاز مساج الوجه EMS ميني",
    description: "جهاز كهربائي صغير · 7 ألوان",
    quantity: 1,
    price: null,
    oldPrice: null,
    label: "7 ألوان",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80",
    imageAlt: "منتجات عناية بالبشرة توضيحية لجهاز مساج الوجه",
    artLabel: "EMS",
    artDetail: "7 COLOR · MINI",
    supplierUrl: "https://www.alibaba.com/product-detail/7-Color-Mini-Electric-EMS-Wrinkle_1601844583772.html?source_from=alilens_1793116333493",
  },
];

const currency = new Intl.NumberFormat("ar-MA", { maximumFractionDigits: 2 });
const getPrice = (amount) => `${currency.format(amount)} د.م.`;
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
      products.some((product) => product.id === item.id && product.price !== null)
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
          ? `<img src="${product.image}" alt="${product.imageAlt}" loading="lazy" />`
          : `<div class="product-art" aria-label="${product.name}"><span>${product.artLabel}</span><small>${product.artDetail}</small></div>`}
        <span class="product-label">${product.label}</span>
      </div>
      <div class="product-info">
        <div><h3>${product.name}</h3><p>${product.description}</p></div>
        <div class="product-price">${product.price === null ? `<span class="price-on-request">السعر عند الطلب</span>` : `${getPrice(product.price)}${product.oldPrice ? `<del>${getPrice(product.oldPrice)}</del>` : ""}`}</div>
      </div>
      ${product.supplierUrl ? `<a class="supplier-link" href="${product.supplierUrl}" target="_blank" rel="noopener noreferrer">شاهدي المنتج عند المورد <span aria-hidden="true">↗</span></a>` : ""}
      ${product.price === null
        ? `<a class="add-to-cart quote-button" href="${product.supplierUrl}" target="_blank" rel="noopener noreferrer">اطلبي السعر <span aria-hidden="true">↗</span></a>`
        : `<button class="add-to-cart" type="button" data-add="${product.id}">أضيفي إلى السلة <span aria-hidden="true">＋</span></button>`}
    </article>
  `).join("");
}

function renderCart() {
  const count = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product ? product.quantity * item.quantity : 0);
  }, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
  cartCount.textContent = String(count);
  drawerCount.textContent = `(${count})`;
  cartTotal.textContent = getPrice(subtotal);
  emptyCart.hidden = count > 0;
  drawerFooter.hidden = count === 0;
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return "";
    return `
      <article class="cart-item">
        ${product.image
          ? `<img src="${product.image}" alt="" />`
          : `<div class="cart-item-art" aria-hidden="true">${product.artLabel}</div>`}
        <div>
          <h3>${product.name}</h3><p>${getPrice(product.price)}</p>
          <div class="quantity-control" aria-label="عدد الباقات">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="تقليل الكمية">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="زيادة الكمية">＋</button>
          </div>
        </div>
        <span class="cart-item-price">${getPrice(product.price * item.quantity)}</span>
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
  showToast("أُضيف المنتج إلى سلتكِ");
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
  showToast("شكراً لاهتمامكِ! الاشتراك غير مفعّل في النسخة التجريبية.");
});

renderProducts();
renderCart();
