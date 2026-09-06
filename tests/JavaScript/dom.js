import { JSDOM } from 'jsdom';

export const createDom = (test, html, url = 'https://portfolio.test/en') => {
    const dom = new JSDOM(html, { url, pretendToBeVisual: true });
    const { window } = dom;
    const globals = [
        'window', 'document', 'Element', 'HTMLElement', 'HTMLAnchorElement',
        'HTMLButtonElement', 'HTMLMetaElement', 'Node', 'DOMParser',
        'CustomEvent', 'AbortController',
    ];
    const previous = new Map(globals.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));

    for (const name of globals) {
        Object.defineProperty(globalThis, name, {
            configurable: true,
            writable: true,
            value: name === 'window' ? window : window[name],
        });
    }

    test.after(() => {
        window.close();
        for (const [name, descriptor] of previous) {
            if (descriptor) {
                Object.defineProperty(globalThis, name, descriptor);
            } else {
                delete globalThis[name];
            }
        }
    });

    return window;
};
