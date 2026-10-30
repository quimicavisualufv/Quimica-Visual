/* esm.sh - zustand@5.0.12/traditional */
// node_modules/zustand/esm/traditional.mjs
import React from "./690e17d3ade54a4866c2.mjs";
import useSyncExternalStoreExports from "./2bd085368c5a0446fcca.mjs";
import { createStore } from "./67a7a1016b05d0da09a7.mjs";
var { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
var identity = (arg) => arg;
function useStoreWithEqualityFn(api, selector = identity, equalityFn) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getInitialState,
    selector,
    equalityFn
  );
  React.useDebugValue(slice);
  return slice;
}
var createWithEqualityFnImpl = (createState, defaultEqualityFn) => {
  const api = createStore(createState);
  const useBoundStoreWithEqualityFn = (selector, equalityFn = defaultEqualityFn) => useStoreWithEqualityFn(api, selector, equalityFn);
  Object.assign(useBoundStoreWithEqualityFn, api);
  return useBoundStoreWithEqualityFn;
};
var createWithEqualityFn = ((createState, defaultEqualityFn) => createState ? createWithEqualityFnImpl(createState, defaultEqualityFn) : createWithEqualityFnImpl);
export {
  createWithEqualityFn,
  useStoreWithEqualityFn
};
