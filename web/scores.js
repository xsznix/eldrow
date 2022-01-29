import {decode, encode} from 'base32768';

export function markAsFound(guessNumber, word) {
  const storageKey = `eldrow-guesses-${guessNumber}`;
  const existing = localStorage.getItem(storageKey);
  const packed = packWord(word);
  let buffer;
  if (existing == null) {
    buffer = new Uint8Array(4);
  } else {
    const decoded = decode(existing);
    buffer = new Uint8Array(decoded.length + 4);
    buffer.set(decoded, 0);
  }
  const dataView = new DataView(buffer.buffer);
  const insertIndex = sortedIndex(buffer, dataView, packed);
  if (dataView.getUint32(4 * insertIndex, true) === packed) {
    return;
  }
  for (let i = buffer.length / 4 - 2; i >= insertIndex; i--) {
    dataView.setUint32(4 * i + 4, dataView.getUint32(4 * i, true), true);
  }
  dataView.setUint32(4 * insertIndex, packed, true);
  const encoded = encode(buffer);
  localStorage.setItem(storageKey, encoded);
}

export function countFound(guessNumber) {
  const found = localStorage.getItem(`eldrow-guesses-${guessNumber}`)
  if (found == null) {
    return 0;
  }
  const decoded = decode(found);
  return decoded.length / 4;
}

function sortedIndex(buffer, dataView, needle) {
  let lo = 0;
  let hi = buffer.length / 4 - 1;
  while (lo < hi) {
    const mid = (hi + lo) >>> 1;
    const valueAtMid = dataView.getUint32(4 * mid, true);
    if (valueAtMid === needle) {
      return mid;
    } else if (valueAtMid < needle) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return hi;
}

function packWord(word) {
  let u32 = 0;
  for (let i = 0; i < 5; i++) {
    u32 |= (word.charCodeAt(i) - 97 /* a */) << (5 * i);
  }
  return u32;
}

function unpackWord(u32) {
  let word = '';
  for (let i = 0; i < 5; i++) {
    word += String.fromCharCode(97 /* a */ + ((u32 & (0x1f << (5 * i))) >> (5 * i)));
  }
  return word;
}
