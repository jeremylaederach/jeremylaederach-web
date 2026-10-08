import { openingAt } from './dot-orb-controller.js';

// The site's pointer: a dot at the mouse position and a ring of fine beads around it. Over a small
// control the ring leaves the dot and wraps the control; over the dots of a sphere it is as large as the
// opening they leave. Touch and pen input hide the pointer, and reduced motion keeps the native
// cursor.

// The free ring's diameter in pixels, and the share of it that remains while a button is down.
const freeRing = { size: 34, pressed: 0.76 };

// A control up to this size is wrapped by the ring, with a margin around it.
const wrapLimit = { width: 240, height: 72 };
const ringMargin = 8;
const smallestRadius = 8;

// How far the ring stays with its control while the dot moves inside it: 1 would pin it to the
// control's centre, 0 would let it follow the dot.
const hold = 0.88;

// The ring eases towards its target at this rate per second, which takes about a quarter of a
// second, and its beads keep roughly this distance in pixels.
const settleRate = 16;
const beadSpacing = 4.4;

const approach = (current, target, rate, delta) => current + (target - current) * (1 - Math.exp(-rate * delta));

export const createPointerController = ({ reducedMotion }) => {
    const pointer = document.querySelector('[data-site-pointer]');
    const ringElement = pointer?.querySelector('[data-pointer-ring]');
    const dotElement = pointer?.querySelector('[data-pointer-dot]');
    const ring = { x: 0, y: 0, width: freeRing.size, height: freeRing.size, radius: freeRing.size / 2 };
    const target = { ...ring };
    let frame;
    let previousTime;
    let position;
    let control;
    let controlRadius = smallestRadius;
    let pressed = false;
    let shown = false;

    const controlAt = ({ x, y }) => document.elementFromPoint(x, y)?.closest('a[href], button:not(:disabled)') ?? null;

    // A larger control asks for the ring with `data-pointer-wrap`; the ring then lies on its
    // edges instead of around them.
    const asks = (element) => element.hasAttribute('data-pointer-wrap');
    const wraps = (element, bounds) => bounds.width > 0 && bounds.height > 0
        && (asks(element) || (bounds.width <= wrapLimit.width && bounds.height <= wrapLimit.height));

    // Where the ring belongs for the control under the pointer, if any.
    const aim = () => {
        const element = controlAt(position);
        const bounds = element?.getBoundingClientRect();
        const wrapping = Boolean(element && wraps(element, bounds));
        const margin = wrapping && asks(element) ? 0 : ringMargin;
        const size = (openingAt(position.x, position.y) || freeRing.size) * (pressed ? freeRing.pressed : 1);

        // Styles are read only when the pointer reaches another control.
        if (element && element !== control) {
            const style = getComputedStyle(element);

            pointer.style.setProperty('--pointer-accent', style.getPropertyValue('--control-accent-rgb'));
            controlRadius = Math.max(smallestRadius, Number.parseFloat(style.borderTopLeftRadius) || 0);
        }

        control = element;
        Object.assign(target, wrapping
            ? {
                x: position.x + (bounds.left + bounds.width / 2 - position.x) * hold,
                y: position.y + (bounds.top + bounds.height / 2 - position.y) * hold,
                width: bounds.width + margin,
                height: bounds.height + margin,
                radius: controlRadius,
            }
            : { x: position.x, y: position.y, width: size, height: size, radius: size / 2 });
        pointer.classList.toggle('is-over-control', Boolean(element));
        pointer.classList.toggle('is-wrapping', wrapping);
    };

    const draw = () => {
        const radius = Math.min(ring.radius, ring.width / 2, ring.height / 2);
        const perimeter = 2 * (ring.width + ring.height) - (8 - 2 * Math.PI) * radius;

        ringElement.setAttribute('x', ring.x - ring.width / 2);
        ringElement.setAttribute('y', ring.y - ring.height / 2);
        ringElement.setAttribute('width', ring.width);
        ringElement.setAttribute('height', ring.height);
        ringElement.setAttribute('rx', radius);
        dotElement.setAttribute('cx', position.x);
        dotElement.setAttribute('cy', position.y);

        // The beads are spaced so that a whole number of them fits around the ring.
        pointer.style.setProperty('--pointer-bead-gap', `${perimeter / Math.max(Math.round(perimeter / beadSpacing), 1)}px`);
    };

    // One frame: aim, ease the ring towards its target and stop once it has arrived.
    const step = (time) => {
        frame = undefined;

        if (!position) {
            return;
        }

        const delta = Math.min((time - (previousTime ?? time)) / 1000, 0.1);
        let moving = false;

        previousTime = time;
        aim();

        for (const key of Object.keys(ring)) {
            // The pointer appears where it is instead of sweeping in.
            ring[key] = shown ? approach(ring[key], target[key], settleRate, delta) : target[key];
            moving ||= Math.abs(ring[key] - target[key]) > 0.1;
        }

        draw();
        shown = true;
        document.documentElement.classList.add('has-site-pointer');

        if (moving) {
            frame = window.requestAnimationFrame(step);
        } else {
            previousTime = undefined;
        }
    };

    const schedule = () => {
        if (position && frame === undefined) {
            frame = window.requestAnimationFrame(step);
        }
    };

    const hide = () => {
        window.cancelAnimationFrame(frame);
        frame = undefined;
        previousTime = undefined;
        position = undefined;
        pressed = false;
        shown = false;
        pointer.classList.remove('is-pressed');
        document.documentElement.classList.remove('has-site-pointer');
    };

    const press = (down) => {
        pressed = down;
        pointer.classList.toggle('is-pressed', down);
        schedule();
    };

    const initialize = () => {
        if (reducedMotion || !ringElement || !dotElement) {
            return;
        }

        document.addEventListener('pointermove', (event) => {
            // Actual mouse input also covers trackpads on touch-first laptops.
            if (event.pointerType !== 'mouse') {
                hide();

                return;
            }

            position = { x: event.clientX, y: event.clientY };
            schedule();
        }, { passive: true });

        document.addEventListener('pointerdown', (event) => {
            if (event.pointerType === 'mouse') {
                press(true);
            } else {
                hide();
            }
        }, { passive: true });

        document.addEventListener('pointerup', () => press(false), { passive: true });
        document.addEventListener('pointercancel', hide, { passive: true });
        window.addEventListener('blur', hide);

        document.addEventListener('pointerout', (event) => {
            if (event.pointerType === 'mouse' && !event.relatedTarget) {
                hide();
            }
        }, { passive: true });

        // The control under a resting mouse changes when the page moves or is replaced.
        window.addEventListener('scroll', schedule, { passive: true, capture: true });
        window.addEventListener('resize', schedule, { passive: true });
        document.addEventListener('portfolio:page-swapped', () => {
            control = undefined;
            schedule();
        });
    };

    return { initialize };
};
