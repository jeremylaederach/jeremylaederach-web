import { initializeNetworkDemo } from './playground/network-demo.js';
import { initializePathfindingDemo } from './playground/pathfinding-demo.js';
import { initializeSortingDemo } from './playground/sorting-demo.js';

export const createAboutPlaygroundController = ({ reducedMotion }) => {
    let cleanups = [];

    const initialize = () => {
        cleanups.forEach((cleanup) => cleanup());
        cleanups = [];

        document.querySelectorAll('[data-about-playground]:not([data-playground-ready])').forEach((root) => {
            root.dataset.playgroundReady = 'true';

            [
                ['[data-sorting-demo]', initializeSortingDemo],
                ['[data-network-demo]', initializeNetworkDemo],
                ['[data-pathfinding-demo]', initializePathfindingDemo],
            ].forEach(([selector, initializeDemo]) => {
                root.querySelectorAll(selector).forEach((demo) => {
                    const cleanup = initializeDemo(demo, reducedMotion);

                    if (typeof cleanup === 'function') {
                        cleanups.push(cleanup);
                    }
                });
            });
        });
    };

    return {
        initialize: () => {
            initialize();
            document.addEventListener('portfolio:page-swapped', initialize);
        },
    };
};
