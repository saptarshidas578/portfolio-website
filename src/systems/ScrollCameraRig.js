import * as THREE from 'three';

/**
 * ScrollCameraRig
 * Smooth inertial scroll interpolator and cinematic camera flight path
 * Centered on the supermassive Black Hole and its twin relativistic plasma jets
 */
export class ScrollCameraRig {
  constructor(camera, targetOrigin = new THREE.Vector3(0.0, 0.0, 0.0)) {
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
    const o = this.targetOrigin; // (0.0, 0.0, 0.0)

    // Camera starts dead-center framed on the black hole & vertical jets
    this.pathPoints = [
      new THREE.Vector3(0.0, 1.2, 21.0),     // t = 0.0: Majestic centered wide shot
      new THREE.Vector3(0.0, 1.0, 15.5),     // t = 0.25: Approaching the singularity
      new THREE.Vector3(0.0, 0.6, 9.8),      // t = 0.50: Flanked by plasma jets
      new THREE.Vector3(0.0, 0.3, 5.2),      // t = 0.75: Skimming photon ring
      new THREE.Vector3(0.0, 0.1, 2.8),      // t = 0.90: Piercing event horizon
      new THREE.Vector3(0.0, 0.0, 0.5)       // t = 1.0: Submerged in singularity
    ];

    this.lookAtPoints = [
      new THREE.Vector3(o.x, o.y, 0.0),      // t = 0.0: Direct center
      new THREE.Vector3(o.x, o.y, 0.0),      // t = 0.25
      new THREE.Vector3(o.x, o.y, 0.0),      // t = 0.50
      new THREE.Vector3(o.x, o.y, 0.0),      // t = 0.75
      new THREE.Vector3(o.x, o.y, 0.0),      // t = 0.90
      new THREE.Vector3(o.x, o.y, -4.0)      // t = 1.0: Plunge forward
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
    // Responsive, silky smooth lerp during hero transition; lock to 1.0 when deep in portfolio
    if (this.targetScrollProgress >= 0.99 && typeof window !== 'undefined' && window.scrollY > window.innerHeight * 1.2) {
      this.scrollProgress = 1.0;
    } else {
      this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.18;
    }
    this.scrollVelocity = (this.scrollProgress - prevScroll) / Math.max(deltaTime, 0.001);

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    const t = Math.max(0.0, Math.min(1.0, this.scrollProgress));

    // Smooth monotonic cubic ease (zero overshoot, zero ripple)
    const smoothT = t * t * (3.0 - 2.0 * t);

    // Subtle parallax that gracefully damps to zero as we penetrate the horizon
    const parallaxDamping = 1.0 - smoothT * 0.95;
    const parallaxOffsetX = this.mouse.x * 0.45 * parallaxDamping;
    const parallaxOffsetY = this.mouse.y * 0.35 * parallaxDamping;

    // Strict monotonic forward flight path along Z
    let camX = parallaxOffsetX;
    let camY = THREE.MathUtils.lerp(1.0, 0.0, smoothT) + parallaxOffsetY;
    let camZ = THREE.MathUtils.lerp(21.0, 0.4, smoothT);

    const o = this.targetOrigin;
    if (this.currentPreset === 'ACCRETION' && t < 0.05) {
      camX = o.x - 12.0 + parallaxOffsetX;
      camY = o.y + 0.4 + parallaxOffsetY;
      camZ = 2.5;
    } else if (this.currentPreset === 'POLAR' && t < 0.05) {
      camX = o.x + parallaxOffsetX;
      camY = o.y + 18.0 + parallaxOffsetY;
      camZ = 1.2;
    }

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0.0, 0.0, 0.0);

    // Rock-solid uniform 45 deg FOV - eliminates erratic velocity zoom in/out oscillation
    this.camera.fov = 45.0;
    this.camera.updateProjectionMatrix();

    return {
      progress: this.scrollProgress,
      velocity: this.scrollVelocity,
      inSingularity: this.scrollProgress > 0.85
    };
  }
}
