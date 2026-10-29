/* Fragmento Holiday — chování obrazovek objevování. Doplňuje ../holiday.js
   (režim, jazyk, fáze, kalendář, počítadlo, chipy). Bez knihoven. */
(function () {
  var root = document.documentElement;
  var en = function () { return root.lang === "en"; };

  /* Dialogy (vyhledávání, nabídka): otevřít tlačítkem s data-otevri="id" */
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-otevri]");
    if (o) { var d = document.getElementById(o.dataset.otevri); if (d && d.showModal) d.showModal(); return; }
    var z = e.target.closest("[data-zavri]");
    if (z) { var dz = z.closest("dialog"); if (dz) dz.close(); }
  });
  /* Klepnutí na podklad dialog zavře */
  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  });

  /* Filtry: list na mobilu */
  var filtry = document.getElementById("filtry");
  document.querySelectorAll("[data-filtry]").forEach(function (b) {
    b.addEventListener("click", function () {
      var ot = b.dataset.filtry === "otevrit";
      filtry.classList.toggle("otevreno", ot);
      document.body.style.overflow = ot ? "hidden" : "";
      if (ot) filtry.querySelector("h2").focus(); else document.querySelector(".btn-filtry").focus();
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && filtry && filtry.classList.contains("otevreno")) document.querySelector("[data-filtry='zavrit']").click();
  });

  /* Živý počet výsledků: země (nebo) + vybavení (a zároveň) */
  function prepocitej() {
    if (!filtry) return;
    var zeme = [].map.call(filtry.querySelectorAll("[data-zeme][aria-pressed='true']"), function (b) { return b.dataset.zeme; });
    var vyb = [].map.call(filtry.querySelectorAll("[data-vyb][aria-pressed='true']"), function (b) { return b.dataset.vyb; });
    var n = 0;
    document.querySelectorAll(".vysl-mrizka .karta-n").forEach(function (k) {
      var ok = (!zeme.length || zeme.indexOf(k.dataset.zeme) > -1) &&
        vyb.every(function (v) { return (" " + k.dataset.vyb + " ").indexOf(" " + v + " ") > -1; });
      k.hidden = !ok; if (ok) n++;
    });
    document.querySelectorAll("[data-pocet-vysl]").forEach(function (el) { el.textContent = n; });
    document.querySelectorAll("[data-pocet-slovo]").forEach(function (el) { el.textContent = slovo(n); });
    var aktivni = zeme.length + vyb.length;
    document.querySelectorAll(".btn-filtry .odznak").forEach(function (el) { el.textContent = aktivni || ""; });
    var box = document.querySelector(".vysledky");
    if (box) box.classList.toggle("je-prazdno", n === 0);
    var zobraz = document.querySelector("[data-zobraz]");
    if (zobraz) zobraz.disabled = n === 0;
  }
  function slovo(n) {
    if (en()) return n === 1 ? "property free" : "properties free";
    return n === 1 ? "nemovitost volná" : n > 1 && n < 5 ? "nemovitosti volné" : "nemovitostí volných";
  }
  if (filtry) {
    /* holiday.js přepne aria-pressed v posluchači na dokumentu; přepočet po něm */
    filtry.addEventListener("click", function (e) { if (e.target.closest(".chip")) setTimeout(prepocitej, 0); });
    var vymaz = document.querySelector("[data-vymazat]");
    if (vymaz) vymaz.addEventListener("click", function () {
      filtry.querySelectorAll(".chip[aria-pressed='true']").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      prepocitej();
    });
    document.querySelectorAll("[data-jazyk]").forEach(function (b) { b.addEventListener("click", function () { setTimeout(prepocitej, 0); }); });
    prepocitej();
  }

  /* Galerie: počítadlo a šipky nad posuvným pásem (swipe je nativní) */
  document.querySelectorAll(".galerie").forEach(function (g) {
    var pas = g.querySelector(".gal-pas"), fotky = pas.children, out = g.querySelector("[data-gal-index]");
    var vl = g.querySelector(".gal-sipka.vlevo"), vp = g.querySelector(".gal-sipka.vpravo");
    function index() { return Math.round(pas.scrollLeft / pas.clientWidth); }
    function obnov() {
      var i = index(); if (out) out.textContent = i + 1;
      if (vl) vl.disabled = i <= 0; if (vp) vp.disabled = i >= fotky.length - 1;
    }
    function jdi(k) {
      var r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      pas.scrollTo({ left: (index() + k) * pas.clientWidth, behavior: r ? "auto" : "smooth" });
    }
    pas.addEventListener("scroll", function () { window.requestAnimationFrame(obnov); }, { passive: true });
    pas.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { jdi(1); e.preventDefault(); } if (e.key === "ArrowLeft") { jdi(-1); e.preventDefault(); } });
    if (vl) vl.addEventListener("click", function () { jdi(-1); });
    if (vp) vp.addEventListener("click", function () { jdi(1); });
    var vse = g.querySelector("[data-gal-vse]");
    if (vse) vse.addEventListener("click", function () { g.classList.add("vse"); pas.focus(); obnov(); });
    obnov();
  });
})();

/* Poradce: klikací ukázka bez backendu. Záložky, nápady, předání textu na doporučení. */
(function () {
  var KLIC = "poradce-dotaz";
  function uloz(v) { try { sessionStorage.setItem(KLIC, v); } catch (e) {} }
  function cti() { try { return sessionStorage.getItem(KLIC) || ""; } catch (e) { return ""; } }

  var tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (x) {
        var on = x === tab;
        x.setAttribute("aria-selected", on ? "true" : "false");
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
    });
  });

  var dotaz = document.getElementById("dotaz");
  document.querySelectorAll("[data-napad]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!dotaz) return;
      dotaz.value = b.getAttribute("data-napad");
      dotaz.focus();
    });
  });
  var poradit = document.querySelector("[data-poradit]");
  if (poradit && dotaz) {
    poradit.addEventListener("click", function () { if (dotaz.value.trim()) uloz(dotaz.value.trim()); });
  }

  var vlozeny = document.querySelector("[data-dotaz]");
  if (vlozeny) { var v = cti(); if (v) vlozeny.textContent = v; }

  document.querySelectorAll("[data-odeber]").forEach(function (b) {
    b.addEventListener("click", function () { b.closest(".chip-x").remove(); });
  });
  var upres = document.getElementById("upres");
  document.querySelectorAll("[data-napad-dop]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!upres) return;
      upres.value = b.getAttribute("data-napad-dop");
      b.classList.add("hotovo");
    });
  });
})();
