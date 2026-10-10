import assert from 'node:assert/strict';
import test from 'node:test';
import { pairInStrips } from '../../resources/js/dot-orb-pairing.js';

// A square grid of points, `side` by `side`, around a middle.
const grid = (side, middleX = 0, middleY = 0, width = 1) => Array.from({ length: side * side }, (_, index) => ({
    x: middleX + ((index % side) / (side - 1) - 0.5) * width,
    y: middleY + (Math.floor(index / side) / (side - 1) - 0.5) * width,
}));

// The same points in an order that has nothing to do with where they lie.
const shuffled = (points) => points
    .map((point, index) => ({ point, key: (index * 7919) % points.length }))
    .sort((first, second) => first.key - second.key)
    .map(({ point }) => point);

test('every point gets a partner of its own', () => {
    const from = shuffled(grid(20));
    const partners = pairInStrips(from, shuffled(grid(20, 3, 1)));

    assert.equal(new Set(partners).size, from.length);
});

test('a shape that only moves keeps every point beside its neighbours', () => {
    const from = shuffled(grid(20));
    const to = shuffled(grid(20, 3, 1));
    const partners = pairInStrips(from, to);

    // Every point travels the same way, so no two of them cross.
    from.forEach((point, index) => {
        assert.ok(Math.abs(to[partners[index]].x - point.x - 3) < 1e-9);
        assert.ok(Math.abs(to[partners[index]].y - point.y - 1) < 1e-9);
    });
});

test('a shape that becomes wider and lower keeps left on the left and top on top', () => {
    const from = shuffled(grid(20));
    const to = shuffled(Array.from({ length: 400 }, (_, index) => ({
        x: ((index % 40) / 39 - 0.5) * 4,
        y: (Math.floor(index / 40) / 9 - 0.5) * 0.5,
    })));
    const partners = pairInStrips(from, to);
    const moved = from.map((point, index) => ({ from: point, to: to[partners[index]] }));
    const leftmost = moved.filter(({ from: point }) => point.x < -0.4);
    const top = moved.filter(({ from: point }) => point.y < -0.4);

    assert.ok(leftmost.every(({ to: point }) => point.x < 0));
    assert.ok(top.every(({ to: point }) => point.y < 0));
});
