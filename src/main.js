import * as THREE from "three";
import "./style.css";
import { StarfieldSystem } from "./systems/StarfieldSystem.js";
import { BlackHoleSystem } from "./systems/BlackHoleSystem.js";
import { ScrollCameraRig } from "./systems/ScrollCameraRig.js";
import { PostProcessingPipeline } from "./systems/PostProcessingPipeline.js";
import { CosmicAudioSynthesizer } from "./systems/CosmicAudioSynthesizer.js";
import { CaseStudyController } from "./systems/CaseStudyController.js";
import { ConstellationSystem } from "./systems/ConstellationSystem.js";
import { NerdStatsOverlay } from "./systems/NerdStatsOverlay.js";

class App {
  constructor() {
    this.canvas = document.getElementById("webgl-canvas");
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.initUI();
    this.setupResize();
    this.setupMotionPreferences();

    try {
      this.initRenderer();
      this.initScene();
      this.initSystems();
      this.animate = this.animate.bind(this);
      window.__app = this;
      requestAnimationFrame(this.animate);
    } catch (err) {
      console.warn("WebGL initialization skipped or failed:", err);
      this.enableFallbackHero();
    }
  }

  enableFallbackHero() {
    document.body.classList.add("webgl-fallback");
    const hero = document.getElementById("hero");
    if (hero) hero.classList.add("webgl-fallback-active");
    if (this.canvas) this.canvas.style.display = "none";
  }

  setupMotionPreferences() {
    try {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.isReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener("change", (e) => {
        this.isReducedMotion = e.matches;
        const touchVideo = document.getElementById("first-touch-video");
        if (touchVideo) {
          if (this.isReducedMotion) {
            touchVideo.pause();
          } else {
            touchVideo.play().catch(() => {});
          }
        }
      });
    } catch {
      this.isReducedMotion = false;
    }
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });

    if (this.canvas) {
      this.canvas.addEventListener(
        "webglcontextlost",
        (e) => {
          e.preventDefault();
          console.warn("WebGL context lost. Activating graceful fallback.");
          this.enableFallbackHero();
        },
        false
      );
    }

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
    const holeRadius = 3.6;
    // Dead-center supermassive black hole with twin relativistic polar plasma jets
    const holeOrigin = new THREE.Vector3(0.0, 0.0, 0.0);

    // 1. Cosmic Deep Starfield (2,200 balanced stars with synchronous parting and First Touch constellation morph)
    this.starfield = new StarfieldSystem(this.scene, 2200);

    // 2. Black Hole Singularity Assembly (Centered, enlarged, dual polar jets, interactive rotation)
    this.blackHole = new BlackHoleSystem(this.scene, this.camera, holeRadius, holeOrigin);

    // 3. Scroll Camera Controller & Parallax
    this.cameraRig = new ScrollCameraRig(this.camera, holeOrigin);

    // 5. Cinematic Post-Processing Pipeline (Fast 1/5 res bloom, chromatic dispersion)
    this.postProcessing = new PostProcessingPipeline(this.renderer, this.scene, this.camera);

    // 6. Procedural Cosmic Audio Synthesizer
    this.audio = new CosmicAudioSynthesizer();

    // 7. Case Study Overlay Controller (7-stage deep dive for Selected Systems)
    this.caseStudyController = new CaseStudyController();

    // 8. Interactive Constellation Network for Engineering Stack
    this.constellationSystem = new ConstellationSystem("constellation-canvas");
  }

  initUI() {
    // 0. YouTube-Style Stats for Nerds Telemetry Overlay
    this.nerdStats = new NerdStatsOverlay(this);

    // Audio Drone Toggle
    const soundBtn = document.getElementById("btn-sound");
    const soundLabel = document.getElementById("sound-label");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        const playing = this.audio ? this.audio.toggle() : false;
        if (soundLabel) soundLabel.textContent = playing ? "AUDIO: ON" : "AUDIO: OFF";
        soundBtn.classList.toggle("active", playing);
      });
    }

    // Camera Preset Buttons
    const presetBtns = document.querySelectorAll(".btn-preset");
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        presetBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const preset = btn.getAttribute("data-preset");
        this.cameraRig?.setPreset(preset);
      });
    });

    // Ascend button from bottom of page back to event horizon hero
    const ascendBtn = document.getElementById("btn-ascend");
    if (ascendBtn) {
      ascendBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        this.cameraRig?.setScrollProgress(0.0);
      });
    }

    // Section 03 Build Archive Category Filtering
    const filterBtns = document.querySelectorAll(".filter-btn");
    const buildEntries = document.querySelectorAll(".build-entry");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        const filter = btn.getAttribute("data-filter");

        buildEntries.forEach((entry) => {
          const category = entry.getAttribute("data-category");
          if (filter === "all" || category === filter) {
            entry.classList.remove("filtered-out");
          } else {
            entry.classList.add("filtered-out");
          }
        });
      });
    });

    // Interactive LeetCode Algorithm Explorer Tabs
    const tabBtns = document.querySelectorAll(".algo-tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.getAttribute("data-tab");
        document.querySelectorAll(".code-block").forEach((b) => b.classList.remove("active"));
        const targetBlock = document.getElementById(`code-${tab}`);
        if (targetBlock) targetBlock.classList.add("active");
      });
    });

    // Section 07 — Direct Email Copy to Clipboard Interaction
    const copyEmailBtn = document.getElementById("btn-copy-email");
    const copyBtnText = document.getElementById("copy-btn-text");
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const email = "saptarshi2007@gmail.com";
        let copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(email);
            copied = true;
          } catch {
            copied = false;
          }
        }
        if (!copied) {
          const ta = document.createElement("textarea");
          ta.value = email;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          try {
            copied = document.execCommand("copy");
          } catch {
            copied = false;
          }
          document.body.removeChild(ta);
        }
        if (copyBtnText) {
          const originalText = copyBtnText.textContent;
          copyBtnText.textContent = "COPIED ✓";
          copyEmailBtn.classList.add("copied");
          setTimeout(() => {
            copyBtnText.textContent = originalText;
            copyEmailBtn.classList.remove("copied");
          }, 2200);
        }
      });
    }

    // Achievements Light Evidence Modal Logic
    const achieveModal = document.getElementById("achieve-modal");
    const closeAchieveBtn = document.getElementById("btn-close-achieve");
    const modalTag = document.getElementById("achieve-modal-tag");
    const modalTitle = document.getElementById("achieve-modal-title");
    const modalDesc = document.getElementById("achieve-modal-desc");
    const modalLink = document.getElementById("achieve-modal-link");

    const ACHIEVEMENTS_DATA = {
      hackathon: {
        tag: "HACKATHON // IoT HARDWARE SPRINT",
        title: "Smart Hardware Prototyping & Telemetry",
        desc: "Rapidly architected and deployed microcontroller hardware interfacing environmental telemetry with discord webhooks and automated threshold alerting under 36-hour sprint constraints.",
        link: "https://github.com/saptarshidas578/Smart_ac_control_system",
      },
      competition: {
        tag: "COMPETITIVE DSA // ALGORITHMIC RIGOR",
        title: "LeetCode 100+ Solved with Automated GitHub Sync",
        desc: "Continuous competitive programming portfolio spanning graph traversal (Dijkstra, BFS/DFS), dynamic programming, and binary search trees. Automated continuous synchronization to GitHub via LeetPush.",
        link: "https://leetcode.com/u/Saptarshi2007/",
      },
      certification: {
        tag: "CERTIFICATION // EMBEDDED ARCHITECTURE",
        title: "Embedded Systems & Real-Time Kernels",
        desc: "Demonstrated mastery across low-level peripherals, GPIO interrupts, DMA buffer manipulation, and FreeRTOS preemptive task scheduling with strict timing deadlines.",
        link: "https://github.com/saptarshidas578",
      },
      expo: {
        tag: "PROJECT EXPO // TECHNICAL DEMONSTRATION",
        title: "Electro-Acoustic Horology Showcase",
        desc: "Physical exhibition featuring dual-core FreeRTOS task pinning, 32-bit I2S harmonic chime synthesis through a dedicated PCM5100A DAC, and continuous NTP time synchronization.",
        link: "https://github.com/saptarshidas578/ESP32-Smart-Grandfather-Clock",
      },
    };

    const openAchieveModal = (key) => {
      const item = ACHIEVEMENTS_DATA[key];
      if (!item || !achieveModal) return;
      if (modalTag) modalTag.textContent = item.tag;
      if (modalTitle) modalTitle.textContent = item.title;
      if (modalDesc) modalDesc.textContent = item.desc;
      if (modalLink) modalLink.href = item.link;
      achieveModal.classList.add("active");
      achieveModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeAchieveModal = () => {
      if (!achieveModal) return;
      achieveModal.classList.remove("active");
      achieveModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    document.querySelectorAll("[data-modal]").forEach((card) => {
      card.addEventListener("click", () => {
        const key = card.getAttribute("data-modal");
        openAchieveModal(key);
      });
    });

    if (closeAchieveBtn) closeAchieveBtn.addEventListener("click", closeAchieveModal);
    if (achieveModal) {
      achieveModal.addEventListener("click", (e) => {
        if (e.target === achieveModal) closeAchieveModal();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && achieveModal && achieveModal.classList.contains("active")) {
        closeAchieveModal();
      }
    });

    // Section 05 Build Log Timeline Scroll Activation Observer
    const timelineNodes = document.querySelectorAll(".timeline-node");
    if (timelineNodes.length > 0) {
      const nodeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("active-node");
            }
          });
        },
        {
          root: null,
          rootMargin: "0px 0px -12% 0px",
          threshold: 0.15,
        }
      );

      timelineNodes.forEach((node) => nodeObserver.observe(node));
    }

    // Section 06 Signals & Credentials Scroll Activation Observer
    const signalElements = document.querySelectorAll(".vector-card, .credential-row");
    if (signalElements.length > 0) {
      const signalObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("signal-active");
              signalObserver.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.1,
        }
      );

      signalElements.forEach((el) => signalObserver.observe(el));
    }

    // Window scroll binding: drives camera along geodesic flight path
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        const transitionZone = window.innerHeight * 1.1;
        const progress = Math.min(1.0, scrollY / transitionZone);
        this.cameraRig?.setScrollProgress(progress);
        this.updateContactProgress();
      },
      { passive: true }
    );

    // UI Elements for hero typography fade
    this.heroContent = document.getElementById("hero-content");
    this.heroHud = document.querySelector(".hero-interactive-hud");

    // Section 07 Portrait Video Player with IntersectionObserver & Reduced Motion
    const touchVideo = document.getElementById("first-touch-video");
    if (touchVideo) {
      if ("IntersectionObserver" in window) {
        const videoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !this.isReducedMotion) {
                touchVideo.play().catch(() => {});
              } else {
                touchVideo.pause();
              }
            });
          },
          { threshold: 0.1 }
        );
        videoObserver.observe(touchVideo);
      } else if (!this.isReducedMotion) {
        touchVideo.play().catch(() => {});
      }
    }
  }

  updateContactProgress() {
    const contactEl = document.getElementById("contact");
    if (!contactEl || !this.starfield) return;

    const rect = contactEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Contact enters viewport from bottom (rect.top <= windowHeight * 1.25): progress starts 0.0
    // Mid-scroll transit: stars visibly stream downward and inward from side margins
    // Deep view (rect.top <= windowHeight * 0.35): stars locked into First Touch hands constellation
    const enterThreshold = windowHeight * 1.25;
    const lockThreshold = windowHeight * 0.35;
    const rawProgress = (enterThreshold - rect.top) / (enterThreshold - lockThreshold);
    const contactProgress = Math.max(0.0, Math.min(1.0, rawProgress));

    this.starfield.setContactProgress(contactProgress);
  }

  setupResize() {
    window.addEventListener("resize", () => {
      if (!this.camera || !this.renderer || !this.postProcessing) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.postProcessing.setSize(width, height);

      // Pass updated aspect to Starfield for responsive constellation placement
      this.starfield?.setAspect(width / height);
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
    this.starfield.update(deltaTime, scrollT);
    this.updateContactProgress();
    this.blackHole.update(deltaTime, this.camera);
    this.blackHole.setScrollProgress(scrollT);
    this.postProcessing.update(deltaTime, scrollT, camState.velocity);
    this.audio.update(scrollT, camState.velocity);

    // Live Stats for Nerds Telemetry Update
    this.nerdStats?.update(deltaTime, currentTime);

    // 3. UI Synchronization
    // Hero typography fades smoothly as user dives into portfolio
    if (this.heroContent) {
      const scrollY = window.scrollY;
      const heroFade = Math.max(0.0, 1.0 - scrollY / (window.innerHeight * 0.75));
      this.heroContent.style.opacity = heroFade;
      this.heroContent.style.pointerEvents = heroFade < 0.1 ? "none" : "auto";
      if (this.heroHud) {
        this.heroHud.style.opacity = heroFade;
        this.heroHud.style.pointerEvents = heroFade < 0.1 ? "none" : "auto";
      }
    }

    // 4. Render Scene with Post-Processing
    this.postProcessing.render();
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  new App();
});
