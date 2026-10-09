// The blobs of the sphere behave like those of a lava lamp: where two of them are close, their
// surfaces join. Each blob is felt up to `reach` of its radii from its middle, most in the middle
// and not at all at that distance. The joint surface is where what is felt of all blobs together
// equals what one blob alone gives at its own surface. Far apart the blobs are spheres; close to
// each other they bulge towards one another, grow a neck and become one body.
const reach = 2;
const level = (1 - 1 / reach ** 2) ** 2;

// Moves a point onto the joint surface of the blobs, in a few steps along the steepest way
// there, each at most `stride` of the smallest radius long. A blob is { x, y, radius } with its
// middle at depth 0; the point is { x, y, z } and is changed in place.
export const settle = (point, blobs, { steps = 4, stride = 0.6 } = {}) => {
    const longest = stride * Math.min(...blobs.map((blob) => blob.radius));

    for (let step = 0; step < steps; step += 1) {
        let felt = 0;
        let slopeX = 0;
        let slopeY = 0;
        let slopeZ = 0;

        for (const blob of blobs) {
            const x = point.x - blob.x;
            const y = point.y - blob.y;
            const span = (blob.radius * reach) ** 2;
            const fall = 1 - (x * x + y * y + point.z * point.z) / span;

            if (fall <= 0) {
                continue;
            }

            const slope = (-4 * fall) / span;

            felt += fall * fall;
            slopeX += slope * x;
            slopeY += slope * y;
            slopeZ += slope * point.z;
        }

        const steepness = slopeX * slopeX + slopeY * slopeY + slopeZ * slopeZ;

        // Out of reach of every blob, or in the middle of one: there is no way to follow.
        if (steepness < 1e-12) {
            return;
        }

        const length = Math.abs(level - felt) / Math.sqrt(steepness);
        const move = ((level - felt) / steepness) * Math.min(1, longest / length);

        point.x += slopeX * move;
        point.y += slopeY * move;
        point.z += slopeZ * move;
    }
};
