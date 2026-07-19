import { initializeNetworkDemo } from './playground/network-demo.js';
import { initializePathfindingDemo } from './playground/pathfinding-demo.js';
import { initializeSortingDemo } from './playground/sorting-demo.js';

export const createAboutPlaygroundController = ({ reducedMotion }) => {
    const initialize = () => {
        document.querySelectorAll('[data-about-playground]:not([data-playground-ready])').forEach((root) => {
            root.dataset.playgroundReady = 'true';

            [
                ['[data-sorting-demo]', initializeSortingDemo],
                ['[data-network-demo]', initializeNetworkDemo],
                ['[data-pathfinding-demo]', initializePathfindingDemo],
            ].forEach(([selector, initializeDemo]) => {
                const demo = root.querySelector(selector);

                if (demo) {
                    initializeDemo(demo, reducedMotion);
                }
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
