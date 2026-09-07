export const createProjectViewer = (reel) => {
    const dialog = reel.querySelector('[data-reel-dialog]');
    const content = dialog?.querySelector('[data-reel-expanded]');
    const frame = reel.querySelector('.project-reel__frame');
    const footer = reel.querySelector('.project-reel__footer');
    const opener = reel.querySelector('[data-reel-action="expand"]');

    if (!dialog || !content || !frame || !footer || !opener) {
        return undefined;
    }

    let expanded = false;
    let previousMinHeight;

    const restore = (restoreFocus = true) => {
        if (!expanded) {
            return;
        }

        // Move the original gallery back: no cloned previews or second carousel state.
        reel.insertBefore(frame, dialog);
        reel.insertBefore(footer, dialog);
        reel.style.minHeight = previousMinHeight;
        expanded = false;

        if (restoreFocus && opener.isConnected) {
            opener.focus({ preventScroll: true });
        }
    };

    const onClose = () => restore();
    dialog.addEventListener('close', onClose);

    return {
        open: () => {
            if (expanded) {
                return;
            }

            previousMinHeight = reel.style.minHeight;
            reel.style.minHeight = `${reel.getBoundingClientRect().height}px`;
            expanded = true;
            content.append(frame, footer);
            dialog.showModal();
        },
        close: () => dialog.close(),
        destroy: () => {
            dialog.removeEventListener('close', onClose);
            if (dialog.open) {
                dialog.close();
            }
            restore(false);
        },
    };
};
