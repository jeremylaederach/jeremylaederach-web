import {
    delay,
    gridIndexAfterKey,
    setPressed,
    setRovingTabStop,
} from './demo-utils.js';

const explorationDelay = 34;
const routeDelay = 58;

const directions = Object.freeze([
    Object.freeze({ column: 1, row: 0 }),
    Object.freeze({ column: 0, row: 1 }),
    Object.freeze({ column: 0, row: -1 }),
    Object.freeze({ column: -1, row: 0 }),
]);

export const gridLayout = Object.freeze({
    columns: 10,
    rows: 6,
    start: Object.freeze({ column: 0, row: 3 }),
    goal: Object.freeze({ column: 9, row: 2 }),
});

const defaultWallKeys = Object.freeze([
    '2:0', '2:1', '2:3', '2:4',
    '4:1', '4:2', '4:3', '4:5',
    '6:0', '6:2', '6:3', '6:4',
    '8:1', '8:3', '8:4',
]);

export const pathfindingModes = Object.freeze(['shortest', 'guided', 'straight']);
export const cellKey = ({ column, row }) => `${column}:${row}`;
export const createDefaultWalls = () => new Set(defaultWallKeys);

const sameCell = (left, right) => (
    left.column === right.column && left.row === right.row
);

const distance = (left, right) => (
    Math.abs(left.column - right.column) + Math.abs(left.row - right.row)
);

const neighboursOf = (cell, { columns, rows, walls }) => directions
    .map((direction, directionIndex) => ({
        cell: {
            column: cell.column + direction.column,
            row: cell.row + direction.row,
        },
        direction: directionIndex,
    }))
    .filter(({ cell: next }) => (
        next.column >= 0
        && next.column < columns
        && next.row >= 0
        && next.row < rows
        && !walls.has(cellKey(next))
    ));

const countTurns = (path) => {
    let previousDirection = null;
    let turns = 0;

    for (let index = 1; index < path.length; index += 1) {
        const direction = `${
            path[index].column - path[index - 1].column
        }:${path[index].row - path[index - 1].row}`;

        if (previousDirection !== null && direction !== previousDirection) {
            turns += 1;
        }

        previousDirection = direction;
    }

    return turns;
};

const reconstructCells = (parents, goalKey) => {
    const path = [];
    let currentKey = goalKey;

    while (currentKey !== null) {
        const [column, row] = currentKey.split(':').map(Number);

        path.push({ column, row });
        currentKey = parents.get(currentKey) ?? null;
    }

    return path.reverse();
};

const findShortestPath = (options, guided) => {
    const startKey = cellKey(options.start);
    const frontier = [{ cell: options.start, steps: 0, order: 0 }];
    const parents = new Map([[startKey, null]]);
    const scores = new Map([[startKey, 0]]);
    const closed = new Set();
    const visited = [];
    let order = 1;
    let goalKey = null;

    while (frontier.length > 0) {
        if (guided) {
            frontier.sort((left, right) => (
                left.steps + distance(left.cell, options.goal)
                - right.steps - distance(right.cell, options.goal)
                || distance(left.cell, options.goal) - distance(right.cell, options.goal)
                || left.order - right.order
            ));
        }

        const current = frontier.shift();
        const currentKey = cellKey(current.cell);

        if (closed.has(currentKey) || current.steps !== scores.get(currentKey)) {
            continue;
        }

        closed.add(currentKey);
        visited.push(current.cell);

        if (sameCell(current.cell, options.goal)) {
            goalKey = currentKey;
            break;
        }

        neighboursOf(current.cell, options).forEach(({ cell }) => {
            const nextKey = cellKey(cell);
            const nextSteps = current.steps + 1;

            if (nextSteps >= (scores.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
                return;
            }

            parents.set(nextKey, currentKey);
            scores.set(nextKey, nextSteps);
            frontier.push({ cell, steps: nextSteps, order });
            order += 1;
        });
    }

    return {
        path: goalKey === null ? [] : reconstructCells(parents, goalKey),
        visited,
    };
};

const stateKey = (cell, direction) => `${cellKey(cell)}:${direction}`;
const betterCost = (candidate, current) => (
    current === undefined
    || candidate.turns < current.turns
    || (candidate.turns === current.turns && candidate.steps < current.steps)
);

const reconstructStates = (states, parents, goalStateKey) => {
    const path = [];
    let currentKey = goalStateKey;

    while (currentKey !== null) {
        path.push(states.get(currentKey).cell);
        currentKey = parents.get(currentKey) ?? null;
    }

    return path.reverse();
};

const findStraightPath = (options) => {
    const firstState = {
        cell: options.start,
        direction: -1,
        order: 0,
        steps: 0,
        turns: 0,
    };
    const firstKey = stateKey(firstState.cell, firstState.direction);
    const frontier = [firstState];
    const best = new Map([[firstKey, { steps: 0, turns: 0 }]]);
    const parents = new Map([[firstKey, null]]);
    const states = new Map([[firstKey, firstState]]);
    const visited = [];
    const visitedKeys = new Set();
    let goalStateKey = null;
    let order = 1;

    while (frontier.length > 0) {
        frontier.sort((left, right) => (
            left.turns - right.turns
            || left.steps - right.steps
            || distance(left.cell, options.goal) - distance(right.cell, options.goal)
            || left.order - right.order
        ));

        const current = frontier.shift();
        const currentStateKey = stateKey(current.cell, current.direction);
        const currentBest = best.get(currentStateKey);

        if (current.turns !== currentBest.turns || current.steps !== currentBest.steps) {
            continue;
        }

        const currentCellKey = cellKey(current.cell);

        if (!visitedKeys.has(currentCellKey)) {
            visited.push(current.cell);
            visitedKeys.add(currentCellKey);
        }

        if (sameCell(current.cell, options.goal)) {
            goalStateKey = currentStateKey;
            break;
        }

        neighboursOf(current.cell, options).forEach(({ cell, direction }) => {
            const cost = {
                steps: current.steps + 1,
                turns: current.turns + Number(
                    current.direction !== -1 && current.direction !== direction,
                ),
            };
            const nextStateKey = stateKey(cell, direction);

            if (!betterCost(cost, best.get(nextStateKey))) {
                return;
            }

            const nextState = { cell, direction, order, ...cost };

            best.set(nextStateKey, cost);
            parents.set(nextStateKey, currentStateKey);
            states.set(nextStateKey, nextState);
            frontier.push(nextState);
            order += 1;
        });
    }

    return {
        path: goalStateKey === null
            ? []
            : reconstructStates(states, parents, goalStateKey),
        visited,
    };
};

export const findPath = ({
    mode = 'shortest',
    walls = createDefaultWalls(),
    columns = gridLayout.columns,
    rows = gridLayout.rows,
    start = gridLayout.start,
    goal = gridLayout.goal,
} = {}) => {
    if (!pathfindingModes.includes(mode)) {
        throw new RangeError(`Unknown pathfinding mode: ${mode}`);
    }

    if (!Number.isInteger(columns) || columns < 1 || !Number.isInteger(rows) || rows < 1) {
        throw new RangeError('Pathfinder dimensions must be positive integers.');
    }

    const isOutside = (cell) => (
        !Number.isInteger(cell?.column)
        || !Number.isInteger(cell?.row)
        || cell.column < 0
        || cell.column >= columns
        || cell.row < 0
        || cell.row >= rows
    );

    if (isOutside(start) || isOutside(goal)) {
        throw new RangeError('Pathfinder endpoints must be inside the grid.');
    }

    if (!(walls instanceof Set)) {
        throw new TypeError('Pathfinder walls must be a Set.');
    }

    const openWalls = new Set(walls);

    openWalls.delete(cellKey(start));
    openWalls.delete(cellKey(goal));

    const options = { columns, goal, rows, start, walls: openWalls };
    const result = mode === 'straight'
        ? findStraightPath(options)
        : findShortestPath(options, mode === 'guided');

    return {
        ...result,
        steps: Math.max(0, result.path.length - 1),
        turns: countTurns(result.path),
    };
};

const describeCell = (grid, cell, walls) => {
    const location = `${grid.dataset.pathfindingCellLabel} ${cell.row + 1}, ${cell.column + 1}`;

    if (sameCell(cell, gridLayout.start)) {
        return `${location}: ${grid.dataset.pathfindingStartLabel}, ${grid.dataset.pathfindingFixedLabel}`;
    }

    if (sameCell(cell, gridLayout.goal)) {
        return `${location}: ${grid.dataset.pathfindingGoalLabel}, ${grid.dataset.pathfindingFixedLabel}`;
    }

    const state = walls.has(cellKey(cell))
        ? grid.dataset.pathfindingBlockedLabel
        : grid.dataset.pathfindingOpenLabel;

    return `${location}: ${state}`;
};

const createGrid = (grid) => {
    const cells = new Map();
    const rows = Array.from({ length: gridLayout.rows }, (_, row) => {
        const rowElement = document.createElement('span');

        rowElement.className = 'path-grid__row';
        rowElement.setAttribute('role', 'row');

        for (let column = 0; column < gridLayout.columns; column += 1) {
            const cell = { column, row };
            const key = cellKey(cell);
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'path-cell';
            button.dataset.pathfindingCell = key;
            button.setAttribute('role', 'gridcell');
            button.tabIndex = sameCell(cell, gridLayout.start) ? 0 : -1;
            rowElement.append(button);
            cells.set(key, button);
        }

        return rowElement;
    });

    grid.replaceChildren(...rows);

    return cells;
};

const cellFromKey = (key) => {
    const [column, row] = key.split(':').map(Number);

    return { column, row };
};

const moveCellFocus = (cells, current, key) => {
    const cell = cellFromKey(current.dataset.pathfindingCell);
    const index = cell.row * gridLayout.columns + cell.column;
    const nextIndex = gridIndexAfterKey(index, gridLayout.columns, gridLayout.rows, key);

    if (nextIndex === null) {
        return false;
    }

    const next = {
        column: nextIndex % gridLayout.columns,
        row: Math.floor(nextIndex / gridLayout.columns),
    };
    const nextButton = cells.get(cellKey(next));

    setRovingTabStop(cells.values(), nextButton);
    nextButton.focus();

    return true;
};

export const initializePathfindingDemo = (root, reducedMotion) => {
    const grid = root.querySelector('[data-pathfinding-grid]');
    const output = root.querySelector('[data-pathfinding-output]');
    const status = root.querySelector('[data-pathfinding-status]');
    const description = root.querySelector('[data-pathfinding-description]');
    const runButton = root.querySelector('[data-pathfinding-run]');
    const resetButton = root.querySelector('[data-pathfinding-reset]');
    const strategyButtons = [...root.querySelectorAll('[data-pathfinding-strategy]')];

    if (!grid || !output || !status || !description || !runButton || !resetButton) {
        return () => {};
    }

    let walls = createDefaultWalls();
    const cells = createGrid(grid);
    let mode = strategyButtons[0]?.dataset.pathfindingStrategy ?? 'shortest';
    let visited = new Set();
    let path = new Set();
    let runId = 0;

    const render = () => {
        cells.forEach((button, key) => {
            const cell = cellFromKey(key);
            const isStart = sameCell(cell, gridLayout.start);
            const isGoal = sameCell(cell, gridLayout.goal);

            button.classList.toggle('is-wall', walls.has(key));
            button.classList.toggle('is-visited', visited.has(key));
            button.classList.toggle('is-path', path.has(key));
            button.classList.toggle('is-start', isStart);
            button.classList.toggle('is-goal', isGoal);
            button.textContent = isStart ? 'A' : isGoal ? 'B' : '';
            button.setAttribute('aria-label', describeCell(grid, cell, walls));
            button.setAttribute('aria-readonly', String(isStart || isGoal));
            button.setAttribute('aria-selected', String(walls.has(key)));
        });
    };

    const cancel = () => {
        runId += 1;
        runButton.disabled = false;
        root.setAttribute('aria-busy', 'false');
    };

    const clearSearch = () => {
        visited = new Set();
        path = new Set();
        output.textContent = '—';
        status.textContent = '';
        render();
    };

    const reset = () => {
        cancel();
        walls = createDefaultWalls();
        clearSearch();
    };

    const toggleWall = (button) => {
        const cell = cellFromKey(button.dataset.pathfindingCell);

        if (sameCell(cell, gridLayout.start) || sameCell(cell, gridLayout.goal)) {
            status.textContent = describeCell(grid, cell, walls);
            return;
        }

        cancel();

        const key = cellKey(cell);

        if (walls.has(key)) {
            walls.delete(key);
        } else {
            walls.add(key);
        }

        clearSearch();
        status.textContent = describeCell(grid, cell, walls);
    };

    const finishSearch = (result) => {
        if (result.path.length === 0) {
            output.textContent = grid.dataset.pathfindingNoPathLabel;
            status.textContent = `${result.visited.length} ${grid.dataset.pathfindingCheckedLabel}. ${grid.dataset.pathfindingNoPathLabel}.`;
            return;
        }

        output.textContent = `${result.visited.length} · ${result.steps} · ${result.turns}`;
        status.textContent = `${result.visited.length} ${grid.dataset.pathfindingCheckedLabel} · ${result.steps} ${grid.dataset.pathfindingStepsLabel} · ${result.turns} ${grid.dataset.pathfindingTurnsLabel}.`;
    };

    const run = async () => {
        const currentRun = ++runId;
        const result = findPath({ mode, walls });

        visited = new Set();
        path = new Set();
        output.textContent = '—';
        status.textContent = '';
        runButton.disabled = true;
        root.setAttribute('aria-busy', 'true');
        render();

        if (reducedMotion) {
            visited = new Set(result.visited.map(cellKey));
            path = new Set(result.path.map(cellKey));
            render();
        } else {
            for (const cell of result.visited) {
                if (runId !== currentRun || !grid.isConnected) {
                    return;
                }

                visited.add(cellKey(cell));
                render();
                await delay(explorationDelay);
            }

            for (const cell of result.path) {
                if (runId !== currentRun || !grid.isConnected) {
                    return;
                }

                path.add(cellKey(cell));
                render();
                await delay(routeDelay);
            }
        }

        if (runId !== currentRun || !grid.isConnected) {
            return;
        }

        runButton.disabled = false;
        root.setAttribute('aria-busy', 'false');
        finishSearch(result);
    };

    const handleClick = (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const cell = target?.closest('[data-pathfinding-cell]');
        const strategy = target?.closest('[data-pathfinding-strategy]');

        if (cell instanceof HTMLButtonElement) {
            setRovingTabStop(cells.values(), cell);
            toggleWall(cell);
        } else if (strategy instanceof HTMLButtonElement) {
            cancel();
            mode = strategy.dataset.pathfindingStrategy;
            description.textContent = strategy.dataset.pathfindingDescription;
            setPressed(strategyButtons, strategy);
            clearSearch();
        } else if (target?.closest('[data-pathfinding-reset]')) {
            reset();
        } else if (target?.closest('[data-pathfinding-run]')) {
            run();
        }
    };

    const handleKeydown = (event) => {
        const cell = event.target instanceof HTMLButtonElement
            ? event.target.closest('[data-pathfinding-cell]')
            : null;

        if (cell && moveCellFocus(cells, cell, event.key)) {
            event.preventDefault();
        }
    };

    root.addEventListener('click', handleClick);
    grid.addEventListener('keydown', handleKeydown);
    root.setAttribute('aria-busy', 'false');
    render();

    return () => {
        runId += 1;
        root.removeEventListener('click', handleClick);
        grid.removeEventListener('keydown', handleKeydown);
    };
};
