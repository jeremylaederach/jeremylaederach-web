const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createInteractionController = ({ finePointer, reducedMotion }) => {
    let revealObserver;
    let activeFrame;
    let pointerEvent;

    const updatePointerSurface = () => {
        activeFrame = undefined;

        if (!pointerEvent) {
            return;
        }

        const surface = pointerEvent.target instanceof Element
            ? pointerEvent.target.closest('[data-pointer-surface]')
            : null;

        if (!(surface instanceof HTMLElement)) {
            return;
        }

        const rect = surface.getBoundingClientRect();
        const x = clamp((pointerEvent.clientX - rect.left) / Math.max(rect.width, 1) * 100, 0, 100);
        const y = clamp((pointerEvent.clientY - rect.top) / Math.max(rect.height, 1) * 100, 0, 100);

        surface.style.setProperty('--pointer-x', `${x}%`);
        surface.style.setProperty('--pointer-y', `${y}%`);
    };

    const schedulePointerUpdate = (event) => {
        pointerEvent = event;

        if (activeFrame === undefined) {
            activeFrame = window.requestAnimationFrame(updatePointerSurface);
        }
    };

    const revealImmediately = () => {
        document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    };

    const initializeReveals = () => {
        revealObserver?.disconnect();

        if (reducedMotion || !('IntersectionObserver' in window)) {
            revealImmediately();
            return;
        }

        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12,
        });

        document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
    };

    const setIndexRoute = (route) => {
        const index = document.querySelector('[data-index-navigation]');

        if (!(index instanceof HTMLElement)) {
            return;
        }

        if (route) {
            index.dataset.activeRoute = route;
            return;
        }

        delete index.dataset.activeRoute;
    };

    const initialize = () => {
        initializeReveals();

        if (finePointer && !reducedMotion) {
            document.addEventListener('pointermove', schedulePointerUpdate, { passive: true });
        }

        document.addEventListener('pointerover', (event) => {
            const soundTarget = event.target instanceof Element
                ? event.target.closest('[data-interface-sound]')
                : null;
            const panel = event.target instanceof Element
                ? event.target.closest('[data-index-panel]')
                : null;

            if (soundTarget && (!event.relatedTarget || !soundTarget.contains(event.relatedTarget))) {
                document.dispatchEvent(new CustomEvent('interface-hover'));
            }

            if (panel instanceof HTMLElement) {
                setIndexRoute(panel.dataset.route);
            }
        }, { passive: true });

        document.addEventListener('pointerout', (event) => {
            const panel = event.target instanceof Element
                ? event.target.closest('[data-index-panel]')
                : null;

            if (panel && (!event.relatedTarget || !panel.contains(event.relatedTarget))) {
                setIndexRoute();
            }
        }, { passive: true });

        document.addEventListener('focusin', (event) => {
            const target = event.target instanceof Element
                ? event.target.closest('[data-interface-sound]')
                : null;
            const panel = event.target instanceof Element
                ? event.target.closest('[data-index-panel]')
                : null;

            if (target) {
                document.dispatchEvent(new CustomEvent('interface-hover'));
            }

            if (panel instanceof HTMLElement) {
                setIndexRoute(panel.dataset.route);
            }
        });

        document.addEventListener('focusout', (event) => {
            if (event.target instanceof Element && event.target.closest('[data-index-panel]')) {
                setIndexRoute();
            }
        });

        window.addEventListener('scroll', () => {
            document.body.classList.toggle('has-scrolled', window.scrollY > 24);
        }, { passive: true });

        document.addEventListener('portfolio:page-swapped', initializeReveals);
    };

    return { initialize, initializeReveals };
};
