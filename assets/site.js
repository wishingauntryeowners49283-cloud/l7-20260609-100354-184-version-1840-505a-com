(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initImages() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-hidden");
            });
        });
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        var search = document.querySelector(".nav-search");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            if (search) {
                search.classList.toggle("is-open");
            }
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
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
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function restart(index) {
            window.clearInterval(timer);
            show(index);
            start();
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                restart(index);
            });
        });
        show(0);
        start();
    }

    function initLocalSearch() {
        document.querySelectorAll("[data-local-search]").forEach(function (input) {
            var scope = document.querySelector(input.getAttribute("data-local-search")) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    card.classList.toggle("is-hidden-card", keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    function initSearchPage() {
        var input = document.querySelector("[data-search-input]");
        var resultBox = document.querySelector("[data-search-results]");
        if (!input || !resultBox || !window.movieSearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var keyword = input.value.trim().toLowerCase();
            var source = window.movieSearchIndex;
            var results = keyword
                ? source.filter(function (movie) {
                    return movie.search.indexOf(keyword) !== -1;
                })
                : source.slice(0, 36);
            if (!results.length) {
                resultBox.innerHTML = '<div class="empty-results">没有找到匹配影片</div>';
                return;
            }
            resultBox.innerHTML = results.slice(0, 160).map(function (movie) {
                return '<article class="movie-card">'
                    + '<a class="poster-frame" href="' + escapeHtml(movie.url) + '">'
                    + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
                    + '<span class="poster-shade"></span><span class="poster-play">▶</span></a>'
                    + '<div class="card-body"><a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>'
                    + '<p class="card-desc">' + escapeHtml(movie.line) + '</p>'
                    + '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.rating) + '</span></div>'
                    + '<div class="card-tags"><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.genre) + '</span></div>'
                    + '</div></article>';
            }).join("");
            initImages();
        }
        input.addEventListener("input", render);
        render();
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = form.getAttribute("action") || "search.html";
                }
            });
        });
    }

    function bootPlayer(playerId, source, poster) {
        var box = typeof playerId === "string" ? document.getElementById(playerId) : playerId;
        if (!box) {
            return;
        }
        var video = box.querySelector("video");
        var cover = box.querySelector(".player-cover");
        var state = box.querySelector(".player-state");
        var prepared = false;
        var requested = false;
        var hlsInstance = null;
        if (!video) {
            return;
        }
        if (poster) {
            video.setAttribute("poster", poster);
        }
        function setState(message) {
            if (state) {
                state.textContent = message || "";
            }
        }
        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }
        function play() {
            requested = true;
            hideCover();
            prepare();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            setState("视频加载中");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setState("");
                    if (requested) {
                        video.play().catch(function () {});
                    }
                }, { once: true });
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setState("");
                    if (requested) {
                        video.play().catch(function () {});
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setState("播放暂时不可用");
                    }
                });
            } else {
                video.src = source;
                setState("");
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", hideCover);
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.MovieSite = {
        bootPlayer: bootPlayer
    };

    ready(function () {
        initImages();
        initMenu();
        initHero();
        initLocalSearch();
        initSearchPage();
        initSearchForms();
    });
})();
