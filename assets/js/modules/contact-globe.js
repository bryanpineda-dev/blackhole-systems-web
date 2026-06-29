/**
 * Contact globe background.
 * Renders a restrained wireframe Earth on canvas using projected sphere lines.
 */
(function (BH) {
    'use strict';

    const DEG = Math.PI / 180;
    const TAU = Math.PI * 2;
    const FRAME_INTERVAL = 1000 / 30;

    const toRgba = (rgb, alpha) => `rgba(${rgb}, ${alpha})`;

    const toSpherePoint = (latDeg, lonDeg) => {
        const lat = latDeg * DEG;
        const lon = lonDeg * DEG;
        const cosLat = Math.cos(lat);

        return {
            x: cosLat * Math.sin(lon),
            y: -Math.sin(lat),
            z: cosLat * Math.cos(lon)
        };
    };

    const buildLatitude = (latDeg) => {
        const line = [];

        for (let lon = -180; lon <= 180; lon += 3) {
            line.push(toSpherePoint(latDeg, lon));
        }

        return line;
    };

    const buildMeridian = (lonDeg) => {
        const line = [];

        for (let lat = -78; lat <= 78; lat += 3) {
            line.push(toSpherePoint(lat, lonDeg));
        }

        return line;
    };

    const gridLines = [
        ...[-60, -40, -20, 0, 20, 40, 60].map((lat) => ({
            kind: lat === 0 ? 'equator' : 'latitude',
            points: buildLatitude(lat)
        })),
        ...[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180].map((lon) => ({
            kind: 'meridian',
            points: buildMeridian(lon)
        }))
    ];

    BH.initContactGlobe = function initContactGlobe() {
        const canvas = document.querySelector('[data-contact-globe]');
        if (!canvas) return;

        const context = canvas.getContext('2d', { alpha: true });
        if (!context) return;

        const rootStyles = getComputedStyle(document.documentElement);
        const blueRgb = rootStyles.getPropertyValue('--primary-blue-rgb').trim() || '0, 116, 255';
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const state = {
            centerX: 0,
            centerY: 0,
            dpr: 1,
            frame: 0,
            height: 0,
            isVisible: false,
            lastFrameTime: 0,
            radius: 0,
            width: 0
        };

        const rotatePoint = (point, rotationY) => {
            const tiltX = -16 * DEG;
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);
            const cosX = Math.cos(tiltX);
            const sinX = Math.sin(tiltX);

            const x = point.x * cosY + point.z * sinY;
            const z = -point.x * sinY + point.z * cosY;
            const y = point.y;

            return {
                x,
                y: y * cosX - z * sinX,
                z: y * sinX + z * cosX
            };
        };

        const projectPoint = (point) => ({
            x: state.centerX + point.x * state.radius,
            y: state.centerY + point.y * state.radius,
            z: point.z
        });

        const drawSegmentedLine = (line, rotationY, options) => {
            context.save();
            context.lineWidth = options.width;
            context.strokeStyle = options.color;
            context.setLineDash(options.dash || []);
            context.lineCap = 'round';
            context.lineJoin = 'round';

            let active = false;

            context.beginPath();

            line.forEach((point) => {
                const projected = projectPoint(rotatePoint(point, rotationY));
                const isVisible = options.front ? projected.z >= options.depth : projected.z < options.depth;

                if (!isVisible) {
                    active = false;
                    return;
                }

                if (!active) {
                    context.moveTo(projected.x, projected.y);
                    active = true;
                    return;
                }

                context.lineTo(projected.x, projected.y);
            });

            context.stroke();
            context.restore();
        };

        const drawGlobe = (time = 0) => {
            const width = state.width;
            const height = state.height;
            const radius = state.radius;
            const centerX = state.centerX;
            const centerY = state.centerY;
            const rotationY = -42 * DEG + (prefersReducedMotion ? 0 : time * 0.000035);

            context.clearRect(0, 0, width, height);

            const outerGlow = context.createRadialGradient(
                centerX,
                centerY - radius * 0.22,
                radius * 0.18,
                centerX,
                centerY,
                radius * 1.2
            );

            outerGlow.addColorStop(0, toRgba(blueRgb, 0.09));
            outerGlow.addColorStop(0.48, toRgba(blueRgb, 0.035));
            outerGlow.addColorStop(1, toRgba(blueRgb, 0));
            context.fillStyle = outerGlow;
            context.fillRect(0, 0, width, height);

            context.save();
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, TAU);
            context.clip();

            const surface = context.createRadialGradient(
                centerX - radius * 0.28,
                centerY - radius * 0.35,
                radius * 0.08,
                centerX,
                centerY,
                radius
            );

            surface.addColorStop(0, toRgba(blueRgb, 0.1));
            surface.addColorStop(0.52, toRgba(blueRgb, 0.035));
            surface.addColorStop(1, 'rgba(2, 8, 18, 0.02)');
            context.fillStyle = surface;
            context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

            gridLines.forEach((line) => {
                drawSegmentedLine(line.points, rotationY, {
                    color: toRgba(blueRgb, line.kind === 'equator' ? 0.12 : 0.075),
                    dash: [5, 12],
                    depth: 0.02,
                    front: false,
                    width: line.kind === 'equator' ? 0.9 : 0.75
                });
            });

            gridLines.forEach((line) => {
                drawSegmentedLine(line.points, rotationY, {
                    color: line.kind === 'equator' ? 'rgba(255, 255, 255, 0.16)' : toRgba(blueRgb, 0.24),
                    dash: [],
                    depth: -0.03,
                    front: true,
                    width: line.kind === 'equator' ? 1.05 : 0.9
                });
            });

            const shade = context.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
            shade.addColorStop(0, 'rgba(0, 0, 0, 0.34)');
            shade.addColorStop(0.54, 'rgba(0, 0, 0, 0)');
            shade.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
            context.fillStyle = shade;
            context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

            context.restore();

            context.save();
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, TAU);
            context.strokeStyle = toRgba(blueRgb, 0.38);
            context.lineWidth = 1.2;
            context.stroke();

            context.beginPath();
            context.arc(centerX, centerY, radius * 0.992, Math.PI * 1.08, Math.PI * 1.78);
            context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            context.lineWidth = 0.9;
            context.stroke();
            context.restore();
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
            const width = Math.max(1, Math.round(rect.width));
            const height = Math.max(1, Math.round(rect.height));

            if (state.width === width && state.height === height && state.dpr === dpr) return;

            state.width = width;
            state.height = height;
            state.dpr = dpr;
            state.centerX = width / 2;
            state.centerY = height / 2;
            state.radius = Math.min(width, height) * 0.38;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawGlobe();
        };

        const render = (time) => {
            state.frame = 0;

            if (!state.isVisible) return;

            if (time - state.lastFrameTime >= FRAME_INTERVAL) {
                state.lastFrameTime = time;
                drawGlobe(time);
            }

            if (!prefersReducedMotion) {
                state.frame = window.requestAnimationFrame(render);
            }
        };

        const start = () => {
            state.isVisible = true;
            resize();

            if (prefersReducedMotion || state.frame) {
                drawGlobe();
                return;
            }

            state.frame = window.requestAnimationFrame(render);
        };

        const stop = () => {
            state.isVisible = false;

            if (state.frame) {
                window.cancelAnimationFrame(state.frame);
                state.frame = 0;
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            resize();
        });

        resizeObserver.observe(canvas);

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) start();
                    else stop();
                });
            }, { threshold: 0.06 });

            observer.observe(canvas);
        } else {
            start();
        }
    };
})(window.BlackholeSystems = window.BlackholeSystems || {});
