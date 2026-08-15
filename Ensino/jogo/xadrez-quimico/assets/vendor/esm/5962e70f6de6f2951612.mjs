/* esm.sh - @react-three/fiber@9.6.0 */
import __Process$ from "./3ef95ec9afb7ea97b3a6.mjs";
// node_modules/@react-three/fiber/dist/events-760a1017.esm.js
import * as React from "./8097cbcb4650d681e430.mjs";
import React__default from "./8097cbcb4650d681e430.mjs";
import * as THREE from "./665e017835df17c05088.mjs";
import { createWithEqualityFn } from "./face6508550c55f1e97d.mjs";
import { suspend, preload, clear } from "./759e59d6cac00ab726dd.mjs";
import Tb, { unstable_scheduleCallback, unstable_IdlePriority } from "./24a86d99da65aeb195d2.mjs";
import { jsx, Fragment as Fragment2 } from "./4b65ff659da4662d4567.mjs";
import { useFiber, useContextBridge, traverseFiber } from "./f32191735113c4f25f67.mjs";
var threeTypes = /* @__PURE__ */ Object.freeze({
  __proto__: null
});
function findInitialRoot(instance) {
  let root = instance.root;
  while (root.getState().previousRoot) root = root.getState().previousRoot;
  return root;
}
var act2 = React["act"];
var isOrthographicCamera = (def) => def && def.isOrthographicCamera;
var isRef = (obj) => obj && obj.hasOwnProperty("current");
var isColorRepresentation = (value) => value != null && (typeof value === "string" || typeof value === "number" || value.isColor);
var useIsomorphicLayoutEffect = /* @__PURE__ */ ((_window$document, _window$navigator) => typeof window !== "undefined" && (((_window$document = window.document) == null ? void 0 : _window$document.createElement) || ((_window$navigator = window.navigator) == null ? void 0 : _window$navigator.product) === "ReactNative"))() ? React.useLayoutEffect : React.useEffect;
function useMutableCallback(fn) {
  const ref = React.useRef(fn);
  useIsomorphicLayoutEffect(() => void (ref.current = fn), [fn]);
  return ref;
}
function useBridge() {
  const fiber = useFiber();
  const ContextBridge = useContextBridge();
  return React.useMemo(() => ({
    children
  }) => {
    const strict = !!traverseFiber(fiber, true, (node) => node.type === React.StrictMode);
    const Root = strict ? React.StrictMode : React.Fragment;
    return /* @__PURE__ */ jsx(Root, {
      children: /* @__PURE__ */ jsx(ContextBridge, {
        children
      })
    });
  }, [fiber, ContextBridge]);
}
function Block({
  set
}) {
  useIsomorphicLayoutEffect(() => {
    set(new Promise(() => null));
    return () => set(false);
  }, [set]);
  return null;
}
var ErrorBoundary = /* @__PURE__ */ ((_ErrorBoundary) => (_ErrorBoundary = class ErrorBoundary extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      error: false
    };
  }
  componentDidCatch(err) {
    this.props.set(err);
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}, _ErrorBoundary.getDerivedStateFromError = () => ({
  error: true
}), _ErrorBoundary))();
function calculateDpr(dpr) {
  var _window$devicePixelRa;
  const target = typeof window !== "undefined" ? (_window$devicePixelRa = window.devicePixelRatio) != null ? _window$devicePixelRa : 2 : 1;
  return Array.isArray(dpr) ? Math.min(Math.max(dpr[0], target), dpr[1]) : dpr;
}
function getRootState(obj) {
  var _r3f;
  return (_r3f = obj.__r3f) == null ? void 0 : _r3f.root.getState();
}
var is = {
  obj: (a) => a === Object(a) && !is.arr(a) && typeof a !== "function",
  fun: (a) => typeof a === "function",
  str: (a) => typeof a === "string",
  num: (a) => typeof a === "number",
  boo: (a) => typeof a === "boolean",
  und: (a) => a === void 0,
  nul: (a) => a === null,
  arr: (a) => Array.isArray(a),
  equ(a, b, {
    arrays = "shallow",
    objects = "reference",
    strict = true
  } = {}) {
    if (typeof a !== typeof b || !!a !== !!b) return false;
    if (is.str(a) || is.num(a) || is.boo(a)) return a === b;
    const isObj = is.obj(a);
    if (isObj && objects === "reference") return a === b;
    const isArr = is.arr(a);
    if (isArr && arrays === "reference") return a === b;
    if ((isArr || isObj) && a === b) return true;
    let i2;
    for (i2 in a) if (!(i2 in b)) return false;
    if (isObj && arrays === "shallow" && objects === "shallow") {
      for (i2 in strict ? b : a) if (!is.equ(a[i2], b[i2], {
        strict,
        objects: "reference"
      })) return false;
    } else {
      for (i2 in strict ? b : a) if (a[i2] !== b[i2]) return false;
    }
    if (is.und(i2)) {
      if (isArr && a.length === 0 && b.length === 0) return true;
      if (isObj && Object.keys(a).length === 0 && Object.keys(b).length === 0) return true;
      if (a !== b) return false;
    }
    return true;
  }
};
function buildGraph(object) {
  const data = {
    nodes: {},
    materials: {},
    meshes: {}
  };
  if (object) {
    object.traverse((obj) => {
      if (obj.name) data.nodes[obj.name] = obj;
      if (obj.material && !data.materials[obj.material.name]) data.materials[obj.material.name] = obj.material;
      if (obj.isMesh && !data.meshes[obj.name]) data.meshes[obj.name] = obj;
    });
  }
  return data;
}
function dispose(obj) {
  if (obj.type !== "Scene") obj.dispose == null ? void 0 : obj.dispose();
  for (const p in obj) {
    const prop = obj[p];
    if ((prop == null ? void 0 : prop.type) !== "Scene") prop == null ? void 0 : prop.dispose == null ? void 0 : prop.dispose();
  }
}
var REACT_INTERNAL_PROPS = ["children", "key", "ref"];
function getInstanceProps(pendingProps) {
  const props = {};
  for (const key in pendingProps) {
    if (!REACT_INTERNAL_PROPS.includes(key)) props[key] = pendingProps[key];
  }
  return props;
}
function prepare(target, root, type, props) {
  const object = target;
  let instance = object == null ? void 0 : object.__r3f;
  if (!instance) {
    instance = {
      root,
      type,
      parent: null,
      children: [],
      props: getInstanceProps(props),
      object,
      eventCount: 0,
      handlers: {},
      isHidden: false
    };
    if (object) object.__r3f = instance;
  }
  return instance;
}
function resolve(root, key) {
  if (!key.includes("-")) return {
    root,
    key,
    target: root[key]
  };
  if (key in root) {
    return {
      root,
      key,
      target: root[key]
    };
  }
  let target = root;
  const parts = key.split("-");
  for (const part of parts) {
    if (typeof target !== "object" || target === null) {
      if (target !== void 0) {
        const remaining = parts.slice(parts.indexOf(part)).join("-");
        return {
          root: target,
          key: remaining,
          target: void 0
        };
      }
      return {
        root,
        key,
        target: void 0
      };
    }
    key = part;
    root = target;
    target = target[key];
  }
  return {
    root,
    key,
    target
  };
}
var INDEX_REGEX = /-\d+$/;
function attach(parent, child) {
  if (is.str(child.props.attach)) {
    if (INDEX_REGEX.test(child.props.attach)) {
      const index = child.props.attach.replace(INDEX_REGEX, "");
      const {
        root: root2,
        key: key2
      } = resolve(parent.object, index);
      if (!Array.isArray(root2[key2])) root2[key2] = [];
    }
    const {
      root,
      key
    } = resolve(parent.object, child.props.attach);
    child.previousAttach = root[key];
    root[key] = child.object;
  } else if (is.fun(child.props.attach)) {
    child.previousAttach = child.props.attach(parent.object, child.object);
  }
}
function detach(parent, child) {
  if (is.str(child.props.attach)) {
    const {
      root,
      key
    } = resolve(parent.object, child.props.attach);
    const previous = child.previousAttach;
    if (previous === void 0) delete root[key];
    else root[key] = previous;
  } else {
    child.previousAttach == null ? void 0 : child.previousAttach(parent.object, child.object);
  }
  delete child.previousAttach;
}
var RESERVED_PROPS = [
  ...REACT_INTERNAL_PROPS,
  // Instance props
  "args",
  "dispose",
  "attach",
  "object",
  "onUpdate",
  // Behavior flags
  "dispose"
];
var MEMOIZED_PROTOTYPES = /* @__PURE__ */ new Map();
function getMemoizedPrototype(root) {
  let ctor = MEMOIZED_PROTOTYPES.get(root.constructor);
  try {
    if (!ctor) {
      ctor = new root.constructor();
      MEMOIZED_PROTOTYPES.set(root.constructor, ctor);
    }
  } catch (e2) {
  }
  return ctor;
}
function diffProps(instance, newProps) {
  const changedProps = {};
  for (const prop in newProps) {
    if (RESERVED_PROPS.includes(prop)) continue;
    if (is.equ(newProps[prop], instance.props[prop])) continue;
    changedProps[prop] = newProps[prop];
    for (const other in newProps) {
      if (other.startsWith(`${prop}-`)) changedProps[other] = newProps[other];
    }
  }
  for (const prop in instance.props) {
    if (RESERVED_PROPS.includes(prop) || newProps.hasOwnProperty(prop)) continue;
    const {
      root,
      key
    } = resolve(instance.object, prop);
    if (root.constructor && root.constructor.length === 0) {
      const ctor = getMemoizedPrototype(root);
      if (!is.und(ctor)) changedProps[key] = ctor[key];
    } else {
      changedProps[key] = 0;
    }
  }
  return changedProps;
}
var colorMaps = ["map", "emissiveMap", "sheenColorMap", "specularColorMap", "envMap"];
var EVENT_REGEX = /^on(Pointer|Click|DoubleClick|ContextMenu|Wheel)/;
function applyProps(object, props) {
  var _instance$object;
  const instance = object.__r3f;
  const rootState = instance && findInitialRoot(instance).getState();
  const prevHandlers = instance == null ? void 0 : instance.eventCount;
  for (const prop in props) {
    let value = props[prop];
    if (RESERVED_PROPS.includes(prop)) continue;
    if (instance && EVENT_REGEX.test(prop)) {
      if (typeof value === "function") instance.handlers[prop] = value;
      else delete instance.handlers[prop];
      instance.eventCount = Object.keys(instance.handlers).length;
      continue;
    }
    if (value === void 0) continue;
    let {
      root,
      key,
      target
    } = resolve(object, prop);
    if (target === void 0 && (typeof root !== "object" || root === null)) {
      throw Error(`R3F: Cannot set "${prop}". Ensure it is an object before setting "${key}".`);
    }
    if (target instanceof THREE.Layers && value instanceof THREE.Layers) {
      target.mask = value.mask;
    } else if (target instanceof THREE.Color && isColorRepresentation(value)) {
      target.set(value);
    } else if (target !== null && typeof target === "object" && typeof target.set === "function" && typeof target.copy === "function" && value != null && value.constructor && target.constructor === value.constructor) {
      target.copy(value);
    } else if (target !== null && typeof target === "object" && typeof target.set === "function" && Array.isArray(value)) {
      if (typeof target.fromArray === "function") target.fromArray(value);
      else target.set(...value);
    } else if (target !== null && typeof target === "object" && typeof target.set === "function" && typeof value === "number") {
      if (typeof target.setScalar === "function") target.setScalar(value);
      else target.set(value);
    } else if (root instanceof THREE.ShaderMaterial && key === "uniforms" && is.obj(value)) {
      if (!is.obj(root.uniforms)) root.uniforms = {};
      const uniforms = root.uniforms;
      const nextUniforms = value;
      for (const name in nextUniforms) {
        const uniform = nextUniforms[name];
        const targetUniform = uniforms[name];
        if (targetUniform) Object.assign(targetUniform, uniform);
        else uniforms[name] = {
          ...uniform
        };
      }
    } else {
      var _root$key;
      root[key] = value;
      if (rootState && !rootState.linear && colorMaps.includes(key) && (_root$key = root[key]) != null && _root$key.isTexture && // sRGB textures must be RGBA8 since r137 https://github.com/mrdoob/three.js/pull/23129
      root[key].format === THREE.RGBAFormat && root[key].type === THREE.UnsignedByteType) {
        root[key].colorSpace = THREE.SRGBColorSpace;
      }
    }
  }
  if (instance != null && instance.parent && rootState != null && rootState.internal && (_instance$object = instance.object) != null && _instance$object.isObject3D && prevHandlers !== instance.eventCount) {
    const object2 = instance.object;
    const index = rootState.internal.interaction.indexOf(object2);
    if (index > -1) rootState.internal.interaction.splice(index, 1);
    if (instance.eventCount && object2.raycast !== null) {
      rootState.internal.interaction.push(object2);
    }
  }
  if (instance && instance.props.attach === void 0) {
    if (instance.object.isBufferGeometry) instance.props.attach = "geometry";
    else if (instance.object.isMaterial) instance.props.attach = "material";
  }
  if (instance) invalidateInstance(instance);
  return object;
}
function invalidateInstance(instance) {
  var _instance$root;
  if (!instance.parent) return;
  instance.props.onUpdate == null ? void 0 : instance.props.onUpdate(instance.object);
  const state2 = (_instance$root = instance.root) == null ? void 0 : _instance$root.getState == null ? void 0 : _instance$root.getState();
  if (state2 && state2.internal.frames === 0) state2.invalidate();
}
function updateCamera(camera, size) {
  if (camera.manual) return;
  if (isOrthographicCamera(camera)) {
    camera.left = size.width / -2;
    camera.right = size.width / 2;
    camera.top = size.height / 2;
    camera.bottom = size.height / -2;
  } else {
    camera.aspect = size.width / size.height;
  }
  camera.updateProjectionMatrix();
}
var isObject3D = (object) => object == null ? void 0 : object.isObject3D;
function makeId(event) {
  return (event.eventObject || event.object).uuid + "/" + event.index + event.instanceId;
}
function releaseInternalPointerCapture(capturedMap, obj, captures, pointerId) {
  const captureData = captures.get(obj);
  if (captureData) {
    captures.delete(obj);
    if (captures.size === 0) {
      capturedMap.delete(pointerId);
      captureData.target.releasePointerCapture(pointerId);
    }
  }
}
function removeInteractivity(store, object) {
  const {
    internal
  } = store.getState();
  internal.interaction = internal.interaction.filter((o2) => o2 !== object);
  internal.initialHits = internal.initialHits.filter((o2) => o2 !== object);
  internal.hovered.forEach((value, key) => {
    if (value.eventObject === object || value.object === object) {
      internal.hovered.delete(key);
    }
  });
  internal.capturedMap.forEach((captures, pointerId) => {
    releaseInternalPointerCapture(internal.capturedMap, object, captures, pointerId);
  });
}
function createEvents(store) {
  function calculateDistance(event) {
    const {
      internal
    } = store.getState();
    const dx = event.offsetX - internal.initialClick[0];
    const dy = event.offsetY - internal.initialClick[1];
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }
  function filterPointerEvents(objects) {
    return objects.filter((obj) => ["Move", "Over", "Enter", "Out", "Leave"].some((name) => {
      var _r3f;
      return (_r3f = obj.__r3f) == null ? void 0 : _r3f.handlers["onPointer" + name];
    }));
  }
  function intersect(event, filter) {
    const state2 = store.getState();
    const duplicates = /* @__PURE__ */ new Set();
    const intersections = [];
    const eventsObjects = filter ? filter(state2.internal.interaction) : state2.internal.interaction;
    for (let i2 = 0; i2 < eventsObjects.length; i2++) {
      const state3 = getRootState(eventsObjects[i2]);
      if (state3) {
        state3.raycaster.camera = void 0;
      }
    }
    if (!state2.previousRoot) {
      state2.events.compute == null ? void 0 : state2.events.compute(event, state2);
    }
    function handleRaycast(obj) {
      const state3 = getRootState(obj);
      if (!state3 || !state3.events.enabled || state3.raycaster.camera === null) return [];
      if (state3.raycaster.camera === void 0) {
        var _state$previousRoot;
        state3.events.compute == null ? void 0 : state3.events.compute(event, state3, (_state$previousRoot = state3.previousRoot) == null ? void 0 : _state$previousRoot.getState());
        if (state3.raycaster.camera === void 0) state3.raycaster.camera = null;
      }
      return state3.raycaster.camera ? state3.raycaster.intersectObject(obj, true) : [];
    }
    let hits = eventsObjects.flatMap(handleRaycast).sort((a, b) => {
      const aState = getRootState(a.object);
      const bState = getRootState(b.object);
      if (!aState || !bState) return a.distance - b.distance;
      return bState.events.priority - aState.events.priority || a.distance - b.distance;
    }).filter((item) => {
      const id = makeId(item);
      if (duplicates.has(id)) return false;
      duplicates.add(id);
      return true;
    });
    if (state2.events.filter) hits = state2.events.filter(hits, state2);
    for (const hit of hits) {
      let eventObject = hit.object;
      while (eventObject) {
        var _r3f2;
        if ((_r3f2 = eventObject.__r3f) != null && _r3f2.eventCount) intersections.push({
          ...hit,
          eventObject
        });
        eventObject = eventObject.parent;
      }
    }
    if ("pointerId" in event && state2.internal.capturedMap.has(event.pointerId)) {
      for (let captureData of state2.internal.capturedMap.get(event.pointerId).values()) {
        if (!duplicates.has(makeId(captureData.intersection))) intersections.push(captureData.intersection);
      }
    }
    return intersections;
  }
  function handleIntersects(intersections, event, delta, callback) {
    if (intersections.length) {
      const localState = {
        stopped: false
      };
      for (const hit of intersections) {
        let state2 = getRootState(hit.object);
        if (!state2) {
          hit.object.traverseAncestors((obj) => {
            const parentState = getRootState(obj);
            if (parentState) {
              state2 = parentState;
              return false;
            }
          });
        }
        if (state2) {
          const {
            raycaster,
            pointer,
            camera,
            internal
          } = state2;
          const unprojectedPoint = new THREE.Vector3(pointer.x, pointer.y, 0).unproject(camera);
          const hasPointerCapture = (id) => {
            var _internal$capturedMap, _internal$capturedMap2;
            return (_internal$capturedMap = (_internal$capturedMap2 = internal.capturedMap.get(id)) == null ? void 0 : _internal$capturedMap2.has(hit.eventObject)) != null ? _internal$capturedMap : false;
          };
          const setPointerCapture = (id) => {
            const captureData = {
              intersection: hit,
              target: event.target
            };
            if (internal.capturedMap.has(id)) {
              internal.capturedMap.get(id).set(hit.eventObject, captureData);
            } else {
              internal.capturedMap.set(id, /* @__PURE__ */ new Map([[hit.eventObject, captureData]]));
            }
            event.target.setPointerCapture(id);
          };
          const releasePointerCapture = (id) => {
            const captures = internal.capturedMap.get(id);
            if (captures) {
              releaseInternalPointerCapture(internal.capturedMap, hit.eventObject, captures, id);
            }
          };
          let extractEventProps = {};
          for (let prop in event) {
            let property = event[prop];
            if (typeof property !== "function") extractEventProps[prop] = property;
          }
          let raycastEvent = {
            ...hit,
            ...extractEventProps,
            pointer,
            intersections,
            stopped: localState.stopped,
            delta,
            unprojectedPoint,
            ray: raycaster.ray,
            camera,
            // Hijack stopPropagation, which just sets a flag
            stopPropagation() {
              const capturesForPointer = "pointerId" in event && internal.capturedMap.get(event.pointerId);
              if (
                // ...if this pointer hasn't been captured
                !capturesForPointer || // ... or if the hit object is capturing the pointer
                capturesForPointer.has(hit.eventObject)
              ) {
                raycastEvent.stopped = localState.stopped = true;
                if (internal.hovered.size && Array.from(internal.hovered.values()).find((i2) => i2.eventObject === hit.eventObject)) {
                  const higher = intersections.slice(0, intersections.indexOf(hit));
                  cancelPointer([...higher, hit]);
                }
              }
            },
            // there should be a distinction between target and currentTarget
            target: {
              hasPointerCapture,
              setPointerCapture,
              releasePointerCapture
            },
            currentTarget: {
              hasPointerCapture,
              setPointerCapture,
              releasePointerCapture
            },
            nativeEvent: event
          };
          callback(raycastEvent);
          if (localState.stopped === true) break;
        }
      }
    }
    return intersections;
  }
  function cancelPointer(intersections) {
    const {
      internal
    } = store.getState();
    for (const hoveredObj of internal.hovered.values()) {
      if (!intersections.length || !intersections.find((hit) => hit.object === hoveredObj.object && hit.index === hoveredObj.index && hit.instanceId === hoveredObj.instanceId)) {
        const eventObject = hoveredObj.eventObject;
        const instance = eventObject.__r3f;
        internal.hovered.delete(makeId(hoveredObj));
        if (instance != null && instance.eventCount) {
          const handlers = instance.handlers;
          const data = {
            ...hoveredObj,
            intersections
          };
          handlers.onPointerOut == null ? void 0 : handlers.onPointerOut(data);
          handlers.onPointerLeave == null ? void 0 : handlers.onPointerLeave(data);
        }
      }
    }
  }
  function pointerMissed(event, objects) {
    for (let i2 = 0; i2 < objects.length; i2++) {
      const instance = objects[i2].__r3f;
      instance == null ? void 0 : instance.handlers.onPointerMissed == null ? void 0 : instance.handlers.onPointerMissed(event);
    }
  }
  function handlePointer(name) {
    switch (name) {
      case "onPointerLeave":
      case "onPointerCancel":
        return () => cancelPointer([]);
      case "onLostPointerCapture":
        return (event) => {
          const {
            internal
          } = store.getState();
          if ("pointerId" in event && internal.capturedMap.has(event.pointerId)) {
            requestAnimationFrame(() => {
              if (internal.capturedMap.has(event.pointerId)) {
                internal.capturedMap.delete(event.pointerId);
                cancelPointer([]);
              }
            });
          }
        };
    }
    return function handleEvent(event) {
      const {
        onPointerMissed,
        internal
      } = store.getState();
      internal.lastEvent.current = event;
      const isPointerMove = name === "onPointerMove";
      const isClickEvent = name === "onClick" || name === "onContextMenu" || name === "onDoubleClick";
      const filter = isPointerMove ? filterPointerEvents : void 0;
      const hits = intersect(event, filter);
      const delta = isClickEvent ? calculateDistance(event) : 0;
      if (name === "onPointerDown") {
        internal.initialClick = [event.offsetX, event.offsetY];
        internal.initialHits = hits.map((hit) => hit.eventObject);
      }
      if (isClickEvent && !hits.length) {
        if (delta <= 2) {
          pointerMissed(event, internal.interaction);
          if (onPointerMissed) onPointerMissed(event);
        }
      }
      if (isPointerMove) cancelPointer(hits);
      function onIntersect(data) {
        const eventObject = data.eventObject;
        const instance = eventObject.__r3f;
        if (!(instance != null && instance.eventCount)) return;
        const handlers = instance.handlers;
        if (isPointerMove) {
          if (handlers.onPointerOver || handlers.onPointerEnter || handlers.onPointerOut || handlers.onPointerLeave) {
            const id = makeId(data);
            const hoveredItem = internal.hovered.get(id);
            if (!hoveredItem) {
              internal.hovered.set(id, data);
              handlers.onPointerOver == null ? void 0 : handlers.onPointerOver(data);
              handlers.onPointerEnter == null ? void 0 : handlers.onPointerEnter(data);
            } else if (hoveredItem.stopped) {
              data.stopPropagation();
            }
          }
          handlers.onPointerMove == null ? void 0 : handlers.onPointerMove(data);
        } else {
          const handler = handlers[name];
          if (handler) {
            if (!isClickEvent || internal.initialHits.includes(eventObject)) {
              pointerMissed(event, internal.interaction.filter((object) => !internal.initialHits.includes(object)));
              handler(data);
            }
          } else {
            if (isClickEvent && internal.initialHits.includes(eventObject)) {
              pointerMissed(event, internal.interaction.filter((object) => !internal.initialHits.includes(object)));
            }
          }
        }
      }
      handleIntersects(hits, event, delta, onIntersect);
    };
  }
  return {
    handlePointer
  };
}
var isRenderer = (def) => !!(def != null && def.render);
var context = /* @__PURE__ */ React.createContext(null);
var createStore = (invalidate2, advance2) => {
  const rootStore = createWithEqualityFn((set, get) => {
    const position = new THREE.Vector3();
    const defaultTarget = new THREE.Vector3();
    const tempTarget = new THREE.Vector3();
    function getCurrentViewport(camera = get().camera, target = defaultTarget, size = get().size) {
      const {
        width,
        height,
        top,
        left
      } = size;
      const aspect = width / height;
      if (target.isVector3) tempTarget.copy(target);
      else tempTarget.set(...target);
      const distance = camera.getWorldPosition(position).distanceTo(tempTarget);
      if (isOrthographicCamera(camera)) {
        return {
          width: width / camera.zoom,
          height: height / camera.zoom,
          top,
          left,
          factor: 1,
          distance,
          aspect
        };
      } else {
        const fov = camera.fov * Math.PI / 180;
        const h = 2 * Math.tan(fov / 2) * distance;
        const w = h * (width / height);
        return {
          width: w,
          height: h,
          top,
          left,
          factor: width / w,
          distance,
          aspect
        };
      }
    }
    let performanceTimeout = void 0;
    const setPerformanceCurrent = (current) => set((state3) => ({
      performance: {
        ...state3.performance,
        current
      }
    }));
    const pointer = new THREE.Vector2();
    const rootState = {
      set,
      get,
      // Mock objects that have to be configured
      gl: null,
      camera: null,
      raycaster: null,
      events: {
        priority: 1,
        enabled: true,
        connected: false
      },
      scene: null,
      xr: null,
      invalidate: (frames = 1) => invalidate2(get(), frames),
      advance: (timestamp, runGlobalEffects) => advance2(timestamp, runGlobalEffects, get()),
      legacy: false,
      linear: false,
      flat: false,
      controls: null,
      clock: new THREE.Clock(),
      pointer,
      mouse: pointer,
      frameloop: "always",
      onPointerMissed: void 0,
      performance: {
        current: 1,
        min: 0.5,
        max: 1,
        debounce: 200,
        regress: () => {
          const state3 = get();
          if (performanceTimeout) clearTimeout(performanceTimeout);
          if (state3.performance.current !== state3.performance.min) setPerformanceCurrent(state3.performance.min);
          performanceTimeout = setTimeout(() => setPerformanceCurrent(get().performance.max), state3.performance.debounce);
        }
      },
      size: {
        width: 0,
        height: 0,
        top: 0,
        left: 0
      },
      viewport: {
        initialDpr: 0,
        dpr: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        aspect: 0,
        distance: 0,
        factor: 0,
        getCurrentViewport
      },
      setEvents: (events) => set((state3) => ({
        ...state3,
        events: {
          ...state3.events,
          ...events
        }
      })),
      setSize: (width, height, top = 0, left = 0) => {
        const camera = get().camera;
        const size = {
          width,
          height,
          top,
          left
        };
        set((state3) => ({
          size,
          viewport: {
            ...state3.viewport,
            ...getCurrentViewport(camera, defaultTarget, size)
          }
        }));
      },
      setDpr: (dpr) => set((state3) => {
        const resolved = calculateDpr(dpr);
        return {
          viewport: {
            ...state3.viewport,
            dpr: resolved,
            initialDpr: state3.viewport.initialDpr || resolved
          }
        };
      }),
      setFrameloop: (frameloop = "always") => {
        const clock = get().clock;
        clock.stop();
        clock.elapsedTime = 0;
        if (frameloop !== "never") {
          clock.start();
          clock.elapsedTime = 0;
        }
        set(() => ({
          frameloop
        }));
      },
      previousRoot: void 0,
      internal: {
        // Events
        interaction: [],
        hovered: /* @__PURE__ */ new Map(),
        subscribers: [],
        initialClick: [0, 0],
        initialHits: [],
        capturedMap: /* @__PURE__ */ new Map(),
        lastEvent: /* @__PURE__ */ React.createRef(),
        // Updates
        active: false,
        frames: 0,
        priority: 0,
        subscribe: (ref, priority, store) => {
          const internal = get().internal;
          internal.priority = internal.priority + (priority > 0 ? 1 : 0);
          internal.subscribers.push({
            ref,
            priority,
            store
          });
          internal.subscribers = internal.subscribers.sort((a, b) => a.priority - b.priority);
          return () => {
            const internal2 = get().internal;
            if (internal2 != null && internal2.subscribers) {
              internal2.priority = internal2.priority - (priority > 0 ? 1 : 0);
              internal2.subscribers = internal2.subscribers.filter((s) => s.ref !== ref);
            }
          };
        }
      }
    };
    return rootState;
  });
  const state2 = rootStore.getState();
  let oldSize = state2.size;
  let oldDpr = state2.viewport.dpr;
  let oldCamera = state2.camera;
  rootStore.subscribe(() => {
    const {
      camera,
      size,
      viewport,
      gl,
      set
    } = rootStore.getState();
    if (size.width !== oldSize.width || size.height !== oldSize.height || viewport.dpr !== oldDpr) {
      oldSize = size;
      oldDpr = viewport.dpr;
      updateCamera(camera, size);
      if (viewport.dpr > 0) gl.setPixelRatio(viewport.dpr);
      const updateStyle = typeof HTMLCanvasElement !== "undefined" && gl.domElement instanceof HTMLCanvasElement;
      gl.setSize(size.width, size.height, updateStyle);
    }
    if (camera !== oldCamera) {
      oldCamera = camera;
      set((state3) => ({
        viewport: {
          ...state3.viewport,
          ...state3.viewport.getCurrentViewport(camera)
        }
      }));
    }
  });
  rootStore.subscribe((state3) => invalidate2(state3));
  return rootStore;
};
function useInstanceHandle(ref) {
  const instance = React.useRef(null);
  React.useImperativeHandle(instance, () => ref.current.__r3f, [ref]);
  return instance;
}
function useStore() {
  const store = React.useContext(context);
  if (!store) throw new Error("R3F: Hooks can only be used within the Canvas component!");
  return store;
}
function useThree(selector = (state2) => state2, equalityFn) {
  return useStore()(selector, equalityFn);
}
function useFrame(callback, renderPriority = 0) {
  const store = useStore();
  const subscribe = store.getState().internal.subscribe;
  const ref = useMutableCallback(callback);
  useIsomorphicLayoutEffect(() => subscribe(ref, renderPriority, store), [renderPriority, subscribe, store]);
  return null;
}
function useGraph(object) {
  return React.useMemo(() => buildGraph(object), [object]);
}
var memoizedLoaders = /* @__PURE__ */ new WeakMap();
var isConstructor$1 = (value) => {
  var _value$prototype;
  return typeof value === "function" && (value == null ? void 0 : (_value$prototype = value.prototype) == null ? void 0 : _value$prototype.constructor) === value;
};
function loadingFn(extensions, onProgress) {
  return function(Proto, ...input) {
    let loader;
    if (isConstructor$1(Proto)) {
      loader = memoizedLoaders.get(Proto);
      if (!loader) {
        loader = new Proto();
        memoizedLoaders.set(Proto, loader);
      }
    } else {
      loader = Proto;
    }
    if (extensions) extensions(loader);
    return Promise.all(input.map((input2) => new Promise((res, reject) => loader.load(input2, (data) => {
      if (isObject3D(data == null ? void 0 : data.scene)) Object.assign(data, buildGraph(data.scene));
      res(data);
    }, onProgress, (error) => reject(new Error(`Could not load ${input2}: ${error == null ? void 0 : error.message}`))))));
  };
}
function useLoader(loader, input, extensions, onProgress) {
  const keys = Array.isArray(input) ? input : [input];
  const results = suspend(loadingFn(extensions, onProgress), [loader, ...keys], {
    equal: is.equ
  });
  return Array.isArray(input) ? results : results[0];
}
useLoader.preload = function(loader, input, extensions) {
  const keys = Array.isArray(input) ? input : [input];
  return preload(loadingFn(extensions), [loader, ...keys]);
};
useLoader.clear = function(loader, input) {
  const keys = Array.isArray(input) ? input : [input];
  return clear([loader, ...keys]);
};
var t = 1;
var o = 8;
var r = 32;
var e = 2;
var packageData = {
  name: "@react-three/fiber",
  version: "9.6.0",
  description: "A React renderer for Threejs",
  keywords: [
    "react",
    "renderer",
    "fiber",
    "three",
    "threejs"
  ],
  author: "Paul Henschel (https://github.com/drcmda)",
  license: "MIT",
  maintainers: [
    "Josh Ellis (https://github.com/joshuaellis)",
    "Cody Bennett (https://github.com/codyjasonbennett)",
    "Kris Baumgarter (https://github.com/krispya)"
  ],
  bugs: {
    url: "https://github.com/pmndrs/react-three-fiber/issues"
  },
  homepage: "https://github.com/pmndrs/react-three-fiber#readme",
  repository: {
    type: "git",
    url: "git+https://github.com/pmndrs/react-three-fiber.git"
  },
  collective: {
    type: "opencollective",
    url: "https://opencollective.com/react-three-fiber"
  },
  main: "dist/react-three-fiber.cjs.js",
  module: "dist/react-three-fiber.esm.js",
  types: "dist/react-three-fiber.cjs.d.ts",
  "react-native": "native/dist/react-three-fiber-native.cjs.js",
  sideEffects: false,
  preconstruct: {
    entrypoints: [
      "index.tsx",
      "native.tsx"
    ]
  },
  scripts: {
    prebuild: "cp ../../readme.md readme.md"
  },
  devDependencies: {
    "@types/react-reconciler": "^0.32.3",
    "react-reconciler": "^0.33.0"
  },
  dependencies: {
    "@babel/runtime": "^7.17.8",
    "@types/webxr": "*",
    "base64-js": "^1.5.1",
    buffer: "^6.0.3",
    "its-fine": "^2.0.0",
    "react-use-measure": "^2.1.7",
    scheduler: "^0.27.0",
    "suspend-react": "^0.1.3",
    "use-sync-external-store": "^1.4.0",
    zustand: "^5.0.3"
  },
  peerDependencies: {
    expo: ">=43.0",
    "expo-asset": ">=8.4",
    "expo-file-system": ">=11.0",
    "expo-gl": ">=11.0",
    react: ">=19 <19.3",
    "react-dom": ">=19 <19.3",
    "react-native": ">=0.78",
    three: ">=0.156"
  },
  peerDependenciesMeta: {
    "react-dom": {
      optional: true
    },
    "react-native": {
      optional: true
    },
    expo: {
      optional: true
    },
    "expo-asset": {
      optional: true
    },
    "expo-file-system": {
      optional: true
    },
    "expo-gl": {
      optional: true
    }
  }
};
function Xb(Tt) {
  return Tt && Tt.__esModule && Object.prototype.hasOwnProperty.call(Tt, "default") ? Tt.default : Tt;
}
var Rm = {
  exports: {}
};
var Og = {
  exports: {}
};
Og.exports;
var Mg = {
  exports: {}
};
Mg.exports;
var Rb;
function e0() {
  return Rb || (Rb = 1, (function(Tt) {
    Tt.exports = function(m) {
      function Yn(e2, n) {
        for (e2 = e2.memoizedState; e2 !== null && 0 < n; ) e2 = e2.next, n--;
        return e2;
      }
      function _d(e2, n, o2, i2) {
        if (o2 >= n.length) return i2;
        var s = n[o2], u = fn(e2) ? e2.slice() : ze({}, e2);
        return u[s] = _d(e2[s], n, o2 + 1, i2), u;
      }
      function F(e2, n, o2) {
        if (n.length !== o2.length) console.warn("copyWithRename() expects paths of the same length");
        else {
          for (var i2 = 0; i2 < o2.length - 1; i2++) if (n[i2] !== o2[i2]) {
            console.warn("copyWithRename() expects paths to be the same except for the deepest key");
            return;
          }
          return Rd(e2, n, o2, 0);
        }
      }
      function Rd(e2, n, o2, i2) {
        var s = n[i2], u = fn(e2) ? e2.slice() : ze({}, e2);
        return i2 + 1 === n.length ? (u[o2[i2]] = u[s], fn(u) ? u.splice(s, 1) : delete u[s]) : u[s] = Rd(e2[s], n, o2, i2 + 1), u;
      }
      function du(e2, n, o2) {
        var i2 = n[o2], s = fn(e2) ? e2.slice() : ze({}, e2);
        return o2 + 1 === n.length ? (fn(s) ? s.splice(i2, 1) : delete s[i2], s) : (s[i2] = du(e2[i2], n, o2 + 1), s);
      }
      function fu() {
        return false;
      }
      function pu() {
        return null;
      }
      function lt(e2, n, o2, i2) {
        return new Vm(e2, n, o2, i2);
      }
      function Fl(e2, n) {
        e2.context === Oe && (Wh(n, e2, null, null), Ls());
      }
      function hu(e2, n) {
        if (co !== null) {
          var o2 = n.staleFamilies;
          n = n.updatedFamilies, el(), jh(e2.current, n, o2), Ls();
        }
      }
      function Ir(e2) {
        co = e2;
      }
      function D() {
        console.error("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://react.dev/link/rules-of-hooks");
      }
      function Ce() {
        console.error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
      }
      function Em() {
      }
      function Zo() {
      }
      function Lr(e2) {
        var n = [];
        return e2.forEach(function(o2) {
          n.push(o2);
        }), n.sort().join(", ");
      }
      function Pi(e2) {
        var n = e2, o2 = e2;
        if (e2.alternate) for (; n.return; ) n = n.return;
        else {
          e2 = n;
          do
            n = e2, (n.flags & 4098) !== 0 && (o2 = n.return), e2 = n.return;
          while (e2);
        }
        return n.tag === 3 ? o2 : null;
      }
      function Tp(e2) {
        if (Pi(e2) !== e2) throw Error("Unable to find node on an unmounted component.");
      }
      function Ed(e2) {
        var n = e2.alternate;
        if (!n) {
          if (n = Pi(e2), n === null) throw Error("Unable to find node on an unmounted component.");
          return n !== e2 ? null : e2;
        }
        for (var o2 = e2, i2 = n; ; ) {
          var s = o2.return;
          if (s === null) break;
          var u = s.alternate;
          if (u === null) {
            if (i2 = s.return, i2 !== null) {
              o2 = i2;
              continue;
            }
            break;
          }
          if (s.child === u.child) {
            for (u = s.child; u; ) {
              if (u === o2) return Tp(s), e2;
              if (u === i2) return Tp(s), n;
              u = u.sibling;
            }
            throw Error("Unable to find node on an unmounted component.");
          }
          if (o2.return !== i2.return) o2 = s, i2 = u;
          else {
            for (var f = false, p = s.child; p; ) {
              if (p === o2) {
                f = true, o2 = s, i2 = u;
                break;
              }
              if (p === i2) {
                f = true, i2 = s, o2 = u;
                break;
              }
              p = p.sibling;
            }
            if (!f) {
              for (p = u.child; p; ) {
                if (p === o2) {
                  f = true, o2 = u, i2 = s;
                  break;
                }
                if (p === i2) {
                  f = true, i2 = u, o2 = s;
                  break;
                }
                p = p.sibling;
              }
              if (!f) throw Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
            }
          }
          if (o2.alternate !== i2) throw Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
        }
        if (o2.tag !== 3) throw Error("Unable to find node on an unmounted component.");
        return o2.stateNode.current === o2 ? e2 : n;
      }
      function mu(e2) {
        return e2 = Ed(e2), e2 !== null ? xi(e2) : null;
      }
      function xi(e2) {
        var n = e2.tag;
        if (n === 5 || n === 26 || n === 27 || n === 6) return e2;
        for (e2 = e2.child; e2 !== null; ) {
          if (n = xi(e2), n !== null) return n;
          e2 = e2.sibling;
        }
        return null;
      }
      function _p(e2) {
        var n = e2.tag;
        if (n === 5 || n === 26 || n === 27 || n === 6) return e2;
        for (e2 = e2.child; e2 !== null; ) {
          if (e2.tag !== 4 && (n = _p(e2), n !== null)) return n;
          e2 = e2.sibling;
        }
        return null;
      }
      function Yo(e2) {
        return e2 === null || typeof e2 != "object" ? null : (e2 = ni && e2[ni] || e2["@@iterator"], typeof e2 == "function" ? e2 : null);
      }
      function $e(e2) {
        if (e2 == null) return null;
        if (typeof e2 == "function") return e2.$$typeof === il ? null : e2.displayName || e2.name || null;
        if (typeof e2 == "string") return e2;
        switch (e2) {
          case ol:
            return "Fragment";
          case Uf:
            return "Profiler";
          case Lc:
            return "StrictMode";
          case Nc:
            return "Suspense";
          case Bf:
            return "SuspenseList";
          case Ds:
            return "Activity";
        }
        if (typeof e2 == "object") switch (typeof e2.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e2.$$typeof) {
          case Ao:
            return "Portal";
          case on:
            return e2.displayName || "Context";
          case ei:
            return (e2._context.displayName || "Context") + ".Consumer";
          case jn:
            var n = e2.render;
            return e2 = e2.displayName, e2 || (e2 = n.displayName || n.name || "", e2 = e2 !== "" ? "ForwardRef(" + e2 + ")" : "ForwardRef"), e2;
          case al:
            return n = e2.displayName || null, n !== null ? n : $e(e2.type) || "Memo";
          case kt:
            n = e2._payload, e2 = e2._init;
            try {
              return $e(e2(n));
            } catch {
            }
        }
        return null;
      }
      function G(e2) {
        var n = e2.type;
        switch (e2.tag) {
          case 31:
            return "Activity";
          case 24:
            return "Cache";
          case 9:
            return (n._context.displayName || "Context") + ".Consumer";
          case 10:
            return n.displayName || "Context";
          case 18:
            return "DehydratedFragment";
          case 11:
            return e2 = n.render, e2 = e2.displayName || e2.name || "", n.displayName || (e2 !== "" ? "ForwardRef(" + e2 + ")" : "ForwardRef");
          case 7:
            return "Fragment";
          case 26:
          case 27:
          case 5:
            return n;
          case 4:
            return "Portal";
          case 3:
            return "Root";
          case 6:
            return "Text";
          case 16:
            return $e(n);
          case 8:
            return n === Lc ? "StrictMode" : "Mode";
          case 22:
            return "Offscreen";
          case 12:
            return "Profiler";
          case 21:
            return "Scope";
          case 13:
            return "Suspense";
          case 19:
            return "SuspenseList";
          case 25:
            return "TracingMarker";
          case 1:
          case 0:
          case 14:
          case 15:
            if (typeof n == "function") return n.displayName || n.name || null;
            if (typeof n == "string") return n;
            break;
          case 29:
            if (n = e2._debugInfo, n != null) {
              for (var o2 = n.length - 1; 0 <= o2; o2--) if (typeof n[o2].name == "string") return n[o2].name;
            }
            if (e2.return !== null) return G(e2.return);
        }
        return null;
      }
      function st(e2) {
        return {
          current: e2
        };
      }
      function Ze(e2, n) {
        0 > V ? console.error("Unexpected pop.") : (n !== W[V] && console.error("Unexpected Fiber popped."), e2.current = A[V], A[V] = null, W[V] = null, V--);
      }
      function pe(e2, n, o2) {
        V++, A[V] = e2.current, W[V] = o2, e2.current = n;
      }
      function Im(e2) {
        return e2 >>>= 0, e2 === 0 ? 32 : 31 - (li(e2) / P | 0) | 0;
      }
      function _t(e2) {
        var n = e2 & 42;
        if (n !== 0) return n;
        switch (e2 & -e2) {
          case 1:
            return 1;
          case 2:
            return 2;
          case 4:
            return 4;
          case 8:
            return 8;
          case 16:
            return 16;
          case 32:
            return 32;
          case 64:
            return 64;
          case 128:
            return 128;
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
            return e2 & 261888;
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return e2 & 3932160;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            return e2 & 62914560;
          case 67108864:
            return 67108864;
          case 134217728:
            return 134217728;
          case 268435456:
            return 268435456;
          case 536870912:
            return 536870912;
          case 1073741824:
            return 0;
          default:
            return console.error("Should have found matching lanes. This is a bug in React."), e2;
        }
      }
      function zi(e2, n, o2) {
        var i2 = e2.pendingLanes;
        if (i2 === 0) return 0;
        var s = 0, u = e2.suspendedLanes, f = e2.pingedLanes;
        e2 = e2.warmLanes;
        var p = i2 & 134217727;
        return p !== 0 ? (i2 = p & ~u, i2 !== 0 ? s = _t(i2) : (f &= p, f !== 0 ? s = _t(f) : o2 || (o2 = p & ~e2, o2 !== 0 && (s = _t(o2))))) : (p = i2 & ~u, p !== 0 ? s = _t(p) : f !== 0 ? s = _t(f) : o2 || (o2 = i2 & ~e2, o2 !== 0 && (s = _t(o2)))), s === 0 ? 0 : n !== 0 && n !== s && (n & u) === 0 && (u = s & -s, o2 = n & -n, u >= o2 || u === 32 && (o2 & 4194048) !== 0) ? n : s;
      }
      function Hl(e2, n) {
        return (e2.pendingLanes & ~(e2.suspendedLanes & ~e2.pingedLanes) & n) === 0;
      }
      function Rp(e2, n) {
        switch (e2) {
          case 1:
          case 2:
          case 4:
          case 8:
          case 64:
            return n + 250;
          case 16:
          case 32:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return n + 5e3;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            return -1;
          case 67108864:
          case 134217728:
          case 268435456:
          case 536870912:
          case 1073741824:
            return -1;
          default:
            return console.error("Should have found matching lanes. This is a bug in React."), -1;
        }
      }
      function ut() {
        var e2 = H;
        return H <<= 1, (H & 62914560) === 0 && (H = 4194304), e2;
      }
      function or(e2) {
        for (var n = [], o2 = 0; 31 > o2; o2++) n.push(e2);
        return n;
      }
      function Ci(e2, n) {
        e2.pendingLanes |= n, n !== 268435456 && (e2.suspendedLanes = 0, e2.pingedLanes = 0, e2.warmLanes = 0);
      }
      function Id(e2, n, o2, i2, s, u) {
        var f = e2.pendingLanes;
        e2.pendingLanes = o2, e2.suspendedLanes = 0, e2.pingedLanes = 0, e2.warmLanes = 0, e2.expiredLanes &= o2, e2.entangledLanes &= o2, e2.errorRecoveryDisabledLanes &= o2, e2.shellSuspendCounter = 0;
        var p = e2.entanglements, g = e2.expirationTimes, S = e2.hiddenUpdates;
        for (o2 = f & ~o2; 0 < o2; ) {
          var T = 31 - vn(o2), _ = 1 << T;
          p[T] = 0, g[T] = -1;
          var I = S[T];
          if (I !== null) for (S[T] = null, T = 0; T < I.length; T++) {
            var O = I[T];
            O !== null && (O.lane &= -536870913);
          }
          o2 &= ~_;
        }
        i2 !== 0 && gu(e2, i2, 0), u !== 0 && s === 0 && e2.tag !== 0 && (e2.suspendedLanes |= u & ~(f & ~n));
      }
      function gu(e2, n, o2) {
        e2.pendingLanes |= n, e2.suspendedLanes &= ~n;
        var i2 = 31 - vn(n);
        e2.entangledLanes |= n, e2.entanglements[i2] = e2.entanglements[i2] | 1073741824 | o2 & 261930;
      }
      function Ld(e2, n) {
        var o2 = e2.entangledLanes |= n;
        for (e2 = e2.entanglements; o2; ) {
          var i2 = 31 - vn(o2), s = 1 << i2;
          s & n | e2[i2] & n && (e2[i2] |= n), o2 &= ~s;
        }
      }
      function Al(e2, n) {
        var o2 = n & -n;
        return o2 = (o2 & 42) !== 0 ? 1 : Xo(o2), (o2 & (e2.suspendedLanes | n)) !== 0 ? 0 : o2;
      }
      function Xo(e2) {
        switch (e2) {
          case 2:
            e2 = 1;
            break;
          case 8:
            e2 = 4;
            break;
          case 32:
            e2 = 16;
            break;
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            e2 = 128;
            break;
          case 268435456:
            e2 = 134217728;
            break;
          default:
            e2 = 0;
        }
        return e2;
      }
      function yu(e2, n, o2) {
        if (wa) for (e2 = e2.pendingUpdatersLaneMap; 0 < o2; ) {
          var i2 = 31 - vn(o2), s = 1 << i2;
          e2[i2].add(n), o2 &= ~s;
        }
      }
      function jl(e2, n) {
        if (wa) for (var o2 = e2.pendingUpdatersLaneMap, i2 = e2.memoizedUpdaters; 0 < n; ) {
          var s = 31 - vn(n);
          e2 = 1 << s, s = o2[s], 0 < s.size && (s.forEach(function(u) {
            var f = u.alternate;
            f !== null && i2.has(f) || i2.add(u);
          }), s.clear()), n &= ~e2;
        }
      }
      function ar(e2) {
        return e2 &= -e2, 2 < e2 ? 8 < e2 ? (e2 & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
      }
      function Ep(e2) {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u") return false;
        var n = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (n.isDisabled) return true;
        if (!n.supportsFiber) return console.error("The installed version of React DevTools is too old and will not work with the current version of React. Please update React DevTools. https://react.dev/link/react-devtools"), true;
        try {
          td = n.inject(e2), zt = n;
        } catch (o2) {
          console.error("React instrumentation encountered an error: %o.", o2);
        }
        return !!n.checkDCE;
      }
      function De(e2) {
        if (typeof Ib == "function" && Lb(e2), zt && typeof zt.setStrictMode == "function") try {
          zt.setStrictMode(td, e2);
        } catch (n) {
          ka || (ka = true, console.error("React instrumentation encountered an error: %o", n));
        }
      }
      function Ti(e2, n) {
        return e2 === n && (e2 !== 0 || 1 / e2 === 1 / n) || e2 !== e2 && n !== n;
      }
      function _a(e2) {
        for (var n = 0, o2 = 0; o2 < e2.length; o2++) {
          var i2 = e2[o2];
          if (typeof i2 == "object" && i2 !== null) {
            if (fn(i2) && i2.length === 2 && typeof i2[0] == "string") {
              if (n !== 0 && n !== 3) return 1;
              n = 3;
            } else return 1;
          } else {
            if (typeof i2 == "function" || typeof i2 == "string" && 50 < i2.length || n !== 0 && n !== 2) return 1;
            n = 2;
          }
        }
        return n;
      }
      function Dl(e2, n, o2, i2) {
        for (var s in e2) Xm.call(e2, s) && s[0] !== "_" && ct(s, e2[s], n, o2, i2);
      }
      function ct(e2, n, o2, i2, s) {
        switch (typeof n) {
          case "object":
            if (n === null) {
              n = "null";
              break;
            } else {
              if (n.$$typeof === Ho) {
                var u = $e(n.type) || "\u2026", f = n.key;
                n = n.props;
                var p = Object.keys(n), g = p.length;
                if (f == null && g === 0) {
                  n = "<" + u + " />";
                  break;
                }
                if (3 > i2 || g === 1 && p[0] === "children" && f == null) {
                  n = "<" + u + " \u2026 />";
                  break;
                }
                o2.push([s + "\xA0\xA0".repeat(i2) + e2, "<" + u]), f !== null && ct("key", f, o2, i2 + 1, s), e2 = false;
                for (var S in n) S === "children" ? n.children != null && (!fn(n.children) || 0 < n.children.length) && (e2 = true) : Xm.call(n, S) && S[0] !== "_" && ct(S, n[S], o2, i2 + 1, s);
                o2.push(["", e2 ? ">\u2026</" + u + ">" : "/>"]);
                return;
              }
              if (u = Object.prototype.toString.call(n), u = u.slice(8, u.length - 1), u === "Array") {
                if (S = _a(n), S === 2 || S === 0) {
                  n = JSON.stringify(n);
                  break;
                } else if (S === 3) {
                  for (o2.push([s + "\xA0\xA0".repeat(i2) + e2, ""]), e2 = 0; e2 < n.length; e2++) u = n[e2], ct(u[0], u[1], o2, i2 + 1, s);
                  return;
                }
              }
              if (u === "Promise") {
                if (n.status === "fulfilled") {
                  if (u = o2.length, ct(e2, n.value, o2, i2, s), o2.length > u) {
                    o2 = o2[u], o2[1] = "Promise<" + (o2[1] || "Object") + ">";
                    return;
                  }
                } else if (n.status === "rejected" && (u = o2.length, ct(e2, n.reason, o2, i2, s), o2.length > u)) {
                  o2 = o2[u], o2[1] = "Rejected Promise<" + o2[1] + ">";
                  return;
                }
                o2.push(["\xA0\xA0".repeat(i2) + e2, "Promise"]);
                return;
              }
              u === "Object" && (S = Object.getPrototypeOf(n)) && typeof S.constructor == "function" && (u = S.constructor.name), o2.push([s + "\xA0\xA0".repeat(i2) + e2, u === "Object" ? 3 > i2 ? "" : "\u2026" : u]), 3 > i2 && Dl(n, o2, i2 + 1, s);
              return;
            }
          case "function":
            n = n.name === "" ? "() => {}" : n.name + "() {}";
            break;
          case "string":
            n = n === "This object has been omitted by React in the console log to avoid sending too much data from the server. Try logging smaller or more specific objects." ? "\u2026" : JSON.stringify(n);
            break;
          case "undefined":
            n = "undefined";
            break;
          case "boolean":
            n = n ? "true" : "false";
            break;
          default:
            n = String(n);
        }
        o2.push([s + "\xA0\xA0".repeat(i2) + e2, n]);
      }
      function fo(e2, n, o2, i2) {
        var s = true;
        for (f in e2) f in n || (o2.push(["\u2013\xA0" + "\xA0\xA0".repeat(i2) + f, "\u2026"]), s = false);
        for (var u in n) if (u in e2) {
          var f = e2[u], p = n[u];
          if (f !== p) {
            if (i2 === 0 && u === "children") s = "\xA0\xA0".repeat(i2) + u, o2.push(["\u2013\xA0" + s, "\u2026"], ["+\xA0" + s, "\u2026"]);
            else {
              if (!(3 <= i2)) {
                if (typeof f == "object" && typeof p == "object" && f !== null && p !== null && f.$$typeof === p.$$typeof) {
                  if (p.$$typeof === Ho) {
                    if (f.type === p.type && f.key === p.key) {
                      f = $e(p.type) || "\u2026", s = "\xA0\xA0".repeat(i2) + u, f = "<" + f + " \u2026 />", o2.push(["\u2013\xA0" + s, f], ["+\xA0" + s, f]), s = false;
                      continue;
                    }
                  } else {
                    var g = Object.prototype.toString.call(f), S = Object.prototype.toString.call(p);
                    if (g === S && (S === "[object Object]" || S === "[object Array]")) {
                      g = ["\u2007\xA0" + "\xA0\xA0".repeat(i2) + u, S === "[object Array]" ? "Array" : ""], o2.push(g), S = o2.length, fo(f, p, o2, i2 + 1) ? S === o2.length && (g[1] = "Referentially unequal but deeply equal objects. Consider memoization.") : s = false;
                      continue;
                    }
                  }
                } else if (typeof f == "function" && typeof p == "function" && f.name === p.name && f.length === p.length && (g = Function.prototype.toString.call(f), S = Function.prototype.toString.call(p), g === S)) {
                  f = p.name === "" ? "() => {}" : p.name + "() {}", o2.push(["\u2007\xA0" + "\xA0\xA0".repeat(i2) + u, f + " Referentially unequal function closure. Consider memoization."]);
                  continue;
                }
              }
              ct(u, f, o2, i2, "\u2013\xA0"), ct(u, p, o2, i2, "+\xA0");
            }
            s = false;
          }
        } else o2.push(["+\xA0" + "\xA0\xA0".repeat(i2) + u, "\u2026"]), s = false;
        return s;
      }
      function En(e2) {
        fe = e2 & 63 ? "Blocking" : e2 & 64 ? "Gesture" : e2 & 4194176 ? "Transition" : e2 & 62914560 ? "Suspense" : e2 & 2080374784 ? "Idle" : "Other";
      }
      function Ot(e2, n, o2, i2) {
        Me && (bl.start = n, bl.end = o2, si.color = "warning", si.tooltipText = i2, si.properties = null, (e2 = e2._debugTask) ? e2.run(performance.measure.bind(performance, i2, bl)) : performance.measure(i2, bl));
      }
      function _i(e2, n, o2) {
        Ot(e2, n, o2, "Reconnect");
      }
      function po(e2, n, o2, i2, s) {
        var u = G(e2);
        if (u !== null && Me) {
          var f = e2.alternate, p = e2.actualDuration;
          if (f === null || f.child !== e2.child) for (var g = e2.child; g !== null; g = g.sibling) p -= g.actualDuration;
          i2 = 0.5 > p ? i2 ? "tertiary-light" : "primary-light" : 10 > p ? i2 ? "tertiary" : "primary" : 100 > p ? i2 ? "tertiary-dark" : "primary-dark" : "error";
          var S = e2.memoizedProps;
          p = e2._debugTask, S !== null && f !== null && f.memoizedProps !== S ? (g = [Hb], S = fo(f.memoizedProps, S, g, 0), 1 < g.length && (S && !yl && (f.lanes & s) === 0 && 100 < e2.actualDuration ? (yl = true, g[0] = Ab, si.color = "warning", si.tooltipText = "This component received deeply equal props. It might benefit from useMemo or the React Compiler in its owner.") : (si.color = i2, si.tooltipText = u), si.properties = g, bl.start = n, bl.end = o2, p != null ? p.run(performance.measure.bind(performance, "\u200B" + u, bl)) : performance.measure("\u200B" + u, bl))) : p != null ? p.run(console.timeStamp.bind(console, u, n, o2, "Components \u269B", void 0, i2)) : console.timeStamp(u, n, o2, "Components \u269B", void 0, i2);
        }
      }
      function Ri(e2, n, o2, i2) {
        if (Me) {
          var s = G(e2);
          if (s !== null) {
            for (var u = null, f = [], p = 0; p < i2.length; p++) {
              var g = i2[p];
              u == null && g.source !== null && (u = g.source._debugTask), g = g.value, f.push(["Error", typeof g == "object" && g !== null && typeof g.message == "string" ? String(g.message) : String(g)]);
            }
            e2.key !== null && ct("key", e2.key, f, 0, ""), e2.memoizedProps !== null && Dl(e2.memoizedProps, f, 0, ""), u == null && (u = e2._debugTask), e2 = {
              start: n,
              end: o2,
              detail: {
                devtools: {
                  color: "error",
                  track: "Components \u269B",
                  tooltipText: e2.tag === 13 ? "Hydration failed" : "Error boundary caught an error",
                  properties: f
                }
              }
            }, u ? u.run(performance.measure.bind(performance, "\u200B" + s, e2)) : performance.measure("\u200B" + s, e2);
          }
        }
      }
      function Un(e2, n, o2, i2, s) {
        if (s !== null) {
          if (Me) {
            var u = G(e2);
            if (u !== null) {
              i2 = [];
              for (var f = 0; f < s.length; f++) {
                var p = s[f].value;
                i2.push(["Error", typeof p == "object" && p !== null && typeof p.message == "string" ? String(p.message) : String(p)]);
              }
              e2.key !== null && ct("key", e2.key, i2, 0, ""), e2.memoizedProps !== null && Dl(e2.memoizedProps, i2, 0, ""), n = {
                start: n,
                end: o2,
                detail: {
                  devtools: {
                    color: "error",
                    track: "Components \u269B",
                    tooltipText: "A lifecycle or effect errored",
                    properties: i2
                  }
                }
              }, (e2 = e2._debugTask) ? e2.run(performance.measure.bind(performance, "\u200B" + u, n)) : performance.measure("\u200B" + u, n);
            }
          }
        } else u = G(e2), u !== null && Me && (s = 1 > i2 ? "secondary-light" : 100 > i2 ? "secondary" : 500 > i2 ? "secondary-dark" : "error", (e2 = e2._debugTask) ? e2.run(console.timeStamp.bind(console, u, n, o2, "Components \u269B", void 0, s)) : console.timeStamp(u, n, o2, "Components \u269B", void 0, s));
      }
      function In(e2, n, o2, i2) {
        if (Me && !(n <= e2)) {
          var s = (o2 & 738197653) === o2 ? "tertiary-dark" : "primary-dark";
          o2 = (o2 & 536870912) === o2 ? "Prepared" : (o2 & 201326741) === o2 ? "Hydrated" : "Render", i2 ? i2.run(console.timeStamp.bind(console, o2, e2, n, fe, "Scheduler \u269B", s)) : console.timeStamp(o2, e2, n, fe, "Scheduler \u269B", s);
        }
      }
      function Wl(e2, n, o2, i2) {
        !Me || n <= e2 || (o2 = (o2 & 738197653) === o2 ? "tertiary-dark" : "primary-dark", i2 ? i2.run(console.timeStamp.bind(console, "Prewarm", e2, n, fe, "Scheduler \u269B", o2)) : console.timeStamp("Prewarm", e2, n, fe, "Scheduler \u269B", o2));
      }
      function Nd(e2, n, o2, i2) {
        !Me || n <= e2 || (o2 = (o2 & 738197653) === o2 ? "tertiary-dark" : "primary-dark", i2 ? i2.run(console.timeStamp.bind(console, "Suspended", e2, n, fe, "Scheduler \u269B", o2)) : console.timeStamp("Suspended", e2, n, fe, "Scheduler \u269B", o2));
      }
      function Fd(e2, n, o2, i2, s, u) {
        if (Me && !(n <= e2)) {
          o2 = [];
          for (var f = 0; f < i2.length; f++) {
            var p = i2[f].value;
            o2.push(["Recoverable Error", typeof p == "object" && p !== null && typeof p.message == "string" ? String(p.message) : String(p)]);
          }
          e2 = {
            start: e2,
            end: n,
            detail: {
              devtools: {
                color: "primary-dark",
                track: fe,
                trackGroup: "Scheduler \u269B",
                tooltipText: s ? "Hydration Failed" : "Recovered after Error",
                properties: o2
              }
            }
          }, u ? u.run(performance.measure.bind(performance, "Recovered", e2)) : performance.measure("Recovered", e2);
        }
      }
      function Ra(e2, n, o2, i2) {
        !Me || n <= e2 || (i2 ? i2.run(console.timeStamp.bind(console, "Errored", e2, n, fe, "Scheduler \u269B", "error")) : console.timeStamp("Errored", e2, n, fe, "Scheduler \u269B", "error"));
      }
      function bu(e2, n, o2, i2) {
        !Me || n <= e2 || (i2 ? i2.run(console.timeStamp.bind(console, o2, e2, n, fe, "Scheduler \u269B", "secondary-light")) : console.timeStamp(o2, e2, n, fe, "Scheduler \u269B", "secondary-light"));
      }
      function ir(e2, n, o2, i2, s) {
        if (Me && !(n <= e2)) {
          for (var u = [], f = 0; f < o2.length; f++) {
            var p = o2[f].value;
            u.push(["Error", typeof p == "object" && p !== null && typeof p.message == "string" ? String(p.message) : String(p)]);
          }
          e2 = {
            start: e2,
            end: n,
            detail: {
              devtools: {
                color: "error",
                track: fe,
                trackGroup: "Scheduler \u269B",
                tooltipText: i2 ? "Remaining Effects Errored" : "Commit Errored",
                properties: u
              }
            }
          }, s ? s.run(performance.measure.bind(performance, "Errored", e2)) : performance.measure("Errored", e2);
        }
      }
      function Ea() {
      }
      function Ip() {
        if (Yf === 0) {
          Gg = console.log, Jg = console.info, Zg = console.warn, Yg = console.error, Xg = console.group, Kg = console.groupCollapsed, ey = console.groupEnd;
          var e2 = {
            configurable: true,
            enumerable: true,
            value: Ea,
            writable: true
          };
          Object.defineProperties(console, {
            info: e2,
            log: e2,
            warn: e2,
            error: e2,
            group: e2,
            groupCollapsed: e2,
            groupEnd: e2
          });
        }
        Yf++;
      }
      function Lp() {
        if (Yf--, Yf === 0) {
          var e2 = {
            configurable: true,
            enumerable: true,
            writable: true
          };
          Object.defineProperties(console, {
            log: ze({}, e2, {
              value: Gg
            }),
            info: ze({}, e2, {
              value: Jg
            }),
            warn: ze({}, e2, {
              value: Zg
            }),
            error: ze({}, e2, {
              value: Yg
            }),
            group: ze({}, e2, {
              value: Xg
            }),
            groupCollapsed: ze({}, e2, {
              value: Kg
            }),
            groupEnd: ze({}, e2, {
              value: ey
            })
          });
        }
        0 > Yf && console.error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
      function vu(e2) {
        var n = Error.prepareStackTrace;
        if (Error.prepareStackTrace = void 0, e2 = e2.stack, Error.prepareStackTrace = n, e2.startsWith(`Error: react-stack-top-frame
`) && (e2 = e2.slice(29)), n = e2.indexOf(`
`), n !== -1 && (e2 = e2.slice(n + 1)), n = e2.indexOf("react_stack_bottom_frame"), n !== -1 && (n = e2.lastIndexOf(`
`, n)), n !== -1) e2 = e2.slice(0, n);
        else return "";
        return e2;
      }
      function dt(e2) {
        if (Km === void 0) try {
          throw Error();
        } catch (o2) {
          var n = o2.stack.trim().match(/\n( *(at )?)/);
          Km = n && n[1] || "", ny = -1 < o2.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < o2.stack.indexOf("@") ? "@unknown:0:0" : "";
        }
        return `
` + Km + e2 + ny;
      }
      function Su(e2, n) {
        if (!e2 || eg) return "";
        var o2 = ng.get(e2);
        if (o2 !== void 0) return o2;
        eg = true, o2 = Error.prepareStackTrace, Error.prepareStackTrace = void 0;
        var i2 = null;
        i2 = x.H, x.H = null, Ip();
        try {
          var s = {
            DetermineComponentFrameRoot: function() {
              try {
                if (n) {
                  var I = function() {
                    throw Error();
                  };
                  if (Object.defineProperty(I.prototype, "props", {
                    set: function() {
                      throw Error();
                    }
                  }), typeof Reflect == "object" && Reflect.construct) {
                    try {
                      Reflect.construct(I, []);
                    } catch (K) {
                      var O = K;
                    }
                    Reflect.construct(e2, [], I);
                  } else {
                    try {
                      I.call();
                    } catch (K) {
                      O = K;
                    }
                    e2.call(I.prototype);
                  }
                } else {
                  try {
                    throw Error();
                  } catch (K) {
                    O = K;
                  }
                  (I = e2()) && typeof I.catch == "function" && I.catch(function() {
                  });
                }
              } catch (K) {
                if (K && O && typeof K.stack == "string") return [K.stack, O.stack];
              }
              return [null, null];
            }
          };
          s.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
          var u = Object.getOwnPropertyDescriptor(s.DetermineComponentFrameRoot, "name");
          u && u.configurable && Object.defineProperty(s.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot"
          });
          var f = s.DetermineComponentFrameRoot(), p = f[0], g = f[1];
          if (p && g) {
            var S = p.split(`
`), T = g.split(`
`);
            for (f = u = 0; u < S.length && !S[u].includes("DetermineComponentFrameRoot"); ) u++;
            for (; f < T.length && !T[f].includes("DetermineComponentFrameRoot"); ) f++;
            if (u === S.length || f === T.length) for (u = S.length - 1, f = T.length - 1; 1 <= u && 0 <= f && S[u] !== T[f]; ) f--;
            for (; 1 <= u && 0 <= f; u--, f--) if (S[u] !== T[f]) {
              if (u !== 1 || f !== 1) do
                if (u--, f--, 0 > f || S[u] !== T[f]) {
                  var _ = `
` + S[u].replace(" at new ", " at ");
                  return e2.displayName && _.includes("<anonymous>") && (_ = _.replace("<anonymous>", e2.displayName)), typeof e2 == "function" && ng.set(e2, _), _;
                }
              while (1 <= u && 0 <= f);
              break;
            }
          }
        } finally {
          eg = false, x.H = i2, Lp(), Error.prepareStackTrace = o2;
        }
        return S = (S = e2 ? e2.displayName || e2.name : "") ? dt(S) : "", typeof e2 == "function" && ng.set(e2, S), S;
      }
      function Lm(e2, n) {
        switch (e2.tag) {
          case 26:
          case 27:
          case 5:
            return dt(e2.type);
          case 16:
            return dt("Lazy");
          case 13:
            return e2.child !== n && n !== null ? dt("Suspense Fallback") : dt("Suspense");
          case 19:
            return dt("SuspenseList");
          case 0:
          case 15:
            return Su(e2.type, false);
          case 11:
            return Su(e2.type.render, false);
          case 1:
            return Su(e2.type, true);
          case 31:
            return dt("Activity");
          default:
            return "";
        }
      }
      function ku(e2) {
        try {
          var n = "", o2 = null;
          do {
            n += Lm(e2, o2);
            var i2 = e2._debugInfo;
            if (i2) for (var s = i2.length - 1; 0 <= s; s--) {
              var u = i2[s];
              if (typeof u.name == "string") {
                var f = n;
                e: {
                  var p = u.name, g = u.env, S = u.debugLocation;
                  if (S != null) {
                    var T = vu(S), _ = T.lastIndexOf(`
`), I = _ === -1 ? T : T.slice(_ + 1);
                    if (I.indexOf(p) !== -1) {
                      var O = `
` + I;
                      break e;
                    }
                  }
                  O = dt(p + (g ? " [" + g + "]" : ""));
                }
                n = f + O;
              }
            }
            o2 = e2, e2 = e2.return;
          } while (e2);
          return n;
        } catch (K) {
          return `
Error generating stack: ` + K.message + `
` + K.stack;
        }
      }
      function Np(e2) {
        return (e2 = e2 ? e2.displayName || e2.name : "") ? dt(e2) : "";
      }
      function ft(e2, n) {
        if (typeof e2 == "object" && e2 !== null) {
          var o2 = tg.get(e2);
          return o2 !== void 0 ? o2 : (n = {
            value: e2,
            source: n,
            stack: ku(n)
          }, tg.set(e2, n), n);
        }
        return {
          value: e2,
          source: n,
          stack: ku(n)
        };
      }
      function ho(e2, n) {
        mo(), rd[od++] = Xf, rd[od++] = Vh, Vh = e2, Xf = n;
      }
      function wu(e2, n, o2) {
        mo(), to[ro++] = ui, to[ro++] = ci, to[ro++] = Gs, Gs = e2;
        var i2 = ui;
        e2 = ci;
        var s = 32 - vn(i2) - 1;
        i2 &= ~(1 << s), o2 += 1;
        var u = 32 - vn(n) + s;
        if (30 < u) {
          var f = s - s % 5;
          u = (i2 & (1 << f) - 1).toString(32), i2 >>= f, s -= f, ui = 1 << 32 - vn(n) + s | o2 << s | i2, ci = u + e2;
        } else ui = 1 << u | o2 << s | i2, ci = e2;
      }
      function Ei(e2) {
        mo(), e2.return !== null && (ho(e2, 1), wu(e2, 1, 0));
      }
      function Pu(e2) {
        for (; e2 === Vh; ) Vh = rd[--od], rd[od] = null, Xf = rd[--od], rd[od] = null;
        for (; e2 === Gs; ) Gs = to[--ro], to[ro] = null, ci = to[--ro], to[ro] = null, ui = to[--ro], to[ro] = null;
      }
      function Ul() {
        return mo(), Gs !== null ? {
          id: ui,
          overflow: ci
        } : null;
      }
      function Hd(e2, n) {
        mo(), to[ro++] = ui, to[ro++] = ci, to[ro++] = Gs, ui = n.id, ci = n.overflow, Gs = e2;
      }
      function mo() {
        ge || console.error("Expected to be hydrating. This is a bug in React. Please file an issue.");
      }
      function pt(e2) {
        return e2 === null && console.error("Expected host context to exist. This error is likely caused by a bug in React. Please file an issue."), e2;
      }
      function Bl(e2, n) {
        pe(Sl, n, e2), pe(Kf, e2, e2), pe(vl, null, e2), n = Zr(n), Ze(vl, e2), pe(vl, n, e2);
      }
      function Ia(e2) {
        Ze(vl, e2), Ze(Kf, e2), Ze(Sl, e2);
      }
      function Rt() {
        return pt(vl.current);
      }
      function La(e2) {
        e2.memoizedState !== null && pe(qh, e2, e2);
        var n = pt(vl.current), o2 = Dn(n, e2.type);
        n !== o2 && (pe(Kf, e2, e2), pe(vl, o2, e2));
      }
      function Na(e2) {
        Kf.current === e2 && (Ze(vl, e2), Ze(Kf, e2)), qh.current === e2 && (Ze(qh, e2), at ? Kt._currentValue = Xt : Kt._currentValue2 = Xt);
      }
      function Ad(e2, n) {
        return e2.serverProps === void 0 && e2.serverTail.length === 0 && e2.children.length === 1 && 3 < e2.distanceFromLeaf && e2.distanceFromLeaf > 15 - n ? Ad(e2.children[0], n) : e2;
      }
      function Bn(e2) {
        return "  " + "  ".repeat(e2);
      }
      function go(e2) {
        return "+ " + "  ".repeat(e2);
      }
      function yo(e2) {
        return "- " + "  ".repeat(e2);
      }
      function Ko(e2) {
        switch (e2.tag) {
          case 26:
          case 27:
          case 5:
            return e2.type;
          case 16:
            return "Lazy";
          case 31:
            return "Activity";
          case 13:
            return "Suspense";
          case 19:
            return "SuspenseList";
          case 0:
          case 15:
            return e2 = e2.type, e2.displayName || e2.name || null;
          case 11:
            return e2 = e2.type.render, e2.displayName || e2.name || null;
          case 1:
            return e2 = e2.type, e2.displayName || e2.name || null;
          default:
            return null;
        }
      }
      function Ii(e2, n) {
        return ty.test(e2) ? (e2 = JSON.stringify(e2), e2.length > n - 2 ? 8 > n ? '{"..."}' : "{" + e2.slice(0, n - 7) + '..."}' : "{" + e2 + "}") : e2.length > n ? 5 > n ? '{"..."}' : e2.slice(0, n - 3) + "..." : e2;
      }
      function Fa(e2, n, o2) {
        var i2 = 120 - 2 * o2;
        if (n === null) return go(o2) + Ii(e2, i2) + `
`;
        if (typeof n == "string") {
          for (var s = 0; s < n.length && s < e2.length && n.charCodeAt(s) === e2.charCodeAt(s); s++) ;
          return s > i2 - 8 && 10 < s && (e2 = "..." + e2.slice(s - 8), n = "..." + n.slice(s - 8)), go(o2) + Ii(e2, i2) + `
` + yo(o2) + Ii(n, i2) + `
`;
        }
        return Bn(o2) + Ii(e2, i2) + `
`;
      }
      function Ol(e2) {
        return Object.prototype.toString.call(e2).replace(/^\[object (.*)\]$/, function(n, o2) {
          return o2;
        });
      }
      function Ha(e2, n) {
        switch (typeof e2) {
          case "string":
            return e2 = JSON.stringify(e2), e2.length > n ? 5 > n ? '"..."' : e2.slice(0, n - 4) + '..."' : e2;
          case "object":
            if (e2 === null) return "null";
            if (fn(e2)) return "[...]";
            if (e2.$$typeof === Ho) return (n = $e(e2.type)) ? "<" + n + ">" : "<...>";
            var o2 = Ol(e2);
            if (o2 === "Object") {
              o2 = "", n -= 2;
              for (var i2 in e2) if (e2.hasOwnProperty(i2)) {
                var s = JSON.stringify(i2);
                if (s !== '"' + i2 + '"' && (i2 = s), n -= i2.length - 2, s = Ha(e2[i2], 15 > n ? n : 15), n -= s.length, 0 > n) {
                  o2 += o2 === "" ? "..." : ", ...";
                  break;
                }
                o2 += (o2 === "" ? "" : ",") + i2 + ":" + s;
              }
              return "{" + o2 + "}";
            }
            return o2;
          case "function":
            return (n = e2.displayName || e2.name) ? "function " + n : "function";
          default:
            return String(e2);
        }
      }
      function Et(e2, n) {
        return typeof e2 != "string" || ty.test(e2) ? "{" + Ha(e2, n - 2) + "}" : e2.length > n - 2 ? 5 > n ? '"..."' : '"' + e2.slice(0, n - 5) + '..."' : '"' + e2 + '"';
      }
      function Nr(e2, n, o2) {
        var i2 = 120 - o2.length - e2.length, s = [], u;
        for (u in n) if (n.hasOwnProperty(u) && u !== "children") {
          var f = Et(n[u], 120 - o2.length - u.length - 1);
          i2 -= u.length + f.length + 2, s.push(u + "=" + f);
        }
        return s.length === 0 ? o2 + "<" + e2 + `>
` : 0 < i2 ? o2 + "<" + e2 + " " + s.join(" ") + `>
` : o2 + "<" + e2 + `
` + o2 + "  " + s.join(`
` + o2 + "  ") + `
` + o2 + `>
`;
      }
      function Ml(e2, n, o2) {
        var i2 = "", s = ze({}, n), u;
        for (u in e2) if (e2.hasOwnProperty(u)) {
          delete s[u];
          var f = 120 - 2 * o2 - u.length - 2, p = Ha(e2[u], f);
          n.hasOwnProperty(u) ? (f = Ha(n[u], f), i2 += go(o2) + u + ": " + p + `
`, i2 += yo(o2) + u + ": " + f + `
`) : i2 += go(o2) + u + ": " + p + `
`;
        }
        for (var g in s) s.hasOwnProperty(g) && (e2 = Ha(s[g], 120 - 2 * o2 - g.length - 2), i2 += yo(o2) + g + ": " + e2 + `
`);
        return i2;
      }
      function jd(e2, n, o2, i2) {
        var s = "", u = /* @__PURE__ */ new Map();
        for (S in o2) o2.hasOwnProperty(S) && u.set(S.toLowerCase(), S);
        if (u.size === 1 && u.has("children")) s += Nr(e2, n, Bn(i2));
        else {
          for (var f in n) if (n.hasOwnProperty(f) && f !== "children") {
            var p = 120 - 2 * (i2 + 1) - f.length - 1, g = u.get(f.toLowerCase());
            if (g !== void 0) {
              u.delete(f.toLowerCase());
              var S = n[f];
              g = o2[g];
              var T = Et(S, p);
              p = Et(g, p), typeof S == "object" && S !== null && typeof g == "object" && g !== null && Ol(S) === "Object" && Ol(g) === "Object" && (2 < Object.keys(S).length || 2 < Object.keys(g).length || -1 < T.indexOf("...") || -1 < p.indexOf("...")) ? s += Bn(i2 + 1) + f + `={{
` + Ml(S, g, i2 + 2) + Bn(i2 + 1) + `}}
` : (s += go(i2 + 1) + f + "=" + T + `
`, s += yo(i2 + 1) + f + "=" + p + `
`);
            } else s += Bn(i2 + 1) + f + "=" + Et(n[f], p) + `
`;
          }
          u.forEach(function(_) {
            if (_ !== "children") {
              var I = 120 - 2 * (i2 + 1) - _.length - 1;
              s += yo(i2 + 1) + _ + "=" + Et(o2[_], I) + `
`;
            }
          }), s = s === "" ? Bn(i2) + "<" + e2 + `>
` : Bn(i2) + "<" + e2 + `
` + s + Bn(i2) + `>
`;
        }
        return e2 = o2.children, n = n.children, typeof e2 == "string" || typeof e2 == "number" || typeof e2 == "bigint" ? (u = "", (typeof n == "string" || typeof n == "number" || typeof n == "bigint") && (u = "" + n), s += Fa(u, "" + e2, i2 + 1)) : (typeof n == "string" || typeof n == "number" || typeof n == "bigint") && (s = e2 == null ? s + Fa("" + n, null, i2 + 1) : s + Fa("" + n, void 0, i2 + 1)), s;
      }
      function Li(e2, n) {
        var o2 = Ko(e2);
        if (o2 === null) {
          for (o2 = "", e2 = e2.child; e2; ) o2 += Li(e2, n), e2 = e2.sibling;
          return o2;
        }
        return Bn(n) + "<" + o2 + `>
`;
      }
      function Aa(e2, n) {
        var o2 = Ad(e2, n);
        if (o2 !== e2 && (e2.children.length !== 1 || e2.children[0] !== o2)) return Bn(n) + `...
` + Aa(o2, n + 1);
        o2 = "";
        var i2 = e2.fiber._debugInfo;
        if (i2) for (var s = 0; s < i2.length; s++) {
          var u = i2[s].name;
          typeof u == "string" && (o2 += Bn(n) + "<" + u + `>
`, n++);
        }
        if (i2 = "", s = e2.fiber.pendingProps, e2.fiber.tag === 6) i2 = Fa(s, e2.serverProps, n), n++;
        else if (u = Ko(e2.fiber), u !== null) if (e2.serverProps === void 0) {
          i2 = n;
          var f = 120 - 2 * i2 - u.length - 2, p = "";
          for (S in s) if (s.hasOwnProperty(S) && S !== "children") {
            var g = Et(s[S], 15);
            if (f -= S.length + g.length + 2, 0 > f) {
              p += " ...";
              break;
            }
            p += " " + S + "=" + g;
          }
          i2 = Bn(i2) + "<" + u + p + `>
`, n++;
        } else e2.serverProps === null ? (i2 = Nr(u, s, go(n)), n++) : typeof e2.serverProps == "string" ? console.error("Should not have matched a non HostText fiber to a Text node. This is a bug in React.") : (i2 = jd(u, s, e2.serverProps, n), n++);
        var S = "";
        for (s = e2.fiber.child, u = 0; s && u < e2.children.length; ) f = e2.children[u], f.fiber === s ? (S += Aa(f, n), u++) : S += Li(s, n), s = s.sibling;
        for (s && 0 < e2.children.length && (S += Bn(n) + `...
`), s = e2.serverTail, e2.serverProps === null && n--, e2 = 0; e2 < s.length; e2++) u = s[e2], S = typeof u == "string" ? S + (yo(n) + Ii(u, 120 - 2 * n) + `
`) : S + Nr(u.type, u.props, yo(n));
        return o2 + i2 + S;
      }
      function Dd(e2) {
        try {
          return `

` + Aa(e2, 0);
        } catch {
          return "";
        }
      }
      function Fp() {
        if (di === null) return "";
        var e2 = di;
        try {
          var n = "";
          switch (e2.tag === 6 && (e2 = e2.return), e2.tag) {
            case 26:
            case 27:
            case 5:
              n += dt(e2.type);
              break;
            case 13:
              n += dt("Suspense");
              break;
            case 19:
              n += dt("SuspenseList");
              break;
            case 31:
              n += dt("Activity");
              break;
            case 30:
            case 0:
            case 15:
            case 1:
              e2._debugOwner || n !== "" || (n += Np(e2.type));
              break;
            case 11:
              e2._debugOwner || n !== "" || (n += Np(e2.type.render));
          }
          for (; e2; ) if (typeof e2.tag == "number") {
            var o2 = e2;
            e2 = o2._debugOwner;
            var i2 = o2._debugStack;
            if (e2 && i2) {
              var s = vu(i2);
              s !== "" && (n += `
` + s);
            }
          } else if (e2.debugStack != null) {
            var u = e2.debugStack;
            (e2 = e2.owner) && u && (n += `
` + vu(u));
          } else break;
          var f = n;
        } catch (p) {
          f = `
Error generating stack: ` + p.message + `
` + p.stack;
        }
        return f;
      }
      function B(e2, n, o2, i2, s, u, f) {
        var p = di;
        Ql(e2);
        try {
          return e2 !== null && e2._debugTask ? e2._debugTask.run(n.bind(null, o2, i2, s, u, f)) : n(o2, i2, s, u, f);
        } finally {
          Ql(p);
        }
        throw Error("runWithFiberInDEV should never be called in production. This is a bug in React.");
      }
      function Ql(e2) {
        x.getCurrentStack = e2 === null ? null : Fp, Pa = false, di = e2;
      }
      function bo(e2, n) {
        if (e2.return === null) {
          if (Tr === null) Tr = {
            fiber: e2,
            children: [],
            serverProps: void 0,
            serverTail: [],
            distanceFromLeaf: n
          };
          else {
            if (Tr.fiber !== e2) throw Error("Saw multiple hydration diff roots in a pass. This is a bug in React.");
            Tr.distanceFromLeaf > n && (Tr.distanceFromLeaf = n);
          }
          return Tr;
        }
        var o2 = bo(e2.return, n + 1).children;
        return 0 < o2.length && o2[o2.length - 1].fiber === e2 ? (o2 = o2[o2.length - 1], o2.distanceFromLeaf > n && (o2.distanceFromLeaf = n), o2) : (n = {
          fiber: e2,
          children: [],
          serverProps: void 0,
          serverTail: [],
          distanceFromLeaf: n
        }, o2.push(n), n);
      }
      function vo() {
        ge && console.error("We should not be hydrating here. This is a bug in React. Please file a bug.");
      }
      function Ni(e2, n) {
        xa || (e2 = bo(e2, 0), e2.serverProps = null, n !== null && (n = ml(n), e2.serverTail.push(n)));
      }
      function Fr(e2) {
        var n = 1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : false, o2 = "", i2 = Tr;
        throw i2 !== null && (Tr = null, o2 = Dd(i2)), Fi(ft(Error("Hydration failed because the server rendered " + (n ? "text" : "HTML") + ` didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch \`if (typeof window !== 'undefined')\`.
- Variable input such as \`Date.now()\` or \`Math.random()\` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch` + o2), e2)), rg;
      }
      function So(e2, n) {
        if (!qn) throw Error("Expected prepareToHydrateHostInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.");
        de(e2.stateNode, e2.type, e2.memoizedProps, n, e2) || Fr(e2, true);
      }
      function ht(e2) {
        for (it = e2.return; it; ) switch (it.tag) {
          case 5:
          case 31:
          case 13:
            oo = false;
            return;
          case 27:
          case 3:
            oo = true;
            return;
          default:
            it = it.return;
        }
      }
      function ko(e2) {
        if (!qn || e2 !== it) return false;
        if (!ge) return ht(e2), ge = true, false;
        var n = e2.tag;
        if (d ? n !== 3 && n !== 27 && (n !== 5 || Yc(e2.type) && !ue(e2.type, e2.memoizedProps)) && Ke && (Ve(e2), Fr(e2)) : n !== 3 && (n !== 5 || Yc(e2.type) && !ue(e2.type, e2.memoizedProps)) && Ke && (Ve(e2), Fr(e2)), ht(e2), n === 13) {
          if (!qn) throw Error("Expected skipPastDehydratedSuspenseInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.");
          if (e2 = e2.memoizedState, e2 = e2 !== null ? e2.dehydrated : null, !e2) throw Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
          Ke = ai(e2);
        } else if (n === 31) {
          if (e2 = e2.memoizedState, e2 = e2 !== null ? e2.dehydrated : null, !e2) throw Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
          Ke = ya(e2);
        } else Ke = d && n === 27 ? Zm(e2.type, Ke) : it ? ga(e2.stateNode) : null;
        return true;
      }
      function Ve(e2) {
        for (var n = Ke; n; ) {
          var o2 = bo(e2, 0), i2 = ml(n);
          o2.serverTail.push(i2), n = i2.type === "Suspense" ? ai(n) : ga(n);
        }
      }
      function wo() {
        qn && (Ke = it = null, xa = ge = false);
      }
      function $l() {
        var e2 = kl;
        return e2 !== null && (Bt === null ? Bt = e2 : Bt.push.apply(Bt, e2), kl = null), e2;
      }
      function Fi(e2) {
        kl === null ? kl = [e2] : kl.push(e2);
      }
      function xu() {
        var e2 = Tr;
        if (e2 !== null) {
          Tr = null;
          for (var n = Dd(e2); 0 < e2.children.length; ) e2 = e2.children[0];
          B(e2.fiber, function() {
            console.error(`A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch \`if (typeof window !== 'undefined')\`.
- Variable input such as \`Date.now()\` or \`Math.random()\` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

%s%s`, "https://react.dev/link/hydration-mismatch", n);
          });
        }
      }
      function zu() {
        ad = Zh = null, id = false;
      }
      function Hr(e2, n, o2) {
        at ? (pe(Gh, n._currentValue, e2), n._currentValue = o2, pe(og, n._currentRenderer, e2), n._currentRenderer !== void 0 && n._currentRenderer !== null && n._currentRenderer !== Jh && console.error("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), n._currentRenderer = Jh) : (pe(Gh, n._currentValue2, e2), n._currentValue2 = o2, pe(ag, n._currentRenderer2, e2), n._currentRenderer2 !== void 0 && n._currentRenderer2 !== null && n._currentRenderer2 !== Jh && console.error("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), n._currentRenderer2 = Jh);
      }
      function lr(e2, n) {
        var o2 = Gh.current;
        at ? (e2._currentValue = o2, o2 = og.current, Ze(og, n), e2._currentRenderer = o2) : (e2._currentValue2 = o2, o2 = ag.current, Ze(ag, n), e2._currentRenderer2 = o2), Ze(Gh, n);
      }
      function Vl(e2, n, o2) {
        for (; e2 !== null; ) {
          var i2 = e2.alternate;
          if ((e2.childLanes & n) !== n ? (e2.childLanes |= n, i2 !== null && (i2.childLanes |= n)) : i2 !== null && (i2.childLanes & n) !== n && (i2.childLanes |= n), e2 === o2) break;
          e2 = e2.return;
        }
        e2 !== o2 && console.error("Expected to find the propagation root when scheduling context work. This error is likely caused by a bug in React. Please file an issue.");
      }
      function Ln(e2, n, o2, i2) {
        var s = e2.child;
        for (s !== null && (s.return = e2); s !== null; ) {
          var u = s.dependencies;
          if (u !== null) {
            var f = s.child;
            u = u.firstContext;
            e: for (; u !== null; ) {
              var p = u;
              u = s;
              for (var g = 0; g < n.length; g++) if (p.context === n[g]) {
                u.lanes |= o2, p = u.alternate, p !== null && (p.lanes |= o2), Vl(u.return, o2, e2), i2 || (f = null);
                break e;
              }
              u = p.next;
            }
          } else if (s.tag === 18) {
            if (f = s.return, f === null) throw Error("We just came from a parent so we must have had a parent. This is a bug in React.");
            f.lanes |= o2, u = f.alternate, u !== null && (u.lanes |= o2), Vl(f, o2, e2), f = null;
          } else f = s.child;
          if (f !== null) f.return = s;
          else for (f = s; f !== null; ) {
            if (f === e2) {
              f = null;
              break;
            }
            if (s = f.sibling, s !== null) {
              s.return = f.return, f = s;
              break;
            }
            f = f.return;
          }
          s = f;
        }
      }
      function He(e2, n, o2, i2) {
        e2 = null;
        for (var s = n, u = false; s !== null; ) {
          if (!u) {
            if ((s.flags & 524288) !== 0) u = true;
            else if ((s.flags & 262144) !== 0) break;
          }
          if (s.tag === 10) {
            var f = s.alternate;
            if (f === null) throw Error("Should have a current fiber. This is a bug in React.");
            if (f = f.memoizedProps, f !== null) {
              var p = s.type;
              jt(s.pendingProps.value, f.value) || (e2 !== null ? e2.push(p) : e2 = [p]);
            }
          } else if (s === qh.current) {
            if (f = s.alternate, f === null) throw Error("Should have a current fiber. This is a bug in React.");
            f.memoizedState.memoizedState !== s.memoizedState.memoizedState && (e2 !== null ? e2.push(Kt) : e2 = [Kt]);
          }
          s = s.return;
        }
        e2 !== null && Ln(n, e2, o2, i2), n.flags |= 262144;
      }
      function ja(e2) {
        for (e2 = e2.firstContext; e2 !== null; ) {
          var n = e2.context;
          if (!jt(at ? n._currentValue : n._currentValue2, e2.memoizedValue)) return true;
          e2 = e2.next;
        }
        return false;
      }
      function sr(e2) {
        Zh = e2, ad = null, e2 = e2.dependencies, e2 !== null && (e2.firstContext = null);
      }
      function Ee(e2) {
        return id && console.error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo()."), Ar(Zh, e2);
      }
      function Hi(e2, n) {
        return Zh === null && sr(e2), Ar(e2, n);
      }
      function Ar(e2, n) {
        var o2 = at ? n._currentValue : n._currentValue2;
        if (n = {
          context: n,
          memoizedValue: o2,
          next: null
        }, ad === null) {
          if (e2 === null) throw Error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
          ad = n, e2.dependencies = {
            lanes: 0,
            firstContext: n,
            _debugThenableState: null
          }, e2.flags |= 524288;
        } else ad = ad.next = n;
        return o2;
      }
      function Ai() {
        return {
          controller: new jb(),
          data: /* @__PURE__ */ new Map(),
          refCount: 0
        };
      }
      function Po(e2) {
        e2.controller.signal.aborted && console.warn("A cache instance was retained after it was already freed. This likely indicates a bug in React."), e2.refCount++;
      }
      function Da(e2) {
        e2.refCount--, 0 > e2.refCount && console.warn("A cache instance was released after it was already freed. This likely indicates a bug in React."), e2.refCount === 0 && Db(Wb, function() {
          e2.controller.abort();
        });
      }
      function ur(e2, n, o2) {
        (e2 & 127) !== 0 ? 0 > za && (za = xn(), ep = Yh(n), ig = n, o2 != null && (lg = G(o2)), Ns() && (cn = true, Pl = 1), e2 = Pr(), n = ti(), e2 !== ld || n !== np ? ld = -1.1 : n !== null && (Pl = 1), Ys = e2, np = n) : (e2 & 4194048) !== 0 && 0 > ao && (ao = xn(), tp = Yh(n), ry = n, o2 != null && (oy = G(o2)), 0 > mi) && (e2 = Pr(), n = ti(), (e2 !== zl || n !== Xs) && (zl = -1.1), xl = e2, Xs = n);
      }
      function Hp(e2) {
        if (0 > za) {
          za = xn(), ep = e2._debugTask != null ? e2._debugTask : null, Ns() && (Pl = 1);
          var n = Pr(), o2 = ti();
          n !== ld || o2 !== np ? ld = -1.1 : o2 !== null && (Pl = 1), Ys = n, np = o2;
        }
        0 > ao && (ao = xn(), tp = e2._debugTask != null ? e2._debugTask : null, 0 > mi) && (e2 = Pr(), n = ti(), (e2 !== zl || n !== Xs) && (zl = -1.1), xl = e2, Xs = n);
      }
      function jr() {
        var e2 = Js;
        return Js = 0, e2;
      }
      function ql(e2) {
        var n = Js;
        return Js = e2, n;
      }
      function ji(e2) {
        var n = Js;
        return Js += e2, n;
      }
      function Gl() {
        q = $ = -1.1;
      }
      function Xn() {
        var e2 = $;
        return $ = -1.1, e2;
      }
      function mt(e2) {
        0 <= e2 && ($ = e2);
      }
      function Dr() {
        var e2 = en;
        return en = -0, e2;
      }
      function cr(e2) {
        0 <= e2 && (en = e2);
      }
      function dr() {
        var e2 = Je;
        return Je = null, e2;
      }
      function fr() {
        var e2 = cn;
        return cn = false, e2;
      }
      function Jl(e2) {
        Dt = xn(), 0 > e2.actualStartTime && (e2.actualStartTime = Dt);
      }
      function Cu(e2) {
        if (0 <= Dt) {
          var n = xn() - Dt;
          e2.actualDuration += n, e2.selfBaseDuration = n, Dt = -1;
        }
      }
      function Wd(e2) {
        if (0 <= Dt) {
          var n = xn() - Dt;
          e2.actualDuration += n, Dt = -1;
        }
      }
      function pr() {
        if (0 <= Dt) {
          var e2 = xn(), n = e2 - Dt;
          Dt = -1, Js += n, en += n, q = e2;
        }
      }
      function Ud(e2) {
        Je === null && (Je = []), Je.push(e2), pi === null && (pi = []), pi.push(e2);
      }
      function hr() {
        Dt = xn(), 0 > $ && ($ = Dt);
      }
      function Zl(e2) {
        for (var n = e2.child; n; ) e2.actualDuration += n.actualDuration, n = n.sibling;
      }
      function Yl() {
      }
      function Kn(e2) {
        e2 !== ud && e2.next === null && (ud === null ? tm = ud = e2 : ud = ud.next = e2), rm = true, x.actQueue !== null ? cg || (cg = true, Od()) : ug || (ug = true, Od());
      }
      function Wa(e2, n) {
        if (!dg && rm) {
          dg = true;
          do
            for (var o2 = false, i2 = tm; i2 !== null; ) {
              if (!n) if (e2 !== 0) {
                var s = i2.pendingLanes;
                if (s === 0) var u = 0;
                else {
                  var f = i2.suspendedLanes, p = i2.pingedLanes;
                  u = (1 << 31 - vn(42 | e2) + 1) - 1, u &= s & ~(f & ~p), u = u & 201326741 ? u & 201326741 | 1 : u ? u | 2 : 0;
                }
                u !== 0 && (o2 = true, Ap(i2, u));
              } else u = ae, u = zi(i2, i2 === je ? u : 0, i2.cancelPendingCommit !== null || i2.timeoutHandle !== Yr), (u & 3) === 0 || Hl(i2, u) || (o2 = true, Ap(i2, u));
              i2 = i2.next;
            }
          while (o2);
          dg = false;
        }
      }
      function Xl() {
        ll(), Di();
      }
      function Di() {
        rm = cg = ug = false;
        var e2 = 0;
        Ks !== 0 && Us() && (e2 = Ks);
        for (var n = me(), o2 = null, i2 = tm; i2 !== null; ) {
          var s = i2.next, u = Bd(i2, n);
          u === 0 ? (i2.next = null, o2 === null ? tm = s : o2.next = s, s === null && (ud = o2)) : (o2 = i2, (e2 !== 0 || (u & 3) !== 0) && (rm = true)), i2 = s;
        }
        Rn !== Ll && Rn !== Cm || Wa(e2, false), Ks !== 0 && (Ks = 0);
      }
      function Bd(e2, n) {
        for (var o2 = e2.suspendedLanes, i2 = e2.pingedLanes, s = e2.expirationTimes, u = e2.pendingLanes & -62914561; 0 < u; ) {
          var f = 31 - vn(u), p = 1 << f, g = s[f];
          g === -1 ? ((p & o2) === 0 || (p & i2) !== 0) && (s[f] = Rp(p, n)) : g <= n && (e2.expiredLanes |= p), u &= ~p;
        }
        if (n = je, o2 = ae, o2 = zi(e2, e2 === n ? o2 : 0, e2.cancelPendingCommit !== null || e2.timeoutHandle !== Yr), i2 = e2.callbackNode, o2 === 0 || e2 === n && (Le === lu || Le === su) || e2.cancelPendingCommit !== null) return i2 !== null && _u(i2), e2.callbackNode = null, e2.callbackPriority = 0;
        if ((o2 & 3) === 0 || Hl(e2, o2)) {
          if (n = o2 & -o2, n !== e2.callbackPriority || x.actQueue !== null && i2 !== fg) _u(i2);
          else return n;
          switch (ar(o2)) {
            case 2:
            case 8:
              o2 = Oo;
              break;
            case 32:
              o2 = qs;
              break;
            case 268435456:
              o2 = Qg;
              break;
            default:
              o2 = qs;
          }
          return i2 = Tu.bind(null, e2), x.actQueue !== null ? (x.actQueue.push(i2), o2 = fg) : o2 = Q(o2, i2), e2.callbackPriority = n, e2.callbackNode = o2, n;
        }
        return i2 !== null && _u(i2), e2.callbackPriority = 2, e2.callbackNode = null, 2;
      }
      function Tu(e2, n) {
        if (nm = em = false, ll(), Rn !== Ll && Rn !== Cm) return e2.callbackNode = null, e2.callbackPriority = 0, null;
        var o2 = e2.callbackNode;
        if (Go === zm && (Go = Ag), el() && e2.callbackNode !== o2) return null;
        var i2 = ae;
        return i2 = zi(e2, e2 === je ? i2 : 0, e2.cancelPendingCommit !== null || e2.timeoutHandle !== Yr), i2 === 0 ? null : (Lf(e2, i2, n), Bd(e2, me()), e2.callbackNode != null && e2.callbackNode === o2 ? Tu.bind(null, e2) : null);
      }
      function Ap(e2, n) {
        if (el()) return null;
        em = nm, nm = false, Lf(e2, n, true);
      }
      function _u(e2) {
        e2 !== fg && e2 !== null && Ge(e2);
      }
      function Od() {
        x.actQueue !== null && x.actQueue.push(function() {
          return Di(), null;
        }), Oh ? er(function() {
          (ye & (Zn | uo)) !== Jn ? Q(be, Xl) : Di();
        }) : Q(be, Xl);
      }
      function Ru() {
        if (Ks === 0) {
          var e2 = eu;
          e2 === 0 && (e2 = w, w <<= 1, (w & 261888) === 0 && (w = 256)), Ks = e2;
        }
        return Ks;
      }
      function jp(e2, n) {
        if (op === null) {
          var o2 = op = [];
          pg = 0, eu = Ru(), cd = {
            status: "pending",
            value: void 0,
            then: function(i2) {
              o2.push(i2);
            }
          };
        }
        return pg++, n.then(Md, Md), n;
      }
      function Md() {
        if (--pg === 0 && (-1 < ao || (mi = -1.1), op !== null)) {
          cd !== null && (cd.status = "fulfilled");
          var e2 = op;
          op = null, eu = 0, cd = null;
          for (var n = 0; n < e2.length; n++) (0, e2[n])();
        }
      }
      function Qd(e2, n) {
        var o2 = [], i2 = {
          status: "pending",
          value: null,
          reason: null,
          then: function(s) {
            o2.push(s);
          }
        };
        return e2.then(function() {
          i2.status = "fulfilled", i2.value = n;
          for (var s = 0; s < o2.length; s++) (0, o2[s])(n);
        }, function(s) {
          for (i2.status = "rejected", i2.reason = s, s = 0; s < o2.length; s++) (0, o2[s])(void 0);
        }), i2;
      }
      function Eu() {
        var e2 = nu.current;
        return e2 !== null ? e2 : je.pooledCache;
      }
      function Kl(e2, n) {
        n === null ? pe(nu, nu.current, e2) : pe(nu, n.pool, e2);
      }
      function Iu() {
        var e2 = Eu();
        return e2 === null ? null : {
          parent: at ? un._currentValue : un._currentValue2,
          pool: e2
        };
      }
      function es(e2, n) {
        if (jt(e2, n)) return true;
        if (typeof e2 != "object" || e2 === null || typeof n != "object" || n === null) return false;
        var o2 = Object.keys(e2), i2 = Object.keys(n);
        if (o2.length !== i2.length) return false;
        for (i2 = 0; i2 < o2.length; i2++) {
          var s = o2[i2];
          if (!Xm.call(n, s) || !jt(e2[s], n[s])) return false;
        }
        return true;
      }
      function $d() {
        return {
          didWarnAboutUncachedPromise: false,
          thenables: []
        };
      }
      function Vd(e2) {
        return e2 = e2.status, e2 === "fulfilled" || e2 === "rejected";
      }
      function Lu(e2, n, o2) {
        x.actQueue !== null && (x.didUsePromise = true);
        var i2 = e2.thenables;
        if (o2 = i2[o2], o2 === void 0 ? i2.push(n) : o2 !== n && (e2.didWarnAboutUncachedPromise || (e2.didWarnAboutUncachedPromise = true, console.error("A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework.")), n.then(Yl, Yl), n = o2), n._debugInfo === void 0) {
          e2 = performance.now(), i2 = n.displayName;
          var s = {
            name: typeof i2 == "string" ? i2 : "Promise",
            start: e2,
            end: e2,
            value: n
          };
          n._debugInfo = [{
            awaited: s
          }], n.status !== "fulfilled" && n.status !== "rejected" && (e2 = function() {
            s.end = performance.now();
          }, n.then(e2, e2));
        }
        switch (n.status) {
          case "fulfilled":
            return n.value;
          case "rejected":
            throw e2 = n.reason, Dp(e2), e2;
          default:
            if (typeof n.status == "string") n.then(Yl, Yl);
            else {
              if (e2 = je, e2 !== null && 100 < e2.shellSuspendCounter) throw Error("An unknown Component is an async Client Component. Only Server Components can be async at the moment. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.");
              e2 = n, e2.status = "pending", e2.then(function(u) {
                if (n.status === "pending") {
                  var f = n;
                  f.status = "fulfilled", f.value = u;
                }
              }, function(u) {
                if (n.status === "pending") {
                  var f = n;
                  f.status = "rejected", f.reason = u;
                }
              });
            }
            switch (n.status) {
              case "fulfilled":
                return n.value;
              case "rejected":
                throw e2 = n.reason, Dp(e2), e2;
            }
            throw ru = n, dp = true, dd;
        }
      }
      function xo(e2) {
        try {
          return Mb(e2);
        } catch (n) {
          throw n !== null && typeof n == "object" && typeof n.then == "function" ? (ru = n, dp = true, dd) : n;
        }
      }
      function qd() {
        if (ru === null) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
        var e2 = ru;
        return ru = null, dp = false, e2;
      }
      function Dp(e2) {
        if (e2 === dd || e2 === am) throw Error("Hooks are not supported inside an async component. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.");
      }
      function Nn(e2) {
        var n = oe;
        return e2 != null && (oe = n === null ? e2 : n.concat(e2)), n;
      }
      function Nu() {
        var e2 = oe;
        if (e2 != null) {
          for (var n = e2.length - 1; 0 <= n; n--) if (e2[n].name != null) {
            var o2 = e2[n].debugTask;
            if (o2 != null) return o2;
          }
        }
        return null;
      }
      function ea(e2, n, o2) {
        for (var i2 = Object.keys(e2.props), s = 0; s < i2.length; s++) {
          var u = i2[s];
          if (u !== "children" && u !== "key") {
            n === null && (n = Rc(e2, o2.mode, 0), n._debugInfo = oe, n.return = o2), B(n, function(f) {
              console.error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", f);
            }, u);
            break;
          }
        }
      }
      function Wi(e2) {
        var n = fp;
        return fp += 1, fd === null && (fd = $d()), Lu(fd, e2, n);
      }
      function na(e2, n) {
        n = n.props.ref, e2.ref = n !== void 0 ? n : null;
      }
      function Gd(e2, n) {
        throw n.$$typeof === Uh ? Error(`A React Element from an older version of React was rendered. This is not supported. It can happen if:
- Multiple copies of the "react" package is used.
- A library pre-bundled an old copy of "react" or "react/jsx-runtime".
- A compiler tries to "inline" JSX instead of using the runtime.`) : (e2 = Object.prototype.toString.call(n), Error("Objects are not valid as a React child (found: " + (e2 === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : e2) + "). If you meant to render a collection of children, use an array instead."));
      }
      function ns(e2, n) {
        var o2 = Nu();
        o2 !== null ? o2.run(Gd.bind(null, e2, n)) : Gd(e2, n);
      }
      function Fu(e2, n) {
        var o2 = G(e2) || "Component";
        wy[o2] || (wy[o2] = true, n = n.displayName || n.name || "Component", e2.tag === 3 ? console.error(`Functions are not valid as a React child. This may happen if you return %s instead of <%s /> from render. Or maybe you meant to call this function rather than return it.
  root.render(%s)`, n, n, n) : console.error(`Functions are not valid as a React child. This may happen if you return %s instead of <%s /> from render. Or maybe you meant to call this function rather than return it.
  <%s>{%s}</%s>`, n, n, o2, n, o2));
      }
      function ts(e2, n) {
        var o2 = Nu();
        o2 !== null ? o2.run(Fu.bind(null, e2, n)) : Fu(e2, n);
      }
      function Jd(e2, n) {
        var o2 = G(e2) || "Component";
        Py[o2] || (Py[o2] = true, n = String(n), e2.tag === 3 ? console.error(`Symbols are not valid as a React child.
  root.render(%s)`, n) : console.error(`Symbols are not valid as a React child.
  <%s>%s</%s>`, o2, n, o2));
      }
      function Wr(e2, n) {
        var o2 = Nu();
        o2 !== null ? o2.run(Jd.bind(null, e2, n)) : Jd(e2, n);
      }
      function rs(e2) {
        function n(b, v) {
          if (e2) {
            var k = b.deletions;
            k === null ? (b.deletions = [v], b.flags |= 16) : k.push(v);
          }
        }
        function o2(b, v) {
          if (!e2) return null;
          for (; v !== null; ) n(b, v), v = v.sibling;
          return null;
        }
        function i2(b) {
          for (var v = /* @__PURE__ */ new Map(); b !== null; ) b.key !== null ? v.set(b.key, b) : v.set(b.index, b), b = b.sibling;
          return v;
        }
        function s(b, v) {
          return b = Fo(b, v), b.index = 0, b.sibling = null, b;
        }
        function u(b, v, k) {
          return b.index = k, e2 ? (k = b.alternate, k !== null ? (k = k.index, k < v ? (b.flags |= 67108866, v) : k) : (b.flags |= 67108866, v)) : (b.flags |= 1048576, v);
        }
        function f(b) {
          return e2 && b.alternate === null && (b.flags |= 67108866), b;
        }
        function p(b, v, k, E) {
          return v === null || v.tag !== 6 ? (v = Ec(k, b.mode, E), v.return = b, v._debugOwner = b, v._debugTask = b._debugTask, v._debugInfo = oe, v) : (v = s(v, k), v.return = b, v._debugInfo = oe, v);
        }
        function g(b, v, k, E) {
          var U = k.type;
          return U === ol ? (v = T(b, v, k.props.children, E, k.key), ea(k, v, b), v) : v !== null && (v.elementType === U || Wf(v, k) || typeof U == "object" && U !== null && U.$$typeof === kt && xo(U) === v.type) ? (v = s(v, k.props), na(v, k), v.return = b, v._debugOwner = k._owner, v._debugInfo = oe, v) : (v = Rc(k, b.mode, E), na(v, k), v.return = b, v._debugInfo = oe, v);
        }
        function S(b, v, k, E) {
          return v === null || v.tag !== 4 || v.stateNode.containerInfo !== k.containerInfo || v.stateNode.implementation !== k.implementation ? (v = Hs(k, b.mode, E), v.return = b, v._debugInfo = oe, v) : (v = s(v, k.children || []), v.return = b, v._debugInfo = oe, v);
        }
        function T(b, v, k, E, U) {
          return v === null || v.tag !== 7 ? (v = fa(k, b.mode, E, U), v.return = b, v._debugOwner = b, v._debugTask = b._debugTask, v._debugInfo = oe, v) : (v = s(v, k), v.return = b, v._debugInfo = oe, v);
        }
        function _(b, v, k) {
          if (typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint") return v = Ec("" + v, b.mode, k), v.return = b, v._debugOwner = b, v._debugTask = b._debugTask, v._debugInfo = oe, v;
          if (typeof v == "object" && v !== null) {
            switch (v.$$typeof) {
              case Ho:
                return k = Rc(v, b.mode, k), na(k, v), k.return = b, b = Nn(v._debugInfo), k._debugInfo = oe, oe = b, k;
              case Ao:
                return v = Hs(v, b.mode, k), v.return = b, v._debugInfo = oe, v;
              case kt:
                var E = Nn(v._debugInfo);
                return v = xo(v), b = _(b, v, k), oe = E, b;
            }
            if (fn(v) || Yo(v)) return k = fa(v, b.mode, k, null), k.return = b, k._debugOwner = b, k._debugTask = b._debugTask, b = Nn(v._debugInfo), k._debugInfo = oe, oe = b, k;
            if (typeof v.then == "function") return E = Nn(v._debugInfo), b = _(b, Wi(v), k), oe = E, b;
            if (v.$$typeof === on) return _(b, Hi(b, v), k);
            ns(b, v);
          }
          return typeof v == "function" && ts(b, v), typeof v == "symbol" && Wr(b, v), null;
        }
        function I(b, v, k, E) {
          var U = v !== null ? v.key : null;
          if (typeof k == "string" && k !== "" || typeof k == "number" || typeof k == "bigint") return U !== null ? null : p(b, v, "" + k, E);
          if (typeof k == "object" && k !== null) {
            switch (k.$$typeof) {
              case Ho:
                return k.key === U ? (U = Nn(k._debugInfo), b = g(b, v, k, E), oe = U, b) : null;
              case Ao:
                return k.key === U ? S(b, v, k, E) : null;
              case kt:
                return U = Nn(k._debugInfo), k = xo(k), b = I(b, v, k, E), oe = U, b;
            }
            if (fn(k) || Yo(k)) return U !== null ? null : (U = Nn(k._debugInfo), b = T(b, v, k, E, null), oe = U, b);
            if (typeof k.then == "function") return U = Nn(k._debugInfo), b = I(b, v, Wi(k), E), oe = U, b;
            if (k.$$typeof === on) return I(b, v, Hi(b, k), E);
            ns(b, k);
          }
          return typeof k == "function" && ts(b, k), typeof k == "symbol" && Wr(b, k), null;
        }
        function O(b, v, k, E, U) {
          if (typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint") return b = b.get(k) || null, p(v, b, "" + E, U);
          if (typeof E == "object" && E !== null) {
            switch (E.$$typeof) {
              case Ho:
                return k = b.get(E.key === null ? k : E.key) || null, b = Nn(E._debugInfo), v = g(v, k, E, U), oe = b, v;
              case Ao:
                return b = b.get(E.key === null ? k : E.key) || null, S(v, b, E, U);
              case kt:
                var ke = Nn(E._debugInfo);
                return E = xo(E), v = O(b, v, k, E, U), oe = ke, v;
            }
            if (fn(E) || Yo(E)) return k = b.get(k) || null, b = Nn(E._debugInfo), v = T(v, k, E, U, null), oe = b, v;
            if (typeof E.then == "function") return ke = Nn(E._debugInfo), v = O(b, v, k, Wi(E), U), oe = ke, v;
            if (E.$$typeof === on) return O(b, v, k, Hi(v, E), U);
            ns(v, E);
          }
          return typeof E == "function" && ts(v, E), typeof E == "symbol" && Wr(v, E), null;
        }
        function K(b, v, k, E) {
          if (typeof k != "object" || k === null) return E;
          switch (k.$$typeof) {
            case Ho:
            case Ao:
              Zo(b, v, k);
              var U = k.key;
              if (typeof U != "string") break;
              if (E === null) {
                E = /* @__PURE__ */ new Set(), E.add(U);
                break;
              }
              if (!E.has(U)) {
                E.add(U);
                break;
              }
              B(v, function() {
                console.error("Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted \u2014 the behavior is unsupported and could change in a future version.", U);
              });
              break;
            case kt:
              k = xo(k), K(b, v, k, E);
          }
          return E;
        }
        function Fe(b, v, k, E) {
          for (var U = null, ke = null, X = null, te = v, re = v = 0, Qe = null; te !== null && re < k.length; re++) {
            te.index > re ? (Qe = te, te = null) : Qe = te.sibling;
            var kn = I(b, te, k[re], E);
            if (kn === null) {
              te === null && (te = Qe);
              break;
            }
            U = K(b, kn, k[re], U), e2 && te && kn.alternate === null && n(b, te), v = u(kn, v, re), X === null ? ke = kn : X.sibling = kn, X = kn, te = Qe;
          }
          if (re === k.length) return o2(b, te), ge && ho(b, re), ke;
          if (te === null) {
            for (; re < k.length; re++) te = _(b, k[re], E), te !== null && (U = K(b, te, k[re], U), v = u(te, v, re), X === null ? ke = te : X.sibling = te, X = te);
            return ge && ho(b, re), ke;
          }
          for (te = i2(te); re < k.length; re++) Qe = O(te, b, re, k[re], E), Qe !== null && (U = K(b, Qe, k[re], U), e2 && Qe.alternate !== null && te.delete(Qe.key === null ? re : Qe.key), v = u(Qe, v, re), X === null ? ke = Qe : X.sibling = Qe, X = Qe);
          return e2 && te.forEach(function(wi) {
            return n(b, wi);
          }), ge && ho(b, re), ke;
        }
        function Td(b, v, k, E) {
          if (k == null) throw Error("An iterable object provided no iterator.");
          for (var U = null, ke = null, X = v, te = v = 0, re = null, Qe = null, kn = k.next(); X !== null && !kn.done; te++, kn = k.next()) {
            X.index > te ? (re = X, X = null) : re = X.sibling;
            var wi = I(b, X, kn.value, E);
            if (wi === null) {
              X === null && (X = re);
              break;
            }
            Qe = K(b, wi, kn.value, Qe), e2 && X && wi.alternate === null && n(b, X), v = u(wi, v, te), ke === null ? U = wi : ke.sibling = wi, ke = wi, X = re;
          }
          if (kn.done) return o2(b, X), ge && ho(b, te), U;
          if (X === null) {
            for (; !kn.done; te++, kn = k.next()) X = _(b, kn.value, E), X !== null && (Qe = K(b, X, kn.value, Qe), v = u(X, v, te), ke === null ? U = X : ke.sibling = X, ke = X);
            return ge && ho(b, te), U;
          }
          for (X = i2(X); !kn.done; te++, kn = k.next()) re = O(X, b, te, kn.value, E), re !== null && (Qe = K(b, re, kn.value, Qe), e2 && re.alternate !== null && X.delete(re.key === null ? te : re.key), v = u(re, v, te), ke === null ? U = re : ke.sibling = re, ke = re);
          return e2 && X.forEach(function(Yb) {
            return n(b, Yb);
          }), ge && ho(b, te), U;
        }
        function Jo(b, v, k, E) {
          if (typeof k == "object" && k !== null && k.type === ol && k.key === null && (ea(k, null, b), k = k.props.children), typeof k == "object" && k !== null) {
            switch (k.$$typeof) {
              case Ho:
                var U = Nn(k._debugInfo);
                e: {
                  for (var ke = k.key; v !== null; ) {
                    if (v.key === ke) {
                      if (ke = k.type, ke === ol) {
                        if (v.tag === 7) {
                          o2(b, v.sibling), E = s(v, k.props.children), E.return = b, E._debugOwner = k._owner, E._debugInfo = oe, ea(k, E, b), b = E;
                          break e;
                        }
                      } else if (v.elementType === ke || Wf(v, k) || typeof ke == "object" && ke !== null && ke.$$typeof === kt && xo(ke) === v.type) {
                        o2(b, v.sibling), E = s(v, k.props), na(E, k), E.return = b, E._debugOwner = k._owner, E._debugInfo = oe, b = E;
                        break e;
                      }
                      o2(b, v);
                      break;
                    } else n(b, v);
                    v = v.sibling;
                  }
                  k.type === ol ? (E = fa(k.props.children, b.mode, E, k.key), E.return = b, E._debugOwner = b, E._debugTask = b._debugTask, E._debugInfo = oe, ea(k, E, b), b = E) : (E = Rc(k, b.mode, E), na(E, k), E.return = b, E._debugInfo = oe, b = E);
                }
                return b = f(b), oe = U, b;
              case Ao:
                e: {
                  for (U = k, k = U.key; v !== null; ) {
                    if (v.key === k) {
                      if (v.tag === 4 && v.stateNode.containerInfo === U.containerInfo && v.stateNode.implementation === U.implementation) {
                        o2(b, v.sibling), E = s(v, U.children || []), E.return = b, b = E;
                        break e;
                      } else {
                        o2(b, v);
                        break;
                      }
                    } else n(b, v);
                    v = v.sibling;
                  }
                  E = Hs(U, b.mode, E), E.return = b, b = E;
                }
                return f(b);
              case kt:
                return U = Nn(k._debugInfo), k = xo(k), b = Jo(b, v, k, E), oe = U, b;
            }
            if (fn(k)) return U = Nn(k._debugInfo), b = Fe(b, v, k, E), oe = U, b;
            if (Yo(k)) {
              if (U = Nn(k._debugInfo), ke = Yo(k), typeof ke != "function") throw Error("An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.");
              var X = ke.call(k);
              return X === k ? (b.tag !== 0 || Object.prototype.toString.call(b.type) !== "[object GeneratorFunction]" || Object.prototype.toString.call(X) !== "[object Generator]") && (Sy || console.error("Using Iterators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. You can also use an Iterable that can iterate multiple times over the same items."), Sy = true) : k.entries !== ke || yg || (console.error("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), yg = true), b = Td(b, v, X, E), oe = U, b;
            }
            if (typeof k.then == "function") return U = Nn(k._debugInfo), b = Jo(b, v, Wi(k), E), oe = U, b;
            if (k.$$typeof === on) return Jo(b, v, Hi(b, k), E);
            ns(b, k);
          }
          return typeof k == "string" && k !== "" || typeof k == "number" || typeof k == "bigint" ? (U = "" + k, v !== null && v.tag === 6 ? (o2(b, v.sibling), E = s(v, U), E.return = b, b = E) : (o2(b, v), E = Ec(U, b.mode, E), E.return = b, E._debugOwner = b, E._debugTask = b._debugTask, E._debugInfo = oe, b = E), f(b)) : (typeof k == "function" && ts(b, k), typeof k == "symbol" && Wr(b, k), o2(b, v));
        }
        return function(b, v, k, E) {
          var U = oe;
          oe = null;
          try {
            fp = 0;
            var ke = Jo(b, v, k, E);
            return fd = null, ke;
          } catch (Qe) {
            if (Qe === dd || Qe === am) throw Qe;
            var X = lt(29, Qe, null, b.mode);
            X.lanes = E, X.return = b;
            var te = X._debugInfo = oe;
            if (X._debugOwner = b._debugOwner, X._debugTask = b._debugTask, te != null) {
              for (var re = te.length - 1; 0 <= re; re--) if (typeof te[re].stack == "string") {
                X._debugOwner = te[re], X._debugTask = te[re].debugTask;
                break;
              }
            }
            return X;
          } finally {
            oe = U;
          }
        };
      }
      function Zd(e2, n) {
        var o2 = fn(e2);
        return e2 = !o2 && typeof Yo(e2) == "function", o2 || e2 ? (o2 = o2 ? "array" : "iterable", console.error("A nested %s was passed to row #%s in <SuspenseList />. Wrap it in an additional SuspenseList to configure its revealOrder: <SuspenseList revealOrder=...> ... <SuspenseList revealOrder=...>{%s}</SuspenseList> ... </SuspenseList>", o2, n, o2), false) : true;
      }
      function Ui() {
        for (var e2 = pd, n = bg = pd = 0; n < e2; ) {
          var o2 = io[n];
          io[n++] = null;
          var i2 = io[n];
          io[n++] = null;
          var s = io[n];
          io[n++] = null;
          var u = io[n];
          if (io[n++] = null, i2 !== null && s !== null) {
            var f = i2.pending;
            f === null ? s.next = s : (s.next = f.next, f.next = s), i2.pending = s;
          }
          u !== 0 && wn(o2, s, u);
        }
      }
      function os(e2, n, o2, i2) {
        io[pd++] = e2, io[pd++] = n, io[pd++] = o2, io[pd++] = i2, bg |= i2, e2.lanes |= i2, e2 = e2.alternate, e2 !== null && (e2.lanes |= i2);
      }
      function Hu(e2, n, o2, i2) {
        return os(e2, n, o2, i2), as(e2);
      }
      function On(e2, n) {
        return os(e2, null, null, n), as(e2);
      }
      function wn(e2, n, o2) {
        e2.lanes |= o2;
        var i2 = e2.alternate;
        i2 !== null && (i2.lanes |= o2);
        for (var s = false, u = e2.return; u !== null; ) u.childLanes |= o2, i2 = u.alternate, i2 !== null && (i2.childLanes |= o2), u.tag === 22 && (e2 = u.stateNode, e2 === null || e2._visibility & pp || (s = true)), e2 = u, u = u.return;
        return e2.tag === 3 ? (u = e2.stateNode, s && n !== null && (s = 31 - vn(o2), e2 = u.hiddenUpdates, i2 = e2[s], i2 === null ? e2[s] = [n] : i2.push(n), n.lane = o2 | 536870912), u) : null;
      }
      function as(e2) {
        if (zp > Gb) throw cu = zp = 0, Cp = Ug = null, Error("Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.");
        cu > Jb && (cu = 0, Cp = null, console.error("Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.")), e2.alternate === null && (e2.flags & 4098) !== 0 && zc(e2);
        for (var n = e2, o2 = n.return; o2 !== null; ) n.alternate === null && (n.flags & 4098) !== 0 && zc(e2), n = o2, o2 = n.return;
        return n.tag === 3 ? n.stateNode : null;
      }
      function Au(e2) {
        e2.updateQueue = {
          baseState: e2.memoizedState,
          firstBaseUpdate: null,
          lastBaseUpdate: null,
          shared: {
            pending: null,
            lanes: 0,
            hiddenCallbacks: null
          },
          callbacks: null
        };
      }
      function ju(e2, n) {
        e2 = e2.updateQueue, n.updateQueue === e2 && (n.updateQueue = {
          baseState: e2.baseState,
          firstBaseUpdate: e2.firstBaseUpdate,
          lastBaseUpdate: e2.lastBaseUpdate,
          shared: e2.shared,
          callbacks: null
        });
      }
      function zo(e2) {
        return {
          lane: e2,
          tag: zy,
          payload: null,
          callback: null,
          next: null
        };
      }
      function Mt(e2, n, o2) {
        var i2 = e2.updateQueue;
        if (i2 === null) return null;
        if (i2 = i2.shared, Sg === i2 && !_y) {
          var s = G(e2);
          console.error(`An update (setState, replaceState, or forceUpdate) was scheduled from inside an update function. Update functions should be pure, with zero side-effects. Consider using componentDidUpdate or a callback.

Please update the following component: %s`, s), _y = true;
        }
        return (ye & Zn) !== Jn ? (s = i2.pending, s === null ? n.next = n : (n.next = s.next, s.next = n), i2.pending = n, n = as(e2), wn(e2, null, o2), n) : (os(e2, i2, n, o2), as(e2));
      }
      function Bi(e2, n, o2) {
        if (n = n.updateQueue, n !== null && (n = n.shared, (o2 & 4194048) !== 0)) {
          var i2 = n.lanes;
          i2 &= e2.pendingLanes, o2 |= i2, n.lanes = o2, Ld(e2, o2);
        }
      }
      function Ua(e2, n) {
        var o2 = e2.updateQueue, i2 = e2.alternate;
        if (i2 !== null && (i2 = i2.updateQueue, o2 === i2)) {
          var s = null, u = null;
          if (o2 = o2.firstBaseUpdate, o2 !== null) {
            do {
              var f = {
                lane: o2.lane,
                tag: o2.tag,
                payload: o2.payload,
                callback: null,
                next: null
              };
              u === null ? s = u = f : u = u.next = f, o2 = o2.next;
            } while (o2 !== null);
            u === null ? s = u = n : u = u.next = n;
          } else s = u = n;
          o2 = {
            baseState: i2.baseState,
            firstBaseUpdate: s,
            lastBaseUpdate: u,
            shared: i2.shared,
            callbacks: i2.callbacks
          }, e2.updateQueue = o2;
          return;
        }
        e2 = o2.lastBaseUpdate, e2 === null ? o2.firstBaseUpdate = n : e2.next = n, o2.lastBaseUpdate = n;
      }
      function Oi() {
        if (kg) {
          var e2 = cd;
          if (e2 !== null) throw e2;
        }
      }
      function is2(e2, n, o2, i2) {
        kg = false;
        var s = e2.updateQueue;
        Cl = false, Sg = s.shared;
        var u = s.firstBaseUpdate, f = s.lastBaseUpdate, p = s.shared.pending;
        if (p !== null) {
          s.shared.pending = null;
          var g = p, S = g.next;
          g.next = null, f === null ? u = S : f.next = S, f = g;
          var T = e2.alternate;
          T !== null && (T = T.updateQueue, p = T.lastBaseUpdate, p !== f && (p === null ? T.firstBaseUpdate = S : p.next = S, T.lastBaseUpdate = g));
        }
        if (u !== null) {
          var _ = s.baseState;
          f = 0, T = S = g = null, p = u;
          do {
            var I = p.lane & -536870913, O = I !== p.lane;
            if (O ? (ae & I) === I : (i2 & I) === I) {
              I !== 0 && I === eu && (kg = true), T !== null && (T = T.next = {
                lane: 0,
                tag: p.tag,
                payload: p.payload,
                callback: null,
                next: null
              });
              e: {
                I = e2;
                var K = p, Fe = n, Td = o2;
                switch (K.tag) {
                  case Cy:
                    if (K = K.payload, typeof K == "function") {
                      id = true;
                      var Jo = K.call(Td, _, Fe);
                      if (I.mode & 8) {
                        De(true);
                        try {
                          K.call(Td, _, Fe);
                        } finally {
                          De(false);
                        }
                      }
                      id = false, _ = Jo;
                      break e;
                    }
                    _ = K;
                    break e;
                  case vg:
                    I.flags = I.flags & -65537 | 128;
                  case zy:
                    if (Jo = K.payload, typeof Jo == "function") {
                      if (id = true, K = Jo.call(Td, _, Fe), I.mode & 8) {
                        De(true);
                        try {
                          Jo.call(Td, _, Fe);
                        } finally {
                          De(false);
                        }
                      }
                      id = false;
                    } else K = Jo;
                    if (K == null) break e;
                    _ = ze({}, _, K);
                    break e;
                  case Ty:
                    Cl = true;
                }
              }
              I = p.callback, I !== null && (e2.flags |= 64, O && (e2.flags |= 8192), O = s.callbacks, O === null ? s.callbacks = [I] : O.push(I));
            } else O = {
              lane: I,
              tag: p.tag,
              payload: p.payload,
              callback: p.callback,
              next: null
            }, T === null ? (S = T = O, g = _) : T = T.next = O, f |= I;
            if (p = p.next, p === null) {
              if (p = s.shared.pending, p === null) break;
              O = p, p = O.next, O.next = null, s.lastBaseUpdate = O, s.shared.pending = null;
            }
          } while (true);
          T === null && (g = _), s.baseState = g, s.firstBaseUpdate = S, s.lastBaseUpdate = T, u === null && (s.shared.lanes = 0), Rl |= f, e2.lanes = f, e2.memoizedState = _;
        }
        Sg = null;
      }
      function ls(e2, n) {
        if (typeof e2 != "function") throw Error("Invalid argument passed as callback. Expected a function. Instead received: " + e2);
        e2.call(n);
      }
      function Yd(e2, n) {
        var o2 = e2.shared.hiddenCallbacks;
        if (o2 !== null) for (e2.shared.hiddenCallbacks = null, e2 = 0; e2 < o2.length; e2++) ls(o2[e2], n);
      }
      function Xd(e2, n) {
        var o2 = e2.callbacks;
        if (o2 !== null) for (e2.callbacks = null, e2 = 0; e2 < o2.length; e2++) ls(o2[e2], n);
      }
      function Kd(e2, n) {
        var o2 = Ta;
        pe(lm, o2, e2), pe(hd, n, e2), Ta = o2 | n.baseLanes;
      }
      function Du(e2) {
        pe(lm, Ta, e2), pe(hd, hd.current, e2);
      }
      function ss(e2) {
        Ta = lm.current, Ze(hd, e2), Ze(lm, e2);
      }
      function Ur(e2) {
        var n = e2.alternate;
        pe(Sn, Sn.current & md, e2), pe(_r, e2, e2), Qo === null && (n === null || hd.current !== null || n.memoizedState !== null) && (Qo = e2);
      }
      function Wu(e2) {
        pe(Sn, Sn.current, e2), pe(_r, e2, e2), Qo === null && (Qo = e2);
      }
      function Uu(e2) {
        e2.tag === 22 ? (pe(Sn, Sn.current, e2), pe(_r, e2, e2), Qo === null && (Qo = e2)) : mr(e2);
      }
      function mr(e2) {
        pe(Sn, Sn.current, e2), pe(_r, _r.current, e2);
      }
      function et(e2) {
        Ze(_r, e2), Qo === e2 && (Qo = null), Ze(Sn, e2);
      }
      function us(e2) {
        for (var n = e2; n !== null; ) {
          if (n.tag === 13) {
            var o2 = n.memoizedState;
            if (o2 !== null && (o2 = o2.dehydrated, o2 === null || Ms(o2) || $c(o2))) return n;
          } else if (n.tag === 19 && (n.memoizedProps.revealOrder === "forwards" || n.memoizedProps.revealOrder === "backwards" || n.memoizedProps.revealOrder === "unstable_legacy-backwards" || n.memoizedProps.revealOrder === "together")) {
            if ((n.flags & 128) !== 0) return n;
          } else if (n.child !== null) {
            n.child.return = n, n = n.child;
            continue;
          }
          if (n === e2) break;
          for (; n.sibling === null; ) {
            if (n.return === null || n.return === e2) return null;
            n = n.return;
          }
          n.sibling.return = n.return, n = n.sibling;
        }
        return null;
      }
      function ee() {
        var e2 = z;
        so === null ? so = [e2] : so.push(e2);
      }
      function N() {
        var e2 = z;
        if (so !== null && (vi++, so[vi] !== e2)) {
          var n = G(Y);
          if (!Ry.has(n) && (Ry.add(n), so !== null)) {
            for (var o2 = "", i2 = 0; i2 <= vi; i2++) {
              var s = so[i2], u = i2 === vi ? e2 : s;
              for (s = i2 + 1 + ". " + s; 30 > s.length; ) s += " ";
              s += u + `
`, o2 += s;
            }
            console.error(`React has detected a change in the order of Hooks called by %s. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://react.dev/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
%s   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
`, n, o2);
          }
        }
      }
      function gt(e2) {
        e2 == null || fn(e2) || console.error("%s received a final argument that is not an array (instead, received `%s`). When specified, the final argument must be an array.", z, typeof e2);
      }
      function Mi() {
        var e2 = G(Y);
        Iy.has(e2) || (Iy.add(e2), console.error("ReactDOM.useFormState has been renamed to React.useActionState. Please update %s to use React.useActionState.", e2));
      }
      function Ye() {
        throw Error(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.`);
      }
      function Bu(e2, n) {
        if (gp) return false;
        if (n === null) return console.error("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", z), false;
        e2.length !== n.length && console.error(`The final argument passed to %s changed size between renders. The order and size of this array must remain constant.

Previous: %s
Incoming: %s`, z, "[" + n.join(", ") + "]", "[" + e2.join(", ") + "]");
        for (var o2 = 0; o2 < n.length && o2 < e2.length; o2++) if (!jt(e2[o2], n[o2])) return false;
        return true;
      }
      function It(e2, n, o2, i2, s, u) {
        yi = u, Y = n, so = e2 !== null ? e2._debugHookTypes : null, vi = -1, gp = e2 !== null && e2.type !== n.type, (Object.prototype.toString.call(o2) === "[object AsyncFunction]" || Object.prototype.toString.call(o2) === "[object AsyncGeneratorFunction]") && (u = G(Y), wg.has(u) || (wg.add(u), console.error("%s is an async Client Component. Only Server Components can be async at the moment. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.", u === null ? "An unknown Component" : "<" + u + ">"))), n.memoizedState = null, n.updateQueue = null, n.lanes = 0, x.H = e2 !== null && e2.memoizedState !== null ? xg : so !== null ? Ly : Pg, au = u = (n.mode & 8) !== Z;
        var f = hg(o2, i2, s);
        if (au = false, yd && (f = Ou(n, o2, i2, s)), u) {
          De(true);
          try {
            f = Ou(n, o2, i2, s);
          } finally {
            De(false);
          }
        }
        return cs(e2, n), f;
      }
      function cs(e2, n) {
        n._debugHookTypes = so, n.dependencies === null ? bi !== null && (n.dependencies = {
          lanes: 0,
          firstContext: null,
          _debugThenableState: bi
        }) : n.dependencies._debugThenableState = bi, x.H = yp;
        var o2 = Ae !== null && Ae.next !== null;
        if (yi = 0, so = z = zn = Ae = Y = null, vi = -1, e2 !== null && (e2.flags & 65011712) !== (n.flags & 65011712) && console.error("Internal React error: Expected static flag was missing. Please notify the React team."), um = false, mp = 0, bi = null, o2) throw Error("Rendered fewer hooks than expected. This may be caused by an accidental early return statement.");
        e2 === null || Cn || (e2 = e2.dependencies, e2 !== null && ja(e2) && (Cn = true)), dp ? (dp = false, e2 = true) : e2 = false, e2 && (n = G(n) || "Unknown", Ey.has(n) || wg.has(n) || (Ey.add(n), console.error("`use` was called from inside a try/catch block. This is not allowed and can lead to unexpected behavior. To handle errors triggered by `use`, wrap your component in a error boundary.")));
      }
      function Ou(e2, n, o2, i2) {
        Y = e2;
        var s = 0;
        do {
          if (yd && (bi = null), mp = 0, yd = false, s >= $b) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
          if (s += 1, gp = false, zn = Ae = null, e2.updateQueue != null) {
            var u = e2.updateQueue;
            u.lastEffect = null, u.events = null, u.stores = null, u.memoCache != null && (u.memoCache.index = 0);
          }
          vi = -1, x.H = Ny, u = hg(n, o2, i2);
        } while (yd);
        return u;
      }
      function ef() {
        var e2 = x.H, n = e2.useState()[0];
        return n = typeof n.then == "function" ? Co(n) : n, e2 = e2.useState()[0], (Ae !== null ? Ae.memoizedState : null) !== e2 && (Y.flags |= 1024), n;
      }
      function Mu() {
        var e2 = cm !== 0;
        return cm = 0, e2;
      }
      function Qu(e2, n, o2) {
        n.updateQueue = e2.updateQueue, n.flags = (n.mode & 16) !== Z ? n.flags & -402655237 : n.flags & -2053, e2.lanes &= ~o2;
      }
      function ds(e2) {
        if (um) {
          for (e2 = e2.memoizedState; e2 !== null; ) {
            var n = e2.queue;
            n !== null && (n.pending = null), e2 = e2.next;
          }
          um = false;
        }
        yi = 0, so = zn = Ae = Y = null, vi = -1, z = null, yd = false, mp = cm = 0, bi = null;
      }
      function Fn() {
        var e2 = {
          memoizedState: null,
          baseState: null,
          baseQueue: null,
          queue: null,
          next: null
        };
        return zn === null ? Y.memoizedState = zn = e2 : zn = zn.next = e2, zn;
      }
      function xe() {
        if (Ae === null) {
          var e2 = Y.alternate;
          e2 = e2 !== null ? e2.memoizedState : null;
        } else e2 = Ae.next;
        var n = zn === null ? Y.memoizedState : zn.next;
        if (n !== null) zn = n, Ae = e2;
        else {
          if (e2 === null) throw Y.alternate === null ? Error("Update hook called on initial render. This is likely a bug in React. Please file an issue.") : Error("Rendered more hooks than during the previous render.");
          Ae = e2, e2 = {
            memoizedState: Ae.memoizedState,
            baseState: Ae.baseState,
            baseQueue: Ae.baseQueue,
            queue: Ae.queue,
            next: null
          }, zn === null ? Y.memoizedState = zn = e2 : zn = zn.next = e2;
        }
        return zn;
      }
      function Ba() {
        return {
          lastEffect: null,
          events: null,
          stores: null,
          memoCache: null
        };
      }
      function Co(e2) {
        var n = mp;
        return mp += 1, bi === null && (bi = $d()), e2 = Lu(bi, e2, n), n = Y, (zn === null ? n.memoizedState : zn.next) === null && (n = n.alternate, x.H = n !== null && n.memoizedState !== null ? xg : Pg), e2;
      }
      function we(e2) {
        if (e2 !== null && typeof e2 == "object") {
          if (typeof e2.then == "function") return Co(e2);
          if (e2.$$typeof === on) return Ee(e2);
        }
        throw Error("An unsupported type was passed to use(): " + String(e2));
      }
      function Oa(e2) {
        var n = null, o2 = Y.updateQueue;
        if (o2 !== null && (n = o2.memoCache), n == null) {
          var i2 = Y.alternate;
          i2 !== null && (i2 = i2.updateQueue, i2 !== null && (i2 = i2.memoCache, i2 != null && (n = {
            data: i2.data.map(function(s) {
              return s.slice();
            }),
            index: 0
          })));
        }
        if (n == null && (n = {
          data: [],
          index: 0
        }), o2 === null && (o2 = Ba(), Y.updateQueue = o2), o2.memoCache = n, o2 = n.data[n.index], o2 === void 0 || gp) for (o2 = n.data[n.index] = Array(e2), i2 = 0; i2 < e2; i2++) o2[i2] = Bh;
        else o2.length !== e2 && console.error("Expected a constant size argument for each invocation of useMemoCache. The previous cache was allocated with size %s but size %s was requested.", o2.length, e2);
        return n.index++, o2;
      }
      function gr(e2, n) {
        return typeof n == "function" ? n(e2) : n;
      }
      function $u(e2, n, o2) {
        var i2 = Fn();
        if (o2 !== void 0) {
          var s = o2(n);
          if (au) {
            De(true);
            try {
              o2(n);
            } finally {
              De(false);
            }
          }
        } else s = n;
        return i2.memoizedState = i2.baseState = s, e2 = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e2,
          lastRenderedState: s
        }, i2.queue = e2, e2 = e2.dispatch = Vp.bind(null, Y, e2), [i2.memoizedState, e2];
      }
      function Br(e2) {
        var n = xe();
        return Or(n, Ae, e2);
      }
      function Or(e2, n, o2) {
        var i2 = e2.queue;
        if (i2 === null) throw Error("Should have a queue. You are likely calling Hooks conditionally, which is not allowed. (https://react.dev/link/invalid-hook-call)");
        i2.lastRenderedReducer = o2;
        var s = e2.baseQueue, u = i2.pending;
        if (u !== null) {
          if (s !== null) {
            var f = s.next;
            s.next = u.next, u.next = f;
          }
          n.baseQueue !== s && console.error("Internal error: Expected work-in-progress queue to be a clone. This is a bug in React."), n.baseQueue = s = u, i2.pending = null;
        }
        if (u = e2.baseState, s === null) e2.memoizedState = u;
        else {
          n = s.next;
          var p = f = null, g = null, S = n, T = false;
          do {
            var _ = S.lane & -536870913;
            if (_ !== S.lane ? (ae & _) === _ : (yi & _) === _) {
              var I = S.revertLane;
              if (I === 0) g !== null && (g = g.next = {
                lane: 0,
                revertLane: 0,
                gesture: null,
                action: S.action,
                hasEagerState: S.hasEagerState,
                eagerState: S.eagerState,
                next: null
              }), _ === eu && (T = true);
              else if ((yi & I) === I) {
                S = S.next, I === eu && (T = true);
                continue;
              } else _ = {
                lane: 0,
                revertLane: S.revertLane,
                gesture: null,
                action: S.action,
                hasEagerState: S.hasEagerState,
                eagerState: S.eagerState,
                next: null
              }, g === null ? (p = g = _, f = u) : g = g.next = _, Y.lanes |= I, Rl |= I;
              _ = S.action, au && o2(u, _), u = S.hasEagerState ? S.eagerState : o2(u, _);
            } else I = {
              lane: _,
              revertLane: S.revertLane,
              gesture: S.gesture,
              action: S.action,
              hasEagerState: S.hasEagerState,
              eagerState: S.eagerState,
              next: null
            }, g === null ? (p = g = I, f = u) : g = g.next = I, Y.lanes |= _, Rl |= _;
            S = S.next;
          } while (S !== null && S !== n);
          if (g === null ? f = u : g.next = p, !jt(u, e2.memoizedState) && (Cn = true, T && (o2 = cd, o2 !== null))) throw o2;
          e2.memoizedState = u, e2.baseState = f, e2.baseQueue = g, i2.lastRenderedState = u;
        }
        return s === null && (i2.lanes = 0), [e2.memoizedState, i2.dispatch];
      }
      function Qi(e2) {
        var n = xe(), o2 = n.queue;
        if (o2 === null) throw Error("Should have a queue. You are likely calling Hooks conditionally, which is not allowed. (https://react.dev/link/invalid-hook-call)");
        o2.lastRenderedReducer = e2;
        var i2 = o2.dispatch, s = o2.pending, u = n.memoizedState;
        if (s !== null) {
          o2.pending = null;
          var f = s = s.next;
          do
            u = e2(u, f.action), f = f.next;
          while (f !== s);
          jt(u, n.memoizedState) || (Cn = true), n.memoizedState = u, n.baseQueue === null && (n.baseState = u), o2.lastRenderedState = u;
        }
        return [u, i2];
      }
      function Vu(e2, n, o2) {
        var i2 = Y, s = Fn();
        if (ge) {
          if (o2 === void 0) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
          var u = o2();
          gd || u === o2() || (console.error("The result of getServerSnapshot should be cached to avoid an infinite loop"), gd = true);
        } else {
          if (u = n(), gd || (o2 = n(), jt(u, o2) || (console.error("The result of getSnapshot should be cached to avoid an infinite loop"), gd = true)), je === null) throw Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
          (ae & 127) !== 0 || yr(i2, n, u);
        }
        return s.memoizedState = u, o2 = {
          value: u,
          getSnapshot: n
        }, s.queue = o2, yt(qu.bind(null, i2, o2, e2), [e2]), i2.flags |= 2048, Vt(lo | Ut, {
          destroy: void 0
        }, nf.bind(null, i2, o2, u, n), null), u;
      }
      function ta(e2, n, o2) {
        var i2 = Y, s = xe(), u = ge;
        if (u) {
          if (o2 === void 0) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
          o2 = o2();
        } else if (o2 = n(), !gd) {
          var f = n();
          jt(o2, f) || (console.error("The result of getSnapshot should be cached to avoid an infinite loop"), gd = true);
        }
        (f = !jt((Ae || s).memoizedState, o2)) && (s.memoizedState = o2, Cn = true), s = s.queue;
        var p = qu.bind(null, i2, s, e2);
        if (Qn(2048, Ut, p, [e2]), s.getSnapshot !== n || f || zn !== null && zn.memoizedState.tag & lo) {
          if (i2.flags |= 2048, Vt(lo | Ut, {
            destroy: void 0
          }, nf.bind(null, i2, s, o2, n), null), je === null) throw Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
          u || (yi & 127) !== 0 || yr(i2, n, o2);
        }
        return o2;
      }
      function yr(e2, n, o2) {
        e2.flags |= 16384, e2 = {
          getSnapshot: n,
          value: o2
        }, n = Y.updateQueue, n === null ? (n = Ba(), Y.updateQueue = n, n.stores = [e2]) : (o2 = n.stores, o2 === null ? n.stores = [e2] : o2.push(e2));
      }
      function nf(e2, n, o2, i2) {
        n.value = o2, n.getSnapshot = i2, tf(n) && Gu(e2);
      }
      function qu(e2, n, o2) {
        return o2(function() {
          tf(n) && (ur(2, "updateSyncExternalStore()", e2), Gu(e2));
        });
      }
      function tf(e2) {
        var n = e2.getSnapshot;
        e2 = e2.value;
        try {
          var o2 = n();
          return !jt(e2, o2);
        } catch {
          return true;
        }
      }
      function Gu(e2) {
        var n = On(e2, 2);
        n !== null && We(n, e2, 2);
      }
      function fs(e2) {
        var n = Fn();
        if (typeof e2 == "function") {
          var o2 = e2;
          if (e2 = o2(), au) {
            De(true);
            try {
              o2();
            } finally {
              De(false);
            }
          }
        }
        return n.memoizedState = n.baseState = e2, n.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: gr,
          lastRenderedState: e2
        }, n;
      }
      function $i(e2) {
        e2 = fs(e2);
        var n = e2.queue, o2 = cf.bind(null, Y, n);
        return n.dispatch = o2, [e2.memoizedState, o2];
      }
      function Ju(e2) {
        var n = Fn();
        n.memoizedState = n.baseState = e2;
        var o2 = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: null,
          lastRenderedState: null
        };
        return n.queue = o2, n = Gi.bind(null, Y, true, o2), o2.dispatch = n, [e2, n];
      }
      function rf(e2, n) {
        var o2 = xe();
        return Wp(o2, Ae, e2, n);
      }
      function Wp(e2, n, o2, i2) {
        return e2.baseState = o2, Or(e2, Ae, typeof i2 == "function" ? i2 : gr);
      }
      function of(e2, n) {
        var o2 = xe();
        return Ae !== null ? Wp(o2, Ae, e2, n) : (o2.baseState = e2, [e2, o2.queue.dispatch]);
      }
      function Up(e2, n, o2, i2, s) {
        if (Ji(e2)) throw Error("Cannot update form state while rendering.");
        if (e2 = n.action, e2 !== null) {
          var u = {
            payload: s,
            action: e2,
            next: null,
            isTransition: true,
            status: "pending",
            value: null,
            reason: null,
            listeners: [],
            then: function(f) {
              u.listeners.push(f);
            }
          };
          x.T !== null ? o2(true) : u.isTransition = false, i2(u), o2 = n.pending, o2 === null ? (u.next = n.pending = u, Qt(n, u)) : (u.next = o2.next, n.pending = o2.next = u);
        }
      }
      function Qt(e2, n) {
        var o2 = n.action, i2 = n.payload, s = e2.state;
        if (n.isTransition) {
          var u = x.T, f = {};
          f._updatedFibers = /* @__PURE__ */ new Set(), x.T = f;
          try {
            var p = o2(s, i2), g = x.S;
            g !== null && g(f, p), Zu(e2, n, p);
          } catch (S) {
            Yu(e2, n, S);
          } finally {
            u !== null && f.types !== null && (u.types !== null && u.types !== f.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), u.types = f.types), x.T = u, u === null && f._updatedFibers && (e2 = f._updatedFibers.size, f._updatedFibers.clear(), 10 < e2 && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."));
          }
        } else try {
          f = o2(s, i2), Zu(e2, n, f);
        } catch (S) {
          Yu(e2, n, S);
        }
      }
      function Zu(e2, n, o2) {
        o2 !== null && typeof o2 == "object" && typeof o2.then == "function" ? (x.asyncTransitions++, o2.then(ys, ys), o2.then(function(i2) {
          af(e2, n, i2);
        }, function(i2) {
          return Yu(e2, n, i2);
        }), n.isTransition || console.error("An async function with useActionState was called outside of a transition. This is likely not what you intended (for example, isPending will not update correctly). Either call the returned function inside startTransition, or pass it to an `action` or `formAction` prop.")) : af(e2, n, o2);
      }
      function af(e2, n, o2) {
        n.status = "fulfilled", n.value = o2, Bp(n), e2.state = o2, n = e2.pending, n !== null && (o2 = n.next, o2 === n ? e2.pending = null : (o2 = o2.next, n.next = o2, Qt(e2, o2)));
      }
      function Yu(e2, n, o2) {
        var i2 = e2.pending;
        if (e2.pending = null, i2 !== null) {
          i2 = i2.next;
          do
            n.status = "rejected", n.reason = o2, Bp(n), n = n.next;
          while (n !== i2);
        }
        e2.action = null;
      }
      function Bp(e2) {
        e2 = e2.listeners;
        for (var n = 0; n < e2.length; n++) (0, e2[n])();
      }
      function ps(e2, n) {
        return n;
      }
      function tn(e2, n) {
        if (ge) {
          var o2 = je.formState;
          if (o2 !== null) {
            e: {
              var i2 = Y;
              if (ge) {
                if (Ke) {
                  var s = Pt(Ke, oo);
                  if (s) {
                    Ke = ga(s), i2 = Cr(s);
                    break e;
                  }
                }
                Fr(i2);
              }
              i2 = false;
            }
            i2 && (n = o2[0]);
          }
        }
        o2 = Fn(), o2.memoizedState = o2.baseState = n, i2 = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: ps,
          lastRenderedState: n
        }, o2.queue = i2, o2 = cf.bind(null, Y, i2), i2.dispatch = o2, i2 = fs(false);
        var u = Gi.bind(null, Y, false, i2.queue);
        return i2 = Fn(), s = {
          state: n,
          dispatch: null,
          action: e2,
          pending: null
        }, i2.queue = s, o2 = Up.bind(null, Y, s, u, o2), s.dispatch = o2, i2.memoizedState = e2, [n, o2, false];
      }
      function hs(e2) {
        var n = xe();
        return Mn(n, Ae, e2);
      }
      function Mn(e2, n, o2) {
        if (n = Or(e2, n, ps)[0], e2 = Br(gr)[0], typeof n == "object" && n !== null && typeof n.then == "function") try {
          var i2 = Co(n);
        } catch (f) {
          throw f === dd ? am : f;
        }
        else i2 = n;
        n = xe();
        var s = n.queue, u = s.dispatch;
        return o2 !== n.memoizedState && (Y.flags |= 2048, Vt(lo | Ut, {
          destroy: void 0
        }, Op.bind(null, s, o2), null)), [i2, u, e2];
      }
      function Op(e2, n) {
        e2.action = n;
      }
      function $t(e2) {
        var n = xe(), o2 = Ae;
        if (o2 !== null) return Mn(n, o2, e2);
        xe(), n = n.memoizedState, o2 = xe();
        var i2 = o2.queue.dispatch;
        return o2.memoizedState = e2, [n, i2, false];
      }
      function Vt(e2, n, o2, i2) {
        return e2 = {
          tag: e2,
          create: o2,
          deps: i2,
          inst: n,
          next: null
        }, n = Y.updateQueue, n === null && (n = Ba(), Y.updateQueue = n), o2 = n.lastEffect, o2 === null ? n.lastEffect = e2.next = e2 : (i2 = o2.next, o2.next = e2, e2.next = i2, n.lastEffect = e2), e2;
      }
      function br(e2) {
        var n = Fn();
        return e2 = {
          current: e2
        }, n.memoizedState = e2;
      }
      function To(e2, n, o2, i2) {
        var s = Fn();
        Y.flags |= e2, s.memoizedState = Vt(lo | n, {
          destroy: void 0
        }, o2, i2 === void 0 ? null : i2);
      }
      function Qn(e2, n, o2, i2) {
        var s = xe();
        i2 = i2 === void 0 ? null : i2;
        var u = s.memoizedState.inst;
        Ae !== null && i2 !== null && Bu(i2, Ae.memoizedState.deps) ? s.memoizedState = Vt(n, u, o2, i2) : (Y.flags |= e2, s.memoizedState = Vt(lo | n, u, o2, i2));
      }
      function yt(e2, n) {
        (Y.mode & 16) !== Z ? To(276826112, Ut, e2, n) : To(8390656, Ut, e2, n);
      }
      function Mp(e2) {
        Y.flags |= 4;
        var n = Y.updateQueue;
        if (n === null) n = Ba(), Y.updateQueue = n, n.events = [e2];
        else {
          var o2 = n.events;
          o2 === null ? n.events = [e2] : o2.push(e2);
        }
      }
      function ra(e2) {
        var n = Fn(), o2 = {
          impl: e2
        };
        return n.memoizedState = o2, function() {
          if ((ye & Zn) !== Jn) throw Error("A function wrapped in useEffectEvent can't be called during rendering.");
          return o2.impl.apply(void 0, arguments);
        };
      }
      function oa(e2) {
        var n = xe().memoizedState;
        return Mp({
          ref: n,
          nextImpl: e2
        }), function() {
          if ((ye & Zn) !== Jn) throw Error("A function wrapped in useEffectEvent can't be called during rendering.");
          return n.impl.apply(void 0, arguments);
        };
      }
      function _o(e2, n) {
        var o2 = 4194308;
        return (Y.mode & 16) !== Z && (o2 |= 134217728), To(o2, Rr, e2, n);
      }
      function lf(e2, n) {
        if (typeof n == "function") {
          e2 = e2();
          var o2 = n(e2);
          return function() {
            typeof o2 == "function" ? o2() : n(null);
          };
        }
        if (n != null) return n.hasOwnProperty("current") || console.error("Expected useImperativeHandle() first argument to either be a ref callback or React.createRef() object. Instead received: %s.", "an object with keys {" + Object.keys(n).join(", ") + "}"), e2 = e2(), n.current = e2, function() {
          n.current = null;
        };
      }
      function Xu(e2, n, o2) {
        typeof n != "function" && console.error("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", n !== null ? typeof n : "null"), o2 = o2 != null ? o2.concat([e2]) : null;
        var i2 = 4194308;
        (Y.mode & 16) !== Z && (i2 |= 134217728), To(i2, Rr, lf.bind(null, n, e2), o2);
      }
      function aa(e2, n, o2) {
        typeof n != "function" && console.error("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", n !== null ? typeof n : "null"), o2 = o2 != null ? o2.concat([e2]) : null, Qn(4, Rr, lf.bind(null, n, e2), o2);
      }
      function Ku(e2, n) {
        return Fn().memoizedState = [e2, n === void 0 ? null : n], e2;
      }
      function Ma(e2, n) {
        var o2 = xe();
        n = n === void 0 ? null : n;
        var i2 = o2.memoizedState;
        return n !== null && Bu(n, i2[1]) ? i2[0] : (o2.memoizedState = [e2, n], e2);
      }
      function ec(e2, n) {
        var o2 = Fn();
        n = n === void 0 ? null : n;
        var i2 = e2();
        if (au) {
          De(true);
          try {
            e2();
          } finally {
            De(false);
          }
        }
        return o2.memoizedState = [i2, n], i2;
      }
      function Vi(e2, n) {
        var o2 = xe();
        n = n === void 0 ? null : n;
        var i2 = o2.memoizedState;
        if (n !== null && Bu(n, i2[1])) return i2[0];
        if (i2 = e2(), au) {
          De(true);
          try {
            e2();
          } finally {
            De(false);
          }
        }
        return o2.memoizedState = [i2, n], i2;
      }
      function ms(e2, n) {
        var o2 = Fn();
        return gs(o2, e2, n);
      }
      function nc(e2, n) {
        var o2 = xe();
        return bt(o2, Ae.memoizedState, e2, n);
      }
      function sf(e2, n) {
        var o2 = xe();
        return Ae === null ? gs(o2, e2, n) : bt(o2, Ae.memoizedState, e2, n);
      }
      function gs(e2, n, o2) {
        return o2 === void 0 || (yi & 1073741824) !== 0 && (ae & 261930) === 0 ? e2.memoizedState = n : (e2.memoizedState = o2, e2 = gh(), Y.lanes |= e2, Rl |= e2, o2);
      }
      function bt(e2, n, o2, i2) {
        return jt(o2, n) ? o2 : hd.current !== null ? (e2 = gs(e2, o2, i2), jt(e2, n) || (Cn = true), e2) : (yi & 42) === 0 || (yi & 1073741824) !== 0 && (ae & 261930) === 0 ? (Cn = true, e2.memoizedState = o2) : (e2 = gh(), Y.lanes |= e2, Rl |= e2, n);
      }
      function ys() {
        x.asyncTransitions--;
      }
      function nt(e2, n, o2, i2, s) {
        var u = wt();
        an(u !== 0 && 8 > u ? u : 8);
        var f = x.T, p = {};
        p._updatedFibers = /* @__PURE__ */ new Set(), x.T = p, Gi(e2, false, n, o2);
        try {
          var g = s(), S = x.S;
          if (S !== null && S(p, g), g !== null && typeof g == "object" && typeof g.then == "function") {
            x.asyncTransitions++, g.then(ys, ys);
            var T = Qd(g, i2);
            qi(e2, n, T, Nt(e2));
          } else qi(e2, n, i2, Nt(e2));
        } catch (_) {
          qi(e2, n, {
            then: function() {
            },
            status: "rejected",
            reason: _
          }, Nt(e2));
        } finally {
          an(u), f !== null && p.types !== null && (f.types !== null && f.types !== p.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), f.types = p.types), x.T = f, f === null && p._updatedFibers && (e2 = p._updatedFibers.size, p._updatedFibers.clear(), 10 < e2 && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."));
        }
      }
      function uf(e2) {
        var n = e2.memoizedState;
        if (n !== null) return n;
        n = {
          memoizedState: Xt,
          baseState: Xt,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: gr,
            lastRenderedState: Xt
          },
          next: null
        };
        var o2 = {};
        return n.next = {
          memoizedState: o2,
          baseState: o2,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: gr,
            lastRenderedState: o2
          },
          next: null
        }, e2.memoizedState = n, e2 = e2.alternate, e2 !== null && (e2.memoizedState = n), n;
      }
      function tc() {
        var e2 = fs(false);
        return e2 = nt.bind(null, Y, e2.queue, true, false), Fn().memoizedState = e2, [false, e2];
      }
      function Qp() {
        var e2 = Br(gr)[0], n = xe().memoizedState;
        return [typeof e2 == "boolean" ? e2 : Co(e2), n];
      }
      function Ro() {
        var e2 = Qi(gr)[0], n = xe().memoizedState;
        return [typeof e2 == "boolean" ? e2 : Co(e2), n];
      }
      function ia() {
        return Ee(Kt);
      }
      function bs() {
        var e2 = Fn(), n = je.identifierPrefix;
        if (ge) {
          var o2 = ci, i2 = ui;
          o2 = (i2 & ~(1 << 32 - vn(i2) - 1)).toString(32) + o2, n = "_" + n + "R_" + o2, o2 = cm++, 0 < o2 && (n += "H" + o2.toString(32)), n += "_";
        } else o2 = Qb++, n = "_" + n + "r_" + o2.toString(32) + "_";
        return e2.memoizedState = n;
      }
      function la() {
        return Fn().memoizedState = $p.bind(null, Y);
      }
      function $p(e2, n) {
        for (var o2 = e2.return; o2 !== null; ) {
          switch (o2.tag) {
            case 24:
            case 3:
              var i2 = Nt(o2), s = zo(i2), u = Mt(o2, s, i2);
              u !== null && (ur(i2, "refresh()", e2), We(u, o2, i2), Bi(u, o2, i2)), e2 = Ai(), n != null && u !== null && console.error("The seed argument is not enabled outside experimental channels."), s.payload = {
                cache: e2
              };
              return;
          }
          o2 = o2.return;
        }
      }
      function Vp(e2, n, o2) {
        var i2 = arguments;
        typeof i2[3] == "function" && console.error("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect()."), i2 = Nt(e2);
        var s = {
          lane: i2,
          revertLane: 0,
          gesture: null,
          action: o2,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        Ji(e2) ? qp(n, s) : (s = Hu(e2, n, s, i2), s !== null && (ur(i2, "dispatch()", e2), We(s, e2, i2), Gp(s, n, i2)));
      }
      function cf(e2, n, o2) {
        var i2 = arguments;
        typeof i2[3] == "function" && console.error("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect()."), i2 = Nt(e2), qi(e2, n, o2, i2) && ur(i2, "setState()", e2);
      }
      function qi(e2, n, o2, i2) {
        var s = {
          lane: i2,
          revertLane: 0,
          gesture: null,
          action: o2,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        if (Ji(e2)) qp(n, s);
        else {
          var u = e2.alternate;
          if (e2.lanes === 0 && (u === null || u.lanes === 0) && (u = n.lastRenderedReducer, u !== null)) {
            var f = x.H;
            x.H = $o;
            try {
              var p = n.lastRenderedState, g = u(p, o2);
              if (s.hasEagerState = true, s.eagerState = g, jt(g, p)) return os(e2, n, s, 0), je === null && Ui(), false;
            } catch {
            } finally {
              x.H = f;
            }
          }
          if (o2 = Hu(e2, n, s, i2), o2 !== null) return We(o2, e2, i2), Gp(o2, n, i2), true;
        }
        return false;
      }
      function Gi(e2, n, o2, i2) {
        if (x.T === null && eu === 0 && console.error("An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition."), i2 = {
          lane: 2,
          revertLane: Ru(),
          gesture: null,
          action: i2,
          hasEagerState: false,
          eagerState: null,
          next: null
        }, Ji(e2)) {
          if (n) throw Error("Cannot update optimistic state while rendering.");
          console.error("Cannot call startTransition while rendering.");
        } else n = Hu(e2, o2, i2, 2), n !== null && (ur(2, "setOptimistic()", e2), We(n, e2, 2));
      }
      function Ji(e2) {
        var n = e2.alternate;
        return e2 === Y || n !== null && n === Y;
      }
      function qp(e2, n) {
        yd = um = true;
        var o2 = e2.pending;
        o2 === null ? n.next = n : (n.next = o2.next, o2.next = n), e2.pending = n;
      }
      function Gp(e2, n, o2) {
        if ((o2 & 4194048) !== 0) {
          var i2 = n.lanes;
          i2 &= e2.pendingLanes, o2 |= i2, n.lanes = o2, Ld(e2, o2);
        }
      }
      function df(e2) {
        if (e2 !== null && typeof e2 != "function") {
          var n = String(e2);
          Qy.has(n) || (Qy.add(n), console.error("Expected the last optional `callback` argument to be a function. Instead received: %s.", e2));
        }
      }
      function rc(e2, n, o2, i2) {
        var s = e2.memoizedState, u = o2(i2, s);
        if (e2.mode & 8) {
          De(true);
          try {
            u = o2(i2, s);
          } finally {
            De(false);
          }
        }
        u === void 0 && (n = $e(n) || "Component", Uy.has(n) || (Uy.add(n), console.error("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", n))), s = u == null ? s : ze({}, s, u), e2.memoizedState = s, e2.lanes === 0 && (e2.updateQueue.baseState = s);
      }
      function ff(e2, n, o2, i2, s, u, f) {
        var p = e2.stateNode;
        if (typeof p.shouldComponentUpdate == "function") {
          if (o2 = p.shouldComponentUpdate(i2, u, f), e2.mode & 8) {
            De(true);
            try {
              o2 = p.shouldComponentUpdate(i2, u, f);
            } finally {
              De(false);
            }
          }
          return o2 === void 0 && console.error("%s.shouldComponentUpdate(): Returned undefined instead of a boolean value. Make sure to return true or false.", $e(n) || "Component"), o2;
        }
        return n.prototype && n.prototype.isPureReactComponent ? !es(o2, i2) || !es(s, u) : true;
      }
      function Qa(e2, n, o2, i2) {
        var s = n.state;
        typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps(o2, i2), typeof n.UNSAFE_componentWillReceiveProps == "function" && n.UNSAFE_componentWillReceiveProps(o2, i2), n.state !== s && (e2 = G(e2) || "Component", Hy.has(e2) || (Hy.add(e2), console.error("%s.componentWillReceiveProps(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", e2)), zg.enqueueReplaceState(n, n.state, null));
      }
      function Mr(e2, n) {
        var o2 = n;
        if ("ref" in n) {
          o2 = {};
          for (var i2 in n) i2 !== "ref" && (o2[i2] = n[i2]);
        }
        if (e2 = e2.defaultProps) {
          o2 === n && (o2 = ze({}, o2));
          for (var s in e2) o2[s] === void 0 && (o2[s] = e2[s]);
        }
        return o2;
      }
      function vs(e2, n) {
        try {
          bd = n.source ? G(n.source) : null, Cg = null;
          var o2 = n.value;
          if (x.actQueue !== null) x.thrownErrors.push(o2);
          else {
            var i2 = e2.onUncaughtError;
            i2(o2, {
              componentStack: n.stack
            });
          }
        } catch (s) {
          setTimeout(function() {
            throw s;
          });
        }
      }
      function pf(e2, n, o2) {
        try {
          bd = o2.source ? G(o2.source) : null, Cg = G(n);
          var i2 = e2.onCaughtError;
          i2(o2.value, {
            componentStack: o2.stack,
            errorBoundary: n.tag === 1 ? n.stateNode : null
          });
        } catch (s) {
          setTimeout(function() {
            throw s;
          });
        }
      }
      function oc(e2, n, o2) {
        return o2 = zo(o2), o2.tag = vg, o2.payload = {
          element: null
        }, o2.callback = function() {
          B(n.source, vs, e2, n);
        }, o2;
      }
      function ac(e2) {
        return e2 = zo(e2), e2.tag = vg, e2;
      }
      function ic(e2, n, o2, i2) {
        var s = o2.type.getDerivedStateFromError;
        if (typeof s == "function") {
          var u = i2.value;
          e2.payload = function() {
            return s(u);
          }, e2.callback = function() {
            Ah(o2), B(i2.source, pf, n, o2, i2);
          };
        }
        var f = o2.stateNode;
        f !== null && typeof f.componentDidCatch == "function" && (e2.callback = function() {
          Ah(o2), B(i2.source, pf, n, o2, i2), typeof s != "function" && (Il === null ? Il = /* @__PURE__ */ new Set([this]) : Il.add(this)), Ub(this, i2), typeof s == "function" || (o2.lanes & 2) === 0 && console.error("%s: Error boundaries should implement getDerivedStateFromError(). In that method, return a state update to display an error message or fallback UI.", G(o2) || "Unknown");
        });
      }
      function Jp(e2, n, o2, i2, s) {
        if (o2.flags |= 32768, wa && nl(e2, s), i2 !== null && typeof i2 == "object" && typeof i2.then == "function") {
          if (n = o2.alternate, n !== null && He(n, o2, s, true), ge && (xa = true), o2 = _r.current, o2 !== null) {
            switch (o2.tag) {
              case 31:
              case 13:
                return Qo === null ? Pc() : o2.alternate === null && nn === ki && (nn = vm), o2.flags &= -257, o2.flags |= 65536, o2.lanes = s, i2 === im ? o2.flags |= 16384 : (n = o2.updateQueue, n === null ? o2.updateQueue = /* @__PURE__ */ new Set([i2]) : n.add(i2), Af(e2, i2, s)), false;
              case 22:
                return o2.flags |= 65536, i2 === im ? o2.flags |= 16384 : (n = o2.updateQueue, n === null ? (n = {
                  transitions: null,
                  markerInstances: null,
                  retryQueue: /* @__PURE__ */ new Set([i2])
                }, o2.updateQueue = n) : (o2 = n.retryQueue, o2 === null ? n.retryQueue = /* @__PURE__ */ new Set([i2]) : o2.add(i2)), Af(e2, i2, s)), false;
            }
            throw Error("Unexpected Suspense handler tag (" + o2.tag + "). This is a bug in React.");
          }
          return Af(e2, i2, s), Pc(), false;
        }
        if (ge) return xa = true, n = _r.current, n !== null ? ((n.flags & 65536) === 0 && (n.flags |= 256), n.flags |= 65536, n.lanes = s, i2 !== rg && Fi(ft(Error("There was an error while hydrating but React was able to recover by instead client rendering from the nearest Suspense boundary.", {
          cause: i2
        }), o2))) : (i2 !== rg && Fi(ft(Error("There was an error while hydrating but React was able to recover by instead client rendering the entire root.", {
          cause: i2
        }), o2)), e2 = e2.current.alternate, e2.flags |= 65536, s &= -s, e2.lanes |= s, i2 = ft(i2, o2), s = oc(e2.stateNode, i2, s), Ua(e2, s), nn !== Tl && (nn = iu)), false;
        var u = ft(Error("There was an error during concurrent rendering but React was able to recover by instead synchronously rendering the entire root.", {
          cause: i2
        }), o2);
        if (wp === null ? wp = [u] : wp.push(u), nn !== Tl && (nn = iu), n === null) return true;
        i2 = ft(i2, o2), o2 = n;
        do {
          switch (o2.tag) {
            case 3:
              return o2.flags |= 65536, e2 = s & -s, o2.lanes |= e2, e2 = oc(o2.stateNode, i2, e2), Ua(o2, e2), false;
            case 1:
              if (n = o2.type, u = o2.stateNode, (o2.flags & 128) === 0 && (typeof n.getDerivedStateFromError == "function" || u !== null && typeof u.componentDidCatch == "function" && (Il === null || !Il.has(u)))) return o2.flags |= 65536, s &= -s, o2.lanes |= s, s = ac(s), ic(s, e2, o2, i2), Ua(o2, s), false;
          }
          o2 = o2.return;
        } while (o2 !== null);
        return false;
      }
      function rn(e2, n, o2, i2) {
        n.child = e2 === null ? xy(n, null, o2, i2) : ou(n, e2.child, o2, i2);
      }
      function hf(e2, n, o2, i2, s) {
        o2 = o2.render;
        var u = n.ref;
        if ("ref" in i2) {
          var f = {};
          for (var p in i2) p !== "ref" && (f[p] = i2[p]);
        } else f = i2;
        return sr(n), i2 = It(e2, n, o2, f, u, s), p = Mu(), e2 !== null && !Cn ? (Qu(e2, n, s), vr(e2, n, s)) : (ge && p && Ei(n), n.flags |= 1, rn(e2, n, i2, s), n.child);
      }
      function mf(e2, n, o2, i2, s) {
        if (e2 === null) {
          var u = o2.type;
          return typeof u == "function" && !Tc(u) && u.defaultProps === void 0 && o2.compare === null ? (o2 = Ya(u), n.tag = 15, n.type = o2, Eo(n, u), ve(e2, n, o2, i2, s)) : (e2 = _c(o2.type, null, i2, n, n.mode, s), e2.ref = n.ref, e2.return = n, n.child = e2);
        }
        if (u = e2.child, !ie(e2, s)) {
          var f = u.memoizedProps;
          if (o2 = o2.compare, o2 = o2 !== null ? o2 : es, o2(f, i2) && e2.ref === n.ref) return vr(e2, n, s);
        }
        return n.flags |= 1, e2 = Fo(u, i2), e2.ref = n.ref, e2.return = n, n.child = e2;
      }
      function ve(e2, n, o2, i2, s) {
        if (e2 !== null) {
          var u = e2.memoizedProps;
          if (es(u, i2) && e2.ref === n.ref && n.type === e2.type) if (Cn = false, n.pendingProps = i2 = u, ie(e2, s)) (e2.flags & 131072) !== 0 && (Cn = true);
          else return n.lanes = e2.lanes, vr(e2, n, s);
        }
        return ks(e2, n, o2, i2, s);
      }
      function lc(e2, n, o2, i2) {
        var s = i2.children, u = e2 !== null ? e2.memoizedState : null;
        if (e2 === null && n.stateNode === null && (n.stateNode = {
          _visibility: pp,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null
        }), i2.mode === "hidden") {
          if ((n.flags & 128) !== 0) {
            if (u = u !== null ? u.baseLanes | o2 : o2, e2 !== null) {
              for (i2 = n.child = e2.child, s = 0; i2 !== null; ) s = s | i2.lanes | i2.childLanes, i2 = i2.sibling;
              i2 = s & ~u;
            } else i2 = 0, n.child = null;
            return gf(e2, n, u, o2, i2);
          }
          if ((o2 & 536870912) !== 0) n.memoizedState = {
            baseLanes: 0,
            cachePool: null
          }, e2 !== null && Kl(n, u !== null ? u.cachePool : null), u !== null ? Kd(n, u) : Du(n), Uu(n);
          else return i2 = n.lanes = 536870912, gf(e2, n, u !== null ? u.baseLanes | o2 : o2, o2, i2);
        } else u !== null ? (Kl(n, u.cachePool), Kd(n, u), mr(n), n.memoizedState = null) : (e2 !== null && Kl(n, null), Du(n), mr(n));
        return rn(e2, n, s, o2), n.child;
      }
      function Ss(e2, n) {
        return e2 !== null && e2.tag === 22 || n.stateNode !== null || (n.stateNode = {
          _visibility: pp,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null
        }), n.sibling;
      }
      function gf(e2, n, o2, i2, s) {
        var u = Eu();
        return u = u === null ? null : {
          parent: at ? un._currentValue : un._currentValue2,
          pool: u
        }, n.memoizedState = {
          baseLanes: o2,
          cachePool: u
        }, e2 !== null && Kl(n, null), Du(n), Uu(n), e2 !== null && He(e2, n, i2, true), n.childLanes = s, null;
      }
      function sc(e2, n) {
        var o2 = n.hidden;
        return o2 !== void 0 && console.error(`<Activity> doesn't accept a hidden prop. Use mode="hidden" instead.
- <Activity %s>
+ <Activity %s>`, o2 === true ? "hidden" : o2 === false ? "hidden={false}" : "hidden={...}", o2 ? 'mode="hidden"' : 'mode="visible"'), n = xs({
          mode: n.mode,
          children: n.children
        }, e2.mode), n.ref = e2.ref, e2.child = n, n.return = e2, n;
      }
      function Zp(e2, n, o2) {
        return ou(n, e2.child, null, o2), e2 = sc(n, n.pendingProps), e2.flags |= 2, et(n), n.memoizedState = null, e2;
      }
      function Nm(e2, n, o2) {
        var i2 = n.pendingProps, s = (n.flags & 128) !== 0;
        if (n.flags &= -129, e2 === null) {
          if (ge) {
            if (i2.mode === "hidden") return e2 = sc(n, i2), n.lanes = 536870912, Ss(null, e2);
            if (Wu(n), (e2 = Ke) ? (o2 = ce(e2, oo), o2 !== null && (i2 = {
              dehydrated: o2,
              treeContext: Ul(),
              retryLane: 536870912,
              hydrationErrors: null
            }, n.memoizedState = i2, i2 = Xa(o2), i2.return = n, n.child = i2, it = n, Ke = null)) : o2 = null, o2 === null) throw Ni(n, e2), Fr(n);
            return n.lanes = 536870912, null;
          }
          return sc(n, i2);
        }
        var u = e2.memoizedState;
        if (u !== null) {
          var f = u.dehydrated;
          if (Wu(n), s) {
            if (n.flags & 256) n.flags &= -257, n = Zp(e2, n, o2);
            else if (n.memoizedState !== null) n.child = e2.child, n.flags |= 128, n = null;
            else throw Error("Client rendering an Activity suspended it again. This is a bug in React.");
          } else if (vo(), (o2 & 536870912) !== 0 && wc(n), Cn || He(e2, n, o2, false), s = (o2 & e2.childLanes) !== 0, Cn || s) {
            if (i2 = je, i2 !== null && (f = Al(i2, o2), f !== 0 && f !== u.retryLane)) throw u.retryLane = f, On(e2, f), We(i2, e2, f), Tg;
            Pc(), n = Zp(e2, n, o2);
          } else e2 = u.treeContext, qn && (Ke = Gc(f), it = n, ge = true, kl = null, xa = false, Tr = null, oo = false, e2 !== null && Hd(n, e2)), n = sc(n, i2), n.flags |= 4096;
          return n;
        }
        return u = e2.child, i2 = {
          mode: i2.mode,
          children: i2.children
        }, (o2 & 536870912) !== 0 && (o2 & e2.lanes) !== 0 && wc(n), e2 = Fo(u, i2), e2.ref = n.ref, n.child = e2, e2.return = n, e2;
      }
      function uc(e2, n) {
        var o2 = n.ref;
        if (o2 === null) e2 !== null && e2.ref !== null && (n.flags |= 4194816);
        else {
          if (typeof o2 != "function" && typeof o2 != "object") throw Error("Expected ref to be a function, an object returned by React.createRef(), or undefined/null.");
          (e2 === null || e2.ref !== o2) && (n.flags |= 4194816);
        }
      }
      function ks(e2, n, o2, i2, s) {
        if (o2.prototype && typeof o2.prototype.render == "function") {
          var u = $e(o2) || "Unknown";
          $y[u] || (console.error("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", u, u), $y[u] = true);
        }
        return n.mode & 8 && Mo.recordLegacyContextWarning(n, null), e2 === null && (Eo(n, n.type), o2.contextTypes && (u = $e(o2) || "Unknown", qy[u] || (qy[u] = true, console.error("%s uses the legacy contextTypes API which was removed in React 19. Use React.createContext() with React.useContext() instead. (https://react.dev/link/legacy-context)", u)))), sr(n), o2 = It(e2, n, o2, i2, void 0, s), i2 = Mu(), e2 !== null && !Cn ? (Qu(e2, n, s), vr(e2, n, s)) : (ge && i2 && Ei(n), n.flags |= 1, rn(e2, n, o2, s), n.child);
      }
      function Qr(e2, n, o2, i2, s, u) {
        return sr(n), vi = -1, gp = e2 !== null && e2.type !== n.type, n.updateQueue = null, o2 = Ou(n, i2, o2, s), cs(e2, n), i2 = Mu(), e2 !== null && !Cn ? (Qu(e2, n, u), vr(e2, n, u)) : (ge && i2 && Ei(n), n.flags |= 1, rn(e2, n, o2, u), n.child);
      }
      function yf(e2, n, o2, i2, s) {
        switch (pu(n)) {
          case false:
            var u = n.stateNode, f = new n.type(n.memoizedProps, u.context).state;
            u.updater.enqueueSetState(u, f, null);
            break;
          case true:
            n.flags |= 128, n.flags |= 65536, u = Error("Simulated error coming from DevTools");
            var p = s & -s;
            if (n.lanes |= p, f = je, f === null) throw Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
            p = ac(p), ic(p, f, n, ft(u, n)), Ua(n, p);
        }
        if (sr(n), n.stateNode === null) {
          if (f = Oe, u = o2.contextType, "contextType" in o2 && u !== null && (u === void 0 || u.$$typeof !== on) && !My.has(o2) && (My.add(o2), p = u === void 0 ? " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file." : typeof u != "object" ? " However, it is set to a " + typeof u + "." : u.$$typeof === ei ? " Did you accidentally pass the Context.Consumer instead?" : " However, it is set to an object with keys {" + Object.keys(u).join(", ") + "}.", console.error("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", $e(o2) || "Component", p)), typeof u == "object" && u !== null && (f = Ee(u)), u = new o2(i2, f), n.mode & 8) {
            De(true);
            try {
              u = new o2(i2, f);
            } finally {
              De(false);
            }
          }
          if (f = n.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, u.updater = zg, n.stateNode = u, u._reactInternals = n, u._reactInternalInstance = Fy, typeof o2.getDerivedStateFromProps == "function" && f === null && (f = $e(o2) || "Component", Ay.has(f) || (Ay.add(f), console.error("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", f, u.state === null ? "null" : "undefined", f))), typeof o2.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function") {
            var g = p = f = null;
            if (typeof u.componentWillMount == "function" && u.componentWillMount.__suppressDeprecationWarning !== true ? f = "componentWillMount" : typeof u.UNSAFE_componentWillMount == "function" && (f = "UNSAFE_componentWillMount"), typeof u.componentWillReceiveProps == "function" && u.componentWillReceiveProps.__suppressDeprecationWarning !== true ? p = "componentWillReceiveProps" : typeof u.UNSAFE_componentWillReceiveProps == "function" && (p = "UNSAFE_componentWillReceiveProps"), typeof u.componentWillUpdate == "function" && u.componentWillUpdate.__suppressDeprecationWarning !== true ? g = "componentWillUpdate" : typeof u.UNSAFE_componentWillUpdate == "function" && (g = "UNSAFE_componentWillUpdate"), f !== null || p !== null || g !== null) {
              u = $e(o2) || "Component";
              var S = typeof o2.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
              Dy.has(u) || (Dy.add(u), console.error(`Unsafe legacy lifecycles will not be called for components using new component APIs.

%s uses %s but also contains the following legacy lifecycles:%s%s%s

The above lifecycles should be removed. Learn more about this warning here:
https://react.dev/link/unsafe-component-lifecycles`, u, S, f !== null ? `
  ` + f : "", p !== null ? `
  ` + p : "", g !== null ? `
  ` + g : ""));
            }
          }
          u = n.stateNode, f = $e(o2) || "Component", u.render || (o2.prototype && typeof o2.prototype.render == "function" ? console.error("No `render` method found on the %s instance: did you accidentally return an object from the constructor?", f) : console.error("No `render` method found on the %s instance: you may have forgotten to define `render`.", f)), !u.getInitialState || u.getInitialState.isReactClassApproved || u.state || console.error("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", f), u.getDefaultProps && !u.getDefaultProps.isReactClassApproved && console.error("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", f), u.contextType && console.error("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", f), o2.childContextTypes && !Oy.has(o2) && (Oy.add(o2), console.error("%s uses the legacy childContextTypes API which was removed in React 19. Use React.createContext() instead. (https://react.dev/link/legacy-context)", f)), o2.contextTypes && !By.has(o2) && (By.add(o2), console.error("%s uses the legacy contextTypes API which was removed in React 19. Use React.createContext() with static contextType instead. (https://react.dev/link/legacy-context)", f)), typeof u.componentShouldUpdate == "function" && console.error("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", f), o2.prototype && o2.prototype.isPureReactComponent && typeof u.shouldComponentUpdate < "u" && console.error("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", $e(o2) || "A pure component"), typeof u.componentDidUnmount == "function" && console.error("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", f), typeof u.componentDidReceiveProps == "function" && console.error("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", f), typeof u.componentWillRecieveProps == "function" && console.error("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", f), typeof u.UNSAFE_componentWillRecieveProps == "function" && console.error("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", f), p = u.props !== i2, u.props !== void 0 && p && console.error("When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", f), u.defaultProps && console.error("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", f, f), typeof u.getSnapshotBeforeUpdate != "function" || typeof u.componentDidUpdate == "function" || jy.has(o2) || (jy.add(o2), console.error("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", $e(o2))), typeof u.getDerivedStateFromProps == "function" && console.error("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", f), typeof u.getDerivedStateFromError == "function" && console.error("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", f), typeof o2.getSnapshotBeforeUpdate == "function" && console.error("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", f), (p = u.state) && (typeof p != "object" || fn(p)) && console.error("%s.state: must be set to an object or null", f), typeof u.getChildContext == "function" && typeof o2.childContextTypes != "object" && console.error("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", f), u = n.stateNode, u.props = i2, u.state = n.memoizedState, u.refs = {}, Au(n), f = o2.contextType, u.context = typeof f == "object" && f !== null ? Ee(f) : Oe, u.state === i2 && (f = $e(o2) || "Component", Wy.has(f) || (Wy.add(f), console.error("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", f))), n.mode & 8 && Mo.recordLegacyContextWarning(n, u), Mo.recordUnsafeLifecycleWarnings(n, u), u.state = n.memoizedState, f = o2.getDerivedStateFromProps, typeof f == "function" && (rc(n, o2, f, i2), u.state = n.memoizedState), typeof o2.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (f = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), f !== u.state && (console.error("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", G(n) || "Component"), zg.enqueueReplaceState(u, u.state, null)), is2(n, i2, u, s), Oi(), u.state = n.memoizedState), typeof u.componentDidMount == "function" && (n.flags |= 4194308), (n.mode & 16) !== Z && (n.flags |= 134217728), u = true;
        } else if (e2 === null) {
          u = n.stateNode;
          var T = n.memoizedProps;
          p = Mr(o2, T), u.props = p;
          var _ = u.context;
          g = o2.contextType, f = Oe, typeof g == "object" && g !== null && (f = Ee(g)), S = o2.getDerivedStateFromProps, g = typeof S == "function" || typeof u.getSnapshotBeforeUpdate == "function", T = n.pendingProps !== T, g || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (T || _ !== f) && Qa(n, u, i2, f), Cl = false;
          var I = n.memoizedState;
          u.state = I, is2(n, i2, u, s), Oi(), _ = n.memoizedState, T || I !== _ || Cl ? (typeof S == "function" && (rc(n, o2, S, i2), _ = n.memoizedState), (p = Cl || ff(n, o2, p, i2, I, _, f)) ? (g || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function" && (n.flags |= 4194308), (n.mode & 16) !== Z && (n.flags |= 134217728)) : (typeof u.componentDidMount == "function" && (n.flags |= 4194308), (n.mode & 16) !== Z && (n.flags |= 134217728), n.memoizedProps = i2, n.memoizedState = _), u.props = i2, u.state = _, u.context = f, u = p) : (typeof u.componentDidMount == "function" && (n.flags |= 4194308), (n.mode & 16) !== Z && (n.flags |= 134217728), u = false);
        } else {
          u = n.stateNode, ju(e2, n), f = n.memoizedProps, g = Mr(o2, f), u.props = g, S = n.pendingProps, I = u.context, _ = o2.contextType, p = Oe, typeof _ == "object" && _ !== null && (p = Ee(_)), T = o2.getDerivedStateFromProps, (_ = typeof T == "function" || typeof u.getSnapshotBeforeUpdate == "function") || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (f !== S || I !== p) && Qa(n, u, i2, p), Cl = false, I = n.memoizedState, u.state = I, is2(n, i2, u, s), Oi();
          var O = n.memoizedState;
          f !== S || I !== O || Cl || e2 !== null && e2.dependencies !== null && ja(e2.dependencies) ? (typeof T == "function" && (rc(n, o2, T, i2), O = n.memoizedState), (g = Cl || ff(n, o2, g, i2, I, O, p) || e2 !== null && e2.dependencies !== null && ja(e2.dependencies)) ? (_ || typeof u.UNSAFE_componentWillUpdate != "function" && typeof u.componentWillUpdate != "function" || (typeof u.componentWillUpdate == "function" && u.componentWillUpdate(i2, O, p), typeof u.UNSAFE_componentWillUpdate == "function" && u.UNSAFE_componentWillUpdate(i2, O, p)), typeof u.componentDidUpdate == "function" && (n.flags |= 4), typeof u.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof u.componentDidUpdate != "function" || f === e2.memoizedProps && I === e2.memoizedState || (n.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || f === e2.memoizedProps && I === e2.memoizedState || (n.flags |= 1024), n.memoizedProps = i2, n.memoizedState = O), u.props = i2, u.state = O, u.context = p, u = g) : (typeof u.componentDidUpdate != "function" || f === e2.memoizedProps && I === e2.memoizedState || (n.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || f === e2.memoizedProps && I === e2.memoizedState || (n.flags |= 1024), u = false);
        }
        if (p = u, uc(e2, n), f = (n.flags & 128) !== 0, p || f) {
          if (p = n.stateNode, Ql(n), f && typeof o2.getDerivedStateFromError != "function") o2 = null, Dt = -1;
          else if (o2 = cy(p), n.mode & 8) {
            De(true);
            try {
              cy(p);
            } finally {
              De(false);
            }
          }
          n.flags |= 1, e2 !== null && f ? (n.child = ou(n, e2.child, null, s), n.child = ou(n, null, o2, s)) : rn(e2, n, o2, s), n.memoizedState = p.state, e2 = n.child;
        } else e2 = vr(e2, n, s);
        return s = n.stateNode, u && s.props !== i2 && (vd || console.error("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", G(n) || "a component"), vd = true), e2;
      }
      function ws(e2, n, o2, i2) {
        return wo(), n.flags |= 256, rn(e2, n, o2, i2), n.child;
      }
      function Eo(e2, n) {
        n && n.childContextTypes && console.error(`childContextTypes cannot be defined on a function component.
  %s.childContextTypes = ...`, n.displayName || n.name || "Component"), typeof n.getDerivedStateFromProps == "function" && (e2 = $e(n) || "Unknown", Gy[e2] || (console.error("%s: Function components do not support getDerivedStateFromProps.", e2), Gy[e2] = true)), typeof n.contextType == "object" && n.contextType !== null && (n = $e(n) || "Unknown", Vy[n] || (console.error("%s: Function components do not support contextType.", n), Vy[n] = true));
      }
      function Ps(e2) {
        return {
          baseLanes: e2,
          cachePool: Iu()
        };
      }
      function cc(e2, n, o2) {
        return e2 = e2 !== null ? e2.childLanes & ~o2 : 0, n && (e2 |= rr), e2;
      }
      function dc(e2, n, o2) {
        var i2 = n.pendingProps;
        fu(n) && (n.flags |= 128);
        var s = false, u = (n.flags & 128) !== 0, f;
        if ((f = u) || (f = e2 !== null && e2.memoizedState === null ? false : (Sn.current & hp) !== 0), f && (s = true, n.flags &= -129), f = (n.flags & 32) !== 0, n.flags &= -33, e2 === null) {
          if (ge) {
            if (s ? Ur(n) : mr(n), (e2 = Ke) ? (o2 = Ne(e2, oo), o2 !== null && (f = {
              dehydrated: o2,
              treeContext: Ul(),
              retryLane: 536870912,
              hydrationErrors: null
            }, n.memoizedState = f, f = Xa(o2), f.return = n, n.child = f, it = n, Ke = null)) : o2 = null, o2 === null) throw Ni(n, e2), Fr(n);
            return $c(o2) ? n.lanes = 32 : n.lanes = 536870912, null;
          }
          var p = i2.children;
          return i2 = i2.fallback, s ? (mr(n), s = n.mode, p = xs({
            mode: "hidden",
            children: p
          }, s), i2 = fa(i2, s, o2, null), p.return = n, i2.return = n, p.sibling = i2, n.child = p, i2 = n.child, i2.memoizedState = Ps(o2), i2.childLanes = cc(e2, f, o2), n.memoizedState = _g, Ss(null, i2)) : (Ur(n), bf(n, p));
        }
        var g = e2.memoizedState;
        if (g !== null && (p = g.dehydrated, p !== null)) {
          if (u) n.flags & 256 ? (Ur(n), n.flags &= -257, n = fc(e2, n, o2)) : n.memoizedState !== null ? (mr(n), n.child = e2.child, n.flags |= 128, n = null) : (mr(n), p = i2.fallback, s = n.mode, i2 = xs({
            mode: "visible",
            children: i2.children
          }, s), p = fa(p, s, o2, null), p.flags |= 2, i2.return = n, p.return = n, i2.sibling = p, n.child = i2, ou(n, e2.child, null, o2), i2 = n.child, i2.memoizedState = Ps(o2), i2.childLanes = cc(e2, f, o2), n.memoizedState = _g, n = Ss(null, i2));
          else if (Ur(n), vo(), (o2 & 536870912) !== 0 && wc(n), $c(p)) s = Pn(p), f = s.digest, p = s.message, i2 = s.stack, s = s.componentStack, p = Error(p || "The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering."), p.stack = i2 || "", p.digest = f, f = s === void 0 ? null : s, i2 = {
            value: p,
            source: null,
            stack: f
          }, typeof f == "string" && tg.set(p, i2), Fi(i2), n = fc(e2, n, o2);
          else if (Cn || He(e2, n, o2, false), f = (o2 & e2.childLanes) !== 0, Cn || f) {
            if (f = je, f !== null && (i2 = Al(f, o2), i2 !== 0 && i2 !== g.retryLane)) throw g.retryLane = i2, On(e2, i2), We(f, e2, i2), Tg;
            Ms(p) || Pc(), n = fc(e2, n, o2);
          } else Ms(p) ? (n.flags |= 192, n.child = e2.child, n = null) : (e2 = g.treeContext, qn && (Ke = Jc(p), it = n, ge = true, kl = null, xa = false, Tr = null, oo = false, e2 !== null && Hd(n, e2)), n = bf(n, i2.children), n.flags |= 4096);
          return n;
        }
        return s ? (mr(n), p = i2.fallback, s = n.mode, g = e2.child, u = g.sibling, i2 = Fo(g, {
          mode: "hidden",
          children: i2.children
        }), i2.subtreeFlags = g.subtreeFlags & 65011712, u !== null ? p = Fo(u, p) : (p = fa(p, s, o2, null), p.flags |= 2), p.return = n, i2.return = n, i2.sibling = p, n.child = i2, Ss(null, i2), i2 = n.child, p = e2.child.memoizedState, p === null ? p = Ps(o2) : (s = p.cachePool, s !== null ? (g = at ? un._currentValue : un._currentValue2, s = s.parent !== g ? {
          parent: g,
          pool: g
        } : s) : s = Iu(), p = {
          baseLanes: p.baseLanes | o2,
          cachePool: s
        }), i2.memoizedState = p, i2.childLanes = cc(e2, f, o2), n.memoizedState = _g, Ss(e2.child, i2)) : (g !== null && (o2 & 62914560) === o2 && (o2 & e2.lanes) !== 0 && wc(n), Ur(n), o2 = e2.child, e2 = o2.sibling, o2 = Fo(o2, {
          mode: "visible",
          children: i2.children
        }), o2.return = n, o2.sibling = null, e2 !== null && (f = n.deletions, f === null ? (n.deletions = [e2], n.flags |= 16) : f.push(e2)), n.child = o2, n.memoizedState = null, o2);
      }
      function bf(e2, n) {
        return n = xs({
          mode: "visible",
          children: n
        }, e2.mode), n.return = e2, e2.child = n;
      }
      function xs(e2, n) {
        return e2 = lt(22, e2, null, n), e2.lanes = 0, e2;
      }
      function fc(e2, n, o2) {
        return ou(n, e2.child, null, o2), e2 = bf(n, n.pendingProps.children), e2.flags |= 2, n.memoizedState = null, e2;
      }
      function vf(e2, n, o2) {
        e2.lanes |= n;
        var i2 = e2.alternate;
        i2 !== null && (i2.lanes |= n), Vl(e2.return, n, o2);
      }
      function pc(e2, n, o2, i2, s, u) {
        var f = e2.memoizedState;
        f === null ? e2.memoizedState = {
          isBackwards: n,
          rendering: null,
          renderingStartTime: 0,
          last: i2,
          tail: o2,
          tailMode: s,
          treeForkCount: u
        } : (f.isBackwards = n, f.rendering = null, f.renderingStartTime = 0, f.last = i2, f.tail = o2, f.tailMode = s, f.treeForkCount = u);
      }
      function Sf(e2, n, o2) {
        var _s2;
        var i2 = n.pendingProps, s = i2.revealOrder, u = i2.tail, f = i2.children, p = Sn.current;
        if ((i2 = (p & hp) !== 0) ? (p = p & md | hp, n.flags |= 128) : p &= md, pe(Sn, p, n), p = (_s2 = s) != null ? _s2 : "null", s !== "forwards" && s !== "unstable_legacy-backwards" && s !== "together" && s !== "independent" && !Jy[p]) if (Jy[p] = true, s == null) console.error('The default for the <SuspenseList revealOrder="..."> prop is changing. To be future compatible you must explictly specify either "independent" (the current default), "together", "forwards" or "legacy_unstable-backwards".');
        else if (s === "backwards") console.error('The rendering order of <SuspenseList revealOrder="backwards"> is changing. To be future compatible you must specify revealOrder="legacy_unstable-backwards" instead.');
        else if (typeof s == "string") switch (s.toLowerCase()) {
          case "together":
          case "forwards":
          case "backwards":
          case "independent":
            console.error('"%s" is not a valid value for revealOrder on <SuspenseList />. Use lowercase "%s" instead.', s, s.toLowerCase());
            break;
          case "forward":
          case "backward":
            console.error('"%s" is not a valid value for revealOrder on <SuspenseList />. React uses the -s suffix in the spelling. Use "%ss" instead.', s, s.toLowerCase());
            break;
          default:
            console.error('"%s" is not a supported revealOrder on <SuspenseList />. Did you mean "independent", "together", "forwards" or "backwards"?', s);
        }
        else console.error('%s is not a supported value for revealOrder on <SuspenseList />. Did you mean "independent", "together", "forwards" or "backwards"?', s);
        p = u != null ? u : "null", fm[p] || (u == null ? (s === "forwards" || s === "backwards" || s === "unstable_legacy-backwards") && (fm[p] = true, console.error('The default for the <SuspenseList tail="..."> prop is changing. To be future compatible you must explictly specify either "visible" (the current default), "collapsed" or "hidden".')) : u !== "visible" && u !== "collapsed" && u !== "hidden" ? (fm[p] = true, console.error('"%s" is not a supported value for tail on <SuspenseList />. Did you mean "visible", "collapsed" or "hidden"?', u)) : s !== "forwards" && s !== "backwards" && s !== "unstable_legacy-backwards" && (fm[p] = true, console.error('<SuspenseList tail="%s" /> is only valid if revealOrder is "forwards" or "backwards". Did you mean to specify revealOrder="forwards"?', u)));
        e: if ((s === "forwards" || s === "backwards" || s === "unstable_legacy-backwards") && f !== void 0 && f !== null && f !== false) if (fn(f)) {
          for (p = 0; p < f.length; p++) if (!Zd(f[p], p)) break e;
        } else if (p = Yo(f), typeof p == "function") {
          if (p = p.call(f)) for (var g = p.next(), S = 0; !g.done; g = p.next()) {
            if (!Zd(g.value, S)) break e;
            S++;
          }
        } else console.error('A single row was passed to a <SuspenseList revealOrder="%s" />. This is not useful since it needs multiple rows. Did you mean to pass multiple children or an array?', s);
        if (rn(e2, n, f, o2), ge ? (mo(), f = Xf) : f = 0, !i2 && e2 !== null && (e2.flags & 128) !== 0) e: for (e2 = n.child; e2 !== null; ) {
          if (e2.tag === 13) e2.memoizedState !== null && vf(e2, o2, n);
          else if (e2.tag === 19) vf(e2, o2, n);
          else if (e2.child !== null) {
            e2.child.return = e2, e2 = e2.child;
            continue;
          }
          if (e2 === n) break e;
          for (; e2.sibling === null; ) {
            if (e2.return === null || e2.return === n) break e;
            e2 = e2.return;
          }
          e2.sibling.return = e2.return, e2 = e2.sibling;
        }
        switch (s) {
          case "forwards":
            for (o2 = n.child, s = null; o2 !== null; ) e2 = o2.alternate, e2 !== null && us(e2) === null && (s = o2), o2 = o2.sibling;
            o2 = s, o2 === null ? (s = n.child, n.child = null) : (s = o2.sibling, o2.sibling = null), pc(n, false, s, o2, u, f);
            break;
          case "backwards":
          case "unstable_legacy-backwards":
            for (o2 = null, s = n.child, n.child = null; s !== null; ) {
              if (e2 = s.alternate, e2 !== null && us(e2) === null) {
                n.child = s;
                break;
              }
              e2 = s.sibling, s.sibling = o2, o2 = s, s = e2;
            }
            pc(n, true, o2, null, u, f);
            break;
          case "together":
            pc(n, false, null, null, void 0, f);
            break;
          default:
            n.memoizedState = null;
        }
        return n.child;
      }
      function vr(e2, n, o2) {
        if (e2 !== null && (n.dependencies = e2.dependencies), Dt = -1, Rl |= n.lanes, (o2 & n.childLanes) === 0) if (e2 !== null) {
          if (He(e2, n, o2, false), (o2 & n.childLanes) === 0) return null;
        } else return null;
        if (e2 !== null && n.child !== e2.child) throw Error("Resuming work not yet implemented.");
        if (n.child !== null) {
          for (e2 = n.child, o2 = Fo(e2, e2.pendingProps), n.child = o2, o2.return = n; e2.sibling !== null; ) e2 = e2.sibling, o2 = o2.sibling = Fo(e2, e2.pendingProps), o2.return = n;
          o2.sibling = null;
        }
        return n.child;
      }
      function ie(e2, n) {
        return (e2.lanes & n) !== 0 ? true : (e2 = e2.dependencies, !!(e2 !== null && ja(e2)));
      }
      function Fm(e2, n, o2) {
        switch (n.tag) {
          case 3:
            Bl(n, n.stateNode.containerInfo), Hr(n, un, e2.memoizedState.cache), wo();
            break;
          case 27:
          case 5:
            La(n);
            break;
          case 4:
            Bl(n, n.stateNode.containerInfo);
            break;
          case 10:
            Hr(n, n.type, n.memoizedProps.value);
            break;
          case 12:
            (o2 & n.childLanes) !== 0 && (n.flags |= 4), n.flags |= 2048;
            var i2 = n.stateNode;
            i2.effectDuration = -0, i2.passiveEffectDuration = -0;
            break;
          case 31:
            if (n.memoizedState !== null) return n.flags |= 128, Wu(n), null;
            break;
          case 13:
            if (i2 = n.memoizedState, i2 !== null) return i2.dehydrated !== null ? (Ur(n), n.flags |= 128, null) : (o2 & n.child.childLanes) !== 0 ? dc(e2, n, o2) : (Ur(n), e2 = vr(e2, n, o2), e2 !== null ? e2.sibling : null);
            Ur(n);
            break;
          case 19:
            var s = (e2.flags & 128) !== 0;
            if (i2 = (o2 & n.childLanes) !== 0, i2 || (He(e2, n, o2, false), i2 = (o2 & n.childLanes) !== 0), s) {
              if (i2) return Sf(e2, n, o2);
              n.flags |= 128;
            }
            if (s = n.memoizedState, s !== null && (s.rendering = null, s.tail = null, s.lastEffect = null), pe(Sn, Sn.current, n), i2) break;
            return null;
          case 22:
            return n.lanes = 0, lc(e2, n, o2, n.pendingProps);
          case 24:
            Hr(n, un, e2.memoizedState.cache);
        }
        return vr(e2, n, o2);
      }
      function tt(e2, n, o2) {
        if (n._debugNeedsRemount && e2 !== null) {
          o2 = _c(n.type, n.key, n.pendingProps, n._debugOwner || null, n.mode, n.lanes), o2._debugStack = n._debugStack, o2._debugTask = n._debugTask;
          var i2 = n.return;
          if (i2 === null) throw Error("Cannot swap the root fiber.");
          if (e2.alternate = null, n.alternate = null, o2.index = n.index, o2.sibling = n.sibling, o2.return = n.return, o2.ref = n.ref, o2._debugInfo = n._debugInfo, n === i2.child) i2.child = o2;
          else {
            var s = i2.child;
            if (s === null) throw Error("Expected parent to have a child.");
            for (; s.sibling !== n; ) if (s = s.sibling, s === null) throw Error("Expected to find the previous sibling.");
            s.sibling = o2;
          }
          return n = i2.deletions, n === null ? (i2.deletions = [e2], i2.flags |= 16) : n.push(e2), o2.flags |= 2, o2;
        }
        if (e2 !== null) {
          if (e2.memoizedProps !== n.pendingProps || n.type !== e2.type) Cn = true;
          else {
            if (!ie(e2, o2) && (n.flags & 128) === 0) return Cn = false, Fm(e2, n, o2);
            Cn = (e2.flags & 131072) !== 0;
          }
        } else Cn = false, (i2 = ge) && (mo(), i2 = (n.flags & 1048576) !== 0), i2 && (i2 = n.index, mo(), wu(n, Xf, i2));
        switch (n.lanes = 0, n.tag) {
          case 16:
            e: if (i2 = n.pendingProps, e2 = xo(n.elementType), n.type = e2, typeof e2 == "function") Tc(e2) ? (i2 = Mr(e2, i2), n.tag = 1, n.type = e2 = Ya(e2), n = yf(null, n, e2, i2, o2)) : (n.tag = 0, Eo(n, e2), n.type = e2 = Ya(e2), n = ks(null, n, e2, i2, o2));
            else {
              if (e2 != null) {
                if (s = e2.$$typeof, s === jn) {
                  n.tag = 11, n.type = e2 = Cc(e2), n = hf(null, n, e2, i2, o2);
                  break e;
                } else if (s === al) {
                  n.tag = 14, n = mf(null, n, e2, i2, o2);
                  break e;
                }
              }
              throw n = "", e2 !== null && typeof e2 == "object" && e2.$$typeof === kt && (n = " Did you wrap a component in React.lazy() more than once?"), e2 = $e(e2) || e2, Error("Element type is invalid. Received a promise that resolves to: " + e2 + ". Lazy element type must resolve to a class or function." + n);
            }
            return n;
          case 0:
            return ks(e2, n, n.type, n.pendingProps, o2);
          case 1:
            return i2 = n.type, s = Mr(i2, n.pendingProps), yf(e2, n, i2, s, o2);
          case 3:
            e: {
              if (Bl(n, n.stateNode.containerInfo), e2 === null) throw Error("Should have a current fiber. This is a bug in React.");
              var u = n.pendingProps;
              s = n.memoizedState, i2 = s.element, ju(e2, n), is2(n, u, null, o2);
              var f = n.memoizedState;
              if (u = f.cache, Hr(n, un, u), u !== s.cache && Ln(n, [un], o2, true), Oi(), u = f.element, qn && s.isDehydrated) {
                if (s = {
                  element: u,
                  isDehydrated: false,
                  cache: f.cache
                }, n.updateQueue.baseState = s, n.memoizedState = s, n.flags & 256) {
                  n = ws(e2, n, u, o2);
                  break e;
                } else if (u !== i2) {
                  i2 = ft(Error("This root received an early update, before anything was able hydrate. Switched the entire root to client rendering."), n), Fi(i2), n = ws(e2, n, u, o2);
                  break e;
                } else for (qn && (Ke = qc(n.stateNode.containerInfo), it = n, ge = true, kl = null, xa = false, Tr = null, oo = true), e2 = xy(n, null, u, o2), n.child = e2; e2; ) e2.flags = e2.flags & -3 | 4096, e2 = e2.sibling;
              } else {
                if (wo(), u === i2) {
                  n = vr(e2, n, o2);
                  break e;
                }
                rn(e2, n, u, o2);
              }
              n = n.child;
            }
            return n;
          case 26:
            if (Re) return uc(e2, n), e2 === null ? (e2 = no(n.type, null, n.pendingProps, null)) ? n.memoizedState = e2 : ge || (n.stateNode = t2(n.type, n.pendingProps, pt(Sl.current), n)) : n.memoizedState = no(n.type, e2.memoizedProps, n.pendingProps, e2.memoizedState), null;
          case 27:
            if (d) return La(n), e2 === null && d && ge && (s = pt(Sl.current), i2 = Rt(), s = n.stateNode = h(n.type, n.pendingProps, s, i2, false), xa || (i2 = Vs(s, n.type, n.pendingProps, i2), i2 !== null && (bo(n, 0).serverProps = i2)), it = n, oo = true, Ke = Zc(n.type, s, Ke)), rn(e2, n, n.pendingProps.children, o2), uc(e2, n), e2 === null && (n.flags |= 4194304), n.child;
          case 5:
            return e2 === null && ge && (u = Rt(), i2 = Xc(n.type, n.pendingProps, u), s = Ke, (f = !s) || (f = Qs(s, n.type, n.pendingProps, oo), f !== null ? (n.stateNode = f, xa || (u = Vs(f, n.type, n.pendingProps, u), u !== null && (bo(n, 0).serverProps = u)), it = n, Ke = Vc(f), oo = false, u = true) : u = false, f = !u), f && (i2 && Ni(n, s), Fr(n))), La(n), s = n.type, u = n.pendingProps, f = e2 !== null ? e2.memoizedProps : null, i2 = u.children, ue(s, u) ? i2 = null : f !== null && ue(s, f) && (n.flags |= 32), n.memoizedState !== null && (s = It(e2, n, ef, null, null, o2), at ? Kt._currentValue = s : Kt._currentValue2 = s), uc(e2, n), rn(e2, n, i2, o2), n.child;
          case 6:
            return e2 === null && ge && (e2 = n.pendingProps, o2 = Rt(), e2 = va(e2, o2), o2 = Ke, (i2 = !o2) || (i2 = Ym(o2, n.pendingProps, oo), i2 !== null ? (n.stateNode = i2, it = n, Ke = null, i2 = true) : i2 = false, i2 = !i2), i2 && (e2 && Ni(n, o2), Fr(n))), null;
          case 13:
            return dc(e2, n, o2);
          case 4:
            return Bl(n, n.stateNode.containerInfo), i2 = n.pendingProps, e2 === null ? n.child = ou(n, null, i2, o2) : rn(e2, n, i2, o2), n.child;
          case 11:
            return hf(e2, n, n.type, n.pendingProps, o2);
          case 7:
            return rn(e2, n, n.pendingProps, o2), n.child;
          case 8:
            return rn(e2, n, n.pendingProps.children, o2), n.child;
          case 12:
            return n.flags |= 4, n.flags |= 2048, i2 = n.stateNode, i2.effectDuration = -0, i2.passiveEffectDuration = -0, rn(e2, n, n.pendingProps.children, o2), n.child;
          case 10:
            return i2 = n.type, s = n.pendingProps, u = s.value, "value" in s || Zy || (Zy = true, console.error("The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?")), Hr(n, i2, u), rn(e2, n, s.children, o2), n.child;
          case 9:
            return s = n.type._context, i2 = n.pendingProps.children, typeof i2 != "function" && console.error("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it."), sr(n), s = Ee(s), i2 = hg(i2, s, void 0), n.flags |= 1, rn(e2, n, i2, o2), n.child;
          case 14:
            return mf(e2, n, n.type, n.pendingProps, o2);
          case 15:
            return ve(e2, n, n.type, n.pendingProps, o2);
          case 19:
            return Sf(e2, n, o2);
          case 31:
            return Nm(e2, n, o2);
          case 22:
            return lc(e2, n, o2, n.pendingProps);
          case 24:
            return sr(n), i2 = Ee(un), e2 === null ? (s = Eu(), s === null && (s = je, u = Ai(), s.pooledCache = u, Po(u), u !== null && (s.pooledCacheLanes |= o2), s = u), n.memoizedState = {
              parent: i2,
              cache: s
            }, Au(n), Hr(n, un, s)) : ((e2.lanes & o2) !== 0 && (ju(e2, n), is2(n, null, null, o2), Oi()), s = e2.memoizedState, u = n.memoizedState, s.parent !== i2 ? (s = {
              parent: i2,
              cache: i2
            }, n.memoizedState = s, n.lanes === 0 && (n.memoizedState = n.updateQueue.baseState = s), Hr(n, un, i2)) : (i2 = u.cache, Hr(n, un, i2), i2 !== s.cache && Ln(n, [un], o2, true))), rn(e2, n, n.pendingProps.children, o2), n.child;
          case 29:
            throw n.pendingProps;
        }
        throw Error("Unknown unit of work tag (" + n.tag + "). This error is likely caused by a bug in React. Please file an issue.");
      }
      function Lt(e2) {
        e2.flags |= 4;
      }
      function hc(e2) {
        Xr && (e2.flags |= 8);
      }
      function zs(e2, n) {
        if (e2 !== null && e2.child === n.child) return false;
        if ((n.flags & 16) !== 0) return true;
        for (e2 = n.child; e2 !== null; ) {
          if ((e2.flags & 8218) !== 0 || (e2.subtreeFlags & 8218) !== 0) return true;
          e2 = e2.sibling;
        }
        return false;
      }
      function sa(e2, n, o2, i2) {
        if (Be) for (o2 = n.child; o2 !== null; ) {
          if (o2.tag === 5 || o2.tag === 6) bn(e2, o2.stateNode);
          else if (!(o2.tag === 4 || d && o2.tag === 27) && o2.child !== null) {
            o2.child.return = o2, o2 = o2.child;
            continue;
          }
          if (o2 === n) break;
          for (; o2.sibling === null; ) {
            if (o2.return === null || o2.return === n) return;
            o2 = o2.return;
          }
          o2.sibling.return = o2.return, o2 = o2.sibling;
        }
        else if (Xr) for (var s = n.child; s !== null; ) {
          if (s.tag === 5) {
            var u = s.stateNode;
            o2 && i2 && (u = eo(u, s.type, s.memoizedProps)), bn(e2, u);
          } else if (s.tag === 6) u = s.stateNode, o2 && i2 && (u = sn(u, s.memoizedProps)), bn(e2, u);
          else if (s.tag !== 4) {
            if (s.tag === 22 && s.memoizedState !== null) u = s.child, u !== null && (u.return = s), sa(e2, s, true, true);
            else if (s.child !== null) {
              s.child.return = s, s = s.child;
              continue;
            }
          }
          if (s === n) break;
          for (; s.sibling === null; ) {
            if (s.return === null || s.return === n) return;
            s = s.return;
          }
          s.sibling.return = s.return, s = s.sibling;
        }
      }
      function $a(e2, n, o2, i2) {
        var s = false;
        if (Xr) for (var u = n.child; u !== null; ) {
          if (u.tag === 5) {
            var f = u.stateNode;
            o2 && i2 && (f = eo(f, u.type, u.memoizedProps)), Mc(e2, f);
          } else if (u.tag === 6) f = u.stateNode, o2 && i2 && (f = sn(f, u.memoizedProps)), Mc(e2, f);
          else if (u.tag !== 4) {
            if (u.tag === 22 && u.memoizedState !== null) s = u.child, s !== null && (s.return = u), $a(e2, u, true, true), s = true;
            else if (u.child !== null) {
              u.child.return = u, u = u.child;
              continue;
            }
          }
          if (u === n) break;
          for (; u.sibling === null; ) {
            if (u.return === null || u.return === n) return s;
            u = u.return;
          }
          u.sibling.return = u.return, u = u.sibling;
        }
        return s;
      }
      function kf(e2, n) {
        if (Xr && zs(e2, n)) {
          e2 = n.stateNode;
          var o2 = e2.containerInfo, i2 = Oc();
          $a(i2, n, false, false), e2.pendingChildren = i2, Lt(n), hn(o2, i2);
        }
      }
      function Cs(e2, n, o2, i2) {
        if (Be) e2.memoizedProps !== i2 && Lt(n);
        else if (Xr) {
          var s = e2.stateNode, u = e2.memoizedProps;
          if ((e2 = zs(e2, n)) || u !== i2) {
            var f = Rt();
            u = Qh(s, o2, u, i2, !e2, null), u === s ? n.stateNode = s : (hc(n), Ue(u, o2, i2, f) && Lt(n), n.stateNode = u, e2 && sa(u, n, false, false));
          } else n.stateNode = s;
        }
      }
      function mc(e2, n, o2, i2, s) {
        if ((e2.mode & 32) !== Z && (o2 === null ? sl(n, i2) : ul(n, o2, i2))) {
          if (e2.flags |= 16777216, (s & 335544128) === s || Hc(n, i2)) if (ha(e2.stateNode, n, i2)) e2.flags |= 8192;
          else if (Sh()) e2.flags |= 8192;
          else throw ru = im, gg;
        } else e2.flags &= -16777217;
      }
      function Io(e2, n) {
        if (a(n)) {
          if (e2.flags |= 16777216, !l(n)) if (Sh()) e2.flags |= 8192;
          else throw ru = im, gg;
        } else e2.flags &= -16777217;
      }
      function Zi(e2, n) {
        n !== null && (e2.flags |= 4), e2.flags & 16384 && (n = e2.tag !== 22 ? ut() : 536870912, e2.lanes |= n, uu |= n);
      }
      function Va(e2, n) {
        if (!ge) switch (e2.tailMode) {
          case "hidden":
            n = e2.tail;
            for (var o2 = null; n !== null; ) n.alternate !== null && (o2 = n), n = n.sibling;
            o2 === null ? e2.tail = null : o2.sibling = null;
            break;
          case "collapsed":
            o2 = e2.tail;
            for (var i2 = null; o2 !== null; ) o2.alternate !== null && (i2 = o2), o2 = o2.sibling;
            i2 === null ? n || e2.tail === null ? e2.tail = null : e2.tail.sibling = null : i2.sibling = null;
        }
      }
      function Te(e2) {
        var n = e2.alternate !== null && e2.alternate.child === e2.child, o2 = 0, i2 = 0;
        if (n) {
          if ((e2.mode & 2) !== Z) {
            for (var s = e2.selfBaseDuration, u = e2.child; u !== null; ) o2 |= u.lanes | u.childLanes, i2 |= u.subtreeFlags & 65011712, i2 |= u.flags & 65011712, s += u.treeBaseDuration, u = u.sibling;
            e2.treeBaseDuration = s;
          } else for (s = e2.child; s !== null; ) o2 |= s.lanes | s.childLanes, i2 |= s.subtreeFlags & 65011712, i2 |= s.flags & 65011712, s.return = e2, s = s.sibling;
        } else if ((e2.mode & 2) !== Z) {
          s = e2.actualDuration, u = e2.selfBaseDuration;
          for (var f = e2.child; f !== null; ) o2 |= f.lanes | f.childLanes, i2 |= f.subtreeFlags, i2 |= f.flags, s += f.actualDuration, u += f.treeBaseDuration, f = f.sibling;
          e2.actualDuration = s, e2.treeBaseDuration = u;
        } else for (s = e2.child; s !== null; ) o2 |= s.lanes | s.childLanes, i2 |= s.subtreeFlags, i2 |= s.flags, s.return = e2, s = s.sibling;
        return e2.subtreeFlags |= i2, e2.childLanes = o2, n;
      }
      function wf(e2, n, o2) {
        var i2 = n.pendingProps;
        switch (Pu(n), n.tag) {
          case 16:
          case 15:
          case 0:
          case 11:
          case 7:
          case 8:
          case 12:
          case 9:
          case 14:
            return Te(n), null;
          case 1:
            return Te(n), null;
          case 3:
            return o2 = n.stateNode, i2 = null, e2 !== null && (i2 = e2.memoizedState.cache), n.memoizedState.cache !== i2 && (n.flags |= 2048), lr(un, n), Ia(n), o2.pendingContext && (o2.context = o2.pendingContext, o2.pendingContext = null), (e2 === null || e2.child === null) && (ko(n) ? (xu(), Lt(n)) : e2 === null || e2.memoizedState.isDehydrated && (n.flags & 256) === 0 || (n.flags |= 1024, $l())), kf(e2, n), Te(n), null;
          case 26:
            if (Re) {
              var s = n.type, u = n.memoizedState;
              return e2 === null ? (Lt(n), u !== null ? (Te(n), Io(n, u)) : (Te(n), mc(n, s, null, i2, o2))) : u ? u !== e2.memoizedState ? (Lt(n), Te(n), Io(n, u)) : (Te(n), n.flags &= -16777217) : (u = e2.memoizedProps, Be ? u !== i2 && Lt(n) : Cs(e2, n, s, i2), Te(n), mc(n, s, u, i2, o2)), null;
            }
          case 27:
            if (d) {
              if (Na(n), o2 = pt(Sl.current), s = n.type, e2 !== null && n.stateNode != null) Be ? e2.memoizedProps !== i2 && Lt(n) : Cs(e2, n, s, i2);
              else {
                if (!i2) {
                  if (n.stateNode === null) throw Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
                  return Te(n), null;
                }
                e2 = Rt(), ko(n) ? So(n, e2) : (e2 = h(s, i2, o2, e2, true), n.stateNode = e2, Lt(n));
              }
              return Te(n), null;
            }
          case 5:
            if (Na(n), s = n.type, e2 !== null && n.stateNode != null) Cs(e2, n, s, i2);
            else {
              if (!i2) {
                if (n.stateNode === null) throw Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
                return Te(n), null;
              }
              if (u = Rt(), ko(n)) So(n, u), ii(n.stateNode, s, i2, u) && (n.flags |= 64);
              else {
                var f = pt(Sl.current);
                f = Fc(s, i2, f, u, n), hc(n), sa(f, n, false, false), n.stateNode = f, Ue(f, s, i2, u) && Lt(n);
              }
            }
            return Te(n), mc(n, n.type, e2 === null ? null : e2.memoizedProps, n.pendingProps, o2), null;
          case 6:
            if (e2 && n.stateNode != null) o2 = e2.memoizedProps, Be ? o2 !== i2 && Lt(n) : Xr && (o2 !== i2 ? (e2 = pt(Sl.current), o2 = Rt(), hc(n), n.stateNode = Do(i2, e2, o2, n)) : n.stateNode = e2.stateNode);
            else {
              if (typeof i2 != "string" && n.stateNode === null) throw Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
              if (e2 = pt(Sl.current), o2 = Rt(), ko(n)) {
                if (!qn) throw Error("Expected prepareToHydrateHostTextInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.");
                if (e2 = n.stateNode, o2 = n.memoizedProps, s = !xa, i2 = null, u = it, u !== null) switch (u.tag) {
                  case 3:
                    s && (s = Zf(e2, o2, i2), s !== null && (bo(n, 0).serverProps = s));
                    break;
                  case 27:
                  case 5:
                    i2 = u.memoizedProps, s && (s = Zf(e2, o2, i2), s !== null && (bo(n, 0).serverProps = s));
                }
                he(e2, o2, n, i2) || Fr(n, true);
              } else hc(n), n.stateNode = Do(i2, e2, o2, n);
            }
            return Te(n), null;
          case 31:
            if (o2 = n.memoizedState, e2 === null || e2.memoizedState !== null) {
              if (i2 = ko(n), o2 !== null) {
                if (e2 === null) {
                  if (!i2) throw Error("A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React.");
                  if (!qn) throw Error("Expected prepareToHydrateHostActivityInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.");
                  if (e2 = n.memoizedState, e2 = e2 !== null ? e2.dehydrated : null, !e2) throw Error("Expected to have a hydrated activity instance. This error is likely caused by a bug in React. Please file an issue.");
                  _e(e2, n), Te(n), (n.mode & 2) !== Z && o2 !== null && (e2 = n.child, e2 !== null && (n.treeBaseDuration -= e2.treeBaseDuration));
                } else xu(), wo(), (n.flags & 128) === 0 && (o2 = n.memoizedState = null), n.flags |= 4, Te(n), (n.mode & 2) !== Z && o2 !== null && (e2 = n.child, e2 !== null && (n.treeBaseDuration -= e2.treeBaseDuration));
                e2 = false;
              } else o2 = $l(), e2 !== null && e2.memoizedState !== null && (e2.memoizedState.hydrationErrors = o2), e2 = true;
              if (!e2) return n.flags & 256 ? (et(n), n) : (et(n), null);
              if ((n.flags & 128) !== 0) throw Error("Client rendering an Activity suspended it again. This is a bug in React.");
            }
            return Te(n), null;
          case 13:
            if (i2 = n.memoizedState, e2 === null || e2.memoizedState !== null && e2.memoizedState.dehydrated !== null) {
              if (s = i2, u = ko(n), s !== null && s.dehydrated !== null) {
                if (e2 === null) {
                  if (!u) throw Error("A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React.");
                  if (!qn) throw Error("Expected prepareToHydrateHostSuspenseInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.");
                  if (u = n.memoizedState, u = u !== null ? u.dehydrated : null, !u) throw Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
                  Ht(u, n), Te(n), (n.mode & 2) !== Z && s !== null && (s = n.child, s !== null && (n.treeBaseDuration -= s.treeBaseDuration));
                } else xu(), wo(), (n.flags & 128) === 0 && (s = n.memoizedState = null), n.flags |= 4, Te(n), (n.mode & 2) !== Z && s !== null && (s = n.child, s !== null && (n.treeBaseDuration -= s.treeBaseDuration));
                s = false;
              } else s = $l(), e2 !== null && e2.memoizedState !== null && (e2.memoizedState.hydrationErrors = s), s = true;
              if (!s) return n.flags & 256 ? (et(n), n) : (et(n), null);
            }
            return et(n), (n.flags & 128) !== 0 ? (n.lanes = o2, (n.mode & 2) !== Z && Zl(n), n) : (o2 = i2 !== null, e2 = e2 !== null && e2.memoizedState !== null, o2 && (i2 = n.child, s = null, i2.alternate !== null && i2.alternate.memoizedState !== null && i2.alternate.memoizedState.cachePool !== null && (s = i2.alternate.memoizedState.cachePool.pool), u = null, i2.memoizedState !== null && i2.memoizedState.cachePool !== null && (u = i2.memoizedState.cachePool.pool), u !== s && (i2.flags |= 2048)), o2 !== e2 && o2 && (n.child.flags |= 8192), Zi(n, n.updateQueue), Te(n), (n.mode & 2) !== Z && o2 && (e2 = n.child, e2 !== null && (n.treeBaseDuration -= e2.treeBaseDuration)), null);
          case 4:
            return Ia(n), kf(e2, n), e2 === null && qe(n.stateNode.containerInfo), Te(n), null;
          case 10:
            return lr(n.type, n), Te(n), null;
          case 19:
            if (Ze(Sn, n), i2 = n.memoizedState, i2 === null) return Te(n), null;
            if (s = (n.flags & 128) !== 0, u = i2.rendering, u === null) {
              if (s) Va(i2, false);
              else {
                if (nn !== ki || e2 !== null && (e2.flags & 128) !== 0) for (e2 = n.child; e2 !== null; ) {
                  if (u = us(e2), u !== null) {
                    for (n.flags |= 128, Va(i2, false), e2 = u.updateQueue, n.updateQueue = e2, Zi(n, e2), n.subtreeFlags = 0, e2 = o2, o2 = n.child; o2 !== null; ) dn(o2, e2), o2 = o2.sibling;
                    return pe(Sn, Sn.current & md | hp, n), ge && ho(n, i2.treeForkCount), n.child;
                  }
                  e2 = e2.sibling;
                }
                i2.tail !== null && me() > Pp && (n.flags |= 128, s = true, Va(i2, false), n.lanes = 4194304);
              }
            } else {
              if (!s) if (e2 = us(u), e2 !== null) {
                if (n.flags |= 128, s = true, e2 = e2.updateQueue, n.updateQueue = e2, Zi(n, e2), Va(i2, true), i2.tail === null && i2.tailMode === "hidden" && !u.alternate && !ge) return Te(n), null;
              } else 2 * me() - i2.renderingStartTime > Pp && o2 !== 536870912 && (n.flags |= 128, s = true, Va(i2, false), n.lanes = 4194304);
              i2.isBackwards ? (u.sibling = n.child, n.child = u) : (e2 = i2.last, e2 !== null ? e2.sibling = u : n.child = u, i2.last = u);
            }
            return i2.tail !== null ? (e2 = i2.tail, i2.rendering = e2, i2.tail = e2.sibling, i2.renderingStartTime = me(), e2.sibling = null, o2 = Sn.current, o2 = s ? o2 & md | hp : o2 & md, pe(Sn, o2, n), ge && ho(n, i2.treeForkCount), e2) : (Te(n), null);
          case 22:
          case 23:
            return et(n), ss(n), i2 = n.memoizedState !== null, e2 !== null ? e2.memoizedState !== null !== i2 && (n.flags |= 8192) : i2 && (n.flags |= 8192), i2 ? (o2 & 536870912) !== 0 && (n.flags & 128) === 0 && (Te(n), n.subtreeFlags & 6 && (n.flags |= 8192)) : Te(n), o2 = n.updateQueue, o2 !== null && Zi(n, o2.retryQueue), o2 = null, e2 !== null && e2.memoizedState !== null && e2.memoizedState.cachePool !== null && (o2 = e2.memoizedState.cachePool.pool), i2 = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (i2 = n.memoizedState.cachePool.pool), i2 !== o2 && (n.flags |= 2048), e2 !== null && Ze(nu, n), null;
          case 24:
            return o2 = null, e2 !== null && (o2 = e2.memoizedState.cache), n.memoizedState.cache !== o2 && (n.flags |= 2048), lr(un, n), Te(n), null;
          case 25:
            return null;
          case 30:
            return null;
        }
        throw Error("Unknown unit of work tag (" + n.tag + "). This error is likely caused by a bug in React. Please file an issue.");
      }
      function ua(e2, n) {
        switch (Pu(n), n.tag) {
          case 1:
            return e2 = n.flags, e2 & 65536 ? (n.flags = e2 & -65537 | 128, (n.mode & 2) !== Z && Zl(n), n) : null;
          case 3:
            return lr(un, n), Ia(n), e2 = n.flags, (e2 & 65536) !== 0 && (e2 & 128) === 0 ? (n.flags = e2 & -65537 | 128, n) : null;
          case 26:
          case 27:
          case 5:
            return Na(n), null;
          case 31:
            if (n.memoizedState !== null) {
              if (et(n), n.alternate === null) throw Error("Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue.");
              wo();
            }
            return e2 = n.flags, e2 & 65536 ? (n.flags = e2 & -65537 | 128, (n.mode & 2) !== Z && Zl(n), n) : null;
          case 13:
            if (et(n), e2 = n.memoizedState, e2 !== null && e2.dehydrated !== null) {
              if (n.alternate === null) throw Error("Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue.");
              wo();
            }
            return e2 = n.flags, e2 & 65536 ? (n.flags = e2 & -65537 | 128, (n.mode & 2) !== Z && Zl(n), n) : null;
          case 19:
            return Ze(Sn, n), null;
          case 4:
            return Ia(n), null;
          case 10:
            return lr(n.type, n), null;
          case 22:
          case 23:
            return et(n), ss(n), e2 !== null && Ze(nu, n), e2 = n.flags, e2 & 65536 ? (n.flags = e2 & -65537 | 128, (n.mode & 2) !== Z && Zl(n), n) : null;
          case 24:
            return lr(un, n), null;
          case 25:
            return null;
          default:
            return null;
        }
      }
      function gc(e2, n) {
        switch (Pu(n), n.tag) {
          case 3:
            lr(un, n), Ia(n);
            break;
          case 26:
          case 27:
          case 5:
            Na(n);
            break;
          case 4:
            Ia(n);
            break;
          case 31:
            n.memoizedState !== null && et(n);
            break;
          case 13:
            et(n);
            break;
          case 19:
            Ze(Sn, n);
            break;
          case 10:
            lr(n.type, n);
            break;
          case 22:
          case 23:
            et(n), ss(n), e2 !== null && Ze(nu, n);
            break;
          case 24:
            lr(un, n);
        }
      }
      function $r(e2) {
        return (e2.mode & 2) !== Z;
      }
      function Pf(e2, n) {
        $r(e2) ? (hr(), ca(n, e2), pr()) : ca(n, e2);
      }
      function xf(e2, n, o2) {
        $r(e2) ? (hr(), M(o2, e2, n), pr()) : M(o2, e2, n);
      }
      function ca(e2, n) {
        try {
          var o2 = n.updateQueue, i2 = o2 !== null ? o2.lastEffect : null;
          if (i2 !== null) {
            var s = i2.next;
            o2 = s;
            do {
              if ((o2.tag & e2) === e2 && (i2 = void 0, (e2 & Wt) !== sm && (zd = true), i2 = B(n, Bb, o2), (e2 & Wt) !== sm && (zd = false), i2 !== void 0 && typeof i2 != "function")) {
                var u = void 0;
                u = (o2.tag & Rr) !== 0 ? "useLayoutEffect" : (o2.tag & Wt) !== 0 ? "useInsertionEffect" : "useEffect";
                var f = void 0;
                f = i2 === null ? " You returned null. If your effect does not require clean up, return undefined (or nothing)." : typeof i2.then == "function" ? `

It looks like you wrote ` + u + `(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:

` + u + `(() => {
  async function fetchData() {
    // You can await here
    const response = await MyAPI.getData(someId);
    // ...
  }
  fetchData();
}, [someId]); // Or [] if effect doesn't need props or state

Learn more about data fetching with Hooks: https://react.dev/link/hooks-data-fetching` : " You returned: " + i2, B(n, function(p, g) {
                  console.error("%s must not return anything besides a function, which is used for clean-up.%s", p, g);
                }, u, f);
              }
              o2 = o2.next;
            } while (o2 !== s);
          }
        } catch (p) {
          Se(n, n.return, p);
        }
      }
      function M(e2, n, o2) {
        try {
          var i2 = n.updateQueue, s = i2 !== null ? i2.lastEffect : null;
          if (s !== null) {
            var u = s.next;
            i2 = u;
            do {
              if ((i2.tag & e2) === e2) {
                var f = i2.inst, p = f.destroy;
                p !== void 0 && (f.destroy = void 0, (e2 & Wt) !== sm && (zd = true), s = n, B(s, Ob, s, o2, p), (e2 & Wt) !== sm && (zd = false));
              }
              i2 = i2.next;
            } while (i2 !== u);
          }
        } catch (g) {
          Se(n, n.return, g);
        }
      }
      function Yp(e2, n) {
        $r(e2) ? (hr(), ca(n, e2), pr()) : ca(n, e2);
      }
      function zf(e2, n, o2) {
        $r(e2) ? (hr(), M(o2, e2, n), pr()) : M(o2, e2, n);
      }
      function Cf(e2) {
        var n = e2.updateQueue;
        if (n !== null) {
          var o2 = e2.stateNode;
          e2.type.defaultProps || "ref" in e2.memoizedProps || vd || (o2.props !== e2.memoizedProps && console.error("Expected %s props to match memoized props before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", G(e2) || "instance"), o2.state !== e2.memoizedState && console.error("Expected %s state to match memoized state before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", G(e2) || "instance"));
          try {
            B(e2, Xd, n, o2);
          } catch (i2) {
            Se(e2, e2.return, i2);
          }
        }
      }
      function Ts(e2, n, o2) {
        return e2.getSnapshotBeforeUpdate(n, o2);
      }
      function Hm(e2, n) {
        var o2 = n.memoizedProps, i2 = n.memoizedState;
        n = e2.stateNode, e2.type.defaultProps || "ref" in e2.memoizedProps || vd || (n.props !== e2.memoizedProps && console.error("Expected %s props to match memoized props before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", G(e2) || "instance"), n.state !== e2.memoizedState && console.error("Expected %s state to match memoized state before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", G(e2) || "instance"));
        try {
          var s = Mr(e2.type, o2), u = B(e2, Ts, n, s, i2);
          o2 = Yy, u !== void 0 || o2.has(e2.type) || (o2.add(e2.type), B(e2, function() {
            console.error("%s.getSnapshotBeforeUpdate(): A snapshot value (or null) must be returned. You have returned undefined.", G(e2));
          })), n.__reactInternalSnapshotBeforeUpdate = u;
        } catch (f) {
          Se(e2, e2.return, f);
        }
      }
      function Xp(e2, n, o2) {
        o2.props = Mr(e2.type, e2.memoizedProps), o2.state = e2.memoizedState, $r(e2) ? (hr(), B(e2, gy, e2, n, o2), pr()) : B(e2, gy, e2, n, o2);
      }
      function Am(e2) {
        var n = e2.ref;
        if (n !== null) {
          switch (e2.tag) {
            case 26:
            case 27:
            case 5:
              var o2 = ot(e2.stateNode);
              break;
            case 30:
              o2 = e2.stateNode;
              break;
            default:
              o2 = e2.stateNode;
          }
          if (typeof n == "function") {
            if ($r(e2)) try {
              hr(), e2.refCleanup = n(o2);
            } finally {
              pr();
            }
            else e2.refCleanup = n(o2);
          } else typeof n == "string" ? console.error("String refs are no longer supported.") : n.hasOwnProperty("current") || console.error("Unexpected ref object provided for %s. Use either a ref-setter function or React.createRef().", G(e2)), n.current = o2;
        }
      }
      function _s(e2, n) {
        try {
          B(e2, Am, e2);
        } catch (o2) {
          Se(e2, n, o2);
        }
      }
      function Vr(e2, n) {
        var o2 = e2.ref, i2 = e2.refCleanup;
        if (o2 !== null) if (typeof i2 == "function") try {
          if ($r(e2)) try {
            hr(), B(e2, i2);
          } finally {
            pr(e2);
          }
          else B(e2, i2);
        } catch (s) {
          Se(e2, n, s);
        } finally {
          e2.refCleanup = null, e2 = e2.alternate, e2 != null && (e2.refCleanup = null);
        }
        else if (typeof o2 == "function") try {
          if ($r(e2)) try {
            hr(), B(e2, o2, null);
          } finally {
            pr(e2);
          }
          else B(e2, o2, null);
        } catch (s) {
          Se(e2, n, s);
        }
        else o2.current = null;
      }
      function yc(e2, n, o2, i2) {
        var s = e2.memoizedProps, u = s.id, f = s.onCommit;
        s = s.onRender, n = n === null ? "mount" : "update", em && (n = "nested-update"), typeof s == "function" && s(u, n, e2.actualDuration, e2.treeBaseDuration, e2.actualStartTime, o2), typeof f == "function" && f(u, n, i2, o2);
      }
      function Kp(e2, n, o2, i2) {
        var s = e2.memoizedProps;
        e2 = s.id, s = s.onPostCommit, n = n === null ? "mount" : "update", em && (n = "nested-update"), typeof s == "function" && s(e2, n, i2, o2);
      }
      function Rs(e2) {
        var n = e2.type, o2 = e2.memoizedProps, i2 = e2.stateNode;
        try {
          B(e2, Ie, i2, n, o2, e2);
        } catch (s) {
          Se(e2, e2.return, s);
        }
      }
      function bc(e2, n, o2) {
        try {
          B(e2, pn, e2.stateNode, e2.type, o2, n, e2);
        } catch (i2) {
          Se(e2, e2.return, i2);
        }
      }
      function eh(e2) {
        return e2.tag === 5 || e2.tag === 3 || (Re ? e2.tag === 26 : false) || (d ? e2.tag === 27 && j(e2.type) : false) || e2.tag === 4;
      }
      function Tf(e2) {
        e: for (; ; ) {
          for (; e2.sibling === null; ) {
            if (e2.return === null || eh(e2.return)) return null;
            e2 = e2.return;
          }
          for (e2.sibling.return = e2.return, e2 = e2.sibling; e2.tag !== 5 && e2.tag !== 6 && e2.tag !== 18; ) {
            if (d && e2.tag === 27 && j(e2.type) || e2.flags & 2 || e2.child === null || e2.tag === 4) continue e;
            e2.child.return = e2, e2 = e2.child;
          }
          if (!(e2.flags & 2)) return e2.stateNode;
        }
      }
      function Lo(e2, n, o2) {
        var i2 = e2.tag;
        if (i2 === 5 || i2 === 6) e2 = e2.stateNode, n ? dl(o2, e2, n) : Wo(o2, e2);
        else if (i2 !== 4 && (d && i2 === 27 && j(e2.type) && (o2 = e2.stateNode, n = null), e2 = e2.child, e2 !== null)) for (Lo(e2, n, o2), e2 = e2.sibling; e2 !== null; ) Lo(e2, n, o2), e2 = e2.sibling;
      }
      function qt(e2, n, o2) {
        var i2 = e2.tag;
        if (i2 === 5 || i2 === 6) e2 = e2.stateNode, n ? Uc(o2, e2, n) : ln(o2, e2);
        else if (i2 !== 4 && (d && i2 === 27 && j(e2.type) && (o2 = e2.stateNode), e2 = e2.child, e2 !== null)) for (qt(e2, n, o2), e2 = e2.sibling; e2 !== null; ) qt(e2, n, o2), e2 = e2.sibling;
      }
      function $n(e2) {
        for (var n, o2 = e2.return; o2 !== null; ) {
          if (eh(o2)) {
            n = o2;
            break;
          }
          o2 = o2.return;
        }
        if (Be) {
          if (n == null) throw Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
          switch (n.tag) {
            case 27:
              if (d) {
                n = n.stateNode, o2 = Tf(e2), qt(e2, o2, n);
                break;
              }
            case 5:
              o2 = n.stateNode, n.flags & 32 && (fl(o2), n.flags &= -33), n = Tf(e2), qt(e2, n, o2);
              break;
            case 3:
            case 4:
              n = n.stateNode.containerInfo, o2 = Tf(e2), Lo(e2, o2, n);
              break;
            default:
              throw Error("Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.");
          }
        }
      }
      function Sr(e2, n, o2) {
        e2 = e2.containerInfo;
        try {
          B(n, Qc, e2, o2);
        } catch (i2) {
          Se(n, n.return, i2);
        }
      }
      function Hn(e2) {
        var n = e2.stateNode, o2 = e2.memoizedProps;
        try {
          B(e2, y, e2.type, o2, n, e2);
        } catch (i2) {
          Se(e2, e2.return, i2);
        }
      }
      function nh(e2, n) {
        return n.tag === 31 ? (n = n.memoizedState, e2.memoizedState !== null && n === null) : n.tag === 13 ? (e2 = e2.memoizedState, n = n.memoizedState, e2 !== null && e2.dehydrated !== null && (n === null || n.dehydrated === null)) : n.tag === 3 ? e2.memoizedState.isDehydrated && (n.flags & 256) === 0 : false;
      }
      function jm(e2, n) {
        for (Ws(e2.containerInfo), Gn = n; Gn !== null; ) if (e2 = Gn, n = e2.child, (e2.subtreeFlags & 1028) !== 0 && n !== null) n.return = e2, Gn = n;
        else for (; Gn !== null; ) {
          n = e2 = Gn;
          var o2 = n.alternate, i2 = n.flags;
          switch (n.tag) {
            case 0:
              if ((i2 & 4) !== 0 && (n = n.updateQueue, n = n !== null ? n.events : null, n !== null)) for (o2 = 0; o2 < n.length; o2++) i2 = n[o2], i2.ref.impl = i2.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              (i2 & 1024) !== 0 && o2 !== null && Hm(n, o2);
              break;
            case 3:
              (i2 & 1024) !== 0 && Be && qf(n.stateNode.containerInfo);
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((i2 & 1024) !== 0) throw Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
          }
          if (n = e2.sibling, n !== null) {
            n.return = e2.return, Gn = n;
            break;
          }
          Gn = e2.return;
        }
      }
      function yn(e2, n, o2) {
        var i2 = Xn(), s = Dr(), u = dr(), f = fr(), p = o2.flags;
        switch (o2.tag) {
          case 0:
          case 11:
          case 15:
            rt(e2, o2), p & 4 && Pf(o2, Rr | lo);
            break;
          case 1:
            if (rt(e2, o2), p & 4) if (e2 = o2.stateNode, n === null) o2.type.defaultProps || "ref" in o2.memoizedProps || vd || (e2.props !== o2.memoizedProps && console.error("Expected %s props to match memoized props before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", G(o2) || "instance"), e2.state !== o2.memoizedState && console.error("Expected %s state to match memoized state before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", G(o2) || "instance")), $r(o2) ? (hr(), B(o2, mg, o2, e2), pr()) : B(o2, mg, o2, e2);
            else {
              var g = Mr(o2.type, n.memoizedProps);
              n = n.memoizedState, o2.type.defaultProps || "ref" in o2.memoizedProps || vd || (e2.props !== o2.memoizedProps && console.error("Expected %s props to match memoized props before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", G(o2) || "instance"), e2.state !== o2.memoizedState && console.error("Expected %s state to match memoized state before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", G(o2) || "instance")), $r(o2) ? (hr(), B(o2, py, o2, e2, g, n, e2.__reactInternalSnapshotBeforeUpdate), pr()) : B(o2, py, o2, e2, g, n, e2.__reactInternalSnapshotBeforeUpdate);
            }
            p & 64 && Cf(o2), p & 512 && _s(o2, o2.return);
            break;
          case 3:
            if (n = jr(), rt(e2, o2), p & 64 && (p = o2.updateQueue, p !== null)) {
              if (g = null, o2.child !== null) switch (o2.child.tag) {
                case 27:
                case 5:
                  g = ot(o2.child.stateNode);
                  break;
                case 1:
                  g = o2.child.stateNode;
              }
              try {
                B(o2, Xd, p, g);
              } catch (T) {
                Se(o2, o2.return, T);
              }
            }
            e2.effectDuration += ql(n);
            break;
          case 27:
            d && n === null && p & 4 && Hn(o2);
          case 26:
          case 5:
            if (rt(e2, o2), n === null) {
              if (p & 4) Rs(o2);
              else if (p & 64) {
                e2 = o2.type, n = o2.memoizedProps, g = o2.stateNode;
                try {
                  B(o2, Gf, g, e2, n, o2);
                } catch (T) {
                  Se(o2, o2.return, T);
                }
              }
            }
            p & 512 && _s(o2, o2.return);
            break;
          case 12:
            if (p & 4) {
              p = jr(), rt(e2, o2), e2 = o2.stateNode, e2.effectDuration += ji(p);
              try {
                B(o2, yc, o2, n, wl, e2.effectDuration);
              } catch (T) {
                Se(o2, o2.return, T);
              }
            } else rt(e2, o2);
            break;
          case 31:
            rt(e2, o2), p & 4 && th(e2, o2);
            break;
          case 13:
            rt(e2, o2), p & 4 && rh(e2, o2), p & 64 && (e2 = o2.memoizedState, e2 !== null && (e2 = e2.dehydrated, e2 !== null && (p = Nh.bind(null, o2), mn(e2, p))));
            break;
          case 22:
            if (p = o2.memoizedState !== null || Si, !p) {
              n = n !== null && n.memoizedState !== null || Tn, g = Si;
              var S = Tn;
              Si = p, (Tn = n) && !S ? (Gr(e2, o2, (o2.subtreeFlags & 8772) !== 0), (o2.mode & 2) !== Z && 0 <= $ && 0 <= q && 0.05 < q - $ && _i(o2, $, q)) : rt(e2, o2), Si = g, Tn = S;
            }
            break;
          case 30:
            break;
          default:
            rt(e2, o2);
        }
        (o2.mode & 2) !== Z && 0 <= $ && 0 <= q && ((cn || 0.05 < en) && Un(o2, $, q, en, Je), o2.alternate === null && o2.return !== null && o2.return.alternate !== null && 0.05 < q - $ && (nh(o2.return.alternate, o2.return) || Ot(o2, $, q, "Mount"))), mt(i2), cr(s), Je = u, cn = f;
      }
      function qr(e2) {
        var n = e2.alternate;
        n !== null && (e2.alternate = null, qr(n)), e2.child = null, e2.deletions = null, e2.sibling = null, e2.tag === 5 && (n = e2.stateNode, n !== null && Qf(n)), e2.stateNode = null, e2._debugOwner = null, e2.return = null, e2.dependencies = null, e2.memoizedProps = null, e2.memoizedState = null, e2.pendingProps = null, e2.stateNode = null, e2.updateQueue = null;
      }
      function kr(e2, n, o2) {
        for (o2 = o2.child; o2 !== null; ) _f(e2, n, o2), o2 = o2.sibling;
      }
      function _f(e2, n, o2) {
        if (zt && typeof zt.onCommitFiberUnmount == "function") try {
          zt.onCommitFiberUnmount(td, o2);
        } catch (S) {
          ka || (ka = true, console.error("React instrumentation encountered an error: %o", S));
        }
        var i2 = Xn(), s = Dr(), u = dr(), f = fr();
        switch (o2.tag) {
          case 26:
            if (Re) {
              Tn || Vr(o2, n), kr(e2, n, o2), o2.memoizedState ? ed(o2.memoizedState) : o2.stateNode && nd(o2.stateNode);
              break;
            }
          case 27:
            if (d) {
              Tn || Vr(o2, n);
              var p = _n, g = nr;
              j(o2.type) && (_n = o2.stateNode, nr = false), kr(e2, n, o2), B(o2, R, o2.stateNode), _n = p, nr = g;
              break;
            }
          case 5:
            Tn || Vr(o2, n);
          case 6:
            if (Be) {
              if (p = _n, g = nr, _n = null, kr(e2, n, o2), _n = p, nr = g, _n !== null) if (nr) try {
                B(o2, Bc, _n, o2.stateNode);
              } catch (S) {
                Se(o2, n, S);
              }
              else try {
                B(o2, oi, _n, o2.stateNode);
              } catch (S) {
                Se(o2, n, S);
              }
            } else kr(e2, n, o2);
            break;
          case 18:
            Be && _n !== null && (nr ? hl(_n, o2.stateNode) : At(_n, o2.stateNode));
            break;
          case 4:
            Be ? (p = _n, g = nr, _n = o2.stateNode.containerInfo, nr = true, kr(e2, n, o2), _n = p, nr = g) : (Xr && Sr(o2.stateNode, o2, Oc()), kr(e2, n, o2));
            break;
          case 0:
          case 11:
          case 14:
          case 15:
            M(Wt, o2, n), Tn || xf(o2, n, Rr), kr(e2, n, o2);
            break;
          case 1:
            Tn || (Vr(o2, n), p = o2.stateNode, typeof p.componentWillUnmount == "function" && Xp(o2, n, p)), kr(e2, n, o2);
            break;
          case 21:
            kr(e2, n, o2);
            break;
          case 22:
            Tn = (p = Tn) || o2.memoizedState !== null, kr(e2, n, o2), Tn = p;
            break;
          default:
            kr(e2, n, o2);
        }
        (o2.mode & 2) !== Z && 0 <= $ && 0 <= q && (cn || 0.05 < en) && Un(o2, $, q, en, Je), mt(i2), cr(s), Je = u, cn = f;
      }
      function th(e2, n) {
        if (qn && n.memoizedState === null && (e2 = n.alternate, e2 !== null && (e2 = e2.memoizedState, e2 !== null))) {
          e2 = e2.dehydrated;
          try {
            B(n, Xe, e2);
          } catch (o2) {
            Se(n, n.return, o2);
          }
        }
      }
      function rh(e2, n) {
        if (qn && n.memoizedState === null && (e2 = n.alternate, e2 !== null && (e2 = e2.memoizedState, e2 !== null && (e2 = e2.dehydrated, e2 !== null)))) try {
          B(n, ba, e2);
        } catch (o2) {
          Se(n, n.return, o2);
        }
      }
      function Dm(e2) {
        switch (e2.tag) {
          case 31:
          case 13:
          case 19:
            var n = e2.stateNode;
            return n === null && (n = e2.stateNode = new Xy()), n;
          case 22:
            return e2 = e2.stateNode, n = e2._retryCache, n === null && (n = e2._retryCache = new Xy()), n;
          default:
            throw Error("Unexpected Suspense handler tag (" + e2.tag + "). This is a bug in React.");
        }
      }
      function Yi(e2, n) {
        var o2 = Dm(e2);
        n.forEach(function(i2) {
          if (!o2.has(i2)) {
            if (o2.add(i2), wa) if (Sd !== null && kd !== null) nl(kd, Sd);
            else throw Error("Expected finished root and lanes to be set. This is a bug in React.");
            var s = $m.bind(null, e2, i2);
            i2.then(s, s);
          }
        });
      }
      function An(e2, n) {
        var o2 = n.deletions;
        if (o2 !== null) for (var i2 = 0; i2 < o2.length; i2++) {
          var s = e2, u = n, f = o2[i2], p = Xn();
          if (Be) {
            var g = u;
            e: for (; g !== null; ) {
              switch (g.tag) {
                case 27:
                  if (d) {
                    if (j(g.type)) {
                      _n = g.stateNode, nr = false;
                      break e;
                    }
                    break;
                  }
                case 5:
                  _n = g.stateNode, nr = false;
                  break e;
                case 3:
                case 4:
                  _n = g.stateNode.containerInfo, nr = true;
                  break e;
              }
              g = g.return;
            }
            if (_n === null) throw Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
            _f(s, u, f), _n = null, nr = false;
          } else _f(s, u, f);
          (f.mode & 2) !== Z && 0 <= $ && 0 <= q && 0.05 < q - $ && Ot(f, $, q, "Unmount"), mt(p), s = f, u = s.alternate, u !== null && (u.return = null), s.return = null;
        }
        if (n.subtreeFlags & 13886) for (n = n.child; n !== null; ) oh(n, e2), n = n.sibling;
      }
      function oh(e2, n) {
        var o2 = Xn(), i2 = Dr(), s = dr(), u = fr(), f = e2.alternate, p = e2.flags;
        switch (e2.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            An(n, e2), Vn(e2), p & 4 && (M(Wt | lo, e2, e2.return), ca(Wt | lo, e2), xf(e2, e2.return, Rr | lo));
            break;
          case 1:
            An(n, e2), Vn(e2), p & 512 && (Tn || f === null || Vr(f, f.return)), p & 64 && Si && (p = e2.updateQueue, p !== null && (f = p.callbacks, f !== null && (n = p.shared.hiddenCallbacks, p.shared.hiddenCallbacks = n === null ? f : n.concat(f))));
            break;
          case 26:
            if (Re) {
              var g = Vo;
              An(n, e2), Vn(e2), p & 512 && (Tn || f === null || Vr(f, f.return)), p & 4 && (p = f !== null ? f.memoizedState : null, n = e2.memoizedState, f === null ? n === null ? e2.stateNode === null ? e2.stateNode = $h(g, e2.type, e2.memoizedProps, e2) : gl(g, e2.type, e2.stateNode) : e2.stateNode = Kc(g, n, e2.memoizedProps) : p !== n ? (p === null ? f.stateNode !== null && nd(f.stateNode) : ed(p), n === null ? gl(g, e2.type, e2.stateNode) : Kc(g, n, e2.memoizedProps)) : n === null && e2.stateNode !== null && bc(e2, e2.memoizedProps, f.memoizedProps));
              break;
            }
          case 27:
            if (d) {
              An(n, e2), Vn(e2), p & 512 && (Tn || f === null || Vr(f, f.return)), f !== null && p & 4 && bc(e2, e2.memoizedProps, f.memoizedProps);
              break;
            }
          case 5:
            if (An(n, e2), Vn(e2), p & 512 && (Tn || f === null || Vr(f, f.return)), Be) {
              if (e2.flags & 32) {
                n = e2.stateNode;
                try {
                  B(e2, fl, n);
                } catch (Fe) {
                  Se(e2, e2.return, Fe);
                }
              }
              p & 4 && e2.stateNode != null && (n = e2.memoizedProps, bc(e2, n, f !== null ? f.memoizedProps : n)), p & 1024 && (Rg = true, e2.type !== "form" && console.error("Unexpected host component type. Expected a form. This is a bug in React."));
            } else Xr && e2.alternate !== null && (e2.alternate.stateNode = e2.stateNode);
            break;
          case 6:
            if (An(n, e2), Vn(e2), p & 4 && Be) {
              if (e2.stateNode === null) throw Error("This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.");
              p = e2.memoizedProps, f = f !== null ? f.memoizedProps : p, n = e2.stateNode;
              try {
                B(e2, ne, n, f, p);
              } catch (Fe) {
                Se(e2, e2.return, Fe);
              }
            }
            break;
          case 3:
            if (g = jr(), Re) {
              r2();
              var S = Vo;
              Vo = Sa(n.containerInfo), An(n, e2), Vo = S;
            } else An(n, e2);
            if (Vn(e2), p & 4) {
              if (Be && qn && f !== null && f.memoizedState.isDehydrated) try {
                B(e2, Uo, n.containerInfo);
              } catch (Fe) {
                Se(e2, e2.return, Fe);
              }
              if (Xr) {
                p = n.containerInfo, f = n.pendingChildren;
                try {
                  B(e2, Qc, p, f);
                } catch (Fe) {
                  Se(e2, e2.return, Fe);
                }
              }
            }
            Rg && (Rg = false, ah(e2)), n.effectDuration += ql(g);
            break;
          case 4:
            Re ? (f = Vo, Vo = Sa(e2.stateNode.containerInfo), An(n, e2), Vn(e2), Vo = f) : (An(n, e2), Vn(e2)), p & 4 && Xr && Sr(e2.stateNode, e2, e2.stateNode.pendingChildren);
            break;
          case 12:
            p = jr(), An(n, e2), Vn(e2), e2.stateNode.effectDuration += ji(p);
            break;
          case 31:
            An(n, e2), Vn(e2), p & 4 && (p = e2.updateQueue, p !== null && (e2.updateQueue = null, Yi(e2, p)));
            break;
          case 13:
            An(n, e2), Vn(e2), e2.child.flags & 8192 && e2.memoizedState !== null != (f !== null && f.memoizedState !== null) && (xm = me()), p & 4 && (p = e2.updateQueue, p !== null && (e2.updateQueue = null, Yi(e2, p)));
            break;
          case 22:
            g = e2.memoizedState !== null;
            var T = f !== null && f.memoizedState !== null, _ = Si, I = Tn;
            if (Si = _ || g, Tn = I || T, An(n, e2), Tn = I, Si = _, T && !g && !_ && !I && (e2.mode & 2) !== Z && 0 <= $ && 0 <= q && 0.05 < q - $ && _i(e2, $, q), Vn(e2), p & 8192 && (n = e2.stateNode, n._visibility = g ? n._visibility & ~pp : n._visibility | pp, !g || f === null || T || Si || Tn || (qa(e2), (e2.mode & 2) !== Z && 0 <= $ && 0 <= q && 0.05 < q - $ && Ot(e2, $, q, "Disconnect")), Be)) {
              e: if (f = null, Be) for (n = e2; ; ) {
                if (n.tag === 5 || Re && n.tag === 26) {
                  if (f === null) {
                    T = f = n;
                    try {
                      S = T.stateNode, g ? B(T, pl, S) : B(T, Os, T.stateNode, T.memoizedProps);
                    } catch (Fe) {
                      Se(T, T.return, Fe);
                    }
                  }
                } else if (n.tag === 6) {
                  if (f === null) {
                    T = n;
                    try {
                      var O = T.stateNode;
                      g ? B(T, Jm, O) : B(T, Mh, O, T.memoizedProps);
                    } catch (Fe) {
                      Se(T, T.return, Fe);
                    }
                  }
                } else if (n.tag === 18) {
                  if (f === null) {
                    T = n;
                    try {
                      var K = T.stateNode;
                      g ? B(T, $s, K) : B(T, xt, T.stateNode);
                    } catch (Fe) {
                      Se(T, T.return, Fe);
                    }
                  }
                } else if ((n.tag !== 22 && n.tag !== 23 || n.memoizedState === null || n === e2) && n.child !== null) {
                  n.child.return = n, n = n.child;
                  continue;
                }
                if (n === e2) break e;
                for (; n.sibling === null; ) {
                  if (n.return === null || n.return === e2) break e;
                  f === n && (f = null), n = n.return;
                }
                f === n && (f = null), n.sibling.return = n.return, n = n.sibling;
              }
            }
            p & 4 && (p = e2.updateQueue, p !== null && (f = p.retryQueue, f !== null && (p.retryQueue = null, Yi(e2, f))));
            break;
          case 19:
            An(n, e2), Vn(e2), p & 4 && (p = e2.updateQueue, p !== null && (e2.updateQueue = null, Yi(e2, p)));
            break;
          case 30:
            break;
          case 21:
            break;
          default:
            An(n, e2), Vn(e2);
        }
        (e2.mode & 2) !== Z && 0 <= $ && 0 <= q && ((cn || 0.05 < en) && Un(e2, $, q, en, Je), e2.alternate === null && e2.return !== null && e2.return.alternate !== null && 0.05 < q - $ && (nh(e2.return.alternate, e2.return) || Ot(e2, $, q, "Mount"))), mt(o2), cr(i2), Je = s, cn = u;
      }
      function Vn(e2) {
        var n = e2.flags;
        if (n & 2) {
          try {
            B(e2, $n, e2);
          } catch (o2) {
            Se(e2, e2.return, o2);
          }
          e2.flags &= -3;
        }
        n & 4096 && (e2.flags &= -4097);
      }
      function ah(e2) {
        if (e2.subtreeFlags & 1024) for (e2 = e2.child; e2 !== null; ) {
          var n = e2;
          ah(n), n.tag === 5 && n.flags & 1024 && Bs(n.stateNode), e2 = e2.sibling;
        }
      }
      function rt(e2, n) {
        if (n.subtreeFlags & 8772) for (n = n.child; n !== null; ) yn(e2, n.alternate, n), n = n.sibling;
      }
      function da(e2) {
        var n = Xn(), o2 = Dr(), i2 = dr(), s = fr();
        switch (e2.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            xf(e2, e2.return, Rr), qa(e2);
            break;
          case 1:
            Vr(e2, e2.return);
            var u = e2.stateNode;
            typeof u.componentWillUnmount == "function" && Xp(e2, e2.return, u), qa(e2);
            break;
          case 27:
            d && B(e2, R, e2.stateNode);
          case 26:
          case 5:
            Vr(e2, e2.return), qa(e2);
            break;
          case 22:
            e2.memoizedState === null && qa(e2);
            break;
          case 30:
            qa(e2);
            break;
          default:
            qa(e2);
        }
        (e2.mode & 2) !== Z && 0 <= $ && 0 <= q && (cn || 0.05 < en) && Un(e2, $, q, en, Je), mt(n), cr(o2), Je = i2, cn = s;
      }
      function qa(e2) {
        for (e2 = e2.child; e2 !== null; ) da(e2), e2 = e2.sibling;
      }
      function ih(e2, n, o2, i2) {
        var s = Xn(), u = Dr(), f = dr(), p = fr(), g = o2.flags;
        switch (o2.tag) {
          case 0:
          case 11:
          case 15:
            Gr(e2, o2, i2), Pf(o2, Rr);
            break;
          case 1:
            if (Gr(e2, o2, i2), n = o2.stateNode, typeof n.componentDidMount == "function" && B(o2, mg, o2, n), n = o2.updateQueue, n !== null) {
              e2 = o2.stateNode;
              try {
                B(o2, Yd, n, e2);
              } catch (S) {
                Se(o2, o2.return, S);
              }
            }
            i2 && g & 64 && Cf(o2), _s(o2, o2.return);
            break;
          case 27:
            d && Hn(o2);
          case 26:
          case 5:
            Gr(e2, o2, i2), i2 && n === null && g & 4 && Rs(o2), _s(o2, o2.return);
            break;
          case 12:
            if (i2 && g & 4) {
              g = jr(), Gr(e2, o2, i2), i2 = o2.stateNode, i2.effectDuration += ji(g);
              try {
                B(o2, yc, o2, n, wl, i2.effectDuration);
              } catch (S) {
                Se(o2, o2.return, S);
              }
            } else Gr(e2, o2, i2);
            break;
          case 31:
            Gr(e2, o2, i2), i2 && g & 4 && th(e2, o2);
            break;
          case 13:
            Gr(e2, o2, i2), i2 && g & 4 && rh(e2, o2);
            break;
          case 22:
            o2.memoizedState === null && Gr(e2, o2, i2), _s(o2, o2.return);
            break;
          case 30:
            break;
          default:
            Gr(e2, o2, i2);
        }
        (o2.mode & 2) !== Z && 0 <= $ && 0 <= q && (cn || 0.05 < en) && Un(o2, $, q, en, Je), mt(s), cr(u), Je = f, cn = p;
      }
      function Gr(e2, n, o2) {
        for (o2 = o2 && (n.subtreeFlags & 8772) !== 0, n = n.child; n !== null; ) ih(e2, n.alternate, n, o2), n = n.sibling;
      }
      function Ga(e2, n) {
        var o2 = null;
        e2 !== null && e2.memoizedState !== null && e2.memoizedState.cachePool !== null && (o2 = e2.memoizedState.cachePool.pool), e2 = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (e2 = n.memoizedState.cachePool.pool), e2 !== o2 && (e2 != null && Po(e2), o2 != null && Da(o2));
      }
      function Rf(e2, n) {
        e2 = null, n.alternate !== null && (e2 = n.alternate.memoizedState.cache), n = n.memoizedState.cache, n !== e2 && (Po(n), e2 != null && Da(e2));
      }
      function wr(e2, n, o2, i2, s) {
        if (n.subtreeFlags & 10256 || n.actualDuration !== 0 && (n.alternate === null || n.alternate.child !== n.child)) for (n = n.child; n !== null; ) {
          var u = n.sibling;
          lh(e2, n, o2, i2, u !== null ? u.actualStartTime : s), n = u;
        }
      }
      function lh(e2, n, o2, i2, s) {
        var u = Xn(), f = Dr(), p = dr(), g = fr(), S = yl, T = n.flags;
        switch (n.tag) {
          case 0:
          case 11:
          case 15:
            (n.mode & 2) !== Z && 0 < n.actualStartTime && (n.flags & 1) !== 0 && po(n, n.actualStartTime, s, Wn, o2), wr(e2, n, o2, i2, s), T & 2048 && Yp(n, Ut | lo);
            break;
          case 1:
            (n.mode & 2) !== Z && 0 < n.actualStartTime && ((n.flags & 128) !== 0 ? Ri(n, n.actualStartTime, s, []) : (n.flags & 1) !== 0 && po(n, n.actualStartTime, s, Wn, o2)), wr(e2, n, o2, i2, s);
            break;
          case 3:
            var _ = jr(), I = Wn;
            Wn = n.alternate !== null && n.alternate.memoizedState.isDehydrated && (n.flags & 256) === 0, wr(e2, n, o2, i2, s), Wn = I, T & 2048 && (o2 = null, n.alternate !== null && (o2 = n.alternate.memoizedState.cache), i2 = n.memoizedState.cache, i2 !== o2 && (Po(i2), o2 != null && Da(o2))), e2.passiveEffectDuration += ql(_);
            break;
          case 12:
            if (T & 2048) {
              T = jr(), wr(e2, n, o2, i2, s), e2 = n.stateNode, e2.passiveEffectDuration += ji(T);
              try {
                B(n, Kp, n, n.alternate, wl, e2.passiveEffectDuration);
              } catch (O) {
                Se(n, n.return, O);
              }
            } else wr(e2, n, o2, i2, s);
            break;
          case 31:
            T = Wn, _ = n.alternate !== null ? n.alternate.memoizedState : null, I = n.memoizedState, _ !== null && I === null ? (I = n.deletions, I !== null && 0 < I.length && I[0].tag === 18 ? (Wn = false, _ = _.hydrationErrors, _ !== null && Ri(n, n.actualStartTime, s, _)) : Wn = true) : Wn = false, wr(e2, n, o2, i2, s), Wn = T;
            break;
          case 13:
            T = Wn, _ = n.alternate !== null ? n.alternate.memoizedState : null, I = n.memoizedState, _ === null || _.dehydrated === null || I !== null && I.dehydrated !== null ? Wn = false : (I = n.deletions, I !== null && 0 < I.length && I[0].tag === 18 ? (Wn = false, _ = _.hydrationErrors, _ !== null && Ri(n, n.actualStartTime, s, _)) : Wn = true), wr(e2, n, o2, i2, s), Wn = T;
            break;
          case 23:
            break;
          case 22:
            I = n.stateNode, _ = n.alternate, n.memoizedState !== null ? I._visibility & gi ? wr(e2, n, o2, i2, s) : Es(e2, n, o2, i2, s) : I._visibility & gi ? wr(e2, n, o2, i2, s) : (I._visibility |= gi, Jr(e2, n, o2, i2, (n.subtreeFlags & 10256) !== 0 || n.actualDuration !== 0 && (n.alternate === null || n.alternate.child !== n.child), s), (n.mode & 2) === Z || Wn || (e2 = n.actualStartTime, 0 <= e2 && 0.05 < s - e2 && _i(n, e2, s), 0 <= $ && 0 <= q && 0.05 < q - $ && _i(n, $, q))), T & 2048 && Ga(_, n);
            break;
          case 24:
            wr(e2, n, o2, i2, s), T & 2048 && Rf(n.alternate, n);
            break;
          default:
            wr(e2, n, o2, i2, s);
        }
        (n.mode & 2) !== Z && ((e2 = !Wn && n.alternate === null && n.return !== null && n.return.alternate !== null) && (o2 = n.actualStartTime, 0 <= o2 && 0.05 < s - o2 && Ot(n, o2, s, "Mount")), 0 <= $ && 0 <= q && ((cn || 0.05 < en) && Un(n, $, q, en, Je), e2 && 0.05 < q - $ && Ot(n, $, q, "Mount"))), mt(u), cr(f), Je = p, cn = g, yl = S;
      }
      function Jr(e2, n, o2, i2, s, u) {
        for (s = s && ((n.subtreeFlags & 10256) !== 0 || n.actualDuration !== 0 && (n.alternate === null || n.alternate.child !== n.child)), n = n.child; n !== null; ) {
          var f = n.sibling;
          sh(e2, n, o2, i2, s, f !== null ? f.actualStartTime : u), n = f;
        }
      }
      function sh(e2, n, o2, i2, s, u) {
        var f = Xn(), p = Dr(), g = dr(), S = fr(), T = yl;
        s && (n.mode & 2) !== Z && 0 < n.actualStartTime && (n.flags & 1) !== 0 && po(n, n.actualStartTime, u, Wn, o2);
        var _ = n.flags;
        switch (n.tag) {
          case 0:
          case 11:
          case 15:
            Jr(e2, n, o2, i2, s, u), Yp(n, Ut);
            break;
          case 23:
            break;
          case 22:
            var I = n.stateNode;
            n.memoizedState !== null ? I._visibility & gi ? Jr(e2, n, o2, i2, s, u) : Es(e2, n, o2, i2, u) : (I._visibility |= gi, Jr(e2, n, o2, i2, s, u)), s && _ & 2048 && Ga(n.alternate, n);
            break;
          case 24:
            Jr(e2, n, o2, i2, s, u), s && _ & 2048 && Rf(n.alternate, n);
            break;
          default:
            Jr(e2, n, o2, i2, s, u);
        }
        (n.mode & 2) !== Z && 0 <= $ && 0 <= q && (cn || 0.05 < en) && Un(n, $, q, en, Je), mt(f), cr(p), Je = g, cn = S, yl = T;
      }
      function Es(e2, n, o2, i2, s) {
        if (n.subtreeFlags & 10256 || n.actualDuration !== 0 && (n.alternate === null || n.alternate.child !== n.child)) for (var u = n.child; u !== null; ) {
          n = u.sibling;
          var f = e2, p = o2, g = i2, S = n !== null ? n.actualStartTime : s, T = yl;
          (u.mode & 2) !== Z && 0 < u.actualStartTime && (u.flags & 1) !== 0 && po(u, u.actualStartTime, S, Wn, p);
          var _ = u.flags;
          switch (u.tag) {
            case 22:
              Es(f, u, p, g, S), _ & 2048 && Ga(u.alternate, u);
              break;
            case 24:
              Es(f, u, p, g, S), _ & 2048 && Rf(u.alternate, u);
              break;
            default:
              Es(f, u, p, g, S);
          }
          yl = T, u = n;
        }
      }
      function Ja(e2, n, o2) {
        if (e2.subtreeFlags & wd) for (e2 = e2.child; e2 !== null; ) uh(e2, n, o2), e2 = e2.sibling;
      }
      function uh(e2, n, o2) {
        switch (e2.tag) {
          case 26:
            if (Ja(e2, n, o2), e2.flags & wd) if (e2.memoizedState !== null) c(o2, Vo, e2.memoizedState, e2.memoizedProps);
            else {
              var i2 = e2.stateNode, s = e2.type;
              e2 = e2.memoizedProps, ((n & 335544128) === n || Hc(s, e2)) && Ac(o2, i2, s, e2);
            }
            break;
          case 5:
            Ja(e2, n, o2), e2.flags & wd && (i2 = e2.stateNode, s = e2.type, e2 = e2.memoizedProps, ((n & 335544128) === n || Hc(s, e2)) && Ac(o2, i2, s, e2));
            break;
          case 3:
          case 4:
            Re ? (i2 = Vo, Vo = Sa(e2.stateNode.containerInfo), Ja(e2, n, o2), Vo = i2) : Ja(e2, n, o2);
            break;
          case 22:
            e2.memoizedState === null && (i2 = e2.alternate, i2 !== null && i2.memoizedState !== null ? (i2 = wd, wd = 16777216, Ja(e2, n, o2), wd = i2) : Ja(e2, n, o2));
            break;
          default:
            Ja(e2, n, o2);
        }
      }
      function ch(e2) {
        var n = e2.alternate;
        if (n !== null && (e2 = n.child, e2 !== null)) {
          n.child = null;
          do
            n = e2.sibling, e2.sibling = null, e2 = n;
          while (e2 !== null);
        }
      }
      function Is(e2) {
        var n = e2.deletions;
        if ((e2.flags & 16) !== 0) {
          if (n !== null) for (var o2 = 0; o2 < n.length; o2++) {
            var i2 = n[o2], s = Xn();
            Gn = i2, ph(i2, e2), (i2.mode & 2) !== Z && 0 <= $ && 0 <= q && 0.05 < q - $ && Ot(i2, $, q, "Unmount"), mt(s);
          }
          ch(e2);
        }
        if (e2.subtreeFlags & 10256) for (e2 = e2.child; e2 !== null; ) dh(e2), e2 = e2.sibling;
      }
      function dh(e2) {
        var n = Xn(), o2 = Dr(), i2 = dr(), s = fr();
        switch (e2.tag) {
          case 0:
          case 11:
          case 15:
            Is(e2), e2.flags & 2048 && zf(e2, e2.return, Ut | lo);
            break;
          case 3:
            var u = jr();
            Is(e2), e2.stateNode.passiveEffectDuration += ql(u);
            break;
          case 12:
            u = jr(), Is(e2), e2.stateNode.passiveEffectDuration += ji(u);
            break;
          case 22:
            u = e2.stateNode, e2.memoizedState !== null && u._visibility & gi && (e2.return === null || e2.return.tag !== 13) ? (u._visibility &= ~gi, vc(e2), (e2.mode & 2) !== Z && 0 <= $ && 0 <= q && 0.05 < q - $ && Ot(e2, $, q, "Disconnect")) : Is(e2);
            break;
          default:
            Is(e2);
        }
        (e2.mode & 2) !== Z && 0 <= $ && 0 <= q && (cn || 0.05 < en) && Un(e2, $, q, en, Je), mt(n), cr(o2), cn = s, Je = i2;
      }
      function vc(e2) {
        var n = e2.deletions;
        if ((e2.flags & 16) !== 0) {
          if (n !== null) for (var o2 = 0; o2 < n.length; o2++) {
            var i2 = n[o2], s = Xn();
            Gn = i2, ph(i2, e2), (i2.mode & 2) !== Z && 0 <= $ && 0 <= q && 0.05 < q - $ && Ot(i2, $, q, "Unmount"), mt(s);
          }
          ch(e2);
        }
        for (e2 = e2.child; e2 !== null; ) fh(e2), e2 = e2.sibling;
      }
      function fh(e2) {
        var n = Xn(), o2 = Dr(), i2 = dr(), s = fr();
        switch (e2.tag) {
          case 0:
          case 11:
          case 15:
            zf(e2, e2.return, Ut), vc(e2);
            break;
          case 22:
            var u = e2.stateNode;
            u._visibility & gi && (u._visibility &= ~gi, vc(e2));
            break;
          default:
            vc(e2);
        }
        (e2.mode & 2) !== Z && 0 <= $ && 0 <= q && (cn || 0.05 < en) && Un(e2, $, q, en, Je), mt(n), cr(o2), cn = s, Je = i2;
      }
      function ph(e2, n) {
        for (; Gn !== null; ) {
          var o2 = Gn, i2 = o2, s = n, u = Xn(), f = Dr(), p = dr(), g = fr();
          switch (i2.tag) {
            case 0:
            case 11:
            case 15:
              zf(i2, s, Ut);
              break;
            case 23:
            case 22:
              i2.memoizedState !== null && i2.memoizedState.cachePool !== null && (s = i2.memoizedState.cachePool.pool, s != null && Po(s));
              break;
            case 24:
              Da(i2.memoizedState.cache);
          }
          if ((i2.mode & 2) !== Z && 0 <= $ && 0 <= q && (cn || 0.05 < en) && Un(i2, $, q, en, Je), mt(u), cr(f), cn = g, Je = p, i2 = o2.child, i2 !== null) i2.return = o2, Gn = i2;
          else e: for (o2 = e2; Gn !== null; ) {
            if (i2 = Gn, u = i2.sibling, f = i2.return, qr(i2), i2 === o2) {
              Gn = null;
              break e;
            }
            if (u !== null) {
              u.return = f, Gn = u;
              break e;
            }
            Gn = f;
          }
        }
      }
      function Ef(e2) {
        var n = Gm(e2);
        if (n != null) {
          if (typeof n.memoizedProps["data-testname"] != "string") throw Error("Invalid host root specified. Should be either a React container or a node with a testname attribute.");
          return n;
        }
        if (e2 = $f(e2), e2 === null) throw Error("Could not find React container within specified host subtree.");
        return e2.stateNode.current;
      }
      function If(e2, n) {
        var o2 = e2.tag;
        switch (n.$$typeof) {
          case pm:
            if (e2.type === n.value) return true;
            break;
          case hm:
            e: {
              for (n = n.value, e2 = [e2, 0], o2 = 0; o2 < e2.length; ) {
                var i2 = e2[o2++], s = i2.tag, u = e2[o2++], f = n[u];
                if (s !== 5 && s !== 26 && s !== 27 || !Kr(i2)) {
                  for (; f != null && If(i2, f); ) u++, f = n[u];
                  if (u === n.length) {
                    n = true;
                    break e;
                  } else for (i2 = i2.child; i2 !== null; ) e2.push(i2, u), i2 = i2.sibling;
                }
              }
              n = false;
            }
            return n;
          case mm:
            if ((o2 === 5 || o2 === 26 || o2 === 27) && Wc(e2.stateNode, n.value)) return true;
            break;
          case ym:
            if ((o2 === 5 || o2 === 6 || o2 === 26 || o2 === 27) && (e2 = Vf(e2), e2 !== null && 0 <= e2.indexOf(n.value))) return true;
            break;
          case gm:
            if ((o2 === 5 || o2 === 26 || o2 === 27) && (e2 = e2.memoizedProps["data-testname"], typeof e2 == "string" && e2.toLowerCase() === n.value.toLowerCase())) return true;
            break;
          default:
            throw Error("Invalid selector type specified.");
        }
        return false;
      }
      function Sc(e2) {
        switch (e2.$$typeof) {
          case pm:
            return "<" + ($e(e2.value) || "Unknown") + ">";
          case hm:
            return ":has(" + (Sc(e2) || "") + ")";
          case mm:
            return '[role="' + e2.value + '"]';
          case ym:
            return '"' + e2.value + '"';
          case gm:
            return '[data-testname="' + e2.value + '"]';
          default:
            throw Error("Invalid selector type specified.");
        }
      }
      function hh(e2, n) {
        var o2 = [];
        e2 = [e2, 0];
        for (var i2 = 0; i2 < e2.length; ) {
          var s = e2[i2++], u = s.tag, f = e2[i2++], p = n[f];
          if (u !== 5 && u !== 26 && u !== 27 || !Kr(s)) {
            for (; p != null && If(s, p); ) f++, p = n[f];
            if (f === n.length) o2.push(s);
            else for (s = s.child; s !== null; ) e2.push(s, f), s = s.sibling;
          }
        }
        return o2;
      }
      function kc(e2, n) {
        if (!xr) throw Error("Test selector API is not supported by this renderer.");
        e2 = Ef(e2), e2 = hh(e2, n), n = [], e2 = Array.from(e2);
        for (var o2 = 0; o2 < e2.length; ) {
          var i2 = e2[o2++], s = i2.tag;
          if (s === 5 || s === 26 || s === 27) Kr(i2) || n.push(i2.stateNode);
          else for (i2 = i2.child; i2 !== null; ) e2.push(i2), i2 = i2.sibling;
        }
        return n;
      }
      function Wm() {
        xr && bm.forEach(function(e2) {
          return e2();
        });
      }
      function mh() {
        var e2 = typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0;
        return e2 || x.actQueue === null || console.error("The current testing environment is not configured to support act(...)"), e2;
      }
      function Nt(e2) {
        if ((ye & Zn) !== Jn && ae !== 0) return ae & -ae;
        var n = x.T;
        return n !== null ? (n._updatedFibers || (n._updatedFibers = /* @__PURE__ */ new Set()), n._updatedFibers.add(e2), Ru()) : Mf();
      }
      function gh() {
        if (rr === 0) if ((ae & 536870912) === 0 || ge) {
          var e2 = C;
          C <<= 1, (C & 3932160) === 0 && (C = 262144), rr = e2;
        } else rr = 536870912;
        return e2 = _r.current, e2 !== null && (e2.flags |= 32), rr;
      }
      function We(e2, n, o2) {
        if (zd && console.error("useInsertionEffect must not schedule updates."), Bg && (Tm = true), (e2 === je && (Le === lu || Le === su) || e2.cancelPendingCommit !== null) && (Xi(e2, 0), No(e2, ae, rr, false)), Ci(e2, o2), (ye & Zn) !== Jn && e2 === je) {
          if (Pa) switch (n.tag) {
            case 0:
            case 11:
            case 15:
              e2 = se && G(se) || "Unknown", fb.has(e2) || (fb.add(e2), n = G(n) || "Unknown", console.error("Cannot update a component (`%s`) while rendering a different component (`%s`). To locate the bad setState() call inside `%s`, follow the stack trace as described in https://react.dev/link/setstate-in-render", n, e2, e2));
              break;
            case 1:
              db || (console.error("Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state."), db = true);
          }
        } else wa && yu(e2, n, o2), Hh(n), e2 === je && ((ye & Zn) === Jn && (El |= o2), nn === Tl && No(e2, ae, rr, false)), Kn(e2);
      }
      function Lf(e2, n, o2) {
        if ((ye & (Zn | uo)) !== Jn) throw Error("Should not already be working.");
        if (ae !== 0 && se !== null) {
          var i2 = se, s = me();
          switch (ay) {
            case Sp:
            case lu:
              var u = rp;
              Me && ((i2 = i2._debugTask) ? i2.run(console.timeStamp.bind(console, "Suspended", u, s, "Components \u269B", void 0, "primary-light")) : console.timeStamp("Suspended", u, s, "Components \u269B", void 0, "primary-light"));
              break;
            case su:
              u = rp, Me && ((i2 = i2._debugTask) ? i2.run(console.timeStamp.bind(console, "Action", u, s, "Components \u269B", void 0, "primary-light")) : console.timeStamp("Action", u, s, "Components \u269B", void 0, "primary-light"));
              break;
            default:
              Me && (i2 = s - rp, 3 > i2 || console.timeStamp("Blocked", rp, s, "Components \u269B", void 0, 5 > i2 ? "primary-light" : 10 > i2 ? "primary" : 100 > i2 ? "primary-dark" : "error"));
          }
        }
        u = (o2 = !o2 && (n & 127) === 0 && (n & e2.expiredLanes) === 0 || Hl(e2, n)) ? Um(e2, n) : Ff(e2, n, true);
        var f = o2;
        do {
          if (u === ki) {
            Pd && !o2 && No(e2, n, 0, false), n = Le, rp = xn(), ay = n;
            break;
          } else {
            if (i2 = me(), s = e2.current.alternate, f && !bh(s)) {
              En(n), s = Ct, u = i2, !Me || u <= s || (gn ? gn.run(console.timeStamp.bind(console, "Teared Render", s, u, fe, "Scheduler \u269B", "error")) : console.timeStamp("Teared Render", s, u, fe, "Scheduler \u269B", "error")), Za(n, i2), u = Ff(e2, n, false), f = false;
              continue;
            }
            if (u === iu) {
              if (f = n, e2.errorRecoveryDisabledLanes & f) var p = 0;
              else p = e2.pendingLanes & -536870913, p = p !== 0 ? p : p & 536870912 ? 536870912 : 0;
              if (p !== 0) {
                En(n), Ra(Ct, i2, n, gn), Za(n, i2), n = p;
                e: {
                  i2 = e2, u = f, f = wp;
                  var g = qn && i2.current.memoizedState.isDehydrated;
                  if (g && (Xi(i2, p).flags |= 256), p = Ff(i2, p, false), p !== iu) {
                    if (Lg && !g) {
                      i2.errorRecoveryDisabledLanes |= u, El |= u, u = Tl;
                      break e;
                    }
                    i2 = Bt, Bt = f, i2 !== null && (Bt === null ? Bt = i2 : Bt.push.apply(Bt, i2));
                  }
                  u = p;
                }
                if (f = false, u !== iu) continue;
                i2 = me();
              }
            }
            if (u === vp) {
              En(n), Ra(Ct, i2, n, gn), Za(n, i2), Xi(e2, 0), No(e2, n, 0, true);
              break;
            }
            e: {
              switch (o2 = e2, u) {
                case ki:
                case vp:
                  throw Error("Root did not complete. This is a bug in React.");
                case Tl:
                  if ((n & 4194048) !== n) break;
                case Sm:
                  En(n), Wl(Ct, i2, n, gn), Za(n, i2), s = n, (s & 127) !== 0 ? Xh = i2 : (s & 4194048) !== 0 && (Kh = i2), No(o2, n, rr, !_l);
                  break e;
                case iu:
                  Bt = null;
                  break;
                case vm:
                case Ky:
                  break;
                default:
                  throw Error("Unknown root exit status.");
              }
              if (x.actQueue !== null) Hf(o2, s, n, Bt, xp, Pm, rr, El, uu, u, null, null, Ct, i2);
              else {
                if ((n & 62914560) === n && (f = xm + tb - me(), 10 < f)) {
                  if (No(o2, n, rr, !_l), zi(o2, 0, true) !== 0) break e;
                  qo = n, o2.timeoutHandle = Yt(yh.bind(null, o2, s, Bt, xp, Pm, n, rr, El, uu, _l, u, "Throttled", Ct, i2), f);
                  break e;
                }
                yh(o2, s, Bt, xp, Pm, n, rr, El, uu, _l, u, null, Ct, i2);
              }
            }
          }
          break;
        } while (true);
        Kn(e2);
      }
      function yh(e2, n, o2, i2, s, u, f, p, g, S, T, _, I, O) {
        e2.timeoutHandle = Yr;
        var K = n.subtreeFlags, Fe = null;
        if ((K & 8192 || (K & 16785408) === 16785408) && (Fe = cl(), uh(n, u, Fe), K = (u & 62914560) === u ? xm - me() : (u & 4194048) === u ? nb - me() : 0, K = jc(Fe, K), K !== null)) {
          qo = u, e2.cancelPendingCommit = K(Hf.bind(null, e2, n, u, o2, i2, s, f, p, g, T, Fe, Dc(Fe, e2.containerInfo), I, O)), No(e2, u, f, !S);
          return;
        }
        Hf(e2, n, u, o2, i2, s, f, p, g, T, Fe, _, I, O);
      }
      function bh(e2) {
        for (var n = e2; ; ) {
          var o2 = n.tag;
          if ((o2 === 0 || o2 === 11 || o2 === 15) && n.flags & 16384 && (o2 = n.updateQueue, o2 !== null && (o2 = o2.stores, o2 !== null))) for (var i2 = 0; i2 < o2.length; i2++) {
            var s = o2[i2], u = s.getSnapshot;
            s = s.value;
            try {
              if (!jt(u(), s)) return false;
            } catch {
              return false;
            }
          }
          if (o2 = n.child, n.subtreeFlags & 16384 && o2 !== null) o2.return = n, n = o2;
          else {
            if (n === e2) break;
            for (; n.sibling === null; ) {
              if (n.return === null || n.return === e2) return true;
              n = n.return;
            }
            n.sibling.return = n.return, n = n.sibling;
          }
        }
        return true;
      }
      function No(e2, n, o2, i2) {
        n &= ~Ng, n &= ~El, e2.suspendedLanes |= n, e2.pingedLanes &= ~n, i2 && (e2.warmLanes |= n), i2 = e2.expirationTimes;
        for (var s = n; 0 < s; ) {
          var u = 31 - vn(s), f = 1 << u;
          i2[u] = -1, s &= ~f;
        }
        o2 !== 0 && gu(e2, o2, n);
      }
      function Ls() {
        return (ye & (Zn | uo)) === Jn ? (Wa(0, false), false) : true;
      }
      function Ns() {
        return (ye & (Zn | uo)) !== Jn;
      }
      function Fs() {
        if (se !== null) {
          if (Le === tr) var e2 = se.return;
          else e2 = se, zu(), ds(e2), fd = null, fp = 0, e2 = se;
          for (; e2 !== null; ) gc(e2.alternate, e2), e2 = e2.return;
          se = null;
        }
      }
      function Za(e2, n) {
        (e2 & 127) !== 0 && (Zs = n), (e2 & 4194048) !== 0 && (hi = n);
      }
      function Xi(e2, n) {
        Me && (console.timeStamp("Blocking Track", 3e-3, 3e-3, "Blocking", "Scheduler \u269B", "primary-light"), console.timeStamp("Transition Track", 3e-3, 3e-3, "Transition", "Scheduler \u269B", "primary-light"), console.timeStamp("Suspense Track", 3e-3, 3e-3, "Suspense", "Scheduler \u269B", "primary-light"), console.timeStamp("Idle Track", 3e-3, 3e-3, "Idle", "Scheduler \u269B", "primary-light"));
        var o2 = Ct;
        if (Ct = xn(), ae !== 0 && 0 < o2) {
          if (En(ae), nn === vm || nn === Tl) Wl(o2, Ct, n, gn);
          else {
            var i2 = Ct, s = gn;
            if (Me && !(i2 <= o2)) {
              var u = (n & 738197653) === n ? "tertiary-dark" : "primary-dark", f = (n & 536870912) === n ? "Prewarm" : (n & 201326741) === n ? "Interrupted Hydration" : "Interrupted Render";
              s ? s.run(console.timeStamp.bind(console, f, o2, i2, fe, "Scheduler \u269B", u)) : console.timeStamp(f, o2, i2, fe, "Scheduler \u269B", u);
            }
          }
          Za(ae, Ct);
        }
        if (o2 = gn, gn = null, (n & 127) !== 0) {
          gn = ep, s = 0 <= za && za < Zs ? Zs : za, i2 = 0 <= Ys && Ys < Zs ? Zs : Ys, u = 0 <= i2 ? i2 : 0 <= s ? s : Ct, 0 <= Xh && (En(2), Nd(Xh, u, n, o2)), o2 = s;
          var p = i2, g = np, S = 0 < ld, T = Pl === 1, _ = Pl === 2;
          if (s = Ct, i2 = ep, u = ig, f = lg, Me) {
            if (fe = "Blocking", 0 < o2 ? o2 > s && (o2 = s) : o2 = s, 0 < p ? p > o2 && (p = o2) : p = o2, g !== null && o2 > p) {
              var I = S ? "secondary-light" : "warning";
              i2 ? i2.run(console.timeStamp.bind(console, S ? "Consecutive" : "Event: " + g, p, o2, fe, "Scheduler \u269B", I)) : console.timeStamp(S ? "Consecutive" : "Event: " + g, p, o2, fe, "Scheduler \u269B", I);
            }
            s > o2 && (p = T ? "error" : (n & 738197653) === n ? "tertiary-light" : "primary-light", T = _ ? "Promise Resolved" : T ? "Cascading Update" : 5 < s - o2 ? "Update Blocked" : "Update", _ = [], f != null && _.push(["Component name", f]), u != null && _.push(["Method name", u]), o2 = {
              start: o2,
              end: s,
              detail: {
                devtools: {
                  properties: _,
                  track: fe,
                  trackGroup: "Scheduler \u269B",
                  color: p
                }
              }
            }, i2 ? i2.run(performance.measure.bind(performance, T, o2)) : performance.measure(T, o2));
          }
          za = -1.1, Pl = 0, lg = ig = null, Xh = -1.1, ld = Ys, Ys = -1.1, Zs = xn();
        }
        if ((n & 4194048) !== 0 && (gn = tp, s = 0 <= mi && mi < hi ? hi : mi, o2 = 0 <= ao && ao < hi ? hi : ao, i2 = 0 <= xl && xl < hi ? hi : xl, u = 0 <= i2 ? i2 : 0 <= o2 ? o2 : Ct, 0 <= Kh && (En(256), Nd(Kh, u, n, gn)), _ = i2, p = Xs, g = 0 < zl, S = sg === 2, u = Ct, i2 = tp, f = ry, T = oy, Me && (fe = "Transition", 0 < o2 ? o2 > u && (o2 = u) : o2 = u, 0 < s ? s > o2 && (s = o2) : s = o2, 0 < _ ? _ > s && (_ = s) : _ = s, s > _ && p !== null && (I = g ? "secondary-light" : "warning", i2 ? i2.run(console.timeStamp.bind(console, g ? "Consecutive" : "Event: " + p, _, s, fe, "Scheduler \u269B", I)) : console.timeStamp(g ? "Consecutive" : "Event: " + p, _, s, fe, "Scheduler \u269B", I)), o2 > s && (i2 ? i2.run(console.timeStamp.bind(console, "Action", s, o2, fe, "Scheduler \u269B", "primary-dark")) : console.timeStamp("Action", s, o2, fe, "Scheduler \u269B", "primary-dark")), u > o2 && (s = S ? "Promise Resolved" : 5 < u - o2 ? "Update Blocked" : "Update", _ = [], T != null && _.push(["Component name", T]), f != null && _.push(["Method name", f]), o2 = {
          start: o2,
          end: u,
          detail: {
            devtools: {
              properties: _,
              track: fe,
              trackGroup: "Scheduler \u269B",
              color: "primary-light"
            }
          }
        }, i2 ? i2.run(performance.measure.bind(performance, s, o2)) : performance.measure(s, o2))), ao = mi = -1.1, sg = 0, Kh = -1.1, zl = xl, xl = -1.1, hi = xn()), o2 = e2.timeoutHandle, o2 !== Yr && (e2.timeoutHandle = Yr, Of(o2)), o2 = e2.cancelPendingCommit, o2 !== null && (e2.cancelPendingCommit = null, o2()), qo = 0, Fs(), je = e2, se = o2 = Fo(e2.current, null), ae = n, Le = tr, Er = null, _l = false, Pd = Hl(e2, n), Lg = false, nn = ki, uu = rr = Ng = El = Rl = 0, Bt = wp = null, Pm = false, (n & 8) !== 0 && (n |= n & 32), i2 = e2.entangledLanes, i2 !== 0) for (e2 = e2.entanglements, i2 &= n; 0 < i2; ) s = 31 - vn(i2), u = 1 << s, n |= e2[s], i2 &= ~u;
        return Ta = n, Ui(), e2 = Vg(), 1e3 < e2 - $g && (x.recentlyCreatedOwnerStacks = 0, $g = e2), Mo.discardPendingWarnings(), o2;
      }
      function vh(e2, n) {
        Y = null, x.H = yp, x.getCurrentStack = null, Pa = false, di = null, n === dd || n === am ? (n = qd(), Le = Sp) : n === gg ? (n = qd(), Le = eb) : Le = n === Tg ? Ig : n !== null && typeof n == "object" && typeof n.then == "function" ? kp : km, Er = n;
        var o2 = se;
        o2 === null ? (nn = vp, vs(e2, ft(n, e2.current))) : o2.mode & 2 && Cu(o2);
      }
      function Sh() {
        var e2 = _r.current;
        return e2 === null ? true : (ae & 4194048) === ae ? Qo === null : (ae & 62914560) === ae || (ae & 536870912) !== 0 ? e2 === Qo : false;
      }
      function Nf() {
        var e2 = x.H;
        return x.H = yp, e2 === null ? yp : e2;
      }
      function kh() {
        var e2 = x.A;
        return x.A = Vb, e2;
      }
      function wc(e2) {
        gn === null && (gn = e2._debugTask == null ? null : e2._debugTask);
      }
      function Pc() {
        nn = Tl, _l || (ae & 4194048) !== ae && _r.current !== null || (Pd = true), (Rl & 134217727) === 0 && (El & 134217727) === 0 || je === null || No(je, ae, rr, false);
      }
      function Ff(e2, n, o2) {
        var i2 = ye;
        ye |= Zn;
        var s = Nf(), u = kh();
        if (je !== e2 || ae !== n) {
          if (wa) {
            var f = e2.memoizedUpdaters;
            0 < f.size && (nl(e2, ae), f.clear()), jl(e2, n);
          }
          xp = null, Xi(e2, n);
        }
        n = false, f = nn;
        e: do
          try {
            if (Le !== tr && se !== null) {
              var p = se, g = Er;
              switch (Le) {
                case Ig:
                  Fs(), f = Sm;
                  break e;
                case Sp:
                case lu:
                case su:
                case kp:
                  _r.current === null && (n = true);
                  var S = Le;
                  if (Le = tr, Er = null, Ki(e2, p, g, S), o2 && Pd) {
                    f = ki;
                    break e;
                  }
                  break;
                default:
                  S = Le, Le = tr, Er = null, Ki(e2, p, g, S);
              }
            }
            wh(), f = nn;
            break;
          } catch (T) {
            vh(e2, T);
          }
        while (true);
        return n && e2.shellSuspendCounter++, zu(), ye = i2, x.H = s, x.A = u, se === null && (je = null, ae = 0, Ui()), f;
      }
      function wh() {
        for (; se !== null; ) Ph(se);
      }
      function Um(e2, n) {
        var o2 = ye;
        ye |= Zn;
        var i2 = Nf(), s = kh();
        if (je !== e2 || ae !== n) {
          if (wa) {
            var u = e2.memoizedUpdaters;
            0 < u.size && (nl(e2, ae), u.clear()), jl(e2, n);
          }
          xp = null, Pp = me() + Fg, Xi(e2, n);
        } else Pd = Hl(e2, n);
        e: do
          try {
            if (Le !== tr && se !== null) n: switch (n = se, u = Er, Le) {
              case km:
                Le = tr, Er = null, Ki(e2, n, u, km);
                break;
              case lu:
              case su:
                if (Vd(u)) {
                  Le = tr, Er = null, xh(n);
                  break;
                }
                n = function() {
                  Le !== lu && Le !== su || je !== e2 || (Le = wm), Kn(e2);
                }, u.then(n, n);
                break e;
              case Sp:
                Le = wm;
                break e;
              case eb:
                Le = Eg;
                break e;
              case wm:
                Vd(u) ? (Le = tr, Er = null, xh(n)) : (Le = tr, Er = null, Ki(e2, n, u, wm));
                break;
              case Eg:
                var f = null;
                switch (se.tag) {
                  case 26:
                    f = se.memoizedState;
                  case 5:
                  case 27:
                    var p = se, g = p.type, S = p.pendingProps;
                    if (f ? l(f) : ha(p.stateNode, g, S)) {
                      Le = tr, Er = null;
                      var T = p.sibling;
                      if (T !== null) se = T;
                      else {
                        var _ = p.return;
                        _ !== null ? (se = _, xc(_)) : se = null;
                      }
                      break n;
                    }
                    break;
                  default:
                    console.error("Unexpected type of fiber triggered a suspensey commit. This is a bug in React.");
                }
                Le = tr, Er = null, Ki(e2, n, u, Eg);
                break;
              case kp:
                Le = tr, Er = null, Ki(e2, n, u, kp);
                break;
              case Ig:
                Fs(), nn = Sm;
                break e;
              default:
                throw Error("Unexpected SuspendedReason. This is a bug in React.");
            }
            x.actQueue !== null ? wh() : Bm();
            break;
          } catch (I) {
            vh(e2, I);
          }
        while (true);
        return zu(), x.H = i2, x.A = s, ye = o2, se !== null ? ki : (je = null, ae = 0, Ui(), nn);
      }
      function Bm() {
        for (; se !== null && !J(); ) Ph(se);
      }
      function Ph(e2) {
        var n = e2.alternate;
        (e2.mode & 2) !== Z ? (Jl(e2), n = B(e2, tt, n, e2, Ta), Cu(e2)) : n = B(e2, tt, n, e2, Ta), e2.memoizedProps = e2.pendingProps, n === null ? xc(e2) : se = n;
      }
      function xh(e2) {
        var n = B(e2, Om, e2);
        e2.memoizedProps = e2.pendingProps, n === null ? xc(e2) : se = n;
      }
      function Om(e2) {
        var n = e2.alternate, o2 = (e2.mode & 2) !== Z;
        switch (o2 && Jl(e2), e2.tag) {
          case 15:
          case 0:
            n = Qr(n, e2, e2.pendingProps, e2.type, void 0, ae);
            break;
          case 11:
            n = Qr(n, e2, e2.pendingProps, e2.type.render, e2.ref, ae);
            break;
          case 5:
            ds(e2);
          default:
            gc(n, e2), e2 = se = dn(e2, Ta), n = tt(n, e2, Ta);
        }
        return o2 && Cu(e2), n;
      }
      function Ki(e2, n, o2, i2) {
        zu(), ds(n), fd = null, fp = 0;
        var s = n.return;
        try {
          if (Jp(e2, s, n, o2, ae)) {
            nn = vp, vs(e2, ft(o2, e2.current)), se = null;
            return;
          }
        } catch (u) {
          if (s !== null) throw se = s, u;
          nn = vp, vs(e2, ft(o2, e2.current)), se = null;
          return;
        }
        n.flags & 32768 ? (ge || i2 === km ? e2 = true : Pd || (ae & 536870912) !== 0 ? e2 = false : (_l = e2 = true, (i2 === lu || i2 === su || i2 === Sp || i2 === kp) && (i2 = _r.current, i2 !== null && i2.tag === 13 && (i2.flags |= 16384))), zh(n, e2)) : xc(n);
      }
      function xc(e2) {
        var n = e2;
        do {
          if ((n.flags & 32768) !== 0) {
            zh(n, _l);
            return;
          }
          var o2 = n.alternate;
          if (e2 = n.return, Jl(n), o2 = B(n, wf, o2, n, Ta), (n.mode & 2) !== Z && Wd(n), o2 !== null) {
            se = o2;
            return;
          }
          if (n = n.sibling, n !== null) {
            se = n;
            return;
          }
          se = n = e2;
        } while (n !== null);
        nn === ki && (nn = Ky);
      }
      function zh(e2, n) {
        do {
          var o2 = ua(e2.alternate, e2);
          if (o2 !== null) {
            o2.flags &= 32767, se = o2;
            return;
          }
          if ((e2.mode & 2) !== Z) {
            Wd(e2), o2 = e2.actualDuration;
            for (var i2 = e2.child; i2 !== null; ) o2 += i2.actualDuration, i2 = i2.sibling;
            e2.actualDuration = o2;
          }
          if (o2 = e2.return, o2 !== null && (o2.flags |= 32768, o2.subtreeFlags = 0, o2.deletions = null), !n && (e2 = e2.sibling, e2 !== null)) {
            se = e2;
            return;
          }
          se = e2 = o2;
        } while (e2 !== null);
        nn = Sm, se = null;
      }
      function Hf(e2, n, o2, i2, s, u, f, p, g, S, T, _, I, O) {
        e2.cancelPendingCommit = null;
        do
          el();
        while (Rn !== Ll);
        if (Mo.flushLegacyContextWarning(), Mo.flushPendingUnsafeLifecycleWarnings(), (ye & (Zn | uo)) !== Jn) throw Error("Should not already be working.");
        if (En(o2), S === iu ? Ra(I, O, o2, gn) : i2 !== null ? Fd(I, O, o2, i2, n !== null && n.alternate !== null && n.alternate.memoizedState.isDehydrated && (n.flags & 256) !== 0, gn) : In(I, O, o2, gn), n !== null) {
          if (o2 === 0 && console.error("finishedLanes should not be empty during a commit. This is a bug in React."), n === e2.current) throw Error("Cannot commit the same tree as before. This error is likely caused by a bug in React. Please file an issue.");
          if (u = n.lanes | n.childLanes, u |= bg, Id(e2, o2, u, f, p, g), e2 === je && (se = je = null, ae = 0), xd = n, Nl = e2, qo = o2, jg = u, Wg = s, sb = i2, Dg = O, ub = _, Go = zm, cb = null, n.actualDuration !== 0 || (n.subtreeFlags & 10256) !== 0 || (n.flags & 10256) !== 0 ? (e2.callbackNode = null, e2.callbackPriority = 0, Fh(qs, function() {
            return ll(), Go === zm && (Go = Ag), Eh(), null;
          })) : (e2.callbackNode = null, e2.callbackPriority = 0), pi = null, wl = xn(), _ !== null && bu(O, wl, _, gn), i2 = (n.flags & 13878) !== 0, (n.subtreeFlags & 13878) !== 0 || i2) {
            i2 = x.T, x.T = null, s = wt(), an(2), f = ye, ye |= uo;
            try {
              jm(e2, n, o2);
            } finally {
              ye = f, an(s), x.T = i2;
            }
          }
          Rn = ob, Ch(), Th(), _h();
        }
      }
      function Ch() {
        if (Rn === ob) {
          Rn = Ll;
          var e2 = Nl, n = xd, o2 = qo, i2 = (n.flags & 13878) !== 0;
          if ((n.subtreeFlags & 13878) !== 0 || i2) {
            i2 = x.T, x.T = null;
            var s = wt();
            an(2);
            var u = ye;
            ye |= uo;
            try {
              Sd = o2, kd = e2, Gl(), oh(n, e2), kd = Sd = null, pa(e2.containerInfo);
            } finally {
              ye = u, an(s), x.T = i2;
            }
          }
          e2.current = n, Rn = ab;
        }
      }
      function Th() {
        if (Rn === ab) {
          Rn = Ll;
          var e2 = cb;
          if (e2 !== null) {
            wl = xn();
            var n = fi, o2 = wl;
            !Me || o2 <= n || console.timeStamp(e2, n, o2, fe, "Scheduler \u269B", "secondary-light");
          }
          e2 = Nl, n = xd, o2 = qo;
          var i2 = (n.flags & 8772) !== 0;
          if ((n.subtreeFlags & 8772) !== 0 || i2) {
            i2 = x.T, x.T = null;
            var s = wt();
            an(2);
            var u = ye;
            ye |= uo;
            try {
              Sd = o2, kd = e2, Gl(), yn(e2, n.alternate, n), kd = Sd = null;
            } finally {
              ye = u, an(s), x.T = i2;
            }
          }
          e2 = Dg, n = ub, fi = xn(), e2 = n === null ? e2 : wl, n = fi, o2 = Go === Hg, i2 = gn, pi !== null ? ir(e2, n, pi, false, i2) : !Me || n <= e2 || (i2 ? i2.run(console.timeStamp.bind(console, o2 ? "Commit Interrupted View Transition" : "Commit", e2, n, fe, "Scheduler \u269B", o2 ? "error" : "secondary-dark")) : console.timeStamp(o2 ? "Commit Interrupted View Transition" : "Commit", e2, n, fe, "Scheduler \u269B", o2 ? "error" : "secondary-dark")), Rn = ib;
        }
      }
      function _h() {
        if (Rn === lb || Rn === ib) {
          if (Rn === lb) {
            var e2 = fi;
            fi = xn();
            var n = fi, o2 = Go === Hg;
            !Me || n <= e2 || console.timeStamp(o2 ? "Interrupted View Transition" : "Starting Animation", e2, n, fe, "Scheduler \u269B", o2 ? " error" : "secondary-light"), Go !== Hg && (Go = rb);
          }
          Rn = Ll, Pe(), e2 = Nl;
          var i2 = xd;
          n = qo, o2 = sb;
          var s = i2.actualDuration !== 0 || (i2.subtreeFlags & 10256) !== 0 || (i2.flags & 10256) !== 0;
          s ? Rn = Cm : (Rn = Ll, xd = Nl = null, Rh(e2, e2.pendingLanes), cu = 0, Cp = null);
          var u = e2.pendingLanes;
          if (u === 0 && (Il = null), s || Df(e2), u = ar(n), i2 = i2.stateNode, zt && typeof zt.onCommitFiberRoot == "function") try {
            var f = (i2.current.flags & 128) === 128;
            switch (u) {
              case 2:
                var p = be;
                break;
              case 8:
                p = Oo;
                break;
              case 32:
                p = qs;
                break;
              case 268435456:
                p = Qg;
                break;
              default:
                p = qs;
            }
            zt.onCommitFiberRoot(td, i2, p, f);
          } catch (_) {
            ka || (ka = true, console.error("React instrumentation encountered an error: %o", _));
          }
          if (wa && e2.memoizedUpdaters.clear(), Wm(), o2 !== null) {
            f = x.T, p = wt(), an(2), x.T = null;
            try {
              var g = e2.onRecoverableError;
              for (i2 = 0; i2 < o2.length; i2++) {
                var S = o2[i2], T = Mm(S.stack);
                B(S.source, g, S.value, T);
              }
            } finally {
              x.T = f, an(p);
            }
          }
          (qo & 3) !== 0 && el(), Kn(e2), u = e2.pendingLanes, (n & 261930) !== 0 && (u & 42) !== 0 ? (nm = true, e2 === Ug ? zp++ : (zp = 0, Ug = e2)) : zp = 0, s || Za(n, fi), qn && Jf(), Wa(0, false);
        }
      }
      function Mm(e2) {
        return e2 = {
          componentStack: e2
        }, Object.defineProperty(e2, "digest", {
          get: function() {
            console.error('You are accessing "digest" from the errorInfo object passed to onRecoverableError. This property is no longer provided as part of errorInfo but can be accessed as a property of the Error instance itself.');
          }
        }), e2;
      }
      function Rh(e2, n) {
        (e2.pooledCacheLanes &= n) === 0 && (n = e2.pooledCache, n != null && (e2.pooledCache = null, Da(n)));
      }
      function el() {
        return Ch(), Th(), _h(), Eh();
      }
      function Eh() {
        if (Rn !== Cm) return false;
        var e2 = Nl, n = jg;
        jg = 0;
        var o2 = ar(qo), i2 = 32 > o2 ? 32 : o2;
        o2 = x.T;
        var s = wt();
        try {
          an(i2), x.T = null;
          var u = Wg;
          Wg = null, i2 = Nl;
          var f = qo;
          if (Rn = Ll, xd = Nl = null, qo = 0, (ye & (Zn | uo)) !== Jn) throw Error("Cannot flush passive effects while already rendering.");
          En(f), Bg = true, Tm = false;
          var p = 0;
          if (pi = null, p = me(), Go === rb) {
            var g = fi, S = p;
            !Me || S <= g || (sd ? sd.run(console.timeStamp.bind(console, "Animating", g, S, fe, "Scheduler \u269B", "secondary-dark")) : console.timeStamp("Animating", g, S, fe, "Scheduler \u269B", "secondary-dark"));
          } else {
            g = fi, S = p;
            var T = Go === Ag;
            !Me || S <= g || (gn ? gn.run(console.timeStamp.bind(console, T ? "Waiting for Paint" : "Waiting", g, S, fe, "Scheduler \u269B", "secondary-light")) : console.timeStamp(T ? "Waiting for Paint" : "Waiting", g, S, fe, "Scheduler \u269B", "secondary-light"));
          }
          g = ye, ye |= uo;
          var _ = i2.current;
          Gl(), dh(_);
          var I = i2.current;
          _ = Dg, Gl(), lh(i2, I, f, u, _), Df(i2), ye = g;
          var O = me();
          if (I = p, _ = gn, pi !== null ? ir(I, O, pi, true, _) : !Me || O <= I || (_ ? _.run(console.timeStamp.bind(console, "Remaining Effects", I, O, fe, "Scheduler \u269B", "secondary-dark")) : console.timeStamp("Remaining Effects", I, O, fe, "Scheduler \u269B", "secondary-dark")), Za(f, O), Wa(0, false), Tm ? i2 === Cp ? cu++ : (cu = 0, Cp = i2) : cu = 0, Tm = Bg = false, zt && typeof zt.onPostCommitFiberRoot == "function") try {
            zt.onPostCommitFiberRoot(td, i2);
          } catch (Fe) {
            ka || (ka = true, console.error("React instrumentation encountered an error: %o", Fe));
          }
          var K = i2.current.stateNode;
          return K.effectDuration = 0, K.passiveEffectDuration = 0, true;
        } finally {
          an(s), x.T = o2, Rh(e2, n);
        }
      }
      function Ih(e2, n, o2) {
        n = ft(o2, n), Ud(n), n = oc(e2.stateNode, n, 2), e2 = Mt(e2, n, 2), e2 !== null && (Ci(e2, 2), Kn(e2));
      }
      function Se(e2, n, o2) {
        if (zd = false, e2.tag === 3) Ih(e2, e2, o2);
        else {
          for (; n !== null; ) {
            if (n.tag === 3) {
              Ih(n, e2, o2);
              return;
            }
            if (n.tag === 1) {
              var i2 = n.stateNode;
              if (typeof n.type.getDerivedStateFromError == "function" || typeof i2.componentDidCatch == "function" && (Il === null || !Il.has(i2))) {
                e2 = ft(o2, e2), Ud(e2), o2 = ac(2), i2 = Mt(n, o2, 2), i2 !== null && (ic(o2, i2, n, e2), Ci(i2, 2), Kn(i2));
                return;
              }
            }
            n = n.return;
          }
          console.error(`Internal React error: Attempted to capture a commit phase error inside a detached tree. This indicates a bug in React. Potential causes include deleting the same fiber more than once, committing an already-finished tree, or an inconsistent return pointer.

Error message:

%s`, o2);
        }
      }
      function Af(e2, n, o2) {
        var i2 = e2.pingCache;
        if (i2 === null) {
          i2 = e2.pingCache = new qb();
          var s = /* @__PURE__ */ new Set();
          i2.set(n, s);
        } else s = i2.get(n), s === void 0 && (s = /* @__PURE__ */ new Set(), i2.set(n, s));
        s.has(o2) || (Lg = true, s.add(o2), i2 = Qm.bind(null, e2, n, o2), wa && nl(e2, o2), n.then(i2, i2));
      }
      function Qm(e2, n, o2) {
        var i2 = e2.pingCache;
        i2 !== null && i2.delete(n), e2.pingedLanes |= e2.suspendedLanes & o2, e2.warmLanes &= ~o2, (o2 & 127) !== 0 ? 0 > za && (Zs = za = xn(), ep = Yh("Promise Resolved"), Pl = 2) : (o2 & 4194048) !== 0 && 0 > ao && (hi = ao = xn(), tp = Yh("Promise Resolved"), sg = 2), mh() && x.actQueue === null && console.error(`A suspended resource finished loading inside a test, but the event was not wrapped in act(...).

When testing, code that resolves suspended data should be wrapped into act(...):

act(() => {
  /* finish loading suspended data */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act`), je === e2 && (ae & o2) === o2 && (nn === Tl || nn === vm && (ae & 62914560) === ae && me() - xm < tb ? (ye & Zn) === Jn && Xi(e2, 0) : Ng |= o2, uu === ae && (uu = 0)), Kn(e2);
      }
      function Lh(e2, n) {
        n === 0 && (n = ut()), e2 = On(e2, n), e2 !== null && (Ci(e2, n), Kn(e2));
      }
      function Nh(e2) {
        var n = e2.memoizedState, o2 = 0;
        n !== null && (o2 = n.retryLane), Lh(e2, o2);
      }
      function $m(e2, n) {
        var o2 = 0;
        switch (e2.tag) {
          case 31:
          case 13:
            var i2 = e2.stateNode, s = e2.memoizedState;
            s !== null && (o2 = s.retryLane);
            break;
          case 19:
            i2 = e2.stateNode;
            break;
          case 22:
            i2 = e2.stateNode._retryCache;
            break;
          default:
            throw Error("Pinged unknown suspense boundary type. This is probably a bug in React.");
        }
        i2 !== null && i2.delete(n), Lh(e2, o2);
      }
      function jf(e2, n, o2) {
        if ((n.subtreeFlags & 67117056) !== 0) for (n = n.child; n !== null; ) {
          var i2 = e2, s = n, u = s.type === Lc;
          u = o2 || u, s.tag !== 22 ? s.flags & 67108864 ? u && B(s, Gt, i2, s) : jf(i2, s, u) : s.memoizedState === null && (u && s.flags & 8192 ? B(s, Gt, i2, s) : s.subtreeFlags & 67108864 && B(s, jf, i2, s, u)), n = n.sibling;
        }
      }
      function Gt(e2, n) {
        De(true);
        try {
          da(n), fh(n), ih(e2, n.alternate, n, false), sh(e2, n, 0, null, false, 0);
        } finally {
          De(false);
        }
      }
      function Df(e2) {
        var n = true;
        e2.current.mode & 24 || (n = false), jf(e2, e2.current, n);
      }
      function zc(e2) {
        if ((ye & Zn) === Jn) {
          var n = e2.tag;
          if (n === 3 || n === 1 || n === 0 || n === 11 || n === 14 || n === 15) {
            if (n = G(e2) || "ReactComponent", _m !== null) {
              if (_m.has(n)) return;
              _m.add(n);
            } else _m = /* @__PURE__ */ new Set([n]);
            B(e2, function() {
              console.error("Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously tries to update the component. Move this work to useEffect instead.");
            });
          }
        }
      }
      function nl(e2, n) {
        wa && e2.memoizedUpdaters.forEach(function(o2) {
          yu(e2, o2, n);
        });
      }
      function Fh(e2, n) {
        var o2 = x.actQueue;
        return o2 !== null ? (o2.push(n), Zb) : Q(e2, n);
      }
      function Hh(e2) {
        mh() && x.actQueue === null && B(e2, function() {
          console.error(`An update to %s inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act`, G(e2));
        });
      }
      function Ya(e2) {
        if (co === null) return e2;
        var n = co(e2);
        return n === void 0 ? e2 : n.current;
      }
      function Cc(e2) {
        if (co === null) return e2;
        var n = co(e2);
        return n === void 0 ? e2 != null && typeof e2.render == "function" && (n = Ya(e2.render), e2.render !== n) ? (n = {
          $$typeof: jn,
          render: n
        }, e2.displayName !== void 0 && (n.displayName = e2.displayName), n) : e2 : n.current;
      }
      function Wf(e2, n) {
        if (co === null) return false;
        var o2 = e2.elementType;
        n = n.type;
        var i2 = false, s = typeof n == "object" && n !== null ? n.$$typeof : null;
        switch (e2.tag) {
          case 1:
            typeof n == "function" && (i2 = true);
            break;
          case 0:
            (typeof n == "function" || s === kt) && (i2 = true);
            break;
          case 11:
            (s === jn || s === kt) && (i2 = true);
            break;
          case 14:
          case 15:
            (s === al || s === kt) && (i2 = true);
            break;
          default:
            return false;
        }
        return !!(i2 && (e2 = co(o2), e2 !== void 0 && e2 === co(n)));
      }
      function Ah(e2) {
        co !== null && typeof WeakSet == "function" && (Cd === null && (Cd = /* @__PURE__ */ new WeakSet()), Cd.add(e2));
      }
      function jh(e2, n, o2) {
        do {
          var i2 = e2, s = i2.alternate, u = i2.child, f = i2.sibling, p = i2.tag;
          i2 = i2.type;
          var g = null;
          switch (p) {
            case 0:
            case 15:
            case 1:
              g = i2;
              break;
            case 11:
              g = i2.render;
          }
          if (co === null) throw Error("Expected resolveFamily to be set during hot reload.");
          var S = false;
          if (i2 = false, g !== null && (g = co(g), g !== void 0 && (o2.has(g) ? i2 = true : n.has(g) && (p === 1 ? i2 = true : S = true))), Cd !== null && (Cd.has(e2) || s !== null && Cd.has(s)) && (i2 = true), i2 && (e2._debugNeedsRemount = true), (i2 || S) && (s = On(e2, 2), s !== null && We(s, e2, 2)), u === null || i2 || jh(u, n, o2), f === null) break;
          e2 = f;
        } while (true);
      }
      function Vm(e2, n, o2, i2) {
        this.tag = e2, this.key = o2, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = n, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = i2, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null, this.actualDuration = -0, this.actualStartTime = -1.1, this.treeBaseDuration = this.selfBaseDuration = -0, this._debugTask = this._debugStack = this._debugOwner = this._debugInfo = null, this._debugNeedsRemount = false, this._debugHookTypes = null, pb || typeof Object.preventExtensions != "function" || Object.preventExtensions(this);
      }
      function Tc(e2) {
        return e2 = e2.prototype, !(!e2 || !e2.isReactComponent);
      }
      function Fo(e2, n) {
        var o2 = e2.alternate;
        switch (o2 === null ? (o2 = lt(e2.tag, n, e2.key, e2.mode), o2.elementType = e2.elementType, o2.type = e2.type, o2.stateNode = e2.stateNode, o2._debugOwner = e2._debugOwner, o2._debugStack = e2._debugStack, o2._debugTask = e2._debugTask, o2._debugHookTypes = e2._debugHookTypes, o2.alternate = e2, e2.alternate = o2) : (o2.pendingProps = n, o2.type = e2.type, o2.flags = 0, o2.subtreeFlags = 0, o2.deletions = null, o2.actualDuration = -0, o2.actualStartTime = -1.1), o2.flags = e2.flags & 65011712, o2.childLanes = e2.childLanes, o2.lanes = e2.lanes, o2.child = e2.child, o2.memoizedProps = e2.memoizedProps, o2.memoizedState = e2.memoizedState, o2.updateQueue = e2.updateQueue, n = e2.dependencies, o2.dependencies = n === null ? null : {
          lanes: n.lanes,
          firstContext: n.firstContext,
          _debugThenableState: n._debugThenableState
        }, o2.sibling = e2.sibling, o2.index = e2.index, o2.ref = e2.ref, o2.refCleanup = e2.refCleanup, o2.selfBaseDuration = e2.selfBaseDuration, o2.treeBaseDuration = e2.treeBaseDuration, o2._debugInfo = e2._debugInfo, o2._debugNeedsRemount = e2._debugNeedsRemount, o2.tag) {
          case 0:
          case 15:
            o2.type = Ya(e2.type);
            break;
          case 1:
            o2.type = Ya(e2.type);
            break;
          case 11:
            o2.type = Cc(e2.type);
        }
        return o2;
      }
      function dn(e2, n) {
        e2.flags &= 65011714;
        var o2 = e2.alternate;
        return o2 === null ? (e2.childLanes = 0, e2.lanes = n, e2.child = null, e2.subtreeFlags = 0, e2.memoizedProps = null, e2.memoizedState = null, e2.updateQueue = null, e2.dependencies = null, e2.stateNode = null, e2.selfBaseDuration = 0, e2.treeBaseDuration = 0) : (e2.childLanes = o2.childLanes, e2.lanes = o2.lanes, e2.child = o2.child, e2.subtreeFlags = 0, e2.deletions = null, e2.memoizedProps = o2.memoizedProps, e2.memoizedState = o2.memoizedState, e2.updateQueue = o2.updateQueue, e2.type = o2.type, n = o2.dependencies, e2.dependencies = n === null ? null : {
          lanes: n.lanes,
          firstContext: n.firstContext,
          _debugThenableState: n._debugThenableState
        }, e2.selfBaseDuration = o2.selfBaseDuration, e2.treeBaseDuration = o2.treeBaseDuration), e2;
      }
      function _c(e2, n, o2, i2, s, u) {
        var f = 0, p = e2;
        if (typeof e2 == "function") Tc(e2) && (f = 1), p = Ya(p);
        else if (typeof e2 == "string") Re && d ? (f = Rt(), f = Bo(e2, o2, f) ? 26 : L(e2) ? 27 : 5) : Re ? (f = Rt(), f = Bo(e2, o2, f) ? 26 : 5) : f = d && L(e2) ? 27 : 5;
        else e: switch (e2) {
          case Ds:
            return n = lt(31, o2, n, s), n.elementType = Ds, n.lanes = u, n;
          case ol:
            return fa(o2.children, s, u, n);
          case Lc:
            f = 8, s |= 24;
            break;
          case Uf:
            return e2 = o2, i2 = s, typeof e2.id != "string" && console.error('Profiler must specify an "id" of type `string` as a prop. Received the type `%s` instead.', typeof e2.id), n = lt(12, e2, n, i2 | 2), n.elementType = Uf, n.lanes = u, n.stateNode = {
              effectDuration: 0,
              passiveEffectDuration: 0
            }, n;
          case Nc:
            return n = lt(13, o2, n, s), n.elementType = Nc, n.lanes = u, n;
          case Bf:
            return n = lt(19, o2, n, s), n.elementType = Bf, n.lanes = u, n;
          default:
            if (typeof e2 == "object" && e2 !== null) switch (e2.$$typeof) {
              case on:
                f = 10;
                break e;
              case ei:
                f = 9;
                break e;
              case jn:
                f = 11, p = Cc(p);
                break e;
              case al:
                f = 14;
                break e;
              case kt:
                f = 16, p = null;
                break e;
            }
            p = "", (e2 === void 0 || typeof e2 == "object" && e2 !== null && Object.keys(e2).length === 0) && (p += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports."), e2 === null ? o2 = "null" : fn(e2) ? o2 = "array" : e2 !== void 0 && e2.$$typeof === Ho ? (o2 = "<" + ($e(e2.type) || "Unknown") + " />", p = " Did you accidentally export a JSX literal instead of a component?") : o2 = typeof e2, f = i2 ? typeof i2.tag == "number" ? G(i2) : typeof i2.name == "string" ? i2.name : null : null, f && (p += `

Check the render method of \`` + f + "`."), f = 29, o2 = Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + (o2 + "." + p)), p = null;
        }
        return n = lt(f, o2, n, s), n.elementType = e2, n.type = p, n.lanes = u, n._debugOwner = i2, n;
      }
      function Rc(e2, n, o2) {
        return n = _c(e2.type, e2.key, e2.props, e2._owner, n, o2), n._debugOwner = e2._owner, n._debugStack = e2._debugStack, n._debugTask = e2._debugTask, n;
      }
      function fa(e2, n, o2, i2) {
        return e2 = lt(7, e2, i2, n), e2.lanes = o2, e2;
      }
      function Ec(e2, n, o2) {
        return e2 = lt(6, e2, null, n), e2.lanes = o2, e2;
      }
      function Xa(e2) {
        var n = lt(18, null, null, Z);
        return n.stateNode = e2, n;
      }
      function Hs(e2, n, o2) {
        return n = lt(4, e2.children !== null ? e2.children : [], e2.key, n), n.lanes = o2, n.stateNode = {
          containerInfo: e2.containerInfo,
          pendingChildren: null,
          implementation: e2.implementation
        }, n;
      }
      function tl(e2, n, o2, i2, s, u, f, p, g) {
        for (this.tag = 1, this.containerInfo = e2, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = Yr, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = or(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = or(0), this.hiddenUpdates = or(null), this.identifierPrefix = i2, this.onUncaughtError = s, this.onCaughtError = u, this.onRecoverableError = f, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = g, this.incompleteTransitions = /* @__PURE__ */ new Map(), this.passiveEffectDuration = this.effectDuration = -0, this.memoizedUpdaters = /* @__PURE__ */ new Set(), e2 = this.pendingUpdatersLaneMap = [], n = 0; 31 > n; n++) e2.push(/* @__PURE__ */ new Set());
        this._debugRootType = o2 ? "hydrateRoot()" : "createRoot()";
      }
      function Ka(e2, n, o2, i2, s, u, f, p, g, S, T, _) {
        return e2 = new tl(e2, n, o2, f, g, S, T, _, p), n = 1, u === true && (n |= 24), u = lt(3, null, null, n | 2), e2.current = u, u.stateNode = e2, n = Ai(), Po(n), e2.pooledCache = n, Po(n), u.memoizedState = {
          element: i2,
          isDehydrated: o2,
          cache: n
        }, Au(u), e2;
      }
      function vt(e2) {
        return "" + e2;
      }
      function Dh(e2) {
        return e2 ? (e2 = Oe, e2) : Oe;
      }
      function Wh(e2, n, o2, i2) {
        return As(n.current, 2, e2, n, o2, i2), 2;
      }
      function As(e2, n, o2, i2, s, u) {
        if (zt && typeof zt.onScheduleFiberRoot == "function") try {
          zt.onScheduleFiberRoot(td, i2, o2);
        } catch (f) {
          ka || (ka = true, console.error("React instrumentation encountered an error: %o", f));
        }
        s = Dh(s), i2.context === null ? i2.context = s : i2.pendingContext = s, Pa && di !== null && !hb && (hb = true, console.error(`Render methods should be a pure function of props and state; triggering nested component updates from render is not allowed. If necessary, trigger nested updates in componentDidUpdate.

Check the render method of %s.`, G(di) || "Unknown")), i2 = zo(n), i2.payload = {
          element: o2
        }, u = u === void 0 ? null : u, u !== null && (typeof u != "function" && console.error("Expected the last optional `callback` argument to be a function. Instead received: %s.", u), i2.callback = u), o2 = Mt(e2, i2, n), o2 !== null && (ur(n, "root.render()", null), We(o2, e2, n), Bi(o2, e2, n));
      }
      function js(e2, n) {
        if (e2 = e2.memoizedState, e2 !== null && e2.dehydrated !== null) {
          var o2 = e2.retryLane;
          e2.retryLane = o2 !== 0 && o2 < n ? o2 : n;
        }
      }
      function rl(e2, n) {
        js(e2, n), (e2 = e2.alternate) && js(e2, n);
      }
      function Ic() {
        return di;
      }
      var le = {}, qm = React__default, St = Tb, ze = Object.assign, Uh = /* @__PURE__ */ Symbol.for("react.element"), Ho = /* @__PURE__ */ Symbol.for("react.transitional.element"), Ao = /* @__PURE__ */ Symbol.for("react.portal"), ol = /* @__PURE__ */ Symbol.for("react.fragment"), Lc = /* @__PURE__ */ Symbol.for("react.strict_mode"), Uf = /* @__PURE__ */ Symbol.for("react.profiler"), ei = /* @__PURE__ */ Symbol.for("react.consumer"), on = /* @__PURE__ */ Symbol.for("react.context"), jn = /* @__PURE__ */ Symbol.for("react.forward_ref"), Nc = /* @__PURE__ */ Symbol.for("react.suspense"), Bf = /* @__PURE__ */ Symbol.for("react.suspense_list"), al = /* @__PURE__ */ Symbol.for("react.memo"), kt = /* @__PURE__ */ Symbol.for("react.lazy");
      var Ds = /* @__PURE__ */ Symbol.for("react.activity");
      var Bh = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel");
      var ni = Symbol.iterator, il = /* @__PURE__ */ Symbol.for("react.client.reference"), fn = Array.isArray, x = qm.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Jt = m.rendererVersion, Zt = m.rendererPackageName, jo = m.extraDevToolsConfig, ot = m.getPublicInstance, Zr = m.getRootHostContext, Dn = m.getChildHostContext, Ws = m.prepareForCommit, pa = m.resetAfterCommit, Fc = m.createInstance;
      m.cloneMutableInstance;
      var bn = m.appendInitialChild, Ue = m.finalizeInitialChildren, ue = m.shouldSetTextContent, Do = m.createTextInstance;
      m.cloneMutableTextInstance;
      var Yt = m.scheduleTimeout, Of = m.cancelTimeout, Yr = m.noTimeout, at = m.isPrimaryRenderer;
      m.warnsIfNotActing;
      var Be = m.supportsMutation, Xr = m.supportsPersistence, qn = m.supportsHydration, Gm = m.getInstanceFromNode;
      m.beforeActiveInstanceBlur;
      var qe = m.preparePortalMount;
      m.prepareScopeUpdate, m.getInstanceFromScope;
      var an = m.setCurrentUpdatePriority, wt = m.getCurrentUpdatePriority, Mf = m.resolveUpdatePriority, ll = m.trackSchedulerEvent, ti = m.resolveEventType, Pr = m.resolveEventTimeStamp, Us = m.shouldAttemptEagerTransition, Qf = m.detachDeletedInstance;
      m.requestPostPaintCallback;
      var sl = m.maySuspendCommit, ul = m.maySuspendCommitOnUpdate, Hc = m.maySuspendCommitInSyncRender, ha = m.preloadInstance, cl = m.startSuspendingCommit, Ac = m.suspendInstance;
      m.suspendOnActiveViewTransition;
      var jc = m.waitForCommitToBeReady, Dc = m.getSuspendedCommitReason, Xt = m.NotPendingTransition, Kt = m.HostTransitionContext, Bs = m.resetFormInstance, ri = m.bindToConsole, Oh = m.supportsMicrotasks, er = m.scheduleMicrotask, xr = m.supportsTestSelectors, $f = m.findFiberRoot, ma = m.getBoundingRect, Vf = m.getTextContent, Kr = m.isHiddenSubtree, Wc = m.matchAccessibilityRole, Ft = m.setFocusIfFocusable, zr = m.setupIntersectionObserver, ln = m.appendChild, Wo = m.appendChildToContainer, ne = m.commitTextUpdate, Ie = m.commitMount, pn = m.commitUpdate, Uc = m.insertBefore, dl = m.insertInContainerBefore, oi = m.removeChild, Bc = m.removeChildFromContainer, fl = m.resetTextContent, pl = m.hideInstance, Jm = m.hideTextInstance, Os = m.unhideInstance, Mh = m.unhideTextInstance;
      m.cancelViewTransitionName, m.cancelRootViewTransitionName, m.restoreRootViewTransitionName, m.cloneRootViewTransitionContainer, m.removeRootViewTransitionClone, m.measureClonedInstance, m.hasInstanceChanged, m.hasInstanceAffectedParent, m.startViewTransition, m.startGestureTransition, m.stopViewTransition, m.getCurrentGestureOffset, m.createViewTransitionInstance;
      var qf = m.clearContainer;
      m.createFragmentInstance, m.updateFragmentInstanceFiber, m.commitNewChildToFragmentInstance, m.deleteChildFromFragmentInstance;
      var Qh = m.cloneInstance, Oc = m.createContainerChildSet, Mc = m.appendChildToContainerChildSet, hn = m.finalizeContainerChildren, Qc = m.replaceContainerChildren, eo = m.cloneHiddenInstance, sn = m.cloneHiddenTextInstance, Ms = m.isSuspenseInstancePending, $c = m.isSuspenseInstanceFallback, Pn = m.getSuspenseInstanceFallbackErrorDetails, mn = m.registerSuspenseInstanceRetry, Pt = m.canHydrateFormStateMarker, Cr = m.isFormStateMarkerMatching, ga = m.getNextHydratableSibling, Zm = m.getNextHydratableSiblingAfterSingleton, Vc = m.getFirstHydratableChild, qc = m.getFirstHydratableChildWithinContainer, Gc = m.getFirstHydratableChildWithinActivityInstance, Jc = m.getFirstHydratableChildWithinSuspenseInstance, Zc = m.getFirstHydratableChildWithinSingleton, Qs = m.canHydrateInstance, Ym = m.canHydrateTextInstance, ce = m.canHydrateActivityInstance, Ne = m.canHydrateSuspenseInstance, de = m.hydrateInstance, he = m.hydrateTextInstance, _e = m.hydrateActivityInstance, Ht = m.hydrateSuspenseInstance, ya = m.getNextHydratableInstanceAfterActivityInstance, ai = m.getNextHydratableInstanceAfterSuspenseInstance, Gf = m.commitHydratedInstance, Uo = m.commitHydratedContainer, Xe = m.commitHydratedActivityInstance, ba = m.commitHydratedSuspenseInstance, ii = m.finalizeHydratedChildren, Jf = m.flushHydrationEvents;
      m.clearActivityBoundary;
      var At = m.clearSuspenseBoundary;
      m.clearActivityBoundaryFromContainer;
      var hl = m.clearSuspenseBoundaryFromContainer, $s = m.hideDehydratedBoundary, xt = m.unhideDehydratedBoundary, Yc = m.shouldDeleteUnhydratedTailInstances, Vs = m.diffHydratedPropsForDevWarnings, Zf = m.diffHydratedTextForDevWarnings, ml = m.describeHydratableInstanceForDevWarnings, Xc = m.validateHydratableInstance, va = m.validateHydratableTextInstance, Re = m.supportsResources, Bo = m.isHostHoistableType, Sa = m.getHoistableRoot, no = m.getResource, Kc = m.acquireResource, ed = m.releaseResource, $h = m.hydrateHoistable, gl = m.mountHoistable, nd = m.unmountHoistable, t2 = m.createHoistableInstance, r2 = m.prepareToCommitHoistables, a = m.mayResourceSuspendCommit, l = m.preloadResource, c = m.suspendResource, d = m.supportsSingletons, h = m.resolveSingletonInstance, y = m.acquireSingletonInstance, R = m.releaseSingletonInstance, L = m.isHostSingletonType, j = m.isSingletonScope, A = [], W = [], V = -1, Oe = {};
      Object.freeze(Oe);
      var vn = Math.clz32 ? Math.clz32 : Im, li = Math.log, P = Math.LN2, w = 256, C = 262144, H = 4194304, Q = St.unstable_scheduleCallback, Ge = St.unstable_cancelCallback, J = St.unstable_shouldYield, Pe = St.unstable_requestPaint, me = St.unstable_now, be = St.unstable_ImmediatePriority, Oo = St.unstable_UserBlockingPriority, qs = St.unstable_NormalPriority, Qg = St.unstable_IdlePriority, Ib = St.log, Lb = St.unstable_setDisableYieldValue, td = null, zt = null, ka = false, wa = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u", $g = 0;
      if (typeof performance == "object" && typeof performance.now == "function") var Nb = performance, Vg = function() {
        return Nb.now();
      };
      else {
        var Fb = Date;
        Vg = function() {
          return Fb.now();
        };
      }
      var jt = typeof Object.is == "function" ? Object.is : Ti, qg = typeof reportError == "function" ? reportError : function(e2) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
          var n = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: typeof e2 == "object" && e2 !== null && typeof e2.message == "string" ? String(e2.message) : String(e2),
            error: e2
          });
          if (!window.dispatchEvent(n)) return;
        } else if (typeof __Process$ == "object" && typeof __Process$.emit == "function") {
          __Process$.emit("uncaughtException", e2);
          return;
        }
        console.error(e2);
      }, Xm = Object.prototype.hasOwnProperty, Me = typeof console < "u" && typeof console.timeStamp == "function" && typeof performance < "u" && typeof performance.measure == "function", fe = "Blocking", yl = false, si = {
        color: "primary",
        properties: null,
        tooltipText: "",
        track: "Components \u269B"
      }, bl = {
        start: -0,
        end: -0,
        detail: {
          devtools: si
        }
      }, Hb = ["Changed Props", ""], Ab = ["Changed Props", "This component received deeply equal props. It might benefit from useMemo or the React Compiler in its owner."], Yf = 0, Gg, Jg, Zg, Yg, Xg, Kg, ey;
      Ea.__reactDisabledLog = true;
      var Km, ny, eg = false, ng = new (typeof WeakMap == "function" ? WeakMap : Map)(), tg = /* @__PURE__ */ new WeakMap(), rd = [], od = 0, Vh = null, Xf = 0, to = [], ro = 0, Gs = null, ui = 1, ci = "", vl = st(null), Kf = st(null), Sl = st(null), qh = st(null), ty = /["'&<>\n\t]|^\s|\s$/, di = null, Pa = false, it = null, Ke = null, ge = false, xa = false, Tr = null, kl = null, oo = false, rg = Error("Hydration Mismatch Exception: This is not a real error, and should not leak into userspace. If you're seeing this, it's likely a bug in React."), Z = 0, Gh = st(null), og = st(null), ag = st(null), Jh = {}, Zh = null, ad = null, id = false, jb = typeof AbortController < "u" ? AbortController : function() {
        var e2 = [], n = this.signal = {
          aborted: false,
          addEventListener: function(o2, i2) {
            e2.push(i2);
          }
        };
        this.abort = function() {
          n.aborted = true, e2.forEach(function(o2) {
            return o2();
          });
        };
      }, Db = St.unstable_scheduleCallback, Wb = St.unstable_NormalPriority, un = {
        $$typeof: on,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0,
        _currentRenderer: null,
        _currentRenderer2: null
      }, xn = St.unstable_now, Yh = console.createTask ? console.createTask : function() {
        return null;
      }, Ct = -0, wl = -0, fi = -0, pi = null, Dt = -1.1, Js = -0, en = -0, $ = -1.1, q = -1.1, Je = null, cn = false, Zs = -0, za = -1.1, ep = null, Pl = 0, ig = null, lg = null, Ys = -1.1, np = null, ld = -1.1, Xh = -1.1, hi = -0, mi = -1.1, ao = -1.1, sg = 0, tp = null, ry = null, oy = null, xl = -1.1, Xs = null, zl = -1.1, Kh = -1.1, sd = null, ay = 0, rp = -1.1, em = false, nm = false, tm = null, ud = null, ug = false, cg = false, rm = false, dg = false, Ks = 0, fg = {}, op = null, pg = 0, eu = 0, cd = null, iy = x.S;
      x.S = function(e2, n) {
        if (nb = me(), typeof n == "object" && n !== null && typeof n.then == "function") {
          if (0 > mi && 0 > ao) {
            mi = xn();
            var o2 = Pr(), i2 = ti();
            (o2 !== zl || i2 !== Xs) && (zl = -1.1), xl = o2, Xs = i2;
          }
          jp(e2, n);
        }
        iy !== null && iy(e2, n);
      };
      var nu = st(null), Mo = {
        recordUnsafeLifecycleWarnings: function() {
        },
        flushPendingUnsafeLifecycleWarnings: function() {
        },
        recordLegacyContextWarning: function() {
        },
        flushLegacyContextWarning: function() {
        },
        discardPendingWarnings: function() {
        }
      }, ap = [], ip = [], lp = [], sp = [], up = [], cp = [], tu = /* @__PURE__ */ new Set();
      Mo.recordUnsafeLifecycleWarnings = function(e2, n) {
        tu.has(e2.type) || (typeof n.componentWillMount == "function" && n.componentWillMount.__suppressDeprecationWarning !== true && ap.push(e2), e2.mode & 8 && typeof n.UNSAFE_componentWillMount == "function" && ip.push(e2), typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps.__suppressDeprecationWarning !== true && lp.push(e2), e2.mode & 8 && typeof n.UNSAFE_componentWillReceiveProps == "function" && sp.push(e2), typeof n.componentWillUpdate == "function" && n.componentWillUpdate.__suppressDeprecationWarning !== true && up.push(e2), e2.mode & 8 && typeof n.UNSAFE_componentWillUpdate == "function" && cp.push(e2));
      }, Mo.flushPendingUnsafeLifecycleWarnings = function() {
        var e2 = /* @__PURE__ */ new Set();
        0 < ap.length && (ap.forEach(function(p) {
          e2.add(G(p) || "Component"), tu.add(p.type);
        }), ap = []);
        var n = /* @__PURE__ */ new Set();
        0 < ip.length && (ip.forEach(function(p) {
          n.add(G(p) || "Component"), tu.add(p.type);
        }), ip = []);
        var o2 = /* @__PURE__ */ new Set();
        0 < lp.length && (lp.forEach(function(p) {
          o2.add(G(p) || "Component"), tu.add(p.type);
        }), lp = []);
        var i2 = /* @__PURE__ */ new Set();
        0 < sp.length && (sp.forEach(function(p) {
          i2.add(G(p) || "Component"), tu.add(p.type);
        }), sp = []);
        var s = /* @__PURE__ */ new Set();
        0 < up.length && (up.forEach(function(p) {
          s.add(G(p) || "Component"), tu.add(p.type);
        }), up = []);
        var u = /* @__PURE__ */ new Set();
        if (0 < cp.length && (cp.forEach(function(p) {
          u.add(G(p) || "Component"), tu.add(p.type);
        }), cp = []), 0 < n.size) {
          var f = Lr(n);
          console.error(`Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.

Please update the following components: %s`, f);
        }
        0 < i2.size && (f = Lr(i2), console.error(`Using UNSAFE_componentWillReceiveProps in strict mode is not recommended and may indicate bugs in your code. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://react.dev/link/derived-state

Please update the following components: %s`, f)), 0 < u.size && (f = Lr(u), console.error(`Using UNSAFE_componentWillUpdate in strict mode is not recommended and may indicate bugs in your code. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.

Please update the following components: %s`, f)), 0 < e2.size && (f = Lr(e2), console.warn(`componentWillMount has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.
* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, f)), 0 < o2.size && (f = Lr(o2), console.warn(`componentWillReceiveProps has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://react.dev/link/derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, f)), 0 < s.size && (f = Lr(s), console.warn(`componentWillUpdate has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* Rename componentWillUpdate to UNSAFE_componentWillUpdate to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, f));
      };
      var om = /* @__PURE__ */ new Map(), ly = /* @__PURE__ */ new Set();
      Mo.recordLegacyContextWarning = function(e2, n) {
        for (var o2 = null, i2 = e2; i2 !== null; ) i2.mode & 8 && (o2 = i2), i2 = i2.return;
        o2 === null ? console.error("Expected to find a StrictMode component in a strict mode tree. This error is likely caused by a bug in React. Please file an issue.") : !ly.has(e2.type) && (i2 = om.get(o2), e2.type.contextTypes != null || e2.type.childContextTypes != null || n !== null && typeof n.getChildContext == "function") && (i2 === void 0 && (i2 = [], om.set(o2, i2)), i2.push(e2));
      }, Mo.flushLegacyContextWarning = function() {
        om.forEach(function(e2) {
          if (e2.length !== 0) {
            var n = e2[0], o2 = /* @__PURE__ */ new Set();
            e2.forEach(function(s) {
              o2.add(G(s) || "Component"), ly.add(s.type);
            });
            var i2 = Lr(o2);
            B(n, function() {
              console.error(`Legacy context API has been detected within a strict-mode tree.

The old API will be supported in all 16.x releases, but applications using it should migrate to the new version.

Please update the following components: %s

Learn more about this warning here: https://react.dev/link/legacy-context`, i2);
            });
          }
        });
      }, Mo.discardPendingWarnings = function() {
        ap = [], ip = [], lp = [], sp = [], up = [], cp = [], om = /* @__PURE__ */ new Map();
      };
      var sy = {
        react_stack_bottom_frame: function(e2, n, o2) {
          var i2 = Pa;
          Pa = true;
          try {
            return e2(n, o2);
          } finally {
            Pa = i2;
          }
        }
      }, hg = sy.react_stack_bottom_frame.bind(sy), uy = {
        react_stack_bottom_frame: function(e2) {
          var n = Pa;
          Pa = true;
          try {
            return e2.render();
          } finally {
            Pa = n;
          }
        }
      }, cy = uy.react_stack_bottom_frame.bind(uy), dy = {
        react_stack_bottom_frame: function(e2, n) {
          try {
            n.componentDidMount();
          } catch (o2) {
            Se(e2, e2.return, o2);
          }
        }
      }, mg = dy.react_stack_bottom_frame.bind(dy), fy = {
        react_stack_bottom_frame: function(e2, n, o2, i2, s) {
          try {
            n.componentDidUpdate(o2, i2, s);
          } catch (u) {
            Se(e2, e2.return, u);
          }
        }
      }, py = fy.react_stack_bottom_frame.bind(fy), hy = {
        react_stack_bottom_frame: function(e2, n) {
          var o2 = n.stack;
          e2.componentDidCatch(n.value, {
            componentStack: o2 !== null ? o2 : ""
          });
        }
      }, Ub = hy.react_stack_bottom_frame.bind(hy), my = {
        react_stack_bottom_frame: function(e2, n, o2) {
          try {
            o2.componentWillUnmount();
          } catch (i2) {
            Se(e2, n, i2);
          }
        }
      }, gy = my.react_stack_bottom_frame.bind(my), yy = {
        react_stack_bottom_frame: function(e2) {
          var n = e2.create;
          return e2 = e2.inst, n = n(), e2.destroy = n;
        }
      }, Bb = yy.react_stack_bottom_frame.bind(yy), by = {
        react_stack_bottom_frame: function(e2, n, o2) {
          try {
            o2();
          } catch (i2) {
            Se(e2, n, i2);
          }
        }
      }, Ob = by.react_stack_bottom_frame.bind(by), vy = {
        react_stack_bottom_frame: function(e2) {
          var n = e2._init;
          return n(e2._payload);
        }
      }, Mb = vy.react_stack_bottom_frame.bind(vy), dd = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`."), gg = Error("Suspense Exception: This is not a real error, and should not leak into userspace. If you're seeing this, it's likely a bug in React."), am = Error("Suspense Exception: This is not a real error! It's an implementation detail of `useActionState` to interrupt the current render. You must either rethrow it immediately, or move the `useActionState` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary."), im = {
        then: function() {
          console.error('Internal React error: A listener was unexpectedly attached to a "noop" thenable. This is a bug in React. Please file an issue.');
        }
      }, ru = null, dp = false, fd = null, fp = 0, oe = null, yg, Sy = yg = false, ky = {}, wy = {}, Py = {};
      Zo = function(e2, n, o2) {
        if (o2 !== null && typeof o2 == "object" && o2._store && (!o2._store.validated && o2.key == null || o2._store.validated === 2)) {
          if (typeof o2._store != "object") throw Error("React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.");
          o2._store.validated = 1;
          var i2 = G(e2), s = i2 || "null";
          if (!ky[s]) {
            ky[s] = true, o2 = o2._owner, e2 = e2._debugOwner;
            var u = "";
            e2 && typeof e2.tag == "number" && (s = G(e2)) && (u = `

Check the render method of \`` + s + "`."), u || i2 && (u = `

Check the top-level render call using <` + i2 + ">.");
            var f = "";
            o2 != null && e2 !== o2 && (i2 = null, typeof o2.tag == "number" ? i2 = G(o2) : typeof o2.name == "string" && (i2 = o2.name), i2 && (f = " It was passed a child from " + i2 + ".")), B(n, function() {
              console.error('Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.', u, f);
            });
          }
        }
      };
      var ou = rs(true), xy = rs(false), pp = 1, gi = 2, io = [], pd = 0, bg = 0, zy = 0, Cy = 1, Ty = 2, vg = 3, Cl = false, _y = false, Sg = null, kg = false, hd = st(null), lm = st(0), _r = st(null), Qo = null, md = 1, hp = 2, Sn = st(0), sm = 0, lo = 1, Wt = 2, Rr = 4, Ut = 8, gd, Ry = /* @__PURE__ */ new Set(), Ey = /* @__PURE__ */ new Set(), wg = /* @__PURE__ */ new Set(), Iy = /* @__PURE__ */ new Set(), yi = 0, Y = null, Ae = null, zn = null, um = false, yd = false, au = false, cm = 0, mp = 0, bi = null, Qb = 0, $b = 25, z = null, so = null, vi = -1, gp = false, yp = {
        readContext: Ee,
        use: we,
        useCallback: Ye,
        useContext: Ye,
        useEffect: Ye,
        useImperativeHandle: Ye,
        useLayoutEffect: Ye,
        useInsertionEffect: Ye,
        useMemo: Ye,
        useReducer: Ye,
        useRef: Ye,
        useState: Ye,
        useDebugValue: Ye,
        useDeferredValue: Ye,
        useTransition: Ye,
        useSyncExternalStore: Ye,
        useId: Ye,
        useHostTransitionStatus: Ye,
        useFormState: Ye,
        useActionState: Ye,
        useOptimistic: Ye,
        useMemoCache: Ye,
        useCacheRefresh: Ye
      };
      yp.useEffectEvent = Ye;
      var Pg = null, Ly = null, xg = null, Ny = null, Ca = null, $o = null, dm = null;
      Pg = {
        readContext: function(e2) {
          return Ee(e2);
        },
        use: we,
        useCallback: function(e2, n) {
          return z = "useCallback", ee(), gt(n), Ku(e2, n);
        },
        useContext: function(e2) {
          return z = "useContext", ee(), Ee(e2);
        },
        useEffect: function(e2, n) {
          return z = "useEffect", ee(), gt(n), yt(e2, n);
        },
        useImperativeHandle: function(e2, n, o2) {
          return z = "useImperativeHandle", ee(), gt(o2), Xu(e2, n, o2);
        },
        useInsertionEffect: function(e2, n) {
          z = "useInsertionEffect", ee(), gt(n), To(4, Wt, e2, n);
        },
        useLayoutEffect: function(e2, n) {
          return z = "useLayoutEffect", ee(), gt(n), _o(e2, n);
        },
        useMemo: function(e2, n) {
          z = "useMemo", ee(), gt(n);
          var o2 = x.H;
          x.H = Ca;
          try {
            return ec(e2, n);
          } finally {
            x.H = o2;
          }
        },
        useReducer: function(e2, n, o2) {
          z = "useReducer", ee();
          var i2 = x.H;
          x.H = Ca;
          try {
            return $u(e2, n, o2);
          } finally {
            x.H = i2;
          }
        },
        useRef: function(e2) {
          return z = "useRef", ee(), br(e2);
        },
        useState: function(e2) {
          z = "useState", ee();
          var n = x.H;
          x.H = Ca;
          try {
            return $i(e2);
          } finally {
            x.H = n;
          }
        },
        useDebugValue: function() {
          z = "useDebugValue", ee();
        },
        useDeferredValue: function(e2, n) {
          return z = "useDeferredValue", ee(), ms(e2, n);
        },
        useTransition: function() {
          return z = "useTransition", ee(), tc();
        },
        useSyncExternalStore: function(e2, n, o2) {
          return z = "useSyncExternalStore", ee(), Vu(e2, n, o2);
        },
        useId: function() {
          return z = "useId", ee(), bs();
        },
        useFormState: function(e2, n) {
          return z = "useFormState", ee(), Mi(), tn(e2, n);
        },
        useActionState: function(e2, n) {
          return z = "useActionState", ee(), tn(e2, n);
        },
        useOptimistic: function(e2) {
          return z = "useOptimistic", ee(), Ju(e2);
        },
        useHostTransitionStatus: ia,
        useMemoCache: Oa,
        useCacheRefresh: function() {
          return z = "useCacheRefresh", ee(), la();
        },
        useEffectEvent: function(e2) {
          return z = "useEffectEvent", ee(), ra(e2);
        }
      }, Ly = {
        readContext: function(e2) {
          return Ee(e2);
        },
        use: we,
        useCallback: function(e2, n) {
          return z = "useCallback", N(), Ku(e2, n);
        },
        useContext: function(e2) {
          return z = "useContext", N(), Ee(e2);
        },
        useEffect: function(e2, n) {
          return z = "useEffect", N(), yt(e2, n);
        },
        useImperativeHandle: function(e2, n, o2) {
          return z = "useImperativeHandle", N(), Xu(e2, n, o2);
        },
        useInsertionEffect: function(e2, n) {
          z = "useInsertionEffect", N(), To(4, Wt, e2, n);
        },
        useLayoutEffect: function(e2, n) {
          return z = "useLayoutEffect", N(), _o(e2, n);
        },
        useMemo: function(e2, n) {
          z = "useMemo", N();
          var o2 = x.H;
          x.H = Ca;
          try {
            return ec(e2, n);
          } finally {
            x.H = o2;
          }
        },
        useReducer: function(e2, n, o2) {
          z = "useReducer", N();
          var i2 = x.H;
          x.H = Ca;
          try {
            return $u(e2, n, o2);
          } finally {
            x.H = i2;
          }
        },
        useRef: function(e2) {
          return z = "useRef", N(), br(e2);
        },
        useState: function(e2) {
          z = "useState", N();
          var n = x.H;
          x.H = Ca;
          try {
            return $i(e2);
          } finally {
            x.H = n;
          }
        },
        useDebugValue: function() {
          z = "useDebugValue", N();
        },
        useDeferredValue: function(e2, n) {
          return z = "useDeferredValue", N(), ms(e2, n);
        },
        useTransition: function() {
          return z = "useTransition", N(), tc();
        },
        useSyncExternalStore: function(e2, n, o2) {
          return z = "useSyncExternalStore", N(), Vu(e2, n, o2);
        },
        useId: function() {
          return z = "useId", N(), bs();
        },
        useActionState: function(e2, n) {
          return z = "useActionState", N(), tn(e2, n);
        },
        useFormState: function(e2, n) {
          return z = "useFormState", N(), Mi(), tn(e2, n);
        },
        useOptimistic: function(e2) {
          return z = "useOptimistic", N(), Ju(e2);
        },
        useHostTransitionStatus: ia,
        useMemoCache: Oa,
        useCacheRefresh: function() {
          return z = "useCacheRefresh", N(), la();
        },
        useEffectEvent: function(e2) {
          return z = "useEffectEvent", N(), ra(e2);
        }
      }, xg = {
        readContext: function(e2) {
          return Ee(e2);
        },
        use: we,
        useCallback: function(e2, n) {
          return z = "useCallback", N(), Ma(e2, n);
        },
        useContext: function(e2) {
          return z = "useContext", N(), Ee(e2);
        },
        useEffect: function(e2, n) {
          z = "useEffect", N(), Qn(2048, Ut, e2, n);
        },
        useImperativeHandle: function(e2, n, o2) {
          return z = "useImperativeHandle", N(), aa(e2, n, o2);
        },
        useInsertionEffect: function(e2, n) {
          return z = "useInsertionEffect", N(), Qn(4, Wt, e2, n);
        },
        useLayoutEffect: function(e2, n) {
          return z = "useLayoutEffect", N(), Qn(4, Rr, e2, n);
        },
        useMemo: function(e2, n) {
          z = "useMemo", N();
          var o2 = x.H;
          x.H = $o;
          try {
            return Vi(e2, n);
          } finally {
            x.H = o2;
          }
        },
        useReducer: function(e2, n, o2) {
          z = "useReducer", N();
          var i2 = x.H;
          x.H = $o;
          try {
            return Br(e2, n, o2);
          } finally {
            x.H = i2;
          }
        },
        useRef: function() {
          return z = "useRef", N(), xe().memoizedState;
        },
        useState: function() {
          z = "useState", N();
          var e2 = x.H;
          x.H = $o;
          try {
            return Br(gr);
          } finally {
            x.H = e2;
          }
        },
        useDebugValue: function() {
          z = "useDebugValue", N();
        },
        useDeferredValue: function(e2, n) {
          return z = "useDeferredValue", N(), nc(e2, n);
        },
        useTransition: function() {
          return z = "useTransition", N(), Qp();
        },
        useSyncExternalStore: function(e2, n, o2) {
          return z = "useSyncExternalStore", N(), ta(e2, n, o2);
        },
        useId: function() {
          return z = "useId", N(), xe().memoizedState;
        },
        useFormState: function(e2) {
          return z = "useFormState", N(), Mi(), hs(e2);
        },
        useActionState: function(e2) {
          return z = "useActionState", N(), hs(e2);
        },
        useOptimistic: function(e2, n) {
          return z = "useOptimistic", N(), rf(e2, n);
        },
        useHostTransitionStatus: ia,
        useMemoCache: Oa,
        useCacheRefresh: function() {
          return z = "useCacheRefresh", N(), xe().memoizedState;
        },
        useEffectEvent: function(e2) {
          return z = "useEffectEvent", N(), oa(e2);
        }
      }, Ny = {
        readContext: function(e2) {
          return Ee(e2);
        },
        use: we,
        useCallback: function(e2, n) {
          return z = "useCallback", N(), Ma(e2, n);
        },
        useContext: function(e2) {
          return z = "useContext", N(), Ee(e2);
        },
        useEffect: function(e2, n) {
          z = "useEffect", N(), Qn(2048, Ut, e2, n);
        },
        useImperativeHandle: function(e2, n, o2) {
          return z = "useImperativeHandle", N(), aa(e2, n, o2);
        },
        useInsertionEffect: function(e2, n) {
          return z = "useInsertionEffect", N(), Qn(4, Wt, e2, n);
        },
        useLayoutEffect: function(e2, n) {
          return z = "useLayoutEffect", N(), Qn(4, Rr, e2, n);
        },
        useMemo: function(e2, n) {
          z = "useMemo", N();
          var o2 = x.H;
          x.H = dm;
          try {
            return Vi(e2, n);
          } finally {
            x.H = o2;
          }
        },
        useReducer: function(e2, n, o2) {
          z = "useReducer", N();
          var i2 = x.H;
          x.H = dm;
          try {
            return Qi(e2, n, o2);
          } finally {
            x.H = i2;
          }
        },
        useRef: function() {
          return z = "useRef", N(), xe().memoizedState;
        },
        useState: function() {
          z = "useState", N();
          var e2 = x.H;
          x.H = dm;
          try {
            return Qi(gr);
          } finally {
            x.H = e2;
          }
        },
        useDebugValue: function() {
          z = "useDebugValue", N();
        },
        useDeferredValue: function(e2, n) {
          return z = "useDeferredValue", N(), sf(e2, n);
        },
        useTransition: function() {
          return z = "useTransition", N(), Ro();
        },
        useSyncExternalStore: function(e2, n, o2) {
          return z = "useSyncExternalStore", N(), ta(e2, n, o2);
        },
        useId: function() {
          return z = "useId", N(), xe().memoizedState;
        },
        useFormState: function(e2) {
          return z = "useFormState", N(), Mi(), $t(e2);
        },
        useActionState: function(e2) {
          return z = "useActionState", N(), $t(e2);
        },
        useOptimistic: function(e2, n) {
          return z = "useOptimistic", N(), of(e2, n);
        },
        useHostTransitionStatus: ia,
        useMemoCache: Oa,
        useCacheRefresh: function() {
          return z = "useCacheRefresh", N(), xe().memoizedState;
        },
        useEffectEvent: function(e2) {
          return z = "useEffectEvent", N(), oa(e2);
        }
      }, Ca = {
        readContext: function(e2) {
          return Ce(), Ee(e2);
        },
        use: function(e2) {
          return D(), we(e2);
        },
        useCallback: function(e2, n) {
          return z = "useCallback", D(), ee(), Ku(e2, n);
        },
        useContext: function(e2) {
          return z = "useContext", D(), ee(), Ee(e2);
        },
        useEffect: function(e2, n) {
          return z = "useEffect", D(), ee(), yt(e2, n);
        },
        useImperativeHandle: function(e2, n, o2) {
          return z = "useImperativeHandle", D(), ee(), Xu(e2, n, o2);
        },
        useInsertionEffect: function(e2, n) {
          z = "useInsertionEffect", D(), ee(), To(4, Wt, e2, n);
        },
        useLayoutEffect: function(e2, n) {
          return z = "useLayoutEffect", D(), ee(), _o(e2, n);
        },
        useMemo: function(e2, n) {
          z = "useMemo", D(), ee();
          var o2 = x.H;
          x.H = Ca;
          try {
            return ec(e2, n);
          } finally {
            x.H = o2;
          }
        },
        useReducer: function(e2, n, o2) {
          z = "useReducer", D(), ee();
          var i2 = x.H;
          x.H = Ca;
          try {
            return $u(e2, n, o2);
          } finally {
            x.H = i2;
          }
        },
        useRef: function(e2) {
          return z = "useRef", D(), ee(), br(e2);
        },
        useState: function(e2) {
          z = "useState", D(), ee();
          var n = x.H;
          x.H = Ca;
          try {
            return $i(e2);
          } finally {
            x.H = n;
          }
        },
        useDebugValue: function() {
          z = "useDebugValue", D(), ee();
        },
        useDeferredValue: function(e2, n) {
          return z = "useDeferredValue", D(), ee(), ms(e2, n);
        },
        useTransition: function() {
          return z = "useTransition", D(), ee(), tc();
        },
        useSyncExternalStore: function(e2, n, o2) {
          return z = "useSyncExternalStore", D(), ee(), Vu(e2, n, o2);
        },
        useId: function() {
          return z = "useId", D(), ee(), bs();
        },
        useFormState: function(e2, n) {
          return z = "useFormState", D(), ee(), tn(e2, n);
        },
        useActionState: function(e2, n) {
          return z = "useActionState", D(), ee(), tn(e2, n);
        },
        useOptimistic: function(e2) {
          return z = "useOptimistic", D(), ee(), Ju(e2);
        },
        useMemoCache: function(e2) {
          return D(), Oa(e2);
        },
        useHostTransitionStatus: ia,
        useCacheRefresh: function() {
          return z = "useCacheRefresh", ee(), la();
        },
        useEffectEvent: function(e2) {
          return z = "useEffectEvent", D(), ee(), ra(e2);
        }
      }, $o = {
        readContext: function(e2) {
          return Ce(), Ee(e2);
        },
        use: function(e2) {
          return D(), we(e2);
        },
        useCallback: function(e2, n) {
          return z = "useCallback", D(), N(), Ma(e2, n);
        },
        useContext: function(e2) {
          return z = "useContext", D(), N(), Ee(e2);
        },
        useEffect: function(e2, n) {
          z = "useEffect", D(), N(), Qn(2048, Ut, e2, n);
        },
        useImperativeHandle: function(e2, n, o2) {
          return z = "useImperativeHandle", D(), N(), aa(e2, n, o2);
        },
        useInsertionEffect: function(e2, n) {
          return z = "useInsertionEffect", D(), N(), Qn(4, Wt, e2, n);
        },
        useLayoutEffect: function(e2, n) {
          return z = "useLayoutEffect", D(), N(), Qn(4, Rr, e2, n);
        },
        useMemo: function(e2, n) {
          z = "useMemo", D(), N();
          var o2 = x.H;
          x.H = $o;
          try {
            return Vi(e2, n);
          } finally {
            x.H = o2;
          }
        },
        useReducer: function(e2, n, o2) {
          z = "useReducer", D(), N();
          var i2 = x.H;
          x.H = $o;
          try {
            return Br(e2, n, o2);
          } finally {
            x.H = i2;
          }
        },
        useRef: function() {
          return z = "useRef", D(), N(), xe().memoizedState;
        },
        useState: function() {
          z = "useState", D(), N();
          var e2 = x.H;
          x.H = $o;
          try {
            return Br(gr);
          } finally {
            x.H = e2;
          }
        },
        useDebugValue: function() {
          z = "useDebugValue", D(), N();
        },
        useDeferredValue: function(e2, n) {
          return z = "useDeferredValue", D(), N(), nc(e2, n);
        },
        useTransition: function() {
          return z = "useTransition", D(), N(), Qp();
        },
        useSyncExternalStore: function(e2, n, o2) {
          return z = "useSyncExternalStore", D(), N(), ta(e2, n, o2);
        },
        useId: function() {
          return z = "useId", D(), N(), xe().memoizedState;
        },
        useFormState: function(e2) {
          return z = "useFormState", D(), N(), hs(e2);
        },
        useActionState: function(e2) {
          return z = "useActionState", D(), N(), hs(e2);
        },
        useOptimistic: function(e2, n) {
          return z = "useOptimistic", D(), N(), rf(e2, n);
        },
        useMemoCache: function(e2) {
          return D(), Oa(e2);
        },
        useHostTransitionStatus: ia,
        useCacheRefresh: function() {
          return z = "useCacheRefresh", N(), xe().memoizedState;
        },
        useEffectEvent: function(e2) {
          return z = "useEffectEvent", D(), N(), oa(e2);
        }
      }, dm = {
        readContext: function(e2) {
          return Ce(), Ee(e2);
        },
        use: function(e2) {
          return D(), we(e2);
        },
        useCallback: function(e2, n) {
          return z = "useCallback", D(), N(), Ma(e2, n);
        },
        useContext: function(e2) {
          return z = "useContext", D(), N(), Ee(e2);
        },
        useEffect: function(e2, n) {
          z = "useEffect", D(), N(), Qn(2048, Ut, e2, n);
        },
        useImperativeHandle: function(e2, n, o2) {
          return z = "useImperativeHandle", D(), N(), aa(e2, n, o2);
        },
        useInsertionEffect: function(e2, n) {
          return z = "useInsertionEffect", D(), N(), Qn(4, Wt, e2, n);
        },
        useLayoutEffect: function(e2, n) {
          return z = "useLayoutEffect", D(), N(), Qn(4, Rr, e2, n);
        },
        useMemo: function(e2, n) {
          z = "useMemo", D(), N();
          var o2 = x.H;
          x.H = $o;
          try {
            return Vi(e2, n);
          } finally {
            x.H = o2;
          }
        },
        useReducer: function(e2, n, o2) {
          z = "useReducer", D(), N();
          var i2 = x.H;
          x.H = $o;
          try {
            return Qi(e2, n, o2);
          } finally {
            x.H = i2;
          }
        },
        useRef: function() {
          return z = "useRef", D(), N(), xe().memoizedState;
        },
        useState: function() {
          z = "useState", D(), N();
          var e2 = x.H;
          x.H = $o;
          try {
            return Qi(gr);
          } finally {
            x.H = e2;
          }
        },
        useDebugValue: function() {
          z = "useDebugValue", D(), N();
        },
        useDeferredValue: function(e2, n) {
          return z = "useDeferredValue", D(), N(), sf(e2, n);
        },
        useTransition: function() {
          return z = "useTransition", D(), N(), Ro();
        },
        useSyncExternalStore: function(e2, n, o2) {
          return z = "useSyncExternalStore", D(), N(), ta(e2, n, o2);
        },
        useId: function() {
          return z = "useId", D(), N(), xe().memoizedState;
        },
        useFormState: function(e2) {
          return z = "useFormState", D(), N(), $t(e2);
        },
        useActionState: function(e2) {
          return z = "useActionState", D(), N(), $t(e2);
        },
        useOptimistic: function(e2, n) {
          return z = "useOptimistic", D(), N(), of(e2, n);
        },
        useMemoCache: function(e2) {
          return D(), Oa(e2);
        },
        useHostTransitionStatus: ia,
        useCacheRefresh: function() {
          return z = "useCacheRefresh", N(), xe().memoizedState;
        },
        useEffectEvent: function(e2) {
          return z = "useEffectEvent", D(), N(), oa(e2);
        }
      };
      var Fy = {}, Hy = /* @__PURE__ */ new Set(), Ay = /* @__PURE__ */ new Set(), jy = /* @__PURE__ */ new Set(), Dy = /* @__PURE__ */ new Set(), Wy = /* @__PURE__ */ new Set(), Uy = /* @__PURE__ */ new Set(), By = /* @__PURE__ */ new Set(), Oy = /* @__PURE__ */ new Set(), My = /* @__PURE__ */ new Set(), Qy = /* @__PURE__ */ new Set();
      Object.freeze(Fy);
      var zg = {
        enqueueSetState: function(e2, n, o2) {
          e2 = e2._reactInternals;
          var i2 = Nt(e2), s = zo(i2);
          s.payload = n, o2 != null && (df(o2), s.callback = o2), n = Mt(e2, s, i2), n !== null && (ur(i2, "this.setState()", e2), We(n, e2, i2), Bi(n, e2, i2));
        },
        enqueueReplaceState: function(e2, n, o2) {
          e2 = e2._reactInternals;
          var i2 = Nt(e2), s = zo(i2);
          s.tag = Cy, s.payload = n, o2 != null && (df(o2), s.callback = o2), n = Mt(e2, s, i2), n !== null && (ur(i2, "this.replaceState()", e2), We(n, e2, i2), Bi(n, e2, i2));
        },
        enqueueForceUpdate: function(e2, n) {
          e2 = e2._reactInternals;
          var o2 = Nt(e2), i2 = zo(o2);
          i2.tag = Ty, n != null && (df(n), i2.callback = n), n = Mt(e2, i2, o2), n !== null && (ur(o2, "this.forceUpdate()", e2), We(n, e2, o2), Bi(n, e2, o2));
        }
      }, bd = null, Cg = null, Tg = Error("This is not a real error. It's an implementation detail of React's selective hydration feature. If this leaks into userspace, it's a bug in React. Please file an issue."), Cn = false, $y = {}, Vy = {}, qy = {}, Gy = {}, vd = false, Jy = {}, fm = {}, _g = {
        dehydrated: null,
        treeContext: null,
        retryLane: 0,
        hydrationErrors: null
      }, Zy = false, Yy = null;
      Yy = /* @__PURE__ */ new Set();
      var Si = false, Tn = false, Rg = false, Xy = typeof WeakSet == "function" ? WeakSet : Set, Gn = null, Sd = null, kd = null, _n = null, nr = false, Vo = null, Wn = false, wd = 8192, Vb = {
        getCacheForType: function(e2) {
          var n = Ee(un), o2 = n.data.get(e2);
          return o2 === void 0 && (o2 = e2(), n.data.set(e2, o2)), o2;
        },
        cacheSignal: function() {
          return Ee(un).controller.signal;
        },
        getOwner: function() {
          return di;
        }
      }, pm = 0, hm = 1, mm = 2, gm = 3, ym = 4;
      if (typeof Symbol == "function" && Symbol.for) {
        var bp = Symbol.for;
        pm = bp("selector.component"), hm = bp("selector.has_pseudo_class"), mm = bp("selector.role"), gm = bp("selector.test_id"), ym = bp("selector.text");
      }
      var bm = [], qb = typeof WeakMap == "function" ? WeakMap : Map, Jn = 0, Zn = 2, uo = 4, ki = 0, vp = 1, iu = 2, vm = 3, Tl = 4, Sm = 6, Ky = 5, ye = Jn, je = null, se = null, ae = 0, tr = 0, km = 1, lu = 2, Sp = 3, eb = 4, Eg = 5, kp = 6, wm = 7, Ig = 8, su = 9, Le = tr, Er = null, _l = false, Pd = false, Lg = false, Ta = 0, nn = ki, Rl = 0, El = 0, Ng = 0, rr = 0, uu = 0, wp = null, Bt = null, Pm = false, xm = 0, nb = 0, tb = 300, Pp = 1 / 0, Fg = 500, xp = null, gn = null, Il = null, zm = 0, Hg = 1, Ag = 2, rb = 3, Ll = 0, ob = 1, ab = 2, ib = 3, lb = 4, Cm = 5, Rn = 0, Nl = null, xd = null, qo = 0, jg = 0, Dg = -0, Wg = null, sb = null, ub = null, Go = zm, cb = null, Gb = 50, zp = 0, Ug = null, Bg = false, Tm = false, Jb = 50, cu = 0, Cp = null, zd = false, _m = null, db = false, fb = /* @__PURE__ */ new Set(), Zb = {}, co = null, Cd = null, pb = false;
      try {
        var o0 = Object.preventExtensions({});
      } catch {
        pb = true;
      }
      var hb = false, mb = {}, gb = null, yb = null, bb = null, vb = null, Sb = null, kb = null, wb = null, Pb = null, xb = null, zb = null;
      return gb = function(e2, n, o2, i2) {
        n = Yn(e2, n), n !== null && (o2 = _d(n.memoizedState, o2, 0, i2), n.memoizedState = o2, n.baseState = o2, e2.memoizedProps = ze({}, e2.memoizedProps), o2 = On(e2, 2), o2 !== null && We(o2, e2, 2));
      }, yb = function(e2, n, o2) {
        n = Yn(e2, n), n !== null && (o2 = du(n.memoizedState, o2, 0), n.memoizedState = o2, n.baseState = o2, e2.memoizedProps = ze({}, e2.memoizedProps), o2 = On(e2, 2), o2 !== null && We(o2, e2, 2));
      }, bb = function(e2, n, o2, i2) {
        n = Yn(e2, n), n !== null && (o2 = F(n.memoizedState, o2, i2), n.memoizedState = o2, n.baseState = o2, e2.memoizedProps = ze({}, e2.memoizedProps), o2 = On(e2, 2), o2 !== null && We(o2, e2, 2));
      }, vb = function(e2, n, o2) {
        e2.pendingProps = _d(e2.memoizedProps, n, 0, o2), e2.alternate && (e2.alternate.pendingProps = e2.pendingProps), n = On(e2, 2), n !== null && We(n, e2, 2);
      }, Sb = function(e2, n) {
        e2.pendingProps = du(e2.memoizedProps, n, 0), e2.alternate && (e2.alternate.pendingProps = e2.pendingProps), n = On(e2, 2), n !== null && We(n, e2, 2);
      }, kb = function(e2, n, o2) {
        e2.pendingProps = F(e2.memoizedProps, n, o2), e2.alternate && (e2.alternate.pendingProps = e2.pendingProps), n = On(e2, 2), n !== null && We(n, e2, 2);
      }, wb = function(e2) {
        var n = On(e2, 2);
        n !== null && We(n, e2, 2);
      }, Pb = function(e2) {
        var n = ut(), o2 = On(e2, n);
        o2 !== null && We(o2, e2, n);
      }, xb = function(e2) {
        pu = e2;
      }, zb = function(e2) {
        fu = e2;
      }, le.attemptContinuousHydration = function(e2) {
        if (e2.tag === 13 || e2.tag === 31) {
          var n = On(e2, 67108864);
          n !== null && We(n, e2, 67108864), rl(e2, 67108864);
        }
      }, le.attemptHydrationAtCurrentPriority = function(e2) {
        if (e2.tag === 13 || e2.tag === 31) {
          var n = Nt(e2);
          n = Xo(n);
          var o2 = On(e2, n);
          o2 !== null && We(o2, e2, n), rl(e2, n);
        }
      }, le.attemptSynchronousHydration = function(e2) {
        switch (e2.tag) {
          case 3:
            if (e2 = e2.stateNode, e2.current.memoizedState.isDehydrated) {
              var n = _t(e2.pendingLanes);
              if (n !== 0) {
                for (e2.pendingLanes |= 2, e2.entangledLanes |= 2; n; ) {
                  var o2 = 1 << 31 - vn(n);
                  e2.entanglements[1] |= o2, n &= ~o2;
                }
                Kn(e2), (ye & (Zn | uo)) === Jn && (Pp = me() + Fg, Wa(0, false));
              }
            }
            break;
          case 31:
          case 13:
            n = On(e2, 2), n !== null && We(n, e2, 2), Ls(), rl(e2, 2);
        }
      }, le.batchedUpdates = function(e2, n) {
        return e2(n);
      }, le.createComponentSelector = function(e2) {
        return {
          $$typeof: pm,
          value: e2
        };
      }, le.createContainer = function(e2, n, o2, i2, s, u, f, p, g, S) {
        return Ka(e2, n, false, null, o2, i2, u, null, f, p, g, S);
      }, le.createHasPseudoClassSelector = function(e2) {
        return {
          $$typeof: hm,
          value: e2
        };
      }, le.createHydrationContainer = function(e2, n, o2, i2, s, u, f, p, g, S, T, _, I, O) {
        var _n2;
        return e2 = Ka(o2, i2, true, e2, s, u, p, O, g, S, T, _), e2.context = Dh(null), o2 = e2.current, i2 = Nt(o2), i2 = Xo(i2), s = zo(i2), s.callback = (_n2 = n) != null ? _n2 : null, Mt(o2, s, i2), ur(i2, "hydrateRoot()", null), n = i2, e2.current.lanes = n, Ci(e2, n), Kn(e2), e2;
      }, le.createPortal = function(e2, n, o2) {
        var i2 = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
        try {
          vt(i2);
          var s = false;
        } catch {
          s = true;
        }
        return s && (console.error("The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", typeof Symbol == "function" && Symbol.toStringTag && i2[Symbol.toStringTag] || i2.constructor.name || "Object"), vt(i2)), {
          $$typeof: Ao,
          key: i2 == null ? null : "" + i2,
          children: e2,
          containerInfo: n,
          implementation: o2
        };
      }, le.createRoleSelector = function(e2) {
        return {
          $$typeof: mm,
          value: e2
        };
      }, le.createTestNameSelector = function(e2) {
        return {
          $$typeof: gm,
          value: e2
        };
      }, le.createTextSelector = function(e2) {
        return {
          $$typeof: ym,
          value: e2
        };
      }, le.defaultOnCaughtError = function(e2) {
        var n = bd ? "The above error occurred in the <" + bd + "> component." : "The above error occurred in one of your React components.", o2 = "React will try to recreate this component tree from scratch using the error boundary you provided, " + ((Cg || "Anonymous") + ".");
        typeof e2 == "object" && e2 !== null && typeof e2.environmentName == "string" ? ri("error", [`%o

%s

%s
`, e2, n, o2], e2.environmentName)() : console.error(`%o

%s

%s
`, e2, n, o2);
      }, le.defaultOnRecoverableError = function(e2) {
        qg(e2);
      }, le.defaultOnUncaughtError = function(e2) {
        qg(e2), console.warn(`%s

%s
`, bd ? "An error occurred in the <" + bd + "> component." : "An error occurred in one of your React components.", `Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.`);
      }, le.deferredUpdates = function(e2) {
        var n = x.T, o2 = wt();
        try {
          return an(32), x.T = null, e2();
        } finally {
          an(o2), x.T = n;
        }
      }, le.discreteUpdates = function(e2, n, o2, i2, s) {
        var u = x.T, f = wt();
        try {
          return an(2), x.T = null, e2(n, o2, i2, s);
        } finally {
          an(f), x.T = u, ye === Jn && (Pp = me() + Fg);
        }
      }, le.findAllNodes = kc, le.findBoundingRects = function(e2, n) {
        if (!xr) throw Error("Test selector API is not supported by this renderer.");
        n = kc(e2, n), e2 = [];
        for (var o2 = 0; o2 < n.length; o2++) e2.push(ma(n[o2]));
        for (n = e2.length - 1; 0 < n; n--) {
          o2 = e2[n];
          for (var i2 = o2.x, s = i2 + o2.width, u = o2.y, f = u + o2.height, p = n - 1; 0 <= p; p--) if (n !== p) {
            var g = e2[p], S = g.x, T = S + g.width, _ = g.y, I = _ + g.height;
            if (i2 >= S && u >= _ && s <= T && f <= I) {
              e2.splice(n, 1);
              break;
            } else if (i2 !== S || o2.width !== g.width || I < u || _ > f) {
              if (!(u !== _ || o2.height !== g.height || T < i2 || S > s)) {
                S > i2 && (g.width += S - i2, g.x = i2), T < s && (g.width = s - S), e2.splice(n, 1);
                break;
              }
            } else {
              _ > u && (g.height += _ - u, g.y = u), I < f && (g.height = f - _), e2.splice(n, 1);
              break;
            }
          }
        }
        return e2;
      }, le.findHostInstance = function(e2) {
        var n = e2._reactInternals;
        if (n === void 0) throw typeof e2.render == "function" ? Error("Unable to find node on an unmounted component.") : (e2 = Object.keys(e2).join(","), Error("Argument appears to not be a ReactComponent. Keys: " + e2));
        return e2 = mu(n), e2 === null ? null : ot(e2.stateNode);
      }, le.findHostInstanceWithNoPortals = function(e2) {
        return e2 = Ed(e2), e2 = e2 !== null ? _p(e2) : null, e2 === null ? null : ot(e2.stateNode);
      }, le.findHostInstanceWithWarning = function(e2, n) {
        var o2 = e2._reactInternals;
        if (o2 === void 0) throw typeof e2.render == "function" ? Error("Unable to find node on an unmounted component.") : (e2 = Object.keys(e2).join(","), Error("Argument appears to not be a ReactComponent. Keys: " + e2));
        if (e2 = mu(o2), e2 === null) return null;
        if (e2.mode & 8) {
          var i2 = G(o2) || "Component";
          mb[i2] || (mb[i2] = true, B(e2, function() {
            o2.mode & 8 ? console.error("%s is deprecated in StrictMode. %s was passed an instance of %s which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://react.dev/link/strict-mode-find-node", n, n, i2) : console.error("%s is deprecated in StrictMode. %s was passed an instance of %s which renders StrictMode children. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://react.dev/link/strict-mode-find-node", n, n, i2);
          }));
        }
        return ot(e2.stateNode);
      }, le.flushPassiveEffects = el, le.flushSyncFromReconciler = function(e2) {
        var n = ye;
        ye |= 1;
        var o2 = x.T, i2 = wt();
        try {
          if (an(2), x.T = null, e2) return e2();
        } finally {
          an(i2), x.T = o2, ye = n, (ye & (Zn | uo)) === Jn && Wa(0, false);
        }
      }, le.flushSyncWork = Ls, le.focusWithin = function(e2, n) {
        if (!xr) throw Error("Test selector API is not supported by this renderer.");
        for (e2 = Ef(e2), n = hh(e2, n), n = Array.from(n), e2 = 0; e2 < n.length; ) {
          var o2 = n[e2++], i2 = o2.tag;
          if (!Kr(o2)) {
            if ((i2 === 5 || i2 === 26 || i2 === 27) && Ft(o2.stateNode)) return true;
            for (o2 = o2.child; o2 !== null; ) n.push(o2), o2 = o2.sibling;
          }
        }
        return false;
      }, le.getFindAllNodesFailureDescription = function(e2, n) {
        if (!xr) throw Error("Test selector API is not supported by this renderer.");
        var o2 = 0, i2 = [];
        e2 = [Ef(e2), 0];
        for (var s = 0; s < e2.length; ) {
          var u = e2[s++], f = u.tag, p = e2[s++], g = n[p];
          if ((f !== 5 && f !== 26 && f !== 27 || !Kr(u)) && (If(u, g) && (i2.push(Sc(g)), p++, p > o2 && (o2 = p)), p < n.length)) for (u = u.child; u !== null; ) e2.push(u, p), u = u.sibling;
        }
        if (o2 < n.length) {
          for (e2 = []; o2 < n.length; o2++) e2.push(Sc(n[o2]));
          return `findAllNodes was able to match part of the selector:
  ` + (i2.join(" > ") + `

No matching component was found for:
  `) + e2.join(" > ");
        }
        return null;
      }, le.getPublicRootInstance = function(e2) {
        if (e2 = e2.current, !e2.child) return null;
        switch (e2.child.tag) {
          case 27:
          case 5:
            return ot(e2.child.stateNode);
          default:
            return e2.child.stateNode;
        }
      }, le.injectIntoDevTools = function() {
        var e2 = {
          bundleType: 1,
          version: Jt,
          rendererPackageName: Zt,
          currentDispatcherRef: x,
          reconcilerVersion: "19.2.0"
        };
        return jo !== null && (e2.rendererConfig = jo), e2.overrideHookState = gb, e2.overrideHookStateDeletePath = yb, e2.overrideHookStateRenamePath = bb, e2.overrideProps = vb, e2.overridePropsDeletePath = Sb, e2.overridePropsRenamePath = kb, e2.scheduleUpdate = wb, e2.scheduleRetry = Pb, e2.setErrorHandler = xb, e2.setSuspenseHandler = zb, e2.scheduleRefresh = hu, e2.scheduleRoot = Fl, e2.setRefreshHandler = Ir, e2.getCurrentFiber = Ic, Ep(e2);
      }, le.isAlreadyRendering = Ns, le.observeVisibleRects = function(e2, n, o2, i2) {
        function s() {
          var S = kc(e2, n);
          u.forEach(function(T) {
            0 > S.indexOf(T) && g(T);
          }), S.forEach(function(T) {
            0 > u.indexOf(T) && p(T);
          });
        }
        if (!xr) throw Error("Test selector API is not supported by this renderer.");
        var u = kc(e2, n);
        o2 = zr(u, o2, i2);
        var f = o2.disconnect, p = o2.observe, g = o2.unobserve;
        return bm.push(s), {
          disconnect: function() {
            var S = bm.indexOf(s);
            0 <= S && bm.splice(S, 1), f();
          }
        };
      }, le.shouldError = function(e2) {
        return pu(e2);
      }, le.shouldSuspend = function(e2) {
        return fu(e2);
      }, le.startHostTransition = function(e2, n, o2, i2) {
        if (e2.tag !== 5) throw Error("Expected the form instance to be a HostComponent. This is a bug in React.");
        var s = uf(e2).queue;
        Hp(e2), nt(e2, s, n, Xt, o2 === null ? Em : function() {
          x.T === null && console.error("requestFormReset was called outside a transition or action. To fix, move to an action, or wrap with startTransition.");
          var u = uf(e2);
          return u.next === null && (u = e2.alternate.memoizedState), qi(e2, u.next.queue, {}, Nt(e2)), o2(i2);
        });
      }, le.updateContainer = function(e2, n, o2, i2) {
        var s = n.current, u = Nt(s);
        return As(s, u, e2, n, o2, i2), u;
      }, le.updateContainerSync = Wh, le;
    }, Tt.exports.default = Tt.exports, Object.defineProperty(Tt.exports, "__esModule", {
      value: true
    });
  })(Mg)), Mg.exports;
}
var Eb;
function n0() {
  return Eb || (Eb = 1, false ? Rm.exports = Kb() : Rm.exports = e0()), Rm.exports;
}
var t0 = n0();
var r0 = Xb(t0);
function createReconciler(config) {
  const reconciler2 = r0(config);
  reconciler2.injectIntoDevTools();
  return reconciler2;
}
var NoEventPriority = 0;
var catalogue = {};
var PREFIX_REGEX = /^three(?=[A-Z])/;
var toPascalCase = (type) => `${type[0].toUpperCase()}${type.slice(1)}`;
var i = 0;
var isConstructor = (object) => typeof object === "function";
function extend(objects) {
  if (isConstructor(objects)) {
    const Component2 = `${i++}`;
    catalogue[Component2] = objects;
    return Component2;
  } else {
    Object.assign(catalogue, objects);
  }
}
function validateInstance(type, props) {
  const name = toPascalCase(type);
  const target = catalogue[name];
  if (type !== "primitive" && !target) throw new Error(`R3F: ${name} is not part of the THREE namespace! Did you forget to extend? See: https://docs.pmnd.rs/react-three-fiber/api/objects#using-3rd-party-objects-declaratively`);
  if (type === "primitive" && !props.object) throw new Error(`R3F: Primitives without 'object' are invalid!`);
  if (props.args !== void 0 && !Array.isArray(props.args)) throw new Error("R3F: The args prop must be an array!");
}
function createInstance(type, props, root) {
  var _props$object;
  type = toPascalCase(type) in catalogue ? type : type.replace(PREFIX_REGEX, "");
  validateInstance(type, props);
  if (type === "primitive" && (_props$object = props.object) != null && _props$object.__r3f) delete props.object.__r3f;
  return prepare(props.object, root, type, props);
}
function hideInstance(instance) {
  if (!instance.isHidden) {
    var _instance$parent;
    if (instance.props.attach && (_instance$parent = instance.parent) != null && _instance$parent.object) {
      detach(instance.parent, instance);
    } else if (isObject3D(instance.object)) {
      instance.object.visible = false;
    }
    instance.isHidden = true;
    invalidateInstance(instance);
  }
}
function unhideInstance(instance) {
  if (instance.isHidden) {
    var _instance$parent2;
    if (instance.props.attach && (_instance$parent2 = instance.parent) != null && _instance$parent2.object) {
      attach(instance.parent, instance);
    } else if (isObject3D(instance.object) && instance.props.visible !== false) {
      instance.object.visible = true;
    }
    instance.isHidden = false;
    invalidateInstance(instance);
  }
}
function handleContainerEffects(parent, child, beforeChild) {
  const state2 = child.root.getState();
  if (!parent.parent && parent.object !== state2.scene) return;
  if (!child.object) {
    var _child$props$object, _child$props$args;
    const target = catalogue[toPascalCase(child.type)];
    child.object = (_child$props$object = child.props.object) != null ? _child$props$object : new target(...(_child$props$args = child.props.args) != null ? _child$props$args : []);
    child.object.__r3f = child;
  }
  applyProps(child.object, child.props);
  if (child.props.attach) {
    attach(parent, child);
  } else if (isObject3D(child.object) && isObject3D(parent.object)) {
    const childIndex = parent.object.children.indexOf(beforeChild == null ? void 0 : beforeChild.object);
    if (beforeChild && childIndex !== -1) {
      const existingIndex = parent.object.children.indexOf(child.object);
      if (existingIndex !== -1) {
        parent.object.children.splice(existingIndex, 1);
        const adjustedIndex = existingIndex < childIndex ? childIndex - 1 : childIndex;
        parent.object.children.splice(adjustedIndex, 0, child.object);
      } else {
        child.object.parent = parent.object;
        parent.object.children.splice(childIndex, 0, child.object);
        child.object.dispatchEvent({
          type: "added"
        });
        parent.object.dispatchEvent({
          type: "childadded",
          child: child.object
        });
      }
    } else {
      parent.object.add(child.object);
    }
  }
  for (const childInstance of child.children) handleContainerEffects(child, childInstance);
  invalidateInstance(child);
}
function appendChild(parent, child) {
  if (!child) return;
  child.parent = parent;
  parent.children.push(child);
  handleContainerEffects(parent, child);
}
function insertBefore(parent, child, beforeChild) {
  if (!child || !beforeChild) return;
  child.parent = parent;
  const childIndex = parent.children.indexOf(beforeChild);
  if (childIndex !== -1) parent.children.splice(childIndex, 0, child);
  else parent.children.push(child);
  handleContainerEffects(parent, child, beforeChild);
}
function disposeOnIdle(object) {
  if (typeof object.dispose === "function") {
    const handleDispose = () => {
      try {
        object.dispose();
      } catch {
      }
    };
    if (typeof IS_REACT_ACT_ENVIRONMENT !== "undefined") handleDispose();
    else unstable_scheduleCallback(unstable_IdlePriority, handleDispose);
  }
}
function removeChild(parent, child, dispose2) {
  if (!child) return;
  child.parent = null;
  const childIndex = parent.children.indexOf(child);
  if (childIndex !== -1) parent.children.splice(childIndex, 1);
  if (child.props.attach) {
    detach(parent, child);
  } else if (isObject3D(child.object) && isObject3D(parent.object)) {
    parent.object.remove(child.object);
    removeInteractivity(findInitialRoot(child), child.object);
  }
  const shouldDispose = child.props.dispose !== null && dispose2 !== false;
  for (let i2 = child.children.length - 1; i2 >= 0; i2--) {
    const node = child.children[i2];
    removeChild(child, node, shouldDispose);
  }
  child.children.length = 0;
  delete child.object.__r3f;
  if (shouldDispose && child.type !== "primitive" && child.object.type !== "Scene") {
    disposeOnIdle(child.object);
  }
  if (dispose2 === void 0) invalidateInstance(child);
}
function setFiberRef(fiber, publicInstance) {
  for (const _fiber of [fiber, fiber.alternate]) {
    if (_fiber !== null) {
      if (typeof _fiber.ref === "function") {
        _fiber.refCleanup == null ? void 0 : _fiber.refCleanup();
        const cleanup = _fiber.ref(publicInstance);
        if (typeof cleanup === "function") _fiber.refCleanup = cleanup;
      } else if (_fiber.ref) {
        _fiber.ref.current = publicInstance;
      }
    }
  }
}
var reconstructed = [];
function swapInstances() {
  for (const [instance] of reconstructed) {
    const parent = instance.parent;
    if (parent) {
      if (instance.props.attach) {
        detach(parent, instance);
      } else if (isObject3D(instance.object) && isObject3D(parent.object)) {
        parent.object.remove(instance.object);
      }
      for (const child of instance.children) {
        if (child.props.attach) {
          detach(instance, child);
        } else if (isObject3D(child.object) && isObject3D(instance.object)) {
          instance.object.remove(child.object);
        }
      }
    }
    if (instance.isHidden) unhideInstance(instance);
    if (instance.object.__r3f) delete instance.object.__r3f;
    if (instance.type !== "primitive") disposeOnIdle(instance.object);
  }
  for (const [instance, props, fiber] of reconstructed) {
    instance.props = props;
    const parent = instance.parent;
    if (parent) {
      var _instance$props$objec, _instance$props$args;
      const target = catalogue[toPascalCase(instance.type)];
      instance.object = (_instance$props$objec = instance.props.object) != null ? _instance$props$objec : new target(...(_instance$props$args = instance.props.args) != null ? _instance$props$args : []);
      instance.object.__r3f = instance;
      setFiberRef(fiber, instance.object);
      applyProps(instance.object, instance.props);
      if (instance.props.attach) {
        attach(parent, instance);
      } else if (isObject3D(instance.object) && isObject3D(parent.object)) {
        parent.object.add(instance.object);
      }
      for (const child of instance.children) {
        if (child.props.attach) {
          attach(instance, child);
        } else if (isObject3D(child.object) && isObject3D(instance.object)) {
          instance.object.add(child.object);
        }
      }
      invalidateInstance(instance);
    }
  }
  reconstructed.length = 0;
}
var handleTextInstance = () => {
};
var NO_CONTEXT = {};
var currentUpdatePriority = NoEventPriority;
var NoFlags = 0;
var Update = 4;
var reconciler = /* @__PURE__ */ createReconciler({
  isPrimaryRenderer: false,
  warnsIfNotActing: false,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  createInstance,
  removeChild,
  appendChild,
  appendInitialChild: appendChild,
  insertBefore,
  appendChildToContainer(container, child) {
    const scene = container.getState().scene.__r3f;
    if (!child || !scene) return;
    appendChild(scene, child);
  },
  removeChildFromContainer(container, child) {
    const scene = container.getState().scene.__r3f;
    if (!child || !scene) return;
    removeChild(scene, child);
  },
  insertInContainerBefore(container, child, beforeChild) {
    const scene = container.getState().scene.__r3f;
    if (!child || !beforeChild || !scene) return;
    insertBefore(scene, child, beforeChild);
  },
  getRootHostContext: () => NO_CONTEXT,
  getChildHostContext: () => NO_CONTEXT,
  commitUpdate(instance, type, oldProps, newProps, fiber) {
    var _newProps$args, _oldProps$args, _newProps$args2;
    validateInstance(type, newProps);
    let reconstruct = false;
    if (instance.type === "primitive" && oldProps.object !== newProps.object) reconstruct = true;
    else if (((_newProps$args = newProps.args) == null ? void 0 : _newProps$args.length) !== ((_oldProps$args = oldProps.args) == null ? void 0 : _oldProps$args.length)) reconstruct = true;
    else if ((_newProps$args2 = newProps.args) != null && _newProps$args2.some((value, index) => {
      var _oldProps$args2;
      return value !== ((_oldProps$args2 = oldProps.args) == null ? void 0 : _oldProps$args2[index]);
    })) reconstruct = true;
    if (reconstruct) {
      reconstructed.push([instance, {
        ...newProps
      }, fiber]);
    } else {
      const changedProps = diffProps(instance, newProps);
      if (Object.keys(changedProps).length) {
        Object.assign(instance.props, changedProps);
        applyProps(instance.object, changedProps);
      }
    }
    const isTailSibling = fiber.sibling === null || (fiber.flags & Update) === NoFlags;
    if (isTailSibling) swapInstances();
  },
  finalizeInitialChildren: () => false,
  commitMount() {
  },
  getPublicInstance: (instance) => instance == null ? void 0 : instance.object,
  prepareForCommit: () => null,
  preparePortalMount: (container) => prepare(container.getState().scene, container, "", {}),
  resetAfterCommit: () => {
  },
  shouldSetTextContent: () => false,
  clearContainer: () => false,
  hideInstance,
  unhideInstance,
  createTextInstance: handleTextInstance,
  hideTextInstance: handleTextInstance,
  unhideTextInstance: handleTextInstance,
  scheduleTimeout: typeof setTimeout === "function" ? setTimeout : void 0,
  cancelTimeout: typeof clearTimeout === "function" ? clearTimeout : void 0,
  noTimeout: -1,
  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur() {
  },
  afterActiveInstanceBlur() {
  },
  detachDeletedInstance() {
  },
  prepareScopeUpdate() {
  },
  getInstanceFromScope: () => null,
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: () => {
  },
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1.1,
  requestPostPaintCallback() {
  },
  maySuspendCommit: () => false,
  preloadInstance: () => true,
  // true indicates already loaded
  suspendInstance() {
  },
  waitForCommitToBeReady: () => null,
  NotPendingTransition: null,
  // The reconciler types use the internal ReactContext with all the hidden properties
  // so we have to cast from the public React.Context type
  HostTransitionContext: /* @__PURE__ */ React.createContext(null),
  setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
  },
  getCurrentUpdatePriority() {
    return currentUpdatePriority;
  },
  resolveUpdatePriority() {
    var _window$event;
    if (currentUpdatePriority !== NoEventPriority) return currentUpdatePriority;
    switch (typeof window !== "undefined" && ((_window$event = window.event) == null ? void 0 : _window$event.type)) {
      case "click":
      case "contextmenu":
      case "dblclick":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
        return e;
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "pointerenter":
      case "pointerleave":
      case "wheel":
        return o;
      default:
        return r;
    }
  },
  resetFormInstance() {
  },
  // @ts-ignore DefinitelyTyped is not up to date
  rendererPackageName: "@react-three/fiber",
  rendererVersion: packageData.version,
  // https://github.com/facebook/react/pull/31975
  // https://github.com/facebook/react/pull/31999
  applyViewTransitionName(_instance, _name, _className) {
  },
  restoreViewTransitionName(_instance, _props) {
  },
  cancelViewTransitionName(_instance, _name, _props) {
  },
  cancelRootViewTransitionName(_rootContainer) {
  },
  restoreRootViewTransitionName(_rootContainer) {
  },
  InstanceMeasurement: null,
  measureInstance: (_instance) => null,
  wasInstanceInViewport: (_measurement) => true,
  hasInstanceChanged: (_oldMeasurement, _newMeasurement) => false,
  hasInstanceAffectedParent: (_oldMeasurement, _newMeasurement) => false,
  // https://github.com/facebook/react/pull/32002
  // https://github.com/facebook/react/pull/34486
  suspendOnActiveViewTransition(_state, _container) {
  },
  // https://github.com/facebook/react/pull/32451
  // https://github.com/facebook/react/pull/32760
  startGestureTransition: () => null,
  startViewTransition: () => null,
  stopViewTransition(_transition) {
  },
  // https://github.com/facebook/react/pull/32038
  createViewTransitionInstance: (_name) => null,
  // https://github.com/facebook/react/pull/32379
  // https://github.com/facebook/react/pull/32786
  getCurrentGestureOffset(_provider) {
    throw new Error("startGestureTransition is not yet supported in react-three-fiber.");
  },
  // https://github.com/facebook/react/pull/32500
  cloneMutableInstance(instance, _keepChildren) {
    return instance;
  },
  cloneMutableTextInstance(textInstance) {
    return textInstance;
  },
  cloneRootViewTransitionContainer(_rootContainer) {
    throw new Error("Not implemented.");
  },
  removeRootViewTransitionClone(_rootContainer, _clone) {
    throw new Error("Not implemented.");
  },
  // https://github.com/facebook/react/pull/32465
  createFragmentInstance: (_fiber) => null,
  updateFragmentInstanceFiber(_fiber, _instance) {
  },
  commitNewChildToFragmentInstance(_child, _fragmentInstance) {
  },
  deleteChildFromFragmentInstance(_child, _fragmentInstance) {
  },
  // https://github.com/facebook/react/pull/32653
  measureClonedInstance: (_instance) => null,
  // https://github.com/facebook/react/pull/32819
  maySuspendCommitOnUpdate: (_type, _oldProps, _newProps) => false,
  maySuspendCommitInSyncRender: (_type, _props) => false,
  // https://github.com/facebook/react/pull/34486
  startSuspendingCommit: () => null,
  // https://github.com/facebook/react/pull/34522
  getSuspendedCommitReason: (_state, _rootContainer) => null
});
var _roots = /* @__PURE__ */ new Map();
var shallowLoose = {
  objects: "shallow",
  strict: false
};
function computeInitialSize(canvas, size) {
  if (!size && typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement && canvas.parentElement) {
    const {
      width,
      height,
      top,
      left
    } = canvas.parentElement.getBoundingClientRect();
    return {
      width,
      height,
      top,
      left
    };
  } else if (!size && typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return {
      width: canvas.width,
      height: canvas.height,
      top: 0,
      left: 0
    };
  }
  return {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    ...size
  };
}
function createRoot(canvas) {
  const prevRoot = _roots.get(canvas);
  const prevFiber = prevRoot == null ? void 0 : prevRoot.fiber;
  const prevStore = prevRoot == null ? void 0 : prevRoot.store;
  if (prevRoot) console.warn("R3F.createRoot should only be called once!");
  const logRecoverableError = typeof reportError === "function" ? (
    // In modern browsers, reportError will dispatch an error event,
    // emulating an uncaught JavaScript error.
    reportError
  ) : (
    // In older browsers and test environments, fallback to console.error.
    console.error
  );
  const store = prevStore || createStore(invalidate, advance);
  const fiber = prevFiber || reconciler.createContainer(
    store,
    // container
    t,
    // tag
    null,
    // hydration callbacks
    false,
    // isStrictMode
    null,
    // concurrentUpdatesByDefaultOverride
    "",
    // identifierPrefix
    logRecoverableError,
    // onUncaughtError
    logRecoverableError,
    // onCaughtError
    logRecoverableError,
    // onRecoverableError
    null
    // transitionCallbacks
  );
  if (!prevRoot) _roots.set(canvas, {
    fiber,
    store
  });
  let onCreated;
  let lastCamera;
  let configured = false;
  let pending = null;
  return {
    async configure(props = {}) {
      let resolve2;
      pending = new Promise((_resolve) => resolve2 = _resolve);
      let {
        gl: glConfig,
        size: propsSize,
        scene: sceneOptions,
        events,
        onCreated: onCreatedCallback,
        shadows = false,
        linear = false,
        flat = false,
        legacy = false,
        orthographic = false,
        frameloop = "always",
        dpr = [1, 2],
        performance: performance2,
        raycaster: raycastOptions,
        camera: cameraOptions,
        onPointerMissed
      } = props;
      let state2 = store.getState();
      let gl = state2.gl;
      if (!state2.gl) {
        const defaultProps = {
          canvas,
          powerPreference: "high-performance",
          antialias: true,
          alpha: true
        };
        const customRenderer = typeof glConfig === "function" ? await glConfig(defaultProps) : glConfig;
        if (isRenderer(customRenderer)) {
          gl = customRenderer;
        } else {
          gl = new THREE.WebGLRenderer({
            ...defaultProps,
            ...glConfig
          });
        }
        state2.set({
          gl
        });
      }
      let raycaster = state2.raycaster;
      if (!raycaster) state2.set({
        raycaster: raycaster = new THREE.Raycaster()
      });
      const {
        params,
        ...options
      } = raycastOptions || {};
      if (!is.equ(options, raycaster, shallowLoose)) applyProps(raycaster, {
        ...options
      });
      if (!is.equ(params, raycaster.params, shallowLoose)) applyProps(raycaster, {
        params: {
          ...raycaster.params,
          ...params
        }
      });
      if (!state2.camera || state2.camera === lastCamera && !is.equ(lastCamera, cameraOptions, shallowLoose)) {
        lastCamera = cameraOptions;
        const isCamera = cameraOptions == null ? void 0 : cameraOptions.isCamera;
        const camera = isCamera ? cameraOptions : orthographic ? new THREE.OrthographicCamera(0, 0, 0, 0, 0.1, 1e3) : new THREE.PerspectiveCamera(75, 0, 0.1, 1e3);
        if (!isCamera) {
          camera.position.z = 5;
          if (cameraOptions) {
            applyProps(camera, cameraOptions);
            if (!camera.manual) {
              if ("aspect" in cameraOptions || "left" in cameraOptions || "right" in cameraOptions || "bottom" in cameraOptions || "top" in cameraOptions) {
                camera.manual = true;
                camera.updateProjectionMatrix();
              }
            }
          }
          if (!state2.camera && !(cameraOptions != null && cameraOptions.rotation)) camera.lookAt(0, 0, 0);
        }
        state2.set({
          camera
        });
        raycaster.camera = camera;
      }
      if (!state2.scene) {
        let scene;
        if (sceneOptions != null && sceneOptions.isScene) {
          scene = sceneOptions;
          prepare(scene, store, "", {});
        } else {
          scene = new THREE.Scene();
          prepare(scene, store, "", {});
          if (sceneOptions) applyProps(scene, sceneOptions);
        }
        state2.set({
          scene
        });
      }
      if (events && !state2.events.handlers) state2.set({
        events: events(store)
      });
      const size = computeInitialSize(canvas, propsSize);
      if (!is.equ(size, state2.size, shallowLoose)) {
        state2.setSize(size.width, size.height, size.top, size.left);
      }
      if (dpr && state2.viewport.dpr !== calculateDpr(dpr)) state2.setDpr(dpr);
      if (state2.frameloop !== frameloop) state2.setFrameloop(frameloop);
      if (!state2.onPointerMissed) state2.set({
        onPointerMissed
      });
      if (performance2 && !is.equ(performance2, state2.performance, shallowLoose)) state2.set((state3) => ({
        performance: {
          ...state3.performance,
          ...performance2
        }
      }));
      if (!state2.xr) {
        var _gl$xr;
        const handleXRFrame = (timestamp, frame2) => {
          const state3 = store.getState();
          if (state3.frameloop === "never") return;
          advance(timestamp, true, state3, frame2);
        };
        const handleSessionChange = () => {
          const state3 = store.getState();
          state3.gl.xr.enabled = state3.gl.xr.isPresenting;
          state3.gl.xr.setAnimationLoop(state3.gl.xr.isPresenting ? handleXRFrame : null);
          if (!state3.gl.xr.isPresenting) invalidate(state3);
        };
        const xr = {
          connect() {
            const gl2 = store.getState().gl;
            gl2.xr.addEventListener("sessionstart", handleSessionChange);
            gl2.xr.addEventListener("sessionend", handleSessionChange);
          },
          disconnect() {
            const gl2 = store.getState().gl;
            gl2.xr.removeEventListener("sessionstart", handleSessionChange);
            gl2.xr.removeEventListener("sessionend", handleSessionChange);
          }
        };
        if (typeof ((_gl$xr = gl.xr) == null ? void 0 : _gl$xr.addEventListener) === "function") xr.connect();
        state2.set({
          xr
        });
      }
      if (gl.shadowMap) {
        const oldEnabled = gl.shadowMap.enabled;
        const oldType = gl.shadowMap.type;
        gl.shadowMap.enabled = !!shadows;
        if (is.boo(shadows)) {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        } else if (is.str(shadows)) {
          var _types$shadows;
          const types = {
            basic: THREE.BasicShadowMap,
            percentage: THREE.PCFShadowMap,
            soft: THREE.PCFSoftShadowMap,
            variance: THREE.VSMShadowMap
          };
          gl.shadowMap.type = (_types$shadows = types[shadows]) != null ? _types$shadows : THREE.PCFSoftShadowMap;
        } else if (is.obj(shadows)) {
          Object.assign(gl.shadowMap, shadows);
        }
        if (oldEnabled !== gl.shadowMap.enabled || oldType !== gl.shadowMap.type) gl.shadowMap.needsUpdate = true;
      }
      THREE.ColorManagement.enabled = !legacy;
      if (!configured) {
        gl.outputColorSpace = linear ? THREE.LinearSRGBColorSpace : THREE.SRGBColorSpace;
        gl.toneMapping = flat ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
      }
      if (state2.legacy !== legacy) state2.set(() => ({
        legacy
      }));
      if (state2.linear !== linear) state2.set(() => ({
        linear
      }));
      if (state2.flat !== flat) state2.set(() => ({
        flat
      }));
      if (glConfig && !is.fun(glConfig) && !isRenderer(glConfig) && !is.equ(glConfig, gl, shallowLoose)) applyProps(gl, glConfig);
      onCreated = onCreatedCallback;
      configured = true;
      resolve2();
      return this;
    },
    render(children) {
      if (!configured && !pending) this.configure();
      pending.then(() => {
        reconciler.updateContainer(/* @__PURE__ */ jsx(Provider, {
          store,
          children,
          onCreated,
          rootElement: canvas
        }), fiber, null, () => void 0);
      });
      return store;
    },
    unmount() {
      unmountComponentAtNode(canvas);
    }
  };
}
function Provider({
  store,
  children,
  onCreated,
  rootElement
}) {
  useIsomorphicLayoutEffect(() => {
    const state2 = store.getState();
    state2.set((state3) => ({
      internal: {
        ...state3.internal,
        active: true
      }
    }));
    if (onCreated) onCreated(state2);
    if (!store.getState().events.connected) state2.events.connect == null ? void 0 : state2.events.connect(rootElement);
  }, []);
  return /* @__PURE__ */ jsx(context.Provider, {
    value: store,
    children
  });
}
function unmountComponentAtNode(canvas, callback) {
  const root = _roots.get(canvas);
  const fiber = root == null ? void 0 : root.fiber;
  if (fiber) {
    const state2 = root == null ? void 0 : root.store.getState();
    if (state2) state2.internal.active = false;
    reconciler.updateContainer(null, fiber, null, () => {
      if (state2) {
        setTimeout(() => {
          try {
            var _state$gl, _state$gl$renderLists, _state$gl2, _state$gl3;
            state2.events.disconnect == null ? void 0 : state2.events.disconnect();
            (_state$gl = state2.gl) == null ? void 0 : (_state$gl$renderLists = _state$gl.renderLists) == null ? void 0 : _state$gl$renderLists.dispose == null ? void 0 : _state$gl$renderLists.dispose();
            (_state$gl2 = state2.gl) == null ? void 0 : _state$gl2.forceContextLoss == null ? void 0 : _state$gl2.forceContextLoss();
            if ((_state$gl3 = state2.gl) != null && _state$gl3.xr) state2.xr.disconnect();
            dispose(state2.scene);
            _roots.delete(canvas);
            if (callback) callback(canvas);
          } catch (e2) {
          }
        }, 500);
      }
    });
  }
}
function createPortal(children, container, state2) {
  return /* @__PURE__ */ jsx(Portal, {
    children,
    container,
    state: state2
  });
}
function Portal({
  state: state2 = {},
  children,
  container
}) {
  const {
    events,
    size,
    ...rest
  } = state2;
  const previousRoot = useStore();
  const [raycaster] = React.useState(() => new THREE.Raycaster());
  const [pointer] = React.useState(() => new THREE.Vector2());
  const inject = useMutableCallback((rootState, injectState) => {
    let viewport = void 0;
    if (injectState.camera && size) {
      const camera = injectState.camera;
      viewport = rootState.viewport.getCurrentViewport(camera, new THREE.Vector3(), size);
      if (camera !== rootState.camera) updateCamera(camera, size);
    }
    return {
      // The intersect consists of the previous root state
      ...rootState,
      ...injectState,
      // Portals have their own scene, which forms the root, a raycaster and a pointer
      scene: container,
      raycaster,
      pointer,
      mouse: pointer,
      // Their previous root is the layer before it
      previousRoot,
      // Events, size and viewport can be overridden by the inject layer
      events: {
        ...rootState.events,
        ...injectState.events,
        ...events
      },
      size: {
        ...rootState.size,
        ...size
      },
      viewport: {
        ...rootState.viewport,
        ...viewport
      },
      // Layers are allowed to override events
      setEvents: (events2) => injectState.set((state3) => ({
        ...state3,
        events: {
          ...state3.events,
          ...events2
        }
      }))
    };
  });
  const usePortalStore = React.useMemo(() => {
    const store = createWithEqualityFn((set, get) => ({
      ...rest,
      set,
      get
    }));
    const onMutate = (prev) => store.setState((state3) => inject.current(prev, state3));
    onMutate(previousRoot.getState());
    previousRoot.subscribe(onMutate);
    return store;
  }, [previousRoot, container]);
  return (
    // @ts-ignore, reconciler types are not maintained
    /* @__PURE__ */ jsx(Fragment2, {
      children: reconciler.createPortal(/* @__PURE__ */ jsx(context.Provider, {
        value: usePortalStore,
        children
      }), usePortalStore, null)
    })
  );
}
function flushSync(fn) {
  return reconciler.flushSyncFromReconciler(fn);
}
function createSubs(callback, subs) {
  const sub = {
    callback
  };
  subs.add(sub);
  return () => void subs.delete(sub);
}
var globalEffects = /* @__PURE__ */ new Set();
var globalAfterEffects = /* @__PURE__ */ new Set();
var globalTailEffects = /* @__PURE__ */ new Set();
var addEffect = (callback) => createSubs(callback, globalEffects);
var addAfterEffect = (callback) => createSubs(callback, globalAfterEffects);
var addTail = (callback) => createSubs(callback, globalTailEffects);
function run(effects, timestamp) {
  if (!effects.size) return;
  for (const {
    callback
  } of effects.values()) {
    callback(timestamp);
  }
}
function flushGlobalEffects(type, timestamp) {
  switch (type) {
    case "before":
      return run(globalEffects, timestamp);
    case "after":
      return run(globalAfterEffects, timestamp);
    case "tail":
      return run(globalTailEffects, timestamp);
  }
}
var subscribers;
var subscription;
function update(timestamp, state2, frame2) {
  let delta = state2.clock.getDelta();
  if (state2.frameloop === "never" && typeof timestamp === "number") {
    delta = timestamp - state2.clock.elapsedTime;
    state2.clock.oldTime = state2.clock.elapsedTime;
    state2.clock.elapsedTime = timestamp;
  }
  subscribers = state2.internal.subscribers;
  for (let i2 = 0; i2 < subscribers.length; i2++) {
    subscription = subscribers[i2];
    subscription.ref.current(subscription.store.getState(), delta, frame2);
  }
  if (!state2.internal.priority && state2.gl.render) state2.gl.render(state2.scene, state2.camera);
  state2.internal.frames = Math.max(0, state2.internal.frames - 1);
  return state2.frameloop === "always" ? 1 : state2.internal.frames;
}
var running = false;
var useFrameInProgress = false;
var repeat;
var frame;
var state;
function loop(timestamp) {
  frame = requestAnimationFrame(loop);
  running = true;
  repeat = 0;
  flushGlobalEffects("before", timestamp);
  useFrameInProgress = true;
  for (const root of _roots.values()) {
    var _state$gl$xr;
    state = root.store.getState();
    if (state.internal.active && (state.frameloop === "always" || state.internal.frames > 0) && !((_state$gl$xr = state.gl.xr) != null && _state$gl$xr.isPresenting)) {
      repeat += update(timestamp, state);
    }
  }
  useFrameInProgress = false;
  flushGlobalEffects("after", timestamp);
  if (repeat === 0) {
    flushGlobalEffects("tail", timestamp);
    running = false;
    return cancelAnimationFrame(frame);
  }
}
function invalidate(state2, frames = 1) {
  var _state$gl$xr2;
  if (!state2) return _roots.forEach((root) => invalidate(root.store.getState(), frames));
  if ((_state$gl$xr2 = state2.gl.xr) != null && _state$gl$xr2.isPresenting || !state2.internal.active || state2.frameloop === "never") return;
  if (frames > 1) {
    state2.internal.frames = Math.min(60, state2.internal.frames + frames);
  } else {
    if (useFrameInProgress) {
      state2.internal.frames = 2;
    } else {
      state2.internal.frames = 1;
    }
  }
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}
function advance(timestamp, runGlobalEffects = true, state2, frame2) {
  if (runGlobalEffects) flushGlobalEffects("before", timestamp);
  if (!state2) for (const root of _roots.values()) update(timestamp, root.store.getState());
  else update(timestamp, state2, frame2);
  if (runGlobalEffects) flushGlobalEffects("after", timestamp);
}
var DOM_EVENTS = {
  onClick: ["click", false],
  onContextMenu: ["contextmenu", false],
  onDoubleClick: ["dblclick", false],
  onWheel: ["wheel", true],
  onPointerDown: ["pointerdown", true],
  onPointerUp: ["pointerup", true],
  onPointerLeave: ["pointerleave", true],
  onPointerMove: ["pointermove", true],
  onPointerCancel: ["pointercancel", true],
  onLostPointerCapture: ["lostpointercapture", true]
};
function createPointerEvents(store) {
  const {
    handlePointer
  } = createEvents(store);
  return {
    priority: 1,
    enabled: true,
    compute(event, state2, previous) {
      state2.pointer.set(event.offsetX / state2.size.width * 2 - 1, -(event.offsetY / state2.size.height) * 2 + 1);
      state2.raycaster.setFromCamera(state2.pointer, state2.camera);
    },
    connected: void 0,
    handlers: Object.keys(DOM_EVENTS).reduce((acc, key) => ({
      ...acc,
      [key]: handlePointer(key)
    }), {}),
    update: () => {
      var _internal$lastEvent;
      const {
        events,
        internal
      } = store.getState();
      if ((_internal$lastEvent = internal.lastEvent) != null && _internal$lastEvent.current && events.handlers) events.handlers.onPointerMove(internal.lastEvent.current);
    },
    connect: (target) => {
      const {
        set,
        events
      } = store.getState();
      events.disconnect == null ? void 0 : events.disconnect();
      set((state2) => ({
        events: {
          ...state2.events,
          connected: target
        }
      }));
      if (events.handlers) {
        for (const name in events.handlers) {
          const event = events.handlers[name];
          const [eventName, passive] = DOM_EVENTS[name];
          target.addEventListener(eventName, event, {
            passive
          });
        }
      }
    },
    disconnect: () => {
      const {
        set,
        events
      } = store.getState();
      if (events.connected) {
        if (events.handlers) {
          for (const name in events.handlers) {
            const event = events.handlers[name];
            const [eventName] = DOM_EVENTS[name];
            events.connected.removeEventListener(eventName, event);
          }
        }
        set((state2) => ({
          events: {
            ...state2.events,
            connected: void 0
          }
        }));
      }
    }
  };
}

// node_modules/@react-three/fiber/dist/react-three-fiber.esm.js
import * as React2 from "./8097cbcb4650d681e430.mjs";
import * as THREE2 from "./665e017835df17c05088.mjs";
import useMeasure from "./d3394b0efd8fd8b9efc4.mjs";
import { FiberProvider } from "./f32191735113c4f25f67.mjs";
import { jsx as jsx2 } from "./4b65ff659da4662d4567.mjs";
import "./face6508550c55f1e97d.mjs";
import "./759e59d6cac00ab726dd.mjs";
import "./24a86d99da65aeb195d2.mjs";
function CanvasImpl({
  ref,
  children,
  fallback,
  resize,
  style,
  gl,
  events = createPointerEvents,
  eventSource,
  eventPrefix,
  shadows,
  linear,
  flat,
  legacy,
  orthographic,
  frameloop,
  dpr,
  performance: performance2,
  raycaster,
  camera,
  scene,
  onPointerMissed,
  onCreated,
  ...props
}) {
  React2.useMemo(() => extend(THREE2), []);
  const Bridge = useBridge();
  const [containerRef, containerRect] = useMeasure({
    scroll: true,
    debounce: {
      scroll: 50,
      resize: 0
    },
    ...resize
  });
  const canvasRef = React2.useRef(null);
  const divRef = React2.useRef(null);
  React2.useImperativeHandle(ref, () => canvasRef.current);
  const handlePointerMissed = useMutableCallback(onPointerMissed);
  const [block, setBlock] = React2.useState(false);
  const [error, setError] = React2.useState(false);
  if (block) throw block;
  if (error) throw error;
  const root = React2.useRef(null);
  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (containerRect.width > 0 && containerRect.height > 0 && canvas) {
      if (!root.current) root.current = createRoot(canvas);
      async function run2() {
        await root.current.configure({
          gl,
          scene,
          events,
          shadows,
          linear,
          flat,
          legacy,
          orthographic,
          frameloop,
          dpr,
          performance: performance2,
          raycaster,
          camera,
          size: containerRect,
          // Pass mutable reference to onPointerMissed so it's free to update
          onPointerMissed: (...args) => handlePointerMissed.current == null ? void 0 : handlePointerMissed.current(...args),
          onCreated: (state2) => {
            state2.events.connect == null ? void 0 : state2.events.connect(eventSource ? isRef(eventSource) ? eventSource.current : eventSource : divRef.current);
            if (eventPrefix) {
              state2.setEvents({
                compute: (event, state3) => {
                  const x = event[eventPrefix + "X"];
                  const y = event[eventPrefix + "Y"];
                  state3.pointer.set(x / state3.size.width * 2 - 1, -(y / state3.size.height) * 2 + 1);
                  state3.raycaster.setFromCamera(state3.pointer, state3.camera);
                }
              });
            }
            onCreated == null ? void 0 : onCreated(state2);
          }
        });
        root.current.render(/* @__PURE__ */ jsx2(Bridge, {
          children: /* @__PURE__ */ jsx2(ErrorBoundary, {
            set: setError,
            children: /* @__PURE__ */ jsx2(React2.Suspense, {
              fallback: /* @__PURE__ */ jsx2(Block, {
                set: setBlock
              }),
              children: children != null ? children : null
            })
          })
        }));
      }
      run2();
    }
  });
  React2.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) return () => unmountComponentAtNode(canvas);
  }, []);
  const pointerEvents = eventSource ? "none" : "auto";
  return /* @__PURE__ */ jsx2("div", {
    ref: divRef,
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      pointerEvents,
      ...style
    },
    ...props,
    children: /* @__PURE__ */ jsx2("div", {
      ref: containerRef,
      style: {
        width: "100%",
        height: "100%"
      },
      children: /* @__PURE__ */ jsx2("canvas", {
        ref: canvasRef,
        style: {
          display: "block"
        },
        children: fallback
      })
    })
  });
}
function Canvas(props) {
  return /* @__PURE__ */ jsx2(FiberProvider, {
    children: /* @__PURE__ */ jsx2(CanvasImpl, {
      ...props
    })
  });
}
export {
  Canvas,
  threeTypes as ReactThreeFiber,
  _roots,
  act2 as act,
  addAfterEffect,
  addEffect,
  addTail,
  advance,
  applyProps,
  buildGraph,
  context,
  createEvents,
  createPortal,
  createRoot,
  dispose,
  createPointerEvents as events,
  extend,
  flushGlobalEffects,
  flushSync,
  getRootState,
  invalidate,
  reconciler,
  unmountComponentAtNode,
  useFrame,
  useGraph,
  useInstanceHandle,
  useLoader,
  useStore,
  useThree
};
/*! Bundled license information:

@react-three/fiber/dist/events-760a1017.esm.js:
  (**
   * @license React
   * react-reconciler-constants.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
  (**
  * @license React
  * react-reconciler.production.js
  *
  * Copyright (c) Meta Platforms, Inc. and affiliates.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  *)

@react-three/fiber/dist/events-760a1017.esm.js:
  (**
  * @license React
  * react-reconciler.development.js
  *
  * Copyright (c) Meta Platforms, Inc. and affiliates.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  *)
*/
