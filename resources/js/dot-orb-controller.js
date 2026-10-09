import { chapterChangedEvent } from './chapter-controller.js';
import { drawnFigures } from './dot-orb-figures.js';
import { transitionFinishedEvent } from './transition-controller.js';

const dotCount = 1200;
const turnSeconds = 52;
const tilt = 0.42;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));

// Lengths are in units. One unit is the sphere's box, which follows the canvas size.
const unitOf = { height: 1, width: 0.7, largest: 1040 };
const sphereRadius = 0.3;
const reach = 0.08;

// Where the sphere stands: at this share of its canvas' width and height, unless the element it
// rests with names another place. It then glides to that share of the width at `rate` per second
// and keeps level with the middle of that element, or of the part of it marked
// `data-dot-orb-place`, which it follows at `follow` per second. It wanders around its place by
// `wander` of the canvas, or by `held` beside such an element.
const stand = { share: 0.68, level: 0.5, rate: 2.4, follow: 7, wander: 0.1, held: 0.03 };

// A click sends a ring outwards through the dots: how fast it travels and how wide it is, in
// units, how far it pushes a dot, how many seconds it lasts and how many rings travel at once.
const pulse = { speed: 1.5, width: 0.1, strength: 0.07, life: 1.1, most: 6 };

// A held press gathers the dots within reach towards the pointer and charges up; letting go
// releases a ring that is stronger the longer the press lasted.
const press = { reach: 0.5, pull: 0.24, chargeRate: 1.5, releaseRate: 7, boost: 2.2 };

// Nearer dots are a lighter tint of the accent, in steps small enough to pass for a gradient.
const tint = { levels: 8, lightest: 0.42 };

// A bud is a smaller sphere that leaves the main one for a while, like a blob in a lava lamp: it
// drifts beside the sphere and rises and sinks over the height of the canvas. The dots are dealt
// out to four groups. The first is the core and never leaves; the others have their own size,
// their own side and their own cycles, in seconds, and start inside the sphere.
const bud = {
    margin: 0.2,
    travel: 0.3,
    groups: [
        null,
        { radius: 0.15, offset: 0.46, period: 41, phase: 5.42, rise: 29 },
        { radius: 0.11, offset: -0.4, period: 53, phase: 3.9, rise: 37 },
        { radius: 0.13, offset: 0.12, period: 67, phase: 2.6, rise: 23 },
    ],
};

// A figure is a shape the dots take while an element that names it is hovered or focused. It is
// sampled from a small canvas (the drawn ones at once, the mark when its image loads) and
// inflated: thickest in the middle of the shape, flat at its edge. It sways instead of turning.
// A figure is drawn within the middle `extent` of its square.
const figure = { size: 0.72, extent: 0.8, resolution: 120, thickness: 0.17, depth: 0.36, sway: 0.45 };

// An element can name several figures, separated by spaces. The sphere then shows one after the
// other, each for `dwell` seconds. The dots glide from shape to shape at `hover` per second when
// the pointer moves on to another element and at `cycle` when the sequence steps by itself.
const sequence = { dwell: 3.6, hover: 9, cycle: 4.5 };

// The dots that give way to the pointer leave an opening of this share of the reach around it,
// where at least this many dots are close.
const opening = { share: 0.6, dots: 4 };
const openings = new Set();

// The diameter in pixels of the opening a sphere leaves around a pointer at this place of the
// window, or 0 where no dots are near.
export const openingAt = (clientX, clientY) => {
    for (const probe of openings) {
        const size = probe(clientX, clientY);

        if (size) {
            return size;
        }
    }

    return 0;
};

// On a page change the dots scatter away from the middle of the sphere and fade; the sphere of
// the next page gathers from there. `reach` is how far they travel, in multiples of their distance
// from the middle.
const scatter = { reach: 1.4, leaveRate: 9, arriveRate: 3.2 };

// Evenly spread points on a unit sphere (Fibonacci lattice), ordered from the top down.
const createLattice = (count) => Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const angle = index * goldenAngle;

    return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring };
});

// The three channels of a color written as "r, g, b"; null if the text names none.
const readChannels = (value) => {
    const numbers = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);

    return numbers?.length === 3 ? numbers : null;
};

const white = [255, 255, 255];
const mix = (from, to, amount) => from + (to - from) * amount;
const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
const smooth = (value) => value * value * (3 - 2 * value);

// Frame-rate independent easing towards a target.
const approach = (current, target, rate, delta) => current + (target - current) * (1 - Math.exp(-rate * delta));

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

// How far every filled cell of a square grid is from the nearest empty one, in cells.
const distanceToEdge = (filled, size) => {
    const distance = new Float32Array(size * size);
    const at = (x, y) => (x < 0 || y < 0 || x >= size || y >= size ? 0 : distance[y * size + x]);

    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            distance[y * size + x] = filled(x, y) ? Math.min(at(x - 1, y), at(x, y - 1)) + 1 : 0;
        }
    }

    for (let y = size - 1; y >= 0; y -= 1) {
        for (let x = size - 1; x >= 0; x -= 1) {
            distance[y * size + x] = Math.min(distance[y * size + x], at(x + 1, y) + 1, at(x, y + 1) + 1);
        }
    }

    return distance;
};

// Evenly spaced points inside whatever `draw` paints, centred on (0, 0), each with half the
// figure's thickness at that point. Transparent and near-white areas are holes.
const sampleFigure = (draw) => {
    const size = figure.resolution;
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
        return [];
    }

    draw(context, size);

    const { data } = context.getImageData(0, 0, size, size);
    const filled = (x, y) => {
        const offset = (Math.floor(y) * size + Math.floor(x)) * 4;

        return data[offset + 3] > 128 && Math.min(data[offset], data[offset + 1], data[offset + 2]) < 225;
    };
    const distance = distanceToEdge(filled, size);
    const deepest = Math.max(...distance, 1);
    const area = distance.reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0);
    const step = Math.sqrt(area / dotCount) * 1.02;
    const points = [];

    for (let y = step / 2; y < size; y += step) {
        for (let x = step / 2; x < size; x += step) {
            if (filled(x, y)) {
                const inward = distance[Math.floor(y) * size + Math.floor(x)] / deepest;

                points.push({
                    x: x / size - 0.5,
                    y: y / size - 0.5,
                    half: figure.thickness * Math.sqrt(1 - (1 - inward) ** 2),
                });
            }
        }
    }

    return points;
};

const createBuds = () => bud.groups.map((group) => ({
    group,
    out: 0,
    x: 0,
    y: 0,
    rotation: null,
}));

const initializeOrb = (canvas, reducedMotion, arriving) => {
    const context = canvas.getContext('2d');
    const listeners = new AbortController();
    // The accent the page is heading for; the accent in use may still be blending towards it.
    const accent = () => readChannels(getComputedStyle(canvas).getPropertyValue('--route-accent-goal'));
    const color = accent() ?? [...white];
    const buds = createBuds();
    const sphere = createLattice(dotCount);
    const budSphere = createLattice(Math.ceil(dotCount / buds.length));
    const figures = new Map();
    const dots = {
        x: new Float32Array(dotCount),
        y: new Float32Array(dotCount),
        z: new Float32Array(dotCount),
        scale: new Float32Array(dotCount),
        level: new Uint8Array(dotCount),
        figureX: new Float32Array(dotCount),
        figureY: new Float32Array(dotCount),
        figureHalf: new Float32Array(dotCount),
    };
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, targetStrength: 0 };
    const ripples = [];
    const hold = { x: 0, y: 0, down: false, charge: 0 };
    const home = { x: 0, y: 0 };
    const view = { x: 0, y: 0, z: 0 };
    let width = 0;
    let height = 0;
    let unit = 1;
    let scale = 1;
    let frame = 0;
    let previousTime = 0;
    let clock = 0;
    let visible = false;
    let figurePoints = [];
    let shapes = [];
    let shown = null;
    let since = 0;
    let glideRate = sequence.hover;
    let shape = 0;
    let targetShape = 0;
    let targetColor = color;
    let standing = stand.share;
    let targetStanding = stand.share;
    let level = stand.level;
    let anchor = null;
    let pointed = null;
    let scattered = arriving && !reducedMotion ? 1 : 0;
    let targetScattered = 0;

    // Turns a lattice point into view space and lets it swell; x and y come back in sphere radii.
    const place = (point, rotation, seconds) => {
        const x = point.x * rotation.cosTurn + point.z * rotation.sinTurn;
        const depth = point.z * rotation.cosTurn - point.x * rotation.sinTurn;
        const y = point.y * rotation.cosLean - depth * rotation.sinLean;
        const z = point.y * rotation.sinLean + depth * rotation.cosLean;
        const bulge = swell(x, y, z, seconds);

        view.x = x * bulge;
        view.y = y * bulge;
        view.z = z;
    };

    // A canvas marked `data-dot-orb-fit` holds the sphere still in its middle, and a figure fills
    // its smaller side. Otherwise the sphere wanders slowly around the middle of the stage.
    const fit = canvas.hasAttribute('data-dot-orb-fit') && !reducedMotion;
    const wander = (seconds) => {
        const drift = anchor ? stand.held : stand.wander;

        home.x = (width * (fit ? 0.5 : standing + drift * Math.sin(seconds / 23))) / unit;
        home.y = (height * (fit ? 0.5 : level + drift * Math.sin(seconds / 17))) / unit;
    };

    // The share of the canvas' height at which the middle of the element the sphere keeps level
    // with stands right now.
    const levelOf = (element) => {
        const bounds = element.getBoundingClientRect();
        const frame = canvas.getBoundingClientRect();

        return (bounds.top + bounds.height / 2 - frame.top) / (frame.height || 1);
    };

    // Where each bud is right now, and how far out of the sphere.
    const arrange = (seconds, turn, lean) => {
        for (const [index, part] of buds.entries()) {
            if (!part.group) {
                continue;
            }

            const { offset, period, phase, rise } = part.group;
            const wave = Math.sin((seconds / period) * Math.PI * 2 + phase);
            const lift = Math.sin((seconds / rise) * Math.PI * 2 + phase) * bud.travel;

            part.out = smooth(clamp((wave - 0.35) / 0.4, 0, 1));
            part.x = clamp(home.x + offset, bud.margin, width / unit - bud.margin);
            part.y = clamp((height / unit) * (0.5 + lift), bud.margin, height / unit - bud.margin);
            part.rotation = createRotation(turn + index * 2.1, lean);
        }
    };

    const position = (seconds, delta) => {
        wander(seconds);

        const leanX = clamp((pointer.x - home.x) / sphereRadius, -2, 2);
        const leanY = clamp((pointer.y - home.y) / sphereRadius, -2, 2);
        const turn = (seconds / turnSeconds) * Math.PI * 2 + leanX * 0.5 * pointer.strength;
        const lean = tilt + leanY * 0.35 * pointer.strength;
        const rotation = createRotation(turn, lean);
        const sway = createRotation(
            Math.sin(seconds * 0.5) * figure.sway + leanX * 0.2 * pointer.strength,
            0.1 + leanY * 0.12 * pointer.strength,
        );

        arrange(seconds, turn, lean);

        // The sphere shrinks by the share of its dots that are out as buds.
        const away = buds.reduce((sum, part) => sum + part.out, 0) / buds.length;
        const radius = sphereRadius * Math.sqrt(1 - away);

        // Within a figure the dots glide from one shape to the next; coming from the sphere they
        // head straight for the shape.
        const glide = shape < 0.02 ? 1 : 1 - Math.exp(-glideRate * delta);

        for (let index = 0; index < dotCount; index += 1) {
            place(sphere[index], rotation, seconds);

            let x = home.x + view.x * radius;
            let y = home.y + view.y * radius;
            let z = view.z;
            let size = 1;
            const part = buds[index % buds.length];

            if (part.out > 0.001) {
                // The dots leave from the top down, so a bud stretches out of the sphere.
                const amount = smooth(clamp(part.out * 1.35 - (index / dotCount) * 0.35, 0, 1));

                // Each bud turns and swells on its own phase.
                place(budSphere[Math.floor(index / buds.length)], part.rotation, seconds + (index % buds.length) * 7);
                x = mix(x, part.x + view.x * part.group.radius, amount);
                y = mix(y, part.y + view.y * part.group.radius, amount);
                z = mix(z, view.z, amount);
                size = mix(1, 0.86, amount);
            }

            if (figurePoints.length) {
                const point = figurePoints[index % figurePoints.length];

                dots.figureX[index] += (point.x - dots.figureX[index]) * glide;
                dots.figureY[index] += (point.y - dots.figureY[index]) * glide;
                dots.figureHalf[index] += (point.half - dots.figureHalf[index]) * glide;
            }

            if (shape > 0.001) {
                const amount = smooth(clamp(shape * 1.35 - (index / dotCount) * 0.35, 0, 1));

                // Every other dot lies on the back of the figure, so it has two faces.
                const thickness = dots.figureHalf[index] * (index % 2 === 0 ? 1 : -1);
                const turnedX = dots.figureX[index] * sway.cosTurn + thickness * sway.sinTurn;
                const depth = thickness * sway.cosTurn - dots.figureX[index] * sway.sinTurn;
                const turnedY = dots.figureY[index] * sway.cosLean - depth * sway.sinLean;
                const turnedZ = dots.figureY[index] * sway.sinLean + depth * sway.cosLean;

                x = mix(x, home.x + turnedX * figure.size, amount);
                y = mix(y, home.y + turnedY * figure.size, amount);
                z = mix(z, clamp(turnedZ / figure.depth, -1, 1), amount);
                size = mix(size, 1, amount);
            }

            // Dots near the pointer give way.
            const distance = Math.hypot(x - pointer.x, y - pointer.y);

            if (distance < reach && pointer.strength > 0.01) {
                const push = ((reach - distance) / reach) ** 2 * 0.05 * pointer.strength;

                x += ((x - pointer.x) / (distance || 1)) * push;
                y += ((y - pointer.y) / (distance || 1)) * push;
            }

            if (hold.charge > 0.001) {
                const fromPress = Math.hypot(x - hold.x, y - hold.y);

                if (fromPress < press.reach) {
                    const pull = Math.min((1 - fromPress / press.reach) * press.pull * hold.charge, fromPress * 0.8);

                    x -= ((x - hold.x) / (fromPress || 1)) * pull;
                    y -= ((y - hold.y) / (fromPress || 1)) * pull;
                }
            }

            for (const ripple of ripples) {
                const fromClick = Math.hypot(x - ripple.x, y - ripple.y);
                const ring = Math.exp(-(((fromClick - ripple.age * pulse.speed) / pulse.width) ** 2));
                const push = ring * pulse.strength * ripple.power * (1 - ripple.age / pulse.life);

                x += ((x - ripple.x) / (fromClick || 1)) * push;
                y += ((y - ripple.y) / (fromClick || 1)) * push;
            }

            if (scattered > 0.001) {
                x += (x - home.x) * scattered * scatter.reach;
                y += (y - home.y) * scattered * scatter.reach;
            }

            dots.x[index] = x;
            dots.y[index] = y;
            dots.z[index] = z;
            dots.scale[index] = size;
            dots.level[index] = Math.min(Math.floor(((z + 1) / 2) * tint.levels), tint.levels - 1);
        }
    };

    // From the far dots to the near ones, one tint level and one fill color per pass.
    const paint = () => {
        context.clearRect(0, 0, width, height);

        for (let level = 0; level < tint.levels; level += 1) {
            const lightness = (level / (tint.levels - 1)) * tint.lightest;

            context.fillStyle = `rgb(${color.map((channel) => Math.round(mix(channel, 255, lightness))).join(' ')})`;

            for (let index = 0; index < dotCount; index += 1) {
                if (dots.level[index] !== level) {
                    continue;
                }

                const closeness = (dots.z[index] + 1) / 2;

                context.globalAlpha = (0.3 + closeness * closeness * 0.7) * (1 - scattered);
                context.beginPath();
                context.arc(
                    dots.x[index] * unit,
                    dots.y[index] * unit,
                    unit * (0.0012 + closeness * 0.0026) * dots.scale[index],
                    0,
                    Math.PI * 2,
                );
                context.fill();
            }
        }
    };

    // The sphere keeps its own clock, so it resumes where it paused instead of jumping ahead.
    const draw = (time) => {
        const delta = Math.min((time - previousTime) / 1000, 0.1);

        previousTime = time;
        clock += delta;
        hold.charge = approach(hold.charge, hold.down ? 1 : 0, hold.down ? press.chargeRate : press.releaseRate, delta);

        for (let index = ripples.length - 1; index >= 0; index -= 1) {
            ripples[index].age += delta;

            if (ripples[index].age >= pulse.life) {
                ripples.splice(index, 1);
            }
        }

        pointer.x = approach(pointer.x, pointer.targetX, 5, delta);
        pointer.y = approach(pointer.y, pointer.targetY, 5, delta);
        pointer.strength = approach(pointer.strength, pointer.targetStrength, 3.6, delta);
        shape = approach(shape, targetShape, 8, delta);
        standing = approach(standing, targetStanding, stand.rate, delta);
        level = approach(level, anchor ? levelOf(anchor) : stand.level, stand.follow, delta);
        color.forEach((channel, index) => {
            color[index] = approach(channel, targetColor[index], 6, delta);
        });
        scattered = approach(scattered, targetScattered, targetScattered ? scatter.leaveRate : scatter.arriveRate, delta);

        if (shapes.length > 1) {
            const next = shapes[Math.floor((clock - since) / sequence.dwell) % shapes.length];

            if (next !== figurePoints) {
                figurePoints = next;
                glideRate = sequence.cycle;
            }
        }

        position(clock, delta);
        paint();
    };

    const loop = (time) => {
        draw(time);
        frame = window.requestAnimationFrame(loop);
    };

    const update = () => {
        window.cancelAnimationFrame(frame);

        if (reducedMotion || !visible || document.hidden) {
            draw(previousTime);

            return;
        }

        frame = window.requestAnimationFrame((time) => {
            previousTime = time;
            loop(time);
        });
    };

    const resize = () => {
        scale = Math.min(window.devicePixelRatio, 2);
        width = Math.round(canvas.clientWidth * scale);
        height = Math.round(canvas.clientHeight * scale);
        unit = (fit
            ? Math.min(width, height) / (figure.size * figure.extent)
            : Math.min(height * unitOf.height, width * unitOf.width, unitOf.largest * scale)) || 1;
        canvas.width = width;
        canvas.height = height;
        update();
    };

    // A pointer event's position in units from the canvas corner.
    const locate = (event) => {
        const bounds = canvas.getBoundingClientRect();
        const cssUnit = unit / scale;

        return { x: (event.clientX - bounds.left) / cssUnit, y: (event.clientY - bounds.top) / cssUnit };
    };

    const probe = (clientX, clientY) => {
        const { x, y } = locate({ clientX, clientY });
        let close = 0;

        for (let index = 0; index < dotCount && close < opening.dots; index += 1) {
            close += Math.hypot(dots.x[index] - x, dots.y[index] - y) < reach * 1.5 ? 1 : 0;
        }

        return close < opening.dots ? 0 : (opening.share * 2 * reach * unit) / scale;
    };

    // The pointer arrives where it is instead of sweeping in.
    const follow = (event) => {
        const { x, y } = locate(event);

        pointer.targetX = x;
        pointer.targetY = y;

        if (hold.down) {
            hold.x = x;
            hold.y = y;
        }

        if (pointer.targetStrength === 0) {
            pointer.x = pointer.targetX;
            pointer.y = pointer.targetY;
        }

        pointer.targetStrength = 1;
    };

    const release = () => {
        pointer.targetStrength = 0;
    };

    const ring = (x, y, power) => {
        ripples.push({ x, y, power, age: 0 });
        ripples.splice(0, ripples.length - pulse.most);
    };

    const pressDown = (event) => {
        if (event.pointerType === 'mouse') {
            Object.assign(hold, locate(event), { down: true });
            ring(hold.x, hold.y, 1);
        }
    };

    const pressUp = () => {
        if (hold.down) {
            hold.down = false;
            ring(hold.x, hold.y, hold.charge * press.boost);
        }
    };

    // While no element that names a figure is hovered or focused, the one marked as resting holds
    // its figure; the chapter of a page names its figure only for that, not for a hover. An
    // element that names several figures starts with the first whenever the sphere turns to it. An
    // element may also name the color of its figure (`--dot-orb-rgb`), and the resting one where
    // the sphere stands (`--dot-orb-x`); the sphere then keeps level with it. The dots keep the
    // last figure while they return to the sphere.
    const react = (target) => {
        const resting = document.querySelector('[data-dot-orb-resting]');
        const element = (target instanceof Element ? target.closest('[data-dot-orb-figure]:not([data-chapter])') : null)
            ?? resting;
        const named = (element?.dataset.dotOrbFigure ?? '').split(' ')
            .map((name) => figures.get(name))
            .filter((points) => points?.length);
        const tone = named.length ? getComputedStyle(element).getPropertyValue('--dot-orb-rgb').trim() : '';
        const share = resting ? Number.parseFloat(getComputedStyle(resting).getPropertyValue('--dot-orb-x')) : NaN;

        pointed = target;
        targetShape = named.length ? 1 : 0;
        targetColor = (tone ? readChannels(tone) : accent()) ?? targetColor;
        targetStanding = Number.isFinite(share) ? share : stand.share;
        anchor = Number.isFinite(share) ? resting.querySelector('[data-dot-orb-place]') ?? resting : null;

        if (element !== shown) {
            shown = element;
            since = clock;
            glideRate = sequence.hover;
        }

        shapes = named;

        if (named.length) {
            figurePoints = named[Math.floor((clock - since) / sequence.dwell) % named.length];
        }
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
    });
    const options = { signal: listeners.signal };

    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    document.addEventListener('visibilitychange', update, options);

    if (!reducedMotion) {
        for (const [name, drawFigure] of Object.entries(drawnFigures)) {
            figures.set(name, sampleFigure(drawFigure));
        }

        // The sphere starts where it belongs instead of gliding there.
        react(null);
        standing = targetStanding;
        level = anchor ? levelOf(anchor) : stand.level;

        if (canvas.dataset.mark) {
            const image = document.createElement('img');

            image.addEventListener('load', () => {
                figures.set('mark', sampleFigure((figureContext, size) => figureContext.drawImage(image, 0, 0, size, size)));
                react(pointed);
            }, options);
            image.src = canvas.dataset.mark;
        }

        openings.add(probe);
        window.addEventListener('pointermove', follow, { ...options, passive: true });
        document.documentElement.addEventListener('pointerleave', release, options);
        window.addEventListener('pointerdown', pressDown, { ...options, passive: true });
        window.addEventListener('pointerup', pressUp, { ...options, passive: true });
        window.addEventListener('pointercancel', pressUp, { ...options, passive: true });
        document.addEventListener('pointerover', (event) => {
            if (event.pointerType === 'mouse') {
                react(event.target);
            }
        }, options);
        document.addEventListener('focusin', (event) => {
            react(event.target.matches(':focus-visible') ? event.target : null);
        }, options);
        document.addEventListener('focusout', () => react(null), options);
        document.addEventListener(chapterChangedEvent, () => react(pointed), options);
        document.addEventListener('portfolio:before-navigation', () => {
            targetScattered = 1;
        }, options);
        document.addEventListener(transitionFinishedEvent, () => {
            targetScattered = 0;
        }, options);
    }

    return () => {
        window.cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        listeners.abort();
        openings.delete(probe);
    };
};

export const createDotOrbController = ({ reducedMotion }) => {
    let cleanups = [];

    const initialize = (arriving) => {
        cleanups.forEach((cleanup) => cleanup());
        cleanups = [...document.querySelectorAll('[data-dot-orb]')]
            .map((canvas) => initializeOrb(canvas, reducedMotion, arriving));
    };

    return {
        initialize: () => {
            initialize(false);
            document.addEventListener('portfolio:page-swapped', () => initialize(true));
        },
    };
};
