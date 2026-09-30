import assert from 'node:assert/strict';
import test from 'node:test';
import { createInteractionController } from '../../resources/js/interaction-controller.js';
import { createDom } from './dom.js';

const setup = (t, reducedMotion = false, withTrail = false) => {
    const window = createDom(t, `
        <div data-site-pointer-layer><div data-site-pointer></div></div>
        <button data-route="projects">Projects</button>
        ${withTrail ? '<svg><defs><linearGradient data-pointer-gradient="outer"></linearGradient></defs><path data-pointer-path="outer"></path></svg>' : ''}
    `);
    const globals = {
        getComputedStyle: window.getComputedStyle.bind(window),
    };

    for (const [name, value] of Object.entries(globals)) {
        const previous = Object.getOwnPropertyDescriptor(globalThis, name);
        Object.defineProperty(globalThis, name, { configurable: true, value });
        t.after(() => {
            if (previous) Object.defineProperty(globalThis, name, previous);
            else delete globalThis[name];
        });
    }

    // A touch-first device may report no fine pointer, even when mouse events arrive.
    window.matchMedia = () => ({ matches: false });
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
    const frame = () => {
        const pending = [...frames.values()];
        frames.clear();
        timestamp += 16;
        pending.forEach(callback => callback(timestamp));
    };
    const pointer = (type, pointerType, x = 40) => {
        const event = new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: 40 });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        button.dispatchEvent(event);
    };
    createInteractionController({ reducedMotion }).initialize();

    return { window, frames, frame, pointer };
};

test('mouse input enables the sticky cursor on a touch-first device', t => {
    const { pointer, frame } = setup(t);
    assert.equal(document.documentElement.classList.contains('has-site-pointer'), false);
    pointer('pointermove', 'mouse');
    frame();
    assert.equal(document.documentElement.classList.contains('has-site-pointer'), true);
    assert.equal(document.documentElement.classList.contains('has-mouse-input'), true);
    assert.equal(document.querySelector('[data-site-pointer]').style.getPropertyValue('--site-pointer-x'), '40px');
    const layer = document.querySelector('[data-site-pointer-layer]');
    assert.equal(layer.dataset.route, 'projects');
    assert.equal(layer.classList.contains('is-interactive'), true);
    assert.notEqual(layer.style.getPropertyValue('--pointer-ring-x'), '0px');
});

test('touch and pen input hide the cursor, cancel pending frames and allow a mouse to return', t => {
    const { pointer, frame, frames } = setup(t);
    for (const input of ['touch', 'pen']) {
        pointer('pointermove', 'mouse');
        frame();
        pointer('pointermove', 'mouse', 100);
        pointer('pointerdown', input);
        frame();
        assert.equal(frames.size, 0);
        assert.equal(document.documentElement.classList.contains('has-site-pointer'), false);
        assert.equal(document.documentElement.classList.contains('has-mouse-input'), false);
    }
    pointer('pointermove', 'mouse', 120);
    frame();
    assert.equal(document.documentElement.classList.contains('has-site-pointer'), true);
    assert.equal(document.querySelector('[data-site-pointer]').style.getPropertyValue('--site-pointer-x'), '120px');
});

test('reduced motion leaves the native cursor active', t => {
    const { pointer, frame, frames } = setup(t, true);
    pointer('pointermove', 'mouse');
    frame();
    assert.equal(frames.size, 0);
    assert.equal(document.documentElement.classList.contains('has-site-pointer'), false);
    assert.equal(document.documentElement.classList.contains('has-mouse-input'), true);
});

test('the sticky ring moves only slightly within the same control while the dot follows the mouse', t => {
    const { pointer, frame } = setup(t);
    const layer = document.querySelector('[data-site-pointer-layer]');
    pointer('pointermove', 'mouse', 40);
    frame();
    const before = Number.parseFloat(layer.style.getPropertyValue('--pointer-ring-x'));
    pointer('pointermove', 'mouse', 80);
    frame();
    const after = Number.parseFloat(layer.style.getPropertyValue('--pointer-ring-x'));
    assert.ok(after > before && after - before < 10);
    assert.equal(document.querySelector('[data-site-pointer]').style.getPropertyValue('--site-pointer-x'), '80px');
});

test('free cursor and glow use the latest mouse position without follow-up animation frames', t => {
    const { pointer, frame, frames } = setup(t);
    const surface = document.createElement('div');
    surface.dataset.pointerSurface = '';
    surface.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 });
    document.body.append(surface);
    document.elementFromPoint = () => surface;

    pointer('pointermove', 'mouse', 40);
    pointer('pointermove', 'mouse', 80);
    assert.equal(frames.size, 1);
    frame();

    const layer = document.querySelector('[data-site-pointer-layer]');
    assert.equal(layer.style.getPropertyValue('--pointer-ring-x'), '80px');
    assert.equal(layer.style.getPropertyValue('--pointer-ring-y'), '40px');
    assert.equal(document.querySelector('[data-site-pointer]').style.getPropertyValue('--site-pointer-x'), '80px');
    assert.equal(surface.style.getPropertyValue('--pointer-x'), '40%');
    assert.equal(surface.style.getPropertyValue('--pointer-y'), '40%');
    assert.equal(frames.size, 0);
});

test('scrolling and page replacement refresh the control under a stationary mouse', t => {
    const { window, pointer, frame, frames } = setup(t);
    const layer = document.querySelector('[data-site-pointer-layer]');
    pointer('pointermove', 'mouse');
    frame();
    assert.equal(layer.classList.contains('is-interactive'), true);

    document.elementFromPoint = () => document.body;
    window.dispatchEvent(new window.Event('scroll'));
    frame();
    assert.equal(layer.classList.contains('is-interactive'), false);
    assert.equal(layer.style.getPropertyValue('--pointer-ring-x'), '40px');

    document.elementFromPoint = () => document.querySelector('button');
    document.dispatchEvent(new window.Event('portfolio:page-swapped'));
    frame();
    assert.equal(layer.classList.contains('is-interactive'), true);
    assert.equal(frames.size, 0);
});

test('losing window focus cancels queued cursor updates', t => {
    const { window, pointer, frame, frames } = setup(t);
    pointer('pointermove', 'mouse');
    window.dispatchEvent(new window.Event('blur'));
    frame();
    assert.equal(frames.size, 0);
    assert.equal(document.documentElement.classList.contains('has-site-pointer'), false);
});

test('the decorative trail settles without moving or repeatedly updating the cursor', t => {
    const { pointer, frame, frames } = setup(t, false, true);
    document.elementFromPoint = () => document.body;
    pointer('pointermove', 'mouse', 40);
    frame();
    frame();
    assert.equal(frames.size, 0);

    const cursor = document.querySelector('[data-site-pointer]');
    const writes = t.mock.method(cursor.style, 'setProperty');
    pointer('pointermove', 'mouse', 240);
    frame();
    assert.equal(cursor.style.getPropertyValue('--site-pointer-x'), '240px');
    assert.equal(document.querySelector('[data-site-pointer-layer]').style.getPropertyValue('--pointer-ring-x'), '240px');
    const cursorWrites = writes.mock.callCount();
    frame();
    const trail = document.querySelector('[data-pointer-path]');
    const movingPath = trail.getAttribute('d');
    assert.ok(movingPath.includes('C'));
    assert.ok(frames.size > 0);
    for (let i = 0; i < 200 && frames.size; i++) frame();
    assert.equal(frames.size, 0);
    assert.notEqual(trail.getAttribute('d'), movingPath);
    assert.equal(writes.mock.callCount(), cursorWrites);
});

test('switching to touch clears the trail and mouse re-entry starts at the new position', t => {
    const { pointer, frame, frames } = setup(t, false, true);
    pointer('pointermove', 'mouse', 40);
    frame();
    frame();
    pointer('pointermove', 'mouse', 240);
    frame();
    frame();
    pointer('pointerdown', 'touch');
    const trail = document.querySelector('[data-pointer-path]');
    assert.equal(frames.size, 0);
    assert.equal(trail.hasAttribute('d'), false);
    pointer('pointermove', 'mouse', 500);
    frame();
    frame();
    assert.equal(frames.size, 0);
    assert.ok(trail.getAttribute('d').startsWith('M 500.00 40.00'));
});
