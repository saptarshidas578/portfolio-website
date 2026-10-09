import * as THREE from "three";

/**
 * StarfieldSystem
 * High-performance cosmic background sky:
 * - 2,200 balanced stellar points across 6 spectral classes (O/B blue, A diamond white, G solar, K amber, M red)
 * - Synchronous scroll-driven migration: stars part cleanly to the side gutters in 1:1 lockstep with scroll
 * - Clean central reading corridor: middle 68% of viewport remains completely free of stars during Sections 02–07
 * - Zero interference with content or portrait video
 */
export class StarfieldSystem {
  constructor(scene, count = 2200) {
    this.scene = scene;
    this.count = count;
    this.initStars();
  }

  initStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const originalPositions = new Float32Array(this.count * 3);
    const targetSidePositions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    const phases = new Float32Array(this.count);

    // Stellar spectral classification colors
    const spectralColors = [
      new THREE.Color(0xa5c2ff), // O/B Deep Ionized Blue
      new THREE.Color(0xdbe6ff), // A Brilliant Diamond Blue/White
      new THREE.Color(0xffffff), // F Pure Radiant White
      new THREE.Color(0xfff3e5), // G Solar Warm White
      new THREE.Color(0xffdfb8), // K Warm Amber Gold
      new THREE.Color(0xffc2a6), // M Deep Warm Red-Orange
    ];

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // 1. Initial Full Sky Distribution (Deep spherical shell)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 70.0 + Math.random() * 110.0;

      const origX = r * Math.sin(phi) * Math.cos(theta);
      const origY = r * Math.sin(phi) * Math.sin(theta);
      const origZ = r * Math.cos(phi) - 20.0;

      originalPositions[i3] = origX;
      originalPositions[i3 + 1] = origY;
      originalPositions[i3 + 2] = origZ;

      positions[i3] = origX;
      positions[i3 + 1] = origY;
      positions[i3 + 2] = origZ;

      // 2. Target Side Margins (Calibrated to camera frustum at t = 1.0, FOV 45 deg)
      const isLeft = i % 2 === 0;
      const sideSign = isLeft ? -1.0 : 1.0;

      const depth = 12.0 + Math.random() * 45.0;
      const halfHeight = depth * 0.4142; // tan(22.5 deg)
      const halfWidth = halfHeight * 1.78;

      // Lateral placement: cleanly framed in side margins (68% to 96% from screen center)
      const lateralFraction = 0.68 + Math.random() * 0.28;
      const targetX = sideSign * lateralFraction * halfWidth;

      // Vertical placement: full vertical screen span with slight overscan
      const verticalFraction = (Math.random() - 0.5) * 2.3;
      const targetY = verticalFraction * halfHeight;
      const targetZ = 0.4 - depth;

      targetSidePositions[i3] = targetX;
      targetSidePositions[i3 + 1] = targetY;
      targetSidePositions[i3 + 2] = targetZ;

      // 3. Spectral Colors
      const color = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // 4. Sizes and Scintillation
      sizes[i] = 1.0 + Math.pow(Math.random(), 3.0) * 3.2;
      phases[i] = Math.random() * Math.PI * 2.0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("originalPosition", new THREE.BufferAttribute(originalPositions, 3));
    geometry.setAttribute("targetSidePos", new THREE.BufferAttribute(targetSidePositions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));

    const vertexShader = `
      attribute vec3 originalPosition;
      attribute vec3 targetSidePos;
      attribute float size;
      attribute float phase;

      varying vec3 vColor;
      varying float vPhase;

      uniform float uTime;
      uniform float uScrollProgress;

      void main() {
        vPhase = phase;
        vColor = color;

        // Synchronous scroll progression for hero parting (0.0 = hero, 1.0 = scrolled past hero)
        float t = clamp(uScrollProgress, 0.0, 1.0);
        float sideWeight = smoothstep(0.0, 0.85, t);
        vec3 pos = mix(originalPosition, targetSidePos, sideWeight);

        // Gentle cosmic drift when stationed at the sides
        if (sideWeight > 0.05) {
          pos.y += sin(uTime * 0.35 + phase) * 0.25 * sideWeight;
          pos.x += cos(uTime * 0.25 + phase) * 0.15 * sideWeight;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

        // Twinkle
        float twinkle = 0.82 + 0.36 * sin(uTime * 2.4 + phase);
        float pSize = size * twinkle * (170.0 / -mvPosition.z);

        gl_PointSize = clamp(pSize, 1.2, 14.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vPhase;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        float core = smoothstep(0.48, 0.15, dist);
        vec3 col = vColor * 2.2;

        gl_FragColor = vec4(col, core);
      }
    `;

    this.uniforms = {
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starPoints = new THREE.Points(geometry, material);
    this.scene.add(this.starPoints);
  }

  setContactProgress(progress) {
    // No-op for video mode (retained for backward compatibility with main.js)
  }

  setAspect(aspect) {
    // Retained for backward compatibility
  }

  update(deltaTime, scrollProgress = 0.0) {
    if (this.uniforms) {
      this.uniforms.uTime.value += deltaTime;
      this.uniforms.uScrollProgress.value = scrollProgress;
    }
  }
}
