const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealSelector = '.reveal';
const tiltSelector = '[data-tilt]';

const markRevealed = (element) => element.classList.add('is-visible');

const initScrollReveals = () => {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    markRevealed(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.14 },
    );

    document.querySelectorAll(revealSelector).forEach((element) => revealObserver.observe(element));
};

const initSurfaceTilt = () => {
    document.querySelectorAll(tiltSelector).forEach((element) => {
        element.addEventListener('pointermove', (event) => {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateY = ((x / rect.width) - 0.5) * 3.2;
            const rotateX = ((y / rect.height) - 0.5) * -3.2;

            element.style.setProperty('--cursor-x', `${x}px`);
            element.style.setProperty('--cursor-y', `${y}px`);
            element.style.setProperty('--tilt-x', `${rotateX}deg`);
            element.style.setProperty('--tilt-y', `${rotateY}deg`);
        });

        element.addEventListener('pointerleave', () => {
            element.style.removeProperty('--tilt-x');
            element.style.removeProperty('--tilt-y');
        });
    });
};

document.documentElement.classList.add('js');

if (prefersReducedMotion) {
    document.querySelectorAll(revealSelector).forEach(markRevealed);
} else {
    initScrollReveals();
    initSurfaceTilt();
}
