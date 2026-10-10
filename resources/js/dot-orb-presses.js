// What a press does to the dots: a ring that travels outwards through them from where it
// happened, and the pull of a press that is held. Places and lengths are in units.
import { approach } from './dot-orb-math.js';

// A ring: how fast it travels and how wide it is, how far it pushes a dot, how many seconds it
// lasts and how many rings travel at once.
const pulse = { speed: 1.5, width: 0.1, strength: 0.07, life: 1.1, most: 6 };

// A held press gathers the dots within reach towards the pointer and charges up; letting go
// releases a ring that is stronger the longer the press lasted.
const press = { reach: 0.5, pull: 0.24, chargeRate: 1.5, releaseRate: 7, boost: 2.2 };

export const createPresses = () => {
    const rings = [];
    const hold = { x: 0, y: 0, down: false, charge: 0 };

    const ring = (x, y, power) => {
        rings.push({ x, y, power, age: 0 });
        rings.splice(0, rings.length - pulse.most);
    };

    // A press begins: a ring leaves its place, and it starts to charge.
    const begin = ({ x, y }) => {
        Object.assign(hold, { x, y, down: true });
        ring(x, y, 1);
    };

    // A held press follows the pointer.
    const move = ({ x, y }) => {
        if (hold.down) {
            hold.x = x;
            hold.y = y;
        }
    };

    const end = () => {
        hold.down = false;
        ring(hold.x, hold.y, hold.charge * press.boost);
    };

    const step = (delta) => {
        for (let index = rings.length - 1; index >= 0; index -= 1) {
            rings[index].age += delta;

            if (rings[index].age >= pulse.life) {
                rings.splice(index, 1);
            }
        }

        hold.charge = approach(hold.charge, hold.down ? 1 : 0, hold.down ? press.chargeRate : press.releaseRate, delta);
    };

    // Moves a dot by what the presses do to it: a held one pulls it in, and the rings push it
    // outwards where their front passes.
    const disturb = (dot) => {
        if (hold.charge > 0.001) {
            const fromPress = Math.hypot(dot.x - hold.x, dot.y - hold.y);

            if (fromPress < press.reach) {
                const pull = Math.min((1 - fromPress / press.reach) * press.pull * hold.charge, fromPress * 0.8);

                dot.x -= ((dot.x - hold.x) / (fromPress || 1)) * pull;
                dot.y -= ((dot.y - hold.y) / (fromPress || 1)) * pull;
            }
        }

        for (const { x, y, power, age } of rings) {
            const fromRing = Math.hypot(dot.x - x, dot.y - y);
            const front = Math.exp(-(((fromRing - age * pulse.speed) / pulse.width) ** 2));
            const push = front * pulse.strength * power * (1 - age / pulse.life);

            dot.x += ((dot.x - x) / (fromRing || 1)) * push;
            dot.y += ((dot.y - y) / (fromRing || 1)) * push;
        }
    };

    return { ring, begin, move, end, step, disturb, held: () => hold.down };
};
