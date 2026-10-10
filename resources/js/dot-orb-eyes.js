// The eyes of the mark: the two holes its drawing leaves (public/brand/mark.svg). In the figure
// of dots each hole holds one large dot of the eye's own shape. The two look where the pointer
// is, as far as their holes leave them room, and they blink.
//
// Lengths are those of a figure: its square is 1 wide and high around its middle.
import { clamp, mix, smooth } from './dot-orb-math.js';

// Where the eyes are in the drawing, and how far their rim is from their middle.
export const markEyes = {
    middles: [{ x: -0.2883, y: 0.1617 }, { x: -0.0191, y: 0.1617 }],
    rim: { x: 0.0449, y: 0.0813 },
};

// A large dot fills `fill` of its hole and moves within the rest, half as far once the pointer
// is `ease` away. A blink flattens the dots to `shut` of their height in `close` seconds and
// opens them in `open`; between two blinks pass at least `least` and at most `most` seconds.
const fill = 0.72;
const look = { ease: 0.3 };
const blink = { close: 0.14, open: 0.28, shut: 0.08, least: 3, most: 7 };

const pulled = (distance) => distance / (Math.abs(distance) + look.ease);

export const createEyes = () => {
    const { middles, rim } = markEyes;
    const between = { x: (middles[0].x + middles[1].x) / 2, y: middles[0].y };
    // The large dots: where their middles are, and half their width and height.
    const eyes = middles.map(() => ({ x: 0, y: 0, width: rim.x * fill, height: rim.y * fill }));
    let blinks = 0;
    let blinkAt = blink.least;

    // The large dots for a pointer at this place of the figure, as far as it counts, at this
    // time.
    const watch = (pointerX, pointerY, strength, seconds) => {
        const since = seconds - blinkAt;
        const blinking = since >= 0 && since <= blink.close + blink.open;

        if (since > blink.close + blink.open) {
            blinks += 1;
            // The pauses differ, spread by the golden ratio.
            blinkAt = seconds + mix(blink.least, blink.most, (blinks * 0.618034) % 1);
        }

        const lid = blinking
            ? Math.min(smooth(clamp(since / blink.close, 0, 1)), 1 - smooth(clamp((since - blink.close) / blink.open, 0, 1)))
            : 0;

        eyes.forEach((eye, index) => {
            eye.x = middles[index].x + pulled(pointerX - between.x) * rim.x * (1 - fill) * strength;
            eye.y = middles[index].y + pulled(pointerY - between.y) * rim.y * (1 - fill) * strength;
            eye.height = rim.y * fill * mix(1, blink.shut, lid);
        });

        return eyes;
    };

    return { watch };
};
