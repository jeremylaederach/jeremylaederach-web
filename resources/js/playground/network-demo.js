import {
    getCanvasViewport,
    getPalette,
    observeCanvas,
    selectOption,
    wait,
} from './demo-utils.js';
import {
    evaluateNetwork,
    networkLayers,
    networkScenarios,
    networkShape,
} from './network-model.js';

const animationFrames = 14;
const animationDelay = 30;
const emptyOutput = '\u2014';
const defaultLabels = {
    inputs: ['Sender', 'Urgency', 'Link', 'Domain'],
    layers: ['INPUT', 'PATTERN', 'RESULT'],
    outputs: ['Safe', 'Review', 'Risk'],
};

const readLabels = (canvas, key, fallback) => {
    const labels = canvas.dataset[key]?.split('|').map((label) => label.trim());

    return labels?.length === fallback.length && labels.every(Boolean)
        ? labels
        : fallback;
};

const getLabels = (canvas) => ({
    inputs: readLabels(canvas, 'networkInputs', defaultLabels.inputs),
    layers: readLabels(canvas, 'networkLayers', defaultLabels.layers),
    outputs: readLabels(canvas, 'networkClasses', defaultLabels.outputs),
});

const drawText = (
    context,
    text,
    x,
    y,
    {
        align = 'left',
        color,
        font = '500 11px ui-sans-serif, system-ui, sans-serif',
        opacity = 1,
    } = {},
) => {
    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.font = font;
    context.textAlign = align;
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
};

const createNodeLayout = (width, height) => {
    const compact = width < 420;
    const top = compact ? 34 : 38;
    const bottom = height - (compact ? 18 : 22);
    const xPositions = [
        compact ? 78 : 94,
        width * 0.52,
        width - (compact ? 72 : 82),
    ];
    const nodes = networkShape.map((size, layer) => (
        Array.from({ length: size }, (_, index) => ({
            x: xPositions[layer],
            y: top + ((bottom - top) * index) / Math.max(1, size - 1),
        }))
    ));

    return { compact, nodes };
};

const draw = (canvas, pass, labels, state) => {
    const { context, height, width } = getCanvasViewport(canvas);
    const palette = getPalette();
    const layout = createNodeLayout(width, height);

    context.clearRect(0, 0, width, height);

    networkLayers.forEach((layer, layerIndex) => {
        const sourceValues = pass.layers[layerIndex];
        const strengths = layer.weights.flatMap((weights) => (
            weights.map((weight, source) => (
                Math.abs(weight * sourceValues[source])
            ))
        ));
        const maximum = Math.max(...strengths, 0.01);
        const isCurrent = state.layer === layerIndex + 1;
        const isComplete = state.layer > layerIndex + 1
            || (state.complete && state.layer === layerIndex + 1);

        layer.weights.forEach((weights, target) => {
            weights.forEach((weight, source) => {
                const from = layout.nodes[layerIndex][source];
                const to = layout.nodes[layerIndex + 1][target];
                const strength = Math.abs(weight * sourceValues[source]) / maximum;
                const visibleStrength = isCurrent
                    ? strength * state.progress
                    : strength;

                context.globalAlpha = isCurrent || isComplete
                    ? 0.07 + visibleStrength * 0.26
                    : 0.055 + visibleStrength * 0.06;
                context.strokeStyle = weight >= 0
                    ? palette.accent
                    : palette.ink;
                context.lineWidth = 0.6 + visibleStrength * 0.75;
                context.beginPath();
                context.moveTo(from.x, from.y);
                context.lineTo(to.x, to.y);
                context.stroke();

                if (isCurrent && strength > 0.52) {
                    context.globalAlpha = 0.34 + strength * 0.52;
                    context.fillStyle = weight >= 0
                        ? palette.accent
                        : palette.ink;
                    context.beginPath();
                    context.arc(
                        from.x + (to.x - from.x) * state.progress,
                        from.y + (to.y - from.y) * state.progress,
                        layout.compact ? 2.2 : 2.6,
                        0,
                        Math.PI * 2,
                    );
                    context.fill();
                }
            });
        });
    });

    labels.layers.forEach((label, layer) => {
        drawText(context, label.toUpperCase(), layout.nodes[layer][0].x, 15, {
            align: 'center',
            color: palette.ink,
            font: '600 9px ui-monospace, SFMono-Regular, Consolas, monospace',
            opacity: layer <= state.layer ? 0.54 : 0.24,
        });
    });

    layout.nodes.forEach((nodes, layer) => {
        nodes.forEach((position, index) => {
            const isVisible = layer <= state.layer;
            const isCurrent = layer === state.layer && !state.complete;
            const value = isVisible
                ? pass.layers[layer][index] * (isCurrent ? state.progress : 1)
                : 0;
            const isWinner = state.complete
                && layer === networkShape.length - 1
                && index === pass.winner.index;
            const isRisk = isWinner && index === 2;
            const radius = layout.compact ? 5 : 6;

            context.globalAlpha = isVisible ? 0.22 + value * 0.72 : 0.15;
            context.fillStyle = isRisk ? palette.coral : palette.accent;
            context.beginPath();
            context.arc(position.x, position.y, radius, 0, Math.PI * 2);
            context.fill();

            context.globalAlpha = isWinner ? 0.82 : isVisible ? 0.24 : 0.14;
            context.strokeStyle = isRisk ? palette.coral : palette.ink;
            context.lineWidth = isWinner ? 1.5 : 1;
            context.beginPath();
            context.arc(
                position.x,
                position.y,
                radius + (isWinner ? 5 : 3),
                0,
                Math.PI * 2,
            );
            context.stroke();

            if (layer === 0) {
                drawText(context, labels.inputs[index], position.x - 12, position.y, {
                    align: 'right',
                    color: palette.ink,
                    opacity: 0.52 + value * 0.42,
                });
            }

            if (layer === networkShape.length - 1) {
                const confidence = isWinner
                    ? ` ${Math.round(pass.winner.confidence * 100)}%`
                    : '';

                drawText(
                    context,
                    `${labels.outputs[index]}${confidence}`,
                    position.x + 12,
                    position.y,
                    {
                        color: isRisk ? palette.coral : palette.ink,
                        font: isWinner
                            ? '600 11px ui-sans-serif, system-ui, sans-serif'
                            : undefined,
                        opacity: isWinner ? 0.94 : 0.46,
                    },
                );
            }
        });
    });

    context.globalAlpha = 1;
    context.lineWidth = 1;
};

const getScenarioKey = (button) => {
    const key = button?.dataset.networkScenario;

    return key && Object.hasOwn(networkScenarios, key) ? key : null;
};

export const initializeNetworkDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-network-canvas]');
    const output = root.querySelector('[data-network-output]');
    const runButton = root.querySelector('[data-network-run]');
    const scenarioButtons = [
        ...root.querySelectorAll('[data-network-scenario]'),
    ];
    const labels = getLabels(canvas);
    const baseAriaLabel = canvas.getAttribute('aria-label') ?? '';
    const initialButton = scenarioButtons.find((button) => (
        button.getAttribute('aria-pressed') === 'true' && getScenarioKey(button)
    )) ?? scenarioButtons.find(getScenarioKey);
    let selectedButton = initialButton;
    let scenario = getScenarioKey(initialButton) ?? 'newsletter';
    let pass = evaluateNetwork(networkScenarios[scenario]);
    let state = { complete: false, layer: 0, progress: 1 };
    let runId = 0;
    let destroyed = false;

    const scenarioLabel = () => selectedButton?.textContent.trim() || scenario;
    const render = () => draw(canvas, pass, labels, state);
    const setBusy = (busy) => {
        root.setAttribute('aria-busy', String(busy));
        runButton.disabled = busy;
    };
    const reset = () => {
        runId += 1;
        pass = evaluateNetwork(networkScenarios[scenario]);
        state = { complete: false, layer: 0, progress: 1 };
        output.textContent = emptyOutput;
        canvas.setAttribute(
            'aria-label',
            `${baseAriaLabel} ${scenarioLabel()}.`.trim(),
        );
        setBusy(false);
        render();
    };
    const finish = () => {
        const label = labels.outputs[pass.winner.index];
        const confidence = Math.round(pass.winner.confidence * 100);

        state = {
            complete: true,
            layer: networkShape.length - 1,
            progress: 1,
        };
        output.textContent = `${label} · ${confidence}%`;
        canvas.setAttribute(
            'aria-label',
            `${baseAriaLabel} ${scenarioLabel()}: ${label}, ${confidence}%.`.trim(),
        );
        setBusy(false);
        render();
    };

    const handleClick = async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-network-scenario]');
        const optionKey = option instanceof HTMLButtonElement
            ? getScenarioKey(option)
            : null;

        if (optionKey) {
            scenario = optionKey;
            selectedButton = option;
            selectOption(root, '[data-network-scenario]', option);
            reset();
            return;
        }

        if (target?.closest('[data-network-reset]')) {
            reset();
            return;
        }

        if (!target?.closest('[data-network-run]') || runButton.disabled) {
            return;
        }

        const currentRun = ++runId;

        pass = evaluateNetwork(networkScenarios[scenario]);
        output.textContent = emptyOutput;
        setBusy(true);

        if (reducedMotion) {
            finish();
            return;
        }

        for (let layer = 1; layer < networkShape.length; layer += 1) {
            for (let frame = 1; frame <= animationFrames; frame += 1) {
                if (destroyed || currentRun !== runId || !canvas.isConnected) {
                    return;
                }

                const progress = frame / animationFrames;

                state = {
                    complete: false,
                    layer,
                    progress: 1 - ((1 - progress) ** 3),
                };
                render();
                await wait(animationDelay);
            }
        }

        if (!destroyed && currentRun === runId && canvas.isConnected) {
            finish();
        }
    };

    root.addEventListener('click', handleClick);

    if (selectedButton) {
        selectOption(root, '[data-network-scenario]', selectedButton);
    }

    const disconnectCanvas = observeCanvas(canvas, render);

    reset();

    return () => {
        destroyed = true;
        runId += 1;
        setBusy(false);
        root.removeEventListener('click', handleClick);
        disconnectCanvas();
    };
};
