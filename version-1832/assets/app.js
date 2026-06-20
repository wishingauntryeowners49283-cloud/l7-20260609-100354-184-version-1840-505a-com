(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initHeader() {
    var toggle = document.querySelector(".nav-toggle");
    var header = document.querySelector(".site-header");

    if (!toggle || !header) {
      return;
    }

    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target-slide")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function markMissingImage(image) {
    var frame = image.closest(".cover-frame");

    if (frame) {
      frame.classList.add("is-missing");
    }
  }

  function initImageFallback() {
    document.addEventListener("error", function (event) {
      var target = event.target;

      if (!target || !target.matches || !target.matches("img.movie-cover")) {
        return;
      }

      markMissingImage(target);
    }, true);
  }

  function scanMissingImages() {
    Array.prototype.slice.call(document.querySelectorAll("img.movie-cover")).forEach(function (image) {
      if (image.complete && image.naturalWidth === 0) {
        markMissingImage(image);
      }
    });
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-movie-card"));
    var count = document.querySelector("[data-result-count]");

    if (!form || !cards.length) {
      return;
    }

    var keywordInput = form.querySelector("[data-filter-input]");
    var clearButton = form.querySelector("[data-filter-clear]");
    var filterControls = Array.prototype.slice.call(form.querySelectorAll("[data-filter]"));
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get("q") || "";
    var initialCategory = params.get("category") || "";

    if (keywordInput && initialKeyword) {
      keywordInput.value = initialKeyword;
    }

    filterControls.forEach(function (control) {
      var key = control.getAttribute("data-filter");
      var value = params.get(key);

      if (value) {
        control.value = value;
      }

      if (key === "category" && initialCategory) {
        control.value = initialCategory;
      }
    });

    function applyFilters() {
      var keyword = normalize(keywordInput ? keywordInput.value : "");
      var activeFilters = {};
      var visible = 0;

      filterControls.forEach(function (control) {
        var key = control.getAttribute("data-filter");
        var value = normalize(control.value);

        if (value) {
          activeFilters[key] = value;
        }
      });

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var match = !keyword || text.indexOf(keyword) !== -1;

        Object.keys(activeFilters).forEach(function (key) {
          if (!match) {
            return;
          }

          var cardValue = normalize(card.getAttribute("data-" + key));
          match = cardValue.indexOf(activeFilters[key]) !== -1;
        });

        card.classList.toggle("is-hidden-by-filter", !match);

        if (match) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片 / 共 " + cards.length + " 部";
      }
    }

    form.addEventListener("input", applyFilters);
    form.addEventListener("change", applyFilters);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters();
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (keywordInput) {
          keywordInput.value = "";
        }

        filterControls.forEach(function (control) {
          control.value = "";
        });

        applyFilters();
      });
    }

    applyFilters();
  }

  initImageFallback();

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHeroSlider();
    scanMissingImages();
    initFilters();
  });
})();
