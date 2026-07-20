import {
    getCanvasViewport,
    getPalette,
    observeCanvas,
    wait,
} from './demo-utils.js';
import {
    cellKey,
    createDefaultWalls,
    findGridPath,
    gridLayout,
} from './grid-pathfinder.js';

const explorationDelay = 28;
const routeDelay = 54;

const getGridGeometry = (width, height) => {
    const gap = width < 420 ? 3 : 4;
    const padding = width < 420 ? 10 : 16;
    const cellSize = Math.max(8, Math.floor(Math.min(
        (width - padding * 2 - gap * (gridLayout.columns - 1))
            / gridLayout.columns,
        (height - padding * 2 - gap * (gridLayout.rows - 1))
            / gridLayout.rows,
    )));
    const gridWidth = cellSize * gridLayout.columns
        + gap * (gridLayout.columns - 1);
    const gridHeight = cellSize * gridLayout.rows
        + gap * (gridLayout.rows - 1);

    return {
        cellSize,
        gap,
        left: (width - gridWidth) / 2,
        top: (height - gridHeight) / 2,
    };
};

const getCellRect = (geometry, cell) => ({
    height: geometry.cellSize,
    width: geometry.cellSize,
    x: geometry.left + cell.column * (geometry.cellSize + geometry.gap),
    y: geometry.top + cell.row * (geometry.cellSize + geometry.gap),
});

const drawRoundedRect = (context, { x, y, width, height }, radius) => {
    const right = x + width;
    const bottom = y + height;

    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(right - radius, y);
    context.quadraticCurveTo(right, y, right, y + radius);
    context.lineTo(right, bottom - radius);
    context.quadraticCurveTo(right, bottom, right - radius, bottom);
    context.lineTo(x + radius, bottom);
    context.quadraticCurveTo(x, bottom, x, bottom - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
};

const drawRoute = (context, geometry, path, palette) => {
    if (path.length < 2) {
        return;
    }

    context.globalAlpha = 0.9;
    context.strokeStyle = palette.accent;
    context.lineWidth = Math.max(2, geometry.cellSize * 0.1);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();

    path.forEach((cell, index) => {
        const rect = getCellRect(geometry, cell);
        const x = rect.x + rect.width / 2;
        const y = rect.y + rect.height / 2;

        if (index === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    });

    context.stroke();
};

const drawEndpoint = (context, geometry, cell, label, color) => {
    const rect = getCellRect(geometry, cell);
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const radius = Math.max(7, geometry.cellSize * 0.28);

    context.globalAlpha = 1;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#09090d';
    context.font = `700 ${Math.max(9, geometry.cellSize * 0.28)}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, x, y + 0.5);
};

const drawGrid = (
    canvas,
    walls,
    visited,
    path,
    keyboardCell,
) => {
    const { context, height, width } = getCanvasViewport(canvas);
    const geometry = getGridGeometry(width, height);
    const palette = getPalette();
    const visitedKeys = new Set(visited.map(cellKey));
    const pathKeys = new Set(path.map(cellKey));

    context.clearRect(0, 0, width, height);

    for (let row = 0; row < gridLayout.rows; row += 1) {
        for (let column = 0; column < gridLayout.columns; column += 1) {
            const cell = { column, row };
            const key = cellKey(cell);
            const rect = getCellRect(geometry, cell);
            const isWall = walls.has(key);
            const isPath = pathKeys.has(key);
            const isVisited = visitedKeys.has(key);
            let fillOpacity = 0.035;

            if (isWall || isPath) {
                fillOpacity = 0.2;
            } else if (isVisited) {
                fillOpacity = 0.09;
            }

            drawRoundedRect(context, rect, Math.min(5, geometry.cellSize * 0.16));
            context.globalAlpha = fillOpacity;
            context.fillStyle = isWall ? palette.ink : palette.accent;
            context.fill();

            context.globalAlpha = isWall ? 0.2 : 0.09;
            context.strokeStyle = palette.ink;
            context.lineWidth = 1;
            context.stroke();
        }
    }

    drawRoute(context, geometry, path, palette);

    if (keyboardCell) {
        const rect = getCellRect(geometry, keyboardCell);

        drawRoundedRect(context, {
            ...rect,
            height: rect.height + 4,
            width: rect.width + 4,
            x: rect.x - 2,
            y: rect.y - 2,
        }, Math.min(7, geometry.cellSize * 0.2));
        context.globalAlpha = 0.65;
        context.strokeStyle = palette.ink;
        context.lineWidth = 1.5;
        context.stroke();
    }

    drawEndpoint(context, geometry, gridLayout.start, 'A', palette.accent);
    drawEndpoint(context, geometry, gridLayout.goal, 'B', palette.coral);
    context.globalAlpha = 1;
    context.lineWidth = 1;
};

const cellFromPointer = (canvas, event) => {
    const bounds = canvas.getBoundingClientRect();
    const geometry = getGridGeometry(bounds.width, bounds.height);
    const x = event.clientX - bounds.left - geometry.left;
    const y = event.clientY - bounds.top - geometry.top;
    const stride = geometry.cellSize + geometry.gap;
    const column = Math.floor(x / stride);
    const row = Math.floor(y / stride);
    const insideCell = x >= 0
        && y >= 0
        && x % stride <= geometry.cellSize
        && y % stride <= geometry.cellSize;

    if (
        !insideCell
        || column < 0
        || column >= gridLayout.columns
        || row < 0
        || row >= gridLayout.rows
    ) {
        return null;
    }

    return { column, row };
};

const isEndpoint = (cell) => (
    cellKey(cell) === cellKey(gridLayout.start)
    || cellKey(cell) === cellKey(gridLayout.goal)
);

const readLabels = (canvas) => ({
    blocked: canvas.dataset.pathfindingBlockedLabel || 'blocked',
    cell: canvas.dataset.pathfindingCellLabel || 'Cell',
    fixed: canvas.dataset.pathfindingFixedLabel || 'cannot be blocked',
    goal: canvas.dataset.pathfindingGoalLabel || 'Goal',
    noPath: canvas.dataset.pathfindingNoPathLabel || 'No path',
    open: canvas.dataset.pathfindingOpenLabel || 'open',
    path: canvas.dataset.pathfindingPathLabel || 'steps',
    start: canvas.dataset.pathfindingStartLabel || 'Start',
    visited: canvas.dataset.pathfindingVisitedLabel || 'checked',
});

export const initializePathfindingDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-pathfinding-canvas]');
    const output = root.querySelector('[data-pathfinding-output]');
    const resetButton = root.querySelector('[data-pathfinding-reset]');
    const runButton = root.querySelector('[data-pathfinding-run]');
    const status = root.querySelector('[data-pathfinding-status]');
    const labels = readLabels(canvas);
    const baseAriaLabel = canvas.getAttribute('aria-label') || '';
    let walls = createDefaultWalls();
    let visited = [];
    let path = [];
    let keyboardCell = null;
    let runId = 0;

    if (!canvas.hasAttribute('tabindex')) {
        canvas.tabIndex = 0;
    }

    const render = () => drawGrid(
        canvas,
        walls,
        visited,
        path,
        keyboardCell,
    );

    const setCanvasLabel = (message = '') => {
        canvas.setAttribute(
            'aria-label',
            [baseAriaLabel, message].filter(Boolean).join(' '),
        );
    };

    const cancelSearch = () => {
        runId += 1;
        visited = [];
        path = [];
        output.textContent = '—';
        runButton.disabled = false;
        root.setAttribute('aria-busy', 'false');
    };

    const describeCell = (cell) => {
        const key = cellKey(cell);
        const endpoint = key === cellKey(gridLayout.start)
            ? labels.start
            : key === cellKey(gridLayout.goal)
                ? labels.goal
                : null;
        const state = endpoint
            ? `${endpoint}, ${labels.fixed}`
            : (walls.has(key) ? labels.blocked : labels.open);

        return `${labels.cell} ${cell.column + 1}, ${cell.row + 1}: ${state}.`;
    };

    const toggleWall = (cell) => {
        if (!cell) {
            return;
        }

        if (isEndpoint(cell)) {
            const cellDescription = describeCell(cell);

            setCanvasLabel(cellDescription);
            status.textContent = cellDescription;
            render();
            return;
        }

        cancelSearch();

        const key = cellKey(cell);

        if (walls.has(key)) {
            walls.delete(key);
        } else {
            walls.add(key);
        }

        const cellDescription = describeCell(cell);

        setCanvasLabel(cellDescription);
        status.textContent = cellDescription;
        render();
    };

    const handlePointer = (event) => {
        if (event.button !== 0) {
            return;
        }

        const cell = cellFromPointer(canvas, event);

        if (!cell) {
            return;
        }

        keyboardCell = cell;
        toggleWall(cell);
    };

    const handleKeydown = (event) => {
        const movement = {
            ArrowDown: { column: 0, row: 1 },
            ArrowLeft: { column: -1, row: 0 },
            ArrowRight: { column: 1, row: 0 },
            ArrowUp: { column: 0, row: -1 },
        }[event.key];

        if (movement) {
            event.preventDefault();
            keyboardCell ??= { ...gridLayout.start };
            keyboardCell = {
                column: Math.min(
                    gridLayout.columns - 1,
                    Math.max(0, keyboardCell.column + movement.column),
                ),
                row: Math.min(
                    gridLayout.rows - 1,
                    Math.max(0, keyboardCell.row + movement.row),
                ),
            };
            const cellDescription = describeCell(keyboardCell);

            setCanvasLabel(cellDescription);
            status.textContent = cellDescription;
            render();
            return;
        }

        if ((event.key === ' ' || event.key === 'Enter') && keyboardCell) {
            event.preventDefault();
            toggleWall(keyboardCell);
        }
    };

    const handleFocus = () => {
        keyboardCell ??= { ...gridLayout.start };
        const cellDescription = describeCell(keyboardCell);

        setCanvasLabel(cellDescription);
        status.textContent = cellDescription;
        render();
    };

    const handleBlur = () => {
        keyboardCell = null;
        setCanvasLabel();
        status.textContent = '';
        render();
    };

    const reset = () => {
        cancelSearch();
        walls = createDefaultWalls();
        setCanvasLabel();
        status.textContent = '';
        render();
    };

    const run = async () => {
        const currentRun = ++runId;
        const result = findGridPath({ walls });
        const stepCount = Math.max(0, result.path.length - 1);
        const hasPath = result.path.length > 0;
        const outputLabel = hasPath
            ? `${result.visited.length} · ${stepCount}`
            : labels.noPath;
        const resultLabel = hasPath
            ? `${result.visited.length} ${labels.visited} · ${stepCount} ${labels.path}`
            : `${result.visited.length} ${labels.visited} · ${labels.noPath}`;

        visited = [];
        path = [];
        output.textContent = '—';
        runButton.disabled = true;
        root.setAttribute('aria-busy', 'true');

        if (reducedMotion) {
            visited = result.visited;
            path = result.path;
        } else {
            for (let index = 0; index < result.visited.length; index += 2) {
                if (currentRun !== runId || !canvas.isConnected) {
                    return;
                }

                visited.push(...result.visited.slice(index, index + 2));
                render();
                await wait(explorationDelay);
            }

            for (const cell of result.path) {
                if (currentRun !== runId || !canvas.isConnected) {
                    return;
                }

                path.push(cell);
                render();
                await wait(routeDelay);
            }
        }

        if (currentRun !== runId || !canvas.isConnected) {
            return;
        }

        output.textContent = outputLabel;
        runButton.disabled = false;
        root.setAttribute('aria-busy', 'false');
        setCanvasLabel(`${resultLabel}.`);
        render();
    };

    canvas.addEventListener('blur', handleBlur);
    canvas.addEventListener('focus', handleFocus);
    canvas.addEventListener('keydown', handleKeydown);
    canvas.addEventListener('pointerup', handlePointer);
    resetButton.addEventListener('click', reset);
    runButton.addEventListener('click', run);

    const disconnectCanvas = observeCanvas(canvas, render);

    reset();

    return () => {
        runId += 1;
        disconnectCanvas();
        canvas.removeEventListener('blur', handleBlur);
        canvas.removeEventListener('focus', handleFocus);
        canvas.removeEventListener('keydown', handleKeydown);
        canvas.removeEventListener('pointerup', handlePointer);
        resetButton.removeEventListener('click', reset);
        runButton.removeEventListener('click', run);
    };
};
