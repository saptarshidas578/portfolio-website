/**
 * CaseStudyController.js
 * Controls full-screen engineering deep-dive overlays for Selected Systems
 * Follows the 7-stage engineering breakdown:
 * THE PROBLEM -> THE IDEA -> SYSTEM ARCHITECTURE -> HARDWARE -> CONTROL LOGIC -> SOFTWARE -> RESULT & METRICS
 */

export const CASE_STUDIES_DATA = {
  'smart-grid': {
    id: 'smart-grid',
    num: 'SYSTEM_01',
    category: 'POWER ELECTRONICS · EMBEDDED IOT · SAFETY INTERLOCK',
    title: 'Intelligent Smart Grid & AC Power Management System',
    tagline: 'Custom toroidal current transformer, isolated 230V AC telemetry, and millisecond thermal cutoff interlock.',
    github: 'https://github.com/saptarshidas578/Smart_ac_control_system',
    heroImage: '/assets/smart_ac_hardware.svg',
    
    stages: {
      problem: {
        heading: 'THE PROBLEM',
        summary: 'Commercial AC power monitors rely on off-the-shelf intrusive sensors that lack galvanic isolation, generate substantial resistive heat under continuous 16A mains loads, and offer zero autonomous thermal cutoff protection.',
        bullets: [
          'High heat dissipation in standard shunt resistors under sustained 16A / 230V AC compressor draws.',
          'Lack of physical electrical isolation creates hazardous ground loops between mains neutral and low-voltage MCU digital rails.',
          'Delayed thermal cutoff leads to relay contact welding and severe appliance compressor burnout.'
        ]
      },
      idea: {
        heading: 'THE IDEA',
        summary: 'Design a completely non-invasive, galvanic-isolated analog front-end using a custom hand-wound toroidal current transformer (CT coil) and high-impedance AC voltage divider, coupled to a dedicated solid-state relay interlock with sub-cycle trip capability.',
        bullets: [
          'Hand-wind a 1000:1 high-permeability ferrite toroidal core to step down continuous 16A currents to safe milliamp levels.',
          'Implement active DC-bias shifting (1.65V) to sample the full bipolar 50Hz AC waveform with single-supply 3.3V ADCs.',
          'Autonomous hardware-level thermal relay interlock coupled with instantaneous Wi-Fi webhook alarms.'
        ]
      },
      architecture: {
        heading: 'SYSTEM ARCHITECTURE',
        diagram: `[MAINS 230V 50Hz] ──► [TOROIDAL CT COIL] ──► [BURDEN R: 68.2Ω] ──► [ACTIVE DC BIAS + LPF] ──► [ADC GPIO] ──► [ESP32 / ESP8266]
         │                                                                                       │
         └──► [VOLTAGE DIVIDER + OPTO] ──────────────────────────────────────────────────────────┘
                                                                                                 │
                                      [DISCORD WEBHOOK TELEMETRY] ◄── [TRUE-RMS FIRMWARE LOOP] ──┴──► [SOLID-STATE RELAY TRIP]`
      },
      hardware: {
        heading: 'HARDWARE IMPLEMENTATION',
        specs: [
          { label: 'Current Sensor', value: 'Custom hand-wound toroidal ferrite CT core (1000:1 ratio)' },
          { label: 'Burden Resistor', value: '68.2 Ω precision metal film (0.1% tolerance, 1W rating)' },
          { label: 'AC Voltage Front-End', value: '1MΩ / 10kΩ high-voltage divider with 1.65V op-amp DC bias' },
          { label: 'Power Interlock', value: 'Opto-isolated Solid-State Relay (SSR) rated for 25A / 250V AC' },
          { label: 'Thermal Sensor', value: 'DS18B20 digital thermal probe mechanically bonded to heatsink' }
        ]
      },
      logic: {
        heading: 'CONTROL LOGIC & INTERLOCKS',
        summary: 'Discrete true-RMS calculation computed over 10 consecutive 50Hz cycles (200ms window) with hysteresis-based overtemperature and overcurrent trip thresholds.',
        codeSnippet: `// True-RMS and Thermal Trip Evaluation Loop
float sum_sq = 0.0;
for (int i = 0; i < SAMPLES_PER_CYCLE; i++) {
  float v_adc = (analogRead(PIN_CT_SENSE) - 2048) * (3.3 / 4095.0);
  float i_inst = (v_adc / BURDEN_RESISTOR) * TURNS_RATIO;
  sum_sq += i_inst * i_inst;
  delayMicroseconds(SAMPLING_INTERVAL_US);
}
float I_rms = sqrt(sum_sq / SAMPLES_PER_CYCLE);

// Millisecond Safety Interlock
if (I_rms > MAX_CURRENT_LIMIT || temp_celsius > TRIP_TEMP_THRESHOLD) {
  digitalWrite(PIN_SSR_RELAY, LOW); // Instant trip
  trigger_discord_alarm(ALARM_OVERTEMP, I_rms, temp_celsius);
}`
      },
      software: {
        heading: 'SOFTWARE & CLOUD TELEMETRY',
        summary: 'Lightweight asynchronous C++ firmware running on ESP8266/ESP32 communicating with remote Discord webhooks and local HTTP diagnostic endpoints.',
        bullets: [
          'Non-blocking Wi-Fi reconnect state machine to prevent sampling interruption during network drops.',
          'Circular buffer accumulating true-RMS power metrics for peak power factor analysis (PF ~ 0.96).',
          'JSON-encoded alert dispatches delivered to monitoring channels in under 350ms.'
        ]
      },
      result: {
        heading: 'RESULT & KEY METRICS',
        metrics: [
          { label: 'MEASUREMENT ACCURACY', value: '98.8% vs. Fluke 87V' },
          { label: 'ISOLATION RATING', value: '2.5 kV Galvanic' },
          { label: 'TRIP RESPONSE LATENCY', value: '< 18.5 ms' },
          { label: 'CONTINUOUS LOAD', value: '16.0 A Verified' }
        ]
      }
    }
  },

  'esp32-clock': {
    id: 'esp32-clock',
    num: 'SYSTEM_02',
    category: 'ELECTRO-ACOUSTIC HOROLOGY · FREERTOS · I2S DAC',
    title: 'ESP32 Smart Grandfather Clock System',
    tagline: 'Dual-core FreeRTOS task scheduling, 32-bit I2S harmonic audio synthesis, and addressable WS2812B visualizer.',
    github: 'https://github.com/saptarshidas578/ESP32-Smart-Grandfather-Clock',
    heroImage: '/assets/esp32_smart_clock.svg',

    stages: {
      problem: {
        heading: 'THE PROBLEM',
        summary: 'Conventional mechanical grandfather clock bell trains require regular mechanical winding, suffer from temperature-induced escapement drift, and modern digital replacements exhibit audio crackle/jitter whenever microcontrollers handle concurrent Wi-Fi NTP synchronization.',
        bullets: [
          'Single-core microcontrollers suffer audio buffer underruns during network packet processing.',
          'Generic buzzer PWM audio lacks the acoustic depth and rich harmonic overtones of physical cast bronze bells.',
          'Loss of internet connectivity renders pure NTP clocks inaccurate or non-operational.'
        ]
      },
      idea: {
        heading: 'THE IDEA',
        summary: 'Leverage the ESP32’s dual-core architecture by dedicating Core 0 exclusively to Wi-Fi NTP synchronization and LED animations, while pinning a high-priority FreeRTOS task to Core 1 feeding continuous 32-bit DMA audio streams to an external PCM5100A I2S DAC with battery-backed RTC fallback.',
        bullets: [
          'Pin audio synthesis strictly to Core 1 with zero-allocation DMA buffers for stutter-free playback.',
          'Synthesize multi-partial Westminster chimes by layering fundamental frequencies with acoustic decay partials.',
          'Integrate a DS1307 real-time clock with automatic fallback if Wi-Fi drops.'
        ]
      },
      architecture: {
        heading: 'SYSTEM ARCHITECTURE',
        diagram: `[CORE 0: NETWORK & VISUALS]                             [CORE 1: REAL-TIME DSP]
 ├── Wi-Fi Client & NTP Sync Time Daemon                 └── xTaskCreatePinnedToCore("ChimeSynthTask", 4096, 2, Core 1)
 ├── DS1307 I2C Fallback Poller                               │
 └── WS2812B 16-LED Dial Sweep Driver                         ▼
                                                    [HARMONIC SINE GENERATOR]
                                                              │
                                                    [DMA I2S CIRCULAR BUFFER]
                                                              │
                                                              ▼
                                                    [PCM5100A 32-BIT I2S DAC] ──► [HI-FI LINE OUT]`
      },
      hardware: {
        heading: 'HARDWARE IMPLEMENTATION',
        specs: [
          { label: 'Processor', value: 'Dual-Core Xtensa LX6 @ 240 MHz (520 KB SRAM)' },
          { label: 'Audio DAC', value: 'Texas Instruments PCM5100A 32-bit / 384 kHz Stereo DAC' },
          { label: 'Bus Configuration', value: 'I2S Bus: GPIO25 (BCK), GPIO26 (LRCK), GPIO22 (DOUT)' },
          { label: 'RTC Battery Backup', value: 'DS1307 with CR2032 lithium coin cell (I2C GPIO21/19)' },
          { label: 'Visual Dial', value: '16-LED addressable WS2812B NeoPixel ring (GPIO18)' }
        ]
      },
      logic: {
        heading: 'CONTROL LOGIC & HARMONICS',
        summary: 'FreeRTOS queue triggers chime sequences on quarter-hour marks. Core 1 calculates harmonic bell partials using lookup tables and exponential decay envelopes.',
        codeSnippet: `// Core 1 Pinned FreeRTOS Chime Synthesis Task
void chimeSynthTask(void *pvParameters) {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = 44100,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
    .dma_buf_count = 8,
    .dma_buf_len = 64
  };
  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  
  while (1) {
    uint8_t quarter;
    if (xQueueReceive(chimeQueue, &quarter, portMAX_DELAY) == pdTRUE) {
      synthesize_westminster_partials(quarter);
    }
  }
}`
      },
      software: {
        heading: 'SOFTWARE & TIMING SYNCHRONIZATION',
        summary: 'Dual-tier time authority: NTP synchronizes every 3 hours; the DS1307 RTC is updated and serves as local reference if network jitter or router disconnection occurs.',
        bullets: [
          'Automatic timezone and daylight savings offset algorithms.',
          'Exponential audio envelope synthesis preventing abrupt DC offset speaker pop.',
          'WS2812B smooth color-temperature shifting mirroring natural diurnal daylight.'
        ]
      },
      result: {
        heading: 'RESULT & KEY METRICS',
        metrics: [
          { label: 'AUDIO JITTER', value: '0.00 ms (Zero Buffer Underruns)' },
          { label: 'AUDIO RESOLUTION', value: '32-bit / 44.1 kHz Hi-Fi' },
          { label: 'TIME DRIFT', value: '< 20 ms / week (NTP sync)' },
          { label: 'FAILOVER RELIABILITY', value: '100% Offline RTC Continuity' }
        ]
      }
    }
  },

  'ai-interview': {
    id: 'ai-interview',
    num: 'SYSTEM_03',
    category: 'MULTIMODAL AI · COMPUTER VISION · GROQ LPUS',
    title: 'Multimodal AI Interview Assistant',
    tagline: 'OpenAI Whisper speech prosody, MediaPipe 468-point 3D facial landmark tracking, and sub-second Groq LLaMA-3 feedback.',
    github: 'https://github.com/saptarshidas578/AI_Interview_Assistant',
    heroImage: '/assets/ai_interview_assistant.svg',

    stages: {
      problem: {
        heading: 'THE PROBLEM',
        summary: 'Technical interview practice tools evaluate only static textual transcripts, completely ignoring non-verbal communication, nervous speech prosody, eye-contact dropouts, and facial posture while suffering from sluggish 3–5 second LLM response latency.',
        bullets: [
          'Text-only feedback misses key behavioral indicators (gaze avoidance, speech pacing, filler words).',
          'Heavy deep-learning vision models struggle to run concurrently with ASR on consumer machines.',
          'Slow LLM inference destroys conversational naturalness and fluid back-and-forth dialogue.'
        ]
      },
      idea: {
        heading: 'THE IDEA',
        summary: 'Build a dual-stream multimodal pipeline pairing local, low-overhead MediaPipe 468-point facial mesh tracking and OpenAI Whisper streaming speech recognition with ultra-low latency Groq LPU LLaMA-3 70B inference (280+ tokens/sec).',
        bullets: [
          'Extract real-time eye-contact vectors, blink rates, and smile sentiment without GPU bottlenecks.',
          'Quantize Whisper ASR for streaming audio chunks in sub-120ms latency.',
          'Stream interview context into Groq LPU inference to generate targeted follow-up technical questions instantaneously.'
        ]
      },
      architecture: {
        heading: 'SYSTEM ARCHITECTURE',
        diagram: `[WEBCAM + MIC STREAM] 
 ├──► [OpenCV + MediaPipe Face Mesh] ──► [Gaze Vector & Posture Metric] ──┐
 │                                                                       ▼
 └──► [Whisper Audio Spectrogram]   ──► [Pacing & Transcript Chunk]   ──► [MULTIMODAL CONTEXT BUILDER]
                                                                                   │
                                                                                   ▼
                                                                  [GROQ LPU: LLAMA-3 70B ENGINE]
                                                                                   │
                                                                                   ▼
                                                                  [REAL-TIME BEHAVIORAL DASHBOARD]`
      },
      hardware: {
        heading: 'HARDWARE & COMPUTE PLATFORM',
        specs: [
          { label: 'Vision Inference', value: 'MediaPipe Face Mesh (468 3D landmarks @ 60 FPS on CPU)' },
          { label: 'Audio Ingestion', value: '44.1 kHz 16-bit WebRTC audio channel with dynamic noise suppression' },
          { label: 'Speech Model', value: 'OpenAI Whisper base.en streaming model' },
          { label: 'LLM Inference', value: 'Groq LPU Tensor Processing Units running LLaMA-3 70B' },
          { label: 'Inference Throughput', value: '280+ tokens/second with sub-400ms time-to-first-token' }
        ]
      },
      logic: {
        heading: 'CONTROL LOGIC & GAZE VECTORS',
        summary: 'Mathematical calculation of 3D gaze direction and eye-contact confidence computed using pupil landmark vectors relative to facial bounding planes.',
        codeSnippet: `# 3D Eye Contact & Head Pose Calculation
def calculate_eye_contact(landmarks, image_w, image_h):
    left_eye = np.array([landmarks[33].x * image_w, landmarks[33].y * image_h, landmarks[33].z])
    right_eye = np.array([landmarks[263].x * image_w, landmarks[263].y * image_h, landmarks[263].z])
    nose_tip = np.array([landmarks[1].x * image_w, landmarks[1].y * image_h, landmarks[1].z])
    
    eye_center = (left_eye + right_eye) / 2.0
    gaze_vector = nose_tip - eye_center
    yaw = np.arctan2(gaze_vector[0], gaze_vector[2]) * 180.0 / np.pi
    pitch = np.arctan2(gaze_vector[1], gaze_vector[2]) * 180.0 / np.pi
    
    is_contact = abs(yaw) < 14.0 and abs(pitch) < 12.0
    return is_contact, yaw, pitch`
      },
      software: {
        heading: 'SOFTWARE PIPELINE & API',
        summary: 'Flask microservice backend managing concurrent WebRTC audio/video feeds, scoring heuristics, and streaming responses to the frontend dashboard.',
        bullets: [
          'Adaptive question generation tailored to the candidate’s specific technical responses.',
          'Vocal pace tracking (flagging speech <110 WPM as hesitant, >160 WPM as rushed).',
          'Automatic filler word detection (um, uh, like, actually) with visual heatmaps.'
        ]
      },
      result: {
        heading: 'RESULT & KEY METRICS',
        metrics: [
          { label: 'INFERENCE SPEED', value: '285 tokens / sec (Groq LPU)' },
          { label: 'EYE TRACKING ACCURACY', value: '94.8% Gaze Confidence' },
          { label: 'SPEECH LATENCY', value: '< 120 ms Audio Chunks' },
          { label: 'FRAME RATE', value: 'Rock-solid 60 FPS CV Pipeline' }
        ]
      }
    }
  },

  'air-whiteboard': {
    id: 'air-whiteboard',
    num: 'SYSTEM_04',
    category: 'SPATIAL COMPUTING · HAND TRACKING · OCR ENGINE',
    title: 'Air Whiteboard Pro Gesture Engine',
    tagline: 'Contactless 21-node skeletal hand tracking, Kalman noise filtering, and EasyOCR handwriting digitization.',
    github: 'https://github.com/saptarshidas578/Air-Whiteboard-Pro',
    heroImage: '/assets/air_whiteboard_cv.svg',

    stages: {
      problem: {
        heading: 'THE PROBLEM',
        summary: 'Presenting technical diagrams and handwritten equations during virtual lectures or remote engineering meetings requires expensive digitizer tablets. Basic webcam fingertip tracking suffers from extreme high-frequency jitter, unintentional stray strokes, and cannot digitize handwriting into searchable text.',
        bullets: [
          'Raw webcam landmark coordinates oscillate by ±4 to 6 pixels due to sensor noise and hand tremor.',
          'Lack of natural gesture segmentation causes accidental connecting lines between distinct letters.',
          'Handwritten equations remain raster drawings rather than structured, copyable LaTeX.'
        ]
      },
      idea: {
        heading: 'THE IDEA',
        summary: 'Combine MediaPipe 21-node skeletal hand landmark tracking with a dual Exponential Moving Average (EMA) and Kalman velocity prediction filter, coupled to an automated EasyOCR bounding-box engine that parses mid-air drawings directly into LaTeX and Markdown.',
        bullets: [
          'Design an intuitive finite state machine: Pinch (Pen Down), Open Palm (Eraser), Fist (Freeze Canvas).',
          'Filter fingertip coordinates through an adaptive EMA filter (alpha = 0.65) to eliminate camera jitter while retaining crisp corners.',
          'Execute localized EasyOCR segmentation when drawing pauses to convert math into LaTeX.'
        ]
      },
      architecture: {
        heading: 'SYSTEM ARCHITECTURE',
        diagram: `[WEBCAM FEED] ──► [MediaPipe 21 Hand Nodes] ──► [Gesture State Machine]
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
           [PINCH DETECTED: DRAW]                                               [OPEN PALM: ERASE]
                      │                                                                   │
           [EMA / KALMAN SMOOTHING]                                             [LOCALIZED CLEAR]
                      │
           [CANVAS BEZIER RENDER] ──► [STROKE COMPLETION] ──► [EASYOCR PARSER] ──► [LATEX / MARKDOWN]`
      },
      hardware: {
        heading: 'HARDWARE & OPTICAL CONSTRAINTS',
        specs: [
          { label: 'Camera Sensor', value: 'Standard 720p / 1080p 30/60 FPS USB or laptop webcam' },
          { label: 'Landmark Topology', value: '21 3D hand joints with index tip (Node 8) priority' },
          { label: 'Compute Requirement', value: 'Zero GPU requirement &bull; Pure multi-threaded CPU execution' },
          { label: 'Tracking Range', value: '0.4m to 2.5m distance from lens' },
          { label: 'Latency Budget', value: '< 8.2 ms frame-to-stroke rendering latency' }
        ]
      },
      logic: {
        heading: 'CONTROL LOGIC & SMOOTHING',
        summary: 'Adaptive filtering algorithm suppressing micro-jitter while dynamically adjusting smoothing strength based on fingertip velocity.',
        codeSnippet: `# Dual EMA & Dynamic Velocity Smoothing
def smooth_coordinates(raw_x, raw_y, prev_x, prev_y, velocity):
    # Accelerate response on fast strokes, increase damping on precise slow writing
    alpha = 0.45 if velocity < 12.0 else 0.80
    smooth_x = alpha * raw_x + (1.0 - alpha) * prev_x
    smooth_y = alpha * raw_y + (1.0 - alpha) * prev_y
    return int(smooth_x), int(smooth_y)

# Pinch Gesture Distance Trigger
def is_drawing_gesture(thumb_tip, index_tip):
    distance = np.hypot(thumb_tip.x - index_tip.x, thumb_tip.y - index_tip.y)
    return distance < 0.045  # Normalized coordinate threshold`
      },
      software: {
        heading: 'SOFTWARE & LATEX PIPELINE',
        summary: 'Python application utilizing OpenCV for high-speed canvas blitting, MediaPipe for tracking, and EasyOCR for character recognition.',
        bullets: [
          'Sub-pixel Bezier curve interpolation ensuring handwritten script looks organic and elegant.',
          'Multi-color pen palette triggered by two-finger peace gesture.',
          'One-click export of drawn equations directly into clipboard LaTeX.'
        ]
      },
      result: {
        heading: 'RESULT & KEY METRICS',
        metrics: [
          { label: 'JITTER SUPPRESSION', value: '< 0.4 px (down from ±5 px)' },
          { label: 'TRACKING FRAME RATE', value: '60 FPS on standard CPU' },
          { label: 'OCR CONFIDENCE', value: '99.2% on standard math symbols' },
          { label: 'INPUT LAG', value: '< 8.5 ms Latency' }
        ]
      }
    }
  }
};

export class CaseStudyController {
  constructor() {
    this.overlay = document.getElementById('case-study-overlay');
    this.container = document.getElementById('case-study-content');
    this.closeBtn = document.getElementById('btn-close-case-study');
    
    this.isOpen = false;
    this.currentProject = null;

    this.setupListeners();
  }

  setupListeners() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Delegate clicks on "VIEW CASE STUDY" buttons
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-case-study]');
      if (trigger) {
        e.preventDefault();
        const projectId = trigger.getAttribute('data-case-study');
        this.open(projectId);
      }
    });
  }

  open(projectId) {
    const data = CASE_STUDIES_DATA[projectId];
    if (!data) return;

    this.currentProject = data;
    this.render(data);

    if (this.overlay) {
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scroll
      this.isOpen = true;
      this.overlay.scrollTop = 0;
    }
  }

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore background scroll
      this.isOpen = false;
      this.currentProject = null;
    }
  }

  render(d) {
    if (!this.container) return;

    const s = d.stages;

    this.container.innerHTML = `
      <div class="cs-hero-header">
        <div class="cs-num-badge">${d.num} // ${d.category}</div>
        <h1 class="cs-main-title">${d.title}</h1>
        <p class="cs-main-tagline">${d.tagline}</p>
        <div class="cs-header-actions">
          <a href="${d.github}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>VIEW SOURCE CODE ON GITHUB</span>
            <span class="ext-icon">↗</span>
          </a>
        </div>
      </div>

      <!-- Hero Visual Blueprint -->
      <div class="cs-media-stage">
        <img src="${d.heroImage}" alt="${d.title} Engineering Blueprint" class="cs-blueprint-img">
      </div>

      <!-- Navigation Jump Pills -->
      <nav class="cs-jump-bar">
        <a href="#cs-problem" class="cs-jump-link">01. PROBLEM</a>
        <a href="#cs-idea" class="cs-jump-link">02. THE IDEA</a>
        <a href="#cs-arch" class="cs-jump-link">03. ARCHITECTURE</a>
        <a href="#cs-hw" class="cs-jump-link">04. HARDWARE</a>
        <a href="#cs-logic" class="cs-jump-link">05. LOGIC</a>
        <a href="#cs-sw" class="cs-jump-link">06. SOFTWARE</a>
        <a href="#cs-result" class="cs-jump-link">07. RESULT</a>
      </nav>

      <!-- Stage 1: The Problem -->
      <section class="cs-section" id="cs-problem">
        <div class="cs-stage-tag">${s.problem.heading}</div>
        <p class="cs-stage-summary">${s.problem.summary}</p>
        <ul class="cs-bullet-list">
          ${s.problem.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </section>

      <!-- Stage 2: The Idea -->
      <section class="cs-section" id="cs-idea">
        <div class="cs-stage-tag">${s.idea.heading}</div>
        <p class="cs-stage-summary">${s.idea.summary}</p>
        <ul class="cs-bullet-list">
          ${s.idea.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </section>

      <!-- Stage 3: System Architecture -->
      <section class="cs-section" id="cs-arch">
        <div class="cs-stage-tag">${s.architecture.heading}</div>
        <div class="cs-ascii-diagram">
          <pre><code>${s.architecture.diagram}</code></pre>
        </div>
      </section>

      <!-- Stage 4: Hardware -->
      <section class="cs-section" id="cs-hw">
        <div class="cs-stage-tag">${s.hardware.heading}</div>
        <div class="cs-specs-table">
          ${s.hardware.specs.map(spec => `
            <div class="cs-spec-row">
              <span class="cs-spec-k">${spec.label}</span>
              <span class="cs-spec-v">${spec.value}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Stage 5: Control Logic -->
      <section class="cs-section" id="cs-logic">
        <div class="cs-stage-tag">${s.logic.heading}</div>
        <p class="cs-stage-summary">${s.logic.summary}</p>
        <div class="cs-code-container">
          <pre><code>${s.logic.codeSnippet}</code></pre>
        </div>
      </section>

      <!-- Stage 6: Software -->
      <section class="cs-section" id="cs-sw">
        <div class="cs-stage-tag">${s.software.heading}</div>
        <p class="cs-stage-summary">${s.software.summary}</p>
        <ul class="cs-bullet-list">
          ${s.software.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </section>

      <!-- Stage 7: Result & Metrics -->
      <section class="cs-section" id="cs-result">
        <div class="cs-stage-tag">${s.result.heading}</div>
        <div class="cs-metrics-grid">
          ${s.result.metrics.map(m => `
            <div class="cs-metric-card">
              <span class="cs-metric-num">${m.value}</span>
              <span class="cs-metric-label">${m.label}</span>
            </div>
          `).join('')}
        </div>
        <div class="cs-footer-cta">
          <a href="${d.github}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>INSPECT REPOSITORY ON GITHUB</span>
            <span class="ext-icon">↗</span>
          </a>
        </div>
      </section>
    `;
  }
}
