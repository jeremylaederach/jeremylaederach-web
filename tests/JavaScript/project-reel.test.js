import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectReelController } from '../../resources/js/project-reel-controller.js';
import { createDom } from './dom.js';

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `<div data-project-reel data-reel-autoplay>
        <a href="#project" data-reel-open>Open project</a>
        <div data-reel-slide data-label="One"></div><div data-reel-slide data-label="Two"></div>
        <strong data-reel-label></strong>
        <button data-reel-action="rotation" data-play-label="Play slideshow" data-pause-label="Pause slideshow"></button>
        <button data-reel-action="next">Next</button>
    </div><button id="outside">Outside</button>`);
    const timers = new Map();
    let timerId = 0;
    t.mock.method(window, 'setTimeout', (callback) => {
        timers.set(++timerId, callback);
        return timerId;
    });
    t.mock.method(window, 'clearTimeout', (id) => timers.delete(id));
    const previousObserver = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
        constructor(callback) { this.callback = callback; }
        observe(target) { this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }]); }
        unobserve() {}
    };
    t.after(() => {
        if (previousObserver) {
            globalThis.IntersectionObserver = previousObserver;
        } else {
            delete globalThis.IntersectionObserver;
        }
    });
    createProjectReelController({ reducedMotion }).initialize();

    return { window, timers, rotation: document.querySelector('[data-reel-action="rotation"]') };
};

test('keyboard focus pauses the slideshow until it is explicitly restarted', (t) => {
    const { timers, rotation } = setup(t);
    assert.equal(timers.size, 1);
    document.querySelector('[data-reel-open]').focus();
    assert.equal(timers.size, 0);
    assert.equal(rotation.getAttribute('aria-label'), 'Play slideshow');
    document.querySelector('#outside').focus();
    assert.equal(timers.size, 0);
    rotation.focus();
    rotation.click();
    assert.equal(timers.size, 1);
    assert.equal(rotation.getAttribute('aria-label'), 'Pause slideshow');
});

test('clicking Pause still pauses when pointer focus enters the slideshow', (t) => {
    const { window, timers, rotation } = setup(t);
    rotation.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true }));
    rotation.focus();
    rotation.dispatchEvent(new window.MouseEvent('click', { bubbles: true, detail: 1 }));
    assert.equal(timers.size, 0);
    assert.equal(rotation.getAttribute('aria-label'), 'Play slideshow');
});

test('an abandoned pointer press does not override a later keyboard activation', (t) => {
    const { window, timers, rotation } = setup(t);
    rotation.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true }));
    rotation.focus();
    rotation.click();
    assert.equal(timers.size, 1);
    assert.equal(rotation.getAttribute('aria-label'), 'Pause slideshow');
});

test('reduced motion disables automatic rotation without removing manual controls', (t) => {
    const { timers, rotation } = setup(t, true);
    assert.equal(timers.size, 0);
    assert.equal(rotation.hidden, true);
    document.querySelector('[data-reel-action="next"]').click();
    assert.equal(document.querySelector('[data-reel-label]').textContent, 'Two');
});
