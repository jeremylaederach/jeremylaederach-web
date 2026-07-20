import { transitionFinishedEvent } from './transition-controller.js';

const headingSelector = '[data-page-heading-signal]';

export const createPageHeadingController = ({ reducedMotion }) => {
    let firstFrame;
    let secondFrame;

    const signal = () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);

        const headings = [...document.querySelectorAll(headingSelector)];

        headings.forEach((heading) => heading.classList.remove('is-signalling'));
        firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() => {
                headings.forEach((heading) => heading.classList.add('is-signalling'));
            });
        });
    };

    return {
        initialize: () => {
            if (reducedMotion) {
                return;
            }

            document.addEventListener(transitionFinishedEvent, signal);
            signal();
        },
    };
};
