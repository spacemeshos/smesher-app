export const fromBase64 = (base64: string) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const toBase64 = (bytes: Uint8Array) =>
  window.btoa(String.fromCharCode(...bytes));

export const isValid = (src: unknown) => {
  if (typeof src !== 'string') {
    return false;
  }
  const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
  return !/[^\s0-9a-zA-Z+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
};
