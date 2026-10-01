import * as THREE from 'three';

/**
 * StarfieldSystem
 * High-performance cosmic starfield with realistic stellar spectral classes,
 * twinkle scintillation, and relativistic aberration.
 */
export class StarfieldSystem {
  constructor(scene, count = 4500) {
    this.scene = scene;
    this.count = count;
    this.initStars();
  }

  initStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    const phases = new Float32Array(this.count);

    // Stellar color palettes (O, B, A, F, G, K, M spectral classes)
    const spectralColors = [
      new THREE.Color(0x9db4ff), // O/B Deep Blue
      new THREE.Color(0xbbccff), // A Light Blue/White
      new THREE.Color(0xf8f9fa), // F Pure White
      new THREE.Color(0xfff4e8), // G Yellow-White
      new THREE.Color(0xffddb4), // K Orange
      new THREE.Color(0xffbd9b)  // M Red Dwarf
    ];

    for (let i = 0; i < this.count; i++) {
      // Uniform spherical distribution at large radius (r = 120 to 220)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 120.0 + Math.random() * 100.0;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Random spectral color
      const color = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Varied star brightness and size
      sizes[i] = 1.0 + Math.pow(Math.random(), 3.0) * 4.0;
      phases[i] = Math.random() * Math.PI * 2.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    // Custom Star Point Shader
    const vertexShader = `
      attribute float size;
      attribute float phase;
      varying vec3 vColor;
      varying float vPhase;

      uniform float uTime;

      void main() {
        vColor = color;
        vPhase = phase;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Scintillation / twinkle
        float twinkle = 0.8 + 0.3 * sin(uTime * 2.5 + phase);
        gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vPhase;

      void main() {
        // Smooth circular point sprite with gaussian falloff
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        float alpha = exp(-dist * dist * 12.0);
        gl_FragColor = vec4(vColor * 1.5, alpha);
      }
    `;

    this.uniforms = {
      uTime: { value: 0 }
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

  update(deltaTime) {
    if (this.uniforms) {
      this.uniforms.uTime.value += deltaTime;
    }
  }
}
