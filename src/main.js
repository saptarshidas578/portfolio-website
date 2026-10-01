import * as THREE from 'three';
import './style.css';
import { StarfieldSystem } from './systems/StarfieldSystem.js';
import { BlackHoleSystem } from './systems/BlackHoleSystem.js';
import { CodeStreamSystem } from './systems/CodeStreamSystem.js';
import { ScrollCameraRig } from './systems/ScrollCameraRig.js';
import { PostProcessingPipeline } from './systems/PostProcessingPipeline.js';
import { CosmicAudioSynthesizer } from './systems/CosmicAudioSynthesizer.js';
import { CaseStudyController } from './systems/CaseStudyController.js';
import { ConstellationSystem } from './systems/ConstellationSystem.js';
import { QuantumReactorSystem } from './systems/QuantumReactorSystem.js';

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.initRenderer();
    this.initScene();
    this.initSystems();
    this.initUI();
    this.setupResize();

    this.animate = this.animate.bind(this);
    window.__app = this;
    requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Native high-definition pixel ratio (up to 2.0x for Retina/4K razor-sharp crispness)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setClearColor(0x000000, 1.0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }

  initSystems() {
    const holeRadius = 2.4;
    // Position black hole cleanly to the right of the screen (4.6, 0.5, 0.0)
    const holeOrigin = new THREE.Vector3(4.6, 0.5, 0.0);

    // 1. Cosmic Deep Starfield (pinpoint stars on pure pitch-black void)
    this.starfield = new StarfieldSystem(this.scene, 3000);

    // 2. Black Hole Singularity Assembly (Kerr metric with Einstein lensing arcs)
    this.blackHole = new BlackHoleSystem(this.scene, this.camera, holeRadius, holeOrigin);

    // 3. Relativistic Code Stream & Prominent Multicolor Formula Badges
    this.codeStreams = new CodeStreamSystem(this.scene, holeRadius, holeOrigin, this.renderer);

    // 4. Scroll Camera Controller & Parallax
    this.cameraRig = new ScrollCameraRig(this.camera, holeOrigin);

    // 5. Cinematic Post-Processing Pipeline (Fast 1/5 res bloom, chromatic dispersion)
    this.postProcessing = new PostProcessingPipeline(this.renderer, this.scene, this.camera);

    // 6. Procedural Cosmic Audio Synthesizer
    this.audio = new CosmicAudioSynthesizer();

    // 7. Case Study Overlay Controller (7-stage deep dive for Selected Systems)
    this.caseStudyController = new CaseStudyController();

    // 8. Interactive Constellation Network for Engineering Stack
    this.constellationSystem = new ConstellationSystem('constellation-canvas');

    // 9. Cyber-Physical Tokamak Plasma Fusion Reactor (Creative Finale)
    this.quantumReactor = new QuantumReactorSystem('contact-reactor-canvas');
  }

  initUI() {
    // Audio Drone Toggle
    const soundBtn = document.getElementById('btn-sound');
    const soundLabel = document.getElementById('sound-label');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const playing = this.audio.toggle();
        if (soundLabel) soundLabel.textContent = playing ? 'AUDIO: ON' : 'AUDIO: OFF';
        soundBtn.classList.toggle('active', playing);
      });
    }

    // Camera Preset Buttons
    const presetBtns = document.querySelectorAll('.btn-preset');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.getAttribute('data-preset');
        this.cameraRig.setPreset(preset);
      });
    });

    // Ascend button from bottom of page back to event horizon hero
    const ascendBtn = document.getElementById('btn-ascend');
    if (ascendBtn) {
      ascendBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.cameraRig.setScrollProgress(0.0);
      });
    }

    // Interactive LeetCode Algorithm Explorer Tabs
    const tabBtns = document.querySelectorAll('.algo-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.code-block').forEach(b => b.classList.remove('active'));
        const targetBlock = document.getElementById(`code-${tab}`);
        if (targetBlock) targetBlock.classList.add('active');
      });
    });

    // Direct Email Copy to Clipboard Interaction
    const emailCard = document.getElementById('contact-email-card');
    if (emailCard) {
      emailCard.addEventListener('click', () => {
        const email = 'saptarshi2007@gmail.com';
        navigator.clipboard?.writeText(email).catch(() => {});
        const feedback = document.getElementById('email-handle');
        if (feedback) {
          feedback.textContent = 'Copied to Clipboard! ✓';
          setTimeout(() => {
            feedback.textContent = 'saptarshi2007@gmail.com 📋';
          }, 3000);
        }
      });
    }

    // Achievements Light Evidence Modal Logic
    const achieveModal = document.getElementById('achieve-modal');
    const closeAchieveBtn = document.getElementById('btn-close-achieve');
    const modalTag = document.getElementById('achieve-modal-tag');
    const modalTitle = document.getElementById('achieve-modal-title');
    const modalDesc = document.getElementById('achieve-modal-desc');
    const modalLink = document.getElementById('achieve-modal-link');

    const ACHIEVEMENTS_DATA = {
      hackathon: {
        tag: 'HACKATHON // IoT HARDWARE SPRINT',
        title: 'Smart Hardware Prototyping & Telemetry',
        desc: 'Rapidly architected and deployed microcontroller hardware interfacing environmental telemetry with discord webhooks and automated threshold alerting under 36-hour sprint constraints.',
        link: 'https://github.com/saptarshidas578/Smart_ac_control_system'
      },
      competition: {
        tag: 'COMPETITIVE DSA // ALGORITHMIC RIGOR',
        title: 'LeetCode 100+ Solved with Automated GitHub Sync',
        desc: 'Continuous competitive programming portfolio spanning graph traversal (Dijkstra, BFS/DFS), dynamic programming, and binary search trees. Automated continuous synchronization to GitHub via LeetPush.',
        link: 'https://leetcode.com/u/Saptarshi2007/'
      },
      certification: {
        tag: 'CERTIFICATION // EMBEDDED ARCHITECTURE',
        title: 'Embedded Systems & Real-Time Kernels',
        desc: 'Demonstrated mastery across low-level peripherals, GPIO interrupts, DMA buffer manipulation, and FreeRTOS preemptive task scheduling with strict timing deadlines.',
        link: 'https://github.com/saptarshidas578'
      },
      expo: {
        tag: 'PROJECT EXPO // TECHNICAL DEMONSTRATION',
        title: 'Electro-Acoustic Horology Showcase',
        desc: 'Physical exhibition featuring dual-core FreeRTOS task pinning, 32-bit I2S harmonic chime synthesis through a dedicated PCM5100A DAC, and continuous NTP time synchronization.',
        link: 'https://github.com/saptarshidas578/ESP32_Smart_Grandfather_Clock'
      }
    };

    const openAchieveModal = (key) => {
      const item = ACHIEVEMENTS_DATA[key];
      if (!item || !achieveModal) return;
      if (modalTag) modalTag.textContent = item.tag;
      if (modalTitle) modalTitle.textContent = item.title;
      if (modalDesc) modalDesc.textContent = item.desc;
      if (modalLink) modalLink.href = item.link;
      achieveModal.classList.add('active');
      achieveModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeAchieveModal = () => {
      if (!achieveModal) return;
      achieveModal.classList.remove('active');
      achieveModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-modal]').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-modal');
        openAchieveModal(key);
      });
    });

    if (closeAchieveBtn) closeAchieveBtn.addEventListener('click', closeAchieveModal);
    if (achieveModal) {
      achieveModal.addEventListener('click', (e) => {
        if (e.target === achieveModal) closeAchieveModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && achieveModal && achieveModal.classList.contains('active')) {
        closeAchieveModal();
      }
    });

    // Window scroll binding: drives camera along geodesic flight path
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const transitionZone = window.innerHeight * 1.5;
      const progress = Math.min(1.0, scrollY / transitionZone);
      this.cameraRig.setScrollProgress(progress);
    }, { passive: true });

    // UI Elements for hero typography fade
    this.heroContent = document.getElementById('hero-content');
  }

  setupResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.postProcessing.setSize(width, height);
    });
  }

  animate(currentTime) {
    requestAnimationFrame(this.animate);

    const deltaTime = Math.min((currentTime - this.lastTime) * 0.001, 0.1);
    this.lastTime = currentTime;

    // 1. Update Camera Path & Parallax
    const camState = this.cameraRig.update(deltaTime);
    const scrollT = camState.progress;

    // 2. Update Systems
    this.starfield.update(deltaTime);
    this.blackHole.update(deltaTime, this.camera);
    this.codeStreams.update(deltaTime);
    this.postProcessing.update(deltaTime, scrollT, camState.velocity);
    this.audio.update(scrollT, camState.velocity);

    // 3. UI Synchronization
    // Hero typography fades smoothly as user dives into portfolio
    if (this.heroContent) {
      const scrollY = window.scrollY;
      const heroFade = Math.max(0.0, 1.0 - (scrollY / (window.innerHeight * 0.75)));
      this.heroContent.style.opacity = heroFade;
      this.heroContent.style.pointerEvents = heroFade < 0.1 ? 'none' : 'auto';
    }

    // 4. Render Scene with Post-Processing
    this.postProcessing.render();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
