import assert from 'node:assert/strict';
import test from 'node:test';

import { gridIndexAfterKey } from '../../resources/js/playground/demo-utils.js';
import {
    digitTemplates,
    recognizeDigit,
} from '../../resources/js/playground/network-demo.js';
import {
    cellKey,
    createDefaultWalls,
    findPath,
    gridLayout,
    pathfindingModes,
} from '../../resources/js/playground/pathfinding-demo.js';
import { sortingAlgorithms } from '../../resources/js/playground/sorting-demo.js';

test('grid keyboard navigation moves by row and stops at the edges', () => {
    assert.equal(gridIndexAfterKey(6, 5, 5, 'ArrowRight'), 7);
    assert.equal(gridIndexAfterKey(6, 5, 5, 'ArrowDown'), 11);
    assert.equal(gridIndexAfterKey(0, 5, 5, 'ArrowLeft'), 0);
    assert.equal(gridIndexAfterKey(24, 5, 5, 'ArrowDown'), 24);
    assert.equal(gridIndexAfterKey(6, 5, 5, 'Enter'), null);
});

test('all five sorting algorithms produce the same ordered values', () => {
    const values = [8, 3, 6, 1, 7, 2, 5, 4];
    const expected = [...values].sort((left, right) => left - right);

    assert.deepEqual(Object.keys(sortingAlgorithms), [
        'quick',
        'merge',
        'insertion',
        'selection',
        'bubble',
    ]);

    Object.entries(sortingAlgorithms).forEach(([name, sort]) => {
        assert.deepEqual(sort(values).result, expected, `${name} did not sort the list`);
    });
    assert.deepEqual(values, [8, 3, 6, 1, 7, 2, 5, 4]);
});

test('sorting traces count comparisons independently from movements', () => {
    const bubble = sortingAlgorithms.bubble([1, 2, 3, 4, 5]);
    const merge = sortingAlgorithms.merge([2, 1]);

    assert.equal(bubble.comparisons, 4);
    assert.equal(bubble.frames.filter(({ type }) => type === 'move').length, 0);
    assert.equal(merge.comparisons, 1);
    assert.equal(merge.frames.filter(({ type }) => type === 'move').length, 1);
});

test('selection sort compares every remaining pair', () => {
    assert.equal(sortingAlgorithms.selection([4, 1, 3, 2]).comparisons, 6);
});

test('sorting traces preserve adaptive and fixed comparison behavior', () => {
    const ordered = [1, 2, 3, 4, 5];
    const reversed = [...ordered].reverse();

    assert.equal(sortingAlgorithms.insertion(ordered).comparisons, 4);
    assert.equal(sortingAlgorithms.insertion(reversed).comparisons, 10);
    assert.equal(sortingAlgorithms.bubble(ordered).comparisons, 4);
    assert.equal(sortingAlgorithms.bubble(reversed).comparisons, 10);
    assert.equal(sortingAlgorithms.selection(ordered).comparisons, 10);
    assert.equal(sortingAlgorithms.selection(reversed).comparisons, 10);
    assert.equal(sortingAlgorithms.quick(ordered).comparisons, 10);
});

test('each digit template is recognized with a normalized confidence', () => {
    Object.entries(digitTemplates).forEach(([digit, pixels]) => {
        const result = recognizeDigit([...pixels]);

        assert.equal(result.digit, digit);
        assert.ok(result.confidence > 0.9);
        assert.ok(Math.abs(
            result.probabilities.reduce((total, value) => total + value, 0) - 1,
        ) < Number.EPSILON * 10);
    });
});

test('the digit recognizer tolerates one changed pixel', () => {
    const roughTwo = [...digitTemplates[2]];

    roughTwo[0] = 1;

    assert.equal(recognizeDigit(roughTwo).digit, '2');
});

test('the digit recognizer rejects malformed input', () => {
    assert.throws(() => recognizeDigit([0, 1]), /25 zeros or ones/);
});

test('every Pathfinder mode returns a connected route around walls', () => {
    const walls = createDefaultWalls();

    pathfindingModes.forEach((mode) => {
        const result = findPath({ mode, walls });

        assert.deepEqual(result.path[0], gridLayout.start);
        assert.deepEqual(result.path.at(-1), gridLayout.goal);
        assert.equal(result.steps, result.path.length - 1);
        assert.ok(result.visited.length >= result.path.length);
        assert.ok(result.path.every((cell) => !walls.has(cellKey(cell))));
        assert.ok(result.path.slice(1).every((cell, index) => (
            Math.abs(cell.column - result.path[index].column)
            + Math.abs(cell.row - result.path[index].row) === 1
        )));
    });
});

test('guided Pathfinder stays shortest while checking fewer cells', () => {
    const shortest = findPath({ mode: 'shortest' });
    const guided = findPath({ mode: 'guided' });

    assert.equal(guided.steps, shortest.steps);
    assert.ok(guided.visited.length < shortest.visited.length);
});

test('straight Pathfinder trades steps for fewer turns on the demo map', () => {
    const shortest = findPath({ mode: 'shortest' });
    const straight = findPath({ mode: 'straight' });

    assert.ok(straight.turns < shortest.turns);
    assert.ok(straight.steps > shortest.steps);
});

test('every Pathfinder mode reports a closed route', () => {
    const walls = new Set(
        Array.from({ length: gridLayout.rows }, (_, row) => `5:${row}`),
    );

    pathfindingModes.forEach((mode) => {
        const result = findPath({ mode, walls });

        assert.deepEqual(result.path, []);
        assert.equal(result.steps, 0);
        assert.ok(result.visited.length > 0);
    });
});

test('Pathfinder rejects unknown modes', () => {
    assert.throws(
        () => findPath({ mode: 'teleport' }),
        /Unknown pathfinding mode/,
    );
});

test('Pathfinder rejects invalid grid input', () => {
    assert.throws(() => findPath({ columns: 0 }), /positive integers/);
    assert.throws(
        () => findPath({ start: { column: -1, row: 0 } }),
        /inside the grid/,
    );
    assert.throws(() => findPath({ walls: [] }), /walls must be a Set/);
});

test('Pathfinder keeps both endpoints open without mutating the walls', () => {
    const walls = new Set([cellKey(gridLayout.start), cellKey(gridLayout.goal)]);
    const result = findPath({ walls });

    assert.deepEqual(result.path[0], gridLayout.start);
    assert.deepEqual(result.path.at(-1), gridLayout.goal);
    assert.equal(walls.size, 2);
});
