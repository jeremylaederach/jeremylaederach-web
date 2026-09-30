import { createPointerTrail } from './pointer-trail.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createInteractionController = ({ reducedMotion }) => {
    let revealObserver;
    let pointerFrame;
    let pointerEvent;
    const sitePointerLayer = document.querySelector('[data-site-pointer-layer]');
    const sitePointer = document.querySelector('[data-site-pointer]');
    const trail = createPointerTrail();

    const getInteractiveTarget = (target) => target instanceof Element
        ? target.closest('a[href], button, input, textarea, select')
        : null;

    const setPointerIntent = (target) => {
        if (!(sitePointerLayer instanceof HTMLElement)) {
            return;
        }

        const interactiveTarget = getInteractiveTarget(target);
        const bounds = interactiveTarget?.matches('a[href], button:not(:disabled)')
            ? interactiveTarget.getBoundingClientRect()
            : null;
        const sticky = pointerEvent && bounds && bounds.width > 0 && bounds.height > 0
            && bounds.width <= 240 && bounds.height <= 72;

        // Borrow Tschau's gentle pull towards the control; keep the dot at the click position.
        const offsetX = sticky ? (bounds.left + bounds.width / 2 - pointerEvent.clientX) * 0.88 : 0;
        const offsetY = sticky ? (bounds.top + bounds.height / 2 - pointerEvent.clientY) * 0.88 : 0;
        const radius = sticky ? `max(8px, ${getComputedStyle(interactiveTarget).borderTopLeftRadius})` : '50%';

        sitePointerLayer.style.setProperty('--pointer-ring-x', `${(pointerEvent?.clientX ?? -64) + offsetX}px`);
        sitePointerLayer.style.setProperty('--pointer-ring-y', `${(pointerEvent?.clientY ?? -64) + offsetY}px`);
        sitePointerLayer.style.setProperty('--pointer-ring-width', sticky ? `${bounds.width + 8}px` : '36px');
        sitePointerLayer.style.setProperty('--pointer-ring-height', sticky ? `${bounds.height + 8}px` : '36px');
        sitePointerLayer.style.setProperty('--pointer-ring-radius', radius);

        sitePointerLayer.classList.toggle('is-interactive', interactiveTarget instanceof HTMLElement);
        sitePointerLayer.dataset.route = interactiveTarget?.dataset.pointerRoute
            ?? interactiveTarget?.dataset.route
            ?? document.body.dataset.page
            ?? 'home';
    };

    const updatePointer = () => {
        pointerFrame = undefined;
        if (!pointerEvent) {
            return;
        }

        const { clientX, clientY } = pointerEvent;
        const target = document.elementFromPoint(clientX, clientY);
        const surface = target instanceof Element ? target.closest('[data-pointer-surface]') : null;
        const rect = surface?.getBoundingClientRect();

        setPointerIntent(target);
        trail.move(clientX, clientY);

        if (sitePointer instanceof HTMLElement) {
            sitePointer.style.setProperty('--site-pointer-x', clientX + 'px');
            sitePointer.style.setProperty('--site-pointer-y', clientY + 'px');
            document.documentElement.classList.add('has-site-pointer');
        }

        if (rect) {
            const x = clamp((clientX - rect.left) / Math.max(rect.width, 1) * 100, 0, 100);
            const y = clamp((clientY - rect.top) / Math.max(rect.height, 1) * 100, 0, 100);
            surface.style.setProperty('--pointer-x', x + '%');
            surface.style.setProperty('--pointer-y', y + '%');
        }
    };

    const hidePointer = () => {
        trail.reset();
        window.cancelAnimationFrame(pointerFrame);
        pointerFrame = undefined;
        pointerEvent = undefined;
        sitePointerLayer?.classList.remove('is-pressed');
        document.documentElement.classList.remove('has-site-pointer');
    };

    const schedulePointerUpdate = (event) => {
        // Actual mouse input also covers trackpads on touch-first laptops.
        document.documentElement.classList.toggle('has-mouse-input', event.pointerType === 'mouse');
        if (event.pointerType !== 'mouse') {
            hidePointer();
            return;
        }

        if (reducedMotion) {
            return;
        }

        pointerEvent = event;
        if (pointerFrame === undefined) {
            pointerFrame = window.requestAnimationFrame(updatePointer);
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

    const initialize = () => {
        initializeReveals();

        document.addEventListener('pointermove', schedulePointerUpdate, { passive: true });

        document.addEventListener('pointerdown', (event) => {
            document.documentElement.classList.toggle('has-mouse-input', event.pointerType === 'mouse');
            if (event.pointerType !== 'mouse') {
                hidePointer();
                return;
            }

            if (!reducedMotion) {
                sitePointerLayer?.classList.add('is-pressed');
            }
        }, { passive: true });

        if (!reducedMotion) {
            document.addEventListener('pointerup', () => {
                sitePointerLayer?.classList.remove('is-pressed');
            }, { passive: true });

            document.addEventListener('pointercancel', hidePointer, { passive: true });
            window.addEventListener('blur', hidePointer);
        }

        document.addEventListener('pointerover', (event) => {
            const soundTarget = event.target instanceof Element
                ? event.target.closest('[data-interface-sound]')
                : null;

            if (soundTarget && (!event.relatedTarget || !soundTarget.contains(event.relatedTarget))) {
                document.dispatchEvent(new CustomEvent('interface-hover', {
                    detail: {
                        tone: soundTarget.dataset.soundTone ?? 'control',
                    },
                }));
            }
        }, { passive: true });

        document.addEventListener('pointerout', (event) => {
            if (event.pointerType === 'mouse' && !reducedMotion && !event.relatedTarget) {
                hidePointer();
            }
        }, { passive: true });

        document.addEventListener('focusin', (event) => {
            const target = event.target instanceof Element
                ? event.target.closest('[data-interface-sound]')
                : null;

            if (target) {
                document.dispatchEvent(new CustomEvent('interface-hover', {
                    detail: {
                        tone: target.dataset.soundTone ?? 'control',
                    },
                }));
            }
        });

        window.addEventListener('scroll', () => {
            document.body.classList.toggle('has-scrolled', window.scrollY > 24);
        }, { passive: true });

        const refreshPointerIntent = () => {
            if (!reducedMotion && pointerEvent && pointerFrame === undefined) {
                pointerFrame = window.requestAnimationFrame(updatePointer);
            }
        };

        window.addEventListener('scroll', refreshPointerIntent, { passive: true, capture: true });
        window.addEventListener('resize', refreshPointerIntent, { passive: true });

        document.addEventListener('portfolio:page-swapped', () => {
            initializeReveals();
            refreshPointerIntent();
        });
    };

    return { initialize, initializeReveals };
};
