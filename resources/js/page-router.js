import { liquidScenes } from './liquid-stage.js';

const pageCache = new Map();
const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve));

const isEligibleLink = (event, link) => {
    if (event.defaultPrevented || event.button !== 0 || link.hasAttribute('download')) {
        return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') {
        return false;
    }

    return new URL(link.href, window.location.href).origin === window.location.origin;
};

const loadPage = async (url) => {
    const cacheKey = url.href;

    if (!pageCache.has(cacheKey)) {
        const request = fetch(cacheKey, {
            headers: {
                'X-Portfolio-Navigation': 'true',
                'X-Requested-With': 'XMLHttpRequest',
            },
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(`Navigation request failed with status ${response.status}`);
            }

            return response.text();
        }).catch((error) => {
            pageCache.delete(cacheKey);
            throw error;
        });

        pageCache.set(cacheKey, request);
    }

    const html = await pageCache.get(cacheKey);
    const nextDocument = new DOMParser().parseFromString(html, 'text/html');
    const main = nextDocument.querySelector('[data-page-main]');
    const header = nextDocument.querySelector('[data-page-header]');
    const footer = nextDocument.querySelector('[data-page-footer]');

    if (!(main instanceof HTMLElement) || !(header instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
        throw new Error('Navigation response is missing a required page region.');
    }

    return { footer, header, main, nextDocument };
};

const updateDocumentMetadata = (nextDocument) => {
    const nextDescription = nextDocument.querySelector('meta[name="description"]')?.getAttribute('content');
    const description = document.querySelector('meta[name="description"]');

    document.title = nextDocument.title;
    document.documentElement.lang = nextDocument.documentElement.lang;

    if (description instanceof HTMLMetaElement && nextDescription) {
        description.content = nextDescription;
    }
};

const focusPageHeading = (main) => {
    const heading = main.querySelector('h1');

    if (!(heading instanceof HTMLElement)) {
        return;
    }

    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
};

export const createPageRouter = ({ menuController, reducedMotion, stageController }) => {
    let isNavigating = false;

    const navigate = async (url, { historyMode = 'push', routeHint, restoreFocus = true } = {}) => {
        if (isNavigating) {
            return;
        }

        isNavigating = true;
        const currentMain = document.querySelector('[data-page-main]');
        const hintedScene = liquidScenes.has(routeHint) ? routeHint : null;

        document.body.classList.add('is-routing');
        currentMain?.classList.add('is-page-exiting');

        if (hintedScene) {
            stageController.setScene(hintedScene);
        }

        try {
            const [page] = await Promise.all([
                loadPage(url),
                wait(reducedMotion ? 0 : 480),
            ]);
            const scene = page.nextDocument.body.dataset.page ?? hintedScene ?? 'home';

            stageController.setScene(scene);
            page.main.classList.add('is-page-entering');

            document.querySelector('[data-page-header]')?.replaceWith(page.header);
            currentMain?.replaceWith(page.main);
            document.querySelector('[data-page-footer]')?.replaceWith(page.footer);

            document.body.className = page.nextDocument.body.className;
            document.body.classList.add('is-routing');
            document.body.dataset.page = scene;
            updateDocumentMetadata(page.nextDocument);

            if (historyMode === 'push') {
                window.history.pushState({ portfolioNavigation: true }, '', url);
            }

            window.scrollTo(0, 0);
            menuController.initialize();

            await nextFrame();
            await nextFrame();
            page.main.classList.remove('is-page-entering');

            if (restoreFocus) {
                focusPageHeading(page.main);
            }

            await wait(reducedMotion ? 0 : 560);
        } catch (error) {
            console.error(error);
            window.location.assign(url.href);
            return;
        } finally {
            document.body.classList.remove('is-routing');
            isNavigating = false;
        }
    };

    document.addEventListener('click', (event) => {
        const link = event.target instanceof Element
            ? event.target.closest('a[data-route-transition]')
            : null;

        if (!(link instanceof HTMLAnchorElement) || !isEligibleLink(event, link)) {
            return;
        }

        const destination = new URL(link.href, window.location.href);

        event.preventDefault();

        if (destination.href === window.location.href || isNavigating) {
            return;
        }

        navigate(destination, { routeHint: link.dataset.route });
    });

    document.addEventListener('pointerover', (event) => {
        const link = event.target instanceof Element
            ? event.target.closest('a[data-route-transition]')
            : null;

        if (!(link instanceof HTMLAnchorElement)) {
            return;
        }

        const destination = new URL(link.href, window.location.href);

        if (destination.origin === window.location.origin && destination.href !== window.location.href) {
            loadPage(destination).catch(() => {});
        }
    }, { passive: true });

    window.addEventListener('popstate', () => {
        navigate(new URL(window.location.href), {
            historyMode: 'pop',
            restoreFocus: false,
        });
    });

    window.history.scrollRestoration = 'manual';
    window.history.replaceState({ portfolioNavigation: true }, '', window.location.href);
};
