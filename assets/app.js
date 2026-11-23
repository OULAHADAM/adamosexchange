// Lightweight interactivity for the static Adamosexchange landing page.
(function () {
  "use strict";

  var nf = new Intl.NumberFormat("en-US");
  var fmt = function (n) { return nf.format(Math.round(n)) + " درهم"; };

  // ---- Copy promo codes ----
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var pill = btn.querySelector(":scope > span:last-child");
    var labelNode = pill && Array.prototype.find.call(pill.childNodes, function (n) {
      return n.nodeType === 3 && n.textContent.trim();
    });
    var original = labelNode ? labelNode.textContent : "";
    var timer;

    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-copy");
      var done = function () {
        btn.classList.add("is-copied");
        if (labelNode) labelNode.textContent = "تم النسخ ✓";
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove("is-copied");
          if (labelNode) labelNode.textContent = original;
        }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code).then(done, function () { fallbackCopy(code); done(); });
      } else {
        fallbackCopy(code);
        done();
      }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  // ---- Bonus calculator (200% bonus, capped at each brand's max) ----
  var CAPS = { melbet: 11000, "1xbet": 13000 };
  var input = document.getElementById("bonus-amount");
  var presets = document.querySelectorAll("[data-amount]");

  function update() {
    var amount = Math.max(0, parseFloat(input.value) || 0);
    document.querySelectorAll("[data-bonus]").forEach(function (box) {
      var cap = CAPS[box.getAttribute("data-bonus")] || Infinity;
      var extra = Math.min(amount * 2, cap);
      var extraEl = box.querySelector("[data-extra]");
      var totalEl = box.querySelector("[data-total]");
      if (extraEl) extraEl.textContent = fmt(extra);
      if (totalEl) totalEl.textContent = fmt(amount + extra);
    });
    presets.forEach(function (b) {
      b.classList.toggle("is-active", Number(b.getAttribute("data-amount")) === amount);
    });
  }

  if (input) {
    input.addEventListener("input", update);
    presets.forEach(function (b) {
      b.addEventListener("click", function () {
        input.value = b.getAttribute("data-amount");
        update();
      });
    });
    update();
  }

  // ---- Reveal-on-scroll ----
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var targets = document.querySelectorAll("main section article:not(.brand-card), main section ol > li");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }
})();
