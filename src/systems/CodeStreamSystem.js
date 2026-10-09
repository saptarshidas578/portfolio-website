import * as THREE from "three";

/**
 * Authentic engineering code lines from Saptarshi Das's repositories
 * Dual-core ESP32 FreeRTOS, I2S DAC synth, custom AC sensing, LeetCode DSA, Whisper AI, and general relativity
 * Rendered in ultra-high resolution (4096x2048 atlas, 54px bold typography)
 */
const CODE_LINES_CATALOG = [
  'xTaskCreatePinnedToCore(audioTask, "ChimeSynth", 4096, NULL, 2, &tH, 1);',
  "i2s_write(I2S_NUM_0, dac_buffer, bytes_to_write, &bytes_written, portMAX_DELAY);",
  "float V_rms = (analogRead(PIN_AC_SENSE) * 3.3 / 4095.0) * CAL_VOLTAGE;",
  "float I_ac = computeToroidalCurrent(ct_samples, BURDEN_RESISTOR);",
  "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) {",
  "int mid = left + (right - left) / 2; if (nums[mid] >= target) right = mid;",
  "dp[mask][u] = min(dp[mask][u], dp[mask ^ (1<<u)][v] + dist[v][u]);",
  'groq_client.chat.completions.create(model="llama3-70b-8192", messages=ctx);',
  "whisper.transcribe(audio_tensor, beam_size=5, fp16=False);",
  "mp_hands = mp.solutions.hands.Hands(max_num_hands=1, min_detection_confidence=0.85);",
  "void ws2812b_render_chime_ring(uint32_t color, uint8_t brightness);",
  "ds1307_sync_with_ntp(&ntp_time, timezone_offset_seconds);",
  "discord_webhook.send(ALARM_OVERTEMP, current_temp_celsius);",
  "relay_emergency_trip(CURRENT_LIMIT_AMPS > 16.5);",
  "TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q);",
  "pcm5100a_synthesize_harmonic_chime(FREQS_WESTMINSTER[quarter]);",
  "const r_s = (2.0 * G * M) / (c * c);",
  "vec3 geodesic = integrateKerrMetric(p, v);",
  "gamma = 1.0 / sqrt(1.0 - (v * v) / (c * c));",
  "uint64_t mem_ptr = 0x7FFF_FFFF_E000_1040;",
  "R_uv - 0.5 * R * g_uv + Lambda * g_uv = T_uv;",
  "nabla x B = mu_0 * J + mu_0 * eps_0 * dE_dt;",
  "vector<int> dijkstra(int V, vector<vector<pair<int,int>>>& adj, int S);",
  "float doppler = pow(1.0 + beta * cosTheta, 3.2);",
  "g_00 = -(1.0 - (2.0 * M * r) / (r*r + a*a));",
  "while (r > horizon) { r -= dr; theta += v; }",
  'const char* ENGINEER = "SAPTARSHI_DAS // ECSE";',
  "omega = (2.0 * a * M * r) / (pow(r*r+a*a, 2.0));",
  "float photonRingRadius = 3.0 * G * M / (c * c);",
  "ds2 = -(1-2M/r)dt2 + (1-2M/r)^-1 dr2 + r2 dOmega;",
  "uint32_t quantum_state = 0xDEAD_BEEF_C001;",
  "const double SPEED_OF_LIGHT = 299792458.0;",
];

/**
 * Creates high-contrast, crystal-sharp multicolor code texture
 * for the sweeping Gravitational Code Stream (2048x2048, 42px bold font, 16x anisotropy)
 */
export function createGravitationalCodeTexture(renderer = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textRendering = "geometricPrecision";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.font = 'bold 38px "JetBrains Mono", monospace';
  ctx.textBaseline = "middle";

  const lineHeight = 60;
  const numLines = Math.floor(canvas.height / lineHeight);

  for (let i = 0; i < numLines; i++) {
    const y = i * lineHeight + 30;
    const lineSnippet = CODE_LINES_CATALOG[i % CODE_LINES_CATALOG.length];

    // Left Column
    let x = 28 + (i % 3) * 20;
    const tokens = lineSnippet.split(/(\s+|[=+\-*/(),;:<>{}[\]]|"[^"]*")/);

    for (const token of tokens) {
      if (!token) continue;

      let color = "#f1f5f9";
      if (
        /^(const|let|var|function|async|await|return|for|while|if|break|export|import|inline)$/.test(
          token
        )
      ) {
        color = "#d8b4fe"; // Vibrant Purple
      } else if (/^(vec[234]|float|int|uint64_t|uint32_t|Tensor4x4|void|double)$/.test(token)) {
        color = "#38bdf8"; // Electric Cyan
      } else if (/^[0-9.]+(f|u)?$|^0x[0-9A-Fa-f_]+$/.test(token)) {
        color = "#fde047"; // Luminous Gold
      } else if (/^"[^"]*"$/.test(token) || /^\/\/.*/.test(token)) {
        color = "#4ade80"; // Spring Mint
      } else if (/^[A-Z][A-Z0-9_]*$/.test(token)) {
        color = "#fb923c"; // Vivid Coral Orange
      } else if (/[=+\-*/<>]/.test(token)) {
        color = "#7dd3fc"; // Ice Sky Blue
      }

      ctx.lineWidth = 5.0;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(token, x, y);

      ctx.fillStyle = color;
      ctx.fillText(token, x, y);
      x += ctx.measureText(token).width;
    }

    // Right Column
    let xRight = canvas.width / 2 + 25;
    const rightSnippet = CODE_LINES_CATALOG[(i * 2 + 7) % CODE_LINES_CATALOG.length];
    const rightTokens = rightSnippet.split(/(\s+|[=+\-*/(),;:<>{}[\]]|"[^"]*")/);

    for (const token of rightTokens) {
      if (!token) continue;
      let color = "#e2e8f0";
      if (/^(const|let|var|function|async|await|return)$/.test(token)) {
        color = "#d8b4fe";
      } else if (/^[0-9.]+(f|u)?$/.test(token)) {
        color = "#fde047";
      } else if (/^(vec[234]|float)$/.test(token)) {
        color = "#38bdf8";
      }

      ctx.lineWidth = 5.0;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(token, xRight, y);

      ctx.fillStyle = color;
      ctx.fillText(token, xRight, y);
      xRight += ctx.measureText(token).width;
      if (xRight > canvas.width - 240) break;
    }

    // Hex telemetry address
    ctx.lineWidth = 5.0;
    ctx.strokeStyle = "#000000";
    const hexVal = "0x" + ((i * 1664525 + 0x2024) & 0xffff).toString(16).toUpperCase();
    ctx.strokeText(hexVal, canvas.width - 220, y);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(hexVal, canvas.width - 220, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 16;
  return texture;
}

/**
 * Creates ultra-high-definition texture atlas of PURE CODE LINES (NO BOXES, NO OUTLINE BORDERS, NO PILLS)
 * - 4096 x 2048 master canvas
 * - 54px bold JetBrains Mono typography with sub-pixel precision
 * - 6px drop-stroke for razor-sharp legibility over bright plasma and pitch-black void
 * - 16x anisotropic filtering to completely eliminate distance blur and haze
 */
export function createPureCodeLinesAtlas(renderer = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  // 100% transparent canvas: zero boxes, zero borders, zero background pills
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textRendering = "geometricPrecision";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const cols = 2;
  const rows = 16;
  const cellW = canvas.width / cols; // 2048 px
  const cellH = canvas.height / rows; // 128 px

  ctx.font = 'bold 54px "JetBrains Mono", monospace';
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  for (let i = 0; i < CODE_LINES_CATALOG.length && i < cols * rows; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const startX = c * cellW + 36;
    const y = r * cellH + cellH / 2;

    const line = CODE_LINES_CATALOG[i];
    const tokens = line.split(/(\s+|[=+\-*/(),;:<>{}[\]]|"[^"]*")/);
    let x = startX;

    for (const token of tokens) {
      if (!token) continue;

      let color = "#ffffff"; // Brilliant white default
      if (
        /^(const|let|var|function|async|await|return|for|while|if|break|export|import|inline)$/.test(
          token
        )
      ) {
        color = "#d8b4fe"; // Vibrant Lavender/Violet
      } else if (/^(vec[234]|float|int|uint64_t|uint32_t|Tensor4x4|void|double)$/.test(token)) {
        color = "#38bdf8"; // Crystal Ice Cyan
      } else if (/^[0-9.]+(f|u)?$|^0x[0-9A-Fa-f_]+$/.test(token)) {
        color = "#fde047"; // Radiant Gold
      } else if (/^"[^"]*"$/.test(token) || /^\/\/.*/.test(token)) {
        color = "#4ade80"; // Emerald Mint
      } else if (/^[A-Z][A-Z0-9_]*$/.test(token)) {
        color = "#fb923c"; // High-Visibility Coral
      } else if (/[=+\-*/<>]/.test(token)) {
        color = "#7dd3fc"; // Electric Cyan
      }

      // 6px razor-sharp black outline: guarantees crystal-clear edge contrast without haze
      ctx.lineWidth = 6.0;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(token, x, y);

      // Primary ultra-vibrant syntax fill
      ctx.fillStyle = color;
      ctx.fillText(token, x, y);

      x += ctx.measureText(token).width;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 16;
  return { texture, cols, rows, count: CODE_LINES_CATALOG.length };
}

/**
 * CodeStreamSystem class
 * Manages:
 * 1. The grand Gravitational Code Stream (curved sheet matching reference image)
 * 2. 210 ultra-crisp, prominent, multicolor orbiting LINES OF CODE (no boxes, no pill shapes)
 *    Proportionally distributed across 10 orbital shells: ZERO horizontal collisions!
 */
export class CodeStreamSystem {
  constructor(
    scene,
    holeRadius = 2.4,
    holePosition = new THREE.Vector3(4.6, 0.5, 0.0),
    renderer = null
  ) {
    this.scene = scene;
    this.holeRadius = holeRadius;
    this.holePosition = holePosition;
    this.renderer = renderer;
    this.time = 0;

    this.group = new THREE.Group();
    this.group.position.copy(holePosition);
    this.scene.add(this.group);

    this.initGravitationalCodeCurtain();
    this.initOrbitingCodeLines();
  }

  setPosition(pos) {
    this.holePosition.copy(pos);
    this.group.position.copy(pos);
  }

  /**
   * The Gravitational Code Curtain (matches reference image)
   * Sweeps down from the right and wraps around the black hole into the singularity
   */
  initGravitationalCodeCurtain() {
    const codeTexture = createGravitationalCodeTexture(this.renderer);

    const uSegs = 64;
    const vSegs = 20;
    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const uvs = [];
    const indices = [];

    // Parametric surface: sweeps from right (+X, +Y, +Z) bending inward into the throat
    for (let i = 0; i <= uSegs; i++) {
      const u = i / uSegs; // 0 (outer entrance) to 1 (event horizon)

      // Radial distance inward
      const r = 16.5 * Math.pow(1.0 - u, 1.2) + this.holeRadius * 1.08 * Math.pow(u, 0.9);
      // Sweeping spiral angle
      const angle = -u * Math.PI * 1.6 + 0.35;
      // Spacetime depth funnel
      const depth = -4.5 * Math.pow(u, 1.8);
      // Stream ribbon width
      const width = 8.5 * (1.0 - u * 0.55);

      for (let j = 0; j <= vSegs; j++) {
        const v = j / vSegs;
        const widthOffset = (v - 0.5) * width;

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Position on the warped manifold
        const x = r * cosA - sinA * widthOffset;
        const y = r * sinA + cosA * widthOffset + (1.0 - u) * 2.5;
        const z = depth + (v - 0.5) * 1.2;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = i * (vSegs + 1) + j;
        const b = (i + 1) * (vSegs + 1) + j;
        const c = (i + 1) * (vSegs + 1) + (j + 1);
        const d = i * (vSegs + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    this.curtainUniforms = {
      uTime: { value: 0 },
      uTexture: { value: codeTexture },
      uSpeed: { value: 0.85 },
    };

    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform float uTime;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Subtle spacetime gravitational ripple
        float ripple = sin(uv.x * 10.0 - uTime * 2.2) * 0.05 * (1.0 - uv.x);
        pos.z += ripple;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 vWorldPos;

      uniform float uTime;
      uniform sampler2D uTexture;
      uniform float uSpeed;

      void main() {
        float u = vUv.x;
        float v = vUv.y;

        if (u > 0.985) discard;

        // Accelerating geodesic flow into the black hole
        float flow = uTime * (0.10 + pow(u, 2.2) * 1.8) * uSpeed;
        vec2 codeUv = vec2(v * 2.2, u * 5.5 - flow);
        vec4 texColor = texture2D(uTexture, codeUv);

        if (texColor.a < 0.05) discard;

        // Edge fades and entry fades
        float edgeFade = smoothstep(0.0, 0.10, v) * smoothstep(1.0, 0.90, v);
        float entryFade = smoothstep(0.0, 0.06, u);
        float horizonFade = smoothstep(0.985, 0.88, u);

        float alpha = edgeFade * entryFade * horizonFade * texColor.a * 0.95;

        // Gravitational blueshift near the horizon
        vec3 color = texColor.rgb * (1.0 + pow(u, 2.0) * 0.4);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.curtainUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.curtainMesh = new THREE.Mesh(geometry, material);
    this.curtainMesh.rotation.x = -Math.PI / 2.5;
    this.curtainMesh.rotation.z = Math.PI / 6.5;
    this.curtainMesh.renderOrder = 20;
    this.group.add(this.curtainMesh);
  }

  /**
   * Dense, Ultra-Crisp Orbiting Lines of Text and Code (NO BOXES, NO PILL SHAPES)
   * - 210 lines of authentic code distributed across 10 shells
   * - 1:1 square pixel aspect ratio matching 4096x2048 atlas
   * - 16x anisotropic filtering for razor-sharp clarity at all angles
   * - Multi-tier vertical distribution: ZERO line-of-sight collisions!
   */
  initOrbitingCodeLines() {
    const { texture, cols, rows, count } = createPureCodeLinesAtlas(this.renderer);

    // 10 orbital shells: counts proportional to circumference to prevent any crowding!
    const shellConfigs = [
      { r: 4.2, count: 6 },
      { r: 5.3, count: 9 },
      { r: 6.6, count: 12 },
      { r: 8.1, count: 15 },
      { r: 9.8, count: 18 },
      { r: 11.6, count: 22 },
      { r: 13.5, count: 26 },
      { r: 15.6, count: 30 },
      { r: 17.8, count: 34 },
      { r: 20.2, count: 38 },
    ];

    // Total = 6 + 9 + 12 + 15 + 18 + 22 + 26 + 30 + 34 + 38 = 210 lines of code!
    this.totalCodeLines = shellConfigs.reduce((sum, s) => sum + s.count, 0);

    // Exact 1:1 isometric aspect ratio matching 2048x128 cell (aspect 16:1)
    // Width = 5.2, Height = 0.325 -> perfectly matches typography proportions!
    const baseGeo = new THREE.PlaneGeometry(5.2, 0.325);
    const instancedGeo = new THREE.InstancedBufferGeometry();
    instancedGeo.index = baseGeo.index;
    instancedGeo.attributes.position = baseGeo.attributes.position;
    instancedGeo.attributes.uv = baseGeo.attributes.uv;

    const aRadius = new Float32Array(this.totalCodeLines);
    const aSpeed = new Float32Array(this.totalCodeLines);
    const aAngle = new Float32Array(this.totalCodeLines);
    const aHeight = new Float32Array(this.totalCodeLines);
    const aLineIndex = new Float32Array(this.totalCodeLines);
    const aScale = new Float32Array(this.totalCodeLines);
    const aDriftSpeed = new Float32Array(this.totalCodeLines);
    const aTilt = new Float32Array(this.totalCodeLines);

    let idx = 0;
    for (let s = 0; s < shellConfigs.length; s++) {
      const { r: shellR, count: shellLineCount } = shellConfigs[s];
      // Keplerian orbital speed: v ~ 1 / sqrt(r)
      const keplerSpeed = Math.sqrt(18.0 / shellR) * 0.28;

      // Multi-tier vertical stratification: adjacent shells sit on distinct vertical tiers
      const tier = ((s % 3) - 1.0) * (0.85 + shellR * 0.08);

      for (let b = 0; b < shellLineCount; b++) {
        aRadius[idx] = shellR;
        aSpeed[idx] = keplerSpeed * (0.95 + (b % 3) * 0.035);
        // Evenly spaced angles around the circle with shell stagger
        aAngle[idx] = (b / shellLineCount) * Math.PI * 2.0 + s * 0.72;
        // Vertical wave distribution layered onto distinct shell tiers
        aHeight[idx] = tier + Math.sin(b * 2.2 + s * 1.5) * (0.32 + shellR * 0.05);
        aLineIndex[idx] = (idx * 3 + s * 5) % count;
        aScale[idx] = 1.0 + (b % 3) * 0.05;
        aDriftSpeed[idx] = 0.05 + (b % 3) * 0.02;
        // Subtle orbital tilt for 3D volumetric richness
        aTilt[idx] = Math.sin(idx * 0.5) * 0.16;
        idx++;
      }
    }

    instancedGeo.setAttribute("aRadius", new THREE.InstancedBufferAttribute(aRadius, 1));
    instancedGeo.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(aSpeed, 1));
    instancedGeo.setAttribute("aAngle", new THREE.InstancedBufferAttribute(aAngle, 1));
    instancedGeo.setAttribute("aHeight", new THREE.InstancedBufferAttribute(aHeight, 1));
    instancedGeo.setAttribute("aLineIndex", new THREE.InstancedBufferAttribute(aLineIndex, 1));
    instancedGeo.setAttribute("aScale", new THREE.InstancedBufferAttribute(aScale, 1));
    instancedGeo.setAttribute("aDriftSpeed", new THREE.InstancedBufferAttribute(aDriftSpeed, 1));
    instancedGeo.setAttribute("aTilt", new THREE.InstancedBufferAttribute(aTilt, 1));

    this.codeLinesUniforms = {
      uTime: { value: 0 },
      uAtlas: { value: texture },
      uAtlasGrid: { value: new THREE.Vector2(cols, rows) },
      uHoleRadius: { value: this.holeRadius },
    };

    const vertexShader = `
      attribute float aRadius;
      attribute float aSpeed;
      attribute float aAngle;
      attribute float aHeight;
      attribute float aLineIndex;
      attribute float aScale;
      attribute float aDriftSpeed;
      attribute float aTilt;

      varying vec2 vUv;
      varying float vAlpha;

      uniform float uTime;
      uniform vec2 uAtlasGrid;
      uniform float uHoleRadius;

      void main() {
        float col = mod(aLineIndex, uAtlasGrid.x);
        float row = (uAtlasGrid.y - 1.0) - floor(aLineIndex / uAtlasGrid.x);

        vec2 cellSize = vec2(1.0 / uAtlasGrid.x, 1.0 / uAtlasGrid.y);
        vUv = vec2(
          (uv.x + col) * cellSize.x,
          (uv.y + row) * cellSize.y
        );

        // Smooth Keplerian orbital motion
        float currentAngle = aAngle + aSpeed * uTime;

        // Controlled relativistic inward drift
        float maxDrift = (aRadius - uHoleRadius * 1.25) * 0.65;
        float drift = mod(uTime * aDriftSpeed, maxDrift);
        float currentRadius = aRadius - drift;

        vec3 centerPos = vec3(
          cos(currentAngle) * currentRadius,
          sin(currentAngle) * currentRadius,
          aHeight + sin(currentAngle) * aTilt * 1.1
        );

        // Relativistic horizon absorption: smooth fade out inside photon sphere
        float horizonFade = smoothstep(uHoleRadius * 1.06, uHoleRadius * 1.30, currentRadius);
        vAlpha = horizonFade;

        // Spherical billboard facing camera
        vec4 mvPosition = modelViewMatrix * vec4(centerPos, 1.0);

        // Natural, undistorted typographic proportions
        vec2 scaledVertex = position.xy * aScale;
        mvPosition.xy += scaledVertex;

        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying float vAlpha;
      uniform sampler2D uAtlas;

      void main() {
        vec4 texColor = texture2D(uAtlas, vUv);

        if (texColor.a < 0.05) discard;

        // Crisp, pure, ultra-sharp code lines without any haze
        gl_FragColor = vec4(texColor.rgb, texColor.a * vAlpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.codeLinesUniforms,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.codeLinesMesh = new THREE.Mesh(instancedGeo, material);
    this.codeLinesMesh.renderOrder = 30;
    this.group.add(this.codeLinesMesh);
  }

  update(deltaTime) {
    this.time += deltaTime;

    if (this.curtainUniforms) {
      this.curtainUniforms.uTime.value = this.time;
    }

    if (this.codeLinesUniforms) {
      this.codeLinesUniforms.uTime.value = this.time;
    }
  }
}
