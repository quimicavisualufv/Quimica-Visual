(function(){
const MAX_INSTANCES = 32;
const TYPE = { s:0, grid:1, px:2, py:3, pz:4, pxz:5, dxy:6, dyz:7, dxz:8, dz2:9, 'dx2-y2':10, fz3:11, fxz2:12, fyz2:13, fxyz:14, 'fzx2-y2':15, 'fxx2-3y2':16, 'fy3x2-y2':17, anel:18 };
const TYPE_NAMES = ['s','grid','px','py','pz','pxz','dxy','dyz','dxz','dz2','dx2-y2','fz3','fxz2','fyz2','fxyz','fzx2-y2','fxx2-3y2','fy3x2-y2','anel'];
const CAMERA_FOV = 1.2;
const CAMERA_TAN = Math.tan(CAMERA_FOV * 0.5);
const CAMERA_DEFAULT_YAW = -0.6;
const CAMERA_DEFAULT_PITCH = 0.35;
const CAMERA_DEFAULT_DISTANCE = 4.6;
const CAMERA_MIN_DISTANCE = 2.2;
const CAMERA_MAX_DISTANCE = 14.0;
const MAX_RENDER_DPR = 1.25;

const canvas = document.getElementById('gl');
let gl = null;
let program = null;
let quad = null;
let U = null;
let rendererReady = false;
let rendererInitializing = false;
let rendererInitFailed = false;
let renderFrameHandle = 0;
const badge = document.getElementById('badge');
const removeBtn = document.getElementById('removeBtn');
const selectionHint = document.getElementById('selectionHint');
const axesOverlay = document.getElementById('axesOverlay');
const axisLineXPos = document.getElementById('axisLineXPos');
const axisLineXNeg = document.getElementById('axisLineXNeg');
const axisLineYPos = document.getElementById('axisLineYPos');
const axisLineYNeg = document.getElementById('axisLineYNeg');
const axisLineZPos = document.getElementById('axisLineZPos');
const axisLineZNeg = document.getElementById('axisLineZNeg');
const axisOrigin = document.getElementById('axisOrigin');
const axisLabelXPos = document.getElementById('axisLabelXPos');
const axisLabelXNeg = document.getElementById('axisLabelXNeg');
const axisLabelYPos = document.getElementById('axisLabelYPos');
const axisLabelYNeg = document.getElementById('axisLabelYNeg');
const axisLabelZPos = document.getElementById('axisLabelZPos');
const axisLabelZNeg = document.getElementById('axisLabelZNeg');
const gizmoOverlay = document.getElementById('gizmoOverlay');
const gizmoAxisX = document.getElementById('gizmoAxisX');
const gizmoAxisY = document.getElementById('gizmoAxisY');
const gizmoAxisZ = document.getElementById('gizmoAxisZ');
const gizmoHandleX = document.getElementById('gizmoHandleX');
const gizmoHandleY = document.getElementById('gizmoHandleY');
const gizmoHandleZ = document.getElementById('gizmoHandleZ');
const gizmoLabelX = document.getElementById('gizmoLabelX');
const gizmoLabelY = document.getElementById('gizmoLabelY');
const gizmoLabelZ = document.getElementById('gizmoLabelZ');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingTitle = document.getElementById('loadingTitle');
const loadingMessage = document.getElementById('loadingMessage');
const loadingProgressBar = document.getElementById('loadingProgressBar');
const loadingPercent = document.getElementById('loadingPercent');
let loadingValue = 0;
let loadingHideTimer = 0;
let rendererInitStartedAt = 0;

function setLoading(progress, message, options={}){
  if(!loadingOverlay) return;
  if(loadingHideTimer){
    clearTimeout(loadingHideTimer);
    loadingHideTimer = 0;
  }
  loadingValue = Math.max(0, Math.min(100, Number(progress) || 0));
  loadingOverlay.classList.remove('is-hidden');
  loadingOverlay.classList.toggle('is-error', !!options.error);
  loadingOverlay.setAttribute('aria-busy', options.error ? 'false' : 'true');
  if(loadingTitle) loadingTitle.textContent = options.error ? 'Falha ao carregar' : 'Carregando...';
  if(loadingMessage && message) loadingMessage.textContent = message;
  if(loadingProgressBar) loadingProgressBar.style.width = loadingValue.toFixed(0) + '%';
  if(loadingPercent) loadingPercent.textContent = loadingValue.toFixed(0) + '%';
}

function finishLoading(message='Visualizador pronto'){
  if(!loadingOverlay) return;
  setLoading(100, message);
  loadingOverlay.setAttribute('aria-busy','false');
  loadingHideTimer = setTimeout(()=>{
    loadingOverlay.classList.add('is-hidden');
    loadingHideTimer = 0;
  }, 340);
}

setLoading(8, 'Preparando a interface');

const vsSrc = `attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos,0.0,1.0); }`;

const fsSrc = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_threshold;
uniform float u_smoothness;
uniform float u_specular;
uniform float u_yaw;
uniform float u_pitch;
uniform float u_zoom;
uniform float u_autorotate;
uniform float u_view2D;
uniform vec3 u_target;
uniform int u_instanceCount;
uniform vec4 u_instances[32];
uniform float u_radii[32];
uniform vec4 u_part1Colors[32];
uniform vec4 u_part2Colors[32];
uniform vec4 u_part3Colors[32];
uniform vec4 u_part4Colors[32];
uniform vec4 u_part5Colors[32];
uniform vec4 u_part6Colors[32];
uniform vec4 u_sceneBounds;

vec3 bgColor(){ return vec3(0.05,0.05,0.06); }

float ellipsoidValue(vec3 p, vec3 c, vec3 scale, float w){
  vec3 d = (p - c) / max(scale, vec3(0.001));
  return w / max(0.001, dot(d,d));
}

float ellipsoidValueRot(vec3 p, vec3 c, vec3 majorAxis, vec3 minorAxis1, vec3 minorAxis2, vec3 scale, float w){
  vec3 d = p - c;
  vec3 q = vec3(
    dot(d, majorAxis) / max(scale.x, 0.001),
    dot(d, minorAxis1) / max(scale.y, 0.001),
    dot(d, minorAxis2) / max(scale.z, 0.001)
  );
  return w / max(0.001, dot(q,q));
}

float torusValueZ(vec3 p, vec3 c, float majorR, vec2 tubeScale, float w){
  vec3 d = p - c;
  vec2 q = vec2(
    (length(d.xy) - majorR) / max(tubeScale.x, 0.001),
    d.z / max(tubeScale.y, 0.001)
  );
  return w / max(0.001, dot(q, q));
}

void addPart(inout float f, vec3 p, vec3 c, vec3 scale, float w, float negative){
  float v = ellipsoidValue(p,c,scale,w);
  f += mix(v,-v,negative);
}

void addPartRot(inout float f, vec3 p, vec3 c, vec3 majorAxis, vec3 minorAxis1, vec3 minorAxis2, vec3 scale, float w, float negative){
  float v = ellipsoidValueRot(p,c,majorAxis,minorAxis1,minorAxis2,scale,w);
  f += mix(v,-v,negative);
}

void partColor(inout vec3 acc, inout float total, vec3 p, vec3 c, vec3 scale, float w, vec3 color){
  float v = ellipsoidValue(p,c,scale,w);
  acc += color * v;
  total += v;
}

void partColorRot(inout vec3 acc, inout float total, vec3 p, vec3 c, vec3 majorAxis, vec3 minorAxis1, vec3 minorAxis2, vec3 scale, float w, vec3 color){
  float v = ellipsoidValueRot(p,c,majorAxis,minorAxis1,minorAxis2,scale,w);
  acc += color * v;
  total += v;
}
vec3 pickReference(vec3 axis){
  return abs(axis.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
}

void addPartRot(inout float f, vec3 p, vec3 c, vec3 majorAxis, vec3 scale, float w, float negative){
  vec3 ref = pickReference(majorAxis);
  vec3 minor1 = normalize(cross(majorAxis, ref));
  vec3 minor2 = normalize(cross(majorAxis, minor1));
  float v = ellipsoidValueRot(p,c,majorAxis,minor1,minor2,scale,w);
  f += mix(v,-v,negative);
}

void partColorRot(inout vec3 acc, inout float total, vec3 p, vec3 c, vec3 majorAxis, vec3 scale, float w, vec3 color){
  vec3 ref = pickReference(majorAxis);
  vec3 minor1 = normalize(cross(majorAxis, ref));
  vec3 minor2 = normalize(cross(majorAxis, minor1));
  float v = ellipsoidValueRot(p,c,majorAxis,minor1,minor2,scale,w);
  acc += color * v;
  total += v;
}

float fieldFn(vec3 p){
  float f = 0.0;
  for(int i=0;i<32;i++){
    if(i >= u_instanceCount) break;
    vec4 inst = u_instances[i];
    vec3 c = inst.xyz;
    float type = floor(inst.w);
    float negativeMask = floor(fract(inst.w) * 64.0 + 0.5);
    float radius = u_radii[i];
    float r2 = max(0.0001, radius*radius);
    float neg1 = mod(negativeMask, 2.0);
    negativeMask = floor(negativeMask * 0.5);
    float neg2 = mod(negativeMask, 2.0);
    negativeMask = floor(negativeMask * 0.5);
    float neg3 = mod(negativeMask, 2.0);
    negativeMask = floor(negativeMask * 0.5);
    float neg4 = mod(negativeMask, 2.0);
    negativeMask = floor(negativeMask * 0.5);
    float neg5 = mod(negativeMask, 2.0);
    negativeMask = floor(negativeMask * 0.5);
    float neg6 = mod(negativeMask, 2.0);

    if(type < 0.5){
      vec3 scale = vec3(1.0,1.0,1.0) * (0.92 + radius*0.30);
      float sphereV = ellipsoidValue(p,c,scale,r2*1.18);
      float useTop = step(c.y, p.y);
      float neg = mix(neg1, neg2, useTop);
      f += mix(sphereV,-sphereV,neg);
    }else if(type < 1.5){
      float sx = 0.44 + radius * 0.60;
      float sy = 0.44 + radius * 0.60;
      addPart(f, p, c + vec3(-sx,-sy,0.0), vec3(0.95), r2*0.92, neg1);
      addPart(f, p, c + vec3( sx,-sy,0.0), vec3(0.95), r2*0.92, neg1);
      addPart(f, p, c + vec3(-sx, sy,0.0), vec3(0.95), r2*0.92, neg2);
      addPart(f, p, c + vec3( sx, sy,0.0), vec3(0.95), r2*0.92, neg2);
    }else if(type < 2.5){
      float s = 0.24 + radius*0.52;
      vec3 axis = vec3(1.0, 0.0, 0.0);
      vec3 scale = vec3(1.45, 0.78, 0.78);
      addPart(f, p, c - axis*s, scale, r2*1.14, neg1);
      addPart(f, p, c + axis*s, scale, r2*1.14, neg2);
    }else if(type < 3.5){
      float s = 0.24 + radius*0.52;
      vec3 axis = vec3(0.0, 1.0, 0.0);
      vec3 scale = vec3(0.78, 1.45, 0.78);
      addPart(f, p, c - axis*s, scale, r2*1.14, neg1);
      addPart(f, p, c + axis*s, scale, r2*1.14, neg2);
    }else if(type < 4.5){
      float s = 0.24 + radius*0.52;
      vec3 axis = vec3(0.0, 0.0, 1.0);
      vec3 scale = vec3(0.78, 0.78, 1.45);
      addPart(f, p, c - axis*s, scale, r2*1.14, neg1);
      addPart(f, p, c + axis*s, scale, r2*1.14, neg2);
    }else if(type < 5.5){
      vec3 scale = vec3(1.0,1.0,1.0) * (0.92 + radius*0.30);
      float sphereV = ellipsoidValue(p,c,scale,r2*1.10);
      float useTop = step(c.y, p.y);
      float neg = mix(neg1, neg2, useTop);
      f += mix(sphereV,-sphereV,neg);
    }else if(type < 6.5){
      float s = 0.28 + radius*0.56;
      vec3 diag1 = normalize(vec3(1.0, 1.0, 0.0));
      vec3 diag2 = normalize(vec3(1.0,-1.0, 0.0));
      vec3 axisZ = vec3(0.0, 0.0, 1.0);
      vec3 lobeScale = vec3(1.52, 0.72, 0.62);
      addPartRot(f, p, c + diag1*s,  diag1, diag2, axisZ, lobeScale, r2*1.08, neg1);
      addPartRot(f, p, c - diag1*s,  diag1, diag2, axisZ, lobeScale, r2*1.08, neg2);
      addPartRot(f, p, c + diag2*s,  diag2, diag1, axisZ, lobeScale, r2*1.08, neg3);
      addPartRot(f, p, c - diag2*s,  diag2, diag1, axisZ, lobeScale, r2*1.08, neg4);
    }else if(type < 7.5){
      float s = 0.28 + radius*0.56;
      vec3 diag1 = normalize(vec3(0.0, 1.0, 1.0));
      vec3 diag2 = normalize(vec3(0.0, 1.0,-1.0));
      vec3 axisX = vec3(1.0, 0.0, 0.0);
      vec3 lobeScale = vec3(1.52, 0.72, 0.62);
      addPartRot(f, p, c + diag1*s,  diag1, diag2, axisX, lobeScale, r2*1.08, neg1);
      addPartRot(f, p, c - diag1*s,  diag1, diag2, axisX, lobeScale, r2*1.08, neg2);
      addPartRot(f, p, c + diag2*s,  diag2, diag1, axisX, lobeScale, r2*1.08, neg3);
      addPartRot(f, p, c - diag2*s,  diag2, diag1, axisX, lobeScale, r2*1.08, neg4);
    }else if(type < 8.5){
      float s = 0.28 + radius*0.56;
      vec3 diag1 = normalize(vec3(1.0, 0.0, 1.0));
      vec3 diag2 = normalize(vec3(1.0, 0.0,-1.0));
      vec3 axisY = vec3(0.0, 1.0, 0.0);
      vec3 lobeScale = vec3(1.52, 0.72, 0.62);
      addPartRot(f, p, c + diag1*s,  diag1, diag2, axisY, lobeScale, r2*1.08, neg1);
      addPartRot(f, p, c - diag1*s,  diag1, diag2, axisY, lobeScale, r2*1.08, neg2);
      addPartRot(f, p, c + diag2*s,  diag2, diag1, axisY, lobeScale, r2*1.08, neg3);
      addPartRot(f, p, c - diag2*s,  diag2, diag1, axisY, lobeScale, r2*1.08, neg4);
    }else if(type < 9.5){
      float lz = 0.26 + radius*0.56;
      vec3 lobeScale = vec3(0.74, 0.74, 1.55);
      float ringR = 0.30 + radius*0.48;
      vec2 tubeScale = vec2(0.56 + radius*0.24, 0.44 + radius*0.20);
      float ringW = 0.115 + radius*0.045;
      addPart(f, p, c + vec3(0.0,0.0, lz), lobeScale, r2*1.10, neg1);
      addPart(f, p, c + vec3(0.0,0.0,-lz), lobeScale, r2*1.10, neg2);
      float ringV = torusValueZ(p,c,ringR,tubeScale,ringW);
      float useUpperRing = step(c.y, p.y);
      float ringNeg = mix(neg4, neg3, useUpperRing);
      f += mix(ringV, -ringV, ringNeg);
    }else if(type < 10.5){
      float s = 0.24 + radius*0.52;
      vec3 xScale = vec3(1.45, 0.78, 0.78);
      vec3 yScale = vec3(0.78, 1.45, 0.78);
      addPart(f, p, c + vec3( s,0.0,0.0), xScale, r2*1.12, neg1);
      addPart(f, p, c + vec3(-s,0.0,0.0), xScale, r2*1.12, neg2);
      addPart(f, p, c + vec3(0.0, s,0.0), yScale, r2*1.12, neg3);
      addPart(f, p, c + vec3(0.0,-s,0.0), yScale, r2*1.12, neg4);

    }else if(type < 11.5){
      float lz = 0.34 + radius*0.74;
      vec3 lobeScale = vec3(0.78, 0.78, 1.68);
      float ringR = 0.30 + radius*0.48;
      vec2 tubeScale = vec2(0.56 + radius*0.24, 0.44 + radius*0.20);
      float ringOffset = 0.18 + radius*0.24;
      float ringW = 0.115 + radius*0.045;
      addPart(f, p, c + vec3(0.0,0.0, lz), lobeScale, r2*1.08, neg1);
      addPart(f, p, c + vec3(0.0,0.0,-lz), lobeScale, r2*1.08, neg2);
      float ringVTop = torusValueZ(p, c + vec3(0.0,0.0, ringOffset), ringR, tubeScale, ringW);
      float ringVBottom = torusValueZ(p, c + vec3(0.0,0.0,-ringOffset), ringR, tubeScale, ringW);
      float upperHalf = step(c.y, p.y);
      float topRingNeg = mix(neg4, neg3, upperHalf);
      float bottomRingNeg = mix(neg6, neg5, upperHalf);
      f += mix(ringVTop, -ringVTop, topRingNeg);
      f += mix(ringVBottom, -ringVBottom, bottomRingNeg);
    }else if(type < 12.5){
      float sx = 0.38 + radius*0.60;
      float sd = 0.26 + radius*0.42;
      vec3 longScale = vec3(1.46, 0.72, 0.70);
      vec3 diagScale = vec3(1.34, 0.68, 0.64);
      addPart(f, p, c + vec3( sx,0.0,0.0), longScale, r2*1.02, neg1);
      addPart(f, p, c + vec3(-sx,0.0,0.0), longScale, r2*1.02, neg2);
      addPartRot(f, p, c + normalize(vec3( 1.0,0.0, 1.0))*sd, normalize(vec3( 1.0,0.0, 1.0)), diagScale, r2*0.92, neg3);
      addPartRot(f, p, c + normalize(vec3( 1.0,0.0,-1.0))*sd, normalize(vec3( 1.0,0.0,-1.0)), diagScale, r2*0.92, neg4);
      addPartRot(f, p, c + normalize(vec3(-1.0,0.0, 1.0))*sd, normalize(vec3(-1.0,0.0, 1.0)), diagScale, r2*0.92, neg5);
      addPartRot(f, p, c + normalize(vec3(-1.0,0.0,-1.0))*sd, normalize(vec3(-1.0,0.0,-1.0)), diagScale, r2*0.92, neg6);
    }else if(type < 13.5){
      float sy = 0.38 + radius*0.60;
      float sd = 0.26 + radius*0.42;
      vec3 diagScale = vec3(1.34, 0.68, 0.64);
      addPart(f, p, c + vec3(0.0, sy,0.0), vec3(0.72,1.46,0.70), r2*1.02, neg1);
      addPart(f, p, c + vec3(0.0,-sy,0.0), vec3(0.72,1.46,0.70), r2*1.02, neg2);
      addPartRot(f, p, c + normalize(vec3(0.0, 1.0, 1.0))*sd, normalize(vec3(0.0, 1.0, 1.0)), diagScale, r2*0.92, neg3);
      addPartRot(f, p, c + normalize(vec3(0.0, 1.0,-1.0))*sd, normalize(vec3(0.0, 1.0,-1.0)), diagScale, r2*0.92, neg4);
      addPartRot(f, p, c + normalize(vec3(0.0,-1.0, 1.0))*sd, normalize(vec3(0.0,-1.0, 1.0)), diagScale, r2*0.92, neg5);
      addPartRot(f, p, c + normalize(vec3(0.0,-1.0,-1.0))*sd, normalize(vec3(0.0,-1.0,-1.0)), diagScale, r2*0.92, neg6);
    }else if(type < 14.5){
      float so = 0.34 + radius*0.52;
      vec3 lobeScale = vec3(1.30,0.66,0.62);
      addPartRot(f, p, c + normalize(vec3( 1.0, 1.0, 1.0))*so, normalize(vec3( 1.0, 1.0, 1.0)), lobeScale, r2*0.88, neg1);
      addPartRot(f, p, c + normalize(vec3(-1.0,-1.0, 1.0))*so, normalize(vec3(-1.0,-1.0, 1.0)), lobeScale, r2*0.88, neg2);
      addPartRot(f, p, c + normalize(vec3(-1.0, 1.0,-1.0))*so, normalize(vec3(-1.0, 1.0,-1.0)), lobeScale, r2*0.88, neg3);
      addPartRot(f, p, c + normalize(vec3( 1.0,-1.0,-1.0))*so, normalize(vec3( 1.0,-1.0,-1.0)), lobeScale, r2*0.88, neg4);
      addPartRot(f, p, c + normalize(vec3(-1.0,-1.0,-1.0))*so, normalize(vec3(-1.0,-1.0,-1.0)), lobeScale, r2*0.88, neg5);
      addPartRot(f, p, c + normalize(vec3( 1.0, 1.0,-1.0))*so, normalize(vec3( 1.0, 1.0,-1.0)), lobeScale, r2*0.88, neg6);
      addPartRot(f, p, c + normalize(vec3( 1.0,-1.0, 1.0))*so, normalize(vec3( 1.0,-1.0, 1.0)), lobeScale, r2*0.88, neg5);
      addPartRot(f, p, c + normalize(vec3(-1.0, 1.0, 1.0))*so, normalize(vec3(-1.0, 1.0, 1.0)), lobeScale, r2*0.88, neg6);
    }else if(type < 15.5){
      float sz = 0.32 + radius*0.60;
      float sd = 0.34 + radius*0.48;
      vec3 zScale = vec3(0.76,0.76,1.52);
      vec3 dScale = vec3(1.34,0.66,0.60);
      addPart(f, p, c + vec3(0.0,0.0, sz), zScale, r2*0.98, neg1);
      addPart(f, p, c + vec3(0.0,0.0,-sz), zScale, r2*0.98, neg2);
      addPartRot(f, p, c + normalize(vec3( 1.0, 1.0,0.0))*sd, normalize(vec3( 1.0, 1.0,0.0)), dScale, r2*0.88, neg3);
      addPartRot(f, p, c + normalize(vec3(-1.0,-1.0,0.0))*sd, normalize(vec3(-1.0,-1.0,0.0)), dScale, r2*0.88, neg4);
      addPartRot(f, p, c + normalize(vec3( 1.0,-1.0,0.0))*sd, normalize(vec3( 1.0,-1.0,0.0)), dScale, r2*0.88, neg5);
      addPartRot(f, p, c + normalize(vec3(-1.0, 1.0,0.0))*sd, normalize(vec3(-1.0, 1.0,0.0)), dScale, r2*0.88, neg6);
    }else if(type < 16.5){
      float sr = 0.42 + radius*0.56;
      vec3 planarScale = vec3(1.34,0.68,0.58);
      addPartRot(f, p, c + vec3( sr,0.0,0.0), normalize(vec3( 1.0,0.0,0.0)), planarScale, r2*0.92, neg1);
      addPartRot(f, p, c + normalize(vec3(-0.5, 0.866,0.0))*sr, normalize(vec3(-0.5, 0.866,0.0)), planarScale, r2*0.92, neg2);
      addPartRot(f, p, c + normalize(vec3(-0.5,-0.866,0.0))*sr, normalize(vec3(-0.5,-0.866,0.0)), planarScale, r2*0.92, neg3);
      addPartRot(f, p, c + vec3(-sr,0.0,0.0), normalize(vec3(-1.0,0.0,0.0)), planarScale, r2*0.92, neg4);
      addPartRot(f, p, c + normalize(vec3( 0.5, 0.866,0.0))*sr, normalize(vec3( 0.5, 0.866,0.0)), planarScale, r2*0.92, neg5);
      addPartRot(f, p, c + normalize(vec3( 0.5,-0.866,0.0))*sr, normalize(vec3( 0.5,-0.866,0.0)), planarScale, r2*0.92, neg6);
    }else if(type < 17.5){
      float sr = 0.42 + radius*0.56;
      vec3 planarScale = vec3(1.34,0.68,0.58);
      addPartRot(f, p, c + normalize(vec3( 0.0, 1.0,0.0))*sr, normalize(vec3( 0.0, 1.0,0.0)), planarScale, r2*0.92, neg1);
      addPartRot(f, p, c + normalize(vec3(-0.866,-0.5,0.0))*sr, normalize(vec3(-0.866,-0.5,0.0)), planarScale, r2*0.92, neg2);
      addPartRot(f, p, c + normalize(vec3( 0.866,-0.5,0.0))*sr, normalize(vec3( 0.866,-0.5,0.0)), planarScale, r2*0.92, neg3);
      addPartRot(f, p, c + normalize(vec3( 0.0,-1.0,0.0))*sr, normalize(vec3( 0.0,-1.0,0.0)), planarScale, r2*0.92, neg4);
      addPartRot(f, p, c + normalize(vec3( 0.866,0.5,0.0))*sr, normalize(vec3( 0.866,0.5,0.0)), planarScale, r2*0.92, neg5);
      addPartRot(f, p, c + normalize(vec3(-0.866,0.5,0.0))*sr, normalize(vec3(-0.866,0.5,0.0)), planarScale, r2*0.92, neg6);
    }else if(type < 18.5){
      float ringR = 0.30 + radius*0.48;
      vec2 tubeScale = vec2(0.56 + radius*0.24, 0.44 + radius*0.20);
      float ringV = torusValueZ(p,c,ringR,tubeScale,0.115 + radius*0.045);
      float useTop = step(c.y, p.y);
      float neg = mix(neg1, neg2, useTop);
      f += mix(ringV,-ringV,neg);
    }
  }
  return f;
}

vec3 surfaceColorAt(vec3 p){
  vec3 acc = vec3(0.0);
  float total = 0.0;
  for(int i=0;i<32;i++){
    if(i >= u_instanceCount) break;
    vec4 inst = u_instances[i];
    vec3 c = inst.xyz;
    float type = floor(inst.w);
    float radius = u_radii[i];
    float r2 = max(0.0001, radius*radius);
    vec3 c1 = u_part1Colors[i].rgb;
    vec3 c2 = u_part2Colors[i].rgb;
    vec3 c3 = u_part3Colors[i].rgb;
    vec3 c4 = u_part4Colors[i].rgb;
    vec3 c5 = u_part5Colors[i].rgb;
    vec3 c6 = u_part6Colors[i].rgb;

    if(type < 0.5){
      vec3 scale = vec3(1.0,1.0,1.0) * (0.92 + radius*0.30);
      float sphereV = ellipsoidValue(p,c,scale,r2*1.18);
      float useTop = step(c.y, p.y);
      vec3 hemiColor = mix(c1, c2, useTop);
      acc += hemiColor * sphereV;
      total += sphereV;
    }else if(type < 1.5){
      float sx = 0.44 + radius * 0.60;
      float sy = 0.44 + radius * 0.60;
      partColor(acc,total,p,c + vec3(-sx,-sy,0.0), vec3(0.95), r2*0.92, c1);
      partColor(acc,total,p,c + vec3( sx,-sy,0.0), vec3(0.95), r2*0.92, c1);
      partColor(acc,total,p,c + vec3(-sx, sy,0.0), vec3(0.95), r2*0.92, c2);
      partColor(acc,total,p,c + vec3( sx, sy,0.0), vec3(0.95), r2*0.92, c2);
    }else if(type < 2.5){
      float s = 0.24 + radius*0.52;
      vec3 axis = vec3(1.0, 0.0, 0.0);
      vec3 scale = vec3(1.45, 0.78, 0.78);
      partColor(acc,total,p,c - axis*s, scale, r2*1.14, c1);
      partColor(acc,total,p,c + axis*s, scale, r2*1.14, c2);
    }else if(type < 3.5){
      float s = 0.24 + radius*0.52;
      vec3 axis = vec3(0.0, 1.0, 0.0);
      vec3 scale = vec3(0.78, 1.45, 0.78);
      partColor(acc,total,p,c - axis*s, scale, r2*1.14, c1);
      partColor(acc,total,p,c + axis*s, scale, r2*1.14, c2);
    }else if(type < 4.5){
      float s = 0.24 + radius*0.52;
      vec3 axis = vec3(0.0, 0.0, 1.0);
      vec3 scale = vec3(0.78, 0.78, 1.45);
      partColor(acc,total,p,c - axis*s, scale, r2*1.14, c1);
      partColor(acc,total,p,c + axis*s, scale, r2*1.14, c2);
    }else if(type < 5.5){
      vec3 scale = vec3(1.0,1.0,1.0) * (0.92 + radius*0.30);
      float sphereV = ellipsoidValue(p,c,scale,r2*1.10);
      float useTop = step(c.y, p.y);
      vec3 hemiColor = mix(c1, c2, useTop);
      acc += hemiColor * sphereV;
      total += sphereV;
    }else if(type < 6.5){
      float s = 0.28 + radius*0.56;
      vec3 diag1 = normalize(vec3(1.0, 1.0, 0.0));
      vec3 diag2 = normalize(vec3(1.0,-1.0, 0.0));
      vec3 axisZ = vec3(0.0, 0.0, 1.0);
      vec3 lobeScale = vec3(1.52, 0.72, 0.62);
      partColorRot(acc,total,p,c + diag1*s, diag1, diag2, axisZ, lobeScale, r2*1.08, c1);
      partColorRot(acc,total,p,c - diag1*s, diag1, diag2, axisZ, lobeScale, r2*1.08, c2);
      partColorRot(acc,total,p,c + diag2*s, diag2, diag1, axisZ, lobeScale, r2*1.08, c3);
      partColorRot(acc,total,p,c - diag2*s, diag2, diag1, axisZ, lobeScale, r2*1.08, c4);
    }else if(type < 7.5){
      float s = 0.28 + radius*0.56;
      vec3 diag1 = normalize(vec3(0.0, 1.0, 1.0));
      vec3 diag2 = normalize(vec3(0.0, 1.0,-1.0));
      vec3 axisX = vec3(1.0, 0.0, 0.0);
      vec3 lobeScale = vec3(1.52, 0.72, 0.62);
      partColorRot(acc,total,p,c + diag1*s, diag1, diag2, axisX, lobeScale, r2*1.08, c1);
      partColorRot(acc,total,p,c - diag1*s, diag1, diag2, axisX, lobeScale, r2*1.08, c2);
      partColorRot(acc,total,p,c + diag2*s, diag2, diag1, axisX, lobeScale, r2*1.08, c3);
      partColorRot(acc,total,p,c - diag2*s, diag2, diag1, axisX, lobeScale, r2*1.08, c4);
    }else if(type < 8.5){
      float s = 0.28 + radius*0.56;
      vec3 diag1 = normalize(vec3(1.0, 0.0, 1.0));
      vec3 diag2 = normalize(vec3(1.0, 0.0,-1.0));
      vec3 axisY = vec3(0.0, 1.0, 0.0);
      vec3 lobeScale = vec3(1.52, 0.72, 0.62);
      partColorRot(acc,total,p,c + diag1*s, diag1, diag2, axisY, lobeScale, r2*1.08, c1);
      partColorRot(acc,total,p,c - diag1*s, diag1, diag2, axisY, lobeScale, r2*1.08, c2);
      partColorRot(acc,total,p,c + diag2*s, diag2, diag1, axisY, lobeScale, r2*1.08, c3);
      partColorRot(acc,total,p,c - diag2*s, diag2, diag1, axisY, lobeScale, r2*1.08, c4);
    }else if(type < 9.5){
      float lz = 0.26 + radius*0.56;
      vec3 lobeScale = vec3(0.74, 0.74, 1.55);
      float ringR = 0.30 + radius*0.48;
      vec2 tubeScale = vec2(0.56 + radius*0.24, 0.44 + radius*0.20);
      float ringW = 0.115 + radius*0.045;
      partColor(acc,total,p,c + vec3(0.0,0.0, lz), lobeScale, r2*1.10, c1);
      partColor(acc,total,p,c + vec3(0.0,0.0,-lz), lobeScale, r2*1.10, c2);
      float ringV = torusValueZ(p,c,ringR,tubeScale,ringW);
      float useUpperRing = step(c.y, p.y);
      vec3 ringColor = mix(c4, c3, useUpperRing);
      acc += ringColor * ringV;
      total += ringV;
    }else if(type < 10.5){
      float s = 0.24 + radius*0.52;
      vec3 xScale = vec3(1.45, 0.78, 0.78);
      vec3 yScale = vec3(0.78, 1.45, 0.78);
      partColor(acc,total,p,c + vec3( s,0.0,0.0), xScale, r2*1.12, c1);
      partColor(acc,total,p,c + vec3(-s,0.0,0.0), xScale, r2*1.12, c2);
      partColor(acc,total,p,c + vec3(0.0, s,0.0), yScale, r2*1.12, c3);
      partColor(acc,total,p,c + vec3(0.0,-s,0.0), yScale, r2*1.12, c4);

    }else if(type < 11.5){
      float lz = 0.34 + radius*0.74;
      vec3 lobeScale = vec3(0.78, 0.78, 1.68);
      float ringR = 0.30 + radius*0.48;
      vec2 tubeScale = vec2(0.56 + radius*0.24, 0.44 + radius*0.20);
      float ringOffset = 0.18 + radius*0.24;
      float ringW = 0.115 + radius*0.045;
      partColor(acc,total,p,c + vec3(0.0,0.0, lz), lobeScale, r2*1.08, c1);
      partColor(acc,total,p,c + vec3(0.0,0.0,-lz), lobeScale, r2*1.08, c2);
      float ringVTop = torusValueZ(p, c + vec3(0.0,0.0, ringOffset), ringR, tubeScale, ringW);
      float ringVBottom = torusValueZ(p, c + vec3(0.0,0.0,-ringOffset), ringR, tubeScale, ringW);
      float upperHalf = step(c.y, p.y);
      vec3 ringColorTop = mix(c4, c3, upperHalf);
      vec3 ringColorBottom = mix(c6, c5, upperHalf);
      acc += ringColorTop * ringVTop;
      total += ringVTop;
      acc += ringColorBottom * ringVBottom;
      total += ringVBottom;
    }else if(type < 12.5){
      float sx = 0.38 + radius*0.60;
      float sd = 0.26 + radius*0.42;
      vec3 longScale = vec3(1.46, 0.72, 0.70);
      vec3 diagScale = vec3(1.34, 0.68, 0.64);
      partColor(acc,total,p,c + vec3( sx,0.0,0.0), longScale, r2*1.02, c1);
      partColor(acc,total,p,c + vec3(-sx,0.0,0.0), longScale, r2*1.02, c2);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0,0.0, 1.0))*sd, normalize(vec3( 1.0,0.0, 1.0)), diagScale, r2*0.92, c3);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0,0.0,-1.0))*sd, normalize(vec3( 1.0,0.0,-1.0)), diagScale, r2*0.92, c4);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0,0.0, 1.0))*sd, normalize(vec3(-1.0,0.0, 1.0)), diagScale, r2*0.92, c5);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0,0.0,-1.0))*sd, normalize(vec3(-1.0,0.0,-1.0)), diagScale, r2*0.92, c6);
    }else if(type < 13.5){
      float sy = 0.38 + radius*0.60;
      float sd = 0.26 + radius*0.42;
      vec3 diagScale = vec3(1.34, 0.68, 0.64);
      partColor(acc,total,p,c + vec3(0.0, sy,0.0), vec3(0.72,1.46,0.70), r2*1.02, c1);
      partColor(acc,total,p,c + vec3(0.0,-sy,0.0), vec3(0.72,1.46,0.70), r2*1.02, c2);
      partColorRot(acc,total,p,c + normalize(vec3(0.0, 1.0, 1.0))*sd, normalize(vec3(0.0, 1.0, 1.0)), diagScale, r2*0.92, c3);
      partColorRot(acc,total,p,c + normalize(vec3(0.0, 1.0,-1.0))*sd, normalize(vec3(0.0, 1.0,-1.0)), diagScale, r2*0.92, c4);
      partColorRot(acc,total,p,c + normalize(vec3(0.0,-1.0, 1.0))*sd, normalize(vec3(0.0,-1.0, 1.0)), diagScale, r2*0.92, c5);
      partColorRot(acc,total,p,c + normalize(vec3(0.0,-1.0,-1.0))*sd, normalize(vec3(0.0,-1.0,-1.0)), diagScale, r2*0.92, c6);
    }else if(type < 14.5){
      float so = 0.34 + radius*0.52;
      vec3 lobeScale = vec3(1.30,0.66,0.62);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0, 1.0, 1.0))*so, normalize(vec3( 1.0, 1.0, 1.0)), lobeScale, r2*0.88, c1);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0,-1.0, 1.0))*so, normalize(vec3(-1.0,-1.0, 1.0)), lobeScale, r2*0.88, c2);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0, 1.0,-1.0))*so, normalize(vec3(-1.0, 1.0,-1.0)), lobeScale, r2*0.88, c3);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0,-1.0,-1.0))*so, normalize(vec3( 1.0,-1.0,-1.0)), lobeScale, r2*0.88, c4);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0,-1.0,-1.0))*so, normalize(vec3(-1.0,-1.0,-1.0)), lobeScale, r2*0.88, c5);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0, 1.0,-1.0))*so, normalize(vec3( 1.0, 1.0,-1.0)), lobeScale, r2*0.88, c6);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0,-1.0, 1.0))*so, normalize(vec3( 1.0,-1.0, 1.0)), lobeScale, r2*0.88, c5);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0, 1.0, 1.0))*so, normalize(vec3(-1.0, 1.0, 1.0)), lobeScale, r2*0.88, c6);
    }else if(type < 15.5){
      float sz = 0.32 + radius*0.60;
      float sd = 0.34 + radius*0.48;
      vec3 zScale = vec3(0.76,0.76,1.52);
      vec3 dScale = vec3(1.34,0.66,0.60);
      partColor(acc,total,p,c + vec3(0.0,0.0, sz), zScale, r2*0.98, c1);
      partColor(acc,total,p,c + vec3(0.0,0.0,-sz), zScale, r2*0.98, c2);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0, 1.0,0.0))*sd, normalize(vec3( 1.0, 1.0,0.0)), dScale, r2*0.88, c3);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0,-1.0,0.0))*sd, normalize(vec3(-1.0,-1.0,0.0)), dScale, r2*0.88, c4);
      partColorRot(acc,total,p,c + normalize(vec3( 1.0,-1.0,0.0))*sd, normalize(vec3( 1.0,-1.0,0.0)), dScale, r2*0.88, c5);
      partColorRot(acc,total,p,c + normalize(vec3(-1.0, 1.0,0.0))*sd, normalize(vec3(-1.0, 1.0,0.0)), dScale, r2*0.88, c6);
    }else if(type < 16.5){
      float sr = 0.42 + radius*0.56;
      vec3 planarScale = vec3(1.34,0.68,0.58);
      partColorRot(acc,total,p,c + vec3( sr,0.0,0.0), normalize(vec3( 1.0,0.0,0.0)), planarScale, r2*0.92, c1);
      partColorRot(acc,total,p,c + normalize(vec3(-0.5, 0.866,0.0))*sr, normalize(vec3(-0.5, 0.866,0.0)), planarScale, r2*0.92, c2);
      partColorRot(acc,total,p,c + normalize(vec3(-0.5,-0.866,0.0))*sr, normalize(vec3(-0.5,-0.866,0.0)), planarScale, r2*0.92, c3);
      partColorRot(acc,total,p,c + vec3(-sr,0.0,0.0), normalize(vec3(-1.0,0.0,0.0)), planarScale, r2*0.92, c4);
      partColorRot(acc,total,p,c + normalize(vec3( 0.5, 0.866,0.0))*sr, normalize(vec3( 0.5, 0.866,0.0)), planarScale, r2*0.92, c5);
      partColorRot(acc,total,p,c + normalize(vec3( 0.5,-0.866,0.0))*sr, normalize(vec3( 0.5,-0.866,0.0)), planarScale, r2*0.92, c6);
    }else if(type < 17.5){
      float sr = 0.42 + radius*0.56;
      vec3 planarScale = vec3(1.34,0.68,0.58);
      partColorRot(acc,total,p,c + normalize(vec3( 0.0, 1.0,0.0))*sr, normalize(vec3( 0.0, 1.0,0.0)), planarScale, r2*0.92, c1);
      partColorRot(acc,total,p,c + normalize(vec3(-0.866,-0.5,0.0))*sr, normalize(vec3(-0.866,-0.5,0.0)), planarScale, r2*0.92, c2);
      partColorRot(acc,total,p,c + normalize(vec3( 0.866,-0.5,0.0))*sr, normalize(vec3( 0.866,-0.5,0.0)), planarScale, r2*0.92, c3);
      partColorRot(acc,total,p,c + normalize(vec3( 0.0,-1.0,0.0))*sr, normalize(vec3( 0.0,-1.0,0.0)), planarScale, r2*0.92, c4);
      partColorRot(acc,total,p,c + normalize(vec3( 0.866,0.5,0.0))*sr, normalize(vec3( 0.866,0.5,0.0)), planarScale, r2*0.92, c5);
      partColorRot(acc,total,p,c + normalize(vec3(-0.866,0.5,0.0))*sr, normalize(vec3(-0.866,0.5,0.0)), planarScale, r2*0.92, c6);
    }else if(type < 18.5){
      float ringR = 0.30 + radius*0.48;
      vec2 tubeScale = vec2(0.56 + radius*0.24, 0.44 + radius*0.20);
      float ringV = torusValueZ(p,c,ringR,tubeScale,0.115 + radius*0.045);
      float useTop = step(c.y, p.y);
      vec3 hemiColor = mix(c1, c2, useTop);
      acc += hemiColor * ringV;
      total += ringV;
    }
  }
  if(total <= 0.0) return vec3(0.18);
  return acc / total;
}

float sceneDist(vec3 p){
  float f = fieldFn(p);
  return (u_threshold - abs(f)) / max(0.35, u_smoothness*6.0);
}

vec3 getNormal(vec3 p){
  float e = 0.003;
  vec2 h = vec2(e,0.);
  return normalize(vec3(
    sceneDist(p+h.xyy)-sceneDist(p-h.xyy),
    sceneDist(p+h.yxy)-sceneDist(p-h.yxy),
    sceneDist(p+h.yyx)-sceneDist(p-h.yyx)
  ));
}

float raymarch(vec3 ro, vec3 rd, float maxT, out vec3 hitPos, out int hit){
  float t = 0.0;
  hit = 0;
  for(int i=0;i<260;i++){
    vec3 p = ro + rd*t;
    float d = sceneDist(p);
    if(d < 0.0010){
      hit = 1;
      hitPos = p;
      return t;
    }
    if(t > maxT) break;
    t += max(0.004, d*0.42);
  }
  hitPos = ro + rd*t;
  return t;
}

bool sceneRayInterval(vec3 ro, vec3 rd, out float farT){
  vec3 oc = ro - u_sceneBounds.xyz;
  float radius = u_sceneBounds.w;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float h = b*b - c;
  if(h < 0.0){
    farT = 0.0;
    return false;
  }
  farT = -b + sqrt(h);
  return farT > 0.0;
}

float gridLineMetric(float coord, float density){
  return abs(coord * density - floor(coord * density + 0.5));
}

vec3 gridColorAt(vec3 p, vec3 bg){
  vec2 delta = p.xz - u_target.xz;
  float dist2 = dot(delta, delta);
  float fadeFar = 0.18 + 0.82 * exp(-0.0022 * dist2);

  float micro = max(
    1.0 - smoothstep(0.0035, 0.0105, gridLineMetric(p.x, 10.0)),
    1.0 - smoothstep(0.0035, 0.0105, gridLineMetric(p.z, 10.0))
  );
  float minor = max(
    1.0 - smoothstep(0.0045, 0.0145, gridLineMetric(p.x, 5.0)),
    1.0 - smoothstep(0.0045, 0.0145, gridLineMetric(p.z, 5.0))
  );
  float major = max(
    1.0 - smoothstep(0.0060, 0.0200, gridLineMetric(p.x, 1.0)),
    1.0 - smoothstep(0.0060, 0.0200, gridLineMetric(p.z, 1.0))
  );
  float xAxis = 1.0 - smoothstep(0.0, 0.010, abs(p.z));
  float zAxis = 1.0 - smoothstep(0.0, 0.010, abs(p.x));

  vec3 microCol = vec3(0.11,0.11,0.13);
  vec3 minorCol = vec3(0.15,0.15,0.17);
  vec3 majorCol = vec3(0.22,0.22,0.25);

  vec3 col = mix(bg, microCol, micro * 0.12 * fadeFar);
  col = mix(col, minorCol, minor * 0.24 * fadeFar);
  col = mix(col, majorCol, major * (0.34 + 0.30 * fadeFar));
  col = mix(col, vec3(0.68,0.33,0.33), xAxis * (0.48 + 0.42 * fadeFar));
  col = mix(col, vec3(0.29,0.45,0.76), zAxis * (0.48 + 0.42 * fadeFar));

  return col;
}

void main(){
  vec2 ndc = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
  float ar = u_resolution.x/u_resolution.y;

  float yaw = u_yaw + (u_autorotate>0.5 ? u_time*0.28 : 0.0);
  float pitch = u_pitch;

  vec3 target = u_target;

  float camDist = max(u_zoom, 0.05);
  vec3 roCenter = target + vec3(
    camDist * cos(pitch) * sin(yaw),
    camDist * sin(pitch),
    camDist * cos(pitch) * cos(yaw)
  );
  vec3 forward = normalize(target - roCenter);
  vec3 upRef = abs(dot(forward, vec3(0.0,1.0,0.0))) > 0.98 ? vec3(0.0,0.0,1.0) : vec3(0.0,1.0,0.0);
  vec3 right = normalize(cross(forward, upRef));
  vec3 up = cross(right, forward);

  vec3 ro;
  vec3 rd;
  if(u_view2D > 0.5){
    float orthoScale = camDist * 0.42;
    ro = roCenter + ndc.x*ar*right*orthoScale + ndc.y*up*orthoScale;
    rd = forward;
  }else{
    float t = tan(1.2 * 0.5);
    ro = roCenter;
    rd = normalize(forward + ndc.x * ar * t * right + ndc.y * t * up);
  }
  vec3 col = bgColor();

  if(u_instanceCount == 0){
    if(abs(rd.y) > 0.0001){
      float emptyPlaneT = (0.0 - ro.y) / rd.y;
      if(emptyPlaneT > 0.0){
        vec3 emptyGp = ro + rd * emptyPlaneT;
        col = gridColorAt(emptyGp, col);
      }
    }
    gl_FragColor = vec4(col,1.0);
    return;
  }

  vec3 hitPos = ro;
  int hit = 0;
  float t = 0.0;
  float sceneFarT = 0.0;
  if(sceneRayInterval(ro, rd, sceneFarT)){
    t = raymarch(ro, rd, min(12.0, sceneFarT + 0.01), hitPos, hit);
  }

  float planeT = 1e9;
  if(abs(rd.y) > 0.0001){
    planeT = (0.0 - ro.y) / rd.y;
    if(planeT > 0.0 && (hit == 0 || planeT < t)){
      vec3 gp = ro + rd * planeT;
      col = gridColorAt(gp, col);
    }
  }

  if(hit==1){
    vec3 n = getNormal(hitPos);
    vec3 lightDir = normalize(vec3(0.8,1.2,1.0));
    vec3 fillDir = normalize(vec3(-0.6,0.25,0.5));
    float diff = max(dot(n,lightDir),0.0);
    float wrap = max((dot(n,lightDir) + 0.30) / 1.30, 0.0);
    float fill = max(dot(n,fillDir),0.0)*0.55;
    vec3 viewDir = normalize(ro-hitPos);
    vec3 halfVec = normalize(lightDir+viewDir);
    float spec = pow(max(dot(n,halfVec),0.0),56.0)*(0.10+u_specular*1.45);
    float fres = pow(1.0-max(dot(n,viewDir),0.0),2.6);
    vec3 base = surfaceColorAt(hitPos);
    vec3 rim = mix(vec3(0.82,0.86,0.92), vec3(1.0), 0.35);
    col = base*(0.34 + wrap*1.08 + diff*0.38 + fill) + spec + rim*fres*0.20;
    col = pow(max(col, vec3(0.0)), vec3(0.92));
    float fog = exp(-0.022*t*t);
    col = mix(bgColor(),col,fog);
  }

  gl_FragColor = vec4(col,1.0);
}`;

function compile(type,src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh,src);
  gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){
    const message = gl.getShaderInfoLog(sh)||'Shader compile error';
    gl.deleteShader(sh);
    throw new Error(message);
  }
  return sh;
}

function createShaderUnchecked(type,src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh,src);
  gl.compileShader(sh);
  return sh;
}

function failRendererInit(err, shaders, pendingProgram){
  rendererInitializing = false;
  rendererInitFailed = true;
  setLoading(Math.max(loadingValue, 35), 'Não foi possível iniciar a visualização 3D', {error:true});
  if(gl){
    if(pendingProgram){
      try{ gl.deleteProgram(pendingProgram); }catch(_err){}
    }
    for(const shader of shaders || []){
      if(shader){
        try{ gl.deleteShader(shader); }catch(_err){}
      }
    }
  }
  badge.textContent='Erro shader';
  badge.style.background='rgba(160,20,20,.92)';
  alert(err && err.message ? err.message : String(err));
}

function finishRendererInit(vs, fs, pendingProgram){
  try{
    if(!gl.getShaderParameter(vs,gl.COMPILE_STATUS)){
      throw new Error(gl.getShaderInfoLog(vs)||'Vertex shader compile error');
    }
    if(!gl.getShaderParameter(fs,gl.COMPILE_STATUS)){
      throw new Error(gl.getShaderInfoLog(fs)||'Fragment shader compile error');
    }
    if(!gl.getProgramParameter(pendingProgram,gl.LINK_STATUS)){
      throw new Error(gl.getProgramInfoLog(pendingProgram)||'Program link error');
    }

    program = pendingProgram;
    gl.useProgram(program);
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,quad);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program,'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

    U = {
      resolution: gl.getUniformLocation(program,'u_resolution'),
      time: gl.getUniformLocation(program,'u_time'),
      threshold: gl.getUniformLocation(program,'u_threshold'),
      smoothness: gl.getUniformLocation(program,'u_smoothness'),
      specular: gl.getUniformLocation(program,'u_specular'),
      yaw: gl.getUniformLocation(program,'u_yaw'),
      pitch: gl.getUniformLocation(program,'u_pitch'),
      zoom: gl.getUniformLocation(program,'u_zoom'),
      autorotate: gl.getUniformLocation(program,'u_autorotate'),
      view2D: gl.getUniformLocation(program,'u_view2D'),
      target: gl.getUniformLocation(program,'u_target'),
      instanceCount: gl.getUniformLocation(program,'u_instanceCount'),
      instances: gl.getUniformLocation(program,'u_instances[0]'),
      part1Colors: gl.getUniformLocation(program,'u_part1Colors[0]'),
      part2Colors: gl.getUniformLocation(program,'u_part2Colors[0]'),
      part3Colors: gl.getUniformLocation(program,'u_part3Colors[0]'),
      part4Colors: gl.getUniformLocation(program,'u_part4Colors[0]'),
      part5Colors: gl.getUniformLocation(program,'u_part5Colors[0]'),
      part6Colors: gl.getUniformLocation(program,'u_part6Colors[0]'),
      sceneBounds: gl.getUniformLocation(program,'u_sceneBounds'),
      radii: gl.getUniformLocation(program,'u_radii[0]')
    };

    gl.uniform1f(U.threshold, state.threshold);
    gl.uniform1f(U.smoothness, state.smoothness);
    gl.uniform1f(U.specular, state.specular);

    rendererReady = true;
    rendererInitializing = false;
    rendererInitFailed = false;
    setLoading(96, 'Finalizando a cena 3D');
    resize();
    requestAnimationFrame(()=>finishLoading('Visualizador pronto'));

    // Se o usuário adicionou algo enquanto a GPU ainda compilava,
    // desenha assim que o programa estiver pronto sem exigir novo clique.
    if(instances.length > 0) requestRender();
    return true;
  }catch(err){
    failRendererInit(err, [vs, fs], pendingProgram);
    return false;
  }
}

function ensureRenderer(){
  if(rendererReady) return true;
  if(rendererInitializing || rendererInitFailed) return false;

  if(!gl){
    gl = canvas.getContext('webgl',{antialias:false,alpha:false,desynchronized:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
    if(!gl){
      rendererInitFailed = true;
      setLoading(20, 'WebGL não está disponível neste navegador', {error:true});
      badge.textContent='WebGL não disponível';
      badge.style.background='rgba(160,20,20,.92)';
      return false;
    }
  }

  rendererInitializing = true;
  rendererInitStartedAt = performance.now();
  setLoading(Math.max(loadingValue, 24), 'Iniciando o motor gráfico');
  let vs = null;
  let fs = null;
  let pendingProgram = null;

  try{
    const parallelExt = gl.getExtension('KHR_parallel_shader_compile');

    if(parallelExt){
      setLoading(42, 'Compilando os shaders');
      // Não consulta COMPILE_STATUS imediatamente: em alguns drivers essa
      // consulta força uma espera síncrona e é justamente o freeze do 1º uso.
      vs = createShaderUnchecked(gl.VERTEX_SHADER,vsSrc);
      fs = createShaderUnchecked(gl.FRAGMENT_SHADER,fsSrc);
      pendingProgram = gl.createProgram();
      gl.attachShader(pendingProgram,vs);
      gl.attachShader(pendingProgram,fs);
      gl.linkProgram(pendingProgram);

      const pollCompile = ()=>{
        if(!rendererInitializing) return;
        let completed = false;
        try{
          completed = !!gl.getProgramParameter(pendingProgram, parallelExt.COMPLETION_STATUS_KHR);
        }catch(err){
          failRendererInit(err, [vs,fs], pendingProgram);
          return;
        }
        if(!completed){
          const elapsed = Math.max(0, performance.now() - rendererInitStartedAt);
          const softProgress = Math.min(88, 42 + (1 - Math.exp(-elapsed / 1400)) * 46);
          setLoading(Math.max(loadingValue, softProgress), 'Compilando os shaders');
          requestAnimationFrame(pollCompile);
          return;
        }
        setLoading(92, 'Montando a cena 3D');
        finishRendererInit(vs,fs,pendingProgram);
      };
      requestAnimationFrame(pollCompile);
      return false;
    }

    // Fallback para navegadores/drivers sem compilação paralela.
    setLoading(45, 'Compilando os shaders');
    vs = compile(gl.VERTEX_SHADER,vsSrc);
    fs = compile(gl.FRAGMENT_SHADER,fsSrc);
    pendingProgram = gl.createProgram();
    gl.attachShader(pendingProgram,vs);
    gl.attachShader(pendingProgram,fs);
    setLoading(88, 'Montando a cena 3D');
    gl.linkProgram(pendingProgram);
    return finishRendererInit(vs,fs,pendingProgram);
  }catch(err){
    failRendererInit(err, [vs,fs], pendingProgram);
    return false;
  }
}
function requestRender(){
  if(!rendererReady && instances.length === 0) return;
  if(renderFrameHandle) return;
  renderFrameHandle = requestAnimationFrame(render);
}

function startRenderLoop(){
  requestRender();
}

const state = {
  threshold:3.20,
  negativeStrength:1.20,
  smoothness:1.00,
  specular:0.54,
  animate:true,
  whiteBg:false,
  autorotate:false,
  showAxes:true,
  view2D:false,
  last3DYaw:CAMERA_DEFAULT_YAW,
  last3DPitch:CAMERA_DEFAULT_PITCH,
  yaw:CAMERA_DEFAULT_YAW,
  pitch:CAMERA_DEFAULT_PITCH,
  zoom:CAMERA_DEFAULT_DISTANCE,
  targetX:0.0,
  targetY:0.0,
  targetZ:0.0
};

const ui = {
  posX: document.getElementById('posX'),
  posY: document.getElementById('posY'),
  posZ: document.getElementById('posZ'),
  radius: document.getElementById('radius'),
  autorotate: document.getElementById('autorotate'),
  showAxes: document.getElementById('showAxes'),
  view2D: document.getElementById('view2D'),
  posXValue: document.getElementById('posXValue'),
  posYValue: document.getElementById('posYValue'),
  posZValue: document.getElementById('posZValue'),
  radiusValue: document.getElementById('radiusValue'),
  part1Cell: document.getElementById('part1Cell'),
  part2Cell: document.getElementById('part2Cell'),
  part3Cell: document.getElementById('part3Cell'),
  part4Cell: document.getElementById('part4Cell'),
  part5Cell: document.getElementById('part5Cell'),
  part6Cell: document.getElementById('part6Cell'),
  part1Label: document.getElementById('part1Label'),
  part2Label: document.getElementById('part2Label'),
  part3Label: document.getElementById('part3Label'),
  part4Label: document.getElementById('part4Label'),
  part5Label: document.getElementById('part5Label'),
  part6Label: document.getElementById('part6Label'),
  part1Color: document.getElementById('part1Color'),
  part2Color: document.getElementById('part2Color'),
  part3Color: document.getElementById('part3Color'),
  part4Color: document.getElementById('part4Color'),
  part5Color: document.getElementById('part5Color'),
  part6Color: document.getElementById('part6Color'),
  part1Negative: document.getElementById('part1Negative'),
  part2Negative: document.getElementById('part2Negative'),
  part3Negative: document.getElementById('part3Negative'),
  part4Negative: document.getElementById('part4Negative'),
  part5Negative: document.getElementById('part5Negative'),
  part6Negative: document.getElementById('part6Negative')
};

let nextId = 1;
let selectedId = null;
const instances = [];
const renderTypeOrder = TYPE_NAMES.filter(type => type !== 'grid');
const renderBuckets = {};
const renderBucketState = {};
let renderListCache = [];
let renderListDirty = true;
let uploadDirty = true;
let sceneBoundsDirty = true;

renderTypeOrder.forEach(type => {
  renderBuckets[type] = [];
  renderBucketState[type] = {
    dirty: true,
    offset: 0,
    count: 0,
    instances: new Float32Array(0),
    radii: new Float32Array(0),
    part1Colors: new Float32Array(0),
    part2Colors: new Float32Array(0),
    part3Colors: new Float32Array(0),
    part4Colors: new Float32Array(0),
    part5Colors: new Float32Array(0),
    part6Colors: new Float32Array(0)
  };
});

function ensureRenderBucket(type){
  if(renderBuckets[type]) return;
  renderBuckets[type] = [];
  renderBucketState[type] = {
    dirty: true,
    offset: 0,
    count: 0,
    instances: new Float32Array(0),
    radii: new Float32Array(0),
    part1Colors: new Float32Array(0),
    part2Colors: new Float32Array(0),
    part3Colors: new Float32Array(0),
    part4Colors: new Float32Array(0),
    part5Colors: new Float32Array(0),
    part6Colors: new Float32Array(0)
  };
  renderTypeOrder.push(type);
}

function markTypeDirty(type, affectsOrder){
  ensureRenderBucket(type);
  renderBucketState[type].dirty = true;
  uploadDirty = true;
  sceneBoundsDirty = true;
  if(affectsOrder){
    renderListDirty = true;
  }
}

function attachInstanceToRenderBucket(inst){
  ensureRenderBucket(inst.type);
  renderBuckets[inst.type].push(inst);
  markTypeDirty(inst.type, true);
}

function detachInstanceFromRenderBucket(inst){
  const bucket = renderBuckets[inst.type];
  if(!bucket) return;
  const idx = bucket.indexOf(inst);
  if(idx >= 0){
    bucket.splice(idx, 1);
    markTypeDirty(inst.type, true);
  }
}

function getRenderableInstances(){
  if(!renderListDirty) return renderListCache;
  renderListCache = [];
  let cursor = 0;
  for(const type of renderTypeOrder){
    const bucket = renderBuckets[type] || [];
    const state = renderBucketState[type];
    state.offset = cursor;
    state.count = bucket.length;
    for(const inst of bucket){
      if(cursor >= MAX_INSTANCES) break;
      renderListCache.push(inst);
      cursor += 1;
    }
  }
  renderListDirty = false;
  return renderListCache;
}

function rebuildBucketCache(type){
  ensureRenderBucket(type);
  const bucket = renderBuckets[type];
  const state = renderBucketState[type];
  const count = Math.min(bucket.length, MAX_INSTANCES);
  const vec4Length = count * 4;
  const packedInst = state.instances.length === vec4Length ? state.instances : new Float32Array(vec4Length);
  const packedRadius = state.radii.length === count ? state.radii : new Float32Array(count);
  const packedP1 = state.part1Colors.length === vec4Length ? state.part1Colors : new Float32Array(vec4Length);
  const packedP2 = state.part2Colors.length === vec4Length ? state.part2Colors : new Float32Array(vec4Length);
  const packedP3 = state.part3Colors.length === vec4Length ? state.part3Colors : new Float32Array(vec4Length);
  const packedP4 = state.part4Colors.length === vec4Length ? state.part4Colors : new Float32Array(vec4Length);
  const packedP5 = state.part5Colors.length === vec4Length ? state.part5Colors : new Float32Array(vec4Length);
  const packedP6 = state.part6Colors.length === vec4Length ? state.part6Colors : new Float32Array(vec4Length);

  for(let i = 0; i < count; i++){
    const inst = bucket[i];
    const o = i * 4;
    packedInst[o + 0] = inst.x;
    packedInst[o + 1] = inst.y;
    packedInst[o + 2] = inst.z;
    const negativeMask =
      (inst.part1Negative ? 1 : 0) |
      (inst.part2Negative ? 2 : 0) |
      (inst.part3Negative ? 4 : 0) |
      (inst.part4Negative ? 8 : 0) |
      (inst.part5Negative ? 16 : 0) |
      (inst.part6Negative ? 32 : 0);
    packedInst[o + 3] = (TYPE[inst.type] ?? 0) + negativeMask / 64;
    packedRadius[i] = inst.radius ?? 0.36;

    packedP1[o + 0] = inst.part1Color[0];
    packedP1[o + 1] = inst.part1Color[1];
    packedP1[o + 2] = inst.part1Color[2];
    packedP1[o + 3] = inst.part1Negative ? 1 : 0;

    packedP2[o + 0] = inst.part2Color[0];
    packedP2[o + 1] = inst.part2Color[1];
    packedP2[o + 2] = inst.part2Color[2];
    packedP2[o + 3] = inst.part2Negative ? 1 : 0;

    packedP3[o + 0] = inst.part3Color[0];
    packedP3[o + 1] = inst.part3Color[1];
    packedP3[o + 2] = inst.part3Color[2];
    packedP3[o + 3] = inst.part3Negative ? 1 : 0;

    packedP4[o + 0] = inst.part4Color[0];
    packedP4[o + 1] = inst.part4Color[1];
    packedP4[o + 2] = inst.part4Color[2];
    packedP4[o + 3] = inst.part4Negative ? 1 : 0;

    packedP5[o + 0] = inst.part5Color[0];
    packedP5[o + 1] = inst.part5Color[1];
    packedP5[o + 2] = inst.part5Color[2];
    packedP5[o + 3] = inst.part5Negative ? 1 : 0;

    packedP6[o + 0] = inst.part6Color[0];
    packedP6[o + 1] = inst.part6Color[1];
    packedP6[o + 2] = inst.part6Color[2];
    packedP6[o + 3] = inst.part6Negative ? 1 : 0;
  }

  state.instances = packedInst;
  state.radii = packedRadius;
  state.part1Colors = packedP1;
  state.part2Colors = packedP2;
  state.part3Colors = packedP3;
  state.part4Colors = packedP4;
  state.part5Colors = packedP5;
  state.part6Colors = packedP6;
  state.count = count;
  state.dirty = false;
}

function composePackedArrays(){
  const ordered = getRenderableInstances();
  let cursor = 0;
  for(const type of renderTypeOrder){
    const state = renderBucketState[type];
    if(!state) continue;
    if(state.dirty){
      rebuildBucketCache(type);
    }
    if(state.count <= 0) continue;
    const instanceOffset = cursor * 4;
    packedInstances.set(state.instances, instanceOffset);
    packedRadii.set(state.radii, cursor);
    packedPart1Colors.set(state.part1Colors, instanceOffset);
    packedPart2Colors.set(state.part2Colors, instanceOffset);
    packedPart3Colors.set(state.part3Colors, instanceOffset);
    packedPart4Colors.set(state.part4Colors, instanceOffset);
    packedPart5Colors.set(state.part5Colors, instanceOffset);
    packedPart6Colors.set(state.part6Colors, instanceOffset);
    state.offset = cursor;
    cursor += state.count;
  }
  return Math.min(ordered.length, MAX_INSTANCES);
}

function hexToRgb01(hex){
  const clean = hex.replace('#','');
  const num = parseInt(clean,16);
  return [((num>>16)&255)/255, ((num>>8)&255)/255, (num&255)/255];
}

function rgb01ToHex(rgb){
  const r = Math.max(0,Math.min(255,Math.round(rgb[0]*255)));
  const g = Math.max(0,Math.min(255,Math.round(rgb[1]*255)));
  const b = Math.max(0,Math.min(255,Math.round(rgb[2]*255)));
  return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}

function makeDefaultInstance(type,x,y,z){
  return {
    id: nextId++,
    type,
    x, y, z: z || 0,
    radius: 0.36,
    part1Color: [0.145,0.388,0.922],
    part2Color: [0.937,0.267,0.267],
    part3Color: [0.133,0.773,0.369],
    part4Color: [0.961,0.620,0.043],
    part5Color: [0.659,0.333,0.969],
    part6Color: [0.024,0.714,0.831],
    part1Negative: false,
    part2Negative: false,
    part3Negative: false,
    part4Negative: false,
    part5Negative: false,
    part6Negative: false
  };
}

function editorConfigForType(type){
  if(type === 'dz2'){
    return { count: 4, labels: ['Parte de cima','Parte de baixo','Anel superior','Anel inferior'] };
  }
  if(type === 'dxy' || type === 'dyz' || type === 'dxz'){
    return { count: 4, labels: ['Superior A','Superior B','Inferior A','Inferior B'] };
  }
  if(type === 'dx2-y2'){
    return { count: 4, labels: ['Lóbulo 1','Lóbulo 2','Lóbulo 3','Lóbulo 4'] };
  }
  if(type === 'fz3'){
    return { count: 6, labels: ['Lóbulo superior','Lóbulo inferior','Anel sup A','Anel sup B','Anel inf A','Anel inf B'] };
  }
  if(type === 'fxz2' || type === 'fyz2' || type === 'fxyz' || type === 'fzx2-y2' || type === 'fxx2-3y2' || type === 'fy3x2-y2'){
    return { count: 6, labels: ['Parte 1','Parte 2','Parte 3','Parte 4','Parte 5','Parte 6'] };
  }
  return { count: 2, labels: ['Parte de baixo','Parte de cima'] };
}

function addStructure(type,x,y,z){
  if(instances.length >= MAX_INSTANCES) return null;
  const inst = makeDefaultInstance(type,x,y,z);

  if(type === 'px' || type === 'py' || type === 'pz'){
    inst.radius = 0.32;
  }
  if(type === 'dxy' || type === 'dyz' || type === 'dxz' || type === 'dz2' || type === 'dx2-y2'){
    inst.radius = 0.20;
  }
  if(type === 'fz3'){
    inst.radius = 0.30;
  }
  if(type === 'fxz2' || type === 'fyz2' || type === 'fxyz' || type === 'fzx2-y2' || type === 'fxx2-3y2' || type === 'fy3x2-y2'){
    inst.radius = 0.22;
  }

  if(type === 's'){
    inst.part1Color = [0.984,0.757,0.239];
    inst.part2Color = [0.953,0.553,0.102];
  }
  if(type === 'dz2'){
    inst.part1Color = [0.937,0.267,0.267];
    inst.part2Color = [0.145,0.388,0.922];
    inst.part3Color = [0.133,0.773,0.369];
    inst.part4Color = [0.961,0.620,0.043];
  }
  if(type === 'fz3' || type === 'fxz2' || type === 'fyz2' || type === 'fxyz' || type === 'fzx2-y2' || type === 'fxx2-3y2' || type === 'fy3x2-y2'){
    inst.part1Color = [0.937,0.267,0.267];
    inst.part2Color = [0.145,0.388,0.922];
    inst.part3Color = [0.133,0.773,0.369];
    inst.part4Color = [0.961,0.620,0.043];
    inst.part5Color = [0.659,0.333,0.969];
    inst.part6Color = [0.024,0.714,0.831];
  }
  instances.push(inst);
  attachInstanceToRenderBucket(inst);
  syncGeneralLabels();
  if(ensureRenderer()) startRenderLoop();
  selectInstance(inst.id);
  return inst;
}

function defaultPlacement(type){
  const total = instances.length;
  const row = Math.floor(total / 4);
  const col = total % 4;
  return {
    x: -1.35 + col * 0.92,
    y: 0.85 - row * 0.78,
    z: 0
  };
}

function getSelected(){ return instances.find(i => i.id === selectedId) || null; }

function selectInstance(id){
  selectedId = id;
  syncSelectionUi();
  syncGeneralLabels();
  refreshOverlayUi();
  requestRender();
}

function removeSelected(){
  if(selectedId == null) return;
  const idx = instances.findIndex(i => i.id === selectedId);
  if(idx >= 0){
    const removed = instances[idx];
    detachInstanceFromRenderBucket(removed);
    instances.splice(idx,1);
  }
  selectedId = null;
  syncSelectionUi();
  syncGeneralLabels();
  refreshOverlayUi();
  requestRender();
}

function setViewMode(is2D){
  const wants2D = !!is2D;
  if(wants2D === state.view2D){
    ui.view2D.checked = wants2D;
    return;
  }

  if(wants2D){
    state.last3DYaw = state.yaw;
    state.last3DPitch = state.pitch;
    state.view2D = true;
    state.yaw = 0.0;
    state.pitch = 0.0;
  }else{
    state.view2D = false;
    state.yaw = state.last3DYaw;
    state.pitch = state.last3DPitch;
  }

  ui.view2D.checked = wants2D;
  syncSelectionUi();
  refreshOverlayUi();
  requestRender();
}

function syncEditorEnabled(enabled){
  ui.posX.disabled = !enabled;
  ui.posY.disabled = !enabled;
  ui.posZ.disabled = !enabled;
  ui.radius.disabled = !enabled;
  [ui.part1Color, ui.part2Color, ui.part3Color, ui.part4Color, ui.part5Color, ui.part6Color, ui.part1Negative, ui.part2Negative, ui.part3Negative, ui.part4Negative, ui.part5Negative, ui.part6Negative].forEach(el => {
    el.disabled = !enabled;
  });
}

function applyEditorLayout(type){
  const cfg = editorConfigForType(type);
  const cells = [ui.part1Cell, ui.part2Cell, ui.part3Cell, ui.part4Cell, ui.part5Cell, ui.part6Cell];
  const labels = [ui.part1Label, ui.part2Label, ui.part3Label, ui.part4Label, ui.part5Label, ui.part6Label];
  cells.forEach((cell, idx) => {
    cell.style.display = idx < cfg.count ? 'block' : 'none';
    labels[idx].textContent = cfg.labels[idx] || ('Parte ' + (idx + 1));
  });
}

function syncSelectionUi(){
  const sel = getSelected();
  if(sel){
    syncEditorEnabled(true);
    applyEditorLayout(sel.type);
    ui.posX.value = String(sel.x);
    ui.posY.value = String(sel.y);
    ui.posZ.value = String(sel.z);
    ui.radius.value = String(sel.radius);
    ui.posXValue.textContent = sel.x.toFixed(2);
    ui.posYValue.textContent = sel.y.toFixed(2);
    ui.posZValue.textContent = sel.z.toFixed(2);
    ui.radiusValue.textContent = sel.radius.toFixed(2);
    ui.part1Color.value = rgb01ToHex(sel.part1Color);
    ui.part2Color.value = rgb01ToHex(sel.part2Color);
    ui.part3Color.value = rgb01ToHex(sel.part3Color);
    ui.part4Color.value = rgb01ToHex(sel.part4Color);
    ui.part5Color.value = rgb01ToHex(sel.part5Color);
    ui.part6Color.value = rgb01ToHex(sel.part6Color);
    ui.part1Negative.checked = !!sel.part1Negative;
    ui.part2Negative.checked = !!sel.part2Negative;
    ui.part3Negative.checked = !!sel.part3Negative;
    ui.part4Negative.checked = !!sel.part4Negative;
    ui.part5Negative.checked = !!sel.part5Negative;
    ui.part6Negative.checked = !!sel.part6Negative;
    selectionHint.textContent = 'Estrutura selecionada: ' + sel.type + ' #' + sel.id + '.';
  }else{
    syncEditorEnabled(false);
    applyEditorLayout('s');
    ui.posXValue.textContent = '—';
    ui.posYValue.textContent = '—';
    ui.posZValue.textContent = '—';
    ui.radiusValue.textContent = '—';
    selectionHint.textContent = state.view2D
      ? 'Estrutura selecionada: nenhuma. No modo 2D, arrastar move a visão e o scroll controla o zoom.'
      : 'Estrutura selecionada: nenhuma. Arrastar orbita a câmera em perspectiva, Shift+arrastar move a câmera e o scroll controla o zoom.';
  }
}

function syncGeneralLabels(){
  badge.textContent = instances.length === 0 ? 'Canvas vazio • fundo escuro' : ('Instâncias: ' + instances.length + (selectedId != null ? ' • selecionada ' + selectedId : ''));
}

function syncGeneralFromUi(){
  state.autorotate = ui.autorotate.checked;
  state.showAxes = ui.showAxes.checked;
  setViewMode(ui.view2D.checked);
  state.whiteBg = false;
  document.body.style.background = '#0d0d0f';
  syncGeneralLabels();
  refreshOverlayUi();
  requestRender();
}

function syncSelectedFromUi(){
  const sel = getSelected();
  if(!sel) return;
  sel.x = parseFloat(ui.posX.value);
  sel.y = parseFloat(ui.posY.value);
  sel.z = parseFloat(ui.posZ.value);
  sel.radius = parseFloat(ui.radius.value);
  sel.part1Color = hexToRgb01(ui.part1Color.value);
  sel.part2Color = hexToRgb01(ui.part2Color.value);
  sel.part3Color = hexToRgb01(ui.part3Color.value);
  sel.part4Color = hexToRgb01(ui.part4Color.value);
  sel.part5Color = hexToRgb01(ui.part5Color.value);
  sel.part6Color = hexToRgb01(ui.part6Color.value);
  sel.part1Negative = ui.part1Negative.checked;
  sel.part2Negative = ui.part2Negative.checked;
  sel.part3Negative = ui.part3Negative.checked;
  sel.part4Negative = ui.part4Negative.checked;
  sel.part5Negative = ui.part5Negative.checked;
  sel.part6Negative = ui.part6Negative.checked;
  markTypeDirty(sel.type, false);
  ui.posXValue.textContent = sel.x.toFixed(2);
  ui.posYValue.textContent = sel.y.toFixed(2);
  ui.posZValue.textContent = sel.z.toFixed(2);
  ui.radiusValue.textContent = sel.radius.toFixed(2);
  refreshOverlayUi();
  requestRender();
}

ui.posX.addEventListener('input', syncSelectedFromUi);
ui.posY.addEventListener('input', syncSelectedFromUi);
ui.posZ.addEventListener('input', syncSelectedFromUi);
ui.radius.addEventListener('input', syncSelectedFromUi);
ui.part1Color.addEventListener('input', syncSelectedFromUi);
ui.part2Color.addEventListener('input', syncSelectedFromUi);
ui.part3Color.addEventListener('input', syncSelectedFromUi);
ui.part4Color.addEventListener('input', syncSelectedFromUi);
ui.part5Color.addEventListener('input', syncSelectedFromUi);
ui.part6Color.addEventListener('input', syncSelectedFromUi);
ui.part1Negative.addEventListener('input', syncSelectedFromUi);
ui.part2Negative.addEventListener('input', syncSelectedFromUi);
ui.part3Negative.addEventListener('input', syncSelectedFromUi);
ui.part4Negative.addEventListener('input', syncSelectedFromUi);
ui.part5Negative.addEventListener('input', syncSelectedFromUi);
ui.part6Negative.addEventListener('input', syncSelectedFromUi);

[ui.autorotate, ui.showAxes, ui.view2D]
  .forEach(el => el.addEventListener('input', syncGeneralFromUi));

document.querySelectorAll('.structCard').forEach(card=>{
  card.setAttribute('role', 'button');
  card.tabIndex = 0;
  card.setAttribute('aria-label', `Adicionar estrutura ${card.textContent.trim()}`);
  const addFromCard = (e)=>{
    e.preventDefault();
    const type = card.dataset.type;
    const p = defaultPlacement(type);
    addStructure(type, p.x, p.y, p.z);
  };
  card.addEventListener('click', addFromCard);
  card.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      addFromCard(e);
    }
  });
});

removeBtn.addEventListener('click', removeSelected);

let dragging = false;
let lastX = 0;
let lastY = 0;
let gizmoDrag = null;

let dragMode = 'orbit';


function beginGizmoDrag(axis, e){
  const sel = getSelected();
  if(!sel) return;
  const startCenter = { x: sel.x, y: sel.y, z: sel.z };
  gizmoDrag = {
    axis,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    startPos: startCenter,
    startProj: axisProjectionFor(startCenter, axis, 1.0),
    startScalar: axisDragScalar(startCenter, axis, e.clientX, e.clientY)
  };
  dragging = false;
  refreshOverlayUi();
  requestRender();
  e.preventDefault();
  e.stopPropagation();
}

[['x', gizmoAxisX], ['x', gizmoHandleX], ['y', gizmoAxisY], ['y', gizmoHandleY], ['z', gizmoAxisZ], ['z', gizmoHandleZ]].forEach(([axis, el]) => {
  el.addEventListener('mousedown', e => beginGizmoDrag(axis, e));
});
canvas.addEventListener('contextmenu', e=> e.preventDefault());

canvas.addEventListener('mousedown', e=>{
  dragging = true;
  dragMode = (state.view2D || e.shiftKey || e.button === 2) ? 'pan' : 'orbit';
  lastX = e.clientX;
  lastY = e.clientY;
});

window.addEventListener('mouseup', ()=>{
  dragging = false;
  dragMode = 'orbit';
  gizmoDrag = null;
});

window.addEventListener('mousemove', e=>{
  if(gizmoDrag){
    const sel = getSelected();
    if(!sel){
      gizmoDrag = null;
      return;
    }
    let deltaUnits = null;
    const liveScalar = axisDragScalar(gizmoDrag.startPos, gizmoDrag.axis, e.clientX, e.clientY);
    if(liveScalar != null && gizmoDrag.startScalar != null){
      deltaUnits = liveScalar - gizmoDrag.startScalar;
    }else{
      const proj = gizmoDrag.startProj || dragAxisProjectionFor(gizmoDrag.startPos, gizmoDrag.axis, 1.0);
      if(proj){
        const len = Math.hypot(proj.vx, proj.vy);
        if(len > 0.0001){
          const ux = proj.vx / len;
          const uy = proj.vy / len;
          const movePx = (e.clientX - gizmoDrag.startMouseX) * ux + (e.clientY - gizmoDrag.startMouseY) * uy;
          deltaUnits = movePx / len;
        }
      }
    }
    if(deltaUnits != null){
      const a = axisUnit(gizmoDrag.axis);
      sel.x = gizmoDrag.startPos.x + a.x * deltaUnits;
      sel.y = gizmoDrag.startPos.y + a.y * deltaUnits;
      sel.z = gizmoDrag.startPos.z + a.z * deltaUnits;
      ui.posX.value = String(sel.x);
      ui.posY.value = String(sel.y);
      ui.posZ.value = String(sel.z);
      ui.posXValue.textContent = sel.x.toFixed(2);
      ui.posYValue.textContent = sel.y.toFixed(2);
      ui.posZValue.textContent = sel.z.toFixed(2);
      markTypeDirty(sel.type, false);
      refreshOverlayUi();
      requestRender();
    }
    return;
  }

  if(!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  if(dragMode === 'pan'){
    const basis = getCameraBasis();
    let worldDX;
    let worldDY;
    if(state.view2D){
      const minDim = Math.min(canvas.clientWidth, canvas.clientHeight);
      const ar = canvas.clientWidth / canvas.clientHeight;
      worldDX = (dx / minDim) * 2.0 * ar * basis.orthoScale;
      worldDY = (-dy / minDim) * 2.0 * basis.orthoScale;
    }else{
      const ar = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      worldDX = (dx / Math.max(1, canvas.clientWidth)) * 2.0 * basis.distance * basis.perspectiveTan * ar;
      worldDY = (-dy / Math.max(1, canvas.clientHeight)) * 2.0 * basis.distance * basis.perspectiveTan;
    }
    state.targetX -= basis.right.x * worldDX + basis.up.x * worldDY;
    state.targetY -= basis.right.y * worldDX + basis.up.y * worldDY;
    state.targetZ -= basis.right.z * worldDX + basis.up.z * worldDY;
  }else{
    state.yaw += dx * 0.008;
    state.pitch += dy * 0.008;
    state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch));
  }
  refreshOverlayUi();
  requestRender();
});

canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  if(state.view2D){
    state.zoom += e.deltaY * 0.002;
    state.zoom = Math.max(1.2, Math.min(8.0, state.zoom));
  }else{
    state.zoom *= (1 + Math.sign(e.deltaY) * 0.08);
    state.zoom = Math.max(CAMERA_MIN_DISTANCE, Math.min(CAMERA_MAX_DISTANCE, state.zoom));
  }
  refreshOverlayUi();
  requestRender();
},{passive:false});

canvas.addEventListener('dblclick', e=>{
  const hit = pickInstance(e.clientX, e.clientY);
  if(hit){
    selectInstance(hit.id);
  }else{
    selectedId = null;
    syncSelectionUi();
    syncGeneralLabels();
    refreshOverlayUi();
    requestRender();
  }
});

canvas.tabIndex = 0;
canvas.setAttribute('role', 'img');
canvas.setAttribute('aria-label', 'Visualização 3D de orbitais. Use os cartões de estrutura com clique, Enter ou barra de espaço. Dê dois cliques na cena para selecionar uma estrutura.');
canvas.addEventListener('keydown', e=>{
  if(e.key === 'Escape'){
    selectedId = null;
    syncSelectionUi();
    syncGeneralLabels();
    refreshOverlayUi();
    requestRender();
  }
});

function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_RENDER_DPR);
  const w = Math.max(1, Math.floor(innerWidth * dpr));
  const h = Math.max(1, Math.floor(innerHeight * dpr));
  if(canvas.width !== w || canvas.height !== h){
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    if(gl) gl.viewport(0,0,w,h);
    refreshOverlayUi(true);
    requestRender();
  }
}


window.addEventListener('keydown', e=>{
  if(e.key === 'Home'){
    state.last3DYaw = CAMERA_DEFAULT_YAW;
    state.last3DPitch = CAMERA_DEFAULT_PITCH;
    state.yaw = state.view2D ? 0.0 : CAMERA_DEFAULT_YAW;
    state.pitch = state.view2D ? 0.0 : CAMERA_DEFAULT_PITCH;
    state.zoom = state.view2D ? 5.0 : CAMERA_DEFAULT_DISTANCE;
    state.targetX = 0.0;
    state.targetY = 0.0;
    state.targetZ = 0.0;
    refreshOverlayUi();
    requestRender();
  }
});
window.addEventListener('resize', ()=>{
  resize();
  requestRender();
});

function dot(a,b){ return a.x*b.x + a.y*b.y + a.z*b.z; }
function cross(a,b){ return { x:a.y*b.z-a.z*b.y, y:a.z*b.x-a.x*b.z, z:a.x*b.y-a.y*b.x }; }
function normalize(v){
  const len = Math.hypot(v.x,v.y,v.z) || 1;
  return { x:v.x/len, y:v.y/len, z:v.z/len };
}
function subtract(a,b){ return { x:a.x-b.x, y:a.y-b.y, z:a.z-b.z }; }
function add(a,b){ return { x:a.x+b.x, y:a.y+b.y, z:a.z+b.z }; }
function scaleVec(v,s){ return { x:v.x*s, y:v.y*s, z:v.z*s }; }

function currentYaw(){
  if(state.view2D) return 0.0;
  return state.yaw + (state.autorotate ? performance.now()*0.001*0.28 : 0);
}

function getCameraBasis(){
  const yaw = state.view2D
    ? (state.autorotate ? performance.now()*0.001*0.28 : 0.0)
    : currentYaw();
  const pitch = state.view2D ? 0.0 : state.pitch;
  const cosp = Math.cos(pitch), sinp = Math.sin(pitch);

  const target = { x:state.targetX, y:state.targetY, z:state.targetZ };
  const distance = Math.max(state.zoom, 0.05);
  const roCenter = {
    x: target.x + distance * cosp * Math.sin(yaw),
    y: target.y + distance * sinp,
    z: target.z + distance * cosp * Math.cos(yaw)
  };

  const forward = normalize({x:target.x-roCenter.x, y:target.y-roCenter.y, z:target.z-roCenter.z});
  const upSeed = Math.abs(dot(forward, {x:0,y:1,z:0})) > 0.98 ? {x:0,y:0,z:1} : {x:0,y:1,z:0};
  let right = normalize(cross(forward, upSeed));
  if(!Number.isFinite(right.x) || !Number.isFinite(right.y) || !Number.isFinite(right.z)){
    right = {x:1,y:0,z:0};
  }
  const up = cross(right, forward);
  const orthoScale = distance * 0.42;
  return { target, roCenter, forward, right, up, orthoScale, distance, perspectiveTan:CAMERA_TAN };
}


function getPointerRay(clientX, clientY){
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  const ndcX = (localX / width) * 2.0 - 1.0;
  const ndcY = -((localY / height) * 2.0 - 1.0);
  const basis = getCameraBasis();
  const ar = width / height;

  if(state.view2D){
    const origin = add(
      basis.roCenter,
      add(
        scaleVec(basis.right, ndcX * ar * basis.orthoScale),
        scaleVec(basis.up, ndcY * basis.orthoScale)
      )
    );
    return { origin, dir: basis.forward };
  }

  const dir = normalize(add(
    basis.forward,
    add(
      scaleVec(basis.right, ndcX * ar * basis.perspectiveTan),
      scaleVec(basis.up, ndcY * basis.perspectiveTan)
    )
  ));
  return { origin: basis.roCenter, dir };
}

function axisDragPlaneNormal(axisDir){
  const basis = getCameraBasis();
  let n = subtract(basis.forward, scaleVec(axisDir, dot(basis.forward, axisDir)));
  let len = Math.hypot(n.x, n.y, n.z);
  if(len < 0.0001){
    n = subtract(basis.up, scaleVec(axisDir, dot(basis.up, axisDir)));
    len = Math.hypot(n.x, n.y, n.z);
  }
  if(len < 0.0001){
    n = subtract(basis.right, scaleVec(axisDir, dot(basis.right, axisDir)));
    len = Math.hypot(n.x, n.y, n.z);
  }
  if(len < 0.0001) return null;
  return { x:n.x/len, y:n.y/len, z:n.z/len };
}

function intersectRayPlane(rayOrigin, rayDir, planePoint, planeNormal){
  const denom = dot(rayDir, planeNormal);
  if(Math.abs(denom) < 0.00001) return null;
  const t = dot(subtract(planePoint, rayOrigin), planeNormal) / denom;
  return add(rayOrigin, scaleVec(rayDir, t));
}

function axisDragScalar(centerWorld, axis, clientX, clientY){
  const ray = getPointerRay(clientX, clientY);
  if(!ray) return null;
  const axisDir = normalize(axisUnit(axis));
  const planeNormal = axisDragPlaneNormal(axisDir);
  if(!planeNormal) return null;
  const hit = intersectRayPlane(ray.origin, ray.dir, centerWorld, planeNormal);
  if(!hit) return null;
  return dot(subtract(hit, centerWorld), axisDir);
}

function createProjectionContext(){
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  return { rect, width, height, ar: width / height, basis: getCameraBasis() };
}

function projectWorldToScreenPoint(worldPoint, projectionContext){
  const ctx = projectionContext || createProjectionContext();
  const { rect, width, height, ar, basis } = ctx;
  const v = {
    x: worldPoint.x - basis.roCenter.x,
    y: worldPoint.y - basis.roCenter.y,
    z: worldPoint.z - basis.roCenter.z
  };
  const depth = dot(v, basis.forward);
  const pu = dot(v, basis.right);
  const pv = dot(v, basis.up);
  let sx;
  let sy;
  if(state.view2D){
    const ndcX = pu / (ar * basis.orthoScale);
    const ndcY = pv / basis.orthoScale;
    if(!Number.isFinite(ndcX) || !Number.isFinite(ndcY)) return null;
    sx = (ndcX * 0.5 + 0.5) * width;
    sy = (1 - (ndcY * 0.5 + 0.5)) * height;
  }else{
    if(depth <= 0.05) return null;
    const ndcX = pu / (depth * basis.perspectiveTan * ar);
    const ndcY = pv / (depth * basis.perspectiveTan);
    if(!Number.isFinite(ndcX) || !Number.isFinite(ndcY)) return null;
    sx = (ndcX * 0.5 + 0.5) * width;
    sy = (1 - (ndcY * 0.5 + 0.5)) * height;
  }
  return { x: rect.left + sx, y: rect.top + sy, localX: sx, localY: sy, z: depth };
}

function projectToScreen(inst, projectionContext){
  return projectWorldToScreenPoint({ x: inst.x, y: inst.y, z: inst.z }, projectionContext);
}

function pickInstance(clientX, clientY){
  const projectionContext = createProjectionContext();
  let best = null;
  let bestDist = 999999;
  for(const inst of instances){
    const p = projectToScreen(inst, projectionContext);
    if(!p) continue;
    const dx = p.x - clientX;
    const dy = p.y - clientY;
    const dist = Math.hypot(dx,dy);
    if(dist < 58 && dist < bestDist){
      bestDist = dist;
      best = inst;
    }
  }
  return best;
}

function updateRemoveButton(projectionContext){
  const sel = getSelected();
  if(!sel){
    removeBtn.style.display = 'none';
    return;
  }
  const p = projectWorldToScreenPoint({ x: sel.x, y: sel.y, z: sel.z }, projectionContext);
  if(!p){
    removeBtn.style.display = 'none';
    return;
  }
  removeBtn.style.display = 'flex';
  removeBtn.style.left = p.x + 'px';
  removeBtn.style.top = (p.y + 40) + 'px';
}

function setGizmoVisibility(show){
  gizmoOverlay.style.display = show ? 'block' : 'none';
  if(!show){
    gizmoAxisZ.style.display = '';
    gizmoHandleZ.style.display = '';
    gizmoLabelZ.style.display = '';
  }
}

let overlayViewportWidth = -1;
let overlayViewportHeight = -1;
function syncGizmoOverlayViewport(){
  const width = window.innerWidth;
  const height = window.innerHeight;
  if(width === overlayViewportWidth && height === overlayViewportHeight) return;
  overlayViewportWidth = width;
  overlayViewportHeight = height;
  gizmoOverlay.setAttribute('width', String(width));
  gizmoOverlay.setAttribute('height', String(height));
  gizmoOverlay.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
}

let overlayStateCache = '';

function shouldContinuouslyRender(){
  return !!(state.autorotate && getSelected());
}

function shouldContinuouslySyncOverlay(){
  return shouldContinuouslyRender();
}

function overlayStateKey(){
  const sel = getSelected();
  const yaw = state.view2D ? 0.0 : currentYaw();
  const pitch = state.view2D ? 0.0 : state.pitch;
  const parts = [
    window.innerWidth,
    window.innerHeight,
    state.showAxes ? 1 : 0,
    state.view2D ? 1 : 0,
    yaw.toFixed(3),
    pitch.toFixed(3),
    state.targetX.toFixed(3),
    state.targetY.toFixed(3),
    state.targetZ.toFixed(3),
    state.zoom.toFixed(3),
    sel ? sel.id : -1
  ];
  if(sel){
    parts.push(sel.x.toFixed(3), sel.y.toFixed(3), sel.z.toFixed(3), sel.radius.toFixed(3));
  }
  return parts.join('|');
}

function refreshOverlayUi(force){
  syncGizmoOverlayViewport();
  const key = overlayStateKey();
  if(!force && key === overlayStateCache) return;
  overlayStateCache = key;
  const projectionContext = createProjectionContext();
  updateRemoveButton(projectionContext);
  updateAxesOverlay(projectionContext);
  updateTransformGizmo(projectionContext);
}

function setGizmoLine(lineEl, p0, p1){
  lineEl.setAttribute('x1', p0.x.toFixed(2));
  lineEl.setAttribute('y1', p0.y.toFixed(2));
  lineEl.setAttribute('x2', p1.x.toFixed(2));
  lineEl.setAttribute('y2', p1.y.toFixed(2));
}

function setGizmoHandle(handleEl, p){
  handleEl.setAttribute('cx', p.x.toFixed(2));
  handleEl.setAttribute('cy', p.y.toFixed(2));
}
function setGizmoLabel(labelEl, p, dx, dy){
  labelEl.setAttribute('x', (p.x + dx).toFixed(2));
  labelEl.setAttribute('y', (p.y + dy).toFixed(2));
}

function axisUnit(axis){
  if(axis === 'x') return {x:1,y:0,z:0};
  if(axis === 'y') return {x:0,y:1,z:0};
  return {x:0,y:0,z:-1};
}

function gizmoCenterWorld(sel){
  return { x: sel.x, y: sel.y, z: sel.z };
}

function axisProjectionFor(centerWorld, axis, lengthScale, projectionContext){
  const dir = axisUnit(axis);
  const s = lengthScale == null ? 1 : lengthScale;
  const visual = {
    x:centerWorld.x + dir.x * s,
    y:centerWorld.y + dir.y * s,
    z:centerWorld.z + dir.z * s
  };
  const p0 = projectWorldToScreenPoint(centerWorld, projectionContext);
  const p1 = projectWorldToScreenPoint(visual, projectionContext);
  if(!p0 || !p1) return null;
  return { p0, p1, vx:p1.x-p0.x, vy:p1.y-p0.y };
}

function dragAxisProjectionFor(centerWorld, axis, lengthScale){
  return axisProjectionFor(centerWorld, axis, lengthScale);
}

function updateTransformGizmo(projectionContext){
  const sel = getSelected();
  if(!sel){
    setGizmoVisibility(false);
    return;
  }
  const centerWorld = gizmoCenterWorld(sel);
  const scale = 0.72 + sel.radius * 1.45;
  const projX = axisProjectionFor(centerWorld, 'x', scale, projectionContext);
  const projY = axisProjectionFor(centerWorld, 'y', scale, projectionContext);
  const projZ = axisProjectionFor(centerWorld, 'z', scale, projectionContext);
  if(!projX || !projY || !projZ){
    setGizmoVisibility(false);
    return;
  }
  const origin = projectWorldToScreenPoint(centerWorld, projectionContext);
  if(!origin){
    setGizmoVisibility(false);
    return;
  }
  setGizmoVisibility(true);
  setGizmoLine(gizmoAxisX, origin, projX.p1);
  setGizmoLine(gizmoAxisY, origin, projY.p1);
  setGizmoLine(gizmoAxisZ, origin, projZ.p1);
  setGizmoHandle(gizmoHandleX, projX.p1);
  setGizmoHandle(gizmoHandleY, projY.p1);
  setGizmoHandle(gizmoHandleZ, projZ.p1);
  setGizmoLabel(gizmoLabelX, projX.p1, 12, -10);
  setGizmoLabel(gizmoLabelY, projY.p1, 12, -10);
  setGizmoLabel(gizmoLabelZ, projZ.p1, 12, -10);

  const zDisplay = state.view2D ? 'none' : '';
  gizmoAxisZ.style.display = zDisplay;
  gizmoHandleZ.style.display = zDisplay;
  gizmoLabelZ.style.display = zDisplay;
}

function setAxisVisibility(show){
  axesOverlay.style.display = show ? 'block' : 'none';
}

function setAxisLine(lineEl, x1, y1, x2, y2){
  lineEl.setAttribute('x1', x1.toFixed(2));
  lineEl.setAttribute('y1', y1.toFixed(2));
  lineEl.setAttribute('x2', x2.toFixed(2));
  lineEl.setAttribute('y2', y2.toFixed(2));
}

function setAxisLabel(labelEl, x, y){
  labelEl.setAttribute('x', x.toFixed(2));
  labelEl.setAttribute('y', y.toFixed(2));
}

function axisWidgetPoint(dir, basis, center, scale){
  const sx = center.x + dot(dir, basis.right) * scale;
  const sy = center.y - dot(dir, basis.up) * scale;
  const depth = dot(dir, basis.forward);
  return { x:sx, y:sy, depth:depth };
}

function updateAxesOverlay(projectionContext){
  if(!state.showAxes){
    setAxisVisibility(false);
    return;
  }

  const basis = projectionContext ? projectionContext.basis : getCameraBasis();
  const center = { x:76, y:76 };
  const scale = 34.0;

  const xPos = axisWidgetPoint({x:1,y:0,z:0}, basis, center, scale);
  const xNeg = axisWidgetPoint({x:-1,y:0,z:0}, basis, center, scale);
  const yPos = axisWidgetPoint({x:0,y:1,z:0}, basis, center, scale);
  const yNeg = axisWidgetPoint({x:0,y:-1,z:0}, basis, center, scale);
  const zPos = axisWidgetPoint({x:0,y:0,z:-1}, basis, center, scale);
  const zNeg = axisWidgetPoint({x:0,y:0,z:1}, basis, center, scale);

  setAxisVisibility(true);

  if(state.view2D){
    axisLineZPos.style.display = 'none';
    axisLineZNeg.style.display = 'none';
    axisLabelZPos.style.display = 'none';
    axisLabelZNeg.style.display = 'none';
  }else{
    axisLineZPos.style.display = '';
    axisLineZNeg.style.display = '';
    axisLabelZPos.style.display = '';
    axisLabelZNeg.style.display = '';
  }

  setAxisLine(axisLineXPos, center.x, center.y, xPos.x, xPos.y);
  setAxisLine(axisLineXNeg, center.x, center.y, xNeg.x, xNeg.y);
  setAxisLine(axisLineYPos, center.x, center.y, yPos.x, yPos.y);
  setAxisLine(axisLineYNeg, center.x, center.y, yNeg.x, yNeg.y);
  setAxisLine(axisLineZPos, center.x, center.y, zPos.x, zPos.y);
  setAxisLine(axisLineZNeg, center.x, center.y, zNeg.x, zNeg.y);

  axisOrigin.setAttribute('cx', center.x.toFixed(2));
  axisOrigin.setAttribute('cy', center.y.toFixed(2));

  setAxisLabel(axisLabelXPos, xPos.x + 10, xPos.y + 1);
  setAxisLabel(axisLabelXNeg, xNeg.x - 10, xNeg.y + 1);
  setAxisLabel(axisLabelYPos, yPos.x, yPos.y - 10);
  setAxisLabel(axisLabelYNeg, yNeg.x, yNeg.y + 10);
  setAxisLabel(axisLabelZPos, zPos.x + 8, zPos.y - 8);
  setAxisLabel(axisLabelZNeg, zNeg.x - 8, zNeg.y + 8);

  axisLineXPos.style.opacity = (0.72 + Math.max(xPos.depth,0.0) * 0.28).toFixed(2);
  axisLineYPos.style.opacity = (0.72 + Math.max(yPos.depth,0.0) * 0.28).toFixed(2);
  axisLineZPos.style.opacity = (0.72 + Math.max(zPos.depth,0.0) * 0.28).toFixed(2);

  axisLineXNeg.style.opacity = (0.18 + Math.max(xNeg.depth,0.0) * 0.18).toFixed(2);
  axisLineYNeg.style.opacity = (0.18 + Math.max(yNeg.depth,0.0) * 0.18).toFixed(2);
  axisLineZNeg.style.opacity = (0.18 + Math.max(zNeg.depth,0.0) * 0.18).toFixed(2);

  axisLabelXPos.style.opacity = (0.82 + Math.max(xPos.depth,0.0) * 0.18).toFixed(2);
  axisLabelYPos.style.opacity = (0.82 + Math.max(yPos.depth,0.0) * 0.18).toFixed(2);
  axisLabelZPos.style.opacity = (0.82 + Math.max(zPos.depth,0.0) * 0.18).toFixed(2);
}

function structureFieldBound(type, radius){
  const r2 = Math.max(0.0001, radius * radius);
  const ellipsoidA = (weight, maxScale, count) => weight * maxScale * maxScale * count;
  const torusA = (weight, maxTubeScale, count) => weight * maxTubeScale * maxTubeScale * count;

  if(type === 's' || type === 'pxz'){
    const scale = 0.92 + radius * 0.30;
    return { extent:0, coefficient:ellipsoidA(r2 * (type === 's' ? 1.18 : 1.10), scale, 1) };
  }
  if(type === 'px' || type === 'py' || type === 'pz'){
    const offset = 0.24 + radius * 0.52;
    return { extent:offset, coefficient:ellipsoidA(r2 * 1.14, 1.45, 2) };
  }
  if(type === 'dxy' || type === 'dyz' || type === 'dxz'){
    const offset = 0.28 + radius * 0.56;
    return { extent:offset, coefficient:ellipsoidA(r2 * 1.08, 1.52, 4) };
  }
  if(type === 'dz2'){
    const lobeOffset = 0.26 + radius * 0.56;
    const ringR = 0.30 + radius * 0.48;
    const tubeMax = Math.max(0.56 + radius * 0.24, 0.44 + radius * 0.20);
    const ringW = 0.115 + radius * 0.045;
    return {
      extent:Math.max(lobeOffset, ringR),
      coefficient:ellipsoidA(r2 * 1.10, 1.55, 2) + torusA(ringW, tubeMax, 1)
    };
  }
  if(type === 'dx2-y2'){
    const offset = 0.24 + radius * 0.52;
    return { extent:offset, coefficient:ellipsoidA(r2 * 1.12, 1.45, 4) };
  }
  if(type === 'fz3'){
    const lobeOffset = 0.34 + radius * 0.74;
    const ringR = 0.30 + radius * 0.48;
    const ringOffset = 0.18 + radius * 0.24;
    const ringExtent = Math.hypot(ringR, ringOffset);
    const tubeMax = Math.max(0.56 + radius * 0.24, 0.44 + radius * 0.20);
    const ringW = 0.115 + radius * 0.045;
    return {
      extent:Math.max(lobeOffset, ringExtent),
      coefficient:ellipsoidA(r2 * 1.08, 1.68, 2) + torusA(ringW, tubeMax, 2)
    };
  }
  if(type === 'fxz2' || type === 'fyz2'){
    const longOffset = 0.38 + radius * 0.60;
    const diagOffset = 0.26 + radius * 0.42;
    return {
      extent:Math.max(longOffset, diagOffset),
      coefficient:ellipsoidA(r2 * 1.02, 1.46, 2) + ellipsoidA(r2 * 0.92, 1.34, 4)
    };
  }
  if(type === 'fxyz'){
    const offset = 0.34 + radius * 0.52;
    return { extent:offset, coefficient:ellipsoidA(r2 * 0.88, 1.30, 8) };
  }
  if(type === 'fzx2-y2'){
    const zOffset = 0.32 + radius * 0.60;
    const diagOffset = 0.34 + radius * 0.48;
    return {
      extent:Math.max(zOffset, diagOffset),
      coefficient:ellipsoidA(r2 * 0.98, 1.52, 2) + ellipsoidA(r2 * 0.88, 1.34, 4)
    };
  }
  if(type === 'fxx2-3y2' || type === 'fy3x2-y2'){
    const offset = 0.42 + radius * 0.56;
    return { extent:offset, coefficient:ellipsoidA(r2 * 0.92, 1.34, 6) };
  }
  if(type === 'anel'){
    const ringR = 0.30 + radius * 0.48;
    const tubeMax = Math.max(0.56 + radius * 0.24, 0.44 + radius * 0.20);
    const ringW = 0.115 + radius * 0.045;
    return { extent:ringR, coefficient:torusA(ringW, tubeMax, 1) };
  }
  return { extent:1.5, coefficient:ellipsoidA(r2 * 1.18, 1.68, 8) };
}

const sceneBounds = new Float32Array(4);
function updateSceneBounds(){
  if(!sceneBoundsDirty || !rendererReady || !U) return;
  const renderable = getRenderableInstances();
  if(renderable.length === 0){
    sceneBounds[0] = 0;
    sceneBounds[1] = 0;
    sceneBounds[2] = 0;
    sceneBounds[3] = 0.001;
    gl.uniform4fv(U.sceneBounds, sceneBounds);
    sceneBoundsDirty = false;
    return;
  }

  let cx = 0, cy = 0, cz = 0;
  for(const inst of renderable){
    cx += inst.x;
    cy += inst.y;
    cz += inst.z;
  }
  const invCount = 1 / renderable.length;
  cx *= invCount;
  cy *= invCount;
  cz *= invCount;

  let coreRadius = 0;
  let coefficientSum = 0;
  for(const inst of renderable){
    const bound = structureFieldBound(inst.type, inst.radius ?? 0.36);
    const dx = inst.x - cx;
    const dy = inst.y - cy;
    const dz = inst.z - cz;
    coreRadius = Math.max(coreRadius, Math.hypot(dx, dy, dz) + bound.extent);
    coefficientSum += bound.coefficient;
  }

  const decayRadius = Math.sqrt(Math.max(0, coefficientSum) / Math.max(0.0001, state.threshold));
  sceneBounds[0] = cx;
  sceneBounds[1] = cy;
  sceneBounds[2] = cz;
  sceneBounds[3] = coreRadius + decayRadius + 0.05;
  gl.uniform4fv(U.sceneBounds, sceneBounds);
  sceneBoundsDirty = false;
}

const packedInstances = new Float32Array(MAX_INSTANCES * 4);
const packedRadii = new Float32Array(MAX_INSTANCES);
const packedPart1Colors = new Float32Array(MAX_INSTANCES * 4);
const packedPart2Colors = new Float32Array(MAX_INSTANCES * 4);
const packedPart3Colors = new Float32Array(MAX_INSTANCES * 4);
const packedPart4Colors = new Float32Array(MAX_INSTANCES * 4);
const packedPart5Colors = new Float32Array(MAX_INSTANCES * 4);
const packedPart6Colors = new Float32Array(MAX_INSTANCES * 4);

function uploadInstances(force){
  if(!rendererReady || !gl || !U) return;
  if(!force && !uploadDirty) return;

  const count = composePackedArrays();
  updateSceneBounds();
  gl.uniform1i(U.instanceCount, count);
  gl.uniform4fv(U.instances, packedInstances);
  gl.uniform1fv(U.radii, packedRadii);
  gl.uniform4fv(U.part1Colors, packedPart1Colors);
  gl.uniform4fv(U.part2Colors, packedPart2Colors);
  gl.uniform4fv(U.part3Colors, packedPart3Colors);
  gl.uniform4fv(U.part4Colors, packedPart4Colors);
  gl.uniform4fv(U.part5Colors, packedPart5Colors);
  gl.uniform4fv(U.part6Colors, packedPart6Colors);
  uploadDirty = false;
}

let lastResolutionWidth = -1;
let lastResolutionHeight = -1;
let lastYaw = NaN;
let lastPitch = NaN;
let lastZoom = NaN;
let lastAutorotate = NaN;
let lastView2D = NaN;
let lastTargetX = NaN;
let lastTargetY = NaN;
let lastTargetZ = NaN;

function render(ms){
  renderFrameHandle = 0;

  if(!rendererReady){
    if(!ensureRenderer()) return;
  }

  const continuous = shouldContinuouslyRender();
  if(shouldContinuouslySyncOverlay()){
    refreshOverlayUi(true);
  }

  if(canvas.width !== lastResolutionWidth || canvas.height !== lastResolutionHeight){
    gl.uniform2f(U.resolution, canvas.width, canvas.height);
    lastResolutionWidth = canvas.width;
    lastResolutionHeight = canvas.height;
  }
  if(continuous){
    gl.uniform1f(U.time, ms * 0.001);
  }
  if(state.yaw !== lastYaw){ gl.uniform1f(U.yaw, state.yaw); lastYaw = state.yaw; }
  if(state.pitch !== lastPitch){ gl.uniform1f(U.pitch, state.pitch); lastPitch = state.pitch; }
  if(state.zoom !== lastZoom){ gl.uniform1f(U.zoom, state.zoom); lastZoom = state.zoom; }
  const autorotateValue = state.autorotate ? 1 : 0;
  if(autorotateValue !== lastAutorotate){ gl.uniform1f(U.autorotate, autorotateValue); lastAutorotate = autorotateValue; }
  const view2DValue = state.view2D ? 1 : 0;
  if(view2DValue !== lastView2D){ gl.uniform1f(U.view2D, view2DValue); lastView2D = view2DValue; }
  if(state.targetX !== lastTargetX || state.targetY !== lastTargetY || state.targetZ !== lastTargetZ){
    gl.uniform3f(U.target, state.targetX, state.targetY, state.targetZ);
    lastTargetX = state.targetX;
    lastTargetY = state.targetY;
    lastTargetZ = state.targetZ;
  }
  uploadInstances();
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

  if(continuous){
    requestRender();
  }
}

document.body.style.background = '#0d0d0f';
setLoading(12, 'Configurando os controles');
syncSelectionUi();
syncGeneralFromUi();
resize();
refreshOverlayUi(true);
setLoading(18, 'Preparando a visualização 3D');

// Aquece o WebGL logo depois do primeiro paint. Assim o primeiro clique em
// "adicionar orbital" não vira o gatilho da compilação pesada do shader.
requestAnimationFrame(()=>{
  setTimeout(()=>{
    if(!rendererReady && !rendererInitializing && !rendererInitFailed){
      ensureRenderer();
    }
  },0);
});
})();
