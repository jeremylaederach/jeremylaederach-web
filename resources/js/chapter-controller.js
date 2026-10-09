export const chapterChangedEvent = 'portfolio:chapter-changed';

// A page told in chapters has one current chapter: the one that crosses the middle of the
// window. It is marked as the element the dot sphere rests with, and the change is announced,
// because no pointer or focus event comes with a scroll.
export const createChapterController = () => {
    let observer;

    const observe = () => {
        const chapters = [...document.querySelectorAll('[data-chapter]')];

        observer?.disconnect();
        observer = new IntersectionObserver((entries) => {
            const current = entries.find((entry) => entry.isIntersecting)?.target;

            if (!current) {
                return;
            }

            for (const chapter of chapters) {
                chapter.toggleAttribute('data-dot-orb-resting', chapter === current);
            }

            document.dispatchEvent(new CustomEvent(chapterChangedEvent));
        }, { rootMargin: '-50% 0px' });
        chapters.forEach((chapter) => observer.observe(chapter));
    };

    return {
        initialize: () => {
            observe();
            document.addEventListener('portfolio:page-swapped', observe);
        },
    };
};
