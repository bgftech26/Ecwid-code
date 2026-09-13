(function () {
  "use strict";

  if (window.__BLACKGOLD_FREE_DELIVERY__) return;
  window.__BLACKGOLD_FREE_DELIVERY__ = true;

  const CONFIG = {
    regions: {
      male: {
        name: "Malé",
        target: 138.90
      },
      hulhumale: {
        name: "Hulhumalé Phase 1",
        target: 925.93
      }
    },

    defaultRegion: "male",

    buttonSize: 52,
    left: 20,
    scrollBottom: 20,
    gap: 12,

    scrollTopSelector: ""
  };

  let currentCart = {
    productsQuantity: 0,
    subtotal: 0
  };

  let selectedRegion = CONFIG.defaultRegion;
  let started = false;

  try {
    const saved = localStorage.getItem("bgfDeliveryRegion");
    if (saved && CONFIG.regions[saved]) {
      selectedRegion = saved;
    }
  } catch (e) {}

  const vanIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h11v9H3z"></path>
      <path d="M14 9h3.5l3 3v3H14z"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  `;

  const style = document.createElement("style");

  style.textContent = `
    :root {
      --bgf-size: ${CONFIG.buttonSize}px;
      --bgf-left: ${CONFIG.left}px;
      --bgf-scroll-bottom: ${CONFIG.scrollBottom}px;
      --bgf-gap: ${CONFIG.gap}px;
    }

    #bgf-delivery-button {
      position: fixed;
      z-index: 99998;

      left: var(--bgf-left);

      bottom: calc(
        var(--bgf-scroll-bottom) +
        var(--bgf-size) +
        var(--bgf-gap)
      );

      width: var(--bgf-size);
      height: var(--bgf-size);

      border: 1px solid #d8d8d8;
      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0;
      margin: 0;

      color: #111;
      background: #fff;

      box-shadow: 0 4px 14px rgba(0,0,0,.18);

      cursor: pointer;

      opacity: 0;
      visibility: hidden;

      transform: scale(.75);

      transition:
        opacity .25s ease,
        transform .25s ease,
        background .25s ease,
        color .25s ease,
        border-color .25s ease,
        box-shadow .2s ease;

      -webkit-tap-highlight-color: transparent;
    }

    #bgf-delivery-button.bgf-visible {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }

    #bgf-delivery-button:hover {
      background: #f5f5f5;
    }

    #bgf-delivery-button.bgf-active {
      box-shadow:
        0 0 0 3px rgba(0,0,0,.07),
        0 5px 18px rgba(0,0,0,.22);
    }

    #bgf-delivery-button.bgf-unlocked {
      background: #218c4d;
      color: #fff;
      border-color: #218c4d;

      box-shadow:
        0 4px 16px rgba(33,140,77,.28);
    }

    #bgf-delivery-button.bgf-unlocked:hover {
      background: #19783f;
      border-color: #19783f;
    }

    #bgf-delivery-button.bgf-unlocked.bgf-active {
      background: #218c4d;

      box-shadow:
        0 0 0 3px rgba(33,140,77,.18),
        0 5px 18px rgba(0,0,0,.22);
    }

    #bgf-delivery-button svg {
      width: 54%;
      height: 54%;

      display: block;

      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #bgf-delivery-panel {
      position: fixed;
      z-index: 99997;

      left: var(--bgf-left);

      bottom: calc(
        var(--bgf-scroll-bottom) +
        var(--bgf-size) +
        var(--bgf-gap) +
        var(--bgf-size) +
        10px
      );

      width: min(
        310px,
        calc(100vw - var(--bgf-left) - 18px)
      );

      box-sizing: border-box;

      padding: 17px;

      background: #fff;
      color: #17211b;

      border: 1px solid rgba(0,0,0,.07);
      border-radius: 16px;

      box-shadow: 0 9px 30px rgba(0,0,0,.18);

      font-family: inherit;

      opacity: 0;
      visibility: hidden;

      transform: translateY(8px) scale(.97);
      transform-origin: bottom left;

      transition:
        opacity .2s ease,
        transform .2s ease,
        visibility .2s ease;
    }

    #bgf-delivery-panel.bgf-open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .bgf-header {
      display: flex;
      align-items: center;
      gap: 9px;

      padding-right: 26px;
      margin-bottom: 14px;
    }

    .bgf-header-icon {
      flex: 0 0 auto;

      width: 31px;
      height: 31px;

      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      background: #f58220;
      color: #fff;
    }

    .bgf-header-icon svg {
      width: 18px;
      height: 18px;

      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .bgf-title {
      font-size: 16px;
      line-height: 1.15;
      font-weight: 700;
    }

    #bgf-close {
      position: absolute;

      top: 10px;
      right: 11px;

      width: 30px;
      height: 30px;

      border: 0;
      padding: 0;

      background: transparent;
      color: #333;

      font-size: 23px;
      font-family: Arial, sans-serif;
      font-weight: 300;
      line-height: 28px;

      cursor: pointer;
    }

    .bgf-label {
      display: block;

      margin: 0 0 6px;

      font-size: 11px;
      font-weight: 600;

      color: #686868;
    }

    #bgf-region {
      width: 100%;
      height: 40px;

      box-sizing: border-box;

      margin: 0 0 15px;
      padding: 0 34px 0 11px;

      border: 1px solid #dedede;
      border-radius: 9px;

      background: #f8f8f8;
      color: #1a1a1a;

      font-family: inherit;
      font-size: 13px;
      font-weight: 600;

      cursor: pointer;
      outline: none;
    }

    #bgf-region:focus {
      border-color: #8ab69a;
      box-shadow: 0 0 0 2px rgba(26,107,67,.09);
    }

    .bgf-track {
      position: relative;

      width: 100%;
      height: 9px;

      background: #e8e8e8;

      border-radius: 100px;
      overflow: hidden;

      margin-bottom: 11px;
    }

    #bgf-fill {
      width: 0%;
      height: 100%;

      border-radius: 100px;

      background: #268b4b;

      transition: width .4s ease;
    }

    #bgf-message {
      font-size: 14px;
      line-height: 1.35;
      font-weight: 700;

      margin-bottom: 8px;
    }

    #bgf-message strong {
      color: #1c8145;
    }

    .bgf-values {
      display: flex;
      justify-content: space-between;
      gap: 12px;

      color: #6c6c6c;

      font-size: 10.5px;
      line-height: 1.3;
    }

    .bgf-values span:last-child {
      text-align: right;
    }

    #bgf-delivery-panel.bgf-complete #bgf-fill {
      background: #20a453;
    }

    #bgf-delivery-panel.bgf-complete .bgf-header-icon {
      background: #20a453;
    }

    @media (max-width: 480px) {

      #bgf-delivery-panel {
        padding: 15px;
        border-radius: 14px;
      }

      .bgf-title {
        font-size: 15px;
      }

      #bgf-message {
        font-size: 13px;
      }
    }
  `;

  document.head.appendChild(style);

  const button = document.createElement("button");

  button.id = "bgf-delivery-button";
  button.type = "button";
  button.setAttribute("aria-label", "Free delivery progress");
  button.setAttribute("aria-expanded", "false");
  button.title = "Free delivery progress";
  button.innerHTML = vanIcon;

  const panel = document.createElement("div");

  panel.id = "bgf-delivery-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Free delivery progress");

  panel.innerHTML = `
    <button
      id="bgf-close"
      type="button"
      aria-label="Close free delivery progress"
    >×</button>

    <div class="bgf-header">

      <div class="bgf-header-icon">
        ${vanIcon}
      </div>

      <div class="bgf-title">
        Free Delivery
      </div>

    </div>

    <label
      class="bgf-label"
      for="bgf-region"
    >
      Delivery area
    </label>

    <select id="bgf-region">
      <option value="male">Malé</option>
      <option value="hulhumale">Hulhumalé Phase 1</option>
    </select>

    <div class="bgf-track">
      <div id="bgf-fill"></div>
    </div>

    <div id="bgf-message"></div>

    <div class="bgf-values">
      <span id="bgf-cart-value"></span>
      <span id="bgf-target-value"></span>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(panel);

  const regionSelect =
    document.getElementById("bgf-region");

  const progressFill =
    document.getElementById("bgf-fill");

  const message =
    document.getElementById("bgf-message");

  const cartValue =
    document.getElementById("bgf-cart-value");

  const targetValue =
    document.getElementById("bgf-target-value");

  const closeButton =
    document.getElementById("bgf-close");

  regionSelect.value = selectedRegion;

  function money(value) {
    return Number(value || 0).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  }

  function openPanel() {

    if (!currentCart.productsQuantity) return;

    panel.classList.add("bgf-open");
    button.classList.add("bgf-active");

    button.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  function closePanel() {

    panel.classList.remove("bgf-open");
    button.classList.remove("bgf-active");

    button.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  function togglePanel() {

    if (panel.classList.contains("bgf-open")) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function renderProgress() {

    const region =
      CONFIG.regions[selectedRegion];

    const subtotal =
      Number(currentCart.subtotal || 0);

    const quantity =
      Number(currentCart.productsQuantity || 0);

    if (quantity > 0) {

      button.classList.add("bgf-visible");

    } else {

      button.classList.remove("bgf-visible");
      button.classList.remove("bgf-unlocked");

      closePanel();

      return;
    }

    const target = region.target;

    const remaining =
      Math.max(target - subtotal, 0);

    const percentage =
      Math.min(
        (subtotal / target) * 100,
        100
      );

    progressFill.style.width =
      percentage + "%";

    cartValue.textContent =
      "Cart: MVR " + money(subtotal);

    targetValue.textContent =
      "Free at MVR " + money(target);

    if (remaining > 0) {

      panel.classList.remove(
        "bgf-complete"
      );

      button.classList.remove(
        "bgf-unlocked"
      );

      message.innerHTML =
        'Add <strong>MVR ' +
        money(remaining) +
        '</strong> more for FREE delivery to ' +
        region.name;

      button.setAttribute(
        "aria-label",
        "Add MVR " +
        money(remaining) +
        " more for free delivery to " +
        region.name
      );

    } else {

      panel.classList.add(
        "bgf-complete"
      );

      button.classList.add(
        "bgf-unlocked"
      );

      message.innerHTML =
        '✓ <strong>FREE delivery unlocked</strong> for ' +
        region.name + "!";

      button.setAttribute(
        "aria-label",
        "Free delivery unlocked for " +
        region.name
      );
    }
  }

  function getCart() {

    if (
      !window.Ecwid ||
      !Ecwid.Cart ||
      typeof Ecwid.Cart.get !== "function"
    ) return;

    Ecwid.Cart.get(function (cart) {

      currentCart = {

        productsQuantity:
          Number(
            cart &&
            cart.productsQuantity
              ? cart.productsQuantity
              : 0
          ),

        subtotal:
          Number(
            cart &&
            cart.subtotal
              ? cart.subtotal
              : 0
          )
      };

      renderProgress();
    });
  }

  regionSelect.addEventListener(
    "change",
    function () {

      selectedRegion =
        regionSelect.value;

      try {

        localStorage.setItem(
          "bgfDeliveryRegion",
          selectedRegion
        );

      } catch (e) {}

      renderProgress();
    }
  );

  button.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      togglePanel();
    }
  );

  closeButton.addEventListener(
    "click",
    function () {

      closePanel();
    }
  );

  document.addEventListener(
    "click",
    function (event) {

      if (
        panel.classList.contains("bgf-open") &&
        !panel.contains(event.target) &&
        !button.contains(event.target)
      ) {
        closePanel();
      }
    }
  );

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Escape") {
        closePanel();
      }
    }
  );

  function findScrollTopButton() {

    if (CONFIG.scrollTopSelector) {

      const manual =
        document.querySelector(
          CONFIG.scrollTopSelector
        );

      if (manual) return manual;
    }

    const selectors = [
      "#scrollTopBtn",
      "#scroll-to-top",
      "#scrollToTop",
      "#backToTop",
      ".scroll-to-top",
      ".scrollTopBtn",
      ".scroll-top",
      ".back-to-top",
      "[aria-label*='scroll to top' i]",
      "[title*='scroll to top' i]",
      "[aria-label*='back to top' i]",
      "[title*='back to top' i]"
    ];

    for (
      let i = 0;
      i < selectors.length;
      i++
    ) {

      const el =
        document.querySelector(
          selectors[i]
        );

      if (el && el !== button) {
        return el;
      }
    }

    return null;
  }

  function syncWithScrollButton() {

    const scrollButton =
      findScrollTopButton();

    if (!scrollButton) return;

    const rect =
      scrollButton.getBoundingClientRect();

    if (
      rect.width < 30 ||
      rect.width > 100 ||
      rect.height < 30 ||
      rect.height > 100
    ) return;

    const computed =
      window.getComputedStyle(
        scrollButton
      );

    if (
      computed.position !== "fixed" &&
      computed.position !== "sticky"
    ) return;

    const size =
      Math.max(
        rect.width,
        rect.height
      );

    const bottom =
      window.innerHeight -
      rect.bottom;

    document.documentElement.style.setProperty(
      "--bgf-size",
      Math.round(size) + "px"
    );

    document.documentElement.style.setProperty(
      "--bgf-left",
      Math.round(rect.left) + "px"
    );

    document.documentElement.style.setProperty(
      "--bgf-scroll-bottom",
      Math.round(bottom) + "px"
    );
  }

  syncWithScrollButton();

  setTimeout(
    syncWithScrollButton,
    500
  );

  setTimeout(
    syncWithScrollButton,
    1500
  );

  setTimeout(
    syncWithScrollButton,
    3000
  );

  window.addEventListener(
    "resize",
    syncWithScrollButton
  );

  window.addEventListener(
    "scroll",
    syncWithScrollButton,
    { passive: true }
  );

  function start() {

    if (started) return;

    if (
      !window.Ecwid ||
      !Ecwid.Cart ||
      typeof Ecwid.Cart.get !== "function" ||
      !Ecwid.OnCartChanged ||
      typeof Ecwid.OnCartChanged.add !== "function"
    ) {
      return;
    }

    started = true;

    Ecwid.OnCartChanged.add(
      function () {
        getCart();
      }
    );

    getCart();
  }

  if (
    window.Ecwid &&
    Ecwid.OnAPILoaded &&
    typeof Ecwid.OnAPILoaded.add === "function"
  ) {
    Ecwid.OnAPILoaded.add(start);
  }

  const waitForEcwid =
    setInterval(function () {

      start();

      if (started) {
        clearInterval(waitForEcwid);
      }

    }, 300);

})();
