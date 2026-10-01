import * as THREE from 'three';

/**
 * QuantumReactorSystem.js
 * A high-energy Tokamak Plasma Fusion Reactor & Magnetic Confinement Core
 * Featuring:
 * - Multi-axis gyroscopic magnetic confinement coils (3 counter-rotating rings)
 * - Turbulent burning plasma core with 3D noise displacement & coronal flare shader
 * - Geodesic icosahedral magnetic containment lattice
 * - 1,400 toroidal helical magnetic flux particles
 * - Interactive cursor-tilt parallax & hyper-drive excitation on button hover
 */
export class QuantumReactorSystem {
  constructor(canvasId = 'contact-blackhole-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.isVisible = false;
    this.hoverIntensity = 0.0;
    this.targetHover = 0.0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.init();
    this.setupObserver();
    this.setupInteractivity();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    const parent = this.canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? Math.max(parent.clientHeight, 600) : 600;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.4, 9.2);
    this.camera.lookAt(0, 0, 0);

    // Root Group for Mouse Parallax Tilt
    this.reactorGroup = new THREE.Group();
    this.scene.add(this.reactorGroup);

    // 1. Burning Fusion Plasma Core (Turbulent Simplex-Displaced Shader)
    this.createPlasmaCore();

    // 2. Geodesic Magnetic Containment Lattice
    this.createLatticeCage();

    // 3. Gyroscopic Magnetic Confinement Rings
    this.createConfinementRings();

    // 4. Toroidal Helical Magnetic Flux Particles
    this.createMagneticParticles();

    // 5. Ambient Ion Starfield
    this.createIonField();

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', () => this.handleResize());
  }

  createPlasmaCore() {
    const coreGeo = new THREE.SphereGeometry(1.35, 64, 64);
    
    // Shader with 3D procedural noise displacement & Fresnel coronal glow
    this.coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uColorHot: { value: new THREE.Color('#ffffff') },
        uColorMid: { value: new THREE.Color('#38bdf8') },
        uColorDark: { value: new THREE.Color('#0369a1') },
        uColorRim: { value: new THREE.Color('#fbbf24') }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uHover;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;

        // Fast 3D Simplex-inspired sine wave turbulence
        float getTurbulence(vec3 p) {
          float t = uTime * (2.2 + uHover * 2.5);
          float n1 = sin(p.x * 4.0 + t) * cos(p.y * 4.0 + t * 0.8) * sin(p.z * 4.0 + t * 1.2);
          float n2 = sin(p.x * 8.0 - t * 1.5) * sin(p.y * 8.0 + t * 1.1) * cos(p.z * 8.0 - t * 0.9);
          return (n1 * 0.7 + n2 * 0.3);
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          float noise = getTurbulence(position);
          vNoise = noise;

          float displacement = noise * (0.16 + uHover * 0.22);
          vec3 newPos = position + normal * displacement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uHover;
        uniform vec3 uColorHot;
        uniform vec3 uColorMid;
        uniform vec3 uColorDark;
        uniform vec3 uColorRim;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;

        void main() {
          // Fresnel rim calculation
          vec3 viewDir = normalize(-vPosition);
          float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
          fresnel = clamp(1.0 - abs(fresnel), 0.0, 1.0);
          fresnel = pow(fresnel, 1.8);

          // Blend colors based on turbulence noise & Fresnel
          vec3 baseColor = mix(uColorDark, uColorMid, vNoise * 0.5 + 0.5);
          baseColor = mix(baseColor, uColorHot, pow(vNoise * 0.5 + 0.5, 3.0) * (0.8 + uHover * 0.6));
          
          // Coronal solar flare rim
          vec3 finalColor = mix(baseColor, uColorRim, fresnel * (0.75 + uHover * 0.45));
          
          // Add radiant pulse
          finalColor += uColorMid * (fresnel * 0.5 + uHover * 0.35);

          gl_FragColor = vec4(finalColor, 0.92);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.plasmaMesh = new THREE.Mesh(coreGeo, this.coreMaterial);
    this.reactorGroup.add(this.plasmaMesh);

    // Inner Radiant Glow Core
    const innerGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.innerMesh = new THREE.Mesh(innerGeo, innerMat);
    this.reactorGroup.add(this.innerMesh);
  }

  createLatticeCage() {
    const icoGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const wireGeo = new THREE.WireframeGeometry(icoGeo);
    
    this.latticeMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });

    this.latticeMesh = new THREE.LineSegments(wireGeo, this.latticeMaterial);
    this.reactorGroup.add(this.latticeMesh);
  }

  createConfinementRings() {
    this.rings = [];

    const ringConfigs = [
      { radius: 2.5, tube: 0.045, color: '#38bdf8', rotSpeed: { x: 0.4, y: 0.6, z: 0.1 }, initRot: [0.3, 0.2, 0.0] },
      { radius: 2.9, tube: 0.050, color: '#fbbf24', rotSpeed: { x: -0.5, y: 0.3, z: 0.4 }, initRot: [-0.4, 0.6, 0.3] },
      { radius: 3.4, tube: 0.040, color: '#c084fc', rotSpeed: { x: 0.3, y: -0.4, z: -0.5 }, initRot: [0.6, -0.4, 0.5] }
    ];

    ringConfigs.forEach(cfg => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 96);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cfg.color),
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(...cfg.initRot);
      mesh.userData = { rotSpeed: cfg.rotSpeed, baseColor: cfg.color };

      this.reactorGroup.add(mesh);
      this.rings.push(mesh);
    });
  }

  createMagneticParticles() {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const meta = [];

    const palette = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#fbbf24'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#34d399')
    ];

    for (let i = 0; i < count; i++) {
      const strand = i % 4;
      const t = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 0.9;
      const rMinor = 0.5 + Math.random() * 0.8;
      const rMajor = 2.4 + (strand * 0.3);

      meta.push({ t, speed, rMinor, rMajor, strand });

      // Toroidal coordinates
      const x = (rMajor + rMinor * Math.cos(t * 3.0)) * Math.cos(t);
      const y = (rMajor + rMinor * Math.cos(t * 3.0)) * Math.sin(t);
      const z = rMinor * Math.sin(t * 3.0);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = palette[strand];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleMeta = meta;

    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMaterial);
    this.reactorGroup.add(this.particlePoints);
  }

  createIonField() {
    const starCount = 500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 24;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.045,
      transparent: true,
      opacity: 0.45
    });

    this.ionField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.ionField);
  }

  setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    if (this.canvas.parentElement) {
      observer.observe(this.canvas.parentElement);
    }
  }

  setupInteractivity() {
    // Parallax Mouse Tracking
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Excitation triggers on Contact CTA and Uplink Cards
    const triggerElements = document.querySelectorAll('#btn-contact-transmit, .cosmic-link-card, .btn-cosmic');
    triggerElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.targetHover = 1.0;
      });
      el.addEventListener('mouseleave', () => {
        this.targetHover = 0.0;
      });
    });
  }

  handleResize() {
    if (!this.canvas || !this.renderer) return;
    const parent = this.canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? Math.max(parent.clientHeight, 600) : 600;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate(currentTime) {
    requestAnimationFrame(this.animate);
    if (!this.isVisible) return;

    const dt = Math.min((currentTime - this.lastTime) * 0.001, 0.1);
    this.lastTime = currentTime;

    // Smooth hover lerp
    this.hoverIntensity += (this.targetHover - this.hoverIntensity) * 0.08;

    // Smooth mouse parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // 1. Tilt Reactor with Parallax
    this.reactorGroup.rotation.y = this.mouse.x * 0.35;
    this.reactorGroup.rotation.x = -this.mouse.y * 0.25;

    // 2. Update Plasma Core Uniforms
    if (this.coreMaterial && this.coreMaterial.uniforms) {
      this.coreMaterial.uniforms.uTime.value += dt;
      this.coreMaterial.uniforms.uHover.value = this.hoverIntensity;
      this.plasmaMesh.rotation.y += dt * (0.3 + this.hoverIntensity * 0.8);
      this.plasmaMesh.rotation.z += dt * (0.15 + this.hoverIntensity * 0.5);
    }

    // 3. Update Geodesic Lattice
    if (this.latticeMesh) {
      this.latticeMesh.rotation.x += dt * 0.2;
      this.latticeMesh.rotation.y -= dt * 0.25;
      const latticeScale = 1.0 + Math.sin(currentTime * 0.002) * 0.03 + this.hoverIntensity * 0.08;
      this.latticeMesh.scale.set(latticeScale, latticeScale, latticeScale);
    }

    // 4. Update Confinement Rings
    const spinMultiplier = 1.0 + this.hoverIntensity * 2.2;
    this.rings.forEach((ring) => {
      const sp = ring.userData.rotSpeed;
      ring.rotation.x += sp.x * dt * spinMultiplier;
      ring.rotation.y += sp.y * dt * spinMultiplier;
      ring.rotation.z += sp.z * dt * spinMultiplier;
    });

    // 5. Update Magnetic Flux Particles
    if (this.particleGeo && this.particlePoints) {
      const pos = this.particleGeo.attributes.position.array;
      const speedMult = 1.0 + this.hoverIntensity * 2.0;

      for (let i = 0; i < this.particleMeta.length; i++) {
        const m = this.particleMeta[i];
        m.t += m.speed * dt * speedMult;

        const x = (m.rMajor + m.rMinor * Math.cos(m.t * 3.0)) * Math.cos(m.t);
        const y = (m.rMajor + m.rMinor * Math.cos(m.t * 3.0)) * Math.sin(m.t);
        const z = m.rMinor * Math.sin(m.t * 3.0);

        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
      }
      this.particleGeo.attributes.position.needsUpdate = true;
    }

    // 6. Slowly drift background ions
    if (this.ionField) {
      this.ionField.rotation.y += dt * 0.03;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
