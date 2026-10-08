import assert from 'node:assert/strict';
import test from 'node:test';
import { createInteractionController } from '../../resources/js/interaction-controller.js';
import { createDom } from './dom.js';

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `
        <button data-interface-sound data-sound-tone="navigation">Projects</button>
        <section data-reveal></section>
    `);
    const button = document.querySelector('button');
    const pointer = (type, pointerType) => {
        const event = new window.MouseEvent(type, { bubbles: true });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        button.dispatchEvent(event);
    };
    createInteractionController({ reducedMotion }).initialize();

    return { window, button, pointer };
};

const hasMouseInput = () => document.documentElement.classList.contains('has-mouse-input');

test('hover styles follow the pointer type of the last event', t => {
    const { pointer } = setup(t);
    pointer('pointermove', 'mouse');
    assert.equal(hasMouseInput(), true);

    for (const input of ['touch', 'pen']) {
        pointer('pointerdown', input);
        assert.equal(hasMouseInput(), false);
        pointer('pointermove', 'mouse');
        assert.equal(hasMouseInput(), true);
    }
});

test('reduced motion keeps hover styles and reveals every section at once', t => {
    const { pointer } = setup(t, true);
    pointer('pointermove', 'mouse');
    assert.equal(hasMouseInput(), true);
    assert.equal(document.querySelector('[data-reveal]').classList.contains('is-visible'), true);
});

test('entering or focusing a sounding control announces its tone', t => {
    const { window, button } = setup(t);
    const tones = [];
    document.addEventListener('interface-hover', event => tones.push(event.detail.tone));

    button.dispatchEvent(new window.MouseEvent('pointerover', { bubbles: true }));
    button.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }));
    assert.deepEqual(tones, ['navigation', 'navigation']);
});
