// The eyes of the mark: the two holes its drawing leaves (public/brand/mark.svg). As a figure
// of dots they look where the pointer is, and they blink. Both only move the dots around a
// hole, so the hole moves or closes: a dot at the rim of an eye moves all the way, one further
// out less, and one `reach` rims away not at all.
//
// Lengths are those of a figure: its square is 1 wide and high around its middle.
import { clamp, mix, smooth } from './dot-orb-math.js';

// Where the eyes are in the drawing, and how far their rim is from their middle.
export const markEyes = {
    middles: [{ x: -0.2883, y: 0.1617 }, { x: -0.0191, y: 0.1617 }],
    rim: { x: 0.0449, y: 0.0813 },
};

const reach = 2.4;

// An eye follows the pointer by at most `far` of its rim, and half as far once the pointer is
// `ease` away. A blink closes the eyes in `close` seconds and opens them in `open`; between two
// blinks pass at least `least` and at most `most` seconds.
const look = { far: { x: 0.6, y: 0.3 }, ease: 0.3 };
const blink = { close: 0.09, open: 0.17, least: 2.6, most: 6.4 };

const pulled = (distance) => distance / (Math.abs(distance) + look.ease);

export const createEyes = () => {
    const { middles, rim } = markEyes;
    const middle = { x: (middles[0].x + middles[1].x) / 2, y: middles[0].y };
    const gaze = { x: 0, y: 0 };
    let lid = 0;
    let blinks = 0;
    let blinkAt = blink.least;

    // Where the eyes look for a pointer at this place of the figure, as far as it counts, and
    // how far they are closed at this time.
    const watch = (pointerX, pointerY, strength, seconds) => {
        gaze.x = pulled(pointerX - middle.x) * look.far.x * rim.x * strength;
        gaze.y = pulled(pointerY - middle.y) * look.far.y * rim.y * strength;

        const since = seconds - blinkAt;

        if (since > blink.close + blink.open) {
            blinks += 1;
            // The pauses differ, spread by the golden ratio.
            blinkAt = seconds + mix(blink.least, blink.most, (blinks * 0.618034) % 1);
        }

        lid = since < 0 || since > blink.close + blink.open
            ? 0
            : Math.min(smooth(clamp(since / blink.close, 0, 1)), 1 - smooth(clamp((since - blink.close) / blink.open, 0, 1)));
    };

    // Moves a point of the figure with the eye it is near.
    const move = (x, y, into) => {
        into.x = x;
        into.y = y;

        for (const eye of middles) {
            const away = Math.hypot((x - eye.x) / rim.x, (y - eye.y) / rim.y);

            if (away < reach) {
                const share = 1 - smooth(clamp((away - 1) / (reach - 1), 0, 1));

                into.x = x + gaze.x * share;
                // The lid draws the rim onto the line through the middle of the eye.
                into.y = eye.y + gaze.y + (y - eye.y - gaze.y * (1 - share)) * (1 - lid * share);
            }
        }
    };

    return { watch, move };
};
