import {
    siAngular,
    siDotnet,
    siGithub,
    siGithubactions,
    siGoogle,
    siLaravel,
    siPostgresql,
    siTailwindcss,
    siTypescript,
    siVite,
} from 'simple-icons';

// Figures the dot sphere can take: one per destination, several per featured project, some for
// the words and chapters that name them, and the marks of GitHub and of the tools on the about
// page.
// Each paints a solid shape onto a square canvas of the given size; `cut` then removes lines from
// it, which read as gaps between the dots.

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
    const bars = [[0.1, 0.34], [0.32, 0.52], [0.54, 0.42], [0.76, 0.8]];

    for (const [left, height] of bars) {
        context.beginPath();
        context.roundRect(size * left, size * (0.9 - height), size * 0.14, size * height, size * 0.035);
        context.fill();
    }
};

// Quantified: a trend, the line of a chart above the area it encloses.
const trend = (context, size) => {
    const line = (path, drop) => {
        path.moveTo(size * 0.1, size * (0.62 + drop));
        path.bezierCurveTo(size * 0.3, size * (0.58 + drop), size * 0.3, size * (0.36 + drop), size * 0.48, size * (0.44 + drop));
        path.bezierCurveTo(size * 0.64, size * (0.52 + drop), size * 0.66, size * (0.2 + drop), size * 0.9, size * (0.18 + drop));
    };

    context.beginPath();
    line(context, 0);
    context.lineTo(size * 0.9, size * 0.84);
    context.lineTo(size * 0.1, size * 0.84);
    context.closePath();
    context.fill();
    cut(context, size, (path) => line(path, 0.09));
};

// Quantified: the ring of a chart in three shares.
const ring = (context, size) => {
    context.lineWidth = size * 0.17;
    context.beginPath();
    context.arc(size * 0.5, size * 0.5, size * 0.29, 0, Math.PI * 2);
    context.stroke();
    cut(context, size, (path) => {
        for (const turn of [-0.25, 0.2, 0.52]) {
            const angle = turn * Math.PI * 2;

            path.moveTo(size * (0.5 + Math.cos(angle) * 0.17), size * (0.5 + Math.sin(angle) * 0.17));
            path.lineTo(size * (0.5 + Math.cos(angle) * 0.41), size * (0.5 + Math.sin(angle) * 0.41));
        }
    });
};

// Quantified: a timeline, the entries of a day in rows.
const timeline = (context, size) => {
    const entries = [[0.1, 0.17, 0.44], [0.32, 0.345, 0.58], [0.1, 0.52, 0.26], [0.42, 0.52, 0.34], [0.24, 0.695, 0.66]];

    for (const [left, top, width] of entries) {
        context.beginPath();
        context.roundRect(size * left, size * top, size * width, size * 0.125, size * 0.04);
        context.fill();
    }
};

// Jay-Jay: the brackets and the slash of a closing tag.
const jayJay = (context, size) => {
    context.lineWidth = size * 0.08;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(size * 0.36, size * 0.28);
    context.lineTo(size * 0.15, size * 0.5);
    context.lineTo(size * 0.36, size * 0.72);
    context.moveTo(size * 0.64, size * 0.28);
    context.lineTo(size * 0.85, size * 0.5);
    context.lineTo(size * 0.64, size * 0.72);
    context.moveTo(size * 0.56, size * 0.2);
    context.lineTo(size * 0.44, size * 0.8);
    context.stroke();
};

// Jay-Jay: a website, a browser window with the blocks of a page.
const website = (context, size) => {
    context.beginPath();
    context.roundRect(size * 0.1, size * 0.18, size * 0.8, size * 0.64, size * 0.07);
    context.fill();
    cut(context, size, (line) => {
        line.moveTo(size * 0.1, size * 0.32);
        line.lineTo(size * 0.9, size * 0.32);
        line.moveTo(size * 0.1, size * 0.6);
        line.lineTo(size * 0.9, size * 0.6);
        line.moveTo(size * 0.5, size * 0.6);
        line.lineTo(size * 0.5, size * 0.82);
    });
};

// Jay-Jay: hosting, a cloud.
const cloud = (context, size) => {
    context.beginPath();
    context.arc(size * 0.3, size * 0.58, size * 0.17, 0, Math.PI * 2);
    context.arc(size * 0.47, size * 0.44, size * 0.21, 0, Math.PI * 2);
    context.arc(size * 0.69, size * 0.56, size * 0.19, 0, Math.PI * 2);
    context.roundRect(size * 0.3, size * 0.55, size * 0.39, size * 0.2, size * 0.02);
    context.fill();
};

// Jay-Jay: the Client Hub, a board with tickets in three columns.
const board = (context, size) => {
    for (const [column, tickets] of [3, 2, 1].entries()) {
        for (let ticket = 0; ticket < tickets; ticket += 1) {
            context.beginPath();
            context.roundRect(size * (0.1 + column * 0.29), size * (0.2 + ticket * 0.21), size * 0.22, size * 0.17, size * 0.035);
            context.fill();
        }
    }
};

// Backend: a database, three discs on top of each other.
const backend = (context, size) => {
    context.beginPath();
    context.ellipse(size * 0.5, size * 0.26, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
    context.rect(size * 0.2, size * 0.26, size * 0.6, size * 0.48);
    context.ellipse(size * 0.5, size * 0.74, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
    context.fill();
    cut(context, size, (line) => {
        for (const y of [0.26, 0.42, 0.58]) {
            line.moveTo(size * 0.8, size * y);
            line.ellipse(size * 0.5, size * y, size * 0.3, size * 0.1, 0, 0, Math.PI);
        }
    });
};

// Interface: the arrow of a pointer.
const pointerArrow = (context, size) => {
    context.beginPath();
    context.moveTo(size * 0.27, size * 0.13);
    context.lineTo(size * 0.27, size * 0.77);
    context.lineTo(size * 0.43, size * 0.62);
    context.lineTo(size * 0.55, size * 0.88);
    context.lineTo(size * 0.67, size * 0.83);
    context.lineTo(size * 0.55, size * 0.58);
    context.lineTo(size * 0.77, size * 0.58);
    context.closePath();
    context.fill();
};

// Windows: four panes.
const windows = (context, size) => {
    for (const [left, top] of [[0.11, 0.11], [0.54, 0.11], [0.11, 0.54], [0.54, 0.54]]) {
        context.beginPath();
        context.roundRect(size * left, size * top, size * 0.35, size * 0.35, size * 0.03);
        context.fill();
    }
};

// Stack: three layers on top of each other.
const stack = (context, size) => {
    for (const middle of [0.34, 0.5, 0.66]) {
        context.beginPath();
        context.moveTo(size * 0.5, size * (middle - 0.17));
        context.lineTo(size * 0.88, size * middle);
        context.lineTo(size * 0.5, size * (middle + 0.17));
        context.lineTo(size * 0.12, size * middle);
        context.closePath();
        context.fill();
    }

    cut(context, size, (line) => {
        for (const middle of [0.34, 0.5]) {
            line.moveTo(size * 0.12, size * middle);
            line.lineTo(size * 0.5, size * (middle + 0.17));
            line.lineTo(size * 0.88, size * middle);
        }
    });
};

// Not found: the number 404 in tall, narrow numerals.
const notFound = (context, size) => {
    const top = 0.24;
    const bottom = 0.76;
    const width = 0.17;
    const four = (left) => {
        context.moveTo(size * (left + 0.125), size * bottom);
        context.lineTo(size * (left + 0.125), size * top);
        context.lineTo(size * left, size * (top + 0.34));
        context.lineTo(size * (left + width), size * (top + 0.34));
    };

    context.lineWidth = size * 0.066;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    four(0.135);
    context.roundRect(size * 0.415, size * top, size * width, size * (bottom - top), size * width / 2);
    four(0.695);
    context.stroke();
};

// A brand's mark, whose path is drawn on a square of 24 units.
const mark = (icon) => (context, size) => {
    context.save();
    context.translate(size * 0.1, size * 0.1);
    context.scale((size * 0.8) / 24, (size * 0.8) / 24);
    context.fill(new Path2D(icon.path));
    context.restore();
};

export const drawnFigures = {
    projects,
    about,
    contact,
    quantified,
    trend,
    ring,
    timeline,
    'jay-jay': jayJay,
    website,
    cloud,
    board,
    backend,
    interface: pointerArrow,
    windows,
    stack,
    'not-found': notFound,
    github: mark(siGithub),
    dotnet: mark(siDotnet),
    laravel: mark(siLaravel),
    angular: mark(siAngular),
    postgresql: mark(siPostgresql),
    typescript: mark(siTypescript),
    tailwindcss: mark(siTailwindcss),
    vite: mark(siVite),
    githubactions: mark(siGithubactions),
    google: mark(siGoogle),
};
