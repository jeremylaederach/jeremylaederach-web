import {
    delay,
    gridIndexAfterKey,
    setPressed,
    setRovingTabStop,
} from './demo-utils.js';

const gridSize = 5;
const pixelCount = gridSize * gridSize;
const signalDelay = 560;

const pattern = (...rows) => Object.freeze(
    rows.join('').split('').map(Number),
);

export const digitTemplates = Object.freeze({
    0: pattern(
        '01110',
        '10001',
        '10001',
        '10001',
        '01110',
    ),
    1: pattern(
        '00100',
        '01100',
        '00100',
        '00100',
        '01110',
    ),
    2: pattern(
        '01110',
        '00001',
        '01110',
        '10000',
        '11111',
    ),
});

const softmax = (values) => {
    const offset = Math.max(...values);
    const exponentials = values.map((value) => Math.exp(value - offset));
    const total = exponentials.reduce((sum, value) => sum + value, 0);

    return exponentials.map((value) => value / total);
};

export const recognizeDigit = (pixels) => {
    if (
        !Array.isArray(pixels)
        || pixels.length !== pixelCount
        || pixels.some((pixel) => pixel !== 0 && pixel !== 1)
    ) {
        throw new TypeError(`Digit input must contain ${pixelCount} zeros or ones.`);
    }

    const inputs = pixels.map((pixel) => (pixel === 1 ? 1 : -1));

    // Each template supplies one output neuron's fixed weights. A trained
    // network would learn these weights from many handwriting examples.
    const logits = Object.values(digitTemplates).map((template) => (
        template.reduce((score, pixel, index) => (
            score + inputs[index] * (pixel === 1 ? 1 : -1)
        ), 0) / 4
    ));
    const probabilities = softmax(logits);
    const winner = probabilities.reduce(
        (best, confidence, index) => (
            confidence > best.confidence ? { confidence, index } : best
        ),
        { confidence: probabilities[0], index: 0 },
    );

    return {
        confidence: winner.confidence,
        digit: String(winner.index),
        probabilities,
    };
};

const pixelLabel = (button, active) => {
    const grid = button.closest('[data-network-pixels]');
    const index = Number(button.dataset.networkPixel);
    const row = Math.floor(index / gridSize) + 1;
    const column = (index % gridSize) + 1;
    const state = active ? grid.dataset.networkOnLabel : grid.dataset.networkOffLabel;

    return `${grid.dataset.networkPixelLabel} ${row}, ${column}: ${state}`;
};

const setPixel = (button, active) => {
    button.setAttribute('aria-selected', String(active));
    button.setAttribute('aria-label', pixelLabel(button, active));
    button.classList.toggle('is-active', active);
};

const createPixelGrid = (grid) => {
    const buttons = [];
    const rows = Array.from({ length: gridSize }, (_, rowIndex) => {
        const row = document.createElement('span');

        row.className = 'neural-pixels__row';
        row.setAttribute('role', 'row');

        for (let column = 0; column < gridSize; column += 1) {
            const index = rowIndex * gridSize + column;
            const button = document.createElement('button');

            button.type = 'button';
            button.dataset.networkPixel = String(index);
            button.setAttribute('role', 'gridcell');
            button.tabIndex = index === 0 ? 0 : -1;
            button.style.setProperty('--pixel-index', String(index));
            row.append(button);
            buttons.push(button);
        }

        return row;
    });

    grid.replaceChildren(...rows);
    buttons.forEach((button) => setPixel(button, false));

    return buttons;
};

const readPixels = (buttons) => buttons.map(
    (button) => Number(button.getAttribute('aria-selected') === 'true'),
);

const movePixelFocus = (buttons, current, key) => {
    const index = buttons.indexOf(current);

    if (index < 0) {
        return false;
    }

    const nextIndex = gridIndexAfterKey(index, gridSize, gridSize, key);

    if (nextIndex === null) {
        return false;
    }

    const next = buttons[nextIndex];

    setRovingTabStop(buttons, next);
    next.focus();

    return true;
};

export const initializeNetworkDemo = (root, reducedMotion) => {
    const stage = root.querySelector('[data-network-stage]');
    const grid = root.querySelector('[data-network-pixels]');
    const output = root.querySelector('[data-network-output]');
    const runButton = root.querySelector('[data-network-run]');
    const clearButton = root.querySelector('[data-network-clear]');
    const presetButtons = [...root.querySelectorAll('[data-network-preset]')];
    const resultRows = [...root.querySelectorAll('[data-network-result]')];

    if (!stage || !grid || !output || !runButton || !clearButton) {
        return () => {};
    }

    const pixelButtons = createPixelGrid(grid);
    let runId = 0;

    const resetResult = () => {
        output.textContent = '—';

        resultRows.forEach((row) => {
            row.classList.remove('is-winner');
            row.style.setProperty('--score', '0%');
            row.querySelector('small').textContent = '0%';
        });
    };

    const cancel = () => {
        runId += 1;
        runButton.disabled = false;
        stage.classList.remove('is-processing');
        stage.setAttribute('aria-busy', 'false');
    };

    const setPixels = (pixels) => {
        pixelButtons.forEach((button, index) => setPixel(button, pixels[index] === 1));
        resetResult();
    };

    const loadPreset = (button) => {
        cancel();
        setPixels(digitTemplates[button.dataset.networkPreset]);
        setPressed(presetButtons, button);
    };

    const clear = () => {
        cancel();
        setPixels(Array(pixelCount).fill(0));
        setPressed(presetButtons);
    };

    const renderResult = (result) => {
        resultRows.forEach((row, index) => {
            const score = Math.round(result.probabilities[index] * 100);

            row.classList.toggle('is-winner', row.dataset.networkResult === result.digit);
            row.style.setProperty('--score', `${score}%`);
            row.querySelector('small').textContent = `${score}%`;
        });

        output.textContent = `${result.digit} · ${Math.round(result.confidence * 100)}%`;
    };

    const run = async () => {
        const pixels = readPixels(pixelButtons);

        if (!pixels.some(Boolean)) {
            output.textContent = stage.dataset.networkEmpty;
            return;
        }

        const currentRun = ++runId;

        resetResult();
        runButton.disabled = true;
        stage.classList.add('is-processing');
        stage.setAttribute('aria-busy', 'true');

        if (!reducedMotion) {
            await delay(signalDelay);
        }

        if (runId !== currentRun || !stage.isConnected) {
            return;
        }

        renderResult(recognizeDigit(pixels));
        runButton.disabled = false;
        stage.classList.remove('is-processing');
        stage.setAttribute('aria-busy', 'false');
    };

    const handleClick = (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const pixel = target?.closest('[data-network-pixel]');
        const preset = target?.closest('[data-network-preset]');

        if (pixel instanceof HTMLButtonElement) {
            cancel();
            setRovingTabStop(pixelButtons, pixel);
            setPixel(pixel, pixel.getAttribute('aria-selected') !== 'true');
            setPressed(presetButtons);
            resetResult();
        } else if (preset instanceof HTMLButtonElement) {
            loadPreset(preset);
        } else if (target?.closest('[data-network-clear]')) {
            clear();
        } else if (target?.closest('[data-network-run]')) {
            run();
        }
    };

    const handleKeydown = (event) => {
        const pixel = event.target instanceof HTMLButtonElement
            ? event.target.closest('[data-network-pixel]')
            : null;

        if (pixel && movePixelFocus(pixelButtons, pixel, event.key)) {
            event.preventDefault();
        }
    };

    root.addEventListener('click', handleClick);
    grid.addEventListener('keydown', handleKeydown);
    stage.setAttribute('aria-busy', 'false');

    const initialPreset = presetButtons.find(
        (button) => button.getAttribute('aria-pressed') === 'true',
    );

    if (initialPreset) {
        loadPreset(initialPreset);
    }

    return () => {
        runId += 1;
        root.removeEventListener('click', handleClick);
        grid.removeEventListener('keydown', handleKeydown);
    };
};
