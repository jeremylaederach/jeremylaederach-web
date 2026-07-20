export const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
});

export const getPalette = () => {
    const styles = window.getComputedStyle(document.body);

    return {
        accent: styles.getPropertyValue('--route-accent').trim() || '#75c7ff',
        coral: styles.getPropertyValue('--coral').trim() || '#ff8eaa',
        ink: styles.getPropertyValue('--ink').trim() || '#f4f1ea',
    };
};

export const getCanvasViewport = (canvas) => {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const renderWidth = Math.round(width * pixelRatio);
    const renderHeight = Math.round(height * pixelRatio);

    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
    }

    const context = canvas.getContext('2d');
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    return { context, height, width };
};

export const observeCanvas = (canvas, render) => {
    const observer = new ResizeObserver(render);

    observer.observe(canvas);

    return () => observer.disconnect();
};

export const selectOption = (root, selector, selected) => {
    root.querySelectorAll(selector).forEach((button) => {
        button.setAttribute('aria-pressed', String(button === selected));
    });
};
