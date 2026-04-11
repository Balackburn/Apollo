// Lightspeed WebGL background — converted from Framer component to vanilla JS
const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform float intensity;
uniform float particleCount;
uniform vec3 colorShift;
#define FC gl_FragCoord.xy
#define R  resolution
#define T  time
float rnd(float a){vec2 p=fract(a*vec2(12.9898,78.233));p+=dot(p,p*345.);return fract(p.x*p.y);}
vec3 hue(float a){return colorShift*(.6+.6*cos(6.3*(a)+vec3(0,83,21)));}
vec3 pattern(vec2 uv){vec3 col=vec3(0.);for(float i=.0;i<particleCount;i++){float a=rnd(i);vec2 n=vec2(a,fract(a*34.56));vec2 p=sin(n*(T+7.)+T*.5);float d=dot(uv-p,uv-p);col+=(intensity*.00125)/d*hue(dot(uv,uv)+i*.125+T);}return col;}
void main(void){vec2 uv=(FC-.5*R)/min(R.x,R.y);vec3 col=vec3(0.);float s=2.4;float a=atan(uv.x,uv.y);float b=length(uv);uv=vec2(a*5./6.28318,.05/tan(b)+T);uv=fract(uv)-.5;col+=pattern(uv*s);O=vec4(col,1.);}`;

const VERT = `#version 300 es
precision highp float;
in vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}`;

export function initLightspeed(canvas, opts = {}) {
  const { speed = 0.4, intensity = 0.6, particleCount = 15, colorR = 0.3, colorG = 0.5, colorB = 1.0 } = opts;

  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) { canvas.style.display = 'none'; return () => {}; }

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.style.display = 'none'; return () => {}; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = 'none'; return () => {}; }

  gl.useProgram(prog);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'time');
  const uRes = gl.getUniformLocation(prog, 'resolution');
  const uInt = gl.getUniformLocation(prog, 'intensity');
  const uPart = gl.getUniformLocation(prog, 'particleCount');
  const uColor = gl.getUniformLocation(prog, 'colorShift');

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let raf;
  const start = performance.now();

  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    const now = (t - start) * 0.001 * speed;
    gl.uniform1f(uTime, now);
    gl.uniform1f(uInt, intensity);
    gl.uniform1f(uPart, particleCount);
    gl.uniform3f(uColor, colorR, colorG, colorB);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(vbo);
  };
}
