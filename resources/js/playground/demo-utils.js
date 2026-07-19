export const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
});

export const getPalette = () => {
    const styles = window.getComputedStyle(document.body);

    return {
        accent: styles.getPropertyValue('--route-accent').trim() || '#75c7ff',
        ink: styles.getPropertyValue('--ink').trim() || '#f4f1ea',
        muted: 'rgba(244, 241, 234, 0.32)',
        line: 'rgba(244, 241, 234, 0.09)',
    };
};

export const selectOption = (root, selector, selected) => {
    root.querySelectorAll(selector).forEach((button) => {
        button.setAttribute('aria-pressed', String(button === selected));
    });
};
