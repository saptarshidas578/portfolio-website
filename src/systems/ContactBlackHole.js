import * as THREE from 'three';

/**
 * ContactBlackHole.js
 * Renders a smaller, distant Kerr black hole singularity behind the contact section
 * Providing narrative closure: Black hole -> Journey -> Distant Black Hole
 */
export class ContactBlackHole {
  constructor(canvasId = 'contact-blackhole-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.isVisible = false;
    this.init();
    this.setupObserver();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power'
    });

    const width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 800;
    const height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 500;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.8, 8.5);
    this.camera.lookAt(0, 0, 0);

    // 1. Black Hole Event Horizon Sphere (Pure Obsidian Void)
    const holeRadius = 1.0;
    const holeGeo = new THREE.SphereGeometry(holeRadius, 48, 48);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.holeMesh = new THREE.Mesh(holeGeo, holeMat);
    this.scene.add(this.holeMesh);

    // 2. Distant Accretion Ring (Molten Gold & Amber Glow)
    const ringGeo = new THREE.RingGeometry(holeRadius * 1.05, holeRadius * 3.2, 96);
    
    // Custom shader for smooth, glowing accretion gradient
    const ringMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        uniform float uTime;
        void main() {
          float r = length(vPos.xy);
          float inner = 1.05;
          float outer = 3.2;

          float t = (r - inner) / (outer - inner);
          if (t < 0.0 || t > 1.0) discard;

          // Warm golden-amber accretion colors matching hero
          vec3 coreCol = vec3(0.98, 0.75, 0.14); // Molten Gold
          vec3 edgeCol = vec3(0.85, 0.35, 0.05); // Amber Redshift
          vec3 col = mix(coreCol, edgeCol, t);

          float angle = atan(vPos.y, vPos.x) + uTime * 0.8;
          float swirl = 0.85 + 0.15 * sin(angle * 4.0 - r * 3.0);

          float alpha = sin(t * 3.14159) * 0.75 * swirl;
          gl_FragColor = vec4(col * 1.2, alpha);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = Math.PI * 0.38; // Tilted accretion plane
    this.ringMesh.rotation.z = Math.PI * 0.12;
    this.scene.add(this.ringMesh);

    // 3. Subtle Gravitational Photon Ring Glow
    const photonGeo = new THREE.RingGeometry(holeRadius * 1.01, holeRadius * 1.15, 64);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.photonRing = new THREE.Mesh(photonGeo, photonMat);
    this.scene.add(this.photonRing);

    // 4. Pinpoint Starfield
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 25;
      starPos[i + 1] = (Math.random() - 0.5) * 18;
      starPos[i + 2] = -5 - Math.random() * 10;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.06,
      transparent: true,
      opacity: 0.55
    });
    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', () => this.handleResize());
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

  handleResize() {
    if (!this.canvas || !this.renderer) return;
    const width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 800;
    const height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 500;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate(currentTime) {
    requestAnimationFrame(this.animate);
    if (!this.isVisible) return;

    const dt = (currentTime - this.lastTime) * 0.001;
    this.lastTime = currentTime;

    if (this.ringMesh && this.ringMesh.material.uniforms) {
      this.ringMesh.material.uniforms.uTime.value += dt;
      this.ringMesh.rotation.z += dt * 0.25;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
