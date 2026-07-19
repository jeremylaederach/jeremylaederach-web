import { getPalette, wait } from './demo-utils.js';

const columns = 18;
const rows = 10;
const visitedNodesPerFrame = 2;
const visitedFrameDelay = 30;
const pathNodesPerFrame = 2;
const pathFrameDelay = 72;

const key = ({ x, y }) => `${x}:${y}`;

const start = { x: 1, y: 5 };
const goal = { x: 16, y: 4 };
const startKey = key(start);
const goalKey = key(goal);
const endpoints = new Set([startKey, goalKey]);
const mapPresets = [
    [
        '6:1', '6:2', '6:3', '6:5', '6:6', '6:7', '6:8',
        '11:1', '11:2', '11:4', '11:5', '11:6', '11:7', '11:8',
    ],
    [
        '4:1', '4:2', '4:3', '4:4', '4:6', '4:7', '4:8',
        '9:1', '9:2', '9:4', '9:5', '9:6', '9:7', '9:8',
        '13:2', '13:3', '13:4', '13:5', '13:7', '13:8',
    ],
];

const getNeighbors = ({ x, y }) => [
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
    { x: x - 1, y },
].filter((node) => (
    node.x >= 0
    && node.x < columns
    && node.y >= 0
    && node.y < rows
));

const findRoute = (walls) => {
    const queue = [start];
    const discovered = new Set([startKey]);
    const previous = new Map();
    const visited = [];
    let queueIndex = 0;

    while (queueIndex < queue.length) {
        const node = queue[queueIndex];
        queueIndex += 1;
        visited.push(node);

        if (key(node) === goalKey) {
            break;
        }

        getNeighbors(node).forEach((neighbor) => {
            const neighborKey = key(neighbor);

            if (walls.has(neighborKey) || discovered.has(neighborKey)) {
                return;
            }

            discovered.add(neighborKey);
            previous.set(neighborKey, node);
            queue.push(neighbor);
        });
    }

    const path = [];
    let current = goal;

    while (key(current) !== startKey && previous.has(key(current))) {
        path.unshift(current);
        current = previous.get(key(current));
    }

    if (key(current) === startKey) {
        path.unshift(start);
    }

    return { path, visited };
};

const cellCenter = (canvas, node) => ({
    x: (node.x + 0.5) * (canvas.width / columns),
    y: (node.y + 0.5) * (canvas.height / rows),
});

const draw = (canvas, walls, visited = [], path = [], cursor = null) => {
    const context = canvas.getContext('2d');
    const palette = getPalette();
    const cellWidth = canvas.width / columns;
    const cellHeight = canvas.height / rows;

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < columns; x += 1) {
        for (let y = 0; y < rows; y += 1) {
            context.strokeStyle = palette.line;
            context.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
    }

    visited.forEach((node) => {
        if (endpoints.has(key(node))) {
            return;
        }

        const center = cellCenter(canvas, node);
        context.globalAlpha = 0.22;
        context.fillStyle = palette.accent;
        context.beginPath();
        context.arc(center.x, center.y, 4, 0, Math.PI * 2);
        context.fill();
    });

    walls.forEach((wall) => {
        const [x, y] = wall.split(':').map(Number);
        context.globalAlpha = 0.42;
        context.fillStyle = palette.muted;
        context.fillRect(
            x * cellWidth + 3,
            y * cellHeight + 3,
            cellWidth - 6,
            cellHeight - 6,
        );
    });

    if (path.length > 1) {
        context.globalAlpha = 0.9;
        context.strokeStyle = palette.ink;
        context.lineWidth = 5;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        path.forEach((node, index) => {
            const center = cellCenter(canvas, node);

            if (index === 0) {
                context.moveTo(center.x, center.y);
            } else {
                context.lineTo(center.x, center.y);
            }
        });
        context.stroke();
    }

    [[start, 'S', palette.accent], [goal, 'G', palette.ink]].forEach(([node, label, color]) => {
        const center = cellCenter(canvas, node);
        context.globalAlpha = 1;
        context.fillStyle = color;
        context.beginPath();
        context.arc(center.x, center.y, 11, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#07070a';
        context.font = '600 10px ui-monospace, SFMono-Regular, Consolas, monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, center.x, center.y + 0.5);
    });

    if (cursor) {
        context.globalAlpha = 0.72;
        context.strokeStyle = palette.ink;
        context.lineWidth = 2;
        context.strokeRect(
            cursor.x * cellWidth + 2,
            cursor.y * cellHeight + 2,
            cellWidth - 4,
            cellHeight - 4,
        );
    }

    context.globalAlpha = 1;
    context.lineWidth = 1;
};

export const initializePathfindingDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-pathfinding-canvas]');
    const output = root.querySelector('[data-pathfinding-output]');
    const runButton = root.querySelector('[data-pathfinding-run]');
    let mapIndex = 0;
    let walls = new Set(mapPresets[mapIndex]);
    let visited = [];
    let path = [];
    let cursor = { ...start };
    let runId = 0;

    const render = () => {
        const activeCursor = document.activeElement === canvas ? cursor : null;
        draw(canvas, walls, visited, path, activeCursor);
    };

    const clearSearch = () => {
        runId += 1;
        visited = [];
        path = [];
        output.textContent = '0';
        runButton.disabled = false;
    };

    const toggleWall = (node) => {
        const nodeKey = key(node);

        if (endpoints.has(nodeKey)) {
            render();
            return;
        }

        clearSearch();

        if (walls.has(nodeKey)) {
            walls.delete(nodeKey);
        } else {
            walls.add(nodeKey);
        }

        render();
    };

    canvas.addEventListener('click', (event) => {
        const bounds = canvas.getBoundingClientRect();
        cursor = {
            x: Math.min(
                columns - 1,
                Math.floor(((event.clientX - bounds.left) / bounds.width) * columns),
            ),
            y: Math.min(
                rows - 1,
                Math.floor(((event.clientY - bounds.top) / bounds.height) * rows),
            ),
        };
        toggleWall(cursor);
    });

    canvas.addEventListener('keydown', (event) => {
        const movement = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
        }[event.key];

        if (movement) {
            event.preventDefault();
            cursor = {
                x: Math.max(0, Math.min(columns - 1, cursor.x + movement[0])),
                y: Math.max(0, Math.min(rows - 1, cursor.y + movement[1])),
            };
            render();
            return;
        }

        if ([' ', 'Enter'].includes(event.key)) {
            event.preventDefault();
            toggleWall(cursor);
        }
    });

    canvas.addEventListener('focus', render);
    canvas.addEventListener('blur', render);

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;

        if (target?.closest('[data-pathfinding-reset]')) {
            clearSearch();
            mapIndex = (mapIndex + 1) % mapPresets.length;
            walls = new Set(mapPresets[mapIndex]);
            render();
            return;
        }

        if (!target?.closest('[data-pathfinding-run]')) {
            return;
        }

        const currentRun = ++runId;
        const result = findRoute(walls);
        const visitBatchSize = reducedMotion
            ? Math.max(1, result.visited.length)
            : visitedNodesPerFrame;
        runButton.disabled = true;
        visited = [];
        path = [];

        for (let index = 0; index < result.visited.length; index += visitBatchSize) {
            if (currentRun !== runId || !canvas.isConnected) {
                return;
            }

            visited.push(...result.visited.slice(index, index + visitBatchSize));
            output.textContent = String(visited.length);
            render();
            await wait(reducedMotion ? 0 : visitedFrameDelay);
        }

        const pathBatchSize = reducedMotion
            ? Math.max(1, result.path.length)
            : pathNodesPerFrame;

        for (let index = 0; index < result.path.length; index += pathBatchSize) {
            if (currentRun !== runId || !canvas.isConnected) {
                return;
            }

            path.push(...result.path.slice(index, index + pathBatchSize));
            render();
            await wait(reducedMotion ? 0 : pathFrameDelay);
        }

        runButton.disabled = false;
    });

    render();
};
