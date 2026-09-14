(function () {
  var TOTE_ID = 862944105;
  var TOTE_IMAGE =
    "https://d2j6dbq0eux0bg.cloudfront.net/images/142042029/products/862944105/6222673315.jpg";

  function renderToteUpsell() {
    var holder = document.getElementById("bgf-tote-upsell");

    if (!holder || typeof Ecwid === "undefined" || !Ecwid.Cart) return;

    Ecwid.Cart.get(function (cart) {
      var alreadyAdded =
        cart.items &&
        cart.items.some(function (item) {
          return item.product && Number(item.product.id) === TOTE_ID;
        });

      if (alreadyAdded) {
        holder.innerHTML =
          '<div style="max-width:620px;margin:18px auto;padding:14px;border:1px solid #dce8dc;border-radius:12px;background:#f7fbf7;font-family:Arial,sans-serif;text-align:center;">' +
          '<div style="font-size:15px;font-weight:600;color:#2f6638;">✓ Tote bag added to your order</div>' +
          "</div>";
        return;
      }

      holder.innerHTML =
        '<div style="max-width:620px;margin:18px auto;padding:16px;border:1px solid #e5e5e5;border-radius:12px;background:#fff;font-family:Arial,sans-serif;">' +
        '<div style="display:flex;align-items:center;gap:16px;">' +

        '<img src="' + TOTE_IMAGE + '" alt="Blackgold Foods reusable tote bag" ' +
        'style="width:90px;height:90px;object-fit:cover;border-radius:10px;flex:0 0 90px;">' +

        '<div style="flex:1;min-width:0;">' +

        '<div style="font-size:17px;font-weight:600;margin-bottom:6px;">Choose reusable 🌿</div>' +

        '<div style="font-size:13px;line-height:1.5;color:#666;margin-bottom:11px;">' +
        "Add a Blackgold Foods reusable tote bag to your order" +
        "</div>" +

        '<button id="bgf-add-tote" type="button" ' +
        'style="border:0;background:#111;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">' +
        "+ Add Tote Bag" +
        "</button>" +

        "</div>" +
        "</div>" +
        "</div>";

      var btn = document.getElementById("bgf-add-tote");

      if (btn) {
        btn.onclick = function () {
          btn.disabled = true;
          btn.innerHTML = "Adding...";

          Ecwid.Cart.addProduct({
            id: TOTE_ID,
            quantity: 1,
            callback: function (success, product, updatedCart, error) {
              if (success) {
                renderToteUpsell();
              } else {
                btn.disabled = false;
                btn.innerHTML = "+ Add Tote Bag";
                alert(error || "Unable to add the tote bag. Please try again.");
              }
            }
          });
        };
      }
    });
  }

  function start() {
    if (typeof Ecwid === "undefined") {
      setTimeout(start, 300);
      return;
    }

    if (Ecwid.OnAPILoaded) {
      Ecwid.OnAPILoaded.add(function () {
        renderToteUpsell();

        if (Ecwid.OnPageLoaded) {
          Ecwid.OnPageLoaded.add(function () {
            setTimeout(renderToteUpsell, 250);
          });
        }

        if (Ecwid.OnCartChanged) {
          Ecwid.OnCartChanged.add(function () {
            setTimeout(renderToteUpsell, 250);
          });
        }
      });
    }
  }

  start();
})();
