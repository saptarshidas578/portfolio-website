/**
 * Custom Post-Processing Shaders
 * - High-speed relativistic chromatic aberration
 * - Pure pitch black background preservation (zero gray haze in cosmic void)
 * - Subtle 70mm grain on luminous elements
 */

export const CinematicPassShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberration: { value: 0.0 },
    uGrainIntensity: { value: 0.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uGrainIntensity;

    void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5);
      vec2 dir = uv - center;
      float dist = length(dir);

      // Fast radial chromatic dispersion
      vec2 rOffset = dir * (uAberration * dist);
      vec2 bOffset = -dir * (uAberration * dist);

      float r = texture2D(tDiffuse, uv + rOffset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv + bOffset).b;
      vec3 color = vec3(r, g, b);

      // Apply subtle grain only to lit pixels, leaving pure void absolute pitch black (#000000)
      float brightness = max(color.r, max(color.g, color.b));
      if (brightness > 0.03) {
        float grain = (fract(sin(dot(uv + fract(uTime * 0.5), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uGrainIntensity * brightness;
        color += grain;
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
