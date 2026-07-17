const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createInteractionController = ({ finePointer, reducedMotion }) => {
    let revealObserver;
    let surfaceTargetFrame;
    let surfaceAnimationFrame;
    let surfaceAnimationTime;
    let trailFrame;
    let pointerEvent;
    let hasPointerPosition = false;
    let isPointerInside = false;
    const sitePointerLayer = document.querySelector('[data-site-pointer-layer]');
    const sitePointer = document.querySelector('[data-site-pointer]');
    const trailPaths = {
        core: document.querySelector('[data-pointer-path="core"]'),
        highlight: document.querySelector('[data-pointer-path="highlight"]'),
        outer: document.querySelector('[data-pointer-path="outer"]'),
    };
    const trailGradients = {
        core: document.querySelector('[data-pointer-gradient="core"]'),
        highlight: document.querySelector('[data-pointer-gradient="highlight"]'),
        outer: document.querySelector('[data-pointer-gradient="outer"]'),
    };
    const trailPoints = Array.from({ length: 18 }, () => ({ x: -64, y: -64 }));
    const surfaceStates = new Map();

    const getInteractiveTarget = (target) => target instanceof Element
        ? target.closest('a[href], button, input, textarea, select')
        : null;

    const setPointerIntent = (target) => {
        if (!(sitePointerLayer instanceof HTMLElement)) {
            return;
        }

        const interactiveTarget = getInteractiveTarget(target);

        sitePointerLayer.classList.toggle('is-interactive', interactiveTarget instanceof HTMLElement);
        sitePointerLayer.dataset.route = interactiveTarget?.dataset.pointerRoute
            ?? interactiveTarget?.dataset.route
            ?? document.body.dataset.page
            ?? 'home';
    };

    const buildTrailPath = (points) => {
        if (points.length < 2) {
            return '';
        }

        const format = (value) => value.toFixed(2);
        let path = `M ${format(points[0].x)} ${format(points[0].y)}`;

        for (let index = 0; index < points.length - 1; index += 1) {
            const previous = points[index - 1] ?? points[index];
            const current = points[index];
            const next = points[index + 1];
            const after = points[index + 2] ?? next;
            const controlOne = {
                x: current.x + ((next.x - previous.x) / 6),
                y: current.y + ((next.y - previous.y) / 6),
            };
            const controlTwo = {
                x: next.x - ((after.x - current.x) / 6),
                y: next.y - ((after.y - current.y) / 6),
            };

            path += ` C ${format(controlOne.x)} ${format(controlOne.y)} ${format(controlTwo.x)} ${format(controlTwo.y)} ${format(next.x)} ${format(next.y)}`;
        }

        return path;
    };

    const updateGradient = (gradient, points) => {
        if (!(gradient instanceof SVGLinearGradientElement) || points.length < 2) {
            return;
        }

        const start = points[0];
        const end = points[points.length - 1];

        gradient.setAttribute('x1', start.x);
        gradient.setAttribute('y1', start.y);
        gradient.setAttribute('x2', end.x);
        gradient.setAttribute('y2', end.y);
    };

    const drawTrail = () => {
        const orderedPoints = [...trailPoints].reverse();
        const corePoints = orderedPoints.slice(5);
        const highlightPoints = orderedPoints.slice(12);
        const paths = {
            core: corePoints,
            highlight: highlightPoints,
            outer: orderedPoints,
        };

        Object.entries(paths).forEach(([name, points]) => {
            const path = trailPaths[name];

            if (path instanceof SVGPathElement) {
                path.setAttribute('d', buildTrailPath(points));
            }

            updateGradient(trailGradients[name], points);
        });
    };

    const readSurfaceCoordinate = (surface, property, fallback) => {
        const value = Number.parseFloat(getComputedStyle(surface).getPropertyValue(property));

        return Number.isFinite(value) ? value : fallback;
    };

    const getSurfaceState = (surface) => {
        const existingState = surfaceStates.get(surface);

        if (existingState) {
            return existingState;
        }

        const state = {
            x: readSurfaceCoordinate(surface, '--pointer-x', 50),
            y: readSurfaceCoordinate(surface, '--pointer-y', 50),
            targetX: 50,
            targetY: 50,
        };

        state.targetX = state.x;
        state.targetY = state.y;
        surfaceStates.set(surface, state);

        return state;
    };

    const animatePointerSurfaces = (timestamp) => {
        const elapsed = surfaceAnimationTime === undefined
            ? 16
            : Math.min(timestamp - surfaceAnimationTime, 48);
        const interpolation = 1 - Math.exp(-elapsed / 135);
        let hasPendingSurface = false;

        surfaceAnimationTime = timestamp;

        surfaceStates.forEach((state, surface) => {
            if (!surface.isConnected) {
                surfaceStates.delete(surface);
                return;
            }

            state.x += (state.targetX - state.x) * interpolation;
            state.y += (state.targetY - state.y) * interpolation;

            surface.style.setProperty('--pointer-x', `${state.x.toFixed(3)}%`);
            surface.style.setProperty('--pointer-y', `${state.y.toFixed(3)}%`);

            if (Math.abs(state.targetX - state.x) > 0.025 || Math.abs(state.targetY - state.y) > 0.025) {
                hasPendingSurface = true;
            }
        });

        if (hasPendingSurface) {
            surfaceAnimationFrame = window.requestAnimationFrame(animatePointerSurfaces);
            return;
        }

        surfaceAnimationFrame = undefined;
        surfaceAnimationTime = undefined;
    };

    const startSurfaceAnimation = () => {
        if (surfaceAnimationFrame === undefined) {
            surfaceAnimationFrame = window.requestAnimationFrame(animatePointerSurfaces);
        }
    };

    const updatePointerSurfaceTarget = () => {
        surfaceTargetFrame = undefined;

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
        const state = getSurfaceState(surface);

        state.targetX = x;
        state.targetY = y;
        startSurfaceAnimation();
    };

    const resetPointerSurfaces = () => {
        if (surfaceTargetFrame !== undefined) {
            window.cancelAnimationFrame(surfaceTargetFrame);
            surfaceTargetFrame = undefined;
        }

        if (surfaceAnimationFrame !== undefined) {
            window.cancelAnimationFrame(surfaceAnimationFrame);
            surfaceAnimationFrame = undefined;
        }

        surfaceAnimationTime = undefined;
        surfaceStates.clear();
    };

    const updateSitePointer = () => {
        if (!(sitePointer instanceof HTMLElement) || !pointerEvent) {
            trailFrame = undefined;
            return;
        }

        const targetX = pointerEvent.clientX;
        const targetY = pointerEvent.clientY;
        let remainingDistance = 0;

        sitePointer.style.setProperty('--site-pointer-x', `${targetX}px`);
        sitePointer.style.setProperty('--site-pointer-y', `${targetY}px`);
        if (isPointerInside) {
            document.documentElement.classList.add('has-site-pointer');
        }

        trailPoints[0].x = targetX;
        trailPoints[0].y = targetY;

        trailPoints.slice(1).forEach((point, index) => {
            const leader = trailPoints[index];
            const follow = 0.5 - (Math.min(index, 12) * 0.006);

            point.x += (leader.x - point.x) * follow;
            point.y += (leader.y - point.y) * follow;
            remainingDistance = Math.max(
                remainingDistance,
                Math.abs(leader.x - point.x),
                Math.abs(leader.y - point.y),
            );
        });

        drawTrail();

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

        if (surfaceTargetFrame === undefined) {
            surfaceTargetFrame = window.requestAnimationFrame(updatePointerSurfaceTarget);
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
                sitePointerLayer?.classList.add('is-pressed');
            }, { passive: true });

            document.addEventListener('pointerup', () => {
                sitePointerLayer?.classList.remove('is-pressed');
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
                document.dispatchEvent(new CustomEvent('interface-hover', {
                    detail: {
                        tone: soundTarget.dataset.soundTone ?? 'control',
                    },
                }));
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
                document.dispatchEvent(new CustomEvent('interface-hover', {
                    detail: {
                        tone: target.dataset.soundTone ?? 'control',
                    },
                }));
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

        document.addEventListener('portfolio:page-swapped', () => {
            resetPointerSurfaces();
            initializeReveals();
        });
    };

    return { initialize, initializeReveals };
};
