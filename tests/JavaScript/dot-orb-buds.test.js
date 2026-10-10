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

test('a bud leaves by itself, and a held press calls it back for a while', () => {
    const buds = createBuds();

    // The first bud sets out after seven seconds. At thirteen it is all the way out: the
    // sphere, the bud and the way it has drifted.
    run(buds, 0, 13, wide);
    assert.ok(length(buds) > 3 && length(buds) < 3.5);

    // Held for two seconds, it is back inside, and it stays there after the press.
    run(buds, 13, 15, wide, true);
    buds.settle(15);
    run(buds, 15, 18, wide);
    close(length(buds), 2);

    // Later the buds leave again; by then the second one has set out too.
    run(buds, 18, 27, wide);
    assert.ok(length(buds) > 2.5);
});

test('a bud goes only as far as the stage has room', () => {
    // Room for 1.25 radii on each side: a bud parts a little and stays on its neck.
    const narrow = createBuds();

    run(narrow, 0, 13, { below: 0.45, above: 0.45, radius: 0.3 });
    assert.ok(farEnds(narrow)[0] > 1.1 && farEnds(narrow)[0] < 1.27);

    // No room beyond the sphere itself: the bud stays inside.
    const none = createBuds();

    run(none, 0, 13, { below: 0.36, above: 0.36, radius: 0.3 });
    close(farEnds(none)[0], 1);
});
