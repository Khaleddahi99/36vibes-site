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
    { t: "What We Do in the Shadows", y: 2014, r: 7.6, m: ["funny"], p: ["Max"], e: "\uD83E\uDD87", g: "linear-gradient(135deg,#2f2a4a,#14111f)", b: "Vampire mockumentary, perfectly silly." },
    { t: "Ted Lasso", y: 2020, r: 8.8, tv: true, m: ["feel-good"], p: ["Apple"], e: "\u26BD", g: "linear-gradient(135deg,#2a5a6b,#13282e)", b: "The kindest, most uplifting show on TV." },
    { t: "The Bear", y: 2022, r: 8.6, tv: true, m: ["adrenaline", "feel-good"], p: ["Disney+"], e: "\uD83C\uDF73", g: "linear-gradient(135deg,#6b2a2a,#301414)", b: "Kitchen chaos that doubles as a panic attack \u2014 in a good way." },
    { t: "Fleabag", y: 2016, r: 8.7, tv: true, m: ["funny", "good-cry"], p: ["Prime"], e: "\uD83D\uDE43", g: "linear-gradient(135deg,#6b2a3f,#2e131e)", b: "Razor-sharp, hilarious, secretly devastating." },
    { t: "Stranger Things", y: 2016, r: 8.6, tv: true, m: ["adrenaline", "mind-bending"], p: ["Netflix"], e: "\uD83D\uDEB2", g: "linear-gradient(135deg,#6b2a2a,#1a1430)", b: "80s nostalgia meets edge-of-seat sci-fi horror." },
    { t: "Dark", y: 2017, r: 8.7, tv: true, m: ["mind-bending"], p: ["Netflix"], e: "\u23F3", g: "linear-gradient(135deg,#1d2a3a,#0d1318)", b: "The most intricate time-travel puzzle ever filmed." },
    { t: "The Queen's Gambit", y: 2020, r: 8.5, tv: true, m: ["dark-academia", "mind-bending"], p: ["Netflix"], e: "\u265B", g: "linear-gradient(135deg,#3a2f1f,#1a140d)", b: "Stylish, addictive, and quietly brilliant." },
    { t: "Gilmore Girls", y: 2000, r: 8.2, tv: true, m: ["cozy", "feel-good"], p: ["Netflix"], e: "\u2615", g: "linear-gradient(135deg,#6b552a,#301f10)", b: "Autumn-in-a-small-town comfort, on tap." },
    { t: "Normal People", y: 2020, r: 8.4, tv: true, m: ["date-night", "good-cry"], p: ["Max"], e: "\uD83D\uDDA4", g: "linear-gradient(135deg,#2a4a5a,#132025)", b: "Aching, intimate, beautifully restrained romance." }
  ];

  var moodChips = document.getElementById("moodChips");
  var platformChips = document.getElementById("platformChips");
  var typeChips = document.getElementById("typeChips");
  var countEl = document.getElementById("pickerCount");
  var shuffleBtn = document.getElementById("pickerShuffle");
  var state = { mood: "all", pf: "all", type: "all" };

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
    var matches = FILMS.filter(function (f) {
      var moodOk = state.mood === "all" || f.m.indexOf(state.mood) !== -1;
      var pfOk = state.pf === "all" || f.p.indexOf(state.pf) !== -1;
      var isTv = f.tv === true;
      var typeOk = state.type === "all" || (state.type === "tv" ? isTv : !isTv);
      return moodOk && pfOk && typeOk;
    });

    var list = shuffle(matches).slice(0, 6);

    if (countEl) {
      var total = matches.length;
      countEl.textContent = total
        ? "Showing " + list.length + " of " + total + " matches"
        : "";
    }

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
      var typeBadge = f.tv === true ? '<span class="pf-badge pf-tv">TV</span>' : "";
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
            '<div class="film-platforms">' + typeBadge + badges + "</div>" +
            '<a class="film-trailer" href="https://www.youtube.com/results?search_query=' + query + '" target="_blank" rel="noopener">\u25B6 Watch ' + (f.tv === true ? "trailer" : "trailer") + "</a>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function wireChips(container, key, attr) {
    if (!container) return;
    container.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      container.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state[key] = btn.getAttribute(attr);
      render();
    });
  }

  wireChips(moodChips, "mood", "data-mood");
  wireChips(platformChips, "pf", "data-pf");
  wireChips(typeChips, "type", "data-type");
  if (shuffleBtn) shuffleBtn.addEventListener("click", render);
  render(); // initial "surprise me"
})();



/* ============================================================
   36VIBES Instant Search — global, client-side, zero-dependency
   Injected on every page (shared script). Press "/" to open.
   ============================================================ */
(function () {
  "use strict";

  // Static index of every page on the site.
  var INDEX = [
    { t: "Mood Picker", u: "/#picker", c: "Tool", d: "Find a movie or show by mood and platform, instantly." },
    { t: "All Movie Vibes", u: "/vibes/", c: "Hub", d: "Browse films by mood." },
    { t: "What to Watch Tonight", u: "/what-to-watch/", c: "Hub", d: "Curated picks by mood, platform and occasion." },
    { t: "Streaming Guides", u: "/streaming-guides/", c: "Hub", d: "Where to watch movies by mood." },
    { t: "Movies Like...", u: "/movies-like/", c: "Hub", d: "Find films with the same vibe." },
    { t: "Movies by Genre", u: "/genres/", c: "Hub", d: "Horror, romance, sci-fi and more." },
    { t: "About 36VIBES", u: "/about/", c: "Page", d: "How we curate movies by mood." },
    { t: "Contact", u: "/contact/", c: "Page", d: "Suggest a film or say hi." },

    { t: "Cozy & Rainy Day Movies", u: "/vibes/cozy-rainy-day-movies/", c: "Vibe", d: "Comfort films that feel like a warm hug." },
    { t: "Feel-Good Movies", u: "/vibes/feel-good-movies/", c: "Vibe", d: "Happy, heart-warming films that lift your mood." },
    { t: "Mind-Bending Movies", u: "/vibes/mind-bending-movies/", c: "Vibe", d: "Twist endings and big ideas that stay with you." },
    { t: "Date Night Movies", u: "/vibes/date-night-movies/", c: "Vibe", d: "Perfect films for two." },
    { t: "Sad / Cathartic Movies", u: "/vibes/sad-cathartic-movies/", c: "Vibe", d: "Tear-jerkers for a good cry." },
    { t: "Dark Academia Movies", u: "/vibes/dark-academia-movies/", c: "Vibe", d: "Moody, bookish, autumnal films." },
    { t: "Adrenaline Movies", u: "/vibes/adrenaline-movies/", c: "Vibe", d: "Edge-of-your-seat action." },

    { t: "Best Movies on Netflix", u: "/streaming-guides/netflix/", c: "Streaming", d: "Netflix picks sorted by mood." },
    { t: "Best Movies on Prime Video", u: "/streaming-guides/prime-video/", c: "Streaming", d: "Prime Video picks by mood." },
    { t: "Best Movies on Max", u: "/streaming-guides/max/", c: "Streaming", d: "Max picks by mood." },
    { t: "Best Movies on Disney+", u: "/streaming-guides/disney-plus/", c: "Streaming", d: "Disney+ picks by mood." },
    { t: "Best Movies on Apple TV+", u: "/streaming-guides/apple-tv/", c: "Streaming", d: "Apple TV+ picks by mood." },

    { t: "Horror Movies", u: "/genres/horror/", c: "Genre", d: "From cozy-creepy to terrifying." },
    { t: "Romance Movies", u: "/genres/romance/", c: "Genre", d: "Swoony and heartbreaking." },
    { t: "Sci-Fi Movies", u: "/genres/sci-fi/", c: "Genre", d: "Big ideas, bigger worlds." },
    { t: "Comedy Movies", u: "/genres/comedy/", c: "Genre", d: "Dry wit to full chaos." },
    { t: "Thriller Movies", u: "/genres/thriller/", c: "Genre", d: "Edge-of-your-seat tension." },
    { t: "A24 Movies", u: "/genres/a24-core/", c: "Genre", d: "Indie, arthouse, unmistakably cool." },
    { t: "Animated Movies", u: "/genres/animation/", c: "Genre", d: "Not just for kids." },
    { t: "Documentaries", u: "/genres/documentary/", c: "Genre", d: "True stories that grip like fiction." },

    { t: "Movies Like Blade Runner", u: "/movies-like/blade-runner/", c: "Similar", d: "Neon sci-fi noir." },
    { t: "Movies Like La La Land", u: "/movies-like/la-la-land/", c: "Similar", d: "Dreamy bittersweet romance." },
    { t: "Movies Like Parasite", u: "/movies-like/parasite/", c: "Similar", d: "Sharp, twisty thrillers." }
  ];

  // Build UI and attach to <body>.
  var fab = document.createElement("button");
  fab.className = "search-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Search 36VIBES");
  fab.innerHTML = "\uD83D\uDD0D";

  var overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Search");
  overlay.innerHTML =
    '<div class="search-panel">' +
      '<div class="search-inputwrap">' +
        '<span class="search-ico">\uD83D\uDD0D</span>' +
        '<input type="search" id="siteSearchInput" class="search-input" placeholder="Search movies by mood, genre, platform..." aria-label="Search 36VIBES" autocomplete="off" />' +
        '<button type="button" class="search-close" aria-label="Close search">\u2715</button>' +
      "</div>" +
      '<div class="search-results" id="siteSearchResults"></div>' +
      '<div class="search-hint">Press <kbd>Esc</kbd> to close \u2022 <kbd>/</kbd> to open</div>' +
    "</div>";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.body.appendChild(fab);
    document.body.appendChild(overlay);

    var input = overlay.querySelector("#siteSearchInput");
    var resultsBox = overlay.querySelector("#siteSearchResults");
    var closeBtn = overlay.querySelector(".search-close");

    function open() {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input.focus(); }, 30);
      if (!resultsBox.innerHTML) renderResults("");
    }
    function close() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    function renderResults(q) {
      q = q.trim().toLowerCase();
      var list = INDEX;
      if (q) {
        list = INDEX.filter(function (it) {
          return (it.t + " " + it.c + " " + it.d).toLowerCase().indexOf(q) !== -1;
        });
      }
      list = list.slice(0, 8);
      if (!list.length) {
        resultsBox.innerHTML = '<p class="search-empty">No results for &ldquo;' +
          q.replace(/</g, "&lt;") + '&rdquo;. Try a mood, genre, or platform.</p>';
        return;
      }
      resultsBox.innerHTML = list.map(function (it) {
        return '<a class="search-item" href="' + it.u + '">' +
          '<span class="search-cat">' + it.c + "</span>" +
          '<span class="search-text"><strong>' + it.t + "</strong><small>" + it.d + "</small></span>" +
          '<span class="search-go">\u2192</span>' +
        "</a>";
      }).join("");
    }

    fab.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    input.addEventListener("input", function () { renderResults(input.value); });

    document.addEventListener("keydown", function (e) {
      var typing = /^(input|textarea|select)$/i.test((e.target.tagName || ""));
      if (e.key === "/" && !overlay.classList.contains("open") && !typing) {
        e.preventDefault();
        open();
      } else if (e.key === "Escape" && overlay.classList.contains("open")) {
        close();
      }
    });
  });
})();
