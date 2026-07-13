const vertexShaderSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision highp float;

    varying vec2 vUv;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uMotion;
    uniform vec3 uPointer;
    uniform vec3 uHover;
    uniform vec4 uBodies[3];

    vec3 ellipseSample(vec2 point, vec2 center, vec2 radius) {
        vec2 delta = (point - center) / radius;
        float value = exp(-dot(delta, delta) * 2.35);

        return vec3(value, -4.7 * value * delta / radius);
    }

    vec3 bodySample(vec2 point, vec4 body, float index) {
        vec2 radius = max(body.zw, vec2(0.0005));
        vec2 local = (point - body.xy) / radius;
        float visibility = step(0.004, body.z) * step(0.004, body.w);
        float phase = uTime * 0.075 + index * 2.31;
        float amount = uMotion * 0.026;

        vec2 shiftA = vec2(sin(phase), cos(phase * 0.83)) * amount;
        vec2 shiftB = vec2(cos(phase * 0.71), sin(phase * 1.07)) * amount;
        vec2 shiftC = vec2(sin(phase * 0.59), cos(phase * 1.19)) * amount;

        vec3 sample = vec3(0.0);
        sample += ellipseSample(local, vec2(-0.30, -0.08) + shiftA, vec2(0.72, 0.66)) * 0.70;
        sample += ellipseSample(local, vec2(0.29, 0.02) + shiftB, vec2(0.73, 0.72)) * 0.74;
        sample += ellipseSample(local, vec2(0.01, 0.20) + shiftC, vec2(0.87, 0.70)) * 0.72;
        sample += ellipseSample(local, vec2(-0.02, -0.27) - shiftB * 0.45, vec2(0.56, 0.54)) * 0.33;
        sample.yz /= radius;

        return sample * visibility;
    }

    void main() {
        vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
        vec3 projects = bodySample(uv, uBodies[0], 0.0);
        vec3 about = bodySample(uv, uBodies[1], 1.0);
        vec3 contact = bodySample(uv, uBodies[2], 2.0);
        vec3 fields = vec3(projects.x, about.x, contact.x);
        float field = fields.x + fields.y + fields.z;
        vec2 gradient = projects.yz + about.yz + contact.yz;

        float fill = smoothstep(0.088, 0.132, field);
        float depth = smoothstep(0.11, 1.42, field);
        float boundary = smoothstep(0.085, 0.14, field) * (1.0 - smoothstep(0.18, 0.46, field));
        float contour = 1.0 - smoothstep(0.0, 0.044, abs(field - 0.118));
        vec3 normal = normalize(vec3(-gradient * 0.11, 0.72 + depth * 0.50));
        vec3 viewDirection = vec3(0.0, 0.0, 1.0);

        vec3 keyLight = normalize(vec3(-0.52, 0.68, 0.82));
        vec3 pinkLight = normalize(vec3(0.78, -0.42, 0.66));
        vec3 blueLight = normalize(vec3(-0.78, -0.18, 0.58));
        float keySpecular = pow(max(dot(reflect(-keyLight, normal), viewDirection), 0.0), 72.0);
        float pinkSpecular = pow(max(dot(reflect(-pinkLight, normal), viewDirection), 0.0), 54.0);
        float blueSpecular = pow(max(dot(reflect(-blueLight, normal), viewDirection), 0.0), 62.0);
        float fresnel = pow(1.0 - max(normal.z, 0.0), 2.1);
        float diffuse = max(dot(normal, keyLight), 0.0);

        vec3 weights = fields / max(field, 0.0001);
        float hover = dot(weights, uHover);
        float pointerDistance = distance(uv, uPointer.xy);
        float pointerLight = exp(-pointerDistance * pointerDistance * 24.0) * uPointer.z;

        float flow = sin(
            uv.x * 12.0
            + uv.y * 19.0
            + normal.x * 4.5
            - normal.y * 3.5
            + uTime * 0.14
        ) * 0.5 + 0.5;
        flow = pow(smoothstep(0.58, 1.0, flow), 2.4) * boundary;

        vec3 background = vec3(0.0015, 0.0010, 0.0060);
        float vignette = smoothstep(0.92, 0.12, length((uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0)));
        background += vec3(0.0030, 0.0015, 0.0090) * vignette;

        vec3 liquid = mix(vec3(0.005, 0.002, 0.022), vec3(0.055, 0.010, 0.175), depth * 0.72);
        liquid += vec3(0.030, 0.012, 0.080) * diffuse * 0.48;
        liquid += vec3(0.42, 0.36, 1.00) * fresnel * (0.26 + boundary * 0.74);
        liquid += vec3(0.90, 0.78, 1.00) * keySpecular * 1.12;
        liquid += vec3(1.00, 0.20, 0.67) * pinkSpecular * 0.74;
        liquid += vec3(0.20, 0.34, 1.00) * blueSpecular * 0.68;
        liquid += vec3(0.34, 0.15, 0.72) * flow * 0.18;
        liquid += vec3(0.38, 0.20, 0.78) * pointerLight * boundary * 0.24;
        liquid += vec3(0.34, 0.18, 0.82) * contour * 0.28;
        liquid += vec3(0.92, 0.76, 1.00) * contour * keySpecular * 0.72;
        liquid *= 1.0 + hover * 0.11;

        gl_FragColor = vec4(mix(background, liquid, fill), 1.0);
    }
`;

const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader compilation error.';
        gl.deleteShader(shader);
        throw new Error(message);
    }

    return shader;
};

const createProgram = (gl) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program) ?? 'Unknown shader link error.';
        gl.deleteProgram(program);
        throw new Error(message);
    }

    return program;
};

export const createLiquidRenderer = (canvas) => {
    const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        desynchronized: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        stencil: false,
    });

    if (!gl) {
        throw new Error('WebGL is not available.');
    }

    const program = createProgram(gl);
    const positionBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    const uniforms = {
        bodies: gl.getUniformLocation(program, 'uBodies'),
        hover: gl.getUniformLocation(program, 'uHover'),
        motion: gl.getUniformLocation(program, 'uMotion'),
        pointer: gl.getUniformLocation(program, 'uPointer'),
        resolution: gl.getUniformLocation(program, 'uResolution'),
        time: gl.getUniformLocation(program, 'uTime'),
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        3, -1,
        -1, 3,
    ]), gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let width = 1;
    let height = 1;

    const resize = (cssWidth, cssHeight, pixelRatio) => {
        width = Math.max(1, Math.round(cssWidth * pixelRatio));
        height = Math.max(1, Math.round(cssHeight * pixelRatio));

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }
    };

    const render = ({ bodies, hover, motion, pointer, time }) => {
        gl.useProgram(program);
        gl.uniform2f(uniforms.resolution, width, height);
        gl.uniform1f(uniforms.time, time);
        gl.uniform1f(uniforms.motion, motion);
        gl.uniform3fv(uniforms.pointer, pointer);
        gl.uniform3fv(uniforms.hover, hover);
        gl.uniform4fv(uniforms.bodies, bodies);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const destroy = () => {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
    };

    return { destroy, gl, render, resize };
};
