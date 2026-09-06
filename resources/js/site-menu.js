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
        let openFrame;
        const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
        const completeClose = () => {
            panel.hidden = true;
            panel.removeAttribute('data-closing');
            panel.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('is-menu-open');
        };
        const close = ({ restoreFocus = false } = {}) => {
            if (!isOpen()) {
                return;
            }

            window.clearTimeout(closeTimer);
            window.cancelAnimationFrame(openFrame);
            toggle.setAttribute('aria-expanded', 'false');
            panel.removeAttribute('data-open');
            panel.setAttribute('data-closing', '');
            if (restoreFocus) {
                toggle.focus();
            }

            panel.inert = true;
            panel.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('is-menu-open');
            closeTimer = window.setTimeout(completeClose, reducedMotion ? 0 : 540);
        };
        const open = () => {
            window.clearTimeout(closeTimer);
            panel.hidden = false;
            panel.inert = false;
            panel.removeAttribute('data-closing');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('is-menu-open');
            openFrame = window.requestAnimationFrame(() => panel.setAttribute('data-open', ''));
        };

        toggle.addEventListener('click', () => {
            if (!isOpen()) {
                open();
                return;
            }

            close();
        }, { signal });

        panel.addEventListener('click', (event) => {
            if (event.target instanceof Element && event.target.closest('a')) {
                close({ restoreFocus: true });
            }
        }, { signal });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isOpen()) {
                event.preventDefault();
                close({ restoreFocus: true });
            }
        }, { signal });

        document.addEventListener('focusin', (event) => {
            if (isOpen() && event.target !== toggle && !panel.contains(event.target)) {
                close();
            }
        }, { signal });

        window.addEventListener('resize', () => {
            if (isOpen() && toggle.getClientRects().length === 0) {
                close();
            }
        }, { signal });

        signal.addEventListener('abort', () => {
            window.clearTimeout(closeTimer);
            window.cancelAnimationFrame(openFrame);
            document.body.classList.remove('is-menu-open');
        }, { once: true });
    };

    return { initialize };
};
