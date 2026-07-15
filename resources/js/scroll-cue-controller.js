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

        const headerHeight = document.querySelector('[data-page-header]')?.getBoundingClientRect().height ?? 0;
        const targetTop = window.scrollY + target.getBoundingClientRect().top - headerHeight;

        window.history.replaceState(window.history.state, '', destination);
        window.scrollTo({
            behavior: reducedMotion ? 'auto' : 'smooth',
            top: Math.max(0, targetTop),
        });
    };

    return {
        initialize: () => document.addEventListener('click', handleClick),
    };
};
