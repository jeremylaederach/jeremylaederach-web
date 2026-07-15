import {
    siAngular,
    siDotnet,
    siGit,
    siPostgresql,
    siTypescript,
} from 'simple-icons';

const icons = new Map([
    ['angular', siAngular],
    ['dotnet', siDotnet],
    ['git', siGit],
    ['postgresql', siPostgresql],
    ['typescript', siTypescript],
]);

const renderIcons = (root) => {
    root.querySelectorAll('[data-technology-icon]').forEach((mark) => {
        if (!(mark instanceof HTMLElement) || mark.dataset.iconRendered === 'true') {
            return;
        }

        const icon = icons.get(mark.dataset.technologyIcon);

        if (!icon) {
            return;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('focusable', 'false');
        path.setAttribute('d', icon.path);
        svg.append(path);
        mark.replaceChildren(svg);
        mark.dataset.iconRendered = 'true';
    });
};

export const createTechnologyIconController = () => ({
    initialize: () => {
        renderIcons(document);
        document.addEventListener('portfolio:page-swapped', () => renderIcons(document));
    },
});
