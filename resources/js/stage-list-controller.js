// A stage list always has one current row: the one last hovered or focused. Its item is marked
// for the stylesheet, and its link for the dot sphere, which rests in its figure.
export const createStageListController = () => {
    const select = (target) => {
        const current = target instanceof Element ? target.closest('[data-stage-item]') : null;

        if (!current || current.hasAttribute('data-current')) {
            return;
        }

        for (const item of current.parentElement.querySelectorAll('[data-stage-item]')) {
            item.toggleAttribute('data-current', item === current);
            item.querySelector('a')?.toggleAttribute('data-dot-orb-resting', item === current);
        }
    };

    const initialize = () => {
        document.addEventListener('pointerover', (event) => {
            if (event.pointerType === 'mouse') {
                select(event.target);
            }
        }, { passive: true });
        document.addEventListener('focusin', (event) => select(event.target));
    };

    return { initialize };
};
