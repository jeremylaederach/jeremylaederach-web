import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createDefaultWalls,
    findGridPath,
    gridLayout,
} from '../../resources/js/playground/grid-pathfinder.js';
import {
    evaluateNetwork,
    networkScenarios,
    networkShape,
} from '../../resources/js/playground/network-model.js';
import { sortingAlgorithms } from '../../resources/js/playground/sorting-demo.js';

const comparisonCount = (frames) => frames.filter(
    (frame) => frame.type === 'compare',
).length;

test('every sorting algorithm produces the same ordered values', () => {
    const values = [8, 3, 6, 1, 7, 2, 5, 4];
    const expected = [...values].sort((left, right) => left - right);

    Object.entries(sortingAlgorithms).forEach(([name, createFrames]) => {
        const frames = createFrames(values);

        assert.deepEqual(
            frames.at(-1)?.values ?? values,
            expected,
            `${name} did not finish with an ordered list`,
        );
    });
});

test('bubble sort stops after one clean pass', () => {
    const frames = sortingAlgorithms.bubble([1, 2, 3, 4, 5]);

    assert.equal(comparisonCount(frames), 4);
});

test('merge sort counts only value-to-value comparisons', () => {
    const frames = sortingAlgorithms.merge([2, 1]);

    assert.equal(comparisonCount(frames), 1);
});

test('network scenarios produce stable, distinct classifications', () => {
    const newsletter = evaluateNetwork(networkScenarios.newsletter);
    const request = evaluateNetwork(networkScenarios.request);
    const phishing = evaluateNetwork(networkScenarios.phishing);

    assert.deepEqual(
        [newsletter.winner.index, request.winner.index, phishing.winner.index],
        [0, 1, 2],
    );

    [newsletter, request, phishing].forEach((pass) => {
        assert.deepEqual(pass.layers.map((layer) => layer.length), networkShape);
        assert.ok(Math.abs(
            pass.layers.at(-1).reduce((sum, value) => sum + value, 0) - 1,
        ) < Number.EPSILON * 10);
    });
});

test('Pathfinder finds an open route without crossing walls', () => {
    const walls = createDefaultWalls();
    const result = findGridPath({ walls });
    const key = (cell) => `${cell.column}:${cell.row}`;

    assert.deepEqual(result.path[0], gridLayout.start);
    assert.deepEqual(result.path.at(-1), gridLayout.goal);
    assert.ok(result.visited.length >= result.path.length);
    assert.ok(result.path.every((cell) => !walls.has(key(cell))));
});

test('Pathfinder reports when walls close every route', () => {
    const walls = new Set(
        Array.from({ length: gridLayout.rows }, (_, row) => `5:${row}`),
    );
    const result = findGridPath({ walls });

    assert.deepEqual(result.path, []);
    assert.ok(result.visited.length > 0);
});
