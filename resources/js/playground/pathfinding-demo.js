import { getPalette, selectOption, wait } from './demo-utils.js';

const columns = 18;
const rows = 10;
const start = { x: 1, y: 5 };
const goal = { x: 16, y: 4 };
const key = ({ x, y }) => `${x}:${y}`;

const createWalls = () => new Set([
    '6:1', '6:2', '6:3', '6:5', '6:6', '6:7', '6:8',
    '11:1', '11:2', '11:4', '11:5', '11:6', '11:7', '11:8',
]);

const getNeighbors = ({ x, y }) => [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
].filter((node) => node.x >= 0 && node.x < columns && node.y >= 0 && node.y < rows);

const search = (walls, algorithm) => {
    const open = [{ node: start, score: 0 }];
    const distances = new Map([[key(start), 0]]);
    const previous = new Map();
    const visited = [];
    const closed = new Set();

    while (open.length > 0) {
        open.sort((left, right) => left.score - right.score);
        const { node } = open.shift();
        const nodeKey = key(node);

        if (closed.has(nodeKey)) {
            continue;
        }

        closed.add(nodeKey);
        visited.push(node);

        if (nodeKey === key(goal)) {
            break;
        }

        getNeighbors(node).forEach((neighbor) => {
            const neighborKey = key(neighbor);

            if (walls.has(neighborKey) || closed.has(neighborKey)) {
                return;
            }

            const distance = distances.get(nodeKey) + 1;

            if (distance >= (distances.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
                return;
            }

            distances.set(neighborKey, distance);
            previous.set(neighborKey, node);

            const heuristic = algorithm === 'astar'
                ? Math.abs(goal.x - neighbor.x) + Math.abs(goal.y - neighbor.y)
                : 0;

            open.push({ node: neighbor, score: distance + heuristic });
        });
    }

    const path = [];
    let current = goal;

    while (key(current) !== key(start) && previous.has(key(current))) {
        path.unshift(current);
        current = previous.get(key(current));
    }

    return { path, visited };
};

const draw = (canvas, walls, visited = [], path = []) => {
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
        context.globalAlpha = 0.15;
        context.fillStyle = palette.accent;
        context.fillRect(node.x * cellWidth + 2, node.y * cellHeight + 2, cellWidth - 4, cellHeight - 4);
    });

    walls.forEach((wall) => {
        const [x, y] = wall.split(':').map(Number);
        context.globalAlpha = 0.48;
        context.fillStyle = palette.muted;
        context.fillRect(x * cellWidth + 2, y * cellHeight + 2, cellWidth - 4, cellHeight - 4);
    });

    path.forEach((node) => {
        context.globalAlpha = 0.86;
        context.fillStyle = palette.ink;
        context.fillRect(node.x * cellWidth + 4, node.y * cellHeight + 4, cellWidth - 8, cellHeight - 8);
    });

    [[start, palette.accent], [goal, palette.ink]].forEach(([node, color]) => {
        context.globalAlpha = 1;
        context.fillStyle = color;
        context.fillRect(node.x * cellWidth + 4, node.y * cellHeight + 4, cellWidth - 8, cellHeight - 8);
    });

    context.globalAlpha = 1;
};

export const initializePathfindingDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-pathfinding-canvas]');
    const output = root.querySelector('[data-pathfinding-output]');
    const runButton = root.querySelector('[data-pathfinding-run]');
    let algorithm = 'astar';
    let walls = createWalls();
    let runId = 0;

    const reset = () => {
        runId += 1;
        walls = createWalls();
        output.textContent = '0';
        runButton.disabled = false;
        draw(canvas, walls);
    };

    canvas.addEventListener('click', (event) => {
        runId += 1;
        runButton.disabled = false;

        const bounds = canvas.getBoundingClientRect();
        const node = {
            x: Math.floor(((event.clientX - bounds.left) / bounds.width) * columns),
            y: Math.floor(((event.clientY - bounds.top) / bounds.height) * rows),
        };
        const nodeKey = key(node);

        if ([key(start), key(goal)].includes(nodeKey)) {
            return;
        }

        walls.has(nodeKey) ? walls.delete(nodeKey) : walls.add(nodeKey);
        output.textContent = '0';
        draw(canvas, walls);
    });

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-pathfinding-algorithm]');

        if (option instanceof HTMLButtonElement) {
            runId += 1;
            algorithm = option.dataset.pathfindingAlgorithm;
            selectOption(root, '[data-pathfinding-algorithm]', option);
            output.textContent = '0';
            runButton.disabled = false;
            draw(canvas, walls);
            return;
        }

        if (target?.closest('[data-pathfinding-reset]')) {
            reset();
            return;
        }

        if (!target?.closest('[data-pathfinding-run]')) {
            return;
        }

        const currentRun = ++runId;
        const result = search(walls, algorithm);
        const visited = [];
        runButton.disabled = true;

        for (let index = 0; index < result.visited.length; index += reducedMotion ? result.visited.length : 3) {
            if (currentRun !== runId || !canvas.isConnected) {
                return;
            }

            visited.push(...result.visited.slice(index, index + (reducedMotion ? result.visited.length : 3)));
            output.textContent = String(visited.length);
            draw(canvas, walls, visited);
            await wait(reducedMotion ? 0 : 22);
        }

        draw(canvas, walls, visited, result.path);
        runButton.disabled = false;
    });

    draw(canvas, walls);
};
