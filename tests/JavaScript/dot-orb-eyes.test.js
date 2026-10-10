import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createEyes, markEyes } from '../../resources/js/dot-orb-eyes.js';

const close = (actual, expected, tolerance = 1e-3) => assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
);
const { middles, rim } = markEyes;

test('the eyes sit where the drawing of the mark leaves its holes', () => {
    const drawing = readFileSync(new URL('../../public/brand/mark.svg', import.meta.url), 'utf8');
    const side = Number(drawing.match(/viewBox="0 0 (\d+)/)[1]);
    // Each eye is a pill: it starts at the left end of its upper arc and runs down a straight side.
    const pills = [...drawing.matchAll(/M([\d.]+) ([\d.]+)a([\d.]+) [\d.]+ 0 0 1 [\d.]+ 0v([\d.]+)/g)];

    assert.equal(pills.length, 2);

    pills.forEach(([, x, y, radius, straight], index) => {
        close((Number(x) + Number(radius)) / side - 0.5, middles[index].x);
        close((Number(y) + Number(straight) / 2) / side - 0.5, middles[index].y);
        close(Number(radius) / side, rim.x);
        close((Number(radius) + Number(straight) / 2) / side, rim.y);
    });
});

test('each eye is a large dot that looks towards the pointer without leaving its hole', () => {
    const eyes = createEyes();

    // A pointer that has left the window: the dots rest in the middle of their holes.
    eyes.watch(2, 2, 0, 0).forEach((eye, index) => {
        close(eye.x, middles[index].x);
        close(eye.y, middles[index].y);
    });

    // A pointer far to the right and below, long before the first blink.
    eyes.watch(2, 2, 1, 0).forEach((eye, index) => {
        assert.ok(eye.x > middles[index].x + rim.x * 0.15);
        assert.ok(eye.y > middles[index].y + rim.y * 0.15);
        assert.ok(eye.x + eye.width <= middles[index].x + rim.x);
        assert.ok(eye.y + eye.height <= middles[index].y + rim.y);
    });

    // And one far to the left and above.
    eyes.watch(-2, -2, 1, 0).forEach((eye, index) => {
        assert.ok(eye.x - eye.width >= middles[index].x - rim.x);
        assert.ok(eye.y - eye.height >= middles[index].y - rim.y);
    });
});

test('a blink flattens the eyes and opens them again, without a jump from frame to frame', () => {
    const eyes = createEyes();
    const [open] = eyes.watch(0, 0, 0, 0).map((eye) => eye.height);
    const heights = [];

    for (let frame = 0; frame < 60 * 5; frame += 1) {
        heights.push(eyes.watch(0, 0, 0, frame / 60)[0].height);
    }

    const steps = heights.slice(1).map((height, frame) => Math.abs(height - heights[frame]));

    close(heights[60 * 2], open);
    assert.ok(Math.min(...heights) < open * 0.1);
    close(heights.at(-1), open);
    // No frame closes or opens the eye by more than a fifth of its height.
    assert.ok(Math.max(...steps) < open * 0.2);
});
