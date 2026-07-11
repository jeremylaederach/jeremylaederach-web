import {
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    ShaderMaterial,
    SRGBColorSpace,
    Vector2,
    Vector4,
    WebGLRenderer,
} from 'three';

const BODY_COUNT = 3;
const MOBILE_BREAKPOINT = 700;
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeInOut = (value) => value * value * (3 - 2 * value);

const vertexShader = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;

    #define BODY_COUNT 3

    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uPointerActive;
    uniform float uTime;
    uniform float uHover;
    uniform float uSelected;
    uniform float uTransition;
    uniform vec4 uBodies[BODY_COUNT];

    varying vec2 vUv;

    float hash21(vec2 point) {
        point = fract(point * vec2(123.34, 456.21));
        point += dot(point, point + 45.32);
        return fract(point.x * point.y);
    }

    float valueNoise(vec2 point) {
        vec2 cell = floor(point);
        vec2 local = fract(point);
        local = local * local * (3.0 - 2.0 * local);

        float a = hash21(cell);
        float b = hash21(cell + vec2(1.0, 0.0));
        float c = hash21(cell + vec2(0.0, 1.0));
        float d = hash21(cell + vec2(1.0, 1.0));

        return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
    }

    float ellipseContribution(vec2 point, vec4 body, float wobble, float phase) {
        vec2 size = max(body.zw, vec2(0.002));
        vec2 delta = (point - body.xy) / size;
        float angle = atan(delta.y, delta.x);
        float deformation = 1.0
            + wobble * sin(angle * 3.0 + uTime * 0.21 + phase)
            + wobble * 0.55 * sin(angle * 5.0 - uTime * 0.16 + phase * 1.7);
        delta /= deformation;

        return 1.0 / (dot(delta, delta) + 0.08);
    }

    float bodyMatch(float index, float target) {
        return 1.0 - step(0.45, abs(index - target));
    }

    float primaryContribution(vec2 point, vec4 body, float bodyIndex) {
        float hovered = bodyMatch(bodyIndex, uHover);
        float selected = bodyMatch(bodyIndex, uSelected);
        float wobble = mix(0.052, 0.015, hovered);
        float visibility = mix(1.0, mix(0.055, 1.0, selected), uTransition);

        return ellipseContribution(point, body, wobble, bodyIndex * 2.1) * visibility;
    }

    float ambientContribution(vec2 point) {
        float fade = 1.0 - uTransition;
        vec4 rightBody = vec4(
            1.075 + sin(uTime * 0.08) * 0.012,
            0.56 + cos(uTime * 0.07) * 0.018,
            0.21,
            0.36
        );
        vec4 topBody = vec4(
            0.43 + cos(uTime * 0.06) * 0.018,
            1.07 + sin(uTime * 0.08) * 0.012,
            0.13,
            0.23
        );
        vec4 lowerLeft = vec4(
            0.22 + sin(uTime * 0.09) * 0.015,
            0.015,
            0.17,
            0.105
        );
        vec4 lowerRight = vec4(
            0.74 + cos(uTime * 0.07) * 0.02,
            -0.025,
            0.16,
            0.09
        );

        float field = ellipseContribution(point, rightBody, 0.035, 1.7) * 0.9;
        field += ellipseContribution(point, topBody, 0.04, 3.2) * 0.78;
        field += ellipseContribution(point, lowerLeft, 0.035, 4.6) * 0.72;
        field += ellipseContribution(point, lowerRight, 0.03, 5.8) * 0.68;

        return field * fade;
    }

    float poolContribution(vec2 point) {
        float wave = 0.072
            + sin(point.x * 11.0 + uTime * 0.12) * 0.009
            + sin(point.x * 23.0 - uTime * 0.08) * 0.004;
        float pool = 1.0 - smoothstep(wave - 0.012, wave + 0.018, point.y);

        return pool * 2.2 * (1.0 - uTransition);
    }

    float liquidField(vec2 point) {
        float flow = valueNoise(point * 3.1 + vec2(uTime * 0.025, -uTime * 0.018));
        vec2 warpedPoint = point + vec2(
            sin(point.y * 7.0 + uTime * 0.08),
            cos(point.x * 6.0 - uTime * 0.07)
        ) * (flow - 0.5) * 0.012 * (1.0 - uTransition);

        float field = primaryContribution(warpedPoint, uBodies[0], 0.0);
        field += primaryContribution(warpedPoint, uBodies[1], 1.0);
        field += primaryContribution(warpedPoint, uBodies[2], 2.0);
        field += ambientContribution(warpedPoint);
        field += poolContribution(warpedPoint);

        return field;
    }

    float hoveredPresence(vec2 point) {
        float presence = ellipseContribution(point, uBodies[0], 0.012, 0.0) * bodyMatch(0.0, uHover);
        presence += ellipseContribution(point, uBodies[1], 0.012, 1.0) * bodyMatch(1.0, uHover);
        presence += ellipseContribution(point, uBodies[2], 0.012, 2.0) * bodyMatch(2.0, uHover);

        return smoothstep(0.45, 1.6, presence);
    }

    void main() {
        vec2 point = vUv;
        float aspect = uResolution.x / max(uResolution.y, 1.0);
        float field = liquidField(point);
        float pixel = 1.5 / max(uResolution.y, 1.0);
        float fieldX = liquidField(point + vec2(pixel, 0.0));
        float fieldY = liquidField(point + vec2(0.0, pixel));
        vec2 gradient = vec2(fieldX - field, fieldY - field) / pixel;
        vec3 normal = normalize(vec3(-gradient * 0.017, 1.0));

        float surface = smoothstep(0.9, 1.04, field);
        float edge = exp(-abs(field - 0.98) * 7.5);
        float outerGlow = smoothstep(0.16, 0.98, field) * (1.0 - surface);
        float depth = smoothstep(1.0, 3.4, field);
        float fresnel = pow(1.0 - clamp(normal.z, 0.0, 1.0), 1.7);
        float keyLight = pow(max(dot(normal, normalize(vec3(-0.62, 0.72, 0.82))), 0.0), 10.0);
        float pinkLight = pow(max(dot(normal, normalize(vec3(0.78, -0.2, 0.7))), 0.0), 16.0);
        float flow = valueNoise(point * 4.0 + vec2(uTime * 0.02, -uTime * 0.015));
        float reflectionBand = 0.5 + 0.5 * sin(
            point.y * 34.0
            + point.x * 11.0
            + normal.x * 6.0
            + flow * 4.0
            + uTime * 0.1
        );
        float reflection = pow(reflectionBand, 5.0);
        float hover = hoveredPresence(point);

        vec2 pointerDelta = (point - uPointer) * vec2(aspect, 1.0);
        float pointerLight = exp(-length(pointerDelta) * 4.8) * uPointerActive;

        vec3 background = vec3(0.004, 0.0015, 0.012);
        background += vec3(0.018, 0.005, 0.04) * (1.0 - point.y);
        background += vec3(0.022, 0.006, 0.05) * exp(-distance(point, vec2(0.64, 0.52)) * 2.2);

        vec3 liquid = vec3(0.012, 0.003, 0.032);
        liquid += vec3(0.055, 0.012, 0.15) * (0.2 + depth * 0.48);
        liquid += vec3(0.17, 0.038, 0.42) * reflection * (0.2 + fresnel * 0.8);
        liquid += vec3(0.52, 0.12, 0.98) * edge * (0.24 + fresnel * 0.92);
        liquid += vec3(0.86, 0.19, 0.96) * keyLight * (0.35 + edge * 0.75);
        liquid += vec3(1.0, 0.12, 0.62) * pinkLight * (0.28 + edge * 0.58);
        liquid += vec3(0.2, 0.045, 0.42) * pointerLight * (0.22 + edge * 0.5);
        liquid += vec3(0.1, 0.025, 0.22) * hover;

        float leftReadability = mix(0.28, 1.0, smoothstep(0.16, 0.42, point.x));
        surface *= leftReadability;
        edge *= mix(0.4, 1.0, smoothstep(0.12, 0.38, point.x));

        vec3 color = background;
        color += vec3(0.12, 0.025, 0.28) * outerGlow * 0.22;
        color = mix(color, liquid, surface);
        color += vec3(0.35, 0.07, 0.7) * edge * (1.0 - surface) * 0.22;

        float vignette = 1.0 - smoothstep(0.25, 1.15, distance(point, vec2(0.54, 0.5)));
        color *= 0.68 + vignette * 0.32;
        color += (hash21(gl_FragCoord.xy) - 0.5) * 0.008;

        gl_FragColor = vec4(color, 1.0);
    }
`;

const createUniforms = () => ({
    uResolution: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0.62, 0.52) },
    uPointerActive: { value: 0 },
    uTime: { value: 0 },
    uHover: { value: -10 },
    uSelected: { value: -10 },
    uTransition: { value: 0 },
    uBodies: {
        value: Array.from({ length: BODY_COUNT }, () => new Vector4(0.5, 0.5, 0.1, 0.1)),
    },
});

const getBodyIndex = (body) => Number(body.dataset.bodyIndex);

export const createLiquidScene = ({ root, canvas, bodies, reducedMotion = false, finePointer = false }) => {
    const orderedBodies = [...bodies].sort((first, second) => getBodyIndex(first) - getBodyIndex(second));
    const uniforms = createUniforms();
    const renderer = new WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
    });
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    const bodyStates = orderedBodies.map((element, index) => ({
        element,
        index,
        route: element.dataset.route,
        base: new Vector4(0.5, 0.5, 0.1, 0.1),
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        phase: index * 2.17,
    }));
    const pointer = {
        active: false,
        currentX: 0.62,
        currentY: 0.52,
        targetX: 0.62,
        targetY: 0.52,
    };
    let frameId;
    let resizeObserver;
    let running = true;
    let hoverIndex = -10;
    let transitionState = null;
    let lastFrameTime = 0;
    let elapsedTime = 0;
    let viewportWidth = 1;
    let viewportHeight = 1;

    renderer.outputColorSpace = SRGBColorSpace;
    mesh.frustumCulled = false;
    scene.add(mesh);

    const measure = () => {
        const rootRect = root.getBoundingClientRect();
        const mobile = rootRect.width < MOBILE_BREAKPOINT;
        const pixelBudget = mobile ? 900_000 : 2_400_000;
        const budgetRatio = Math.sqrt(pixelBudget / Math.max(rootRect.width * rootRect.height, 1));
        const pixelRatio = Math.max(
            0.55,
            Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25, budgetRatio),
        );

        viewportWidth = Math.max(rootRect.width, 1);
        viewportHeight = Math.max(rootRect.height, 1);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(viewportWidth, viewportHeight, false);
        renderer.getDrawingBufferSize(uniforms.uResolution.value);

        bodyStates.forEach((state) => {
            const rect = state.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - state.offsetX - rootRect.left;
            const centerY = rect.top + rect.height / 2 - state.offsetY - rootRect.top;
            const layoutWidth = rect.width / Math.max(state.scale, 0.001);
            const layoutHeight = rect.height / Math.max(state.scale, 0.001);

            state.base.set(
                centerX / viewportWidth,
                1 - centerY / viewportHeight,
                (layoutWidth / viewportWidth) * 0.48,
                (layoutHeight / viewportHeight) * 0.48,
            );
        });
    };

    const setHover = (index) => {
        hoverIndex = index;
        uniforms.uHover.value = index;

        if (reducedMotion) {
            renderer.render(scene, camera);
        }
    };

    const updateBodies = (time, delta) => {
        const mobile = viewportWidth < MOBILE_BREAKPOINT;
        const attractionRange = Math.max(viewportWidth, viewportHeight) * 0.72;
        const smoothing = 1 - Math.pow(0.001, Math.min(delta, 0.05));
        const transition = transitionState
            ? easeInOut(clamp((time - transitionState.startedAt) / transitionState.duration))
            : 0;

        uniforms.uTransition.value = transition;

        bodyStates.forEach((state) => {
            const hovered = state.index === hoverIndex;
            const calm = hovered ? 0.2 : 1;
            const idleAmplitude = mobile ? 5 : 10;
            const idleX = Math.sin(elapsedTime * (0.12 + state.index * 0.015) + state.phase) * idleAmplitude * calm;
            const idleY = Math.cos(elapsedTime * (0.1 + state.index * 0.014) + state.phase) * idleAmplitude * 0.72 * calm;
            const centerXPixels = state.base.x * viewportWidth;
            const centerYPixels = (1 - state.base.y) * viewportHeight;
            const pointerXPixels = pointer.currentX * viewportWidth;
            const pointerYPixels = (1 - pointer.currentY) * viewportHeight;
            const deltaX = pointerXPixels - centerXPixels;
            const deltaY = pointerYPixels - centerYPixels;
            const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
            const influence = pointer.active ? clamp(1 - distance / attractionRange) : 0;
            const attraction = mobile ? 0 : (hovered ? 15 : 9);
            const targetX = idleX + (deltaX / distance) * attraction * influence;
            const targetY = idleY + (deltaY / distance) * attraction * influence;
            const targetScale = hovered ? 1.035 : 1;

            state.offsetX += (targetX - state.offsetX) * smoothing;
            state.offsetY += (targetY - state.offsetY) * smoothing;
            state.scale += (targetScale - state.scale) * smoothing;

            state.element.style.setProperty('--liquid-x', `${state.offsetX.toFixed(2)}px`);
            state.element.style.setProperty('--liquid-y', `${state.offsetY.toFixed(2)}px`);
            state.element.style.setProperty('--liquid-scale', state.scale.toFixed(4));

            const selected = transitionState?.index === state.index;
            const centerX = state.base.x + state.offsetX / viewportWidth;
            const centerY = state.base.y - state.offsetY / viewportHeight;
            const transitionCenterX = selected ? 0.5 : centerX;
            const transitionCenterY = selected ? 0.5 : centerY;
            const selectedScale = selected ? 1 + transition * 4.2 : 1;

            uniforms.uBodies.value[state.index].set(
                centerX + (transitionCenterX - centerX) * transition,
                centerY + (transitionCenterY - centerY) * transition,
                state.base.z * state.scale * selectedScale,
                state.base.w * state.scale * selectedScale,
            );
        });
    };

    const render = (time = 0) => {
        if (!running) {
            return;
        }

        const mobileFrameInterval = viewportWidth < MOBILE_BREAKPOINT ? 1000 / 45 : 0;

        if (mobileFrameInterval && time - lastFrameTime < mobileFrameInterval) {
            frameId = window.requestAnimationFrame(render);

            return;
        }

        const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0.016;

        lastFrameTime = time;
        elapsedTime += reducedMotion ? 0 : delta;
        pointer.currentX += (pointer.targetX - pointer.currentX) * 0.08;
        pointer.currentY += (pointer.targetY - pointer.currentY) * 0.08;
        uniforms.uPointer.value.set(pointer.currentX, pointer.currentY);
        uniforms.uPointerActive.value += ((pointer.active ? 1 : 0) - uniforms.uPointerActive.value) * 0.08;
        uniforms.uTime.value = elapsedTime;
        updateBodies(time, delta);
        renderer.render(scene, camera);

        if (!reducedMotion) {
            frameId = window.requestAnimationFrame(render);
        }
    };

    const handlePointerMove = (event) => {
        const rect = root.getBoundingClientRect();

        pointer.active = true;
        pointer.targetX = clamp((event.clientX - rect.left) / rect.width);
        pointer.targetY = 1 - clamp((event.clientY - rect.top) / rect.height);
    };

    const handlePointerLeave = () => {
        pointer.active = false;
    };

    const handleVisibilityChange = () => {
        running = !document.hidden;

        if (running && !frameId) {
            lastFrameTime = 0;
            frameId = window.requestAnimationFrame(render);
        } else if (!running && frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = undefined;
        }
    };

    bodyStates.forEach((state) => {
        state.element.addEventListener('pointerenter', () => setHover(state.index));
        state.element.addEventListener('pointerleave', () => setHover(-10));
        state.element.addEventListener('focusin', () => setHover(state.index));
        state.element.addEventListener('focusout', () => setHover(-10));
    });

    if (finePointer && !reducedMotion) {
        root.addEventListener('pointermove', handlePointerMove, { passive: true });
        root.addEventListener('pointerleave', handlePointerLeave);
    }

    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        running = false;
        root.classList.remove('is-webgl-ready');
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(root);
    } else {
        window.addEventListener('resize', measure, { passive: true });
    }

    measure();
    updateBodies(0, 0.016);
    renderer.render(scene, camera);
    root.classList.add('is-webgl-ready');

    if (!reducedMotion) {
        frameId = window.requestAnimationFrame(render);
    }

    return {
        transitionTo(route) {
            const selected = bodyStates.find((state) => state.route === route);

            if (!selected || reducedMotion) {
                return 0;
            }

            transitionState = {
                index: selected.index,
                startedAt: performance.now(),
                duration: 760,
            };
            uniforms.uSelected.value = selected.index;
            setHover(selected.index);

            return transitionState.duration;
        },

        destroy() {
            running = false;
            window.cancelAnimationFrame(frameId);
            resizeObserver?.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        },
    };
};
