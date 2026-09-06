import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectReelController } from '../../resources/js/project-reel-controller.js';
import { createDom } from './dom.js';

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `<div data-project-reel data-reel-autoplay>
        <a class="project-reel__viewport" href="#project" data-reel-open>
            <div data-reel-slide data-label="One" data-kind="Screenshot"></div>
            <div data-reel-slide data-label="Two" data-kind="Interface preview"></div>
        </a>
        <p data-reel-caption>One</p><p data-reel-caption>Two</p>
        <span data-reel-current></span>
        <span data-reel-kind></span>
        <button data-reel-action="rotation" data-play-label="Play slideshow" data-pause-label="Pause slideshow"></button>
        <button data-reel-action="previous">Previous</button>
        <button data-reel-action="go" data-reel-index="0">One</button>
        <button data-reel-action="go" data-reel-index="1">Two</button>
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
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'Two');
});

test('rapid navigation keeps exactly one active, accessible slide and matching labels', (t) => {
    setup(t);
    for (const action of ['next', 'next', 'previous', 'next', 'previous']) {
        document.querySelector(`[data-reel-action="${action}"]`).click();
    }
    const slides = [...document.querySelectorAll('[data-reel-slide]')];
    assert.deepEqual(slides.map((slide) => slide.dataset.state), ['inactive', 'active']);
    assert.deepEqual(slides.map((slide) => slide.inert), [true, false]);
    assert.deepEqual(slides.map((slide) => slide.getAttribute('aria-hidden')), ['true', 'false']);
    assert.equal(document.querySelector('[data-reel-current]').textContent, '02');
    assert.equal(document.querySelector('[data-reel-kind]').textContent, 'Interface preview');
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'Two');
    assert.equal(document.querySelector('[data-reel-index="1"]').getAttribute('aria-current'), 'true');
});

const touch = (window, target, type, x, y = 20) => {
    const event = new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
    Object.defineProperties(event, {
        pointerType: { value: 'touch' },
        pointerId: { value: 1 },
        isPrimary: { value: true },
    });
    target.dispatchEvent(event);
};

test('swiping captures the pointer, changes the view and suppresses the following link click', (t) => {
    const { window, timers } = setup(t);
    const viewport = document.querySelector('[data-reel-open]');
    viewport.setPointerCapture = t.mock.fn();
    touch(window, viewport, 'pointerdown', 200);
    assert.equal(viewport.setPointerCapture.mock.calls[0].arguments[0], 1);
    assert.equal(timers.size, 0);
    touch(window, viewport, 'pointerup', 50);
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'Two');
    assert.equal(timers.size, 1);
    const click = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    viewport.dispatchEvent(click);
    assert.equal(click.defaultPrevented, true);
});

test('touching controls or scrolling vertically does not change slides', (t) => {
    const { window } = setup(t);
    const button = document.querySelector('[data-reel-action="next"]');
    touch(window, button, 'pointerdown', 200);
    touch(window, button, 'pointerup', 50);
    const viewport = document.querySelector('[data-reel-open]');
    viewport.setPointerCapture = t.mock.fn();
    touch(window, viewport, 'pointerdown', 100, 20);
    touch(window, viewport, 'pointerup', 90, 200);
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'One');
});

test('cancelled touch gestures release the autoplay pause', (t) => {
    const { window, timers } = setup(t);
    const viewport = document.querySelector('[data-reel-open]');
    viewport.setPointerCapture = t.mock.fn();
    touch(window, viewport, 'pointerdown', 200);
    assert.equal(timers.size, 0);
    touch(window, viewport, 'pointercancel', 200);
    assert.equal(timers.size, 1);
    touch(window, viewport, 'pointerup', 50);
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'One');
});
