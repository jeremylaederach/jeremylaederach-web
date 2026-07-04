const selectors = {
    landingCard: '[data-landing-card]',
    menuPanel: '[data-menu-panel]',
    menuToggle: '[data-menu-toggle]',
    reveal: '.reveal',
};

const LANDING_TRANSITION_MS = 780;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const markRevealed = (element) => element.classList.add('is-visible');

const shouldAnimateCardNavigation = (event, card) => {
    if (document.documentElement.classList.contains('is-landing-transitioning')) {
        return false;
    }

    if (prefersReducedMotion || event.defaultPrevented || event.button !== 0) {
        return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
    }

    return card.target !== '_blank' && card.href;
};

const animateCardNavigation = async (card) => {
    const rect = card.getBoundingClientRect();
    const styles = window.getComputedStyle(card);
    const backdrop = document.createElement('div');
    const clone = card.cloneNode(true);
    const target = {
        height: window.innerHeight * 1.12,
        left: window.innerWidth * -0.06,
        top: window.innerHeight * -0.06,
        width: window.innerWidth * 1.12,
    };

    backdrop.className = 'landing-transition-backdrop';
    clone.classList.add('landing-card--transition-clone');
    clone.removeAttribute('data-landing-card');
    clone.setAttribute('aria-hidden', 'true');

    Object.assign(clone.style, {
        borderRadius: styles.borderRadius,
        height: `${rect.height}px`,
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        transform: 'none',
        transformOrigin: 'top left',
        width: `${rect.width}px`,
    });

    document.documentElement.classList.add('is-landing-transitioning');
    card.classList.add('landing-card--is-hidden');
    document.body.append(backdrop, clone);

    if (!clone.animate || !backdrop.animate) {
        window.location.href = card.href;

        return;
    }

    const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
    const targetTransform = `translate3d(${target.left - rect.left}px, ${target.top - rect.top}px, 0) scale(${target.width / rect.width}, ${target.height / rect.height})`;
    const backdropAnimation = backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: LANDING_TRANSITION_MS,
        easing: 'ease',
        fill: 'forwards',
    });
    const cardAnimation = clone.animate(
        [
            {
                borderRadius: styles.borderRadius,
                opacity: 1,
                transform: 'translate3d(0, 0, 0) scale(1)',
            },
            {
                borderRadius: '0',
                opacity: 1,
                transform: targetTransform,
            },
        ],
        {
            duration: LANDING_TRANSITION_MS,
            easing,
            fill: 'forwards',
        },
    );

    await Promise.allSettled([backdropAnimation.finished, cardAnimation.finished]);
    window.location.href = card.href;
};

const initLandingCards = () => {
    document.querySelectorAll(selectors.landingCard).forEach((card) => {
        card.addEventListener('click', (event) => {
            if (!shouldAnimateCardNavigation(event, card)) {
                return;
            }

            event.preventDefault();
            animateCardNavigation(card);
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
