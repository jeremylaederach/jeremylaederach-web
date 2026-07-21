const autoplayDelay = 6200;
const swipeThreshold = 44;
const swipeClickDelay = 480;

export const createProjectReelController = ({ reducedMotion }) => {
    const reels = new Map();
    let observer;
    let listenersAttached = false;

    const getState = (reel) => reels.get(reel);

    const clearAutoplay = (state) => {
        if (state.timer !== undefined) {
            window.clearTimeout(state.timer);
            state.timer = undefined;
        }
    };

    const canAutoplay = (state) => !reducedMotion
        && state.autoplay
        && state.visible
        && !state.interacting
        && !document.hidden
        && state.slides.length > 1;

    const scheduleAutoplay = (state) => {
        clearAutoplay(state);

        if (!canAutoplay(state)) {
            return;
        }

        state.timer = window.setTimeout(() => {
            setActive(state, state.current + 1, 1);
        }, autoplayDelay);
    };

    const normalizeIndex = (state, index) => (index + state.slides.length) % state.slides.length;

    const getDirection = (state, index) => {
        const forward = normalizeIndex(state, index - state.current);
        const backward = normalizeIndex(state, state.current - index);

        return forward <= backward ? 1 : -1;
    };

    const setActive = (state, requestedIndex, requestedDirection = 0) => {
        const index = normalizeIndex(state, requestedIndex);
        const previous = state.current;
        const initialRender = !state.initialized;

        if (!initialRender && index === previous) {
            scheduleAutoplay(state);
            return;
        }

        const direction = requestedDirection || getDirection(state, index);

        state.current = index;

        if (!initialRender) {
            state.reel.dataset.direction = direction > 0 ? 'next' : 'previous';
        }

        state.slides.forEach((slide, slideIndex) => {
            const active = slideIndex === index;

            if (active) {
                slide.dataset.state = 'active';
            } else if (!initialRender && slideIndex === previous) {
                slide.dataset.state = direction > 0 ? 'before' : 'after';
            } else {
                slide.dataset.state = direction > 0 ? 'after' : 'before';
            }

            slide.setAttribute('aria-hidden', String(!active));
        });

        state.pagination.forEach((button, buttonIndex) => {
            button.setAttribute('aria-current', String(buttonIndex === index));
        });

        const slide = state.slides[index];
        const number = String(index + 1).padStart(2, '0');

        if (state.currentLabel) {
            state.currentLabel.textContent = number;
        }

        if (state.label) {
            state.label.textContent = slide.dataset.label ?? '';
        }

        if (state.description) {
            state.description.textContent = slide.dataset.description ?? '';
        }

        state.initialized = true;
        scheduleAutoplay(state);
    };

    const setInteracting = (reel, interacting) => {
        const state = getState(reel);

        if (!state) {
            return;
        }

        state.interacting = interacting;
        scheduleAutoplay(state);
    };

    const initializeReel = (reel) => {
        if (reels.has(reel)) {
            return;
        }

        const slides = [...reel.querySelectorAll('[data-reel-slide]')];

        if (slides.length === 0) {
            return;
        }

        const state = {
            autoplay: reel.hasAttribute('data-reel-autoplay'),
            current: 0,
            currentLabel: reel.querySelector('[data-reel-current]'),
            description: reel.querySelector('[data-reel-description]'),
            initialized: false,
            interacting: false,
            label: reel.querySelector('[data-reel-label]'),
            pagination: [...reel.querySelectorAll('[data-reel-index]')],
            reel,
            slides,
            suppressClickUntil: 0,
            swipeStart: undefined,
            timer: undefined,
            visible: false,
        };

        reels.set(reel, state);
        observer.observe(reel);
        setActive(state, 0);
        window.requestAnimationFrame(() => reel.classList.add('is-ready'));
    };

    const pruneReels = () => {
        reels.forEach((state, reel) => {
            if (reel.isConnected) {
                return;
            }

            clearAutoplay(state);
            observer.unobserve(reel);
            reels.delete(reel);
        });
    };

    const initializeReels = () => {
        pruneReels();
        document.querySelectorAll('[data-project-reel]').forEach(initializeReel);
    };

    const handleAction = (event) => {
        const button = event.target instanceof Element
            ? event.target.closest('[data-reel-action]')
            : null;

        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        const reel = button.closest('[data-project-reel]');
        const state = reel ? getState(reel) : undefined;

        if (!state) {
            return;
        }

        const action = button.dataset.reelAction;

        if (action === 'previous') {
            setActive(state, state.current - 1, -1);
        } else if (action === 'next') {
            setActive(state, state.current + 1, 1);
        } else {
            setActive(state, Number.parseInt(button.dataset.reelIndex ?? '0', 10));
        }
    };

    const handleKeyboard = (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }

        const reel = event.target instanceof Element
            ? event.target.closest('[data-project-reel]')
            : null;
        const state = reel ? getState(reel) : undefined;

        if (!state) {
            return;
        }

        event.preventDefault();

        const direction = event.key === 'ArrowRight' ? 1 : -1;

        setActive(state, state.current + direction, direction);
    };

    const handlePointerDown = (event) => {
        if (event.pointerType !== 'touch') {
            return;
        }

        const reel = event.target instanceof Element
            ? event.target.closest('[data-project-reel]')
            : null;
        const state = reel ? getState(reel) : undefined;

        if (!state) {
            return;
        }

        state.swipeStart = {
            x: event.clientX,
            y: event.clientY,
        };
        state.interacting = true;
        clearAutoplay(state);
    };

    const handlePointerUp = (event) => {
        if (event.pointerType !== 'touch') {
            return;
        }

        const reel = event.target instanceof Element
            ? event.target.closest('[data-project-reel]')
            : null;
        const state = reel ? getState(reel) : undefined;

        if (!state || state.swipeStart === undefined) {
            return;
        }

        const distanceX = event.clientX - state.swipeStart.x;
        const distanceY = event.clientY - state.swipeStart.y;

        state.swipeStart = undefined;
        state.interacting = false;

        if (Math.abs(distanceX) >= swipeThreshold && Math.abs(distanceX) > Math.abs(distanceY)) {
            const direction = distanceX < 0 ? 1 : -1;

            state.suppressClickUntil = performance.now() + swipeClickDelay;
            setActive(state, state.current + direction, direction);
            return;
        }

        scheduleAutoplay(state);
    };

    const suppressClickAfterSwipe = (event) => {
        const link = event.target instanceof Element
            ? event.target.closest('[data-reel-open]')
            : null;
        const reel = link?.closest('[data-project-reel]');
        const state = reel ? getState(reel) : undefined;

        if (state && performance.now() < state.suppressClickUntil) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };

    const handlePointerBoundary = (event, interacting) => {
        const reel = event.target instanceof Element
            ? event.target.closest('[data-project-reel]')
            : null;

        if (!(reel instanceof HTMLElement)) {
            return;
        }

        if (event.relatedTarget instanceof Node && reel.contains(event.relatedTarget)) {
            return;
        }

        setInteracting(reel, interacting);
    };

    const attachListeners = () => {
        if (listenersAttached) {
            return;
        }

        listenersAttached = true;
        document.addEventListener('click', suppressClickAfterSwipe, true);
        document.addEventListener('click', handleAction);
        document.addEventListener('keydown', handleKeyboard);
        document.addEventListener('pointerdown', handlePointerDown, { passive: true });
        document.addEventListener('pointerup', handlePointerUp, { passive: true });
        document.addEventListener('pointerover', (event) => handlePointerBoundary(event, true), { passive: true });
        document.addEventListener('pointerout', (event) => handlePointerBoundary(event, false), { passive: true });
        document.addEventListener('focusin', (event) => handlePointerBoundary(event, true));
        document.addEventListener('focusout', (event) => handlePointerBoundary(event, false));
        document.addEventListener('portfolio:page-swapped', initializeReels);
        document.addEventListener('visibilitychange', () => {
            reels.forEach(scheduleAutoplay);
        });
    };

    const initialize = () => {
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const state = getState(entry.target);

                if (!state) {
                    return;
                }

                state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
                scheduleAutoplay(state);
            });
        }, { threshold: [0, 0.3, 0.7] });

        attachListeners();
        initializeReels();
    };

    return { initialize };
};
