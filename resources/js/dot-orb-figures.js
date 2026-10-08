// Figures the dot sphere can take, one per destination and project. Each paints a solid shape onto a square
// canvas of the given size; `cut` then removes lines from it, which read as gaps between the dots.

const cut = (context, size, path) => {
    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = size * 0.036;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    path(context, size);
    context.stroke();
    context.restore();
};

// Projects: a window with a title bar and lines of content.
const projects = (context, size) => {
    context.beginPath();
    context.roundRect(size * 0.1, size * 0.2, size * 0.8, size * 0.6, size * 0.07);
    context.fill();
    cut(context, size, (line) => {
        line.moveTo(size * 0.1, size * 0.34);
        line.lineTo(size * 0.9, size * 0.34);
        line.moveTo(size * 0.21, size * 0.47);
        line.lineTo(size * 0.6, size * 0.47);
        line.moveTo(size * 0.21, size * 0.57);
        line.lineTo(size * 0.76, size * 0.57);
        line.moveTo(size * 0.21, size * 0.67);
        line.lineTo(size * 0.48, size * 0.67);
    });
};

// About: a head and shoulders.
const about = (context, size) => {
    context.beginPath();
    context.arc(size * 0.5, size * 0.33, size * 0.17, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.ellipse(size * 0.5, size * 0.9, size * 0.34, size * 0.33, 0, Math.PI, 0);
    context.fill();
};

// Contact: an envelope with its flap.
const contact = (context, size) => {
    context.beginPath();
    context.roundRect(size * 0.1, size * 0.24, size * 0.8, size * 0.52, size * 0.06);
    context.fill();
    cut(context, size, (line) => {
        line.moveTo(size * 0.13, size * 0.29);
        line.lineTo(size * 0.5, size * 0.56);
        line.lineTo(size * 0.87, size * 0.29);
    });
};

// Quantified: the bars of a chart.
const quantified = (context, size) => {
    const bars = [[0.13, 0.3], [0.33, 0.46], [0.53, 0.38], [0.73, 0.64]];

    for (const [left, height] of bars) {
        context.beginPath();
        context.roundRect(size * left, size * (0.84 - height), size * 0.14, size * height, size * 0.035);
        context.fill();
    }
};

// Jay-Jay: the brackets and the slash of a closing tag.
const jayJay = (context, size) => {
    context.lineWidth = size * 0.1;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(size * 0.33, size * 0.28);
    context.lineTo(size * 0.11, size * 0.5);
    context.lineTo(size * 0.33, size * 0.72);
    context.moveTo(size * 0.67, size * 0.28);
    context.lineTo(size * 0.89, size * 0.5);
    context.lineTo(size * 0.67, size * 0.72);
    context.moveTo(size * 0.57, size * 0.2);
    context.lineTo(size * 0.43, size * 0.8);
    context.stroke();
};

// SessionDeck: four tiles of a launcher.
const sessionDeck = (context, size) => {
    for (const [left, top] of [[0.12, 0.12], [0.54, 0.12], [0.12, 0.54], [0.54, 0.54]]) {
        context.beginPath();
        context.roundRect(size * left, size * top, size * 0.34, size * 0.34, size * 0.06);
        context.fill();
    }
};

export const drawnFigures = { projects, about, contact, quantified, 'jay-jay': jayJay, sessiondeck: sessionDeck };
