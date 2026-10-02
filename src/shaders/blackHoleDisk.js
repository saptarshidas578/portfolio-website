/**
 * High-Performance Astrophysical Shaders for the Kerr Black Hole & Accretion Disk
 * - Authentic General Relativity visuals matching reference image (Interstellar / Kip Thorne)
 * - Toned down core brightness: warm liquid gold and amber, zero white blowout
 * - Ultra-efficient analytical math for smooth 60+ FPS on all hardware
 * - Pitch-black event horizon shadow (strict discard inside R_s)
 * - Realistic relativistic Doppler beaming & delicate golden caustic
 */

export const diskVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPos;
  varying float vRadius;

  uniform float uHoleRadius;
  uniform float uDiskOuter;
  uniform float uFunnelDepth;

  void main() {
    vUv = uv;
    vec3 pos = position;
    vLocalPos = pos;
    
    float r = length(pos.xy);
    vRadius = r;
    
    // Spacetime funnel curvature (Flamm's paraboloid throat)
    if (r > uHoleRadius) {
      float normR = clamp((r - uHoleRadius) / (uDiskOuter - uHoleRadius), 0.0, 1.0);
      pos.z -= uFunnelDepth * pow(1.0 - normR, 1.6);
    }

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const diskFragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPos;
  varying float vRadius;

  uniform float uTime;
  uniform float uHoleRadius;
  uniform float uDiskInner;
  uniform float uDiskOuter;
  uniform vec3 uCameraPos;
  uniform float uDopplerStrength;

  // Ultra-fast analytical procedural turbulence (0 texture lookups, 60+ FPS)
  float fastNoise(vec2 p) {
    return sin(p.x * 3.14 + sin(p.y * 2.2)) * cos(p.y * 2.8 + sin(p.x * 2.5)) * 0.5 + 0.5;
  }

  void main() {
    float r = vRadius;

    // Strict discard inside event horizon shadow boundary
    if (r < uHoleRadius * 1.02) {
      discard;
    }

    float tRadial = clamp((r - uDiskInner) / (uDiskOuter - uDiskInner), 0.0, 1.0);
    float angle = atan(vLocalPos.y, vLocalPos.x);

    // Differential Keplerian orbital velocity: v ~ 1 / sqrt(r)
    float keplerSpeed = pow(uDiskInner / max(r, 0.1), 1.2) * 1.8;
    float rotAngle = angle - uTime * keplerSpeed * 0.35;

    // Multi-scale swirling plasma filaments
    vec2 p1 = vec2(rotAngle * 3.5, r * 1.5 - uTime * 0.35);
    vec2 p2 = vec2(rotAngle * 7.5 + sin(r * 2.0), r * 3.6 - uTime * 0.7);
    float n1 = fastNoise(p1);
    float n2 = fastNoise(p2);
    float density = clamp(0.35 + 0.45 * n1 + 0.25 * n2, 0.0, 1.0);

    // Striated relativistic plasma bands
    float striations = pow(abs(sin(rotAngle * 6.0 + n1 * 3.5)), 3.0) * 0.30;
    density += striations;

    // Relativistic Doppler Beaming in local disk coordinate frame
    // Approaching side (left) is warmer and slightly brighter, receding (right) is deeper amber
    vec3 radialDir = normalize(vLocalPos);
    vec3 velDir = vec3(-radialDir.y, radialDir.x, 0.0);
    float dopplerCos = velDir.x; // left side is +X velocity approaching
    float dopplerFactor = clamp(1.0 + 0.28 * dopplerCos * uDopplerStrength, 0.72, 1.28);

    // Refined Blackbody Palette (Deep, rich incandescent gold/amber, zero whiteout):
    // Core: molten gold (#f59e0b)
    // Inner ring: warm amber (#d97706)
    // Mid ring: fiery orange (#c2410c)
    // Outer edge: deep bronze copper (#7c2d12), smoothly fading to pitch black
    vec3 colWarmHoney = vec3(0.95, 0.58, 0.08);
    vec3 colAmberGold = vec3(0.90, 0.42, 0.04);
    vec3 colFieryOrange = vec3(0.78, 0.24, 0.02);
    vec3 colBronzeRed = vec3(0.48, 0.09, 0.01);

    vec3 baseColor;
    if (tRadial < 0.22) {
      baseColor = mix(colWarmHoney, colAmberGold, tRadial / 0.22);
    } else if (tRadial < 0.60) {
      baseColor = mix(colAmberGold, colFieryOrange, (tRadial - 0.22) / 0.38);
    } else {
      baseColor = mix(colFieryOrange, colBronzeRed * 0.6, (tRadial - 0.60) / 0.40);
    }

    // Radial intensity falloff
    float innerFade = smoothstep(uHoleRadius * 1.02, uDiskInner + 0.25, r);
    float outerFade = smoothstep(uDiskOuter, uDiskOuter - 2.0, r);
    float radialProfile = innerFade * outerFade;

    // Subtle, warm golden caustic (never white)
    float photonRing = exp(-pow((r - uHoleRadius * 1.07) / 0.035, 2.0)) * 0.25;

    vec3 finalColor = baseColor * (density * 0.75 + photonRing * 0.35) * dopplerFactor;

    // Strict luminance cap: guarantees eye-appealing warm golden-amber and ZERO white blowout
    finalColor = min(finalColor, vec3(0.92, 0.62, 0.12));

    float alpha = radialProfile * clamp(density * 0.75 + photonRing * 0.50, 0.0, 0.88);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * Gravitational Lensing Arc Shaders (Einstein Ring Halo)
 * Light from the back of the disk curved over and under the event horizon
 */
export const lensingArcVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const lensingArcFragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  uniform float uTime;
  uniform float uHoleRadius;
  uniform float uIsUpper;

  void main() {
    float along = (vUv.x - 0.5) * 2.0; // -1.0 to 1.0
    float across = vUv.y;              // 0.0 (inner) to 1.0 (outer)

    // Bell curve profile across radial thickness
    float profile = exp(-pow((across - 0.28) / 0.25, 2.0));

    // Doppler asymmetry: left side approaching is warmer
    float doppler = clamp(1.0 - along * 0.35, 0.65, 1.35);

    // Subtle plasma shimmer along arc
    float shimmer = 0.95 + 0.05 * sin(along * 10.0 - uTime * 2.5);

    // Warm golden-amber colors matching disk (zero harsh whiteout)
    vec3 colCore = vec3(0.92, 0.55, 0.08);
    vec3 colGold = vec3(0.85, 0.38, 0.04);
    vec3 colAmber = vec3(0.68, 0.18, 0.02);

    vec3 color = mix(colCore, colGold, across);
    if (across > 0.45) {
      color = mix(colGold, colAmber, (across - 0.45) / 0.55);
    }

    float arcEndFade = smoothstep(1.0, 0.60, abs(along));
    float alpha = profile * arcEndFade * 0.70;

    // Lower arc is kept subtle so it doesn't additively blow out with the front disk
    float arcMult = uIsUpper > 0.5 ? 0.65 : 0.20;
    vec3 finalColor = color * profile * doppler * shimmer * arcMult;

    // Strict cap preventing whiteout
    finalColor = min(finalColor, vec3(0.88, 0.52, 0.10));

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * Relativistic Polar Plasma Jet Shaders (Blandford-Znajek Synchrotron Beams)
 * Collimated, glowing magnetic outflow perpendicular to accretion disk along Z axis
 */
export const polarJetBeamVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vLocalPos;

  uniform float uTime;
  uniform float uSpeedMultiplier;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;

    // Helical wave perturbations along the jet column (standing along Z axis)
    float wavePhase = pos.z * 1.4 - uTime * 5.0 * uSpeedMultiplier;
    float waveAmp = 0.05 * (abs(pos.z) / 22.0);
    pos.x += sin(wavePhase) * waveAmp;
    pos.y += cos(wavePhase) * waveAmp;

    vLocalPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const polarJetBeamFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vLocalPos;

  uniform float uTime;
  uniform float uSpeedMultiplier;

  void main() {
    // vUv.y: 0.0 at base (near singularity), 1.0 at distant tip
    float distNorm = vUv.y;
    
    // Core intensity falloff from base to tip
    float lengthFade = smoothstep(0.0, 0.06, distNorm) * smoothstep(1.0, 0.45, distNorm);
    
    // Fresnel / rim glow for slender cylindrical beam volume
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float rim = 1.0 - abs(dot(vNormal, viewDir));
    float radialCore = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 2.8);

    // Shock diamonds: periodic relativistic compression nodes
    float shockNodes = 0.85 + 0.35 * pow(abs(sin(distNorm * 20.0 - uTime * 7.0 * uSpeedMultiplier)), 3.0);
    
    // Fast turbulent plasma ripples
    float ripple = 0.92 + 0.18 * sin(distNorm * 30.0 - uTime * 12.0 * uSpeedMultiplier + vUv.x * 10.0);

    // Color gradient:
    // Base: Electric cyan (#38bdf8) with brilliant white hot center
    // Mid: Neon cyan-blue
    // Apex: Celestial ultraviolet (#c084fc)
    vec3 colCore = vec3(0.80, 0.95, 1.0);
    vec3 colCyan = vec3(0.22, 0.74, 0.97); // #38bdf8
    vec3 colPurple = vec3(0.72, 0.32, 0.96); // #c084fc
    vec3 colIndigo = vec3(0.12, 0.08, 0.35);

    vec3 beamColor = mix(colCore, colCyan, smoothstep(0.0, 0.25, distNorm));
    beamColor = mix(beamColor, colPurple, smoothstep(0.25, 0.75, distNorm));
    beamColor = mix(beamColor, colIndigo, smoothstep(0.75, 1.0, distNorm));

    float alpha = (radialCore * 0.75 + rim * 0.35) * lengthFade * shockNodes * ripple;
    alpha = clamp(alpha * 1.1, 0.0, 0.90);

    gl_FragColor = vec4(beamColor * 1.4, alpha);
  }
`;

export const polarJetParticleVertexShader = `
  attribute float size;
  attribute float phase;
  attribute float progress;
  attribute float poleSign; // +1.0 for North jet, -1.0 for South jet

  varying vec3 vColor;
  varying float vAlpha;

  uniform float uTime;
  uniform float uSpeedMultiplier;

  void main() {
    // Current particle position along helical magnetic vortex
    float t = fract(progress + uTime * 0.26 * uSpeedMultiplier);
    
    // Outflow distance along Z axis (from radius ~3.4 out to 26.0)
    float zDist = (3.4 + t * 23.0) * poleSign;
    
    // Helical spiral along magnetic field line
    float spiralAngle = phase + t * 28.0 * uSpeedMultiplier;
    float spiralRadius = 0.15 + pow(t, 0.75) * 1.15;

    vec3 localPos = vec3(
      cos(spiralAngle) * spiralRadius,
      sin(spiralAngle) * spiralRadius,
      zDist
    );

    // Color: cyan near base, purple near apex
    vec3 cCyan = vec3(0.30, 0.85, 1.0);
    vec3 cPurple = vec3(0.75, 0.40, 1.0);
    vColor = mix(cCyan, cPurple, t);

    // Smooth entry and exit fading
    vAlpha = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.55, t) * 0.85;

    vec4 mvPos = modelViewMatrix * vec4(localPos, 1.0);
    // Delicate, crisp point sprite size
    gl_PointSize = size * (1.0 - t * 0.35) * (75.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const polarJetParticleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float glow = exp(-dist * dist * 12.0);
    gl_FragColor = vec4(vColor * 1.6, vAlpha * glow);
  }
`;

