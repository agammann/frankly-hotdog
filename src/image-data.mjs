// Decode local image data without fetch(), which is governed by connect-src.
export function imageDataBlob(value, maxLength = 2_000_000) {
  if (typeof value !== 'string' || value.length > maxLength) {
    throw Error('This image is too large or unsupported.');
  }
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw Error('Choose a supported image to check on this device.');
  let raw;
  try { raw = atob(match[2]); }
  catch { throw Error('This image contains invalid data.'); }
  return new Blob([Uint8Array.from(raw, character => character.charCodeAt(0))], {
    type: 'image/' + match[1],
  });
}
