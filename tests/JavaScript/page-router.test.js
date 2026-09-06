import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageRouter } from '../../resources/js/page-router.js';
import { createDom } from './dom.js';

const page = (route) => `<!doctype html><html lang="en"><head>
    <title>${route}</title>
    <meta name="description" content="${route} description" data-page-meta>
    <link rel="canonical" href="https://portfolio.test/en/${route}/" data-page-meta>
    <link rel="alternate" hreflang="de" href="https://portfolio.test/de/${route}/" data-page-meta>
    </head><body data-page="${route}">
    <a hreflang="de" href="https://portfolio.test/de/${route}">DE</a>
    <main data-page-main><h1>${route}</h1><a href="/en/about" data-route-transition>About</a></main>
    </body></html>`;

const setup = (t, { covered = Promise.resolve(), revealed = Promise.resolve() } = {}) => {
    const window = createDom(t, page('projects'), 'https://portfolio.test/en/projects');
    const scrolls = [];
    window.scrollTo = (position) => {
        window.scrollX = position.left;
        window.scrollY = position.top;
        scrolls.push(position);
    };
    t.mock.method(globalThis, 'fetch', async (url) => ({
        ok: true,
        text: async () => page(new URL(url).pathname.split('/').at(-1)),
    }));
    const finished = () => new Promise((resolve) => document.addEventListener('test:finished', resolve, { once: true }));
    createPageRouter({
        soundController: { select() {}, complete() {} },
        transitionController: {
            beginTransition: () => covered,
            commitScene() {},
            completeTransition: async () => {
                await revealed;
                document.dispatchEvent(new window.Event('test:finished'));
            },
            reset() {},
        },
    });

    return { window, scrolls, finished };
};

test('Back and Forward restore the scroll position of each history entry', { timeout: 3000 }, async (t) => {
    const { window, scrolls, finished } = setup(t);
    window.scrollY = 1200;
    let done = finished();
    document.querySelector('[data-route-transition]').click();
    await done;
    assert.equal(window.location.pathname, '/en/about');
    assert.equal(scrolls.at(-1).top, 0);
    assert.equal(document.title, 'about');
    assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://portfolio.test/en/about/');
    assert.equal(document.querySelector('a[hreflang="de"]').href, 'https://portfolio.test/de/about');

    window.scrollY = 640;
    window.dispatchEvent(new window.Event('pagehide'));
    done = finished();
    window.history.back();
    await done;
    assert.equal(window.location.pathname, '/en/projects');
    assert.equal(scrolls.at(-1).top, 1200);
    assert.equal(scrolls.at(-1).behavior, 'instant');

    done = finished();
    window.history.forward();
    await done;
    assert.equal(window.location.pathname, '/en/about');
    assert.equal(scrolls.at(-1).top, 640);
});

test('the page is not swapped before the cover has finished', async (t) => {
    let finishCover;
    const covered = new Promise((resolve) => { finishCover = resolve; });
    const { finished } = setup(t, { covered });
    const originalMain = document.querySelector('main');
    const done = finished();
    document.querySelector('[data-route-transition]').click();
    await new Promise(setImmediate);
    assert.equal(document.querySelector('main'), originalMain);
    assert.equal(originalMain.inert, true);
    finishCover();
    await done;
    assert.notEqual(document.querySelector('main'), originalMain);
});

test('a repeated click on the pending destination does not restart navigation', async (t) => {
    let finishCover;
    const covered = new Promise((resolve) => { finishCover = resolve; });
    const { window, finished } = setup(t, { covered });
    const done = finished();
    const link = document.querySelector('[data-route-transition]');
    link.click();
    link.click();
    finishCover();
    await done;
    assert.equal(window.history.length, 2);
    assert.equal(window.location.pathname, '/en/about');
});

test('a newer navigation wins while an older request is still waiting for the cover', async (t) => {
    let finishCover;
    const covered = new Promise((resolve) => { finishCover = resolve; });
    const { window, finished } = setup(t, { covered });
    const done = finished();
    const link = document.querySelector('[data-route-transition]');
    link.click();
    link.href = '/en/contact';
    link.click();
    finishCover();
    await done;
    assert.equal(window.location.pathname, '/en/contact');
    assert.equal(document.title, 'contact');
    assert.equal(window.history.length, 2);
});

test('fragment-only history preserves the existing page and its interactive state', (t) => {
    const { window, scrolls } = setup(t);
    const main = document.querySelector('main');
    window.history.pushState({ portfolioScroll: { x: 0, y: 400 } }, '', '#section');
    window.dispatchEvent(new window.PopStateEvent('popstate', { state: window.history.state }));

    assert.equal(document.querySelector('main'), main);
    assert.equal(scrolls.at(-1).top, 400);
});

test('navigation preserves named targets and modified clicks', (t) => {
    const { window } = setup(t);
    const link = document.querySelector('[data-route-transition]');
    const check = (options) => {
        const event = new window.MouseEvent('click', { bubbles: true, cancelable: true, ...options });
        link.dispatchEvent(event);
        assert.equal(event.defaultPrevented, false);
    };

    link.target = 'preview';
    check({});
    link.target = '';
    check({ ctrlKey: true });
    check({ button: 1 });
});
