import assert from 'node:assert/strict';
import test from 'node:test';
import { chapterChangedEvent, createChapterController } from '../../resources/js/chapter-controller.js';
import { createDom } from './dom.js';

test('the chapter that crosses the middle of the window is the one the sphere rests with', (t) => {
    createDom(t, `
        <section data-chapter data-dot-orb-resting></section>
        <section data-chapter></section>
    `);

    const [first, second] = document.querySelectorAll('[data-chapter]');
    const observed = [];
    let report;
    let settings;
    let announced = 0;

    globalThis.IntersectionObserver = class {
        constructor(callback, options) {
            report = callback;
            settings = options;
        }

        observe(element) {
            observed.push(element);
        }

        disconnect() {}
    };
    t.after(() => delete globalThis.IntersectionObserver);
    document.addEventListener(chapterChangedEvent, () => {
        announced += 1;
    });

    createChapterController().initialize();

    // The observed area is a line across the middle of the window.
    assert.equal(settings.rootMargin, '-50% 0px');
    assert.deepEqual(observed, [first, second]);

    report([{ isIntersecting: false, target: first }, { isIntersecting: true, target: second }]);

    assert.equal(first.hasAttribute('data-dot-orb-resting'), false);
    assert.equal(second.hasAttribute('data-dot-orb-resting'), true);
    assert.equal(announced, 1);

    // A chapter that only leaves the middle keeps the last one current.
    report([{ isIntersecting: false, target: second }]);

    assert.equal(second.hasAttribute('data-dot-orb-resting'), true);
    assert.equal(announced, 1);
});
