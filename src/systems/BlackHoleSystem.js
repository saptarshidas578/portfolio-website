import * as THREE from "three";
import {
  diskVertexShader,
  diskFragmentShader,
  lensingArcVertexShader,
  lensingArcFragmentShader,
  polarJetBeamVertexShader,
  polarJetBeamFragmentShader,
  polarJetParticleVertexShader,
  polarJetParticleFragmentShader,
} from "../shaders/blackHoleDisk.js";

/**
 * BlackHoleSystem
 * Centered, enlarged supermassive Kerr black hole with:
 * - Colossal twin relativistic polar plasma jets (Blandford-Znajek mechanism)
 * - True Einstein gravitational lensing arcs and photon ring
 * - Pure pitch-black event horizon shadow
 * - Interactive hover acceleration (speeds up on mouse proximity)
 * - Click-and-drag 3D rotation with inertial damping
 * - Singularity collapse on scroll (clears space for Section 02)
 */
export class BlackHoleSystem {
  constructor(scene, camera, radius = 3.6, position = new THREE.Vector3(0.0, 0.0, 0.0)) {
    this.scene = scene;
    this.camera = camera;
    this.radius = radius;
    this.diskInner = radius * 1.05;
    this.diskOuter = 13.2;
    this.time = 0;

    // Interactive state
    this.speedMultiplier = 1.0;
    this.targetSpeedMultiplier = 1.0;
    this.userRotation = { x: 0, y: 0 };
    this.targetUserRotation = { x: 0, y: 0 };
    this.isDragging = false;

    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.scene.add(this.group);

    this.initEventHorizon();
    this.initAccretionDisk();
    this.initGravitationalLensingArcs();
    this.initPolarJets();
    this.setupInteractivity();
  }

  setPosition(pos) {
    this.group.position.copy(pos);
  }

  getPosition() {
    return this.group.position;
  }

  /**
   * Solid pitch-black Event Horizon Sphere (Absolute Schwarzschild Shadow)
   */
  initEventHorizon() {
    const geometry = new THREE.SphereGeometry(this.radius, 48, 48);

    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      depthWrite: true,
      depthTest: true,
    });

    this.horizonSphere = new THREE.Mesh(geometry, material);
    this.horizonSphere.renderOrder = 30;
    this.group.add(this.horizonSphere);

    // Camera-facing inner occlusion disc for absolute zero-light core
    const occludeGeo = new THREE.CircleGeometry(this.radius * 1.03, 48);
    const occludeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    this.occlusionDisk = new THREE.Mesh(occludeGeo, occludeMat);
    this.occlusionDisk.renderOrder = 31;
    this.group.add(this.occlusionDisk);
  }

  /**
   * Primary Relativistic Equatorial Accretion Disk
   */
  initAccretionDisk() {
    const geometry = new THREE.RingGeometry(this.diskInner, this.diskOuter, 112, 32);

    this.diskUniforms = {
      uTime: { value: 0 },
      uHoleRadius: { value: this.radius },
      uDiskInner: { value: this.diskInner },
      uDiskOuter: { value: this.diskOuter },
      uFunnelDepth: { value: 2.1 },
      uCameraPos: { value: this.camera.position },
      uDopplerStrength: { value: 1.25 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: diskVertexShader,
      fragmentShader: diskFragmentShader,
      uniforms: this.diskUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.diskMesh = new THREE.Mesh(geometry, material);
    this.diskMesh.rotation.x = -Math.PI / 2.43;
    this.diskMesh.rotation.z = Math.PI / 6.5;
    this.group.add(this.diskMesh);
  }

  /**
   * Interstellar Gravitational Lensing Arcs (Einstein Halo)
   */
  initGravitationalLensingArcs() {
    const arcRadiusInner = this.radius * 1.04;
    const arcRadiusOuter = this.radius * 2.18;
    const upperGeo = new THREE.RingGeometry(arcRadiusInner, arcRadiusOuter, 84, 12, 0, Math.PI);

    this.upperArcUniforms = {
      uTime: { value: 0 },
      uHoleRadius: { value: this.radius },
      uIsUpper: { value: 1.0 },
    };

    const upperMat = new THREE.ShaderMaterial({
      vertexShader: lensingArcVertexShader,
      fragmentShader: lensingArcFragmentShader,
      uniforms: this.upperArcUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.upperArcMesh = new THREE.Mesh(upperGeo, upperMat);
    this.upperArcMesh.position.set(0, 0, -0.06);
    this.upperArcMesh.rotation.x = -0.15;
    this.upperArcMesh.rotation.z = Math.PI / 6.5;
    this.upperArcMesh.renderOrder = 18;
    this.group.add(this.upperArcMesh);

    // Lower Arc: arched under bottom of event horizon behind the disk
    const lowerGeo = new THREE.RingGeometry(
      arcRadiusInner,
      arcRadiusOuter * 0.62,
      84,
      12,
      Math.PI,
      Math.PI
    );

    this.lowerArcUniforms = {
      uTime: { value: 0 },
      uHoleRadius: { value: this.radius },
      uIsUpper: { value: 0.0 },
    };

    const lowerMat = new THREE.ShaderMaterial({
      vertexShader: lensingArcVertexShader,
      fragmentShader: lensingArcFragmentShader,
      uniforms: this.lowerArcUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.lowerArcMesh = new THREE.Mesh(lowerGeo, lowerMat);
    this.lowerArcMesh.position.set(0, 0, -0.22);
    this.lowerArcMesh.rotation.x = 0.15;
    this.lowerArcMesh.rotation.z = Math.PI / 6.5;
    this.lowerArcMesh.renderOrder = 17;
    this.group.add(this.lowerArcMesh);
  }

  /**
   * Dual Relativistic Polar Plasma Jets
   * Aligned perpendicular to the accretion disk along the magnetic spin axis (Z axis of jet group)
   */
  initPolarJets() {
    this.jetGroup = new THREE.Group();
    // Exactly match disk tilt so the Z axis of jetGroup is normal to disk plane
    this.jetGroup.rotation.x = -Math.PI / 2.43;
    this.jetGroup.rotation.z = Math.PI / 6.5;
    this.group.add(this.jetGroup);

    this.jetUniforms = {
      uTime: { value: 0 },
      uSpeedMultiplier: { value: 1.0 },
    };

    // 1. Collimated Beam Shaders
    const beamMaterial = new THREE.ShaderMaterial({
      vertexShader: polarJetBeamVertexShader,
      fragmentShader: polarJetBeamFragmentShader,
      uniforms: this.jetUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const jetLength = 26.0;

    // North Beam Cylinder (oriented along +Z axis)
    const beamGeoNorth = new THREE.CylinderGeometry(0.85, 0.26, jetLength, 32, 16, true);
    beamGeoNorth.translate(0, jetLength / 2, 0);
    beamGeoNorth.rotateX(Math.PI / 2); // Rotates cylinder from Y axis to +Z axis
    this.northBeam = new THREE.Mesh(beamGeoNorth, beamMaterial);
    this.northBeam.position.z = this.radius * 0.9;
    this.jetGroup.add(this.northBeam);

    // South Beam Cylinder (oriented along -Z axis)
    const beamGeoSouth = new THREE.CylinderGeometry(0.85, 0.26, jetLength, 32, 16, true);
    beamGeoSouth.translate(0, jetLength / 2, 0);
    beamGeoSouth.rotateX(-Math.PI / 2); // Rotates cylinder from Y axis to -Z axis
    this.southBeam = new THREE.Mesh(beamGeoSouth, beamMaterial);
    this.southBeam.position.z = -this.radius * 0.9;
    this.jetGroup.add(this.southBeam);

    // 2. Helical Vortex Plasma Particles (1,400 particles)
    const particleCount = 1400;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    const pPhases = new Float32Array(particleCount);
    const pProgress = new Float32Array(particleCount);
    const pPoleSigns = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pSizes[i] = 1.6 + Math.random() * 2.8;
      pPhases[i] = Math.random() * Math.PI * 2.0;
      pProgress[i] = Math.random();
      // Even split between North (+1.0) and South (-1.0) jets
      pPoleSigns[i] = i % 2 === 0 ? 1.0 : -1.0;
    }

    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute("size", new THREE.BufferAttribute(pSizes, 1));
    pGeo.setAttribute("phase", new THREE.BufferAttribute(pPhases, 1));
    pGeo.setAttribute("progress", new THREE.BufferAttribute(pProgress, 1));
    pGeo.setAttribute("poleSign", new THREE.BufferAttribute(pPoleSigns, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: polarJetParticleVertexShader,
      fragmentShader: polarJetParticleFragmentShader,
      uniforms: this.jetUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.jetParticles = new THREE.Points(pGeo, particleMaterial);
    this.jetGroup.add(this.jetParticles);
  }

  /**
   * Setup hover acceleration and click-and-drag 3D rotation listeners
   */
  setupInteractivity() {
    let lastX = 0;
    let lastY = 0;
    let isMouseDown = false;

    // Track mouse over hero section to accelerate spin
    window.addEventListener("mousemove", (e) => {
      const heroEl = document.getElementById("hero");
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        const inHero = e.clientY >= rect.top && e.clientY <= rect.bottom;
        this.targetSpeedMultiplier = inHero ? 2.5 : 1.0;
      } else {
        this.targetSpeedMultiplier = e.clientY < window.innerHeight ? 2.5 : 1.0;
      }

      if (isMouseDown) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        // Apply mouse drag to 3D rotation
        this.targetUserRotation.y += dx * 0.0055;
        this.targetUserRotation.x += dy * 0.0055;
        this.targetUserRotation.x = Math.max(-1.2, Math.min(1.2, this.targetUserRotation.x));
      }
    });

    window.addEventListener("mousedown", (e) => {
      // Don't drag if clicking buttons, links or nav
      if (e.target.closest("a, button, input, textarea, .top-nav")) return;
      if (window.scrollY < window.innerHeight * 0.9) {
        isMouseDown = true;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    window.addEventListener("mouseup", () => {
      isMouseDown = false;
    });

    // Touch support for mobile drag
    window.addEventListener(
      "touchstart",
      (e) => {
        if (e.target.closest("a, button, input, textarea, .top-nav")) return;
        if (e.touches.length === 1 && window.scrollY < window.innerHeight * 0.9) {
          isMouseDown = true;
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        if (isMouseDown && e.touches.length === 1) {
          const dx = e.touches[0].clientX - lastX;
          const dy = e.touches[0].clientY - lastY;
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;

          this.targetUserRotation.y += dx * 0.006;
          this.targetUserRotation.x += dy * 0.006;
          this.targetUserRotation.x = Math.max(-1.2, Math.min(1.2, this.targetUserRotation.x));
        }
      },
      { passive: true }
    );

    window.addEventListener("touchend", () => {
      isMouseDown = false;
    });
  }

  update(deltaTime, camera) {
    // 1. Smoothly lerp speed multiplier on hover
    this.speedMultiplier += (this.targetSpeedMultiplier - this.speedMultiplier) * 0.08;
    const effectiveDelta = deltaTime * this.speedMultiplier;
    this.time += effectiveDelta;

    // 2. Smoothly damp user drag rotation
    this.userRotation.x += (this.targetUserRotation.x - this.userRotation.x) * 0.08;
    this.userRotation.y += (this.targetUserRotation.y - this.userRotation.y) * 0.08;

    // Subtle autonomous breathing drift
    const autoDriftX = Math.sin(this.time * 0.4) * 0.04;
    const autoDriftY = this.time * 0.035;

    this.group.rotation.x = this.userRotation.x + autoDriftX;
    this.group.rotation.y = this.userRotation.y + autoDriftY;

    // 3. Update Disk & Arc Shaders
    if (this.diskUniforms) {
      this.diskUniforms.uTime.value = this.time;
      this.diskUniforms.uCameraPos.value.copy(camera.position);
    }
    if (this.upperArcUniforms) {
      this.upperArcUniforms.uTime.value = this.time;
    }
    if (this.lowerArcUniforms) {
      this.lowerArcUniforms.uTime.value = this.time;
    }

    // 4. Update Polar Jet Shaders
    if (this.jetUniforms) {
      this.jetUniforms.uTime.value = this.time;
      this.jetUniforms.uSpeedMultiplier.value = this.speedMultiplier;
    }

    // 5. Keep occlusion disc facing camera
    if (this.occlusionDisk) {
      this.occlusionDisk.quaternion.copy(camera.quaternion);
    }

    // 6. Differential spin of the accretion disk mesh
    if (this.diskMesh) {
      this.diskMesh.rotation.z += effectiveDelta * 0.045;
    }
  }

  setScrollProgress(progress) {
    // Keep physical scale strictly 1.0 - eliminates conflicting dolly-zoom shrinking
    this.group.scale.setScalar(1.0);

    // When fully submerged into the event horizon past progress 0.88, hide group for 60 FPS performance
    this.group.visible = progress < 0.88;
  }
}
