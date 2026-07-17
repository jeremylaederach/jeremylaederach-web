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

export const createPageTransitionController = ({ reducedMotion }) => {
    const overlay = document.querySelector('[data-page-transition]');
    const surface = overlay?.querySelector('[data-transition-surface]');
    const label = overlay?.querySelector('[data-transition-label]');
    let currentScene = normalizedRoute(document.body.dataset.page);
    let resetTimer;
    let sequence = 0;

    if (!(overlay instanceof HTMLElement) || !(surface instanceof HTMLElement) || !(label instanceof HTMLElement)) {
        return {
            beginTransition: () => ({ completeDelay: 0, swapDelay: 0 }),
            commitScene: () => {},
            completeTransition: () => {},
            getScene: () => currentScene,
        };
    }

    const setOrigin = (origin) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const rect = origin instanceof Element
            ? origin.getBoundingClientRect()
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

        surface.style.setProperty('--origin-top', `${Math.max(0, rect.top)}px`);
        surface.style.setProperty('--origin-right', `${Math.max(0, viewportWidth - rect.right)}px`);
        surface.style.setProperty('--origin-bottom', `${Math.max(0, viewportHeight - rect.bottom)}px`);
        surface.style.setProperty('--origin-left', `${Math.max(0, rect.left)}px`);
        surface.style.setProperty('--origin-radius', `${radius}px`);
    };

    const beginTransition = (scene, { origin, transitionLabel, transitionTheme } = {}) => {
        const nextScene = normalizedRoute(scene);
        const currentSequence = ++sequence;

        window.clearTimeout(resetTimer);

        if (reducedMotion) {
            return { completeDelay: 0, swapDelay: 0 };
        }

        setOrigin(origin);
        label.textContent = transitionLabel ?? nextScene;
        overlay.dataset.route = nextScene;
        overlay.dataset.theme = transitionTheme ?? scene ?? nextScene;
        overlay.dataset.phase = 'preparing';
        overlay.setAttribute('aria-hidden', 'true');

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                if (sequence === currentSequence) {
                    overlay.dataset.phase = 'covering';
                }
            });
        });

        return {
            completeDelay: 610,
            swapDelay: 460,
        };
    };

    const commitScene = (scene) => {
        currentScene = normalizedRoute(scene);
    };

    const completeTransition = (scene) => {
        currentScene = normalizedRoute(scene);

        if (reducedMotion) {
            overlay.dataset.phase = 'idle';
            return;
        }

        overlay.dataset.phase = 'revealing';
        resetTimer = window.setTimeout(() => {
            overlay.dataset.phase = 'idle';
            delete overlay.dataset.route;
            delete overlay.dataset.theme;
        }, 760);
    };

    return {
        beginTransition,
        commitScene,
        completeTransition,
        getScene: () => currentScene,
    };
};
