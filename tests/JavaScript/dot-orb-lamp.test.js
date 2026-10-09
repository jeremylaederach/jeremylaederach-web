import assert from 'node:assert/strict';
import test from 'node:test';
import { settle } from '../../resources/js/dot-orb-lamp.js';

const from = (point, blob) => Math.hypot(point.x - blob.x, point.y - blob.y, point.z);
const close = (actual, expected, tolerance = 0.002) => assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
);

test('a point on the surface of a blob on its own stays where it is', () => {
    const blob = { x: 1, y: 1, radius: 0.3 };
    const point = { x: 1.3, y: 1, z: 0 };

    settle(point, [blob]);

    close(from(point, blob), 0.3);
    close(point.y, 1);
});

test('a point inside or just outside a blob moves onto its surface', () => {
    const blob = { x: 0, y: 0, radius: 0.3 };
    const inside = { x: 0.1, y: 0.05, z: 0.02 };
    const outside = { x: 0, y: 0.4, z: 0 };

    settle(inside, [blob], { steps: 12 });
    settle(outside, [blob], { steps: 12 });

    close(from(inside, blob), 0.3);
    close(from(outside, blob), 0.3);
    // It leaves along the way it already pointed.
    close(inside.y / inside.x, 0.5, 0.01);
});

test('blobs that are far apart stay spheres', () => {
    const blob = { x: 0, y: 0, radius: 0.3 };
    const other = { x: 1.2, y: 0, radius: 0.15 };
    const point = { x: 0.3, y: 0, z: 0 };

    settle(point, [blob, other]);

    close(point.x, 0.3);
});

test('a blob bulges towards a neighbour that comes close', () => {
    const blob = { x: 0, y: 0, radius: 0.3 };
    const other = { x: 0.52, y: 0, radius: 0.15 };
    // On the surface of the blob, a little beside the line to its neighbour.
    const facing = { x: 0.3 * Math.cos(0.35), y: 0.3 * Math.sin(0.35), z: 0 };
    const averted = { x: -0.3, y: 0, z: 0 };

    settle(facing, [blob, other], { steps: 12 });
    settle(averted, [blob, other]);

    assert.ok(from(facing, blob) > 0.305);
    close(averted.x, -0.3);
});

test('where two blobs overlap, a point of one inside the other moves out onto their joint surface', () => {
    const blob = { x: 0, y: 0, radius: 0.3 };
    const other = { x: 0.34, y: 0, radius: 0.15 };
    // On the surface of the first blob and well inside the second.
    const point = { x: 0.3 * Math.cos(0.2), y: 0.3 * Math.sin(0.2), z: 0 };

    assert.ok(from(point, other) < 0.15);

    settle(point, [blob, other], { steps: 12 });

    assert.ok(from(point, blob) > 0.3);
    assert.ok(from(point, other) > 0.15);
    // It stays at the waist between the two instead of leaving for the far side.
    assert.ok(point.x > 0.1 && point.x < 0.34);
});
