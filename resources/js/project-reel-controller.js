import { createProjectViewer } from './project-viewer.js';

const swipeThreshold = 44;
const swipeClickDelay = 480;

export const createProjectReelController = () => {
    const reels = new Map();
    let listenersAttached = false;

    const getState = (reel) => reels.get(reel);

    const normalizeIndex = (state, index) => (index + state.slides.length) % state.slides.length;

    const setActive = (state, requestedIndex) => {
        const index = normalizeIndex(state, requestedIndex);
        const previous = state.current;
        const initialRender = !state.initialized;

        if (!initialRender && index === previous) {
            return;
        }

        state.current = index;

        state.slides.forEach((slide, slideIndex) => {
            const active = slideIndex === index;

            slide.dataset.state = active ? 'active' : 'inactive';
            slide.inert = !active;
            slide.setAttribute('aria-hidden', String(!active));
        });

        const slide = state.slides[index];
        const number = String(index + 1).padStart(2, '0');

        if (state.currentLabel) {
            state.currentLabel.textContent = number;
        }

        state.captions.forEach((caption, captionIndex) => {
            caption.setAttribute('aria-hidden', String(captionIndex !== index));
        });

        if (state.kind) {
            state.kind.textContent = slide.dataset.kind ?? '';
        }

        state.initialized = true;
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
            captions: [...reel.querySelectorAll('[data-reel-caption]')],
            current: 0,
            currentLabel: reel.querySelector('[data-reel-current]'),
            initialized: false,
            kind: reel.querySelector('[data-reel-kind]'),
            slides,
            suppressClickUntil: 0,
            swipeStart: undefined,
            viewer: createProjectViewer(reel),
        };

        reels.set(reel, state);
        setActive(state, 0);
    };

    const pruneReels = () => {
        reels.forEach((state, reel) => {
            if (reel.isConnected) {
                return;
            }

            state.viewer?.destroy();
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

        if (action === 'expand') {
            state.viewer?.open();
        } else if (action === 'close') {
            state.viewer?.close();
        } else if (action === 'previous') {
            setActive(state, state.current - 1);
        } else if (action === 'next') {
            setActive(state, state.current + 1);
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

        setActive(state, state.current + direction);
    };

    const handlePointerDown = (event) => {
        if (event.pointerType !== 'touch') {
            return;
        }

        const viewport = event.target instanceof Element
            ? event.target.closest('.project-reel__viewport')
            : null;
        const state = viewport ? getState(viewport.closest('[data-project-reel]')) : undefined;

        if (!state || !event.isPrimary) {
            return;
        }

        viewport.setPointerCapture(event.pointerId);
        state.swipeStart = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
        };
    };

    const handlePointerUp = (event) => {
        if (event.pointerType !== 'touch') {
            return;
        }

        const reel = event.target instanceof Element
            ? event.target.closest('[data-project-reel]')
            : null;
        const state = reel ? getState(reel) : undefined;

        if (!state || state.swipeStart?.pointerId !== event.pointerId) {
            return;
        }

        const distanceX = event.clientX - state.swipeStart.x;
        const distanceY = event.clientY - state.swipeStart.y;

        state.swipeStart = undefined;

        if (Math.abs(distanceX) >= swipeThreshold && Math.abs(distanceX) > Math.abs(distanceY)) {
            const direction = distanceX < 0 ? 1 : -1;

            state.suppressClickUntil = performance.now() + swipeClickDelay;
            setActive(state, state.current + direction);
        }
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
        document.addEventListener('pointercancel', (event) => {
            reels.forEach((state) => {
                if (state.swipeStart?.pointerId === event.pointerId) {
                    state.swipeStart = undefined;
                }
            });
        }, { passive: true });
        document.addEventListener('portfolio:page-swapped', initializeReels);
        document.addEventListener('portfolio:before-navigation', () => {
            reels.forEach((state) => state.viewer?.close());
        });
    };

    const initialize = () => {
        attachListeners();
        initializeReels();
    };

    return { initialize };
};
