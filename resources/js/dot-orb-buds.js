// Which dots a bud takes: the ones beside it. A bud that sets out takes the dots nearest to
// where it leaves, and the others close over the place they left. On its way back its dots land
// where it reaches the sphere, and the others make room there.
//
// The sphere is a lattice of places, dealt out like cards to the core and to each bud. While a
// bud is out, the places dealt to it are empty, so the dots that stay are spread evenly; they
// are not the dots that had those places, but the ones nearest to the bud. Whenever a bud sets
// out or turns back, every dot on the sphere is given a place again in a way that keeps all of
// them close to where they are, and glides there while the bud is on its way.
import { clamp, smooth } from './dot-orb-math.js';

const along = (point, axis) => point.x * axis.x + point.y * axis.y + point.z * axis.z;

// The dots at the tip of a cap leave first and the ones at its rim last, so a bud stretches out
// of the sphere: `ahead` is how much sooner the tip is on its way.
const ahead = 0.35;

// Puts points in an order that keeps neighbours together: around the axis they are cut into
// wedges of the same number of points, and within a wedge they follow each other from the
// axis downwards. Two sets of the same size, ordered like this and paired one by one, are paired
// with a point nearby.
const inWedges = (points, axis) => {
    const pole = Math.abs(axis.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
    const side = { x: pole.y * axis.z - pole.z * axis.y, y: pole.z * axis.x - pole.x * axis.z, z: pole.x * axis.y - pole.y * axis.x };
    const other = { x: axis.y * side.z - axis.z * side.y, y: axis.z * side.x - axis.x * side.z, z: axis.x * side.y - axis.y * side.x };
    const places = points.map((point, index) => ({ index, height: along(point, axis), angle: Math.atan2(along(point, other), along(point, side)) }));
    const wedge = Math.max(Math.round(Math.sqrt(points.length) / 2), 1);

    places.sort((first, second) => first.angle - second.angle);

    return Array.from({ length: Math.ceil(places.length / wedge) }, (_, index) => places
        .slice(index * wedge, (index + 1) * wedge)
        .sort((first, second) => second.height - first.height))
        .flat()
        .map((place) => place.index);
};

// `lattice` holds the places of the sphere and `seats`, for each bud, the places on that bud:
// unit vectors in the frame of the lattice. `follow` takes the buds as they are now, each with
// how far it is `out`, whether it is `rising` and the `axis` it leaves or returns on, and
// writes for every dot where it sits on the sphere (`at`), the bud it belongs to (`bud`, counted
// from 1, or 0), its place on that bud (`seat`) and how far it is out of the sphere (`away`).
export const createDivision = (lattice, seats) => {
    const count = lattice.length;
    const size = seats[0].length;
    const vectors = () => ({ x: new Float32Array(count), y: new Float32Array(count), z: new Float32Array(count) });
    const at = vectors();
    const from = vectors();
    // The place of each dot on the sphere, or -1 while it is out with its bud.
    const place = Int16Array.from({ length: count }, (_, index) => index);
    const bud = new Uint8Array(count);
    const seat = new Uint16Array(count);
    const away = new Float32Array(count);
    const depth = new Float32Array(count);
    // The bud whose way a dot glides along, or 0 once it has arrived.
    const paced = new Uint8Array(count);
    const taken = new Uint8Array(count).fill(1);
    const stages = ['in', 'leaving', 'out', 'returning'];
    const states = seats.map(() => ({ stage: 'in', out: 0 }));
    const all = [...lattice.keys()];

    lattice.forEach((point, index) => {
        from.x[index] = point.x;
        from.y[index] = point.y;
        from.z[index] = point.z;
    });

    // How far the dots that glide along with a bud have come.
    const pace = (number) => {
        const { stage, out } = states[number - 1];

        return stage === 'leaving' ? out : stage === 'returning' ? 1 - out : 1;
    };

    const locate = (index) => {
        const to = place[index] < 0 ? null : lattice[place[index]];
        const share = to ? smooth(paced[index] ? pace(paced[index]) : 1) : 0;
        const x = from.x[index] + ((to?.x ?? 0) - from.x[index]) * share;
        const y = from.y[index] + ((to?.y ?? 0) - from.y[index]) * share;
        const z = from.z[index] + ((to?.z ?? 0) - from.z[index]) * share;
        const length = Math.hypot(x, y, z) || 1;

        at.x[index] = x / length;
        at.y[index] = y / length;
        at.z[index] = z / length;
    };

    // Gives the dots the places, each a place near its own, and lets them glide there with the bud.
    const settle = (dots, places, axis, number) => {
        const order = inWedges(dots.map((index) => lattice[place[index]]), axis);
        const target = inWedges(places.map((index) => lattice[index]), axis);

        order.forEach((dot, rank) => {
            const index = dots[dot];

            locate(index);
            from.x[index] = at.x[index];
            from.y[index] = at.y[index];
            from.z[index] = at.z[index];
            place[index] = places[target[rank]];
            paced[index] = number;
        });
    };

    const highest = (indices, height) => indices.sort((first, second) => height(second) - height(first));

    // The bud takes the dots nearest to its axis, and the others close over their places.
    const leave = (number, axis) => {
        const free = highest(all.filter((index) => bud[index] === 0), (index) => along(lattice[place[index]], axis));
        const members = free.slice(0, size);
        const seated = inWedges(seats[number - 1], axis);

        inWedges(members.map((index) => lattice[place[index]]), axis).forEach((member, rank) => {
            seat[members[member]] = seated[rank];
        });

        members.forEach((index, rank) => {
            locate(index);
            from.x[index] = at.x[index];
            from.y[index] = at.y[index];
            from.z[index] = at.z[index];
            bud[index] = number;
            depth[index] = rank / size;
            place[index] = -1;
            paced[index] = 0;
        });

        all.forEach((index) => {
            taken[index] = taken[index] && index % (seats.length + 1) !== number ? 1 : 0;
        });
        settle(all.filter((index) => place[index] >= 0), all.filter((index) => taken[index]), axis, number);
    };

    // The dots of the bud land on the places nearest to its axis, and the others make room.
    const land = (number, axis) => {
        all.forEach((index) => {
            taken[index] = taken[index] || index % (seats.length + 1) === number ? 1 : 0;
        });

        const places = highest(all.filter((index) => taken[index]), (index) => along(lattice[index], axis));
        const landing = places.slice(0, size);
        const members = all.filter((index) => bud[index] === number);
        const order = inWedges(members.map((index) => seats[number - 1][seat[index]]), axis);

        settle(all.filter((index) => place[index] >= 0), places.slice(size), axis, number);

        inWedges(landing.map((index) => lattice[index]), axis).forEach((spot, rank) => {
            const index = members[order[rank]];

            place[index] = landing[spot];
            depth[index] = spot / size;
            from.x[index] = lattice[landing[spot]].x;
            from.y[index] = lattice[landing[spot]].y;
            from.z[index] = lattice[landing[spot]].z;
        });
    };

    // The bud is all the way out or back inside: the dots that glided with it have arrived.
    const arrive = (number, inside) => {
        for (let index = 0; index < count; index += 1) {
            if (paced[index] === number) {
                from.x[index] = lattice[place[index]].x;
                from.y[index] = lattice[place[index]].y;
                from.z[index] = lattice[place[index]].z;
                paced[index] = 0;
            }

            if (inside && bud[index] === number) {
                bud[index] = 0;
            }
        }
    };

    const stageOf = ({ out, rising }) => {
        if (out <= 0) {
            return 'in';
        }

        if (out >= 1) {
            return 'out';
        }

        return rising ? 'leaving' : 'returning';
    };

    const follow = (parts) => {
        parts.forEach((part, index) => {
            const state = states[index];
            const stage = stageOf(part);

            // A bud goes through its stages in their order, also when it is first seen on its way.
            while (state.stage !== stage) {
                state.stage = stages[(stages.indexOf(state.stage) + 1) % stages.length];
                state.out = { in: 0, leaving: 0, out: 1, returning: 1 }[state.stage];

                if (state.stage === 'leaving') {
                    leave(index + 1, part.axis);
                } else if (state.stage === 'returning') {
                    land(index + 1, part.axis);
                } else {
                    arrive(index + 1, state.stage === 'in');
                }
            }

            state.out = part.out;
        });

        for (let index = 0; index < count; index += 1) {
            locate(index);
            away[index] = bud[index]
                ? smooth(clamp(states[bud[index] - 1].out * (1 + ahead) - depth[index] * ahead, 0, 1))
                : 0;
        }
    };

    return { at, bud, seat, away, follow };
};
