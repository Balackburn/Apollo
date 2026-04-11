// Spectra Noise — converted from Framer React to vanilla JS
// WebGL CPPN-based animated background

const VERT = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;

const FRAG = `
#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uWarp;

vec4 buf[8];
float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
mat3 rgb2yiq=mat3(0.299,0.587,0.114,0.596,-0.274,-0.322,0.211,-0.523,0.312);
mat3 yiq2rgb=mat3(1.0,0.956,0.621,1.0,-0.272,-0.647,1.0,-1.106,1.703);
vec3 hueShiftRGB(vec3 col,float deg){vec3 yiq=rgb2yiq*col;float rad=radians(deg);float c=cos(rad),s=sin(rad);return clamp(yiq2rgb*vec3(yiq.x,yiq.y*c-yiq.z*s,yiq.y*s+yiq.z*c),0.0,1.0);}
vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}

vec4 cppn_fn(vec2 coordinate,float in0,float in1,float in2){
  buf[6]=vec4(coordinate.x,coordinate.y,0.3948+in0,0.36+in1);
  buf[7]=vec4(0.14+in2,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
  buf[0]=mat4(vec4(6.54,-3.61,0.76,-1.14),vec4(2.46,3.17,1.22,0.06),vec4(-5.48,-6.16,1.87,-4.77),vec4(6.04,-5.54,-0.91,3.25))*buf[6]+mat4(vec4(0.85,-5.72,3.98,1.65),vec4(-0.24,0.58,-1.77,-5.35),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(0.22,1.12,-1.8,5.03);
  buf[1]=mat4(vec4(-3.35,-6.06,0.56,-4.47),vec4(0.86,1.74,5.64,1.61),vec4(2.49,-3.5,1.72,6.36),vec4(3.31,8.21,1.14,-1.17))*buf[6]+mat4(vec4(5.24,-13.03,0.01,15.87),vec4(2.99,3.13,-0.89,-1.68),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-5.95,-6.57,-0.88,1.54);
  buf[0]=sigmoid(buf[0]);buf[1]=sigmoid(buf[1]);
  buf[2]=mat4(vec4(-15.22,8.1,-2.43,-1.94),vec4(-5.95,4.31,2.64,1.27),vec4(-7.31,6.73,5.25,5.94),vec4(5.08,8.98,-1.73,-1.16))*buf[6]+mat4(vec4(-11.97,-11.61,6.15,11.24),vec4(2.12,-6.26,-1.71,-0.7),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-4.17,-3.23,-4.58,-3.64);
  buf[3]=mat4(vec4(3.18,-13.74,1.88,3.23),vec4(0.64,12.77,1.91,0.51),vec4(-0.05,4.48,1.47,1.8),vec4(5.0,13.0,3.4,-4.56))*buf[6]+mat4(vec4(-0.13,7.72,-3.14,4.74),vec4(0.64,3.71,-0.81,-0.39),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-1.18,-21.62,0.79,1.23);
  buf[2]=sigmoid(buf[2]);buf[3]=sigmoid(buf[3]);
  buf[4]=mat4(vec4(5.21,-7.18,2.72,2.66),vec4(-5.6,-25.36,4.07,0.46),vec4(-10.58,24.29,21.1,37.55),vec4(4.3,-1.96,2.35,-1.37))*buf[0]+mat4(vec4(-17.65,-10.51,2.26,12.46),vec4(6.27,-502.75,-12.64,0.91),vec4(-10.98,20.74,-9.7,-0.76),vec4(5.38,1.48,-4.19,-4.84))*buf[1]+mat4(vec4(12.79,-16.35,-0.4,1.8),vec4(-30.48,-1.83,1.45,-1.11),vec4(19.87,-7.34,-42.94,-98.53),vec4(8.34,-2.73,-2.29,-36.14))*buf[2]+mat4(vec4(-16.3,3.55,-0.44,-9.44),vec4(57.51,-35.61,16.16,-4.15),vec4(-0.07,-3.87,-7.09,3.15),vec4(-12.56,-7.08,1.49,-0.82))*buf[3]+vec4(-7.68,15.93,1.32,-1.67);
  buf[5]=mat4(vec4(-1.41,-0.37,-3.77,-21.37),vec4(-6.21,-9.36,0.93,8.83),vec4(11.46,-22.35,13.63,-18.69),vec4(-0.34,-3.99,-2.46,-0.45))*buf[0]+mat4(vec4(7.35,-4.37,-6.3,-3.87),vec4(1.55,6.55,1.97,-0.58),vec4(6.59,-2.22,3.71,-1.37),vec4(-5.8,10.13,-2.34,-5.97))*buf[1]+mat4(vec4(-2.51,-6.67,-1.4,-0.16),vec4(-0.38,0.54,4.39,-1.3),vec4(-0.71,2.01,-5.17,-3.73),vec4(-13.56,10.49,-0.92,-2.65))*buf[2]+mat4(vec4(-8.65,6.55,-6.39,-5.59),vec4(-0.58,-1.08,36.91,5.74),vec4(14.28,3.71,7.15,-4.6),vec4(2.72,3.6,-4.37,-2.37))*buf[3]+vec4(-5.9,-4.33,1.24,8.6);
  buf[4]=sigmoid(buf[4]);buf[5]=sigmoid(buf[5]);
  buf[6]=mat4(vec4(-1.61,0.8,1.47,0.21),vec4(-28.79,-7.14,1.5,4.66),vec4(-10.95,39.66,0.74,-10.1),vec4(-0.72,-1.55,0.73,2.17))*buf[0]+mat4(vec4(3.25,21.49,-1.02,-3.31),vec4(-3.73,-3.38,-7.22,-0.24),vec4(13.18,0.79,5.34,5.69),vec4(-4.17,-17.8,-6.82,-1.65))*buf[1]+mat4(vec4(0.6,-7.8,-7.21,-2.74),vec4(-3.52,-0.12,-0.53,0.44),vec4(9.68,-22.85,2.06,0.1),vec4(-4.32,-17.73,2.52,5.3))*buf[2]+mat4(vec4(-6.55,-15.79,-6.04,-5.42),vec4(-43.59,28.55,-16.0,18.85),vec4(4.21,8.39,3.1,8.66),vec4(-5.02,-4.45,-4.48,-5.5))*buf[3]+mat4(vec4(1.7,-67.06,6.9,1.9),vec4(1.87,2.39,2.52,4.08),vec4(11.16,1.73,2.07,7.39),vec4(-4.26,-306.25,8.26,-17.13))*buf[4]+mat4(vec4(1.69,-4.59,3.85,-6.35),vec4(1.35,-1.26,9.93,2.91),vec4(-5.28,0.07,-0.14,3.33),vec4(28.35,-4.92,6.1,4.09))*buf[5]+vec4(6.68,12.52,-3.71,-4.1);
  buf[7]=mat4(vec4(-8.27,-4.7,5.1,0.75),vec4(8.65,-17.16,16.52,-8.88),vec4(-4.04,-2.39,-2.61,-1.99),vec4(-2.22,-1.81,-5.98,4.88))*buf[0]+mat4(vec4(6.78,3.51,-2.82,-2.7),vec4(-5.74,-0.28,1.5,-5.05),vec4(13.12,15.74,-2.94,-4.1),vec4(-14.38,-5.03,-6.26,2.98))*buf[1]+mat4(vec4(4.1,-0.94,-5.67,4.76),vec4(4.38,4.83,1.74,-3.44),vec4(2.12,0.16,-104.56,16.95),vec4(-5.23,-2.99,3.84,-1.94))*buf[2]+mat4(vec4(-5.9,1.79,-13.6,-3.81),vec4(6.66,31.91,25.16,91.81),vec4(11.84,4.15,-0.73,6.77),vec4(-6.4,4.03,6.17,-0.33))*buf[3]+mat4(vec4(3.5,-196.92,-8.92,2.81),vec4(3.48,-3.18,5.17,5.18),vec4(-2.4,15.59,1.29,2.03),vec4(-71.25,-62.44,-8.14,0.51))*buf[4]+mat4(vec4(-12.29,-11.18,-7.35,4.39),vec4(10.81,5.63,-0.94,-4.73),vec4(-12.87,-7.04,5.3,7.54),vec4(1.46,8.92,3.51,5.84))*buf[5]+vec4(2.24,-6.71,-0.99,-2.12);
  buf[6]=sigmoid(buf[6]);buf[7]=sigmoid(buf[7]);
  buf[0]=mat4(vec4(1.68,1.38,2.96,0.),vec4(-1.88,-1.48,-3.59,0.),vec4(-1.33,-1.09,-2.31,0.),vec4(0.27,0.23,0.44,0.))*buf[0]+mat4(vec4(-0.63,-0.59,-0.91,0.),vec4(0.18,0.18,0.18,0.),vec4(-2.97,-2.58,-4.9,0.),vec4(1.42,1.19,2.52,0.))*buf[1]+mat4(vec4(-1.26,-1.06,-2.17,0.),vec4(-0.72,-0.53,-1.44,0.),vec4(0.15,0.15,0.27,0.),vec4(0.95,0.89,1.28,0.))*buf[2]+mat4(vec4(-2.42,-1.97,-4.35,0.),vec4(-22.68,-18.05,-41.95,0.),vec4(0.64,0.55,1.11,0.),vec4(-1.55,-1.31,-2.64,0.))*buf[3]+mat4(vec4(-0.49,-0.4,-0.91,0.),vec4(0.96,0.79,1.64,0.),vec4(0.31,0.16,0.86,0.),vec4(1.18,0.95,2.18,0.))*buf[4]+mat4(vec4(0.35,0.33,0.6,0.),vec4(-0.59,-0.48,-1.06,0.),vec4(2.53,2.0,4.68,0.),vec4(0.13,0.09,0.3,0.))*buf[5]+mat4(vec4(-1.77,-1.4,-3.34,0.),vec4(3.17,2.64,5.38,0.),vec4(-3.17,-2.61,-5.55,0.),vec4(-2.85,-2.25,-5.3,0.))*buf[6]+mat4(vec4(1.52,1.22,2.84,0.),vec4(1.52,1.27,2.68,0.),vec4(2.98,2.44,5.23,0.),vec4(2.23,1.88,3.8,0.))*buf[7]+vec4(-1.55,-3.62,0.25,0.);
  buf[0]=sigmoid(buf[0]);
  return vec4(buf[0].x,buf[0].y,buf[0].z,1.);
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 uv=fragCoord/uResolution.xy*2.-1.;uv.y*=-1.;
  uv+=uWarp*vec2(sin(uv.y*6.283+uTime*0.5),cos(uv.x*6.283+uTime*0.5))*0.05;
  fragColor=cppn_fn(uv,0.1*sin(0.3*uTime),0.1*sin(0.69*uTime),0.1*sin(0.44*uTime));
}

void main(){
  vec4 col;mainImage(col,gl_FragCoord.xy);
  col.rgb=hueShiftRGB(col.rgb,uHueShift);
  col.rgb+=(rand(gl_FragCoord.xy+uTime)-0.5)*uNoise;
  gl_FragColor=vec4(clamp(col.rgb,0.0,1.0),1.0);
}
`;

export function initSpectra(canvas, opts = {}) {
  const { speed = 0.3, hueShift = 200, noise = 0.02, warp = 0.3, scale = 0.5 } = opts;

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return () => {};

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return () => {};

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    time: gl.getUniformLocation(prog, 'uTime'),
    res: gl.getUniformLocation(prog, 'uResolution'),
    hue: gl.getUniformLocation(prog, 'uHueShift'),
    noise: gl.getUniformLocation(prog, 'uNoise'),
    warp: gl.getUniformLocation(prog, 'uWarp'),
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, scale);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas); resize();

  let raf;
  const t0 = performance.now();
  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    gl.uniform1f(u.time, (t - t0) * 0.001 * speed);
    gl.uniform1f(u.hue, hueShift);
    gl.uniform1f(u.noise, noise);
    gl.uniform1f(u.warp, warp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  raf = requestAnimationFrame(loop);

  return () => { cancelAnimationFrame(raf); ro.disconnect(); gl.deleteProgram(prog); };
}
