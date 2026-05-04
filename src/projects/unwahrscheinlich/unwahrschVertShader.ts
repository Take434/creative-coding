export const unwahrschVertShader = `
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vLightMapUv;

uniform sampler2D uNoise;
uniform float uStrength;

void main() {
  vec3 transformed = position;

  float h  = texture2D(uNoise, uv).r;
  float hx = texture2D(uNoise, uv + vec2(0.01, 0.0)).r;
  float hz = texture2D(uNoise, uv + vec2(0.0, 0.01)).r;

  transformed += h * uStrength;

  vec3 dx = vec3(1.0, (hx - h) * uStrength, 0.0);
  vec3 dz = vec3(0.0, (hz - h) * uStrength, 1.0);

  vec3 terrainNormal = normalize(cross(dz, dx));

  vNormal = normalize(normalMatrix * terrainNormal);

  vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  vViewPosition = -mvPosition.xyz;
  vLightMapUv = uv;

  gl_Position = projectionMatrix * mvPosition;
}
`;
