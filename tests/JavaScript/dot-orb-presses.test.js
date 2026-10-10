import assert from 'node:assert/strict';
import test from 'node:test';
import { createPresses } from '../../resources/js/dot-orb-presses.js';

// Where a dot at this distance right of the origin ends up.
const moved = (presses, x) => {
    const dot = { x, y: 0 };

    presses.disturb(dot);

    return dot.x;
};
const run = (presses, seconds) => {
    for (let frame = 0; frame < seconds * 60; frame += 1) {
        presses.step(1 / 60);
    }
};

test('a ring pushes the dots outwards where its front passes, and fades', () => {
    const presses = createPresses();

    presses.ring(0, 0, 1);
    run(presses, 0.2);

    // After a fifth of a second the front is 0.3 units out.
    assert.ok(moved(presses, 0.3) > 0.34);
    assert.ok(Math.abs(moved(presses, 0.9) - 0.9) < 0.001);

    run(presses, 1);
    assert.equal(moved(presses, 0.3), 0.3);
});

test('a held press pulls the dots within its reach in and lets them go with a ring', () => {
    const presses = createPresses();

    presses.begin({ x: 0, y: 0 });
    assert.equal(presses.held(), true);

    // Long enough for the ring of the press itself to have gone.
    run(presses, 1.5);
    assert.ok(moved(presses, 0.2) < 0.12);
    assert.equal(moved(presses, 0.6), 0.6);

    // A held press follows the pointer.
    presses.move({ x: 1, y: 0 });
    assert.ok(moved(presses, 0.8) > 0.86);

    presses.end();
    assert.equal(presses.held(), false);

    // Its end sends a ring from where the press was, stronger than a click's: after 0.6
    // seconds the pull has gone, the front is 0.9 units out and a click's would push by 0.03.
    run(presses, 0.6);
    assert.ok(moved(presses, 1.9) > 1.9 + 0.05);
});
