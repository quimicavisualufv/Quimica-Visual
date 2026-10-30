/* esm.sh - zustand@5.0.12/react */
// node_modules/zustand/esm/react.mjs
import React from "./690e17d3ade54a4866c2.mjs";
import { createStore } from "./67a7a1016b05d0da09a7.mjs";
var identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    React.useCallback(() => selector(api.getState()), [api, selector]),
    React.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React.useDebugValue(slice);
  return slice;
}
var createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
var create = ((createState) => createState ? createImpl(createState) : createImpl);
export {
  create,
  useStore
};
