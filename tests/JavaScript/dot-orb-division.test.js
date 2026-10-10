import assert from 'node:assert/strict';
import test from 'node:test';
import { createDivision } from '../../resources/js/dot-orb-division.js';

const first = 0.18;
const last = 0.12;
const counts = Array.from({ length: 400 }, (_, index) => (index + 0.5) / 400);
const close = (actual, expected, tolerance = 1e-6) => assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
);
// Where every dot lies for buds that are this far out and have drifted this far.
const shape = (firstOut, firstGap, lastOut, lastGap) => {
    const division = createDivision({ first, last });

    division.arrange(firstOut, firstGap, lastOut, lastGap);

    return counts.map((count) => {
        const place = { along: 0, around: 0, height: 0, ring: 0 };

        division.place(count, place);

        return { count, ...place };
    });
};
// The sphere a set of places lies on: its middle on the axis and its radius.
const sphereOf = (places) => {
    const top = Math.max(...places.map(({ along }) => along));
    const bottom = Math.min(...places.map(({ along }) => along));

    return { middle: (top + bottom) / 2, radius: Math.max(...places.map(({ around }) => around)) };
};

test('with both buds inside the sphere is whole', () => {
    for (const { count, along, around } of shape(0, 0, 0, 0)) {
        close(along, 1 - 2 * count);
        close(Math.hypot(along, around), 1);
    }
});

test('a bud that has parted is a sphere of its own that touches the body', () => {
    const places = shape(1, 0, 0, 0);
    const budPlaces = places.filter(({ count }) => count < first);
    const bodyPlaces = places.filter(({ count }) => count > first);
    const bud = sphereOf(budPlaces);
    const body = sphereOf(bodyPlaces);

    // Each is as large as its dots need to lie as close as on the whole sphere.
    close(bud.radius, Math.sqrt(first), 0.01);
    close(body.radius, Math.sqrt(1 - first), 0.01);
    close(bud.middle - body.middle, bud.radius + body.radius, 0.02);
    assert.ok(budPlaces.every(({ along, around }) => Math.abs(Math.hypot(along - bud.middle, around) - bud.radius) < 0.02));
    assert.ok(bodyPlaces.every(({ along, around }) => Math.abs(Math.hypot(along - body.middle, around) - body.radius) < 0.02));
    // What leaves on one side moves the body a little to the other: their common middle stays.
    close(first * bud.middle + (1 - first) * body.middle, 0, 0.02);
});

test('while a bud parts the body stays closed and its neck thins', () => {
    const neck = (out) => {
        const places = shape(out, 0, 0, 0);
        const before = places.findLast(({ count }) => count < first);
        const after = places.find(({ count }) => count > first);

        // The dots on either side of the cut stay neighbours.
        assert.ok(Math.hypot(before.along - after.along, before.around - after.around) < 0.08);

        return (before.around + after.around) / 2;
    };

    assert.ok(neck(0.25) > neck(0.5));
    assert.ok(neck(0.5) > neck(0.75));
    assert.ok(neck(1) < 0.12);
});

test('no dot ever passes another along the axis', () => {
    for (const [firstOut, lastOut] of [[0.3, 0], [0.7, 0.4], [1, 1], [0, 0.6]]) {
        const places = shape(firstOut, firstOut * 0.4, lastOut, lastOut * 0.4);

        places.slice(1).forEach(({ along }, index) => assert.ok(along < places[index].along));
    }
});

test('with both buds out there are three spheres in a row that do not reach into each other', () => {
    const places = shape(1, 0.3, 1, 0.2);
    const firstBud = sphereOf(places.filter(({ count }) => count < first));
    const body = sphereOf(places.filter(({ count }) => count > first && count < 1 - last));
    const lastBud = sphereOf(places.filter(({ count }) => count > 1 - last));

    close(firstBud.middle - body.middle, firstBud.radius + body.radius + 0.3, 0.03);
    close(body.middle - lastBud.middle, body.radius + lastBud.radius + 0.2, 0.03);
});

test('a bud needs the room it says it does', () => {
    const division = createDivision({ first, last });
    const lowest = Math.max(...shape(1, 0, 0, 0).map(({ along }) => along));
    const highest = Math.min(...shape(0, 0, 1, 0).map(({ along }) => along));

    close(division.reach.first, lowest, 0.01);
    close(division.reach.last, -highest, 0.01);
});

test('a dot belongs to a bud as far as that bud has parted', () => {
    const half = shape(0.5, 0, 0, 0);
    const out = shape(1, 0, 1, 0);

    for (const { count, first: withFirst, last: withLast } of half) {
        close(withFirst, count < first ? 0.5 : 0);
        close(withLast, 0);
    }

    for (const { count, first: withFirst, last: withLast } of out) {
        close(withFirst, count < first ? 1 : 0);
        close(withLast, count > 1 - last ? 1 : 0);
    }
});

test('the middle of a bud that is out is the middle of its sphere', () => {
    const division = createDivision({ first, last });
    const places = shape(1, 0.3, 1, 0.2);

    division.arrange(1, 0.3, 1, 0.2);

    close(division.middleOf(0), sphereOf(places.filter(({ count }) => count < first)).middle, 0.01);
    close(division.middleOf(1), sphereOf(places.filter(({ count }) => count > 1 - last)).middle, 0.01);
});
