import assert from 'node:assert/strict';
import test from 'node:test';
import { createPointerController } from '../../resources/js/pointer-controller.js';
import { createDom } from './dom.js';

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `
        <div data-site-pointer></div>
        <button style="--pointer-accent-rgb: 1, 2, 3; border-top-left-radius: 12px">Projects</button>
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
    t.mock.method(window, 'requestAnimationFrame', callback => {
        frames.set(++frameId, callback);
        return frameId;
    });
    t.mock.method(window, 'cancelAnimationFrame', id => frames.delete(id));
    const frame = () => {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach(callback => callback(0));
    };
    const pointer = (type, pointerType, x = 40) => {
        const event = new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: 40 });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        button.dispatchEvent(event);
    };
    const element = document.querySelector('[data-site-pointer]');
    const value = name => element.style.getPropertyValue(`--pointer-${name}`);
    const shown = () => document.documentElement.classList.contains('has-site-pointer');
    createPointerController({ reducedMotion }).initialize();

    return { window, button, element, frames, frame, pointer, value, shown };
};

test('mouse input shows the pointer in the accent of the control underneath', t => {
    const { element, frame, pointer, value, shown } = setup(t);
    assert.equal(shown(), false);
    pointer('pointermove', 'mouse');
    frame();
    assert.equal(shown(), true);
    assert.equal(value('x'), '40px');
    assert.equal(value('accent').trim(), '1, 2, 3');
    assert.equal(value('ring-radius'), 'max(8px, 12px)');
    assert.equal(element.classList.contains('is-over-control'), true);
});

test('touch and pen input hide the pointer, cancel pending frames and allow a mouse to return', t => {
    const { frames, frame, pointer, value, shown } = setup(t);
    for (const input of ['touch', 'pen']) {
        pointer('pointermove', 'mouse');
        frame();
        pointer('pointermove', 'mouse', 100);
        pointer('pointerdown', input);
        frame();
        assert.equal(frames.size, 0);
        assert.equal(shown(), false);
    }
    pointer('pointermove', 'mouse', 120);
    frame();
    assert.equal(shown(), true);
    assert.equal(value('x'), '120px');
});

test('reduced motion leaves the native cursor active', t => {
    const { frames, pointer, shown } = setup(t, true);
    pointer('pointermove', 'mouse');
    assert.equal(frames.size, 0);
    assert.equal(shown(), false);
});

test('the ring stays with its control while the dot follows the mouse', t => {
    const { frame, pointer, value } = setup(t);
    pointer('pointermove', 'mouse', 40);
    frame();
    const before = Number.parseFloat(value('ring-x'));
    pointer('pointermove', 'mouse', 80);
    frame();
    const after = Number.parseFloat(value('ring-x'));
    assert.ok(after > before && after - before < 10);
    assert.equal(value('x'), '80px');
});

test('the ring wraps small controls and larger ones only on request', t => {
    const { button, element, frame, pointer, value } = setup(t);

    pointer('pointermove', 'mouse');
    frame();
    assert.equal(element.classList.contains('is-wrapping'), true);
    assert.equal(value('ring-width'), '108px');

    button.getBoundingClientRect = () => ({ left: 20, top: 20, width: 400, height: 200 });
    pointer('pointermove', 'mouse');
    frame();
    assert.equal(element.classList.contains('is-over-control'), true);
    assert.equal(element.classList.contains('is-wrapping'), false);

    button.dataset.pointerWrap = '';
    pointer('pointermove', 'mouse');
    frame();
    assert.equal(element.classList.contains('is-wrapping'), true);
    assert.equal(value('ring-height'), '208px');
});

test('the free pointer uses the latest mouse position in one animation frame', t => {
    const { element, frames, frame, pointer, value } = setup(t);
    document.elementFromPoint = () => document.body;

    pointer('pointermove', 'mouse', 40);
    pointer('pointermove', 'mouse', 80);
    assert.equal(frames.size, 1);
    frame();

    assert.equal(value('x'), '80px');
    assert.equal(value('ring-x'), '80px');
    assert.equal(value('ring-y'), '40px');
    assert.equal(element.classList.contains('is-wrapping'), false);
    assert.equal(frames.size, 0);
});

test('scrolling and page replacement refresh the control under a resting mouse', t => {
    const { window, button, element, frames, frame, pointer } = setup(t);
    pointer('pointermove', 'mouse');
    frame();
    assert.equal(element.classList.contains('is-over-control'), true);

    document.elementFromPoint = () => document.body;
    window.dispatchEvent(new window.Event('scroll'));
    frame();
    assert.equal(element.classList.contains('is-over-control'), false);

    document.elementFromPoint = () => button;
    document.dispatchEvent(new window.Event('portfolio:page-swapped'));
    frame();
    assert.equal(element.classList.contains('is-over-control'), true);
    assert.equal(frames.size, 0);
});

test('a press marks the pointer until the button is released', t => {
    const { element, frame, pointer } = setup(t);
    pointer('pointermove', 'mouse');
    frame();
    pointer('pointerdown', 'mouse');
    assert.equal(element.classList.contains('is-pressed'), true);
    pointer('pointerup', 'mouse');
    assert.equal(element.classList.contains('is-pressed'), false);
});

test('losing window focus cancels queued pointer updates', t => {
    const { window, frames, frame, pointer, shown } = setup(t);
    pointer('pointermove', 'mouse');
    window.dispatchEvent(new window.Event('blur'));
    frame();
    assert.equal(frames.size, 0);
    assert.equal(shown(), false);
});
