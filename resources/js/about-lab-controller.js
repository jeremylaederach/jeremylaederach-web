const delay = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
});

const selectDemo = (root, key, moveFocus = false) => {
    if (!(root instanceof HTMLElement)) {
        return;
    }

    root.querySelectorAll('[data-lab-tab]').forEach((tab) => {
        const isSelected = tab.dataset.labTab === key;

        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;

        if (isSelected && moveFocus) {
            tab.focus();
        }
    });

    root.querySelectorAll('[data-lab-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.labPanel !== key;
    });
};

const runSort = async (panel, reducedMotion) => {
    const bars = [...panel.querySelectorAll('[data-sort-value]')];
    const output = panel.querySelector('[data-lab-output]');
    const button = panel.querySelector('[data-lab-action="backend"]');
    const runs = [
        [62, 28, 86, 44, 70, 36],
        [78, 34, 56, 22, 88, 46],
        [52, 84, 30, 68, 24, 76],
    ];
    const run = (Number(panel.dataset.sortRun ?? -1) + 1) % runs.length;
    const values = [...runs[run]];
    let swaps = 0;

    const render = (active = []) => {
        bars.forEach((bar, index) => {
            const value = values[index];

            bar.style.setProperty('--sort-value', value);
            bar.querySelector('i').textContent = value;
            bar.classList.toggle('is-active', active.includes(index));
        });

        output.textContent = swaps;
    };

    panel.dataset.sortRun = run;
    button.disabled = true;
    render();

    for (let pass = 0; pass < values.length - 1; pass += 1) {
        for (let index = 0; index < values.length - pass - 1; index += 1) {
            render([index, index + 1]);
            await delay(reducedMotion ? 0 : 90);

            if (values[index] > values[index + 1]) {
                [values[index], values[index + 1]] = [values[index + 1], values[index]];
                swaps += 1;
                render([index, index + 1]);
                await delay(reducedMotion ? 0 : 110);
            }
        }
    }

    render();
    button.disabled = false;
};

const cycleLayout = (panel) => {
    const preview = panel.querySelector('[data-lab-layout]');
    const output = panel.querySelector('[data-lab-output]');
    const labels = preview.dataset.layoutStates.split('|');
    const next = (Number(preview.dataset.layoutIndex) + 1) % labels.length;

    preview.dataset.layoutIndex = next;
    output.textContent = labels[next];
};

const runQuery = (panel, reducedMotion) => {
    const query = panel.querySelector('[data-lab-query]');
    const button = panel.querySelector('[data-lab-action="data"]');

    query.classList.remove('is-complete');
    button.disabled = true;

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => query.classList.add('is-complete'));
    });

    window.setTimeout(() => {
        button.disabled = false;
    }, reducedMotion ? 0 : 900);
};

const runPipeline = async (panel, reducedMotion) => {
    const pipeline = panel.querySelector('[data-lab-pipeline]');
    const steps = [...pipeline.querySelectorAll('[data-pipeline-step]')];
    const output = panel.querySelector('[data-lab-output]');
    const button = panel.querySelector('[data-lab-action="delivery"]');

    steps.forEach((step) => step.classList.remove('is-running', 'is-complete'));
    output.textContent = '—';
    button.disabled = true;

    for (const step of steps) {
        step.classList.add('is-running');
        await delay(reducedMotion ? 0 : 360);
        step.classList.remove('is-running');
        step.classList.add('is-complete');
    }

    output.textContent = pipeline.dataset.completeLabel;
    button.disabled = false;
};

export const createAboutLabController = ({ reducedMotion }) => ({
    initialize: () => {
        document.addEventListener('click', (event) => {
            const target = event.target instanceof Element ? event.target : null;
            const tab = target?.closest('[data-lab-tab]');
            const action = target?.closest('[data-lab-action]');

            if (tab instanceof HTMLButtonElement) {
                selectDemo(tab.closest('[data-about-lab]'), tab.dataset.labTab);
            }

            if (!(action instanceof HTMLButtonElement)) {
                return;
            }

            const panel = action.closest('[data-lab-panel]');

            if (!(panel instanceof HTMLElement)) {
                return;
            }

            const runners = {
                backend: () => runSort(panel, reducedMotion),
                interfaces: () => cycleLayout(panel),
                data: () => runQuery(panel, reducedMotion),
                delivery: () => runPipeline(panel, reducedMotion),
            };

            runners[action.dataset.labAction]?.();
        });

        document.addEventListener('keydown', (event) => {
            const tab = event.target instanceof Element
                ? event.target.closest('[data-lab-tab]')
                : null;

            if (!(tab instanceof HTMLButtonElement) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                return;
            }

            const tabs = [...tab.parentElement.querySelectorAll('[data-lab-tab]')];
            const direction = event.key === 'ArrowRight' ? 1 : -1;
            const next = (tabs.indexOf(tab) + direction + tabs.length) % tabs.length;

            event.preventDefault();
            selectDemo(tab.closest('[data-about-lab]'), tabs[next].dataset.labTab, true);
        });
    },
});
