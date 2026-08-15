/* esm.sh - tunnel-rat@0.1.2 */
// node_modules/tunnel-rat/dist/index.js
import React from "./ddc2b616cb4b70d0fa0f.mjs";
import { create } from "./265caa3eb7faab37256e.mjs";
var _window$document;
var _window$navigator;
var useIsomorphicLayoutEffect = typeof window !== "undefined" && ((_window$document = window.document) != null && _window$document.createElement || ((_window$navigator = window.navigator) == null ? void 0 : _window$navigator.product) === "ReactNative") ? React.useLayoutEffect : React.useEffect;
function tunnel() {
  const useStore = create((set) => ({
    current: new Array(),
    version: 0,
    set
  }));
  return {
    In: ({
      children
    }) => {
      const set = useStore((state) => state.set);
      const version = useStore((state) => state.version);
      useIsomorphicLayoutEffect(() => {
        set((state) => ({
          version: state.version + 1
        }));
      }, []);
      useIsomorphicLayoutEffect(() => {
        set(({
          current
        }) => ({
          current: [...current, children]
        }));
        return () => set(({
          current
        }) => ({
          current: current.filter((c) => c !== children)
        }));
      }, [children, version]);
      return null;
    },
    Out: () => {
      const current = useStore((state) => state.current);
      return /* @__PURE__ */ React.createElement(React.Fragment, null, current);
    }
  };
}
export {
  tunnel as default
};
