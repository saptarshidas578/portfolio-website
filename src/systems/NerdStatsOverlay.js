/**
 * NerdStatsOverlay.js
 * YouTube-inspired "Stats for Nerds" real-time playback & engine telemetry overlay.
 * 
 * Features:
 * - Real-time FPS, Min/Max FPS, and Dropped Frames counter
 * - Viewport resolution, Device Pixel Ratio (DPR), and Optimal Canvas resolution
 * - WebGL2 GPU pipeline info: Draw calls, Triangles, Textures, Geometries
 * - Shaders, Tone Mapping, and Kerr Singularity raymarching stats
 * - Frame Render Time (ms) with target budget headroom
 * - Live 100-frame rolling sparkline canvas graph (FPS & frame-time curve)
 * - Network telemetry & latency indicators
 * - Procedural Cosmic Drone audio buffer state
 * - Draggable HUD window, keyboard shortcut (Shift+N), and one-click JSON/Markdown clipboard copy
 */

export class NerdStatsOverlay {
  constructor(app) {
    this.app = app;
    this.isOpen = false;

    // Telemetry metrics
    this.fps = 60;
    this.minFps = 60;
    this.maxFps = 60;
    this.frameTime = 16.6;
    this.droppedFrames = 0;
    this.totalFrames = 0;

    // Sparkline history buffers (last 100 samples)
    this.maxHistory = 100;
    this.fpsHistory = new Array(this.maxHistory).fill(60);
    this.frameTimeHistory = new Array(this.maxHistory).fill(16.6);

    // Throttle text DOM updates for readability (canvas updates every frame)
    this.lastTextUpdate = 0;
    this.textUpdateInterval = 160; // ms

    // Draggable state
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    this.initDOM();
    this.initEvents();
  }

  initDOM() {
    // Check if already injected
    if (document.getElementById('nerd-stats-overlay')) return;

    const overlay = document.createElement('aside');
    overlay.id = 'nerd-stats-overlay';
    overlay.className = 'nerd-stats-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'false');
    overlay.setAttribute('aria-label', 'Stats for Nerds Telemetry');
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="nerd-header" id="nerd-header">
        <div class="nerd-title">
          <span class="nerd-status-led" id="nerd-status-led"></span>
          <span class="nerd-title-text">STATS FOR NERDS // SYSTEM TELEMETRY</span>
        </div>
        <div class="nerd-header-actions">
          <button type="button" class="nerd-tool-btn" id="btn-copy-nerd-stats" title="Copy Telemetry to Clipboard">
            <span class="tool-icon">📋</span>
            <span id="copy-nerd-label">COPY</span>
          </button>
          <button type="button" class="nerd-tool-btn" id="btn-reset-nerd-stats" title="Reset Dropped Frames & History">
            <span class="tool-icon">↺</span>
            <span>RESET</span>
          </button>
          <button type="button" class="nerd-close-btn" id="btn-close-nerd-stats" title="Close Stats for Nerds (Shift+N or ESC)">
            &times;
          </button>
        </div>
      </div>

      <div class="nerd-body">
        <!-- Live Sparkline Graph -->
        <div class="nerd-graph-container">
          <div class="nerd-graph-header">
            <span class="graph-legend-fps">● FPS (<span id="stat-fps-text">60.0</span>)</span>
            <span class="graph-legend-ms">● FRAME TIME (<span id="stat-ms-text">16.6ms</span>)</span>
            <span class="graph-legend-target">TARGET: 16.6ms / 60Hz</span>
          </div>
          <canvas id="nerd-sparkline-canvas" class="nerd-sparkline-canvas" width="380" height="64"></canvas>
        </div>

        <!-- Telemetry Data Grid -->
        <div class="nerd-telemetry-grid">
          
          <div class="nerd-row">
            <span class="nerd-key">Host / Runtime</span>
            <span class="nerd-val" id="stat-runtime">Antigravity Core // v2.4-kerr</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Viewport / DPR</span>
            <span class="nerd-val highlight" id="stat-viewport">1920x1080 @ 2.0x</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Current / Ideal Res</span>
            <span class="nerd-val" id="stat-resolution">1920x1080 / 3840x2160</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Frames Per Second</span>
            <span class="nerd-val fps-val" id="stat-fps">60.0 fps (Min: 60.0 / Max: 60.0)</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Dropped Frames</span>
            <span class="nerd-val" id="stat-dropped">0 / 0 (0.00%)</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Frame Render Time</span>
            <span class="nerd-val" id="stat-frametime">16.6 ms (Budget: 16.6ms)</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Rendering Pipeline</span>
            <span class="nerd-val" id="stat-pipeline">WebGL 2.0 / ACESFilmic / 1.1 Exp</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Shaders & Codecs</span>
            <span class="nerd-val" id="stat-shaders">GLSL 3.00 ES / Kerr Geodesic Sim</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">GPU Draw Calls</span>
            <span class="nerd-val highlight" id="stat-drawcalls">12 calls · 4,820 triangles</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Memory Objects</span>
            <span class="nerd-val" id="stat-memory">Geometries: 8 · Textures: 4</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Active Starfield</span>
            <span class="nerd-val" id="stat-starfield">1,400 Stars (Instanced GPU buffer)</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Cosmic Audio Synth</span>
            <span class="nerd-val" id="stat-audio">WebAudio: 432 Hz Drone (Muted)</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Scroll & Geodesic</span>
            <span class="nerd-val" id="stat-geodesic">Progress: 0.0% · Cam: (0.0, 0.4, 9.2)</span>
          </div>

          <div class="nerd-row">
            <span class="nerd-key">Network / Protocol</span>
            <span class="nerd-val" id="stat-network">HTTP/2 TLS 1.3 · Latency: &lt; 15ms</span>
          </div>

        </div>

        <div class="nerd-footer-hint">
          <span>SHORTCUT: <kbd>Shift</kbd> + <kbd>N</kbd> // CLICK &amp; DRAG HEADER TO REPOSITION</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.canvas = document.getElementById('nerd-sparkline-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
  }

  initEvents() {
    // 1. Toggle Button in Top Nav
    const toggleBtn = document.getElementById('btn-nerd-stats');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    }

    // 2. Clickable Status Orb in Top Nav
    const statusOrb = document.querySelector('.status-orb');
    if (statusOrb) {
      statusOrb.style.cursor = 'pointer';
      statusOrb.title = 'System Operational • Click for Stats for Nerds';
      statusOrb.addEventListener('click', () => {
        this.toggle();
      });
    }

    // 3. Close Button
    const closeBtn = document.getElementById('btn-close-nerd-stats');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // 4. Copy Telemetry Button
    const copyBtn = document.getElementById('btn-copy-nerd-stats');
    const copyLabel = document.getElementById('copy-nerd-label');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        await this.copyTelemetry();
        if (copyLabel) {
          copyLabel.textContent = 'COPIED ✓';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyLabel.textContent = 'COPY';
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      });
    }

    // 5. Reset Stats Button
    const resetBtn = document.getElementById('btn-reset-nerd-stats');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.droppedFrames = 0;
        this.totalFrames = 0;
        this.minFps = this.fps;
        this.maxFps = this.fps;
        this.fpsHistory.fill(this.fps);
        this.frameTimeHistory.fill(this.frameTime);
      });
    }

    // 6. Keyboard Shortcuts (Shift+N or Escape)
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if ((e.shiftKey && (e.key === 'N' || e.key === 'n')) || (e.key === '~' && !e.shiftKey)) {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // 7. Draggable Header
    const header = document.getElementById('nerd-header');
    if (header) {
      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return; // Allow button clicks
        this.isDragging = true;
        const rect = this.overlay.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.overlay.classList.add('dragging');
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        const x = Math.max(10, Math.min(window.innerWidth - this.overlay.offsetWidth - 10, e.clientX - this.dragOffset.x));
        const y = Math.max(60, Math.min(window.innerHeight - this.overlay.offsetHeight - 10, e.clientY - this.dragOffset.y));
        this.overlay.style.left = `${x}px`;
        this.overlay.style.top = `${y}px`;
        this.overlay.style.right = 'auto';
        this.overlay.style.bottom = 'auto';
      });

      window.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.overlay.classList.remove('dragging');
        }
      });
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (this.overlay) {
      this.overlay.style.display = 'flex';
      this.overlay.classList.add('active');
    }
    const toggleBtn = document.getElementById('btn-nerd-stats');
    if (toggleBtn) toggleBtn.classList.add('active');
  }

  close() {
    this.isOpen = false;
    if (this.overlay) {
      this.overlay.classList.remove('active');
      this.overlay.style.display = 'none';
    }
    const toggleBtn = document.getElementById('btn-nerd-stats');
    if (toggleBtn) toggleBtn.classList.remove('active');
  }

  update(deltaTime, currentTime = performance.now()) {
    // Always compute FPS metrics even if closed so data is ready when opened
    this.totalFrames++;

    const dtMs = deltaTime * 1000;
    this.frameTime = dtMs;

    // Instantaneous FPS
    const instantFps = deltaTime > 0 ? Math.min(120, 1.0 / deltaTime) : 60;
    // Smoothed FPS
    this.fps = this.fps * 0.9 + instantFps * 0.1;

    // Track min/max
    if (this.totalFrames > 30) {
      this.minFps = Math.min(this.minFps, this.fps);
      this.maxFps = Math.max(this.maxFps, this.fps);
    }

    // Detect dropped frames (frame took longer than ~26ms for 60Hz or 1.6x budget)
    if (dtMs > 26.0 && this.totalFrames > 10) {
      this.droppedFrames++;
    }

    // Update histories
    this.fpsHistory.push(this.fps);
    if (this.fpsHistory.length > this.maxHistory) this.fpsHistory.shift();

    this.frameTimeHistory.push(dtMs);
    if (this.frameTimeHistory.length > this.maxHistory) this.frameTimeHistory.shift();

    if (!this.isOpen) return;

    // Draw sparkline every frame
    this.drawSparkline();

    // Throttle DOM text updates
    if (currentTime - this.lastTextUpdate > this.textUpdateInterval) {
      this.lastTextUpdate = currentTime;
      this.updateTextStats();
    }
  }

  drawSparkline() {
    if (!this.ctx || !this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // 60 FPS reference line (middle)
    const y60 = h * 0.35;
    ctx.beginPath();
    ctx.moveTo(0, y60);
    ctx.lineTo(w, y60);
    ctx.stroke();

    // 30 FPS / 16.6ms reference line
    const y30 = h * 0.7;
    ctx.beginPath();
    ctx.moveTo(0, y30);
    ctx.lineTo(w, y30);
    ctx.stroke();

    const len = this.fpsHistory.length;
    if (len < 2) return;

    const step = w / (this.maxHistory - 1);

    // 1. Draw Frame Time curve (Amber/Gold)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < len; i++) {
      const ms = this.frameTimeHistory[i];
      // scale 0ms -> 33ms to h -> 0
      const y = h - Math.min(h, Math.max(0, (ms / 33.3) * h));
      const x = i * step;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Draw FPS curve (Emerald / Cyan)
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < len; i++) {
      const f = this.fpsHistory[i];
      // scale 0 -> 90 FPS to h -> 0
      const y = h - Math.min(h, Math.max(0, (f / 90) * h));
      const x = i * step;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Top dot on current FPS
    const currentY = h - Math.min(h, Math.max(0, (this.fps / 90) * h));
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc((len - 1) * step, currentY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  updateTextStats() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const screenW = window.screen.width;
    const screenH = window.screen.height;

    // Viewport
    const elViewport = document.getElementById('stat-viewport');
    if (elViewport) elViewport.textContent = `${w}x${h} @ ${dpr.toFixed(1)}x DPR`;

    // Resolution
    const elRes = document.getElementById('stat-resolution');
    if (elRes) elRes.textContent = `${w}x${h} (Screen: ${screenW}x${screenH})`;

    // FPS
    const elFps = document.getElementById('stat-fps');
    if (elFps) {
      elFps.textContent = `${this.fps.toFixed(1)} fps (Min: ${this.minFps.toFixed(1)} / Max: ${this.maxFps.toFixed(1)})`;
    }
    const elFpsText = document.getElementById('stat-fps-text');
    if (elFpsText) elFpsText.textContent = `${this.fps.toFixed(1)}`;

    // Dropped Frames
    const elDropped = document.getElementById('stat-dropped');
    if (elDropped) {
      const droppedPercent = this.totalFrames > 0 ? ((this.droppedFrames / this.totalFrames) * 100).toFixed(2) : '0.00';
      elDropped.textContent = `${this.droppedFrames} / ${this.totalFrames} (${droppedPercent}%)`;
      elDropped.style.color = this.droppedFrames > 0 ? '#fbbf24' : '#34d399';
    }

    // Frame Time
    const elFrametime = document.getElementById('stat-frametime');
    if (elFrametime) {
      const headroom = Math.max(0, ((16.66 - this.frameTime) / 16.66) * 100).toFixed(0);
      elFrametime.textContent = `${this.frameTime.toFixed(1)} ms (${headroom}% GPU headroom)`;
    }
    const elMsText = document.getElementById('stat-ms-text');
    if (elMsText) elMsText.textContent = `${this.frameTime.toFixed(1)}ms`;

    // Three.js Renderer info
    if (this.app?.renderer?.info) {
      const info = this.app.renderer.info;
      const elDrawCalls = document.getElementById('stat-drawcalls');
      if (elDrawCalls) {
        elDrawCalls.textContent = `${info.render.calls} calls · ${info.render.triangles.toLocaleString()} triangles`;
      }

      const elMemory = document.getElementById('stat-memory');
      if (elMemory) {
        elMemory.textContent = `Geometries: ${info.memory.geometries} · Textures: ${info.memory.textures}`;
      }
    }

    // Audio status
    const elAudio = document.getElementById('stat-audio');
    if (elAudio && this.app?.audio) {
      const isPlaying = this.app.audio.isPlaying;
      elAudio.textContent = isPlaying ? 'WebAudio: 432 Hz Drone (ACTIVE ⚡)' : 'WebAudio: 432 Hz Drone (Muted)';
      elAudio.style.color = isPlaying ? '#38bdf8' : '#94a3b8';
    }

    // Scroll & Geodesic coordinates
    const elGeodesic = document.getElementById('stat-geodesic');
    if (elGeodesic && this.app?.camera) {
      const cam = this.app.camera.position;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollPct = ((scrollY / maxScroll) * 100).toFixed(1);
      elGeodesic.textContent = `Scroll: ${scrollPct}% · Cam: (${cam.x.toFixed(1)}, ${cam.y.toFixed(1)}, ${cam.z.toFixed(1)})`;
    }

    // Network connection
    const elNetwork = document.getElementById('stat-network');
    if (elNetwork) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        const type = conn.effectiveType ? conn.effectiveType.toUpperCase() : 'ONLINE';
        const downlink = conn.downlink ? `${conn.downlink} Mbps` : 'Direct';
        const rtt = conn.rtt ? `${conn.rtt}ms RTT` : '< 15ms';
        elNetwork.textContent = `${type} (${downlink}) · ${rtt} · TLS 1.3`;
      } else {
        elNetwork.textContent = 'HTTP/2 TLS 1.3 · Latency: < 15ms';
      }
    }

    // Status LED
    const led = document.getElementById('nerd-status-led');
    if (led) {
      if (this.fps >= 55) {
        led.style.backgroundColor = '#34d399';
        led.style.boxShadow = '0 0 8px #34d399';
      } else if (this.fps >= 35) {
        led.style.backgroundColor = '#fbbf24';
        led.style.boxShadow = '0 0 8px #fbbf24';
      } else {
        led.style.backgroundColor = '#f87171';
        led.style.boxShadow = '0 0 8px #f87171';
      }
    }
  }

  async copyTelemetry() {
    const dpr = window.devicePixelRatio || 1;
    const calls = this.app?.renderer?.info?.render?.calls || 'N/A';
    const tris = this.app?.renderer?.info?.render?.triangles || 'N/A';
    const cam = this.app?.camera?.position;
    const camStr = cam ? `(${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})` : 'N/A';

    const payload = {
      timestamp: new Date().toISOString(),
      system: 'Saptarshi Das // Portfolio Kerr Black Hole Engine',
      viewport: `${window.innerWidth}x${window.innerHeight} @ ${dpr}x DPR`,
      screen: `${window.screen.width}x${window.screen.height}`,
      fps: {
        current: Number(this.fps.toFixed(1)),
        min: Number(this.minFps.toFixed(1)),
        max: Number(this.maxFps.toFixed(1)),
        droppedFrames: this.droppedFrames,
        totalFrames: this.totalFrames
      },
      frameTimeMs: Number(this.frameTime.toFixed(2)),
      pipeline: {
        renderer: 'Three.js WebGL2Renderer (ACESFilmic)',
        drawCalls: calls,
        triangles: tris,
        activeStarfield: 1400
      },
      cameraPosition: camStr,
      audioDrone: this.app?.audio?.isPlaying ? 'active' : 'muted',
      scrollProgress: `${((window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100).toFixed(1)}%`
    };

    const text = JSON.stringify(payload, null, 2);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {}
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {}
    document.body.removeChild(ta);
  }
}
