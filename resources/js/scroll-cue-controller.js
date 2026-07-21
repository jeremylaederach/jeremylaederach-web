const isUnmodifiedPrimaryClick = (event) => (
    !event.defaultPrevented
    && event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
);

export const createScrollCueController = ({ reducedMotion }) => {
    const handleClick = (event) => {
        const link = event.target instanceof Element
            ? event.target.closest('a.scroll-cue[href^="#"]')
            : null;

        if (!(link instanceof HTMLAnchorElement) || !isUnmodifiedPrimaryClick(event)) {
            return;
        }

        const destination = new URL(link.href, window.location.href);
        const targetId = decodeURIComponent(destination.hash.slice(1));
        const target = document.getElementById(targetId);

        if (!target || destination.pathname !== window.location.pathname) {
            return;
        }

        event.preventDefault();

        window.history.replaceState(window.history.state, '', destination);
        target.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'start',
        });
    };

    return {
        initialize: () => document.addEventListener('click', handleClick),
    };
};
