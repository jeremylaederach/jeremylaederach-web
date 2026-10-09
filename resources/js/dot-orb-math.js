// The small arithmetic the parts of the sphere share.
const goldenAngle = Math.PI * (3 - Math.sqrt(5));

export const mix = (from, to, amount) => from + (to - from) * amount;
export const clamp = (value, low, high) => Math.min(Math.max(value, low), high);

// Lets a share between 0 and 1 start and end gently.
export const smooth = (value) => value * value * (3 - 2 * value);

// Frame-rate independent easing towards a target.
export const approach = (current, target, rate, delta) => mix(current, target, 1 - Math.exp(-rate * delta));

// Evenly spread points on a unit sphere (Fibonacci lattice), ordered from the top down.
export const createLattice = (count) => Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const angle = index * goldenAngle;

    return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring };
});
