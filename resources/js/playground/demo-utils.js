export const delay = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
});

export const setPressed = (buttons, activeButton = null) => {
    buttons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button === activeButton));
    });
};

export const setRovingTabStop = (elements, activeElement) => {
    for (const element of elements) {
        element.tabIndex = element === activeElement ? 0 : -1;
    }
};

const gridMovements = Object.freeze({
    ArrowDown: Object.freeze({ column: 0, row: 1 }),
    ArrowLeft: Object.freeze({ column: -1, row: 0 }),
    ArrowRight: Object.freeze({ column: 1, row: 0 }),
    ArrowUp: Object.freeze({ column: 0, row: -1 }),
});

export const gridIndexAfterKey = (index, columns, rows, key) => {
    const movement = gridMovements[key];

    if (!movement) {
        return null;
    }

    const row = Math.floor(index / columns);
    const column = index % columns;
    const nextRow = Math.min(rows - 1, Math.max(0, row + movement.row));
    const nextColumn = Math.min(columns - 1, Math.max(0, column + movement.column));

    return nextRow * columns + nextColumn;
};
