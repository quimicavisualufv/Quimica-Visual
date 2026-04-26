/* esm.sh - zustand@5.0.12/react/shallow */
// node_modules/zustand/esm/react/shallow.mjs
import React from "./690e17d3ade54a4866c2.mjs";
import { shallow } from "./197f9d05e91f25ae87fb.mjs";
function useShallow(selector) {
  const prev = React.useRef(void 0);
  return (state) => {
    const next = selector(state);
    return shallow(prev.current, next) ? prev.current : prev.current = next;
  };
}
export {
  useShallow
};
