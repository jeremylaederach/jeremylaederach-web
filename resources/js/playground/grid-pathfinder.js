const directions = Object.freeze([
    Object.freeze({ column: 1, row: 0 }),
    Object.freeze({ column: 0, row: -1 }),
    Object.freeze({ column: 0, row: 1 }),
    Object.freeze({ column: -1, row: 0 }),
]);

export const gridLayout = Object.freeze({
    columns: 10,
    rows: 6,
    start: Object.freeze({ column: 1, row: 4 }),
    goal: Object.freeze({ column: 8, row: 1 }),
});

export const cellKey = ({ column, row }) => `${column}:${row}`;

const defaultWallKeys = Object.freeze([
    '2:1',
    '2:2',
    '2:3',
    '4:3',
    '5:3',
    '6:1',
    '6:2',
    '6:3',
    '8:3',
    '8:4',
]);

export const createDefaultWalls = () => new Set(defaultWallKeys);

const isInsideGrid = (cell, columns, rows) => (
    cell.column >= 0
    && cell.column < columns
    && cell.row >= 0
    && cell.row < rows
);

const reconstructPath = (previous, goal) => {
    const path = [];
    let cursor = goal;

    while (cursor) {
        path.unshift(cursor);
        cursor = previous.get(cellKey(cursor));
    }

    return path;
};

export const findGridPath = ({
    columns = gridLayout.columns,
    rows = gridLayout.rows,
    start = gridLayout.start,
    goal = gridLayout.goal,
    walls = createDefaultWalls(),
} = {}) => {
    if (!isInsideGrid(start, columns, rows) || !isInsideGrid(goal, columns, rows)) {
        throw new RangeError('Start and goal must be inside the grid.');
    }

    const blocked = new Set(walls);
    const startKey = cellKey(start);
    const goalKey = cellKey(goal);
    const queue = [{ ...start }];
    const seen = new Set([startKey]);
    const previous = new Map();
    const visited = [];
    let queueIndex = 0;

    blocked.delete(startKey);
    blocked.delete(goalKey);

    while (queueIndex < queue.length) {
        const current = queue[queueIndex];

        queueIndex += 1;
        visited.push(current);

        if (cellKey(current) === goalKey) {
            return {
                path: reconstructPath(previous, current),
                visited,
            };
        }

        directions.forEach((direction) => {
            const neighbour = {
                column: current.column + direction.column,
                row: current.row + direction.row,
            };
            const neighbourKey = cellKey(neighbour);

            if (
                !isInsideGrid(neighbour, columns, rows)
                || blocked.has(neighbourKey)
                || seen.has(neighbourKey)
            ) {
                return;
            }

            seen.add(neighbourKey);
            previous.set(neighbourKey, current);
            queue.push(neighbour);
        });
    }

    return { path: [], visited };
};
