import { getPalette, selectOption, wait } from './demo-utils.js';

const layerSizes = [4, 6, 5, 3];

const randomWeight = () => Math.random() * 2 - 1;

const createNetwork = () => ({
    values: layerSizes.map((size, layer) => Array.from(
        { length: size },
        () => (layer === 0 ? Math.random() : 0),
    )),
    weights: layerSizes.slice(1).map((size, layer) => Array.from(
        { length: size },
        () => Array.from({ length: layerSizes[layer] }, randomWeight),
    )),
});

const activate = (value, mode) => (
    mode === 'sigmoid'
        ? 1 / (1 + Math.exp(-value))
        : Math.max(0, Math.min(1, value))
);

const nodePosition = (canvas, layer, index) => ({
    x: 72 + layer * ((canvas.width - 144) / (layerSizes.length - 1)),
    y: canvas.height / 2 + (index - (layerSizes[layer] - 1) / 2) * 48,
});

const draw = (canvas, network, activeLayer = 0) => {
    const context = canvas.getContext('2d');
    const palette = getPalette();

    context.clearRect(0, 0, canvas.width, canvas.height);

    network.weights.forEach((matrix, layer) => {
        matrix.forEach((weights, target) => {
            weights.forEach((weight, source) => {
                const from = nodePosition(canvas, layer, source);
                const to = nodePosition(canvas, layer + 1, target);
                context.strokeStyle = weight >= 0 ? palette.accent : palette.muted;
                context.globalAlpha = layer < activeLayer ? Math.abs(weight) * 0.34 + 0.06 : 0.06;
                context.beginPath();
                context.moveTo(from.x, from.y);
                context.lineTo(to.x, to.y);
                context.stroke();
            });
        });
    });

    network.values.forEach((values, layer) => {
        values.forEach((value, index) => {
            const position = nodePosition(canvas, layer, index);
            context.globalAlpha = layer <= activeLayer ? 0.34 + value * 0.66 : 0.18;
            context.fillStyle = layer === activeLayer ? palette.ink : palette.accent;
            context.beginPath();
            context.arc(position.x, position.y, 10, 0, Math.PI * 2);
            context.fill();
        });
    });

    context.globalAlpha = 1;
};

export const initializeNetworkDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-network-canvas]');
    const output = root.querySelector('[data-network-output]');
    const runButton = root.querySelector('[data-network-run]');
    let network = createNetwork();
    let activation = 'relu';
    let runId = 0;

    const reset = () => {
        runId += 1;
        network = createNetwork();
        output.textContent = '—';
        runButton.disabled = false;
        draw(canvas, network);
    };

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-network-activation]');

        if (option instanceof HTMLButtonElement) {
            activation = option.dataset.networkActivation;
            selectOption(root, '[data-network-activation]', option);
            reset();
            return;
        }

        if (target?.closest('[data-network-reset]')) {
            reset();
            return;
        }

        if (!target?.closest('[data-network-run]')) {
            return;
        }

        const currentRun = ++runId;
        runButton.disabled = true;

        for (let layer = 1; layer < layerSizes.length; layer += 1) {
            network.values[layer] = network.weights[layer - 1].map((weights) => activate(
                weights.reduce(
                    (sum, weight, index) => sum + weight * network.values[layer - 1][index],
                    0,
                ),
                activation,
            ));

            if (currentRun !== runId || !canvas.isConnected) {
                return;
            }

            output.textContent = `${layer + 1} / ${layerSizes.length}`;
            draw(canvas, network, layer);
            await wait(reducedMotion ? 0 : 420);
        }

        runButton.disabled = false;
    });

    draw(canvas, network);
};
