import assert from 'node:assert/strict';
import test from 'node:test';
import { createShow } from '../../resources/js/dot-orb-show.js';
import { createDom } from './dom.js';

// Two figures of one point each; what matters here is which of them is due.
const figures = new Map([['one', [{ x: 0, y: 0, half: 0 }]], ['two', [{ x: 0.1, y: 0, half: 0 }]]]);
const shownIn = (selector) => document.querySelector(selector).hasAttribute('data-dot-orb-shown');

test('an element that names several figures shows one after the other, and a press moves on', (t) => {
    createDom(t, `
        <main data-page-main>
            <a id="row" data-dot-orb-figure="one two unknown" data-dot-orb-resting>
                <span id="tag" data-dot-orb-figure="two">Two</span>
            </a>
        </main>
    `);

    const show = createShow({ figures });

    // The figure the page names without being known is left out.
    show.turnTo(null, 0);
    assert.equal(show.current(0).name, 'one');
    assert.equal(shownIn('#tag'), false);

    // After its time the next one is due, and what names it inside the row is marked.
    assert.equal(show.current(8.5).name, 'two');
    assert.equal(shownIn('#tag'), true);

    show.press(9);
    assert.equal(show.current(9).name, 'one');
    assert.equal(shownIn('#tag'), false);
    assert.equal(show.source(), document.querySelector('#row'));
});

test('a press on a single figure gives way to the plain sphere until the next press', (t) => {
    createDom(t, '<main data-page-main><a id="link" data-dot-orb-figure="one">One</a></main>');

    const show = createShow({ figures });

    show.turnTo(document.querySelector('#link'), 0);
    assert.equal(show.hovered(), true);
    assert.equal(show.current(1).name, 'one');

    show.press(1);
    assert.equal(show.current(2), null);
    assert.equal(show.current(9.5).name, 'one');

    show.press(10);
    show.press(11);
    assert.equal(show.current(11).name, 'one');
});

test('a press on the plain sphere shows the next figure its stage lists, and its word lights up', (t) => {
    createDom(t, `
        <main data-page-main>
            <div data-dot-orb-stage data-dot-orb-presses="one two"></div>
            <span id="first" data-dot-orb-figure="one">First</span>
            <span id="second" data-dot-orb-figure="two">Second</span>
        </main>
    `);

    const show = createShow({ figures });

    show.enter(document.querySelector('[data-dot-orb-stage]'));
    show.turnTo(null, 0);
    assert.equal(show.current(0), null);

    show.press(1);
    assert.equal(show.current(1).name, 'one');
    assert.equal(shownIn('#first'), true);
    assert.equal(show.source(), document.querySelector('#first'));

    show.press(2);
    assert.equal(show.current(2).name, 'two');
    assert.equal(shownIn('#first'), false);
    assert.equal(shownIn('#second'), true);

    // Left alone, the figure gives the sphere back, and the next press starts over.
    assert.equal(show.current(10.5), null);
    assert.equal(shownIn('#second'), false);

    show.press(11);
    assert.equal(show.current(11).name, 'one');

    // A hovered word takes over from a pressed figure and gives it back.
    show.turnTo(document.querySelector('#second'), 12);
    assert.equal(show.current(12).name, 'two');
    show.turnTo(null, 13);
    assert.equal(show.current(13).name, 'one');
});

test('a stage that lists no figures leaves the plain sphere to a press', (t) => {
    createDom(t, '<main data-page-main><div data-dot-orb-stage></div></main>');

    const show = createShow({ figures });

    show.enter(document.querySelector('[data-dot-orb-stage]'));
    show.turnTo(null, 0);
    show.press(1);

    assert.equal(show.current(1), null);
    assert.equal(show.source(), null);
});
