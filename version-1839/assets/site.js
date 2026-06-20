(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function itemMatches(item, query) {
    var text = [
      item.title,
      item.category,
      item.year,
      item.region,
      item.genre,
      item.tags
    ].join(' ').toLowerCase();
    return text.indexOf(query) !== -1;
  }

  function renderSearch(area, query) {
    var results = area.querySelector('[data-search-results]');
    if (!results) {
      return;
    }
    var keyword = query.trim().toLowerCase();
    if (!keyword) {
      results.classList.remove('is-open');
      results.innerHTML = '';
      return;
    }
    var data = window.MOVIE_SEARCH_DATA || [];
    var matched = data.filter(function (item) {
      return itemMatches(item, keyword);
    }).slice(0, 14);
    results.innerHTML = matched.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + item.safeTitle + '" onerror="this.classList.add(\'image-empty\')">' +
        '<span><strong>' + item.safeTitle + '</strong><small>' + item.year + ' · ' + item.category + ' · ' + item.genre + '</small></span>' +
        '</a>';
    }).join('');
    results.classList.toggle('is-open', matched.length > 0);
  }

  function setupSearch() {
    document.querySelectorAll('[data-search-area]').forEach(function (area) {
      var input = area.querySelector('[data-search-box]');
      if (!input) {
        return;
      }
      input.addEventListener('input', function () {
        renderSearch(area, input.value);
      });
      document.addEventListener('click', function (event) {
        if (!area.contains(event.target)) {
          var results = area.querySelector('[data-search-results]');
          if (results) {
            results.classList.remove('is-open');
          }
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function activate(next) {
      index = next % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        activate(position);
      });
    });
    setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var localSearch = panel.querySelector('[data-local-search]');
      var categoryFilter = panel.querySelector('[data-category-filter]');
      var yearFilter = panel.querySelector('[data-year-filter]');
      var section = panel.closest('section');
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll('[data-filter-card]')) : [];
      function apply() {
        var query = localSearch ? localSearch.value.trim().toLowerCase() : '';
        var category = categoryFilter ? categoryFilter.value : 'all';
        var year = yearFilter ? yearFilter.value : 'all';
        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.year
          ].join(' ').toLowerCase();
          var passQuery = !query || text.indexOf(query) !== -1;
          var passCategory = category === 'all' || card.dataset.category === category;
          var passYear = year === 'all' || card.dataset.year === year;
          card.classList.toggle('is-hidden', !(passQuery && passCategory && passYear));
        });
      }
      [localSearch, categoryFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var source = player.getAttribute('data-video-url');
      var initialized = false;
      function initialize() {
        if (!video || !source) {
          return;
        }
        if (!initialized) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            player.hls = hls;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
          }
          initialized = true;
        }
        player.classList.add('is-playing');
        video.play().catch(function () {});
      }
      if (button) {
        button.addEventListener('click', initialize);
      }
      if (video) {
        video.addEventListener('click', initialize);
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupSearch();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
