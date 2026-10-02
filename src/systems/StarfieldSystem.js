import * as THREE from 'three';

/**
 * StarfieldSystem
 * Dense cosmic sky filled with 7,000+ stars featuring:
 * - Varied stellar spectral classes (O/B blue, A diamond white, G solar, K amber, M red)
 * - Dynamic scroll-driven scatter: as user scrolls down, stars burst outward and
 *   migrate to the left and right margins of the viewport.
 * - Persistent side-band framing: once migrated, stars stay anchored along the left
 *   and right screen edges throughout all subsequent sections, gently scintillating.
 */
export class StarfieldSystem {
  constructor(scene, count = 7000) {
    this.scene = scene;
    this.count = count;
    this.scrollProgress = 0.0;
    this.targetScrollProgress = 0.0;
    this.initStars();
  }

  initStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const originalPositions = new Float32Array(this.count * 3);
    const targetSidePositions = new Float32Array(this.count * 3);
    const scatterOffsets = new Float32Array(this.count * 3);
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
      new THREE.Color(0xffc2a6)  // M Deep Warm Red-Orange
    ];

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // 1. Initial Full Sky Distribution (Dense, immersive spherical shell & depth)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 85.0 + Math.random() * 125.0;

      const origX = r * Math.sin(phi) * Math.cos(theta);
      const origY = r * Math.sin(phi) * Math.sin(theta);
      const origZ = r * Math.cos(phi) - 25.0;

      originalPositions[i3] = origX;
      originalPositions[i3 + 1] = origY;
      originalPositions[i3 + 2] = origZ;

      positions[i3] = origX;
      positions[i3 + 1] = origY;
      positions[i3 + 2] = origZ;

      // 2. Target Side Margins (Calibrated to camera frustum at t = 1.0)
      // Camera is at (0, 0, 0.5) looking at (0, 0, -4.0), FOV ~ 61 deg, aspect ~ 1.778
      const isLeft = i % 2 === 0;
      const sideSign = isLeft ? -1.0 : 1.0;

      // Distance D in front of camera
      const depth = 14.0 + Math.pow(Math.random(), 1.4) * 46.0;
      const halfHeight = depth * 0.589;
      const halfWidth = halfHeight * 1.778;

      // Lateral placement: framed strictly in side gutters (62% to 98% from screen center)
      const lateralFraction = 0.62 + Math.random() * 0.36;
      const targetX = sideSign * lateralFraction * halfWidth;

      // Vertical placement: full vertical screen span with slight overscan
      const verticalFraction = (Math.random() - 0.5) * 2.3;
      const targetY = verticalFraction * halfHeight;
      const targetZ = 0.5 - depth;

      targetSidePositions[i3] = targetX;
      targetSidePositions[i3 + 1] = targetY;
      targetSidePositions[i3 + 2] = targetZ;

      // 3. Scatter Impulse Direction (Radial explosion during scroll transition)
      const scatterAngle = Math.random() * Math.PI * 2.0;
      const scatterMagnitude = 18.0 + Math.random() * 30.0;
      scatterOffsets[i3] = sideSign * Math.abs(Math.cos(scatterAngle)) * scatterMagnitude;
      scatterOffsets[i3 + 1] = Math.sin(scatterAngle) * scatterMagnitude;
      scatterOffsets[i3 + 2] = (Math.random() - 0.5) * 20.0;

      // 4. Stellar Spectral Colors
      const color = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // 5. Star sizes and scintillation phases
      sizes[i] = 1.0 + Math.pow(Math.random(), 3.0) * 3.8;
      phases[i] = Math.random() * Math.PI * 2.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3));
    geometry.setAttribute('targetSidePos', new THREE.BufferAttribute(targetSidePositions, 3));
    geometry.setAttribute('scatterOffset', new THREE.BufferAttribute(scatterOffsets, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    // Custom Dynamic Star Point Shader
    const vertexShader = `
      attribute vec3 originalPosition;
      attribute vec3 targetSidePos;
      attribute vec3 scatterOffset;
      attribute float size;
      attribute float phase;
      varying vec3 vColor;
      varying float vPhase;

      uniform float uTime;
      uniform float uScrollProgress;

      void main() {
        vColor = color;
        vPhase = phase;

        // Scroll progression (0.0 = hero, 1.0 = scrolled past hero)
        float t = clamp(uScrollProgress, 0.0, 1.0);

        // Scatter burst peaks around mid-scroll
        float scatterImpulse = sin(t * 3.14159265) * 1.35;

        // Smooth transition to side margin bands
        float sideWeight = smoothstep(0.06, 0.70, t);

        // Blend from full sky to side margins
        vec3 pos = mix(originalPosition, targetSidePos, sideWeight);

        // Add dynamic outward scatter
        pos += scatterOffset * scatterImpulse;

        // Persistent gentle cosmic float when stationed at the sides
        if (sideWeight > 0.05) {
          pos.y += sin(uTime * 0.45 + phase) * (0.35 + 0.20 * sin(phase * 2.0)) * sideWeight;
          pos.x += cos(uTime * 0.30 + phase) * 0.20 * sideWeight;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        
        // Stellar twinkle scintillation
        float twinkle = 0.75 + 0.35 * sin(uTime * 2.4 + phase);
        float pSize = size * twinkle * (180.0 / -mvPosition.z);
        gl_PointSize = clamp(pSize, 1.5, 14.0);
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

        float alpha = exp(-dist * dist * 12.0);
        gl_FragColor = vec4(vColor * 1.6, alpha);
      }
    `;

    this.uniforms = {
      uTime: { value: 0 },
      uScrollProgress: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starPoints = new THREE.Points(geometry, material);
    this.scene.add(this.starPoints);
  }

  update(deltaTime, scrollProgress = 0.0) {
    if (this.uniforms) {
      this.uniforms.uTime.value += deltaTime;
      
      this.targetScrollProgress = scrollProgress;
      this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.12;
      this.uniforms.uScrollProgress.value = this.scrollProgress;
    }
  }
}
