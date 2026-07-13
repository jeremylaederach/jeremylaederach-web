export const liquidScenes = new Set(['home', 'projects', 'about', 'contact']);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createLiquidStageController = ({ finePointer, reducedMotion }) => {
    const stage = document.querySelector('[data-liquid-stage]');
    const navigation = stage?.querySelector('[data-liquid-navigation]');
    const bodies = [...(stage?.querySelectorAll('[data-liquid-route]') ?? [])];

    if (!(stage instanceof HTMLElement) || !(navigation instanceof HTMLElement)) {
        return { setScene: () => {} };
    }

    const states = bodies.map((body) => ({
        body,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        currentSheenX: 50,
        currentSheenY: 42,
        targetSheenX: 50,
        targetSheenY: 42,
    }));
    let frameId;

    const render = () => {
        let unsettled = false;

        states.forEach((state) => {
            state.currentX += (state.targetX - state.currentX) * 0.085;
            state.currentY += (state.targetY - state.currentY) * 0.085;
            state.currentSheenX += (state.targetSheenX - state.currentSheenX) * 0.1;
            state.currentSheenY += (state.targetSheenY - state.currentSheenY) * 0.1;

            state.body.style.setProperty('--cursor-x', `${state.currentX.toFixed(2)}px`);
            state.body.style.setProperty('--cursor-y', `${state.currentY.toFixed(2)}px`);
            state.body.style.setProperty('--sheen-x', `${state.currentSheenX.toFixed(2)}%`);
            state.body.style.setProperty('--sheen-y', `${state.currentSheenY.toFixed(2)}%`);

            unsettled ||= Math.abs(state.targetX - state.currentX) > 0.02
                || Math.abs(state.targetY - state.currentY) > 0.02
                || Math.abs(state.targetSheenX - state.currentSheenX) > 0.05
                || Math.abs(state.targetSheenY - state.currentSheenY) > 0.05;
        });

        frameId = unsettled ? window.requestAnimationFrame(render) : undefined;
    };

    const scheduleRender = () => {
        frameId ??= window.requestAnimationFrame(render);
    };

    const setHoveredBody = (activeBody) => {
        states.forEach(({ body }) => body.classList.toggle('is-hovered', body === activeBody));
        navigation.classList.toggle('is-engaged', activeBody instanceof HTMLElement);
    };

    const resetPointer = () => {
        stage.classList.remove('has-pointer');
        setHoveredBody(null);

        states.forEach((state) => {
            state.targetX = 0;
            state.targetY = 0;
            state.targetSheenX = 50;
            state.targetSheenY = 42;
        });

        scheduleRender();
    };

    const setScene = (scene) => {
        const nextScene = liquidScenes.has(scene) ? scene : 'home';
        const isLanding = nextScene === 'home';

        resetPointer();
        stage.dataset.scene = nextScene;
        stage.setAttribute('aria-hidden', isLanding ? 'false' : 'true');
        navigation.toggleAttribute('inert', !isLanding);
    };

    if (finePointer && !reducedMotion) {
        window.addEventListener('pointermove', (event) => {
            if (stage.dataset.scene !== 'home') {
                return;
            }

            stage.classList.add('has-pointer');
            const hoveredBody = event.target instanceof Element
                ? event.target.closest('[data-liquid-route]')
                : null;

            setHoveredBody(hoveredBody);

            states.forEach((state) => {
                const rect = state.body.getBoundingClientRect();
                const deltaX = event.clientX - (rect.left + rect.width / 2);
                const deltaY = event.clientY - (rect.top + rect.height / 2);
                const distance = Math.hypot(deltaX, deltaY);
                const influence = 0.58 + 0.42 * (1 - clamp(distance / (window.innerWidth * 0.8), 0, 1));

                state.targetX = clamp(deltaX * 0.018 * influence, -10, 10);
                state.targetY = clamp(deltaY * 0.018 * influence, -10, 10);
                state.targetSheenX = clamp((event.clientX - rect.left) / rect.width * 100, 8, 92);
                state.targetSheenY = clamp((event.clientY - rect.top) / rect.height * 100, 8, 92);
            });

            scheduleRender();
        }, { passive: true });

        window.addEventListener('blur', resetPointer);
        document.addEventListener('pointerout', (event) => {
            if (event.relatedTarget === null) {
                resetPointer();
            }
        });

        states.forEach(({ body }) => {
            body.addEventListener('focusin', () => setHoveredBody(body));
            body.addEventListener('focusout', () => setHoveredBody(null));
        });
    }

    setScene(stage.dataset.scene ?? 'home');

    return { setScene };
};
