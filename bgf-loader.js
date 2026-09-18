(function () {
    "use strict";

    if (window.__BGF_SMART_LOADER__) return;
    window.__BGF_SMART_LOADER__ = true;

    /* =========================================================
       CHANGE ONLY THIS
       ========================================================= */

    const LOGO_URL = "https://cdn.jsdelivr.net/gh/bgftech26/Ecwid-code@3647958e41ca09b9013a6d1dd85a5f4ccb928ca9/blackgold-loader.webp";

    /* ========================================================= */

    const MIN_VISIBLE_TIME = 220;
    const MAX_PAGE_WAIT = 2500;
    const NAV_SAFETY_TIMEOUT = 4500;

    /*
     * If the user presses a link but drags away / cancels
     * instead of actually clicking it, remove the loader.
     */
    const POINTER_CANCEL_TIMEOUT = 900;

    let loader = null;

    let shownAt = 0;

    let hideTimer = null;
    let safetyTimer = null;
    let pointerTimer = null;

    let ecwidConnected = false;

    let pendingPointerLink = null;


    /* =========================================================
       STYLES
       ========================================================= */

    function installStyles() {

        if (
            document.getElementById(
                "bgf-smart-loader-style"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "bgf-smart-loader-style";

        style.textContent = `

            #bgf-page-loader{
                position:fixed;
                inset:0;

                z-index:2147483647;

                display:flex;
                align-items:center;
                justify-content:center;

                background:
                    rgba(255,255,255,.98);

                opacity:0;
                visibility:hidden;

                /*
                 * CRITICAL:
                 * Loader must NEVER intercept clicks.
                 */
                pointer-events:none;

                transition:
                    opacity .18s ease,
                    visibility .18s ease;
            }

            #bgf-page-loader.bgf-visible{
                opacity:1;
                visibility:visible;

                /*
                 * Keep this NONE.
                 * Do not change to auto.
                 */
                pointer-events:none;
            }

            #bgf-loader-inner{
                width:190px;

                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;

                transform:scale(.96);

                transition:
                    transform .22s ease;
            }

            #bgf-page-loader.bgf-visible
            #bgf-loader-inner{
                transform:scale(1);
            }

            #bgf-loader-logo-wrap{
                position:relative;

                width:142px;
                height:142px;

                display:flex;
                align-items:center;
                justify-content:center;
            }

            #bgf-loader-logo-wrap::before{
                content:"";

                position:absolute;
                inset:-8px;

                border-radius:50%;

                border:
                    2px solid
                    rgba(105,115,78,.12);

                border-top-color:#69734e;
                border-right-color:#69734e;

                animation:
                    bgfLoaderSpin
                    1.2s
                    linear
                    infinite;
            }

            #bgf-loader-logo{
                display:block;

                width:128px;
                height:128px;

                object-fit:contain;

                animation:
                    bgfLogoPulse
                    1.55s
                    ease-in-out
                    infinite;

                will-change:
                    transform,
                    opacity;
            }

            #bgf-loader-line{
                position:relative;

                width:105px;
                height:2px;

                margin-top:22px;

                overflow:hidden;

                border-radius:20px;

                background:#ededeb;
            }

            #bgf-loader-line::after{
                content:"";

                position:absolute;

                top:0;
                left:-45%;

                width:45%;
                height:100%;

                border-radius:20px;

                background:#69734e;

                animation:
                    bgfLoaderLine
                    1.1s
                    ease-in-out
                    infinite;
            }

            #bgf-loader-text{
                margin-top:12px;

                font-family:
                    Arial,
                    sans-serif;

                font-size:10px;
                font-weight:600;

                letter-spacing:1.8px;

                text-transform:uppercase;

                color:#777;
            }

            @keyframes bgfLoaderSpin{

                to{
                    transform:
                        rotate(360deg);
                }
            }

            @keyframes bgfLogoPulse{

                0%,
                100%{
                    transform:
                        scale(.96);

                    opacity:.88;
                }

                50%{
                    transform:
                        scale(1.02);

                    opacity:1;
                }
            }

            @keyframes bgfLoaderLine{

                0%{
                    left:-45%;
                }

                55%{
                    left:55%;
                }

                100%{
                    left:110%;
                }
            }

            @media(max-width:600px){

                #bgf-loader-inner{
                    width:160px;
                }

                #bgf-loader-logo-wrap{
                    width:120px;
                    height:120px;
                }

                #bgf-loader-logo{
                    width:108px;
                    height:108px;
                }
            }

            @media(
                prefers-reduced-motion:
                reduce
            ){

                #bgf-page-loader,
                #bgf-loader-inner{
                    transition:none;
                }

                #bgf-loader-logo,
                #bgf-loader-logo-wrap::before,
                #bgf-loader-line::after{
                    animation:none;
                }
            }
        `;

        document.head.appendChild(
            style
        );
    }


    /* =========================================================
       CREATE LOADER
       ========================================================= */

    function createLoader() {

        const existing =
            document.getElementById(
                "bgf-page-loader"
            );

        if (existing) {

            loader = existing;

            return;
        }

        loader =
            document.createElement(
                "div"
            );

        loader.id =
            "bgf-page-loader";

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

                <div
                    id="bgf-loader-logo-wrap"
                >

                    <img
                        id="bgf-loader-logo"
                        src="${LOGO_URL}"
                        alt="Blackgold Foods"
                        width="128"
                        height="128"
                        fetchpriority="high"
                    >

                </div>

                <div
                    id="bgf-loader-line"
                ></div>

                <div
                    id="bgf-loader-text"
                >
                    Loading
                </div>

            </div>
        `;

        document.body.insertBefore(
            loader,
            document.body.firstChild
        );
    }


    /* =========================================================
       SHOW
       ========================================================= */

    function showLoader() {

        if (!loader) return;

        clearTimeout(
            hideTimer
        );

        clearTimeout(
            safetyTimer
        );

        shownAt =
            performance.now();

        loader.classList.add(
            "bgf-visible"
        );
    }


    /* =========================================================
       HIDE
       ========================================================= */

    function hideLoader() {

        if (!loader) return;

        clearTimeout(
            hideTimer
        );

        clearTimeout(
            safetyTimer
        );

        clearTimeout(
            pointerTimer
        );

        pendingPointerLink =
            null;

        const elapsed =
            shownAt
                ? performance.now() -
                  shownAt
                : MIN_VISIBLE_TIME;

        const delay =
            Math.max(
                MIN_VISIBLE_TIME -
                elapsed,
                0
            );

        hideTimer =
            setTimeout(
                function () {

                    loader.classList.remove(
                        "bgf-visible"
                    );

                },
                delay
            );
    }


    /* =========================================================
       NAVIGATION SAFETY
       ========================================================= */

    function armNavigationSafety() {

        clearTimeout(
            safetyTimer
        );

        safetyTimer =
            setTimeout(
                hideLoader,
                NAV_SAFETY_TIMEOUT
            );
    }


    /* =========================================================
       VALID INTERNAL LINK?
       ========================================================= */

    function validInternalLink(
        anchor,
        event
    ) {

        if (!anchor) {
            return false;
        }

        if (
            anchor.hasAttribute(
                "download"
            )
        ) {
            return false;
        }

        if (
            anchor.target &&
            anchor.target !== "_self"
        ) {
            return false;
        }

        if (
            event &&
            (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            )
        ) {
            return false;
        }

        const href =
            anchor.getAttribute(
                "href"
            );

        if (
            !href ||
            href === "#" ||
            href.startsWith(
                "javascript:"
            ) ||
            href.startsWith(
                "mailto:"
            ) ||
            href.startsWith(
                "tel:"
            )
        ) {
            return false;
        }

        let url;

        try {

            url =
                new URL(
                    href,
                    window.location.href
                );

        } catch (_) {

            return false;
        }

        /*
         * External link:
         * don't show loader.
         */

        if (
            url.origin !==
            window.location.origin
        ) {
            return false;
        }

        /*
         * Exact current page:
         * don't show loader.
         */

        if (
            url.href ===
            window.location.href
        ) {
            return false;
        }

        /*
         * Same page anchor link:
         * don't show loader.
         */

        if (
            url.pathname ===
                window.location.pathname &&
            url.search ===
                window.location.search &&
            url.hash
        ) {
            return false;
        }

        return true;
    }


    /* =========================================================
       POINTERDOWN

       This happens BEFORE the normal click.
       It lets the browser begin painting the loader
       before navigation starts.
       ========================================================= */

    document.addEventListener(
        "pointerdown",
        function (event) {

            /*
             * Only normal left-click / touch.
             */

            if (
                event.button !== 0
            ) {
                return;
            }

            const target =
                event.target instanceof Element
                    ? event.target
                    : null;

            if (!target) return;

            const anchor =
                target.closest(
                    "a[href]"
                );

            if (
                !validInternalLink(
                    anchor,
                    event
                )
            ) {
                return;
            }

            pendingPointerLink =
                anchor;

            /*
             * IMPORTANT:
             * We show the loader but DO NOT:
             *
             * preventDefault()
             * stopPropagation()
             * change location
             *
             * Browser navigation remains normal.
             */

            showLoader();

            /*
             * If the user presses but cancels
             * instead of clicking, hide it.
             */

            clearTimeout(
                pointerTimer
            );

            pointerTimer =
                setTimeout(
                    function () {

                        if (
                            pendingPointerLink
                        ) {

                            pendingPointerLink =
                                null;

                            hideLoader();
                        }

                    },
                    POINTER_CANCEL_TIMEOUT
                );

        },
        {
            capture:true,
            passive:true
        }
    );


    /* =========================================================
       CLICK

       For mouse/touch:
       confirms the pointerdown became a real click.

       For keyboard:
       event.detail === 0, so show loader here.
       ========================================================= */

    document.addEventListener(
        "click",
        function (event) {

            const target =
                event.target instanceof Element
                    ? event.target
                    : null;

            if (!target) return;

            const anchor =
                target.closest(
                    "a[href]"
                );

            if (
                !validInternalLink(
                    anchor,
                    event
                )
            ) {
                return;
            }


            /*
             * Keyboard-generated click.
             */

            if (
                event.detail === 0
            ) {

                showLoader();

                armNavigationSafety();

                return;
            }


            /*
             * Normal pointer click.
             *
             * Loader was already shown on
             * pointerdown, so DON'T show it
             * again.
             */

            if (
                pendingPointerLink
            ) {

                pendingPointerLink =
                    null;

                clearTimeout(
                    pointerTimer
                );

                armNavigationSafety();
            }

        },
        true
    );


    /* =========================================================
       ECWID / LIGHTSPEED PAGE READY
       ========================================================= */

    function connectEcwid() {

        if (
            ecwidConnected
        ) {
            return true;
        }

        if (
            !window.Ecwid ||
            !Ecwid.OnPageLoaded ||
            typeof
                Ecwid.OnPageLoaded.add !==
                "function"
        ) {
            return false;
        }

        ecwidConnected =
            true;

        Ecwid.OnPageLoaded.add(
            function () {

                /*
                 * Wait for two browser paint
                 * opportunities before fading out.
                 */

                requestAnimationFrame(
                    function () {

                        requestAnimationFrame(
                            hideLoader
                        );

                    }
                );
            }
        );

        return true;
    }


    /* =========================================================
       NORMAL PAGE READY
       ========================================================= */

    function pageReady() {

        const path =
            window.location.pathname
                .toLowerCase();

        const isStorePage =
            path.indexOf(
                "/products"
            ) === 0;

        /*
         * Regular pages don't need
         * to wait for Ecwid.
         */

        if (
            !isStorePage
        ) {

            requestAnimationFrame(
                function () {

                    requestAnimationFrame(
                        hideLoader
                    );

                }
            );
        }
    }


    /* =========================================================
       INITIALISE
       ========================================================= */

    function init() {

        if (
            !document.body
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                init,
                {
                    once:true
                }
            );

            return;
        }

        installStyles();

        createLoader();


        /*
         * Initial page load / refresh.
         */

        showLoader();


        /*
         * Connect to Ecwid.
         */

        if (
            !connectEcwid()
        ) {

            let attempts = 0;

            const wait =
                setInterval(
                    function () {

                        attempts++;

                        if (
                            connectEcwid() ||
                            attempts >= 20
                        ) {

                            clearInterval(
                                wait
                            );
                        }

                    },
                    100
                );
        }


        /*
         * DOM ready.
         */

        if (
            document.readyState ===
                "interactive" ||
            document.readyState ===
                "complete"
        ) {

            pageReady();

        } else {

            document.addEventListener(
                "DOMContentLoaded",
                pageReady,
                {
                    once:true
                }
            );
        }


        /*
         * Absolute safety fallback.
         *
         * Loader can never remain stuck
         * on initial page loading.
         */

        setTimeout(
            hideLoader,
            MAX_PAGE_WAIT
        );


        /*
         * Safari / browser back-forward cache.
         */

        window.addEventListener(
            "pageshow",
            function (event) {

                if (
                    event.persisted
                ) {
                    hideLoader();
                }

            }
        );


        /*
         * Optional manual API.
         *
         * Useful if one of YOUR custom
         * buttons navigates using JS.
         */

        window.BGFLoader = {

            show:
                showLoader,

            hide:
                hideLoader
        };
    }


    init();

})();
