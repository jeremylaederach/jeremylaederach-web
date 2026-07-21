import { delay, setPressed } from './demo-utils.js';

const itemCount = 9;
const comparisonDelay = 130;
const movementDelay = 320;

const createTrace = (source) => {
    const values = [...source];
    const frames = [];
    let comparisons = 0;

    const record = (type, active) => {
        frames.push({
            active: [...active],
            type,
            values: [...values],
        });
    };

    return {
        values,
        compare: (...active) => {
            comparisons += 1;
            record('compare', active);
        },
        move: (...active) => record('move', active),
        finish: () => ({
            comparisons,
            frames,
            result: [...values],
        }),
    };
};

const quickSort = (source) => {
    const trace = createTrace(source);

    const partition = (start, end) => {
        const pivot = trace.values[end];
        let boundary = start;

        for (let index = start; index < end; index += 1) {
            trace.compare(trace.values[index], pivot);

            if (trace.values[index] <= pivot) {
                if (index !== boundary) {
                    [trace.values[index], trace.values[boundary]] = [
                        trace.values[boundary],
                        trace.values[index],
                    ];
                    trace.move(trace.values[index], trace.values[boundary]);
                }

                boundary += 1;
            }
        }

        if (boundary !== end) {
            [trace.values[boundary], trace.values[end]] = [
                trace.values[end],
                trace.values[boundary],
            ];
            trace.move(trace.values[boundary], trace.values[end]);
        }

        return boundary;
    };

    const sort = (start, end) => {
        if (start >= end) {
            return;
        }

        const pivot = partition(start, end);

        sort(start, pivot - 1);
        sort(pivot + 1, end);
    };

    sort(0, trace.values.length - 1);

    return trace.finish();
};

const mergeSort = (source) => {
    const trace = createTrace(source);

    const sort = (start, end) => {
        if (end - start < 2) {
            return;
        }

        const middle = Math.floor((start + end) / 2);

        sort(start, middle);
        sort(middle, end);

        const left = trace.values.slice(start, middle);
        const right = trace.values.slice(middle, end);
        const merged = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            trace.compare(left[leftIndex], right[rightIndex]);

            if (left[leftIndex] <= right[rightIndex]) {
                merged.push(left[leftIndex]);
                leftIndex += 1;
            } else {
                merged.push(right[rightIndex]);
                rightIndex += 1;
            }
        }

        merged.push(...left.slice(leftIndex), ...right.slice(rightIndex));

        merged.forEach((value, offset) => {
            const target = start + offset;
            const current = trace.values.indexOf(value, target);

            if (current !== target) {
                trace.values.splice(current, 1);
                trace.values.splice(target, 0, value);
                trace.move(value);
            }
        });
    };

    sort(0, trace.values.length);

    return trace.finish();
};

const insertionSort = (source) => {
    const trace = createTrace(source);

    for (let index = 1; index < trace.values.length; index += 1) {
        let position = index;

        while (position > 0) {
            const left = trace.values[position - 1];
            const right = trace.values[position];

            trace.compare(left, right);

            if (left <= right) {
                break;
            }

            [trace.values[position - 1], trace.values[position]] = [right, left];
            trace.move(left, right);
            position -= 1;
        }
    }

    return trace.finish();
};

const selectionSort = (source) => {
    const trace = createTrace(source);

    for (let start = 0; start < trace.values.length - 1; start += 1) {
        let smallest = start;

        for (let index = start + 1; index < trace.values.length; index += 1) {
            trace.compare(trace.values[smallest], trace.values[index]);

            if (trace.values[index] < trace.values[smallest]) {
                smallest = index;
            }
        }

        if (smallest !== start) {
            [trace.values[start], trace.values[smallest]] = [
                trace.values[smallest],
                trace.values[start],
            ];
            trace.move(trace.values[start], trace.values[smallest]);
        }
    }

    return trace.finish();
};

const bubbleSort = (source) => {
    const trace = createTrace(source);

    for (let end = trace.values.length - 1; end > 0; end -= 1) {
        let moved = false;

        for (let index = 0; index < end; index += 1) {
            const left = trace.values[index];
            const right = trace.values[index + 1];

            trace.compare(left, right);

            if (left > right) {
                [trace.values[index], trace.values[index + 1]] = [right, left];
                trace.move(left, right);
                moved = true;
            }
        }

        if (!moved) {
            break;
        }
    }

    return trace.finish();
};

export const sortingAlgorithms = Object.freeze({
    quick: quickSort,
    merge: mergeSort,
    insertion: insertionSort,
    selection: selectionSort,
    bubble: bubbleSort,
});

export const createSortingValues = (random = Math.random) => {
    const values = Array.from({ length: itemCount }, (_, index) => index + 1);

    for (let index = values.length - 1; index > 0; index -= 1) {
        const target = Math.floor(random() * (index + 1));

        [values[index], values[target]] = [values[target], values[index]];
    }

    return values;
};

const createBars = (plot) => {
    const bars = Array.from({ length: itemCount }, (_, index) => {
        const value = index + 1;
        const bar = document.createElement('span');
        const label = document.createElement('small');

        bar.className = 'sorting-stage__bar';
        bar.dataset.sortingValue = String(value);
        bar.style.setProperty('--bar-height', `${16 + (value / itemCount) * 78}%`);
        label.textContent = String(value);
        bar.append(label);

        return bar;
    });

    plot.replaceChildren(...bars);

    return bars;
};

const renderBars = (bars, values, active = [], state = 'idle') => {
    const activeValues = new Set(active);

    bars.forEach((bar) => {
        const value = Number(bar.dataset.sortingValue);
        const position = values.indexOf(value);

        bar.style.setProperty('--bar-left', `${(position / itemCount) * 100}%`);
        bar.style.setProperty('--bar-width', `${100 / itemCount}%`);
        bar.classList.toggle('is-active', activeValues.has(value));
        bar.classList.toggle('is-moving', state === 'move' && activeValues.has(value));
        bar.classList.toggle('is-sorted', state === 'sorted');
    });
};

export const initializeSortingDemo = (root, reducedMotion) => {
    const stage = root.querySelector('[data-sorting-stage]');
    const plot = root.querySelector('[data-sorting-plot]');
    const output = root.querySelector('[data-sorting-output]');
    const status = root.querySelector('[data-sorting-status]');
    const description = root.querySelector('[data-sorting-description]');
    const runButton = root.querySelector('[data-sorting-run]');
    const algorithmButtons = [...root.querySelectorAll('[data-sorting-algorithm]')];

    if (!stage || !plot || !output || !status || !description || !runButton) {
        return () => {};
    }

    const bars = createBars(plot);
    let algorithm = algorithmButtons[0]?.dataset.sortingAlgorithm ?? 'quick';
    let values = createSortingValues();
    let runId = 0;

    const cancel = () => {
        runId += 1;
        runButton.disabled = false;
        stage.setAttribute('aria-busy', 'false');
    };

    const resetResult = () => {
        output.textContent = '0';
        status.textContent = '';
        renderBars(bars, values);
    };

    const mix = () => {
        cancel();
        values = createSortingValues();
        resetResult();
    };

    const run = async () => {
        const currentRun = ++runId;
        const trace = sortingAlgorithms[algorithm](values);

        runButton.disabled = true;
        stage.setAttribute('aria-busy', 'true');
        status.textContent = '';

        if (reducedMotion) {
            values = trace.result;
            output.textContent = String(trace.comparisons);
            renderBars(bars, values, [], 'sorted');
        } else {
            let comparisons = 0;

            for (const frame of trace.frames) {
                if (runId !== currentRun || !stage.isConnected) {
                    return;
                }

                values = frame.values;
                renderBars(bars, values, frame.active, frame.type);

                if (frame.type === 'compare') {
                    comparisons += 1;
                    output.textContent = String(comparisons);
                }

                await delay(frame.type === 'move' ? movementDelay : comparisonDelay);
            }

            values = trace.result;
            renderBars(bars, values, [], 'sorted');
        }

        if (runId !== currentRun || !stage.isConnected) {
            return;
        }

        runButton.disabled = false;
        stage.setAttribute('aria-busy', 'false');
        status.textContent = `${status.dataset.completeLabel}: ${trace.comparisons}.`;
    };

    const handleClick = (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-sorting-algorithm]');

        if (option instanceof HTMLButtonElement) {
            cancel();
            algorithm = option.dataset.sortingAlgorithm;
            description.textContent = option.dataset.sortingDescription;
            setPressed(algorithmButtons, option);
            resetResult();
            return;
        }

        if (target?.closest('[data-sorting-shuffle]')) {
            mix();
            return;
        }

        if (target?.closest('[data-sorting-run]')) {
            run();
        }
    };

    root.addEventListener('click', handleClick);
    stage.setAttribute('aria-busy', 'false');
    renderBars(bars, values);

    return () => {
        runId += 1;
        root.removeEventListener('click', handleClick);
    };
};
