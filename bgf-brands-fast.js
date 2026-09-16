/* Blackgold Foods - Fast Brand Directory
   Uses only public Lightspeed/Ecwid catalog data.
*/

(() => {

  'use strict';

  const STORE_ID =
    142042029;

  const PUBLIC_TOKEN =
    'public_kdm3WfjBY4WKvcRS43yiEGK54XBTBTpq';

  const ROOT_ID =
    'bgf-brand-browser';

  const CACHE_KEY =
    'bgf_brands_v2';

  /*
   * Brand names change much less
   * frequently than products.
   */
  const CACHE_TTL =
    12 * 60 * 60 * 1000;

  const API =
    `https://app.ecwid.com/api/v3/${STORE_ID}/brands`;

  const root =
    document.getElementById(
      ROOT_ID
    );

  if (
    !root ||
    root.dataset.bgfLoaded === '1'
  ) return;

  root.dataset.bgfLoaded = '1';

  injectStyles();

  root.innerHTML =
    '<div class="bgf-brand-status">' +
    'Loading brands…' +
    '</div>';

  loadBrands()
    .then(render)
    .catch(err => {

      console.error(
        '[BGF brands]',
        err
      );

      root.innerHTML =
        '<div class="bgf-brand-error">' +
        'Brands could not be loaded. ' +
        'Please refresh the page.' +
        '</div>';
    });

  async function loadBrands() {

    const cached =
      readCache();

    if (cached)
      return cached;

    const items = [];

    let offset = 0;

    let total = Infinity;

    while (
      offset < total
    ) {

      const params =
        new URLSearchParams({
          limit: '100',
          offset:
            String(offset)
        });

      const response =
        await fetch(
          `${API}?${params}`,
          {
            headers: {
              Authorization:
                `Bearer ${PUBLIC_TOKEN}`
            },

            mode: 'cors',

            credentials:
              'omit'
          }
        );

      if (!response.ok) {

        throw new Error(
          `Brands API returned HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const batch =
        Array.isArray(
          data.items
        )
          ? data.items
          : [];

      items.push(
        ...batch
      );

      total =
        Number.isFinite(
          data.total
        )
          ? data.total
          : items.length;

      offset +=
        batch.length;

      if (!batch.length)
        break;
    }

    /*
     * Remove duplicates and entries
     * that do not have a valid
     * filtered-products URL.
     */
    const unique = [

      ...new Map(

        items

          .filter(
            b =>
              b &&
              b.name &&
              b.productsFilteredByBrandUrl
          )

          .map(
            b => [

              b.name
                .trim()
                .toLocaleLowerCase(),

              {
                name:
                  b.name.trim(),

                url:
                  b.productsFilteredByBrandUrl
              }

            ]
          )

      ).values()

    ]
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              sensitivity:
                'base'
            }
          )
      );

    writeCache(
      unique
    );

    return unique;
  }

  function render(
    brands
  ) {

    if (
      !brands.length
    ) {

      root.innerHTML =
        '<div class="bgf-brand-status">' +
        'No brands are currently available.' +
        '</div>';

      return;
    }

    const letters = [

      ...new Set(

        brands.map(
          b =>
            firstLetter(
              b.name
            )
        )

      )

    ];

    root.innerHTML = `

      <div
        class="bgf-brand-controls"
      >

        <label
          class="bgf-brand-search-wrap"
        >

          <span
            class="sr-only"
          >
            Search brands
          </span>

          <input
            id="bgf-brand-search"
            type="search"
            placeholder="Search brands"
            autocomplete="off"
          >

        </label>

        <div
          class="bgf-brand-letters"
          aria-label="Jump to brand letter"
        >

          <button
            type="button"
            data-letter="ALL"
            class="is-active"
          >
            All
          </button>

          ${
            letters
              .map(
                l =>
                  `<button
                     type="button"
                     data-letter="${
                       escapeAttr(l)
                     }"
                   >
                     ${
                       escapeHtml(l)
                     }
                   </button>`
              )
              .join('')
          }

        </div>

      </div>

      <div
        id="bgf-brand-list"
        class="bgf-brand-list"
      ></div>

      <div
        id="bgf-brand-empty"
        class="bgf-brand-empty"
        hidden
      >
        No matching brands.
      </div>
    `;

    const input =
      root.querySelector(
        '#bgf-brand-search'
      );

    const list =
      root.querySelector(
        '#bgf-brand-list'
      );

    const empty =
      root.querySelector(
        '#bgf-brand-empty'
      );

    const buttons = [

      ...root.querySelectorAll(
        '.bgf-brand-letters button'
      )

    ];

    let activeLetter =
      'ALL';

    const paint = () => {

      const q =
        input.value
          .trim()
          .toLocaleLowerCase();

      const filtered =
        brands.filter(
          b =>

            (
              activeLetter ===
                'ALL' ||

              firstLetter(
                b.name
              ) ===
                activeLetter
            )

            &&

            (
              !q ||

              b.name
                .toLocaleLowerCase()
                .includes(q)
            )
        );

      list.innerHTML =
        filtered
          .map(
            b =>
              `<a
                 href="${
                   escapeAttr(
                     b.url
                   )
                 }"
               >
                 ${
                   escapeHtml(
                     b.name
                   )
                 }
               </a>`
          )
          .join('');

      empty.hidden =
        filtered.length !== 0;
    };

    input.addEventListener(
      'input',
      paint,
      {
        passive: true
      }
    );

    buttons.forEach(
      btn =>
        btn.addEventListener(
          'click',
          () => {

            activeLetter =
              btn.dataset.letter;

            buttons.forEach(
              b =>
                b.classList.toggle(
                  'is-active',
                  b === btn
                )
            );

            paint();
          }
        )
    );

    paint();
  }

  function firstLetter(
    name
  ) {

    const m =
      String(name)
        .trim()
        .match(
          /[A-Za-z]/
        );

    return m
      ? m[0].toUpperCase()
      : '#';
  }

  function readCache() {

    try {

      const raw =
        localStorage.getItem(
          CACHE_KEY
        );

      if (!raw)
        return null;

      const data =
        JSON.parse(raw);

      if (
        !data ||
        !Array.isArray(
          data.items
        ) ||
        Date.now() -
          data.savedAt >
          CACHE_TTL
      ) {

        return null;
      }

      return data.items;

    } catch (_) {

      return null;
    }
  }

  function writeCache(
    items
  ) {

    try {

      localStorage.setItem(
        CACHE_KEY,

        JSON.stringify({
          savedAt:
            Date.now(),

          items
        })
      );

    } catch (_) {}
  }

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ''
    ).replace(
      /[&<>'"]/g,

      ch =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        })[ch]
    );
  }

  function escapeAttr(
    value
  ) {

    return escapeHtml(
      value
    );
  }

  function injectStyles() {

    if (
      document.getElementById(
        'bgf-brand-styles'
      )
    ) return;

    const style =
      document.createElement(
        'style'
      );

    style.id =
      'bgf-brand-styles';

    style.textContent = `

      #${ROOT_ID} {
        max-width:1180px;
        margin:0 auto;
        padding:8px 16px 40px;
        font-family:inherit;
        color:inherit;
      }

      .bgf-brand-controls {
        display:grid;
        gap:14px;
        margin-bottom:22px;
      }

      .bgf-brand-search-wrap input {
        width:100%;
        max-width:520px;
        font:inherit;
        font-size:16px;
        padding:12px 14px;
        border:
          1px solid
          rgba(0,0,0,.22);
        border-radius:12px;
        background:#fff;
        color:#111;
      }

      .bgf-brand-letters {
        display:flex;
        flex-wrap:wrap;
        gap:7px;
      }

      .bgf-brand-letters button {
        font:inherit;
        font-size:13px;
        min-width:34px;
        height:34px;
        padding:0 10px;
        border:
          1px solid
          rgba(0,0,0,.15);
        border-radius:999px;
        background:#fff;
        cursor:pointer;
      }

      .bgf-brand-letters
      button.is-active {
        background:#111;
        color:#fff;
        border-color:#111;
      }

      .bgf-brand-list {
        display:grid;

        grid-template-columns:
          repeat(
            4,
            minmax(0,1fr)
          );

        gap:
          10px 18px;
      }

      .bgf-brand-list a {
        display:block;
        color:inherit;
        text-decoration:none;
        padding:10px 0;

        border-bottom:
          1px solid
          rgba(0,0,0,.08);

        font-size:15px;
      }

      .bgf-brand-list
      a:hover {
        text-decoration:
          underline;
      }

      .bgf-brand-status,
      .bgf-brand-error,
      .bgf-brand-empty {
        padding:22px 0;
        text-align:center;
      }

      .bgf-brand-error {
        color:#8a1f1f;
      }

      .sr-only {
        position:absolute;
        width:1px;
        height:1px;
        padding:0;
        margin:-1px;
        overflow:hidden;
        clip:
          rect(
            0,
            0,
            0,
            0
          );
        white-space:nowrap;
        border:0;
      }

      @media(max-width:850px) {

        .bgf-brand-list {
          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );
        }
      }

      @media(max-width:600px) {

        #${ROOT_ID} {
          padding-left:12px;
          padding-right:12px;
        }

        .bgf-brand-list {
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap:
            6px 14px;
        }

        .bgf-brand-list a {
          font-size:14px;
        }

        .bgf-brand-letters {
          gap:6px;
        }

        .bgf-brand-letters button {
          min-width:32px;
          height:32px;
          padding:0 8px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

})();
