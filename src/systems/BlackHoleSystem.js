import * as THREE from 'three';
import { 
  diskVertexShader, 
  diskFragmentShader, 
  lensingArcVertexShader, 
  lensingArcFragmentShader 
} from '../shaders/blackHoleDisk.js';

/**
 * BlackHoleSystem
 * Physically inspired, high-performance Kerr black hole assembly
 * - Positioned cleanly on the right side of the screen
 * - True Interstellar gravitational lensing (equatorial disk + upper/lower Einstein arcs)
 * - Pitch-black event horizon (absolute #000000 shadow)
 * - Relativistic Doppler boosting and razor-sharp photon ring caustic
 */
export class BlackHoleSystem {
  constructor(scene, camera, radius = 2.4, position = new THREE.Vector3(4.6, 0.5, 0.0)) {
    this.scene = scene;
    this.camera = camera;
    this.radius = radius;
    this.diskInner = radius * 1.05;
    this.diskOuter = 8.6;
    this.time = 0;

    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.scene.add(this.group);

    this.initEventHorizon();
    this.initAccretionDisk();
    this.initGravitationalLensingArcs();
  }

  setPosition(pos) {
    this.group.position.copy(pos);
  }

  getPosition() {
    return this.group.position;
  }

  /**
   * Solid pitch-black Event Horizon Sphere (Absolute Schwarzschild Shadow)
   * High renderOrder and depthWrite guarantees 100% pitch-black void inside the horizon
   */
  initEventHorizon() {
    const geometry = new THREE.SphereGeometry(this.radius, 40, 40);
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true,
      depthTest: true
    });

    this.horizonSphere = new THREE.Mesh(geometry, material);
    this.horizonSphere.renderOrder = 25;
    this.group.add(this.horizonSphere);

    // Inner occlusion disc facing the camera for absolute blackness
    const occludeGeo = new THREE.CircleGeometry(this.radius * 1.02, 40);
    const occludeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    this.occlusionDisk = new THREE.Mesh(occludeGeo, occludeMat);
    this.occlusionDisk.renderOrder = 26;
    this.group.add(this.occlusionDisk);
  }

  /**
   * Primary Relativistic Equatorial Accretion Disk
   * Tilted at an aesthetic angle (~74 degrees inclination)
   */
  initAccretionDisk() {
    const geometry = new THREE.RingGeometry(this.diskInner, this.diskOuter, 96, 24);

    this.diskUniforms = {
      uTime: { value: 0 },
      uHoleRadius: { value: this.radius },
      uDiskInner: { value: this.diskInner },
      uDiskOuter: { value: this.diskOuter },
      uFunnelDepth: { value: 1.4 },
      uCameraPos: { value: this.camera.position },
      uDopplerStrength: { value: 1.25 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: diskVertexShader,
      fragmentShader: diskFragmentShader,
      uniforms: this.diskUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.diskMesh = new THREE.Mesh(geometry, material);
    // Iconic tilted orientation
    this.diskMesh.rotation.x = -Math.PI / 2.43;
    this.diskMesh.rotation.z = Math.PI / 6.5;
    this.group.add(this.diskMesh);
  }

  /**
   * Interstellar Gravitational Lensing Arcs (Einstein Halo)
   * Light from the back of the disk curved around the top and bottom of the event horizon
   */
  initGravitationalLensingArcs() {
    // Upper Arc: arched proudly over top of event horizon
    const arcRadiusInner = this.radius * 1.04;
    const arcRadiusOuter = this.radius * 2.15;
    // Semicircular ring segment (from 0 to PI)
    const upperGeo = new THREE.RingGeometry(arcRadiusInner, arcRadiusOuter, 72, 8, 0, Math.PI);

    this.upperArcUniforms = {
      uTime: { value: 0 },
      uHoleRadius: { value: this.radius },
      uIsUpper: { value: 1.0 }
    };

    const upperMat = new THREE.ShaderMaterial({
      vertexShader: lensingArcVertexShader,
      fragmentShader: lensingArcFragmentShader,
      uniforms: this.upperArcUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.upperArcMesh = new THREE.Mesh(upperGeo, upperMat);
    // Positioned slightly behind the black hole sphere, standing upright in XY plane
    this.upperArcMesh.position.set(0, 0, -0.05);
    this.upperArcMesh.rotation.x = -0.15;
    this.upperArcMesh.rotation.z = Math.PI / 6.5; // aligned with disk tilt
    this.upperArcMesh.renderOrder = 15;
    this.group.add(this.upperArcMesh);

    // Lower Arc: arched under bottom of event horizon behind the disk
    const lowerGeo = new THREE.RingGeometry(arcRadiusInner, arcRadiusOuter * 0.60, 72, 8, Math.PI, Math.PI);

    this.lowerArcUniforms = {
      uTime: { value: 0 },
      uHoleRadius: { value: this.radius },
      uIsUpper: { value: 0.0 }
    };

    const lowerMat = new THREE.ShaderMaterial({
      vertexShader: lensingArcVertexShader,
      fragmentShader: lensingArcFragmentShader,
      uniforms: this.lowerArcUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.lowerArcMesh = new THREE.Mesh(lowerGeo, lowerMat);
    this.lowerArcMesh.position.set(0, 0, -0.15);
    this.lowerArcMesh.rotation.x = 0.15;
    this.lowerArcMesh.rotation.z = Math.PI / 6.5;
    this.lowerArcMesh.renderOrder = 14;
    this.group.add(this.lowerArcMesh);
  }

  update(deltaTime, camera) {
    this.time += deltaTime;

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

    // Keep occlusion disc facing the camera
    if (this.occlusionDisk) {
      this.occlusionDisk.quaternion.copy(camera.quaternion);
    }

    // Gentle differential rotation of the accretion disk
    if (this.diskMesh) {
      this.diskMesh.rotation.z += deltaTime * 0.025;
    }
  }
}
