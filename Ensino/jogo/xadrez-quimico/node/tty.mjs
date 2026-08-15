class ReadStream {
  constructor(fd = 0) { this.fd = fd; this.isTTY = false; }
  on() { return this; }
  once() { return this; }
  emit() { return false; }
  addListener() { return this; }
  removeListener() { return this; }
  setEncoding() { return this; }
  pause() { return this; }
  resume() { return this; }
}
class WriteStream extends ReadStream {
  constructor(fd = 1) { super(fd); }
  write() { return true; }
  clearLine() { return false; }
  clearScreenDown() { return false; }
  cursorTo() { return false; }
  moveCursor() { return false; }
}
function isatty() { return false; }
export { ReadStream, WriteStream, isatty };
export default { ReadStream, WriteStream, isatty };