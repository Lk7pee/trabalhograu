"use strict";

// =========================================================
// BRASA BURGER — dados e configurações gerais
// =========================================================

const WHATSAPP_NUMBER = "5511999992026"; // Troque pelo número real com DDI + DDD.
const DELIVERY_FEE = 7.9;
const FREE_DELIVERY_MINIMUM = 100;
const COUPON_CODE = "BRASA10";
const COUPON_PERCENTAGE = 0.1;

const STORAGE_KEYS = {
    cart: "brasa-burger-cart",
    coupon: "brasa-burger-coupon",
    theme: "brasa-burger-theme"
};

const products = [
    {
        id: "brasa-classic",
        name: "Brasa Classic",
        description: "Blend de 160g, queijo prato, alface, tomate, cebola roxa e molho Brasa no pão brioche.",
        price: 29.9,
        category: "burgers",
        categoryLabel: "Burgers",
        emoji: "🍔",
        badge: "Clássico da casa"
    },
    {
        id: "bacon-fire",
        name: "Bacon Fire",
        description: "Blend de 180g, cheddar cremoso, bacon crocante, cebola caramelizada e molho picante.",
        price: 34.9,
        category: "burgers",
        categoryLabel: "Burgers",
        emoji: "🥓",
        badge: "Mais pedido"
    },
    {
        id: "double-smash",
        name: "Double Smash",
        description: "Dois smash burgers de 90g, queijo duplo, picles e molho especial no pão selado.",
        price: 24.9,
        category: "burgers",
        categoryLabel: "Burgers",
        emoji: "🍔",
        badge: "Oferta"
    },
    {
        id: "chicken-crispy",
        name: "Chicken Crispy",
        description: "Frango super crocante, queijo, alface americana e maionese de ervas no pão brioche.",
        price: 27.9,
        category: "burgers",
        categoryLabel: "Burgers",
        emoji: "🍗",
        badge: "Crocante"
    },
    {
        id: "veggie-brasa",
        name: "Veggie Brasa",
        description: "Burger vegetal grelhado, queijo, rúcula, tomate confit e maionese defumada.",
        price: 28.9,
        category: "burgers",
        categoryLabel: "Burgers",
        emoji: "🥬",
        badge: "Vegetariano"
    },
    {
        id: "batata-suprema",
        name: "Batata Suprema",
        description: "Batatas crocantes cobertas com cheddar, bacon em cubos e cebolinha fresca.",
        price: 22.9,
        category: "acompanhamentos",
        categoryLabel: "Acompanhamentos",
        emoji: "🍟",
        badge: "Para compartilhar"
    },
    {
        id: "onion-rings",
        name: "Onion Rings",
        description: "Anéis de cebola empanados e crocantes, acompanhados do nosso molho barbecue.",
        price: 18.9,
        category: "acompanhamentos",
        categoryLabel: "Acompanhamentos",
        emoji: "🧅",
        badge: ""
    },
    {
        id: "refrigerante",
        name: "Refrigerante",
        description: "Lata 350ml bem gelada. Escolha o sabor nas observações do seu pedido.",
        price: 8,
        category: "bebidas",
        categoryLabel: "Bebidas",
        emoji: "🥤",
        badge: "350 ml"
    },
    {
        id: "combo-brasa",
        name: "Combo Brasa",
        description: "Brasa Classic, porção individual de batatas crocantes e refrigerante 350ml.",
        price: 42.9,
        category: "combos",
        categoryLabel: "Combos",
        emoji: "🍔",
        badge: "Economize R$ 4"
    },
    {
        id: "combo-casal",
        name: "Combo Casal",
        description: "Dois Brasa Classic, batata grande para compartilhar e dois refrigerantes.",
        price: 69.9,
        category: "combos",
        categoryLabel: "Combos",
        emoji: "🍔",
        badge: "Oferta especial"
    }
];

// =========================================================
// Seletores e utilitários
// =========================================================

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const elements = {
    header: $("#topo"),
    menuToggle: $("#menuToggle"),
    navLinks: $("#navLinks"),
    themeToggle: $("#themeToggle"),
    productGrid: $("#productGrid"),
    filterList: $("#filterList"),
    visibleProductCount: $("#visibleProductCount"),
    cartItems: $("#cartItems"),
    emptyCart: $("#emptyCart"),
    cartCount: $("#cartCount"),
    headerCartCount: $("#headerCartCount"),
    subtotalValue: $("#subtotalValue"),
    deliveryValue: $("#deliveryValue"),
    discountRow: $("#discountRow"),
    discountValue: $("#discountValue"),
    totalValue: $("#totalValue"),
    freeDeliveryHint: $("#freeDeliveryHint"),
    couponInput: $("#couponInput"),
    applyCoupon: $("#applyCoupon"),
    couponMessage: $("#couponMessage"),
    copyCoupon: $("#copyCoupon"),
    checkoutForm: $("#checkoutForm"),
    customerName: $("#customerName"),
    customerAddress: $("#customerAddress"),
    customerNotes: $("#customerNotes"),
    orderModal: $("#orderModal"),
    modalSummary: $("#modalSummary"),
    whatsappLink: $("#whatsappLink"),
    toast: $("#toast"),
    toastTitle: $("#toastTitle"),
    toastMessage: $("#toastMessage"),
    backToTop: $("#backToTop"),
    currentYear: $("#currentYear")
};

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function readStorage(key, fallback) {
    try {
        const savedValue = localStorage.getItem(key);
        return savedValue ? JSON.parse(savedValue) : fallback;
    } catch (error) {
        console.warn(`Não foi possível ler "${key}" no localStorage.`, error);
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Não foi possível salvar "${key}" no localStorage.`, error);
    }
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function findProduct(productId) {
    return products.find((product) => product.id === productId);
}

let toastTimer;

function showToast(title, message) {
    clearTimeout(toastTimer);
    elements.toastTitle.textContent = title;
    elements.toastMessage.textContent = message;
    elements.toast.classList.add("visible");

    toastTimer = window.setTimeout(() => {
        elements.toast.classList.remove("visible");
    }, 2800);
}

// =========================================================
// Navegação, menu mobile, tema e efeitos de rolagem
// =========================================================

function closeMobileMenu() {
    elements.navLinks.classList.remove("open");
    elements.menuToggle.classList.remove("active");
    elements.menuToggle.setAttribute("aria-expanded", "false");
    elements.menuToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
}

elements.menuToggle.addEventListener("click", () => {
    const menuIsOpen = elements.navLinks.classList.toggle("open");
    elements.menuToggle.classList.toggle("active", menuIsOpen);
    elements.menuToggle.setAttribute("aria-expanded", String(menuIsOpen));
    elements.menuToggle.setAttribute("aria-label", menuIsOpen ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", menuIsOpen);
});

$$(".nav-links a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});

function applyTheme(theme) {
    const lightTheme = theme === "light";
    document.body.classList.toggle("light-theme", lightTheme);
    $(".theme-toggle__icon").textContent = lightTheme ? "☾" : "☀";
    elements.themeToggle.setAttribute("aria-label", lightTheme ? "Ativar tema escuro" : "Ativar tema claro");
    $('meta[name="theme-color"]').setAttribute("content", lightTheme ? "#f6efe4" : "#0c0b0a");
}

const savedTheme = readStorage(STORAGE_KEYS.theme, "dark");
applyTheme(savedTheme === "light" ? "light" : "dark");

elements.themeToggle.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    applyTheme(newTheme);
    saveStorage(STORAGE_KEYS.theme, newTheme);
});

function updateScrollInterface() {
    const scrolled = window.scrollY > 20;
    elements.header.classList.toggle("scrolled", scrolled);
    elements.backToTop.classList.toggle("visible", window.scrollY > 560);
}

window.addEventListener("scroll", updateScrollInterface, { passive: true });
updateScrollInterface();

elements.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Marca no menu a seção que está visível.
const pageSections = $$("main section[id]");
const navAnchors = $$(".nav-links a");

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navAnchors.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
            });
        });
    }, {
        rootMargin: "-36% 0px -55% 0px",
        threshold: 0
    });

    pageSections.forEach((section) => sectionObserver.observe(section));
}

// Animação simples dos elementos ao entrar na tela.
const revealElements = $$(".reveal");

revealElements.forEach((element) => {
    const delay = Number(element.dataset.delay || 0);
    element.style.setProperty("--reveal-delay", `${delay}ms`);
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("visible"));
}

// =========================================================
// Cardápio e filtros
// =========================================================

function createProductCard(product) {
    const badge = product.badge
        ? `<span class="product-card__badge">${product.badge}</span>`
        : "";

    return `
        <article class="product-card" data-category="${product.category}" data-product-id="${product.id}">
            <div class="product-card__visual">
                ${badge}
                <span class="product-card__emoji" aria-hidden="true">${product.emoji}</span>
            </div>
            <div class="product-card__content">
                <p class="product-card__category">${product.categoryLabel}</p>
                <h3>${product.name}</h3>
                <p class="product-card__description">${product.description}</p>
                <div class="product-card__footer">
                    <strong class="product-card__price">${formatCurrency(product.price)}</strong>
                    <button
                        class="add-product"
                        type="button"
                        data-add-product="${product.id}"
                        aria-label="Adicionar ${product.name} ao pedido"
                    >
                        <span aria-hidden="true">+</span>
                        Adicionar ao pedido
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderProducts() {
    elements.productGrid.innerHTML = products.map(createProductCard).join("");
    elements.visibleProductCount.textContent = products.length;
}

function filterProducts(category) {
    const cards = $$(".product-card", elements.productGrid);
    let visibleCount = 0;

    cards.forEach((card) => {
        const shouldShow = category === "todos" || card.dataset.category === category;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) visibleCount += 1;
    });

    elements.visibleProductCount.textContent = visibleCount;
}

elements.filterList.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-category]");
    if (!filterButton) return;

    $$(".filter-button", elements.filterList).forEach((button) => {
        button.classList.toggle("active", button === filterButton);
    });

    filterProducts(filterButton.dataset.category);
});

renderProducts();

// =========================================================
// Carrinho, quantidades, cupom e totais
// =========================================================

const storedCart = readStorage(STORAGE_KEYS.cart, []);
let cart = Array.isArray(storedCart)
    ? storedCart.filter((item) => findProduct(item.id) && Number(item.quantity) > 0)
    : [];
let couponApplied = readStorage(STORAGE_KEYS.coupon, "") === COUPON_CODE;

function saveCart() {
    saveStorage(STORAGE_KEYS.cart, cart);
}

function getCartDetails() {
    return cart
        .map((item) => {
            const product = findProduct(item.id);
            return product
                ? { ...product, quantity: item.quantity, lineTotal: product.price * item.quantity }
                : null;
        })
        .filter(Boolean);
}

function calculateTotals() {
    const subtotal = getCartDetails().reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = couponApplied ? subtotal * COUPON_PERCENTAGE : 0;
    const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE;
    const total = Math.max(0, subtotal - discount + delivery);

    return { subtotal, discount, delivery, total };
}

function addToCart(productId) {
    const product = findProduct(productId);
    if (!product) return;

    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    renderCart();
    showToast("Item adicionado", `${product.name} entrou na sua sacola.`);
}

function changeQuantity(productId, amount) {
    const item = cart.find((cartItem) => cartItem.id === productId);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    const product = findProduct(productId);
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    renderCart();

    if (product) {
        showToast("Item removido", `${product.name} saiu da sua sacola.`);
    }
}

function createCartItem(item) {
    return `
        <article class="cart-item">
            <div class="cart-item__visual" aria-hidden="true">${item.emoji}</div>
            <div class="cart-item__info">
                <h4>${item.name}</h4>
                <p>${formatCurrency(item.price)} cada</p>
            </div>
            <div class="cart-item__actions">
                <div class="quantity-control" aria-label="Quantidade de ${item.name}">
                    <button type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Diminuir quantidade">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Aumentar quantidade">+</button>
                </div>
                <strong class="cart-item__price">${formatCurrency(item.lineTotal)}</strong>
                <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${item.id}" aria-label="Remover ${item.name}">×</button>
            </div>
        </article>
    `;
}

function renderCart() {
    const cartDetails = getCartDetails();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totals = calculateTotals();

    elements.cartItems.innerHTML = cartDetails.map(createCartItem).join("");
    elements.emptyCart.hidden = cartDetails.length > 0;
    elements.cartItems.hidden = cartDetails.length === 0;

    elements.cartCount.textContent = `${totalItems} ${totalItems === 1 ? "item" : "itens"}`;
    elements.headerCartCount.textContent = totalItems;
    elements.subtotalValue.textContent = formatCurrency(totals.subtotal);
    elements.deliveryValue.textContent = totals.delivery === 0 && totals.subtotal > 0
        ? "Grátis"
        : formatCurrency(totals.delivery);
    elements.discountValue.textContent = `− ${formatCurrency(totals.discount)}`;
    elements.discountRow.hidden = !couponApplied || totals.subtotal === 0;
    elements.totalValue.textContent = formatCurrency(totals.total);

    const amountUntilFreeDelivery = Math.max(0, FREE_DELIVERY_MINIMUM - totals.subtotal);

    if (totals.subtotal >= FREE_DELIVERY_MINIMUM) {
        elements.freeDeliveryHint.textContent = "Você ganhou frete grátis!";
        elements.freeDeliveryHint.classList.add("success");
    } else if (totals.subtotal > 0) {
        elements.freeDeliveryHint.textContent = `Faltam ${formatCurrency(amountUntilFreeDelivery)} para o frete grátis.`;
        elements.freeDeliveryHint.classList.remove("success");
    } else {
        elements.freeDeliveryHint.textContent = "Frete grátis em pedidos acima de R$ 100.";
        elements.freeDeliveryHint.classList.remove("success");
    }
}

elements.productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-product]");
    if (addButton) addToCart(addButton.dataset.addProduct);
});

elements.cartItems.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-cart-action]");
    if (!actionButton) return;

    const productId = actionButton.dataset.productId;
    const action = actionButton.dataset.cartAction;

    if (action === "increase") changeQuantity(productId, 1);
    if (action === "decrease") changeQuantity(productId, -1);
    if (action === "remove") removeFromCart(productId);
});

$$("[data-product-id].promo-add, [data-product-id].promo-link").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.productId));
});

function applyCouponCode() {
    const typedCoupon = elements.couponInput.value.trim().toUpperCase();

    if (!typedCoupon) {
        elements.couponMessage.textContent = "Digite um cupom para continuar.";
        elements.couponMessage.classList.add("error");
        return;
    }

    if (typedCoupon !== COUPON_CODE) {
        couponApplied = false;
        saveStorage(STORAGE_KEYS.coupon, "");
        elements.couponMessage.textContent = "Cupom inválido. Confira o código.";
        elements.couponMessage.classList.add("error");
        renderCart();
        return;
    }

    couponApplied = true;
    saveStorage(STORAGE_KEYS.coupon, COUPON_CODE);
    elements.couponMessage.textContent = "Cupom aplicado: 10% de desconto!";
    elements.couponMessage.classList.remove("error");
    renderCart();
    showToast("Cupom aplicado", "Você ganhou 10% de desconto no pedido.");
}

elements.applyCoupon.addEventListener("click", applyCouponCode);

elements.couponInput.addEventListener("input", () => {
    elements.couponInput.value = elements.couponInput.value.toUpperCase();
    elements.couponMessage.textContent = "";
    elements.couponMessage.classList.remove("error");
});

elements.couponInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        applyCouponCode();
    }
});

async function copyCouponToClipboard() {
    let copied = false;

    try {
        await navigator.clipboard.writeText(COUPON_CODE);
        copied = true;
    } catch {
        const temporaryInput = document.createElement("input");
        temporaryInput.value = COUPON_CODE;
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        copied = document.execCommand("copy");
        temporaryInput.remove();
    }

    elements.couponInput.value = COUPON_CODE;
    showToast(copied ? "Cupom copiado" : "Cupom selecionado", "BRASA10 está pronto para ser aplicado.");
    document.querySelector("#pedido").scrollIntoView({ behavior: "smooth" });

    window.setTimeout(() => {
        elements.couponInput.focus();
    }, 550);
}

elements.copyCoupon.addEventListener("click", copyCouponToClipboard);

if (couponApplied) {
    elements.couponInput.value = COUPON_CODE;
    elements.couponMessage.textContent = "Cupom BRASA10 ativo.";
}

renderCart();

// =========================================================
// Validação, resumo do pedido e envio para WhatsApp
// =========================================================

function showFieldError(field, message) {
    const fieldContainer = field.closest(".form-field");
    fieldContainer.classList.toggle("has-error", Boolean(message));
    $(".field-error", fieldContainer).textContent = message;
}

function validateCheckout() {
    const name = elements.customerName.value.trim();
    const address = elements.customerAddress.value.trim();
    let isValid = true;

    showFieldError(elements.customerName, "");
    showFieldError(elements.customerAddress, "");

    if (!name) {
        showFieldError(elements.customerName, "Informe seu nome.");
        isValid = false;
    } else if (name.length < 2) {
        showFieldError(elements.customerName, "Digite um nome válido.");
        isValid = false;
    }

    if (!address) {
        showFieldError(elements.customerAddress, "Informe o endereço de entrega.");
        isValid = false;
    } else if (address.length < 8) {
        showFieldError(elements.customerAddress, "Inclua rua, número e bairro.");
        isValid = false;
    }

    if (cart.length === 0) {
        showToast("Sua sacola está vazia", "Adicione pelo menos um item para finalizar.");
        document.querySelector("#cardapio").scrollIntoView({ behavior: "smooth" });
        isValid = false;
    }

    return isValid;
}

[elements.customerName, elements.customerAddress].forEach((field) => {
    field.addEventListener("input", () => showFieldError(field, ""));
});

function buildWhatsAppMessage(customer, cartDetails, totals) {
    const itemLines = cartDetails
        .map((item) => `• ${item.quantity}x ${item.name} — ${formatCurrency(item.lineTotal)}`)
        .join("\n");

    const messageLines = [
        "🔥 *NOVO PEDIDO — BRASA BURGER*",
        "",
        `*Cliente:* ${customer.name}`,
        `*Entrega:* ${customer.address}`,
        "",
        "*Itens:*",
        itemLines,
        "",
        `Subtotal: ${formatCurrency(totals.subtotal)}`,
        `Entrega: ${totals.delivery === 0 ? "Grátis" : formatCurrency(totals.delivery)}`,
        ...(totals.discount > 0 ? [`Desconto BRASA10: -${formatCurrency(totals.discount)}`] : []),
        `*TOTAL: ${formatCurrency(totals.total)}*`,
        "",
        `*Observações:* ${customer.notes || "Nenhuma"}`,
        "",
        "Pedido gerado pelo site BRASA BURGER."
    ];

    return messageLines.join("\n");
}

function openOrderModal() {
    const cartDetails = getCartDetails();
    const totals = calculateTotals();
    const customer = {
        name: elements.customerName.value.trim(),
        address: elements.customerAddress.value.trim(),
        notes: elements.customerNotes.value.trim()
    };

    const itemsHTML = cartDetails.map((item) => `
        <div class="summary-item">
            <span>${item.quantity}x ${item.name}</span>
            <strong>${formatCurrency(item.lineTotal)}</strong>
        </div>
    `).join("");

    elements.modalSummary.innerHTML = `
        <div class="summary-customer">
            <div><span>Cliente</span><strong>${escapeHTML(customer.name)}</strong></div>
            <div><span>Entrega</span><strong>${escapeHTML(customer.address)}</strong></div>
        </div>
        <div class="summary-items">${itemsHTML}</div>
        ${totals.discount > 0 ? `
            <div class="summary-item">
                <span>Desconto BRASA10</span>
                <strong>− ${formatCurrency(totals.discount)}</strong>
            </div>
        ` : ""}
        <div class="summary-total">
            <span>Total do pedido</span>
            <strong>${formatCurrency(totals.total)}</strong>
        </div>
        ${customer.notes ? `<p class="summary-notes"><strong>Observações:</strong> ${escapeHTML(customer.notes)}</p>` : ""}
    `;

    const whatsappMessage = buildWhatsAppMessage(customer, cartDetails, totals);
    elements.whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    elements.orderModal.classList.add("open");
    elements.orderModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    $(".modal__close", elements.orderModal).focus();
}

function closeOrderModal() {
    elements.orderModal.classList.remove("open");
    elements.orderModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

elements.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateCheckout()) openOrderModal();
});

$$("[data-close-modal]", elements.orderModal).forEach((button) => {
    button.addEventListener("click", closeOrderModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (elements.orderModal.classList.contains("open")) closeOrderModal();
        if (elements.navLinks.classList.contains("open")) closeMobileMenu();
    }
});

// =========================================================
// Inicialização final
// =========================================================

elements.currentYear.textContent = new Date().getFullYear();
