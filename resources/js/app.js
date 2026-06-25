const selectors = {
    catBubble: '[data-cat-bubble]',
    catStage: '[data-cat-stage]',
    catTrigger: '[data-cat-message]',
    menuPanel: '[data-menu-panel]',
    menuToggle: '[data-menu-toggle]',
    reveal: '.reveal',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const markRevealed = (element) => element.classList.add('is-visible');

const initScrollReveals = () => {
    const revealElements = document.querySelectorAll(selectors.reveal);

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(markRevealed);

        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                markRevealed(entry.target);
                revealObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.14 },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
};

const initCatStage = () => {
    const stage = document.querySelector(selectors.catStage);
    const bubble = document.querySelector(selectors.catBubble);

    if (!stage || !bubble) {
        return;
    }

    const defaultMessage = bubble.textContent.trim();

    document.querySelectorAll(selectors.catTrigger).forEach((trigger) => {
        const showMessage = () => {
            bubble.textContent = trigger.dataset.catMessage || defaultMessage;
            stage.classList.add('is-curious');
        };

        const resetMessage = () => {
            bubble.textContent = defaultMessage;
            stage.classList.remove('is-curious');
        };

        trigger.addEventListener('pointerenter', showMessage);
        trigger.addEventListener('focus', showMessage);
        trigger.addEventListener('pointerleave', resetMessage);
        trigger.addEventListener('blur', resetMessage);
    });
};

const initSiteMenu = () => {
    const toggle = document.querySelector(selectors.menuToggle);
    const panel = document.querySelector(selectors.menuPanel);

    if (!toggle || !panel) {
        return;
    }

    let closeTimer;

    const finishClose = () => {
        panel.hidden = true;
        panel.removeAttribute('data-closing');
        panel.setAttribute('aria-hidden', 'true');
    };

    const openMenu = () => {
        window.clearTimeout(closeTimer);
        panel.hidden = false;
        panel.removeAttribute('data-closing');
        panel.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');

        window.requestAnimationFrame(() => {
            panel.setAttribute('data-open', '');
        });
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
        if (panel.hidden) {
            return;
        }

        window.clearTimeout(closeTimer);
        toggle.setAttribute('aria-expanded', 'false');
        panel.removeAttribute('data-open');
        panel.setAttribute('data-closing', '');
        panel.setAttribute('aria-hidden', 'true');

        closeTimer = window.setTimeout(finishClose, prefersReducedMotion ? 0 : 820);

        if (restoreFocus) {
            toggle.focus();
        }
    };

    toggle.addEventListener('click', () => {
        if (toggle.getAttribute('aria-expanded') === 'true') {
            closeMenu();

            return;
        }

        openMenu();
    });

    panel.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            closeMenu();
        }
    });

    document.addEventListener('click', (event) => {
        if (toggle.contains(event.target) || panel.contains(event.target)) {
            return;
        }

        closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu({ restoreFocus: true });
        }
    });
};

document.documentElement.classList.add('js');
initSiteMenu();
initCatStage();

if (prefersReducedMotion) {
    document.querySelectorAll(selectors.reveal).forEach(markRevealed);
} else {
    initScrollReveals();
}
