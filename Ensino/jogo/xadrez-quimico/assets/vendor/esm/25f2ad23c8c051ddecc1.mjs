/* esm.sh - @use-gesture/react@10.3.1 */
// node_modules/@use-gesture/react/dist/use-gesture-react.esm.js
import { registerAction, dragAction, pinchAction, wheelAction, scrollAction, moveAction, hoverAction } from "./77882bb274db3842e4c7.mjs";
export * from "./77882bb274db3842e4c7.mjs";
import React from "./99cfcb6fb6b33cdcf2c4.mjs";
import { Controller, parseMergedHandlers } from "./20a711519920af3c3eaf.mjs";
export * from "./52b8790214a99fcf7d41.mjs";
export * from "./c7b4ebc69284b6839dc5.mjs";
function useRecognizers(handlers, config = {}, gestureKey, nativeHandlers) {
  const ctrl = React.useMemo(() => new Controller(handlers), []);
  ctrl.applyHandlers(handlers, nativeHandlers);
  ctrl.applyConfig(config, gestureKey);
  React.useEffect(ctrl.effect.bind(ctrl));
  React.useEffect(() => {
    return ctrl.clean.bind(ctrl);
  }, []);
  if (config.target === void 0) {
    return ctrl.bind.bind(ctrl);
  }
  return void 0;
}
function useDrag(handler, config) {
  registerAction(dragAction);
  return useRecognizers({
    drag: handler
  }, config || {}, "drag");
}
function usePinch(handler, config) {
  registerAction(pinchAction);
  return useRecognizers({
    pinch: handler
  }, config || {}, "pinch");
}
function useWheel(handler, config) {
  registerAction(wheelAction);
  return useRecognizers({
    wheel: handler
  }, config || {}, "wheel");
}
function useScroll(handler, config) {
  registerAction(scrollAction);
  return useRecognizers({
    scroll: handler
  }, config || {}, "scroll");
}
function useMove(handler, config) {
  registerAction(moveAction);
  return useRecognizers({
    move: handler
  }, config || {}, "move");
}
function useHover(handler, config) {
  registerAction(hoverAction);
  return useRecognizers({
    hover: handler
  }, config || {}, "hover");
}
function createUseGesture(actions) {
  actions.forEach(registerAction);
  return function useGesture2(_handlers, _config) {
    const {
      handlers,
      nativeHandlers,
      config
    } = parseMergedHandlers(_handlers, _config || {});
    return useRecognizers(handlers, config, void 0, nativeHandlers);
  };
}
function useGesture(handlers, config) {
  const hook = createUseGesture([dragAction, pinchAction, scrollAction, wheelAction, moveAction, hoverAction]);
  return hook(handlers, config || {});
}
export {
  createUseGesture,
  useDrag,
  useGesture,
  useHover,
  useMove,
  usePinch,
  useScroll,
  useWheel
};
