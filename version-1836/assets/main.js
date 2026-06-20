(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = $('.menu-toggle');
        var panel = $('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slider = $('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = $all('.hero-slide', slider);
        var dots = $all('.hero-dot', slider);
        var prev = $('.hero-prev', slider);
        var next = $('.hero-next', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
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
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupLocalFilter() {
        var input = $('.filter-input');
        var grid = $('.filter-grid');
        if (!input || !grid) {
            return;
        }
        var cards = $all('.movie-card', grid);
        var empty = $('.empty-tip');
        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var hit = !q || text.indexOf(q) >= 0;
                card.style.display = hit ? '' : 'none';
                if (hit) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        });
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="./' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
            '<img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
            '<span class="play-chip">播放</span>',
            '</a>',
            '<div class="card-body">',
            '<h3><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>',
            '<p class="card-desc">' + escapeHtml(item.one) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function setupSearchPage() {
        var input = $('#search-page-input');
        var grid = $('#search-results');
        var title = $('#search-title');
        var empty = $('.search-empty');
        if (!input || !grid || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial) {
            input.value = initial;
            render(initial);
        }
        input.addEventListener('input', function () {
            render(input.value);
        });
        var form = $('.search-page-form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render(input.value);
                var url = new URL(window.location.href);
                if (input.value.trim()) {
                    url.searchParams.set('q', input.value.trim());
                } else {
                    url.searchParams.delete('q');
                }
                window.history.replaceState({}, '', url.toString());
            });
        }

        function render(query) {
            var q = query.trim().toLowerCase();
            if (!q) {
                title.textContent = '热门推荐';
                empty.classList.remove('is-visible');
                return;
            }
            var results = window.MOVIE_INDEX.filter(function (item) {
                return item.search.indexOf(q) >= 0;
            }).slice(0, 120);
            title.textContent = '搜索结果：' + query.trim();
            grid.innerHTML = results.map(cardTemplate).join('');
            empty.classList.toggle('is-visible', results.length === 0);
        }
    }

    function mountPlayer(videoId, url) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var frame = video.closest('.player-frame');
        var trigger = frame ? $('[data-player-trigger="' + videoId + '"]', frame) : null;
        var message = frame ? $('.player-message', frame) : null;
        var hls = null;
        var ready = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function attach() {
            if (ready) {
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        setMessage('播放暂时不可用');
                    }
                });
                ready = true;
                return true;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                ready = true;
                return true;
            }
            setMessage('播放暂时不可用');
            return false;
        }

        function play() {
            setMessage('');
            if (!attach()) {
                return;
            }
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    setMessage('点击播放按钮继续观看');
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (trigger && video.currentTime === 0) {
                trigger.classList.remove('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.SitePlayer = {
        mount: mountPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupSearchPage();
    });
}());
