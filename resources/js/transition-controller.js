export const pageRoutes = new Set(['home', 'projects', 'about', 'contact', 'imprint', 'privacy']);

const routeScenes = new Map([
    ['quantified', 'projects'],
    ['jay-jay', 'projects'],
]);

export const sceneFromRoute = (route) => pageRoutes.has(route)
    ? route
    : routeScenes.get(route) ?? 'home';

export const transitionFinishedEvent = 'portfolio:transition-finished';

const finishAnimations = (element) => Promise.allSettled(
    (element?.getAnimations() ?? []).map((animation) => animation.finished),
);

const announceTransitionFinished = (scene) => {
    document.dispatchEvent(new CustomEvent(transitionFinishedEvent, {
        detail: { scene },
    }));
};

// A page change has two phases, set as `data-transition` on the root element: the old page
// leaves, then the new one enters. The stylesheet animates the main region for each phase, and
// the controller waits for those animations instead of keeping durations of its own. The sphere
// scatters and gathers in step, and the accent blends to the new page's on its own.
export const createPageTransitionController = ({ reducedMotion }) => {
    const root = document.documentElement;
    const main = () => document.querySelector('[data-page-main]');
    let currentScene = sceneFromRoute(document.body.dataset.page);
    let sequence = 0;

    const beginTransition = async () => {
        sequence += 1;

        if (reducedMotion) {
            return;
        }

        // A newer navigation keeps the page hidden instead of fading the old one in again.
        root.dataset.transition = 'leaving';
        await finishAnimations(main());
    };

    const commitScene = (scene) => {
        currentScene = sceneFromRoute(scene);
    };

    const completeTransition = async (scene) => {
        const currentSequence = sequence;
        currentScene = sceneFromRoute(scene);

        if (!reducedMotion) {
            root.dataset.transition = 'entering';
            await finishAnimations(main());
        }

        if (sequence === currentSequence) {
            delete root.dataset.transition;
            announceTransitionFinished(currentScene);
        }
    };

    const reset = (scene) => {
        sequence += 1;
        currentScene = sceneFromRoute(scene);
        delete root.dataset.transition;
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
