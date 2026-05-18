export const loopFrag = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float cells = 20.0;
float radius = .2;
vec2 lineRadiusBounds = vec2(.1, .18);

float drawLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;

    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);
    return 1.0 - step(0.001, d);
}

//hashing function for probability of lines
float hash(vec2 p) {
    return fract(
        sin(dot(p, vec2(127.1, 311.7))) *
        43758.5453123
    );
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    //random point position
    vec2 aPoint = vec2(
        0.5 + 0.2 * sin(u_time * 0.7) + 0.1 * sin(u_time * 2.3),
        0.5 + 0.2 * cos(u_time * 0.9) + 0.1 * sin(u_time * 1.7)
    );
    vec2 id = floor(aPoint * cells);

    //create tiling
    vec2 gv = fract(st * cells);

    //or draw points and lines close to the point
    float c = 0.;
    float lineCount = 0.;
    
    for(float y = -4.0; y <= 4.0; y++) {
    for(float x = -4.0; x <= 4.0; x++) {
        vec2 neighbor = id + vec2(x, y);
        vec2 gp = (neighbor + 0.5) / cells;
        float d = distance(aPoint, gp);

        if(d < radius) {
          float point = 1.0 - step(min(0.006 / d / 30., 0.006), distance(st, gp));
          c = max(c, point);
        
          float hashed = hash(gp);
          float prob = exp(-lineCount * .2);
          if(lineRadiusBounds.x < d && lineRadiusBounds.y > d && hashed < prob) {
            float line = drawLine(st, aPoint, gp);
            c = max(c, line);
            lineCount += 1.;
          }
        }
      }
    }

    //draw line
    float line = drawLine(st, aPoint, vec2(1., 1.));
    
    //draw point
    float point = 1.0 - step(0.008, distance(st, aPoint));

    c = max(c, point);

    vec3 color = vec3(c);
    gl_FragColor = vec4(color, 1.0);
}
`;
