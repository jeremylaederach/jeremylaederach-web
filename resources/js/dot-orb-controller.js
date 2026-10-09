import { sceneChangedEvent } from './scene-controller.js';
import { createDivision } from './dot-orb-buds.js';
import { drawnFigures } from './dot-orb-figures.js';
import { settle } from './dot-orb-lamp.js';

const dotCount = 1200;
const turnSeconds = 52;
const tilt = 0.42;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));

// Lengths are in units. One unit is the sphere's box, which follows the canvas size.
const unitOf = { height: 1, width: 0.7, largest: 1040 };
const sphereRadius = 0.3;
const reach = 0.08;

// Where the sphere stands: at this share of its canvas' width and height, around which it
// wanders by `wander` of the canvas.
const stand = { share: 0.68, level: 0.5, wander: 0.1 };

// A click sends a ring outwards through the dots: how fast it travels and how wide it is, in
// units, how far it pushes a dot, how many seconds it lasts and how many rings travel at once.
const pulse = { speed: 1.5, width: 0.1, strength: 0.07, life: 1.1, most: 6 };

// A held press gathers the dots within reach towards the pointer and charges up; letting go
// releases a ring that is stronger the longer the press lasted.
const press = { reach: 0.5, pull: 0.24, chargeRate: 1.5, releaseRate: 7, boost: 2.2 };

// Nearer dots are a lighter tint of the accent, in steps small enough to pass for a gradient.
const tint = { levels: 8, lightest: 0.42 };

// A bud is a smaller sphere that leaves the main one for a while, like a blob in a lava lamp: it
// grows out of the sphere, drifts beside it, rises and sinks over the height of the canvas and
// melts back into it (see dot-orb-lamp.js for how their surfaces join). A quarter of the dots is
// the core and never leaves; every bud takes another quarter, the dots beside it at that moment
// (see dot-orb-buds.js), and turns `turn` further than the sphere. The buds have their own size,
// their own side and their own cycles, in seconds, and start inside the sphere. A bud is on its
// way out or back for `transit` of its period. The first entry stands for the core.
const bud = {
    margin: 0.2,
    travel: 0.3,
    turn: 2.1,
    transit: 0.12,
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
// other, each for `dwell` seconds. A press on the dots always moves on to the next shape: the
// next figure of several, and where there is one figure or none, the other side of what is
// shown, which stays for `dwell` seconds: the plain sphere behind a figure, the mark behind
// the plain sphere. The dots flow from shape to shape like the blobs of a lava lamp: at `hover`
// per second when the pointer moves on to another element, at `rest` when the element the
// sphere rests with changes or a press moves on, and at `cycle` when a sequence steps by
// itself. Every dot has a pace of its own, between `slowest` and `fastest` of that rate, so a
// shape melts into the next instead of jumping.
const sequence = { dwell: 8, hover: 9, rest: 3, cycle: 1.6, slowest: 0.7, fastest: 1.5 };

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

// The sphere stays through a page change and travels to where the next page wants it, at
// `rate` per second.
const journey = { rate: 3.4 };

// On a page without a stage the dots scatter away from the middle of the sphere and fade; the
// next page with one gathers them again. `reach` is how far they travel, in multiples of their
// distance from the middle.
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
    radius: group?.radius ?? 0,
    out: 0,
    rising: false,
    x: 0,
    y: 0,
    axis: { x: 0, y: 0, z: 0 },
}));

// The places on a bud, in the frame of the sphere's lattice: a lattice of its own, turned on.
const createSeats = (count, turn) => createLattice(count).map(({ x, y, z }) => ({
    x: x * Math.cos(turn) + z * Math.sin(turn),
    y,
    z: z * Math.cos(turn) - x * Math.sin(turn),
}));

const initializeOrb = (canvas, reducedMotion) => {
    const context = canvas.getContext('2d');
    // The accent the page is heading for; the accent in use may still be blending towards it.
    const accent = () => readChannels(getComputedStyle(canvas).getPropertyValue('--route-accent-goal'));
    const color = accent() ?? [...white];
    const buds = createBuds();
    const sphere = createLattice(dotCount);
    const leaving = buds.filter((part) => part.group);
    const seats = leaving.map((_, index) => createSeats(dotCount / buds.length, (index + 1) * bud.turn));
    const division = createDivision(sphere, seats);
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
        // The pace of each dot, spread evenly by the golden ratio.
        pace: Float32Array.from({ length: dotCount }, (_, index) => mix(sequence.slowest, sequence.fastest, (index * 0.618034) % 1)),
    };
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, targetStrength: 0 };
    const ripples = [];
    const hold = { x: 0, y: 0, down: false, charge: 0 };
    const home = { x: 0, y: 0 };
    const view = { x: 0, y: 0, z: 0, plainX: 0, plainY: 0 };
    // The sphere itself and the blobs whose surfaces join right now.
    const body = { x: 0, y: 0, radius: sphereRadius };
    const blobs = [];
    const joint = { x: 0, y: 0, z: 0 };
    const spot = { x: 0, y: 0, z: 0 };
    // The canvas lies over the first screen of every page and stays through a page change. A
    // page marks where the sphere stands with a stage (`data-dot-orb-stage`). A stage marked
    // `data-dot-orb-fit` is a square: the sphere stands still in its middle and a figure fills
    // its smaller side. On another stage the sphere wanders slowly around its place.
    let stage = null;
    let fit = false;
    // The stage in canvas pixels: its size, the unit it asks for and where its corner lies.
    let width = 0;
    let height = 0;
    let size = 1;
    let originX = 0;
    let originY = 0;
    // What is left of the way from the last stage: in pixels, as a ratio of the units, and the
    // share of both that is still to go.
    const way = { x: 0, y: 0, zoom: 1, left: 0 };
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
    // Until when the other side of the shown shape stays.
    let turnedUntil = 0;
    let glideRate = sequence.hover;
    let shape = 0;
    let targetShape = 0;
    let targetColor = color;
    let pointed = null;
    let scattered = 0;
    let targetScattered = 0;

    // Turns a lattice point into view space and lets it swell; x and y come back in sphere radii,
    // and once more as they are without the swell.
    const place = (point, rotation, seconds) => {
        const x = point.x * rotation.cosTurn + point.z * rotation.sinTurn;
        const depth = point.z * rotation.cosTurn - point.x * rotation.sinTurn;
        const y = point.y * rotation.cosLean - depth * rotation.sinLean;
        const z = point.y * rotation.sinLean + depth * rotation.cosLean;
        const bulge = swell(x, y, z, seconds);

        view.x = x * bulge;
        view.y = y * bulge;
        view.z = z;
        view.plainX = x;
        view.plainY = y;
    };

    // Where the stage lies on the canvas right now. Both are read in every frame: a stage moves
    // with its page while that page is revealed or leaves.
    const measure = () => {
        const frame = canvas.getBoundingClientRect();
        const bounds = stage.getBoundingClientRect();

        width = bounds.width * scale;
        height = bounds.height * scale;
        size = (fit
            ? Math.min(width, height) / (figure.size * figure.extent)
            : Math.min(height * unitOf.height, width * unitOf.width, unitOf.largest * scale)) || 1;
        unit = size * mix(1, way.zoom, way.left);
        originX = (bounds.left - frame.left) * scale + way.x * way.left;
        originY = (bounds.top - frame.top) * scale + way.y * way.left;
    };

    const wander = (seconds) => {
        home.x = (width * (fit ? 0.5 : stand.share + stand.wander * Math.sin(seconds / 23))) / unit;
        home.y = (height * (fit ? 0.5 : stand.level + stand.wander * Math.sin(seconds / 17))) / unit;
    };

    // Where each bud is right now, how far out of the sphere, and its axis: the way from the
    // middle of the sphere to where the bud is heading, in the frame of the turning lattice as
    // it will stand when the bud is half on its way, because the dots it takes turn on with
    // the sphere while it leaves or lands.
    const arrange = (seconds, turn, lean) => {
        for (const part of leaving) {
            const { offset, period, phase, rise } = part.group;
            const rotation = createRotation(turn + ((period * bud.transit) / 2 / turnSeconds) * Math.PI * 2, lean);
            const cycle = (seconds / period) * Math.PI * 2 + phase;
            const wave = Math.sin(cycle);
            const lift = Math.sin((seconds / rise) * Math.PI * 2 + phase) * bud.travel;
            const x = clamp(home.x + offset, bud.margin, width / unit - bud.margin) - home.x;
            const y = clamp((height / unit) * (0.5 + lift), bud.margin, height / unit - bud.margin) - home.y;
            const length = Math.hypot(x, y) || 1;
            const depth = (y / length) * rotation.sinLean;

            // A bud leaves from the middle of the sphere and returns into it.
            part.out = smooth(clamp((wave - 0.25) / 0.6, 0, 1));
            part.rising = Math.cos(cycle) > 0;
            part.x = home.x + x * part.out;
            part.y = home.y + y * part.out;
            part.axis.x = (x / length) * rotation.cosTurn + depth * rotation.sinTurn;
            part.axis.y = (y / length) * rotation.cosLean;
            part.axis.z = (x / length) * rotation.sinTurn - depth * rotation.cosTurn;
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

        // The sphere and every bud that is out of it are the blobs of the lamp: where they are
        // close, their surfaces join, so a bud grows out of the sphere on a neck and melts back
        // into it. A figure has no blobs.
        blobs.length = 0;

        if (shape < 0.999) {
            Object.assign(body, home, { radius });
            blobs.push(body);

            for (const part of buds) {
                if (part.out > 0.001) {
                    blobs.push(part);
                }
            }
        }

        // The dots are shared out between the sphere and the buds that are out of it.
        division.follow(leaving);

        // Within a figure the dots flow from one shape to the next, each at its own pace; coming
        // from the sphere they head straight for the shape.
        const arriving = shape < 0.02;

        for (let index = 0; index < dotCount; index += 1) {
            spot.x = division.at.x[index];
            spot.y = division.at.y[index];
            spot.z = division.at.z[index];
            place(spot, rotation, seconds);

            let x = home.x + view.x * radius;
            let y = home.y + view.y * radius;
            let z = view.z;
            let size = 1;
            // The radius of the blob the dot sits on, and where it sits on that blob without the
            // swell: the surfaces join on those plain shapes.
            let own = radius;
            const part = buds[division.bud[index]];

            joint.x = home.x + view.plainX * radius;
            joint.y = home.y + view.plainY * radius;
            joint.z = view.z * radius;

            if (part.out > 0.001) {
                const amount = division.away[index];

                // Each bud swells on its own phase.
                place(seats[division.bud[index] - 1][division.seat[index]], rotation, seconds + division.bud[index] * 7);
                x = mix(x, part.x + view.x * part.radius, amount);
                y = mix(y, part.y + view.y * part.radius, amount);
                z = mix(z, view.z, amount);
                size = mix(1, 0.86, amount);
                own = mix(own, part.radius, amount);
                joint.x = mix(joint.x, part.x + view.plainX * part.radius, amount);
                joint.y = mix(joint.y, part.y + view.plainY * part.radius, amount);
                joint.z = mix(joint.z, view.z * part.radius, amount);
            }

            if (blobs.length > 1) {
                const { x: plainX, y: plainY, z: plainZ } = joint;

                settle(joint, blobs);
                x += joint.x - plainX;
                y += joint.y - plainY;
                z = clamp(z + (joint.z - plainZ) / own, -1, 1);
            }

            if (figurePoints.length) {
                const point = figurePoints[index % figurePoints.length];
                const glide = arriving ? 1 : 1 - Math.exp(-glideRate * dots.pace[index] * delta);

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
    // Everything is drawn from the corner of the stage.
    const paint = () => {
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
        way.left = approach(way.left, 0, journey.rate, delta);

        // A stage that has just been replaced is measured again once the next page is in place.
        if (stage?.isConnected) {
            measure();
        }

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
    const moving = () => !reducedMotion && !document.hidden && (stage ? visible : scattered < 0.999);

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
        scale = Math.min(window.devicePixelRatio, 2);
        canvas.width = Math.round(canvas.clientWidth * scale);
        canvas.height = Math.round(canvas.clientHeight * scale);
        update();
    };

    // A pointer event's position in units from the corner of the stage.
    const locate = (event) => {
        const frame = canvas.getBoundingClientRect();

        return {
            x: ((event.clientX - frame.left) * scale - originX) / unit,
            y: ((event.clientY - frame.top) * scale - originY) / unit,
        };
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

    // Which figure of the sequence is due.
    const due = () => Math.floor((clock - since) / sequence.dwell) % shapes.length;

    // What the dots show right now: the figure of a sequence that is due, the one figure, or
    // the plain sphere; and while a press has turned that around, its other side.
    const present = (rate) => {
        const turned = clock < turnedUntil;
        const other = shapes.length ? null : figures.get('mark');
        const next = shapes.length > 1 ? shapes[due()] : shapes[0] ?? (other?.length ? other : null);

        targetShape = next && (shapes.length > 1 || turned === !shapes.length) ? 1 : 0;

        if (next && next !== figurePoints && targetShape) {
            figurePoints = next;
            glideRate = rate;
        }
    };

    const pressDown = (event) => {
        // A press on the dots moves on: to the next figure of a sequence, which then stays its
        // time, or to the other side of what is shown and back.
        if (probe(event.clientX, event.clientY)) {
            if (shapes.length > 1) {
                since = clock - (due() + 1) * sequence.dwell;
            } else {
                turnedUntil = clock < turnedUntil ? 0 : clock + sequence.dwell;
            }

            present(sequence.rest);
        }

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
    // its figure. An element that names several figures starts with the first whenever the sphere
    // turns to it. An element may also name the color of its figure (`--dot-orb-rgb`). The dots
    // keep the last figure while they return to the sphere.
    const react = (target) => {
        const hovered = target instanceof Element ? target.closest('[data-dot-orb-figure]') : null;
        const element = hovered ?? document.querySelector('[data-dot-orb-resting]');
        const named = (element?.dataset.dotOrbFigure ?? '').split(' ')
            .map((name) => figures.get(name))
            .filter((points) => points?.length);
        const tone = named.length ? getComputedStyle(element).getPropertyValue('--dot-orb-rgb').trim() : '';

        pointed = target;
        targetColor = (tone ? readChannels(tone) : accent()) ?? targetColor;
        shapes = named;

        if (element !== shown) {
            shown = element;
            since = clock;
            turnedUntil = 0;
        }

        present(hovered ? sequence.hover : sequence.rest);
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
    });

    // Takes the stage of the page that is now in place. The sphere travels there from where it
    // stands; on a page without a stage the dots scatter.
    const adopt = () => {
        const from = stage ? { x: originX + home.x * unit, y: originY + home.y * unit, unit } : null;

        stage = document.querySelector('[data-dot-orb-stage]');
        fit = Boolean(stage?.hasAttribute('data-dot-orb-fit')) && !reducedMotion;
        targetScattered = stage ? 0 : 1;
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        resizeObserver.observe(canvas);

        if (stage) {
            // A stage that stays in the window while its page scrolls takes the canvas with it.
            canvas.parentElement.toggleAttribute('data-pinned', stage.dataset.dotOrbStage === 'pinned');
            visibilityObserver.observe(stage);
            resizeObserver.observe(stage);
            way.left = 0;
            measure();
            wander(clock);

            if (from && !reducedMotion) {
                way.x = from.x - (originX + home.x * unit);
                way.y = from.y - (originY + home.y * unit);
                way.zoom = from.unit / size;
                way.left = 1;
            }
        }

        react(pointed?.isConnected ? pointed : null);
        update();
    };

    document.addEventListener('visibilitychange', update);
    document.addEventListener('portfolio:page-swapped', adopt);

    if (!reducedMotion) {
        for (const [name, drawFigure] of Object.entries(drawnFigures)) {
            figures.set(name, sampleFigure(drawFigure));
        }

        if (canvas.dataset.mark) {
            const image = document.createElement('img');

            image.addEventListener('load', () => {
                figures.set('mark', sampleFigure((figureContext, size) => figureContext.drawImage(image, 0, 0, size, size)));
                react(pointed);
            });
            image.src = canvas.dataset.mark;
        }

        openings.add(probe);
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
        // A click focuses what it hits without showing a focus; the figure then stays the
        // hovered one.
        document.addEventListener('focusin', (event) => {
            if (event.target.matches(':focus-visible')) {
                react(event.target);
            }
        });
        document.addEventListener('focusout', () => react(null));
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
