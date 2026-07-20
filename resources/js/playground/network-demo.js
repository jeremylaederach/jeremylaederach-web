import { getPalette, selectOption, wait } from './demo-utils.js';

const layerSizes = [4, 6, 5, 3];
const animationFrameCount = 16;
const animationFrameDelay = 34;
const signalPresets = {
    wide: [0.74, 0.58, 0.68, 0.52],
    focused: [1, 0.08, 0.12, 0.06],
    alternating: [0.88, 0.16, 0.82, 0.12],
};
const layerLabels = ['INPUT', 'MIX 01', 'MIX 02', 'RESULT'];
const outputLabels = ['A', 'B', 'C'];

const randomWeight = () => 0.12 + Math.random() * 0.88;

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

const calculateLayer = (sourceValues, weights) => weights.map((connections) => {
    const weightedSignal = connections.reduce(
        (sum, weight, index) => sum + weight * sourceValues[index],
        0,
    );
    const totalWeight = connections.reduce((sum, weight) => sum + weight, 0);

    return weightedSignal / totalWeight;
});

const nodePosition = (canvas, layer, index) => ({
    x: 82 + layer * ((canvas.width - 164) / (layerSizes.length - 1)),
    y: canvas.height / 2 + (index - (layerSizes[layer] - 1) / 2) * 48,
});

const drawConnection = (context, from, to, color, opacity, width, progress = 1) => {
    context.globalAlpha = opacity;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(
        from.x + (to.x - from.x) * progress,
        from.y + (to.y - from.y) * progress,
    );
    context.stroke();
};

const drawPulse = (context, from, to, color, opacity, progress) => {
    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.beginPath();
    context.arc(
        from.x + (to.x - from.x) * progress,
        from.y + (to.y - from.y) * progress,
        2.8,
        0,
        Math.PI * 2,
    );
    context.fill();
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

const strongestOutput = (values) => values.reduce(
    (strongest, value, index) => (
        value > strongest.value ? { index, value } : strongest
    ),
    { index: 0, value: values[0] },
);

const drawNodeLabel = (context, palette, label, x, y, opacity) => {
    context.globalAlpha = opacity;
    context.fillStyle = palette.ink;
    context.font = '600 9px ui-monospace, SFMono-Regular, Consolas, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, x, y);
};

const draw = (canvas, network, activeLayer = 0, progress = 1) => {
    const context = canvas.getContext('2d');
    const palette = getPalette();
    const outputLayer = layerSizes.length - 1;
    const winner = activeLayer === outputLayer
        ? strongestOutput(network.values[outputLayer]).index
        : -1;

    context.clearRect(0, 0, canvas.width, canvas.height);

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
                    palette.accent,
                    connectionOpacity(isActive, isComplete, strength),
                    0.55 + strength * 1.65,
                    isActive ? progress : 1,
                );

                if (isActive && strength > 0.18) {
                    drawPulse(
                        context,
                        from,
                        to,
                        palette.ink,
                        Math.min(0.92, 0.34 + strength * 0.46),
                        progress,
                    );
                }
            });
        });
    });

    layerLabels.forEach((label, layer) => {
        context.globalAlpha = layer <= activeLayer ? 0.64 : 0.24;
        context.fillStyle = palette.ink;
        context.font = '600 9px ui-monospace, SFMono-Regular, Consolas, monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, nodePosition(canvas, layer, 0).x, 22);
    });

    network.values.forEach((values, layer) => {
        values.forEach((value, index) => {
            const position = nodePosition(canvas, layer, index);
            const visibleValue = layer === activeLayer ? value * progress : value;
            const isVisible = layer <= activeLayer;
            const isWinner = layer === outputLayer && index === winner;

            context.globalAlpha = isVisible ? 0.24 + visibleValue * 0.76 : 0.14;
            context.fillStyle = isWinner || layer === activeLayer
                ? palette.ink
                : palette.accent;
            context.beginPath();
            context.arc(position.x, position.y, 8 + visibleValue * 3, 0, Math.PI * 2);
            context.fill();

            context.globalAlpha = isWinner ? 0.9 : isVisible ? 0.38 : 0.1;
            context.strokeStyle = palette.accent;
            context.lineWidth = isWinner ? 2 : 1;
            context.beginPath();
            context.arc(position.x, position.y, isWinner ? 19 : 15, 0, Math.PI * 2);
            context.stroke();

            if (layer === 0) {
                drawNodeLabel(
                    context,
                    palette,
                    String(Math.round(value * 100)),
                    position.x - 30,
                    position.y,
                    0.58,
                );
            }

            if (layer === outputLayer) {
                drawNodeLabel(
                    context,
                    palette,
                    outputLabels[index],
                    position.x + 29,
                    position.y,
                    isWinner ? 0.94 : 0.5,
                );
            }
        });
    });

    context.globalAlpha = 1;
    context.lineWidth = 1;
};

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
        output.textContent = `${outputLabels[strongest.index]} · ${Math.round(strongest.value * 100)}%`;
        runButton.disabled = false;
    });

    draw(canvas, network);
};
