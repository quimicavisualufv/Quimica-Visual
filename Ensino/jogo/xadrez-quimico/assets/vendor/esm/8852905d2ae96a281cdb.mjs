/* esm.sh - detect-gpu@5.0.70 */
// node_modules/detect-gpu/dist/detect-gpu.esm.js
function e(e2, t2, r2, n2) {
  return new (r2 || (r2 = Promise))((function(o2, a2) {
    function i2(e3) {
      try {
        d2(n2.next(e3));
      } catch (e4) {
        a2(e4);
      }
    }
    function c2(e3) {
      try {
        d2(n2.throw(e3));
      } catch (e4) {
        a2(e4);
      }
    }
    function d2(e3) {
      var t3;
      e3.done ? o2(e3.value) : (t3 = e3.value, t3 instanceof r2 ? t3 : new r2((function(e4) {
        e4(t3);
      }))).then(i2, c2);
    }
    d2((n2 = n2.apply(e2, t2 || [])).next());
  }));
}
var t = ["geforce 320m", "geforce 8600", "geforce 8600m gt", "geforce 8800 gs", "geforce 8800 gt", "geforce 9400", "geforce 9400m g", "geforce 9400m", "geforce 9600m gt", "geforce 9600m", "geforce fx go5200", "geforce gt 120", "geforce gt 130", "geforce gt 330m", "geforce gtx 285", "google swiftshader", "intel g41", "intel g45", "intel gma 4500mhd", "intel gma x3100", "intel hd 3000", "intel q45", "legacy", "mali-2", "mali-3", "mali-4", "quadro fx 1500", "quadro fx 4", "quadro fx 5", "radeon hd 2400", "radeon hd 2600", "radeon hd 4670", "radeon hd 4850", "radeon hd 4870", "radeon hd 5670", "radeon hd 5750", "radeon hd 6290", "radeon hd 6300", "radeon hd 6310", "radeon hd 6320", "radeon hd 6490m", "radeon hd 6630m", "radeon hd 6750m", "radeon hd 6770m", "radeon hd 6970m", "sgx 543", "sgx543"];
function r(e2) {
  return e2 = e2.toLowerCase().replace(/.*angle ?\((.+)\)(?: on vulkan [0-9.]+)?$/i, "$1").replace(/\s(\d{1,2}gb|direct3d.+$)|\(r\)| \([^)]+\)$/g, "").replace(/(?:vulkan|opengl) \d+\.\d+(?:\.\d+)?(?: \((.*)\))?/, "$1");
}
var n = "undefined" == typeof window;
var o = (() => {
  if (n) return;
  const { userAgent: e2, platform: t2, maxTouchPoints: r2 } = window.navigator, o2 = /(iphone|ipod|ipad)/i.test(e2), a2 = "iPad" === t2 || "MacIntel" === t2 && r2 > 0 && !window.MSStream;
  return { isIpad: a2, isMobile: /android/i.test(e2) || o2 || a2, isSafari12: /Version\/12.+Safari/.test(e2), isFirefox: /Firefox/.test(e2) };
})();
function a(e2, t2, r2) {
  if (!r2) return [t2];
  const n2 = (function(e3) {
    const t3 = "\n    precision highp float;\n    attribute vec3 aPosition;\n    varying float vvv;\n    void main() {\n      vvv = 0.31622776601683794;\n      gl_Position = vec4(aPosition, 1.0);\n    }\n  ", r3 = "\n    precision highp float;\n    varying float vvv;\n    void main() {\n      vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * vvv;\n      enc = fract(enc);\n      enc -= enc.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);\n      gl_FragColor = enc;\n    }\n  ", n3 = e3.createShader(35633), o2 = e3.createShader(35632), a3 = e3.createProgram();
    if (!(o2 && n3 && a3)) return;
    e3.shaderSource(n3, t3), e3.shaderSource(o2, r3), e3.compileShader(n3), e3.compileShader(o2), e3.attachShader(a3, n3), e3.attachShader(a3, o2), e3.linkProgram(a3), e3.detachShader(a3, n3), e3.detachShader(a3, o2), e3.deleteShader(n3), e3.deleteShader(o2), e3.useProgram(a3);
    const i3 = e3.createBuffer();
    e3.bindBuffer(34962, i3), e3.bufferData(34962, new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 35044);
    const c3 = e3.getAttribLocation(a3, "aPosition");
    e3.vertexAttribPointer(c3, 3, 5126, false, 0, 0), e3.enableVertexAttribArray(c3), e3.clearColor(1, 1, 1, 1), e3.clear(16384), e3.viewport(0, 0, 1, 1), e3.drawArrays(4, 0, 3);
    const d3 = new Uint8Array(4);
    return e3.readPixels(0, 0, 1, 1, 6408, 5121, d3), e3.deleteProgram(a3), e3.deleteBuffer(i3), d3.join("");
  })(e2), a2 = "801621810", i2 = "8016218135", c2 = "80162181161", d2 = (null == o ? void 0 : o.isIpad) ? [["a7", c2, 12], ["a8", i2, 15], ["a8x", i2, 15], ["a9", i2, 15], ["a9x", i2, 15], ["a10", i2, 15], ["a10x", i2, 15], ["a12", a2, 15], ["a12x", a2, 15], ["a12z", a2, 15], ["a14", a2, 15], ["a15", a2, 15], ["m1", a2, 15], ["m2", a2, 15]] : [["a7", c2, 12], ["a8", i2, 12], ["a9", i2, 15], ["a10", i2, 15], ["a11", a2, 15], ["a12", a2, 15], ["a13", a2, 15], ["a14", a2, 15], ["a15", a2, 15], ["a16", a2, 15], ["a17", a2, 15]];
  let l2;
  "80162181255" === n2 ? l2 = d2.filter((([, , e3]) => e3 >= 14)) : (l2 = d2.filter((([, e3]) => e3 === n2)), l2.length || (l2 = d2));
  return l2.map((([e3]) => `apple ${e3} gpu`));
}
var i = class extends Error {
  constructor(e2) {
    super(e2), Object.setPrototypeOf(this, new.target.prototype);
  }
};
var c = [];
var d = [];
function l(e2, t2) {
  if (e2 === t2) return 0;
  const r2 = e2;
  e2.length > t2.length && (e2 = t2, t2 = r2);
  let n2 = e2.length, o2 = t2.length;
  for (; n2 > 0 && e2.charCodeAt(~-n2) === t2.charCodeAt(~-o2); ) n2--, o2--;
  let a2, i2 = 0;
  for (; i2 < n2 && e2.charCodeAt(i2) === t2.charCodeAt(i2); ) i2++;
  if (n2 -= i2, o2 -= i2, 0 === n2) return o2;
  let l2, s2, f2 = 0, u = 0, g = 0;
  for (; u < n2; ) d[u] = e2.charCodeAt(i2 + u), c[u] = ++u;
  for (; g < o2; ) for (a2 = t2.charCodeAt(i2 + g), l2 = g++, f2 = g, u = 0; u < n2; u++) s2 = a2 === d[u] ? l2 : l2 + 1, l2 = c[u], f2 = c[u] = l2 > f2 ? s2 > f2 ? f2 + 1 : s2 : s2 > l2 ? l2 + 1 : s2;
  return f2;
}
function s(e2) {
  return null != e2;
}
var f = ({ mobileTiers: c2 = [0, 15, 30, 60], desktopTiers: d2 = [0, 15, 30, 60], override: f2 = {}, glContext: u, failIfMajorPerformanceCaveat: g = false, benchmarksURL: h = "https://unpkg.com/detect-gpu@5.0.70/dist/benchmarks" } = {}) => e(void 0, void 0, void 0, (function* () {
  const p = {};
  if (n) return { tier: 0, type: "SSR" };
  const { isIpad: m = !!(null == o ? void 0 : o.isIpad), isMobile: v = !!(null == o ? void 0 : o.isMobile), screenSize: w = window.screen, loadBenchmarks: x = ((t2) => e(void 0, void 0, void 0, (function* () {
    const e2 = yield fetch(`${h}/${t2}`).then(((e3) => e3.json()));
    if (parseInt(e2.shift().split(".")[0], 10) < 4) throw new i("Detect GPU benchmark data is out of date. Please update to version 4x");
    return e2;
  }))) } = f2;
  let { renderer: A } = f2;
  const P = (e2, t2, r2, n2, o2) => ({ device: o2, fps: n2, gpu: r2, isMobile: v, tier: e2, type: t2 });
  let S, b = "";
  if (A) A = r(A), S = [A];
  else {
    const e2 = u || (function(e3, t3 = false) {
      const r2 = { alpha: false, antialias: false, depth: false, failIfMajorPerformanceCaveat: t3, powerPreference: "high-performance", stencil: false };
      e3 && delete r2.powerPreference;
      const n2 = window.document.createElement("canvas"), o2 = n2.getContext("webgl", r2) || n2.getContext("experimental-webgl", r2);
      return null != o2 ? o2 : void 0;
    })(null == o ? void 0 : o.isSafari12, g);
    if (!e2) return P(0, "WEBGL_UNSUPPORTED");
    const t2 = (null == o ? void 0 : o.isFirefox) ? null : e2.getExtension("WEBGL_debug_renderer_info");
    if (A = t2 ? e2.getParameter(t2.UNMASKED_RENDERER_WEBGL) : e2.getParameter(e2.RENDERER), !A) return P(1, "FALLBACK");
    b = A, A = r(A), S = (function(e3, t3, r2) {
      return "apple gpu" === t3 ? a(e3, t3, r2) : [t3];
    })(e2, A, v);
  }
  const E = (yield Promise.all(S.map((function(t2) {
    var r2;
    return e(this, void 0, void 0, (function* () {
      const e2 = ((e3) => {
        const t3 = v ? ["adreno", "apple", "mali-t", "mali", "nvidia", "powervr", "samsung"] : ["intel", "apple", "amd", "radeon", "nvidia", "geforce", "adreno"];
        for (const r3 of t3) if (e3.includes(r3)) return r3;
      })(t2);
      if (!e2) return;
      const n2 = `${v ? "m" : "d"}-${e2}${m ? "-ipad" : ""}.json`, o2 = p[n2] = null !== (r2 = p[n2]) && void 0 !== r2 ? r2 : x(n2);
      let a2;
      try {
        a2 = yield o2;
      } catch (e3) {
        if (e3 instanceof i) throw e3;
        return;
      }
      const c3 = (function(e3) {
        var t3;
        const r3 = (e3 = e3.replace(/\([^)]+\)/, "")).match(/\d+/) || e3.match(/(\W|^)([A-Za-z]{1,3})(\W|$)/g);
        return null !== (t3 = null == r3 ? void 0 : r3.join("").replace(/\W|amd/g, "")) && void 0 !== t3 ? t3 : "";
      })(t2);
      let d3 = a2.filter((([, e3]) => e3 === c3));
      d3.length || (d3 = a2.filter((([e3]) => e3.includes(t2))));
      const s2 = d3.length;
      if (0 === s2) return;
      const f3 = t2.split(/[.,()\[\]/\s]/g).sort().filter(((e3, t3, r3) => 0 === t3 || e3 !== r3[t3 - 1])).join(" ");
      let u2, [g2, , , , h2] = s2 > 1 ? d3.map(((e3) => [e3, l(f3, e3[2])])).sort((([, e3], [, t3]) => e3 - t3))[0][0] : d3[0], A2 = Number.MAX_VALUE;
      const { devicePixelRatio: P2 } = window, S2 = w.width * P2 * w.height * P2;
      for (const e3 of h2) {
        const [t3, r3] = e3, n3 = t3 * r3, o3 = Math.abs(S2 - n3);
        o3 < A2 && (A2 = o3, u2 = e3);
      }
      if (!u2) return;
      const [, , b2, E2] = u2;
      return [A2, b2, g2, E2];
    }));
  })))).filter(s).sort((([e2 = Number.MAX_VALUE, t2], [r2 = Number.MAX_VALUE, n2]) => e2 === r2 ? t2 - n2 : e2 - r2));
  if (!E.length) {
    const e2 = t.find(((e3) => A.includes(e3)));
    return e2 ? P(0, "BLOCKLISTED", e2) : P(1, "FALLBACK", `${A} (${b})`);
  }
  const [, y, C, L] = E[0];
  if (-1 === y) return P(0, "BLOCKLISTED", C, y, L);
  const M = v ? c2 : d2;
  let $ = 0;
  for (let e2 = 0; e2 < M.length; e2++) y >= M[e2] && ($ = e2);
  return P($, "BENCHMARK", C, y, L);
}));
export {
  f as getGPUTier
};
