import { createAttention } from './dot-orb-attention.js';
import { createDivision } from './dot-orb-division.js';
import { createEyes } from './dot-orb-eyes.js';
import { drawnFigures } from './dot-orb-figures.js';
import { approach, clamp, createLattice, mix, smooth } from './dot-orb-math.js';
import { pairInStrips } from './dot-orb-pairing.js';
import { sampleFigure } from './dot-orb-sampling.js';
import { sceneChangedEvent } from './scene-controller.js';

const dotCount = 1200;
const turnSeconds = 52;
const tilt = 0.42;

// Lengths are in units. One unit is the sphere's box, which follows the size of its stage.
const unitOf = { height: 1, width: 0.7, largest: 1040 };
const sphereRadius = 0.3;
const reach = 0.08;

// Where the sphere stands: at this share of its stage's width and height, around which it
// wanders by `wander` of the stage.
const stand = { share: 0.68, level: 0.5, wander: 0.1 };

// A click sends a ring outwards through the dots: how fast it travels and how wide it is, in
// units, how far it pushes a dot, how many seconds it lasts and how many rings travel at once.
const pulse = { speed: 1.5, width: 0.1, strength: 0.07, life: 1.1, most: 6 };

// A held press gathers the dots within reach towards the pointer and charges up; letting go
// releases a ring that is stronger the longer the press lasted.
const press = { reach: 0.5, pull: 0.24, chargeRate: 1.5, releaseRate: 7, boost: 2.2 };

// Nearer dots are a lighter tint of the accent, in steps small enough to pass for a gradient.
const tint = { levels: 8, lightest: 0.42 };

// Like a blob in a lava lamp the sphere divides: it stretches along the axis it turns around, a
// neck forms and thins, and a bud parts from it, drifts away and comes back (see
// dot-orb-division.js). The first bud is the dots at one end of that axis and sinks, the last
// those at the other end and rises. Each has its share of all the dots and its own slow cycle,
// in seconds, and starts inside the sphere. A bud leaves in one motion: it has divided after
// `parted` of its way out and drifts from `drifting` of it on, up to `drift` radii of the
// sphere, so the neck still thins while the bud already moves away. It stays on the stage:
// `margin` is the room, in units, that stays free at the stage's edges, and `swell` how much
// further the sphere's waves may carry a bud. A bud that has no room to drift stays close, and
// one that has no room to part stays on its neck.
const bud = {
    margin: 0.03,
    swell: 1.12,
    parted: 0.62,
    drifting: 0.38,
    drift: 0.6,
    parts: [
        { share: 0.18, period: 41, phase: 5.42 },
        { share: 0.12, period: 53, phase: 3.9 },
    ],
};

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

// A press on the plain sphere splits it: one more bud parts, which takes `leave` seconds to
// set out and stays for `stay` seconds before it takes `back` seconds to return. A held press
// draws everything together again: within `gather` seconds every bud is back inside, and for
// `calm` seconds after the press none sets out.
const split = { leave: 2.2, stay: 14, back: 3, gather: 1, calm: 6 };

// A held press that is dragged takes a bud along. Once the pointer has moved `start` units from
// where the press began on the plain sphere, the bud that press has called leaves its place on
// the axis, at `take` per second, and follows the pointer at `follow` per second. When the
// press ends it stays out for `linger` seconds and takes `home` seconds back to its place,
// from where it joins the sphere as any bud does.
const carry = { start: 0.05, take: 5, follow: 9, linger: 0.8, home: 1.4 };

// An element can name several figures, separated by spaces. The sphere then shows one after the
// other, each for `dwell` seconds. A press on the dots always breaks up what they show: a
// sequence moves on to its next figure, a single figure gives way to the plain sphere behind
// it for `dwell` seconds, and the plain sphere splits (see `split`). The dots flow from shape
// to shape like the blobs of a lava lamp: at `hover`
// per second when the pointer moves on to another element, at `rest` when the element the
// sphere rests with changes or a press moves on, and at `cycle` when a sequence steps by
// itself. Every dot has a pace of its own, between `slowest` and `fastest` of that rate, so a
// shape melts into the next instead of jumping.
const sequence = { dwell: 8, hover: 9, rest: 3, cycle: 1.6, slowest: 0.7, fastest: 1.5 };

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

// The sphere stays through a page change and travels to where the next page wants it, at
// `rate` per second. Every dot keeps its own pace on that way: the fast ones lead and the slow
// ones trail, the more the larger `stretch` is, so the sphere pours to its new place and
// gathers there.
const journey = { rate: 3.4, stretch: 1.5 };

// A stage can ask the dots to recede where its text stands (`--dot-orb-fade`): "left" dims
// them towards the left edge, "down" towards the lower one, followed by where that begins and
// where it is complete, as shares of the stage, and how much of a dot is left there. When the
// page changes, the dimming fades in or out at `rate` per second.
const fade = { rate: 3 };

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

// A bud as it is right now: how far out its cycle and the presses have it, how far a press has
// called it and until when, how far it has divided from the sphere and how far it has drifted.
const createBuds = () => bud.parts.map((part) => ({ ...part, out: 0, called: 0, calledUntil: 0, parted: 0, gap: 0 }));

const initializeOrb = (canvas, reducedMotion) => {
    const context = canvas.getContext('2d');
    // The accent the page is heading for; the accent in use may still be blending towards it.
    const accent = () => readChannels(getComputedStyle(canvas).getPropertyValue('--route-accent-goal'));
    const color = accent() ?? [...white];
    const buds = createBuds();
    const sphere = createLattice(dotCount);
    const division = createDivision({ first: buds[0].share, last: buds[1].share });
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
    const ripples = [];
    // A held press: where it is and where it began, how far it has charged, and the bud it
    // called from the plain sphere.
    const hold = { x: 0, y: 0, fromX: 0, fromY: 0, down: false, charge: 0, bud: null };
    // How far a held press has drawn the buds in, and until when they stay there.
    let gathered = 0;
    let calmUntil = 0;
    // The bud a dragged press takes along, and whether that press still lasts: where its
    // middle is, how far it has left its place on the axis and how far it had when the press
    // ended, and where its middle lies on the axis, as the view shows it.
    const carried = { part: null, held: false, x: 0, y: 0, amount: 0, left: 0, endedAt: 0, placeX: 0, placeY: 0 };
    // How far the dot that is being placed belongs to that bud.
    let lifted = 0;
    const home = { x: 0, y: 0 };
    // How the sphere stands in this frame: how it and a figure are turned, its time, and
    // whether a figure has formed, which hides the sphere.
    const scene = { rotation: null, sway: null, seconds: 0, formed: false };
    // The dot that is being placed, and what its place is worked out from.
    const dot = { x: 0, y: 0, z: 0 };
    const view = { x: 0, y: 0, z: 0 };
    const spot = { x: 0, y: 0, z: 0 };
    const shaped = { along: 0, around: 0, height: 0, ring: 0 };
    // The canvas lies over the first screen of every page and stays through a page change. A
    // page marks where the sphere stands with a stage (`data-dot-orb-stage`). A stage marked
    // `data-dot-orb-fit` is a square: the sphere stands still in its middle and a figure fills
    // its smaller side. On another stage the sphere wanders slowly around its place. A stage
    // marked as pinned stays in the window while its page scrolls, and so does the canvas.
    let stage = null;
    let fit = false;
    let pinned = false;
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
    // The figures of the element the sphere is with, the one whose dots are placed now, and
    // since when that element is shown.
    let shapes = [];
    let figurePoints = [];
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
    // Where the dots recede, in canvas pixels, how much of them is left there, whether the
    // stage of this page asks for it, and how far it has faded in.
    const veil = { asked: false, down: false, begin: 0, end: 1, level: 1, from: 0, to: 0, shown: 0 };
    // The points on each side of a figure: the even ones lie on its front, the odd ones on its
    // back.
    const sides = new WeakMap();
    // The eyes of the mark, whether the mark is the figure in this frame, and where they move
    // the point that is being placed.
    const eyes = createEyes();
    const looked = { x: 0, y: 0 };
    let watching = false;

    // Turns a point of the lattice's frame into view space.
    const turn = (point, rotation) => {
        const depth = point.z * rotation.cosTurn - point.x * rotation.sinTurn;

        view.x = point.x * rotation.cosTurn + point.z * rotation.sinTurn;
        view.y = point.y * rotation.cosLean - depth * rotation.sinLean;
        view.z = point.y * rotation.sinLean + depth * rotation.cosLean;
    };

    // Where the stage lies on the canvas right now. Both are read in every frame: a stage moves
    // with its page while that page is revealed or leaves.
    const measure = () => {
        const bounds = stage.getBoundingClientRect();
        const around = canvas.getBoundingClientRect();

        width = bounds.width * scale;
        height = bounds.height * scale;
        size = (fit
            ? Math.min(width, height) / (figure.size * figure.extent)
            : Math.min(height * unitOf.height, width * unitOf.width, unitOf.largest * scale)) || 1;
        unit = size * mix(1, way.zoom, way.left);
        originX = (bounds.left - around.left) * scale + way.x * way.left;
        originY = (bounds.top - around.top) * scale + way.y * way.left;

        if (veil.asked) {
            const start = (veil.down ? bounds.top - around.top : bounds.left - around.left) * scale;
            const length = veil.down ? height : width;

            veil.from = start + veil.begin * length;
            veil.to = start + veil.end * length;
        }
    };

    // What the stage says about where its dots recede.
    const readVeil = () => {
        const [side, begin, end, level] = getComputedStyle(stage).getPropertyValue('--dot-orb-fade').trim().split(/\s+/);

        veil.asked = side === 'left' || side === 'down';

        if (veil.asked) {
            Object.assign(veil, { down: side === 'down', begin: Number(begin), end: Number(end), level: Number(level) });
        }
    };

    // How much of a dot at this place of the canvas shows.
    const shownAt = (x, y) => {
        const along = clamp(((veil.down ? y : x) - veil.from) / (veil.to - veil.from || 1), 0, 1);

        return mix(1, veil.down ? mix(1, veil.level, along) : mix(veil.level, 1, along), veil.shown);
    };

    const wander = (seconds) => {
        home.x = (width * (fit ? 0.5 : stand.share + stand.wander * Math.sin(seconds / 23))) / unit;
        home.y = (height * (fit ? 0.5 : stand.level + stand.wander * Math.sin(seconds / 17))) / unit + swayed;
    };

    // How far each bud is out right now: as far as its own cycle or a press says, unless a held
    // press holds it in. It divides from the sphere and drifts as far as the stage has room on
    // its side: the first bud below the sphere, the last above it.
    const arrange = (seconds, lean, delta) => {
        // The room on each side of the sphere's middle, in radii as the screen shows them along
        // the axis.
        const span = sphereRadius * Math.cos(lean) * bud.swell;
        const rooms = [(height / unit - home.y - bud.margin) / span, (home.y - bud.margin) / span];

        // A press that is held in place draws the buds in; one that drags a bud along does not.
        const gathering = (hold.down && !carried.held) || seconds < calmUntil;

        gathered = clamp(gathered + (gathering ? delta / split.gather : -delta / split.back), 0, 1);

        for (const part of buds) {
            const wave = Math.sin((seconds / part.period) * Math.PI * 2 + part.phase);

            part.called = clamp(part.called + (seconds < part.calledUntil ? delta / split.leave : -delta / split.back), 0, 1);
            part.out = Math.max(clamp((wave - 0.25) / 0.6, 0, 1), part.called) * (1 - smooth(gathered));
        }

        // The way a bud may go is worked out first, from where its far end would be with the
        // bud all the way out: it may drift less far, and part less far if that is not enough.
        // The bud then eases along that way, so it slows down before the edge of the stage
        // instead of stopping at it. Twice, because each bud moves the other a little. A bud
        // that is carried has left the axis and parts wherever the sphere stands.
        for (let pass = 0; pass < 2; pass += 1) {
            buds.forEach((part, index) => {
                const other = buds[1 - index];
                const whole = [1, bud.drift];
                const others = [other.parted, other.gap];

                division.arrange(...(index ? others : whole), ...(index ? whole : others));
                division.place(index, shaped);

                const beyond = Math.abs(shaped.along) - rooms[index];
                const closer = clamp(beyond / (1 - part.share), 0, bud.drift);
                const reach = index ? division.reach.last : division.reach.first;
                const fits = clamp(1 - Math.max(beyond - closer * (1 - part.share), 0) / (reach - 1), 0, 1);
                const parts = part === carried.part ? mix(fits, 1, carried.amount) : fits;

                part.parted = parts * smooth(clamp(part.out / bud.parted, 0, 1));
                part.gap = (bud.drift - closer) * smooth(clamp((part.out - bud.drifting) / (1 - bud.drifting), 0, 1));
            });
        }

        division.arrange(buds[0].parted, buds[0].gap, buds[1].parted, buds[1].gap);
    };

    // Where the middle of a bud that is out stands, in units. It swells with the end of the
    // sphere its dots come from.
    const middleOf = (part, into) => {
        const index = buds.indexOf(part);

        spot.x = 0;
        spot.y = index ? -1 : 1;
        spot.z = 0;
        turn(spot, scene.rotation);

        const bulge = swell(view.x, view.y, view.z, scene.seconds);

        spot.y = division.middleOf(index);
        turn(spot, scene.rotation);
        into.x = home.x + view.x * bulge * sphereRadius;
        into.y = home.y + view.y * bulge * sphereRadius;
    };

    // Moves the bud a dragged press has taken along: towards the pointer while the press
    // lasts, and back to its place on the axis when it has ended. The bud stays called for as
    // long as it is held.
    const tow = (seconds, delta) => {
        const { part } = carried;

        if (!part) {
            return;
        }

        if (carried.held) {
            part.calledUntil = seconds + split.leave + carry.linger;
            carried.x = approach(carried.x, hold.x, carry.follow, delta);
            carried.y = approach(carried.y, hold.y, carry.follow, delta);
            carried.amount = approach(carried.amount, 1, carry.take, delta);
        } else {
            carried.amount = carried.left * smooth(clamp(1 - (seconds - carried.endedAt) / carry.home, 0, 1));
        }

        spot.x = 0;
        spot.y = division.middleOf(buds.indexOf(part));
        spot.z = 0;
        turn(spot, scene.rotation);
        carried.placeX = view.x;
        carried.placeY = view.y;

        if (!carried.held && carried.amount === 0) {
            carried.part = null;
        }
    };

    // The dot on the sphere, or on the bud it belongs to: turned with the sphere and swelling
    // with it. The swell is that of the whole sphere at the dot's own place on it, so a neck
    // between two bodies stays closed. A bud that is carried takes its dots with it, and those
    // of its neck as far as they belong to it: they stand around its middle as they did on the
    // axis, so it stays a sphere wherever it is taken.
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

        if (carried.part) {
            lifted = carried.part === buds[0] ? shaped.first : shaped.last;

            const taken = lifted * carried.amount;

            dot.x = mix(dot.x, carried.x + (view.x - carried.placeX) * bulge * sphereRadius, taken);
            dot.y = mix(dot.y, carried.y + (view.y - carried.placeY) * bulge * sphereRadius, taken);
        }
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

            looked.x = dots.figureX[index];
            looked.y = dots.figureY[index];

            if (watching) {
                eyes.move(looked.x, looked.y, looked);
            }

            const turnedX = looked.x * sway.cosTurn + thickness * sway.sinTurn;
            const depth = thickness * sway.cosTurn - looked.x * sway.sinTurn;
            const turnedY = looked.y * sway.cosLean - depth * sway.sinLean;
            const turnedZ = looked.y * sway.sinLean + depth * sway.cosLean;

            dot.x = mix(dot.x, home.x + turnedX * figure.size, amount);
            dot.y = mix(dot.y, home.y + turnedY * figure.size, amount);
            dot.z = mix(dot.z, clamp(turnedZ / figure.depth, -1, 1), amount);
        }
    };

    // What the visitor does to the dot: it gives way to the pointer, unless it belongs to the
    // bud the pointer carries, a held press pulls it in, the rings of presses push it outwards,
    // and a page without a stage scatters it.
    const disturb = () => {
        const distance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);

        if (distance < reach && pointer.strength > 0.01) {
            const push = ((reach - distance) / reach) ** 2 * 0.05 * pointer.strength * (1 - lifted);

            dot.x += ((dot.x - pointer.x) / (distance || 1)) * push;
            dot.y += ((dot.y - pointer.y) / (distance || 1)) * push;
        }

        if (hold.charge > 0.001) {
            const fromPress = Math.hypot(dot.x - hold.x, dot.y - hold.y);

            if (fromPress < press.reach) {
                const pull = Math.min((1 - fromPress / press.reach) * press.pull * hold.charge, fromPress * 0.8);

                dot.x -= ((dot.x - hold.x) / (fromPress || 1)) * pull;
                dot.y -= ((dot.y - hold.y) / (fromPress || 1)) * pull;
            }
        }

        for (const ripple of ripples) {
            const fromClick = Math.hypot(dot.x - ripple.x, dot.y - ripple.y);
            const front = Math.exp(-(((fromClick - ripple.age * pulse.speed) / pulse.width) ** 2));
            const push = front * pulse.strength * ripple.power * (1 - ripple.age / pulse.life);

            dot.x += ((dot.x - ripple.x) / (fromClick || 1)) * push;
            dot.y += ((dot.y - ripple.y) / (fromClick || 1)) * push;
        }

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

        arrange(seconds, lean, delta);
        scene.seconds = seconds;
        scene.formed = formed;
        scene.rotation = createRotation((seconds / turnSeconds) * Math.PI * 2 + leanX * 0.5 * pointer.strength, lean);
        scene.sway = createRotation(
            Math.sin(seconds * 0.5) * figure.sway + leanX * 0.2 * pointer.strength,
            0.1 + leanY * 0.12 * pointer.strength,
        );
        tow(seconds, delta);
    };

    const position = (seconds, delta) => {
        compose(seconds, shape > 0.999, delta);
        watching = shape > 0.001 && figurePoints === figures.get('mark');

        // The mark looks at the pointer, from where its eyes are in the figure.
        if (watching) {
            eyes.watch((pointer.x - home.x) / figure.size, (pointer.y - home.y) / figure.size, pointer.strength, seconds);
        }

        for (let index = 0; index < dotCount; index += 1) {
            lifted = 0;

            if (scene.formed) {
                Object.assign(dot, home, { z: 0 });
            } else {
                onSphere(index);
            }

            intoFigure(index, delta);
            disturb();

            if (way.left > 0.001) {
                const behind = way.left ** (dots.pace[index] ** journey.stretch) - way.left;

                dot.x += (way.x * behind) / unit;
                dot.y += (way.y * behind) / unit;
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
                const visible = veil.shown > 0.001
                    ? shownAt(originX + dots.x[index] * unit, originY + dots.y[index] * unit)
                    : 1;

                context.globalAlpha = (0.3 + closeness * closeness * 0.7) * (1 - scattered) * visible;
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

    const ring = (x, y, power) => {
        ripples.push({ x, y, power, age: 0 });
        ripples.splice(0, ripples.length - pulse.most);
    };

    // Which figure of the sequence is due.
    const due = () => Math.floor((clock - since) / sequence.dwell) % shapes.length;

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

    // What the dots show right now: the figure of a sequence that is due, the one figure, or
    // the plain sphere, which a single figure also gives way to while a press has broken it
    // up. A new figure is flowed into at `rate`.
    const present = (rate) => {
        const next = shapes.length > 1 ? shapes[due()] : shapes[0] ?? null;
        const showing = Boolean(next) && (shapes.length > 1 || clock >= turnedUntil);

        if (showing && (next !== figurePoints || (!targetShape && shape < 0.02))) {
            turnTo(next);
            figurePoints = next;
            glideRate = rate;
        } else if (!showing && targetShape && shape > 0.98) {
            letGo();
        }

        targetShape = showing ? 1 : 0;
    };

    // What the sphere notices of the visitor in this frame.
    const attend = (delta) => {
        const noticed = attention.read(delta);
        const sway = pinned ? clamp(-noticed.scrolling * notice.sway, -notice.swing, notice.swing) : 0;

        heading.x = approach(heading.x, (noticed.headingX * scale * notice.ahead) / unit, 6, delta);
        heading.y = approach(heading.y, (noticed.headingY * scale * notice.ahead) / unit, 6, delta);
        scrolling = noticed.scrolling;
        swayed = approach(swayed, sway, 6, delta);

        if (noticed.returned) {
            ring(home.x, home.y, notice.greeting);
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

        if (attention) {
            attend(delta);
        }

        for (let index = ripples.length - 1; index >= 0; index -= 1) {
            ripples[index].age += delta;

            if (ripples[index].age >= pulse.life) {
                ripples.splice(index, 1);
            }
        }

        // A press charges while it is held in place; one that carries a bud lets the dots be.
        const charging = hold.down && !carried.held;

        hold.charge = approach(hold.charge, charging ? 1 : 0, charging ? press.chargeRate : press.releaseRate, delta);
        pointer.x = approach(pointer.x, pointer.targetX, 5, delta);
        pointer.y = approach(pointer.y, pointer.targetY, 5, delta);
        pointer.strength = approach(pointer.strength, pointer.targetStrength, 3.6, delta);
        shape = approach(shape, targetShape, 8, delta);
        color.forEach((channel, index) => {
            color[index] = approach(channel, targetColor[index], 6, delta);
        });
        scattered = approach(scattered, targetScattered, targetScattered ? scatter.leaveRate : scatter.arriveRate, delta);
        veil.shown = approach(veil.shown, veil.asked ? 1 : 0, fade.rate, delta);

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
        if (stage) {
            readVeil();
        }

        scale = Math.min(window.devicePixelRatio, 2);
        canvas.width = Math.round(canvas.clientWidth * scale);
        canvas.height = Math.round(canvas.clientHeight * scale);
        update();
    };

    // A pointer event's position in units from the corner of the stage.
    const locate = (event) => {
        const around = canvas.getBoundingClientRect();

        return {
            x: ((event.clientX - around.left) * scale - originX) / unit,
            y: ((event.clientY - around.top) * scale - originY) / unit,
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

            // A press that moves away from where it began takes the bud it called along,
            // from where that bud is.
            if (hold.bud && !carried.part && Math.hypot(x - hold.fromX, y - hold.fromY) > carry.start) {
                carried.part = hold.bud;
                carried.held = true;
                carried.amount = 0;
                middleOf(hold.bud, carried);
            }
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

    // The plain sphere divides once more: the next bud that is inside parts from it. With both
    // out, a press keeps them out for a while longer. Answers the bud the press has called:
    // the one that parts, or the one nearest to the press.
    const shed = ({ x, y }) => {
        const inside = buds.find((part) => part.out < 0.05 && clock >= part.calledUntil);

        for (const part of inside ? [inside] : buds) {
            part.calledUntil = clock + split.leave + split.stay;
        }

        const away = buds.map((part) => {
            middleOf(part, dot);

            return Math.hypot(dot.x - x, dot.y - y);
        });

        return inside ?? buds[away[0] <= away[1] ? 0 : 1];
    };

    const pressDown = (event) => {
        const place = locate(event);
        let called = null;

        // A press on the dots breaks up what they show: a sequence moves on to its next figure,
        // which then stays its time, a single figure gives way to the sphere behind it and
        // comes back with the next press, and the plain sphere splits.
        if (probe(event.clientX, event.clientY)) {
            if (shapes.length > 1) {
                since = clock - (due() + 1) * sequence.dwell;
            } else if (shapes.length === 1) {
                turnedUntil = clock < turnedUntil ? 0 : clock + sequence.dwell;
            } else {
                called = shed(place);
            }

            present(sequence.rest);
        }

        if (event.pointerType === 'mouse') {
            Object.assign(hold, place, { fromX: place.x, fromY: place.y, down: true, bud: called });
            ring(hold.x, hold.y, 1);
        }
    };

    const pressUp = () => {
        if (!hold.down) {
            return;
        }

        // A bud that was carried stays out a moment and then finds its way back.
        if (carried.held) {
            carried.held = false;
            carried.part.calledUntil = clock + carry.linger;
            carried.left = carried.amount;
            carried.endedAt = clock;
        }

        // A press that was held has drawn the buds in: none is called out any more, and they
        // stay inside for a while.
        if (gathered > 0.6) {
            calmUntil = clock + split.calm;

            for (const part of buds) {
                part.calledUntil = 0;
            }
        }

        hold.down = false;
        ring(hold.x, hold.y, hold.charge * press.boost);
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

        // The dots keep the pace of a visitor who scrolls briskly through the scenes.
        present(hovered
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
        const from = stage ? { x: originX + home.x * unit, y: originY + home.y * unit, unit } : null;

        stage = document.querySelector('[data-dot-orb-stage]');
        fit = Boolean(stage?.hasAttribute('data-dot-orb-fit')) && !reducedMotion;
        pinned = stage?.dataset.dotOrbStage === 'pinned';
        targetScattered = stage ? 0 : 1;
        veil.asked = false;
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        resizeObserver.observe(canvas);

        if (stage) {
            readVeil();
            canvas.parentElement.toggleAttribute('data-pinned', pinned);
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
                measure();
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
