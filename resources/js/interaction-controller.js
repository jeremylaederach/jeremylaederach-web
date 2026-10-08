export const createInteractionController = ({ reducedMotion }) => {
    let revealObserver;

    // Hover styles apply only to actual mouse input, which also covers trackpads on touch-first
    // laptops.
    const noteInput = (event) => {
        document.documentElement.classList.toggle('has-mouse-input', event.pointerType === 'mouse');
    };

    const soundTarget = (target) => target instanceof Element
        ? target.closest('[data-interface-sound]')
        : null;

    const announceHover = (target) => {
        document.dispatchEvent(new CustomEvent('interface-hover', {
            detail: {
                tone: target.dataset.soundTone ?? 'control',
            },
        }));
    };

    const revealImmediately = () => {
        document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    };

    const initializeReveals = () => {
        revealObserver?.disconnect();

        if (reducedMotion || !('IntersectionObserver' in window)) {
            revealImmediately();
            return;
        }

        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12,
        });

        document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
    };

    const initialize = () => {
        initializeReveals();

        document.addEventListener('pointermove', noteInput, { passive: true });
        document.addEventListener('pointerdown', noteInput, { passive: true });

        document.addEventListener('pointerover', (event) => {
            const target = soundTarget(event.target);

            if (target && (!event.relatedTarget || !target.contains(event.relatedTarget))) {
                announceHover(target);
            }
        }, { passive: true });

        document.addEventListener('focusin', (event) => {
            const target = soundTarget(event.target);

            if (target) {
                announceHover(target);
            }
        });

        window.addEventListener('scroll', () => {
            document.body.classList.toggle('has-scrolled', window.scrollY > 24);
        }, { passive: true });

        document.addEventListener('portfolio:page-swapped', initializeReveals);
    };

    return { initialize, initializeReveals };
};
