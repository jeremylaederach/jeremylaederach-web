export const createSiteMenuController = ({ reducedMotion }) => {
    let activeController;

    const initialize = () => {
        activeController?.abort();
        activeController = new AbortController();

        const { signal } = activeController;
        const toggle = document.querySelector('[data-menu-toggle]');
        const panel = document.querySelector('[data-menu-panel]');

        if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) {
            return;
        }

        let closeTimer;
        const completeClose = () => {
            panel.hidden = true;
            panel.removeAttribute('data-closing');
            panel.setAttribute('aria-hidden', 'true');
        };
        const close = ({ restoreFocus = false } = {}) => {
            if (panel.hidden) {
                return;
            }

            window.clearTimeout(closeTimer);
            toggle.setAttribute('aria-expanded', 'false');
            panel.removeAttribute('data-open');
            panel.setAttribute('data-closing', '');
            panel.setAttribute('aria-hidden', 'true');
            closeTimer = window.setTimeout(completeClose, reducedMotion ? 0 : 420);

            if (restoreFocus) {
                toggle.focus();
            }
        };
        const open = () => {
            window.clearTimeout(closeTimer);
            panel.hidden = false;
            panel.removeAttribute('data-closing');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            window.requestAnimationFrame(() => panel.setAttribute('data-open', ''));
        };

        toggle.addEventListener('click', () => {
            if (panel.hidden) {
                open();
                return;
            }

            close();
        }, { signal });

        panel.addEventListener('click', (event) => {
            if (event.target instanceof Element && event.target.closest('a')) {
                close();
            }
        }, { signal });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                close({ restoreFocus: true });
            }
        }, { signal });

        signal.addEventListener('abort', () => window.clearTimeout(closeTimer), { once: true });
    };

    return { initialize };
};
