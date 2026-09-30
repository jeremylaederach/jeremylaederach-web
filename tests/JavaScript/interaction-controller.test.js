import assert from 'node:assert/strict';
import test from 'node:test';
import { createInteractionController } from '../../resources/js/interaction-controller.js';
import { createDom } from './dom.js';

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `
        <div data-site-pointer-layer><div data-site-pointer></div></div>
        <button data-route="projects">Projects</button>
    `);
    const globals = {
        getComputedStyle: window.getComputedStyle.bind(window),
        SVGPathElement: window.SVGElement,
        SVGLinearGradientElement: window.SVGElement,
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
    t.mock.method(window, 'requestAnimationFrame', callback => {
        frames.set(++frameId, callback);
        return frameId;
    });
    t.mock.method(window, 'cancelAnimationFrame', id => frames.delete(id));
    const frame = () => {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach(callback => callback(16));
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
});

test('losing window focus cancels queued cursor updates', t => {
    const { window, pointer, frame, frames } = setup(t);
    pointer('pointermove', 'mouse');
    window.dispatchEvent(new window.Event('blur'));
    frame();
    assert.equal(frames.size, 0);
    assert.equal(document.documentElement.classList.contains('has-site-pointer'), false);
});
