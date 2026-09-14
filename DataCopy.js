<script>
document.addEventListener("click", function (event) {
  var button = event.target.closest(".copy-account-btn");

  if (!button) return;

  event.preventDefault();

  var textToCopy = button.getAttribute("data-copy");

  function showCopied() {
    button.textContent = "Copied!";

    setTimeout(function () {
      button.textContent = "Copy";
    }, 1500);
  }

  function fallbackCopy() {
    var textarea = document.createElement("textarea");

    textarea.value = textToCopy;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    try {
      var successful = document.execCommand("copy");

      if (successful) {
        showCopied();
      }
    } catch (error) {
      console.log("Copy failed:", error);
    }

    document.body.removeChild(textarea);
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy)
      .then(function () {
        showCopied();
      })
      .catch(function () {
        fallbackCopy();
      });
  } else {
    fallbackCopy();
  }
});
</script>
