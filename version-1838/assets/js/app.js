(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            var isOpen = !mobileMenu.hasAttribute('hidden');
            if (isOpen) {
                mobileMenu.setAttribute('hidden', '');
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.textContent = '☰';
            } else {
                mobileMenu.removeAttribute('hidden');
                menuButton.setAttribute('aria-expanded', 'true');
                menuButton.textContent = '×';
            }
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(activeIndex + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                activate(activeIndex - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activate(activeIndex + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
        button.addEventListener('click', function () {
            var targetId = button.getAttribute('data-scroll-target');
            var direction = button.getAttribute('data-scroll-direction') === 'left' ? -1 : 1;
            var target = document.getElementById(targetId);
            if (target) {
                target.scrollBy({ left: direction * 320, behavior: 'smooth' });
            }
        });
    });

    var searchGrid = document.querySelector('[data-search-grid]');
    if (searchGrid) {
        var input = document.querySelector('[data-search-input]');
        var form = document.querySelector('[data-search-form]');
        var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('[data-movie-card]'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var activeFilter = 'all';
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';

        if (input) {
            input.value = queryFromUrl;
        }

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var keywords = card.getAttribute('data-keywords') || '';
                var category = card.getAttribute('data-category') || '';
                var matchesQuery = !query || keywords.indexOf(query) !== -1;
                var matchesFilter = activeFilter === 'all' || category === activeFilter;
                var shouldShow = matchesQuery && matchesFilter;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var playButton = player.querySelector('.player-button');
        var errorBox = player.querySelector('.player-error');
        var configNode = document.getElementById('player-config');
        var hlsInstance = null;
        var prepared = false;

        function getVideoUrl() {
            if (!configNode) {
                return '';
            }
            try {
                var config = JSON.parse(configNode.textContent || '{}');
                return config.src || '';
            } catch (error) {
                return '';
            }
        }

        function showError() {
            if (errorBox) {
                errorBox.hidden = false;
            }
        }

        function hideCover() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        function playNow() {
            if (!video) {
                return;
            }
            var videoUrl = getVideoUrl();
            if (!videoUrl) {
                showError();
                return;
            }
            hideCover();
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!prepared) {
                    video.src = videoUrl;
                    prepared = true;
                }
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(videoUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        prepared = true;
                        video.play().catch(function () {});
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError();
                        }
                    });
                } else {
                    video.play().catch(function () {});
                }
                return;
            }
            video.src = videoUrl;
            prepared = true;
            video.play().catch(showError);
        }

        if (cover) {
            cover.addEventListener('click', playNow);
        }

        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.stopPropagation();
                playNow();
            });
        }

        video.addEventListener('click', function () {
            if (!prepared && video.paused) {
                playNow();
            }
        });
    }
})();
