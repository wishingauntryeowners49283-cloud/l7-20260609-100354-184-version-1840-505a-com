import { H as Hls } from './hls-vendor.js';

const ready = (fn) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
        return;
    }
    fn();
};

const setupMobileNav = () => {
    const button = document.querySelector('.mobile-toggle');
    const panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
        return;
    }
    button.addEventListener('click', () => {
        const open = panel.hasAttribute('hidden');
        panel.toggleAttribute('hidden', !open);
        button.setAttribute('aria-expanded', String(open));
    });
};

const setupHero = () => {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    if (slides.length < 2) {
        return;
    }
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const previous = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    let index = 0;
    const activate = (target) => {
        index = (target + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };
    previous?.addEventListener('click', () => activate(index - 1));
    next?.addEventListener('click', () => activate(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => activate(i)));
    window.setInterval(() => activate(index + 1), 6800);
};

const setupLocalSearch = () => {
    const input = document.querySelector('[data-local-search]');
    const cards = Array.from(document.querySelectorAll('[data-search-item]'));
    if (!input || !cards.length) {
        return;
    }
    const selectYear = document.querySelector('[data-filter-year]');
    const selectRegion = document.querySelector('[data-filter-region]');
    const apply = () => {
        const value = input.value.trim().toLowerCase();
        const year = selectYear?.value || '';
        const region = selectRegion?.value || '';
        cards.forEach((card) => {
            const haystack = [card.dataset.title, card.dataset.tags, card.dataset.year, card.dataset.region].join(' ').toLowerCase();
            const byText = !value || haystack.includes(value);
            const byYear = !year || card.dataset.year === year;
            const byRegion = !region || (card.dataset.region || '').includes(region);
            card.hidden = !(byText && byYear && byRegion);
        });
    };
    input.addEventListener('input', apply);
    selectYear?.addEventListener('change', apply);
    selectRegion?.addEventListener('change', apply);
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) {
        input.value = query;
    }
    apply();
};

export const initMoviePlayer = ({ videoId, buttonId, source }) => {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    if (!video || !button || !source) {
        return;
    }
    let attached = false;
    const attach = () => {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsRuntime = hls;
            return;
        }
        video.src = source;
    };
    const start = async () => {
        attach();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        try {
            await video.play();
        } catch (error) {
            button.classList.remove('is-hidden');
        }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', () => {
        if (video.paused && !attached) {
            start();
        }
    });
};

ready(() => {
    setupMobileNav();
    setupHero();
    setupLocalSearch();
});
