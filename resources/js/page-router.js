import { pageRoutes, sceneFromRoute } from './transition-controller.js';

const pageCache = new Map();
const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve));

const isEligibleLink = (event, link) => {
    if (event.defaultPrevented || event.button !== 0 || link.hasAttribute('download')) {
        return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (link.target && link.target !== '_self')) {
        return false;
    }

    return new URL(link.href, window.location.href).origin === window.location.origin;
};

const routeFromUrl = (url) => {
    const route = url.pathname.split('/').filter(Boolean).at(-1);

    return sceneFromRoute(route);
};

const transitionThemeFromUrl = (url) => url.pathname.split('/').filter(Boolean).at(-1) ?? 'home';

const loadPage = async (url) => {
    const cacheKey = `${url.origin}${url.pathname}${url.search}`;

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

    if (!(main instanceof HTMLElement)) {
        throw new Error('Navigation response is missing the main page region.');
    }

    return { main, nextDocument };
};

const updateDocumentMetadata = (nextDocument) => {
    document.title = nextDocument.title;
    document.documentElement.lang = nextDocument.documentElement.lang;

    document.head.querySelectorAll('[data-page-meta]').forEach((element) => element.remove());
    nextDocument.head.querySelectorAll('[data-page-meta]').forEach((element) => {
        document.head.append(element.cloneNode(true));
    });
};

const syncPersistentChrome = (nextDocument, scene) => {
    document.querySelectorAll('[data-page-route]').forEach((link) => {
        const active = link.dataset.pageRoute === scene;

        link.classList.toggle('is-active', active);
        link.toggleAttribute('aria-current', active);

        if (active) {
            link.setAttribute('aria-current', 'page');
        }
    });

    document.querySelectorAll('a[hreflang]').forEach((link) => {
        const language = link.getAttribute('hreflang');
        const nextLink = nextDocument.querySelector(`a[hreflang="${language}"]`);

        if (nextLink instanceof HTMLAnchorElement) {
            link.href = nextLink.href;
        }
    });
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

const scrollToDestination = (url, position) => {
    if (position) {
        window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
        return;
    }

    let targetId;

    try {
        targetId = decodeURIComponent(url.hash.slice(1));
    } catch {
        targetId = '';
    }
    const target = targetId ? document.getElementById(targetId) : null;

    if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

export const createPageRouter = ({ soundController, transitionController }) => {
    let navigationSequence = 0;
    let renderedUrl = new URL(window.location.href);
    let scrollFrame;

    const saveScrollPosition = () => {
        if (document.body.classList.contains('is-routing')) {
            return;
        }

        window.history.replaceState({
            ...window.history.state,
            portfolioScroll: { x: window.scrollX, y: window.scrollY },
        }, '');
    };

    const navigate = async (url, {
        historyMode = 'push',
        origin,
        restoreFocus = true,
        scrollPosition,
        routeHint,
        transitionLabel,
        transitionTheme,
    } = {}) => {
        if (historyMode === 'push') {
            saveScrollPosition();
        }

        const sequence = ++navigationSequence;
        const startedAt = performance.now();
        const hintedScene = pageRoutes.has(routeHint) ? routeHint : routeFromUrl(url);
        const timing = transitionController.beginTransition(hintedScene, {
            origin,
            transitionLabel,
            transitionTheme: transitionTheme ?? transitionThemeFromUrl(url),
        });
        const currentMain = document.querySelector('[data-page-main]');

        soundController.select();
        document.body.classList.add('is-routing');
        currentMain?.classList.add('is-page-exiting');

        try {
            const [page] = await Promise.all([
                loadPage(url),
                wait(timing.swapDelay),
            ]);

            if (sequence !== navigationSequence) {
                return;
            }

            const scene = page.nextDocument.body.dataset.page ?? hintedScene;

            transitionController.commitScene(scene);
            page.main.classList.add('is-page-entering');
            currentMain?.replaceWith(page.main);

            document.body.className = page.nextDocument.body.className;
            document.body.classList.add('is-routing');
            document.body.dataset.page = scene;
            updateDocumentMetadata(page.nextDocument);
            syncPersistentChrome(page.nextDocument, scene);

            if (historyMode === 'push') {
                window.history.pushState({ portfolioNavigation: true }, '', url);
            }

            renderedUrl = url;
            await nextFrame();
            await nextFrame();

            if (sequence !== navigationSequence) {
                return;
            }

            scrollToDestination(url, scrollPosition);
            page.main.classList.remove('is-page-entering');
            document.dispatchEvent(new CustomEvent('portfolio:page-swapped', {
                detail: { scene },
            }));

            if (restoreFocus) {
                focusPageHeading(page.main);
            }

            const elapsed = performance.now() - startedAt;
            await wait(Math.max(0, timing.completeDelay - elapsed));

            if (sequence !== navigationSequence) {
                return;
            }

            transitionController.completeTransition(scene);
            soundController.complete();
        } catch (error) {
            if (sequence !== navigationSequence) {
                return;
            }

            console.error(error);
            window.location.assign(url.href);
            return;
        } finally {
            if (sequence === navigationSequence) {
                document.body.classList.remove('is-routing');
                saveScrollPosition();
            }
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

        if (destination.href === window.location.href) {
            return;
        }

        const externalOrigin = link.dataset.transitionOriginId
            ? document.getElementById(link.dataset.transitionOriginId)
            : null;
        const nestedOrigin = link.querySelector('[data-transition-origin]');

        navigate(destination, {
            origin: externalOrigin ?? (nestedOrigin instanceof Element ? nestedOrigin : link),
            routeHint: link.dataset.route,
            transitionLabel: link.dataset.transitionLabel ?? link.textContent.trim(),
            transitionTheme: link.dataset.transitionTheme,
        });
    });

    const prefetch = (event) => {
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
    };

    document.addEventListener('pointerover', prefetch, { passive: true });
    document.addEventListener('focusin', prefetch);
    window.addEventListener('scroll', () => {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = window.requestAnimationFrame(saveScrollPosition);
    }, { passive: true });
    window.addEventListener('pagehide', saveScrollPosition);
    window.addEventListener('popstate', (event) => {
        const destination = new URL(window.location.href);
        const scrollPosition = event.state?.portfolioScroll;

        if (
            !document.body.classList.contains('is-routing')
            && destination.pathname === renderedUrl.pathname
            && destination.search === renderedUrl.search
        ) {
            scrollToDestination(destination, scrollPosition);
            return;
        }

        navigate(destination, {
            historyMode: 'pop',
            restoreFocus: false,
            scrollPosition,
        });
    });
    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) {
            return;
        }

        const scene = document.body.dataset.page ?? 'home';
        navigationSequence += 1;
        document.body.classList.remove('is-routing');
        document.querySelector('[data-page-main]')?.classList.remove('is-page-entering', 'is-page-exiting');
        transitionController.completeTransition(scene);
    });

    window.history.scrollRestoration = 'manual';
    window.history.replaceState({ ...window.history.state, portfolioNavigation: true }, '');

    const initialPosition = window.history.state?.portfolioScroll;

    if (initialPosition) {
        window.requestAnimationFrame(() => scrollToDestination(renderedUrl, initialPosition));
    }
};
