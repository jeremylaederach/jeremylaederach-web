import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageTransitionController, transitionFinishedEvent } from '../../resources/js/transition-controller.js';
import { createDom } from './dom.js';

const deferred = () => {
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    return { promise, resolve };
};

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `<body data-page="home">
        <div data-page-transition data-phase="idle">
            <div data-transition-surface><strong data-transition-label></strong></div>
        </div></body>`);
    t.mock.method(window, 'requestAnimationFrame', (callback) => { queueMicrotask(callback); return 1; });
    const overlay = document.querySelector('[data-page-transition]');
    const surface = document.querySelector('[data-transition-surface]');
    const cover = deferred();
    const reveal = deferred();
    surface.getAnimations = () => [{ finished: overlay.dataset.phase === 'covering' ? cover.promise : reveal.promise }];
    const finished = [];
    document.addEventListener(transitionFinishedEvent, (event) => finished.push(event.detail.scene));
    return { overlay, cover, reveal, finished, controller: createPageTransitionController({ reducedMotion }) };
};

test('cover and reveal follow animation completion rather than independent timers', async (t) => {
    const { controller, overlay, cover, reveal, finished } = setup(t);
    const covering = controller.beginTransition('projects');
    await new Promise(setImmediate);
    assert.equal(overlay.dataset.phase, 'covering');
    cover.resolve();
    await covering;
    assert.equal(overlay.dataset.phase, 'covered');
    const revealing = controller.completeTransition('projects');
    assert.equal(overlay.dataset.phase, 'revealing');
    assert.deepEqual(finished, []);
    reveal.resolve();
    await revealing;
    assert.equal(overlay.dataset.phase, 'idle');
    assert.deepEqual(finished, ['projects']);
});

test('a stale reveal cannot clear or announce a newer navigation', async (t) => {
    const { controller, overlay, cover, reveal, finished } = setup(t);
    cover.resolve();
    await controller.beginTransition('projects');
    const oldReveal = controller.completeTransition('projects');
    await controller.beginTransition('contact', { transitionLabel: 'Contact' });
    reveal.resolve();
    await oldReveal;
    assert.equal(overlay.dataset.phase, 'covered');
    assert.equal(overlay.dataset.route, 'contact');
    assert.deepEqual(finished, []);
});

test('restoring a cached page clears the overlay and invalidates pending work', async (t) => {
    const { controller, overlay, cover, finished } = setup(t);
    const covering = controller.beginTransition('projects');
    await new Promise(setImmediate);
    controller.reset('home');
    cover.resolve();
    await covering;
    assert.equal(overlay.dataset.phase, 'idle');
    assert.equal(overlay.dataset.route, undefined);
    assert.deepEqual(finished, ['home']);
});

test('reduced motion swaps without a cover animation', async (t) => {
    const { controller, overlay, finished } = setup(t, true);
    await controller.beginTransition('about');
    await controller.completeTransition('about');
    assert.equal(overlay.dataset.phase, 'idle');
    assert.deepEqual(finished, ['about']);
});
