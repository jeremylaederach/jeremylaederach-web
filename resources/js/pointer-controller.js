// The site's pointer: a dot at the mouse position and a ring that grows out of it to wrap the
// control underneath. Touch and pen input hide it, and reduced motion keeps the native cursor.

// A control up to this size is wrapped; a larger one asks for it with `data-pointer-wrap`.
const wrapLimit = { width: 240, height: 72 };
const ringMargin = 8;
const smallestRadius = 8;

// How far the ring stays with its control while the dot moves inside it: 1 would pin it to the
// control's centre, 0 would let it follow the dot.
const hold = 0.88;

export const createPointerController = ({ reducedMotion }) => {
    const pointer = document.querySelector('[data-site-pointer]');
    let frame;
    let position;
    let control;

    const controlAt = ({ x, y }) => document.elementFromPoint(x, y)?.closest('a[href], button:not(:disabled)') ?? null;

    const wraps = (target, bounds) => bounds.width > 0 && bounds.height > 0
        && (target.hasAttribute('data-pointer-wrap') || (bounds.width <= wrapLimit.width && bounds.height <= wrapLimit.height));

    const set = (name, value) => pointer.style.setProperty(`--pointer-${name}`, value);

    const update = () => {
        frame = undefined;

        if (!position) {
            return;
        }

        const target = controlAt(position);
        const bounds = target?.getBoundingClientRect();
        const wrapping = Boolean(target && wraps(target, bounds));

        set('x', `${position.x}px`);
        set('y', `${position.y}px`);
        set('ring-x', `${wrapping ? position.x + (bounds.left + bounds.width / 2 - position.x) * hold : position.x}px`);
        set('ring-y', `${wrapping ? position.y + (bounds.top + bounds.height / 2 - position.y) * hold : position.y}px`);

        if (wrapping) {
            set('ring-width', `${bounds.width + ringMargin}px`);
            set('ring-height', `${bounds.height + ringMargin}px`);
        }

        // Styles are read only when the pointer reaches another control.
        if (target && target !== control) {
            const style = getComputedStyle(target);

            set('ring-radius', `max(${smallestRadius}px, ${style.borderTopLeftRadius || '0px'})`);
            set('accent', style.getPropertyValue('--pointer-accent-rgb'));
        }

        control = target;
        pointer.classList.toggle('is-over-control', Boolean(target));
        pointer.classList.toggle('is-wrapping', wrapping);
        document.documentElement.classList.add('has-site-pointer');
    };

    const schedule = () => {
        if (position && frame === undefined) {
            frame = window.requestAnimationFrame(update);
        }
    };

    const hide = () => {
        window.cancelAnimationFrame(frame);
        frame = undefined;
        position = undefined;
        pointer.classList.remove('is-pressed');
        document.documentElement.classList.remove('has-site-pointer');
    };

    const follow = (event) => {
        // Actual mouse input also covers trackpads on touch-first laptops.
        if (event.pointerType !== 'mouse') {
            hide();

            return;
        }

        position = { x: event.clientX, y: event.clientY };
        schedule();
    };

    const initialize = () => {
        if (reducedMotion || !(pointer instanceof HTMLElement)) {
            return;
        }

        document.addEventListener('pointermove', follow, { passive: true });

        document.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'mouse') {
                hide();

                return;
            }

            pointer.classList.add('is-pressed');
        }, { passive: true });

        document.addEventListener('pointerup', () => pointer.classList.remove('is-pressed'), { passive: true });
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
