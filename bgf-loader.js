(function () {
    "use strict";

    if (window.__BGF_SMART_LOADER__) return;
    window.__BGF_SMART_LOADER__ = true;

    /* =========================================================
       CHANGE ONLY THIS
       ========================================================= */

    const LOGO_URL =
        "https://cdn.jsdelivr.net/gh/bgftech26/Ecwid-code@0f6b5e8e4be165adcd6af5ceb7d43ccf3316b03e/blackgold-loader.webp";

    /* ========================================================= */

    const MIN_VISIBLE_TIME = 250;
    const MAX_PAGE_WAIT = 2200;
    const CLICK_SAFETY_TIMEOUT = 5000;

    const NAV_KEY = "bgf_navigation_in_progress";

    let loader = null;
    let hideTimer = null;
    let safetyTimer = null;
    let shownAt = 0;
    let ecwidConnected = false;

    /* =========================================================
       STYLES
       ========================================================= */

    const style = document.createElement("style");

    style.id = "bgf-smart-loader-style";

    style.textContent = `
        #bgf-page-loader{
            position:fixed;
            inset:0;
            z-index:2147483647;

            display:flex;
            align-items:center;
            justify-content:center;

            background:rgba(255,255,255,.98);

            opacity:0;
            visibility:hidden;
            pointer-events:none;

            transition:
                opacity .18s ease,
                visibility .18s ease;
        }

        #bgf-page-loader.bgf-visible{
            opacity:1;
            visibility:visible;
            pointer-events:auto;
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

            border:2px solid rgba(105,115,78,.12);
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

            font-family:Arial,sans-serif;

            font-size:10px;
            font-weight:600;

            letter-spacing:1.8px;

            text-transform:uppercase;

            color:#777;
        }

        @keyframes bgfLoaderSpin{
            to{
                transform:rotate(360deg);
            }
        }

        @keyframes bgfLogoPulse{
            0%,100%{
                transform:scale(.96);
                opacity:.88;
            }

            50%{
                transform:scale(1.02);
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

        @media(prefers-reduced-motion:reduce){

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

    document.head.appendChild(style);

    /* =========================================================
       CREATE LOADER
       ========================================================= */

    function createLoader() {

        const existing =
            document.getElementById("bgf-page-loader");

        if (existing) {
            loader = existing;
            return;
        }

        loader = document.createElement("div");

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

                <div id="bgf-loader-line"></div>

                <div id="bgf-loader-text">
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
       SHOW LOADER
       ========================================================= */

    function showLoader(navigation) {

        if (!loader) return;

        clearTimeout(hideTimer);
        clearTimeout(safetyTimer);

        shownAt = performance.now();

        if (navigation) {

            try {
                sessionStorage.setItem(
                    NAV_KEY,
                    "1"
                );
            } catch (_) {}
        }

        loader.classList.add(
            "bgf-visible"
        );

        if (navigation) {

            safetyTimer =
                setTimeout(
                    hideLoader,
                    CLICK_SAFETY_TIMEOUT
                );
        }
    }

    /* =========================================================
       HIDE LOADER
       ========================================================= */

    function hideLoader() {

        if (!loader) return;

        clearTimeout(hideTimer);
        clearTimeout(safetyTimer);

        try {
            sessionStorage.removeItem(
                NAV_KEY
            );
        } catch (_) {}

        const elapsed =
            shownAt
                ? performance.now() - shownAt
                : MIN_VISIBLE_TIME;

        const delay =
            Math.max(
                MIN_VISIBLE_TIME - elapsed,
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
       CHECK INTERNAL LINKS
       ========================================================= */

    function validInternalLink(anchor, event) {

        if (!anchor) return false;

        if (
            anchor.hasAttribute("download")
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
            anchor.getAttribute("href");

        if (
            !href ||
            href === "#" ||
            href.startsWith("javascript:") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
        ) {
            return false;
        }

        let url;

        try {

            url = new URL(
                href,
                window.location.href
            );

        } catch (_) {

            return false;
        }

        /* External links */
        if (
            url.origin !==
            window.location.origin
        ) {
            return false;
        }

        /* Same-page anchor */
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
       MOUSE + TOUCH
       pointerdown happens BEFORE click/navigation
       ========================================================= */

    document.addEventListener(
        "pointerdown",
        function (event) {

            if (event.button !== 0) {
                return;
            }

            const anchor =
                event.target.closest(
                    "a[href]"
                );

            if (
                validInternalLink(
                    anchor,
                    event
                )
            ) {
                showLoader(true);
            }

        },
        {
            capture:true,
            passive:true
        }
    );

    /* =========================================================
       KEYBOARD NAVIGATION ONLY

       event.detail === 0 means the click was normally
       generated by keyboard rather than mouse/touch.

       This avoids showing the loader twice.
       ========================================================= */

    document.addEventListener(
        "click",
        function (event) {

            if (event.detail !== 0) {
                return;
            }

            const anchor =
                event.target.closest(
                    "a[href]"
                );

            if (
                validInternalLink(
                    anchor,
                    event
                )
            ) {
                showLoader(true);
            }

        },
        true
    );

    /* =========================================================
       FORM SUBMISSIONS
       ========================================================= */

    document.addEventListener(
        "submit",
        function (event) {

            const form =
                event.target;

            if (
                !(form instanceof HTMLFormElement)
            ) {
                return;
            }

            if (
                form.target &&
                form.target !== "_self"
            ) {
                return;
            }

            showLoader(true);

        },
        true
    );

    /* =========================================================
       ECWID / LIGHTSPEED
       ========================================================= */

    function connectEcwid() {

        if (ecwidConnected) {
            return true;
        }

        if (
            !window.Ecwid ||
            !Ecwid.OnPageLoaded ||
            typeof Ecwid.OnPageLoaded.add !==
                "function"
        ) {
            return false;
        }

        ecwidConnected = true;

        Ecwid.OnPageLoaded.add(
            function () {

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
            location.pathname
                .toLowerCase();

        const storePage =
            path.indexOf(
                "/products"
            ) === 0;

        /*
         * Normal pages don't need to
         * wait for Ecwid.
         */

        if (!storePage) {

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

    createLoader();

    /*
     * Show loader immediately on direct
     * visits / refresh as well.
     */

    showLoader(false);

    /* Connect Ecwid */

    if (!connectEcwid()) {

        let attempts = 0;

        const wait =
            setInterval(
                function () {

                    attempts++;

                    if (
                        connectEcwid() ||
                        attempts >= 20
                    ) {
                        clearInterval(wait);
                    }

                },
                100
            );
    }

    /* DOM ready */

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
     * Customer can never be trapped
     * behind the loader.
     */

    setTimeout(
        hideLoader,
        MAX_PAGE_WAIT
    );

    /*
     * Fix Safari/iPhone browser
     * back/forward cache.
     */

    window.addEventListener(
        "pageshow",
        function (event) {

            if (event.persisted) {
                hideLoader();
            }
        }
    );

    /* Optional manual control */

    window.BGFLoader = {

        show:function () {
            showLoader(false);
        },

        hide:hideLoader
    };

})();
