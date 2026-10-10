// Where the sphere stands: the stage of the page on the canvas, the way there from the last
// stage, and where the dots recede for a text.
//
// The canvas lies over the first screen of every page and stays through a page change. A page
// marks where the sphere stands with a stage (`data-dot-orb-stage`). A stage marked
// `data-dot-orb-fit` is a square: the sphere stands still in its middle and a figure fills its
// smaller side. A stage marked as pinned stays in the window while its page scrolls, and so
// does the canvas.
import { approach, clamp, mix } from './dot-orb-math.js';

// Lengths are in units. One unit is the sphere's box, which follows the size of its stage.
const unitOf = { height: 1, width: 0.7, largest: 1040 };

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

// `figureShare` is the share of a unit that a figure fills, which a fitted stage is sized by.
export const createStage = ({ canvas, reducedMotion, figureShare }) => {
    // The stage and its kind, its size in canvas pixels, the pixels of one unit, where its
    // corner lies on the canvas, and the canvas pixels of one pixel of the page.
    const stage = { element: null, fit: false, pinned: false, width: 0, height: 0, unit: 1, originX: 0, originY: 0, scale: 1 };
    // The unit the stage asks for once the sphere has arrived.
    let size = 1;
    // What is left of the way from the last stage: in pixels, as a ratio of the units, and the
    // share of both that is still to go.
    const way = { x: 0, y: 0, zoom: 1, left: 0 };
    // Where the dots recede, in canvas pixels, how much of them is left there, whether the
    // stage of this page asks for it, and how far it has faded in.
    const veil = { asked: false, down: false, begin: 0, end: 1, level: 1, from: 0, to: 0, shown: 0 };

    // Where the stage lies on the canvas right now. Both are read in every frame: a stage moves
    // with its page while that page is revealed or leaves.
    const measure = () => {
        const bounds = stage.element.getBoundingClientRect();
        const around = canvas.getBoundingClientRect();

        stage.width = bounds.width * stage.scale;
        stage.height = bounds.height * stage.scale;
        size = (stage.fit
            ? Math.min(stage.width, stage.height) / figureShare
            : Math.min(stage.height * unitOf.height, stage.width * unitOf.width, unitOf.largest * stage.scale)) || 1;
        stage.unit = size * mix(1, way.zoom, way.left);
        stage.originX = (bounds.left - around.left) * stage.scale + way.x * way.left;
        stage.originY = (bounds.top - around.top) * stage.scale + way.y * way.left;

        if (veil.asked) {
            const start = (veil.down ? bounds.top - around.top : bounds.left - around.left) * stage.scale;
            const length = veil.down ? stage.height : stage.width;

            veil.from = start + veil.begin * length;
            veil.to = start + veil.end * length;
        }
    };

    // What the stage says about where its dots recede.
    const readVeil = () => {
        const [side, begin, end, level] = getComputedStyle(stage.element).getPropertyValue('--dot-orb-fade').trim().split(/\s+/);

        veil.asked = side === 'left' || side === 'down';

        if (veil.asked) {
            Object.assign(veil, { down: side === 'down', begin: Number(begin), end: Number(end), level: Number(level) });
        }
    };

    // Takes the stage of the page that is now in place, if it has one.
    const take = () => {
        stage.element = document.querySelector('[data-dot-orb-stage]');
        stage.fit = Boolean(stage.element?.hasAttribute('data-dot-orb-fit')) && !reducedMotion;
        stage.pinned = stage.element?.dataset.dotOrbStage === 'pinned';
        veil.asked = false;

        if (stage.element) {
            readVeil();
            way.left = 0;
        }
    };

    // Where a place of the stage, given in units, lies on the canvas, and the unit there.
    const onCanvas = ({ x, y }) => ({ x: stage.originX + x * stage.unit, y: stage.originY + y * stage.unit, unit: stage.unit });

    // The sphere comes from where it stood on the last stage, `from`, to where it stands on
    // this one, `to`, in units: the whole way is still to go.
    const comeFrom = (from, to) => {
        const arrived = onCanvas(to);

        way.x = from.x - arrived.x;
        way.y = from.y - arrived.y;
        way.zoom = from.unit / size;
        way.left = 1;
        measure();
    };

    const resize = () => {
        if (stage.element) {
            readVeil();
        }

        stage.scale = Math.min(window.devicePixelRatio, 2);
    };

    const step = (delta) => {
        way.left = approach(way.left, 0, journey.rate, delta);
        veil.shown = approach(veil.shown, veil.asked ? 1 : 0, fade.rate, delta);

        // A stage that has just been replaced is measured again once the next page is in place.
        if (stage.element?.isConnected) {
            measure();
        }
    };

    // Whether the sphere is still on its way, and what that moves a dot of this pace by.
    const travelling = () => way.left > 0.001;
    const trail = (pace, dot) => {
        const behind = way.left ** (pace ** journey.stretch) - way.left;

        dot.x += (way.x * behind) / stage.unit;
        dot.y += (way.y * behind) / stage.unit;
    };

    // Whether dots recede on this stage, and how much of a dot at this place of the canvas
    // shows.
    const veiled = () => veil.shown > 0.001;
    const shownAt = (x, y) => {
        const along = clamp(((veil.down ? y : x) - veil.from) / (veil.to - veil.from || 1), 0, 1);

        return mix(1, veil.down ? mix(1, veil.level, along) : mix(veil.level, 1, along), veil.shown);
    };

    // A pointer event's position in units from the corner of the stage.
    const locate = (event) => {
        const around = canvas.getBoundingClientRect();

        return {
            x: ((event.clientX - around.left) * stage.scale - stage.originX) / stage.unit,
            y: ((event.clientY - around.top) * stage.scale - stage.originY) / stage.unit,
        };
    };

    return Object.assign(stage, { take, measure, onCanvas, comeFrom, resize, step, travelling, trail, veiled, shownAt, locate });
};
