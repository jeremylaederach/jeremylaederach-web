const selectors = {
    landingCard: '[data-landing-card]',
    menuPanel: '[data-menu-panel]',
    menuToggle: '[data-menu-toggle]',
    reveal: '.reveal',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const markRevealed = (element) => element.classList.add('is-visible');

const initLandingCards = () => {
    if (prefersReducedMotion) {
        return;
    }

    document.querySelectorAll(selectors.landingCard).forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty('--pointer-x', `${x}%`);
            card.style.setProperty('--pointer-y', `${y}%`);
        });
    });
};

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

        closeTimer = window.setTimeout(finishClose, prefersReducedMotion ? 0 : 980);

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
initLandingCards();
initSiteMenu();

if (prefersReducedMotion) {
    document.querySelectorAll(selectors.reveal).forEach(markRevealed);
} else {
    initScrollReveals();
}
