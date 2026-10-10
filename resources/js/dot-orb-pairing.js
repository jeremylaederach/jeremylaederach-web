// Pairs every point of one set with a point of another set of the same size, so that the dots
// flow from one shape into the next instead of crossing each other's way: neighbours stay
// neighbours, what is on the left goes to the left, what is above stays above.
//
// Both sets are cut from top to bottom into strips that hold the same number of points, and
// within a strip the points are paired from left to right. The result names, for each point of
// `from`, its partner in `to`. The order of a set that is paired to again and again, the points
// of a figure, is worked out once.
const ordered = new WeakMap();

const inStrips = (points) => {
    const strip = Math.max(Math.round(Math.sqrt(points.length)), 1);
    const order = [...points.keys()].sort((first, second) => points[first].y - points[second].y);

    for (let start = 0; start < order.length; start += strip) {
        order
            .slice(start, start + strip)
            .sort((first, second) => points[first].x - points[second].x)
            .forEach((index, place) => {
                order[start + place] = index;
            });
    }

    return order;
};

export const pairInStrips = (from, to) => {
    const sources = inStrips(from);
    const targets = ordered.get(to) ?? inStrips(to);
    const partners = new Uint16Array(from.length);

    ordered.set(to, targets);

    sources.forEach((source, place) => {
        partners[source] = targets[place];
    });

    return partners;
};
