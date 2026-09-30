// The decorative trail animates independently of the directly positioned cursor.
export const createPointerTrail = () => {
    const layers = ['outer', 'core', 'highlight'].map(name => ({
        name,
        path: document.querySelector('[data-pointer-path="' + name + '"]'),
        gradient: document.querySelector('[data-pointer-gradient="' + name + '"]'),
    })).filter(layer => layer.path && layer.gradient);
    const points = Array.from({ length: 18 }, () => ({ x: 0, y: 0 }));
    let frame;
    let position;

    const buildTrailPath = (points) => {
        if (points.length < 2) {
            return '';
        }

        const format = (value) => value.toFixed(2);
        let path = `M ${format(points[0].x)} ${format(points[0].y)}`;

        for (let index = 0; index < points.length - 1; index += 1) {
            const previous = points[index - 1] ?? points[index];
            const current = points[index];
            const next = points[index + 1];
            const after = points[index + 2] ?? next;
            const controlOne = {
                x: current.x + ((next.x - previous.x) / 6),
                y: current.y + ((next.y - previous.y) / 6),
            };
            const controlTwo = {
                x: next.x - ((after.x - current.x) / 6),
                y: next.y - ((after.y - current.y) / 6),
            };

            path += ` C ${format(controlOne.x)} ${format(controlOne.y)} ${format(controlTwo.x)} ${format(controlTwo.y)} ${format(next.x)} ${format(next.y)}`;
        }

        return path;
    };

    const draw = () => {
        const ordered = [...points].reverse();
        const segments = { outer: ordered, core: ordered.slice(5), highlight: ordered.slice(12) };
        layers.forEach(({ name, path, gradient }) => {
            const segment = segments[name];
            path.setAttribute('d', buildTrailPath(segment));
            gradient.setAttribute('x1', segment[0].x);
            gradient.setAttribute('y1', segment[0].y);
            gradient.setAttribute('x2', segment[segment.length - 1].x);
            gradient.setAttribute('y2', segment[segment.length - 1].y);
        });
    };

    const animate = () => {
        frame = undefined;
        points[0].x = position.x;
        points[0].y = position.y;
        let remainingDistance = 0;

        points.slice(1).forEach((point, index) => {
            const leader = points[index];
            const follow = 0.5 - Math.min(index, 12) * 0.006;
            point.x += (leader.x - point.x) * follow;
            point.y += (leader.y - point.y) * follow;
            remainingDistance = Math.max(remainingDistance, Math.abs(leader.x - point.x), Math.abs(leader.y - point.y));
        });
        draw();

        if (remainingDistance > 0.08) {
            frame = window.requestAnimationFrame(animate);
        }
    };

    const move = (x, y) => {
        if (!layers.length) {
            return;
        }

        if (!position) {
            points.forEach(point => {
                point.x = x;
                point.y = y;
            });
        }

        position = { x, y };
        if (frame === undefined) {
            frame = window.requestAnimationFrame(animate);
        }
    };

    const reset = () => {
        window.cancelAnimationFrame(frame);
        frame = undefined;
        position = undefined;
        layers.forEach(({ path }) => path.removeAttribute('d'));
    };

    return { move, reset };
};
