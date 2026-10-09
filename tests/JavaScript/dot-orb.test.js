import assert from 'node:assert/strict';
import test from 'node:test';
import { chapterChangedEvent } from '../../resources/js/chapter-controller.js';
import { createDotOrbController, openingAt } from '../../resources/js/dot-orb-controller.js';
import { createDom } from './dom.js';

const figureResolution = 120;

// Every sampled figure is a square in the middle third of its canvas.
const figurePixels = () => {
    const data = new Uint8ClampedArray(figureResolution * figureResolution * 4);

    for (let y = 40; y < 80; y += 1) {
        for (let x = 40; x < 80; x += 1) {
            data[(y * figureResolution + x) * 4 + 3] = 255;
        }
    }

    return { data };
};

// A stand-in for a 2D context: it answers every drawing call and keeps what `calls` names.
const createContext = (calls) => new Proxy(calls, {
    get: (target, name) => target[name] ?? (() => {}),
    set: (target, name, value) => {
        target[name] = value;

        return true;
    },
});

const setup = (t, reducedMotion = false) => {
    const window = createDom(t, `
        <canvas data-dot-orb></canvas>
        <a href="#" data-dot-orb-figure="projects"><span>Projects</span></a>
        <a href="#" data-dot-orb-figure="unknown">Elsewhere</a>
    `);
    const canvas = document.querySelector('canvas');
    const link = document.querySelector('[data-dot-orb-figure="projects"] span');
    const dots = [];
    const context = createContext({
        clearRect: () => dots.splice(0),
        arc: (x, y) => dots.push({ x, y }),
    });
    const figureContext = createContext({ getImageData: figurePixels });
    const frames = new Map();
    let frameId = 0;
    let timestamp = 0;
    const globals = {
        getComputedStyle: (element) => ({
            getPropertyValue: (name) => (name === '--dot-orb-x'
                ? element.dataset.place ?? ''
                : element.dataset.tone ?? (name === '--route-accent-goal' ? '125, 240, 201' : '')),
        }),
        Path2D: class {},
        ResizeObserver: class {
            constructor(callback) {
                this.callback = callback;
            }

            observe() {
                this.callback();
            }

            disconnect() {}
        },
        IntersectionObserver: class {
            constructor(callback) {
                this.callback = callback;
            }

            observe() {
                this.callback([{ isIntersecting: true }]);
            }

            disconnect() {}
        },
    };

    for (const [name, value] of Object.entries(globals)) {
        const previous = Object.getOwnPropertyDescriptor(globalThis, name);
        Object.defineProperty(globalThis, name, { configurable: true, value });
        t.after(() => {
            if (previous) Object.defineProperty(globalThis, name, previous);
            else delete globalThis[name];
        });
    }

    t.mock.method(window.HTMLCanvasElement.prototype, 'getContext', function getContext() {
        return this === canvas ? context : figureContext;
    });
    Object.defineProperty(canvas, 'clientWidth', { value: 600 });
    Object.defineProperty(canvas, 'clientHeight', { value: 900 });
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 900 });
    t.mock.method(window, 'requestAnimationFrame', (callback) => {
        frames.set(++frameId, callback);

        return frameId;
    });
    t.mock.method(window, 'cancelAnimationFrame', (id) => frames.delete(id));

    const run = (count) => {
        for (let index = 0; index < count; index += 1) {
            const pending = [...frames.values()];

            frames.clear();
            timestamp += 16;
            pending.forEach((callback) => callback(timestamp));
        }
    };
    const hover = (target, pointerType = 'mouse') => {
        const event = new window.MouseEvent('pointerover', { bubbles: true });

        Object.defineProperty(event, 'pointerType', { value: pointerType });
        target.dispatchEvent(event);
    };
    const spread = (axis) => Math.max(...dots.map((dot) => dot[axis])) - Math.min(...dots.map((dot) => dot[axis]));

    createDotOrbController({ reducedMotion }).initialize();

    return { context, link, dots, frames, run, hover, spread };
};

test('the sphere is drawn as one body of 1200 dots', (t) => {
    const { dots, run, spread } = setup(t);

    run(2);

    assert.equal(dots.length, 1200);
    assert.ok(spread('y') > 200 && spread('y') < 460);
});

test('hovering an element gathers the dots into its figure and leaving releases them', (t) => {
    const { link, run, hover, spread } = setup(t);

    hover(link);
    run(200);

    // The figure is a third of 0.72 units wide, about 100 of the 420 pixels a unit measures here,
    // plus what its thickness adds while it sways.
    assert.ok(spread('x') < 170 && spread('y') < 170);

    hover(document.body);
    run(200);

    assert.ok(spread('y') > 200);
});

test('an element that names no known figure leaves the sphere whole', (t) => {
    const { run, hover, spread } = setup(t);

    hover(document.querySelector('[data-dot-orb-figure="unknown"]'));
    run(200);

    assert.ok(spread('y') > 200);
});

test('a chapter gives the sphere its figure and its place once it is current, not on a hover', (t) => {
    const { dots, run, hover, spread } = setup(t);
    const chapter = document.createElement('section');
    const middle = () => dots.reduce((sum, dot) => sum + dot.x, 0) / dots.length;

    chapter.setAttribute('data-chapter', '');
    chapter.dataset.dotOrbFigure = 'projects';
    chapter.dataset.place = '0.25';
    document.body.append(chapter);

    hover(chapter);
    run(200);

    assert.ok(spread('y') > 200);

    const before = middle();

    chapter.setAttribute('data-dot-orb-resting', '');
    document.dispatchEvent(new window.CustomEvent(chapterChangedEvent));
    run(400);

    assert.ok(spread('x') < 170 && spread('y') < 170);
    // The canvas is 600 pixels wide: the sphere glides from 0.68 of it to a quarter, give or take
    // the tenth it wanders.
    assert.ok(before > 340 && middle() < 220);
});

test('the sphere keeps level with the part of a chapter that is marked as its place', (t) => {
    const { dots, run } = setup(t);
    const chapter = document.createElement('section');
    const place = document.createElement('div');
    const level = () => dots.reduce((sum, dot) => sum + dot.y, 0) / dots.length;

    chapter.setAttribute('data-chapter', '');
    chapter.setAttribute('data-dot-orb-resting', '');
    chapter.dataset.place = '0.5';
    chapter.getBoundingClientRect = () => ({ top: 0, height: 900 });
    place.setAttribute('data-dot-orb-place', '');
    place.getBoundingClientRect = () => ({ top: 150, height: 100 });
    chapter.append(place);
    document.body.append(chapter);

    document.dispatchEvent(new window.CustomEvent(chapterChangedEvent));
    run(400);

    // The place has its middle 200 pixels below the top of the canvas, the chapter at 450.
    assert.ok(Math.abs(level() - 200) < 40);
});

test('a click sends a ring through the dots that fades again', (t) => {
    const { dots, run, spread } = setup(t);
    const click = new window.MouseEvent('pointerdown', { bubbles: true, clientX: 412, clientY: 450 });

    Object.defineProperty(click, 'pointerType', { value: 'mouse' });
    run(2);

    const resting = dots.map((dot) => ({ ...dot }));
    const moved = () => dots.reduce((sum, dot, index) => sum + Math.hypot(dot.x - resting[index].x, dot.y - resting[index].y), 0) / dots.length;

    window.dispatchEvent(click);
    run(6);

    const pushed = moved();

    run(2);

    // Two more frames of idle motion move a dot far less than the ring does.
    assert.ok(pushed > 4);
    assert.ok(spread('y') > 200);
});

test('a held press gathers the dots towards the pointer until it is released', (t) => {
    const { dots, run } = setup(t);
    const press = (type) => {
        const event = new window.MouseEvent(type, { bubbles: true, clientX: 412, clientY: 450 });

        Object.defineProperty(event, 'pointerType', { value: 'mouse' });
        window.dispatchEvent(event);
    };
    const reach = () => dots.reduce((sum, dot) => sum + Math.hypot(dot.x - 412, dot.y - 450), 0) / dots.length;

    run(2);

    const resting = reach();

    press('pointerdown');
    run(90);

    assert.ok(reach() < resting * 0.85);

    press('pointerup');
    run(120);

    assert.ok(reach() > resting * 0.9);
});

test('touch input leaves the sphere whole', (t) => {
    const { link, run, hover, spread } = setup(t);

    hover(link, 'touch');
    run(200);

    assert.ok(spread('y') > 200);
});

test('reduced motion draws a still sphere without a frame loop', (t) => {
    const { link, dots, frames, hover } = setup(t, true);

    hover(link);

    assert.equal(dots.length, 1200);
    assert.equal(frames.size, 0);
});

test('a page change scatters the dots and the next page gathers them again', (t) => {
    const { run, spread } = setup(t);
    run(30);
    const whole = spread('y');

    document.dispatchEvent(new window.Event('portfolio:before-navigation'));
    run(40);
    assert.ok(spread('y') > whole * 1.8);

    document.dispatchEvent(new window.Event('portfolio:page-swapped'));
    run(200);
    assert.ok(spread('y') < whole * 1.2);
});

test('an element marked as resting holds its figure in its color while nothing is hovered', (t) => {
    const { context, link, run, hover, spread } = setup(t);
    const resting = link.parentElement;

    resting.dataset.tone = '255, 0, 0';
    resting.toggleAttribute('data-dot-orb-resting', true);
    hover(document.body);
    run(200);

    assert.ok(spread('x') < 170 && spread('y') < 170);
    assert.match(context.fillStyle, /^rgb\(255 /);
});

test('the pointer finds an opening only where dots are near', (t) => {
    const { run } = setup(t);
    run(30);

    // The sphere stands at 68% of the 600 pixel wide canvas, and a unit measures 420 pixels here.
    assert.ok(Math.abs(openingAt(408, 450) - 0.6 * 2 * 0.08 * 420) < 0.01);
    assert.equal(openingAt(5, 5), 0);
});
