/* Blackgold Foods - Fast Categories Browser
   Store: 142042029
   Uses only a PUBLIC Lightspeed/Ecwid storefront token.
   Safe to publish in storefront code. Never put a secret_ token here.
*/
(() => {
  'use strict';

  const STORE_ID = 142042029;
  const PUBLIC_TOKEN = 'public_kdm3WfjBY4WKvcRS43yiEGK54XBTBTpq';

  const ROOT_ID = 'bgf-category-browser';
  const CACHE_KEY = 'bgf_categories_v3';

  // Categories usually do not change every few minutes.
  // Cache for 30 minutes for faster repeat visits.
  const CACHE_TTL = 30 * 60 * 1000;

  const API =
    `https://app.ecwid.com/api/v3/${STORE_ID}/categories`;

  const root = document.getElementById(ROOT_ID);

  if (!root || root.dataset.bgfLoaded === '1') return;

  root.dataset.bgfLoaded = '1';

  injectStyles();

  root.innerHTML =
    '<div class="bgf-cat-status">Loading categories…</div>';

  loadCategories()
    .then(renderCategories)
    .catch((error) => {
      console.error('[BGF categories]', error);

      root.innerHTML =
        '<div class="bgf-cat-error">' +
        'Categories could not be loaded. Please refresh the page.' +
        '</div>';
    });

  async function loadCategories() {

    const cached = readCache();

    if (cached) return cached;

    const items = [];

    let offset = 0;
    let total = Infinity;

    while (offset < total) {

      const params = new URLSearchParams({
        limit: '100',

        offset: String(offset),

        cleanUrls: 'true',

        slugsWithoutIds: 'true',

        responseFields:
          'total,count,offset,limit,' +
          'items(id,parentId,name,url,thumbnailUrl,' +
          'imageUrl,productCount,enabled,orderBy)'
      });

      const response = await fetch(
        `${API}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${PUBLIC_TOKEN}`
          },

          mode: 'cors',

          credentials: 'omit'
        }
      );

      if (!response.ok) {

        throw new Error(
          `Categories API returned HTTP ${response.status}`
        );
      }

      const data = await response.json();

      const batch =
        Array.isArray(data.items)
          ? data.items
          : [];

      items.push(...batch);

      total =
        Number.isFinite(data.total)
          ? data.total
          : items.length;

      offset += batch.length;

      if (!batch.length) break;
    }

    /*
     * productCount includes products in child categories.
     *
     * Therefore a parent category remains visible when it
     * has no direct products but one of its subcategories
     * contains products.
     */
    const visible = items
      .filter(
        c =>
          c &&
          c.enabled !== false &&
          Number(c.productCount || 0) > 0
      )
      .sort(
        (a, b) =>
          (a.orderBy ?? 999999) -
            (b.orderBy ?? 999999) ||
          a.name.localeCompare(b.name)
      );

    writeCache(visible);

    return visible;
  }

  function renderCategories(categories) {

    if (!categories.length) {

      root.innerHTML =
        '<div class="bgf-cat-status">' +
        'No categories are currently available.' +
        '</div>';

      return;
    }

    const byId =
      new Map(
        categories.map(
          c => [Number(c.id), c]
        )
      );

    const children = new Map();

    for (const category of categories) {

      const parentId =
        Number(category.parentId || 0);

      if (!children.has(parentId)) {

        children.set(parentId, []);
      }

      children
        .get(parentId)
        .push(category);
    }

    /*
     * A category is treated as a root when:
     *
     * 1. it does not have a parent, or
     * 2. its parent has been filtered out.
     *
     * This prevents valid populated subcategories
     * from disappearing.
     */
    const roots =
      categories.filter(c => {

        const parentId =
          Number(c.parentId || 0);

        return (
          !parentId ||
          !byId.has(parentId)
        );
      });

    root.innerHTML = `
      <div class="bgf-cat-wrap">
        <div class="bgf-cat-grid">

          ${
            roots
              .map(
                (c, i) =>
                  categoryCard(
                    c,
                    children,
                    i
                  )
              )
              .join('')
          }

        </div>
      </div>
    `;
  }

  function categoryCard(
    category,
    childrenMap,
    index
  ) {

    const kids =
      (
        childrenMap.get(
          Number(category.id)
        ) || []
      )
        .sort(
          (a, b) =>
            (a.orderBy ?? 999999) -
              (b.orderBy ?? 999999) ||
            a.name.localeCompare(b.name)
        );

    const image =
      category.imageUrl ||
      category.thumbnailUrl ||
      '';

    const imageHtml =
      image

        ? `<img
             src="${escapeAttr(image)}"
             alt="${escapeAttr(category.name)}"
             ${
               index < 4
                 ? 'fetchpriority="high"'
                 : 'loading="lazy"'
             }
             decoding="async"
           >`

        : `<div
             class="bgf-cat-image-fallback"
             aria-hidden="true">
           </div>`;

    return `
      <article class="bgf-cat-card">

        <a
          class="bgf-cat-main"
          href="${
            escapeAttr(
              category.url ||
              '/products'
            )
          }"
        >

          <div class="bgf-cat-image">

            ${imageHtml}

          </div>

          <h2>
            ${escapeHtml(category.name)}
          </h2>

        </a>

        ${
          kids.length

            ? `
              <div
                class="bgf-subcats"
                aria-label="${
                  escapeAttr(
                    category.name
                  )
                } subcategories"
              >

                ${
                  kids
                    .map(
                      k =>
                        `<a
                           href="${
                             escapeAttr(
                               k.url ||
                               '/products'
                             )
                           }"
                         >
                           ${
                             escapeHtml(
                               k.name
                             )
                           }
                         </a>`
                    )
                    .join('')
                }

              </div>
            `

            : ''
        }

      </article>
    `;
  }

  function readCache() {

    try {

      const raw =
        localStorage.getItem(
          CACHE_KEY
        );

      if (!raw) return null;

      const cached =
        JSON.parse(raw);

      if (
        !cached ||
        !Array.isArray(
          cached.items
        ) ||
        Date.now() -
          cached.savedAt >
          CACHE_TTL
      ) {

        localStorage.removeItem(
          CACHE_KEY
        );

        return null;
      }

      return cached.items;

    } catch (_) {

      return null;
    }
  }

  function writeCache(items) {

    try {

      localStorage.setItem(
        CACHE_KEY,

        JSON.stringify({
          savedAt: Date.now(),
          items
        })
      );

    } catch (_) {}
  }

  function escapeHtml(value) {

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

  function escapeAttr(value) {

    return escapeHtml(value);
  }

  function injectStyles() {

    if (
      document.getElementById(
        'bgf-cat-styles'
      )
    ) return;

    const style =
      document.createElement(
        'style'
      );

    style.id =
      'bgf-cat-styles';

    style.textContent = `

      #${ROOT_ID} {
        max-width:1280px;
        margin:0 auto;
        padding:10px 16px 40px;
        font-family:inherit;
        color:inherit;
      }

      .bgf-cat-grid {
        display:grid;
        grid-template-columns:
          repeat(
            4,
            minmax(0,1fr)
          );
        gap:22px;
      }

      .bgf-cat-card {
        min-width:0;
      }

      .bgf-cat-main {
        display:block;
        color:inherit;
        text-decoration:none;
      }

      .bgf-cat-image {
        aspect-ratio:1/1;
        border-radius:18px;
        overflow:hidden;
        background:#f5f5f5;
      }

      .bgf-cat-image img {
        display:block;
        width:100%;
        height:100%;
        object-fit:cover;
        transition:
          transform .22s ease;
      }

      .bgf-cat-main:hover
      .bgf-cat-image img {
        transform:scale(1.025);
      }

      .bgf-cat-image-fallback {
        width:100%;
        height:100%;
        background:
          linear-gradient(
            135deg,
            #f5f5f5,
            #ececec
          );
      }

      .bgf-cat-card h2 {
        font:inherit;
        font-weight:700;
        font-size:18px;
        line-height:1.25;
        margin:12px 0 8px;
      }

      .bgf-subcats {
        display:flex;
        flex-wrap:wrap;
        gap:7px 8px;
      }

      .bgf-subcats a {
        display:inline-block;
        text-decoration:none;
        color:inherit;
        font-size:14px;
        line-height:1.25;
        padding:7px 10px;
        border:
          1px solid
          rgba(0,0,0,.13);
        border-radius:999px;
        background:#fff;
      }

      .bgf-subcats a:hover {
        text-decoration:underline;
      }

      .bgf-cat-status,
      .bgf-cat-error {
        padding:24px 0;
        text-align:center;
        font-size:15px;
      }

      .bgf-cat-error {
        color:#8a1f1f;
      }

      @media(max-width:980px) {

        .bgf-cat-grid {
          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );
          gap:18px;
        }
      }

      @media(max-width:700px) {

        #${ROOT_ID} {
          padding-left:12px;
          padding-right:12px;
        }

        .bgf-cat-grid {
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap:16px 12px;
        }

        .bgf-cat-image {
          border-radius:14px;
        }

        .bgf-cat-card h2 {
          font-size:16px;
          margin-top:9px;
        }

        .bgf-subcats {
          gap:6px;
        }

        .bgf-subcats a {
          font-size:12px;
          padding:6px 8px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

})();
