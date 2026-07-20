import { getPalette, selectOption, wait } from './demo-utils.js';

const explorationDelay = 30;
const routeDelay = 130;
const xCoordinates = [52, 136, 222, 314, 410, 504, 588];
const yCoordinates = [54, 118, 181, 246, 309];
const avenueLabels = ['10 AV', '9 AV', '8 AV', '7 AV', '6 AV', '5 AV', '3 AV'];
const streetLabels = ['W 52', 'W 42', 'W 34', 'W 23', 'W 14'];
const broadwayNodes = ['1:4', '2:3', '3:2', '4:1', '5:0'];
const trips = [
    { start: '0:4', goal: '6:0' },
    { start: '0:4', goal: '5:0' },
    { start: '1:4', goal: '6:1' },
];

const nodeId = (column, row) => `${column}:${row}`;
const nodes = new Map(
    xCoordinates.flatMap((x, column) => (
        yCoordinates.map((y, row) => [
            nodeId(column, row),
            { id: nodeId(column, row), x, y },
        ])
    )),
);

const connect = (graph, from, to, road) => {
    graph.get(from).push({ node: to, road });
    graph.get(to).push({ node: from, road });
};

const buildGraph = () => {
    const graph = new Map([...nodes.keys()].map((id) => [id, []]));

    yCoordinates.forEach((_, row) => {
        xCoordinates.slice(1).forEach((__, column) => {
            connect(
                graph,
                nodeId(column, row),
                nodeId(column + 1, row),
                `street-${row}`,
            );
        });
    });

    xCoordinates.forEach((_, column) => {
        yCoordinates.slice(1).forEach((__, row) => {
            connect(
                graph,
                nodeId(column, row),
                nodeId(column, row + 1),
                `avenue-${column}`,
            );
        });
    });

    broadwayNodes.slice(1).forEach((to, index) => {
        connect(graph, broadwayNodes[index], to, 'broadway');
    });

    return graph;
};

const graph = buildGraph();
const primaryMetricWeight = nodes.size + 1;
const stateKey = (node, road = null) => `${node}|${road ?? 'start'}`;

const routeScore = (mode, blocks, turns) => (
    mode === 'turns'
        ? turns * primaryMetricWeight + blocks
        : blocks * primaryMetricWeight + turns
);

const findRoute = (trip, mode) => {
    const initialState = {
        node: trip.start,
        road: null,
        blocks: 0,
        turns: 0,
        score: 0,
    };
    const open = [initialState];
    const distances = new Map([[stateKey(trip.start), 0]]);
    const previous = new Map();
    const explored = [];
    const exploredNodes = new Set();
    let destination = null;

    while (open.length > 0) {
        open.sort((left, right) => left.score - right.score);
        const current = open.shift();
        const currentKey = stateKey(current.node, current.road);

        if (current.score !== distances.get(currentKey)) {
            continue;
        }

        if (!exploredNodes.has(current.node)) {
            exploredNodes.add(current.node);
            explored.push(current.node);
        }

        if (current.node === trip.goal) {
            destination = current;
            break;
        }

        graph.get(current.node).forEach((edge) => {
            const blocks = current.blocks + 1;
            const turns = current.turns + Number(
                current.road !== null && current.road !== edge.road,
            );
            const score = routeScore(mode, blocks, turns);
            const nextKey = stateKey(edge.node, edge.road);

            if (score >= (distances.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
                return;
            }

            distances.set(nextKey, score);
            previous.set(nextKey, {
                state: currentKey,
                segment: {
                    from: current.node,
                    to: edge.node,
                    road: edge.road,
                },
            });
            open.push({
                node: edge.node,
                road: edge.road,
                blocks,
                turns,
                score,
            });
        });
    }

    if (!destination) {
        return { explored, segments: [], blocks: 0, turns: 0 };
    }

    const segments = [];
    let cursor = stateKey(destination.node, destination.road);

    while (previous.has(cursor)) {
        const step = previous.get(cursor);
        segments.unshift(step.segment);
        cursor = step.state;
    }

    return {
        explored,
        segments,
        blocks: destination.blocks,
        turns: destination.turns,
    };
};

const drawLine = (context, from, to, color, width, opacity) => {
    context.globalAlpha = opacity;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
};

const drawCityBlocks = (context) => {
    for (let column = 0; column < xCoordinates.length - 1; column += 1) {
        for (let row = 0; row < yCoordinates.length - 1; row += 1) {
            const left = xCoordinates[column] + 9;
            const top = yCoordinates[row] + 9;
            const width = xCoordinates[column + 1] - xCoordinates[column] - 18;
            const height = yCoordinates[row + 1] - yCoordinates[row] - 18;

            context.globalAlpha = 1;
            context.fillStyle = (column + row) % 2 === 0
                ? 'rgba(244, 241, 234, 0.035)'
                : 'rgba(244, 241, 234, 0.022)';
            context.strokeStyle = 'rgba(244, 241, 234, 0.055)';
            context.lineWidth = 1;
            context.fillRect(left, top, width, height);
            context.strokeRect(left, top, width, height);

            if (width > 52 && height > 32) {
                context.fillStyle = 'rgba(244, 241, 234, 0.025)';
                context.fillRect(
                    left + width * 0.31,
                    top + height * 0.3,
                    width * 0.38,
                    height * 0.4,
                );
            }
        }
    }
};

const drawStreetGrid = (context, palette) => {
    yCoordinates.forEach((y) => {
        drawLine(
            context,
            { x: xCoordinates[0], y },
            { x: xCoordinates.at(-1), y },
            palette.ink,
            1,
            0.15,
        );
    });

    xCoordinates.forEach((x) => {
        drawLine(
            context,
            { x, y: yCoordinates[0] },
            { x, y: yCoordinates.at(-1) },
            palette.ink,
            1,
            0.15,
        );
    });

    broadwayNodes.slice(1).forEach((id, index) => {
        const from = nodes.get(broadwayNodes[index]);
        const to = nodes.get(id);

        drawLine(context, from, to, '#07070a', 16, 0.96);
        drawLine(context, from, to, palette.accent, 1.4, 0.32);
    });
};

const drawMapLabels = (context, palette) => {
    context.fillStyle = palette.ink;
    context.font = '600 7px ui-monospace, SFMono-Regular, Consolas, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    avenueLabels.forEach((label, index) => {
        context.globalAlpha = 0.34;
        context.fillText(label, xCoordinates[index], 25);
    });

    streetLabels.forEach((label, index) => {
        context.globalAlpha = 0.34;
        context.textAlign = 'left';
        context.fillText(label, 12, yCoordinates[index]);
    });

    context.globalAlpha = 0.5;
    context.textAlign = 'center';
    context.fillText('N', 617, 25);
    drawLine(context, { x: 617, y: 34 }, { x: 617, y: 47 }, palette.ink, 1, 0.38);
};

const drawIntersections = (context, palette, explored) => {
    const exploredSet = new Set(explored);

    nodes.forEach((node, id) => {
        context.globalAlpha = exploredSet.has(id) ? 0.42 : 0.12;
        context.fillStyle = exploredSet.has(id) ? palette.accent : palette.ink;
        context.beginPath();
        context.arc(node.x, node.y, exploredSet.has(id) ? 3.2 : 1.7, 0, Math.PI * 2);
        context.fill();
    });
};

const drawEndpoints = (context, palette, trip) => {
    [
        { id: trip.start, label: 'A', color: palette.accent },
        { id: trip.goal, label: 'B', color: palette.ink },
    ].forEach((endpoint) => {
        const node = nodes.get(endpoint.id);

        context.globalAlpha = 0.2;
        context.fillStyle = endpoint.color;
        context.beginPath();
        context.arc(node.x, node.y, 17, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = 1;
        context.fillStyle = endpoint.color;
        context.beginPath();
        context.arc(node.x, node.y, 9, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = '#07070a';
        context.font = '700 9px ui-monospace, SFMono-Regular, Consolas, monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(endpoint.label, node.x, node.y + 0.5);
    });
};

const draw = (canvas, trip, explored = [], segments = []) => {
    const context = canvas.getContext('2d');
    const palette = getPalette();

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCityBlocks(context);
    drawStreetGrid(context, palette);
    drawMapLabels(context, palette);
    drawIntersections(context, palette, explored);

    segments.forEach((segment) => {
        const from = nodes.get(segment.from);
        const to = nodes.get(segment.to);

        drawLine(context, from, to, palette.accent, 12, 0.16);
        drawLine(context, from, to, palette.ink, 4, 0.94);
    });

    drawEndpoints(context, palette, trip);
    context.globalAlpha = 1;
    context.lineWidth = 1;
};

export const initializePathfindingDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-pathfinding-canvas]');
    const description = root.querySelector('[data-pathfinding-description]');
    const output = root.querySelector('[data-pathfinding-output]');
    const runButton = root.querySelector('[data-pathfinding-run]');
    let tripIndex = 0;
    let mode = 'shortest';
    let explored = [];
    let segments = [];
    let runId = 0;

    const resetTrip = ({ next = false } = {}) => {
        runId += 1;

        if (next) {
            tripIndex = (tripIndex + 1) % trips.length;
        }

        explored = [];
        segments = [];
        output.textContent = '—';
        runButton.disabled = false;
        draw(canvas, trips[tripIndex]);
    };

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-pathfinding-mode]');

        if (option instanceof HTMLButtonElement) {
            mode = option.dataset.pathfindingMode;
            description.textContent = option.dataset.pathfindingDescription;
            selectOption(root, '[data-pathfinding-mode]', option);
            resetTrip();
            return;
        }

        if (target?.closest('[data-pathfinding-reset]')) {
            resetTrip({ next: true });
            return;
        }

        if (!target?.closest('[data-pathfinding-run]')) {
            return;
        }

        const currentRun = ++runId;
        const trip = trips[tripIndex];
        const route = findRoute(trip, mode);
        const explorationBatchSize = reducedMotion
            ? Math.max(1, route.explored.length)
            : 2;
        runButton.disabled = true;
        explored = [];
        segments = [];
        output.textContent = '—';

        for (
            let index = 0;
            index < route.explored.length;
            index += explorationBatchSize
        ) {
            if (currentRun !== runId || !canvas.isConnected) {
                return;
            }

            explored.push(...route.explored.slice(index, index + explorationBatchSize));
            draw(canvas, trip, explored);
            await wait(reducedMotion ? 0 : explorationDelay);
        }

        const routeBatchSize = reducedMotion
            ? Math.max(1, route.segments.length)
            : 1;

        for (let index = 0; index < route.segments.length; index += routeBatchSize) {
            if (currentRun !== runId || !canvas.isConnected) {
                return;
            }

            segments.push(...route.segments.slice(index, index + routeBatchSize));
            draw(canvas, trip, explored, segments);
            await wait(reducedMotion ? 0 : routeDelay);
        }

        output.textContent = `${route.blocks} · ${route.turns}`;
        runButton.disabled = false;
    });

    resetTrip();
};
