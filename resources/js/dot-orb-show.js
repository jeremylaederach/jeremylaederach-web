// What the dots show: the figure of the element the pointer or the focus is on, of the element
// the page rests with, or of a press on the plain sphere, and which of several figures is due.
//
// An element names its figures with `data-dot-orb-figure`, separated by spaces. While no such
// element is hovered or focused, the one marked `data-dot-orb-resting` holds its figure. An
// element that names several figures shows one after the other, each for `dwell` seconds, and
// starts with the first whenever the sphere turns to it.
//
// A press on the dots always moves on to the next shape: a sequence to its next figure, which
// then stays its time; a single figure to the plain sphere behind it, for `dwell` seconds or
// until the next press; and the plain sphere to the next of the figures its stage lists for
// presses (`data-dot-orb-presses`), which stays for `dwell` seconds.
//
// What the dots show by themselves is marked on the page: the element that names that one
// figure, inside the element that lists several or, for a press, inside the page, carries
// `data-dot-orb-shown` while the figure is shown. A word or a tag lights up with its figure.
const dwell = 8;

export const createShow = ({ figures }) => {
    // The element the sphere is with, whether the pointer or the focus is on it, its figures
    // and since when it is shown.
    let element = null;
    let hovered = false;
    let named = [];
    let since = 0;
    // Until when a single figure gives way to the plain sphere.
    let turnedUntil = 0;
    // The figures of the stage for presses, the one a press has called and until when.
    let pressable = [];
    let pressed = -1;
    let pressedUntil = 0;
    // The elements that are marked, for which figure and within what.
    let marked = [];
    let markedName = null;
    let markedIn = null;

    const lookUp = (names = '') => names.split(' ')
        .map((name) => ({ name, points: figures.get(name) }))
        .filter(({ points }) => points?.length);

    const due = (seconds) => Math.floor((seconds - since) / dwell) % named.length;

    // Marks the elements that name a figure the dots show by themselves, within `scope`.
    const mark = (figure, scope) => {
        const name = figure && scope ? figure.name : null;
        const within = name ? scope : null;

        if (name === markedName && within === markedIn) {
            return;
        }

        marked.forEach((entry) => entry.removeAttribute('data-dot-orb-shown'));
        marked = name
            ? [...within.querySelectorAll('[data-dot-orb-figure]')].filter((entry) => entry.dataset.dotOrbFigure === name)
            : [];
        marked.forEach((entry) => entry.setAttribute('data-dot-orb-shown', ''));
        markedName = name;
        markedIn = within;
    };

    // The sphere turns to what the pointer or the focus is on, or to what the page rests with.
    const turnTo = (target, seconds) => {
        const over = target instanceof Element ? target.closest('[data-dot-orb-figure]') : null;
        const next = over ?? document.querySelector('[data-dot-orb-resting]');

        hovered = Boolean(over);
        named = lookUp(next?.dataset.dotOrbFigure);

        if (next !== element) {
            element = next;
            since = seconds;
            turnedUntil = 0;
        }
    };

    // The stage of the page that is now in place lists the figures for presses.
    const enter = (stage) => {
        pressable = lookUp(stage?.dataset.dotOrbPresses);
        pressed = -1;
        pressedUntil = 0;
    };

    // A press on the dots moves on to the next shape.
    const press = (seconds) => {
        if (named.length > 1) {
            since = seconds - (due(seconds) + 1) * dwell;
        } else if (named.length === 1) {
            turnedUntil = seconds < turnedUntil ? 0 : seconds + dwell;
        } else if (pressable.length) {
            pressed = (pressed + 1) % pressable.length;
            pressedUntil = seconds + dwell;
        }
    };

    // The figure the dots show at this time, with its name and its points, or null for the
    // plain sphere.
    const current = (seconds) => {
        if (named.length > 1) {
            const figure = named[due(seconds)];

            mark(figure, element);

            return figure;
        }

        if (named.length === 1) {
            mark(null);

            return seconds >= turnedUntil ? named[0] : null;
        }

        const figure = seconds < pressedUntil ? pressable[pressed] : null;

        mark(figure, document.querySelector('[data-page-main]'));

        return figure;
    };

    return {
        turnTo,
        enter,
        press,
        current,
        // Whether the pointer or the focus is on what the dots show.
        hovered: () => hovered,
        // The element whose color the dots take: the one that names the figure they show.
        source: () => marked[0] ?? (named.length ? element : null),
    };
};
