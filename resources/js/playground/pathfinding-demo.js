import { getPalette, selectOption, wait } from './demo-utils.js';

const explorationDelay = 42;
const routeDelay = 150;

const stations = {
    shinjuku: { label: 'Shinjuku', x: 62, y: 72, labelX: -3, labelY: -19 },
    yotsuya: { label: 'Yotsuya', x: 164, y: 112, labelX: 0, labelY: -18 },
    akasaka: { label: 'Akasaka', x: 266, y: 151, labelX: -10, labelY: -20 },
    tokyo: { label: 'Tokyo', x: 392, y: 104, labelX: 0, labelY: -20 },
    ginza: { label: 'Ginza', x: 404, y: 198, labelX: -7, labelY: 24 },
    shibuya: { label: 'Shibuya', x: 64, y: 292, labelX: 0, labelY: 24 },
    omotesando: { label: 'Omote-sando', x: 164, y: 252, labelX: 0, labelY: 24 },
    ueno: { label: 'Ueno', x: 514, y: 122, labelX: 0, labelY: -20 },
    asakusa: { label: 'Asakusa', x: 584, y: 68, labelX: -5, labelY: -18 },
    roppongi: { label: 'Roppongi', x: 268, y: 292, labelX: -2, labelY: 25 },
    akihabara: { label: 'Akihabara', x: 514, y: 244, labelX: 0, labelY: 24 },
};

const lines = {
    ginza: {
        label: 'G',
        color: '#d6a846',
        stations: ['shibuya', 'omotesando', 'akasaka', 'ginza', 'ueno', 'asakusa'],
    },
    marunouchi: {
        label: 'M',
        color: '#d86571',
        stations: ['shinjuku', 'yotsuya', 'akasaka', 'tokyo', 'ginza'],
    },
    hibiya: {
        label: 'H',
        color: '#65b4ac',
        stations: ['roppongi', 'ginza', 'akihabara', 'ueno'],
    },
    rapid: {
        label: 'JR',
        color: '#5b87bd',
        stations: ['shinjuku', 'tokyo'],
    },
};

const journeys = [
    { start: 'shinjuku', goal: 'asakusa' },
    { start: 'shibuya', goal: 'akihabara' },
    { start: 'roppongi', goal: 'shinjuku' },
];
const primaryMetricWeight = Object.keys(stations).length + 1;
const stationLineCounts = Object.fromEntries(
    Object.keys(stations).map((station) => [
        station,
        Object.values(lines).filter((line) => line.stations.includes(station)).length,
    ]),
);

const buildGraph = () => {
    const graph = new Map(Object.keys(stations).map((station) => [station, []]));

    Object.entries(lines).forEach(([line, definition]) => {
        definition.stations.slice(1).forEach((station, index) => {
            const previous = definition.stations[index];
            graph.get(previous).push({ station, line });
            graph.get(station).push({ station: previous, line });
        });
    });

    return graph;
};

const graph = buildGraph();
const stateKey = (station, line = null) => `${station}|${line ?? 'start'}`;

const routeScore = (mode, stops, changes) => (
    mode === 'changes'
        ? changes * primaryMetricWeight + stops
        : stops * primaryMetricWeight + changes
);

const findRoute = (journey, mode) => {
    const initialState = {
        station: journey.start,
        line: null,
        stops: 0,
        changes: 0,
        score: 0,
    };
    const open = [initialState];
    const distances = new Map([[stateKey(journey.start), 0]]);
    const previous = new Map();
    const explored = [];
    const exploredStations = new Set();
    let destination = null;

    while (open.length > 0) {
        open.sort((left, right) => left.score - right.score);
        const current = open.shift();
        const currentKey = stateKey(current.station, current.line);

        if (current.score !== distances.get(currentKey)) {
            continue;
        }

        if (!exploredStations.has(current.station)) {
            exploredStations.add(current.station);
            explored.push(current.station);
        }

        if (current.station === journey.goal) {
            destination = current;
            break;
        }

        graph.get(current.station).forEach((edge) => {
            const stops = current.stops + 1;
            const changes = current.changes + Number(
                current.line !== null && current.line !== edge.line,
            );
            const score = routeScore(mode, stops, changes);
            const nextKey = stateKey(edge.station, edge.line);

            if (score >= (distances.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
                return;
            }

            distances.set(nextKey, score);
            previous.set(nextKey, {
                state: currentKey,
                segment: {
                    from: current.station,
                    to: edge.station,
                    line: edge.line,
                },
            });
            open.push({
                station: edge.station,
                line: edge.line,
                stops,
                changes,
                score,
            });
        });
    }

    if (!destination) {
        return { explored, segments: [], stops: 0, changes: 0 };
    }

    const segments = [];
    let cursor = stateKey(destination.station, destination.line);

    while (previous.has(cursor)) {
        const step = previous.get(cursor);
        segments.unshift(step.segment);
        cursor = step.state;
    }

    return {
        explored,
        segments,
        stops: destination.stops,
        changes: destination.changes,
    };
};

const drawSegment = (context, from, to, color, width, opacity) => {
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

const drawNetwork = (context) => {
    Object.values(lines).forEach((line) => {
        line.stations.slice(1).forEach((station, index) => {
            drawSegment(
                context,
                stations[line.stations[index]],
                stations[station],
                line.color,
                6,
                0.36,
            );
        });
    });
};

const drawLineKey = (context, palette) => {
    let x = 24;

    Object.values(lines).forEach((line) => {
        context.globalAlpha = 0.82;
        context.fillStyle = line.color;
        context.fillRect(x, 20, 14, 3);
        context.fillStyle = palette.ink;
        context.font = '600 9px ui-monospace, SFMono-Regular, Consolas, monospace';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(line.label, x + 20, 22);
        x += line.label.length > 1 ? 66 : 48;
    });
};

const drawStations = (context, palette, journey, explored) => {
    const exploredSet = new Set(explored);

    Object.entries(stations).forEach(([id, station]) => {
        const lineCount = stationLineCounts[id];
        const isStart = id === journey.start;
        const isGoal = id === journey.goal;

        if (exploredSet.has(id) && !isStart && !isGoal) {
            context.globalAlpha = 0.2;
            context.fillStyle = palette.accent;
            context.beginPath();
            context.arc(station.x, station.y, 13, 0, Math.PI * 2);
            context.fill();
        }

        context.globalAlpha = 1;
        context.fillStyle = isStart
            ? palette.accent
            : isGoal
                ? palette.ink
                : '#111116';
        context.strokeStyle = lineCount > 1 ? palette.ink : 'rgba(244, 241, 234, 0.52)';
        context.lineWidth = lineCount > 1 ? 2.5 : 1.5;
        context.beginPath();
        context.arc(station.x, station.y, isStart || isGoal ? 9 : 6, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.globalAlpha = isStart || isGoal ? 0.94 : 0.56;
        context.fillStyle = palette.ink;
        context.font = `${isStart || isGoal ? '600' : '500'} 9px ui-monospace, SFMono-Regular, Consolas, monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            station.label,
            station.x + station.labelX,
            station.y + station.labelY,
        );
    });
};

const draw = (canvas, journey, explored = [], segments = []) => {
    const context = canvas.getContext('2d');
    const palette = getPalette();

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawNetwork(context);
    drawLineKey(context, palette);

    segments.forEach((segment) => {
        const line = lines[segment.line];
        const from = stations[segment.from];
        const to = stations[segment.to];

        drawSegment(context, from, to, line.color, 10, 0.94);
        drawSegment(context, from, to, palette.ink, 2, 0.72);
    });

    drawStations(context, palette, journey, explored);
    context.globalAlpha = 1;
    context.lineWidth = 1;
};

export const initializePathfindingDemo = (root, reducedMotion) => {
    const canvas = root.querySelector('[data-pathfinding-canvas]');
    const description = root.querySelector('[data-pathfinding-description]');
    const output = root.querySelector('[data-pathfinding-output]');
    const runButton = root.querySelector('[data-pathfinding-run]');
    let journeyIndex = 0;
    let mode = 'stops';
    let explored = [];
    let segments = [];
    let runId = 0;

    const resetJourney = ({ next = false } = {}) => {
        runId += 1;

        if (next) {
            journeyIndex = (journeyIndex + 1) % journeys.length;
        }

        explored = [];
        segments = [];
        output.textContent = '—';
        runButton.disabled = false;
        draw(canvas, journeys[journeyIndex]);
    };

    root.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const option = target?.closest('[data-pathfinding-mode]');

        if (option instanceof HTMLButtonElement) {
            mode = option.dataset.pathfindingMode;
            description.textContent = option.dataset.pathfindingDescription;
            selectOption(root, '[data-pathfinding-mode]', option);
            resetJourney();
            return;
        }

        if (target?.closest('[data-pathfinding-reset]')) {
            resetJourney({ next: true });
            return;
        }

        if (!target?.closest('[data-pathfinding-run]')) {
            return;
        }

        const currentRun = ++runId;
        const journey = journeys[journeyIndex];
        const route = findRoute(journey, mode);
        const explorationBatchSize = reducedMotion
            ? Math.max(1, route.explored.length)
            : 1;
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
            draw(canvas, journey, explored);
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
            draw(canvas, journey, explored, segments);
            await wait(reducedMotion ? 0 : routeDelay);
        }

        output.textContent = `${route.stops} · ${route.changes}`;
        runButton.disabled = false;
    });

    resetJourney();
};
