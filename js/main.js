/* 36VIBES — lightweight UX enhancements */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("menuToggle");
  var links = document.getElementById("navLinks");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.innerHTML = isOpen ? "&times;" : "&#9776;";
    });

    // Close the menu after a link is tapped (mobile)
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "&#9776;";
      });
    });
  }

  /* ---------- Reveal-on-scroll animation ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el, i) {
      // subtle stagger for cards in the same row
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      observer.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }
})();


/* ============================================================
   36VIBES Mood Picker — instant client-side recommendations
   (Inspired by the best competitor tools, upgraded with a
   richer card: rating + streaming badges + trailer)
   ============================================================ */
(function () {
  "use strict";

  var results = document.getElementById("pickerResults");
  if (!results) return; // only runs on the homepage

  // Curated demo dataset. Ratings reflect well-known IMDb scores and are
  // shown for illustration; a production build would pull live data.
  var FILMS = [
    { t: "Little Women", y: 2019, r: 7.8, m: ["cozy", "feel-good"], p: ["Prime", "Apple"], e: "\uD83C\uDF42", g: "linear-gradient(135deg,#6b552a,#301f10)", b: "Autumn-lit sisterhood that glows with warmth." },
    { t: "Chef", y: 2014, r: 7.3, m: ["feel-good", "cozy"], p: ["Netflix"], e: "\uD83C\uDF7D\uFE0F", g: "linear-gradient(135deg,#2a6b50,#143025)", b: "A feel-good reset about loving what you do." },
    { t: "Paddington 2", y: 2017, r: 7.8, m: ["feel-good", "cozy"], p: ["Max"], e: "\uD83D\uDC3B", g: "linear-gradient(135deg,#6b3a2a,#301810)", b: "Possibly the kindest film ever made." },
    { t: "Am\u00e9lie", y: 2001, r: 8.3, m: ["cozy", "feel-good"], p: ["Prime"], e: "\uD83D\uDCCD", g: "linear-gradient(135deg,#6b2a3f,#301420)", b: "A warm Parisian daydream of small joys." },
    { t: "Kiki's Delivery Service", y: 1989, r: 7.8, m: ["cozy"], p: ["Max"], e: "\uD83E\uDDF9", g: "linear-gradient(135deg,#2a4a6b,#142030)", b: "Studio Ghibli's coziest comfort watch." },
    { t: "Inception", y: 2010, r: 8.8, m: ["mind-bending", "adrenaline"], p: ["Netflix"], e: "\uD83C\uDF00", g: "linear-gradient(135deg,#2a3a6b,#141a30)", b: "Dreams within dreams, built like a heist." },
    { t: "Interstellar", y: 2014, r: 8.7, m: ["mind-bending", "good-cry"], p: ["Prime"], e: "\uD83D\uDE80", g: "linear-gradient(135deg,#1d2a4a,#0d1320)", b: "Space, time and a father's love." },
    { t: "Arrival", y: 2016, r: 7.9, m: ["mind-bending"], p: ["Apple", "Prime"], e: "\uD83D\uDEF8", g: "linear-gradient(135deg,#2a5a6b,#142528)", b: "Language, time, and a quiet gut-punch." },
    { t: "Everything Everywhere All at Once", y: 2022, r: 7.8, m: ["mind-bending", "feel-good"], p: ["Max"], e: "\uD83E\uDD56", g: "linear-gradient(135deg,#532a6b,#261430)", b: "Multiverse chaos that lands on pure heart." },
    { t: "Mad Max: Fury Road", y: 2015, r: 8.1, m: ["adrenaline"], p: ["Max"], e: "\uD83D\uDE97", g: "linear-gradient(135deg,#6b2a2a,#301414)", b: "Two hours of glorious, relentless chase." },
    { t: "Top Gun: Maverick", y: 2022, r: 8.2, m: ["adrenaline", "feel-good"], p: ["Prime"], e: "\u2708\uFE0F", g: "linear-gradient(135deg,#2a4a6b,#13202e)", b: "Pure white-knuckle, crowd-pleasing thrill." },
    { t: "John Wick", y: 2014, r: 7.4, m: ["adrenaline"], p: ["Prime"], e: "\uD83D\uDD2B", g: "linear-gradient(135deg,#3a2a4a,#170f20)", b: "Stylish, kinetic, never lets up." },
    { t: "The Notebook", y: 2004, r: 7.8, m: ["date-night", "good-cry"], p: ["Netflix"], e: "\uD83D\uDC8C", g: "linear-gradient(135deg,#6b2a3f,#2e131e)", b: "The ultimate ugly-cry romance." },
    { t: "Pride & Prejudice", y: 2005, r: 7.8, m: ["date-night", "cozy"], p: ["Netflix"], e: "\uD83C\uDF3F", g: "linear-gradient(135deg,#3a5a3a,#172815)", b: "Longing glances and misty English mornings." },
    { t: "La La Land", y: 2016, r: 8.0, m: ["date-night", "feel-good", "good-cry"], p: ["Netflix"], e: "\uD83C\uDFB7", g: "linear-gradient(135deg,#2a3a6b,#5a2a4a)", b: "Dreamy, bittersweet, impossibly pretty." },
    { t: "Before Sunrise", y: 1995, r: 8.1, m: ["date-night"], p: ["Max"], e: "\uD83D\uDE83", g: "linear-gradient(135deg,#4a3a2a,#201810)", b: "One night, one walk, endless conversation." },
    { t: "Manchester by the Sea", y: 2016, r: 7.8, m: ["good-cry"], p: ["Prime"], e: "\uD83C\uDF0A", g: "linear-gradient(135deg,#2a4a5a,#132025)", b: "Quiet, devastating, beautifully acted." },
    { t: "Coco", y: 2017, r: 8.4, m: ["good-cry", "feel-good"], p: ["Disney+"], e: "\uD83D\uDC80", g: "linear-gradient(135deg,#6b452a,#5a2a5a)", b: "Music, memory and tears in the best way." },
    { t: "Dead Poets Society", y: 1989, r: 8.1, m: ["dark-academia", "good-cry"], p: ["Disney+"], e: "\uD83D\uDCDC", g: "linear-gradient(135deg,#3a2f1f,#1a140d)", b: "O Captain, my Captain. Seize the day." },
    { t: "Kill Your Darlings", y: 2013, r: 6.4, m: ["dark-academia"], p: ["Prime"], e: "\uD83D\uDD8B\uFE0F", g: "linear-gradient(135deg,#2f2a4a,#15121f)", b: "Beat-poets, ink and moody campus nights." },
    { t: "The Grand Budapest Hotel", y: 2014, r: 8.1, m: ["dark-academia", "funny", "cozy"], p: ["Max"], e: "\uD83C\uDFE8", g: "linear-gradient(135deg,#6b2a3f,#3a2a5a)", b: "Wes Anderson at his most delightful." },
    { t: "Superbad", y: 2007, r: 7.6, m: ["funny"], p: ["Netflix"], e: "\uD83D\uDE02", g: "linear-gradient(135deg,#6b552a,#30240f)", b: "Chaotic teen comedy, endlessly quotable." },
    { t: "The Nice Guys", y: 2016, r: 7.9, m: ["funny", "adrenaline"], p: ["Prime"], e: "\uD83D\uDD75\uFE0F", g: "linear-gradient(135deg,#5a4a2a,#251d10)", b: "Buddy-comedy noir that actually lands jokes." },
    { t: "What We Do in the Shadows", y: 2014, r: 7.6, m: ["funny"], p: ["Max"], e: "\uD83E\uDD87", g: "linear-gradient(135deg,#2f2a4a,#14111f)", b: "Vampire mockumentary, perfectly silly." }
  ];

  var moodChips = document.getElementById("moodChips");
  var platformChips = document.getElementById("platformChips");
  var state = { mood: "all", pf: "all" };

  var MOOD_LABELS = {
    "cozy": "Cozy", "feel-good": "Feel-Good", "mind-bending": "Mind-Bending",
    "adrenaline": "Adrenaline", "date-night": "Date Night", "good-cry": "Good Cry",
    "dark-academia": "Dark Academia", "funny": "Funny"
  };

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render() {
    var list = FILMS.filter(function (f) {
      var moodOk = state.mood === "all" || f.m.indexOf(state.mood) !== -1;
      var pfOk = state.pf === "all" || f.p.indexOf(state.pf) !== -1;
      return moodOk && pfOk;
    });

    list = shuffle(list).slice(0, 6);

    if (!list.length) {
      results.innerHTML =
        '<p class="picker-empty">No match for that combo yet \u2014 try "All platforms" or a different mood. We add new picks weekly!</p>';
      return;
    }

    results.innerHTML = list.map(function (f) {
      var primaryMood = state.mood === "all" ? f.m[0] : state.mood;
      var moodLabel = MOOD_LABELS[primaryMood] || "Vibe";
      var query = encodeURIComponent(f.t + " " + f.y + " trailer");
      var badges = f.p.map(function (p) { return '<span class="pf-badge">' + p + "</span>"; }).join("");
      return (
        '<article class="film-card">' +
          '<div class="film-poster" style="background:' + f.g + '">' +
            '<span class="mood-tag">' + moodLabel + "</span>" +
            "<span>" + f.e + "</span>" +
          "</div>" +
          '<div class="film-info">' +
            '<div class="film-top">' +
              "<h3>" + escapeHtml(f.t) + ' <span class="year">(' + f.y + ")</span></h3>" +
              '<span class="film-rating">\u2605 ' + f.r.toFixed(1) + "</span>" +
            "</div>" +
            '<p class="film-blurb">' + escapeHtml(f.b) + "</p>" +
            '<div class="film-platforms">' + badges + "</div>" +
            '<a class="film-trailer" href="https://www.youtube.com/results?search_query=' + query + '" target="_blank" rel="noopener">\u25B6 Watch trailer</a>' +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function wireChips(container, key) {
    if (!container) return;
    container.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      container.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state[key] = btn.getAttribute(key === "mood" ? "data-mood" : "data-pf");
      render();
    });
  }

  wireChips(moodChips, "mood");
  wireChips(platformChips, "pf");
  render(); // initial "surprise me"
})();
