(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-image-missing');
      image.removeAttribute('src');
    }, { once: true });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
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
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-target')) || 0);
      restartHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  startHero();

  var filterSearch = document.querySelector('[data-filter-search]');
  var list = document.querySelector('[data-card-list]');
  var filters = {
    region: 'all',
    type: 'all'
  };

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ');
  }

  function applyFilters() {
    if (!list) {
      return;
    }
    var query = normalize(filterSearch ? filterSearch.value : '');
    Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
      var region = card.getAttribute('data-region');
      var type = card.getAttribute('data-type');
      var matchesRegion = filters.region === 'all' || region === filters.region;
      var matchesType = filters.type === 'all' || type === filters.type;
      var matchesSearch = !query || normalize(cardText(card)).indexOf(query) !== -1;
      card.classList.toggle('is-hidden-card', !(matchesRegion && matchesType && matchesSearch));
    });
  }

  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    group.addEventListener('click', function (event) {
      var button = event.target.closest('.chip');
      if (!button) {
        return;
      }
      var key = group.getAttribute('data-filter-group');
      filters[key] = button.getAttribute('data-value') || 'all';
      group.querySelectorAll('.chip').forEach(function (chip) {
        chip.classList.toggle('active', chip === button);
      });
      applyFilters();
    });
  });

  if (filterSearch) {
    filterSearch.addEventListener('input', applyFilters);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var searchPageInput = document.querySelector('[data-search-page-input]');
  if (searchPageInput && q) {
    searchPageInput.value = q;
  }
  if (filterSearch && q) {
    filterSearch.value = q;
    applyFilters();
  }
})();
