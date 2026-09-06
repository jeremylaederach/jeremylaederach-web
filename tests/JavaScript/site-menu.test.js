import assert from 'node:assert/strict';
import test from 'node:test';
import { createSiteMenuController } from '../../resources/js/site-menu.js';
import { createDom } from './dom.js';

const setup = (t) => {
    const window = createDom(t, `
        <button data-menu-toggle aria-expanded="false">Menu</button>
        <div data-menu-panel aria-hidden="true" inert hidden><a href="#content">Projects</a></div>
        <button id="content">Content</button>
    `);
    createSiteMenuController({ reducedMotion: false }).initialize();

    return {
        window,
        toggle: document.querySelector('[data-menu-toggle]'),
        panel: document.querySelector('[data-menu-panel]'),
    };
};

test('closing the menu immediately removes its links from keyboard navigation', (t) => {
    const { window, toggle, panel } = setup(t);
    toggle.click();
    panel.querySelector('a').focus();
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));

    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(panel.inert, true);
    assert.equal(panel.getAttribute('aria-hidden'), 'true');
    assert.equal(document.activeElement, toggle);
    assert.equal(document.body.classList.contains('is-menu-open'), false);
});

test('the menu can reopen during its closing animation', (t) => {
    const { toggle, panel } = setup(t);
    toggle.click();
    toggle.click();
    toggle.click();

    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(panel.hidden, false);
    assert.equal(panel.inert, false);
    assert.equal(panel.hasAttribute('data-closing'), false);
});

test('moving focus out of the menu or resizing to desktop releases the page', (t) => {
    const { window, toggle, panel } = setup(t);
    toggle.click();
    document.querySelector('#content').focus();
    assert.equal(panel.inert, true);

    toggle.click();
    // jsdom has no layout boxes, equivalent to a toggle hidden at desktop width.
    window.dispatchEvent(new window.Event('resize'));
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(document.body.classList.contains('is-menu-open'), false);
});
