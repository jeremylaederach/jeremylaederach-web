const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createInteractionController = ({ finePointer, reducedMotion }) => {
    let revealObserver;
    let activeFrame;
    let trailFrame;
    let pointerEvent;
    let hasPointerPosition = false;
    let isPointerInside = false;
    const sitePointer = document.querySelector('[data-site-pointer]');
    const trailElements = sitePointer instanceof HTMLElement
        ? [...sitePointer.querySelectorAll('[data-pointer-trail]')]
        : [];
    const trailPoints = trailElements.map(() => ({ x: -48, y: -48 }));

    const getInteractiveTarget = (target) => target instanceof Element
        ? target.closest('a[href], button, input, textarea, select')
        : null;

    const setPointerIntent = (target) => {
        if (!(sitePointer instanceof HTMLElement)) {
            return;
        }

        const interactiveTarget = getInteractiveTarget(target);

        sitePointer.classList.toggle('is-interactive', interactiveTarget instanceof HTMLElement);
        sitePointer.dataset.route = interactiveTarget?.dataset.route ?? document.body.dataset.page ?? 'home';
    };

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

    const updateSitePointer = () => {
        if (!(sitePointer instanceof HTMLElement) || !pointerEvent) {
            trailFrame = undefined;
            return;
        }

        const targetX = pointerEvent.clientX;
        const targetY = pointerEvent.clientY;
        let leaderX = targetX;
        let leaderY = targetY;
        let remainingDistance = 0;

        sitePointer.style.setProperty('--site-pointer-x', `${targetX}px`);
        sitePointer.style.setProperty('--site-pointer-y', `${targetY}px`);
        if (isPointerInside) {
            document.documentElement.classList.add('has-site-pointer');
        }

        trailPoints.forEach((point, index) => {
            const follow = 0.52 - (index * 0.06);

            point.x += (leaderX - point.x) * follow;
            point.y += (leaderY - point.y) * follow;
            leaderX = point.x;
            leaderY = point.y;
            remainingDistance = Math.max(
                remainingDistance,
                Math.abs(targetX - point.x),
                Math.abs(targetY - point.y),
            );

            trailElements[index].style.setProperty('--trail-x', `${point.x - targetX}px`);
            trailElements[index].style.setProperty('--trail-y', `${point.y - targetY}px`);
        });

        if (remainingDistance > 0.08) {
            trailFrame = window.requestAnimationFrame(updateSitePointer);
            return;
        }

        trailFrame = undefined;
    };

    const schedulePointerUpdate = (event) => {
        pointerEvent = event;
        isPointerInside = true;

        if (!hasPointerPosition) {
            trailPoints.forEach((point) => {
                point.x = event.clientX;
                point.y = event.clientY;
            });
            hasPointerPosition = true;
        }

        if (activeFrame === undefined) {
            activeFrame = window.requestAnimationFrame(updatePointerSurface);
        }

        if (trailFrame === undefined) {
            trailFrame = window.requestAnimationFrame(updateSitePointer);
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

            document.addEventListener('pointerdown', () => {
                sitePointer?.classList.add('is-pressed');
            }, { passive: true });

            document.addEventListener('pointerup', () => {
                sitePointer?.classList.remove('is-pressed');
            }, { passive: true });

            window.addEventListener('blur', () => {
                isPointerInside = false;
                document.documentElement.classList.remove('has-site-pointer');
            });
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

            if (finePointer && !reducedMotion) {
                setPointerIntent(event.target);
            }
        }, { passive: true });

        document.addEventListener('pointerout', (event) => {
            const panel = event.target instanceof Element
                ? event.target.closest('[data-index-panel]')
                : null;

            if (panel && (!event.relatedTarget || !panel.contains(event.relatedTarget))) {
                setIndexRoute();
            }

            if (finePointer && !reducedMotion) {
                if (!event.relatedTarget) {
                    isPointerInside = false;
                    document.documentElement.classList.remove('has-site-pointer');
                }

                setPointerIntent(event.relatedTarget);
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
