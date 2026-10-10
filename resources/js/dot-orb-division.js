// How the sphere divides, like a drop that is pulled apart: it stretches along its axis, a neck
// forms and thins, and two spheres are left that touch and then part.
//
// The dots are counted along the axis, from one end of the sphere to the other. A bud is the
// dots at one end: the first bud takes `first` of all the dots at the start of the count, the
// last bud `last` of them at its end. Nothing else is ever dealt out, and nothing is remembered.
// Every dot keeps its side of the axis and its distance along it relative to its neighbours, so
// no dot crosses another's way and the bodies never reach around each other.
//
// Every state is a mix of four: the whole sphere, the first bud out, the last bud out, and both
// out. In each of those, every body is a sphere of its own, as large as its dots need to lie as
// close as on the whole sphere, the spheres touch along the axis, and their common middle stays
// where it is. A mix of such states is one closed body with a neck that thins.
//
// Lengths are in radii of the whole sphere.
export const createDivision = ({ first, last }) => {
    // One of the four states: the body's middle, radius and the part of the count it holds,
    // and the middle and radius of each bud that is out.
    const states = [0, 1, 2, 3].map(() => ({ share: 0, from: 0, to: 1, middle: 0, radius: 1, firstMiddle: 0, lastMiddle: 0 }));
    const firstRadius = Math.sqrt(first);
    const lastRadius = Math.sqrt(last);

    // Sets the four states for this moment: how far each bud is out, from 0 to 1, and how far
    // it has drifted from the body after parting.
    const arrange = (firstOut, firstGap, lastOut, lastGap) => {
        states.forEach((state, index) => {
            const hasFirst = index % 2 === 1;
            const hasLast = index > 1;
            const radius = Math.sqrt(1 - (hasFirst ? first : 0) - (hasLast ? last : 0));
            const toFirst = hasFirst ? radius + firstRadius + firstGap : 0;
            const toLast = hasLast ? radius + lastRadius + lastGap : 0;

            state.share = (hasFirst ? firstOut : 1 - firstOut) * (hasLast ? lastOut : 1 - lastOut);
            state.from = hasFirst ? first : 0;
            state.to = hasLast ? 1 - last : 1;
            state.radius = radius;
            // The bodies balance: what leaves on one side moves the body a little to the other.
            state.middle = (hasLast ? last * toLast : 0) - (hasFirst ? first * toFirst : 0);
            state.firstMiddle = state.middle + toFirst;
            state.lastMiddle = state.middle - toLast;
        });
    };

    // Where the dot at `count`, from 0 at the start of the count to 1 at its end, lies: how far
    // along the axis and how far from it, and the same on a sphere of radius 1, which says
    // which way that part of the surface faces. `first` and `last` say how far the dot has
    // left with that bud, from 0 inside the sphere to 1 once the bud has parted.
    const place = (count, into) => {
        into.along = 0;
        into.around = 0;
        into.height = 0;
        into.ring = 0;
        into.first = 0;
        into.last = 0;

        for (const state of states) {
            if (state.share === 0) {
                continue;
            }

            // The sphere the dot sits on in this state, and how far through that sphere it is.
            let middle = state.middle;
            let radius = state.radius;
            let through = (count - state.from) / (state.to - state.from);

            if (count < state.from) {
                middle = state.firstMiddle;
                radius = firstRadius;
                through = count / first;
                into.first += state.share;
            } else if (count > state.to) {
                middle = state.lastMiddle;
                radius = lastRadius;
                through = (count - state.to) / last;
                into.last += state.share;
            }

            const height = 1 - 2 * through;
            const ring = Math.sqrt(Math.max(1 - height * height, 0));

            into.along += state.share * (middle + radius * height);
            into.around += state.share * radius * ring;
            into.height += state.share * height;
            into.ring += state.share * ring;
        }
    };

    // How far the first and the last bud reach along the axis once they have parted without a
    // gap, each with the other still inside: what a bud needs of the room on its side.
    const reach = {
        first: (1 - first) * (Math.sqrt(1 - first) + firstRadius) + firstRadius,
        last: (1 - last) * (Math.sqrt(1 - last) + lastRadius) + lastRadius,
    };

    // Where the middle of a bud lies along the axis once it is out: the first bud for 0, the
    // last for 1.
    const middleOf = (index) => {
        const [alone, both] = index ? [states[2], states[3]] : [states[1], states[3]];
        const middle = index ? 'lastMiddle' : 'firstMiddle';
        const share = alone.share + both.share;

        return share > 0 ? (alone.share * alone[middle] + both.share * both[middle]) / share : alone[middle];
    };

    return { arrange, place, middleOf, reach };
};
