(function () {
    "use strict";

    /* Prevent duplicate loader */
    if (window.__BGF_PAGE_LOADER__) return;
    window.__BGF_PAGE_LOADER__ = true;

    /* =========================================================
       CHANGE ONLY THIS URL
       ========================================================= */

    const LOGO_URL =
        "https://cdn.jsdelivr.net/gh/bgftech26/Ecwid-code@840047220e698a13cbb7f23a753fdfd9a9375e1d/blackgold-loader.webp";

    /* ========================================================= */

    const MIN_DISPLAY_TIME = 400;

    /*
     * Never keep the customer behind the loader
     * for more than 1.8 seconds.
     */
    const MAX_DISPLAY_TIME = 1800;

    const startedAt = performance.now();

    let removed = false;
    let ecwidConnected = false;


    /* =========================================================
       STYLES
       ========================================================= */

    const style = document.createElement("style");

    style.id = "bgf-loader-style";

    style.textContent = `

        #bgf-page-loader {
            position: fixed;
            inset: 0;

            z-index: 2147483647;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #fff;

            opacity: 1;
            visibility: visible;

            transition:
                opacity .4s ease,
                visibility .4s ease;
        }

        #bgf-page-loader.bgf-loader-hide {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        #bgf-loader-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            width: 190px;
        }

        #bgf-loader-logo-wrap {
            position: relative;

            width: 142px;
            height: 142px;

            display: flex;
            align-items: center;
            justify-content: center;
        }

        #bgf-loader-logo-wrap::before {
            content: "";

            position: absolute;
            inset: -8px;

            border-radius: 50%;

            border:
                2px solid
                rgba(105,115,78,.13);

            border-top-color: #69734e;
            border-right-color: #69734e;

            animation:
                bgfLoaderSpin
                1.2s
                linear
                infinite;
        }

        #bgf-loader-logo {
            width: 128px;
            height: 128px;

            display: block;

            object-fit: contain;

            animation:
                bgfLogoPulse
                1.6s
                ease-in-out
                infinite;

            will-change:
                transform,
                opacity;
        }

        #bgf-loader-progress {
            position: relative;

            width: 105px;
            height: 2px;

            margin-top: 22px;

            overflow: hidden;

            border-radius: 20px;

            background: #ededeb;
        }

        #bgf-loader-progress::after {
            content: "";

            position: absolute;

            top: 0;
            left: -45%;

            width: 45%;
            height: 100%;

            border-radius: 20px;

            background: #69734e;

            animation:
                bgfLoaderProgress
                1.1s
                ease-in-out
                infinite;
        }

        #bgf-loader-text {
            margin-top: 12px;

            font-family:
                Arial,
                sans-serif;

            font-size: 10px;
            font-weight: 600;

            letter-spacing: 1.8px;

            text-transform: uppercase;

            color: #777;
        }

        @keyframes bgfLoaderSpin {

            to {
                transform: rotate(360deg);
            }
        }

        @keyframes bgfLogoPulse {

            0%,
            100% {
                transform: scale(.96);
                opacity: .88;
            }

            50% {
                transform: scale(1.02);
                opacity: 1;
            }
        }

        @keyframes bgfLoaderProgress {

            0% {
                left: -45%;
            }

            55% {
                left: 55%;
            }

            100% {
                left: 110%;
            }
        }

        @media (max-width: 600px) {

            #bgf-loader-inner {
                width: 160px;
            }

            #bgf-loader-logo-wrap {
                width: 120px;
                height: 120px;
            }

            #bgf-loader-logo {
                width: 108px;
                height: 108px;
            }
        }

        @media (prefers-reduced-motion: reduce) {

            #bgf-loader-logo,
            #bgf-loader-logo-wrap::before,
            #bgf-loader-progress::after {
                animation: none !important;
            }
        }
    `;

    document.head.appendChild(style);


    /* =========================================================
       CREATE LOADER
       ========================================================= */

    const loader = document.createElement("div");

    loader.id = "bgf-page-loader";

    loader.setAttribute(
        "role",
        "status"
    );

    loader.setAttribute(
        "aria-label",
        "Loading Blackgold Foods"
    );

    loader.innerHTML = `

        <div id="bgf-loader-inner">

            <div id="bgf-loader-logo-wrap">

                <img
                    id="bgf-loader-logo"
                    src="${LOGO_URL}"
                    alt="Blackgold Foods"
                    width="128"
                    height="128"
                >

            </div>

            <div id="bgf-loader-progress"></div>

            <div id="bgf-loader-text">
                Loading
            </div>

        </div>
    `;


    /*
     * Since this script is loaded at the very beginning
     * of BODY, document.body should already exist.
     */

    if (document.body) {

        document.body.insertBefore(
            loader,
            document.body.firstChild
        );

    } else {

        document.documentElement.appendChild(
            loader
        );
    }


    /* =========================================================
       REMOVE LOADER
       ========================================================= */

    function hideLoader() {

        if (removed) return;

        removed = true;

        const elapsed =
            performance.now() -
            startedAt;

        const delay =
            Math.max(
                MIN_DISPLAY_TIME - elapsed,
                0
            );

        setTimeout(function () {

            loader.classList.add(
                "bgf-loader-hide"
            );

            setTimeout(function () {

                if (loader.parentNode) {
                    loader.remove();
                }

                if (style.parentNode) {
                    style.remove();
                }

            }, 450);

        }, delay);
    }


    /* =========================================================
       ECWID / LIGHTSPEED PRODUCTS
       ========================================================= */

    function connectEcwid() {

        if (ecwidConnected) {
            return true;
        }

        if (
            !window.Ecwid ||
            !Ecwid.OnPageLoaded ||
            typeof Ecwid.OnPageLoaded.add !== "function"
        ) {
            return false;
        }

        ecwidConnected = true;

        Ecwid.OnPageLoaded.add(function () {

            /*
             * Give Lightspeed a brief moment
             * to paint the catalogue.
             */

            setTimeout(
                hideLoader,
                100
            );
        });

        return true;
    }


    /*
     * Product/category pages benefit from
     * waiting briefly for Ecwid.
     */

    const path =
        window.location.pathname
            .toLowerCase();

    const isStorePage =
        path.indexOf("/products") === 0;


    /* =========================================================
       DOM READY
       ========================================================= */

    function domReady() {

        /*
         * Non-catalogue pages:
         * DOM ready is sufficient.
         */

        if (!isStorePage) {

            requestAnimationFrame(
                function () {

                    requestAnimationFrame(
                        hideLoader
                    );
                }
            );
        }
    }


    if (
        document.readyState === "interactive" ||
        document.readyState === "complete"
    ) {

        domReady();

    } else {

        document.addEventListener(
            "DOMContentLoaded",
            domReady,
            {
                once: true
            }
        );
    }


    /* =========================================================
       WAIT BRIEFLY FOR ECWID API
       ========================================================= */

    if (!connectEcwid()) {

        let attempts = 0;

        const ecwidWait =
            setInterval(function () {

                attempts++;

                if (
                    connectEcwid() ||
                    attempts >= 15
                ) {
                    clearInterval(
                        ecwidWait
                    );
                }

            }, 100);
    }


    /* =========================================================
       ABSOLUTE SAFETY LIMIT
       ========================================================= */

    setTimeout(
        hideLoader,
        MAX_DISPLAY_TIME
    );

})();
