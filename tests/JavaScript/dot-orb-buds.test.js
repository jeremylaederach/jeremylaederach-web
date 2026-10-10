import assert from 'node:assert/strict';
import test from 'node:test';
import { createBuds } from '../../resources/js/dot-orb-buds.js';

const frame = 1 / 60;
// A stage with plenty of room on both sides of a sphere of radius 0.3, in units.
const wide = { below: 1.2, above: 1.2, radius: 0.3 };
// Lets the buds live from one moment to another.
const run = (buds, from, to, room, held = false) => {
    for (let seconds = from; seconds < to; seconds += frame) {
        buds.arrange(seconds, frame, room, held);
    }
};
// How far the far end of each bud is from the sphere's middle, in radii: 1 while it is inside.
const farEnds = (buds) => [0, 1].map((count) => {
    const place = { along: 0, around: 0, height: 0, ring: 0 };

    buds.division.place(count, place);

    return Math.abs(place.along);
});
// The length of the whole row of bodies along the axis, in radii: 2 for the whole sphere.
const length = (buds) => farEnds(buds)[0] + farEnds(buds)[1];
const close = (actual, expected, tolerance = 0.02) => assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
);

test('the sphere starts whole', () => {
    const buds = createBuds();

    run(buds, 0, 1, wide);

    farEnds(buds).forEach((end) => close(end, 1));
});

test('every press sheds one more bud, and a held press calls them back for a while', () => {
    const buds = createBuds();

    // One bud out: the sphere, the bud and the way it has drifted.
    buds.shed(0);
    run(buds, 0, 4, wide);
    assert.ok(length(buds) > 3 && length(buds) < 3.5);

    // Both out: three bodies in a row.
    buds.shed(4);
    run(buds, 4, 8, wide);
    assert.ok(length(buds) > 4);

    // Held for two seconds, both are back inside, and they stay there after the press.
    run(buds, 8, 10, wide, true);
    buds.settle(10);
    run(buds, 10, 13, wide);
    close(length(buds), 2);
});

test('a bud goes only as far as the stage has room', () => {
    // Room for 1.25 radii on each side: a bud parts a little and stays on its neck.
    const narrow = createBuds();

    narrow.shed(0);
    run(narrow, 0, 4, { below: 0.45, above: 0.45, radius: 0.3 });
    assert.ok(farEnds(narrow)[0] > 1.1 && farEnds(narrow)[0] < 1.27);

    // No room beyond the sphere itself: the bud stays inside.
    const none = createBuds();

    none.shed(0);
    run(none, 0, 4, { below: 0.36, above: 0.36, radius: 0.3 });
    close(farEnds(none)[0], 1);
});
