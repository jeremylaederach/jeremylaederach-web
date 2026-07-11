const selectors = {
    liquidBody: '[data-liquid-body]',
    liquidCanvas: '[data-liquid-canvas]',
    liquidHome: '[data-liquid-home]',
    liquidNavigation: '[data-liquid-navigation]',
    menuPanel: '[data-menu-panel]',
    menuToggle: '[data-menu-toggle]',
    reveal: '.reveal',
    revealSection: '[data-reveal-section]',
};

const motionPreferences = {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: window.matchMedia('(pointer: fine)').matches,
};

const timings = {
    menuClose: 980,
    routeFallback: 680,
};

const root = document.documentElement;
const markRevealed = (element) => element.classList.add('is-visible');

const initPageEntrance = () => {
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => root.classList.add('is-ready'));
    });
};

const initScrollReveals = () => {
    const elements = document.querySelectorAll(`${selectors.reveal}, ${selectors.revealSection}`);

    if (motionPreferences.reduced || !('IntersectionObserver' in window)) {
        elements.forEach(markRevealed);

        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                markRevealed(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));
};

const shouldAnimateNavigation = (event, link) => {
    if (motionPreferences.reduced || event.defaultPrevented || event.button !== 0) {
        return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
    }

    const destination = new URL(link.href, window.location.href);

    return (
        link.target !== '_blank'
        && destination.origin === window.location.origin
        && !root.classList.contains('is-route-leaving')
    );
};

const portalRadii = {
    about: '49% 51% 53% 47% / 47% 55% 45% 53%',
    projects: '52% 48% 49% 51% / 54% 47% 53% 46%',
    contact: '54% 46% 48% 52% / 51% 45% 55% 49%',
};

const createRoutePortal = (link) => {
    const rect = link.getBoundingClientRect();
    const route = link.dataset.route;
    const portal = document.createElement('div');

    portal.className = 'route-portal';
    portal.dataset.route = route;
    portal.setAttribute('aria-hidden', 'true');
    portal.style.setProperty('--portal-x', `${rect.left.toFixed(2)}px`);
    portal.style.setProperty('--portal-y', `${rect.top.toFixed(2)}px`);
    portal.style.setProperty('--portal-scale-x', (rect.width / window.innerWidth).toFixed(4));
    portal.style.setProperty('--portal-scale-y', (rect.height / window.innerHeight).toFixed(4));
    portal.style.setProperty('--portal-radius', portalRadii[route] ?? '50%');

    document.body.append(portal);

    return portal;
};

const animateRouteNavigation = (event, link, getLiquidScene) => {
    if (root.classList.contains('is-route-leaving')) {
        event.preventDefault();

        return;
    }

    if (!shouldAnimateNavigation(event, link)) {
        return;
    }

    const body = link.closest(selectors.liquidBody);
    const liquidScene = getLiquidScene();
    const liquidDuration = liquidScene?.transitionTo(link.dataset.route) ?? 0;

    event.preventDefault();
    root.classList.add('is-route-leaving');
    body?.classList.add('is-selected');

    if (liquidDuration > 0) {
        window.setTimeout(() => window.location.assign(link.href), liquidDuration);

        return;
    }

    const portal = createRoutePortal(link);

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => portal.classList.add('is-active'));
    });

    window.setTimeout(() => window.location.assign(link.href), timings.routeFallback);
};

const initLiquidNavigation = (home, getLiquidScene) => {
    home.querySelectorAll(selectors.liquidNavigation).forEach((link) => {
        link.addEventListener('click', (event) => animateRouteNavigation(event, link, getLiquidScene));
    });
};

const initLiquidHome = async () => {
    const home = document.querySelector(selectors.liquidHome);

    if (!home) {
        return;
    }

    const canvas = home.querySelector(selectors.liquidCanvas);
    const bodies = [...home.querySelectorAll(selectors.liquidBody)];
    let liquidScene;

    initLiquidNavigation(home, () => liquidScene);

    if (!(canvas instanceof HTMLCanvasElement) || bodies.length !== 3) {
        return;
    }

    try {
        const { createLiquidScene } = await import('./liquid-scene.js');

        liquidScene = createLiquidScene({
            root: home,
            canvas,
            bodies,
            reducedMotion: motionPreferences.reduced,
            finePointer: motionPreferences.finePointer,
        });
    } catch (error) {
        console.warn('Liquid scene unavailable; using the CSS fallback.', error);
        home.classList.add('is-webgl-unavailable');
    }
};

const initSiteMenu = () => {
    const toggle = document.querySelector(selectors.menuToggle);
    const panel = document.querySelector(selectors.menuPanel);

    if (!toggle || !panel) {
        return;
    }

    let closeTimer;

    const finishClose = () => {
        panel.hidden = true;
        panel.removeAttribute('data-closing');
        panel.setAttribute('aria-hidden', 'true');
    };

    const openMenu = () => {
        window.clearTimeout(closeTimer);
        panel.hidden = false;
        panel.removeAttribute('data-closing');
        panel.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');

        window.requestAnimationFrame(() => panel.setAttribute('data-open', ''));
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
        if (panel.hidden) {
            return;
        }

        window.clearTimeout(closeTimer);
        toggle.setAttribute('aria-expanded', 'false');
        panel.removeAttribute('data-open');
        panel.setAttribute('data-closing', '');
        panel.setAttribute('aria-hidden', 'true');

        closeTimer = window.setTimeout(finishClose, motionPreferences.reduced ? 0 : timings.menuClose);

        if (restoreFocus) {
            toggle.focus();
        }
    };

    toggle.addEventListener('click', () => {
        if (toggle.getAttribute('aria-expanded') === 'true') {
            closeMenu();

            return;
        }

        openMenu();
    });

    panel.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a')) {
            closeMenu();
        }
    });

    document.addEventListener('click', (event) => {
        if (toggle.contains(event.target) || panel.contains(event.target)) {
            return;
        }

        closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu({ restoreFocus: true });
        }
    });
};

const resetRouteTransition = () => {
    root.classList.remove('is-route-leaving');
    document.querySelectorAll('.route-portal').forEach((portal) => portal.remove());
    document.querySelectorAll(`${selectors.liquidBody}.is-selected`).forEach((body) => {
        body.classList.remove('is-selected');
    });
};

root.classList.add('js');

window.addEventListener('pageshow', resetRouteTransition);

initPageEntrance();
initSiteMenu();
initScrollReveals();
void initLiquidHome();
