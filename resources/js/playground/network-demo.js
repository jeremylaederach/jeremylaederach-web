import { getPalette, selectOption, wait } from './demo-utils.js';

const layerSizes = [4, 6, 5, 3];
const animationFrameCount = 16;
const animationFrameDelay = 34;
const signalPresets = {
    wide: [0.24, 0.72, 0.46, 0.64],
    focused: [0.94, 0.12, 0.2, 0.08],
};

const randomWeight = () => Math.random() * 2 - 1;

const createWeights = () => layerSizes.slice(1).map((size, layer) => (
    Array.from({ length: size }, () => (
        Array.from({ length: layerSizes[layer] }, randomWeight)
    ))
));

const createNetwork = (signal, weights = createWeights()) => ({
    values: layerSizes.map((size, layer) => (
        layer === 0 ? [...signalPresets[signal]] : Array(size).fill(0)
    )),
    weights,
});

const normalizeSignal = (value) => 1 / (1 + Math.exp(-value));

const calculateLayer = (sourceValues, weights) => weights.map((connections) => {
    const total = connections.reduce(
        (sum, weight, index) => sum + weight * sourceValues[index],
        0,
    );

    return normalizeSignal(total / Math.sqrt(connections.length));
});

const nodePosition = (canvas, layer, index) => ({
    x: 72 + layer * ((canvas.width - 144) / (layerSizes.length - 1)),
    y: canvas.height / 2 + (index - (layerSizes[layer] - 1) / 2) * 48,
});

const drawConnection = (context, from, to, color, opacity, progress = 1) => {
    context.globalAlpha = opacity;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(
        from.x + (to.x - from.x) * progress,
        from.y + (to.y - from.y) * progress,
    );
    context.stroke();
};

const connectionOpacity = (isActive, isComplete, strength) => {
    if (isActive) {
        return 0.12 + strength * 0.54;
    }

    if (isComplete) {
        return 0.08 + strength * 0.22;
    }

    return 0.045;
};

const draw = (canvas, network, activeLayer = 0, progress = 1) => {
    const context = canvas.getContext('2d');
    const palette = getPalette();

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1;

    network.weights.forEach((matrix, layer) => {
        matrix.forEach((connections, target) => {
            connections.forEach((weight, source) => {
                const from = nodePosition(canvas, layer, source);
                const to = nodePosition(canvas, layer + 1, target);
                const isActive = layer === activeLayer - 1;
                const isComplete = layer < activeLayer - 1;
                const strength = Math.abs(weight) * network.values[layer][source];

                drawConnection(
                    context,
                    from,
                    to,
                    weight >= 0 ? palette.accent : palette.muted,
                    connectionOpacity(isActive, isComplete, strength),
                    isActive ? progress : 1,
                );
            });
        });
    });

    network.values.forEach((values, layer) => {
        values.forEach((value, index) => {
            const position = nodePosition(canvas, layer, index);
            const visibleValue = layer === activeLayer ? value * progress : value;
            const isVisible = layer <= activeLayer;

            context.globalAlpha = isVisible ? 0.24 + visibleValue * 0.76 : 0.14;
            context.fillStyle = layer === activeLayer ? palette.ink : palette.accent;
            context.beginPath();
            context.arc(position.x, position.y, 8 + visibleValue * 3, 0, Math.PI * 2);
            context.fill();

            context.globalAlpha = isVisible ? 0.38 : 0.1;
            context.strokeStyle = palette.accent;
            context.beginPath();
            context.arc(position.x, position.y, 15, 0, Math.PI * 2);
            context.stroke();
        });
    });

    context.globalAlpha = 1;
};

const strongestOutput = (values) => values.reduce(
    (strongest, value, index) => (
        value > strongest.value ? { index, value } : strongest
    ),
    { index: 0, value: values[0] },
);

export const initializeNetworkDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-network-canvas]');
    const output = root.querySelector('[data-network-output]');
    const runButton = root.querySelector('[data-network-run]');
    let selectedSignal = 'wide';
    let network = createNetwork(selectedSignal);
    let runId = 0;

    const renderIdleState = ({ rewire = false } = {}) => {
        runId += 1;
        network = createNetwork(
            selectedSignal,
            rewire ? createWeights() : network.weights,
        );
        output.textContent = '—';
        runButton.disabled = false;
        draw(canvas, network);
    };

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-network-signal]');

        if (option instanceof HTMLButtonElement) {
            selectedSignal = option.dataset.networkSignal;
            selectOption(root, '[data-network-signal]', option);
            renderIdleState();
            return;
        }

        if (target?.closest('[data-network-reset]')) {
            renderIdleState({ rewire: true });
            return;
        }

        if (!target?.closest('[data-network-run]')) {
            return;
        }

        const currentRun = ++runId;
        network = createNetwork(selectedSignal, network.weights);
        output.textContent = '—';
        runButton.disabled = true;

        for (let layer = 1; layer < layerSizes.length; layer += 1) {
            network.values[layer] = calculateLayer(
                network.values[layer - 1],
                network.weights[layer - 1],
            );

            const frameCount = reducedMotion ? 1 : animationFrameCount;

            for (let frame = 1; frame <= frameCount; frame += 1) {
                if (currentRun !== runId || !canvas.isConnected) {
                    return;
                }

                const linearProgress = frame / frameCount;
                const easedProgress = 1 - ((1 - linearProgress) ** 3);
                draw(canvas, network, layer, easedProgress);
                await wait(reducedMotion ? 0 : animationFrameDelay);
            }
        }

        const strongest = strongestOutput(network.values.at(-1));
        output.textContent = `${String(strongest.index + 1).padStart(2, '0')} · ${strongest.value.toFixed(2)}`;
        runButton.disabled = false;
    });

    draw(canvas, network);
};
