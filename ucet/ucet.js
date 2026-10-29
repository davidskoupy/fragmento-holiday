/* Fragmento Holiday — chování obrazovek účtu. Doplňuje ../holiday.js
   (režim, jazyk, fáze). Bez knihoven. Úložiště prohlížeče se nepoužívá. */
(function () {
  var root = document.documentElement;
  var en = function () { return root.lang === "en"; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* Dialogy: otevřít tlačítkem s data-otevri="id", zavřít data-zavri */
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-otevri]");
    if (o) { var d = document.getElementById(o.dataset.otevri); if (d && d.showModal) d.showModal(); return; }
    var z = e.target.closest("[data-zavri]");
    if (z) { var dz = z.closest("dialog"); if (dz) dz.close(); }
  });
  $$("dialog").forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); });

  /* Detail pobytu: ukázkový přepínač stavu rezervace */
  var det = $(".pobyt-det");
  if (det) {
    var prep = $$("[data-stav-prepni]");
    var nastav = function (s) {
      det.dataset.stav = s;
      $$("[data-pro]", det).forEach(function (el) { el.hidden = el.dataset.pro.split(" ").indexOf(s) < 0; });
      prep.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.stavPrepni === s)); });
    };
    prep.forEach(function (b) { b.addEventListener("click", function () { nastav(b.dataset.stavPrepni); }); });
    nastav(det.dataset.stav || "dop");
  }

  /* Historie bodů: filtr podle stavu (jedna volba) a počet */
  var hist = $("#hist");
  if (hist) {
    var fb = $$("[data-filtr]");
    var pocet = $("[data-hist-pocet]");
    var filtruj = function (f) {
      var n = 0;
      $$("li[data-stav]", hist).forEach(function (li) {
        var ok = f === "vse" || li.dataset.stav === f; li.hidden = !ok; if (ok) n++;
      });
      fb.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filtr === f)); });
      var prazdno = $(".h-prazdno", hist); if (prazdno) prazdno.hidden = n > 0;
      if (pocet) pocet.textContent = en() ? (n === 1 ? "1 item" : n + " items") : (n === 1 ? "1 položka" : n > 1 && n < 5 ? n + " položky" : n + " položek");
    };
    fb.forEach(function (b) { b.addEventListener("click", function () { filtruj(b.dataset.filtr); }); });
    $$("[data-jazyk]").forEach(function (b) { b.addEventListener("click", function () { setTimeout(function () { var a = $("[data-filtr][aria-pressed='true']"); filtruj(a ? a.dataset.filtr : "vse"); }, 0); }); });
    filtruj("vse");
  }

  /* Souhlasy: odvolání platí hned a oznámí se větou (ne jen barvou) */
  $$(".souhlas input[type=checkbox]").forEach(function (cb) {
    var box = cb.closest(".souhlas"), st = $(".souhlas-stav", box);
    cb.addEventListener("change", function () {
      if (!st) return;
      var d = new Date(), dd = d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear();
      var msg = cb.checked ? (en() ? "Consent given. You can withdraw it any time." : "Souhlas udělen. Můžete ho kdykoli odvolat.")
        : (en() ? "Consent withdrawn. It applies from now on." : "Souhlas odvolán. Platí to od teď.");
      st.querySelector("span").textContent = msg;
      st.hidden = false;
    });
  });

  /* Stažení dat: ukázka stavu po klepnutí */
  var exp = $("[data-export]");
  if (exp) exp.addEventListener("click", function () {
    var o = $("#export-stav"); o.hidden = false;
    exp.setAttribute("aria-disabled", "true"); exp.disabled = true;
  });

  /* Přihlášení bez hesla: e-mail -> odeslaný odkaz a kód */
  var f1 = $("#prihl-email");
  if (f1) f1.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("#email", f1);
    var pole = v.closest(".pole");
    if (!v.value || v.value.indexOf("@") < 1) { pole.classList.add("chyba"); $(".hlaska-pole", pole).hidden = false; v.setAttribute("aria-invalid", "true"); v.focus(); return; }
    pole.classList.remove("chyba"); $(".hlaska-pole", pole).hidden = true; v.removeAttribute("aria-invalid");
    $$("[data-adresa]").forEach(function (el) { el.textContent = v.value; });
    $("#krok-email").hidden = true; var k = $("#krok-odeslano"); k.hidden = false; $("h1", k).focus();
  });
  var zm = $("[data-zmenit-email]");
  if (zm) zm.addEventListener("click", function () { $("#krok-odeslano").hidden = true; $("#krok-email").hidden = false; $("#email").focus(); });
})();
