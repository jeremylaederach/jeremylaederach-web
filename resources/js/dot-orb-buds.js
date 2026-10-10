// When the sphere's buds are out, and how far.
//
// Like a blob in a lava lamp the sphere divides: it stretches along the axis it turns around, a
// neck forms and thins, and a bud parts from it, drifts away and comes back (see
// dot-orb-division.js). The first bud is the dots at one end of that axis and sinks, the last
// those at the other end and rises. Each has its share of all the dots and its own slow cycle,
// in seconds, and starts inside the sphere. A bud leaves in one motion: it has divided after
// `parted` of its way out and drifts from `drifting` of it on, up to `drift` radii of the
// sphere, so the neck still thins while the bud already moves away. It stays on the stage:
// `margin` is the room that stays free at the stage's edges, and `swell` how much further the
// sphere's waves may carry a bud. A bud that has no room to drift stays close, and one that has
// no room to part stays on its neck.
import { createDivision } from './dot-orb-division.js';
import { clamp, smooth } from './dot-orb-math.js';

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

// A held press draws everything together: within `gather` seconds every bud is back inside,
// for `calm` seconds after the press none sets out, and then they may leave again, which takes
// `back` seconds.
const held = { gather: 1, calm: 6, back: 3 };

export const createBuds = () => {
    // A bud as it is right now: how far out its cycle has it, how far it has divided from the
    // sphere and how far it has drifted.
    const buds = bud.parts.map((part) => ({ ...part, out: 0, parted: 0, gap: 0 }));
    const division = createDivision({ first: buds[0].share, last: buds[1].share });
    const end = { along: 0, around: 0, height: 0, ring: 0 };
    // How far a held press has drawn the buds in, and until when they stay there.
    let gathered = 0;
    let calmUntil = 0;

    // Sets the division for this moment. Each bud is as far out as its own cycle says, unless
    // a held press holds it in, and goes as far as the stage has room on its side: the first
    // bud below the sphere, the last above it. `below` and `above` are that room from the
    // sphere's middle and `radius` the sphere's own, as the screen shows it along the axis,
    // all in units.
    const arrange = (seconds, delta, { below, above, radius }, pressing) => {
        const rooms = [below, above].map((room) => (room - bud.margin) / (radius * bud.swell));

        gathered = clamp(gathered + (pressing || seconds < calmUntil ? delta / held.gather : -delta / held.back), 0, 1);

        for (const part of buds) {
            const wave = Math.sin((seconds / part.period) * Math.PI * 2 + part.phase);

            part.out = clamp((wave - 0.25) / 0.6, 0, 1) * (1 - smooth(gathered));
        }

        // The way a bud may go is worked out first, from where its far end would be with the
        // bud all the way out: it may drift less far, and part less far if that is not enough.
        // The bud then eases along that way, so it slows down before the edge of the stage
        // instead of stopping at it. Twice, because each bud moves the other a little.
        for (let pass = 0; pass < 2; pass += 1) {
            buds.forEach((part, index) => {
                const other = buds[1 - index];
                const whole = [1, bud.drift];
                const others = [other.parted, other.gap];

                division.arrange(...(index ? others : whole), ...(index ? whole : others));
                division.place(index, end);

                const beyond = Math.abs(end.along) - rooms[index];
                const closer = clamp(beyond / (1 - part.share), 0, bud.drift);
                const reach = index ? division.reach.last : division.reach.first;
                const parts = clamp(1 - Math.max(beyond - closer * (1 - part.share), 0) / (reach - 1), 0, 1);

                part.parted = parts * smooth(clamp(part.out / bud.parted, 0, 1));
                part.gap = (bud.drift - closer) * smooth(clamp((part.out - bud.drifting) / (1 - bud.drifting), 0, 1));
            });
        }

        division.arrange(buds[0].parted, buds[0].gap, buds[1].parted, buds[1].gap);
    };

    // The end of a press. One that was held has drawn the buds in, and they stay inside for a
    // while.
    const settle = (seconds) => {
        if (gathered > 0.6) {
            calmUntil = seconds + held.calm;
        }
    };

    return { division, arrange, settle };
};
