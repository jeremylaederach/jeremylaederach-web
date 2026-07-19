import { getPalette, selectOption, wait } from './demo-utils.js';

const createValues = (size = 20) => {
    const values = Array.from({ length: size }, (_, index) => (index + 2) / (size + 3));

    for (let index = values.length - 1; index > 0; index -= 1) {
        const target = Math.floor(Math.random() * (index + 1));
        [values[index], values[target]] = [values[target], values[index]];
    }

    return values;
};

const bubbleFrames = (source) => {
    const values = [...source];
    const frames = [];

    for (let pass = 0; pass < values.length - 1; pass += 1) {
        for (let index = 0; index < values.length - pass - 1; index += 1) {
            frames.push({ values: [...values], active: [index, index + 1] });

            if (values[index] > values[index + 1]) {
                [values[index], values[index + 1]] = [values[index + 1], values[index]];
                frames.push({ values: [...values], active: [index, index + 1] });
            }
        }
    }

    return frames;
};

const quickFrames = (source) => {
    const values = [...source];
    const frames = [];

    const sort = (low, high) => {
        if (low >= high) {
            return;
        }

        const pivot = values[high];
        let boundary = low;

        for (let index = low; index < high; index += 1) {
            frames.push({ values: [...values], active: [index, high] });

            if (values[index] <= pivot) {
                [values[index], values[boundary]] = [values[boundary], values[index]];
                frames.push({ values: [...values], active: [boundary, high] });
                boundary += 1;
            }
        }

        [values[boundary], values[high]] = [values[high], values[boundary]];
        frames.push({ values: [...values], active: [boundary] });
        sort(low, boundary - 1);
        sort(boundary + 1, high);
    };

    sort(0, values.length - 1);

    return frames;
};

const mergeFrames = (source) => {
    const values = [...source];
    const frames = [];

    const sort = (start, end) => {
        if (end - start < 2) {
            return;
        }

        const middle = Math.floor((start + end) / 2);
        sort(start, middle);
        sort(middle, end);

        const merged = [];
        let left = start;
        let right = middle;

        while (left < middle || right < end) {
            if (right >= end || (left < middle && values[left] <= values[right])) {
                merged.push(values[left]);
                left += 1;
            } else {
                merged.push(values[right]);
                right += 1;
            }
        }

        merged.forEach((value, offset) => {
            values[start + offset] = value;
            frames.push({ values: [...values], active: [start + offset] });
        });
    };

    sort(0, values.length);

    return frames;
};

const algorithms = {
    bubble: bubbleFrames,
    merge: mergeFrames,
    quick: quickFrames,
};

const draw = (canvas, values, active = []) => {
    const context = canvas.getContext('2d');
    const palette = getPalette();
    const gap = 5;
    const baseline = canvas.height - 22;
    const barWidth = (canvas.width - gap * (values.length + 1)) / values.length;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = palette.line;
    context.beginPath();
    context.moveTo(0, baseline + 0.5);
    context.lineTo(canvas.width, baseline + 0.5);
    context.stroke();

    values.forEach((value, index) => {
        const height = value * (canvas.height - 56);
        context.fillStyle = active.includes(index) ? palette.ink : palette.accent;
        context.globalAlpha = active.includes(index) ? 0.95 : 0.56;
        context.fillRect(gap + index * (barWidth + gap), baseline - height, barWidth, height);
    });

    context.globalAlpha = 1;
};

export const initializeSortingDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-sorting-canvas]');
    const output = root.querySelector('[data-sorting-output]');
    const runButton = root.querySelector('[data-sorting-run]');
    let algorithm = 'quick';
    let values = createValues();
    let runId = 0;

    const shuffle = () => {
        runId += 1;
        values = createValues();
        output.textContent = '0';
        runButton.disabled = false;
        draw(canvas, values);
    };

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-sorting-algorithm]');

        if (option instanceof HTMLButtonElement) {
            runId += 1;
            algorithm = option.dataset.sortingAlgorithm;
            selectOption(root, '[data-sorting-algorithm]', option);
            output.textContent = '0';
            runButton.disabled = false;
            draw(canvas, values);
            return;
        }

        if (target?.closest('[data-sorting-shuffle]')) {
            shuffle();
            return;
        }

        if (!target?.closest('[data-sorting-run]')) {
            return;
        }

        const currentRun = ++runId;
        const frames = algorithms[algorithm](values);
        const frameStep = reducedMotion ? frames.length : Math.max(1, Math.ceil(frames.length / 96));
        runButton.disabled = true;

        for (let index = 0; index < frames.length; index += frameStep) {
            if (currentRun !== runId || !canvas.isConnected) {
                return;
            }

            const frame = frames[Math.min(index, frames.length - 1)];
            draw(canvas, frame.values, frame.active);
            output.textContent = String(Math.min(index + frameStep, frames.length));
            await wait(reducedMotion ? 0 : 16);
        }

        values = [...frames.at(-1).values];
        draw(canvas, values);
        runButton.disabled = false;
    });

    draw(canvas, values);
};
