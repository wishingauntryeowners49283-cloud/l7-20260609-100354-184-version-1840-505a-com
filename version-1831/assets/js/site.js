(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero-carousel]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var input = form.querySelector('input[name="q"]');
        var target = form.getAttribute('data-search-target') || 'search.html';
        var query = input ? input.value.trim() : '';

        if (query) {
          window.location.href = target + '?q=' + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function renderSearchResults() {
    var container = document.querySelector('[data-search-results]');

    if (!container || !window.movieSearchIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var prefix = container.getAttribute('data-prefix') || '';
    var input = document.querySelector('[data-search-page-input]');

    if (input) {
      input.value = query;
    }

    var results = window.movieSearchIndex;

    if (query) {
      results = results.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.oneLine,
          (item.tags || []).join(' ')
        ].join(' ').toLowerCase();

        return haystack.indexOf(query) !== -1;
      });
    }

    results = results.slice(0, 120);

    if (!results.length) {
      container.innerHTML = '<div class="empty-state">没有找到匹配影片，可以更换关键词再试。</div>';
      return;
    }

    container.innerHTML = results.map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
          '<a class="movie-poster" href="' + prefix + item.url + '">' +
            '<img src="' + prefix + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="play-hover">▶</span>' +
            '<span class="poster-type">' + escapeHtml(item.type) + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
            '<h3><a href="' + prefix + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
            '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupHlsPlayers() {
    var videos = document.querySelectorAll('video[data-hls-src]');

    videos.forEach(function (video) {
      var source = video.getAttribute('data-hls-src');

      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupSearchForms();
    renderSearchResults();
    setupHlsPlayers();
  });
})();
