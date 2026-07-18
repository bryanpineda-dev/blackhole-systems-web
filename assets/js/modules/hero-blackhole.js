import * as THREE from 'three/webgpu';
import {
    pass,
    uniform,
    Fn,
    Loop,
    Break,
    If,
    screenUV,
    vec2,
    vec3,
    float,
    length,
    normalize,
    dot,
    cross,
    sin,
    cos,
    atan,
    asin,
    sqrt,
    pow,
    clamp,
    mix,
    smoothstep,
    step,
    floor,
    fract,
    sign
} from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

const HERO_SELECTOR = '[data-hero-blackhole]';
const THREE_DPR_CAP = 1.35;
const CAMERA_PROFILES = [
    { maxWidth: 520, position: [0, -1.85, -24.5], target: [0, 0, 0] },
    { maxWidth: 820, position: [0, -1.9, -21.5], target: [0, 0, 0] },
    { maxWidth: Infinity, position: [0, -2, -18], target: [0, 0, 0] }
];

const config = {
    blackHoleMass: 0.4,
    diskInnerRadius: 4.1,
    diskOuterRadius: 14.5,
    diskTemperature: 49.78,
    temperatureFalloff: 5.22,
    diskBrightness: 3.35,
    diskRotationSpeed: -8.7,
    turbulenceScale: 1.81,
    turbulenceStretch: 0.75,
    turbulenceSharpness: 7.4,
    turbulenceCycleTime: 5,
    turbulenceLacunarity: 2.5,
    turbulencePersistence: 0.8,
    diskEdgeSoftnessInner: 0.18,
    diskEdgeSoftnessOuter: 0.5,
    gravitationalLensing: 2.4,
    dopplerStrength: 1.0,
    stepSize: 1,
    starsEnabled: true,
    starBackgroundColor: '#000000',
    starDensity: 0.07,
    starSize: 1.05,
    starBrightness: 0.075,
    starFlowSpeed: 0.42,
    starFlowStrength: 0.55,
    starFlowTrail: 0.34,
    nebulaEnabled: false,
    nebula1Scale: 2,
    nebula1Density: 0.42,
    nebula1Brightness: 0.018,
    nebula1Color: '#d8dee9',
    nebula2Scale: 5.5,
    nebula2Density: 0.04,
    nebula2Brightness: 0.032,
    nebula2Color: '#7b8494',
    bloomStrength: 0.48,
    bloomRadius: 0,
    bloomThreshold: 0.52
};

const shouldSkipHeroBlackhole = () => {
    return !('gpu' in navigator);
};

const getStageSize = (stage) => {
    const rect = stage.getBoundingClientRect();
    return {
        width: Math.max(1, Math.round(rect.width || window.innerWidth)),
        height: Math.max(1, Math.round(rect.height || window.innerHeight))
    };
};

const getCameraProfile = (width) => {
    return CAMERA_PROFILES.find((profile) => width <= profile.maxWidth) || CAMERA_PROFILES[CAMERA_PROFILES.length - 1];
};

const createBlackholeRenderer = async (stage, onReady) => {
    const { width, height } = getStageSize(stage);

    const hash21 = Fn(([p]) => {
        const n = sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453);
        return fract(n);
    });

    const hash31 = Fn(([p]) => {
        const n = sin(dot(p, vec3(127.1, 311.7, 74.7))).mul(43758.5453);
        return fract(n);
    });

    const hash22 = Fn(([p]) => {
        const px = fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453));
        const py = fract(sin(dot(p, vec2(269.5, 183.3))).mul(43758.5453));
        return vec2(px, py);
    });

    const noise3D = Fn(([p]) => {
        const i = floor(p);
        const f = fract(p);
        const u = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));
        const a = hash31(i);
        const b = hash31(i.add(vec3(1, 0, 0)));
        const c = hash31(i.add(vec3(0, 1, 0)));
        const d = hash31(i.add(vec3(1, 1, 0)));
        const e = hash31(i.add(vec3(0, 0, 1)));
        const f2 = hash31(i.add(vec3(1, 0, 1)));
        const g = hash31(i.add(vec3(0, 1, 1)));
        const h = hash31(i.add(vec3(1, 1, 1)));
        return mix(
            mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
            mix(mix(e, f2, u.x), mix(g, h, u.x), u.y),
            u.z
        );
    });

    const fbm = Fn(([p, lacunarity, persistence]) => {
        const value = float(0.0).toVar();
        const amplitude = float(0.5).toVar();
        const pos = p.toVar();
        Loop(4, () => {
            value.addAssign(noise3D(pos).mul(amplitude));
            pos.mulAssign(lacunarity);
            amplitude.mulAssign(persistence);
        });
        return value;
    });

    const blackbodyColor = Fn(([tempK]) => {
        const t = clamp(tempK.sub(1000.0).div(9000.0), float(0.0), float(1.0));
        const deepBlue = vec3(0.0, 0.02, 0.13);
        const brandBlue = vec3(0.0, 0.384, 1.0);
        const vividBlue = vec3(0.0, 0.12, 0.9);
        const brandPurple = vec3(0.18, 0.035, 0.48);
        const coldHighlight = vec3(0.0, 0.384, 1.0);
        const blueBand = mix(deepBlue, vividBlue, smoothstep(float(0.0), float(0.42), t));
        const brandBand = mix(blueBand, brandBlue, smoothstep(float(0.18), float(0.68), t));
        const purpleTrace = mix(brandBand, brandPurple, smoothstep(float(0.44), float(0.84), t).mul(0.08));
        return mix(purpleTrace, coldHighlight, smoothstep(float(0.9), float(1.0), t).mul(0.18));
    });

    const uniforms = {
        blackHoleMass: uniform(config.blackHoleMass),
        diskInnerRadius: uniform(config.diskInnerRadius),
        diskOuterRadius: uniform(config.diskOuterRadius),
        diskTemperature: uniform(config.diskTemperature),
        temperatureFalloff: uniform(config.temperatureFalloff),
        diskBrightness: uniform(config.diskBrightness),
        diskRotationSpeed: uniform(config.diskRotationSpeed),
        turbulenceScale: uniform(config.turbulenceScale),
        turbulenceStretch: uniform(config.turbulenceStretch),
        turbulenceSharpness: uniform(config.turbulenceSharpness),
        turbulenceCycleTime: uniform(config.turbulenceCycleTime),
        turbulenceLacunarity: uniform(config.turbulenceLacunarity),
        turbulencePersistence: uniform(config.turbulencePersistence),
        diskEdgeSoftnessInner: uniform(config.diskEdgeSoftnessInner),
        diskEdgeSoftnessOuter: uniform(config.diskEdgeSoftnessOuter),
        gravitationalLensing: uniform(config.gravitationalLensing),
        dopplerStrength: uniform(config.dopplerStrength),
        stepSize: uniform(config.stepSize),
        starsEnabled: uniform(config.starsEnabled ? 1.0 : 0.0),
        starBackgroundColor: uniform(new THREE.Color(config.starBackgroundColor)),
        starDensity: uniform(config.starDensity),
        starSize: uniform(config.starSize),
        starBrightness: uniform(config.starBrightness),
        starFlowSpeed: uniform(config.starFlowSpeed),
        starFlowStrength: uniform(config.starFlowStrength),
        starFlowTrail: uniform(config.starFlowTrail),
        nebulaEnabled: uniform(config.nebulaEnabled ? 1.0 : 0.0),
        nebula1Scale: uniform(config.nebula1Scale),
        nebula1Density: uniform(config.nebula1Density),
        nebula1Brightness: uniform(config.nebula1Brightness),
        nebula1Color: uniform(new THREE.Color(config.nebula1Color)),
        nebula2Scale: uniform(config.nebula2Scale),
        nebula2Density: uniform(config.nebula2Density),
        nebula2Brightness: uniform(config.nebula2Brightness),
        nebula2Color: uniform(new THREE.Color(config.nebula2Color)),
        time: uniform(0),
        resolution: uniform(new THREE.Vector2(width, height)),
        cameraPosition: uniform(new THREE.Vector3(0, 5, 20)),
        cameraTarget: uniform(new THREE.Vector3(0, 0, 0))
    };

    const starField = Fn(([rayDir]) => {
        const theta = atan(rayDir.z, rayDir.x);
        const phi = asin(clamp(rayDir.y, float(-1.0), float(1.0)));
        const uv = screenUV.sub(0.5).mul(2.0);
        const aspect = uniforms.resolution.x.div(uniforms.resolution.y);
        const screenPos = vec2(uv.x.mul(aspect), uv.y);
        const radialDistance = length(screenPos);
        const radialDir = normalize(screenPos.add(vec2(0.0001, 0.0001)));
        const pullFalloff = smoothstep(float(1.35), float(0.12), radialDistance).mul(uniforms.starFlowStrength);
        const flowPhase = fract(uniforms.time.mul(uniforms.starFlowSpeed).add(radialDistance.mul(1.6)));
        const inwardOffset = radialDir.mul(flowPhase.sub(0.5)).mul(pullFalloff).mul(0.16);
        const gridScale = float(60.0).div(uniforms.starSize);
        const scaledCoord = vec2(theta, phi).sub(inwardOffset).mul(gridScale);
        const cell = floor(scaledCoord);
        const cellUV = fract(scaledCoord);
        const cellHash = hash21(cell);
        const starProb = step(float(1.0).sub(uniforms.starDensity), cellHash);
        const starPos = hash22(cell.add(42.0)).mul(0.8).add(0.1);
        const localStarPos = cellUV.sub(starPos);
        const distToStar = length(localStarPos);
        const baseSizeVar = hash21(cell.add(100.0)).mul(0.03).add(0.01);
        const finalStarSize = baseSizeVar.mul(uniforms.starSize);
        const starCore = smoothstep(finalStarSize, float(0.0), distToStar);
        const tailDir = normalize(inwardOffset.add(vec2(0.0001, 0.0)));
        const tailSampleA = length(localStarPos.add(tailDir.mul(finalStarSize.mul(2.4))));
        const tailSampleB = length(localStarPos.add(tailDir.mul(finalStarSize.mul(4.8))));
        const starGlow = smoothstep(finalStarSize.mul(3.0), float(0.0), distToStar).mul(0.3);
        const starTrail = smoothstep(finalStarSize.mul(1.35), float(0.0), tailSampleA).mul(0.5)
            .add(smoothstep(finalStarSize.mul(1.8), float(0.0), tailSampleB).mul(0.24))
            .mul(uniforms.starFlowTrail)
            .mul(pullFalloff);
        const starIntensity = starCore.add(starGlow).add(starTrail).mul(starProb);
        const colorTemp = hash21(cell.add(200.0));
        const starColor = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.95, 0.8), colorTemp);
        return starColor.mul(starIntensity).mul(uniforms.starBrightness);
    });

    const nebulaField = Fn(([rayDir]) => {
        const noisePos1 = rayDir.mul(uniforms.nebula1Scale);
        const n1 = fbm(noisePos1, float(2.0), float(0.5)).mul(2.0).sub(1.0);
        const layer1 = clamp(n1.add(uniforms.nebula1Density), float(0.0), float(1.0));
        const color1 = uniforms.nebula1Color.mul(layer1).mul(uniforms.nebula1Brightness);
        const noisePos2 = rayDir.mul(uniforms.nebula2Scale);
        const n2 = fbm(noisePos2, float(2.0), float(0.5)).mul(2.0).sub(1.0);
        const layer2 = clamp(n2.add(uniforms.nebula2Density), float(0.0), float(1.0));
        const color2 = uniforms.nebula2Color.mul(layer2).mul(uniforms.nebula2Brightness);
        return color1.add(color2);
    });

    const accretionDiskColor = Fn(([hitR, hitAngle, time, rayDir]) => {
        const innerR = uniforms.diskInnerRadius;
        const outerR = uniforms.diskOuterRadius;
        const normR = clamp(hitR.sub(innerR).div(outerR.sub(innerR)), float(0.0), float(1.0));
        const peakTempK = uniforms.diskTemperature.mul(1000.0);
        const outerTempK = float(1500.0);
        const tempFalloff = pow(innerR.div(hitR), uniforms.temperatureFalloff);
        const tempK = mix(outerTempK, peakTempK, tempFalloff);
        const diskColor = blackbodyColor(tempK).toVar('diskColor');
        const rotationSign = sign(uniforms.diskRotationSpeed);
        const velocityDir = vec3(
            sin(hitAngle).mul(rotationSign),
            0,
            cos(hitAngle).negate().mul(rotationSign)
        );
        const velocityMagnitude = float(1.0).div(sqrt(hitR.div(innerR)));
        const beta = velocityMagnitude.mul(0.3);
        const cosTheta = dot(velocityDir, rayDir);
        const dopplerFactor = float(1.0).div(float(1.0).sub(beta.mul(cosTheta)));
        const dopplerBoost = pow(dopplerFactor, float(3.0).mul(uniforms.dopplerStrength));
        diskColor.mulAssign(dopplerBoost);
        const edgeFalloff = smoothstep(float(0.0), uniforms.diskEdgeSoftnessInner, normR)
            .mul(smoothstep(float(1.0), float(1.0).sub(uniforms.diskEdgeSoftnessOuter), normR));
        const ringOpacity = float(1.0).toVar('ringOpacity');
        const cycleLength = uniforms.turbulenceCycleTime;
        const cyclicTime = time.mod(cycleLength);
        const blendFactor = cyclicTime.div(cycleLength);
        const keplerianPhase1 = cyclicTime.mul(uniforms.diskRotationSpeed).div(pow(hitR, float(1.5)));
        const keplerianPhase2 = cyclicTime.add(cycleLength).mul(uniforms.diskRotationSpeed).div(pow(hitR, float(1.5)));
        const rotatedAngle1 = hitAngle.add(keplerianPhase1);
        const rotatedAngle2 = hitAngle.add(keplerianPhase2);
        const noiseCoord1 = vec3(
            hitR.mul(uniforms.turbulenceScale),
            cos(rotatedAngle1).div(uniforms.turbulenceStretch.max(0.1)),
            sin(rotatedAngle1).div(uniforms.turbulenceStretch.max(0.1))
        );
        const noiseCoord2 = vec3(
            hitR.mul(uniforms.turbulenceScale),
            cos(rotatedAngle2).div(uniforms.turbulenceStretch.max(0.1)),
            sin(rotatedAngle2).div(uniforms.turbulenceStretch.max(0.1))
        );
        const turbulence1 = fbm(noiseCoord1, uniforms.turbulenceLacunarity, uniforms.turbulencePersistence);
        const turbulence2 = fbm(noiseCoord2, uniforms.turbulenceLacunarity, uniforms.turbulencePersistence);
        const turbulence = mix(turbulence2, turbulence1, blendFactor);
        ringOpacity.assign(pow(clamp(turbulence, float(0.0), float(1.0)), uniforms.turbulenceSharpness));
        const finalOpacity = ringOpacity.mul(edgeFalloff);
        const finalColor = diskColor.mul(uniforms.diskBrightness);
        return vec3(finalColor.x, finalColor.y, finalColor.z).mul(finalOpacity);
    });

    const blackHoleShader = Fn(() => {
        const rs = uniforms.blackHoleMass.mul(2.0);
        const uv = screenUV.sub(0.5).mul(2.0);
        const aspect = uniforms.resolution.x.div(uniforms.resolution.y);
        const screenPos = vec2(uv.x.mul(aspect), uv.y);
        const camPos = uniforms.cameraPosition;
        const camTarget = uniforms.cameraTarget;
        const camForward = normalize(camTarget.sub(camPos));
        const worldUp = vec3(0.0, 1.0, 0.0);
        const camRight = normalize(cross(worldUp, camForward));
        const camUp = cross(camForward, camRight);
        const fov = float(1.0);
        const rayDir = normalize(
            camForward.add(camRight.mul(screenPos.x).mul(fov)).add(camUp.mul(screenPos.y).mul(fov))
        ).toVar('rayDir');
        const rayPos = camPos.toVar('rayPos');
        const prevPos = camPos.toVar('prevPos');
        const color = vec3(0.0, 0.0, 0.0).toVar('color');
        const alpha = float(0.0).toVar('alpha');
        const escaped = float(0.0).toVar('escaped');
        const captured = float(0.0).toVar('captured');
        const innerR = uniforms.diskInnerRadius;
        const outerR = uniforms.diskOuterRadius;

        Loop(32, () => {
            If(escaped.greaterThan(0.5).or(captured.greaterThan(0.5)).or(alpha.greaterThan(0.99)), () => {
                Break();
            });
            prevPos.assign(rayPos);
            const r = length(rayPos);
            If(r.lessThan(rs.mul(1.01)), () => {
                captured.assign(1.0);
                Break();
            });
            If(r.greaterThan(100.0), () => {
                escaped.assign(1.0);
                Break();
            });
            const toCenter = rayPos.negate().div(r);
            const bendStrength = rs.div(r.mul(r)).mul(uniforms.stepSize).mul(uniforms.gravitationalLensing);
            rayDir.addAssign(toCenter.mul(bendStrength));
            rayDir.assign(normalize(rayDir));
            rayPos.addAssign(rayDir.mul(uniforms.stepSize));
            const crossedPlane = prevPos.y.mul(rayPos.y).lessThan(0.0);
            If(crossedPlane.and(alpha.lessThan(0.99)), () => {
                const t = prevPos.y.negate().div(rayPos.y.sub(prevPos.y));
                const hitPos = mix(prevPos, rayPos, t);
                const hitR = sqrt(hitPos.x.mul(hitPos.x).add(hitPos.z.mul(hitPos.z)));
                const inDisk = hitR.greaterThan(innerR).and(hitR.lessThan(outerR));
                If(inDisk, () => {
                    const hitAngle = atan(hitPos.z, hitPos.x);
                    const diskResult = accretionDiskColor(hitR, hitAngle, uniforms.time, rayDir);
                    const remainingAlpha = float(1.0).sub(alpha);
                    color.addAssign(diskResult.mul(remainingAlpha));
                    alpha.addAssign(length(diskResult).mul(0.08).mul(remainingAlpha));
                });
            });
        });

        If(captured.lessThan(0.5), () => {
            const bgColor = uniforms.starBackgroundColor.toVar('bgColor');
            If(uniforms.starsEnabled.greaterThan(0.5), () => {
                bgColor.addAssign(starField(rayDir));
            });
            If(uniforms.nebulaEnabled.greaterThan(0.5), () => {
                bgColor.addAssign(nebulaField(rayDir));
            });
            color.addAssign(bgColor.mul(float(1.0).sub(alpha)));
        });

        return pow(color, vec3(1.0 / 2.2));
    });

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);

    const applyCameraProfile = (stageWidth) => {
        const profile = getCameraProfile(stageWidth);
        camera.position.set(...profile.position);
        camera.lookAt(...profile.target);
    };

    applyCameraProfile(width);

    const renderer = new THREE.WebGPURenderer({ antialias: false, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, THREE_DPR_CAP));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.className = 'hero-blackhole-canvas';

    const geometry = new THREE.SphereGeometry(100, 32, 32);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicNodeMaterial();
    material.colorNode = blackHoleShader();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    let postProcessing = null;
    let frameId = null;
    let lastFrameTime = performance.now();
    let isVisible = true;
    let isDestroyed = false;
    let didRender = false;

    const updateCamera = () => {
        uniforms.cameraPosition.value.copy(camera.position);
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.quaternion);
        uniforms.cameraTarget.value.copy(camera.position.clone().add(direction.multiplyScalar(10)));
    };

    const renderFrame = () => {
        if (isDestroyed) {
            return;
        }

        frameId = requestAnimationFrame(renderFrame);

        if (!isVisible || document.hidden) {
            lastFrameTime = performance.now();
            return;
        }

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.033);
        lastFrameTime = currentTime;
        uniforms.time.value += deltaTime;
        updateCamera();

        try {
            if (postProcessing) {
                postProcessing.render();
            } else {
                renderer.render(scene, camera);
            }

            if (!didRender) {
                didRender = true;
                onReady?.();
            }
        } catch (error) {
            isDestroyed = true;
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            stage.dispatchEvent(new CustomEvent('blackhole-render-error', { detail: error }));
        }
    };

    const resize = () => {
        const nextSize = getStageSize(stage);
        applyCameraProfile(nextSize.width);
        camera.aspect = nextSize.width / nextSize.height;
        camera.updateProjectionMatrix();
        renderer.setSize(nextSize.width, nextSize.height);
        uniforms.resolution.value.set(nextSize.width, nextSize.height);
    };

    await renderer.init();
    stage.appendChild(renderer.domElement);
    postProcessing = new THREE.PostProcessing(renderer);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode();
    const bloomPass = bloom(scenePassColor);
    bloomPass.threshold.value = config.bloomThreshold;
    bloomPass.strength.value = config.bloomStrength;
    bloomPass.radius.value = config.bloomRadius;
    postProcessing.outputNode = scenePassColor.add(bloomPass);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver((entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
    }, { threshold: 0.01 });
    intersectionObserver.observe(stage);

    renderFrame();

    return {
        destroy() {
            isDestroyed = true;
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            renderer.dispose();
            stage.replaceChildren();
        }
    };
};

const initHeroBlackhole = async () => {
    const stage = document.querySelector(HERO_SELECTOR);
    const hero = stage?.closest('.hero-section');

    if (!stage || !hero || shouldSkipHeroBlackhole()) {
        return;
    }

    try {
        await createBlackholeRenderer(stage, () => {
            hero.classList.add('is-webgpu-ready');
        });
        stage.addEventListener('blackhole-render-error', (event) => {
            stage.replaceChildren();
            hero.classList.remove('is-webgpu-ready');
            console.warn('[Blackhole Systems] WebGPU hero render fallback active:', event.detail);
        }, { once: true });
    } catch (error) {
        stage.replaceChildren();
        hero.classList.remove('is-webgpu-ready');
        console.warn('[Blackhole Systems] WebGPU hero fallback active:', error);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroBlackhole, { once: true });
} else {
    initHeroBlackhole();
}
