export const pageRoutes = new Set(['home', 'projects', 'about', 'contact', 'imprint', 'privacy']);

const routeScenes = new Map([
    ['quantified', 'projects'],
    ['jay-jay', 'projects'],
    ['session-deck', 'projects'],
]);

export const sceneFromRoute = (route) => pageRoutes.has(route)
    ? route
    : routeScenes.get(route) ?? 'home';

const normalizedRoute = (route) => sceneFromRoute(route);
export const transitionFinishedEvent = 'portfolio:transition-finished';
const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve));
const finishAnimations = (element) => Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
);

const announceTransitionFinished = (scene) => {
    document.dispatchEvent(new CustomEvent(transitionFinishedEvent, {
        detail: { scene },
    }));
};

export const createPageTransitionController = ({ reducedMotion }) => {
    const overlay = document.querySelector('[data-page-transition]');
    const surface = overlay?.querySelector('[data-transition-surface]');
    const label = overlay?.querySelector('[data-transition-label]');
    let currentScene = normalizedRoute(document.body.dataset.page);
    let sequence = 0;

    if (!(overlay instanceof HTMLElement) || !(surface instanceof HTMLElement) || !(label instanceof HTMLElement)) {
        return {
            beginTransition: async () => {},
            commitScene: (scene) => { currentScene = normalizedRoute(scene); },
            completeTransition: (scene) => {
                currentScene = normalizedRoute(scene);
                announceTransitionFinished(currentScene);
            },
            reset: (scene) => { currentScene = normalizedRoute(scene); },
            getScene: () => currentScene,
        };
    }

    const setOrigin = (origin, compact) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const originRect = origin instanceof Element ? origin.getBoundingClientRect() : null;
        const visible = originRect && originRect.bottom > 0 && originRect.top < viewportHeight
            && originRect.right > 0 && originRect.left < viewportWidth;
        const rect = visible
            ? originRect
            : {
                bottom: viewportHeight / 2,
                height: 0,
                left: viewportWidth / 2,
                right: viewportWidth / 2,
                top: viewportHeight / 2,
                width: 0,
            };
        const radius = origin instanceof Element
            ? Math.min(Number.parseFloat(window.getComputedStyle(origin).borderRadius) || 0, 24)
            : 0;

        const insets = {
            top: Math.max(0, rect.top),
            right: Math.max(0, viewportWidth - rect.right),
            bottom: Math.max(0, viewportHeight - rect.bottom),
            left: Math.max(0, rect.left),
        };

        // Large previews open from a small centre line, not a solid image-sized block.
        if (compact) {
            const x = (insets.left + viewportWidth - insets.right) / 2;
            const y = (insets.top + viewportHeight - insets.bottom) / 2;
            insets.top = y;
            insets.bottom = viewportHeight - y;
            insets.left = Math.max(0, x - 32);
            insets.right = Math.max(0, viewportWidth - x - 32);
        }

        Object.entries(insets).forEach(([edge, value]) => {
            surface.style.setProperty(`--origin-${edge}`, `${value}px`);
        });
        surface.style.setProperty('--origin-radius', `${compact ? 0 : radius}px`);
    };

    const clearOverlay = () => {
        overlay.dataset.phase = 'idle';
        delete overlay.dataset.route;
        delete overlay.dataset.theme;
        delete overlay.dataset.origin;
    };

    const beginTransition = async (scene, { origin, transitionLabel, transitionTheme } = {}) => {
        const nextScene = normalizedRoute(scene);
        const currentSequence = ++sequence;

        if (reducedMotion) {
            return;
        }

        const interrupted = overlay.dataset.phase && overlay.dataset.phase !== 'idle';
        label.textContent = transitionLabel ?? nextScene;
        overlay.dataset.route = nextScene;
        overlay.dataset.theme = transitionTheme ?? scene ?? nextScene;
        overlay.setAttribute('aria-hidden', 'true');

        // A newer navigation keeps the page covered instead of reopening the old origin.
        if (interrupted) {
            overlay.dataset.phase = 'covered';
            return;
        }

        const compact = origin instanceof Element && origin.getAttribute('data-transition-origin') === 'compact';
        overlay.dataset.origin = compact ? 'compact' : 'element';
        setOrigin(origin, compact);
        overlay.dataset.phase = 'preparing';
        await nextFrame();
        await nextFrame();

        if (sequence !== currentSequence) {
            return;
        }

        overlay.dataset.phase = 'covering';
        await finishAnimations(surface);

        if (sequence === currentSequence) {
            overlay.dataset.phase = 'covered';
        }
    };

    const commitScene = (scene) => {
        currentScene = normalizedRoute(scene);
    };

    const completeTransition = async (scene) => {
        const currentSequence = sequence;
        currentScene = normalizedRoute(scene);

        if (!reducedMotion) {
            overlay.dataset.phase = 'revealing';
            await finishAnimations(surface);
        }

        if (sequence === currentSequence) {
            clearOverlay();
            announceTransitionFinished(currentScene);
        }
    };

    const reset = (scene) => {
        sequence += 1;
        currentScene = normalizedRoute(scene);
        clearOverlay();
        announceTransitionFinished(currentScene);
    };

    return {
        beginTransition,
        commitScene,
        completeTransition,
        reset,
        getScene: () => currentScene,
    };
};
