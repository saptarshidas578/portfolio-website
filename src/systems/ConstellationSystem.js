/**
 * ConstellationSystem.js
 * Interactive neural/circuit constellation network for the Engineering Stack
 * Features glowing node hubs, pulsing electron signals along edges, and live hover inspector
 */

export const STACK_NODES = [
  // Core Hubs
  { id: 'hub-electronics', label: 'ELECTRONICS', x: 0.50, y: 0.72, isHub: true, color: '#f59e0b', domain: 'HARDWARE DOMAIN' },
  { id: 'hub-embedded', label: 'EMBEDDED', x: 0.50, y: 0.48, isHub: true, color: '#38bdf8', domain: 'CORE ARCHITECTURE' },
  { id: 'hub-software', label: 'SOFTWARE', x: 0.50, y: 0.28, isHub: true, color: '#c084fc', domain: 'COMPUTATIONAL DOMAIN' },
  { id: 'hub-ai', label: 'AI / ML', x: 0.50, y: 0.10, isHub: true, color: '#34d399', domain: 'INTELLIGENCE DOMAIN' },

  // Electronics Cluster
  { id: 'ct-coil', label: 'Toroidal CT Coils', x: 0.32, y: 0.84, color: '#f59e0b', domain: 'Electronics & Sensing', protocols: 'High-Permeability Ferrite · 1000:1 Ratio · Burden R', context: 'Current sensing in Smart AC Power System' },
  { id: 'ac-sense', label: 'AC 230V Sensing', x: 0.50, y: 0.90, color: '#f59e0b', domain: 'Power Systems', protocols: 'Galvanic Opto-Isolation · DC Bias Offset 1.65V · True-RMS', context: 'High-voltage mains monitoring network' },
  { id: 'relays', label: 'Isolated Relays', x: 0.68, y: 0.84, color: '#f59e0b', domain: 'Power Interlocks', protocols: 'Opto-Isolated Triac · Solid-State SSR · Snubbers', context: 'Emergency compressor trip under overtemp' },

  // Embedded Cluster
  { id: 'esp32', label: 'ESP32 Dual-Core', x: 0.26, y: 0.50, color: '#38bdf8', domain: 'Embedded Systems', protocols: '240MHz Xtensa LX6 · Core 0/1 Pinning · DMA · SRAM', context: 'Dual-core horology synth & smart grid' },
  { id: 'freertos', label: 'FreeRTOS', x: 0.35, y: 0.40, color: '#38bdf8', domain: 'Real-Time Kernel', protocols: 'Task Queues · Mutexes · Semaphores · Zero-Jitter Scheduling', context: 'Sub-millisecond audio stream coordination' },
  { id: 'i2s-dac', label: 'PCM5100A I2S DAC', x: 0.22, y: 0.62, color: '#38bdf8', domain: 'Digital Audio', protocols: '32-Bit / 44.1 kHz · BCK · LRCK · DOUT · Direct Line Out', context: 'Electro-acoustic grandfather clock chimes' },
  { id: 'buses', label: 'I²C · SPI · UART', x: 0.74, y: 0.52, color: '#38bdf8', domain: 'Hardware Protocols', protocols: 'DS1307 RTC · WS2812B One-Wire · Sensor Buses', context: 'Timekeeping & telemetry communication' },

  // Software & Algorithms Cluster
  { id: 'cpp', label: 'C / C++17/20', x: 0.28, y: 0.26, color: '#c084fc', domain: 'Software Engineering', protocols: 'STL · Templates · Pointers · Zero-Allocation Memory', context: 'Embedded firmware and 100+ LeetCode DSA' },
  { id: 'python', label: 'Python 3', x: 0.22, y: 0.16, color: '#c084fc', domain: 'Systems & Scripting', protocols: 'OpenCV · NumPy · SciPy · Multithreading · Socket', context: 'Computer vision engines & AI backend' },
  { id: 'dsa', label: 'LeetCode DSA', x: 0.36, y: 0.18, color: '#c084fc', domain: 'Algorithms', protocols: 'Graphs (Dijkstra) · Binary Trees · Dynamic Programming', context: '100+ problems solved, automated GitHub sync' },
  { id: 'flask-web', label: 'Web & APIs', x: 0.76, y: 0.28, color: '#c084fc', domain: 'API Integration', protocols: 'Flask · WebRTC · REST APIs · Discord Webhooks · HTTP', context: 'Live interview streaming & cloud alerts' },

  // AI & Vision Cluster
  { id: 'whisper', label: 'OpenAI Whisper', x: 0.66, y: 0.08, color: '#34d399', domain: 'Speech Recognition', protocols: 'Acoustic Spectrogram · Prosody Tracking · Sub-120ms Latency', context: 'AI interview vocal cadence analysis' },
  { id: 'mediapipe', label: 'MediaPipe 3D', x: 0.35, y: 0.04, color: '#34d399', domain: 'Computer Vision', protocols: '468 Face Mesh Landmarks · 21 Hand Skeletal Nodes', context: 'Facial gaze tracking & touchless whiteboard' },
  { id: 'groq', label: 'Groq LPU (LLaMA-3)', x: 0.65, y: 0.18, color: '#34d399', domain: 'LLM Inference', protocols: 'Tensor Processing Units · 280+ tokens/sec · Sub-second', context: 'Adaptive real-time interview questioning' },
  { id: 'opencv', label: 'OpenCV & EasyOCR', x: 0.78, y: 0.14, color: '#34d399', domain: 'Spatial Computing', protocols: 'Kalman Filtering · EMA Smoothing · OCR to LaTeX', context: 'Air Whiteboard Pro 60 FPS gesture engine' }
];

export const STACK_EDGES = [
  // Spine Connections (Hub to Hub)
  ['hub-ai', 'hub-software'],
  ['hub-software', 'hub-embedded'],
  ['hub-embedded', 'hub-electronics'],

  // Electronics Network
  ['hub-electronics', 'ct-coil'],
  ['hub-electronics', 'ac-sense'],
  ['hub-electronics', 'relays'],
  ['ct-coil', 'ac-sense'],
  ['ac-sense', 'relays'],
  ['hub-embedded', 'ct-coil'],
  ['hub-embedded', 'relays'],

  // Embedded Network
  ['hub-embedded', 'esp32'],
  ['hub-embedded', 'freertos'],
  ['hub-embedded', 'i2s-dac'],
  ['hub-embedded', 'buses'],
  ['esp32', 'freertos'],
  ['esp32', 'i2s-dac'],
  ['esp32', 'buses'],

  // Software & Cross-Connections
  ['hub-software', 'cpp'],
  ['hub-software', 'python'],
  ['hub-software', 'dsa'],
  ['hub-software', 'flask-web'],
  ['cpp', 'esp32'],
  ['cpp', 'dsa'],
  ['python', 'flask-web'],
  ['buses', 'flask-web'],

  // AI & Vision Connections
  ['hub-ai', 'whisper'],
  ['hub-ai', 'mediapipe'],
  ['hub-ai', 'groq'],
  ['hub-ai', 'opencv'],
  ['python', 'opencv'],
  ['python', 'whisper'],
  ['mediapipe', 'opencv'],
  ['whisper', 'groq'],
  ['groq', 'flask-web']
];

export class ConstellationSystem {
  constructor(canvasId = 'constellation-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.nodes = STACK_NODES;
    this.edges = STACK_EDGES;

    this.width = this.canvas.clientWidth || 900;
    this.height = this.canvas.clientHeight || 560;

    this.hoveredNode = null;
    this.mouse = { x: -1000, y: -1000 };

    // Animated electrical pulse packets
    this.pulses = [];
    for (let i = 0; i < 24; i++) {
      this.pulses.push({
        edgeIndex: Math.floor(Math.random() * this.edges.length),
        t: Math.random(),
        speed: 0.15 + Math.random() * 0.25,
        color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24'
      });
    }

    this.inspectorName = document.getElementById('inspector-node-name');
    this.inspectorDomain = document.getElementById('inspector-domain');
    this.inspectorProtocols = document.getElementById('inspector-protocols');
    this.inspectorContext = document.getElementById('inspector-context');

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.checkHover();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.hoveredNode = null;
      this.resetInspector();
    });

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 900;
    this.height = Math.max(520, Math.min(680, this.width * 0.65));

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);
  }

  checkHover() {
    let closest = null;
    let minDist = 32;

    for (const node of this.nodes) {
      const nx = node.x * this.width;
      const ny = node.y * this.height;
      const dist = Math.hypot(this.mouse.x - nx, this.mouse.y - ny);

      const hitRadius = node.isHub ? 40 : 25;
      if (dist < hitRadius && dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }

    if (closest !== this.hoveredNode) {
      this.hoveredNode = closest;
      this.updateInspector(closest);
    }
  }

  updateInspector(node) {
    if (!node) {
      this.resetInspector();
      return;
    }

    if (this.inspectorName) this.inspectorName.textContent = node.label;
    if (this.inspectorDomain) this.inspectorDomain.textContent = node.domain || 'CORE TECHNOLOGY';
    if (this.inspectorProtocols) this.inspectorProtocols.textContent = node.protocols || 'Core architectural hub linking peripheral subsystems';
    if (this.inspectorContext) this.inspectorContext.textContent = node.context || 'Fundamental engineering building block across hardware and software systems.';
  }

  resetInspector() {
    if (this.inspectorName) this.inspectorName.textContent = 'HOVER ANY TECHNOLOGY NODE';
    if (this.inspectorDomain) this.inspectorDomain.textContent = 'INTERACTIVE SYSTEM CONSTELLATION';
    if (this.inspectorProtocols) this.inspectorProtocols.textContent = 'Explore hardware protocols, real-time kernels, computer vision pipelines, and power sensing.';
    if (this.inspectorContext) this.inspectorContext.textContent = 'Circuit traces carry simulated electrical pulses between dependent technologies.';
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    const dt = Math.min((time - this.lastTime) * 0.001, 0.1);
    this.lastTime = time;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Edges
    this.ctx.lineWidth = 1.0;
    for (const [idA, idB] of this.edges) {
      const nodeA = this.nodes.find(n => n.id === idA);
      const nodeB = this.nodes.find(n => n.id === idB);
      if (!nodeA || !nodeB) continue;

      const ax = nodeA.x * this.width;
      const ay = nodeA.y * this.height;
      const bx = nodeB.x * this.width;
      const by = nodeB.y * this.height;

      const isConnectedToHover = this.hoveredNode && (this.hoveredNode.id === idA || this.hoveredNode.id === idB);

      this.ctx.beginPath();
      this.ctx.moveTo(ax, ay);
      this.ctx.lineTo(bx, by);

      if (isConnectedToHover) {
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2.0;
        this.ctx.shadowColor = '#38bdf8';
        this.ctx.shadowBlur = 8;
      } else {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.lineWidth = 1.0;
        this.ctx.shadowBlur = 0;
      }
      this.ctx.stroke();
    }
    this.ctx.shadowBlur = 0;

    // 2. Animate and Draw Pulses along Edges
    for (const p of this.pulses) {
      p.t += p.speed * dt;
      if (p.t > 1.0) {
        p.t = 0.0;
        p.edgeIndex = Math.floor(Math.random() * this.edges.length);
      }

      const [idA, idB] = this.edges[p.edgeIndex];
      const nodeA = this.nodes.find(n => n.id === idA);
      const nodeB = this.nodes.find(n => n.id === idB);
      if (!nodeA || !nodeB) continue;

      const px = nodeA.x * this.width + (nodeB.x * this.width - nodeA.x * this.width) * p.t;
      const py = nodeA.y * this.height + (nodeB.y * this.height - nodeA.y * this.height) * p.t;

      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Draw Nodes
    for (const node of this.nodes) {
      const nx = node.x * this.width;
      const ny = node.y * this.height;
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
      const isHub = node.isHub;

      const r = isHub ? (isHovered ? 14 : 10) : (isHovered ? 9 : 5.5);

      // Outer Halo on hover
      if (isHovered || isHub) {
        this.ctx.fillStyle = node.color;
        this.ctx.globalAlpha = isHovered ? 0.35 : 0.15;
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, r * 2.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
      }

      // Node Body
      this.ctx.fillStyle = isHovered ? '#ffffff' : (isHub ? node.color : '#0d1322');
      this.ctx.strokeStyle = node.color;
      this.ctx.lineWidth = isHub ? 2.5 : 1.8;

      this.ctx.beginPath();
      this.ctx.arc(nx, ny, r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Node Typography Label
      this.ctx.font = isHub ? 'bold 11px "JetBrains Mono", monospace' : '9.5px "JetBrains Mono", monospace';
      this.ctx.fillStyle = isHovered ? '#ffffff' : (isHub ? node.color : '#94a3b8');
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';

      const labelY = ny + r + 5;
      this.ctx.fillText(node.label, nx, labelY);
    }
  }
}
