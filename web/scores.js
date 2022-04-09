import {decode, encode} from 'base32768';

const events = new EventTarget();

export function markAsFound(guessNumber, word, easy) {
  const storageKey = `eldrow-guesses-${easy ? 'easy-' : ''}${guessNumber}`;
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
  events.dispatchEvent(new CustomEvent(`${easy ? 'easy-' : ''}${guessNumber}`));
}

export function countFound(guessNumber, easy) {
  const found = localStorage.getItem(`eldrow-guesses-${easy ? 'easy-' : ''}${guessNumber}`)
  if (found == null) {
    return 0;
  }
  const decoded = decode(found);
  return decoded.length / 4;
}

export function getEasyMode() {
  return localStorage.getItem('eldrow-easy') === 'true';
}

export function setEasyMode(easy) {
  localStorage.setItem('eldrow-easy', easy ? 'true' : 'false');
}

export function getFoundWords(guessNumber, easy) {
  const storageKey = `eldrow-guesses-${easy ? 'easy-' : ''}${guessNumber}`;
  const existing = localStorage.getItem(storageKey);
  if (existing == null) {
    return [];
  }
  const decoded = decode(existing);
  const dataView = new DataView(decoded.buffer);
  const result = [];
  for (let i = 0; i < decoded.length; i += 4) {
    result.push(unpackWord(dataView.getUint32(i, true)));
  }
  result.sort();
  return result;
}

export function onFoundWordsUpdate(guessNumber, easy, callback) {
  events.addEventListener(`${easy ? 'easy-' : ''}${guessNumber}`, callback);
  return () => {
    events.removeEventListener(`${easy ? 'easy-' : ''}${guessNumber}`, callback);
  };
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
