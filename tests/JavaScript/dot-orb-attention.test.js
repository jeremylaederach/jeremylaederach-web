import assert from 'node:assert/strict';
import test from 'node:test';
import { createAttention } from '../../resources/js/dot-orb-attention.js';
import { createDom } from './dom.js';

const setup = (t) => {
    const window = createDom(t, '<main></main>');
    const attention = createAttention();
    // The pointer arrives at a place, `at` milliseconds after the page opened.
    const move = (clientX, clientY, at) => {
        const event = new window.MouseEvent('pointermove', { clientX, clientY });

        Object.defineProperty(event, 'timeStamp', { value: at });
        window.dispatchEvent(event);
    };

    return { window, attention, move };
};

test('a pointer on its way has a heading that fades once it rests', (t) => {
    const { attention, move } = setup(t);

    move(100, 100, 1000);
    move(116, 100, 1016);
    move(132, 100, 1032);

    const moving = attention.read(0.016);

    // 16 pixels in 16 milliseconds are 1000 pixels a second, to the right.
    assert.ok(moving.headingX > 500 && moving.headingX <= 1000);
    assert.ok(Math.abs(moving.headingY) < 1);

    const resting = attention.read(1);

    assert.ok(Math.abs(resting.headingX) < 5);
});

test('a pointer that appears somewhere else has no heading', (t) => {
    const { attention, move } = setup(t);

    move(100, 100, 1000);
    move(900, 500, 4000);

    assert.equal(attention.read(0.016).headingX, 0);
});

test('the speed of scrolling follows the page and fades when it stops', (t) => {
    const { window, attention } = setup(t);

    for (let frame = 1; frame <= 30; frame += 1) {
        window.scrollY = frame * 20;
        attention.read(0.016);
    }

    // 20 pixels in every frame of 16 milliseconds are 1250 pixels a second.
    assert.ok(Math.abs(attention.read(0).scrolling - 1250) < 60);

    for (let frame = 0; frame < 30; frame += 1) {
        attention.read(0.016);
    }

    assert.ok(Math.abs(attention.read(0).scrolling) < 15);
});

test('a visitor is back with the first sign after a pause of twenty seconds', (t) => {
    const { attention, move } = setup(t);

    move(100, 100, 1000);
    assert.equal(attention.read(5).returned, false);

    move(120, 100, 6000);
    assert.equal(attention.read(21).returned, false);

    move(140, 100, 27000);
    assert.equal(attention.read(0.016).returned, true);
    assert.equal(attention.read(0.016).returned, false);
});
