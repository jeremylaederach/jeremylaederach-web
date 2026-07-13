import { createLiquidRenderer } from './liquid-renderer.js';

export const liquidScenes = new Set(['home', 'projects', 'about', 'contact']);

const routes = ['projects', 'about', 'contact'];
const desktopScenes = {
    home: [
        [0.62, 0.37, 0.35, 0.24],
        [0.31, 0.68, 0.24, 0.21],
        [0.75, 0.69, 0.25, 0.22],
    ],
    projects: [
        [0.60, -0.07, 0.76, 0.22],
        [-0.24, 0.86, 0.01, 0.01],
        [1.24, 0.84, 0.01, 0.01],
    ],
    about: [
        [-0.22, 0.86, 0.01, 0.01],
        [1.13, 0.51, 0.44, 0.78],
        [1.23, 0.84, 0.01, 0.01],
    ],
    contact: [
        [-0.22, 0.18, 0.01, 0.01],
        [1.22, 0.82, 0.01, 0.01],
        [0.55, 0.53, 0.13, 0.78],
    ],
};
const mobileScenes = {
    home: [
        [0.52, 0.40, 0.54, 0.21],
        [0.27, 0.64, 0.32, 0.18],
        [0.75, 0.67, 0.33, 0.19],
    ],
    projects: [
        [0.50, -0.04, 0.78, 0.22],
        [-0.55, 0.84, 0.01, 0.01],
        [1.55, 0.82, 0.01, 0.01],
    ],
    about: [
        [-0.52, 0.82, 0.01, 0.01],
        [1.08, 0.48, 0.46, 0.70],
        [1.52, 0.84, 0.01, 0.01],
    ],
    contact: [
        [-0.52, 0.18, 0.01, 0.01],
        [1.52, 0.80, 0.01, 0.01],
        [0.50, -0.02, 0.76, 0.22],
    ],
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const copyScene = (scene) => scene.map((body) => [...body]);
const sceneConfig = (scene, mobile) => copyScene((mobile ? mobileScenes : desktopScenes)[scene] ?? (mobile ? mobileScenes : desktopScenes).home);

export const createLiquidStageController = ({ finePointer, reducedMotion }) => {
    const stage = document.querySelector('[data-liquid-stage]');
    const canvas = stage?.querySelector('[data-liquid-canvas]');
    const navigation = stage?.querySelector('[data-liquid-navigation]');
    const links = [...(stage?.querySelectorAll('[data-liquid-route]') ?? [])];

    if (!(stage instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement) || !(navigation instanceof HTMLElement)) {
        return {
            beginTransition: () => ({ completeDelay: 0, swapDelay: 0 }),
            commitScene: () => {},
            completeTransition: () => {},
            getScene: () => 'home',
        };
    }

    let renderer;
    let frameId;
    let lastFrame = performance.now();
    let currentScene = liquidScenes.has(stage.dataset.scene) ? stage.dataset.scene : 'home';
    let targetScene = currentScene;
    let phase = 'idle';
    let mobile = window.matchMedia('(max-width: 900px)').matches;
    let bodyState = sceneConfig(currentScene, mobile);
    let hoveredIndex = -1;
    let hoverState = [0, 0, 0];
    let pointer = [0.5, 0.5, 0];
    let pointerTarget = [0.5, 0.5, 0];
    let quality = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    let frameSamples = [];

    const initializeRenderer = () => {
        try {
            renderer?.destroy();
            renderer = createLiquidRenderer(canvas);
            stage.classList.remove('is-fallback');
        } catch (error) {
            console.warn('Liquid renderer unavailable; using the static fallback.', error);
            renderer = undefined;
            stage.classList.add('is-fallback');
        }
    };

    const resize = () => {
        const nextMobile = window.matchMedia('(max-width: 900px)').matches;

        if (nextMobile !== mobile) {
            mobile = nextMobile;
            bodyState = sceneConfig(targetScene, mobile);
            quality = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
        }

        renderer?.resize(window.innerWidth, window.innerHeight, quality);
        positionLinks();
        requestRender();
    };

    const positionLinks = () => {
        if (links.length !== 3) {
            return;
        }

        bodyState.forEach((body, index) => {
            const [x, y, radiusX, radiusY] = body;
            const link = links[index];

            link.style.width = `${Math.max(1, radiusX * 2 * window.innerWidth)}px`;
            link.style.height = `${Math.max(1, radiusY * 2 * window.innerHeight)}px`;
            link.style.transform = `translate3d(${(x - radiusX) * window.innerWidth}px, ${(y - radiusY) * window.innerHeight}px, 0)`;
        });
    };

    const desiredBodies = (time) => {
        const desired = sceneConfig(targetScene, mobile);
        const idleEnabled = !reducedMotion && phase === 'idle';

        desired.forEach((body, index) => {
            if (targetScene === 'home' && idleEnabled) {
                const phaseOffset = index * 2.27;
                body[0] += Math.sin(time * 0.00023 + phaseOffset) * (mobile ? 0.004 : 0.006);
                body[1] += Math.cos(time * 0.00019 + phaseOffset) * (mobile ? 0.003 : 0.005);
                body[2] *= 1 + Math.sin(time * 0.00017 + phaseOffset) * 0.010;
                body[3] *= 1 + Math.cos(time * 0.00021 + phaseOffset) * 0.012;
            }

            if (targetScene !== 'home' || hoveredIndex < 0 || !finePointer) {
                return;
            }

            if (index === hoveredIndex) {
                const pullX = clamp((pointerTarget[0] - body[0]) * 0.026, -0.012, 0.012);
                const pullY = clamp((pointerTarget[1] - body[1]) * 0.026, -0.010, 0.010);

                body[0] += pullX;
                body[1] += pullY;
                body[2] *= 1.025;
                body[3] *= 1.025;
                return;
            }

            const active = desired[hoveredIndex];
            const deltaX = body[0] - active[0];
            const deltaY = body[1] - active[1];
            const distance = Math.max(Math.hypot(deltaX, deltaY), 0.001);

            body[0] += deltaX / distance * 0.006;
            body[1] += deltaY / distance * 0.005;
            body[2] *= 0.992;
            body[3] *= 0.992;
        });

        return desired;
    };

    const render = (time) => {
        frameId = undefined;

        if (document.hidden) {
            return;
        }

        const delta = Math.min((time - lastFrame) / 1000, 0.05);
        const desired = desiredBodies(time);
        const response = 1 - Math.exp(-delta * (phase === 'transitioning' ? 6.8 : 4.2));
        const pointerResponse = 1 - Math.exp(-delta * 9.5);
        const hoverResponse = 1 - Math.exp(-delta * 8.0);

        lastFrame = time;
        pointer[0] += (pointerTarget[0] - pointer[0]) * pointerResponse;
        pointer[1] += (pointerTarget[1] - pointer[1]) * pointerResponse;
        pointer[2] += (pointerTarget[2] - pointer[2]) * pointerResponse;

        bodyState.forEach((body, bodyIndex) => {
            body.forEach((value, valueIndex) => {
                body[valueIndex] = value + (desired[bodyIndex][valueIndex] - value) * response;
            });

            hoverState[bodyIndex] += ((bodyIndex === hoveredIndex ? 1 : 0) - hoverState[bodyIndex]) * hoverResponse;
        });

        positionLinks();
        renderer?.render({
            bodies: new Float32Array(bodyState.flat()),
            hover: new Float32Array(hoverState),
            motion: reducedMotion ? 0 : phase === 'transitioning' ? 0.35 : 1,
            pointer: new Float32Array(pointer),
            time: time / 1000,
        });

        if (!mobile && !reducedMotion && renderer) {
            frameSamples.push(delta * 1000);

            if (frameSamples.length >= 120) {
                const average = frameSamples.reduce((sum, sample) => sum + sample, 0) / frameSamples.length;
                frameSamples = [];

                if (average > 22 && quality > 1) {
                    quality = 1;
                    renderer.resize(window.innerWidth, window.innerHeight, quality);
                }
            }
        }

        if (!reducedMotion) {
            frameId = window.requestAnimationFrame(render);
        }
    };

    const requestRender = () => {
        if (frameId === undefined && !document.hidden) {
            lastFrame = performance.now();
            frameId = window.requestAnimationFrame(render);
        }
    };

    const updateAccessibility = () => {
        const isLanding = currentScene === 'home' && phase === 'idle';

        navigation.toggleAttribute('inert', !isLanding);
        navigation.setAttribute('aria-hidden', isLanding ? 'false' : 'true');
    };

    const beginTransition = (scene) => {
        const nextScene = liquidScenes.has(scene) ? scene : 'home';

        targetScene = nextScene;
        phase = 'transitioning';
        hoveredIndex = -1;
        stage.dataset.phase = phase;
        stage.dataset.targetScene = nextScene;
        updateAccessibility();
        requestRender();

        return {
            completeDelay: reducedMotion ? 0 : 1040,
            swapDelay: reducedMotion ? 0 : 430,
        };
    };

    const commitScene = (scene) => {
        currentScene = liquidScenes.has(scene) ? scene : 'home';
        stage.dataset.scene = currentScene;
    };

    const completeTransition = (scene) => {
        currentScene = liquidScenes.has(scene) ? scene : 'home';
        targetScene = currentScene;
        phase = 'idle';
        stage.dataset.scene = currentScene;
        stage.dataset.phase = phase;
        delete stage.dataset.targetScene;
        updateAccessibility();
        requestRender();
    };

    const setHoveredIndex = (index) => {
        if (targetScene !== 'home' || phase !== 'idle') {
            return;
        }

        if (hoveredIndex !== index && index >= 0) {
            stage.dispatchEvent(new CustomEvent('liquid-hover', {
                bubbles: true,
                detail: { route: routes[index] },
            }));
        }

        hoveredIndex = index;
        stage.classList.toggle('is-engaged', index >= 0);
        requestRender();
    };

    initializeRenderer();
    updateAccessibility();
    resize();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (event) => {
        if (!finePointer || reducedMotion) {
            return;
        }

        pointerTarget = [
            clamp(event.clientX / window.innerWidth, 0, 1),
            clamp(event.clientY / window.innerHeight, 0, 1),
            1,
        ];
        requestRender();
    }, { passive: true });
    window.addEventListener('blur', () => {
        pointerTarget[2] = 0;
        setHoveredIndex(-1);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.cancelAnimationFrame(frameId);
            frameId = undefined;
            return;
        }

        requestRender();
    });

    links.forEach((link, index) => {
        link.addEventListener('pointerenter', () => setHoveredIndex(index));
        link.addEventListener('pointerleave', () => setHoveredIndex(-1));
        link.addEventListener('focus', () => setHoveredIndex(index));
        link.addEventListener('blur', () => setHoveredIndex(-1));
    });

    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        renderer = undefined;
        stage.classList.add('is-fallback');
    });
    canvas.addEventListener('webglcontextrestored', () => {
        initializeRenderer();
        resize();
    });

    requestRender();

    return {
        beginTransition,
        commitScene,
        completeTransition,
        getScene: () => currentScene,
    };
};
