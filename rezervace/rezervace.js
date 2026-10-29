/* Fragmento Holiday — chování rezervačního toku. Doplňuje ../holiday.js
   (režim, jazyk, kalendář, počítadlo). Bez knihoven. Bez úložiště:
   nic z formuláře se nikam neukládá. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $$(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }

  /* Přepínač bodů: třída body-on na .rez přepne řádky a částky (viz rezervace.css) */
  var rez = document.querySelector(".rez");
  var sw = document.getElementById("body-sw");
  if (rez && sw) {
    var zapni = function () { rez.classList.toggle("body-on", sw.checked); };
    sw.addEventListener("change", zapni);
    zapni();
  }

  /* Způsob platby: ukáže panel vybrané volby */
  var radia = $$('input[name="platba"]');
  function zpusob() {
    var v = (radia.filter(function (r) { return r.checked; })[0] || {}).value;
    $$("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== v; });
  }
  radia.forEach(function (r) { r.addEventListener("change", zpusob); });
  if (radia.length) zpusob();

  /* Zaplatit: první klepnutí tlačítko zamkne (aria-busy), další se ignorují,
     po chvíli pokračuje na potvrzení (ukázka toku, žádná skutečná platba) */
  var plat = document.querySelector("a.btn.gold[href='krok-4-potvrzeni.html']");
  if (plat && document.querySelector('input[name="platba"]')) {
    plat.addEventListener("click", function (e) {
      e.preventDefault();
      if (plat.getAttribute("aria-busy") === "true") return;
      plat.setAttribute("aria-busy", "true");
      setTimeout(function () { window.location.href = plat.getAttribute("href"); }, reduce ? 300 : 1400);
    });
  }

  /* Souhrn ceny na telefonu: tlačítko Rozpis ceny rozbalí a sbalí tělo souhrnu.
     Třídu js nastavuje inline skript v hlavičce; bez JS zůstává souhrn rozbalený. */
  $$(".sou-rozbal").forEach(function (b) {
    var sou = b.closest(".souhrn");
    b.addEventListener("click", function () {
      var otevrit = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", otevrit ? "true" : "false");
      sou.classList.toggle("otevreno", otevrit);
    });
  });

  /* Stavy: ukázka dvojího klepnutí */
  $$("[data-dup]").forEach(function (b) {
    var pozn = document.getElementById(b.dataset.dup), n = 0;
    b.addEventListener("click", function () {
      n++;
      if (b.getAttribute("aria-busy") !== "true") { b.setAttribute("aria-busy", "true"); return; }
      if (pozn) pozn.hidden = false;
    });
    var znovu = document.querySelector("[data-dup-znovu]");
    if (znovu) znovu.addEventListener("click", function () {
      n = 0; b.removeAttribute("aria-busy"); if (pozn) pozn.hidden = true;
    });
  });
})();
