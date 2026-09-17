(function () {
  "use strict";

  /* Prevent duplicate loading */
  if (window.__BGF_GLOBAL_UI__) return;
  window.__BGF_GLOBAL_UI__ = true;

  const DELIVERY = {
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
    defaultRegion: "male"
  };

  let cartState = {
    productsQuantity: 0,
    subtotal: 0
  };

  let selectedRegion = DELIVERY.defaultRegion;
  let ecwidStarted = false;
  let scrollTicking = false;
  let lastScrollY = window.scrollY;

  try {
    const saved = localStorage.getItem("bgfDeliveryRegion");

    if (saved && DELIVERY.regions[saved]) {
      selectedRegion = saved;
    }
  } catch (_) {}

  const VAN_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h11v9H3z"></path>
      <path d="M14 9h3.5l3 3v3H14z"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  `;

  function init() {
    if (!document.body) return;

    /* =========================
       STYLES
       ========================= */

    const style = document.createElement("style");

    style.id = "bgf-global-ui-styles";

    style.textContent = `

      /* =========================
         FLOATING CART
         ========================= */

      #bgc{
        position:fixed;
        top:14px;
        right:16px;
        z-index:99999;

        width:52px;
        height:52px;

        padding:0;

        border:1px solid #e5e5e5;
        border-radius:50%;

        background:#fff;
        color:#111;

        box-shadow:0 6px 20px rgba(0,0,0,.2);

        display:flex;
        align-items:center;
        justify-content:center;

        cursor:pointer;

        opacity:0;
        transform:translateY(-60px);
        pointer-events:none;

        transition:
          opacity .3s ease,
          transform .3s ease;
      }

      #bgc.on{
        opacity:1;
        transform:none;
        pointer-events:auto;
      }

      #bgb{
        position:relative;
        width:29px;
        height:31px;
      }

      #bgn{
        position:absolute;
        left:50%;
        top:18px;

        transform:translate(-50%,-50%);

        color:#fff;

        font:
          700 12px Arial,
          sans-serif;
      }


      /* =========================
         SCROLL TO TOP
         ========================= */

      #bgTopBtn{
        position:fixed;

        left:18px;
        bottom:22px;

        z-index:99998;

        width:46px;
        height:46px;

        padding:0;

        border:1px solid #e5e5e5;
        border-radius:50%;

        background:#fff;
        color:#111;

        box-shadow:
          0 5px 18px
          rgba(0,0,0,.16);

        display:flex;
        align-items:center;
        justify-content:center;

        cursor:pointer;

        opacity:0;
        visibility:hidden;
        pointer-events:none;

        transform:
          translateY(14px)
          scale(.92);

        transition:
          opacity .22s ease,
          transform .3s cubic-bezier(.22,1,.36,1),
          visibility .22s ease,
          box-shadow .2s ease;
      }

      #bgTopBtn.show{
        opacity:1;
        visibility:visible;
        pointer-events:auto;

        transform:
          translateY(0)
          scale(1);
      }

      #bgTopBtn:hover{
        transform:scale(1.07);

        box-shadow:
          0 7px 24px
          rgba(0,0,0,.22);
      }

      #bgTopBtn svg{
        width:20px;
        height:20px;
        display:block;
      }


      /* =========================
         FREE DELIVERY BUTTON
         ========================= */

      #bgf-delivery-button{
        position:fixed;

        left:18px;
        bottom:80px;

        z-index:99998;

        width:46px;
        height:46px;

        border:1px solid #d8d8d8;
        border-radius:50%;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:0;
        margin:0;

        color:#111;
        background:#fff;

        box-shadow:
          0 4px 14px
          rgba(0,0,0,.18);

        cursor:pointer;

        opacity:0;
        visibility:hidden;
        pointer-events:none;

        transform:scale(.75);

        transition:
          opacity .25s ease,
          transform .25s ease,
          background .25s ease,
          color .25s ease,
          border-color .25s ease,
          box-shadow .2s ease;

        -webkit-tap-highlight-color:
          transparent;
      }

      #bgf-delivery-button.bgf-visible{
        opacity:1;
        visibility:visible;
        pointer-events:auto;

        transform:scale(1);
      }

      #bgf-delivery-button:hover{
        background:#f5f5f5;
      }

      #bgf-delivery-button.bgf-active{
        box-shadow:
          0 0 0 3px rgba(0,0,0,.07),
          0 5px 18px rgba(0,0,0,.22);
      }

      #bgf-delivery-button.bgf-unlocked{
        background:#218c4d;
        color:#fff;

        border-color:#218c4d;

        box-shadow:
          0 4px 16px
          rgba(33,140,77,.28);
      }

      #bgf-delivery-button.bgf-unlocked:hover{
        background:#19783f;
        border-color:#19783f;
      }

      #bgf-delivery-button svg{
        width:54%;
        height:54%;

        display:block;

        fill:none;
        stroke:currentColor;

        stroke-width:1.8;
        stroke-linecap:round;
        stroke-linejoin:round;
      }


      /* =========================
         FREE DELIVERY PANEL
         ========================= */

      #bgf-delivery-panel{
        position:fixed;

        left:18px;
        bottom:136px;

        z-index:99997;

        width:min(
          310px,
          calc(100vw - 36px)
        );

        box-sizing:border-box;

        padding:17px;

        background:#fff;
        color:#17211b;

        border:
          1px solid
          rgba(0,0,0,.07);

        border-radius:16px;

        box-shadow:
          0 9px 30px
          rgba(0,0,0,.18);

        font-family:inherit;

        opacity:0;
        visibility:hidden;
        pointer-events:none;

        transform:
          translateY(8px)
          scale(.97);

        transform-origin:
          bottom left;

        transition:
          opacity .2s ease,
          transform .2s ease,
          visibility .2s ease;
      }

      #bgf-delivery-panel.bgf-open{
        opacity:1;
        visibility:visible;
        pointer-events:auto;

        transform:
          translateY(0)
          scale(1);
      }

      .bgf-header{
        display:flex;
        align-items:center;

        gap:9px;

        padding-right:26px;
        margin-bottom:14px;
      }

      .bgf-header-icon{
        flex:0 0 auto;

        width:31px;
        height:31px;

        border-radius:50%;

        display:flex;
        align-items:center;
        justify-content:center;

        background:#f58220;
        color:#fff;
      }

      .bgf-header-icon svg{
        width:18px;
        height:18px;

        fill:none;
        stroke:currentColor;

        stroke-width:1.8;
        stroke-linecap:round;
        stroke-linejoin:round;
      }

      .bgf-title{
        font-size:16px;
        line-height:1.15;
        font-weight:700;
      }

      #bgf-close{
        position:absolute;

        top:10px;
        right:11px;

        width:30px;
        height:30px;

        padding:0;
        border:0;

        background:transparent;
        color:#333;

        font:
          300 23px/28px Arial,
          sans-serif;

        cursor:pointer;
      }

      .bgf-label{
        display:block;

        margin:0 0 6px;

        font-size:11px;
        font-weight:600;

        color:#686868;
      }

      #bgf-region{
        width:100%;
        height:40px;

        box-sizing:border-box;

        margin:0 0 15px;

        padding:
          0 34px
          0 11px;

        border:
          1px solid
          #dedede;

        border-radius:9px;

        background:#f8f8f8;
        color:#1a1a1a;

        font-family:inherit;
        font-size:13px;
        font-weight:600;

        cursor:pointer;
        outline:none;
      }

      #bgf-region:focus{
        border-color:#8ab69a;

        box-shadow:
          0 0 0 2px
          rgba(26,107,67,.09);
      }

      .bgf-track{
        position:relative;

        width:100%;
        height:9px;

        background:#e8e8e8;

        border-radius:100px;

        overflow:hidden;

        margin-bottom:11px;
      }

      #bgf-fill{
        width:0%;
        height:100%;

        border-radius:100px;

        background:#268b4b;

        transition:
          width .4s ease;
      }

      #bgf-message{
        font-size:14px;
        line-height:1.35;
        font-weight:700;

        margin-bottom:8px;
      }

      #bgf-message strong{
        color:#1c8145;
      }

      .bgf-values{
        display:flex;

        justify-content:
          space-between;

        gap:12px;

        color:#6c6c6c;

        font-size:10.5px;
        line-height:1.3;
      }

      .bgf-values span:last-child{
        text-align:right;
      }

      #bgf-delivery-panel.bgf-complete
      #bgf-fill{
        background:#20a453;
      }

      #bgf-delivery-panel.bgf-complete
      .bgf-header-icon{
        background:#20a453;
      }


      /* =========================
         MOBILE
         ========================= */

      @media(max-width:600px){

        #bgTopBtn{
          left:12px;
          bottom:18px;

          width:44px;
          height:44px;
        }

        #bgf-delivery-button{
          left:12px;
          bottom:74px;

          width:44px;
          height:44px;
        }

        #bgf-delivery-panel{
          left:12px;
          bottom:128px;

          width:min(
            310px,
            calc(100vw - 24px)
          );

          padding:15px;

          border-radius:14px;
        }

        .bgf-title{
          font-size:15px;
        }

        #bgf-message{
          font-size:13px;
        }
      }
    `;

    document.head.appendChild(style);


    /* =========================
       FLOATING CART
       ========================= */

    const cartButton =
      document.createElement("button");

    cartButton.id = "bgc";
    cartButton.type = "button";

    cartButton.setAttribute(
      "aria-label",
      "Open cart"
    );

    cartButton.innerHTML = `
      <span id="bgb">

        <svg
          viewBox="0 0 30 32"
          width="29"
          height="31"
          aria-hidden="true"
        >
          <path
            d="M6 10.5h18L22.5 29h-15z"
            fill="currentColor"
          />

          <path
            d="M10.5 11V7.5a4.5 4.5 0 0 1 9 0V11"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>

        <span id="bgn">0</span>

      </span>
    `;

    document.body.appendChild(
      cartButton
    );

    const cartCount =
      document.getElementById(
        "bgn"
      );

    cartButton.addEventListener(
      "click",
      function () {

        if (
          window.Ecwid &&
          typeof Ecwid.openPage ===
            "function"
        ) {
          Ecwid.openPage("cart");
        }
      }
    );


    /* =========================
       SCROLL TO TOP
       ========================= */

    const topButton =
      document.createElement("button");

    topButton.id =
      "bgTopBtn";

    topButton.type =
      "button";

    topButton.setAttribute(
      "aria-label",
      "Back to top"
    );

    topButton.innerHTML = `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 15l6-6 6 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;

    document.body.appendChild(
      topButton
    );

    topButton.addEventListener(
      "click",
      function () {

        topButton.classList.remove(
          "show"
        );

        window.scrollTo({
          top:0,
          behavior:"smooth"
        });
      }
    );


    /* =========================
       FREE DELIVERY
       ========================= */

    const deliveryButton =
      document.createElement(
        "button"
      );

    deliveryButton.id =
      "bgf-delivery-button";

    deliveryButton.type =
      "button";

    deliveryButton.title =
      "Free delivery progress";

    deliveryButton.setAttribute(
      "aria-label",
      "Free delivery progress"
    );

    deliveryButton.setAttribute(
      "aria-expanded",
      "false"
    );

    deliveryButton.innerHTML =
      VAN_ICON;

    const deliveryPanel =
      document.createElement("div");

    deliveryPanel.id =
      "bgf-delivery-panel";

    deliveryPanel.setAttribute(
      "role",
      "region"
    );

    deliveryPanel.setAttribute(
      "aria-label",
      "Free delivery progress"
    );

    deliveryPanel.innerHTML = `
      <button
        id="bgf-close"
        type="button"
        aria-label="Close free delivery progress"
      >
        ×
      </button>

      <div class="bgf-header">

        <div class="bgf-header-icon">
          ${VAN_ICON}
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

        <option value="male">
          Malé
        </option>

        <option value="hulhumale">
          Hulhumalé Phase 1
        </option>

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

    document.body.appendChild(
      deliveryButton
    );

    document.body.appendChild(
      deliveryPanel
    );

    const regionSelect =
      document.getElementById(
        "bgf-region"
      );

    const progressFill =
      document.getElementById(
        "bgf-fill"
      );

    const deliveryMessage =
      document.getElementById(
        "bgf-message"
      );

    const cartValue =
      document.getElementById(
        "bgf-cart-value"
      );

    const targetValue =
      document.getElementById(
        "bgf-target-value"
      );

    const closeButton =
      document.getElementById(
        "bgf-close"
      );

    regionSelect.value =
      selectedRegion;


    /* =========================
       MONEY FORMATTER
       ========================= */

    const moneyFormatter =
      new Intl.NumberFormat(
        "en-US",
        {
          minimumFractionDigits:2,
          maximumFractionDigits:2
        }
      );

    function money(value) {

      return moneyFormatter.format(
        Number(value || 0)
      );
    }


    /* =========================
       DELIVERY PANEL
       ========================= */

    function openPanel() {

      if (
        !cartState.productsQuantity
      ) return;

      deliveryPanel.classList.add(
        "bgf-open"
      );

      deliveryButton.classList.add(
        "bgf-active"
      );

      deliveryButton.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    function closePanel() {

      deliveryPanel.classList.remove(
        "bgf-open"
      );

      deliveryButton.classList.remove(
        "bgf-active"
      );

      deliveryButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    function togglePanel() {

      if (
        deliveryPanel.classList.contains(
          "bgf-open"
        )
      ) {
        closePanel();
      } else {
        openPanel();
      }
    }

    deliveryButton.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        togglePanel();
      }
    );

    closeButton.addEventListener(
      "click",
      closePanel
    );

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
        } catch (_) {}

        renderDelivery();
      }
    );


    /* =========================
       RENDER DELIVERY
       ========================= */

    function renderDelivery() {

      const region =
        DELIVERY.regions[
          selectedRegion
        ];

      const subtotal =
        Number(
          cartState.subtotal || 0
        );

      const quantity =
        Number(
          cartState.productsQuantity || 0
        );

      if (!quantity) {

        deliveryButton.classList.remove(
          "bgf-visible",
          "bgf-unlocked"
        );

        closePanel();

        return;
      }

      deliveryButton.classList.add(
        "bgf-visible"
      );

      const target =
        region.target;

      const remaining =
        Math.max(
          target - subtotal,
          0
        );

      const percentage =
        Math.min(
          target > 0
            ? (subtotal / target) * 100
            : 100,
          100
        );

      progressFill.style.width =
        percentage + "%";

      cartValue.textContent =
        "Cart: MVR " +
        money(subtotal);

      targetValue.textContent =
        "Free at MVR " +
        money(target);

      if (remaining > 0) {

        deliveryPanel.classList.remove(
          "bgf-complete"
        );

        deliveryButton.classList.remove(
          "bgf-unlocked"
        );

        deliveryMessage.innerHTML =
          'Add <strong>MVR ' +
          money(remaining) +
          '</strong> more for FREE delivery to ' +
          region.name;

        deliveryButton.setAttribute(
          "aria-label",
          "Add MVR " +
          money(remaining) +
          " more for free delivery to " +
          region.name
        );

      } else {

        deliveryPanel.classList.add(
          "bgf-complete"
        );

        deliveryButton.classList.add(
          "bgf-unlocked"
        );

        deliveryMessage.innerHTML =
          '✓ <strong>FREE delivery unlocked</strong> for ' +
          region.name +
          "!";

        deliveryButton.setAttribute(
          "aria-label",
          "Free delivery unlocked for " +
          region.name
        );
      }
    }


    /* =========================
       SHARED CART UPDATE
       ========================= */

    function updateCart(cart) {

      if (!cart) return;

      cartState = {
        productsQuantity:
          Number(
            cart.productsQuantity || 0
          ),

        subtotal:
          Number(
            cart.subtotal || 0
          )
      };

      const quantity =
        cartState.productsQuantity;

      cartCount.textContent =
        quantity > 99
          ? "99+"
          : quantity;

      renderDelivery();
    }

    function getCart() {

      if (
        !window.Ecwid ||
        !Ecwid.Cart ||
        typeof Ecwid.Cart.get !==
          "function"
      ) {
        return;
      }

      Ecwid.Cart.get(
        updateCart
      );
    }


    /* =========================
       SINGLE ECWID CONNECTION
       ========================= */

    function startEcwid() {

      if (ecwidStarted) {
        return true;
      }

      if (
        !window.Ecwid ||
        !Ecwid.Cart ||
        typeof Ecwid.Cart.get !==
          "function" ||
        !Ecwid.OnCartChanged ||
        typeof Ecwid.OnCartChanged.add !==
          "function"
      ) {
        return false;
      }

      ecwidStarted = true;

      Ecwid.OnCartChanged.add(
        function (cart) {

          /*
           * Ecwid normally supplies the
           * updated cart object directly.
           */

          if (
            cart &&
            typeof cart === "object"
          ) {
            updateCart(cart);
          } else {
            getCart();
          }
        }
      );

      getCart();

      return true;
    }

    /*
     * Use Ecwid API event where available.
     */

    if (
      window.Ecwid &&
      Ecwid.OnAPILoaded &&
      typeof Ecwid.OnAPILoaded.add ===
        "function"
    ) {
      Ecwid.OnAPILoaded.add(
        startEcwid
      );
    }

    /*
     * Try immediately.
     */

    if (!startEcwid()) {

      /*
       * Short fallback only.
       * Maximum ~10 seconds.
       */

      let attempts = 0;

      const ecwidWait =
        setInterval(
          function () {

            attempts++;

            if (
              startEcwid() ||
              attempts >= 40
            ) {
              clearInterval(
                ecwidWait
              );
            }

          },
          250
        );
    }


    /* =========================
       ONE SCROLL HANDLER
       ========================= */

    function updateScrollUI() {

      scrollTicking = false;

      const currentY =
        window.scrollY;

      /*
       * Floating cart
       */

      cartButton.classList.toggle(
        "on",
        currentY > 180
      );

      /*
       * Scroll-to-top behaviour
       */

      const difference =
        currentY - lastScrollY;

      if (
        currentY < 450
      ) {

        topButton.classList.remove(
          "show"
        );

      } else if (
        Math.abs(difference) >= 3
      ) {

        if (difference > 0) {

          topButton.classList.add(
            "show"
          );

        } else {

          topButton.classList.remove(
            "show"
          );
        }
      }

      lastScrollY =
        currentY;
    }

    window.addEventListener(
      "scroll",
      function () {

        if (scrollTicking) return;

        scrollTicking = true;

        requestAnimationFrame(
          updateScrollUI
        );
      },
      {
        passive:true
      }
    );

    /*
     * Set initial cart-button state
     * without showing Back to Top.
     */

    cartButton.classList.toggle(
      "on",
      window.scrollY > 180
    );


    /* =========================
       PANEL CLOSE EVENTS
       ========================= */

    document.addEventListener(
      "click",
      function (event) {

        if (
          deliveryPanel.classList.contains(
            "bgf-open"
          ) &&
          !deliveryPanel.contains(
            event.target
          ) &&
          !deliveryButton.contains(
            event.target
          )
        ) {
          closePanel();
        }
      }
    );

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape"
        ) {
          closePanel();
        }
      }
    );


    /* =========================
       COPY ACCOUNT BUTTON
       ========================= */

    document.addEventListener(
      "click",
      function (event) {

        const copyButton =
          event.target.closest(
            ".copy-account-btn"
          );

        if (!copyButton) return;

        event.preventDefault();

        const textToCopy =
          copyButton.getAttribute(
            "data-copy"
          );

        if (!textToCopy) return;

        const originalText =
          copyButton.textContent;

        function showCopied() {

          copyButton.textContent =
            "Copied!";

          setTimeout(
            function () {

              copyButton.textContent =
                originalText || "Copy";

            },
            1500
          );
        }

        function fallbackCopy() {

          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value =
            textToCopy;

          textarea.setAttribute(
            "readonly",
            ""
          );

          textarea.style.cssText =
            "position:fixed;" +
            "left:-9999px;" +
            "top:0;";

          document.body.appendChild(
            textarea
          );

          textarea.focus();
          textarea.select();

          try {

            if (
              document.execCommand(
                "copy"
              )
            ) {
              showCopied();
            }

          } catch (error) {

            console.warn(
              "Copy failed:",
              error
            );
          }

          textarea.remove();
        }

        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {

          navigator.clipboard
            .writeText(
              textToCopy
            )
            .then(
              showCopied
            )
            .catch(
              fallbackCopy
            );

        } else {

          fallbackCopy();
        }
      }
    );
  }


  /* =========================
     INITIALISE
     ========================= */

  if (document.body) {

    init();

  } else {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:true
      }
    );
  }

})();
