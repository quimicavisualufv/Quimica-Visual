/* esm.sh - its-fine@2.0.0 */
// node_modules/its-fine/dist/index.js
import * as o from "./03b853427b386a4e999c.mjs";
var f = /* @__PURE__ */ (() => {
  var e, t;
  return typeof window != "undefined" && (((e = window.document) == null ? void 0 : e.createElement) || ((t = window.navigator) == null ? void 0 : t.product) === "ReactNative");
})() ? o.useLayoutEffect : o.useEffect;
function i(e, t, r) {
  if (!e) return;
  if (r(e) === true) return e;
  let n = t ? e.return : e.child;
  for (; n; ) {
    const u = i(n, t, r);
    if (u) return u;
    n = t ? null : n.sibling;
  }
}
function l(e) {
  try {
    return Object.defineProperties(e, {
      _currentRenderer: {
        get() {
          return null;
        },
        set() {
        }
      },
      _currentRenderer2: {
        get() {
          return null;
        },
        set() {
        }
      }
    });
  } catch (t) {
    return e;
  }
}
var a = /* @__PURE__ */ l(/* @__PURE__ */ o.createContext(null));
var m = class extends o.Component {
  render() {
    return /* @__PURE__ */ o.createElement(a.Provider, { value: this._reactInternals }, this.props.children);
  }
};
function c() {
  const e = o.useContext(a);
  if (e === null) throw new Error("its-fine: useFiber must be called within a <FiberProvider />!");
  const t = o.useId();
  return o.useMemo(() => {
    for (const n of [e, e == null ? void 0 : e.alternate]) {
      if (!n) continue;
      const u = i(n, false, (d) => {
        let s = d.memoizedState;
        for (; s; ) {
          if (s.memoizedState === t) return true;
          s = s.next;
        }
      });
      if (u) return u;
    }
  }, [e, t]);
}
function w() {
  const e = c(), t = o.useMemo(
    () => i(e, true, (r) => {
      var n;
      return ((n = r.stateNode) == null ? void 0 : n.containerInfo) != null;
    }),
    [e]
  );
  return t == null ? void 0 : t.stateNode.containerInfo;
}
function v(e) {
  const t = c(), r = o.useRef(void 0);
  return f(() => {
    var n;
    r.current = (n = i(
      t,
      false,
      (u) => typeof u.type == "string" && (e === void 0 || u.type === e)
    )) == null ? void 0 : n.stateNode;
  }, [t]), r;
}
function y(e) {
  const t = c(), r = o.useRef(void 0);
  return f(() => {
    var n;
    r.current = (n = i(
      t,
      true,
      (u) => typeof u.type == "string" && (e === void 0 || u.type === e)
    )) == null ? void 0 : n.stateNode;
  }, [t]), r;
}
var p = Symbol.for("react.context");
var b = (e) => e !== null && typeof e == "object" && "$$typeof" in e && e.$$typeof === p;
function h() {
  const e = c(), [t] = o.useState(() => /* @__PURE__ */ new Map());
  t.clear();
  let r = e;
  for (; r; ) {
    const n = r.type;
    b(n) && n !== a && !t.has(n) && t.set(n, o.use(l(n))), r = r.return;
  }
  return t;
}
function x() {
  const e = h();
  return o.useMemo(
    () => Array.from(e.keys()).reduce(
      (t, r) => (n) => /* @__PURE__ */ o.createElement(t, null, /* @__PURE__ */ o.createElement(r.Provider, { ...n, value: e.get(r) })),
      (t) => /* @__PURE__ */ o.createElement(m, { ...t })
    ),
    [e]
  );
}
export {
  m as FiberProvider,
  i as traverseFiber,
  w as useContainer,
  x as useContextBridge,
  h as useContextMap,
  c as useFiber,
  v as useNearestChild,
  y as useNearestParent
};
