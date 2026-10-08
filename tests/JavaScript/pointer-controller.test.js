import assert from 'node:assert/strict';
import test from 'node:test';
import { createPointerController } from '../../resources/js/pointer-controller.js';
import { createDom } from './dom.js';

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `
        <svg data-site-pointer><rect data-pointer-ring /><circle data-pointer-dot /></svg>
        <button style="--control-accent-rgb: 1, 2, 3; border-top-left-radius: 12px">Projects</button>
    `);
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'getComputedStyle');

    Object.defineProperty(globalThis, 'getComputedStyle', {
        configurable: true,
        value: window.getComputedStyle.bind(window),
    });
    t.after(() => {
        if (previous) Object.defineProperty(globalThis, 'getComputedStyle', previous);
        else delete globalThis.getComputedStyle;
    });

    const button = document.querySelector('button');
    button.getBoundingClientRect = () => ({ left: 20, top: 20, width: 100, height: 40 });
    document.elementFromPoint = () => button;
    const frames = new Map();
    let frameId = 0;
    let timestamp = 0;
    t.mock.method(window, 'requestAnimationFrame', callback => {
        frames.set(++frameId, callback);
        return frameId;
    });
    t.mock.method(window, 'cancelAnimationFrame', id => frames.delete(id));
    // The observer reports a change of size when the test calls `resized` for an observed element.
    const observed = new Set();
    let resized;
    globalThis.ResizeObserver = class {
        constructor(callback) {
            resized = element => observed.has(element) && callback();
        }

        observe(element) {
            observed.add(element);
        }

        disconnect() {
            observed.clear();
        }
    };
    t.after(() => delete globalThis.ResizeObserver);
    // Runs frames 16ms apart until the ring has arrived, or for the given number of frames.
    const run = (count = 200) => {
        for (let index = 0; index < count && frames.size; index += 1) {
            const pending = [...frames.values()];
            frames.clear();
            timestamp += 16;
            pending.forEach(callback => callback(timestamp));
        }
    };
    const pointer = (type, pointerType, x = 40) => {
        const event = new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: 40 });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        button.dispatchEvent(event);
    };
    const element = document.querySelector('[data-site-pointer]');
    const ring = name => Number(element.querySelector('[data-pointer-ring]').getAttribute(name));
    const dot = name => Number(element.querySelector('[data-pointer-dot]').getAttribute(name));
    const shown = () => document.documentElement.classList.contains('has-site-pointer');
    createPointerController({ reducedMotion }).initialize();

    return { window, button, element, frames, run, pointer, ring, dot, shown, resized };
};

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.5, `${actual} is not near ${expected}`);

test('mouse input shows the pointer in the accent of the control underneath', t => {
    const { element, run, pointer, dot, shown } = setup(t);
    assert.equal(shown(), false);
    pointer('pointermove', 'mouse');
    run();
    assert.equal(shown(), true);
    assert.equal(dot('cx'), 40);
    assert.equal(element.style.getPropertyValue('--pointer-accent').trim(), '1, 2, 3');
    assert.equal(element.classList.contains('is-over-control'), true);
});

test('the ring wraps a small control with a margin and the control\'s radius', t => {
    const { element, run, pointer, ring } = setup(t);
    pointer('pointermove', 'mouse');
    run();
    assert.equal(element.classList.contains('is-wrapping'), true);
    near(ring('width'), 108);
    near(ring('height'), 48);
    near(ring('rx'), 12);
    // The ring stays near the control's middle at x 70 while the dot is at 40.
    near(ring('x') + ring('width') / 2, 40 + (70 - 40) * 0.88);
});

test('the ring appears in place and then eases from control to control', t => {
    const { button, frames, run, pointer, ring } = setup(t);
    pointer('pointermove', 'mouse');
    run(1);
    near(ring('width'), 108);
    assert.equal(frames.size, 0);

    button.getBoundingClientRect = () => ({ left: 20, top: 20, width: 200, height: 40 });
    pointer('pointermove', 'mouse');
    run(2);
    assert.ok(ring('width') > 108 && ring('width') < 208);
    run();
    near(ring('width'), 208);
    assert.equal(frames.size, 0);
});

test('a large control that asks for it is wrapped on its edges', t => {
    const { button, element, run, pointer, ring } = setup(t);
    button.getBoundingClientRect = () => ({ left: 20, top: 20, width: 400, height: 200 });
    button.dataset.pointerWrap = '';
    pointer('pointermove', 'mouse', 80);
    run();
    assert.equal(element.classList.contains('is-wrapping'), true);
    near(ring('width'), 400);
    near(ring('height'), 200);
    // The ring lies still on the edges, wherever the dot is inside the control.
    near(ring('x'), 20);
    near(ring('y'), 20);
});

test('a large control keeps the round ring at the mouse position', t => {
    const { button, element, run, pointer, ring } = setup(t);
    button.getBoundingClientRect = () => ({ left: 20, top: 20, width: 400, height: 200 });
    pointer('pointermove', 'mouse', 80);
    run();
    assert.equal(element.classList.contains('is-over-control'), true);
    assert.equal(element.classList.contains('is-wrapping'), false);
    near(ring('width'), 34);
    near(ring('rx'), 17);
    near(ring('x') + ring('width') / 2, 80);
});

test('touch and pen input hide the pointer, cancel pending frames and allow a mouse to return', t => {
    const { frames, run, pointer, dot, shown } = setup(t);
    for (const input of ['touch', 'pen']) {
        pointer('pointermove', 'mouse');
        run();
        pointer('pointermove', 'mouse', 100);
        pointer('pointerdown', input);
        assert.equal(frames.size, 0);
        assert.equal(shown(), false);
    }
    pointer('pointermove', 'mouse', 120);
    run();
    assert.equal(shown(), true);
    assert.equal(dot('cx'), 120);
});

test('reduced motion leaves the native cursor active', t => {
    const { frames, pointer, shown } = setup(t, true);
    pointer('pointermove', 'mouse');
    assert.equal(frames.size, 0);
    assert.equal(shown(), false);
});

test('scrolling and page replacement refresh the control under a resting mouse', t => {
    const { window, button, element, run, pointer } = setup(t);
    pointer('pointermove', 'mouse');
    run();
    assert.equal(element.classList.contains('is-over-control'), true);

    document.elementFromPoint = () => document.body;
    window.dispatchEvent(new window.Event('scroll'));
    run();
    assert.equal(element.classList.contains('is-over-control'), false);

    document.elementFromPoint = () => button;
    document.dispatchEvent(new window.Event('portfolio:page-swapped'));
    run();
    assert.equal(element.classList.contains('is-over-control'), true);
});

test('a control that grows under a resting mouse takes the ring along', t => {
    const { button, frames, run, pointer, ring, resized } = setup(t);
    button.dataset.pointerWrap = '';
    pointer('pointermove', 'mouse');
    run();
    near(ring('height'), 40);
    assert.equal(frames.size, 0);

    button.getBoundingClientRect = () => ({ left: 20, top: 20, width: 100, height: 160 });
    resized(button);
    run();
    near(ring('height'), 160);

    // A control the pointer has left is no longer followed.
    document.elementFromPoint = () => document.body;
    pointer('pointermove', 'mouse');
    run();
    resized(button);
    assert.equal(frames.size, 0);
});

test('a press tightens the free ring until the button is released', t => {
    const { element, run, pointer, ring } = setup(t);
    document.elementFromPoint = () => document.body;
    pointer('pointermove', 'mouse');
    run();
    pointer('pointerdown', 'mouse');
    run();
    assert.equal(element.classList.contains('is-pressed'), true);
    near(ring('width'), 26);
    pointer('pointerup', 'mouse');
    run();
    assert.equal(element.classList.contains('is-pressed'), false);
    near(ring('width'), 34);
});

test('losing window focus cancels queued pointer updates', t => {
    const { window, frames, run, pointer, shown } = setup(t);
    pointer('pointermove', 'mouse');
    window.dispatchEvent(new window.Event('blur'));
    run();
    assert.equal(frames.size, 0);
    assert.equal(shown(), false);
});
