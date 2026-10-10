import assert from 'node:assert/strict';
import test from 'node:test';
import { createDotOrbController, openingAt } from '../../resources/js/dot-orb-controller.js';
import { sceneChangedEvent } from '../../resources/js/scene-controller.js';
import { createDom } from './dom.js';

const figureResolution = 120;

// Every sampled figure is a square in the middle third of its canvas; `lower` moves it down by
// a sixth.
const figurePixels = (lower = false) => {
    const data = new Uint8ClampedArray(figureResolution * figureResolution * 4);

    for (let y = lower ? 60 : 40; y < (lower ? 100 : 80); y += 1) {
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

const setup = (t, { reducedMotion = false, fitted = false, pinned = false } = {}) => {
    const window = createDom(t, `
        <div><canvas data-dot-orb></canvas></div>
        <main><div data-dot-orb-stage></div></main>
        <a href="#" data-dot-orb-figure="projects"><span>Projects</span></a>
        <a href="#" data-dot-orb-figure="unknown">Elsewhere</a>
        <a href="#" data-dot-orb-figure="projects about">Both</a>
    `);
    const canvas = document.querySelector('canvas');

    // The stage of the page covers the canvas; a fitted one holds the sphere still in its middle.
    const lay = (element, left, top, width, height) => {
        element.getBoundingClientRect = () => ({ left, top, width, height });
    };
    const stage = document.querySelector('[data-dot-orb-stage]');

    stage.toggleAttribute('data-dot-orb-fit', fitted);
    stage.dataset.dotOrbStage = pinned ? 'pinned' : '';
    lay(stage, 0, 0, 600, 900);
    lay(canvas, 0, 0, 600, 900);

    const link = document.querySelector('[data-dot-orb-figure="projects"] span');
    const dots = [];
    const origins = [];
    const context = createContext({
        clearRect: () => dots.splice(0),
        arc: (x, y) => dots.push({ x, y }),
        setTransform: (...matrix) => origins.push(matrix.slice(4)),
    });
    // The figures are sampled in the order they are listed: the second, "about", sits lower.
    let sampled = 0;
    const figureContext = createContext({ getImageData: () => figurePixels((sampled += 1) === 2) });
    const frames = new Map();
    let frameId = 0;
    let timestamp = 0;
    const globals = {
        getComputedStyle: (element) => ({
            getPropertyValue: (name) => element.dataset.tone ?? (name === '--route-accent-goal' ? '125, 240, 201' : ''),
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
    // Where the middle of the dots lies on the canvas, from left to right.
    const middle = () => origins.at(-1)[0] + dots.reduce((sum, dot) => sum + dot.x, 0) / dots.length;
    // Puts the next page in place: its stage, if it has one, at the given place.
    const swap = (place) => {
        const next = document.createElement('main');

        if (place) {
            next.innerHTML = '<div data-dot-orb-stage></div>';
            lay(next.firstElementChild, ...place);
        }

        document.querySelector('main').replaceWith(next);
        document.dispatchEvent(new window.Event('portfolio:page-swapped'));
    };

    createDotOrbController({ reducedMotion }).initialize();

    // A press and its release on the dots in the middle of the sphere, by touch.
    const press = (clientX = 408, clientY = 450) => {
        for (const type of ['pointerdown', 'pointerup']) {
            const event = new window.MouseEvent(type, { bubbles: true, clientX, clientY });

            Object.defineProperty(event, 'pointerType', { value: 'touch' });
            window.dispatchEvent(event);
        }
    };

    return { context, link, dots, frames, run, hover, press, spread, middle, swap };
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

test('an element that names several figures shows one after the other', (t) => {
    const { dots, run, hover } = setup(t, { fitted: true });
    const level = () => dots.reduce((sum, dot) => sum + dot.y, 0) / dots.length;

    hover(document.querySelector('[data-dot-orb-figure="projects about"]'));
    run(250);

    const first = level();

    // A figure stays for 8 seconds, 500 frames of 16 milliseconds; the dots then flow to the
    // next one, which sits a sixth of the figure lower, 125 pixels on this canvas.
    run(400);

    const second = level();

    assert.ok(second - first > 80);

    // Another 8 seconds later the first figure is back.
    run(500);

    assert.ok(second - level() > 80);
});

test('a press on the dots moves a sequence on to its next figure', (t) => {
    const { dots, run, hover, press } = setup(t, { fitted: true });
    const level = () => dots.reduce((sum, dot) => sum + dot.y, 0) / dots.length;

    hover(document.querySelector('[data-dot-orb-figure="projects about"]'));
    run(100);

    const first = level();

    press(300, 450);
    run(150);

    assert.ok(level() - first > 80);
});

test('a press on the dots of a single figure shows the plain sphere for a while', (t) => {
    const { link, run, hover, press, spread } = setup(t, { fitted: true });

    hover(link);
    run(200);

    const figure = spread('y');

    press(300, 450);
    run(150);
    assert.ok(spread('y') > figure * 2);

    // After its 8 seconds, 500 frames of 16 milliseconds, the figure is back.
    run(500);
    assert.ok(spread('y') < figure * 1.2);
});

test('a press on the plain sphere splits it, and a held press draws it together again', (t) => {
    const { run, press, spread } = setup(t);
    const hold = (type) => {
        const event = new window.MouseEvent(type, { bubbles: true, clientX: 408, clientY: 450 });

        Object.defineProperty(event, 'pointerType', { value: 'mouse' });
        window.dispatchEvent(event);
    };

    // The first bud to set out by itself does so after seven seconds; this is long before.
    run(100);

    const whole = spread('y');

    // Every press sheds one more bud, to a place of its own above or below the sphere.
    press();
    press();
    press();
    run(190);
    assert.ok(spread('y') > whole * 1.4);

    // Holding for two seconds brings them back, and they stay for a while.
    hold('pointerdown');
    run(125);
    hold('pointerup');
    run(120);
    assert.ok(spread('y') < whole * 1.15);
});

test('an element that names no known figure leaves the sphere whole', (t) => {
    const { run, hover, spread } = setup(t);

    hover(document.querySelector('[data-dot-orb-figure="unknown"]'));
    run(200);

    assert.ok(spread('y') > 200);
});

test('a scene gives the sphere its figure once it is the one the sphere rests with', (t) => {
    const { run, spread } = setup(t);
    const scene = document.createElement('li');

    scene.dataset.dotOrbFigure = 'projects';
    document.body.append(scene);
    run(100);

    assert.ok(spread('y') > 200);

    scene.setAttribute('data-dot-orb-resting', '');
    document.dispatchEvent(new window.CustomEvent(sceneChangedEvent));
    run(200);

    assert.ok(spread('x') < 170 && spread('y') < 170);
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


test('on a stage that stays in the window the sphere sways with the scrolling of its page', (t) => {
    const { link, dots, run, hover } = setup(t, { pinned: true, fitted: true });
    const level = () => dots.reduce((sum, dot) => sum + dot.y, 0) / dots.length;

    // A figure stands still, so only the scrolling moves it.
    hover(link);
    run(200);

    const resting = level();

    // 20 pixels in every frame of 16 milliseconds are 1250 pixels a second.
    for (let frame = 0; frame < 30; frame += 1) {
        window.scrollY += 20;
        run(1);
    }

    assert.ok(resting - level() > 8);

    run(120);
    assert.ok(Math.abs(resting - level()) < 6);
});

test('a visitor who comes back after a pause is answered with a ring', (t) => {
    const { dots, run } = setup(t);
    const move = new window.MouseEvent('pointermove', { bubbles: true, clientX: 5, clientY: 5 });

    Object.defineProperty(move, 'pointerType', { value: 'mouse' });

    // Twenty seconds are 1250 frames of 16 milliseconds.
    run(1300);

    const resting = dots.map((dot) => ({ ...dot }));
    const moved = () => dots.reduce((sum, dot, index) => sum + Math.hypot(dot.x - resting[index].x, dot.y - resting[index].y), 0) / dots.length;

    window.dispatchEvent(move);
    run(6);

    assert.ok(moved() > 2);
});

test('touch input leaves the sphere whole', (t) => {
    const { link, run, hover, spread } = setup(t);

    hover(link, 'touch');
    run(200);

    assert.ok(spread('y') > 200);
});

test('reduced motion draws a still sphere without a frame loop', (t) => {
    const { link, dots, frames, hover } = setup(t, { reducedMotion: true });

    hover(link);

    assert.equal(dots.length, 1200);
    assert.equal(frames.size, 0);
});

test('on a page change the sphere travels to the stage of the next page', (t) => {
    const { run, middle, swap } = setup(t);

    run(30);

    // The sphere stands at 68% of its stage: of all 600 pixels first, then of the right half.
    assert.ok(Math.abs(middle() - 408) < 30);

    swap([300, 0, 300, 900]);
    run(1);
    assert.ok(Math.abs(middle() - 408) < 30);

    run(8);
    assert.ok(middle() > 425 && middle() < 490);

    run(200);
    assert.ok(Math.abs(middle() - 504) < 20);
});

test('on its way to the next stage the sphere strings out and gathers again', (t) => {
    const { run, spread, middle, swap } = setup(t);

    run(30);

    const resting = spread('x');

    // A stage of the same size, 200 pixels further right: a sixth of a second later the
    // fast dots are well ahead of the slow ones.
    swap([200, 0, 600, 900]);
    run(10);
    assert.ok(spread('x') > resting + 15);

    run(300);
    assert.ok(Math.abs(middle() - 608) < 30);
    assert.ok(spread('x') < resting * 1.3);
});

test('a page without a stage scatters the dots and the next stage gathers them again', (t) => {
    const { frames, run, spread, swap } = setup(t);

    run(30);

    const whole = spread('y');

    swap(null);
    run(40);
    assert.ok(spread('y') > whole * 1.8);

    // Once the dots have gone, nothing is drawn any more.
    run(200);
    assert.equal(frames.size, 0);

    swap([0, 0, 600, 900]);
    run(200);
    // A bud may be on its way out by now, so the body is a little taller than at first.
    assert.ok(spread('y') < whole * 1.5);
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
