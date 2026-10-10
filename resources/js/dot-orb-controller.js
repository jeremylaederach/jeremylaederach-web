import { createAttention } from './dot-orb-attention.js';
import { createBuds } from './dot-orb-buds.js';
import { drawnFigures } from './dot-orb-figures.js';
import { approach, clamp, createLattice, mix, smooth } from './dot-orb-math.js';
import { pairInStrips } from './dot-orb-pairing.js';
import { createPresses } from './dot-orb-presses.js';
import { sampleFigure } from './dot-orb-sampling.js';
import { createShow } from './dot-orb-show.js';
import { createStage } from './dot-orb-stage.js';
import { sceneChangedEvent } from './scene-controller.js';

const dotCount = 1200;
const turnSeconds = 52;
const tilt = 0.42;

// Lengths are in units of the stage (see dot-orb-stage.js).
const sphereRadius = 0.3;
const reach = 0.08;

// Where the sphere stands: at this share of its stage's width and height, around which it
// wanders by `wander` of the stage.
const stand = { share: 0.68, level: 0.5, wander: 0.1 };

// Nearer dots are a lighter tint of the accent, in steps small enough to pass for a gradient.
const tint = { levels: 8, lightest: 0.42 };

// A figure is a shape the dots take while an element that names it is hovered or focused. Its
// points are sampled from a drawing (see dot-orb-sampling.js), one for every dot: the drawn
// ones at once, the mark when its image has loaded. It sways instead of turning, and it is
// drawn within the middle `extent` of its square. Every other point lies on the back of the
// figure, so it has two faces.
//
// Whenever the dots turn to a figure, each is given the point nearest to where it is (see
// dot-orb-pairing.js), and a dot on the near side of the sphere a point on the front of the
// figure: the dots flow into the shape instead of crossing it.
const figure = { size: 0.72, extent: 0.8, depth: 0.36, sway: 0.45 };

// Which figure the dots show is worked out in dot-orb-show.js. They flow from shape to shape
// like the blobs of a lava lamp: at `hover` per second when the pointer moves on to another
// element, at `rest` when the element the sphere rests with changes or a press moves on, and at
// `cycle` when a sequence steps by itself. Every dot has a pace of its own, between `slowest`
// and `fastest` of that rate, so a shape melts into the next instead of jumping.
const sequence = { hover: 9, rest: 3, cycle: 1.6, slowest: 0.7, fastest: 1.5 };

// The dots that give way to the pointer leave an opening of this share of the reach around it,
// where at least this many dots are close.
const opening = { share: 0.6, dots: 4 };

// What the sphere notices of the visitor (see dot-orb-attention.js), and how little it makes of
// it. It looks `ahead` seconds along the pointer's way, so it turns towards where the pointer is
// heading. On a stage that stays in the window it sways with the scrolling of its page, by
// `sway` units for every pixel per second and `swing` at most, and at `brisk` pixels per second
// its dots flow to the figure of the next scene as fast as to a hovered one. To a visitor who
// comes back after a pause it answers with one ring of the strength `greeting`.
const notice = { ahead: 0.2, sway: 0.00003, swing: 0.05, brisk: 1800, greeting: 0.6 };

// On a page without a stage the dots scatter away from the middle of the sphere and fade; the
// next page with one gathers them again. `reach` is how far they travel, in multiples of their
// distance from the middle.
const scatter = { reach: 1.4, leaveRate: 9, arriveRate: 3.2 };

// The sphere answers the pointer controller where its dots leave an opening.
let probeOpening = () => 0;

// The diameter in pixels of the opening the sphere leaves around a pointer at this place of the
// window, or 0 where no dots are near.
export const openingAt = (clientX, clientY) => probeOpening(clientX, clientY);

// The three channels of a color written as "r, g, b"; null if the text names none.
const readChannels = (value) => {
    const numbers = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);

    return numbers?.length === 3 ? numbers : null;
};

const white = [255, 255, 255];

// Slow overlapping waves in view space: bulges rise and sink like a lava lamp.
const swell = (x, y, z, seconds) => 1
    + Math.sin(x * 2.1 + seconds * 0.52) * Math.cos(y * 1.7 - seconds * 0.37) * 0.3
    + Math.sin(z * 2.6 + y * 1.3 + seconds * 0.29) * 0.13
    + Math.sin(x * 0.9 + seconds * 0.21) * 0.06;

const createRotation = (turn, lean) => ({
    sinTurn: Math.sin(turn),
    cosTurn: Math.cos(turn),
    sinLean: Math.sin(lean),
    cosLean: Math.cos(lean),
});

const initializeOrb = (canvas, reducedMotion) => {
    const context = canvas.getContext('2d');
    // The accent the page is heading for; the accent in use may still be blending towards it.
    const accent = () => readChannels(getComputedStyle(canvas).getPropertyValue('--route-accent-goal'));
    const color = accent() ?? [...white];
    const buds = createBuds();
    const { division } = buds;
    const presses = createPresses();
    const sphere = createLattice(dotCount);
    const figures = new Map();
    const dots = {
        x: new Float32Array(dotCount),
        y: new Float32Array(dotCount),
        z: new Float32Array(dotCount),
        level: new Uint8Array(dotCount),
        // Where each dot lies around the sphere's axis, and how far along it, from 0 to 1.
        cos: Float32Array.from(sphere, ({ x, z }) => x / (Math.hypot(x, z) || 1)),
        sin: Float32Array.from(sphere, ({ x, z }) => z / (Math.hypot(x, z) || 1)),
        count: Float32Array.from(sphere, ({ y }) => (1 - y) / 2),
        figureX: new Float32Array(dotCount),
        figureY: new Float32Array(dotCount),
        figureHalf: new Float32Array(dotCount),
        // The point of the figure each dot is heading for; an even one lies on its front.
        point: Uint16Array.from({ length: dotCount }, (_, index) => index),
        // The pace of each dot, spread evenly by the golden ratio.
        pace: Float32Array.from({ length: dotCount }, (_, index) => mix(sequence.slowest, sequence.fastest, (index * 0.618034) % 1)),
    };
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, targetStrength: 0 };
    const attention = reducedMotion ? null : createAttention();
    // How far ahead of the pointer the sphere looks, in units, how fast its page scrolls and
    // how far that has moved it.
    const heading = { x: 0, y: 0 };
    let scrolling = 0;
    let swayed = 0;
    const home = { x: 0, y: 0 };
    // How the sphere stands in this frame: how it and a figure are turned, its time, and
    // whether a figure has formed, which hides the sphere.
    const scene = { rotation: null, sway: null, seconds: 0, formed: false };
    // The dot that is being placed, and what its place is worked out from.
    const dot = { x: 0, y: 0, z: 0 };
    const view = { x: 0, y: 0, z: 0 };
    const spot = { x: 0, y: 0, z: 0 };
    const shaped = { along: 0, around: 0, height: 0, ring: 0 };
    const stage = createStage({ canvas, reducedMotion, figureShare: figure.size * figure.extent });
    let frame = 0;
    let previousTime = 0;
    let clock = 0;
    let visible = false;
    // What the dots show, and the points of the figure whose dots are placed now.
    const show = createShow({ figures });
    let figurePoints = [];
    let glideRate = sequence.hover;
    let shape = 0;
    let targetShape = 0;
    let targetColor = color;
    let pointed = null;
    let scattered = 0;
    let targetScattered = 0;
    // The points on each side of a figure: the even ones lie on its front, the odd ones on its
    // back.
    const sides = new WeakMap();

    // Turns a point of the lattice's frame into view space.
    const turn = (point, rotation) => {
        const depth = point.z * rotation.cosTurn - point.x * rotation.sinTurn;

        view.x = point.x * rotation.cosTurn + point.z * rotation.sinTurn;
        view.y = point.y * rotation.cosLean - depth * rotation.sinLean;
        view.z = point.y * rotation.sinLean + depth * rotation.cosLean;
    };

    const wander = (seconds) => {
        home.x = (stage.width * (stage.fit ? 0.5 : stand.share + stand.wander * Math.sin(seconds / 23))) / stage.unit;
        home.y = (stage.height * (stage.fit ? 0.5 : stand.level + stand.wander * Math.sin(seconds / 17))) / stage.unit + swayed;
    };

    // The dot on the sphere, or on the bud it belongs to: turned with the sphere and swelling
    // with it. The swell is that of the whole sphere at the dot's own place on it, so a neck
    // between two bodies stays closed.
    const onSphere = (index) => {
        const { rotation, seconds } = scene;

        turn(sphere[index], rotation);

        const bulge = swell(view.x, view.y, view.z, seconds);

        division.place(dots.count[index], shaped);
        // Which way the dot's part of the surface faces: towards the viewer or away.
        spot.x = shaped.ring * dots.cos[index];
        spot.y = shaped.height;
        spot.z = shaped.ring * dots.sin[index];
        turn(spot, rotation);
        dot.z = clamp(view.z, -1, 1);
        spot.x = shaped.around * dots.cos[index];
        spot.y = shaped.along;
        spot.z = shaped.around * dots.sin[index];
        turn(spot, rotation);
        dot.x = home.x + view.x * bulge * sphereRadius;
        dot.y = home.y + view.y * bulge * sphereRadius;
    };

    // Moves the dot towards its point of the figure, as far as the figure has formed. Within a
    // figure the dots flow from one shape to the next, each at its own pace.
    const intoFigure = (index, delta) => {
        const { sway } = scene;

        if (figurePoints.length) {
            const point = figurePoints[dots.point[index]];
            const glide = 1 - Math.exp(-glideRate * dots.pace[index] * delta);

            dots.figureX[index] += (point.x - dots.figureX[index]) * glide;
            dots.figureY[index] += (point.y - dots.figureY[index]) * glide;
            dots.figureHalf[index] += (point.half - dots.figureHalf[index]) * glide;
        }

        if (shape > 0.001) {
            // The figure forms from its first point to its last, wherever a dot comes from: the
            // sphere and a bud beside it turn into it in the same way.
            const amount = smooth(clamp(shape * 1.35 - (dots.point[index] / dotCount) * 0.35, 0, 1));
            const thickness = dots.figureHalf[index] * (dots.point[index] % 2 === 0 ? 1 : -1);
            const turnedX = dots.figureX[index] * sway.cosTurn + thickness * sway.sinTurn;
            const depth = thickness * sway.cosTurn - dots.figureX[index] * sway.sinTurn;
            const turnedY = dots.figureY[index] * sway.cosLean - depth * sway.sinLean;
            const turnedZ = dots.figureY[index] * sway.sinLean + depth * sway.cosLean;

            dot.x = mix(dot.x, home.x + turnedX * figure.size, amount);
            dot.y = mix(dot.y, home.y + turnedY * figure.size, amount);
            dot.z = mix(dot.z, clamp(turnedZ / figure.depth, -1, 1), amount);
        }
    };

    // What the visitor does to the dot: it gives way to the pointer, the presses pull it in and
    // push it outwards (see dot-orb-presses.js), and a page without a stage scatters it.
    const disturb = () => {
        const distance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);

        if (distance < reach && pointer.strength > 0.01) {
            const push = ((reach - distance) / reach) ** 2 * 0.05 * pointer.strength;

            dot.x += ((dot.x - pointer.x) / (distance || 1)) * push;
            dot.y += ((dot.y - pointer.y) / (distance || 1)) * push;
        }

        presses.disturb(dot);

        if (scattered > 0.001) {
            dot.x += (dot.x - home.x) * scattered * scatter.reach;
            dot.y += (dot.y - home.y) * scattered * scatter.reach;
        }
    };

    // Sets the scene for a moment: where the sphere stands, how it leans towards the pointer
    // and how far its buds are out.
    const compose = (seconds, formed, delta = 0) => {
        wander(seconds);

        const leanX = clamp((pointer.x + heading.x - home.x) / sphereRadius, -2, 2);
        const leanY = clamp((pointer.y + heading.y - home.y) / sphereRadius, -2, 2);
        const lean = tilt + leanY * 0.35 * pointer.strength;

        buds.arrange(seconds, delta, {
            below: stage.height / stage.unit - home.y,
            above: home.y,
            radius: sphereRadius * Math.cos(lean),
        }, presses.held());
        scene.seconds = seconds;
        scene.formed = formed;
        scene.rotation = createRotation((seconds / turnSeconds) * Math.PI * 2 + leanX * 0.5 * pointer.strength, lean);
        scene.sway = createRotation(
            Math.sin(seconds * 0.5) * figure.sway + leanX * 0.2 * pointer.strength,
            0.1 + leanY * 0.12 * pointer.strength,
        );
    };

    const position = (seconds, delta) => {
        compose(seconds, shape > 0.999, delta);

        const travelling = stage.travelling();

        for (let index = 0; index < dotCount; index += 1) {
            if (scene.formed) {
                Object.assign(dot, home, { z: 0 });
            } else {
                onSphere(index);
            }

            intoFigure(index, delta);
            disturb();

            if (travelling) {
                stage.trail(dots.pace[index], dot);
            }

            dots.x[index] = dot.x;
            dots.y[index] = dot.y;
            dots.z[index] = dot.z;
            dots.level[index] = Math.min(Math.floor(((dot.z + 1) / 2) * tint.levels), tint.levels - 1);
        }
    };

    // From the far dots to the near ones, one tint level and one fill color per pass.
    // Everything is drawn from the corner of the stage.
    const paint = () => {
        const { unit, originX, originY } = stage;
        const veiled = stage.veiled();

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, originX, originY);

        for (let level = 0; level < tint.levels; level += 1) {
            const lightness = (level / (tint.levels - 1)) * tint.lightest;

            context.fillStyle = `rgb(${color.map((channel) => Math.round(mix(channel, 255, lightness))).join(' ')})`;

            for (let index = 0; index < dotCount; index += 1) {
                if (dots.level[index] !== level) {
                    continue;
                }

                const closeness = (dots.z[index] + 1) / 2;
                const shown = veiled ? stage.shownAt(originX + dots.x[index] * unit, originY + dots.y[index] * unit) : 1;

                context.globalAlpha = (0.3 + closeness * closeness * 0.7) * (1 - scattered) * shown;
                context.beginPath();
                context.arc(
                    dots.x[index] * unit,
                    dots.y[index] * unit,
                    unit * (0.0012 + closeness * 0.0026),
                    0,
                    Math.PI * 2,
                );
                context.fill();
            }
        }
    };

    // Gives every dot its point of a figure: the one nearest to where the dot is. Coming from
    // the sphere, the dots on its near side take the front of the figure, and every dot is on
    // its point at once, because the figure has not formed yet. Within a figure every dot keeps
    // its side and glides to its new point.
    const turnTo = (points) => {
        if (!sides.has(points)) {
            sides.set(points, [0, 1].map((face) => points.filter((_, index) => index % 2 === face)));
        }

        const forming = shape < 0.02;
        const order = [...dots.point.keys()];
        const places = order.map((index) => (forming
            ? { x: (dots.x[index] - home.x) / figure.size, y: (dots.y[index] - home.y) / figure.size }
            : { x: dots.figureX[index], y: dots.figureY[index] }));

        order.sort(forming
            ? (first, second) => dots.z[second] - dots.z[first]
            : (first, second) => (dots.point[first] % 2) - (dots.point[second] % 2));

        for (const face of [0, 1]) {
            const side = order.slice((face * dotCount) / 2, ((face + 1) * dotCount) / 2);
            const partners = pairInStrips(side.map((index) => places[index]), sides.get(points)[face]);

            side.forEach((index, place) => {
                dots.point[index] = partners[place] * 2 + face;
            });
        }

        if (forming) {
            for (const index of order) {
                dots.figureX[index] = points[dots.point[index]].x;
                dots.figureY[index] = points[dots.point[index]].y;
                dots.figureHalf[index] = points[dots.point[index]].half;
            }
        }
    };

    // Before a figure lets its dots go, they change places within it, which nobody sees: each
    // takes the place of the dot nearest to where it sits on the sphere, on the side of the
    // figure that faces the same way. The dots then flow back as they would have come.
    const letGo = () => {
        compose(clock, false);

        const order = [...dots.point.keys()];
        const seated = order.map((index) => {
            onSphere(index);

            return { x: (dot.x - home.x) / figure.size, y: (dot.y - home.y) / figure.size, z: dot.z };
        });
        const held = order.map((index) => ({
            x: dots.figureX[index],
            y: dots.figureY[index],
            half: dots.figureHalf[index],
            point: dots.point[index],
        }));

        order.sort((first, second) => seated[second].z - seated[first].z);

        for (const face of [0, 1]) {
            const side = order.slice((face * dotCount) / 2, ((face + 1) * dotCount) / 2);
            const places = held.filter(({ point }) => point % 2 === face);
            const partners = pairInStrips(side.map((index) => seated[index]), places);

            side.forEach((index, place) => {
                const taken = places[partners[place]];

                dots.figureX[index] = taken.x;
                dots.figureY[index] = taken.y;
                dots.figureHalf[index] = taken.half;
                dots.point[index] = taken.point;
            });
        }
    };

    // Gives the dots what they show right now: a figure, which a new one is flowed into at
    // `rate`, or the plain sphere.
    const present = (rate) => {
        const next = show.current(clock)?.points ?? null;

        if (next && (next !== figurePoints || (!targetShape && shape < 0.02))) {
            turnTo(next);
            figurePoints = next;
            glideRate = rate;
            takeColor();
        } else if (!next && targetShape && shape > 0.98) {
            letGo();
        }

        targetShape = next ? 1 : 0;
    };

    // What the sphere notices of the visitor in this frame.
    const attend = (delta) => {
        const noticed = attention.read(delta);
        const sway = stage.pinned ? clamp(-noticed.scrolling * notice.sway, -notice.swing, notice.swing) : 0;

        heading.x = approach(heading.x, (noticed.headingX * stage.scale * notice.ahead) / stage.unit, 6, delta);
        heading.y = approach(heading.y, (noticed.headingY * stage.scale * notice.ahead) / stage.unit, 6, delta);
        scrolling = noticed.scrolling;
        swayed = approach(swayed, sway, 6, delta);

        if (noticed.returned) {
            presses.ring(home.x, home.y, notice.greeting);
        }
    };

    // The sphere keeps its own clock, so it resumes where it paused instead of jumping ahead.
    const draw = (time) => {
        const delta = Math.min((time - previousTime) / 1000, 0.1);

        previousTime = time;
        clock += delta;
        stage.step(delta);

        if (attention) {
            attend(delta);
        }

        presses.step(delta);
        pointer.x = approach(pointer.x, pointer.targetX, 5, delta);
        pointer.y = approach(pointer.y, pointer.targetY, 5, delta);
        pointer.strength = approach(pointer.strength, pointer.targetStrength, 3.6, delta);
        shape = approach(shape, targetShape, 8, delta);
        color.forEach((channel, index) => {
            color[index] = approach(channel, targetColor[index], 6, delta);
        });
        scattered = approach(scattered, targetScattered, targetScattered ? scatter.leaveRate : scatter.arriveRate, delta);

        present(sequence.cycle);
        position(clock, delta);
        paint();
    };

    // The sphere moves while its stage is in sight, and on a page without one until the dots
    // have scattered.
    const moving = () => !reducedMotion && !document.hidden && (stage.element ? visible : scattered < 0.999);

    const loop = (time) => {
        draw(time);

        if (moving()) {
            frame = window.requestAnimationFrame(loop);
        }
    };

    const update = () => {
        window.cancelAnimationFrame(frame);

        if (!moving()) {
            draw(previousTime);

            return;
        }

        frame = window.requestAnimationFrame((time) => {
            previousTime = time;
            loop(time);
        });
    };

    const resize = () => {
        stage.resize();
        canvas.width = Math.round(canvas.clientWidth * stage.scale);
        canvas.height = Math.round(canvas.clientHeight * stage.scale);
        update();
    };

    const probe = (clientX, clientY) => {
        const { x, y } = stage.locate({ clientX, clientY });
        let close = 0;

        for (let index = 0; index < dotCount && close < opening.dots; index += 1) {
            close += Math.hypot(dots.x[index] - x, dots.y[index] - y) < reach * 1.5 ? 1 : 0;
        }

        return close < opening.dots ? 0 : (opening.share * 2 * reach * stage.unit) / stage.scale;
    };

    // The pointer arrives where it is instead of sweeping in.
    const follow = (event) => {
        const { x, y } = stage.locate(event);

        pointer.targetX = x;
        pointer.targetY = y;

        presses.move({ x, y });

        if (pointer.targetStrength === 0) {
            pointer.x = pointer.targetX;
            pointer.y = pointer.targetY;
        }

        pointer.targetStrength = 1;
    };

    const release = () => {
        pointer.targetStrength = 0;
    };

    // A press on the dots moves on to the next shape. A press of the mouse also sends a ring
    // from its place and starts to charge.
    const pressDown = (event) => {
        if (probe(event.clientX, event.clientY)) {
            show.press(clock);
            takeColor();
            present(sequence.rest);
        }

        if (event.pointerType === 'mouse') {
            presses.begin(stage.locate(event));
        }
    };

    // The end of a press that was held: the buds stay in for a while, and a ring leaves its place.
    const pressUp = () => {
        if (presses.held()) {
            buds.settle(clock);
            presses.end();
        }
    };

    // The dots take the color the element that names their figure asks for (`--dot-orb-rgb`),
    // or the accent of the page.
    const takeColor = () => {
        const source = show.source();
        const tone = source ? getComputedStyle(source).getPropertyValue('--dot-orb-rgb').trim() : '';

        targetColor = (tone ? readChannels(tone) : accent()) ?? targetColor;
    };

    // The sphere turns to what the pointer or the focus is on. The dots keep the last figure
    // while they return to the sphere, and the pace of a visitor who scrolls briskly through
    // the scenes.
    const react = (target) => {
        pointed = target;
        show.turnTo(target, clock);
        takeColor();
        present(show.hovered()
            ? sequence.hover
            : mix(sequence.rest, sequence.hover, clamp(Math.abs(scrolling) / notice.brisk, 0, 1)));
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
    });

    // Takes the stage of the page that is now in place. The sphere travels there from where it
    // stands; on a page without a stage the dots scatter.
    const adopt = () => {
        const from = stage.element ? stage.onCanvas(home) : null;

        stage.take();
        show.enter(stage.element);
        targetScattered = stage.element ? 0 : 1;
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        resizeObserver.observe(canvas);

        if (stage.element) {
            canvas.parentElement.toggleAttribute('data-pinned', stage.pinned);
            visibilityObserver.observe(stage.element);
            resizeObserver.observe(stage.element);
            stage.measure();
            wander(clock);

            if (from && !reducedMotion) {
                stage.comeFrom(from, home);
            }

            // The dots stand where they are on this stage before they are given a figure.
            position(clock, 0);
        }

        react(pointed?.isConnected ? pointed : null);
        update();
    };

    document.addEventListener('visibilitychange', update);
    document.addEventListener('portfolio:page-swapped', adopt);

    if (!reducedMotion) {
        for (const [name, drawFigure] of Object.entries(drawnFigures)) {
            figures.set(name, sampleFigure(drawFigure, dotCount));
        }

        if (canvas.dataset.mark) {
            const image = document.createElement('img');

            image.addEventListener('load', () => {
                figures.set('mark', sampleFigure((figureContext, side) => figureContext.drawImage(image, 0, 0, side, side), dotCount));
                react(pointed);
            });
            image.src = canvas.dataset.mark;
        }

        probeOpening = probe;
        window.addEventListener('pointermove', follow, { passive: true });
        document.documentElement.addEventListener('pointerleave', release);
        window.addEventListener('pointerdown', pressDown, { passive: true });
        window.addEventListener('pointerup', pressUp, { passive: true });
        window.addEventListener('pointercancel', pressUp, { passive: true });
        document.addEventListener('pointerover', (event) => {
            if (event.pointerType === 'mouse') {
                react(event.target);
            }
        });
        // A click focuses what it hits without showing a focus, so only a focus that shows
        // gives the sphere its figure, and only its end takes that figure away again.
        document.addEventListener('focusin', (event) => {
            if (event.target.matches(':focus-visible')) {
                react(event.target);
            }
        });
        document.addEventListener('focusout', (event) => {
            if (event.target === pointed) {
                react(null);
            }
        });
        document.addEventListener(sceneChangedEvent, () => react(pointed));
    }

    adopt();
    // A page that opens without a stage has no dots to scatter first.
    scattered = targetScattered;
};

export const createDotOrbController = ({ reducedMotion }) => ({
    initialize: () => {
        const canvas = document.querySelector('[data-dot-orb]');

        if (canvas) {
            initializeOrb(canvas, reducedMotion);
        }
    },
});
