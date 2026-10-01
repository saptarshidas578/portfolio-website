import * as THREE from 'three';

/**
 * ScrollCameraRig
 * Smooth inertial scroll interpolator and cinematic camera flight path
 * Frames the hero typography on the LEFT and the majestic Black Hole on the RIGHT
 */
export class ScrollCameraRig {
  constructor(camera, targetOrigin = new THREE.Vector3(4.6, 0.5, 0.0)) {
    this.camera = camera;
    this.targetOrigin = targetOrigin;

    this.scrollProgress = 0.0;
    this.targetScrollProgress = 0.0;
    this.scrollVelocity = 0.0;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.currentPreset = 'CINEMATIC';

    this.initCameraPath();
    this.setupEventListeners();
  }

  initCameraPath() {
    const o = this.targetOrigin; // (4.6, 0.5, 0.0)

    // Camera starts framed so text is on left, black hole is on right
    this.pathPoints = [
      new THREE.Vector3(0.0, 2.8, 22.0),     // t = 0.0: Wide cinematic (BH on right, text on left)
      new THREE.Vector3(1.8, 2.0, 16.0),     // t = 0.25: Sweeping toward the code river
      new THREE.Vector3(3.2, 1.4, 10.5),     // t = 0.50: Descending into the accretion plane
      new THREE.Vector3(4.1, 0.9, 5.8),      // t = 0.75: Skimming luminous plasma
      new THREE.Vector3(4.5, 0.6, 3.2),      // t = 0.90: Entering photon sphere
      new THREE.Vector3(o.x, o.y, 0.5)       // t = 1.0: Event Horizon Singularity Core
    ];

    this.lookAtPoints = [
      new THREE.Vector3(1.2, 0.4, 0.0),      // t = 0.0: Center-left bias, BH sits on right
      new THREE.Vector3(2.4, 0.5, 0.0),      // t = 0.25
      new THREE.Vector3(3.6, 0.5, 0.0),      // t = 0.50
      new THREE.Vector3(4.4, 0.5, 0.0),      // t = 0.75
      new THREE.Vector3(o.x, o.y, 0.0),      // t = 0.90
      new THREE.Vector3(o.x, o.y, -3.0)      // t = 1.0: Piercing singularity core
    ];

    this.cameraCurve = new THREE.CatmullRomCurve3(this.pathPoints);
    this.lookAtCurve = new THREE.CatmullRomCurve3(this.lookAtPoints);

    this.baseFov = 45;
  }

  setupEventListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        this.targetScrollProgress = Math.min(1.0, this.targetScrollProgress + 0.1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        this.targetScrollProgress = Math.max(0.0, this.targetScrollProgress - 0.1);
      } else if (e.key === 'Home') {
        this.targetScrollProgress = 0.0;
      } else if (e.key === 'End') {
        this.targetScrollProgress = 1.0;
      }
    });
  }

  setScrollProgress(val) {
    this.targetScrollProgress = Math.max(0.0, Math.min(1.0, val));
  }

  setPreset(preset) {
    this.currentPreset = preset;
  }

  update(deltaTime) {
    const prevScroll = this.scrollProgress;
    // Responsive, silky smooth lerp
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.12;
    this.scrollVelocity = (this.scrollProgress - prevScroll) / Math.max(deltaTime, 0.001);

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    const t = Math.max(0.0, Math.min(0.999, this.scrollProgress));

    const pos = this.cameraCurve.getPoint(t);
    const lookAt = this.lookAtCurve.getPoint(t);

    const parallaxDamping = (1.0 - t * 0.85);
    const parallaxOffsetX = this.mouse.x * 1.0 * parallaxDamping;
    const parallaxOffsetY = this.mouse.y * 0.8 * parallaxDamping;

    const o = this.targetOrigin;
    if (this.currentPreset === 'ACCRETION' && t < 0.05) {
      pos.set(o.x - 10.5, o.y + 0.3, 2.2);
      lookAt.set(o.x, o.y, 0.0);
    } else if (this.currentPreset === 'POLAR' && t < 0.05) {
      pos.set(o.x, o.y + 15.0, 1.0);
      lookAt.set(o.x, o.y, 0.0);
    }

    this.camera.position.set(
      pos.x + parallaxOffsetX,
      pos.y + parallaxOffsetY,
      pos.z
    );

    this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

    const targetFov = this.baseFov + Math.pow(t, 2.0) * 16.0 + Math.min(Math.abs(this.scrollVelocity) * 2.0, 8.0);
    this.camera.fov += (targetFov - this.camera.fov) * 0.1;
    this.camera.updateProjectionMatrix();

    return {
      progress: this.scrollProgress,
      velocity: this.scrollVelocity,
      inSingularity: this.scrollProgress > 0.88
    };
  }
}
