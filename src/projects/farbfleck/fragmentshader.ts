export const farbfleckFragShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const int u_steps = 8;
uniform vec3 u_colors[u_steps];

float gamma = 1.;


vec3 posterize(vec3 c) {
    c = c * float(u_steps);
    c = floor(c);

    vec3 ret = c;
    for(int i = 0; i < u_steps; i++) {
        ret = ret * min(abs(float(i) - c.x), 1.) + u_colors[i] * abs(min(abs(float(i) - c.x), 1.) - 1.);
    }
    
	return ret;
}

float circle(float r, vec2 st, vec2 pt) {
    return smoothstep(.0, .2, abs((distance(st, pt) - r) * 10.));
}

float point(vec2 st, vec2 pt) {
    return smoothstep(.001, 1., distance(st,pt) * 8.) * 0.9;
}

float renderatom(vec2 st, vec2 pt, float c) {
    c = c * point(st, pt);
    c = c * circle(.2, st, pt);
    
    return c;
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution;
    float pct = 1.0;
    vec2 a = vec2(sin(u_time) * .5 + .5, cos(u_time) * .5 + .5);
    vec2 b = vec2(sin(u_time * .8) * .3 + .5, cos(u_time * .8) * .3 + .5);    
    vec2 c = vec2(sin(u_time * .3) * .3 + .5, cos(u_time * .3) * .3 + .5);    
    vec2 d = vec2(sin(u_time * .7) * .5 + .5, cos(u_time * .3) * .3 + .5);
    vec2 e = vec2(sin(u_time * .4) * .3 + .5, cos(u_time * .8) * .2 + .5);
    vec2 f = vec2(sin(u_time * .1) * .3 + .5, cos(u_time * .1) * .6 + .5);

    pct = renderatom(st, a, pct);
    pct = renderatom(st, b, pct); 
    pct = renderatom(st, c, pct);
    pct = renderatom(st, d, pct);    
    pct = renderatom(st, e, pct);
    pct = renderatom(st, f, pct);

    vec3 color = vec3(pct);
    color = posterize(color);

    gl_FragColor = vec4(color,1.0);
}
`;
