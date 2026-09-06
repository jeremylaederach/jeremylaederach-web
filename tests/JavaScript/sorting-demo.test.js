import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeSortingDemo } from '../../resources/js/playground/sorting-demo.js';
import { createDom } from './dom.js';

test('mixing during the last animation frame cannot be overwritten by the old sort', async (t) => {
    const window = createDom(t, `<article data-sorting-demo>
        <div data-sorting-stage><div data-sorting-plot></div></div>
        <span data-sorting-output></span><span data-sorting-status></span>
        <p data-sorting-description></p>
        <button data-sorting-algorithm="insertion" data-sorting-description="Insertion">Insertion</button>
        <button data-sorting-run>Start</button><button data-sorting-shuffle>Mix</button>
    </article>`);
    const pending = [];
    t.mock.method(window, 'setTimeout', (callback) => pending.push(callback));
    const random = t.mock.method(Math, 'random', () => 0.999);
    const root = document.querySelector('article');
    const cleanup = initializeSortingDemo(root, false);
    t.after(cleanup);
    root.querySelector('[data-sorting-run]').click();

    // Nine ordered values take eight comparisons. Stop before the last delay resolves.
    for (let index = 0; index < 7; index += 1) {
        pending.shift()();
        await Promise.resolve();
    }

    random.mock.mockImplementation(() => 0.2);
    root.querySelector('[data-sorting-shuffle]').click();
    const positions = () => [...root.querySelectorAll('[data-sorting-value]')]
        .map((bar) => bar.style.getPropertyValue('--bar-left'));
    const mixed = positions();
    pending.shift()();
    await Promise.resolve();

    assert.deepEqual(positions(), mixed);
    assert.equal(root.querySelector('.is-sorted'), null);
    assert.equal(root.querySelector('[data-sorting-output]').textContent, '0');
    assert.equal(root.querySelector('[data-sorting-run]').disabled, false);
});
