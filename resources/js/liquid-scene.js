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
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const noiseFunctions = `
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
`;

const backgroundFragmentShader = `
    precision highp float;

    #define BODY_COUNT 3

    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uPointerActive;
    uniform float uTime;
    uniform float uTransition;
    uniform vec4 uBodies[BODY_COUNT];

    varying vec2 vUv;

    ${noiseFunctions}

    float ellipseField(vec2 point, vec4 body, float weight, float phase) {
        vec2 delta = (point - body.xy) / max(body.zw, vec2(0.002));
        float angle = atan(delta.y, delta.x);
        float breathing = 1.0
            + 0.035 * sin(angle * 3.0 + uTime * 0.075 + phase)
            + 0.018 * sin(angle * 5.0 - uTime * 0.055 + phase * 1.7);
        delta /= breathing;

        return exp(-dot(delta, delta) * 1.7) * weight;
    }

    float capsuleField(vec2 point, vec2 start, vec2 end, float radius) {
        float aspect = uResolution.x / max(uResolution.y, 1.0);
        vec2 scale = vec2(aspect, 1.0);
        vec2 pointFromStart = (point - start) * scale;
        vec2 segment = (end - start) * scale;
        float position = clamp(
            dot(pointFromStart, segment) / max(dot(segment, segment), 0.0001),
            0.0,
            1.0
        );
        float distanceToSegment = length(pointFromStart - segment * position);

        return exp(-pow(distanceToSegment / radius, 2.0) * 1.7);
    }

    float liquidField(vec2 point) {
        float flow = valueNoise(point * 3.2 + vec2(uTime * 0.012, -uTime * 0.01));
        vec2 warpedPoint = point + vec2(
            sin(point.y * 7.0 + uTime * 0.045),
            cos(point.x * 6.0 - uTime * 0.04)
        ) * (flow - 0.5) * 0.018;

        float field = ellipseField(warpedPoint, uBodies[0], 0.8, 0.4);
        field += ellipseField(warpedPoint, uBodies[1], 0.76, 2.1);
        field += ellipseField(warpedPoint, uBodies[2], 0.74, 4.0);

        field += ellipseField(warpedPoint, vec4(0.505, 0.49, 0.44, 0.36), 0.72, 1.2);
        field += ellipseField(warpedPoint, vec4(1.085, 0.57, 0.235, 0.39), 1.1, 2.8);
        field += ellipseField(warpedPoint, vec4(0.43, 1.105, 0.15, 0.24), 0.96, 4.5);
        field += ellipseField(warpedPoint, vec4(0.23, 0.55, 0.095, 0.12), 0.66, 5.7);
        field += ellipseField(warpedPoint, vec4(0.69, 0.36, 0.095, 0.13), 0.6, 3.5);
        field += ellipseField(warpedPoint, vec4(0.49, -0.14, 0.72, 0.24), 1.28, 0.9);
        field += ellipseField(warpedPoint, vec4(0.2, 0.02, 0.18, 0.1), 0.7, 2.4);
        field += ellipseField(warpedPoint, vec4(0.72, -0.005, 0.17, 0.095), 0.67, 5.1);
        field += capsuleField(warpedPoint, uBodies[0].xy, uBodies[1].xy, 0.052) * 0.42;
        field += capsuleField(warpedPoint, uBodies[0].xy, uBodies[2].xy, 0.046) * 0.38;
        field += capsuleField(warpedPoint, uBodies[1].xy, uBodies[2].xy, 0.038) * 0.32;

        return field * (1.0 - uTransition * 0.88);
    }

    void main() {
        vec2 point = vUv;
        float aspect = uResolution.x / max(uResolution.y, 1.0);
        float field = liquidField(point);
        vec2 gradient = vec2(
            dFdx(field) / max(abs(dFdx(point.x)), 0.00001),
            dFdy(field) / max(abs(dFdy(point.y)), 0.00001)
        );
        vec3 normal = normalize(vec3(-gradient * 0.026, 1.0));

        float threshold = 0.66;
        float surface = smoothstep(threshold - 0.035, threshold + 0.035, field);
        float rim = exp(-abs(field - threshold) * 21.0);
        float innerRim = exp(-abs(field - (threshold + 0.105)) * 24.0) * surface;
        float outerGlow = exp(-max(threshold - field, 0.0) * 12.0) * (1.0 - surface);
        float depth = smoothstep(threshold, 2.5, field);
        float fresnel = pow(1.0 - clamp(normal.z, 0.0, 1.0), 1.55);
        float keyLight = pow(max(dot(normal, normalize(vec3(-0.7, 0.66, 0.72))), 0.0), 13.0);
        float pinkLight = pow(max(dot(normal, normalize(vec3(0.76, -0.12, 0.64))), 0.0), 18.0);
        float flow = valueNoise(point * 5.0 + vec2(uTime * 0.015, -uTime * 0.012));
        float reflectionBand = 0.5 + 0.5 * sin(
            point.y * 18.0 + point.x * 7.0 + normal.x * 6.0 + flow * 5.5
        );
        float reflection = pow(reflectionBand, 12.0) * surface;
        float crossingBand = pow(
            0.5 + 0.5 * sin(point.y * 11.0 - point.x * 13.0 + flow * 4.0),
            16.0
        ) * surface;
        float bridgeField = max(
            capsuleField(point, uBodies[0].xy, uBodies[1].xy, 0.052),
            max(
                capsuleField(point, uBodies[0].xy, uBodies[2].xy, 0.046),
                capsuleField(point, uBodies[1].xy, uBodies[2].xy, 0.038)
            )
        );
        float bridgeRim = exp(-abs(bridgeField - 0.34) * 17.0) * (1.0 - uTransition);

        vec2 pointerDelta = (point - uPointer) * vec2(aspect, 1.0);
        float pointerLight = exp(-length(pointerDelta) * 5.5) * uPointerActive;

        vec3 background = vec3(0.0025, 0.001, 0.009);
        background += vec3(0.012, 0.003, 0.03) * (1.0 - point.y);
        background += vec3(0.018, 0.004, 0.045) * exp(-distance(point, vec2(0.58, 0.48)) * 2.5);

        vec3 liquid = vec3(0.008, 0.0018, 0.026);
        liquid += vec3(0.052, 0.009, 0.15) * (0.2 + depth * 0.64);
        liquid += vec3(0.24, 0.045, 0.6) * reflection * (0.28 + fresnel * 0.68);
        liquid += vec3(0.16, 0.03, 0.4) * crossingBand * (0.14 + fresnel * 0.5);
        liquid += vec3(0.38, 0.07, 0.82) * fresnel * 0.42;
        liquid += vec3(0.78, 0.31, 1.16) * keyLight * (0.2 + rim * 0.78);
        liquid += vec3(1.14, 0.13, 0.72) * pinkLight * (0.18 + rim * 0.7);
        liquid += vec3(0.25, 0.05, 0.58) * pointerLight * (0.1 + fresnel * 0.4);
        liquid += vec3(0.25, 0.07, 0.62) * innerRim * 0.48;

        vec3 color = mix(background, liquid, surface * 0.94);
        color += vec3(0.58, 0.14, 1.06) * rim * 0.4;
        color += vec3(1.0, 0.44, 1.12) * rim * keyLight * 0.72;
        color += vec3(0.42, 0.06, 0.86) * outerGlow * 0.2;
        color += vec3(0.1, 0.018, 0.24) * surface * exp(-point.y * 7.0) * 0.34;
        color += vec3(0.38, 0.08, 0.86) * bridgeRim * 0.22;

        float vignette = 1.0 - smoothstep(0.32, 1.08, distance(point, vec2(0.52, 0.5)));
        color *= 0.7 + vignette * 0.3;
        color += (hash21(gl_FragCoord.xy) - 0.5) * 0.005;

        gl_FragColor = vec4(color, 1.0);
    }
`;

const bodyFragmentShader = `
    precision highp float;

    uniform vec2 uPointer;
    uniform float uPointerActive;
    uniform float uTime;
    uniform float uIndex;
    uniform float uHover;
    uniform float uExpand;
    uniform float uOpacity;

    varying vec2 vUv;

    ${noiseFunctions}

    mat2 rotate2d(float angle) {
        float sine = sin(angle);
        float cosine = cos(angle);
        return mat2(cosine, -sine, sine, cosine);
    }

    float organicMetric(vec2 point) {
        float rotation = (uIndex - 0.8) * 0.045 * (1.0 - uExpand);
        vec2 rotated = rotate2d(rotation) * point;
        float angle = atan(rotated.y, rotated.x);
        float calm = mix(1.0, 0.22, uHover);
        float deformation = (0.085 + uIndex * 0.006) * calm * (1.0 - uExpand);
        float radius = 1.0
            + deformation * sin(angle * 3.0 + uTime * 0.11 + uIndex * 1.9)
            + deformation * 0.54 * sin(angle * 2.0 - uTime * 0.065 + uIndex * 1.3)
            + deformation * 0.36 * sin(angle * 5.0 - uTime * 0.075 + uIndex * 2.7);
        vec2 shaped = rotated / (radius * 0.89);
        shaped.x += sin(shaped.y * 2.3 + uIndex * 1.7) * 0.048 * calm * (1.0 - uExpand);
        shaped.y += sin(shaped.x * 2.0 - uIndex * 1.4) * 0.038 * calm * (1.0 - uExpand);
        float power = uIndex < 0.5 ? 3.7 : (uIndex < 1.5 ? 3.3 : 2.9);
        float metric = pow(
            pow(abs(shaped.x), power) + pow(abs(shaped.y), power),
            1.0 / power
        );
        float expandedMetric = max(abs(point.x), abs(point.y)) * 0.72;

        return mix(metric, expandedMetric, uExpand);
    }

    float surfaceHeight(vec2 point) {
        float metric = organicMetric(point);
        float profile = max(1.0 - metric * metric, 0.0);

        return pow(profile, 0.42);
    }

    void main() {
        vec2 point = (vUv - 0.5) * 2.0;
        float metric = organicMetric(point);
        float surface = 1.0 - smoothstep(0.985, 1.025, metric);
        float rim = exp(-abs(metric - 0.992) * 46.0);
        float secondaryRim = exp(-abs(metric - 0.935) * 58.0) * surface;
        float innerRim = exp(-abs(metric - 0.86) * 34.0) * surface;
        float bevel = exp(-abs(metric - 0.76) * 7.0) * surface;
        float glassShell = pow(clamp(metric, 0.0, 1.0), 3.4) * surface;
        float outerGlow = exp(-max(metric - 1.0, 0.0) * 17.0) * (1.0 - surface);

        float height = surfaceHeight(point);
        vec2 heightGradient = vec2(
            dFdx(height) / max(abs(dFdx(point.x)), 0.00001),
            dFdy(height) / max(abs(dFdy(point.y)), 0.00001)
        );
        vec3 normal = normalize(vec3(
            -heightGradient.x * 0.14,
            -heightGradient.y * 0.14,
            1.0
        ));

        float fresnel = pow(1.0 - clamp(normal.z, 0.0, 1.0), 1.35);
        float keyLight = pow(max(dot(normal, normalize(vec3(-0.65, 0.7, 0.78))), 0.0), 16.0);
        float pinkLight = pow(max(dot(normal, normalize(vec3(0.78, -0.08, 0.68))), 0.0), 20.0);
        float lowerLight = pow(max(dot(normal, normalize(vec3(-0.2, -0.92, 0.4))), 0.0), 18.0);
        float broadKey = pow(max(dot(normal, normalize(vec3(-0.55, 0.7, 1.2))), 0.0), 4.0);
        float broadPink = pow(max(dot(normal, normalize(vec3(0.8, -0.15, 1.05))), 0.0), 7.0);
        float flow = valueNoise(point * 2.4 + vec2(uTime * 0.012, -uTime * 0.009));
        float reflectionBand = 0.5 + 0.5 * sin(
            point.y * 6.5 + point.x * 2.2 + normal.x * 2.8 + flow * 3.2
        );
        float reflection = pow(reflectionBand, 14.0) * surface;
        float pointerLight = exp(-length(point - uPointer) * 2.7) * uPointerActive;
        float broadSheen = exp(-pow(
            point.y + 0.14 + sin(point.x * 2.2 + uIndex) * 0.14,
            2.0
        ) * 13.0) * surface;
        float rimVariation = 0.58 + 0.42 * (
            0.5 + 0.5 * sin(atan(point.y, point.x) * 2.4 + flow * 3.0 + uIndex)
        );

        vec3 liquid = vec3(0.007, 0.0015, 0.022);
        liquid += vec3(0.034, 0.0065, 0.105) * (0.2 + height * 0.58);
        liquid += vec3(0.12, 0.023, 0.38) * reflection * (0.18 + fresnel * 0.42);
        liquid += vec3(0.32, 0.06, 0.72) * fresnel * 0.2;
        liquid += vec3(0.74, 0.3, 1.12) * keyLight * (0.08 + rim * 0.82);
        liquid += vec3(1.14, 0.12, 0.67) * pinkLight * (0.06 + rim * 0.78);
        liquid += vec3(0.46, 0.1, 0.88) * lowerLight * 0.1;
        liquid += vec3(0.13, 0.035, 0.3) * broadKey * 0.2;
        liquid += vec3(0.18, 0.025, 0.22) * broadPink * 0.12;
        liquid += vec3(0.24, 0.05, 0.58) * pointerLight * (0.05 + fresnel * 0.16);
        liquid += vec3(0.22, 0.048, 0.56) * innerRim * 0.11;
        liquid += vec3(0.12, 0.024, 0.34) * bevel * 0.46;
        liquid += vec3(0.16, 0.03, 0.44) * glassShell * 0.24;
        liquid += vec3(0.16, 0.032, 0.42) * broadSheen * 0.16;
        liquid += vec3(0.026, 0.006, 0.075) * uHover;

        vec3 rimColor = mix(
            vec3(0.56, 0.18, 1.08),
            vec3(1.16, 0.2, 0.84),
            smoothstep(-0.25, 0.9, point.x - point.y * 0.2)
        );
        vec3 color = liquid;
        color += rimColor * rim * (0.58 + rimVariation * 0.48);
        color += vec3(0.48, 0.1, 0.96) * secondaryRim * 0.28;
        color += vec3(1.08, 0.68, 1.2) * rim * keyLight * 1.05;
        color += vec3(1.16, 0.12, 0.7) * rim * smoothstep(0.2, 1.0, point.x) * 0.5;
        color += vec3(0.42, 0.07, 0.9) * outerGlow * 0.24;
        color = mix(color, vec3(0.006, 0.0015, 0.021), uExpand * 0.82);

        float alpha = surface * mix(0.94, 1.0, uExpand);
        alpha += rim * 0.14 + outerGlow * 0.07;
        alpha = clamp(alpha, 0.0, 1.0) * uOpacity;

        gl_FragColor = vec4(color, alpha);
    }
`;

const createBackgroundUniforms = () => ({
    uResolution: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0.62, 0.52) },
    uPointerActive: { value: 0 },
    uTime: { value: 0 },
    uTransition: { value: 0 },
    uBodies: {
        value: Array.from({ length: BODY_COUNT }, () => new Vector4(0.5, 0.5, 0.1, 0.1)),
    },
});

const createBodyUniforms = (index) => ({
    uPointer: { value: new Vector2(4, 4) },
    uPointerActive: { value: 0 },
    uTime: { value: 0 },
    uIndex: { value: index },
    uHover: { value: 0 },
    uExpand: { value: 0 },
    uOpacity: { value: 1 },
});

const getBodyIndex = (body) => Number(body.dataset.bodyIndex);

export const createLiquidScene = ({ root, canvas, bodies, reducedMotion = false, finePointer = false }) => {
    const orderedBodies = [...bodies].sort((first, second) => getBodyIndex(first) - getBodyIndex(second));
    const backgroundUniforms = createBackgroundUniforms();
    const renderer = new WebGLRenderer({
        canvas,
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
    });
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const backgroundMaterial = new ShaderMaterial({
        uniforms: backgroundUniforms,
        vertexShader,
        fragmentShader: backgroundFragmentShader,
        depthTest: false,
        depthWrite: false,
    });
    const backgroundMesh = new Mesh(geometry, backgroundMaterial);
    const bodyStates = orderedBodies.map((element, index) => {
        const uniforms = createBodyUniforms(index);
        const material = new ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader: bodyFragmentShader,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
        const mesh = new Mesh(geometry, material);

        mesh.renderOrder = index + 1;
        scene.add(mesh);

        return {
            element,
            index,
            material,
            mesh,
            uniforms,
            route: element.dataset.route,
            base: new Vector4(0.5, 0.5, 0.2, 0.2),
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            hover: 0,
            phase: index * 2.17,
        };
    });
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
    let hoverIndex = -1;
    let transitionState = null;
    let lastFrameTime = 0;
    let elapsedTime = 0;
    let viewportWidth = 1;
    let viewportHeight = 1;

    renderer.outputColorSpace = SRGBColorSpace;
    backgroundMesh.renderOrder = 0;
    backgroundMesh.frustumCulled = false;
    bodyStates.forEach((state) => {
        state.mesh.frustumCulled = false;
    });
    scene.add(backgroundMesh);

    const measure = () => {
        const rootRect = root.getBoundingClientRect();
        const mobile = rootRect.width < MOBILE_BREAKPOINT;
        const pixelBudget = mobile ? 420_000 : 900_000;
        const budgetRatio = Math.sqrt(pixelBudget / Math.max(rootRect.width * rootRect.height, 1));
        const pixelRatio = Math.max(
            0.5,
            Math.min(window.devicePixelRatio || 1, mobile ? 0.85 : 1, budgetRatio),
        );

        viewportWidth = Math.max(rootRect.width, 1);
        viewportHeight = Math.max(rootRect.height, 1);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(viewportWidth, viewportHeight, false);
        renderer.getDrawingBufferSize(backgroundUniforms.uResolution.value);

        bodyStates.forEach((state) => {
            const rect = state.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - state.offsetX - rootRect.left;
            const centerY = rect.top + rect.height / 2 - state.offsetY - rootRect.top;
            const layoutWidth = rect.width / Math.max(state.scale, 0.001);
            const layoutHeight = rect.height / Math.max(state.scale, 0.001);

            state.base.set(
                centerX / viewportWidth,
                1 - centerY / viewportHeight,
                layoutWidth / viewportWidth,
                layoutHeight / viewportHeight,
            );
        });
    };

    const setHover = (index) => {
        hoverIndex = index;

        if (reducedMotion) {
            bodyStates.forEach((state) => {
                state.hover = state.index === index ? 1 : 0;
                state.uniforms.uHover.value = state.hover;
            });
            renderer.render(scene, camera);
        }
    };

    const updateBodies = (time, delta) => {
        const mobile = viewportWidth < MOBILE_BREAKPOINT;
        const attractionRange = Math.max(viewportWidth, viewportHeight) * 0.7;
        const smoothing = 1 - Math.pow(0.001, Math.min(delta, 0.05));
        const transition = transitionState
            ? easeInOut(clamp((time - transitionState.startedAt) / transitionState.duration))
            : 0;

        backgroundUniforms.uTransition.value = transition;

        bodyStates.forEach((state) => {
            const hovered = state.index === hoverIndex;
            const calm = hovered ? 0.16 : 1;
            const idleAmplitude = mobile ? 3 : 7;
            const idleX = Math.sin(elapsedTime * (0.09 + state.index * 0.012) + state.phase) * idleAmplitude * calm;
            const idleY = Math.cos(elapsedTime * (0.075 + state.index * 0.01) + state.phase) * idleAmplitude * 0.7 * calm;
            const centerXPixels = state.base.x * viewportWidth;
            const centerYPixels = (1 - state.base.y) * viewportHeight;
            const pointerXPixels = pointer.currentX * viewportWidth;
            const pointerYPixels = (1 - pointer.currentY) * viewportHeight;
            const deltaX = pointerXPixels - centerXPixels;
            const deltaY = pointerYPixels - centerYPixels;
            const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
            const influence = pointer.active ? clamp(1 - distance / attractionRange) : 0;
            const attraction = mobile ? 0 : (hovered ? 13 : 7);
            const targetX = idleX + (deltaX / distance) * attraction * influence;
            const targetY = idleY + (deltaY / distance) * attraction * influence;
            const targetScale = hovered ? 1.025 : 1;

            state.offsetX += (targetX - state.offsetX) * smoothing;
            state.offsetY += (targetY - state.offsetY) * smoothing;
            state.scale += (targetScale - state.scale) * smoothing;
            state.hover += ((hovered ? 1 : 0) - state.hover) * smoothing;

            state.element.style.setProperty('--liquid-x', `${state.offsetX.toFixed(2)}px`);
            state.element.style.setProperty('--liquid-y', `${state.offsetY.toFixed(2)}px`);
            state.element.style.setProperty('--liquid-scale', state.scale.toFixed(4));

            const selected = transitionState?.index === state.index;
            const centerX = state.base.x + state.offsetX / viewportWidth;
            const centerY = state.base.y - state.offsetY / viewportHeight;
            const renderCenterX = selected ? centerX + (0.5 - centerX) * transition : centerX;
            const renderCenterY = selected ? centerY + (0.5 - centerY) * transition : centerY;
            const width = selected
                ? state.base.z * state.scale + (1.24 - state.base.z * state.scale) * transition
                : state.base.z * state.scale;
            const height = selected
                ? state.base.w * state.scale + (1.24 - state.base.w * state.scale) * transition
                : state.base.w * state.scale;
            const opacity = selected ? 1 : 1 - transition;
            const planePadding = 1.18;

            state.mesh.position.set(renderCenterX * 2 - 1, renderCenterY * 2 - 1, 0);
            state.mesh.scale.set(width * planePadding, height * planePadding, 1);
            state.uniforms.uTime.value = elapsedTime;
            state.uniforms.uHover.value = state.hover;
            state.uniforms.uExpand.value = selected ? transition : 0;
            state.uniforms.uOpacity.value = opacity;
            state.uniforms.uPointerActive.value = pointer.active ? 1 : 0;
            state.uniforms.uPointer.value.set(
                (pointer.currentX - renderCenterX) / Math.max(width * planePadding, 0.001),
                (pointer.currentY - renderCenterY) / Math.max(height * planePadding, 0.001),
            );

            backgroundUniforms.uBodies.value[state.index].set(
                centerX,
                centerY,
                state.base.z * 0.47,
                state.base.w * 0.47,
            );
        });
    };

    const render = (time = 0) => {
        if (!running) {
            return;
        }

        const targetFrameInterval = 1000 / 30;

        if (time - lastFrameTime < targetFrameInterval) {
            frameId = window.requestAnimationFrame(render);

            return;
        }

        const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0.016;

        lastFrameTime = time;
        elapsedTime += reducedMotion ? 0 : delta;
        pointer.currentX += (pointer.targetX - pointer.currentX) * 0.07;
        pointer.currentY += (pointer.targetY - pointer.currentY) * 0.07;
        backgroundUniforms.uPointer.value.set(pointer.currentX, pointer.currentY);
        backgroundUniforms.uPointerActive.value += ((pointer.active ? 1 : 0) - backgroundUniforms.uPointerActive.value) * 0.07;
        backgroundUniforms.uTime.value = elapsedTime;
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

    const handleContextLost = (event) => {
        event.preventDefault();
        running = false;
        root.classList.remove('is-webgl-ready');
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
        state.handleEnter = () => setHover(state.index);
        state.handleLeave = () => setHover(-1);
        state.element.addEventListener('pointerenter', state.handleEnter);
        state.element.addEventListener('pointerleave', state.handleLeave);
        state.element.addEventListener('focusin', state.handleEnter);
        state.element.addEventListener('focusout', state.handleLeave);
    });

    if (finePointer && !reducedMotion) {
        root.addEventListener('pointermove', handlePointerMove, { passive: true });
        root.addEventListener('pointerleave', handlePointerLeave);
    }

    canvas.addEventListener('webglcontextlost', handleContextLost);

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
                duration: 820,
            };
            setHover(selected.index);

            return transitionState.duration;
        },

        destroy() {
            running = false;
            window.cancelAnimationFrame(frameId);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', measure);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            canvas.removeEventListener('webglcontextlost', handleContextLost);

            if (finePointer && !reducedMotion) {
                root.removeEventListener('pointermove', handlePointerMove);
                root.removeEventListener('pointerleave', handlePointerLeave);
            }

            bodyStates.forEach((state) => {
                state.element.removeEventListener('pointerenter', state.handleEnter);
                state.element.removeEventListener('pointerleave', state.handleLeave);
                state.element.removeEventListener('focusin', state.handleEnter);
                state.element.removeEventListener('focusout', state.handleLeave);
                state.material.dispose();
            });

            geometry.dispose();
            backgroundMaterial.dispose();
            renderer.dispose();
        },
    };
};
