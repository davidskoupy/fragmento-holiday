/* Fragmento Holiday — ovládání ukázkových stránek (režim, jazyk, fáze)
   a drobné chování komponent. Bez knihoven. Úložiště prohlížeče je jen
   pohodlí: když není, stránka funguje s výchozím stavem. */
(function () {
  var root = document.documentElement;
  function nacti(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function uloz(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* Režim: světlý / tmavý / podle systému */
  function rezim(v) {
    if (v === "light" || v === "dark") root.setAttribute("data-theme", v); else root.removeAttribute("data-theme");
    document.querySelectorAll("[data-rezim]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.rezim === (v || "auto"))); });
    uloz("fh-rezim", v || "auto");
  }
  /* Jazyk: texty s data-en se přepínají, česká verze se uloží do data-cs */
  function jazyk(v) {
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el.dataset.cs === undefined) el.dataset.cs = el.innerHTML;
      el.innerHTML = v === "en" ? el.dataset.en : el.dataset.cs;
    });
    document.querySelectorAll("[data-en-label]").forEach(function (el) {
      if (el.dataset.csLabel === undefined) el.dataset.csLabel = el.getAttribute("aria-label");
      el.setAttribute("aria-label", v === "en" ? el.dataset.enLabel : el.dataset.csLabel);
    });
    root.lang = v === "en" ? "en" : "cs";
    document.querySelectorAll("[data-jazyk]").forEach(function (b) {
      if (b.tagName === "A") { if (b.dataset.jazyk === v) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); }
      else b.setAttribute("aria-pressed", String(b.dataset.jazyk === v));
    });
    uloz("fh-jazyk", v);
  }
  /* Fáze: 1 = jen Host, 2 = náhled vypnutých komponent */
  function faze(v) {
    if (v === "2") root.setAttribute("data-faze", "2"); else root.removeAttribute("data-faze");
    document.querySelectorAll("[data-faze-prepni]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.fazePrepni === v)); });
    uloz("fh-faze", v);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-rezim],[data-jazyk],[data-faze-prepni],.chip[aria-pressed],[data-pocet],.kal-den[data-d],[data-mesic]");
    if (!b) return;
    if (b.dataset.rezim) return rezim(b.dataset.rezim === "auto" ? null : b.dataset.rezim);
    /* V ukázce odkaz jazyka jen přepne texty; na ostré stránce vede na doménu daného jazyka a data-jazyk se vynechá */
    if (b.dataset.jazyk) { if (b.tagName === "A") e.preventDefault(); return jazyk(b.dataset.jazyk); }
    if (b.dataset.fazePrepni) return faze(b.dataset.fazePrepni);
    if (b.classList.contains("chip")) return b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    if (b.dataset.pocet) {
      var box = b.closest(".pocitadlo"), out = box.querySelector("output");
      var min = +box.dataset.min, max = +box.dataset.max, n = +out.value + +b.dataset.pocet;
      n = Math.max(min, Math.min(max, n)); out.value = n; out.textContent = n;
      box.querySelector("[data-pocet='-1']").disabled = n <= min;
      box.querySelector("[data-pocet='1']").disabled = n >= max;
      return;
    }
    if (b.dataset.d) return b.getAttribute("aria-disabled") === "true" ? undefined : vyber(b);
    if (b.dataset.mesic) {
      var m = b.closest(".kal").querySelector(".kal-mrizka");
      m.classList.remove("vjezd"); void m.offsetWidth; m.classList.add("vjezd");
    }
  });

  /* Kalendář: první klepnutí začátek, druhé konec, třetí znovu začátek */
  function vyber(den) {
    var kal = den.closest(".kal"), dny = [].slice.call(kal.querySelectorAll(".kal-den[data-d]"));
    var start = kal.dataset.start ? +kal.dataset.start : null, konec = kal.dataset.konec ? +kal.dataset.konec : null, d = +den.dataset.d;
    if (start === null || konec !== null || d <= start) { start = d; konec = null; }
    else {
      var blok = dny.some(function (x) { return +x.dataset.d > start && +x.dataset.d < d && x.classList.contains("is-nedostupny"); });
      if (blok) { start = d; konec = null; } else konec = d;
    }
    kal.dataset.start = start; if (konec === null) delete kal.dataset.konec; else kal.dataset.konec = konec;
    dny.forEach(function (x) {
      var v = +x.dataset.d;
      x.classList.toggle("is-start", v === start);
      x.classList.toggle("is-konec", v === konec);
      x.classList.toggle("is-rozsah", konec !== null && v > start && v < konec);
      x.setAttribute("aria-pressed", String(v === start || v === konec));
    });
    var st = kal.querySelector("[data-kal-stav]");
    if (st) st.textContent = konec === null ? (root.lang === "en" ? "Now choose your departure date." : "Teď vyberte den odjezdu.")
      : noci(konec - start);
  }
  function noci(n) {
    if (root.lang === "en") return "Selected: " + n + (n === 1 ? " night." : " nights.");
    return "Vybráno: " + n + (n === 1 ? " noc." : n < 5 ? " noci." : " nocí.");
  }

  rezim((function (v) { return v === "light" || v === "dark" ? v : null; })(nacti("fh-rezim")));
  jazyk(nacti("fh-jazyk") === "en" ? "en" : "cs");
  faze(nacti("fh-faze") === "2" ? "2" : "1");
})();
