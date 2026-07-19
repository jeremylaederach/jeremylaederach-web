import { selectOption, wait } from './demo-utils.js';

const itemCount = 12;
const comparisonDelay = 120;
const moveDelay = 320;

const createValues = () => {
    const values = Array.from({ length: itemCount }, (_, index) => index + 1);

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
            frames.push({
                values: [...values],
                active: [index, index + 1],
                type: 'compare',
            });

            if (values[index] > values[index + 1]) {
                [values[index], values[index + 1]] = [values[index + 1], values[index]];
                frames.push({
                    values: [...values],
                    active: [index, index + 1],
                    type: 'move',
                });
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
            frames.push({
                values: [...values],
                active: [index, high],
                type: 'compare',
            });

            if (values[index] <= pivot) {
                [values[index], values[boundary]] = [values[boundary], values[index]];

                if (index !== boundary) {
                    frames.push({
                        values: [...values],
                        active: [boundary, index],
                        type: 'move',
                    });
                }

                boundary += 1;
            }
        }

        [values[boundary], values[high]] = [values[high], values[boundary]];

        if (boundary !== high) {
            frames.push({
                values: [...values],
                active: [boundary, high],
                type: 'move',
            });
        }

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

        const leftValues = values.slice(start, middle);
        const rightValues = values.slice(middle, end);
        const merged = [];
        let left = 0;
        let right = 0;

        while (left < leftValues.length || right < rightValues.length) {
            if (right >= rightValues.length || (
                left < leftValues.length
                && leftValues[left] <= rightValues[right]
            )) {
                const leftIndex = values.indexOf(leftValues[left]);
                const rightIndex = right < rightValues.length
                    ? values.indexOf(rightValues[right])
                    : leftIndex;

                frames.push({
                    values: [...values],
                    active: [leftIndex, rightIndex],
                    type: 'compare',
                });
                merged.push(leftValues[left]);
                left += 1;
            } else {
                const leftIndex = left < leftValues.length
                    ? values.indexOf(leftValues[left])
                    : values.indexOf(rightValues[right]);
                const rightIndex = values.indexOf(rightValues[right]);

                frames.push({
                    values: [...values],
                    active: [leftIndex, rightIndex],
                    type: 'compare',
                });
                merged.push(rightValues[right]);
                right += 1;
            }
        }

        values.splice(start, end - start, ...merged);
        frames.push({
            values: [...values],
            active: Array.from({ length: end - start }, (_, index) => start + index),
            type: 'move',
        });
    };

    sort(0, values.length);

    return frames;
};

const insertionFrames = (source) => {
    const values = [...source];
    const frames = [];

    for (let index = 1; index < values.length; index += 1) {
        let position = index;

        while (position > 0) {
            frames.push({
                values: [...values],
                active: [position - 1, position],
                type: 'compare',
            });

            if (values[position - 1] <= values[position]) {
                break;
            }

            [values[position - 1], values[position]] = [
                values[position],
                values[position - 1],
            ];
            frames.push({
                values: [...values],
                active: [position - 1, position],
                type: 'move',
            });
            position -= 1;
        }
    }

    return frames;
};

const algorithms = {
    quick: quickFrames,
    merge: mergeFrames,
    insertion: insertionFrames,
    bubble: bubbleFrames,
};

const createBars = (plot) => {
    const bars = Array.from({ length: itemCount }, (_, index) => {
        const value = index + 1;
        const bar = document.createElement('span');
        const label = document.createElement('small');

        bar.className = 'sorting-stage__bar';
        bar.dataset.sortingValue = String(value);
        bar.style.setProperty('--bar-height', `${18 + (value / itemCount) * 76}%`);
        label.textContent = String(value);
        bar.append(label);

        return bar;
    });

    plot.replaceChildren(...bars);

    return bars;
};

const render = (bars, values, active = [], state = 'idle') => {
    const activeValues = new Set(active.map((index) => values[index]));

    bars.forEach((bar) => {
        const value = Number(bar.dataset.sortingValue);
        const position = values.indexOf(value);

        bar.style.left = `calc(${(position / itemCount) * 100}% + 3px)`;
        bar.classList.toggle('is-active', activeValues.has(value));
        bar.classList.toggle('is-moving', state === 'move' && activeValues.has(value));
        bar.classList.toggle('is-sorted', state === 'sorted');
    });
};

const frameDelay = (frame) => {
    if (frame.type === 'move') {
        return moveDelay;
    }

    return comparisonDelay;
};

export const initializeSortingDemo = (root, reducedMotion) => {
    const stage = root.querySelector('[data-sorting-stage]');
    const plot = root.querySelector('[data-sorting-plot]');
    const description = root.querySelector('[data-sorting-description]');
    const complexity = root.querySelector('[data-sorting-complexity]');
    const output = root.querySelector('[data-sorting-output]');
    const runButton = root.querySelector('[data-sorting-run]');
    const bars = createBars(plot);
    let algorithm = 'quick';
    let values = createValues();
    let runId = 0;

    const shuffle = () => {
        runId += 1;
        values = createValues();
        output.textContent = '0';
        runButton.disabled = false;
        stage.setAttribute('aria-busy', 'false');
        render(bars, values);
    };

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-sorting-algorithm]');

        if (option instanceof HTMLButtonElement) {
            runId += 1;
            algorithm = option.dataset.sortingAlgorithm;
            selectOption(root, '[data-sorting-algorithm]', option);
            description.textContent = option.dataset.sortingDescription;
            complexity.textContent = option.dataset.sortingComplexity;
            output.textContent = '0';
            runButton.disabled = false;
            stage.setAttribute('aria-busy', 'false');
            render(bars, values);
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
        runButton.disabled = true;
        stage.setAttribute('aria-busy', 'true');

        for (let index = 0; index < frames.length; index += 1) {
            if (currentRun !== runId || !stage.isConnected) {
                return;
            }

            const frame = frames[index];
            render(bars, frame.values, frame.active, frame.type);
            output.textContent = String(index + 1);
            await wait(reducedMotion ? 0 : frameDelay(frame));
        }

        values = [...(frames.at(-1)?.values ?? values)];
        render(bars, values, [], 'sorted');
        stage.setAttribute('aria-busy', 'false');
        runButton.disabled = false;
    });

    stage.setAttribute('aria-busy', 'false');
    render(bars, values);
};
