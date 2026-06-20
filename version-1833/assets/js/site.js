(function() {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var activate = function(index) {
      current = index;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        activate(index);
      });
    });
    setInterval(function() {
      activate((current + 1) % slides.length);
    }, 5600);
  }

  var filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    var input = filterScope.querySelector('.local-search');
    var chips = Array.prototype.slice.call(filterScope.querySelectorAll('.filter-chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var active = 'all';
    var apply = function() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var passQuery = !query || text.indexOf(query) !== -1;
        var passFilter = active === 'all' || text.indexOf(active.toLowerCase()) !== -1;
        card.classList.toggle('hidden-by-filter', !(passQuery && passFilter));
      });
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        active = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function(item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });
    apply();
  }
})();
