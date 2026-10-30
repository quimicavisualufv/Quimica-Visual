class EventEmitter {
  constructor() { this._events = Object.create(null); this._maxListeners = undefined; }
  static listenerCount(emitter, eventName) { return emitter.listenerCount(eventName); }
  setMaxListeners(n) { this._maxListeners = n; return this; }
  getMaxListeners() { return this._maxListeners ?? 10; }
  eventNames() { return Object.keys(this._events); }
  listeners(eventName) { return (this._events[eventName] || []).map((item) => item.listener || item); }
  rawListeners(eventName) { return (this._events[eventName] || []).slice(); }
  listenerCount(eventName) { return (this._events[eventName] || []).length; }
  addListener(eventName, listener) { return this.on(eventName, listener); }
  on(eventName, listener) {
    if (!this._events[eventName]) this._events[eventName] = [];
    this._events[eventName].push(listener);
    return this;
  }
  prependListener(eventName, listener) {
    if (!this._events[eventName]) this._events[eventName] = [];
    this._events[eventName].unshift(listener);
    return this;
  }
  once(eventName, listener) {
    const wrapper = (...args) => { this.removeListener(eventName, wrapper); listener.apply(this, args); };
    wrapper.listener = listener;
    return this.on(eventName, wrapper);
  }
  prependOnceListener(eventName, listener) {
    const wrapper = (...args) => { this.removeListener(eventName, wrapper); listener.apply(this, args); };
    wrapper.listener = listener;
    return this.prependListener(eventName, wrapper);
  }
  removeListener(eventName, listener) {
    const list = this._events[eventName];
    if (!list) return this;
    this._events[eventName] = list.filter((item) => item !== listener && item.listener !== listener);
    if (this._events[eventName].length === 0) delete this._events[eventName];
    return this;
  }
  off(eventName, listener) { return this.removeListener(eventName, listener); }
  removeAllListeners(eventName) {
    if (eventName === undefined) this._events = Object.create(null);
    else delete this._events[eventName];
    return this;
  }
  emit(eventName, ...args) {
    const list = (this._events[eventName] || []).slice();
    if (list.length === 0) return false;
    for (const listener of list) listener.apply(this, args);
    return true;
  }
}
const once = (emitter, eventName) => new Promise((resolve) => emitter.once(eventName, (...args) => resolve(args)));
const on = () => { throw new Error('[offline shim] events.on async iterator is not implemented'); };
const getEventListeners = (emitter, eventName) => emitter.listeners(eventName);
const setMaxListeners = (n, ...targets) => { for (const target of targets) target.setMaxListeners?.(n); };
const addAbortListener = () => ({ dispose() {} });
export { EventEmitter, addAbortListener, getEventListeners, on, once, setMaxListeners };
export default { EventEmitter, addAbortListener, getEventListeners, on, once, setMaxListeners };