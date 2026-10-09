export const sceneChangedEvent = 'portfolio:scene-changed';

// A page told in scenes keeps one screen in place while the page scrolls. A track of steps runs
// behind that screen, one step for each scene, and the step that crosses the middle of the window
// names the scene to show (`data-scene-step` holds its id). That scene is marked for the
// stylesheet and as the element the dot sphere rests with, the links to its step are marked as
// current, and the change is announced, because no pointer or focus event comes with a scroll.
export const createSceneController = () => {
    let observer;

    const show = (current, steps) => {
        for (const step of steps) {
            const scene = document.getElementById(step.dataset.sceneStep);
            const active = step === current;

            scene?.toggleAttribute('data-active', active);
            scene?.toggleAttribute('data-dot-orb-resting', active);

            for (const link of document.querySelectorAll(`a[href="#${step.id}"]`)) {
                if (active) {
                    link.setAttribute('aria-current', 'step');
                    // In a row of steps that is wider than the window the current one stays in sight.
                    link.parentElement.scrollTo?.({ left: link.offsetLeft - link.parentElement.clientWidth / 2 });
                } else {
                    link.removeAttribute('aria-current');
                }
            }
        }

        document.dispatchEvent(new CustomEvent(sceneChangedEvent));
    };

    const observe = () => {
        const steps = [...document.querySelectorAll('[data-scene-step]')];

        observer?.disconnect();
        observer = new IntersectionObserver((entries) => {
            const current = entries.find((entry) => entry.isIntersecting)?.target;

            if (current) {
                show(current, steps);
            }
        }, { rootMargin: '-50% 0px' });
        steps.forEach((step) => observer.observe(step));
    };

    // A scene that is not shown still holds its links. When one of them receives the focus, the
    // page scrolls to the step of its scene, so the focus is never on something invisible.
    const reveal = (event) => {
        const scene = event.target instanceof Element ? event.target.closest('[data-scene]:not([data-active])') : null;

        if (scene) {
            document.querySelector(`[data-scene-step="${scene.id}"]`)?.scrollIntoView();
        }
    };

    return {
        initialize: () => {
            observe();
            document.addEventListener('portfolio:page-swapped', observe);
            document.addEventListener('focusin', reveal);
        },
    };
};
