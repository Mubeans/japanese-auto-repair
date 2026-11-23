/* ==========================================================================
   Japanese Auto Repair — site behaviour
   1. Language switch (EN / ES) with localStorage persistence
   2. Live "open now / closed" status from the shop's published hours
   3. Mobile navigation drawer
   4. Scroll reveal (disabled under prefers-reduced-motion)
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "jar-lang";
  var DEFAULT_LANG = "en";
  var DICT = window.JAR_I18N || { en: {}, es: {} };

  /* --- Published hours, America/Chicago -------------------------------
     Index 0 = Sunday. Values are [openMinute, closeMinute] or null.
     Source: public business directory listings for this shop.          */
  var SCHEDULE = [
    null,          /* Sun — closed            */
    [480, 1080],   /* Mon — 8:00 AM – 6:00 PM */
    [480, 1080],   /* Tue */
    [480, 1080],   /* Wed */
    [480, 1080],   /* Thu */
    [480, 1080],   /* Fri */
    [540, 960]     /* Sat — 9:00 AM – 4:00 PM */
  ];
  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */
  function readStoredLang() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      return v === "en" || v === "es" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function storeLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* private mode or blocked storage — the switch still works for this visit */
    }
  }

  function detectLang() {
    var stored = readStoredLang();
    if (stored) return stored;
    var nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
    return nav.indexOf("es") === 0 ? "es" : DEFAULT_LANG;
  }

  function t(lang, key) {
    var table = DICT[lang] || DICT[DEFAULT_LANG] || {};
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    var fallback = DICT[DEFAULT_LANG] || {};
    return Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : "";
  }

  /* ------------------------------------------------------------------ */
  /* 1. Translation                                                      */
  /* ------------------------------------------------------------------ */
  var ATTR_BINDINGS = [
    ["data-i18n-alt", "alt"],
    ["data-i18n-aria-label", "aria-label"],
    ["data-i18n-title", "title"],
    ["data-i18n-content", "content"]
  ];

  function translate(lang) {
    var i, nodes, value;

    nodes = document.querySelectorAll("[data-i18n]");
    for (i = 0; i < nodes.length; i++) {
      value = t(lang, nodes[i].getAttribute("data-i18n"));
      if (value) nodes[i].textContent = value;
    }

    /* Values that intentionally contain <em>, <br> or <strong> */
    nodes = document.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < nodes.length; i++) {
      value = t(lang, nodes[i].getAttribute("data-i18n-html"));
      if (value) nodes[i].innerHTML = value;
    }

    for (var b = 0; b < ATTR_BINDINGS.length; b++) {
      var dataAttr = ATTR_BINDINGS[b][0];
      var target = ATTR_BINDINGS[b][1];
      nodes = document.querySelectorAll("[" + dataAttr + "]");
      for (i = 0; i < nodes.length; i++) {
        value = t(lang, nodes[i].getAttribute(dataAttr));
        if (value) nodes[i].setAttribute(target, value);
      }
    }

    document.documentElement.setAttribute("lang", lang);

    var buttons = document.querySelectorAll("[data-lang-btn]");
    for (i = 0; i < buttons.length; i++) {
      var isActive = buttons[i].getAttribute("data-lang-btn") === lang;
      buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Live open / closed status                                        */
  /* ------------------------------------------------------------------ */
  function shopNow() {
    var now = new Date();
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(now);

      var found = {};
      for (var i = 0; i < parts.length; i++) found[parts[i].type] = parts[i].value;

      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var hour = parseInt(found.hour, 10);
      if (hour === 24 || isNaN(hour)) hour = 0;
      return {
        day: map[found.weekday],
        minutes: hour * 60 + parseInt(found.minute, 10)
      };
    } catch (e) {
      /* Browser without IANA time zone data — fall back to the visitor's clock */
      return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
    }
  }

  function openTimeKey(day) {
    return day === 6 ? "t.open.sat" : "t.open.weekday";
  }
  function closeTimeKey(day) {
    return day === 6 ? "t.close.sat" : "t.close.weekday";
  }

  function computeStatus(lang) {
    var now = shopNow();
    var today = SCHEDULE[now.day];

    if (today && now.minutes >= today[0] && now.minutes < today[1]) {
      return {
        state: "open",
        text: t(lang, "status.open"),
        note: t(lang, "status.closes").replace("{time}", t(lang, closeTimeKey(now.day)))
      };
    }

    if (today && now.minutes < today[0]) {
      return {
        state: "closed",
        text: t(lang, "status.closed"),
        note: t(lang, "status.opens").replace("{time}", t(lang, openTimeKey(now.day)))
      };
    }

    for (var step = 1; step <= 7; step++) {
      var day = (now.day + step) % 7;
      if (SCHEDULE[day]) {
        return {
          state: "closed",
          text: t(lang, "status.closed"),
          note: t(lang, "status.opensDay")
            .replace("{day}", t(lang, "hours." + DAY_KEYS[day] + "Short"))
            .replace("{time}", t(lang, openTimeKey(day)))
        };
      }
    }
    return { state: "closed", text: t(lang, "status.closed"), note: "" };
  }

  function renderStatus(lang) {
    var status = computeStatus(lang);
    var pills = document.querySelectorAll("[data-status]");
    for (var i = 0; i < pills.length; i++) {
      var pill = pills[i];
      pill.setAttribute("data-state", status.state);
      var label = pill.querySelector("[data-status-text]");
      var note = pill.querySelector("[data-status-note]");
      if (label) label.textContent = status.text;
      if (note) note.textContent = status.note;
    }

    /* Highlight today's row in every hours list */
    var today = shopNow().day;
    var rows = document.querySelectorAll("[data-day]");
    for (var r = 0; r < rows.length; r++) {
      var isToday = rows[r].getAttribute("data-day") === String(today);
      rows[r].setAttribute("data-today", isToday ? "true" : "false");
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. Mobile drawer                                                    */
  /* ------------------------------------------------------------------ */
  function initDrawer() {
    var burger = document.querySelector("[data-burger]");
    var drawer = document.querySelector("[data-drawer]");
    if (!burger || !drawer) return;

    function setOpen(open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("data-open", open ? "true" : "false");
      burger.setAttribute(
        "data-i18n-aria-label",
        open ? "nav.close" : "nav.open"
      );
      burger.setAttribute(
        "aria-label",
        t(document.documentElement.lang === "es" ? "es" : "en", open ? "nav.close" : "nav.open")
      );
    }

    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });

    drawer.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Scroll reveal                                                    */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-in");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    for (var j = 0; j < items.length; j++) observer.observe(items[j]);
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  function setLanguage(lang) {
    translate(lang);
    renderStatus(lang);
    storeLang(lang);
  }

  function init() {
    var lang = detectLang();
    translate(lang);
    renderStatus(lang);

    var buttons = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (event) {
        setLanguage(event.currentTarget.getAttribute("data-lang-btn"));
      });
    }

    initDrawer();
    initReveal();

    /* Keep the open/closed pill honest if the page is left open. */
    setInterval(function () {
      renderStatus(document.documentElement.lang === "es" ? "es" : "en");
    }, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
