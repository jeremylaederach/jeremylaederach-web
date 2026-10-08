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
    createDom(t, '<body data-page="home"><main data-page-main></main></body>');
    const root = document.documentElement;
    const leave = deferred();
    const enter = deferred();
    document.querySelector('[data-page-main]').getAnimations = () => [
        { finished: root.dataset.transition === 'leaving' ? leave.promise : enter.promise },
    ];
    const finished = [];
    document.addEventListener(transitionFinishedEvent, (event) => finished.push(event.detail.scene));
    return { root, leave, enter, finished, controller: createPageTransitionController({ reducedMotion }) };
};

test('leaving and entering follow animation completion rather than independent timers', async (t) => {
    const { controller, root, leave, enter, finished } = setup(t);
    let left = false;
    const leaving = controller.beginTransition().then(() => { left = true; });
    await new Promise(setImmediate);
    assert.equal(root.dataset.transition, 'leaving');
    assert.equal(left, false);
    leave.resolve();
    await leaving;
    const entering = controller.completeTransition('projects');
    assert.equal(root.dataset.transition, 'entering');
    assert.deepEqual(finished, []);
    enter.resolve();
    await entering;
    assert.equal(root.dataset.transition, undefined);
    assert.deepEqual(finished, ['projects']);
    assert.equal(controller.getScene(), 'projects');
});

test('a stale entrance cannot clear or announce a newer navigation', async (t) => {
    const { controller, root, leave, enter, finished } = setup(t);
    leave.resolve();
    await controller.beginTransition();
    const oldEntrance = controller.completeTransition('projects');
    await controller.beginTransition();
    enter.resolve();
    await oldEntrance;
    assert.equal(root.dataset.transition, 'leaving');
    assert.deepEqual(finished, []);
});

test('restoring a cached page clears the phase and invalidates pending work', async (t) => {
    const { controller, root, leave, finished } = setup(t);
    const leaving = controller.beginTransition();
    await new Promise(setImmediate);
    controller.reset('home');
    leave.resolve();
    await leaving;
    assert.equal(root.dataset.transition, undefined);
    assert.deepEqual(finished, ['home']);
});

test('reduced motion swaps without a phase', async (t) => {
    const { controller, root, finished } = setup(t, true);
    await controller.beginTransition();
    assert.equal(root.dataset.transition, undefined);
    await controller.completeTransition('about');
    assert.equal(root.dataset.transition, undefined);
    assert.deepEqual(finished, ['about']);
});

test('a case study belongs to the projects scene', async (t) => {
    const { controller, enter } = setup(t);
    enter.resolve();
    await controller.completeTransition('quantified');
    assert.equal(controller.getScene(), 'projects');
});
