(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var carousel = document.getElementById('heroCarousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-page-filter]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var filterList = document.querySelector('[data-filter-list]');
  var searchQuery = document.querySelector('[data-search-query]');

  if (searchQuery) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');
    if (queryValue) {
      searchQuery.value = queryValue;
    }
  }

  var filterItems = function() {
    if (!filterList) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var items = filterList.querySelectorAll('.search-item');
    items.forEach(function(item) {
      var haystack = [
        item.getAttribute('data-title'),
        item.getAttribute('data-tags'),
        item.getAttribute('data-region'),
        item.getAttribute('data-year'),
        item.getAttribute('data-genre'),
        item.textContent
      ].join(' ').toLowerCase();
      var sameYear = !year || item.getAttribute('data-year') === year;
      var sameKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      item.classList.toggle('is-hidden', !(sameYear && sameKeyword));
    });
  };

  if (filterInput) {
    filterInput.addEventListener('input', filterItems);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', filterItems);
  }
  filterItems();

  var players = document.querySelectorAll('.player-shell');
  players.forEach(function(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var prepared = false;
    var hlsPlayer = null;

    var prepare = function() {
      if (prepared || !video || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsPlayer.loadSource(stream);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    var start = function() {
      prepare();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {});
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function() {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function() {
        player.classList.add('is-playing');
      });
      video.addEventListener('error', function() {
        if (hlsPlayer) {
          hlsPlayer.destroy();
          hlsPlayer = null;
        }
        prepared = false;
      });
    }
  });
})();
