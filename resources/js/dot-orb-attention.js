// What the sphere notices of the visitor, and only a little of it: where the pointer is heading,
// how fast the page scrolls, and that somebody is back after a pause. It asks for nothing and
// keeps nothing; the sphere reads it once in every frame.
const mix = (from, to, amount) => from + (to - from) * amount;
const fade = (rate, delta) => 1 - Math.exp(-rate * delta);

// After this many seconds without a pointer, a key or a scroll the visitor counts as away.
const pause = 20;

export const createAttention = () => {
    const pointer = { x: 0, y: 0, time: 0, speedX: 0, speedY: 0 };
    let scrolled = window.scrollY;
    let scrollSpeed = 0;
    let quiet = 0;
    let back = false;

    const note = () => {
        back ||= quiet >= pause;
        quiet = 0;
    };

    // The speed of the pointer, from one event to the next; a first event after a rest has none.
    const follow = (event) => {
        const elapsed = (event.timeStamp - pointer.time) / 1000;
        const moving = elapsed > 0 && elapsed < 0.1;

        pointer.speedX = moving ? mix(pointer.speedX, (event.clientX - pointer.x) / elapsed, 0.4) : 0;
        pointer.speedY = moving ? mix(pointer.speedY, (event.clientY - pointer.y) / elapsed, 0.4) : 0;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.time = event.timeStamp;
        note();
    };

    window.addEventListener('pointermove', follow, { passive: true });
    window.addEventListener('pointerdown', note, { passive: true });
    window.addEventListener('keydown', note, { passive: true });
    window.addEventListener('scroll', note, { passive: true });

    return {
        // The state after `delta` more seconds: the pointer's speed and the page's scrolling
        // speed in pixels per second, both fading once nothing moves, and whether the visitor
        // has just come back.
        read: (delta) => {
            const returned = back;

            if (delta > 0) {
                scrollSpeed = mix(scrollSpeed, (window.scrollY - scrolled) / delta, fade(10, delta));
                pointer.speedX *= 1 - fade(6, delta);
                pointer.speedY *= 1 - fade(6, delta);
            }

            scrolled = window.scrollY;
            quiet += delta;
            back = false;

            return { headingX: pointer.speedX, headingY: pointer.speedY, scrolling: scrollSpeed, returned };
        },
    };
};
