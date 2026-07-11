const selectors = {
    liquidIndex: '[data-liquid-index]',
    liquidNavigation: '[data-liquid-navigation]',
    liquidRoute: '[data-liquid-route]',
    liquidRoutes: '[data-liquid-routes]',
    liquidSvg: '[data-liquid-svg]',
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
    navigationWipe: 680,
};

const root = document.documentElement;
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
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

    return link.target !== '_blank' && Boolean(link.href) && !root.classList.contains('is-navigating');
};

const animateLiquidNavigation = (link) => {
    const rect = link.getBoundingClientRect();
    const originX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const originY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    const wipe = document.createElement('div');

    wipe.className = 'liquid-navigation-wipe';
    wipe.style.setProperty('--wipe-x', `${originX.toFixed(2)}%`);
    wipe.style.setProperty('--wipe-y', `${originY.toFixed(2)}%`);
    wipe.setAttribute('aria-hidden', 'true');

    root.classList.add('is-navigating');
    document.body.append(wipe);

    window.requestAnimationFrame(() => wipe.classList.add('is-active'));
    window.setTimeout(() => window.location.assign(link.href), timings.navigationWipe);
};

const initLiquidNavigation = (index) => {
    const routes = index.querySelector(selectors.liquidRoutes);

    if (!routes) {
        return;
    }

    const links = [...routes.querySelectorAll(selectors.liquidRoute)];
    const clearFocus = () => index.removeAttribute('data-liquid-focus');

    links.forEach((link) => {
        const focusLiquid = () => {
            index.dataset.liquidFocus = link.dataset.liquidRoute;
        };

        link.addEventListener('focus', focusLiquid);
        link.addEventListener('blur', () => {
            window.requestAnimationFrame(() => {
                if (!routes.contains(document.activeElement)) {
                    clearFocus();
                }
            });
        });

        link.addEventListener('click', (event) => {
            if (!shouldAnimateNavigation(event, link)) {
                return;
            }

            event.preventDefault();
            animateLiquidNavigation(link);
        });
    });

    routes.addEventListener('pointermove', (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const link = event.target.closest(selectors.liquidRoute);

        if (link && routes.contains(link)) {
            index.dataset.liquidFocus = link.dataset.liquidRoute;
        }
    });

    routes.addEventListener('pointerleave', clearFocus);
};

const initLiquidPointerMotion = (index) => {
    if (motionPreferences.reduced || !motionPreferences.finePointer) {
        return;
    }

    let frameId;
    let state = { cursorX: 72, cursorY: 42, shiftX: 0, shiftY: 0 };

    const render = () => {
        index.style.setProperty('--cursor-x', `${state.cursorX.toFixed(2)}%`);
        index.style.setProperty('--cursor-y', `${state.cursorY.toFixed(2)}%`);
        index.style.setProperty('--pointer-shift-x', `${state.shiftX.toFixed(2)}px`);
        index.style.setProperty('--pointer-shift-y', `${state.shiftY.toFixed(2)}px`);
        frameId = undefined;
    };

    const scheduleRender = () => {
        if (!frameId) {
            frameId = window.requestAnimationFrame(render);
        }
    };

    index.addEventListener('pointermove', (event) => {
        const rect = index.getBoundingClientRect();
        const normalizedX = clamp((event.clientX - rect.left) / rect.width);
        const normalizedY = clamp((event.clientY - rect.top) / rect.height);

        state = {
            cursorX: normalizedX * 100,
            cursorY: normalizedY * 100,
            shiftX: (normalizedX * 2 - 1) * 8,
            shiftY: (normalizedY * 2 - 1) * 6,
        };

        index.classList.add('is-pointer-active');
        scheduleRender();
    });

    index.addEventListener('pointerleave', () => {
        state = { cursorX: 72, cursorY: 42, shiftX: 0, shiftY: 0 };
        index.classList.remove('is-pointer-active');
        scheduleRender();
    });
};

const initLiquidIndex = () => {
    const index = document.querySelector(selectors.liquidIndex);

    if (!index) {
        return;
    }

    const svg = index.querySelector(selectors.liquidSvg);

    if (motionPreferences.reduced && svg instanceof SVGSVGElement) {
        svg.pauseAnimations();
    }

    initLiquidNavigation(index);
    initLiquidPointerMotion(index);
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

root.classList.add('js');

initPageEntrance();
initSiteMenu();
initScrollReveals();
initLiquidIndex();
