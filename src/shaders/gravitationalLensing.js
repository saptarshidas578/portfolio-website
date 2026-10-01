/**
 * Gravitational Lensing Shader & Photon Ring Halo
 * Simulates light deflection around the Schwarzschild/Kerr event horizon
 */

export const lensingVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const lensingFragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  uniform float uTime;
  uniform float uHoleRadius;
  uniform vec3 uCameraPos;
  uniform vec3 uHolePos;
  uniform float uLensingStrength;

  void main() {
    // Vector from center of black hole to this point on the halo plane
    vec2 offset = vUv - vec2(0.5);
    float dist = length(offset) * 2.0; // [0, 1] across radius

    // Distance to black hole center
    float r = dist * uHoleRadius * 3.5;

    // Hard event horizon shadow: inside r < uHoleRadius is absolute black
    if (r < uHoleRadius * 0.98) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Razor-sharp photon sphere ring (r ≈ 1.35 * uHoleRadius)
    float photonSphereDist = abs(r - uHoleRadius * 1.35);
    float photonRing = exp(-pow(photonSphereDist / 0.12, 2.0)) * 3.5;

    // Secondary sub-ring (higher-order relativistic orbit)
    float subRingDist = abs(r - uHoleRadius * 1.15);
    float subRing = exp(-pow(subRingDist / 0.06, 2.0)) * 2.0;

    // Gravitational deflection halo
    float deflection = (uHoleRadius / max(r, uHoleRadius)) * uLensingStrength;
    float halo = pow(clamp(1.0 - (r - uHoleRadius) / (uHoleRadius * 2.0), 0.0, 1.0), 3.0) * 0.8;

    // Radiant amber/gold blackbody emission for the photon ring
    vec3 ringColor = vec3(1.0, 0.88, 0.65) * photonRing + vec3(1.0, 0.55, 0.15) * subRing;
    vec3 haloColor = vec3(0.9, 0.45, 0.1) * halo;

    vec3 finalColor = ringColor + haloColor;
    float alpha = clamp(photonRing + subRing + halo * 0.6, 0.0, 1.0);

    // Fade smoothly at outer boundary
    alpha *= smoothstep(1.0, 0.7, dist);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * Event Horizon Shader (Absorbs 100% of light, perfect darkness with subtle event horizon boundary glow)
 */
export const eventHorizonFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform vec3 uCameraPos;

  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    
    // Pure black singularity core with razor-thin incandescent boundary shimmer
    vec3 horizonGlow = vec3(1.0, 0.6, 0.2) * pow(fresnel, 8.0) * 0.8;
    
    gl_FragColor = vec4(horizonGlow, 1.0);
  }
`;
