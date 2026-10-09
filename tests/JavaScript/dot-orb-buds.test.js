import assert from 'node:assert/strict';
import test from 'node:test';
import { createDivision } from '../../resources/js/dot-orb-buds.js';

const count = 1200;
const size = 300;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));
const createLattice = (length) => Array.from({ length }, (_, index) => {
    const y = 1 - (index / (length - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);

    return { x: Math.cos(index * goldenAngle) * ring, y, z: Math.sin(index * goldenAngle) * ring };
});
const lattice = createLattice(count);
const seats = [createLattice(size), createLattice(size), createLattice(size)];
const towards = (angle) => ({ x: Math.cos(angle), y: Math.sin(angle), z: 0 });
const along = (point, axis) => point.x * axis.x + point.y * axis.y + point.z * axis.z;
const inside = { out: 0, rising: true, axis: towards(0) };
const setup = () => {
    const division = createDivision(lattice, seats);
    const at = (index) => ({ x: division.at.x[index], y: division.at.y[index], z: division.at.z[index] });
    const dots = [...lattice.keys()];

    return {
        division,
        at,
        dots,
        members: (number) => dots.filter((index) => division.bud[index] === number),
        // The angle between two places on the sphere, in degrees.
        apart: (first, second) => (Math.acos(Math.min(along(first, second), 1)) * 180) / Math.PI,
    };
};

test('with every bud inside the sphere each dot sits on its own place', () => {
    const { division, at, dots, apart } = setup();

    division.follow([inside, inside, inside]);

    assert.ok(dots.every((index) => apart(at(index), lattice[index]) < 0.1));
    assert.ok(dots.every((index) => division.bud[index] === 0 && division.away[index] === 0));
});

test('a bud takes the dots nearest to where it leaves', () => {
    const { division, members } = setup();
    const axis = towards(0.3);

    division.follow([{ out: 0.5, rising: true, axis }, inside, inside]);

    const taken = members(1);
    const farthest = Math.min(...taken.map((index) => along(lattice[index], axis)));
    const left = lattice.filter((_, index) => division.bud[index] !== 1);

    assert.equal(taken.length, size);
    assert.ok(left.every((point) => along(point, axis) <= farthest));
    // A quarter of a sphere is the cap within 60 degrees of the axis.
    assert.ok(Math.abs(farthest - 0.5) < 0.02);
    assert.equal(new Set(taken.map((index) => division.seat[index])).size, size);
});

test('the tip of the cap leaves first and sits on the far side of the bud', () => {
    const { division, members } = setup();
    const axis = towards(0.3);

    division.follow([{ out: 0.5, rising: true, axis }, inside, inside]);

    const taken = members(1).sort((first, second) => along(lattice[second], axis) - along(lattice[first], axis));
    const tip = taken.slice(0, 30);
    const rim = taken.slice(-30);
    const mean = (indices, value) => indices.reduce((sum, index) => sum + value(index), 0) / indices.length;

    assert.ok(mean(tip, (index) => division.away[index]) > mean(rim, (index) => division.away[index]) + 0.3);
    assert.ok(mean(tip, (index) => along(seats[0][division.seat[index]], axis)) > 0.7);
    assert.ok(mean(rim, (index) => along(seats[0][division.seat[index]], axis)) < -0.7);
});

test('the dots that stay close over the place the bud left, each from nearby', () => {
    const { division, at, dots, apart } = setup();
    const axis = towards(0.3);

    division.follow([{ out: 0.5, rising: true, axis }, inside, inside]);
    division.follow([{ out: 1, rising: true, axis }, inside, inside]);

    const staying = dots.filter((index) => division.bud[index] === 0);
    const places = staying.map((index) => lattice.findIndex((point) => apart(point, at(index)) < 0.1));
    const moved = staying.map((index) => apart(lattice[index], at(index)));

    // They sit on every place but the ones dealt to the bud, one dot on each.
    assert.equal(new Set(places).size, count - size);
    assert.ok(places.every((place) => place >= 0 && place % 4 !== 1));
    // A dot at the rim of the cap travels its 60 degrees to the middle, the others less.
    assert.ok(Math.max(...moved) < 75);
    assert.ok(moved.reduce((sum, angle) => sum + angle, 0) / moved.length < 22);
});

test('a bud lands where it reaches the sphere, and the dots there make room', () => {
    const { division, at, dots, members, apart } = setup();
    const back = towards(2.4);

    division.follow([{ out: 0.5, rising: true, axis: towards(0.3) }, inside, inside]);
    division.follow([{ out: 1, rising: true, axis: towards(0.3) }, inside, inside]);

    const before = dots.map(at);

    division.follow([{ out: 0.5, rising: false, axis: back }, inside, inside]);

    const landing = members(1);

    division.follow([{ ...inside, axis: back }, inside, inside]);

    const nearest = Math.min(...landing.map((index) => along(at(index), back)));
    const others = dots.filter((index) => !landing.includes(index));

    assert.equal(members(1).length, 0);
    assert.ok(others.every((index) => along(at(index), back) <= nearest));
    assert.ok(others.every((index) => apart(before[index], at(index)) < 75));
    // Every place of the lattice holds one dot again.
    assert.equal(new Set(dots.map((index) => lattice.findIndex((point) => apart(point, at(index)) < 0.1))).size, count);
});

test('a second bud on the same side takes the nearest dots that are left', () => {
    const { division, dots, members } = setup();
    const first = { out: 1, rising: true, axis: towards(0.3) };
    const axis = towards(0.9);

    division.follow([{ ...first, out: 0.5 }, inside, inside]);
    division.follow([first, inside, inside]);
    division.follow([first, inside, { out: 0.5, rising: true, axis }]);

    assert.equal(members(1).length, size);
    assert.equal(members(3).length, size);
    assert.equal(dots.filter((index) => division.bud[index] === 0).length, count - 2 * size);
});

test('a bud first seen on its way back is out with its dots at once', () => {
    const { division, members } = setup();

    division.follow([inside, inside, { out: 0.4, rising: false, axis: towards(1) }]);

    assert.equal(members(3).length, size);
    assert.ok(members(3).some((index) => division.away[index] > 0.2));
});
