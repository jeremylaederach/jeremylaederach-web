import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectReelController } from '../../resources/js/project-reel-controller.js';
import { createDom } from './dom.js';

const setup = (t) => {
    const window = createDom(t, `<div data-project-reel>
        <a class="project-reel__viewport" href="#project" data-reel-open>
            <div data-reel-slide data-label="One" data-kind="Screenshot"></div>
            <div data-reel-slide data-label="Two" data-kind="Interface preview"></div>
        </a>
        <p data-reel-caption>One</p><p data-reel-caption>Two</p>
        <span data-reel-current></span>
        <span data-reel-kind></span>
        <button data-reel-action="previous">Previous</button>
        <button data-reel-action="next">Next</button>
    </div><button id="outside">Outside</button>`);
    const timers = new Map();
    let timerId = 0;
    t.mock.method(window, 'setTimeout', (callback) => {
        timers.set(++timerId, callback);
        return timerId;
    });
    t.mock.method(window, 'clearTimeout', (id) => timers.delete(id));
    const controller = createProjectReelController();
    controller.initialize();

    return { window, timers, controller };
};

test('galleries never schedule automatic slide changes', (t) => {
    const { window, timers } = setup(t);
    document.querySelector('[data-reel-open]').focus();
    document.querySelector('[data-reel-action="next"]').click();
    document.querySelector('#outside').focus();
    document.dispatchEvent(new window.Event('visibilitychange'));
    assert.equal(timers.size, 0);
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'Two');
});

test('arrow keys navigate manually and wrap in both directions', (t) => {
    const { window } = setup(t);
    const link = document.querySelector('[data-reel-open]');
    for (const [key, expected] of [['ArrowLeft', '02'], ['ArrowRight', '01']]) {
        const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        link.dispatchEvent(event);
        assert.equal(event.defaultPrevented, true);
        assert.equal(document.querySelector('[data-reel-current]').textContent, expected);
    }
});

test('reinitialization preserves selection without duplicating listeners', (t) => {
    const { controller } = setup(t);
    document.querySelector('[data-reel-action="next"]').click();
    controller.initialize();
    assert.equal(document.querySelector('[data-reel-current]').textContent, '02');
    document.querySelector('[data-reel-action="next"]').click();
    assert.equal(document.querySelector('[data-reel-current]').textContent, '01');
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
    const { window } = setup(t);
    const viewport = document.querySelector('[data-reel-open]');
    viewport.setPointerCapture = t.mock.fn();
    touch(window, viewport, 'pointerdown', 200);
    assert.equal(viewport.setPointerCapture.mock.calls[0].arguments[0], 1);
    touch(window, viewport, 'pointerup', 50);
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'Two');
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

test('cancelled touch gestures cannot advance a slide', (t) => {
    const { window } = setup(t);
    const viewport = document.querySelector('[data-reel-open]');
    viewport.setPointerCapture = t.mock.fn();
    touch(window, viewport, 'pointerdown', 200);
    touch(window, viewport, 'pointercancel', 200);
    touch(window, viewport, 'pointerup', 50);
    assert.equal(document.querySelector('[data-reel-caption][aria-hidden="false"]').textContent, 'One');
});
