import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createEyes, markEyes } from '../../resources/js/dot-orb-eyes.js';

const close = (actual, expected, tolerance = 1e-3) => assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
);
const [left] = markEyes.middles;
const { rim } = markEyes;
// A point on the upper rim of the left eye, one beside it and one far from both eyes.
const above = { x: left.x, y: left.y - rim.y };
const beside = { x: left.x + rim.x, y: left.y };
const far = { x: 0.3, y: -0.3 };
const moved = (eyes, { x, y }) => {
    const into = { x: 0, y: 0 };

    eyes.move(x, y, into);

    return into;
};

test('the eyes sit where the drawing of the mark leaves its holes', () => {
    const drawing = readFileSync(new URL('../../public/brand/mark.svg', import.meta.url), 'utf8');
    const side = Number(drawing.match(/viewBox="0 0 (\d+)/)[1]);
    // Each eye is a pill: it starts at the left end of its upper arc and runs down a straight side.
    const pills = [...drawing.matchAll(/M([\d.]+) ([\d.]+)a([\d.]+) [\d.]+ 0 0 1 [\d.]+ 0v([\d.]+)/g)];

    assert.equal(pills.length, 2);

    pills.forEach(([, x, y, radius, straight], index) => {
        close((Number(x) + Number(radius)) / side - 0.5, markEyes.middles[index].x);
        close((Number(y) + Number(straight) / 2) / side - 0.5, markEyes.middles[index].y);
        close(Number(radius) / side, rim.x);
        close((Number(radius) + Number(straight) / 2) / side, rim.y);
    });
});

test('an eye follows the pointer and takes the dots at its rim along', () => {
    const eyes = createEyes();

    // A pointer far to the right and below, long before the first blink.
    eyes.watch(2, 2, 1, 0);

    assert.ok(moved(eyes, above).x > above.x + rim.x * 0.4);
    assert.ok(moved(eyes, above).y > above.y + rim.y * 0.2);
    assert.ok(moved(eyes, above).x < above.x + rim.x);
    assert.deepEqual(moved(eyes, far), far);

    // A pointer that has left the window lets the eyes rest.
    eyes.watch(2, 2, 0, 0);
    assert.deepEqual(moved(eyes, above), above);
});

test('a blink closes the eyes onto the line through their middle and opens them again', () => {
    const eyes = createEyes();
    // The lowest the upper rim gets between two moments, in steps of a frame.
    const lowest = (from, to) => {
        let level = -Infinity;

        for (let seconds = from; seconds < to; seconds += 1 / 60) {
            eyes.watch(0, 0, 0, seconds);
            level = Math.max(level, moved(eyes, above).y);
        }

        return level;
    };

    close(lowest(0, 2.5), above.y);
    close(lowest(2.5, 3), left.y, 0.01);
    assert.deepEqual(moved(eyes, beside), beside);

    eyes.watch(0, 0, 0, 3.2);
    close(moved(eyes, above).y, above.y);
});
