export async function loadPackedData() {
  const url = new URL('../data/orbitals.json', import.meta.url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao carregar dados dos orbitais: ${response.status} ${response.statusText}`);
  return response.json();
}

export function decodeBase64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
export function decodeFloat32(base64) { const bytes = decodeBase64ToUint8Array(base64); return new Float32Array(bytes.buffer.slice(0)); }
export function decodeInt16(base64) { const bytes = decodeBase64ToUint8Array(base64); return new Int16Array(bytes.buffer.slice(0)); }
export function decodeUint16(base64) { const bytes = decodeBase64ToUint8Array(base64); return new Uint16Array(bytes.buffer.slice(0)); }
