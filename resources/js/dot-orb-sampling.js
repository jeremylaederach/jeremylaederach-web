// Turns a drawing into the places of a figure's dots. The drawing is painted on a small canvas,
// `resolution` pixels wide and high, and read back: what it fills becomes evenly spaced points.
// A figure has volume, half of `thickness` to each side: thickest in the middle of the shape and
// flat at its edge.
const resolution = 120;
const thickness = 0.17;

// How far every filled cell of a square grid is from the nearest empty one, in cells.
const distanceToEdge = (filled, size) => {
    const distance = new Float32Array(size * size);
    const at = (x, y) => (x < 0 || y < 0 || x >= size || y >= size ? 0 : distance[y * size + x]);

    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            distance[y * size + x] = filled(x, y) ? Math.min(at(x - 1, y), at(x, y - 1)) + 1 : 0;
        }
    }

    for (let y = size - 1; y >= 0; y -= 1) {
        for (let x = size - 1; x >= 0; x -= 1) {
            distance[y * size + x] = Math.min(distance[y * size + x], at(x + 1, y) + 1, at(x, y + 1) + 1);
        }
    }

    return distance;
};

// About `count` evenly spaced points inside whatever `draw` paints, centred on (0, 0) in a square
// of side 1, each with half the figure's thickness at that point. Transparent and near-white
// areas are holes.
export const sampleFigure = (draw, count) => {
    const canvas = document.createElement('canvas');

    canvas.width = resolution;
    canvas.height = resolution;

    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
        return [];
    }

    draw(context, resolution);

    const { data } = context.getImageData(0, 0, resolution, resolution);
    const filled = (x, y) => {
        const offset = (Math.floor(y) * resolution + Math.floor(x)) * 4;

        return data[offset + 3] > 128 && Math.min(data[offset], data[offset + 1], data[offset + 2]) < 225;
    };
    const distance = distanceToEdge(filled, resolution);
    const deepest = Math.max(...distance, 1);
    const area = distance.reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0);
    const step = Math.sqrt(area / count) * 1.02;
    const points = [];

    for (let y = step / 2; y < resolution; y += step) {
        for (let x = step / 2; x < resolution; x += step) {
            if (filled(x, y)) {
                const inward = distance[Math.floor(y) * resolution + Math.floor(x)] / deepest;

                points.push({
                    x: x / resolution - 0.5,
                    y: y / resolution - 0.5,
                    half: thickness * Math.sqrt(1 - (1 - inward) ** 2),
                });
            }
        }
    }

    return points;
};
