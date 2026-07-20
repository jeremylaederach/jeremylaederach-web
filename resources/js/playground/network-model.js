const freezeMatrix = (matrix) => Object.freeze(
    matrix.map((row) => Object.freeze(row)),
);

export const networkShape = Object.freeze([4, 5, 3]);

export const networkScenarios = Object.freeze({
    newsletter: Object.freeze([0.10, 0.10, 0.65, 0.05]),
    request: Object.freeze([0.35, 0.85, 0.20, 0.10]),
    phishing: Object.freeze([0.95, 0.95, 0.90, 1.00]),
});

// Fixed coefficients keep this forward-pass demonstration deterministic.
// They illustrate the mechanics of a small network, not a production classifier.
export const networkLayers = Object.freeze([
    Object.freeze({
        activation: 'sigmoid',
        biases: Object.freeze([-0.9, -0.9, -1.0, -1.7, 1.2]),
        weights: freezeMatrix([
            [1.5, 0.2, 0.1, 1.0],
            [0.1, 1.8, 0.2, 0.1],
            [0.2, 0.1, 1.2, 1.8],
            [0.9, 0.9, 0.7, 1.1],
            [-1.0, -0.6, -0.3, -1.2],
        ]),
    }),
    Object.freeze({
        activation: 'softmax',
        biases: Object.freeze([1.2, -0.1, -0.8]),
        weights: freezeMatrix([
            [-1.0, -0.8, -0.7, -1.2, 2.0],
            [0.4, 0.8, 0.2, 0.5, 0.1],
            [0.9, 0.6, 1.1, 1.4, -0.9],
        ]),
    }),
]);

const sigmoid = (value) => 1 / (1 + Math.exp(-value));

const softmax = (values) => {
    const offset = Math.max(...values);
    const exponentials = values.map((value) => Math.exp(value - offset));
    const total = exponentials.reduce((sum, value) => sum + value, 0);

    return exponentials.map((value) => value / total);
};

const calculateLayer = (inputs, layer) => {
    const values = layer.weights.map((weights, target) => (
        weights.reduce(
            (sum, weight, source) => sum + weight * inputs[source],
            layer.biases[target],
        )
    ));

    return layer.activation === 'softmax'
        ? softmax(values)
        : values.map(sigmoid);
};

const findStrongestOutput = (values) => values.reduce(
    (strongest, confidence, index) => (
        confidence > strongest.confidence
            ? { confidence, index }
            : strongest
    ),
    { confidence: values[0], index: 0 },
);

export const evaluateNetwork = (inputs) => {
    if (
        !Array.isArray(inputs)
        || inputs.length !== networkShape[0]
        || inputs.some((value) => !Number.isFinite(value) || value < 0 || value > 1)
    ) {
        throw new TypeError(
            `Network inputs must contain ${networkShape[0]} numbers between 0 and 1.`,
        );
    }

    const layers = [[...inputs]];

    networkLayers.forEach((layer) => {
        layers.push(calculateLayer(layers.at(-1), layer));
    });

    return {
        layers,
        winner: findStrongestOutput(layers.at(-1)),
    };
};
