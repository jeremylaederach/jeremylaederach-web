import assert from 'node:assert/strict';
import test from 'node:test';
import { createSceneController, sceneChangedEvent } from '../../resources/js/scene-controller.js';
import { createDom } from './dom.js';

const setup = (t) => {
    createDom(t, `
        <ol>
            <li id="first-scene" data-scene data-active data-dot-orb-resting><a href="/elsewhere">Inside the first</a></li>
            <li id="second-scene" data-scene><a href="/there">Inside the second</a></li>
            <li id="third-scene" data-scene></li>
        </ol>
        <nav><a href="#first" aria-current="step">First</a><a href="#second">Second</a><a href="#third">Third</a></nav>
        <a href="#second" data-scene-next>Next <span data-scene-next-name>Second</span></a>
        <div id="first" data-scene-step="first-scene"></div>
        <div id="second" data-scene-step="second-scene"></div>
        <div id="third" data-scene-step="third-scene"></div>
    `);

    const observers = [];
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver');

    Object.defineProperty(globalThis, 'IntersectionObserver', {
        configurable: true,
        value: class {
            constructor(callback, options) {
                this.callback = callback;
                this.options = options;
                observers.push(this);
            }

            observe() {}

            disconnect() {}
        },
    });
    t.after(() => {
        if (previous) Object.defineProperty(globalThis, 'IntersectionObserver', previous);
        else delete globalThis.IntersectionObserver;
    });

    createSceneController().initialize();

    // The step with this id crosses the middle of the window.
    const cross = (id) => observers.at(-1).callback([{ isIntersecting: true, target: document.getElementById(id) }]);

    return { observers, cross };
};

test('the step that crosses the middle of the window shows its scene', (t) => {
    const { observers, cross } = setup(t);
    let announced = 0;

    document.addEventListener(sceneChangedEvent, () => {
        announced += 1;
    });

    assert.equal(observers.at(-1).options.rootMargin, '-50% 0px');

    cross('second');

    const [first, second] = document.querySelectorAll('[data-scene]');
    const next = document.querySelector('[data-scene-next]');

    assert.equal(first.hasAttribute('data-active'), false);
    assert.equal(first.hasAttribute('data-dot-orb-resting'), false);
    assert.equal(second.hasAttribute('data-active'), true);
    assert.equal(second.hasAttribute('data-dot-orb-resting'), true);
    assert.equal(document.querySelector('[href="#first"]').hasAttribute('aria-current'), false);
    assert.equal(document.querySelector('[href="#second"]').getAttribute('aria-current'), 'step');
    assert.equal(announced, 1);

    // The way on leads to the scene after the current one and is gone on the last.
    assert.equal(next.getAttribute('href'), '#third');
    assert.equal(next.querySelector('[data-scene-next-name]').textContent, 'Third');
    assert.equal(next.hasAttribute('aria-current'), false);

    cross('third');
    assert.equal(next.hidden, true);
});

test('a step that leaves the middle changes nothing by itself', (t) => {
    const { observers } = setup(t);

    observers.at(-1).callback([{ isIntersecting: false, target: document.getElementById('first') }]);

    assert.equal(document.getElementById('first-scene').hasAttribute('data-active'), true);
});

test('focusing a link of a scene that is not shown scrolls to its step', (t) => {
    setup(t);

    const scrolled = [];

    window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
        scrolled.push(this.id);
    };

    document.querySelector('#first-scene a').focus();
    document.querySelector('#second-scene a').focus();

    assert.deepEqual(scrolled, ['second']);
});

test('the steps are observed again after a page change', (t) => {
    const { observers } = setup(t);

    document.dispatchEvent(new window.Event('portfolio:page-swapped'));

    assert.equal(observers.length, 2);
});
